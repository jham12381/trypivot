import { stages, useProjects, type Project } from "@/context/ProjectsContext";
import { Ionicons } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    useWindowDimensions,
    View,
} from "react-native";

type Role = "executive" | "acquisitions" | "construction" | "coordinator";
type Props = { onNavigate: (page: string) => void };
type IconName = React.ComponentProps<typeof Ionicons>["name"];
type Metric = {
  label: string;
  value: string | number;
  subtitle: string;
  icon: IconName;
};
type Attention = {
  id: string;
  title: string;
  detail: string;
  priority: "high" | "medium" | "normal";
};

const C = {
  orange: "#C47B42",
  orangeLight: "#FAF0E7",
  dark: "#26313A",
  muted: "#7B858D",
  border: "#E6E7E7",
  white: "#FFFFFF",
  green: "#3C936B",
  red: "#C45C55",
  background: "#F5F2EC",
  pale: "#F8F9F9",
  blue: "#5686A3",
};
const ROLES: {
  id: Role;
  label: string;
  person: string;
  description: string;
}[] = [
  {
    id: "executive",
    label: "Owner / President",
    person: "Johnny",
    description: "Portfolio performance, strategic risks, and decisions.",
  },
  {
    id: "acquisitions",
    label: "Acquisitions",
    person: "Jordan",
    description: "Pipeline value, deal momentum, and opportunities.",
  },
  {
    id: "construction",
    label: "Construction",
    person: "Alison",
    description: "Delivery progress, workflow stages, and blockers.",
  },
  {
    id: "coordinator",
    label: "Project Coordinator",
    person: "Kyle",
    description: "Your assigned work and immediate priorities.",
  },
];
const PEOPLE: Record<Role, string> = {
  executive: "Johnny Ham",
  acquisitions: "Jordan Nolen",
  construction: "Alison Owens",
  coordinator: "Kyle Grey",
};
const getStage = (p: Project) => stages[p.stageIndex] ?? "Unknown";
const openTasks = (p: Project) => p.tasks.filter((t) => t.status !== "Done");
const money = (v: number) => `$${v.toFixed(1)}M`;

// Illustrative financial data. These values are NOT derived from project records.
const EXEC_TREND = [132, 139, 145, 151, 160, 171, 184];
const EXEC_MONTHS = ["May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov"];
const DEAL_PHASES = [
  { label: "Prospecting", value: 12.5 },
  { label: "Evaluation", value: 9.8 },
  { label: "Under Contract", value: 14.2 },
  { label: "Due Diligence", value: 6.3 },
];
// Illustrative physical construction progress, separate from workflow stage.
const SITE_PROGRESS = [
  { name: "Central Plaza", progress: 68 },
  { name: "North Tower", progress: 84 },
  { name: "Riverfront Development", progress: 42 },
  { name: "Westgate Industrial", progress: 91 },
];

function Panel({
  title,
  subtitle,
  children,
  right,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  right?: React.ReactNode;
}) {
  return (
    <View style={s.panel}>
      <View style={s.panelHeader}>
        <View style={{ flex: 1 }}>
          <Text style={s.panelTitle}>{title}</Text>
          {subtitle ? <Text style={s.panelSubtitle}>{subtitle}</Text> : null}
        </View>
        {right}
      </View>
      {children}
    </View>
  );
}

function MetricCards({
  metrics,
  mobile,
  compact,
}: {
  metrics: Metric[];
  mobile: boolean;
  compact: boolean;
}) {
  return (
    <View style={s.metrics}>
      {metrics.map((m) => (
        <View
          key={m.label}
          style={[
            s.metricCard,
            {
              width: mobile ? "48%" : compact ? "48.5%" : "23.7%",
              minWidth: 0,
            },
          ]}
        >
          <View style={s.metricHeader}>
            <Text style={s.metricLabel}>{m.label}</Text>
            <Ionicons name={m.icon} size={20} color={C.orange} />
          </View>
          <Text style={s.metricValue}>{m.value}</Text>
          <Text style={s.metricSubtitle}>{m.subtitle}</Text>
        </View>
      ))}
    </View>
  );
}

function ProgressBar({
  value,
  color = C.orange,
}: {
  value: number;
  color?: string;
}) {
  return (
    <View style={s.progressTrack}>
      <View
        style={[
          s.progressFill,
          {
            width: `${Math.max(0, Math.min(100, value))}%`,
            backgroundColor: color,
          },
        ]}
      />
    </View>
  );
}

function AttentionList({
  items,
  emptyText = "Nothing requires attention right now.",
}: {
  items: Attention[];
  emptyText?: string;
}) {
  if (!items.length) return <Text style={s.empty}>{emptyText}</Text>;
  return (
    <View>
      {items.slice(0, 6).map((item) => (
        <View key={item.id} style={s.listRow}>
          <View
            style={[
              s.priorityStrip,
              {
                backgroundColor:
                  item.priority === "high"
                    ? C.red
                    : item.priority === "medium"
                      ? C.orange
                      : C.green,
              },
            ]}
          />
          <View style={{ flex: 1 }}>
            <Text style={s.itemTitle}>{item.title}</Text>
            <Text style={s.itemDescription}>{item.detail}</Text>
          </View>
          {item.priority === "high" ? (
            <Text style={s.highText}>HIGH</Text>
          ) : null}
        </View>
      ))}
    </View>
  );
}

function ActionLink({
  label,
  onPress,
}: {
  label: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={s.actionLink} onPress={onPress}>
      <Text style={s.actionText}>{label}</Text>
      <Ionicons name="arrow-forward" size={16} color={C.orange} />
    </TouchableOpacity>
  );
}

function ExecutiveTrend() {
  const min = 120;
  const max = 190;
  return (
    <View style={s.chartBody}>
      <View style={s.chartHeadline}>
        <Text style={s.chartBig}>$184.0M</Text>
        <Text style={s.chartPositive}>+39.4% since May</Text>
      </View>
      <View style={s.barChart}>
        {EXEC_TREND.map((value, index) => (
          <View key={EXEC_MONTHS[index]} style={s.barColumn}>
            <Text style={s.barValue}>{value}</Text>
            <View style={s.barSpace}>
              <View
                style={[
                  s.bar,
                  {
                    height: `${((value - min) / (max - min)) * 80 + 20}%`,
                    backgroundColor:
                      index === EXEC_TREND.length - 1 ? C.orange : "#DCC0A9",
                  },
                ]}
              />
            </View>
            <Text style={s.barLabel}>{EXEC_MONTHS[index]}</Text>
          </View>
        ))}
      </View>
      <Text style={s.demoCaption}>
        Illustrative portfolio value trend · USD millions
      </Text>
    </View>
  );
}

function StageDistribution({ projects }: { projects: Project[] }) {
  const counts = stages.map((stage, i) => ({
    stage,
    count: projects.filter((p) => p.stageIndex === i).length,
  }));
  const max = Math.max(1, ...counts.map((item) => item.count));
  return (
    <View style={s.chartBody}>
      {counts.map((item) => (
        <View key={item.stage} style={s.horizontalBarRow}>
          <Text style={s.horizontalLabel} numberOfLines={1}>
            {item.stage}
          </Text>
          <View style={{ flex: 1 }}>
            <ProgressBar value={(item.count / max) * 100} />
          </View>
          <Text style={s.horizontalValue}>{item.count}</Text>
        </View>
      ))}
      <Text style={s.demoCaption}>Live counts from your project workspace</Text>
    </View>
  );
}

function DealValueChart() {
  const max = Math.max(...DEAL_PHASES.map((d) => d.value));
  return (
    <View style={s.chartBody}>
      {DEAL_PHASES.map((deal) => (
        <View key={deal.label} style={s.dealRow}>
          <View style={s.dealTop}>
            <Text style={s.itemTitle}>{deal.label}</Text>
            <Text style={s.dealAmount}>{money(deal.value)}</Text>
          </View>
          <ProgressBar value={(deal.value / max) * 100} color={C.blue} />
        </View>
      ))}
      <Text style={s.demoCaption}>
        Illustrative pipeline value by deal phase · USD millions
      </Text>
    </View>
  );
}

function ConstructionProgress() {
  return (
    <View style={s.chartBody}>
      {SITE_PROGRESS.map((site) => (
        <View key={site.name} style={s.dealRow}>
          <View style={s.dealTop}>
            <Text style={s.itemTitle}>{site.name}</Text>
            <Text style={s.dealAmount}>{site.progress}%</Text>
          </View>
          <ProgressBar
            value={site.progress}
            color={site.progress < 50 ? C.orange : C.green}
          />
        </View>
      ))}
      <Text style={s.demoCaption}>
        Illustrative physical completion percentages, not workflow completion
      </Text>
    </View>
  );
}

export default function PersonalizedDashboard({ onNavigate }: Props) {
  const { projects } = useProjects();
  const { width } = useWindowDimensions();
  const [role, setRole] = useState<Role>("executive");
  const compact = width < 1100;
  const mobile = width < 650;
  const info = ROLES.find((r) => r.id === role)!;
  const person = PEOPLE[role];

  const assignedTasks = useMemo(
    () =>
      projects.flatMap((p) =>
        p.tasks
          .filter((t) => t.assignee === person && t.status !== "Done")
          .map((t) => ({ ...t, projectName: p.name, projectId: p.id })),
      ),
    [projects, person],
  );

  const relevantProjects = useMemo(
    () =>
      projects.filter((p) => {
        if (role === "executive") return true;
        if (role === "acquisitions")
          return p.stageIndex <= 1 || p.manager === person;
        if (role === "construction")
          return p.stageIndex >= 5 || p.manager === person;
        return (
          p.manager === person || p.tasks.some((t) => t.assignee === person)
        );
      }),
    [projects, role, person],
  );

  const blocked = projects.filter((p) => p.status === "Blocked");
  const reviews = projects.filter((p) => p.status === "Needs Review");
  const allOpenTasks = projects.reduce((n, p) => n + openTasks(p).length, 0);
  const relevantOpenTasks = relevantProjects.reduce(
    (n, p) => n + openTasks(p).length,
    0,
  );

  const attention = useMemo((): Attention[] => {
    const items: Attention[] = [];
    if (role === "executive" || role === "construction") {
      (role === "executive" ? projects : relevantProjects).forEach((p) => {
        if (p.status === "Blocked")
          items.push({
            id: `blocked-${p.id}`,
            title: p.name,
            detail: `${getStage(p)} is blocked and needs intervention`,
            priority: "high",
          });
        if (p.status === "Needs Review")
          items.push({
            id: `review-${p.id}`,
            title: p.name,
            detail: `${getStage(p)} is awaiting approval`,
            priority: "medium",
          });
      });
      if (role === "construction")
        relevantProjects.forEach((p) =>
          openTasks(p).forEach((t) =>
            items.push({
              id: `task-${p.id}-${t.id}`,
              title: t.title,
              detail: `${p.name} · ${t.assignee}`,
              priority: "normal",
            }),
          ),
        );
    } else {
      assignedTasks.forEach((t) =>
        items.push({
          id: `task-${t.projectId}-${t.id}`,
          title: t.title,
          detail: `${t.projectName} · ${t.status}`,
          priority: t.priority === "High" ? "high" : "normal",
        }),
      );
      relevantProjects
        .filter((p) => p.status === "Needs Review")
        .forEach((p) =>
          items.push({
            id: `review-${p.id}`,
            title: p.name,
            detail: `${getStage(p)} is awaiting approval`,
            priority: "medium",
          }),
        );
    }
    const priority = { high: 0, medium: 1, normal: 2 };
    return items.sort((a, b) => priority[a.priority] - priority[b.priority]);
  }, [role, projects, relevantProjects, assignedTasks]);

  const metrics: Metric[] =
    role === "executive"
      ? [
          {
            label: "Portfolio Value",
            value: "$184.0M",
            subtitle: "Illustrative demo value",
            icon: "trending-up-outline",
          },
          {
            label: "Active Projects",
            value: projects.filter((p) => p.status !== "Completed").length,
            subtitle: "Live workspace count",
            icon: "business-outline",
          },
          {
            label: "Awaiting Approval",
            value: reviews.length,
            subtitle: "Pending decisions",
            icon: "time-outline",
          },
          {
            label: "Blocked Projects",
            value: blocked.length,
            subtitle: "Require intervention",
            icon: "alert-circle-outline",
          },
        ]
      : role === "acquisitions"
        ? [
            {
              label: "Pipeline Value",
              value: "$42.8M",
              subtitle: "Illustrative demo value",
              icon: "cash-outline",
            },
            {
              label: "Projected Revenue",
              value: "$68.5M",
              subtitle: "Illustrative, not profit",
              icon: "trending-up-outline",
            },
            {
              label: "Pipeline Projects",
              value: relevantProjects.length,
              subtitle: "Live relevant projects",
              icon: "business-outline",
            },
            {
              label: "My Open Tasks",
              value: assignedTasks.length,
              subtitle: "Assigned to you",
              icon: "checkbox-outline",
            },
          ]
        : role === "construction"
          ? [
              {
                label: "Construction Projects",
                value: relevantProjects.length,
                subtitle: "Construction / assigned",
                icon: "construct-outline",
              },
              {
                label: "Blocked Projects",
                value: relevantProjects.filter((p) => p.status === "Blocked")
                  .length,
                subtitle: "Need resolution",
                icon: "warning-outline",
              },
              {
                label: "Open Tasks",
                value: relevantOpenTasks,
                subtitle: "Relevant projects",
                icon: "checkbox-outline",
              },
              {
                label: "My Assignments",
                value: assignedTasks.length,
                subtitle: "Outstanding work",
                icon: "person-outline",
              },
            ]
          : [
              {
                label: "My Open Tasks",
                value: assignedTasks.length,
                subtitle: "Assigned to you",
                icon: "checkbox-outline",
              },
              {
                label: "My Projects",
                value: relevantProjects.length,
                subtitle: "Managed or assigned",
                icon: "business-outline",
              },
              {
                label: "In Progress",
                value: assignedTasks.filter((t) => t.status === "In Progress")
                  .length,
                subtitle: "Tasks underway",
                icon: "refresh-outline",
              },
              {
                label: "To Do",
                value: assignedTasks.filter((t) => t.status === "To Do").length,
                subtitle: "Not started",
                icon: "list-outline",
              },
            ];

  // Explicit dimensions prevent React Native Web flex children from overlapping
  // when the two-column dashboard collapses on narrow screens.
  const columns = [s.columns, compact && s.columnsCompact];
  const columnPanel = compact ? s.fullWidth : s.columnPanel;

  return (
    <View style={s.root}>
      <View style={[s.heading, mobile && s.headingMobile]}>
        <View
          style={{ flex: 1, minWidth: 0, width: mobile ? "100%" : undefined }}
        >
          <Text style={s.eyebrow}>
            {role === "executive"
              ? "EXECUTIVE INTELLIGENCE"
              : role === "acquisitions"
                ? "DEAL INTELLIGENCE"
                : role === "construction"
                  ? "CONSTRUCTION OPERATIONS"
                  : "YOUR WORKSPACE"}
          </Text>
          <Text style={s.title}>Good morning, {info.person}.</Text>
          <Text style={s.subtitle}>{info.description}</Text>
        </View>
        <View style={[s.rolePicker, mobile && s.rolePickerMobile]}>
          <Text style={s.roleLabel}>DEMO · VIEW AS</Text>
          <View style={s.roleOptions}>
            {ROLES.map((r) => (
              <TouchableOpacity
                key={r.id}
                onPress={() => setRole(r.id)}
                style={[s.roleOption, role === r.id && s.roleOptionActive]}
              >
                <Text
                  style={[
                    s.roleOptionText,
                    role === r.id && s.roleOptionTextActive,
                  ]}
                >
                  {r.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      <MetricCards metrics={metrics} mobile={mobile} compact={compact} />

      {role === "executive" ? (
        <>
          <View style={columns}>
            <View style={columnPanel}>
              <Panel
                title="Portfolio Value Trend"
                subtitle="Illustrative growth over seven months"
              >
                <ExecutiveTrend />
              </Panel>
            </View>
            <View style={columnPanel}>
              <Panel
                title="Projects by Development Stage"
                subtitle="Live stage distribution"
              >
                <StageDistribution projects={projects} />
              </Panel>
            </View>
          </View>
          <View style={columns}>
            <View style={columnPanel}>
              <Panel
                title="Leadership Attention"
                subtitle="Approvals and risks requiring decisions"
              >
                <AttentionList items={attention} />
              </Panel>
            </View>
            <View style={columnPanel}>
              <Panel
                title="Portfolio Operating Snapshot"
                subtitle="Calculated from workspace projects"
              >
                <View style={s.snapshotRow}>
                  <Text style={s.snapshotLabel}>
                    Open tasks across portfolio
                  </Text>
                  <Text style={s.snapshotValue}>{allOpenTasks}</Text>
                </View>
                <View style={s.snapshotRow}>
                  <Text style={s.snapshotLabel}>Projects awaiting review</Text>
                  <Text style={s.snapshotValue}>{reviews.length}</Text>
                </View>
                <View style={s.snapshotRow}>
                  <Text style={s.snapshotLabel}>Completed projects</Text>
                  <Text style={s.snapshotValue}>
                    {projects.filter((p) => p.status === "Completed").length}
                  </Text>
                </View>
                <ActionLink
                  label="Explore all projects"
                  onPress={() => onNavigate("Projects")}
                />
              </Panel>
            </View>
          </View>
        </>
      ) : role === "acquisitions" ? (
        <>
          <View style={columns}>
            <View style={columnPanel}>
              <Panel
                title="Deal Value by Pipeline Phase"
                subtitle="Illustrative acquisition opportunity"
              >
                <DealValueChart />
              </Panel>
            </View>
            <View style={columnPanel}>
              <Panel
                title="Pipeline Health"
                subtitle="Live projects in your early-stage pipeline"
              >
                <View style={s.snapshotRow}>
                  <Text style={s.snapshotLabel}>Projects in Acquisition</Text>
                  <Text style={s.snapshotValue}>
                    {relevantProjects.filter((p) => p.stageIndex === 0).length}
                  </Text>
                </View>
                <View style={s.snapshotRow}>
                  <Text style={s.snapshotLabel}>Projects in Due Diligence</Text>
                  <Text style={s.snapshotValue}>
                    {relevantProjects.filter((p) => p.stageIndex === 1).length}
                  </Text>
                </View>
                <View style={s.snapshotRow}>
                  <Text style={s.snapshotLabel}>Awaiting stage approval</Text>
                  <Text style={s.snapshotValue}>
                    {
                      relevantProjects.filter(
                        (p) => p.status === "Needs Review",
                      ).length
                    }
                  </Text>
                </View>
                <View style={s.snapshotRow}>
                  <Text style={s.snapshotLabel}>Open pipeline tasks</Text>
                  <Text style={s.snapshotValue}>{relevantOpenTasks}</Text>
                </View>
              </Panel>
            </View>
          </View>
          <View style={columns}>
            <View style={columnPanel}>
              <Panel
                title="Deals Requiring Action"
                subtitle="Your assigned tasks and pending reviews"
              >
                <AttentionList items={attention} />
              </Panel>
            </View>
            <View style={columnPanel}>
              <Panel
                title="Active Deal Pipeline"
                subtitle="Relevant projects from your workspace"
              >
                {relevantProjects.length ? (
                  relevantProjects.slice(0, 6).map((p) => (
                    <View key={p.id} style={s.listRow}>
                      <Ionicons
                        name="business-outline"
                        size={18}
                        color={C.orange}
                      />
                      <View style={{ flex: 1 }}>
                        <Text style={s.itemTitle}>{p.name}</Text>
                        <Text style={s.itemDescription}>
                          {getStage(p)} · {p.status}
                        </Text>
                      </View>
                    </View>
                  ))
                ) : (
                  <Text style={s.empty}>No relevant pipeline projects.</Text>
                )}
                <ActionLink
                  label="View all projects"
                  onPress={() => onNavigate("Projects")}
                />
              </Panel>
            </View>
          </View>
        </>
      ) : role === "construction" ? (
        <>
          <View style={columns}>
            <View style={columnPanel}>
              <Panel
                title="Construction Completion"
                subtitle="Illustrative physical progress by site"
              >
                <ConstructionProgress />
              </Panel>
            </View>
            <View style={columnPanel}>
              <Panel
                title="Development Workflow Stages"
                subtitle="Actual project stage from workspace"
              >
                <StageDistribution projects={relevantProjects} />
              </Panel>
            </View>
          </View>
          <View style={columns}>
            <View style={columnPanel}>
              <Panel
                title="Blockers & Outstanding Work"
                subtitle="Operational items needing follow-up"
              >
                <AttentionList items={attention} />
              </Panel>
            </View>
            <View style={columnPanel}>
              <Panel
                title="Project Delivery Status"
                subtitle="Live construction-stage and assigned projects"
              >
                {relevantProjects.length ? (
                  relevantProjects.map((p) => (
                    <View key={p.id} style={s.listRow}>
                      <Ionicons
                        name={
                          p.status === "Blocked"
                            ? "warning-outline"
                            : "construct-outline"
                        }
                        size={19}
                        color={p.status === "Blocked" ? C.red : C.orange}
                      />
                      <View style={{ flex: 1 }}>
                        <Text style={s.itemTitle}>{p.name}</Text>
                        <Text style={s.itemDescription}>
                          {getStage(p)} · {openTasks(p).length} open tasks ·{" "}
                          {p.status}
                        </Text>
                      </View>
                    </View>
                  ))
                ) : (
                  <Text style={s.empty}>
                    No relevant construction projects.
                  </Text>
                )}
                <ActionLink
                  label="Open project workspace"
                  onPress={() => onNavigate("Projects")}
                />
              </Panel>
            </View>
          </View>
        </>
      ) : (
        <>
          <View style={columns}>
            <View style={columnPanel}>
              <Panel
                title="Needs Your Attention"
                subtitle="Prioritized for your assignments"
              >
                <AttentionList items={attention} />
              </Panel>
            </View>
            <View style={columnPanel}>
              <Panel
                title="My Priorities"
                subtitle="Your outstanding assignments"
              >
                {assignedTasks.length ? (
                  assignedTasks.slice(0, 5).map((t) => (
                    <View key={`${t.projectId}-${t.id}`} style={s.listRow}>
                      <Ionicons
                        name={
                          t.status === "In Progress"
                            ? "time-outline"
                            : "ellipse-outline"
                        }
                        size={19}
                        color={C.orange}
                      />
                      <View style={{ flex: 1 }}>
                        <Text style={s.itemTitle}>{t.title}</Text>
                        <Text style={s.itemDescription}>
                          {t.projectName} · {t.status}
                        </Text>
                      </View>
                    </View>
                  ))
                ) : (
                  <Text style={s.empty}>
                    No outstanding tasks assigned to you.
                  </Text>
                )}
                <ActionLink
                  label="View all tasks"
                  onPress={() => onNavigate("My Tasks")}
                />
              </Panel>
            </View>
          </View>
          <Panel
            title="Projects Relevant to You"
            subtitle="Based on your assignments"
          >
            {relevantProjects.length ? (
              relevantProjects.map((p) => (
                <View key={p.id} style={s.listRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={s.itemTitle}>{p.name}</Text>
                    <Text style={s.itemDescription}>
                      {p.code} · {getStage(p)}
                    </Text>
                  </View>
                  <Text style={s.projectStatus}>{p.status}</Text>
                </View>
              ))
            ) : (
              <Text style={s.empty}>No projects match your assignments.</Text>
            )}
            <ActionLink
              label="View all projects"
              onPress={() => onNavigate("Projects")}
            />
          </Panel>
        </>
      )}

      <Text style={s.demoFootnote}>
        Demo role selection · Project and task counts reflect the in-memory
        workspace. Financial figures, trends, and physical construction progress
        are illustrative. Authentication and role permissions are not connected.
      </Text>
    </View>
  );
}

const s = StyleSheet.create({
  root: { gap: 22, width: "100%", minWidth: 0 },
  heading: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 20,
  },
  headingMobile: { flexDirection: "column" },
  eyebrow: {
    color: C.orange,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.5,
    marginBottom: 9,
  },
  title: { color: C.dark, fontSize: 27, fontWeight: "800" },
  subtitle: { color: C.muted, fontSize: 13, marginTop: 8, lineHeight: 20 },
  rolePicker: { maxWidth: 520, width: "100%", flexShrink: 1 },
  rolePickerMobile: { maxWidth: undefined, flexShrink: 0 },
  roleLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: C.muted,
    letterSpacing: 1,
    marginBottom: 9,
  },
  roleOptions: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  roleOption: {
    paddingHorizontal: 11,
    paddingVertical: 9,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: C.white,
  },
  roleOptionActive: { backgroundColor: C.orangeLight, borderColor: C.orange },
  roleOptionText: { fontSize: 11, fontWeight: "600", color: C.muted },
  roleOptionTextActive: { color: C.orange, fontWeight: "800" },
  metrics: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 12,
  },
  metricCard: {
    minWidth: 0,
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 12,
    padding: 14,
    minHeight: 135,
  },
  metricHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  metricLabel: {
    color: C.muted,
    fontSize: 12,
    fontWeight: "600",
    flexShrink: 1,
  },
  metricValue: {
    fontSize: 27,
    fontWeight: "800",
    color: C.dark,
    marginTop: 14,
  },
  metricSubtitle: { fontSize: 11, color: C.muted, marginTop: 6 },
  columns: {
    flexDirection: "row",
    gap: 18,
    alignItems: "stretch",
    width: "100%",
    minWidth: 0,
  },
  columnsCompact: { flexDirection: "column", alignItems: "stretch" },
  columnPanel: { flex: 1, minWidth: 0 },
  fullWidth: {
    width: "100%",
    flexGrow: 0,
    flexShrink: 0,
    flexBasis: "auto",
    minWidth: 0,
    alignSelf: "stretch",
  },
  panel: {
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 12,
    overflow: "hidden",
    width: "100%",
    minWidth: 0,
  },
  panelHeader: {
    padding: 21,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  panelTitle: { fontSize: 16, fontWeight: "800", color: C.dark },
  panelSubtitle: { fontSize: 12, color: C.muted, marginTop: 5 },
  chartBody: {
    paddingHorizontal: 16,
    paddingBottom: 21,
    gap: 14,
    width: "100%",
    minWidth: 0,
  },
  chartHeadline: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
  },
  chartBig: { color: C.dark, fontSize: 27, fontWeight: "800" },
  chartPositive: { color: C.green, fontSize: 12, fontWeight: "700" },
  barChart: {
    flexDirection: "row",
    alignItems: "flex-end",
    height: 190,
    width: "100%",
    gap: 4,
  },
  barColumn: {
    flex: 1,
    minWidth: 0,
    height: 190,
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 6,
  },
  barSpace: {
    width: "100%",
    height: 145,
    justifyContent: "flex-end",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  bar: {
    width: "75%",
    maxWidth: 46,
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
  },
  barValue: { fontSize: 10, fontWeight: "700", color: C.dark },
  barLabel: { fontSize: 10, color: C.muted },
  demoCaption: { color: C.muted, fontSize: 10, lineHeight: 16, marginTop: 4 },
  horizontalBarRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  horizontalLabel: { width: 100, color: C.muted, fontSize: 11, flexShrink: 1 },
  horizontalValue: {
    width: 20,
    textAlign: "right",
    color: C.dark,
    fontSize: 12,
    fontWeight: "800",
  },
  progressTrack: {
    width: "100%",
    height: 10,
    borderRadius: 8,
    backgroundColor: "#EDF0F1",
    overflow: "hidden",
  },
  progressFill: { height: "100%", borderRadius: 8 },
  dealRow: { gap: 9, paddingVertical: 5 },
  dealTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
  },
  dealAmount: { fontSize: 13, color: C.dark, fontWeight: "800" },
  listRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 21,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: C.border,
  },
  priorityStrip: { width: 5, height: 35, borderRadius: 4 },
  itemTitle: { color: C.dark, fontSize: 13, fontWeight: "700" },
  itemDescription: {
    color: C.muted,
    fontSize: 11,
    lineHeight: 17,
    marginTop: 5,
  },
  highText: {
    color: C.red,
    backgroundColor: "#FBECEB",
    paddingHorizontal: 8,
    paddingVertical: 5,
    fontSize: 9,
    fontWeight: "800",
    borderRadius: 5,
  },
  snapshotRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 21,
    paddingVertical: 17,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: C.border,
  },
  snapshotLabel: { fontSize: 12, color: C.muted, flex: 1 },
  snapshotValue: { fontSize: 17, fontWeight: "800", color: C.dark },
  actionLink: {
    padding: 19,
    borderTopWidth: 1,
    borderTopColor: C.border,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  actionText: { fontSize: 12, fontWeight: "800", color: C.orange },
  projectStatus: { color: C.orange, fontSize: 11, fontWeight: "700" },
  empty: { padding: 24, textAlign: "center", color: C.muted, fontSize: 12 },
  demoFootnote: { fontSize: 11, color: C.muted, lineHeight: 18 },
});
