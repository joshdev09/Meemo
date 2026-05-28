import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Session } from '@supabase/supabase-js';

// --- Supabase Client ---
import { supabase } from './src/dashboard/storage/supabase';

// --- Auth Screens ---
import Login from './src/auth/Login';
import Signup from './src/auth/Signup';
import Welcome from './src/auth/Welcome';

// --- Dashboard Screens & Context ---
import { EventsProvider } from './src/dashboard/context/EventsContext';
import HomeScreen from './src/dashboard/screens/HomeScreen';

SplashScreen.preventAutoHideAsync();

const Stack = createNativeStackNavigator();

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [fontsLoaded, fontError] = useFonts({
    'Zalando-Sans': require('./src/assets/fonts/ZalandoSansExpanded-VariableFont_wght.ttf'),
    'Inter-Regular': require('./src/assets/fonts/Inter-VariableFont_opsz,wght.ttf'),
    'EB-Garamond': require('./src/assets/fonts/EBGaramond-VariableFont_wght.ttf'),
    'Roboto-Regular': require('./src/assets/fonts/Roboto-VariableFont_wdth,wght.ttf'),
  });

  // Check for an existing session on boot
  useEffect(() => {
    // 1. Fetch initial stored session data
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setAuthLoading(false);
    });

    // 2. Listen for security token transitions (Login, Logout, Expired session)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Keep splash screen visible until both fonts are cached AND auth token verification finishes
  useEffect(() => {
    if ((fontsLoaded || fontError) && !authLoading) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError, authLoading]);

  if ((!fontsLoaded && !fontError) || authLoading) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        <EventsProvider>
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            {session ? (
              // 🔒 PROTECTED ROUTE (Only mounted when logged in)
              // React Navigation automatically directs users here the millisecond session becomes active!
              <Stack.Screen
                name="Dashboard"
                component={HomeScreen}
              />
            ) : (
              // 🔑 AUTH ROUTES (Only mounted when logged out)
              // When logging out, this stack replaces the dashboard automatically.
              <>
                <Stack.Screen
                  name="Welcome"
                  component={Welcome}
                />
                <Stack.Screen
                  name="Login"
                  component={Login}
                />
                <Stack.Screen
                  name="Signup"
                  component={Signup}
                />
              </>
            )}
          </Stack.Navigator>
        </EventsProvider>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}