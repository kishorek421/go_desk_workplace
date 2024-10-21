import { Stack } from "expo-router";

const Layout = () => {
  return (
    <Stack>
      <Stack.Screen name="welcome" options={{ headerShown: false }} />
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen
        name="registration/[customerLeadId]"
        options={{ headerTitle: "Registration", headerBackTitle: "Login" }}
      />
    </Stack>
  );
};

export default Layout;