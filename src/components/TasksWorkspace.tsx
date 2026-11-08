import type { Project, Task, TaskStatus } from "@/context/ProjectsContext";
import { stages, useProjects } from "@/context/ProjectsContext";
import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";

const C = {
  orange: "#C47B42",
  dark: "#26313A",
  muted: "#7B858D",
  border: "#E6E7E7",
  white: "#FFFFFF",
  green: "#3C936B",
  red: "#C45C55",
  background: "#F5F2EC",
};
type Priority = "Low" | "Medium" | "High";
type TaskRow = { task: Task; project: Project };
const statuses: TaskStatus[] = ["To Do", "In Progress", "Done"];
const priorities: Priority[] = ["Low", "Medium", "High"];
const todayKey = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
const isOverdue = (task: Task) =>
  !!task.dueDate && task.dueDate < todayKey() && task.status !== "Done";
const newForm = () => ({
  title: "",
  description: "",
  projectId: "",
  assignee: "",
  stage: "",
  dueDate: "",
  priority: "Medium" as Priority,
});

export default function TasksWorkspace() {
  const { projects, setProjects } = useProjects();
  const { width } = useWindowDimensions();
  const mobile = width < 680;
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [projectFilter, setProjectFilter] = useState("All projects");
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<{
    projectId: string;
    taskId: string;
  } | null>(null);
  const [form, setForm] = useState(newForm);
  const [error, setError] = useState("");
  const rows = useMemo(
    () =>
      projects.flatMap((project) =>
        project.tasks.map((task) => ({ task, project })),
      ),
    [projects],
  );
  const filtered = useMemo(
    () =>
      rows.filter(({ task, project }) => {
        const term = search.trim().toLowerCase();
        return (
          (filter === "All" ||
            (filter === "Overdue"
              ? isOverdue(task)
              : task.status === filter)) &&
          (projectFilter === "All projects" || project.id === projectFilter) &&
          (!term ||
            [
              task.title,
              task.assignee,
              task.stage,
              project.name,
              task.description || "",
            ].some((v) => v.toLowerCase().includes(term)))
        );
      }),
    [rows, search, filter, projectFilter],
  );
  const openCreate = () => {
    setEditing(null);
    setForm({
      ...newForm(),
      projectId: projects[0]?.id ?? "",
      stage: projects[0] ? stages[projects[0].stageIndex] : stages[0],
    });
    setError("");
    setCreating(true);
  };
  const openEdit = ({ task, project }: TaskRow) => {
    setEditing({ projectId: project.id, taskId: task.id });
    setForm({
      title: task.title,
      description: task.description || "",
      projectId: project.id,
      assignee: task.assignee === "Unassigned" ? "" : task.assignee,
      stage: task.stage,
      dueDate: task.dueDate || "",
      priority: task.priority || "Medium",
    });
    setError("");
    setCreating(true);
  };
  const save = () => {
    if (!form.title.trim()) {
      setError("Enter a task title.");
      return;
    }
    if (!projects.some((p) => p.id === form.projectId)) {
      setError("Select a project.");
      return;
    }
    if (
      form.dueDate &&
      (!/^\d{4}-\d{2}-\d{2}$/.test(form.dueDate) ||
        Number.isNaN(Date.parse(form.dueDate)) ||
        new Date(form.dueDate).toISOString().slice(0, 10) !== form.dueDate)
    ) {
      setError("Enter a valid date as YYYY-MM-DD.");
      return;
    }
    const stamp = new Date().toLocaleString();
    const taskId = editing?.taskId || `${Date.now()}-${Math.random()}`;
    const next: Task = {
      id: taskId,
      title: form.title.trim(),
      description: form.description.trim(),
      assignee: form.assignee.trim() || "Unassigned",
      stage: form.stage || stages[0],
      dueDate: form.dueDate || undefined,
      priority: form.priority,
      status: editing
        ? (projects
            .find((p) => p.id === editing.projectId)
            ?.tasks.find((t) => t.id === editing.taskId)?.status ?? "To Do")
        : "To Do",
    };
    setProjects((previous) =>
      previous.map((project) => {
        const wasHere = !!editing && project.id === editing.projectId;
        const goesHere = project.id === form.projectId;
        if (!wasHere && !goesHere) return project;
        const tasks = project.tasks.filter(
          (t) => !(wasHere && t.id === taskId),
        );
        if (goesHere) tasks.push(next);
        return {
          ...project,
          tasks,
          events: [
            {
              id: `${Date.now()}-${Math.random()}`,
              message: `${editing ? "Task updated" : "Task added"}: ${next.title}`,
              date: stamp,
            },
            ...project.events,
          ],
        };
      }),
    );
    setCreating(false);
  };
  const changeStatus = (row: TaskRow, status: TaskStatus) => {
    if (row.task.status === status) return;
    setProjects((previous) =>
      previous.map((project) =>
        project.id !== row.project.id
          ? project
          : {
              ...project,
              tasks: project.tasks.map((task) =>
                task.id === row.task.id ? { ...task, status } : task,
              ),
              events: [
                {
                  id: `${Date.now()}-${Math.random()}`,
                  message: `Task marked ${status}: ${row.task.title}`,
                  date: new Date().toLocaleString(),
                },
                ...project.events,
              ],
            },
      ),
    );
  };
  return (
    <View style={s.root}>
      <View style={[s.heading, mobile && s.wrap]}>
        <View style={{ flexShrink: 1 }}>
          <Text style={s.title}>My Tasks</Text>
          <Text style={s.subtitle}>
            Manage work across your development projects.
          </Text>
        </View>
        <TouchableOpacity style={s.primary} onPress={openCreate}>
          <Ionicons name="add" size={19} color="#FFF" />
          <Text style={s.primaryText}>New Task</Text>
        </TouchableOpacity>
      </View>
      <View style={s.stats}>
        {(
          [
            { label: "Total Tasks", count: rows.length, icon: "list-outline" },
            {
              label: "Open Tasks",
              count: rows.filter((r) => r.task.status !== "Done").length,
              icon: "checkbox-outline",
            },
            {
              label: "Overdue",
              count: rows.filter((r) => isOverdue(r.task)).length,
              icon: "alert-circle-outline",
            },
            {
              label: "Completed",
              count: rows.filter((r) => r.task.status === "Done").length,
              icon: "checkmark-circle-outline",
            },
          ] as const
        ).map((item) => (
          <View key={item.label} style={[s.stat, mobile && s.statMobile]}>
            <View style={s.statHead}>
              <Text style={s.muted}>{item.label}</Text>
              <Ionicons name={item.icon} size={20} color={C.orange} />
            </View>
            <Text style={s.statNumber}>{item.count}</Text>
          </View>
        ))}
      </View>
      <View style={s.panel}>
        <View style={[s.toolbar, mobile && s.wrap]}>
          <View style={s.searchBox}>
            <Ionicons name="search-outline" size={18} color={C.muted} />
            <TextInput
              placeholder="Search tasks, people, projects..."
              placeholderTextColor="#A1A9AE"
              style={s.searchInput}
              value={search}
              onChangeText={setSearch}
            />
          </View>
          <Text style={s.muted}>{filtered.length} tasks</Text>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.filters}
        >
          {["All", "To Do", "In Progress", "Done", "Overdue"].map((item) => (
            <TouchableOpacity
              key={item}
              onPress={() => setFilter(item)}
              style={[s.chip, filter === item && s.chipActive]}
            >
              <Text style={[s.chipText, filter === item && s.chipTextActive]}>
                {item}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.filters}
        >
          <TouchableOpacity
            style={[s.chip, projectFilter === "All projects" && s.chipActive]}
            onPress={() => setProjectFilter("All projects")}
          >
            <Text
              style={[
                s.chipText,
                projectFilter === "All projects" && s.chipTextActive,
              ]}
            >
              All projects
            </Text>
          </TouchableOpacity>
          {projects.map((p) => (
            <TouchableOpacity
              key={p.id}
              style={[s.chip, projectFilter === p.id && s.chipActive]}
              onPress={() => setProjectFilter(p.id)}
            >
              <Text
                style={[s.chipText, projectFilter === p.id && s.chipTextActive]}
              >
                {p.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        {filtered.length === 0 ? (
          <View style={s.empty}>
            <Ionicons name="checkbox-outline" size={36} color={C.muted} />
            <Text style={s.taskTitle}>No matching tasks</Text>
            <Text style={s.muted}>Try another filter or create a task.</Text>
          </View>
        ) : (
          filtered.map((row) =>
            mobile ? (
              <View
                key={`${row.project.id}-${row.task.id}`}
                style={s.mobileTaskCard}
              >
                <View style={s.mobileTaskHeader}>
                  <TouchableOpacity
                    onPress={() => openEdit(row)}
                    style={s.mobileTaskTitleArea}
                  >
                    <Text style={s.taskTitle}>{row.task.title}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => openEdit(row)}
                    style={s.edit}
                    accessibilityLabel="Edit task"
                  >
                    <Ionicons
                      name="create-outline"
                      size={20}
                      color={C.orange}
                    />
                  </TouchableOpacity>
                </View>
                <Text style={s.mobileTaskMeta}>
                  {row.project.name} · {row.task.stage}
                </Text>
                <Text style={s.mobileTaskMeta}>
                  {row.task.assignee} · {row.task.priority || "Medium"} priority
                  {row.task.dueDate ? ` · Due ${row.task.dueDate}` : ""}
                </Text>
                {isOverdue(row.task) && <Text style={s.overdue}>Overdue</Text>}
                <View style={s.mobileStatusSection}>
                  <View style={s.mobileStatusButtons}>
                    {statuses.map((status) => (
                      <TouchableOpacity
                        key={status}
                        onPress={() => changeStatus(row, status)}
                        style={[
                          s.statusChip,
                          row.task.status === status && s.statusActive,
                        ]}
                      >
                        <Text
                          style={[
                            s.statusText,
                            row.task.status === status && s.statusSelected,
                          ]}
                        >
                          {status}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>
            ) : (
              <View key={`${row.project.id}-${row.task.id}`} style={s.taskRow}>
                <TouchableOpacity
                  style={s.taskDetails}
                  onPress={() => openEdit(row)}
                >
                  <Text style={s.taskTitle}>{row.task.title}</Text>
                  <Text style={s.meta}>
                    {row.project.name} · {row.task.stage}
                  </Text>
                  <Text style={s.meta}>
                    {row.task.assignee} · {row.task.priority || "Medium"}{" "}
                    priority
                    {row.task.dueDate ? ` · Due ${row.task.dueDate}` : ""}
                  </Text>
                  {isOverdue(row.task) && (
                    <Text style={s.overdue}>Overdue</Text>
                  )}
                </TouchableOpacity>
                <View style={s.statuses}>
                  {statuses.map((status) => (
                    <TouchableOpacity
                      key={status}
                      onPress={() => changeStatus(row, status)}
                      style={[
                        s.statusChip,
                        row.task.status === status && s.statusActive,
                      ]}
                    >
                      <Text
                        style={[
                          s.statusText,
                          row.task.status === status && s.statusSelected,
                        ]}
                      >
                        {status}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <TouchableOpacity onPress={() => openEdit(row)} style={s.edit}>
                  <Ionicons name="create-outline" size={20} color={C.orange} />
                </TouchableOpacity>
              </View>
            ),
          )
        )}
      </View>
      <Modal
        visible={creating}
        transparent
        animationType="fade"
        onRequestClose={() => setCreating(false)}
      >
        <View style={s.overlay}>
          <TouchableOpacity
            style={s.backdrop}
            onPress={() => setCreating(false)}
            activeOpacity={1}
          />
          <View style={[s.modal, mobile && { width: "94%" }]}>
            <View style={s.modalHeader}>
              <Text style={s.modalTitle}>
                {editing ? "Edit Task" : "Create Task"}
              </Text>
              <TouchableOpacity onPress={() => setCreating(false)}>
                <Ionicons name="close" size={24} color={C.dark} />
              </TouchableOpacity>
            </View>
            <ScrollView
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={s.modalBody}
            >
              <Text style={s.label}>Task title *</Text>
              <TextInput
                style={s.input}
                value={form.title}
                onChangeText={(title) => setForm((p) => ({ ...p, title }))}
                placeholder="e.g. Review site survey"
              />
              <Text style={s.label}>Description</Text>
              <TextInput
                style={[s.input, { height: 85, textAlignVertical: "top" }]}
                multiline
                value={form.description}
                onChangeText={(description) =>
                  setForm((p) => ({ ...p, description }))
                }
                placeholder="Task details"
              />
              <Text style={s.label}>Project *</Text>
              <View style={s.options}>
                {projects.map((project) => (
                  <TouchableOpacity
                    key={project.id}
                    style={[
                      s.option,
                      form.projectId === project.id && s.optionActive,
                    ]}
                    onPress={() =>
                      setForm((p) => ({
                        ...p,
                        projectId: project.id,
                        stage: stages[project.stageIndex],
                      }))
                    }
                  >
                    <Text style={s.optionText}>{project.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={s.label}>Workflow stage</Text>
              <View style={s.options}>
                {stages.map((stage) => (
                  <TouchableOpacity
                    key={stage}
                    style={[s.option, form.stage === stage && s.optionActive]}
                    onPress={() => setForm((p) => ({ ...p, stage }))}
                  >
                    <Text style={s.optionText}>{stage}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={s.label}>Assignee</Text>
              <TextInput
                style={s.input}
                value={form.assignee}
                onChangeText={(assignee) =>
                  setForm((p) => ({ ...p, assignee }))
                }
                placeholder="Team member name"
              />
              <Text style={s.label}>Due date (YYYY-MM-DD)</Text>
              <TextInput
                style={s.input}
                value={form.dueDate}
                onChangeText={(dueDate) => setForm((p) => ({ ...p, dueDate }))}
                placeholder="2026-12-01"
                autoCapitalize="none"
              />
              <Text style={s.label}>Priority</Text>
              <View style={s.options}>
                {priorities.map((priority) => (
                  <TouchableOpacity
                    key={priority}
                    style={[
                      s.option,
                      form.priority === priority && s.optionActive,
                    ]}
                    onPress={() => setForm((p) => ({ ...p, priority }))}
                  >
                    <Text style={s.optionText}>{priority}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              {error ? <Text style={s.overdue}>{error}</Text> : null}
              <View style={s.actions}>
                <TouchableOpacity
                  style={s.cancel}
                  onPress={() => setCreating(false)}
                >
                  <Text style={s.cancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={s.primary} onPress={save}>
                  <Text style={s.primaryText}>
                    {editing ? "Save Changes" : "Create Task"}
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}
const s = StyleSheet.create({
  root: { gap: 24 },
  heading: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 16,
  },
  wrap: { flexWrap: "wrap" },
  title: { fontSize: 28, fontWeight: "800", color: C.dark },
  subtitle: { fontSize: 14, color: C.muted, marginTop: 7 },
  primary: {
    minHeight: 44,
    backgroundColor: C.orange,
    borderRadius: 9,
    paddingHorizontal: 17,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  primaryText: { color: C.white, fontSize: 13, fontWeight: "800" },
  stats: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  stat: {
    flexGrow: 1,
    flexBasis: "21%",
    minWidth: 140,
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 12,
    padding: 18,
  },
  statMobile: { flexBasis: "44%", minWidth: 120 },
  statHead: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
  },
  statNumber: { fontSize: 30, fontWeight: "800", color: C.dark, marginTop: 16 },
  muted: { color: C.muted, fontSize: 12 },
  panel: {
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 12,
    overflow: "hidden",
  },
  toolbar: {
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    backgroundColor: "#FAFAF8",
    borderColor: C.border,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    flexGrow: 1,
    minWidth: 180,
    maxWidth: 480,
    height: 44,
  },
  searchInput: { flex: 1, fontSize: 13, color: C.dark },
  filters: { gap: 8, paddingHorizontal: 20, paddingBottom: 15 },
  chip: {
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 8,
    paddingVertical: 9,
    paddingHorizontal: 13,
  },
  chipActive: { backgroundColor: "#F9F0E8", borderColor: C.orange },
  chipText: { fontSize: 12, color: C.muted, fontWeight: "700" },
  chipTextActive: { color: C.orange },
  taskRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 18,
    gap: 16,
    borderTopWidth: 1,
    borderTopColor: C.border,
  },
  taskDetails: { flex: 1, minWidth: 0 },
  mobileTaskCard: {
    width: "100%",
    alignSelf: "stretch",
    paddingHorizontal: 16,
    paddingVertical: 18,
    borderTopWidth: 1,
    borderTopColor: C.border,
  },
  mobileTaskHeader: {
    width: "100%",
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 8,
  },
  mobileTaskTitleArea: { flexShrink: 1, minWidth: 0 },
  mobileTaskMeta: {
    color: C.muted,
    fontSize: 12,
    lineHeight: 19,
    marginTop: 6,
    flexShrink: 1,
  },
  mobileStatusSection: {
    marginTop: 14,
    paddingTop: 13,
    borderTopWidth: 1,
    borderTopColor: C.border,
    width: "100%",
  },
  mobileStatusButtons: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 7,
  },
  taskTitle: { color: C.dark, fontSize: 14, fontWeight: "800" },
  meta: { color: C.muted, fontSize: 12, marginTop: 5 },
  overdue: { color: C.red, fontSize: 12, fontWeight: "700", marginTop: 7 },
  statuses: { flexDirection: "row", flexWrap: "wrap", gap: 5 },
  statusChip: {
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 7,
    paddingVertical: 7,
    paddingHorizontal: 9,
  },
  statusActive: { borderColor: C.orange, backgroundColor: "#F9F0E8" },
  statusText: { fontSize: 11, color: C.muted, fontWeight: "600" },
  statusSelected: { color: C.orange, fontWeight: "800" },
  edit: { padding: 8 },
  empty: { padding: 42, alignItems: "center", gap: 12 },
  overlay: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
  },
  backdrop: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modal: {
    width: "100%",
    maxWidth: 570,
    maxHeight: "90%",
    backgroundColor: C.white,
    borderRadius: 14,
    overflow: "hidden",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderColor: C.border,
  },
  modalTitle: { fontSize: 20, fontWeight: "800", color: C.dark },
  modalBody: { padding: 20, gap: 11 },
  label: { fontSize: 12, fontWeight: "700", color: C.dark, marginTop: 6 },
  input: {
    height: 44,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 14,
    color: C.dark,
    backgroundColor: C.white,
  },
  options: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  option: {
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 7,
  },
  optionActive: { borderColor: C.orange, backgroundColor: "#F9F0E8" },
  optionText: { fontSize: 12, color: C.dark },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 15,
  },
  cancel: {
    paddingHorizontal: 18,
    minHeight: 44,
    justifyContent: "center",
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 9,
  },
  cancelText: { color: C.dark, fontWeight: "700" },
});
