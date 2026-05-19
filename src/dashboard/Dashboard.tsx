import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

// In a real app, you'd define a TypeScript type for your routes
export default function Dashboard({ route, navigation }: any) {
  
  // 1. Extract the data passed from the previous screen
  // If no params are passed, we provide a fallback object
  const { itemId, otherParam } = route.params || { itemId: 0, otherParam: 'No data' };

  return (
    <View className="flex-1 items-center justify-center bg-slate-50 p-6">
      
      <Text className="text-2xl font-bold text-slate-800 mb-4">
        Details Screen
      </Text>

      <View className="bg-white p-4 rounded-xl shadow-md w-full mb-6">
        <Text className="text-slate-600">Item ID: {itemId}</Text>
        <Text className="text-slate-600">Message: {otherParam}</Text>
      </View>

      {/* Custom Styled Button using NativeWind */}
      <TouchableOpacity 
        className="bg-blue-500 px-6 py-3 rounded-full mb-3"
        onPress={() => navigation.push('Details', { itemId: Math.floor(Math.random() * 100) })}
      >
        <Text className="text-white font-semibold">Push Another Details Screen</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        className="border border-slate-300 px-6 py-3 rounded-full"
        onPress={() => navigation.goBack()}
      >
        <Text className="text-slate-600 font-semibold">Go Back</Text>
      </TouchableOpacity>

    </View>
  );
}