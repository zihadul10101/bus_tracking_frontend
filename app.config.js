require('dotenv').config();

export default {
  expo: {
    name: "Southern Transport",
    slug: "southern-transport",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "trackingapp",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    ios: {
      supportsTablet: true
    },
    android: {
      adaptiveIcon: {
        backgroundColor: "#E6F4FE",
        foregroundImage: "./assets/images/adaptive-icon.png"
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
      package: "com.zihadulsub317.southerntransport",
      config: {
        googleMaps: {
          apiKey: process.env.GOOGLE_MAPS_API_KEY
        }
      },
      permissions: [
        "android.permission.ACCESS_COARSE_LOCATION",
        "android.permission.ACCESS_FINE_LOCATION",
        "android.permission.ACCESS_BACKGROUND_LOCATION",
        "android.permission.FOREGROUND_SERVICE",
        "android.permission.FOREGROUND_SERVICE_LOCATION",
        "android.permission.POST_NOTIFICATIONS",
        "android.permission.INTERNET",
        "android.permission.ACCESS_NETWORK_STATE"
      ]
    },
    web: {
      output: "static",
      favicon: "./assets/images/icon.png"
    },
    plugins: [
      "expo-router",
      [
        "expo-build-properties",
        {
          android: {
            compileSdkVersion: 35,
            targetSdkVersion: 35,
            buildToolsVersion: "35.0.0"
          }
        }
      ],
      [
        "expo-splash-screen",
        {
          image: "./assets/images/icon.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#ffffff",
          dark: {
            backgroundColor: "#000000"
          }
        }
      ],
      [
        "expo-location",
        {
          locationAlwaysAndWhenInUsePermission: "Allow $(PRODUCT_NAME) to use your location to share bus status.",
          locationWhenInUsePermission: "Allow $(PRODUCT_NAME) to use your location to share bus status.",
          isAndroidBackgroundLocationEnabled: true,
          isAndroidForegroundServiceEnabled: true
        }
      ],
      "expo-secure-store",
      "expo-task-manager",
      [
        "expo-notifications",
        {
          icon: "./assets/images/icon.png",
          color: "#004b8d"
        }
      ],
      "expo-font",
      "expo-web-browser"
    ],
    experiments: {
      typedRoutes: true,
      reactCompiler: true
    },
    extra: {
      router: {},
      eas: {
        projectId: "4b6e1f13-bea4-46c6-a122-101a7eed9fb8"
      }
    },
    owner: "zihadulsub317"
  }
};