import React, { useEffect, useRef } from 'react';
import { Text, View, TouchableOpacity, SafeAreaView, Image, Animated } from 'react-native'; // 1. Added Animated
import { LinearGradient } from 'expo-linear-gradient';
import { cssInterop } from 'nativewind';

// Interop allows NativeWind's 'className' to safely style the LinearGradient component
cssInterop(LinearGradient, {
  className: 'style',
});

const Welcome = ({ navigation }: {navigation: any}) => {
  // 2. Create animated values for both blobs
  const blob1Anim = useRef(new Animated.Value(0)).current;
  const blob2Anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 3. Loop sequence for Middle Lavender Blob (6-second cycle)
    const floatBlob1 = Animated.loop(
      Animated.sequence([
        Animated.timing(blob1Anim, {
          toValue: 1,
          duration: 6000,
          useNativeDriver: true, // Offloads animation to hardware thread for 60fps performance 🔑
        }),
        Animated.timing(blob1Anim, {
          toValue: 0,
          duration: 6000,
          useNativeDriver: true,
        }),
      ])
    );

    // 4. Loop sequence for Bottom Purple Blob (8-second cycle so they drift out of sync)
    const floatBlob2 = Animated.loop(
      Animated.sequence([
        Animated.timing(blob2Anim, {
          toValue: 1,
          duration: 8000,
          useNativeDriver: true,
        }),
        Animated.timing(blob2Anim, {
          toValue: 0,
          duration: 8000,
          useNativeDriver: true,
        }),
      ])
    );

    // Start both animations together
    Animated.parallel([floatBlob1, floatBlob2]).start();
  }, []);

  // 5. Map 0-to-1 loops to gentle translation movements (up/down/left/right)
  const blob1Transform = {
    transform: [
      {
        translateY: blob1Anim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 15], // Gently drifts down 15px
        }),
      },
      {
        translateX: blob1Anim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -10], // Gently drifts left 10px
        }),
      },
    ],
  };

  const blob2Transform = {
    transform: [
      {
        translateY: blob2Anim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -20], // Gently drifts up 20px
        }),
      },
      {
        translateX: blob2Anim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 10], // Gently drifts right 10px
        }),
      },
    ],
  };

  return (
    <View className="flex-1">
      {/* LAYER 1: Base Vertical Gradient Background */}
      <LinearGradient
        colors={['#FFFFFF', '#F2E6EE', '#977DDF']} 
        locations={[0, 0.45, 1.0]} 
        className="absolute inset-0"
      />

      {/* LAYER 2: Middle Lavender Blob */}
      <Animated.Image // 6. Changed to Animated.Image
        source={require('../assets/images/#977DDF.png')}
        // Merged your custom style coordinates with the animation transforms 🔑
        style={[{ bottom: -70, right: 100 }, blob1Transform]} 
        className="absolute w-[350px] h-[350px] opacity-60"
        resizeMode="contain"
      />

      {/* LAYER 3: Bottom Heavy Purple Blob */}
      <Animated.Image // 6. Changed to Animated.Image
        source={require('../assets/images/#F2E6EE.png')}
        // Merged your custom style coordinates with the animation transforms 🔑
        style={[{ bottom: 260, left: 65 }, blob2Transform]}
        className="absolute w-[450px] h-[450px] opacity-90"
        resizeMode="contain"
      />

      {/* LAYER 4: Content Layer */}
      <SafeAreaView className="flex-1">
        
        {/* Main Content Container spaced vertically */}
        <View className="flex-1 justify-between px-10 py-12">
          
          {/* Top Section: Headers & Catchphrase */}
          <View className="mt-10 gap-y-6">
            
            {/* Main Bold Title */}
            <View>
              <Text className="text-5xl mt-20 font-zalando font-black text-black tracking-tight">
                Welcome to
              </Text>
              <Text className="text-5xl font-zalando font-black text-purple-600 tracking-tight">
                Meemo.
              </Text>
            </View>

            {/* "Get Started" Divider */}
            <View className="flex-row mt-20 items-center gap-x-3 my-2">
              <Text className="text-sm font-roboto font-normal text-gray-600 uppercase tracking-wider">
                Get Started
              </Text>
              <View className="flex-1 h-[1px] bg-gray-400" />
            </View>

            {/* Serif Subtitle Description */}
            <View>
              <Text className="text-5xl font-serif text-gray-900 font-medium leading-[60px]">
                Plan your day and get Productive.
              </Text>
            </View>
          </View>

          {/* Bottom Section: Authentication Buttons */}
          <View className="gap-y-4 w-full mb-4">
            
            {/* Login Button */}
            <TouchableOpacity 
              activeOpacity={0.8}
              onPress={() => navigation.navigate('Login')}
              className="bg-white h-16 rounded-full shadow-xl items-center justify-center"
            >
              <Text className="text-gray-700 font-roboto text-xl font-semibold">
                Login
              </Text>
            </TouchableOpacity>

            {/* Create Account Button */}
            <TouchableOpacity 
              activeOpacity={0.8}
              onPress={() => navigation.navigate('Signup')}
              className="bg-[#110F1B] h-16 rounded-full shadow-xl items-center justify-center"
            >
              <Text className="text-white font-roboto text-xl font-semibold">
                Create Account
              </Text>
            </TouchableOpacity>
            
          </View>

        </View>
      </SafeAreaView>
    </View>
  );
};

export default Welcome;