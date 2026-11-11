import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import {
    Animated,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    useWindowDimensions,
    View,
} from "react-native";

type Props = {
  visible: boolean;
  onClose: () => void;
  activeWorkspace: string;
};

type Scenario = "zoning" | "task" | "portfolio" | "general";

type Action = {
  id: string;
  title: string;
  detail: string;
  selected: boolean;
};

type Message = {
  id: string;
  role: "user" | "assistant";
  text: string;
  actions?: Action[];
  scenario?: Scenario;
  approved?: boolean;
};

const C = {
  orange: "#C47B42",
  orangeLight: "#FAF0E7",
  white: "#FFFFFF",
  text: "#26313A",
  muted: "#7B858D",
  border: "#E6E7E7",
  background: "#F5F2EC",
  green: "#3C936B",
};

const PROMPTS = [
  {
    title: "Project update",
    text: "North Ridge received zoning approval. Assign Sarah to permitting and notify James.",
  },
  {
    title: "Create a task",
    text: "Create a task for Mike to follow up on the environmental report for Oak Creek.",
  },
  {
    title: "Portfolio overview",
    text: "What's happening across my projects?",
  },
];

const generateMessageId = () =>
  `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;

function classify(text: string): Scenario {
  const q = text.toLowerCase();

  if (
    /portfolio|across my projects|all projects|project summary|what.s happening|overview/.test(
      q,
    )
  ) {
    return "portfolio";
  }

  if (/oak creek|environmental report|follow.up|follow up/.test(q)) {
    return "task";
  }

  if (/north ridge|zoning|permit|permitting|james|sarah/.test(q)) {
    return "zoning";
  }

  return "general";
}

function responseFor(scenario: Scenario): Omit<Message, "id"> {
  if (scenario === "zoning") {
    return {
      role: "assistant",
      scenario,
      text: "I matched this update to North Ridge Apartments (DEV-2026-014). Here are the changes I would prepare for review:",
      actions: [
        {
          id: "zoning",
          title: "Record zoning approval",
          detail: "Mark the zoning milestone complete in Entitlements",
          selected: true,
        },
        {
          id: "permit",
          title: "Create permitting task",
          detail: "Begin building permit process · Assign to Sarah",
          selected: true,
        },
        {
          id: "notify",
          title: "Notify James",
          detail: "Draft a project progress notification",
          selected: true,
        },
      ],
    };
  }

  if (scenario === "task") {
    return {
      role: "assistant",
      scenario,
      text: "I found Oak Creek Residences (DEV-2026-021). I can prepare this follow-up task:",
      actions: [
        {
          id: "task",
          title: "Follow up on environmental report",
          detail: "Assignee: Mike · Project: Oak Creek Residences",
          selected: true,
        },
        {
          id: "note",
          title: "Add project activity note",
          detail: "Record the requested environmental follow-up",
          selected: true,
        },
      ],
    };
  }

  if (scenario === "portfolio") {
    return {
      role: "assistant",
      scenario,
      text:
        "Here's an illustrative portfolio snapshot based on the demo projects:\n\n" +
        "• North Ridge Apartments — Due Diligence · In Progress (35%)\n" +
        "• Westfield Commercial — Entitlements · Needs Review (58%)\n" +
        "• Oak Creek Residences — Acquisition · In Progress (12%)\n" +
        "• Central Plaza — Construction · Blocked (81%)\n\n" +
        "Suggested focus: review the Central Plaza blocker and Westfield's outstanding approvals. These are sample values, not live project data.",
    };
  }

  return {
    role: "assistant",
    scenario,
    text: "I can demonstrate project updates, task assignments, and portfolio summaries. For this demo, try one of the suggested prompts below. Live AI understanding will be added after the demo.",
  };
}

export default function PivotAIPanel({
  visible,
  onClose,
  activeWorkspace,
}: Props) {
  const { width } = useWindowDimensions();

  const mobile = width < 900;
  const panelWidth = mobile ? width : Math.min(440, width - 260);

  const translateX = useRef(new Animated.Value(panelWidth)).current;

  const scrollRef = useRef<React.ElementRef<typeof ScrollView>>(null);

  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [thinking, setThinking] = useState(false);
  const [pendingScenario, setPendingScenario] = useState<Scenario | null>(null);

  useEffect(() => {
    Animated.timing(translateX, {
      toValue: visible ? 0 : panelWidth,
      duration: 280,
      useNativeDriver: true,
    }).start();
  }, [visible, panelWidth, translateX]);

  useEffect(() => {
    if (!thinking || !pendingScenario) return;

    const timeout = setTimeout(() => {
      setMessages((current) => [
        ...current,
        {
          id: generateMessageId(),
          ...responseFor(pendingScenario),
        },
      ]);

      setThinking(false);
      setPendingScenario(null);
    }, 650);

    return () => clearTimeout(timeout);
  }, [thinking, pendingScenario]);

  const submit = (preset?: string) => {
    const text = (preset ?? draft).trim();

    if (!text || thinking) return;

    setMessages((current) => [
      ...current,
      {
        id: generateMessageId(),
        role: "user",
        text,
      },
    ]);

    setDraft("");
    setPendingScenario(classify(text));
    setThinking(true);
  };

  const toggleAction = (messageId: string, actionId: string) => {
    setMessages((current) =>
      current.map((message) =>
        message.id !== messageId || message.approved
          ? message
          : {
              ...message,
              actions: message.actions?.map((action) =>
                action.id === actionId
                  ? {
                      ...action,
                      selected: !action.selected,
                    }
                  : action,
              ),
            },
      ),
    );
  };

  const approve = (messageId: string) => {
    const target = messages.find((message) => message.id === messageId);

    if (!target || target.approved) return;

    const chosen = target.actions?.filter((action) => action.selected) ?? [];

    if (!chosen.length) return;

    setMessages((current) => [
      ...current.map((message) =>
        message.id === messageId ? { ...message, approved: true } : message,
      ),
      {
        id: generateMessageId(),
        role: "assistant",
        text:
          `Demo complete — ${chosen.length} action${
            chosen.length === 1 ? "" : "s"
          } simulated:\n\n` +
          chosen.map((action) => `✓ ${action.title}`).join("\n") +
          "\n\nNo real records, emails, or notifications were changed.",
      },
    ]);
  };

  const reset = () => {
    setMessages([]);
    setDraft("");
    setThinking(false);
    setPendingScenario(null);
  };

  // Render mobile in a native Modal so the dashboard/sidebar cannot clip
  // or constrain the AI panel. Desktop retains the existing slide-out.
  const panel = (
    <Animated.View
      style={[
        styles.panel,
        mobile && styles.mobilePanel,
        {
          width: mobile ? "100%" : panelWidth,
          transform: [{ translateX: mobile ? 0 : translateX }],
        },
      ]}
    >
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <View style={styles.headingLeft}>
            <View style={styles.sparkleIcon}>
              <Ionicons name="sparkles" size={20} color={C.orange} />
            </View>

            <View>
              <Text style={styles.title}>Pivot AI</Text>
              <Text style={styles.subtitle}>
                Your project operations assistant
              </Text>
            </View>
          </View>

          <View style={styles.headerActions}>
            <TouchableOpacity
              onPress={reset}
              accessibilityLabel="Reset demo"
              style={styles.iconButton}
            >
              <Ionicons name="refresh-outline" size={19} color={C.muted} />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onClose}
              accessibilityLabel="Close Pivot AI"
              style={styles.iconButton}
            >
              <Ionicons name="close" size={23} color={C.muted} />
            </TouchableOpacity>
          </View>
        </View>

        {/* DEMO INDICATOR */}
        <View style={styles.demoBar}>
          <Ionicons name="flask-outline" size={14} color={C.orange} />
          <Text style={styles.demoText}>DEMO MODE · SIMULATED ACTIONS</Text>
        </View>

        {/* CONVERSATION */}
        <ScrollView
          ref={scrollRef}
          style={styles.flex}
          contentContainerStyle={styles.conversation}
          keyboardShouldPersistTaps="handled"
          onContentSizeChange={() =>
            scrollRef.current?.scrollToEnd({
              animated: true,
            })
          }
        >
          {messages.length === 0 ? (
            <View>
              <View style={styles.welcomeIcon}>
                <Ionicons name="sparkles-outline" size={27} color={C.orange} />
              </View>

              <Text style={styles.welcomeTitle}>What can I help you with?</Text>

              <Text style={styles.welcomeText}>
                Turn everyday project updates into organized actions. Choose a
                demo scenario or type your own note.
              </Text>

              <Text style={styles.sectionLabel}>TRY A DEMO SCENARIO</Text>

              {PROMPTS.map((item) => (
                <TouchableOpacity
                  key={item.title}
                  style={styles.suggestion}
                  onPress={() => submit(item.text)}
                >
                  <View style={styles.suggestionCopy}>
                    <Text style={styles.suggestionTitle}>{item.title}</Text>

                    <Text style={styles.suggestionDetail}>{item.text}</Text>
                  </View>

                  <Ionicons name="arrow-forward" size={16} color={C.orange} />
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View style={styles.messages}>
              {messages.map((message) => (
                <View
                  key={message.id}
                  style={
                    message.role === "user"
                      ? styles.userBubble
                      : styles.assistantMessage
                  }
                >
                  {message.role === "assistant" && (
                    <View style={styles.assistantLabel}>
                      <Ionicons name="sparkles" size={13} color={C.orange} />
                      <Text style={styles.assistantLabelText}>
                        PIVOT AI · DEMO
                      </Text>
                    </View>
                  )}

                  <Text style={styles.messageText}>{message.text}</Text>

                  {message.actions && (
                    <View style={styles.actionCard}>
                      <Text style={styles.actionHeading}>PROPOSED ACTIONS</Text>

                      {message.actions.map((action) => (
                        <TouchableOpacity
                          key={action.id}
                          disabled={message.approved}
                          onPress={() => toggleAction(message.id, action.id)}
                          style={styles.actionRow}
                        >
                          <Ionicons
                            name={
                              action.selected ? "checkbox" : "square-outline"
                            }
                            size={23}
                            color={action.selected ? C.orange : C.muted}
                          />

                          <View style={styles.actionCopy}>
                            <Text style={styles.actionTitle}>
                              {action.title}
                            </Text>

                            <Text style={styles.actionDetail}>
                              {action.detail}
                            </Text>
                          </View>
                        </TouchableOpacity>
                      ))}

                      {message.approved ? (
                        <View style={styles.approvedRow}>
                          <Ionicons
                            name="checkmark-circle"
                            size={18}
                            color={C.green}
                          />
                          <Text style={styles.approvedText}>
                            Simulation approved
                          </Text>
                        </View>
                      ) : (
                        <TouchableOpacity
                          disabled={
                            !message.actions.some((action) => action.selected)
                          }
                          onPress={() => approve(message.id)}
                          style={[
                            styles.approveButton,
                            !message.actions.some(
                              (action) => action.selected,
                            ) && styles.disabled,
                          ]}
                        >
                          <Text style={styles.approveText}>
                            Approve selected actions
                          </Text>

                          <Ionicons
                            name="arrow-forward"
                            size={16}
                            color={C.white}
                          />
                        </TouchableOpacity>
                      )}
                    </View>
                  )}
                </View>
              ))}

              {thinking && (
                <View style={styles.thinkingRow}>
                  <Ionicons name="sparkles" size={15} color={C.orange} />
                  <Text style={styles.thinkingText}>
                    Pivot AI is reviewing your update…
                  </Text>
                </View>
              )}

              {!thinking && (
                <View style={styles.quickPrompts}>
                  {PROMPTS.map((item) => (
                    <TouchableOpacity
                      key={item.title}
                      onPress={() => submit(item.text)}
                      style={styles.quickPrompt}
                    >
                      <Text style={styles.quickPromptText}>{item.title}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          )}
        </ScrollView>

        {/* MESSAGE COMPOSER */}
        <View style={styles.composerArea}>
          <Text style={styles.context}>
            CURRENT WORKSPACE · {activeWorkspace.toUpperCase()}
          </Text>

          <View style={styles.composer}>
            <TextInput
              style={styles.input}
              value={draft}
              onChangeText={setDraft}
              placeholder="Type a project update or ask Pivot..."
              placeholderTextColor="#9CA3A9"
              multiline
              textAlignVertical="top"
              accessibilityLabel="Pivot AI message"
              onKeyPress={(e) => {
                if (Platform.OS !== "web") return;

                const event = e.nativeEvent as typeof e.nativeEvent & {
                  shiftKey?: boolean;
                  preventDefault?: () => void;
                };

                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault?.();
                  submit();
                }
              }}
            />
            <View style={styles.composerBottom}>
              <Text style={styles.helper}>Sample responses · No live AI</Text>

              <TouchableOpacity
                onPress={() => submit()}
                disabled={!draft.trim() || thinking}
                style={[
                  styles.send,
                  (!draft.trim() || thinking) && styles.disabled,
                ]}
                accessibilityLabel="Submit demo message"
              >
                <Ionicons name="arrow-up" size={19} color={C.white} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Animated.View>
  );

  if (mobile) {
    return (
      <Modal
        visible={visible}
        transparent={false}
        animationType="slide"
        onRequestClose={onClose}
        statusBarTranslucent={false}
      >
        <View style={styles.mobileModal}>{panel}</View>
      </Modal>
    );
  }

  return (
    <View pointerEvents="box-none" style={StyleSheet.absoluteFill}>
      {panel}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },

  mobileModal: {
    flex: 1,
    backgroundColor: C.white,
  },
  mobilePanel: {
    position: "relative",
    top: undefined,
    bottom: undefined,
    right: undefined,
    flex: 1,
    borderLeftWidth: 0,
    elevation: 0,
    shadowOpacity: 0,
  },

  panel: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: C.white,
    borderLeftWidth: 1,
    borderLeftColor: C.border,
    shadowColor: "#000",
    shadowOpacity: 0.14,
    shadowRadius: 20,
    shadowOffset: {
      width: -5,
      height: 0,
    },
    elevation: 12,
  },

  header: {
    minHeight: 82,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },

  headingLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  sparkleIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: C.orangeLight,
    alignItems: "center",
    justifyContent: "center",
  },

  title: {
    color: C.text,
    fontSize: 17,
    fontWeight: "800",
  },

  subtitle: {
    color: C.muted,
    fontSize: 11,
    marginTop: 3,
  },

  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },

  iconButton: {
    padding: 7,
  },

  demoBar: {
    backgroundColor: "#FBF5EF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },

  demoText: {
    color: C.orange,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1,
  },

  conversation: {
    padding: 22,
    flexGrow: 1,
  },

  welcomeIcon: {
    width: 54,
    height: 54,
    backgroundColor: C.orangeLight,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 22,
    marginBottom: 20,
  },

  welcomeTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: C.text,
    marginBottom: 12,
  },

  welcomeText: {
    fontSize: 14,
    lineHeight: 22,
    color: C.muted,
    marginBottom: 28,
  },

  sectionLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: C.muted,
    letterSpacing: 1.5,
    marginBottom: 12,
  },

  suggestion: {
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 13,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    gap: 8,
  },

  suggestionCopy: {
    flex: 1,
  },

  suggestionTitle: {
    color: C.text,
    fontSize: 13,
    fontWeight: "800",
    marginBottom: 4,
  },

  suggestionDetail: {
    color: C.muted,
    fontSize: 11,
    lineHeight: 17,
  },

  messages: {
    gap: 16,
  },

  userBubble: {
    backgroundColor: C.orangeLight,
    padding: 14,
    borderRadius: 13,
    alignSelf: "flex-end",
    maxWidth: "92%",
  },

  assistantMessage: {
    alignSelf: "stretch",
  },

  assistantLabel: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },

  assistantLabelText: {
    color: C.orange,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.7,
  },

  messageText: {
    color: C.text,
    fontSize: 13,
    lineHeight: 21,
  },

  actionCard: {
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 12,
    marginTop: 14,
    padding: 14,
  },

  actionHeading: {
    color: C.muted,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1,
    marginBottom: 9,
  },

  actionRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },

  actionCopy: {
    flex: 1,
  },

  actionTitle: {
    color: C.text,
    fontSize: 12,
    fontWeight: "800",
  },

  actionDetail: {
    color: C.muted,
    fontSize: 11,
    lineHeight: 17,
    marginTop: 4,
  },

  approveButton: {
    backgroundColor: C.orange,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 9,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 14,
  },

  approveText: {
    color: C.white,
    fontSize: 12,
    fontWeight: "800",
  },

  approvedRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    marginTop: 13,
  },

  approvedText: {
    color: C.green,
    fontSize: 12,
    fontWeight: "700",
  },

  disabled: {
    opacity: 0.4,
  },

  thinkingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  thinkingText: {
    color: C.muted,
    fontSize: 12,
  },

  quickPrompts: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 7,
  },

  quickPrompt: {
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 15,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },

  quickPromptText: {
    color: C.orange,
    fontSize: 11,
    fontWeight: "700",
  },

  composerArea: {
    borderTopWidth: 1,
    borderTopColor: C.border,
    padding: 18,
    paddingBottom: 24,
  },

  context: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1,
    color: C.muted,
    marginBottom: 10,
  },

  composer: {
    borderWidth: 1,
    borderColor: "#DADFE2",
    borderRadius: 12,
    padding: 12,
    minHeight: 126,
  },

  input: {
    minHeight: 65,
    maxHeight: 150,
    color: C.text,
    fontSize: 14,
  },

  composerBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },

  helper: {
    fontSize: 10,
    color: C.muted,
  },

  send: {
    width: 35,
    height: 35,
    borderRadius: 9,
    backgroundColor: C.orange,
    alignItems: "center",
    justifyContent: "center",
  },
});
