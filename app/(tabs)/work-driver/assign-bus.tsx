// import { socket, startLocationSharing, stopLocationSharing } from '@/src/services/locationService';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import * as Location from 'expo-location';
// import { useFocusEffect, useRouter } from 'expo-router';
// import { Share2 } from 'lucide-react-native';
// import React, { useCallback, useEffect, useRef, useState } from 'react';
// import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
// import LiveTrackingView from './LiveTrackingView';

// const BUS_API_BASE_URL = "http://192.168.0.195:5000/api/v1/buses";
// type TabType = 'running' | 'future' | 'completed';

// export default function AssignBusScreen() {
//   const router = useRouter();
//   const [driver, setDriver] = useState<any>(null);
//   const [busData, setBusData] = useState<any>(null);
//   const [loading, setLoading] = useState(true);
//   const [activeTab, setActiveTab] = useState<TabType>('running');

//   const [isSharing, setIsSharing] = useState(false);
//   const [isStarting, setIsStarting] = useState(false); // waiting for start-trip ack
//   const [currentLocation, setCurrentLocation] = useState<any>(null);
//   const [viewerCount, setViewerCount] = useState(0);

//   // Keep the location watcher subscription so we can actually stop it
//   const locationSubscription = useRef<Location.LocationSubscription | null>(null);

//   useFocusEffect(useCallback(() => { fetchStoredDriverAndBus(); }, []));


//   const fetchStoredDriverAndBus = async () => {
//   try {
//     setLoading(true);

//     const storedUserData = await AsyncStorage.getItem("userData");

//     if (!storedUserData) {
//       router.replace("/(auth)/driver-login");
//       return;
//     }

//     const parsedDriver = JSON.parse(storedUserData);

//     setDriver(parsedDriver);

//     console.log("Driver =", parsedDriver);

//     // AsyncStorage-তেই পুরো bus object আছে
//     if (parsedDriver.bus) {
//       console.log("Setting bus data...");
//       setBusData(parsedDriver.bus);
//     } else {
//       console.log("No bus found");
//     }

//   } catch (error) {
//     console.log(error);
//     Alert.alert("Error", "Could not connect to server.");
//   } finally {
//     setLoading(false);
//   }
// };
// // useEffect(() => {
// //   console.log("busData Updated =", busData);
// // }, [busData]);

//   // const fetchStoredDriverAndBus = async () => {
//   //   try {
//   //     setLoading(true);
//   //     const storedUserData = await AsyncStorage.getItem('userData');
//   //     if (!storedUserData) { router.replace('/(auth)/driver-login'); return; }
//   //     const parsedDriver = JSON.parse(storedUserData);
//   //     setDriver(parsedDriver);
//   //     if (parsedDriver.busId) {
//   //       const response = await fetch(`${BUS_API_BASE_URL}/${parsedDriver.busId}`);
//   //       const result = await response.json();
//   //       if (response.ok && result.success) setBusData(result.data);
//   //     }
//   //   } catch (error) {
//   //     Alert.alert("Error", "Could not connect to server.");
//   //   } finally {
//   //     setLoading(false);
//   //   }
//   // };

//   // --------------------------------------------------------------
//   // Socket listeners: viewer count + driver online/offline recovery
//   // --------------------------------------------------------------
//   useEffect(() => {

    
//     const roomId = busData?._id;
//         console.log("room ID",roomId);
//     if (!roomId) return;

//     const onViewerCount = (data: { roomId: string; count: number }) => {
//       if (data.roomId === roomId) setViewerCount(data.count);
//     };

//     const onDriverOffline = (data: { roomId: string; reason?: string }) => {
//       if (data.roomId === roomId && data.reason === 'inactive') {
//         // Server marked us offline due to inactivity — location watcher
//         // probably died silently, so reflect that in the UI.
//         setIsSharing(false);
//       }
//     };

//     // If the socket reconnects mid-trip (e.g. brief network drop),
//     // resume the same trip instead of losing driver/bus info server-side.
//     const onConnect = () => {
//       const driverId = driver?._id || driver?.id;
//       if (isSharing && driverId) {
//         socket.emit('resume-trip', { driverId });
//       }
//     };

//     socket.on('viewer-count', onViewerCount);
//     socket.on('driver-offline', onDriverOffline);
//     socket.on('connect', onConnect);

//     return () => {
//       socket.off('viewer-count', onViewerCount);
//       socket.off('driver-offline', onDriverOffline);
//       socket.off('connect', onConnect);
//     };
//   }, [busData?._id, isSharing, driver]);

//   // Stop the GPS watcher on unmount, just in case
//   useEffect(() => {
//     return () => {
//       locationSubscription.current?.remove();
//     };
//   }, []);

//   const handleToggleSharing = async () => {
//     if (isSharing) {
//       // 1. Stop the GPS watcher
//       locationSubscription.current?.remove();
//       locationSubscription.current = null;

//       // 2. Stop the location service (whatever background logic it does)
//       await stopLocationSharing();

//       // 3. Tell the server this trip has ended
//       socket.emit('stop-sharing', busData._id);

//       setIsSharing(false);
//       setViewerCount(0);
//       return;
//     }

//     const driverId = driver?._id || driver?.id;
//     if (!busData?._id || !driverId) {
//       Alert.alert('Error', 'Missing driver or bus information.');
//       return;
//     }

//     try {
//       setIsStarting(true);

//       // 1. Ask location permission up front
//       const { status } = await Location.requestForegroundPermissionsAsync();
//       if (status !== 'granted') {
//         Alert.alert('Permission required', 'Location permission is needed to share your trip.');
//         setIsStarting(false);
//         return;
//       }

//       // 2. Tell the server the trip is starting — this fetches driver +
//       //    bus info server-side and marks the room live before we start
//       //    sending location updates.
//       socket.emit('start-trip', { roomId: busData._id, driverId }, (res: any) => {
//         setIsStarting(false);

//         if (!res?.ok) {
//           Alert.alert('Error', res?.error || 'Could not start the trip.');
//           return;
//         }

//         setIsSharing(true);

//         // 3. Start whatever background/location-service logic exists
//         startLocationSharing(busData._id);

//         // 4. Watch position for the local map marker + emit updates
//         Location.watchPositionAsync(
//           { accuracy: Location.Accuracy.High, distanceInterval: 10, timeInterval: 10000 },
//           (loc) => {
//             const coords = {
//               latitude: loc.coords.latitude,
//               longitude: loc.coords.longitude,
//             };
//             setCurrentLocation(coords);

//             socket.emit('update-location', {
//               roomId: busData._id,
//               latitude: coords.latitude,
//               longitude: coords.longitude,
//               speed: loc.coords.speed || 0,
//             });
//           }
//         ).then((sub) => {
//           locationSubscription.current = sub;
//         });
//       });
//     } catch (error) {
//       setIsStarting(false);
//       Alert.alert('Error', 'Could not start location sharing.');
//     }
//   };

//   const getTripStatus = (trip: any) => {
//     const now = new Date();
//     const parseTime = (timeStr: string) => {
//       const [time, period] = timeStr.split(' ');
//       let [hours, minutes] = time.split(':').map(Number);
//       if (period === 'PM' && hours < 12) hours += 12;
//       if (period === 'AM' && hours === 12) hours = 0;
//       const date = new Date();
//       date.setHours(hours, minutes, 0, 0);
//       return date;
//     };
//     const startTime = parseTime(trip.from?.time || "12:00 AM");
//     const endTime = parseTime(trip.to?.time || "11:59 PM");
//     if (now >= startTime && now <= endTime) return 'running';
//     return now < startTime ? 'future' : 'completed';
//   };

//   // Sharing on -> show the live map
//   if (isSharing) {
//     return (
//       <LiveTrackingView
//         location={currentLocation}
//         onStop={handleToggleSharing}
//         viewerCount={viewerCount}
//       />
//     );
//   }

//   if (loading) return <View style={styles.centered}><ActivityIndicator size="large" /></View>;

//   const filteredTrips = (busData?.trips || []).filter((t: any) => getTripStatus(t) === activeTab);

//   return (
//     <ScrollView style={styles.container}>
//       <View style={styles.driverInfoCard}>
//         <Text style={styles.cardHeader}>Driver Info</Text>
//         <Text style={styles.infoText}>Name: {driver?.name}</Text>
//         <Text style={styles.infoText}>Bus: {busData?.busName || 'N/A'}</Text>
//       </View>

//       <Text style={styles.title}>Today live trip</Text>
//       <View style={styles.tabContainer}>
//         {(['running', 'future', 'completed'] as TabType[]).map((tab) => (
//           <TouchableOpacity key={tab} style={[styles.tab, activeTab === tab && styles.activeTab]} onPress={() => setActiveTab(tab)}>
//             <Text style={styles.tabText}>{tab.charAt(0).toUpperCase() + tab.slice(1)}</Text>
//           </TouchableOpacity>
//         ))}
//       </View>

//       {filteredTrips.map((trip: any, index: number) => (
//         <View key={index} style={styles.tripCard}>
//           <Text style={styles.tripTitle}>{trip.tripTitle || 'Trip Title'}</Text>
//           <Text>From: {trip.from?.stop} - {trip.from?.time}</Text>
//           <Text>To: {trip.to?.stop} - {trip.to?.time}</Text>
//           {activeTab === 'running' && (
//             <TouchableOpacity
//               style={styles.liveButton}
//               onPress={handleToggleSharing}
//               disabled={isStarting}
//             >
//               {isStarting ? (
//                 <ActivityIndicator size="small" color="#fff" />
//               ) : (
//                 <>
//                   <Share2 size={16} color="#fff" />
//                   <Text style={styles.buttonText}> Share Location</Text>
//                 </>
//               )}
//             </TouchableOpacity>
//           )}
//         </View>
//       ))}
//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, padding: 20, backgroundColor: '#f9f9f9' },
//   driverInfoCard: { padding: 20, backgroundColor: '#fff', borderRadius: 10, borderWidth: 1, borderColor: '#ddd', marginBottom: 20 },
//   cardHeader: { fontWeight: 'bold', fontSize: 18, marginBottom: 10 },
//   infoText: { fontSize: 14, color: '#555' },
//   title: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
//   tabContainer: { flexDirection: 'row', backgroundColor: '#eee', borderRadius: 8, marginBottom: 15 },
//   tab: { flex: 1, padding: 12, alignItems: 'center' },
//   activeTab: { backgroundColor: '#004b8d', borderRadius: 8 },
//   tabText: { fontWeight: 'bold' },
//   tripCard: { padding: 15, backgroundColor: '#fff', borderRadius: 10, borderWidth: 1, borderColor: '#ddd', marginBottom: 10 },
//   tripTitle: { fontWeight: 'bold', fontSize: 16 },
//   liveButton: { flexDirection: 'row', backgroundColor: '#2563eb', padding: 10, borderRadius: 8, marginTop: 10, justifyContent: 'center' },
//   buttonText: { color: '#fff', fontWeight: 'bold' },
//   centered: { flex: 1, justifyContent: 'center', alignItems: 'center' }
// });

import { socket, startLocationSharing, stopLocationSharing } from '@/src/services/locationService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import { useFocusEffect, useRouter } from 'expo-router';
import { Share2 } from 'lucide-react-native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import LiveTrackingView from './LiveTrackingView';

const BUS_API_BASE_URL = "http://192.168.0.195:5000/api/v1/buses";
const START_TRIP_ACK_TIMEOUT_MS = 8000;

type TabType = 'running' | 'future' | 'completed';

export default function AssignBusScreen() {
  const router = useRouter();
  const [driver, setDriver] = useState<any>(null);
  const [busData, setBusData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('running');

  const [isSharing, setIsSharing] = useState(false);
  const [isStarting, setIsStarting] = useState(false); // waiting for start-trip ack
  const [currentLocation, setCurrentLocation] = useState<any>(null);
  const [viewerCount, setViewerCount] = useState(0);

  // Keep the location watcher subscription so we can actually stop it
  const locationSubscription = useRef<Location.LocationSubscription | null>(null);
  // Guards against the start-trip ack never arriving (dead socket, server bug, etc.)
  const ackTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useFocusEffect(useCallback(() => { fetchStoredDriverAndBus(); }, []));

  const fetchStoredDriverAndBus = async () => {
    try {
      setLoading(true);

      const storedUserData = await AsyncStorage.getItem("userData");

      if (!storedUserData) {
        router.replace("/(auth)/driver-login");
        return;
      }

      const parsedDriver = JSON.parse(storedUserData);
      setDriver(parsedDriver);

      // The full bus object already lives in AsyncStorage alongside the driver
      if (parsedDriver.bus) {
        setBusData(parsedDriver.bus);
      }
    } catch (error) {
      console.log(error);
      Alert.alert("Error", "Could not connect to server.");
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------------------------------
  // Socket listeners: viewer count + driver online/offline recovery
  // --------------------------------------------------------------
  useEffect(() => {
    const roomId = busData?._id;
    if (!roomId) return;

    const onViewerCount = (data: { roomId: string; count: number }) => {
      if (data.roomId === roomId) setViewerCount(data.count);
    };

    const onDriverOffline = (data: { roomId: string; reason?: string }) => {
      if (data.roomId === roomId && data.reason === 'inactive') {
        // Server marked us offline due to inactivity — location watcher
        // probably died silently, so reflect that in the UI.
        setIsSharing(false);
      }
    };

    // If the socket reconnects mid-trip (e.g. brief network drop),
    // resume the same trip instead of losing driver/bus info server-side.
    const onConnect = () => {
      const driverId = driver?._id || driver?.id;
      if (isSharing && driverId) {
        socket.emit('resume-trip', { driverId });
      }
    };

    // Surface connection problems instead of failing silently
    const onConnectError = (err: any) => {
      console.log('Socket connect_error:', err?.message || err);
    };

    socket.on('viewer-count', onViewerCount);
    socket.on('driver-offline', onDriverOffline);
    socket.on('connect', onConnect);
    socket.on('connect_error', onConnectError);

    return () => {
      socket.off('viewer-count', onViewerCount);
      socket.off('driver-offline', onDriverOffline);
      socket.off('connect', onConnect);
      socket.off('connect_error', onConnectError);
    };
  }, [busData?._id, isSharing, driver]);

  // Stop the GPS watcher and any pending ack timeout on unmount
  useEffect(() => {
    return () => {
      locationSubscription.current?.remove();
      if (ackTimeoutRef.current) clearTimeout(ackTimeoutRef.current);
    };
  }, []);

  const clearAckTimeout = () => {
    if (ackTimeoutRef.current) {
      clearTimeout(ackTimeoutRef.current);
      ackTimeoutRef.current = null;
    }
  };

  const beginLocationWatch = (roomId: string) => {
    Location.watchPositionAsync(
      { accuracy: Location.Accuracy.High, distanceInterval: 10, timeInterval: 10000 },
      (loc) => {
        const coords = {
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        };
        setCurrentLocation(coords);

        socket.emit('update-location', {
          roomId,
          latitude: coords.latitude,
          longitude: coords.longitude,
          speed: loc.coords.speed || 0,
        });
      }
    )
      .then((sub) => {
        locationSubscription.current = sub;
      })
      .catch((err) => {
        console.log('watchPositionAsync failed:', err);
        Alert.alert('Location error', 'Could not start tracking your position.');
      });
  };

  const handleToggleSharing = async () => {
    if (isSharing) {
      // 1. Stop the GPS watcher
      locationSubscription.current?.remove();
      locationSubscription.current = null;

      // 2. Stop the location service (whatever background logic it does)
      await stopLocationSharing();

      // 3. Tell the server this trip has ended
      socket.emit('stop-sharing', busData._id);

      setIsSharing(false);
      setViewerCount(0);
      return;
    }

    const driverId = driver?._id || driver?.id;
    if (!busData?._id || !driverId) {
      Alert.alert('Error', 'Missing driver or bus information.');
      return;
    }

    // Bail out early and clearly if the socket isn't even connected —
    // this is the most common reason the button used to spin forever.
    if (!socket.connected) {
      Alert.alert(
        'Not connected',
        'Cannot reach the server right now. Check your network and try again.'
      );
      return;
    }

    try {
      setIsStarting(true);

      // 1. Ask location permission up front
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission required', 'Location permission is needed to share your trip.');
        setIsStarting(false);
        return;
      }

      // 2. Failsafe: if the server never acks start-trip, stop spinning
      //    and tell the user instead of hanging forever.
      ackTimeoutRef.current = setTimeout(() => {
        setIsStarting(false);
        Alert.alert(
          'No response from server',
          'The server did not respond in time. Please try again.'
        );
      }, START_TRIP_ACK_TIMEOUT_MS);

      // 3. Tell the server the trip is starting — this fetches driver +
      //    bus info server-side and marks the room live before we start
      //    sending location updates.
      socket.emit('start-trip', { roomId: busData._id, driverId }, (res: any) => {
        clearAckTimeout();
        setIsStarting(false);

        if (!res?.ok) {
          Alert.alert('Error', res?.error || 'Could not start the trip.');
          return;
        }

        setIsSharing(true);

        // Start whatever background/location-service logic exists
        startLocationSharing(busData._id);

        // Watch position for the local map marker + emit updates
        beginLocationWatch(busData._id);
      });
    } catch (error) {
      clearAckTimeout();
      setIsStarting(false);
      Alert.alert('Error', 'Could not start location sharing.');
    }
  };

  const getTripStatus = (trip: any) => {
    const now = new Date();
    const parseTime = (timeStr: string) => {
      const [time, period] = timeStr.split(' ');
      let [hours, minutes] = time.split(':').map(Number);
      if (period === 'PM' && hours < 12) hours += 12;
      if (period === 'AM' && hours === 12) hours = 0;
      const date = new Date();
      date.setHours(hours, minutes, 0, 0);
      return date;
    };
    const startTime = parseTime(trip.from?.time || "12:00 AM");
    const endTime = parseTime(trip.to?.time || "11:59 PM");
    if (now >= startTime && now <= endTime) return 'running';
    return now < startTime ? 'future' : 'completed';
  };

  // Sharing on -> show the live map
  if (isSharing) {
    return (
      <LiveTrackingView
        location={currentLocation}
        onStop={handleToggleSharing}
        viewerCount={viewerCount}
      />
    );
  }

  if (loading) return <View style={styles.centered}><ActivityIndicator size="large" /></View>;

  const filteredTrips = (busData?.trips || []).filter((t: any) => getTripStatus(t) === activeTab);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.driverInfoCard}>
        <Text style={styles.cardHeader}>Driver Info</Text>
        <Text style={styles.infoText}>Name: {driver?.name}</Text>
        <Text style={styles.infoText}>Bus: {busData?.busName || 'N/A'}</Text>
      </View>

      <Text style={styles.title}>Today live trip</Text>
      <View style={styles.tabContainer}>
        {(['running', 'future', 'completed'] as TabType[]).map((tab) => (
          <TouchableOpacity key={tab} style={[styles.tab, activeTab === tab && styles.activeTab]} onPress={() => setActiveTab(tab)}>
            <Text style={styles.tabText}>{tab.charAt(0).toUpperCase() + tab.slice(1)}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {filteredTrips.map((trip: any, index: number) => (
        <View key={index} style={styles.tripCard}>
          <Text style={styles.tripTitle}>{trip.tripTitle || 'Trip Title'}</Text>
          <Text>From: {trip.from?.stop} - {trip.from?.time}</Text>
          <Text>To: {trip.to?.stop} - {trip.to?.time}</Text>
          {activeTab === 'running' && (
            <TouchableOpacity
              style={styles.liveButton}
              onPress={handleToggleSharing}
              disabled={isStarting}
            >
              {isStarting ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Share2 size={16} color="#fff" />
                  <Text style={styles.buttonText}> Share Location</Text>
                </>
              )}
            </TouchableOpacity>
          )}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f9f9f9' },
  driverInfoCard: { padding: 20, backgroundColor: '#fff', borderRadius: 10, borderWidth: 1, borderColor: '#ddd', marginBottom: 20 },
  cardHeader: { fontWeight: 'bold', fontSize: 18, marginBottom: 10 },
  infoText: { fontSize: 14, color: '#555' },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  tabContainer: { flexDirection: 'row', backgroundColor: '#eee', borderRadius: 8, marginBottom: 15 },
  tab: { flex: 1, padding: 12, alignItems: 'center' },
  activeTab: { backgroundColor: '#004b8d', borderRadius: 8 },
  tabText: { fontWeight: 'bold' },
  tripCard: { padding: 15, backgroundColor: '#fff', borderRadius: 10, borderWidth: 1, borderColor: '#ddd', marginBottom: 10 },
  tripTitle: { fontWeight: 'bold', fontSize: 16 },
  liveButton: { flexDirection: 'row', backgroundColor: '#2563eb', padding: 10, borderRadius: 8, marginTop: 10, justifyContent: 'center' },
  buttonText: { color: '#fff', fontWeight: 'bold' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' }
});