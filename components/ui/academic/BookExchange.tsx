import { BookOpen } from "lucide-react-native"
import { Text, TouchableOpacity, View } from "react-native"

export default function BookExchange() {
  return (
    <View className="bg-card border border-border rounded-xl p-4 flex-row items-center gap-3 shadow-sm">
      <View className="bg-primary/10 p-3 rounded-lg">
        <BookOpen size={20} color="#3b82f6" />
      </View>
      <View className="flex-1">
        <Text className="font-semibold text-base">Book Exchange</Text>
        <Text className="text-muted-foreground text-sm">
          Exchange or donate books with students in your area.
        </Text>
      </View>
      <TouchableOpacity className="bg-primary px-3 py-1.5 rounded-lg">
        <Text className="text-white text-sm">Open</Text>
      </TouchableOpacity>
    </View>
  )
}
