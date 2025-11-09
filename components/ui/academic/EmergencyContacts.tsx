import { Phone } from "lucide-react-native"
import { Text, TouchableOpacity, View } from "react-native"

export default function EmergencyContacts() {
  return (
    <View className="bg-card border border-border rounded-xl p-4 flex-row items-center gap-3 shadow-sm">
      <View className="bg-red-100 p-3 rounded-lg">
        <Phone size={20} color="#ef4444" />
      </View>
      <View className="flex-1">
        <Text className="font-semibold text-base">Emergency Contacts</Text>
        <Text className="text-muted-foreground text-sm">
          Quick access to emergency and important contact numbers.
        </Text>
      </View>
      <TouchableOpacity className="bg-red-500 px-3 py-1.5 rounded-lg">
        <Text className="text-white text-sm">Call</Text>
      </TouchableOpacity>
    </View>
  )
}
