import { Ionicons } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import {
  Alert,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View
} from "react-native";

type RequirementKind = "Task" | "Document" | "Approval";
type Requirement = {
  id: string;
  title: string;
  kind: RequirementKind;
  required: boolean;
};
type Stage = {
  id: string;
  name: string;
  description: string;
  requirements: Requirement[];
};
type Workflow = {
  id: string;
  name: string;
  description: string;
  category: string;
  active: boolean;
  stages: Stage[];
};
const C = {
  orange: "#C47B42",
  dark: "#26313A",
  muted: "#7B858D",
  border: "#E6E7E7",
  white: "#FFFFFF",
  bg: "#F5F2EC",
  green: "#3C936B",
  red: "#C45C55",
};
const uid = () => `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
const makeStage = (
  name: string,
  description = "",
  reqs: Array<[string, RequirementKind]> = [],
): Stage => ({
  id: uid(),
  name,
  description,
  requirements: reqs.map(([title, kind]) => ({
    id: uid(),
    title,
    kind,
    required: true,
  })),
});
const defaultStages = () => [
  makeStage("Acquisition", "Identify, underwrite, and secure the property", [
    ["Purchase agreement executed", "Document"],
    ["Acquisition approval", "Approval"],
  ]),
  makeStage("Due Diligence", "Validate site feasibility and risks", [
    ["Environmental Phase I assessment", "Document"],
    ["Title commitment reviewed", "Task"],
    ["ALTA survey uploaded", "Document"],
    ["Feasibility analysis approved", "Approval"],
  ]),
  makeStage("Entitlements", "Secure zoning and land-use approvals", [
    ["Zoning application submitted", "Task"],
    ["Municipal approval received", "Document"],
  ]),
  makeStage("Design & Planning", "Coordinate plans and consultants", [
    ["Architectural plans reviewed", "Approval"],
    ["Civil engineering plans", "Document"],
  ]),
  makeStage("Permitting", "Obtain required construction permits", [
    ["Building permit issued", "Document"],
  ]),
  makeStage("Construction", "Manage delivery and inspections", [
    ["Final inspection completed", "Task"],
  ]),
  makeStage("Closeout", "Complete handover and documentation", [
    ["Certificate of occupancy", "Document"],
    ["Final closeout approved", "Approval"],
  ]),
];
const initial: Workflow[] = [
  {
    id: "standard",
    name: "Standard Development",
    description:
      "A complete development lifecycle from acquisition through closeout.",
    category: "General",
    active: true,
    stages: defaultStages(),
  },
  {
    id: "commercial",
    name: "Commercial Development",
    description: "Commercial entitlements, tenant coordination, and delivery.",
    category: "Commercial",
    active: true,
    stages: [
      makeStage("Acquisition"),
      makeStage("Due Diligence"),
      makeStage("Entitlements"),
      makeStage("Design & Planning"),
      makeStage("Permitting"),
      makeStage("Tenant Coordination"),
      makeStage("Construction"),
      makeStage("Closeout"),
    ],
  },
  {
    id: "residential",
    name: "Residential Subdivision",
    description: "Land planning, platting, infrastructure, and lot delivery.",
    category: "Residential",
    active: true,
    stages: [
      makeStage("Land Acquisition"),
      makeStage("Feasibility"),
      makeStage("Concept Plan"),
      makeStage("Preliminary Plat"),
      makeStage("Final Plat"),
      makeStage("Engineering"),
      makeStage("Permits"),
      makeStage("Infrastructure"),
      makeStage("Closeout"),
    ],
  },
];
const kindIcon = (
  kind: RequirementKind,
): React.ComponentProps<typeof Ionicons>["name"] =>
  kind === "Task"
    ? "checkbox-outline"
    : kind === "Document"
      ? "document-text-outline"
      : "shield-checkmark-outline";
export default function WorkflowsWorkspace() {
  const { width } = useWindowDimensions();
  const mobile = width < 650;
  const [workflows, setWorkflows] = useState<Workflow[]>(initial);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [stageId, setStageId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newStage, setNewStage] = useState("");
  const [newRequirement, setNewRequirement] = useState("");
  const [requirementKind, setRequirementKind] =
    useState<RequirementKind>("Task");
  const [error, setError] = useState("");
  const selected = workflows.find((w) => w.id === selectedId) ?? null;
  const stage = selected?.stages.find((s) => s.id === stageId) ?? null;
  const filtered = useMemo(
    () =>
      workflows.filter((w) =>
        `${w.name} ${w.description} ${w.category}`
          .toLowerCase()
          .includes(search.toLowerCase().trim()),
      ),
    [workflows, search],
  );
  const update = (change: (w: Workflow) => Workflow) => {
    if (selectedId)
      setWorkflows((prev) =>
        prev.map((w) => (w.id === selectedId ? change(w) : w)),
      );
  };
  const updateStage = (change: (s: Stage) => Stage) =>
    update((w) => ({
      ...w,
      stages: w.stages.map((s) => (s.id === stageId ? change(s) : s)),
    }));
  const create = () => {
    if (!newName.trim()) {
      setError("Enter a workflow name.");
      return;
    }
    const id = uid();
    setWorkflows((prev) => [
      {
        id,
        name: newName.trim(),
        description: newDescription.trim(),
        category: "Custom",
        active: true,
        stages: [],
      },
      ...prev,
    ]);
    setSelectedId(id);
    setStageId(null);
    setCreating(false);
    setNewName("");
    setNewDescription("");
    setError("");
  };
  const duplicate = () => {
    if (!selected) return;
    const id = uid();
    const copy: Workflow = {
      ...selected,
      id,
      name: `${selected.name} (Copy)`,
      category: "Custom",
      stages: selected.stages.map((s) => ({
        ...s,
        id: uid(),
        requirements: s.requirements.map((r) => ({ ...r, id: uid() })),
      })),
    };
    setWorkflows((prev) => [copy, ...prev]);
    setSelectedId(id);
    setStageId(null);
  };
  const moveStage = (index: number, direction: number) =>
    update((w) => {
      const stages = [...w.stages];
      const target = index + direction;
      if (target < 0 || target >= stages.length) return w;
      [stages[index], stages[target]] = [stages[target], stages[index]];
      return { ...w, stages };
    });
  const removeStage = () => {
    if (!stage) return;
    const action = () => {
      update((w) => ({
        ...w,
        stages: w.stages.filter((s) => s.id !== stage.id),
      }));
      setStageId(null);
    };
    if (Platform.OS === "web") action();
    else
      Alert.alert(
        "Remove stage?",
        "This also removes its template requirements.",
        [
          { text: "Cancel" },
          { text: "Remove", style: "destructive", onPress: action },
        ],
      );
  };
  const addStage = () => {
    if (!newStage.trim()) return;
    const next = makeStage(newStage.trim());
    update((w) => ({ ...w, stages: [...w.stages, next] }));
    setStageId(next.id);
    setNewStage("");
  };
  const addRequirement = () => {
    if (!newRequirement.trim() || !stage) return;
    updateStage((s) => ({
      ...s,
      requirements: [
        ...s.requirements,
        {
          id: uid(),
          title: newRequirement.trim(),
          kind: requirementKind,
          required: true,
        },
      ],
    }));
    setNewRequirement("");
  };
  return (
    <View style={s.root}>
      <View style={[s.heading, mobile && s.wrap]}>
        <View style={{ flex: 1, minWidth: 220 }}>
          <Text style={s.eyebrow}>PROCESS MANAGEMENT</Text>
          <Text style={s.title}>Workflows</Text>
          <Text style={s.subtitle}>
            Define the stages, requirements, and approval gates that guide
            development.
          </Text>
        </View>
        <TouchableOpacity
          style={s.primary}
          onPress={() => {
            setError("");
            setCreating(true);
          }}
        >
          <Ionicons name="add" size={19} color="#FFF" />
          <Text style={s.primaryText}>New Workflow</Text>
        </TouchableOpacity>
      </View>
      {selected ? (
        <>
          <TouchableOpacity
            style={s.back}
            onPress={() => {
              setSelectedId(null);
              setStageId(null);
            }}
          >
            <Ionicons name="arrow-back" size={17} color={C.orange} />
            <Text style={s.backText}>All workflows</Text>
          </TouchableOpacity>
          <View style={s.panel}>
            <View style={[s.panelHeading, mobile && s.wrap]}>
              <View style={{ flex: 1, minWidth: 180 }}>
                <Text style={s.eyebrow}>WORKFLOW TEMPLATE</Text>
                <TextInput
                  accessibilityLabel="Workflow name"
                  style={s.nameInput}
                  value={selected.name}
                  onChangeText={(name) => update((w) => ({ ...w, name }))}
                />
                <TextInput
                  accessibilityLabel="Workflow description"
                  style={s.descriptionInput}
                  value={selected.description}
                  placeholder="Describe this workflow"
                  onChangeText={(description) =>
                    update((w) => ({ ...w, description }))
                  }
                />
              </View>
              <TouchableOpacity style={s.outline} onPress={duplicate}>
                <Ionicons name="copy-outline" size={17} color={C.dark} />
                <Text style={s.outlineText}>Duplicate</Text>
              </TouchableOpacity>
            </View>
            <View style={s.metaRow}>
              <Text style={s.muted}>
                {selected.stages.length} stages ·{" "}
                {selected.stages.reduce(
                  (n, st) => n + st.requirements.length,
                  0,
                )}{" "}
                requirements
              </Text>
              <TouchableOpacity
                onPress={() => update((w) => ({ ...w, active: !w.active }))}
                style={[
                  s.pill,
                  { backgroundColor: selected.active ? "#E8F5ED" : "#F1F1F1" },
                ]}
              >
                <Text
                  style={{
                    color: selected.active ? C.green : C.muted,
                    fontWeight: "700",
                    fontSize: 12,
                  }}
                >
                  {selected.active ? "Active" : "Inactive"} · Change
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={[s.editorLayout, mobile && s.editorMobile]}>
            <View style={[s.panel, s.stageColumn]}>
              <View style={s.panelHeading}>
                <View>
                  <Text style={s.sectionTitle}>Workflow stages</Text>
                  <Text style={s.muted}>
                    Select a stage to edit its requirements
                  </Text>
                </View>
              </View>
              {selected.stages.map((st, index) => (
                <View
                  key={st.id}
                  style={[s.stageRow, stageId === st.id && s.stageSelected]}
                >
                  <TouchableOpacity
                    style={{ flex: 1, minWidth: 0 }}
                    onPress={() => setStageId(st.id)}
                  >
                    <Text style={s.stageNumber}>STAGE {index + 1}</Text>
                    <Text style={s.stageName}>
                      {st.name || "Untitled stage"}
                    </Text>
                    <Text style={s.muted}>
                      {st.requirements.length} requirements
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    accessibilityLabel="Move stage up"
                    disabled={index === 0}
                    onPress={() => moveStage(index, -1)}
                    style={s.move}
                  >
                    <Ionicons
                      name="arrow-up"
                      size={17}
                      color={index === 0 ? "#CCD1D4" : C.muted}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    accessibilityLabel="Move stage down"
                    disabled={index === selected.stages.length - 1}
                    onPress={() => moveStage(index, 1)}
                    style={s.move}
                  >
                    <Ionicons
                      name="arrow-down"
                      size={17}
                      color={
                        index === selected.stages.length - 1
                          ? "#CCD1D4"
                          : C.muted
                      }
                    />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setStageId(st.id)}>
                    <Ionicons
                      name="chevron-forward"
                      size={18}
                      color={C.orange}
                    />
                  </TouchableOpacity>
                </View>
              ))}
              <View style={s.addRow}>
                <TextInput
                  style={[s.input, { flex: 1 }]}
                  placeholder="New stage name"
                  value={newStage}
                  onChangeText={setNewStage}
                />
                <TouchableOpacity style={s.smallPrimary} onPress={addStage}>
                  <Ionicons name="add" size={20} color="#FFF" />
                </TouchableOpacity>
              </View>
            </View>
            <View style={[s.panel, s.detailsColumn]}>
              {stage ? (
                <>
                  <View style={s.panelHeading}>
                    <View style={{ flex: 1 }}>
                      <Text style={s.eyebrow}>STAGE DETAILS</Text>
                      <Text style={s.sectionTitle}>Configure stage</Text>
                    </View>
                    <TouchableOpacity onPress={removeStage}>
                      <Ionicons name="trash-outline" size={20} color={C.red} />
                    </TouchableOpacity>
                  </View>
                  <View style={s.formBody}>
                    <Text style={s.label}>Stage name</Text>
                    <TextInput
                      style={s.input}
                      value={stage.name}
                      onChangeText={(name) =>
                        updateStage((st) => ({ ...st, name }))
                      }
                    />
                    <Text style={s.label}>Description</Text>
                    <TextInput
                      style={[
                        s.input,
                        { minHeight: 74, textAlignVertical: "top" },
                      ]}
                      multiline
                      value={stage.description}
                      placeholder="Purpose of this stage"
                      onChangeText={(description) =>
                        updateStage((st) => ({ ...st, description }))
                      }
                    />
                    <Text style={[s.sectionTitle, { marginTop: 12 }]}>
                      Stage requirements
                    </Text>
                    <Text style={s.muted}>
                      Define tasks, documents, and approvals for this stage.
                    </Text>
                    {stage.requirements.map((r) => (
                      <View key={r.id} style={s.reqRow}>
                        <Ionicons
                          name={kindIcon(r.kind)}
                          size={20}
                          color={C.orange}
                        />
                        <View style={{ flex: 1 }}>
                          <TextInput
                            style={s.reqTitle}
                            value={r.title}
                            onChangeText={(title) =>
                              updateStage((st) => ({
                                ...st,
                                requirements: st.requirements.map((x) =>
                                  x.id === r.id ? { ...x, title } : x,
                                ),
                              }))
                            }
                          />
                          <Text style={s.muted}>
                            {r.kind} · {r.required ? "Required" : "Optional"}
                          </Text>
                        </View>
                        <TouchableOpacity
                          onPress={() =>
                            updateStage((st) => ({
                              ...st,
                              requirements: st.requirements.map((x) =>
                                x.id === r.id
                                  ? { ...x, required: !x.required }
                                  : x,
                              ),
                            }))
                          }
                        >
                          <Ionicons
                            name={r.required ? "checkbox" : "square-outline"}
                            size={21}
                            color={r.required ? C.green : C.muted}
                          />
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() =>
                            updateStage((st) => ({
                              ...st,
                              requirements: st.requirements.filter(
                                (x) => x.id !== r.id,
                              ),
                            }))
                          }
                        >
                          <Ionicons name="close" size={19} color={C.muted} />
                        </TouchableOpacity>
                      </View>
                    ))}
                    <Text style={[s.label, { marginTop: 16 }]}>
                      Add requirement
                    </Text>
                    <TextInput
                      style={s.input}
                      placeholder="e.g. Site survey uploaded"
                      value={newRequirement}
                      onChangeText={setNewRequirement}
                    />
                    <View style={[s.addRow, s.wrap]}>
                      {(
                        ["Task", "Document", "Approval"] as RequirementKind[]
                      ).map((kind) => (
                        <TouchableOpacity
                          key={kind}
                          style={[
                            s.choice,
                            requirementKind === kind && s.choiceActive,
                          ]}
                          onPress={() => setRequirementKind(kind)}
                        >
                          <Text
                            style={[
                              s.choiceText,
                              requirementKind === kind && { color: C.orange },
                            ]}
                          >
                            {kind}
                          </Text>
                        </TouchableOpacity>
                      ))}
                      <TouchableOpacity
                        style={s.smallPrimary}
                        onPress={addRequirement}
                      >
                        <Ionicons name="add" size={19} color="#FFF" />
                        <Text style={s.primaryText}>Add</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </>
              ) : (
                <View style={s.empty}>
                  <Ionicons
                    name="git-branch-outline"
                    size={36}
                    color={C.orange}
                  />
                  <Text style={s.sectionTitle}>Select a stage</Text>
                  <Text style={s.muted}>
                    Choose a stage on the left or add a new one to configure its
                    requirements.
                  </Text>
                </View>
              )}
            </View>
          </View>
          <Text style={s.note}>
            Demo template editor: changes are stored in memory until you
            refresh. Templates are not yet assigned to projects, and these
            requirements do not enforce project approvals.
          </Text>
        </>
      ) : (
        <>
          <View style={s.stats}>
            {[
              {
                label: "Templates",
                value: workflows.length,
                icon: "layers-outline" as const,
              },
              {
                label: "Active templates",
                value: workflows.filter((w) => w.active).length,
                icon: "checkmark-circle-outline" as const,
              },
              {
                label: "Defined stages",
                value: workflows.reduce((n, w) => n + w.stages.length, 0),
                icon: "git-branch-outline" as const,
              },
            ].map((stat) => (
              <View
                key={stat.label}
                style={[s.stat, { width: mobile ? "100%" : "31.8%" }]}
              >
                <View style={s.statTop}>
                  <Text style={s.muted}>{stat.label}</Text>
                  <Ionicons name={stat.icon} size={20} color={C.orange} />
                </View>
                <Text style={s.statValue}>{stat.value}</Text>
              </View>
            ))}
          </View>
          <View style={s.panel}>
            <View style={s.panelHeading}>
              <Text style={s.sectionTitle}>Workflow templates</Text>
              <Text style={s.muted}>{filtered.length} templates</Text>
            </View>
            <View style={s.searchBox}>
              <Ionicons name="search-outline" size={19} color={C.muted} />
              <TextInput
                style={
                  {
                    flex: 1,
                    fontSize: 14,
                    color: C.dark,
                    outlineStyle: "none",
                  } as any
                }
                placeholder="Search workflows..."
                value={search}
                onChangeText={setSearch}
              />
            </View>
            {filtered.map((w) => (
              <TouchableOpacity
                key={w.id}
                style={s.templateRow}
                onPress={() => {
                  setSelectedId(w.id);
                  setStageId(w.stages[0]?.id ?? null);
                }}
              >
                <View style={s.templateIcon}>
                  <Ionicons
                    name="git-network-outline"
                    size={23}
                    color={C.orange}
                  />
                </View>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={s.templateName}>{w.name}</Text>
                  <Text style={s.muted}>{w.description}</Text>
                  <Text style={[s.muted, { marginTop: 7 }]}>
                    {w.stages.length} stages · {w.category}
                  </Text>
                </View>
                <View
                  style={[
                    s.pill,
                    { backgroundColor: w.active ? "#E8F5ED" : "#F1F1F1" },
                  ]}
                >
                  <Text
                    style={{
                      color: w.active ? C.green : C.muted,
                      fontSize: 11,
                      fontWeight: "700",
                    }}
                  >
                    {w.active ? "Active" : "Inactive"}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={C.muted} />
              </TouchableOpacity>
            ))}
            {filtered.length === 0 && (
              <View style={s.empty}>
                <Text style={s.muted}>No workflows match your search.</Text>
              </View>
            )}
          </View>
        </>
      )}
      <Modal
        visible={creating}
        transparent
        animationType="fade"
        onRequestClose={() => setCreating(false)}
      >
        <View style={s.modalOverlay}>
          <TouchableOpacity
            style={s.backdrop}
            onPress={() => setCreating(false)}
          />
          <View style={[s.modal, { width: mobile ? "94%" : 480 }]}>
            <View style={s.panelHeading}>
              <Text style={s.sectionTitle}>New workflow template</Text>
              <TouchableOpacity onPress={() => setCreating(false)}>
                <Ionicons name="close" size={23} color={C.dark} />
              </TouchableOpacity>
            </View>
            <View style={s.formBody}>
              <Text style={s.label}>Workflow name *</Text>
              <TextInput
                style={s.input}
                placeholder="e.g. Industrial Development"
                value={newName}
                onChangeText={setNewName}
              />
              <Text style={s.label}>Description</Text>
              <TextInput
                style={[s.input, { minHeight: 75, textAlignVertical: "top" }]}
                multiline
                placeholder="What process does this workflow cover?"
                value={newDescription}
                onChangeText={setNewDescription}
              />
              {!!error && <Text style={{ color: C.red }}>{error}</Text>}
              <TouchableOpacity
                style={[s.primary, { justifyContent: "center", marginTop: 12 }]}
                onPress={create}
              >
                <Text style={s.primaryText}>Create workflow</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
const s = StyleSheet.create({
  root: { gap: 22 },
  heading: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 18,
  },
  wrap: { flexWrap: "wrap" },
  eyebrow: {
    color: C.orange,
    fontSize: 10,
    letterSpacing: 1.6,
    fontWeight: "800",
    marginBottom: 8,
  },
  title: { color: C.dark, fontSize: 28, fontWeight: "800" },
  subtitle: { color: C.muted, fontSize: 13, marginTop: 7, lineHeight: 21 },
  primary: {
    backgroundColor: C.orange,
    borderRadius: 9,
    paddingHorizontal: 17,
    height: 42,
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  primaryText: { color: C.white, fontSize: 13, fontWeight: "800" },
  stats: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    justifyContent: "space-between",
  },
  stat: {
    backgroundColor: C.white,
    borderColor: C.border,
    borderWidth: 1,
    borderRadius: 12,
    padding: 20,
    minHeight: 120,
  },
  statTop: { flexDirection: "row", justifyContent: "space-between" },
  statValue: { fontSize: 30, fontWeight: "800", color: C.dark, marginTop: 19 },
  muted: { fontSize: 12, color: C.muted, lineHeight: 19 },
  panel: {
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 12,
    overflow: "hidden",
  },
  panelHeading: {
    padding: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 14,
  },
  sectionTitle: { fontSize: 17, fontWeight: "800", color: C.dark },
  searchBox: {
    marginHorizontal: 20,
    marginBottom: 10,
    height: 44,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 9,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  templateRow: {
    borderTopWidth: 1,
    borderTopColor: C.border,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 13,
  },
  templateIcon: {
    width: 46,
    height: 46,
    backgroundColor: "#F9F0E8",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  templateName: {
    fontSize: 15,
    fontWeight: "800",
    color: C.dark,
    marginBottom: 5,
  },
  pill: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 7 },
  back: { flexDirection: "row", alignItems: "center", gap: 7 },
  backText: { color: C.orange, fontWeight: "700", fontSize: 13 },
  nameInput: {
    color: C.dark,
    fontSize: 23,
    fontWeight: "800",
    paddingVertical: 4,
  },
  descriptionInput: { color: C.muted, fontSize: 13, paddingVertical: 6 },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 18,
  },
  outline: {
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  outlineText: { color: C.dark, fontWeight: "700", fontSize: 12 },
  editorLayout: { flexDirection: "row", gap: 16, alignItems: "flex-start" },
  editorMobile: { flexDirection: "column" },
  stageColumn: { width: "40%" },
  detailsColumn: { flex: 1, minWidth: 0 },
  stageRow: {
    paddingHorizontal: 17,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: C.border,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  stageSelected: {
    backgroundColor: "#FCF5EF",
    borderLeftWidth: 3,
    borderLeftColor: C.orange,
  },
  stageNumber: {
    color: C.orange,
    fontWeight: "800",
    fontSize: 10,
    letterSpacing: 1,
  },
  stageName: {
    fontSize: 14,
    fontWeight: "800",
    color: C.dark,
    marginVertical: 4,
  },
  move: { padding: 5 },
  addRow: { flexDirection: "row", alignItems: "center", gap: 8, padding: 14 },
  smallPrimary: {
    backgroundColor: C.orange,
    borderRadius: 8,
    minHeight: 40,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: C.dark,
    backgroundColor: C.white,
    minHeight: 43,
  },
  formBody: { padding: 20, paddingTop: 0, gap: 9 },
  label: { fontSize: 12, fontWeight: "700", color: C.dark, marginTop: 10 },
  reqRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  reqTitle: {
    color: C.dark,
    fontWeight: "700",
    fontSize: 13,
    paddingVertical: 4,
  },
  choice: {
    paddingHorizontal: 11,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 7,
  },
  choiceActive: { borderColor: C.orange, backgroundColor: "#FCF5EF" },
  choiceText: { color: C.muted, fontWeight: "700", fontSize: 12 },
  empty: { padding: 32, alignItems: "center", gap: 10 },
  note: { color: C.muted, fontSize: 12, lineHeight: 19 },
  modalOverlay: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  backdrop: { position: "absolute", top: 0, right: 0, bottom: 0, left: 0 },
  modal: {
    backgroundColor: C.white,
    borderRadius: 13,
    maxHeight: "90%",
    overflow: "hidden",
  },
});
