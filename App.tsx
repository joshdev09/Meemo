import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';

import Login from './src/auth/Login';
import Signup from './src/auth/Signup';
import Dashboard from './src/dashboard/Dashboard';
import Welcome from './src/auth/Welcome';

SplashScreen.preventAutoHideAsync();

const Stack = createNativeStackNavigator();

export default function App() {
  // 1. Load your custom fonts
  const [fontsLoaded, fontError] = useFonts({
    'Zalando-Sans': require('./src/assets/fonts/ZalandoSansExpanded-VariableFont_wght.ttf'),
    'Inter-Regular': require('./src/assets/fonts/Inter-VariableFont_opsz,wght.ttf'),
    'EB-Garamond': require('./src/assets/fonts/EBGaramond-VariableFont_wght.ttf'),
    'Roboto-Regular': require('./src/assets/fonts/Roboto-VariableFont_wdth,wght.ttf'),
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        
        <Stack.Screen 
          name="Home" 
          component={Welcome} 
          options={{ headerShown: false }} 
        />

        <Stack.Screen 
          name="Login" 
          component={Login} 
          options={{ headerShown: false }}
        />

        <Stack.Screen 
          name="Signup" 
          component={Signup} 
          options={{ headerShown: false }}
        />

        <Stack.Screen 
          name="Details" 
          component={Dashboard}
          options={{ headerShown: false }} 
        />
        
      </Stack.Navigator>
    </NavigationContainer>
  );
}