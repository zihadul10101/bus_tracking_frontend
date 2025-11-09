import { Tabs } from 'expo-router';
import { Bell, BookOpen, Bus, Home, Search, Users } from 'lucide-react-native';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { colors } from '../../constants/colors';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let Icon;
          switch (route.name) {
            case 'index':
              Icon = Home;
              break;
            case 'transport':
              Icon = Bus;
              break;
            case 'community':
              Icon = Users;
              break;
            case 'academic':
              Icon = BookOpen;
              break;
            default:
              return null;
          }
          return <Icon size={size} color={color} />;
        },
        tabBarLabel: ({ color }) => (
          <Text style={{ color, fontSize: 10, fontFamily: 'Geist' }}>
            {route.name === 'index'
              ? 'Home'
              : route.name.charAt(0).toUpperCase() + route.name.slice(1)}
          </Text>
        ),
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.mutedForeground,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          shadowColor: colors.foreground,
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 2,
        },
        headerStyle: {
          backgroundColor: colors.primary,
        },
        headerTitleStyle: {
          fontFamily: 'Geist',
          fontWeight: 'bold',
          color: colors.primaryForeground,
        },
        headerRight: () => (
          <View style={{ flexDirection: 'row', marginRight: 16 }}>
            <TouchableOpacity style={{ padding: 8 }}>
              <Search size={20} color={colors.primaryForeground} />
            </TouchableOpacity>
            <TouchableOpacity style={{ padding: 8 }}>
              <Bell size={20} color={colors.primaryForeground} />
            </TouchableOpacity>
          </View>
        ),
      })}
    />
  );
}
