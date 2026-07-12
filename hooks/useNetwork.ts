import NetInfo from "@react-native-community/netinfo";
import { useEffect, useState } from "react";

export default function useNetwork() {
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(
        state.isConnected === true &&
        state.isInternetReachable !== false
      );
    });

    return unsubscribe;
  }, []);

  return isConnected;
}