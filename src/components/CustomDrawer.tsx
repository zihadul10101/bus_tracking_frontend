import { colors } from '@/constants/colors';
import { useApp } from '@/src/context/AppContext';
import { DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer';
import { router, usePathname } from 'expo-router';

import {
  Bus,
  ChevronRight,
  LayoutDashboard,
  LogOut,
  Megaphone,
  ShieldCheck,
  User,
  Users
} from 'lucide-react-native';
import React from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';

const ROLE_LABELS: Record<string, string> = {
  super_admin: 'Super Admin',
  sub_admin: 'Sub Admin',
  student: 'Student',
  driver: 'Driver',
};

export default function CustomDrawerContent(props: any) {

  const { user, logout } = useApp();

  const pathname = usePathname();




  const handleLogout = async () => {
    try {
      await logout();                
      props.navigation.closeDrawer();
      router.replace('/(auth)');       
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const currentRole = user?.role;
  const roleLabel = currentRole ? (ROLE_LABELS[currentRole] || currentRole.toUpperCase()) : '';

  const primaryColor = colors?.primary || '#007AFF';
  const activeBg = `${primaryColor}14`;
  const iconBg = `${primaryColor}12`;

  const renderIcon = (Icon: any, focused: boolean, color: string) => (
    <View
      style={[
        styles.iconWrapper,
        focused && { backgroundColor: iconBg },
      ]}
    >
      <Icon size={18} color={color} />
    </View>
  );

  const showManageSection =
    currentRole === 'super_admin' || currentRole === 'sub_admin';


  return (
    <View style={styles.root}>
      <DrawerContentScrollView
        {...props}
        contentContainerStyle={{ paddingTop: 0 }}
        showsVerticalScrollIndicator={false}
      >
        {/* 🟦 প্রোফাইল হেডার কার্ড */}
        <View style={[styles.drawerHeader, { backgroundColor: primaryColor }]}>
          <View style={styles.profileSection}>
            <View style={styles.avatar}>
              <Text style={[styles.avatarText, { color: primaryColor }]}>
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.profileName} numberOfLines={1}>
                {user?.name || 'User Profile'}
              </Text>
              {currentRole && (
                <View style={styles.roleBadge}>
                  <ShieldCheck size={11} color="#fff" style={{ marginRight: 4 }} />
                  <Text style={styles.roleBadgeText}>
                    {roleLabel}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* 📋 মেনু আইটেমসমূহ */}
        <View style={styles.menuListContainer}>
          <Text style={styles.sectionLabel}>MENU</Text>

          <View style={styles.itemGroup}>
            <DrawerItem
              label="Dashboard"
              focused={pathname === '/home'}
              activeBackgroundColor={activeBg}
              activeTintColor={primaryColor}
              inactiveTintColor="#475569"
              labelStyle={styles.itemLabel}
              style={styles.drawerItem}
              icon={({ color, focused }: any) =>
                renderIcon(LayoutDashboard, focused, color)
              }
              onPress={() => router.push('/(tabs)/home')}
            />

            {currentRole === 'driver' && (
              <DrawerItem
                label="Assign Bus"
                focused={pathname.startsWith('/work-driver/assign-bus')}
                activeBackgroundColor={activeBg}
                activeTintColor={primaryColor}
                inactiveTintColor="#475569"
                labelStyle={styles.itemLabel}
                style={styles.drawerItem}
                icon={({ color, focused }: any) =>
                  renderIcon(Bus, focused, color)
                }
                onPress={() => {
                  props.navigation.closeDrawer();
                  router.push('/(tabs)/work-driver/assign-bus' as any);
                }}
              />
            )}


     
          </View>

          {/* 🛠️ ম্যানেজমেন্ট সেকশন */}
          {showManageSection && (
            <>
              <Text style={styles.sectionLabel}>MANAGEMENT</Text>
              <View style={styles.itemGroup}>
                <DrawerItem
                  label="Manage Buses"
                  focused={pathname.startsWith('/bus-management')}
                  activeBackgroundColor={activeBg}
                  activeTintColor={primaryColor}
                  inactiveTintColor="#475569"
                  labelStyle={styles.itemLabel}
                  style={styles.drawerItem}
                  icon={({ color, focused }: any) =>
                    renderIcon(Bus, focused, color)
                  }
                  onPress={() => router.push('/(tabs)/bus-management')}
                />

                <DrawerItem
                  label="Drivers"
                  focused={pathname.startsWith('/drivers')}
                  activeBackgroundColor={activeBg}
                  activeTintColor={primaryColor}
                  inactiveTintColor="#475569"
                  labelStyle={styles.itemLabel}
                  style={styles.drawerItem}
                  icon={({ color, focused }: any) =>
                    renderIcon(Users, focused, color)
                  }
                  onPress={() => router.push('/(tabs)/drivers')}
                />

                {currentRole === 'super_admin' && (
                  <DrawerItem
                    label="Sub Admins"
                    focused={pathname.startsWith('/sub-admins')}
                    activeBackgroundColor={activeBg}
                    activeTintColor={primaryColor}
                    inactiveTintColor="#475569"
                    labelStyle={styles.itemLabel}
                    style={styles.drawerItem}
                    icon={({ color, focused }: any) =>
                      renderIcon(ShieldCheck, focused, color)
                    }
                    onPress={() => router.push('/(tabs)/sub-admins')}
                  />
                )}

               

                <DrawerItem
                  label="Notices"
                  focused={pathname.startsWith('/notices')}
                  activeBackgroundColor={activeBg}
                  activeTintColor={primaryColor}
                  inactiveTintColor="#475569"
                  labelStyle={styles.itemLabel}
                  style={styles.drawerItem}
                  icon={({ color, focused }: any) =>
                    renderIcon(Megaphone, focused, color)
                  }
                  onPress={() => router.push('/(tabs)/notices')}
                />

              </View>
            </>
          )}


        </View>
      </DrawerContentScrollView>

      {/* 🚪 বটম সেকশন */}
      <View style={styles.bottomContainer}>
        <DrawerItem
          label="Profile"
          focused={pathname === '/profile'}
          activeBackgroundColor={activeBg}
          activeTintColor={primaryColor}
          inactiveTintColor="#475569"
          labelStyle={styles.itemLabel}
          style={styles.drawerItem}
          icon={({ color, focused }: any) => renderIcon(User, focused, color)}
          onPress={() => router.push('/(tabs)/profile')}
        />

        <DrawerItem
          label="Log Out"
          labelStyle={styles.logoutLabel}
          style={styles.drawerItem}
          icon={() => (
            <View style={[styles.iconWrapper, { backgroundColor: '#fef2f2' }]}>
              <LogOut size={18} color="#ef4444" />
            </View>
          )}
          onPress={handleLogout}
          activeBackgroundColor="#fef2f2"
        />

        <View style={styles.versionRow}>
          <Text style={styles.versionText}>v1.0.0</Text>
          <ChevronRight size={12} color="#cbd5e1" />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#fff' },
  drawerHeader: {
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 58 : 46,
    paddingBottom: 24,
    borderBottomRightRadius: 28,
  },
  profileSection: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  avatar: {
    width: 56, height: 56, borderRadius: 28, backgroundColor: '#fff',
    justifyContent: 'center', alignItems: 'center', borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.5)', shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15,
    shadowRadius: 4, elevation: 3,
  },
  avatarText: { fontSize: 22, fontWeight: '700' },
  profileName: { color: '#fff', fontSize: 16, fontWeight: '700', marginBottom: 5 },
  roleBadge: {
    backgroundColor: 'rgba(255,255,255,0.22)', paddingHorizontal: 9,
    paddingVertical: 4, borderRadius: 20, flexDirection: 'row',
    alignItems: 'center', alignSelf: 'flex-start',
  },
  roleBadgeText: { color: '#fff', fontSize: 10.5, fontWeight: '700', letterSpacing: 0.3 },
  menuListContainer: { paddingTop: 18, paddingHorizontal: 12 },
  sectionLabel: {
    fontSize: 11, fontWeight: '700', color: '#94a3b8', letterSpacing: 0.8,
    marginBottom: 6, marginTop: 14, marginLeft: 8,
  },
  itemGroup: { gap: 2 },
  drawerItem: { borderRadius: 12, marginVertical: 1, paddingVertical: 1 },
  itemLabel: { fontSize: 14.5, fontWeight: '600', marginLeft: -12 },
  iconWrapper: { width: 34, height: 34, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },

  itemWithBadge: { position: 'relative', flexDirection: 'row', alignItems: 'center' },
  notifyBadge: {
    position: 'absolute',
    right: 14,
    top: '50%',
    marginTop: -9,
    backgroundColor: '#ef4444',
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  notifyBadgeText: { color: '#fff', fontSize: 10, fontWeight: '700' },

  bottomContainer: {
    paddingHorizontal: 12, paddingBottom: Platform.OS === 'ios' ? 26 : 18,
    paddingTop: 10, borderTopWidth: 1, borderTopColor: '#f1f5f9',
  },
  logoutLabel: { fontSize: 14.5, fontWeight: '700', color: '#ef4444', marginLeft: -12 },
  versionRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 4, marginTop: 10, opacity: 0.6,
  },
  versionText: { fontSize: 11, color: '#94a3b8', fontWeight: '500' },
});