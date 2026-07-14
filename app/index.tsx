import { useApp } from "@/src/context/AppContext";
import { Redirect } from "expo-router";

export default function Index() {
  const { isAuthenticated } = useApp();

  return isAuthenticated ? (
    <Redirect href="/(tabs)/home" />
  ) : (
    <Redirect href="/(auth)" />
  );
}