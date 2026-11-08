import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    useWindowDimensions,
    View,
} from "react-native";

import DocumentsWorkspace from "@/components/DocumentsWorkspace";
import ProjectsWorkspace from "@/components/ProjectsWorkspace";
import SettingsWorkspace from "@/components/SettingsWorkspace";
import TasksWorkspace from "@/components/TasksWorkspace";
import TeamWorkspace from "@/components/TeamWorkspace";
import WorkflowsWorkspace from "@/components/WorkflowsWorkspace";
import { DocumentsProvider } from "@/context/DocumentsContext";
import { ProjectsProvider } from "@/context/ProjectsContext";
import { TeamProvider } from "@/context/TeamContext";

const COLORS = {
  sidebar: "#202A32",
  sidebarHover: "#303C45",
  orange: "#C47B42",
  orangeLight: "#E3A574",
  background: "#F5F2EC",
  white: "#FFFFFF",
  text: "#26313A",
  muted: "#7B858D",
  border: "#E6E7E7",
  green: "#3C936B",
  red: "#C45C55",
};

type IconName = React.ComponentProps<typeof Ionicons>["name"];

type NavItem = {
  label: string;
  icon: IconName;
};

const navigation: NavItem[] = [
  { label: "Dashboard", icon: "grid-outline" },
  { label: "Projects", icon: "business-outline" },
  { label: "My Tasks", icon: "checkbox-outline" },
  { label: "Workflows", icon: "git-network-outline" },
  { label: "Documents", icon: "folder-outline" },
  { label: "Team", icon: "people-outline" },
  { label: "Settings", icon: "settings-outline" },
];

const projects = [
  {
    name: "North Ridge Apartments",
    code: "DEV-2026-014",
    type: "Multifamily",
    stage: "Due Diligence",
    progress: 35,
    status: "In Progress",
  },
  {
    name: "Westfield Commercial",
    code: "DEV-2026-009",
    type: "Commercial",
    stage: "Entitlements",
    progress: 58,
    status: "Needs Review",
  },
  {
    name: "Oak Creek Residences",
    code: "DEV-2026-021",
    type: "Residential",
    stage: "Acquisition",
    progress: 12,
    status: "In Progress",
  },
  {
    name: "Central Plaza",
    code: "DEV-2026-005",
    type: "Mixed-Use",
    stage: "Construction",
    progress: 81,
    status: "Blocked",
  },
];

const activities = [
  {
    icon: "checkmark-circle-outline" as IconName,
    title: "Stage approved",
    detail: "North Ridge Apartments · Due Diligence",
    time: "12 minutes ago",
  },
  {
    icon: "document-text-outline" as IconName,
    title: "Document uploaded",
    detail: "Westfield Commercial · Site Survey",
    time: "1 hour ago",
  },
  {
    icon: "chatbubble-outline" as IconName,
    title: "New project note",
    detail: "Oak Creek Residences",
    time: "3 hours ago",
  },
];

function StatusBadge({ status }: { status: string }) {
  const color =
    status === "Blocked"
      ? COLORS.red
      : status === "Needs Review"
        ? COLORS.orange
        : COLORS.green;

  return (
    <View style={[styles.statusBadge, { backgroundColor: color + "15" }]}>
      <View style={[styles.statusDot, { backgroundColor: color }]} />
      <Text style={[styles.statusText, { color }]}>{status}</Text>
    </View>
  );
}

function DashboardContent() {
  const router = useRouter();
  const { width } = useWindowDimensions();

  const isDesktop = width >= 900;

  const [activeNav, setActiveNav] = useState("Dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleNav = (label: string) => {
    setActiveNav(label);
    setSidebarOpen(false);
  };

  const renderSidebar = () => (
    <View style={styles.sidebar}>
      <View style={styles.brand}>
        <View style={styles.brandIcon}>
          <Ionicons name="layers-outline" size={23} color="#FFF" />
        </View>
        <Text style={styles.brandText}>
          PIVOT<Text style={{ color: COLORS.orangeLight }}>.</Text>
        </Text>
      </View>

      <Text style={styles.navSection}>WORKSPACE</Text>

      <View style={styles.navItems}>
        {navigation.map((item) => (
          <TouchableOpacity
            key={item.label}
            style={[
              styles.navItem,
              activeNav === item.label && styles.navItemActive,
            ]}
            onPress={() => handleNav(item.label)}
          >
            <Ionicons
              name={item.icon}
              size={20}
              color={activeNav === item.label ? COLORS.orangeLight : "#9CAAB3"}
            />

            <Text
              style={[
                styles.navText,
                activeNav === item.label && styles.navTextActive,
              ]}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.sidebarBottom}>
        <View style={styles.workspaceInfo}>
          <View style={styles.workspaceAvatar}>
            <Text style={styles.workspaceAvatarText}>D</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.workspaceName}>Demo Workspace</Text>
            <Text style={styles.workspaceSub}>Development Firm</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={() => router.replace("/")}
        >
          <Ionicons name="log-out-outline" size={19} color="#9CAAB3" />
          <Text style={styles.logoutText}>Sign out</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {isDesktop && renderSidebar()}

      <View style={styles.main}>
        {/* TOP HEADER */}
        <View style={styles.topbar}>
          <View style={styles.topbarLeft}>
            {!isDesktop && (
              <TouchableOpacity onPress={() => setSidebarOpen(!sidebarOpen)}>
                <Ionicons name="menu-outline" size={27} color={COLORS.text} />
              </TouchableOpacity>
            )}

            <View>
              <Text style={styles.breadcrumb}>
                WORKSPACE / {activeNav.toUpperCase()}
              </Text>
              <Text style={styles.topbarTitle}>{activeNav}</Text>
            </View>
          </View>

          <View style={styles.topbarRight}>
            <TouchableOpacity style={styles.iconButton}>
              <Ionicons
                name="notifications-outline"
                size={21}
                color={COLORS.muted}
              />
            </TouchableOpacity>

            <View style={styles.userAvatar}>
              <Text style={styles.userAvatarText}>JD</Text>
            </View>
          </View>
        </View>

        {/* MAIN CONTENT */}
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {activeNav === "Dashboard" ? (
            <>
              <View style={styles.pageHeading}>
                <View>
                  <Text style={styles.pageTitle}>Portfolio Overview</Text>
                  <Text style={styles.pageSubtitle}>
                    Here's what's happening across your development projects.
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.primaryButton}
                  onPress={() => handleNav("Projects")}
                >
                  <Ionicons name="add" size={19} color="#FFF" />
                  <Text style={styles.primaryButtonText}>New Project</Text>
                </TouchableOpacity>
              </View>

              {/* SUMMARY CARDS */}
              <View style={styles.statsGrid}>
                {[
                  {
                    label: "Active Projects",
                    value: "24",
                    icon: "business-outline" as IconName,
                  },
                  {
                    label: "Open Tasks",
                    value: "86",
                    icon: "checkbox-outline" as IconName,
                  },
                  {
                    label: "Awaiting Review",
                    value: "7",
                    icon: "time-outline" as IconName,
                  },
                  {
                    label: "Completed Projects",
                    value: "12",
                    icon: "checkmark-circle-outline" as IconName,
                  },
                ].map((stat) => (
                  <View
                    key={stat.label}
                    style={[
                      styles.statCard,
                      { width: isDesktop ? "23.5%" : "48%" },
                    ]}
                  >
                    <View style={styles.statTop}>
                      <Text style={styles.statLabel}>{stat.label}</Text>
                      <Ionicons
                        name={stat.icon}
                        size={21}
                        color={COLORS.orange}
                      />
                    </View>
                    <Text style={styles.statValue}>{stat.value}</Text>
                    <View style={styles.statAccent} />
                  </View>
                ))}
              </View>

              {/* PROJECTS */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <View>
                    <Text style={styles.sectionTitle}>Active Projects</Text>
                    <Text style={styles.sectionSubtitle}>
                      Current development pipeline
                    </Text>
                  </View>

                  <TouchableOpacity onPress={() => handleNav("Projects")}>
                    <Text style={styles.viewAll}>View all →</Text>
                  </TouchableOpacity>
                </View>

                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={styles.table}>
                    <View style={styles.tableHeader}>
                      <Text style={[styles.tableHeading, { width: 245 }]}>
                        PROJECT
                      </Text>
                      <Text style={[styles.tableHeading, { width: 125 }]}>
                        TYPE
                      </Text>
                      <Text style={[styles.tableHeading, { width: 155 }]}>
                        CURRENT STAGE
                      </Text>
                      <Text style={[styles.tableHeading, { width: 150 }]}>
                        PROGRESS
                      </Text>
                      <Text style={[styles.tableHeading, { width: 140 }]}>
                        STATUS
                      </Text>
                    </View>

                    {projects.map((project) => (
                      <View key={project.code} style={styles.tableRow}>
                        <View style={{ width: 245 }}>
                          <Text style={styles.projectName}>{project.name}</Text>
                          <Text style={styles.projectCode}>{project.code}</Text>
                        </View>

                        <Text style={[styles.tableCell, { width: 125 }]}>
                          {project.type}
                        </Text>

                        <Text style={[styles.tableCell, { width: 155 }]}>
                          {project.stage}
                        </Text>

                        <View style={{ width: 150, paddingRight: 22 }}>
                          <View style={styles.progressTrack}>
                            <View
                              style={[
                                styles.progressFill,
                                { width: `${project.progress}%` },
                              ]}
                            />
                          </View>
                          <Text style={styles.progressText}>
                            {project.progress}%
                          </Text>
                        </View>

                        <View style={{ width: 140 }}>
                          <StatusBadge status={project.status} />
                        </View>
                      </View>
                    ))}
                  </View>
                </ScrollView>
              </View>

              {/* ACTIVITY */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <View>
                    <Text style={styles.sectionTitle}>Recent Activity</Text>
                    <Text style={styles.sectionSubtitle}>
                      Latest updates across your workspace
                    </Text>
                  </View>
                </View>

                {activities.map((activity, index) => (
                  <View
                    key={index}
                    style={[
                      styles.activityRow,
                      index === activities.length - 1 && {
                        borderBottomWidth: 0,
                      },
                    ]}
                  >
                    <View style={styles.activityIcon}>
                      <Ionicons
                        name={activity.icon}
                        size={20}
                        color={COLORS.orange}
                      />
                    </View>

                    <View style={{ flex: 1 }}>
                      <Text style={styles.activityTitle}>{activity.title}</Text>
                      <Text style={styles.activityDetail}>
                        {activity.detail}
                      </Text>
                    </View>

                    <Text style={styles.activityTime}>{activity.time}</Text>
                  </View>
                ))}
              </View>
            </>
          ) : activeNav === "Projects" ? (
            <ProjectsWorkspace />
          ) : activeNav === "My Tasks" ? (
            <TasksWorkspace />
          ) : activeNav === "Workflows" ? (
            <WorkflowsWorkspace />
          ) : activeNav === "Documents" ? (
            <DocumentsWorkspace />
          ) : activeNav === "Team" ? (
            <TeamWorkspace />
          ) : activeNav === "Settings" ? (
            <SettingsWorkspace />
          ) : (
            <View style={styles.placeholder}>
              <Ionicons
                name={
                  navigation.find((n) => n.label === activeNav)?.icon ??
                  "grid-outline"
                }
                size={42}
                color={COLORS.orange}
              />
              <Text style={styles.placeholderTitle}>{activeNav}</Text>
              <Text style={styles.placeholderText}>
                This workspace is coming soon.
              </Text>
            </View>
          )}
        </ScrollView>
      </View>

      {/* MOBILE SIDEBAR */}
      {!isDesktop && sidebarOpen && (
        <View style={styles.mobileOverlay}>
          <TouchableOpacity
            style={styles.overlayBackdrop}
            onPress={() => setSidebarOpen(false)}
          />
          {renderSidebar()}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: COLORS.background,
  },
  sidebar: {
    width: 260,
    backgroundColor: COLORS.sidebar,
    paddingHorizontal: 16,
    paddingTop: 32,
    paddingBottom: 22,
    justifyContent: "space-between",
  },
  brand: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 14,
    marginBottom: 50,
  },
  brandIcon: {
    width: 42,
    height: 42,
    borderRadius: 11,
    backgroundColor: COLORS.orange,
    alignItems: "center",
    justifyContent: "center",
  },
  brandText: {
    fontSize: 23,
    fontWeight: "800",
    color: COLORS.white,
    letterSpacing: 2,
  },
  navSection: {
    color: "#647581",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 2,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  navItems: {
    flex: 1,
    gap: 5,
  },
  navItem: {
    height: 46,
    borderRadius: 9,
    flexDirection: "row",
    alignItems: "center",
    gap: 13,
    paddingHorizontal: 16,
  },
  navItemActive: {
    backgroundColor: COLORS.sidebarHover,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.orange,
  },
  navText: {
    color: "#9CAAB3",
    fontSize: 14,
    fontWeight: "500",
  },
  navTextActive: {
    color: COLORS.white,
    fontWeight: "700",
  },
  sidebarBottom: {
    borderTopWidth: 1,
    borderTopColor: "#35414A",
    paddingTop: 20,
  },
  workspaceInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    marginBottom: 20,
    paddingHorizontal: 8,
  },
  workspaceAvatar: {
    width: 38,
    height: 38,
    backgroundColor: "#3D4B55",
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  workspaceAvatarText: {
    color: COLORS.orangeLight,
    fontSize: 16,
    fontWeight: "800",
  },
  workspaceName: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: "700",
  },
  workspaceSub: {
    color: "#82919C",
    fontSize: 11,
    marginTop: 3,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  logoutText: {
    color: "#9CAAB3",
    fontSize: 13,
  },
  main: {
    flex: 1,
    minWidth: 0,
  },
  topbar: {
    height: 82,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingHorizontal: 32,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  topbarLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 18,
  },
  breadcrumb: {
    color: "#A1A9AE",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.5,
    marginBottom: 5,
  },
  topbarTitle: {
    color: COLORS.text,
    fontSize: 19,
    fontWeight: "800",
  },
  topbarRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
  },
  iconButton: {
    padding: 8,
  },
  userAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#E7DDD0",
    alignItems: "center",
    justifyContent: "center",
  },
  userAvatarText: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: "800",
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: 32,
    paddingBottom: 60,
    gap: 26,
  },
  pageHeading: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 16,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: COLORS.text,
    letterSpacing: -0.5,
  },
  pageSubtitle: {
    fontSize: 14,
    color: COLORS.muted,
    marginTop: 7,
  },
  primaryButton: {
    backgroundColor: COLORS.orange,
    borderRadius: 9,
    height: 42,
    paddingHorizontal: 17,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  primaryButtonText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: "800",
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 14,
  },
  statCard: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: 20,
    minHeight: 130,
    justifyContent: "space-between",
  },
  statTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
  },
  statLabel: {
    color: COLORS.muted,
    fontSize: 12,
    fontWeight: "600",
    flexShrink: 1,
  },
  statValue: {
    color: COLORS.text,
    fontSize: 32,
    fontWeight: "800",
    marginTop: 16,
  },
  statAccent: {
    width: 28,
    height: 3,
    borderRadius: 2,
    backgroundColor: COLORS.orange,
    marginTop: 10,
  },
  section: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    overflow: "hidden",
  },
  sectionHeader: {
    padding: 22,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  sectionTitle: {
    color: COLORS.text,
    fontSize: 17,
    fontWeight: "800",
  },
  sectionSubtitle: {
    color: COLORS.muted,
    fontSize: 12,
    marginTop: 5,
  },
  viewAll: {
    color: COLORS.orange,
    fontSize: 13,
    fontWeight: "700",
  },
  table: {
    minWidth: 815,
    width: "100%",
  },
  tableHeader: {
    flexDirection: "row",
    paddingHorizontal: 22,
    paddingVertical: 14,
    backgroundColor: "#FAFAF8",
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
  },
  tableHeading: {
    color: "#919BA2",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1,
  },
  tableRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 22,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  projectName: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: "800",
  },
  projectCode: {
    color: COLORS.muted,
    fontSize: 11,
    marginTop: 5,
  },
  tableCell: {
    color: "#64717A",
    fontSize: 12,
  },
  progressTrack: {
    height: 6,
    backgroundColor: "#E8EBEC",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: COLORS.orange,
    borderRadius: 4,
  },
  progressText: {
    color: COLORS.muted,
    fontSize: 10,
    marginTop: 6,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "700",
  },
  activityRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingHorizontal: 22,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#F9F0E8",
    alignItems: "center",
    justifyContent: "center",
  },
  activityTitle: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: "700",
  },
  activityDetail: {
    color: COLORS.muted,
    fontSize: 12,
    marginTop: 4,
  },
  activityTime: {
    color: "#A1A9AE",
    fontSize: 11,
  },
  placeholder: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    minHeight: 380,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    padding: 24,
  },
  placeholderTitle: {
    fontSize: 23,
    fontWeight: "800",
    color: COLORS.text,
  },
  placeholderText: {
    color: COLORS.muted,
    fontSize: 14,
  },
  mobileOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: "row",
    zIndex: 10,
  },
  overlayBackdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.45)",
  },
});

export default function DashboardScreen() {
  return (
    <ProjectsProvider>
      <DocumentsProvider>
        <TeamProvider>
          <DashboardContent />
        </TeamProvider>
      </DocumentsProvider>
    </ProjectsProvider>
  );
}
