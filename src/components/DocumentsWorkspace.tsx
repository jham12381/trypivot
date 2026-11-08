import {
  DocumentStatus,
  ProjectDocument,
  useDocuments,
} from "@/context/DocumentsContext";
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
  useWindowDimensions,
  View,
} from "react-native";

const C = {
  orange: "#C47B42",
  dark: "#26313A",
  muted: "#7B858D",
  border: "#E6E7E7",
  white: "#FFFFFF",
  red: "#C45C55",
  green: "#3C936B",
};
const statuses: DocumentStatus[] = [
  "Draft",
  "Needs Review",
  "In Review",
  "Approved",
  "Archived",
];
const categories = [
  "General",
  "Environmental",
  "Survey",
  "Legal",
  "Plans",
  "Permits",
  "Construction",
  "Financial",
  "Other",
];
const blank = () => ({
  name: "",
  projectId: "",
  stage: stages[0],
  category: "General",
  status: "Draft" as DocumentStatus,
  uploadedBy: "Demo User",
  notes: "",
});
const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

export default function DocumentsWorkspace() {
  const { projects } = useProjects();
  const { documents, setDocuments } = useDocuments();
  const { width } = useWindowDimensions();
  const mobile = width < 680;
  const [search, setSearch] = useState("");
  const [projectFilter, setProjectFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("All");
  const [stageFilter, setStageFilter] = useState("All stages");
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState(blank);
  const [error, setError] = useState("");
  const projectName = (id: string) =>
    projects.find((p) => p.id === id)?.name ?? "Unknown project";
  const filtered = useMemo(
    () =>
      documents.filter((doc) => {
        const query = search.trim().toLowerCase();
        const name = projects.find((p) => p.id === doc.projectId)?.name ?? "";
        return (
          (projectFilter === "all" || doc.projectId === projectFilter) &&
          (statusFilter === "All" || doc.status === statusFilter) &&
          (stageFilter === "All stages" || doc.stage === stageFilter) &&
          (!query ||
            [
              doc.name,
              doc.category,
              doc.stage,
              doc.uploadedBy,
              doc.notes,
              name,
            ].some((value) => value.toLowerCase().includes(query)))
        );
      }),
    [documents, projects, search, projectFilter, statusFilter, stageFilter],
  );
  const openNew = () => {
    setEditing(null);
    setForm({
      ...blank(),
      projectId: projects[0]?.id ?? "",
      stage: projects[0] ? stages[projects[0].stageIndex] : stages[0],
    });
    setError("");
    setModal(true);
  };
  const openEdit = (doc: ProjectDocument) => {
    setEditing(doc.id);
    setForm({
      name: doc.name,
      projectId: doc.projectId,
      stage: doc.stage,
      category: doc.category,
      status: doc.status,
      uploadedBy: doc.uploadedBy,
      notes: doc.notes,
    });
    setError("");
    setModal(true);
  };
  const save = () => {
    if (!form.name.trim()) {
      setError("Enter a document filename.");
      return;
    }
    if (!projects.some((p) => p.id === form.projectId)) {
      setError("Select a project.");
      return;
    }
    const values = {
      name: form.name.trim(),
      projectId: form.projectId,
      stage: form.stage,
      category: form.category,
      status: form.status,
      uploadedBy: form.uploadedBy.trim() || "Demo User",
      notes: form.notes.trim(),
      updatedAt: today(),
    };
    setDocuments((prev) =>
      editing
        ? prev.map((d) => (d.id === editing ? { ...d, ...values } : d))
        : [
            { id: `${Date.now()}-${Math.random()}`, version: 1, ...values },
            ...prev,
          ],
    );
    setModal(false);
  };
  const updateStatus = (doc: ProjectDocument, status: DocumentStatus) =>
    setDocuments((prev) =>
      prev.map((d) =>
        d.id === doc.id ? { ...d, status, updatedAt: today() } : d,
      ),
    );
  const nextVersion = () => {
    if (!editing) return;
    setDocuments((prev) =>
      prev.map((d) =>
        d.id === editing
          ? {
              ...d,
              version: d.version + 1,
              status: "Draft",
              updatedAt: today(),
            }
          : d,
      ),
    );
    setModal(false);
  };
  const statItems = [
    {
      label: "Documents",
      value: documents.length,
      icon: "documents-outline" as const,
    },
    {
      label: "Needs Review",
      value: documents.filter(
        (d) => d.status === "Needs Review" || d.status === "In Review",
      ).length,
      icon: "time-outline" as const,
    },
    {
      label: "Approved",
      value: documents.filter((d) => d.status === "Approved").length,
      icon: "checkmark-circle-outline" as const,
    },
  ];
  return (
    <View style={s.root}>
      <View style={[s.heading, mobile && s.headingMobile]}>
        <View style={s.headingText}>
          <Text style={s.title}>Documents</Text>
          <Text style={s.subtitle}>
            Manage document records across your development projects.
          </Text>
        </View>
        <TouchableOpacity style={s.primary} onPress={openNew}>
          <Ionicons name="add" size={19} color="#FFF" />
          <Text style={s.primaryText}>Add Document</Text>
        </TouchableOpacity>
      </View>
      <View style={s.stats}>
        {statItems.map((stat) => (
          <View key={stat.label} style={[s.stat, mobile && s.statMobile]}>
            <View style={s.statTop}>
              <Text style={s.muted}>{stat.label}</Text>
              <Ionicons name={stat.icon} size={20} color={C.orange} />
            </View>
            <Text style={s.statNumber}>{stat.value}</Text>
          </View>
        ))}
      </View>
      <View style={s.panel}>
        <View style={[s.toolbar, mobile && s.toolbarMobile]}>
          <View style={[s.searchBox, mobile && s.searchMobile]}>
            <Ionicons name="search-outline" size={18} color={C.muted} />
            <TextInput
              style={s.searchInput}
              placeholder="Search documents or projects..."
              placeholderTextColor="#A1A9AE"
              value={search}
              onChangeText={setSearch}
            />
          </View>
          <Text style={s.muted}>{filtered.length} documents</Text>
        </View>
        <Text style={s.filterLabel}>PROJECT</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.filters}
        >
          {[{ id: "all", name: "All projects" }, ...projects].map((p) => (
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
        <Text style={s.filterLabel}>STATUS</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.filters}
        >
          {["All", ...statuses].map((status) => (
            <TouchableOpacity
              key={status}
              style={[s.chip, statusFilter === status && s.chipActive]}
              onPress={() => setStatusFilter(status)}
            >
              <Text
                style={[
                  s.chipText,
                  statusFilter === status && s.chipTextActive,
                ]}
              >
                {status}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <Text style={s.filterLabel}>STAGE</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.filters}
        >
          {["All stages", ...stages].map((stage) => (
            <TouchableOpacity
              key={stage}
              style={[s.chip, stageFilter === stage && s.chipActive]}
              onPress={() => setStageFilter(stage)}
            >
              <Text
                style={[s.chipText, stageFilter === stage && s.chipTextActive]}
              >
                {stage}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        {filtered.length === 0 ? (
          <View style={s.empty}>
            <Ionicons name="folder-open-outline" size={34} color={C.muted} />
            <Text style={s.docName}>No matching documents</Text>
            <Text style={s.muted}>Change your filters or add a document.</Text>
          </View>
        ) : (
          filtered.map((doc) => (
            <View key={doc.id} style={[s.docRow, mobile && s.docRowMobile]}>
              <View style={s.docIcon}>
                <Ionicons
                  name="document-text-outline"
                  size={22}
                  color={C.orange}
                />
              </View>
              <TouchableOpacity style={s.docInfo} onPress={() => openEdit(doc)}>
                <Text style={s.docName}>{doc.name}</Text>
                <Text style={s.docMeta}>
                  {projectName(doc.projectId)} · {doc.stage}
                </Text>
                <Text style={s.docMeta}>
                  {doc.category} · v{doc.version} · {doc.uploadedBy}
                </Text>
                <Text style={s.docMeta}>Updated {doc.updatedAt}</Text>
              </TouchableOpacity>
              <View style={[s.docActions, mobile && s.docActionsMobile]}>
                <View
                  style={[
                    s.badge,
                    doc.status === "Approved" && s.badgeApproved,
                  ]}
                >
                  <Text
                    style={[
                      s.badgeText,
                      doc.status === "Approved" && s.badgeTextApproved,
                    ]}
                  >
                    {doc.status}
                  </Text>
                </View>
                <TouchableOpacity
                  accessibilityLabel={`Edit ${doc.name}`}
                  style={s.edit}
                  onPress={() => openEdit(doc)}
                >
                  <Ionicons name="create-outline" size={20} color={C.orange} />
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </View>
      <Modal
        visible={modal}
        transparent
        animationType="fade"
        onRequestClose={() => setModal(false)}
      >
        <View style={s.overlay}>
          <TouchableOpacity
            style={s.backdrop}
            onPress={() => setModal(false)}
            activeOpacity={1}
          />
          <View style={[s.modal, mobile && s.modalMobile]}>
            <View style={s.modalHeader}>
              <Text style={s.modalTitle}>
                {editing ? "Document Details" : "Add Document Record"}
              </Text>
              <TouchableOpacity onPress={() => setModal(false)}>
                <Ionicons name="close" size={23} color={C.dark} />
              </TouchableOpacity>
            </View>
            <ScrollView
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={s.modalBody}
            >
              <Text style={s.hint}>
                This demo tracks document metadata only. No file is uploaded or
                stored.
              </Text>
              <Text style={s.label}>Filename *</Text>
              <TextInput
                style={s.input}
                value={form.name}
                onChangeText={(name) => setForm((p) => ({ ...p, name }))}
                placeholder="e.g. ALTA Survey.pdf"
              />
              <Text style={s.label}>Project *</Text>
              <View style={s.options}>
                {projects.map((p) => (
                  <TouchableOpacity
                    key={p.id}
                    style={[
                      s.option,
                      form.projectId === p.id && s.optionActive,
                    ]}
                    onPress={() =>
                      setForm((f) => ({
                        ...f,
                        projectId: p.id,
                        stage: stages[p.stageIndex],
                      }))
                    }
                  >
                    <Text style={s.optionText}>{p.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={s.label}>Workflow stage</Text>
              <View style={s.options}>
                {stages.map((stage) => (
                  <TouchableOpacity
                    key={stage}
                    style={[s.option, form.stage === stage && s.optionActive]}
                    onPress={() => setForm((f) => ({ ...f, stage }))}
                  >
                    <Text style={s.optionText}>{stage}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={s.label}>Category</Text>
              <View style={s.options}>
                {categories.map((category) => (
                  <TouchableOpacity
                    key={category}
                    style={[
                      s.option,
                      form.category === category && s.optionActive,
                    ]}
                    onPress={() => setForm((f) => ({ ...f, category }))}
                  >
                    <Text style={s.optionText}>{category}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={s.label}>Review status</Text>
              <View style={s.options}>
                {statuses.map((status) => (
                  <TouchableOpacity
                    key={status}
                    style={[s.option, form.status === status && s.optionActive]}
                    onPress={() => setForm((f) => ({ ...f, status }))}
                  >
                    <Text style={s.optionText}>{status}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={s.label}>Added by</Text>
              <TextInput
                style={s.input}
                value={form.uploadedBy}
                onChangeText={(uploadedBy) =>
                  setForm((f) => ({ ...f, uploadedBy }))
                }
              />
              <Text style={s.label}>Notes</Text>
              <TextInput
                multiline
                style={[s.input, s.notes]}
                value={form.notes}
                onChangeText={(notes) => setForm((f) => ({ ...f, notes }))}
                placeholder="Document description or review notes"
              />
              {editing && (
                <TouchableOpacity style={s.versionButton} onPress={nextVersion}>
                  <Ionicons
                    name="git-branch-outline"
                    size={17}
                    color={C.orange}
                  />
                  <Text style={s.versionText}>
                    Record a new version (metadata only)
                  </Text>
                </TouchableOpacity>
              )}
              {!!error && <Text style={s.error}>{error}</Text>}
              <View style={[s.modalActions, mobile && s.modalActionsMobile]}>
                <TouchableOpacity
                  style={s.cancel}
                  onPress={() => setModal(false)}
                >
                  <Text style={s.cancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={s.primary} onPress={save}>
                  <Text style={s.primaryText}>
                    {editing ? "Save Changes" : "Add Document"}
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
  root: { gap: 24, minWidth: 0 },
  heading: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
  },
  headingMobile: { flexDirection: "column", alignItems: "stretch" },
  headingText: { flexShrink: 1 },
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
  primaryText: { fontSize: 13, fontWeight: "800", color: C.white },
  stats: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  stat: {
    flexGrow: 1,
    flexBasis: "29%",
    minWidth: 145,
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 12,
    padding: 18,
  },
  statMobile: { flexBasis: "45%", minWidth: 0 },
  statTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  statNumber: { fontSize: 30, fontWeight: "800", color: C.dark, marginTop: 16 },
  muted: { fontSize: 12, color: C.muted },
  panel: {
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 12,
    overflow: "hidden",
    minWidth: 0,
  },
  toolbar: {
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  toolbarMobile: { flexDirection: "column", alignItems: "stretch" },
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
    minWidth: 0,
    maxWidth: 480,
    height: 44,
  },
  searchMobile: { flexGrow: 0, maxWidth: "100%", width: "100%" },
  searchInput: { flex: 1, minWidth: 0, fontSize: 13, color: C.dark },
  filterLabel: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.3,
    color: "#9AA4AB",
    marginHorizontal: 20,
    marginBottom: 9,
  },
  filters: {
    gap: 8,
    paddingHorizontal: 20,
    paddingBottom: 15,
    alignItems: "center",
  },
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
  docRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderTopWidth: 1,
    borderTopColor: C.border,
    minWidth: 0,
  },
  docRowMobile: {
    flexDirection: "column",
    alignItems: "stretch",
    gap: 10,
    paddingHorizontal: 16,
  },
  docIcon: {
    width: 42,
    height: 42,
    borderRadius: 10,
    backgroundColor: "#F9F0E8",
    alignItems: "center",
    justifyContent: "center",
  },
  docInfo: { flex: 1, minWidth: 0 },
  docName: { fontSize: 14, fontWeight: "800", color: C.dark },
  docMeta: { fontSize: 12, color: C.muted, marginTop: 5 },
  docActions: { flexDirection: "row", alignItems: "center", gap: 10 },
  docActionsMobile: { alignSelf: "stretch", justifyContent: "space-between" },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 7,
    backgroundColor: "#F9F0E8",
    borderWidth: 1,
    borderColor: "#EED4BF",
  },
  badgeApproved: { backgroundColor: "#EAF5EE", borderColor: "#C9E5D4" },
  badgeText: { fontSize: 11, fontWeight: "700", color: C.orange },
  badgeTextApproved: { color: C.green },
  edit: { padding: 8 },
  empty: { padding: 38, alignItems: "center", gap: 12 },
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
    maxWidth: 590,
    maxHeight: "90%",
    backgroundColor: C.white,
    borderRadius: 14,
    overflow: "hidden",
  },
  modalMobile: { width: "96%" },
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
  hint: { fontSize: 12, color: C.muted, lineHeight: 19 },
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
  notes: { height: 85, textAlignVertical: "top", paddingTop: 10 },
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
  versionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 10,
  },
  versionText: { color: C.orange, fontSize: 12, fontWeight: "700" },
  error: { color: C.red, fontSize: 12, fontWeight: "700" },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 15,
  },
  modalActionsMobile: { flexWrap: "wrap" },
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
