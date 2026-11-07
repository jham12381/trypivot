import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import {
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    useWindowDimensions,
} from "react-native";

type Status = "In Progress" | "Needs Review" | "Blocked" | "Completed";
type TaskStatus = "To Do" | "In Progress" | "Done";
type Task = {
  id: string;
  title: string;
  assignee: string;
  status: TaskStatus;
  stage: string;
};
type Event = { id: string; message: string; date: string };
type Project = {
  id: string;
  name: string;
  code: string;
  type: string;
  location: string;
  manager: string;
  stageIndex: number;
  status: Status;
  description: string;
  tasks: Task[];
  events: Event[];
};
const C = {
  orange: "#C47B42",
  dark: "#26313A",
  muted: "#7B858D",
  border: "#E6E7E7",
  white: "#FFFFFF",
  background: "#F5F2EC",
  green: "#3C936B",
  red: "#C45C55",
};
const stages = [
  "Acquisition",
  "Due Diligence",
  "Entitlements",
  "Design & Planning",
  "Permitting",
  "Construction",
  "Closeout",
];
const types = [
  "Multifamily",
  "Commercial",
  "Residential",
  "Mixed-Use",
  "Industrial",
  "Other",
];
const seed: Project[] = [
  {
    id: "1",
    name: "North Ridge Apartments",
    code: "DEV-2026-014",
    type: "Multifamily",
    location: "Kansas City, MO",
    manager: "James Mitchell",
    stageIndex: 1,
    status: "In Progress",
    description: "Multifamily residential development.",
    tasks: [
      {
        id: "n1",
        title: "Environmental site assessment",
        assignee: "Sarah Collins",
        status: "Done",
        stage: "Due Diligence",
      },
      {
        id: "n2",
        title: "Review title commitment",
        assignee: "James Mitchell",
        status: "In Progress",
        stage: "Due Diligence",
      },
      {
        id: "n3",
        title: "Finalize feasibility report",
        assignee: "Michael Turner",
        status: "To Do",
        stage: "Due Diligence",
      },
    ],
    events: [
      {
        id: "e1",
        message: "Project entered Due Diligence",
        date: "Demo history",
      },
    ],
  },
  {
    id: "2",
    name: "Westfield Commercial",
    code: "DEV-2026-009",
    type: "Commercial",
    location: "Columbus, OH",
    manager: "Sarah Collins",
    stageIndex: 2,
    status: "Needs Review",
    description: "Commercial development project.",
    tasks: [
      {
        id: "w1",
        title: "Submit zoning application",
        assignee: "Sarah Collins",
        status: "Done",
        stage: "Entitlements",
      },
      {
        id: "w2",
        title: "Confirm municipal conditions",
        assignee: "James Mitchell",
        status: "Done",
        stage: "Entitlements",
      },
    ],
    events: [
      { id: "e2", message: "Stage submitted for review", date: "Demo history" },
    ],
  },
  {
    id: "3",
    name: "Oak Creek Residences",
    code: "DEV-2026-021",
    type: "Residential",
    location: "Indianapolis, IN",
    manager: "Michael Turner",
    stageIndex: 0,
    status: "In Progress",
    description: "Residential development project.",
    tasks: [
      {
        id: "o1",
        title: "Negotiate purchase agreement",
        assignee: "Michael Turner",
        status: "In Progress",
        stage: "Acquisition",
      },
    ],
    events: [],
  },
  {
    id: "4",
    name: "Central Plaza",
    code: "DEV-2026-005",
    type: "Mixed-Use",
    location: "Nashville, TN",
    manager: "Emily Parker",
    stageIndex: 5,
    status: "Blocked",
    description: "Mixed-use commercial and residential development.",
    tasks: [
      {
        id: "c1",
        title: "Resolve contractor schedule",
        assignee: "Emily Parker",
        status: "To Do",
        stage: "Construction",
      },
    ],
    events: [
      {
        id: "e4",
        message: "Construction flagged as blocked",
        date: "Demo history",
      },
    ],
  },
];
const progress = (p: Project) =>
  p.status === "Completed"
    ? 100
    : Math.round((p.stageIndex / stages.length) * 100);
const statusColor = (status: Status) =>
  status === "Blocked" ? C.red : status === "Needs Review" ? C.orange : C.green;
const nowLabel = () => new Date().toLocaleString();

export default function ProjectsWorkspace() {
  const { width, height } = useWindowDimensions();
  const compact = width < 1000;
  const mobile = width < 600;
  const [projects, setProjects] = useState<Project[]>(seed);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [creating, setCreating] = useState(false);
  const [formError, setFormError] = useState("");
  const [form, setForm] = useState({
    name: "",
    type: "Multifamily",
    location: "",
    manager: "",
    description: "",
  });
  const [taskTitle, setTaskTitle] = useState("");
  const [taskAssignee, setTaskAssignee] = useState("");
  const [taskError, setTaskError] = useState("");
  const selected = projects.find((p) => p.id === selectedId) ?? null;
  const filtered = useMemo(
    () =>
      projects.filter((p) => {
        const term = search.trim().toLowerCase();
        return (
          (filter === "All" || p.status === filter) &&
          (!term ||
            [
              p.name,
              p.code,
              p.type,
              p.location,
              p.manager,
              stages[p.stageIndex],
            ].some((v) => v.toLowerCase().includes(term)))
        );
      }),
    [projects, filter, search],
  );

  const editProject = (id: string, change: (p: Project) => Project) => {
    setProjects((prev) => prev.map((p) => (p.id === id ? change(p) : p)));
  };
  const record = (p: Project, message: string): Event[] => [
    { id: `${Date.now()}-${Math.random()}`, message, date: nowLabel() },
    ...p.events,
  ];
  const changeTask = (taskId: string, status: TaskStatus) => {
    if (!selected) return;
    editProject(selected.id, (p) => ({
      ...p,
      tasks: p.tasks.map((t) => (t.id === taskId ? { ...t, status } : t)),
      events: record(
        p,
        `Task marked ${status}: ${p.tasks.find((t) => t.id === taskId)?.title ?? "Task"}`,
      ),
    }));
  };
  const addTask = () => {
    if (!selected) return;
    if (!taskTitle.trim()) {
      setTaskError("Enter a task name.");
      return;
    }
    const title = taskTitle.trim();
    editProject(selected.id, (p) => ({
      ...p,
      tasks: [
        ...p.tasks,
        {
          id: `${Date.now()}-${Math.random()}`,
          title,
          assignee: taskAssignee.trim() || "Unassigned",
          status: "To Do",
          stage: stages[p.stageIndex],
        },
      ],
      events: record(p, `Task added: ${title}`),
    }));
    setTaskTitle("");
    setTaskAssignee("");
    setTaskError("");
  };
  const requestReview = () => {
    if (!selected) return;
    editProject(selected.id, (p) => ({
      ...p,
      status: "Needs Review",
      events: record(p, `${stages[p.stageIndex]} submitted for approval`),
    }));
  };
  const approve = () => {
    if (!selected || selected.status !== "Needs Review") return;
    editProject(selected.id, (p) => {
      const final = p.stageIndex === stages.length - 1;
      return {
        ...p,
        stageIndex: final ? p.stageIndex : p.stageIndex + 1,
        status: final ? "Completed" : "In Progress",
        events: record(
          p,
          final
            ? "Closeout approved — project completed"
            : `${stages[p.stageIndex]} approved; advanced to ${stages[p.stageIndex + 1]}`,
        ),
      };
    });
  };
  const reject = () => {
    if (!selected || selected.status !== "Needs Review") return;
    editProject(selected.id, (p) => {
      const index = Math.max(0, p.stageIndex - 1);
      return {
        ...p,
        stageIndex: index,
        status: "In Progress",
        events: record(p, `Approval rejected; returned to ${stages[index]}`),
      };
    });
  };
  const createProject = () => {
    if (!form.name.trim()) {
      setFormError("Please enter a project name.");
      return;
    }
    const id = `${Date.now()}-${Math.random()}`;
    const number =
      Math.max(
        0,
        ...projects.map((p) => Number(p.code.match(/-(\d+)$/)?.[1] ?? 0)),
      ) + 1;
    const project: Project = {
      id,
      code: `DEV-${new Date().getFullYear()}-${String(number).padStart(3, "0")}`,
      name: form.name.trim(),
      type: form.type,
      location: form.location.trim() || "Not specified",
      manager: form.manager.trim() || "Unassigned",
      description: form.description.trim(),
      stageIndex: 0,
      status: "In Progress",
      tasks: [],
      events: [
        { id: `created-${id}`, message: "Project created", date: nowLabel() },
      ],
    };
    setProjects((prev) => [project, ...prev]);
    setForm({
      name: "",
      type: "Multifamily",
      location: "",
      manager: "",
      description: "",
    });
    setFormError("");
    setFilter("All");
    setSearch("");
    setCreating(false);
    setSelectedId(id);
  };
  const doneCount =
    selected?.tasks.filter((t) => t.status === "Done").length ?? 0;
  const pendingCount =
    selected?.tasks.filter((t) => t.status !== "Done").length ?? 0;
  const stageTasks =
    selected?.tasks.filter((t) => t.stage === stages[selected.stageIndex]) ??
    [];
  const incompleteStageTasks = stageTasks.filter(
    (t) => t.status !== "Done",
  ).length;

  return (
    <View style={s.root}>
      {selected ? (
        <>
          <TouchableOpacity
            style={s.backLink}
            onPress={() => {
              setSelectedId(null);
              setTaskError("");
            }}
          >
            <Ionicons name="arrow-back" size={18} color={C.orange} />
            <Text style={s.backText}>All Projects</Text>
          </TouchableOpacity>
          <View style={[s.heading, compact && s.wrap]}>
            <View style={{ flexShrink: 1 }}>
              <Text style={s.eyebrow}>
                {selected.code} · {selected.type}
              </Text>
              <Text style={s.title}>{selected.name}</Text>
              <Text style={s.subtitle}>
                {selected.location} · Managed by {selected.manager}
              </Text>
            </View>
            <View
              style={[
                s.statusPill,
                { backgroundColor: `${statusColor(selected.status)}18` },
              ]}
            >
              <View
                style={[
                  s.dot,
                  { backgroundColor: statusColor(selected.status) },
                ]}
              />
              <Text
                style={[s.statusText, { color: statusColor(selected.status) }]}
              >
                {selected.status}
              </Text>
            </View>
          </View>
          <View style={s.stats}>
            {[
              {
                label: "Current Stage",
                value: stages[selected.stageIndex],
                icon: "git-branch-outline" as const,
              },
              {
                label: "Completed Tasks",
                value: String(doneCount),
                icon: "checkmark-circle-outline" as const,
              },
              {
                label: "Open Tasks",
                value: String(pendingCount),
                icon: "list-outline" as const,
              },
            ].map((item) => (
              <View
                key={item.label}
                style={[s.statCard, compact && s.compactStat]}
              >
                <View style={s.statTop}>
                  <Text style={s.statLabel}>{item.label}</Text>
                  <Ionicons name={item.icon} size={20} color={C.orange} />
                </View>
                <Text style={s.statValueSmall}>{item.value}</Text>
              </View>
            ))}
          </View>
          <View style={s.panel}>
            <View style={s.sectionHead}>
              <Text style={s.sectionTitle}>Development Workflow</Text>
              <Text style={s.muted}>{progress(selected)}% complete</Text>
            </View>
            <View style={s.progressTrack}>
              <View
                style={[s.progressFill, { width: `${progress(selected)}%` }]}
              />
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={s.stageStrip}
            >
              {stages.map((stage, index) => {
                const done =
                  selected.status === "Completed" ||
                  index < selected.stageIndex;
                const current =
                  index === selected.stageIndex &&
                  selected.status !== "Completed";
                return (
                  <View
                    key={stage}
                    style={[
                      s.stageCard,
                      current && s.stageCurrent,
                      done && s.stageDone,
                    ]}
                  >
                    <Ionicons
                      name={
                        done
                          ? "checkmark-circle"
                          : current
                            ? "radio-button-on"
                            : "ellipse-outline"
                      }
                      size={22}
                      color={done ? C.green : current ? C.orange : "#AEB6BB"}
                    />
                    <Text style={s.stageNumber}>STAGE {index + 1}</Text>
                    <Text style={[s.stageName, current && { color: C.orange }]}>
                      {stage}
                    </Text>
                    <Text style={s.stageCaption}>
                      {done
                        ? "Approved"
                        : current
                          ? "Current stage"
                          : "Upcoming"}
                    </Text>
                  </View>
                );
              })}
            </ScrollView>
            <View style={s.actionPanel}>
              <View style={{ flex: 1, minWidth: 180 }}>
                <Text style={s.actionTitle}>
                  {selected.status === "Completed"
                    ? "Project complete"
                    : selected.status === "Needs Review"
                      ? "Approval requested"
                      : selected.status === "Blocked"
                        ? "Project blocked"
                        : "Ready for stage review?"}
                </Text>
                <Text style={s.muted}>
                  {selected.status === "Needs Review"
                    ? "Demo approval controls are available below."
                    : selected.status === "Completed"
                      ? "All workflow stages have been approved."
                      : `${incompleteStageTasks} open task${incompleteStageTasks === 1 ? "" : "s"} in the current stage.`}
                </Text>
              </View>
              <View style={s.actionButtons}>
                {selected.status === "Needs Review" ? (
                  <>
                    <TouchableOpacity style={s.outlineButton} onPress={reject}>
                      <Text style={s.outlineText}>Reject & Return</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={s.primaryButton} onPress={approve}>
                      <Ionicons name="checkmark" size={17} color="#FFF" />
                      <Text style={s.primaryText}>Approve Stage</Text>
                    </TouchableOpacity>
                  </>
                ) : selected.status !== "Completed" ? (
                  <>
                    {selected.status === "Blocked" && (
                      <TouchableOpacity
                        style={s.outlineButton}
                        onPress={() =>
                          editProject(selected.id, (p) => ({
                            ...p,
                            status: "In Progress",
                            events: record(p, "Project unblocked"),
                          }))
                        }
                      >
                        <Text style={s.outlineText}>Unblock</Text>
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity
                      style={[
                        s.primaryButton,
                        selected.status === "Blocked" && s.disabledButton,
                      ]}
                      disabled={selected.status === "Blocked"}
                      onPress={requestReview}
                    >
                      <Text style={s.primaryText}>Request Approval</Text>
                    </TouchableOpacity>
                  </>
                ) : null}
              </View>
            </View>
            <Text style={s.demoNote}>
              Demo workflow: approval advances one stage; rejection returns one
              stage (or stays at Acquisition). Stage submission is allowed even
              with open tasks so the review flow can be demonstrated.
            </Text>
          </View>
          <View style={s.panel}>
            <View style={s.sectionHead}>
              <View>
                <Text style={s.sectionTitle}>Project Tasks</Text>
                <Text style={s.muted}>Assign work and update progress</Text>
              </View>
              <Text style={s.muted}>
                {doneCount} of {selected.tasks.length} done
              </Text>
            </View>
            <View style={s.taskList}>
              {selected.tasks.length === 0 ? (
                <Text style={s.muted}>
                  No tasks yet. Add the first task below.
                </Text>
              ) : (
                selected.tasks.map((task) => (
                  <View
                    key={task.id}
                    style={[s.taskRow, mobile && s.taskRowMobile]}
                  >
                    <View style={{ flex: 1, minWidth: 160 }}>
                      <Text style={s.taskTitle}>{task.title}</Text>
                      <Text style={s.taskMeta}>
                        {task.assignee} · {task.stage}
                      </Text>
                    </View>
                    <View style={s.taskActions}>
                      {(["To Do", "In Progress", "Done"] as TaskStatus[]).map(
                        (status) => (
                          <TouchableOpacity
                            key={status}
                            onPress={() => changeTask(task.id, status)}
                            style={[
                              s.taskChip,
                              task.status === status && s.taskChipSelected,
                            ]}
                          >
                            <Text
                              style={[
                                s.taskChipText,
                                task.status === status && {
                                  color: C.orange,
                                  fontWeight: "800",
                                },
                              ]}
                            >
                              {status}
                            </Text>
                          </TouchableOpacity>
                        ),
                      )}
                    </View>
                  </View>
                ))
              )}
            </View>
            <View style={s.taskForm}>
              <Text style={s.formHeading}>Add a Task</Text>
              <View style={[s.taskInputs, mobile && s.wrap]}>
                <TextInput
                  style={[s.input, { flex: 2, minWidth: 170 }]}
                  placeholder="Task name"
                  placeholderTextColor="#A1A9AE"
                  value={taskTitle}
                  onChangeText={(value) => {
                    setTaskTitle(value);
                    setTaskError("");
                  }}
                />
                <TextInput
                  style={[s.input, { flex: 1, minWidth: 145 }]}
                  placeholder="Assignee"
                  placeholderTextColor="#A1A9AE"
                  value={taskAssignee}
                  onChangeText={setTaskAssignee}
                />
                <TouchableOpacity style={s.primaryButton} onPress={addTask}>
                  <Ionicons name="add" size={18} color="#FFF" />
                  <Text style={s.primaryText}>Add Task</Text>
                </TouchableOpacity>
              </View>
              {taskError ? <Text style={s.error}>{taskError}</Text> : null}
            </View>
          </View>
          <View style={s.panel}>
            <View style={s.sectionHead}>
              <Text style={s.sectionTitle}>Activity History</Text>
            </View>
            <View style={s.activityList}>
              {selected.events.length === 0 ? (
                <Text style={s.muted}>No activity recorded yet.</Text>
              ) : (
                selected.events.map((event) => (
                  <View key={event.id} style={s.activityRow}>
                    <View style={s.activityDot} />
                    <View style={{ flex: 1 }}>
                      <Text style={s.taskTitle}>{event.message}</Text>
                      <Text style={s.taskMeta}>{event.date}</Text>
                    </View>
                  </View>
                ))
              )}
            </View>
          </View>
          <View style={s.panel}>
            <View style={s.sectionHead}>
              <Text style={s.sectionTitle}>Project Overview</Text>
            </View>
            <View style={s.overview}>
              {[
                ["Development Type", selected.type],
                ["Location", selected.location],
                ["Project Manager", selected.manager],
                ["Current Stage", stages[selected.stageIndex]],
                [
                  "Description",
                  selected.description || "No description provided.",
                ],
              ].map(([label, value]) => (
                <View key={label} style={s.detailRow}>
                  <Text style={s.muted}>{label}</Text>
                  <Text style={s.detailValue}>{value}</Text>
                </View>
              ))}
            </View>
          </View>
        </>
      ) : (
        <>
          <View style={[s.heading, compact && s.wrap]}>
            <View style={{ flexShrink: 1 }}>
              <Text style={s.title}>Projects</Text>
              <Text style={s.subtitle}>
                Manage and monitor your development portfolio.
              </Text>
            </View>
            <TouchableOpacity
              style={s.primaryButton}
              onPress={() => {
                setFormError("");
                setCreating(true);
              }}
            >
              <Ionicons name="add" size={20} color="#FFF" />
              <Text style={s.primaryText}>New Project</Text>
            </TouchableOpacity>
          </View>
          <View style={s.stats}>
            {[
              {
                label: "Total Projects",
                value: projects.length,
                icon: "business-outline" as const,
              },
              {
                label: "In Progress",
                value: projects.filter((p) => p.status === "In Progress")
                  .length,
                icon: "layers-outline" as const,
              },
              {
                label: "Needs Attention",
                value: projects.filter(
                  (p) => p.status === "Blocked" || p.status === "Needs Review",
                ).length,
                icon: "alert-circle-outline" as const,
              },
            ].map((item) => (
              <View
                key={item.label}
                style={[s.statCard, compact && s.compactStat]}
              >
                <View style={s.statTop}>
                  <Text style={s.statLabel}>{item.label}</Text>
                  <Ionicons name={item.icon} size={21} color={C.orange} />
                </View>
                <Text style={s.statValue}>{item.value}</Text>
              </View>
            ))}
          </View>
          <View style={s.panel}>
            <View style={[s.toolbar, compact && s.wrap]}>
              <View style={s.searchBox}>
                <Ionicons name="search-outline" size={19} color={C.muted} />
                <TextInput
                  style={s.searchInput}
                  placeholder="Search projects..."
                  placeholderTextColor="#A1A9AE"
                  value={search}
                  onChangeText={setSearch}
                />
                {search.length > 0 && (
                  <TouchableOpacity onPress={() => setSearch("")}>
                    <Ionicons name="close-circle" size={18} color={C.muted} />
                  </TouchableOpacity>
                )}
              </View>
              <Text style={s.muted}>{filtered.length} projects</Text>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={s.filters}
            >
              {[
                "All",
                "In Progress",
                "Needs Review",
                "Blocked",
                "Completed",
              ].map((item) => (
                <TouchableOpacity
                  key={item}
                  onPress={() => setFilter(item)}
                  style={[s.filterButton, filter === item && s.filterActive]}
                >
                  <Text
                    style={[
                      s.filterText,
                      filter === item && s.filterTextActive,
                    ]}
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <ScrollView horizontal showsHorizontalScrollIndicator>
              <View style={{ minWidth: 890, flexGrow: 1 }}>
                <View style={s.tableHeader}>
                  {[
                    ["PROJECT", 250],
                    ["LOCATION", 155],
                    ["CURRENT STAGE", 150],
                    ["PROGRESS", 135],
                    ["STATUS", 150],
                  ].map(([label, w]) => (
                    <Text
                      key={String(label)}
                      style={[s.th, { width: Number(w) }]}
                    >
                      {label}
                    </Text>
                  ))}
                </View>
                {filtered.map((p) => {
                  const color = statusColor(p.status);
                  return (
                    <TouchableOpacity
                      key={p.id}
                      style={s.tableRow}
                      onPress={() => setSelectedId(p.id)}
                      activeOpacity={0.7}
                    >
                      <View style={{ width: 250, paddingRight: 12 }}>
                        <Text style={s.projectName}>{p.name}</Text>
                        <Text style={s.projectMeta}>
                          {p.code} · {p.type}
                        </Text>
                      </View>
                      <Text style={[s.cell, { width: 155 }]}>{p.location}</Text>
                      <Text style={[s.cell, { width: 150 }]}>
                        {stages[p.stageIndex]}
                      </Text>
                      <View style={{ width: 135, paddingRight: 22 }}>
                        <View style={s.progressTrack}>
                          <View
                            style={[
                              s.progressFill,
                              { width: `${progress(p)}%` },
                            ]}
                          />
                        </View>
                        <Text style={s.progressLabel}>{progress(p)}%</Text>
                      </View>
                      <View style={{ width: 130 }}>
                        <View
                          style={[
                            s.statusPill,
                            { backgroundColor: `${color}15` },
                          ]}
                        >
                          <View style={[s.dot, { backgroundColor: color }]} />
                          <Text style={[s.statusText, { color }]}>
                            {p.status}
                          </Text>
                        </View>
                      </View>
                      <Ionicons
                        name="chevron-forward"
                        size={17}
                        color="#A1A9AE"
                      />
                    </TouchableOpacity>
                  );
                })}
                {filtered.length === 0 && (
                  <View style={s.empty}>
                    <Ionicons
                      name="folder-open-outline"
                      size={36}
                      color={C.muted}
                    />
                    <Text style={s.emptyTitle}>No projects found</Text>
                    <Text style={s.muted}>
                      Try adjusting your search or filters.
                    </Text>
                  </View>
                )}
              </View>
            </ScrollView>
          </View>
        </>
      )}
      <Modal
        visible={creating}
        transparent
        animationType="fade"
        onRequestClose={() => setCreating(false)}
        statusBarTranslucent
      >
        <KeyboardAvoidingView
          style={s.modalOverlay}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <TouchableOpacity
            style={s.modalBackdrop}
            activeOpacity={1}
            onPress={() => setCreating(false)}
          />
          <View
            style={[
              s.modal,
              mobile && s.mobileModal,
              { maxHeight: mobile ? height - 24 : height * 0.9 },
            ]}
          >
            <View style={s.modalHeader}>
              <View>
                <Text style={s.eyebrow}>PROJECT MANAGEMENT</Text>
                <Text style={s.modalTitle}>Create New Project</Text>
              </View>
              <TouchableOpacity onPress={() => setCreating(false)}>
                <Ionicons name="close" size={24} color={C.dark} />
              </TouchableOpacity>
            </View>
            <ScrollView
              style={{ flexShrink: 1 }}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={s.modalBody}
            >
              <Text style={s.inputLabel}>Project Name *</Text>
              <TextInput
                style={s.input}
                placeholder="e.g. Riverfront Development"
                value={form.name}
                onChangeText={(name) => {
                  setForm((p) => ({ ...p, name }));
                  setFormError("");
                }}
              />
              {formError ? <Text style={s.error}>{formError}</Text> : null}
              <Text style={s.inputLabel}>Development Type</Text>
              <View style={s.typeOptions}>
                {types.map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[s.typeOption, form.type === type && s.typeSelected]}
                    onPress={() => setForm((p) => ({ ...p, type }))}
                  >
                    <Text
                      style={[
                        s.typeText,
                        form.type === type && {
                          color: C.orange,
                          fontWeight: "800",
                        },
                      ]}
                    >
                      {type}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={s.inputLabel}>Location</Text>
              <TextInput
                style={s.input}
                placeholder="City, State"
                value={form.location}
                onChangeText={(location) =>
                  setForm((p) => ({ ...p, location }))
                }
              />
              <Text style={s.inputLabel}>Project Manager</Text>
              <TextInput
                style={s.input}
                placeholder="Assigned manager"
                value={form.manager}
                onChangeText={(manager) => setForm((p) => ({ ...p, manager }))}
              />
              <Text style={s.inputLabel}>Description</Text>
              <TextInput
                style={[s.input, s.multiline]}
                placeholder="Brief project description..."
                value={form.description}
                onChangeText={(description) =>
                  setForm((p) => ({ ...p, description }))
                }
                multiline
              />
              <View style={s.formActions}>
                <TouchableOpacity
                  style={s.cancelButton}
                  onPress={() => setCreating(false)}
                >
                  <Text style={s.cancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={s.primaryButton}
                  onPress={createProject}
                >
                  <Ionicons name="add" size={19} color="#FFF" />
                  <Text style={s.primaryText}>Create Project</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  root: { gap: 24 },
  heading: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
  },
  wrap: { flexWrap: "wrap" },
  title: { fontSize: 28, fontWeight: "800", color: C.dark },
  subtitle: { fontSize: 14, color: C.muted, marginTop: 7 },
  eyebrow: {
    color: C.orange,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1,
    marginBottom: 7,
  },
  primaryButton: {
    minHeight: 44,
    paddingHorizontal: 18,
    borderRadius: 9,
    backgroundColor: C.orange,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  primaryText: { color: "#FFF", fontSize: 13, fontWeight: "800" },
  stats: { flexDirection: "row", flexWrap: "wrap", gap: 14 },
  statCard: {
    flexGrow: 1,
    flexBasis: 220,
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 12,
    padding: 22,
  },
  compactStat: { flexBasis: 160 },
  statTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  statLabel: { color: C.muted, fontSize: 12, fontWeight: "600" },
  statValue: { color: C.dark, fontSize: 32, fontWeight: "800", marginTop: 16 },
  statValueSmall: {
    color: C.dark,
    fontSize: 19,
    fontWeight: "800",
    marginTop: 16,
  },
  panel: {
    backgroundColor: C.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.border,
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
    gap: 10,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 9,
    paddingHorizontal: 14,
    height: 44,
    width: "100%",
    maxWidth: 390,
    flexShrink: 1,
  },
  searchInput: { flex: 1, color: C.dark, fontSize: 13 },
  muted: { color: C.muted, fontSize: 12, lineHeight: 19 },
  filters: { gap: 8, paddingHorizontal: 20, paddingBottom: 18 },
  filterButton: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 7,
    backgroundColor: "#F6F7F7",
  },
  filterActive: { backgroundColor: "#F8ECE1" },
  filterText: { color: C.muted, fontSize: 12, fontWeight: "600" },
  filterTextActive: { color: C.orange, fontWeight: "800" },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#FAFAF8",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: C.border,
  },
  th: { color: "#919BA2", fontSize: 10, fontWeight: "800", letterSpacing: 1 },
  tableRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 19,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  projectName: { color: C.dark, fontSize: 13, fontWeight: "800" },
  projectMeta: { color: C.muted, fontSize: 11, marginTop: 5 },
  cell: { color: "#64717A", fontSize: 12 },
  progressTrack: {
    height: 7,
    backgroundColor: "#E8EBEC",
    borderRadius: 5,
    overflow: "hidden",
  },
  progressFill: { height: "100%", backgroundColor: C.orange, borderRadius: 5 },
  progressLabel: { color: C.muted, fontSize: 11, marginTop: 7 },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 9,
    gap: 7,
    borderRadius: 7,
  },
  dot: { width: 7, height: 7, borderRadius: 4 },
  statusText: { fontSize: 11, fontWeight: "800" },
  empty: { alignItems: "center", padding: 45, gap: 10 },
  emptyTitle: { fontSize: 16, fontWeight: "700", color: C.dark },
  backLink: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 8,
    paddingVertical: 5,
  },
  backText: { color: C.orange, fontWeight: "800", fontSize: 13 },
  sectionHead: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    flexWrap: "wrap",
  },
  sectionTitle: { fontSize: 17, fontWeight: "800", color: C.dark },
  stageStrip: { padding: 22, gap: 10 },
  stageCard: {
    width: 146,
    minHeight: 130,
    borderRadius: 10,
    backgroundColor: "#F7F8F8",
    borderWidth: 1,
    borderColor: C.border,
    padding: 14,
    gap: 6,
  },
  stageCurrent: { borderColor: C.orange, backgroundColor: "#FCF5EE" },
  stageDone: { backgroundColor: "#F1F8F4", borderColor: "#CBE3D5" },
  stageNumber: {
    color: C.muted,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.8,
  },
  stageName: { color: C.dark, fontSize: 12, fontWeight: "800" },
  stageCaption: { color: C.muted, fontSize: 11 },
  actionPanel: {
    marginHorizontal: 22,
    marginBottom: 16,
    padding: 18,
    borderRadius: 10,
    backgroundColor: "#FAF8F5",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 14,
  },
  actionTitle: {
    color: C.dark,
    fontWeight: "800",
    fontSize: 14,
    marginBottom: 6,
  },
  actionButtons: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  outlineButton: {
    minHeight: 44,
    paddingHorizontal: 16,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: C.orange,
    alignItems: "center",
    justifyContent: "center",
  },
  outlineText: { color: C.orange, fontWeight: "800", fontSize: 12 },
  disabledButton: { opacity: 0.45 },
  demoNote: {
    color: C.muted,
    fontSize: 11,
    lineHeight: 17,
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  taskList: { paddingHorizontal: 24 },
  taskRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: C.border,
  },
  taskRowMobile: { flexWrap: "wrap" },
  taskTitle: { color: C.dark, fontWeight: "700", fontSize: 13 },
  taskMeta: { color: C.muted, fontSize: 11, marginTop: 5 },
  taskActions: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  taskChip: {
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 7,
    paddingHorizontal: 9,
    paddingVertical: 8,
  },
  taskChipSelected: { borderColor: C.orange, backgroundColor: "#FCF2E9" },
  taskChipText: { fontSize: 11, color: C.muted },
  taskForm: { padding: 24, backgroundColor: "#FAFAF9", gap: 12 },
  formHeading: { fontSize: 13, fontWeight: "800", color: C.dark },
  taskInputs: { flexDirection: "row", gap: 10, alignItems: "center" },
  input: {
    minHeight: 46,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: C.white,
    borderRadius: 9,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 13,
    color: C.dark,
  },
  error: { color: C.red, fontSize: 12 },
  activityList: { paddingHorizontal: 24, paddingBottom: 22 },
  activityRow: {
    flexDirection: "row",
    gap: 12,
    paddingVertical: 13,
    borderTopWidth: 1,
    borderTopColor: C.border,
  },
  activityDot: {
    width: 9,
    height: 9,
    backgroundColor: C.orange,
    borderRadius: 5,
    marginTop: 4,
  },
  overview: { paddingHorizontal: 24, paddingBottom: 24 },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 12,
    paddingVertical: 13,
    borderTopWidth: 1,
    borderTopColor: C.border,
  },
  detailValue: {
    color: C.dark,
    fontSize: 13,
    fontWeight: "700",
    textAlign: "right",
    flexShrink: 1,
    maxWidth: "65%",
  },
  modalOverlay: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  modalBackdrop: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: "rgba(20,30,38,0.60)",
  },
  modal: {
    backgroundColor: C.white,
    width: "100%",
    maxWidth: 620,
    borderRadius: 14,
    overflow: "hidden",
  },
  mobileModal: { maxWidth: "100%", borderRadius: 12 },
  modalHeader: {
    padding: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    gap: 14,
  },
  modalTitle: { color: C.dark, fontSize: 23, fontWeight: "800" },
  modalBody: { padding: 24, paddingBottom: 32 },
  inputLabel: {
    color: C.dark,
    fontSize: 13,
    fontWeight: "700",
    marginTop: 18,
    marginBottom: 9,
  },
  typeOptions: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  typeOption: {
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 7,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  typeSelected: { borderColor: C.orange, backgroundColor: "#F8ECE1" },
  typeText: { fontSize: 12, color: C.muted },
  multiline: { minHeight: 95, textAlignVertical: "top" },
  formActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 30,
  },
  cancelButton: { paddingHorizontal: 16, paddingVertical: 12 },
  cancelText: { color: C.muted, fontSize: 13, fontWeight: "700" },
});
