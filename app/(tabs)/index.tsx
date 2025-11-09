import { Bell, BookOpen, Bus, Heart, Home, MapPin } from 'lucide-react-native';
import React from 'react';
import { Dimensions, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { colors } from '../../constants/colors';


const screenWidth = Dimensions.get('window').width;

const QuickCard = ({ icon: Icon, label, color }: any) => (
  <TouchableOpacity
    style={{
      backgroundColor: color.bg,
      paddingVertical: 28,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
      width: screenWidth / 2 - 28, // ensures 2 per row with margin
      shadowColor: '#000',
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 3,
      marginBottom: 16,
    }}
  >
    <Icon size={26} color={color.text} />
    <Text
      style={{
        fontSize: 13,
        fontWeight: '600',
        color: color.text,
        marginTop: 6,
        textAlign: 'center',
      }}
    >
      {label}
    </Text>
  </TouchableOpacity>
);

const ServiceCard = ({ title, subtitle, icon: Icon }: any) => (
  <View
    style={{
      backgroundColor: colors.card,
      borderColor: colors.border,
      borderWidth: 1,
      borderRadius: 14,
      padding: 20,
      flexDirection: 'row',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOpacity: 0.1,
      shadowRadius: 3,
      elevation: 3,
      marginBottom: 12,
      minHeight: 90, // taller height
    }}
  >
    <View
      style={{
        backgroundColor: colors.primary + '20',
        padding: 10,
        borderRadius: 10,
      }}
    >
      <Icon size={24} color={colors.primary} />
    </View>
    <View style={{ marginLeft: 14 }}>
      <Text style={{ fontWeight: '700', fontSize: 15 }}>{title}</Text>
      <Text style={{ fontSize: 13, color: colors.mutedForeground }}>{subtitle}</Text>
    </View>
  </View>
);

export default function HomePage() {
  return (
    <ScrollView
      style={{ flex: 1, paddingHorizontal: 16 }}
      contentContainerStyle={{ paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Welcome Banner */}
      <View
        style={{
          backgroundColor: colors.primary,
          borderRadius: 20,
          paddingVertical: 40, // increased height
          paddingHorizontal: 24,
          shadowColor: '#000',
          shadowOpacity: 0.15,
          shadowRadius: 6,
          elevation: 5,
          marginTop: 16,
          marginBottom: 20,
        }}
      >
        <Text style={{ fontSize: 26, fontWeight: 'bold', color: colors.primaryForeground, marginBottom: 6 }}>
          Welcome Back!
        </Text>
        <Text style={{ fontSize: 15, color: colors.primaryForeground, opacity: 0.9 }}>
          Your all-in-one student companion
        </Text>
      </View>

      {/* Quick Access (2 in a row) */}
      <View
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          marginBottom: 24,
        }}
      >
        <QuickCard icon={Bus} label="Bus Schedule" color={{ bg: '#DBEAFE', text: '#2563EB' }} />
        <QuickCard icon={MapPin} label="Live Tracking" color={{ bg: '#CFFAFE', text: '#06B6D4' }} />
        <QuickCard icon={Heart} label="Blood Donors" color={{ bg: '#FEE2E2', text: '#DC2626' }} />
        <QuickCard icon={Home} label="Housing" color={{ bg: '#FEF3C7', text: '#D97706' }} />
      </View>

      {/* Featured Section */}
      <View>
        <Text style={{ fontSize: 19, fontWeight: '700', marginBottom: 14 }}>Featured Services</Text>
        <ServiceCard title="Next Bus Arrives" subtitle="Route 5 - 12 mins" icon={Bus} />
        <ServiceCard title="Upcoming Events" subtitle="3 events this week" icon={Bell} />
        <ServiceCard title="Book Exchange" subtitle="50+ books available" icon={BookOpen} />
      </View>
    </ScrollView>
  );
}
