import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
} from 'react-native';

export default function login({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    navigation.navigate('Details');
  };

  return (
    <View className="flex-1 justify-center bg-white px-6">
      
      <Text className="text-4xl font-bold text-center mb-10">
        Welcome Back
      </Text>

      <TextInput
        className="border border-gray-300 rounded-xl p-4 mb-5"
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        className="border border-gray-300 rounded-xl p-4 mb-5"
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity
        className="bg-blue-500 p-4 rounded-xl"
        onPress={handleLogin}
      >
        <Text className="text-white text-center font-bold text-base">
          Login
        </Text>
      </TouchableOpacity>

    </View>
  );
}