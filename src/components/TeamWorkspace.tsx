import { stages, useProjects } from "@/context/ProjectsContext";
import { TeamAccess, TeamMember, useTeam } from "@/context/TeamContext";
import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import {
  Linking,
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
  red: "#C45C55",
};
const accessOptions: TeamAccess[] = [
  "Administrator",
  "Project Manager",
  "Contributor",
  "Reviewer / Approver",
  "Viewer",
];
const emptyMember = (): TeamMember => ({
  id: "",
  name: "",
  title: "",
  department: "",
  email: "",
  phone: "",
  access: "Contributor",
  stages: [],
  projectIds: [],
  responsibilities: "",
  active: true,
});
const initials = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() || "")
    .join("") || "?";

export default function TeamWorkspace() {
  const { members, setMembers } = useTeam();
  const { projects } = useProjects();
  const { width } = useWindowDimensions();
  const mobile = width < 680;
  const [tab, setTab] = useState<"Directory" | "Responsibilities">("Directory");
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("All departments");
  const [selected, setSelected] = useState<TeamMember | null>(null);
  const [form, setForm] = useState<TeamMember | null>(null);
  const [error, setError] = useState("");
  const departments = useMemo(
    () =>
      Array.from(
        new Set(members.map((m) => m.department).filter(Boolean)),
      ).sort(),
    [members],
  );
  const filtered = useMemo(
    () =>
      members.filter((m) => {
        const q = search.trim().toLowerCase();
        return (
          (department === "All departments" || m.department === department) &&
          (!q ||
            [
              m.name,
              m.title,
              m.department,
              m.email,
              m.responsibilities,
              ...m.stages,
            ].some((v) => v.toLowerCase().includes(q)))
        );
      }),
    [members, search, department],
  );
  const openNew = () => {
    setSelected(null);
    setForm(emptyMember());
    setError("");
  };
  const edit = (member: TeamMember) => {
    setSelected(null);
    setForm({
      ...member,
      stages: [...member.stages],
      projectIds: [...member.projectIds],
    });
    setError("");
  };
  const save = () => {
    if (!form) return;
    if (!form.name.trim()) {
      setError("Enter a team member's name.");
      return;
    }
    if (!form.title.trim()) {
      setError("Enter a job title.");
      return;
    }
    if (
      form.email.trim() &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())
    ) {
      setError("Enter a valid email address or leave it blank.");
      return;
    }
    const next = {
      ...form,
      id: form.id || `${Date.now()}-${Math.random()}`,
      name: form.name.trim(),
      title: form.title.trim(),
      department: form.department.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      responsibilities: form.responsibilities.trim(),
    };
    setMembers((prev) =>
      prev.some((m) => m.id === next.id)
        ? prev.map((m) => (m.id === next.id ? next : m))
        : [...prev, next],
    );
    setForm(null);
  };
  const toggle = (key: "stages" | "projectIds", value: string) =>
    setForm((old) =>
      old
        ? {
            ...old,
            [key]: old[key].includes(value)
              ? old[key].filter((v) => v !== value)
              : [...old[key], value],
          }
        : old,
    );
  const field = (
    label: string,
    key:
      | "name"
      | "title"
      | "department"
      | "email"
      | "phone"
      | "responsibilities",
    placeholder: string,
    multiline = false,
  ) => (
    <View style={s.field} key={key}>
      <Text style={s.label}>{label}</Text>
      <TextInput
        style={[s.input, multiline && s.multi]}
        value={form?.[key] || ""}
        onChangeText={(value) =>
          setForm((old) => (old ? { ...old, [key]: value } : old))
        }
        placeholder={placeholder}
        placeholderTextColor="#A1A9AE"
        multiline={multiline}
        autoCapitalize={key === "email" ? "none" : "sentences"}
        keyboardType={
          key === "email"
            ? "email-address"
            : key === "phone"
              ? "phone-pad"
              : "default"
        }
      />
    </View>
  );
  return (
    <View style={s.root}>
      <View style={[s.heading, mobile && s.stack]}>
        <View style={{ flexShrink: 1 }}>
          <Text style={s.title}>Team</Text>
          <Text style={s.subtitle}>
            Find the right person for every development decision.
          </Text>
        </View>
        <TouchableOpacity style={s.primary} onPress={openNew}>
          <Ionicons name="person-add-outline" size={18} color="#FFF" />
          <Text style={s.primaryText}>Add Member</Text>
        </TouchableOpacity>
      </View>
      <View style={s.stats}>
        {[
          {
            label: "Team Members",
            value: members.filter((m) => m.active).length,
            icon: "people-outline" as const,
          },
          {
            label: "Departments",
            value: departments.length,
            icon: "business-outline" as const,
          },
          {
            label: "Workflow Stages",
            value: stages.length,
            icon: "git-network-outline" as const,
          },
        ].map((stat) => (
          <View key={stat.label} style={[s.stat, mobile && s.statMobile]}>
            <View style={s.between}>
              <Text style={s.muted}>{stat.label}</Text>
              <Ionicons name={stat.icon} size={20} color={C.orange} />
            </View>
            <Text style={s.number}>{stat.value}</Text>
          </View>
        ))}
      </View>
      <View style={s.tabs}>
        {(["Directory", "Responsibilities"] as const).map((name) => (
          <TouchableOpacity
            key={name}
            style={[s.tab, tab === name && s.tabActive]}
            onPress={() => setTab(name)}
          >
            <Text style={[s.tabText, tab === name && s.tabTextActive]}>
              {name === "Directory"
                ? "Team Directory"
                : "Workflow Responsibilities"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      {tab === "Directory" ? (
        <>
          <View style={[s.toolbar, mobile && s.stack]}>
            <View style={s.search}>
              <Ionicons name="search-outline" color={C.muted} size={19} />
              <TextInput
                style={s.searchInput}
                placeholder="Search names, roles, stages..."
                placeholderTextColor="#A1A9AE"
                value={search}
                onChangeText={setSearch}
              />
            </View>
            <Text style={s.muted}>{filtered.length} members</Text>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={s.filters}
          >
            {["All departments", ...departments].map((d) => (
              <TouchableOpacity
                key={d}
                style={[s.chip, department === d && s.chipActive]}
                onPress={() => setDepartment(d)}
              >
                <Text
                  style={[s.chipText, department === d && s.chipTextActive]}
                >
                  {d}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <View style={s.cards}>
            {filtered.length === 0 ? (
              <View style={s.empty}>
                <Text style={s.muted}>No matching team members.</Text>
              </View>
            ) : (
              filtered.map((m) => (
                <TouchableOpacity
                  key={m.id}
                  style={[s.memberCard, mobile && s.memberCardMobile]}
                  onPress={() => setSelected(m)}
                >
                  <View style={s.personRow}>
                    <View style={s.avatar}>
                      <Text style={s.avatarText}>{initials(m.name)}</Text>
                    </View>
                    <View style={{ flex: 1, minWidth: 0 }}>
                      <Text style={s.memberName}>{m.name}</Text>
                      <Text style={s.muted}>{m.title}</Text>
                    </View>
                    <Ionicons
                      name="chevron-forward"
                      color={C.muted}
                      size={18}
                    />
                  </View>
                  <View style={s.badges}>
                    {m.department ? (
                      <View style={s.tag}>
                        <Text style={s.tagText}>{m.department}</Text>
                      </View>
                    ) : null}
                    {!m.active && (
                      <View style={s.tag}>
                        <Text style={s.tagText}>Inactive</Text>
                      </View>
                    )}
                  </View>
                  <Text style={s.muted}>
                    {m.stages.length
                      ? m.stages.join(" · ")
                      : "No stages assigned"}
                  </Text>
                  <Text style={s.small}>
                    {m.projectIds.length} assigned project
                    {m.projectIds.length === 1 ? "" : "s"} · {m.access}
                  </Text>
                </TouchableOpacity>
              ))
            )}
          </View>
        </>
      ) : (
        <View style={s.responsibilityList}>
          <Text style={s.sectionTitle}>Who owns each stage?</Text>
          <Text style={s.subtitle}>
            Select a contact to view their details. Stage assignments are
            examples until your team updates them.
          </Text>
          {stages.map((stage) => {
            const owners = members.filter(
              (m) => m.active && m.stages.includes(stage),
            );
            return (
              <View
                key={stage}
                style={[s.stageRow, mobile && s.stageRowMobile]}
              >
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={s.stageName}>{stage}</Text>
                  <Text style={s.muted}>
                    {owners.length
                      ? `${owners.length} assigned contact${owners.length === 1 ? "" : "s"}`
                      : "No owner assigned"}
                  </Text>
                </View>
                <View style={s.stagePeople}>
                  {owners.length ? (
                    owners.map((m) => (
                      <TouchableOpacity
                        key={m.id}
                        style={s.ownerChip}
                        onPress={() => setSelected(m)}
                      >
                        <Text style={s.ownerText}>
                          {m.name} · {m.title}
                        </Text>
                        <Ionicons
                          name="chevron-forward"
                          size={13}
                          color={C.orange}
                        />
                      </TouchableOpacity>
                    ))
                  ) : (
                    <Text style={s.muted}>
                      Assign an owner in Team Directory
                    </Text>
                  )}
                </View>
              </View>
            );
          })}
        </View>
      )}
      <Modal
        visible={!!selected}
        transparent
        animationType="fade"
        onRequestClose={() => setSelected(null)}
      >
        <View style={s.overlay}>
          <TouchableOpacity
            style={s.backdrop}
            activeOpacity={1}
            onPress={() => setSelected(null)}
          />
          {selected && (
            <View style={s.modal}>
              <View style={s.modalHeader}>
                <Text style={s.modalTitle}>Team Member</Text>
                <TouchableOpacity onPress={() => setSelected(null)}>
                  <Ionicons name="close" size={23} color={C.dark} />
                </TouchableOpacity>
              </View>
              <ScrollView contentContainerStyle={s.modalBody}>
                <View style={s.personRow}>
                  <View style={s.avatar}>
                    <Text style={s.avatarText}>{initials(selected.name)}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.memberName}>{selected.name}</Text>
                    <Text style={s.muted}>
                      {selected.title} ·{" "}
                      {selected.department || "No department"}
                    </Text>
                  </View>
                </View>
                <Text style={s.label}>Contact</Text>
                {selected.email ? (
                  <TouchableOpacity
                    onPress={() => Linking.openURL(`mailto:${selected.email}`)}
                  >
                    <Text style={s.link}>{selected.email}</Text>
                  </TouchableOpacity>
                ) : (
                  <Text style={s.muted}>Email not provided</Text>
                )}
                {selected.phone ? (
                  <TouchableOpacity
                    onPress={() =>
                      Linking.openURL(
                        `tel:${selected.phone.replace(/[^\d+]/g, "")}`,
                      )
                    }
                  >
                    <Text style={s.link}>{selected.phone}</Text>
                  </TouchableOpacity>
                ) : (
                  <Text style={s.muted}>Phone not provided</Text>
                )}
                <Text style={s.label}>Responsibilities</Text>
                <Text style={s.bodyText}>
                  {selected.responsibilities || "No description provided"}
                </Text>
                <Text style={s.label}>Workflow stages</Text>
                <Text style={s.bodyText}>
                  {selected.stages.join(", ") || "None assigned"}
                </Text>
                <Text style={s.label}>Projects</Text>
                <Text style={s.bodyText}>
                  {projects
                    .filter((p) => selected.projectIds.includes(p.id))
                    .map((p) => p.name)
                    .join(", ") || "None assigned"}
                </Text>
                <Text style={s.label}>System role (demo only)</Text>
                <Text style={s.bodyText}>{selected.access}</Text>
                <TouchableOpacity
                  style={s.primary}
                  onPress={() => edit(selected)}
                >
                  <Ionicons name="create-outline" size={18} color="#FFF" />
                  <Text style={s.primaryText}>Edit Member</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          )}
        </View>
      </Modal>
      <Modal
        visible={!!form}
        transparent
        animationType="fade"
        onRequestClose={() => setForm(null)}
      >
        <View style={s.overlay}>
          <TouchableOpacity
            style={s.backdrop}
            activeOpacity={1}
            onPress={() => setForm(null)}
          />
          {form && (
            <View style={s.modal}>
              <View style={s.modalHeader}>
                <Text style={s.modalTitle}>
                  {form.id ? "Edit Team Member" : "Add Team Member"}
                </Text>
                <TouchableOpacity onPress={() => setForm(null)}>
                  <Ionicons name="close" size={23} color={C.dark} />
                </TouchableOpacity>
              </View>
              <ScrollView
                contentContainerStyle={s.modalBody}
                keyboardShouldPersistTaps="handled"
              >
                {field("Full name *", "name", "e.g. Alex Morgan")}
                {field("Job title *", "title", "e.g. Project Manager")}
                {field("Department", "department", "e.g. Development")}
                {field("Work email", "email", "name@company.com")}
                {field("Phone", "phone", "Office or mobile number")}
                {field(
                  "Responsibilities",
                  "responsibilities",
                  "What should colleagues contact this person about?",
                  true,
                )}
                <Text style={s.label}>
                  System role (display only; no access enforcement)
                </Text>
                <View style={s.badges}>
                  {accessOptions.map((a) => (
                    <TouchableOpacity
                      key={a}
                      style={[s.chip, form.access === a && s.chipActive]}
                      onPress={() =>
                        setForm((v) => (v ? { ...v, access: a } : v))
                      }
                    >
                      <Text
                        style={[
                          s.chipText,
                          form.access === a && s.chipTextActive,
                        ]}
                      >
                        {a}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <Text style={s.label}>Workflow responsibilities</Text>
                <View style={s.badges}>
                  {stages.map((stage) => (
                    <TouchableOpacity
                      key={stage}
                      style={[
                        s.chip,
                        form.stages.includes(stage) && s.chipActive,
                      ]}
                      onPress={() => toggle("stages", stage)}
                    >
                      <Text
                        style={[
                          s.chipText,
                          form.stages.includes(stage) && s.chipTextActive,
                        ]}
                      >
                        {stage}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <Text style={s.label}>Assigned projects</Text>
                <View style={s.badges}>
                  {projects.map((p) => (
                    <TouchableOpacity
                      key={p.id}
                      style={[
                        s.chip,
                        form.projectIds.includes(p.id) && s.chipActive,
                      ]}
                      onPress={() => toggle("projectIds", p.id)}
                    >
                      <Text
                        style={[
                          s.chipText,
                          form.projectIds.includes(p.id) && s.chipTextActive,
                        ]}
                      >
                        {p.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <TouchableOpacity
                  style={s.checkbox}
                  onPress={() =>
                    setForm((v) => (v ? { ...v, active: !v.active } : v))
                  }
                >
                  <Ionicons
                    name={form.active ? "checkbox" : "square-outline"}
                    color={C.orange}
                    size={22}
                  />
                  <Text style={s.bodyText}>Active team member</Text>
                </TouchableOpacity>
                {error ? <Text style={s.error}>{error}</Text> : null}
                <View style={s.actions}>
                  <TouchableOpacity
                    style={s.secondary}
                    onPress={() => setForm(null)}
                  >
                    <Text style={s.secondaryText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={s.primary} onPress={save}>
                    <Text style={s.primaryText}>Save Member</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          )}
        </View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  root: { gap: 20 },
  heading: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 14,
  },
  stack: { flexDirection: "column", alignItems: "stretch" },
  title: { fontSize: 28, fontWeight: "800", color: C.dark },
  subtitle: { color: C.muted, fontSize: 13, marginTop: 5 },
  primary: {
    backgroundColor: C.orange,
    borderRadius: 9,
    paddingHorizontal: 16,
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    alignSelf: "flex-start",
  },
  primaryText: { color: C.white, fontWeight: "800", fontSize: 13 },
  stats: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  stat: {
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 12,
    padding: 16,
    flexGrow: 1,
    flexBasis: "25%",
    minWidth: 130,
  },
  statMobile: { flexBasis: "43%", minWidth: 115 },
  between: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 5,
  },
  muted: { color: C.muted, fontSize: 12, flexShrink: 1 },
  number: { fontSize: 28, fontWeight: "800", color: C.dark, marginTop: 13 },
  tabs: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  tab: {
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 8,
    backgroundColor: C.white,
    paddingHorizontal: 13,
    paddingVertical: 12,
  },
  tabActive: { borderColor: C.orange, backgroundColor: "#F9F0E8" },
  tabText: { fontSize: 12, color: C.muted, fontWeight: "700" },
  tabTextActive: { color: C.orange },
  toolbar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  search: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: C.white,
    borderRadius: 9,
    height: 44,
    flexGrow: 1,
    maxWidth: 520,
    minWidth: 0,
  },
  searchInput: { flex: 1, minWidth: 0, color: C.dark, fontSize: 13 },
  filters: { gap: 8, paddingBottom: 4 },
  chip: {
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 7,
    paddingHorizontal: 11,
    paddingVertical: 8,
    backgroundColor: C.white,
  },
  chipActive: { borderColor: C.orange, backgroundColor: "#F9F0E8" },
  chipText: { fontSize: 11, fontWeight: "700", color: C.muted },
  chipTextActive: { color: C.orange },
  cards: { flexDirection: "row", flexWrap: "wrap", gap: 14 },
  memberCard: {
    width: "48%",
    flexGrow: 1,
    minWidth: 260,
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 12,
    padding: 18,
    gap: 12,
  },
  memberCardMobile: { width: "100%", minWidth: 0 },
  personRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#E7DDD0",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { color: C.dark, fontSize: 15, fontWeight: "800" },
  memberName: { color: C.dark, fontSize: 15, fontWeight: "800" },
  badges: { flexDirection: "row", flexWrap: "wrap", gap: 7 },
  tag: {
    backgroundColor: "#F9F0E8",
    borderRadius: 6,
    paddingHorizontal: 9,
    paddingVertical: 6,
  },
  tagText: { color: C.orange, fontSize: 11, fontWeight: "700" },
  small: { color: C.muted, fontSize: 11 },
  empty: {
    backgroundColor: C.white,
    borderRadius: 10,
    padding: 30,
    width: "100%",
  },
  responsibilityList: {
    backgroundColor: C.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.border,
    padding: 18,
    gap: 12,
  },
  sectionTitle: { fontSize: 17, fontWeight: "800", color: C.dark },
  stageRow: {
    borderTopWidth: 1,
    borderTopColor: C.border,
    paddingTop: 16,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 14,
  },
  stageRowMobile: { flexDirection: "column" },
  stageName: {
    color: C.dark,
    fontWeight: "800",
    fontSize: 14,
    marginBottom: 5,
  },
  stagePeople: { flexDirection: "row", flexWrap: "wrap", gap: 7, flex: 2 },
  ownerChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#F9F0E8",
    borderRadius: 7,
    padding: 9,
  },
  ownerText: { color: C.orange, fontWeight: "700", fontSize: 11 },
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 12,
  },
  backdrop: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modal: {
    backgroundColor: C.white,
    borderRadius: 13,
    width: "100%",
    maxWidth: 590,
    maxHeight: "90%",
    overflow: "hidden",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 18,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  modalTitle: { color: C.dark, fontSize: 19, fontWeight: "800" },
  modalBody: { padding: 18, gap: 13 },
  label: { color: C.dark, fontSize: 12, fontWeight: "800" },
  field: { gap: 6 },
  input: {
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    minHeight: 43,
    fontSize: 13,
    color: C.dark,
  },
  multi: { minHeight: 85, textAlignVertical: "top", paddingTop: 10 },
  link: { color: C.orange, fontSize: 13, fontWeight: "700" },
  bodyText: { color: C.dark, fontSize: 13, lineHeight: 19 },
  checkbox: { flexDirection: "row", alignItems: "center", gap: 8 },
  error: { color: C.red, fontSize: 12 },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    flexWrap: "wrap",
    gap: 9,
    marginTop: 6,
  },
  secondary: {
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 9,
    minHeight: 44,
    paddingHorizontal: 15,
    justifyContent: "center",
  },
  secondaryText: { color: C.dark, fontWeight: "700", fontSize: 13 },
});
