import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import MaterialListScreen from "../screens/material/MaterialListScreen";
import MaterialDetailScreen from "../screens/material/MaterialDetailScreen";

export type MaterialStackParamList = {
  MaterialList: undefined;
  MaterialDetail: { slug: string };
};

const Stack = createNativeStackNavigator<MaterialStackParamList>();

export default function MaterialStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="MaterialList" component={MaterialListScreen} options={{ title: "Materials" }} />
      <Stack.Screen name="MaterialDetail" component={MaterialDetailScreen} options={{ title: "Detail" }} />
    </Stack.Navigator>
  );
}