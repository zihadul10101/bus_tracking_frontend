import { Redirect } from "expo-router";

export default function Index() {
  // When app starts, go to welcome screen
  return <Redirect href="/welcome" />;
}
