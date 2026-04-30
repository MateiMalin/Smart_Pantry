import { useEffect } from "react";
import { View, ActivityIndicator, StyleSheet, Platform } from "react-native";
import { useRouter, useRootNavigationState } from "expo-router";
import * as SecureStore from "expo-secure-store";
//for storing auth data safely on the devide

export default function Index() {
  const router = useRouter();
  const rootNavigationState = useRootNavigationState();

  useEffect(() => {
    if (!rootNavigationState?.key) return;

    const checkUserStatus = async () => {
      if (Platform.OS === "web") {
        console.warn("SecureStore is not available on web");
        router.replace("/auth/login");
        return;
      }
      try {
        const token = await SecureStore.getItemAsync("userToken");
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
