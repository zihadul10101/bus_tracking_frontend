import { DrawerActions } from '@react-navigation/native';
import { Tabs, useGlobalSearchParams, useNavigation, useRouter } from 'expo-router';
import { Bell, Bus, Home, LocateFixed, Menu } from 'lucide-react-native'; // ✅ Megaphone যোগ করা হলো
import React, { useEffect, useState } from 'react';
import { AppState, Platform, Text, TouchableOpacity, View } from 'react-native';
import { colors } from '../../constants/colors';
import { noticeService } from '../../src/services/noticeService';

export default function TabsLayout() {
  const router = useRouter();
  const navigation = useNavigation();
  const params = useGlobalSearchParams();

  const [unreadCount, setUnreadCount] = useState(0);

  const refreshUnreadCount = async () => {
    try {
      const count = await noticeService.getUnreadCount();
      setUnreadCount(count);
    } catch (error: any) {

      if (__DEV__) {
        console.log('[TabsLayout] unread count fetch failed:', error?.message || error);
      }
    }
  };

  useEffect(() => {
    refreshUnreadCount();
  }, []);


  useEffect(() => {
    const unsubscribe = navigation.addListener('state', () => {
      refreshUnreadCount();
    });
    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        refreshUnreadCount();
      }
    });
    return () => sub.remove();
  }, []);

  // ── Title map ──────────────────────────────────────────────────────────────
  const getRouteTitle = (routeName: string) => {
    // Core tabs
    if (routeName === 'home') return 'Home';
    if (routeName === 'transport') return 'Transport';
    // if (routeName === 'research/index') return 'Research';

    // Notifications
    if (routeName === 'notifications/index') return 'Notifications';
    if (routeName.startsWith('notifications/')) return 'Notice Details';

    // Sub-admins
    if (routeName === 'sub-admins/index') return 'Sub Admins';
    if (routeName === 'sub-admins/create') return 'Create Sub Admin';
    if (routeName.startsWith('sub-admins/')) return 'Edit Sub Admin';

    // Drivers
    if (routeName === 'drivers/index') return 'Drivers';
    if (routeName === 'drivers/create') return 'Create Driver';
    if (routeName.startsWith('drivers/')) return 'Edit Driver';

    // Notices
    if (routeName === 'notices/index') return 'Manage Notices';
    if (routeName === 'notices/create') return 'Create Notice';
    if (routeName.startsWith('notices/view-')) return 'Notice Preview';

    // Bus management
    if (routeName === 'bus-management/index') return 'Bus Fleet';
    if (routeName === 'bus-management/create') return 'Add New Bus';
    if (routeName === 'bus-management/edit/[id]') return 'Edit Bus Details';
    if (routeName === 'bus-management/trips/create') return 'Add New Trip';
    if (routeName === 'bus-management/trips/edit') return 'Edit Trip Schedule';
    if (routeName === 'bus-management/[id]') return 'Bus Details & Trips';

    // Driver work
    if (routeName === 'work-driver/assign-bus') return 'Assign Bus';
    if (routeName === 'work-driver/LiveTrackingView') return 'Live Tracking';

    // Live trips
    if (routeName === 'live-trips/index') return 'Live Trip';
    if (routeName.startsWith('live-trips/')) return 'Bus Location';




    return routeName.charAt(0).toUpperCase() + routeName.slice(1);
  };

  // ── Routes hidden from tab bar ─────────────────────────────────────────────
  const isHiddenFromTabBar = (routeName: string) =>
    routeName.startsWith('notifications') ||
    routeName.startsWith('sub-admins') ||
    routeName.startsWith('drivers') ||
    routeName.startsWith('notices') ||
    routeName.startsWith('bus-management') ||
    routeName.startsWith('work-driver') ||
    routeName.startsWith('LiveTrackingView')


  return (
    <Tabs
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let Icon;
          switch (route.name) {
            case 'home': Icon = Home; break;
            case 'transport': Icon = Bus; break;
          
            default: return null;
          }
          return <Icon size={size} color={color} />;
        },

        tabBarLabel: ({ color }) => {
          if (isHiddenFromTabBar(route.name)) return null;
          return (
            <Text style={{ color, fontSize: 10, fontFamily: 'Geist' }}>
              {getRouteTitle(route.name)}
            </Text>
          );
        },

        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.mutedForeground,
        headerShown: true,
        headerStyle: {
          backgroundColor: 'transparent',
          elevation: 0,
          shadowOpacity: 0,
          height: Platform.OS === 'ios' ? 130 : 115,
        },
        headerTitle: '',
        headerBackground: () => (
          <View style={{
            flex: 1,
            backgroundColor: colors.primary,
            borderBottomLeftRadius: 32,
            borderBottomRightRadius: 32,
            paddingTop: Platform.OS === 'ios' ? 60 : 45,
            paddingHorizontal: 20,
            elevation: 5,
          }}>
            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              width: '100%',
            }}>
              {/* ☰ Drawer */}
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
                style={{ padding: 4 }}
              >
                <Menu size={26} color={colors.primaryForeground} />
              </TouchableOpacity>

              {/* Title */}
              <Text style={{
                color: colors.primaryForeground,
                fontSize: 22,
                fontFamily: 'Geist',
                fontWeight: '700',
              }}>
                {getRouteTitle(route.name)}
              </Text>

              {/* 🔔 Bell */}
              <TouchableOpacity
                activeOpacity={0.7}
                style={{ padding: 4 }}
                onPress={() => {
                  setUnreadCount(0); // optimistic clear — real mark-as-read happens inside NotificationsScreen
                  router.push('/(tabs)/notifications' as any);
                }}
              >
                <View>
                  <Bell size={24} color={colors.primaryForeground} />
                  {unreadCount > 0 && (
                    <View style={{
                      position: 'absolute',
                      right: -3,
                      top: -3,
                      backgroundColor: '#ef4444',
                      borderRadius: 10,
                      minWidth: 16,
                      height: 16,
                      paddingHorizontal: 3,
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}>
                      <Text style={{ color: '#ffffff', fontSize: 9, fontWeight: 'bold' }}>
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            </View>
          </View>
        ),
      })}
    >
      {/* ════════════════════════════════════════════════════════════════════
          VISIBLE TABS (bottom tab bar)
      ════════════════════════════════════════════════════════════════════ */}
      <Tabs.Screen name="home" options={{ title: 'Home' }} />
       <Tabs.Screen name="live-trips/index" options={{ title: 'Live Trip', tabBarIcon: ({ color, size }) => <LocateFixed size={size} color={color} /> }} />
      <Tabs.Screen name="transport" options={{ title: 'Transport' }} />
     
  

      {/* ════════════════════════════════════════════════════════════════════
          HIDDEN — Live Trips detail
      ════════════════════════════════════════════════════════════════════ */}
      <Tabs.Screen name="live-trips/[busId]" options={{ href: null }} />
      <Tabs.Screen name="profile" options={{ href: null }} />

      {/* ════════════════════════════════════════════════════════════════════
          HIDDEN — Notifications
      ════════════════════════════════════════════════════════════════════ */}
      <Tabs.Screen name="notifications/index" options={{ href: null }} />
      <Tabs.Screen name="notifications/[id]" options={{ href: null }} />

      {/* ════════════════════════════════════════════════════════════════════
          HIDDEN — Sub-admins
      ════════════════════════════════════════════════════════════════════ */}
      <Tabs.Screen name="sub-admins/index" options={{ href: null }} />
      <Tabs.Screen name="sub-admins/create" options={{ href: null }} />
      <Tabs.Screen name="sub-admins/[id]" options={{ href: null }} />

      {/* ════════════════════════════════════════════════════════════════════
          HIDDEN — Drivers
      ════════════════════════════════════════════════════════════════════ */}
      <Tabs.Screen name="drivers/index" options={{ href: null }} />
      <Tabs.Screen name="drivers/create" options={{ href: null }} />
      <Tabs.Screen name="drivers/[id]" options={{ href: null }} />

      {/* ════════════════════════════════════════════════════════════════════
          HIDDEN — Notices
      ════════════════════════════════════════════════════════════════════ */}
      <Tabs.Screen name="notices/index" options={{ href: null }} />
      <Tabs.Screen name="notices/create" options={{ href: null }} />
      <Tabs.Screen name="notices/view-[id]" options={{ href: null }} />

      {/* ════════════════════════════════════════════════════════════════════
          HIDDEN — Bus Management
      ════════════════════════════════════════════════════════════════════ */}
      <Tabs.Screen name="bus-management/index" options={{ href: null }} />
      <Tabs.Screen name="bus-management/create" options={{ href: null }} />
      <Tabs.Screen name="bus-management/[id]" options={{ href: null }} />
      <Tabs.Screen name="bus-management/edit/[id]" options={{ href: null }} />
      <Tabs.Screen name="bus-management/trips/create" options={{ href: null }} />
      <Tabs.Screen name="bus-management/trips/edit" options={{ href: null }} />

      {/* ════════════════════════════════════════════════════════════════════
          HIDDEN — Driver Work
      ════════════════════════════════════════════════════════════════════ */}
      <Tabs.Screen name="work-driver/assign-bus" options={{ href: null }} />
      <Tabs.Screen name="work-driver/LiveTrackingView" options={{ href: null }} />

     
    </Tabs>
  );
}