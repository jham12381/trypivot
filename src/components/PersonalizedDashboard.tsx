import { Ionicons } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    useWindowDimensions,
    View,
} from "react-native";

import {
    stages,
    useProjects,
    type Project
} from "@/context/ProjectsContext";

type Role = "executive" | "acquisitions" | "construction" | "coordinator";

type Props = {
  onNavigate: (page: string) => void;
};

type Metric = {
  label: string;
  value: number;
  subtitle: string;
  icon: React.ComponentProps<typeof Ionicons>["name"];
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
    description: "Your portfolio, priorities, and decisions.",
  },
  {
    id: "acquisitions",
    label: "Acquisitions",
    person: "Jordan",
    description: "Keep your deals and due diligence moving.",
  },
  {
    id: "construction",
    label: "Construction",
    person: "Alison",
    description: "Stay ahead of construction issues and blockers.",
  },
  {
    id: "coordinator",
    label: "Project Coordinator",
    person: "Kyle",
    description: "Your assigned work and immediate priorities.",
  },
];

const getStage = (project: Project) => stages[project.stageIndex] ?? "Unknown";

const getOpenTasks = (project: Project) =>
  project.tasks.filter((task) => task.status !== "Done");

const rolePerson: Record<Role, string> = {
  executive: "Johnny Ham",
  acquisitions: "Jordan Nolen",
  construction: "Alison Owens",
  coordinator: "Kyle Grey",
};

export default function PersonalizedDashboard({ onNavigate }: Props) {
  const { projects } = useProjects();
  const { width } = useWindowDimensions();
  const [role, setRole] = useState<Role>("executive");

  const compact = width < 1100;
  const mobile = width < 650;

  const roleInfo = ROLES.find((item) => item.id === role)!;
  const person = rolePerson[role];

  const assignedTasks = useMemo(
    () =>
      projects.flatMap((project) =>
        project.tasks
          .filter((task) => task.assignee === person && task.status !== "Done")
          .map((task) => ({
            ...task,
            projectName: project.name,
            projectId: project.id,
          })),
      ),
    [projects, person],
  );

  const relevantProjects = useMemo(() => {
    if (role === "executive") return projects;

    if (role === "acquisitions") {
      return projects.filter(
        (project) => project.stageIndex <= 1 || project.manager === person,
      );
    }

    if (role === "construction") {
      return projects.filter(
        (project) => project.stageIndex >= 5 || project.manager === person,
      );
    }

    return projects.filter(
      (project) =>
        project.manager === person ||
        project.tasks.some((task) => task.assignee === person),
    );
  }, [projects, role, person]);

  const metrics = useMemo((): Metric[] => {
    const openTasks = relevantProjects.reduce(
      (total, project) => total + getOpenTasks(project).length,
      0,
    );

    if (role === "executive") {
      return [
        {
          label: "Active Projects",
          value: projects.filter((p) => p.status !== "Completed").length,
          subtitle: "Company-wide",
          icon: "business-outline",
        },
        {
          label: "Awaiting Approval",
          value: projects.filter((p) => p.status === "Needs Review").length,
          subtitle: "Pending decisions",
          icon: "time-outline",
        },
        {
          label: "Blocked Projects",
          value: projects.filter((p) => p.status === "Blocked").length,
          subtitle: "Require attention",
          icon: "alert-circle-outline",
        },
        {
          label: "Open Tasks",
          value: projects.reduce(
            (total, p) => total + getOpenTasks(p).length,
            0,
          ),
          subtitle: "Across the portfolio",
          icon: "checkbox-outline",
        },
      ];
    }

    if (role === "acquisitions") {
      return [
        {
          label: "Pipeline Projects",
          value: relevantProjects.length,
          subtitle: "Acquisition / early stage",
          icon: "business-outline",
        },
        {
          label: "My Open Tasks",
          value: assignedTasks.length,
          subtitle: "Assigned to you",
          icon: "checkbox-outline",
        },
        {
          label: "Pending Approvals",
          value: relevantProjects.filter((p) => p.status === "Needs Review")
            .length,
          subtitle: "In your pipeline",
          icon: "time-outline",
        },
        {
          label: "Pipeline Open Tasks",
          value: openTasks,
          subtitle: "Across relevant projects",
          icon: "list-outline",
        },
      ];
    }

    if (role === "construction") {
      return [
        {
          label: "Relevant Projects",
          value: relevantProjects.length,
          subtitle: "Construction / assigned",
          icon: "construct-outline",
        },
        {
          label: "Blocked Projects",
          value: relevantProjects.filter((p) => p.status === "Blocked").length,
          subtitle: "Need resolution",
          icon: "warning-outline",
        },
        {
          label: "Open Tasks",
          value: openTasks,
          subtitle: "On relevant projects",
          icon: "checkbox-outline",
        },
        {
          label: "My Assignments",
          value: assignedTasks.length,
          subtitle: "Outstanding work",
          icon: "person-outline",
        },
      ];
    }

    return [
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
        value: assignedTasks.filter((task) => task.status === "In Progress")
          .length,
        subtitle: "Tasks underway",
        icon: "refresh-outline",
      },
      {
        label: "To Do",
        value: assignedTasks.filter((task) => task.status === "To Do").length,
        subtitle: "Not started",
        icon: "list-outline",
      },
    ];
  }, [projects, relevantProjects, assignedTasks, role]);

  const attentionItems = useMemo(() => {
    const items: {
      id: string;
      title: string;
      description: string;
      priority: "high" | "medium" | "normal";
    }[] = [];

    if (role === "executive") {
      projects.forEach((p) => {
        if (p.status === "Blocked") {
          items.push({
            id: p.id,
            title: p.name,
            description: `${getStage(p)} is blocked and needs intervention.`,
            priority: "high",
          });
        } else if (p.status === "Needs Review") {
          items.push({
            id: p.id,
            title: p.name,
            description: `${getStage(p)} is awaiting approval.`,
            priority: "medium",
          });
        }
      });
    } else if (role === "construction") {
      relevantProjects.forEach((p) => {
        if (p.status === "Blocked") {
          items.push({
            id: p.id,
            title: p.name,
            description: "Project is blocked. Review outstanding issues.",
            priority: "high",
          });
        }

        getOpenTasks(p).forEach((task) => {
          items.push({
            id: `${p.id}-${task.id}`,
            title: task.title,
            description: `${p.name} · ${task.assignee}`,
            priority: "medium",
          });
        });
      });
    } else {
      assignedTasks.forEach((task) => {
        items.push({
          id: task.id,
          title: task.title,
          description: `${task.projectName} · ${task.status}`,
          priority: task.priority === "High" ? "high" : "normal",
        });
      });

      relevantProjects
        .filter((p) => p.status === "Needs Review")
        .forEach((p) => {
          items.push({
            id: `review-${p.id}`,
            title: p.name,
            description: `${getStage(p)} is awaiting approval.`,
            priority: "medium",
          });
        });
    }

    const order = { high: 0, medium: 1, normal: 2 };

    return items.sort((a, b) => order[a.priority] - order[b.priority]);
  }, [projects, relevantProjects, assignedTasks, role]);

  const myTasks = assignedTasks.slice(0, 5);

  return (
    <View style={s.root}>
      {/* HEADER */}
      <View style={[s.heading, mobile && s.headingMobile]}>
        <View style={{ flex: 1 }}>
          <Text style={s.eyebrow}>YOUR WORKSPACE</Text>

          <Text style={s.title}>Good morning, {roleInfo.person}.</Text>

          <Text style={s.subtitle}>{roleInfo.description}</Text>
        </View>

        <View style={s.rolePicker}>
          <Text style={s.roleLabel}>DEMO · VIEW AS</Text>

          <View style={s.roleOptions}>
            {ROLES.map((item) => (
              <TouchableOpacity
                key={item.id}
                onPress={() => setRole(item.id)}
                style={[s.roleOption, role === item.id && s.roleOptionActive]}
              >
                <Text
                  style={[
                    s.roleOptionText,
                    role === item.id && s.roleOptionTextActive,
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      {/* METRICS */}
      <View style={s.metrics}>
        {metrics.map((metric) => (
          <View
            key={metric.label}
            style={[
              s.metricCard,
              {
                width: mobile ? "100%" : compact ? "48%" : "23.5%",
              },
            ]}
          >
            <View style={s.metricHeader}>
              <Text style={s.metricLabel}>{metric.label}</Text>

              <Ionicons name={metric.icon} size={21} color={C.orange} />
            </View>

            <Text style={s.metricValue}>{metric.value}</Text>

            <Text style={s.metricSubtitle}>{metric.subtitle}</Text>
          </View>
        ))}
      </View>

      {/* PERSONALIZED CONTENT */}
      <View style={[s.columns, compact && s.columnsCompact]}>
        {/* NEEDS ATTENTION */}
        <View style={[s.panel, s.attentionPanel]}>
          <View style={s.panelHeader}>
            <View>
              <Text style={s.panelTitle}>Needs Your Attention</Text>

              <Text style={s.panelSubtitle}>Prioritized for your role</Text>
            </View>

            <View style={s.countBadge}>
              <Text style={s.countText}>{attentionItems.length}</Text>
            </View>
          </View>

          {attentionItems.length === 0 ? (
            <View style={s.empty}>
              <Ionicons
                name="checkmark-circle-outline"
                size={30}
                color={C.green}
              />
              <Text style={s.emptyText}>
                Nothing requires your attention right now.
              </Text>
            </View>
          ) : (
            attentionItems.slice(0, 6).map((item) => (
              <View key={item.id} style={s.attentionRow}>
                <View
                  style={[
                    s.priorityIndicator,
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

                  <Text style={s.itemDescription}>{item.description}</Text>
                </View>

                {item.priority === "high" && (
                  <View style={s.urgentBadge}>
                    <Text style={s.urgentText}>HIGH</Text>
                  </View>
                )}
              </View>
            ))
          )}
        </View>

        {/* MY TASKS */}
        <View style={[s.panel, s.tasksPanel]}>
          <View style={s.panelHeader}>
            <View>
              <Text style={s.panelTitle}>
                {role === "executive" ? "Portfolio Focus" : "My Priorities"}
              </Text>

              <Text style={s.panelSubtitle}>
                {role === "executive"
                  ? "Projects requiring oversight"
                  : "Your outstanding assignments"}
              </Text>
            </View>
          </View>

          {role === "executive" ? (
            projects
              .filter(
                (p) => p.status === "Blocked" || p.status === "Needs Review",
              )
              .slice(0, 5)
              .map((p) => (
                <View key={p.id} style={s.taskRow}>
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
          ) : myTasks.length === 0 ? (
            <View style={s.empty}>
              <Text style={s.emptyText}>
                No outstanding tasks assigned to you.
              </Text>
            </View>
          ) : (
            myTasks.map((task) => (
              <View key={task.id} style={s.taskRow}>
                <Ionicons
                  name={
                    task.status === "In Progress"
                      ? "time-outline"
                      : "ellipse-outline"
                  }
                  size={19}
                  color={C.orange}
                />

                <View style={{ flex: 1 }}>
                  <Text style={s.itemTitle}>{task.title}</Text>

                  <Text style={s.itemDescription}>
                    {task.projectName} · {task.status}
                  </Text>
                </View>
              </View>
            ))
          )}

          <TouchableOpacity
            style={s.viewAll}
            onPress={() =>
              onNavigate(role === "executive" ? "Projects" : "My Tasks")
            }
          >
            <Text style={s.viewAllText}>
              {role === "executive" ? "View all projects" : "View all tasks"}
            </Text>

            <Ionicons name="arrow-forward" size={16} color={C.orange} />
          </TouchableOpacity>
        </View>
      </View>

      {/* RELEVANT PROJECTS */}
      <View style={s.panel}>
        <View style={s.panelHeader}>
          <View>
            <Text style={s.panelTitle}>
              {role === "executive"
                ? "Portfolio Overview"
                : "Projects Relevant to You"}
            </Text>

            <Text style={s.panelSubtitle}>
              {role === "executive"
                ? "Company development pipeline"
                : "Based on your role and assignments"}
            </Text>
          </View>

          <TouchableOpacity onPress={() => onNavigate("Projects")}>
            <Text style={s.viewAllText}>View all →</Text>
          </TouchableOpacity>
        </View>

        {relevantProjects.length === 0 ? (
          <View style={s.empty}>
            <Text style={s.emptyText}>No projects match this role.</Text>
          </View>
        ) : (
          relevantProjects.map((project) => (
            <View key={project.id} style={s.projectRow}>
              <View style={{ flex: 1 }}>
                <Text style={s.itemTitle}>{project.name}</Text>

                <Text style={s.itemDescription}>
                  {project.code} · {getStage(project)}
                </Text>
              </View>

              <View
                style={[
                  s.statusBadge,
                  {
                    backgroundColor:
                      project.status === "Blocked"
                        ? "#FBECEB"
                        : project.status === "Needs Review"
                          ? "#FAF0E7"
                          : "#EDF7F1",
                  },
                ]}
              >
                <Text
                  style={[
                    s.statusText,
                    {
                      color:
                        project.status === "Blocked"
                          ? C.red
                          : project.status === "Needs Review"
                            ? C.orange
                            : C.green,
                    },
                  ]}
                >
                  {project.status}
                </Text>
              </View>
            </View>
          ))
        )}
      </View>

      <Text style={s.demoFootnote}>
        Demo role selection · Metrics are calculated from sample workspace data.
        Role permissions and authentication are not connected.
      </Text>
    </View>
  );
}

const s = StyleSheet.create({
  root: {
    gap: 24,
  },

  heading: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 20,
  },

  headingMobile: {
    flexDirection: "column",
  },

  eyebrow: {
    color: C.orange,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.5,
    marginBottom: 9,
  },

  title: {
    color: C.dark,
    fontSize: 27,
    fontWeight: "800",
  },

  subtitle: {
    color: C.muted,
    fontSize: 13,
    marginTop: 8,
    lineHeight: 20,
  },

  rolePicker: {
    maxWidth: 520,
    width: "100%",
    flexShrink: 1,
  },

  roleLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: C.muted,
    letterSpacing: 1,
    marginBottom: 9,
  },

  roleOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },

  roleOption: {
    paddingHorizontal: 11,
    paddingVertical: 9,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: C.white,
  },

  roleOptionActive: {
    backgroundColor: C.orangeLight,
    borderColor: C.orange,
  },

  roleOptionText: {
    fontSize: 11,
    fontWeight: "600",
    color: C.muted,
  },

  roleOptionTextActive: {
    color: C.orange,
    fontWeight: "800",
  },

  metrics: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 14,
  },

  metricCard: {
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 12,
    padding: 20,
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
    fontSize: 32,
    fontWeight: "800",
    color: C.dark,
    marginTop: 14,
  },

  metricSubtitle: {
    fontSize: 11,
    color: C.muted,
    marginTop: 6,
  },

  columns: {
    flexDirection: "row",
    gap: 18,
    alignItems: "flex-start",
  },

  columnsCompact: {
    flexDirection: "column",
  },

  panel: {
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 12,
    overflow: "hidden",
  },

  attentionPanel: {
    flex: 1.3,
    minWidth: 0,
  },

  tasksPanel: {
    flex: 1,
    minWidth: 0,
  },

  panelHeader: {
    padding: 22,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },

  panelTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: C.dark,
  },

  panelSubtitle: {
    fontSize: 12,
    color: C.muted,
    marginTop: 5,
  },

  countBadge: {
    backgroundColor: C.orangeLight,
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 7,
  },

  countText: {
    color: C.orange,
    fontSize: 12,
    fontWeight: "800",
  },

  attentionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 22,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: C.border,
  },

  priorityIndicator: {
    width: 5,
    height: 36,
    borderRadius: 3,
  },

  itemTitle: {
    color: C.dark,
    fontSize: 13,
    fontWeight: "700",
  },

  itemDescription: {
    color: C.muted,
    fontSize: 11,
    lineHeight: 17,
    marginTop: 5,
  },

  urgentBadge: {
    backgroundColor: "#FBECEB",
    borderRadius: 5,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },

  urgentText: {
    color: C.red,
    fontSize: 9,
    fontWeight: "800",
  },

  taskRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 22,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: C.border,
  },

  viewAll: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: C.border,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  viewAllText: {
    color: C.orange,
    fontSize: 12,
    fontWeight: "800",
  },

  projectRow: {
    paddingHorizontal: 22,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: C.border,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  statusBadge: {
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },

  statusText: {
    fontSize: 10,
    fontWeight: "800",
  },

  empty: {
    padding: 28,
    alignItems: "center",
    gap: 10,
  },

  emptyText: {
    color: C.muted,
    fontSize: 12,
    textAlign: "center",
    lineHeight: 19,
  },

  demoFootnote: {
    fontSize: 11,
    color: C.muted,
    lineHeight: 18,
  },
});
