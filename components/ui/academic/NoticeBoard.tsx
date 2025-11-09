import { Bell } from "lucide-react-native"
import { Text, TouchableOpacity, View } from "react-native"

export default function NoticeBoard() {
  return (
    <View className="bg-card border border-border rounded-xl p-4 flex-row items-center gap-3 shadow-sm">
      <View className="bg-yellow-100 p-3 rounded-lg">
        <Bell size={20} color="#f59e0b" />
      </View>
      <View className="flex-1">
        <Text className="font-semibold text-base">Notice Board</Text>
        <Text className="text-muted-foreground text-sm">
          Stay updated with the latest campus or community notices.
        </Text>
      </View>
      <TouchableOpacity className="bg-yellow-500 px-3 py-1.5 rounded-lg">
        <Text className="text-white text-sm">View</Text>
      </TouchableOpacity>
    </View>
  )
}
