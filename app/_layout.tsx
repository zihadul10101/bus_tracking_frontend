// ✅ FIX: locationService.ts কে side-effect import হিসেবে সবার আগে import
// করা হচ্ছে — এতে app চালু হওয়ার সাথে সাথেই TaskManager.defineTask()
// register হয়ে যাবে, driver AssignBusScreen এ যাওয়ার আগেই। এটা না করলে
// production Hermes bundle এ module evaluation order আলাদা হয়ে task
// define হওয়ার আগেই startLocationUpdatesAsync কল হয়ে crash করতে পারে।
import { colors } from "@/constants/colors";
import CustomDrawerContent from "@/src/components/CustomDrawer";
import { AppProvider, useApp } from "@/src/context/AppContext";
import NetInfo from "@react-native-community/netinfo";
import { Drawer } from "expo-router/drawer";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  View,
  useWindowDimensions,
} from "react-native";
import { Provider as PaperProvider } from "react-native-paper";
import { SafeAreaProvider } from "react-native-safe-area-context";
import '../src/services/locationService';

function RootLayoutContent() {
  const { width } = useWindowDimensions();
  const responsiveWidth = width > 600 ? 340 : width * 0.78;

  const { isAuthenticated, loading } = useApp();
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      const connected =
        state.isConnected === true && state.isInternetReachable !== false;
      setIsConnected(connected);
    });
    return () => unsubscribe();
  }, []);


  // ✅ AppContext এখনো offline cache লোড করছে — এই সময়টায় isAuthenticated
  // এর মান ভরসাযোগ্য না, তাই শুধু `loading` দিয়েই গার্ড করা হচ্ছে
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors?.primary || "#007AFF"} />
      </View>
    );
  }

  return (
    <PaperProvider>
      <SafeAreaProvider>
        <Drawer
          initialRouteName="index"
          drawerContent={(props) => <CustomDrawerContent {...props} />}
          screenOptions={{
            headerShown: false,
            drawerStyle: {
              width: responsiveWidth,
              borderTopRightRadius: 24,
              borderBottomRightRadius: 24,
            },
          }}
        >
          <Drawer.Screen
            name="index"
            options={{ drawerItemStyle: { display: "none" } }}
          />
          <Drawer.Screen
            name="welcome"
            options={{ drawerItemStyle: { display: "none" } }}
          />
          <Drawer.Screen
            name="(auth)"
            options={{ drawerItemStyle: { display: "none" } }}
          />
          <Drawer.Screen name="(tabs)" />
        </Drawer>
      </SafeAreaProvider>
    </PaperProvider>
  );
}


export default function RootLayout() {
  return (
    <AppProvider>
      <RootLayoutContent />
    </AppProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
});