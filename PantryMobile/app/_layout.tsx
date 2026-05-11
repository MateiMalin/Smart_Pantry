import { Stack } from "expo-router";

// The root layout must be a Stack so that auth routes (/auth/login, /auth/register)
// and app routes (/main/pantry) can all be navigated to freely.
// A Tabs layout only renders the screens defined as Tab.Screen children —
// any router.replace() to an unlisted route silently fails.
export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* index.tsx — splash/auth check */}
      <Stack.Screen name="index" />
      {/* Auth screens */}
      <Stack.Screen name="auth/login" />
      <Stack.Screen name="auth/register" />
      {/* Main app screens */}
      <Stack.Screen name="main/pantry" />
    </Stack>
  );
}
