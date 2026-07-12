
import { colors } from "@/constants/colors";
import CustomDrawerContent from "@/src/components/CustomDrawer";
import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";
import {
  useSegments
} from "expo-router";
import { Drawer } from "expo-router/drawer";
import React, {
  useCallback,
  useEffect,
  useState,
} from "react";
import {
  ActivityIndicator,
  StyleSheet,
  View,
  useWindowDimensions,
} from "react-native";
import { Provider as PaperProvider } from "react-native-paper";
import { SafeAreaProvider } from "react-native-safe-area-context";
import NoInternetScreen from "../components/NoInternetScreen";



export default function RootLayout() {
  const { width } = useWindowDimensions();

  const responsiveWidth =
    width > 600 ? 340 : width * 0.78;

  const segments = useSegments();

  const [isAuthenticated, setIsAuthenticated] =
    useState<boolean | null>(null);

  const [isConnected, setIsConnected] =
    useState(true);

  // _layout.tsx
  const checkAuth = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      setIsAuthenticated(!!token);
      // ❌ router.replace(...) কিছু করবেন না এখানে
    } catch (error) {
      console.log("Auth Error:", error);
      setIsAuthenticated(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(
      (state) => {
        const connected =
          state.isConnected === true &&
          state.isInternetReachable !== false;

        setIsConnected(connected);
      }
    );

    return () => unsubscribe();
  }, []);

  // Show Internet Screen
  if (!isConnected) {
    return <NoInternetScreen />;
  }

  // Loading
  if (isAuthenticated === null) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator
          size="large"
          color={colors?.primary || "#007AFF"}
        />
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

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
});