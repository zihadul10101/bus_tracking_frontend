 import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import { io } from 'socket.io-client';

const LOCATION_TASK_NAME = 'background-location-task';

const API_URL = `${process.env.EXPO_PUBLIC_SOCKET_URL}/api/v1/location`;

export const socket = io(process.env.EXPO_PUBLIC_SOCKET_URL, {
  transports: ['websocket'], 
});
TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }: any) => {
  if (error) return;
  if (data) {
    const { locations } = data;
    const location = locations[0];

    const busId = await AsyncStorage.getItem('activeBusId');

    if (busId) {
      socket.emit("update-location", {
        roomId: busId,
        latitude: location.coords.latitude,
        longitude: location.coords.longitude
      });
    }
  }
});

export const startLocationSharing = async (busId: string) => {
  await AsyncStorage.setItem('activeBusId', busId);
  await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
    accuracy: Location.Accuracy.High,
    timeInterval: 5000,
    distanceInterval: 10,
    foregroundService: {
      notificationTitle: "Location Sharing",
      notificationBody: "Sharing live location with students",
    },
  });
};

export const stopLocationSharing = async () => {
  await AsyncStorage.removeItem('activeBusId');
  await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
};

const getAuthHeaders = async () => {
  const token = await AsyncStorage.getItem('userToken');
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  } else {
    console.warn("⚠️ Warning: Auth Token Not Found in AsyncStorage!");
  }
  return headers;
};


const handleResponse = async (response: Response, defaultMessage: string) => {
  const contentType = response.headers.get("content-type");
  if (!contentType || !contentType.includes("application/json")) {
    const htmlError = await response.text();
    console.error("🚨 Non-JSON response received:", htmlError);
    throw new Error(`Server error (Status: ${response.status}). Non-JSON received.`);
  }

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || defaultMessage);
  }
  return data;
};

export interface Stop {
  stopName: string;
  time: string | null;
  sequence: number;
}

export interface LiveRoomData {
  busId: string;
  busName: string;
  busNo: string;

  [key: string]: any;
}

export interface RoomStatusData {
  busName: string;
  busNo: string;
  [key: string]: any;
}

export const locationService = {
  // 1. GET ALL ACTIVE/LIVE ROOMS -> /active-trips
  getAllLiveRooms: async (): Promise<{ success: boolean; count: number; activeRooms: LiveRoomData[] }> => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/active-trips`, {
      method: 'GET',
      headers,
    });
    return handleResponse(response, 'Failed to fetch active live rooms');
  },

  // 2. GET SPECIFIC ROOM STATUS -> /status/:roomId
  getRoomStatus: async (roomId: string): Promise<{ success: boolean; data: RoomStatusData }> => {
    if (!roomId) {
      console.warn("🛡️ locationService: getRoomStatus cancelled because roomId is empty.");
      return Promise.reject(new Error('Invalid room ID specification'));
    }

    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/status/${roomId}`, {
      method: 'GET',
      headers,
    });
    return handleResponse(response, 'Bus is currently offline');
  },
};