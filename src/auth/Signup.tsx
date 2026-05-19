import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Animated,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { cssInterop } from 'nativewind';

// Interop allows NativeWind's 'className' to safely style the LinearGradient component
cssInterop(LinearGradient, {
  className: 'style',
});

export default function Signup({ navigation }: any) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Background Animation Setup (Identical to your other frames)
  const blob1Anim = useRef(new Animated.Value(0)).current;
  const blob2Anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const floatBlob1 = Animated.loop(
      Animated.sequence([
        Animated.timing(blob1Anim, { toValue: 1, duration: 6000, useNativeDriver: true }),
        Animated.timing(blob1Anim, { toValue: 0, duration: 6000, useNativeDriver: true }),
      ])
    );

    const floatBlob2 = Animated.loop(
      Animated.sequence([
        Animated.timing(blob2Anim, { toValue: 1, duration: 8000, useNativeDriver: true }),
        Animated.timing(blob2Anim, { toValue: 0, duration: 8000, useNativeDriver: true }),
      ])
    );

    Animated.parallel([floatBlob1, floatBlob2]).start();
  }, []);

  const blob1Transform = {
    transform: [
      { translateY: blob1Anim.interpolate({ inputRange: [0, 1], outputRange: [0, 15] }) },
      { translateX: blob1Anim.interpolate({ inputRange: [0, 1], outputRange: [0, -10] }) },
    ],
  };

  const blob2Transform = {
    transform: [
      { translateY: blob2Anim.interpolate({ inputRange: [0, 1], outputRange: [0, -20] }) },
      { translateX: blob2Anim.interpolate({ inputRange: [0, 1], outputRange: [0, 10] }) },
    ],
  };

  const handleSignup = () => {
    // Navigate onward or trigger context signup registration actions
    navigation.navigate('Details');
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      className="flex-1"
    >
      <View className="flex-1 bg-white">
        {/* LAYER 1: Base Vertical Gradient Background */}
        <LinearGradient
          colors={['#FFFFFF', '#F2E6EE', '#977DDF']} 
          locations={[0, 0.45, 1.0]} 
          className="absolute inset-0"
        />

        {/* LAYER 2: Bottom Heavy Purple Blob */}
        <Animated.Image // 6. Changed to Animated.Image
            source={require('../assets/images/#977DDF.png')}
            // Merged your custom style coordinates with the animation transforms 🔑
            style={[{ bottom: -200, right: 100 }, blob1Transform]} 
            className="absolute w-[350px] h-[350px] opacity-60"
            resizeMode="contain"
        />

        {/* LAYER 3: Content Layer */}
        <SafeAreaView className="flex-1 justify-center px-10">
          
          {/* Header Title */}
          <View className="mb-8">
            <Text className="text-5xl font-zalando font-black text-gray-900 tracking-tight leading-tight">
              Create Account
            </Text>
          </View>

          {/* Form Fields Stack */}
          <View className="gap-y-4">
            
            {/* Name Input Field */}
            <View className="gap-y-2">
              <Text className="text-base font-roboto font-medium text-gray-700">
                Name
              </Text>
              <TextInput
                className="bg-[#F6F5F7] h-14 rounded-2xl px-5 text-gray-800 font-roboto text-base"
                placeholder="JohnDoe"
                placeholderTextColor="#A19EAB"
                value={name}
                onChangeText={setName}
              />
            </View>

            {/* Email Input Field */}
            <View className="gap-y-2">
              <Text className="text-base font-roboto font-medium text-gray-700">
                Email
              </Text>
              <TextInput
                className="bg-[#F6F5F7] h-14 rounded-2xl px-5 text-gray-800 font-roboto text-base"
                placeholder="johnDoe@gmail.com"
                placeholderTextColor="#A19EAB"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
            </View>

            {/* Password Input Field */}
            <View className="gap-y-2">
              <Text className="text-base font-roboto font-medium text-gray-700">
                Password
              </Text>
              <TextInput
                className="bg-[#F6F5F7] h-14 rounded-2xl px-5 text-gray-800 font-roboto text-base"
                placeholder="********"
                placeholderTextColor="#A19EAB"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
            </View>

            {/* Confirm Password Input Field */}
            <View className="gap-y-2">
              <Text className="text-base font-roboto font-medium text-gray-700">
                Confirm Password
              </Text>
              <TextInput
                className="bg-[#F6F5F7] h-14 rounded-2xl px-5 text-gray-800 font-roboto text-base"
                placeholder="********"
                placeholderTextColor="#A19EAB"
                secureTextEntry
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
            </View>

            {/* Submit Action Sign Up Button */}
            <TouchableOpacity
              activeOpacity={0.8}
              className="bg-[#977DDF] h-16 rounded-full shadow-sm items-center justify-center mt-4"
              onPress={handleSignup}
            >
              <Text className="text-white font-roboto text-xl font-semibold">
                Create Account
              </Text>
            </TouchableOpacity>

            {/* Footer Bottom Redirect Options */}
            <View className="flex-row justify-center items-center mt-2 gap-x-1">
              <Text className="text-xs font-roboto text-gray-600">
                Already have an Account?
              </Text>
              <TouchableOpacity 
                activeOpacity={0.7}
                onPress={() => navigation.navigate('Login')}
              >
                <Text className="text-xs font-roboto font-semibold text-purple-500">
                  Login here
                </Text>
              </TouchableOpacity>
            </View>

          </View>

        </SafeAreaView>
      </View>
    </KeyboardAvoidingView>
  );
}