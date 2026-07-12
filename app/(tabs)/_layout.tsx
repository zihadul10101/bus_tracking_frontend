import { DrawerActions } from '@react-navigation/native';
import { Tabs, useGlobalSearchParams, useNavigation, useRouter } from 'expo-router';
import { Bell, Bus, GraduationCap, Home, LocateFixed, Megaphone, Menu } from 'lucide-react-native'; // ✅ Megaphone যোগ করা হলো
import React, { useEffect, useState } from 'react';
import { AppState, Platform, Text, TouchableOpacity, View } from 'react-native';
import { colors } from '../../constants/colors';
import { noticeService } from '../../src/services/noticeService'; // 🆕 adjust path if your alias differs

export default function TabsLayout() {
  const router = useRouter();
  const navigation = useNavigation();
  const params = useGlobalSearchParams();

  // 🆕 was hardcoded to 3 before — now starts at 0 and gets filled from real data
  const [unreadCount, setUnreadCount] = useState(0);

  // 🆕 Pulls the real count from noticeService (AsyncStorage "last seen" timestamp
  // vs. notice createdAt dates — see noticeService.getUnreadCount()).
const refreshUnreadCount = async () => {
  try {
    const count = await noticeService.getUnreadCount();
    setUnreadCount(count);
  } catch (error: any) {
    // 🔕 background/badge feature — Alert দেখানোর দরকার নেই, silent fail
    if (__DEV__) {
      console.log('[TabsLayout] unread count fetch failed:', error?.message || error);
    }
    // ইচ্ছাকৃতভাবে unreadCount কে 0 করছি না —
    // সাময়িক network glitch এ আগের known badge count থেকে যাওয়াই ভালো UX
  }
};
  // 🆕 Fetch once when the tab layout first mounts (app open / login)
  useEffect(() => {
    refreshUnreadCount();
  }, []);

  // 🆕 Refetch whenever navigation state changes — covers coming back from
  // the notifications screen, switching tabs, etc. Cheap call, safe to repeat.
  useEffect(() => {
    const unsubscribe = navigation.addListener('state', () => {
      refreshUnreadCount();
    });
    return unsubscribe;
  }, [navigation]);

  // 🆕 Refetch when the app comes back to the foreground — catches the case
  // where an admin posted a new notice while this user's app was backgrounded.
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
    if (routeName === 'research/index') return 'Research';

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

    // Research
    if (routeName === 'research/submit') return 'Submit Research';
    if (routeName === 'research/my-submissions') return 'My Research';
    if (routeName === 'research/admin') return 'Research Review';

    // Admin
    if (routeName === 'entrepreneur/admin/dashboard') return 'Ent. Dashboard';
    if (routeName === 'entrepreneur/admin/businesses/index') return 'Manage Businesses';
    if (routeName === 'entrepreneur/admin/businesses/[id]') return 'Business Detail';
    if (routeName === 'entrepreneur/admin/ads/index') return 'Manage Ads';
    if (routeName === 'entrepreneur/admin/ads/[id]') return 'Ad Detail';
    if (routeName === 'entrepreneur/admin/payments/index') return 'Manage Payments';
    if (routeName === 'entrepreneur/admin/coupons/index') return 'Coupons';
    if (routeName === 'entrepreneur/admin/coupons/create') return 'Create Coupon';
    if (routeName === 'entrepreneur/admin/coupons/edit/[id]') return 'Edit Coupon';
    if (routeName === 'entrepreneur/admin/packages/index') return 'Packages';
    if (routeName === 'entrepreneur/admin/packages/create') return 'Create Package';
    if (routeName === 'entrepreneur/admin/packages/edit/[id]') return 'Edit Package';

    // Student
    if (routeName === 'entrepreneur/student/dashboard') return 'My Dashboard';
    if (routeName === 'entrepreneur/student/businesses/index') return 'All Businesses';
    if (routeName === 'entrepreneur/student/businesses/[id]') return 'Business Details';
    if (routeName === 'entrepreneur/student/businesses/create') return 'Create Business';
    if (routeName === 'entrepreneur/student/businesses/my-businesses') return 'My Businesses';
    if (routeName === 'entrepreneur/student/businesses/edit/[id]') return 'Edit Business';
    if (routeName === 'entrepreneur/student/ads/index') return 'Entrepreneur'; // ✅ bottom tab এর জন্য নতুন নাম
    if (routeName === 'entrepreneur/student/ads/[id]') return 'Ad Details';
    if (routeName === 'entrepreneur/student/ads/submit') return 'Submit Ad';
    if (routeName === 'entrepreneur/student/ads/my-ads') return 'My Ads';
    if (routeName === 'entrepreneur/student/ads/renew/[id]') return 'Renew Ad';
    if (routeName === 'entrepreneur/student/payments/index') return 'My Payments';
    if (routeName === 'entrepreneur/student/packages/index') return 'Packages';

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
    routeName.startsWith('LiveTrackingView') ||
    // ✅ 'entrepreneur/student/ads/index' বাদে বাকি সব entrepreneur route hidden থাকবে
    (routeName.startsWith('entrepreneur') && routeName !== 'entrepreneur/student/ads/index');

  return (
    <Tabs
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let Icon;
          switch (route.name) {
            case 'home': Icon = Home; break;
            case 'transport': Icon = Bus; break;
            case "research/index": Icon = GraduationCap; break;
            case 'entrepreneur/student/ads/index': Icon = Megaphone; break; // ✅ Ads Feed আইকন
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
      <Tabs.Screen name="transport" options={{ title: 'Transport' }} />
      <Tabs.Screen name="live-trips/index" options={{ title: 'Live Trip', tabBarIcon: ({ color, size }) => <LocateFixed size={size} color={color} /> }} />
      <Tabs.Screen
        name="research/index"
        options={{
          title: 'Research',
          tabBarIcon: ({ color, size }) => <GraduationCap size={size} color={color} />,
        }}
      />

      {/* ✅ নতুন visible tab — Ads Feed */}
      <Tabs.Screen
        name="entrepreneur/student/ads/index"
        options={{
          title: 'Entrepreneur',
          tabBarIcon: ({ color, size }) => <Megaphone size={size} color={color} />,
        }}
      />

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

      {/* ════════════════════════════════════════════════════════════════════
          HIDDEN — Research
      ════════════════════════════════════════════════════════════════════ */}
      <Tabs.Screen name="research/submit" options={{ href: null }} />
      <Tabs.Screen name="research/my-submissions" options={{ href: null }} />
      <Tabs.Screen name="research/admin" options={{ href: null }} />

      {/* ── ADMIN ───────────────────────────────────────────────────────── */}
      <Tabs.Screen name="entrepreneur/admin/dashboard" options={{ href: null }} />
      <Tabs.Screen name="entrepreneur/admin/businesses/index" options={{ href: null }} />
      <Tabs.Screen name="entrepreneur/admin/businesses/[id]" options={{ href: null }} />
      <Tabs.Screen name="entrepreneur/admin/ads/index" options={{ href: null }} />
      <Tabs.Screen name="entrepreneur/admin/ads/[id]" options={{ href: null }} />
      <Tabs.Screen name="entrepreneur/admin/payments/index" options={{ href: null }} />
      <Tabs.Screen name="entrepreneur/admin/coupons/index" options={{ href: null }} />
      <Tabs.Screen name="entrepreneur/admin/coupons/create" options={{ href: null }} />
      <Tabs.Screen name="entrepreneur/admin/coupons/edit/[id]" options={{ href: null }} />
      <Tabs.Screen name="entrepreneur/admin/packages/index" options={{ href: null }} />
      <Tabs.Screen name="entrepreneur/admin/packages/create" options={{ href: null }} />
      <Tabs.Screen name="entrepreneur/admin/packages/edit/[id]" options={{ href: null }} />

      {/* ── STUDENT (bakida hidden, শুধু ads/index উপরে visible হিসেবে যোগ হয়েছে) ── */}
      <Tabs.Screen name="entrepreneur/student/dashboard" options={{ href: null }} />
      <Tabs.Screen name="entrepreneur/student/businesses/index" options={{ href: null }} />
      <Tabs.Screen name="entrepreneur/student/businesses/[id]" options={{ href: null }} />
      <Tabs.Screen name="entrepreneur/student/businesses/create" options={{ href: null }} />
      <Tabs.Screen name="entrepreneur/student/businesses/my-businesses" options={{ href: null }} />
      <Tabs.Screen name="entrepreneur/student/businesses/edit/[id]" options={{ href: null }} />
      <Tabs.Screen name="entrepreneur/student/ads/[id]" options={{ href: null }} />
      <Tabs.Screen name="entrepreneur/student/ads/submit" options={{ href: null }} />
      <Tabs.Screen name="entrepreneur/student/ads/my-ads" options={{ href: null }} />
      <Tabs.Screen name="entrepreneur/student/ads/renew/[id]" options={{ href: null }} />
      <Tabs.Screen name="entrepreneur/student/payments/index" options={{ href: null }} />
      <Tabs.Screen name="entrepreneur/student/packages/index" options={{ href: null }} />
    </Tabs>
  );
}