import { useNavigation } from '@react-navigation/native';
import { AlertCircle, ArrowRight, Bus, Calendar, MapPin } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors } from '../../constants/colors';

// ==================== UTILS ====================
const parseTime = (timeStr: string): Date => {
  if (!timeStr || timeStr === '00') return null;
  const today = new Date();
  const [time, period] = timeStr.split(' ');
  let [hours, minutes] = time.split(':').map(Number);
  if (period === 'PM' && hours !== 12) hours += 12;
  if (period === 'AM' && hours === 12) hours = 0;
  return new Date(today.getFullYear(), today.getMonth(), today.getDate(), hours, minutes);
};

const formatCountdown = (minutes: number): string => {
  if (minutes < 0) return 'গেছে';
  if (minutes === 0) return 'এখনই';
  return `${minutes} মি.`;
};

// ==================== ৭ দিনের সিডিউল ডাটা ====================
interface Stop {
  name: string;
  time: string;
}

interface Trip {
  day: string;
  tripNo: string;
  from: string;
  to: string;
  departure: string;
  stops: Stop[];
  isActive?: boolean;
  countdown?: string;
}

interface BusRoute {
  id: string;
  name: string;
  route: string;
  image?: any;
  allTrips: Trip[];
  routeForward: Stop[];
  routeReverse: Stop[];
}

const buses: BusRoute[] = [
  {
    id: '1',
    name: 'বাস নং-০১',
    route: 'নতুন ব্রিজ ↔ ক্যাম্পাস',
    allTrips: [
      // Saturday to Thursday - Down
      { day: 'Saturday', tripNo: '1', from: 'Natun Bridge', to: 'SUB East Campus', departure: '7:30 AM', stops: [] },
      { day: 'Saturday', tripNo: '2', from: 'SUB East Campus', to: '2 No. Gate', departure: '9:00 AM', stops: [] },
      { day: 'Saturday', tripNo: '3', from: 'SUB East Campus', to: 'Mayor Goli', departure: '4:30 PM', stops: [] },
      { day: 'Sunday', tripNo: '1', from: 'Natun Bridge', to: 'SUB East Campus', departure: '7:30 AM', stops: [] },
      { day: 'Sunday', tripNo: '2', from: 'SUB East Campus', to: '2 No. Gate', departure: '9:00 AM', stops: [] },
      { day: 'Sunday', tripNo: '3', from: 'SUB East Campus', to: 'Mayor Goli', departure: '4:30 PM', stops: [] },
      { day: 'Monday', tripNo: '1', from: 'Natun Bridge', to: 'SUB East Campus', departure: '7:30 AM', stops: [] },
      { day: 'Monday', tripNo: '2', from: 'SUB East Campus', to: '2 No. Gate', departure: '9:00 AM', stops: [] },
      { day: 'Monday', tripNo: '3', from: 'SUB East Campus', to: 'Mayor Goli', departure: '4:30 PM', stops: [] },
      { day: 'Tuesday', tripNo: '1', from: 'Natun Bridge', to: 'SUB East Campus', departure: '7:30 AM', stops: [] },
      { day: 'Tuesday', tripNo: '2', from: 'SUB East Campus', to: '2 No. Gate', departure: '9:00 AM', stops: [] },
      { day: 'Tuesday', tripNo: '3', from: 'SUB East Campus', to: 'Mayor Goli', departure: '4:30 PM', stops: [] },
      { day: 'Wednesday', tripNo: '1', from: 'Natun Bridge', to: 'SUB East Campus', departure: '7:30 AM', stops: [] },
      { day: 'Wednesday', tripNo: '2', from: 'SUB East Campus', to: '2 No. Gate', departure: '9:00 AM', stops: [] },
      { day: 'Wednesday', tripNo: '3', from: 'SUB East Campus', to: 'Mayor Goli', departure: '4:30 PM', stops: [] },
      { day: 'Thursday', tripNo: '1', from: 'Natun Bridge', to: 'SUB East Campus', departure: '7:30 AM', stops: [] },
      { day: 'Thursday', tripNo: '2', from: 'SUB East Campus', to: '2 No. Gate', departure: '9:00 AM', stops: [] },
      { day: 'Thursday', tripNo: '3', from: 'SUB East Campus', to: 'Mayor Goli', departure: '4:30 PM', stops: [] },
      { day: 'Friday', tripNo: '1', from: 'Natun Bridge', to: 'SUB East Campus', departure: '7:30 AM', stops: [] },
      { day: 'Friday', tripNo: '2', from: 'SUB East Campus', to: '2 No. Gate', departure: '9:00 AM', stops: [] },
      { day: 'Friday', tripNo: '3', from: 'SUB East Campus', to: 'Mayor Goli', departure: '4:30 PM', stops: [] },
    ],
    routeForward: [
      { name: 'নতুন ব্রিজ', time: '7:30 AM' },
      { name: 'কোতোয়ালি', time: '7:35 AM' },
      { name: 'আন্দরকিল্লা', time: '7:40 AM' },
      { name: 'দিদার মার্কেট', time: '7:45 AM' },
      { name: 'বালি আর্কেড', time: '7:50 AM' },
      { name: 'চকবাজার', time: '7:55 AM' },
      { name: '২ নং গেইট', time: '8:00 AM' },
      { name: 'C&B', time: '8:05 AM' },
      { name: 'কর্ণফুলী', time: '8:10 AM' },
      { name: 'শেরশাহ', time: '8:15 AM' },
      { name: 'ক্যাম্পাস', time: '8:30 AM' },
    ],
    routeReverse: [
      { name: 'ক্যাম্পাস', time: '4:30 PM' },
      { name: 'শেরশাহ', time: '4:35 PM' },
      { name: 'কর্ণফুলী', time: '4:40 PM' },
      { name: 'C&B', time: '4:45 PM' },
      { name: '২ নং গেইট', time: '4:50 PM' },
      { name: 'প্রবর্তক', time: '4:55 PM' },
      { name: 'চকবাজার', time: '5:00 PM' },
      { name: 'বালি আর্কেড', time: '5:05 PM' },
      { name: 'দিদার মার্কেট', time: '5:10 PM' },
      { name: 'আন্দরকিল্লা', time: '5:15 PM' },
      { name: 'কোতোয়ালি', time: '5:20 PM' },
      { name: 'নতুন ব্রিজ', time: '5:25 PM' },
    ],
  },
  // বাস ২, ৩, ৪ - একইভাবে ৭ দিনের ডাটা যোগ করুন
    {
    id: '2',
    name: 'বাস নং-০2',
    route: 'নতুন ব্রিজ ↔ ক্যাম্পাস',
    allTrips: [
      // Saturday to Thursday - Down
      { day: 'Saturday', tripNo: '1', from: 'Natun Bridge', to: 'SUB East Campus', departure: '7:30 AM', stops: [] },
      { day: 'Saturday', tripNo: '2', from: 'SUB East Campus', to: '2 No. Gate', departure: '9:00 AM', stops: [] },
      { day: 'Saturday', tripNo: '3', from: 'SUB East Campus', to: 'Mayor Goli', departure: '4:30 PM', stops: [] },
      { day: 'Sunday', tripNo: '1', from: 'Natun Bridge', to: 'SUB East Campus', departure: '7:30 AM', stops: [] },
      { day: 'Sunday', tripNo: '2', from: 'SUB East Campus', to: '2 No. Gate', departure: '9:00 AM', stops: [] },
      { day: 'Sunday', tripNo: '3', from: 'SUB East Campus', to: 'Mayor Goli', departure: '4:30 PM', stops: [] },
      { day: 'Monday', tripNo: '1', from: 'Natun Bridge', to: 'SUB East Campus', departure: '7:30 AM', stops: [] },
      { day: 'Monday', tripNo: '2', from: 'SUB East Campus', to: '2 No. Gate', departure: '9:00 AM', stops: [] },
      { day: 'Monday', tripNo: '3', from: 'SUB East Campus', to: 'Mayor Goli', departure: '4:30 PM', stops: [] },
      { day: 'Tuesday', tripNo: '1', from: 'Natun Bridge', to: 'SUB East Campus', departure: '7:30 AM', stops: [] },
      { day: 'Tuesday', tripNo: '2', from: 'SUB East Campus', to: '2 No. Gate', departure: '9:00 AM', stops: [] },
      { day: 'Tuesday', tripNo: '3', from: 'SUB East Campus', to: 'Mayor Goli', departure: '4:30 PM', stops: [] },
      { day: 'Wednesday', tripNo: '1', from: 'Natun Bridge', to: 'SUB East Campus', departure: '7:30 AM', stops: [] },
      { day: 'Wednesday', tripNo: '2', from: 'SUB East Campus', to: '2 No. Gate', departure: '9:00 AM', stops: [] },
      { day: 'Wednesday', tripNo: '3', from: 'SUB East Campus', to: 'Mayor Goli', departure: '4:30 PM', stops: [] },
      { day: 'Thursday', tripNo: '1', from: 'Natun Bridge', to: 'SUB East Campus', departure: '7:30 AM', stops: [] },
      { day: 'Thursday', tripNo: '2', from: 'SUB East Campus', to: '2 No. Gate', departure: '9:00 AM', stops: [] },
      { day: 'Thursday', tripNo: '3', from: 'SUB East Campus', to: 'Mayor Goli', departure: '4:30 PM', stops: [] },
      { day: 'Friday', tripNo: '1', from: 'Natun Bridge', to: 'SUB East Campus', departure: '7:30 AM', stops: [] },
      { day: 'Friday', tripNo: '2', from: 'SUB East Campus', to: '2 No. Gate', departure: '9:00 AM', stops: [] },
      { day: 'Friday', tripNo: '3', from: 'SUB East Campus', to: 'Mayor Goli', departure: '4:30 PM', stops: [] },
    ],
    routeForward: [
      { name: 'নতুন ব্রিজ', time: '7:30 AM' },
      { name: 'কোতোয়ালি', time: '7:35 AM' },
      { name: 'আন্দরকিল্লা', time: '7:40 AM' },
      { name: 'দিদার মার্কেট', time: '7:45 AM' },
      { name: 'বালি আর্কেড', time: '7:50 AM' },
      { name: 'চকবাজার', time: '7:55 AM' },
      { name: '২ নং গেইট', time: '8:00 AM' },
      { name: 'C&B', time: '8:05 AM' },
      { name: 'কর্ণফুলী', time: '8:10 AM' },
      { name: 'শেরশাহ', time: '8:15 AM' },
      { name: 'ক্যাম্পাস', time: '8:30 AM' },
    ],
    routeReverse: [
      { name: 'ক্যাম্পাস', time: '4:30 PM' },
      { name: 'শেরশাহ', time: '4:35 PM' },
      { name: 'কর্ণফুলী', time: '4:40 PM' },
      { name: 'C&B', time: '4:45 PM' },
      { name: '২ নং গেইট', time: '4:50 PM' },
      { name: 'প্রবর্তক', time: '4:55 PM' },
      { name: 'চকবাজার', time: '5:00 PM' },
      { name: 'বালি আর্কেড', time: '5:05 PM' },
      { name: 'দিদার মার্কেট', time: '5:10 PM' },
      { name: 'আন্দরকিল্লা', time: '5:15 PM' },
      { name: 'কোতোয়ালি', time: '5:20 PM' },
      { name: 'নতুন ব্রিজ', time: '5:25 PM' },
    ],
  },
];

// ==================== MAIN COMPONENT ====================
export default function TransportPage() {
  const [selectedBus, setSelectedBus] = useState<BusRoute>(buses[0]);
  const [activeTrips, setActiveTrips] = useState<Trip[]>([]);
  const [showAllSchedule, setShowAllSchedule] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    const updateActive = () => {
      const now = new Date();
      const today = now.toLocaleString('en-US', { weekday: 'long' });
      const active: Trip[] = [];

      selectedBus.allTrips
        .filter(trip => trip.day === today)
        .forEach(trip => {
          const dep = parseTime(trip.departure);
          if (dep) {
            const diff = (dep.getTime() - now.getTime()) / 60000;
            if (diff >= -5 && diff <= 30) {
              trip.isActive = true;
              trip.countdown = formatCountdown(Math.floor(diff));
              active.push(trip);
            } else {
              trip.isActive = false;
            }
          }
        });

      setActiveTrips(active);
    };

    updateActive();
    const interval = setInterval(updateActive, 60000);
    return () => clearInterval(interval);
  }, [selectedBus]);

  const goToLiveLocation = () => {
    navigation.navigate('LiveLocation', { busId: selectedBus.id });
  };

  return (
    <View style={styles.container}>
      {/* Toggler */}
      <View style={styles.togglerContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {buses.map((bus) => (
            <TouchableOpacity
              key={bus.id}
              onPress={() => { setSelectedBus(bus); setShowAllSchedule(false); }}
              style={[styles.busBtn, selectedBus.id === bus.id && styles.activeBusBtn]}
            >
              <Bus size={12} color={selectedBus.id === bus.id ? '#fff' : colors.primary} />
              <Text style={[styles.busBtnText, selectedBus.id === bus.id && styles.activeText]}>
                {bus.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Header */}
      <View style={styles.header}>
        <Image source={require('../../assets/bus.png')} style={styles.busImage} />
        <Text style={styles.headerTitle}>{selectedBus.name} (রাউট-{selectedBus.id})</Text>
      </View>

      {/* Content */}
      <ScrollView style={styles.content}>
        {/* Active Trip */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>এখন চলছে</Text>
          {activeTrips.length > 0 ? (
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={styles.th}>ট্রিপ</Text>
                <Text style={styles.th}>কোথা থেকে</Text>
                <Text style={styles.th}>কোথায়</Text>
                <Text style={styles.th}>কতক্ষণে</Text>
              </View>
              {activeTrips.map((trip, i) => (
                <View key={i} style={[styles.tr, styles.activeTR]}>
                  <Text style={styles.td}>{trip.tripNo}</Text>
                  <Text style={styles.td}>{trip.from}</Text>
                  <Text style={styles.td}>{trip.to}</Text>
                  <Text style={styles.tdHighlight}>{trip.countdown}</Text>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.noBusCard}>
              <AlertCircle size={20} color={colors.mutedForeground} />
              <Text style={styles.noBusText}>এখন কোনো বাস চলছে না</Text>
            </View>
          )}
        </View>

        {/* Upcoming Trips */}
        <View style={styles.section}>
          <View style={styles.rowBetween}>
            <Text style={styles.sectionTitle}>পরবর্তী ট্রিপস</Text>
            <TouchableOpacity onPress={goToLiveLocation} style={styles.liveBtn}>
              <MapPin size={14} color="#fff" />
              <Text style={styles.liveBtnText}>Live Location</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={styles.th}>দিন</Text>
              <Text style={styles.th}>ট্রিপ</Text>
              <Text style={styles.th}>সময়</Text>
              <Text style={styles.th}>গন্তব্য</Text>
            </View>
            {selectedBus.allTrips
              .filter(t => !t.isActive)
              .slice(0, 5)
              .map((trip, i) => (
                <View key={i} style={styles.tr}>
                  <Text style={styles.td}>{trip.day.slice(0, 3)}</Text>
                  <Text style={styles.td}>{trip.tripNo}</Text>
                  <Text style={styles.td}>{trip.departure}</Text>
                  <Text style={styles.td}>{trip.to}</Text>
                </View>
              ))}
          </View>
        </View>

        {/* All Schedule Button */}
        <TouchableOpacity
          onPress={() => setShowAllSchedule(!showAllSchedule)}
          style={styles.fullScheduleBtn}
        >
          <Calendar size={16} color={colors.primary} />
          <Text style={styles.fullScheduleText}>
            {showAllSchedule ? 'লুকান' : '৭ দিনের সব সিডিউল দেখুন'}
          </Text>
        </TouchableOpacity>

        {/* Full Schedule - 7 Days */}
        {showAllSchedule && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>৭ দিনের পূর্ণ সিডিউল</Text>
            {['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map(day => {
              const dayTrips = selectedBus.allTrips.filter(t => t.day === day);
              if (dayTrips.length === 0) return null;
              return (
                <View key={day} style={styles.daySection}>
                  <Text style={styles.dayTitle}>{day}</Text>
                  <View style={styles.table}>
                    <View style={styles.tableHeader}>
                      <Text style={styles.thSmall}>ট্রিপ</Text>
                      <Text style={styles.thSmall}>কোথা থেকে</Text>
                      <Text style={styles.thSmall}>কোথায়</Text>
                      <Text style={styles.thSmall}>সময়</Text>
                    </View>
                    {dayTrips.map((trip, i) => (
                      <View key={i} style={[styles.tr, trip.isActive && styles.activeTR]}>
                        <Text style={styles.tdSmall}>{trip.tripNo}</Text>
                        <Text style={styles.tdSmall}>{trip.from}</Text>
                        <Text style={styles.tdSmall}>{trip.to}</Text>
                        <Text style={styles.tdSmall}>{trip.departure}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* Route Map - Forward */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>রুট ম্যাপ (যাওয়া)</Text>
          <ScrollView horizontal>
            <View style={styles.routeMap}>
              {selectedBus.routeForward.map((stop, i) => (
                <View key={i} style={styles.routeItem}>
                  <View style={styles.routeBox}>
                    <Text style={styles.routeStop}>{stop.name}</Text>
                    <Text style={styles.routeTime}>{stop.time}</Text>
                  </View>
                  {i < selectedBus.routeForward.length - 1 && (
                    <ArrowRight size={20} color={colors.primary} style={{ marginHorizontal: 4 }} />
                  )}
                </View>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Route Map - Reverse */}
        {selectedBus.routeReverse.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>রুট ম্যাপ (ফেরত)</Text>
            <ScrollView horizontal>
              <View style={styles.routeMap}>
                {selectedBus.routeReverse.map((stop, i) => (
                  <View key={i} style={styles.routeItem}>
                    <View style={styles.routeBox}>
                      <Text style={styles.routeStop}>{stop.name}</Text>
                      <Text style={styles.routeTime}>{stop.time}</Text>
                    </View>
                    {i < selectedBus.routeReverse.length - 1 && (
                      <ArrowRight size={20} color={colors.primary} style={{ marginHorizontal: 4 }} />
                    )}
                  </View>
                ))}
              </View>
            </ScrollView>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

// ==================== STYLES ====================
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  togglerContainer: { flexDirection: 'row', padding: 8, backgroundColor: colors.card, borderBottomWidth: 1, borderColor: colors.border },
  busBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, backgroundColor: colors.muted, marginRight: 6, height: 32 },
  activeBusBtn: { backgroundColor: colors.primary },
  busBtnText: { marginLeft: 4, fontSize: 11, fontWeight: '600', color: colors.primary },
  activeText: { color: '#fff' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 10, backgroundColor: colors.card, margin: 12, borderRadius: 10, borderWidth: 1, borderColor: colors.border },
  busImage: { width: 44, height: 30 },
  headerTitle: { marginLeft: 8, fontSize: 14, fontWeight: '700', color: colors.foreground },
  content: { flex: 1, paddingHorizontal: 12 },
  section: { marginBottom: 16, backgroundColor: colors.card, borderRadius: 10, padding: 10, borderWidth: 1, borderColor: colors.border },
  sectionTitle: { fontSize: 13, fontWeight: '600', color: colors.foreground, marginBottom: 8 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  liveBtn: { flexDirection: 'row', backgroundColor: colors.primary, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  liveBtnText: { color: '#fff', fontSize: 11, marginLeft: 4, fontWeight: '600' },
  fullScheduleBtn: { flexDirection: 'row', backgroundColor: colors.primary + '15', padding: 12, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  fullScheduleText: { color: colors.primary, fontWeight: '600', marginLeft: 6 },
  table: { borderWidth: 1, borderColor: colors.border, borderRadius: 8, overflow: 'hidden' },
  tableHeader: { flexDirection: 'row', backgroundColor: colors.primary + '15', paddingVertical: 6 },
  th: { flex: 1, textAlign: 'center', fontWeight: '600', fontSize: 11, color: colors.primary },
  thSmall: { flex: 1, textAlign: 'center', fontWeight: '600', fontSize: 10, color: colors.primary },
  tr: { flexDirection: 'row', borderBottomWidth: 1, borderColor: colors.border, paddingVertical: 6 },
  activeTR: { backgroundColor: colors.primary + '10' },
  td: { flex: 1, textAlign: 'center', fontSize: 11, color: colors.foreground },
  tdSmall: { flex: 1, textAlign: 'center', fontSize: 10, color: colors.foreground },
  tdHighlight: { flex: 1, textAlign: 'center', fontSize: 11, color: colors.primary, fontWeight: 'bold' },
  noBusCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 16, backgroundColor: colors.muted + '20', borderRadius: 8 },
  noBusText: { marginLeft: 8, color: colors.mutedForeground, fontSize: 12 },
  daySection: { marginBottom: 12 },
  dayTitle: { fontSize: 12, fontWeight: '700', color: colors.primary, marginBottom: 6, textAlign: 'center' },
  routeMap: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
  routeItem: { flexDirection: 'row', alignItems: 'center' },
  routeBox: { backgroundColor: colors.primary + '15', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, minWidth: 80, alignItems: 'center' },
  routeStop: { fontSize: 10, color: colors.primary, fontWeight: '600' },
  routeTime: { fontSize: 9, color: colors.mutedForeground },
});