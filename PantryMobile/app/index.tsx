import { useEffect } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { useRouter, useRootNavigationState } from "expo-router";
import { tokenService } from "../services/tokenService";

export default function Index() {
  const router = useRouter();
  const rootNavigationState = useRootNavigationState();

  useEffect(() => {
    if (!rootNavigationState?.key) return;

    const checkUserStatus = async () => {
      try {
        const token = await tokenService.getToken();
        if (token) {
          router.replace("/main/pantry");
        } else {
          router.replace("/auth/login");
        }
      } catch (error) {
        console.error("SecureStore Error:", error);
        router.replace("/auth/login");
      }
    };

    checkUserStatus();
  }, [rootNavigationState?.key]); //re-run every time there is a change in the root nav state

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#38bdf8" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0f172a",
  },
});
