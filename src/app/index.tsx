import { SafeAreaView, StatusBar, StyleSheet, Text, View } from "react-native";

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      <View style={styles.content}>
        <View style={styles.logo}>
          <Text style={styles.logoText}>D</Text>
        </View>

        <Text style={styles.eyebrow}>COMING SOON</Text>

        <Text style={styles.title}>Development{"\n"}Workflow Platform</Text>

        <Text style={styles.subtitle}>
          Streamlining projects, processes, and progress.
        </Text>

        <View style={styles.divider} />

        <Text style={styles.footer}>A better way to manage development.</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#202A32",
  },
  content: {
    flex: 1,
    minHeight: 600,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 60,
  },
  logo: {
    width: 64,
    height: 64,
    backgroundColor: "#C47B42",
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 36,
  },
  logoText: {
    color: "#FFFFFF",
    fontSize: 36,
    fontWeight: "800",
  },
  eyebrow: {
    color: "#D99560",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 4,
    marginBottom: 20,
  },
  title: {
    color: "#F4F0E9",
    fontSize: 42,
    fontWeight: "700",
    textAlign: "center",
    lineHeight: 52,
    marginBottom: 20,
  },
  subtitle: {
    color: "#B6BEC3",
    fontSize: 17,
    textAlign: "center",
    lineHeight: 28,
    maxWidth: 480,
  },
  divider: {
    width: 60,
    height: 2,
    backgroundColor: "#C47B42",
    marginVertical: 36,
  },
  footer: {
    color: "#89949D",
    fontSize: 13,
    textAlign: "center",
  },
});
