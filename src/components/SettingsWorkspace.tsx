import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";

type Settings = {
  workspaceName: string;
  workspaceType: string;
  displayName: string;
  email: string;
  role: string;
  timezone: string;
  dateFormat: string;
  emailNotifications: boolean;
  taskAssignments: boolean;
  dueDateReminders: boolean;
  approvalRequests: boolean;
  weeklyDigest: boolean;
  compactView: boolean;
};

const initial: Settings = {
  workspaceName: "Demo Workspace",
  workspaceType: "Development Firm",
  displayName: "Demo User",
  email: "demo@trypivot.io",
  role: "Workspace Administrator",
  timezone: "America/Phoenix",
  dateFormat: "MM/DD/YYYY",
  emailNotifications: true,
  taskAssignments: true,
  dueDateReminders: true,
  approvalRequests: true,
  weeklyDigest: false,
  compactView: false,
};

const C = {
  orange: "#C47B42",
  dark: "#26313A",
  muted: "#7B858D",
  border: "#E6E7E7",
  white: "#FFFFFF",
  cream: "#F5F2EC",
};

type Section =
  | "Workspace"
  | "My Profile"
  | "Notifications"
  | "Preferences"
  | "Security";
const sections: {
  label: Section;
  icon: React.ComponentProps<typeof Ionicons>["name"];
}[] = [
  { label: "Workspace", icon: "business-outline" },
  { label: "My Profile", icon: "person-outline" },
  { label: "Notifications", icon: "notifications-outline" },
  { label: "Preferences", icon: "options-outline" },
  { label: "Security", icon: "shield-checkmark-outline" },
];

export default function SettingsWorkspace() {
  const { width } = useWindowDimensions();
  const mobile = width < 700;
  const [section, setSection] = useState<Section>("Workspace");
  const [settings, setSettings] = useState<Settings>(initial);
  const [saved, setSaved] = useState<Settings>(initial);
  const [message, setMessage] = useState("");
  const dirty = JSON.stringify(settings) !== JSON.stringify(saved);

  const update = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    setSettings((current) => ({ ...current, [key]: value }));
    setMessage("");
  };
  const save = () => {
    if (!settings.workspaceName.trim() || !settings.displayName.trim()) {
      setMessage("Workspace name and display name are required.");
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(settings.email.trim())) {
      setMessage("Enter a valid email address.");
      return;
    }
    setSaved({ ...settings });
    setMessage(
      "Settings saved for this demo session. They reset when you refresh.",
    );
  };
  const reset = () => {
    setSettings({ ...saved });
    setMessage("Unsaved changes discarded.");
  };
  const field = (
    label: string,
    key: keyof Pick<
      Settings,
      "workspaceName" | "workspaceType" | "displayName" | "email" | "role"
    >,
    editable = true,
  ) => (
    <View style={s.field} key={key}>
      <Text style={s.fieldLabel}>{label}</Text>
      <TextInput
        style={[s.input, !editable && s.disabledInput]}
        value={settings[key]}
        onChangeText={(value) => update(key, value)}
        editable={editable}
        autoCapitalize={key === "email" ? "none" : "sentences"}
        keyboardType={key === "email" ? "email-address" : "default"}
      />
    </View>
  );
  const toggle = (
    label: string,
    detail: string,
    key: keyof Pick<
      Settings,
      | "emailNotifications"
      | "taskAssignments"
      | "dueDateReminders"
      | "approvalRequests"
      | "weeklyDigest"
      | "compactView"
    >,
  ) => (
    <View style={s.toggleRow} key={key}>
      <View style={s.toggleCopy}>
        <Text style={s.rowTitle}>{label}</Text>
        <Text style={s.rowDescription}>{detail}</Text>
      </View>
      <Switch
        value={settings[key]}
        onValueChange={(value) => update(key, value)}
        trackColor={{ false: "#D9DFE2", true: "#E6B38B" }}
        thumbColor={settings[key] ? C.orange : "#F7F7F7"}
      />
    </View>
  );
  const choice = (
    label: string,
    key: "timezone" | "dateFormat",
    options: string[],
  ) => (
    <View style={s.field}>
      <Text style={s.fieldLabel}>{label}</Text>
      <View style={s.choices}>
        {options.map((option) => (
          <TouchableOpacity
            key={option}
            onPress={() => update(key, option)}
            style={[s.choice, settings[key] === option && s.choiceActive]}
          >
            <Text
              style={[
                s.choiceText,
                settings[key] === option && s.choiceTextActive,
              ]}
            >
              {option}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <View style={s.root}>
      <View style={[s.heading, mobile && s.headingMobile]}>
        <View style={s.headingCopy}>
          <Text style={s.title}>Settings</Text>
          <Text style={s.subtitle}>
            Manage your workspace, account, and preferences.
          </Text>
        </View>
        <View style={s.demoTag}>
          <Ionicons
            name="information-circle-outline"
            size={15}
            color={C.orange}
          />
          <Text style={s.demoText}>Demo settings</Text>
        </View>
      </View>
      <View style={[s.layout, mobile && s.layoutMobile]}>
        <View style={[s.nav, mobile && s.navMobile]}>
          {mobile ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={s.navScroll}
            >
              {sections.map((item) => (
                <TouchableOpacity
                  key={item.label}
                  onPress={() => {
                    setSection(item.label);
                    setMessage("");
                  }}
                  style={[s.navItem, section === item.label && s.navItemActive]}
                >
                  <Ionicons
                    name={item.icon}
                    size={17}
                    color={section === item.label ? C.orange : C.muted}
                  />
                  <Text
                    style={[
                      s.navText,
                      section === item.label && s.navTextActive,
                    ]}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          ) : (
            sections.map((item) => (
              <TouchableOpacity
                key={item.label}
                onPress={() => {
                  setSection(item.label);
                  setMessage("");
                }}
                style={[s.navItem, section === item.label && s.navItemActive]}
              >
                <Ionicons
                  name={item.icon}
                  size={19}
                  color={section === item.label ? C.orange : C.muted}
                />
                <Text
                  style={[s.navText, section === item.label && s.navTextActive]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))
          )}
        </View>
        <View style={s.panel}>
          <View style={s.panelHeader}>
            <Text style={s.panelTitle}>{section}</Text>
            <Text style={s.panelSubtitle}>
              {section === "Workspace"
                ? "Basic information about your organization."
                : section === "My Profile"
                  ? "Your personal details in this workspace."
                  : section === "Notifications"
                    ? "Choose which events you want to hear about."
                    : section === "Preferences"
                      ? "Customize how Pivot displays information."
                      : "Account protection and access information."}
            </Text>
          </View>
          <View style={s.panelBody}>
            {section === "Workspace" && (
              <>
                {field("Workspace name", "workspaceName")}
                {field("Organization type", "workspaceType")}
                <View style={s.info}>
                  <Ionicons name="people-outline" size={19} color={C.orange} />
                  <Text style={s.infoText}>
                    Team members and roles will be managed from the Team
                    workspace in a future update.
                  </Text>
                </View>
              </>
            )}
            {section === "My Profile" && (
              <>
                <View style={s.profileRow}>
                  <View style={s.avatar}>
                    <Text style={s.avatarText}>JH</Text>
                  </View>
                  <View style={s.headingCopy}>
                    <Text style={s.rowTitle}>
                      {settings.displayName || "Demo User"}
                    </Text>
                    <Text style={s.rowDescription}>Demo account</Text>
                  </View>
                </View>
                {field("Display name", "displayName")}
                {field("Email address", "email")}
                {field("Role", "role", false)}
              </>
            )}
            {section === "Notifications" && (
              <>
                {toggle(
                  "Email notifications",
                  "Master preference for email updates.",
                  "emailNotifications",
                )}
                {toggle(
                  "Task assignments",
                  "Updates when work is assigned to you.",
                  "taskAssignments",
                )}
                {toggle(
                  "Due date reminders",
                  "Reminders for approaching task deadlines.",
                  "dueDateReminders",
                )}
                {toggle(
                  "Approval requests",
                  "Updates when stages or documents need review.",
                  "approvalRequests",
                )}
                {toggle(
                  "Weekly digest",
                  "A summary of project activity each week.",
                  "weeklyDigest",
                )}
                <Text style={s.note}>
                  Preferences are for demonstration only; no emails or push
                  notifications are sent.
                </Text>
              </>
            )}
            {section === "Preferences" && (
              <>
                {choice("Time zone", "timezone", [
                  "America/Phoenix",
                  "America/Chicago",
                  "America/New_York",
                  "America/Los_Angeles",
                ])}
                {choice("Date format", "dateFormat", [
                  "MM/DD/YYYY",
                  "DD/MM/YYYY",
                  "YYYY-MM-DD",
                ])}
                {toggle(
                  "Compact view",
                  "Prefer denser lists and tables.",
                  "compactView",
                )}
                <Text style={s.note}>
                  These selections are stored in demo state; they do not yet
                  change other workspace screens.
                </Text>
              </>
            )}
            {section === "Security" && (
              <>
                <View style={s.securityRow}>
                  <Ionicons
                    name="lock-closed-outline"
                    size={23}
                    color={C.orange}
                  />
                  <View style={s.headingCopy}>
                    <Text style={s.rowTitle}>Password & authentication</Text>
                    <Text style={s.rowDescription}>
                      Authentication is bypassed in the current Pivot demo.
                    </Text>
                  </View>
                </View>
                <View style={s.securityRow}>
                  <Ionicons
                    name="shield-checkmark-outline"
                    size={23}
                    color={C.orange}
                  />
                  <View style={s.headingCopy}>
                    <Text style={s.rowTitle}>Two-factor authentication</Text>
                    <Text style={s.rowDescription}>
                      Not configured. Available after real authentication is
                      integrated.
                    </Text>
                  </View>
                </View>
                <View style={s.securityRow}>
                  <Ionicons name="time-outline" size={23} color={C.orange} />
                  <View style={s.headingCopy}>
                    <Text style={s.rowTitle}>Active sessions</Text>
                    <Text style={s.rowDescription}>
                      Session management will be available with account login.
                    </Text>
                  </View>
                </View>
              </>
            )}
          </View>
          {section !== "Security" && (
            <View style={[s.footer, mobile && s.footerMobile]}>
              <View style={s.messageArea}>
                {message ? (
                  <Text
                    style={[
                      s.message,
                      message.includes("required") || message.includes("valid")
                        ? s.error
                        : null,
                    ]}
                  >
                    {message}
                  </Text>
                ) : (
                  <Text style={s.note}>
                    {dirty
                      ? "You have unsaved changes."
                      : "Changes remain in this browser session only."}
                  </Text>
                )}
              </View>
              <View style={s.buttons}>
                <TouchableOpacity
                  onPress={reset}
                  disabled={!dirty}
                  style={[s.cancel, !dirty && s.dim]}
                >
                  <Text style={s.cancelText}>Discard</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={save} style={s.save}>
                  <Ionicons name="save-outline" size={17} color="#FFF" />
                  <Text style={s.saveText}>Save Changes</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  root: { gap: 24, minWidth: 0 },
  heading: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 14,
  },
  headingMobile: { flexDirection: "column", alignItems: "flex-start" },
  headingCopy: { flex: 1, minWidth: 0 },
  title: { fontSize: 28, fontWeight: "800", color: C.dark },
  subtitle: { fontSize: 14, color: C.muted, marginTop: 7 },
  demoTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    padding: 9,
    backgroundColor: "#F9F0E8",
    borderRadius: 8,
  },
  demoText: { color: C.orange, fontSize: 12, fontWeight: "700" },
  layout: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 20,
    minWidth: 0,
  },
  layoutMobile: { flexDirection: "column", alignItems: "stretch" },
  nav: {
    width: 215,
    backgroundColor: C.white,
    borderColor: C.border,
    borderWidth: 1,
    borderRadius: 12,
    padding: 10,
    gap: 4,
  },
  navMobile: { width: "100%", padding: 6 },
  navScroll: { gap: 5, alignItems: "center" },
  navItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    paddingHorizontal: 12,
    paddingVertical: 13,
    borderRadius: 8,
  },
  navItemActive: { backgroundColor: "#F9F0E8" },
  navText: { fontSize: 13, fontWeight: "600", color: C.muted },
  navTextActive: { color: C.orange, fontWeight: "800" },
  panel: {
    flex: 1,
    minWidth: 0,
    width: "100%",
    backgroundColor: C.white,
    borderColor: C.border,
    borderWidth: 1,
    borderRadius: 12,
    overflow: "hidden",
  },
  panelHeader: { padding: 22, borderBottomWidth: 1, borderColor: C.border },
  panelTitle: { fontSize: 20, fontWeight: "800", color: C.dark },
  panelSubtitle: { color: C.muted, fontSize: 13, marginTop: 6, lineHeight: 19 },
  panelBody: { padding: 22, gap: 18 },
  field: { gap: 8 },
  fieldLabel: { color: C.dark, fontSize: 13, fontWeight: "700" },
  input: {
    height: 46,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 8,
    paddingHorizontal: 13,
    color: C.dark,
    fontSize: 14,
    backgroundColor: C.white,
  },
  disabledInput: { backgroundColor: "#F6F6F5", color: C.muted },
  info: {
    flexDirection: "row",
    gap: 10,
    padding: 14,
    backgroundColor: "#F9F0E8",
    borderRadius: 9,
    alignItems: "flex-start",
  },
  infoText: { color: C.muted, fontSize: 12, lineHeight: 19, flex: 1 },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  toggleCopy: { flex: 1, minWidth: 0 },
  rowTitle: { color: C.dark, fontSize: 14, fontWeight: "700" },
  rowDescription: {
    color: C.muted,
    fontSize: 12,
    marginTop: 5,
    lineHeight: 19,
  },
  choices: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  choice: {
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  choiceActive: { backgroundColor: "#F9F0E8", borderColor: C.orange },
  choiceText: { color: C.muted, fontSize: 12, fontWeight: "600" },
  choiceTextActive: { color: C.orange, fontWeight: "800" },
  note: { color: C.muted, fontSize: 12, lineHeight: 18 },
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 8,
  },
  avatar: {
    height: 48,
    width: 48,
    borderRadius: 24,
    backgroundColor: "#E7DDD0",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { fontWeight: "800", color: C.dark, fontSize: 15 },
  securityRow: {
    flexDirection: "row",
    gap: 14,
    alignItems: "flex-start",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  footer: {
    borderTopWidth: 1,
    borderColor: C.border,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  footerMobile: { flexDirection: "column", alignItems: "stretch" },
  messageArea: { flex: 1, minWidth: 0 },
  message: { color: "#3C936B", fontSize: 12, lineHeight: 18 },
  error: { color: "#C45C55" },
  buttons: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    alignItems: "center",
  },
  cancel: {
    minHeight: 42,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: C.border,
    justifyContent: "center",
  },
  cancelText: { fontSize: 12, fontWeight: "700", color: C.dark },
  dim: { opacity: 0.5 },
  save: {
    minHeight: 42,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: C.orange,
  },
  saveText: { color: C.white, fontSize: 12, fontWeight: "800" },
});
