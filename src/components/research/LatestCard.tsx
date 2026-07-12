import { Research } from "@/src/types/Research.service.types";
import { Clock3 } from "lucide-react-native";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface Props{
item:Research
}

export default function LatestCard({item}:Props){

return(

<View style={styles.card}>

<Clock3
size={20}
color="#2563EB"
/>

<View style={{marginLeft:12,flex:1}}>

<Text
numberOfLines={2}
style={styles.title}
>

{item.paperTitle}

</Text>

<Text style={styles.author}>
{item.fullName}
</Text>

</View>

</View>

)

}

const styles=StyleSheet.create({

card:{
backgroundColor:"#fff",
padding:14,
marginBottom:10,
borderRadius:14,
flexDirection:"row",
alignItems:"center"
},

title:{
fontWeight:"600"
},

author:{
marginTop:4,
color:"#6B7280"
}

})