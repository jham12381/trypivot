import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";

const COLORS = {
  charcoal: "#202A32",
  dark: "#172129",
  orange: "#C47B42",
  orangeLight: "#E3A574",
  cream: "#F5F2EC",
  white: "#FFFFFF",
  text: "#26313A",
  muted: "#7B858D",
  border: "#DFE2E3",
};

export default function HomeScreen() {
  const { width } = useWindowDimensions();

  // Expo's static web render may report a mobile-sized width on desktop.
  // After hydration, read the browser viewport directly and keep it in sync.
  const [browserWidth, setBrowserWidth] = useState<number | null>(null);

  useEffect(() => {
    if (Platform.OS !== "web") return;

    const updateWidth = () => setBrowserWidth(window.innerWidth);
    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  const isDesktop =
    (Platform.OS === "web" ? browserWidth : width) !== null &&
    (Platform.OS === "web" ? browserWidth! : width) >= 900;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleLogin = () => {
    // Demo mode: no authentication required
    router.push("/dashboard");
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={[styles.page, !isDesktop && styles.mobilePage]}>
          {/* LEFT BRANDING PANEL */}
          <View
            style={[styles.brandPanel, !isDesktop && styles.mobileBrandPanel]}
          >
            <View style={styles.brandHeader}>
              <View style={styles.logo}>
                <Ionicons
                  name="layers-outline"
                  size={24}
                  color={COLORS.white}
                />
              </View>

              <Text style={styles.brandName}>
                PIVOT<Text style={styles.brandDot}>.</Text>
              </Text>
            </View>

            <View style={styles.brandContent}>
              <View style={styles.eyebrowContainer}>
                <View style={styles.orangeLine} />
                <Text style={styles.eyebrow}>
                  DEVELOPMENT WORKFLOW PLATFORM
                </Text>
              </View>

              <Text
                style={[styles.headline, !isDesktop && styles.mobileHeadline]}
              >
                Every project.{"\n"}
                Every process.{"\n"}
                <Text style={styles.headlineAccent}>One direction.</Text>
              </Text>

              <Text style={styles.description}>
                A smarter way to coordinate development, streamline approvals,
                and keep every project moving forward.
              </Text>
            </View>

            <View style={styles.brandFooter}>
              <View style={styles.footerLine} />
              <Text style={styles.brandFooterText}>
                BUILT FOR THE WAY YOU DEVELOP
              </Text>
            </View>

            <View style={styles.decorativeCircleOne} />
            <View style={styles.decorativeCircleTwo} />
          </View>

          {/* RIGHT LOGIN PANEL */}
          <View
            style={[styles.loginPanel, !isDesktop && styles.mobileLoginPanel]}
          >
            <View style={styles.loginContent}>
              <View style={styles.welcomeBadge}>
                <View style={styles.statusDot} />
                <Text style={styles.welcomeBadgeText}>YOUR WORKSPACE</Text>
              </View>

              <Text style={styles.loginTitle}>Welcome back</Text>

              <Text style={styles.loginSubtitle}>
                Sign in to access your development workspace.
              </Text>

              {/* EMAIL */}
              <View style={styles.field}>
                <Text style={styles.label}>Email address</Text>

                <View style={styles.inputWrapper}>
                  <Ionicons
                    name="mail-outline"
                    size={19}
                    color={COLORS.muted}
                  />

                  <TextInput
                    style={styles.input}
                    placeholder="name@company.com"
                    placeholderTextColor="#A4ACB1"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                  />
                </View>
              </View>

              {/* PASSWORD */}
              <View style={styles.field}>
                <Text style={styles.label}>Password</Text>

                <View style={styles.inputWrapper}>
                  <Ionicons
                    name="lock-closed-outline"
                    size={19}
                    color={COLORS.muted}
                  />

                  <TextInput
                    style={styles.input}
                    placeholder="Enter your password"
                    placeholderTextColor="#A4ACB1"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    autoComplete="current-password"
                  />

                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    accessibilityLabel={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    <Ionicons
                      name={showPassword ? "eye-off-outline" : "eye-outline"}
                      size={20}
                      color={COLORS.muted}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.forgotRow}>
                <Text style={styles.forgotText}>Forgot password?</Text>
              </View>

              {/* LOGIN BUTTON */}
              <TouchableOpacity
                style={styles.loginButton}
                onPress={handleLogin}
                activeOpacity={0.85}
              >
                <Text style={styles.loginButtonText}>Sign in to workspace</Text>

                <Ionicons name="arrow-forward" size={20} color={COLORS.white} />
              </TouchableOpacity>

              <View style={styles.loginDivider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>SECURE ACCESS</Text>
                <View style={styles.dividerLine} />
              </View>

              <View style={styles.securityNotice}>
                <Ionicons
                  name="shield-checkmark-outline"
                  size={19}
                  color={COLORS.muted}
                />

                <Text style={styles.securityText}>
                  Authorized personnel only. Your workspace and project
                  information are protected.
                </Text>
              </View>
            </View>

            <View style={styles.loginFooter}>
              <Text style={styles.copyright}>
                © {new Date().getFullYear()} Pivot. All rights reserved.
              </Text>

              <Text style={styles.version}>PLATFORM v0.1</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.cream,
  },
  scrollContent: { flexGrow: 1 },
  page: {
    flexGrow: 1,
    flexDirection: "row",
    minHeight: "100%",
  },
  mobilePage: {
    flexDirection: "column",
  },

  // BRAND PANEL
  brandPanel: {
    width: "52%",
    backgroundColor: COLORS.charcoal,
    padding: 52,
    justifyContent: "space-between",
    overflow: "hidden",
    position: "relative",
    minHeight: 700,
  },
  mobileBrandPanel: {
    width: "100%",
    minHeight: 350,
    padding: 28,
  },
  brandHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    zIndex: 2,
  },
  logo: {
    width: 42,
    height: 42,
    borderRadius: 10,
    backgroundColor: COLORS.orange,
    justifyContent: "center",
    alignItems: "center",
  },
  brandName: {
    fontSize: 23,
    fontWeight: "800",
    color: COLORS.white,
    letterSpacing: 3,
  },
  brandDot: {
    color: COLORS.orangeLight,
  },
  brandContent: {
    zIndex: 2,
    maxWidth: 600,
  },
  eyebrowContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 28,
  },
  orangeLine: {
    width: 28,
    height: 2,
    backgroundColor: COLORS.orange,
  },
  eyebrow: {
    color: COLORS.orangeLight,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 2,
    flexShrink: 1,
  },
  headline: {
    color: COLORS.white,
    fontSize: 54,
    fontWeight: "800",
    lineHeight: 67,
    letterSpacing: -1.5,
  },
  mobileHeadline: {
    fontSize: 34,
    lineHeight: 43,
    marginTop: 25,
  },
  headlineAccent: {
    color: COLORS.orangeLight,
  },
  description: {
    color: "#AEB9C0",
    fontSize: 17,
    lineHeight: 29,
    maxWidth: 440,
    marginTop: 26,
  },
  brandFooter: {
    zIndex: 2,
  },
  footerLine: {
    width: 42,
    height: 2,
    backgroundColor: COLORS.orange,
    marginBottom: 14,
  },
  brandFooterText: {
    color: "#81909B",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 2,
  },
  decorativeCircleOne: {
    position: "absolute",
    width: 550,
    height: 550,
    borderRadius: 275,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    right: -250,
    top: 90,
  },
  decorativeCircleTwo: {
    position: "absolute",
    width: 380,
    height: 380,
    borderRadius: 190,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.04)",
    right: -160,
    top: 170,
  },

  // LOGIN PANEL
  loginPanel: {
    flex: 1,
    backgroundColor: COLORS.cream,
    paddingHorizontal: 48,
    paddingVertical: 40,
    justifyContent: "space-between",
    alignItems: "center",
    minHeight: 700,
  },
  mobileLoginPanel: {
    width: "100%",
    flex: 0,
    paddingHorizontal: 28,
  },
  loginContent: {
    width: "100%",
    maxWidth: 420,
    flexGrow: 1,
    justifyContent: "center",
  },
  welcomeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 18,
  },
  statusDot: {
    width: 7,
    height: 7,
    backgroundColor: COLORS.orange,
    borderRadius: 4,
  },
  welcomeBadgeText: {
    color: COLORS.orange,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 2,
  },
  loginTitle: {
    fontSize: 36,
    fontWeight: "800",
    color: COLORS.text,
    letterSpacing: -1,
    marginBottom: 10,
  },
  loginSubtitle: {
    fontSize: 15,
    color: COLORS.muted,
    lineHeight: 24,
    marginBottom: 36,
  },
  field: {
    marginBottom: 22,
  },
  label: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 10,
  },
  inputWrapper: {
    height: 54,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    gap: 12,
  },
  input: {
    flex: 1,
    height: "100%",
    fontSize: 15,
    color: COLORS.text,
    outlineStyle: "none",
  } as any,
  forgotRow: {
    alignItems: "flex-end",
    marginTop: -4,
    marginBottom: 26,
  },
  forgotText: {
    color: COLORS.orange,
    fontSize: 13,
    fontWeight: "700",
  },
  loginButton: {
    height: 56,
    backgroundColor: COLORS.orange,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 14,
  },
  loginButtonText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: "800",
  },
  loginDivider: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginTop: 36,
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },
  dividerText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#A1A9AE",
    letterSpacing: 2,
  },
  securityNotice: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  securityText: {
    color: COLORS.muted,
    fontSize: 12,
    lineHeight: 19,
    flex: 1,
  },
  loginFooter: {
    width: "100%",
    maxWidth: 420,
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    paddingTop: 30,
  },
  copyright: {
    color: "#A1A9AE",
    fontSize: 11,
  },
  version: {
    color: "#A1A9AE",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1,
  },
});
