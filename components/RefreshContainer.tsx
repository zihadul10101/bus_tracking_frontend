import React, { useCallback, useState } from 'react';
import { RefreshControl, ScrollView, ScrollViewProps } from 'react-native';
import { colors } from '../constants/colors';

interface RefreshContainerProps extends ScrollViewProps {
  children: React.ReactNode;
  onRefreshAction: () => Promise<any>; 
}

export default function RefreshContainer({ 
  children, 
  onRefreshAction, 
  style, 
  ...props 
}: RefreshContainerProps) {
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await onRefreshAction();
    } catch (err) {
      console.warn("Container Refresh Error:", err);
    } finally {
      setRefreshing(false);
    }
  }, [onRefreshAction]);

  return (
    <ScrollView
      style={[{ flex: 1, backgroundColor: '#f8fafc' }, style]}
      keyboardShouldPersistTaps="handled"
      {...props} // অন্যান্য ScrollView-এর প্রোপার্টি পাস করার জন্য
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          tintColor={colors.primary} // iOS এর জন্য কালার
          colors={[colors.primary]}   // Android এর জন্য কালার
        />
      }
    >
      {children}
    </ScrollView>
  );
}