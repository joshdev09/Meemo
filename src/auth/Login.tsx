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
  Image,
  Alert,
  ActivityIndicator
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { cssInterop } from 'nativewind';
import { Ionicons } from '@expo/vector-icons'; 
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../dashboard/storage/supabase'; 

// Interop allows NativeWind's 'className' to safely style the LinearGradient component
cssInterop(LinearGradient, {
  className: 'style',
});

export default function Login({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false); 
  const [showPassword, setShowPassword] = useState(false); 

  // Background Animation Setup
  const blob1Anim = useRef(new Animated.Value(0)).current;
  const blob2Anim = useRef(new Animated.Value(0)).current;

  // 🔑 NEW: Load saved email when the screen opens
  useEffect(() => {
    const loadSavedEmail = async () => {
      try {
        const savedEmail = await AsyncStorage.getItem('meemo_saved_email');
        if (savedEmail) {
          setEmail(savedEmail);
          setRememberMe(true);
        }
      } catch (e) {
        console.error('Failed to load email', e);
      }
    };
    loadSavedEmail();
  }, []);

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

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password.');
      return;
    }

    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) {
      Alert.alert('Login Failed', error.message);
    } else {
      // 🔑 NEW: Handle the Remember Me checkbox logic
      if (rememberMe) {
        await AsyncStorage.setItem('meemo_saved_email', email);
      } else {
        await AsyncStorage.removeItem('meemo_saved_email');
      }
      
      navigation.navigate('Dashboard');
    }

    setLoading(false);
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
          locations={[0, 0.7, 1.0]} 
          className="absolute inset-0"
        />

        {/* LAYER 2: Bottom Heavy Purple Blob */}
        <Animated.Image 
          source={require('../assets/images/#977DDF.png')}
          style={[{ bottom: -200, right: 100 }, blob1Transform]} 
          className="absolute w-[350px] h-[350px] opacity-60"
          resizeMode="contain"
        />

        {/* LAYER 3: Bottom Heavy Purple Blob */}
        <Animated.Image 
          source={require('../assets/images/#F2E6EE.png')}
          style={[{ bottom: 90, left: 280 }, blob2Transform]}
          className="absolute w-[250px] h-[250px] opacity-90"
          resizeMode="contain"
        />

        <TouchableOpacity 
          activeOpacity={0.7}
          onPress={() => navigation.navigate('Welcome')} // 🔑 Navigates back to the Welcome screen
          className="top-20 px-7 z-50" // 🔑 Added z-50 to make sure the animated blobs don't cover it
        > 
          <Image 
            source={require('../assets/icons/left.png')}
            style={{width: 30, height: 30}}
            resizeMode="contain"
          />
        </TouchableOpacity>

        {/* LAYER 4: Content Layer */}
        <SafeAreaView className="flex-1 justify-center px-10">
          
          {/* Header Title */}
          <View className="mb-10">
            <Text className="text-5xl font-zalando font-black text-gray-900 tracking-tight leading-tight">
              Let’s get{"\n"}you back in
            </Text>
          </View>

          {/* Form Fields */}
          <View className="gap-y-5">
            
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
              
              <View className="bg-[#F6F5F7] h-14 rounded-2xl px-5 flex-row items-center">
                <TextInput
                  className="flex-1 text-gray-800 font-roboto text-base h-full"
                  placeholder="********"
                  placeholderTextColor="#A19EAB"
                  secureTextEntry={!showPassword} 
                  value={password}
                  onChangeText={setPassword}
                />
                
                {/* 🔑 Updated to use the lavender eye icon */}
                <TouchableOpacity 
                  activeOpacity={0.7}
                  onPress={() => setShowPassword(!showPassword)}
                  className="pl-3 py-2"
                >
                  <Ionicons 
                    name={showPassword ? "eye-outline" : "eye-off-outline"} 
                    size={22} 
                    color="#977DDF" 
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Remember Me & Forgot Password Layout Options */}
            <View className="flex-row items-center justify-between mt-1">
              
              {/* Checkbox Wrapper */}
              <TouchableOpacity 
                activeOpacity={0.7}
                onPress={() => setRememberMe(!rememberMe)}
                className="flex-row items-center gap-x-2"
              >
                <View className={`w-5 h-5 rounded border ${rememberMe ? 'bg-purple-500 border-purple-500' : 'border-gray-300 bg-[#F6F5F7]'}`} />
                <Text className="text-xs font-roboto font-medium text-gray-600">
                  Remember me
                </Text>
              </TouchableOpacity>

              {/* Forgot Password Trigger */}
              <TouchableOpacity activeOpacity={0.7}>
                <Text className="text-xs font-roboto font-medium text-gray-600">
                  Forgot Password
                </Text>
              </TouchableOpacity>
            </View>

            {/* Submit Action Login Button */}
            <TouchableOpacity
              activeOpacity={0.8}
              className={`bg-[#977DDF] h-16 rounded-full shadow-sm items-center justify-center mt-6 ${loading ? 'opacity-70' : ''}`}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#ffffff" size="small" />
              ) : (
                <Text className="text-white font-roboto text-xl font-semibold">
                  Login
                </Text>
              )}
            </TouchableOpacity>

            {/* Footer Bottom Link Options */}
            <View className="flex-row justify-center items-center mt-4 gap-x-1">
              <Text className="text-xs font-roboto text-gray-600">
                Don’t have an Account?
              </Text>
              <TouchableOpacity 
                activeOpacity={0.7}
                onPress={() => navigation.navigate('Signup')}
              >
                <Text className="text-xs font-roboto font-semibold text-[#977DDF]">
                  Sign Up here
                </Text>
              </TouchableOpacity>
            </View>

          </View>

        </SafeAreaView>
      </View>
    </KeyboardAvoidingView>
  );
}