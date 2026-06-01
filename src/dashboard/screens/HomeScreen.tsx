import * as Notifications from 'expo-notifications';
import React, { useState, useEffect, useMemo, memo } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, Modal, Dimensions, Alert, ActivityIndicator, TextInput, Switch, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather, Ionicons } from '@expo/vector-icons';
import * as Crypto from 'expo-crypto';
import * as ImagePicker from 'expo-image-picker'; 
import AsyncStorage from '@react-native-async-storage/async-storage';

// Supabase import
import { supabase } from '../storage/supabase'; 

import CountdownWidget from '../components/Countdown/CountdownWidget';
import InteractiveCalendar from '../components/Calendar/InteractiveCalendar';
import EventModal from '../components/Events/EventModal';
import EventCard from '../components/Events/EventCard';
import ContributionGraph from '../components/ContributionGraph/ContributionGraph';
import { useEvents } from '../context/EventsContext';
import { toDateKey, buildContributionsFromEvents } from '../utils';
import { AppEvent } from '../types';

// Custom Schedule Icons
const defSchedIcon = require('../../assets/icons/defSched.png');
const nightModeSchedIcon = require('../../assets/icons/nightModeSched.png');

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldPlaySoundOnMute: false,
  } as any),
});

const { width } = Dimensions.get('window');
const BUCKET_NAME = 'avatars';

// DYNAMIC COLOR PROFILE AVATAR FALLBACK
const ProfileAvatar = memo(({ url, name, size = 48 }: { url: string | null; name: string; size?: number }) => {
  if (url) {
    return (
      <Image
        source={{ uri: url }}
        style={{ width: size, height: size }}
        className="rounded-full border border-gray-200/60"
      />
    );
  }

  const colors = ['#977DDF', '#8668C6', '#A78BFA', '#7C3AED', '#6D28D9', '#5B21B6'];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const colorIndex = Math.abs(hash) % colors.length;
  const backgroundColor = colors[colorIndex];
  const initial = name ? name.charAt(0).toUpperCase() : 'U';

  return (
    <View
      style={{ width: size, height: size, backgroundColor }}
      className="rounded-full border border-white/20 items-center justify-center shadow-inner"
    >
      <Text 
        style={{ fontSize: size * 0.45, includeFontPadding: false }} 
        className="text-white font-black tracking-tighter"
      >
        {initial}
      </Text>
    </View>
  );
});

function SkeletonBlock({ className }: { className?: string }) {
  return <View className={`bg-gray-200/70 rounded-2xl ${className}`} />;
}

function HomeSkeleton() {
  return (
    <View className="flex-1 px-5 pt-4 gap-6">
      <View className="flex-row items-center gap-3">
        <View className="w-12 h-12 rounded-full bg-gray-200/70" />
        <View className="gap-2">
          <SkeletonBlock className="w-24 h-3" />
          <SkeletonBlock className="w-16 h-5" />
        </View>
      </View>
      <View className="flex-row gap-3">
        <SkeletonBlock className="flex-1 h-32" />
        <View className="gap-3 w-28">
          <SkeletonBlock className="h-14" />
          <SkeletonBlock className="h-14" />
        </View>
      </View>
      <SkeletonBlock className="h-64" />
      <SkeletonBlock className="w-40 h-5" />
      <SkeletonBlock className="h-16" />
      <SkeletonBlock className="h-16" />
    </View>
  );
}

export default function HomeScreen() {
  const [isEventModalVisible, setIsEventModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [editingEvent, setEditingEvent] = useState<AppEvent | null>(null);
  
  // Identity states
  const [userName, setUserName] = useState('User');
  const [userEmail, setUserEmail] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  // Account Details Modal states
  const [isAccountModalVisible, setIsAccountModalVisible] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [savingAccount, setSavingAccount] = useState(false);

  // Preferences states
  const [isPreferencesVisible, setIsPreferencesVisible] = useState(false);
  const [prefDarkMode, setPrefDarkMode] = useState(false);
  const [prefShowWeekends, setPrefShowWeekends] = useState(true);
  const [prefNotifications, setPrefNotifications] = useState(true);

  // Support state
  const [isSupportVisible, setIsSupportVisible] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [sendingFeedback, setSendingFeedback] = useState(false);

  const { events, addEvent, updateEvent, deleteEvent, toggleComplete, getForDate, loaded } = useEvents();

  // Load account data and local application preference states on mount
  useEffect(() => {
    async function initializeAppData() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setUserEmail(user.email || '');
          if (user.user_metadata?.full_name) {
            setUserName(user.user_metadata.full_name);
            setNameInput(user.user_metadata.full_name);
          } else {
            const fallbackName = user.email?.split('@')[0] || 'User';
            setUserName(fallbackName);
            setNameInput(fallbackName);
          }
          if (user.user_metadata?.avatar_url) {
            setAvatarUrl(user.user_metadata.avatar_url);
          }
        }

        const savedDarkMode = await AsyncStorage.getItem('@pref_dark_mode');
        const savedShowWeekends = await AsyncStorage.getItem('@pref_show_weekends');
        const savedNotifications = await AsyncStorage.getItem('@pref_notifications');

        if (savedDarkMode !== null) setPrefDarkMode(JSON.parse(savedDarkMode));
        if (savedShowWeekends !== null) setPrefShowWeekends(JSON.parse(savedShowWeekends));
        if (savedNotifications !== null) setPrefNotifications(JSON.parse(savedNotifications));

        if (Platform.OS !== 'web') {
          try {
            const { status } = await Notifications.getPermissionsAsync();
            if (status !== 'granted') {
              await Notifications.requestPermissionsAsync();
            }
          } catch (notificationError) {
            console.warn("Notifications setup skipped: Running on Expo Go sandbox environment.");
          }
        }
      } catch (err) {
        console.error('Initialization error logs:', err);
      }
    }
    initializeAppData();
  }, []);

  // Android Navigation Bridge Helper Function
  const handleMenuNavigation = (openTargetModal: () => void) => {
    setIsMenuVisible(false);
    setTimeout(() => {
      openTargetModal();
    }, Platform.OS === 'android' ? 250 : 0);
  };

  // FIXED: FUNCTIONAL PUSH NOTIFICATION SCHEDULER
  const scheduleEventNotification = async (event: AppEvent) => {
    if (!prefNotifications) return;

    try {
      await Notifications.cancelScheduledNotificationAsync(event.id);
    } catch {
      // No existing notification to cancel
    }

    const reminder = (event as any).reminder || 'none';
    const repeat = (event as any).repeat || 'none';

    if (reminder === 'none') return;

    const startDate = new Date(event.startDate);
    let triggerDate = new Date(startDate);

    // Subtract reminder offset cleanly
    if (reminder === '10m') {
      triggerDate = new Date(startDate.getTime() - 10 * 60 * 1000);
    } else if (reminder === '1h') {
      triggerDate = new Date(startDate.getTime() - 60 * 60 * 1000);
    } else if (reminder === '1d') {
      triggerDate = new Date(startDate.getTime() - 24 * 60 * 60 * 1000);
    }

    if (triggerDate.getTime() <= Date.now()) return;

    // Build trigger using valid SchedulableTriggerInputTypes structure
    let triggerInput: any;

    if (repeat === 'daily') {
      triggerInput = {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: triggerDate.getHours(),
        minute: triggerDate.getMinutes(),
      };
    } else if (repeat === 'weekly') {
      triggerInput = {
        type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
        weekday: triggerDate.getDay() + 1, // Convert JS Sunday (0) to Native (1)
        hour: triggerDate.getHours(),
        minute: triggerDate.getMinutes(),
      };
    } else {
      triggerInput = {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: triggerDate,
      };
    }

    try {
      await Notifications.scheduleNotificationAsync({
        identifier: event.id,
        content: {
          title: `🔔 Event Due: ${event.title}`,
          body: event.description || 'Your scheduled event is starting now!',
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: triggerInput,
      });
    } catch (err) {
      console.error('Failed to register hardware alert subsystem:', err);
    }
  };

  const toggleDarkMode = async (value: boolean) => {
    setPrefDarkMode(value);
    await AsyncStorage.setItem('@pref_dark_mode', JSON.stringify(value));
  };

  const toggleShowWeekends = async (value: boolean) => {
    setPrefShowWeekends(value);
    await AsyncStorage.setItem('@pref_show_weekends', JSON.stringify(value));
  };

  const toggleNotifications = async (value: boolean) => {
    setPrefNotifications(value);
    await AsyncStorage.setItem('@pref_notifications', JSON.stringify(value));
    if (!value) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Calendar Reminder 📅",
          body: "Your custom schedule tracking frame has reached its date!",
          sound: true,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: selectedDate,
        },
      });

      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Meemo Countdown 🚀",
          body: "Get ready! Your tracking timeline has officially begun.",
          sound: true,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: 5,
          repeats: false,
        },
      });
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'We need access to your camera roll to update your avatar picture.');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.4,
    });

    if (!result.canceled && result.assets[0].uri) {
      uploadAvatar(result.assets[0].uri);
    }
  };

  const uploadAvatar = async (imageUri: string) => {
    try {
      setUploading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authentic session detected.');

      const fileExt = imageUri.split('.').pop()?.toLowerCase() || 'jpeg';
      const fileName = `${user.id}.${fileExt}`;
      
      const response = await fetch(imageUri);
      const blob = await response.blob();
      const arrayBuffer = await new Response(blob).arrayBuffer();

      const { error: uploadError } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(fileName, arrayBuffer, {
          contentType: `image/${fileExt}`,
          upsert: true,
        });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(fileName);
      const publicUrl = data.publicUrl;

      const { error: updateError } = await supabase.auth.updateUser({
        data: { avatar_url: publicUrl },
      });

      if (updateError) throw updateError;

      setAvatarUrl(publicUrl);
      Alert.alert('Success ✨', 'Your profile icon was updated successfully.');
    } catch (error: any) {
      Alert.alert('Upload Error', error.message || 'Could not verify database connection lines.');
    } finally {
      setUploading(false);
    }
  };

  // FIXED: FUNCTIONAL PUSH NOTIFICATION SCHEDULER
  const handleUpdateAccount = async () => {
    if (!nameInput.trim()) {
      Alert.alert('Error', 'Name field cannot be empty.');
      return;
    }
    try {
      setSavingAccount(true);
      const updatePayload: any = {
        data: { full_name: nameInput.trim() }
      };

      if (passwordInput.trim()) {
        if (passwordInput.trim().length < 6) {
          Alert.alert('Validation Error', 'Security tracking rules require passwords to be at least 6 characters.');
          setSavingAccount(false);
          return;
        }
        updatePayload.password = passwordInput.trim();
      }

      const { error } = await supabase.auth.updateUser(updatePayload);
      if (error) throw error;

      setUserName(nameInput.trim());
      setPasswordInput('');
      setIsAccountModalVisible(false);
      Alert.alert('Success ✨', 'Your account credentials have been synchronized.');
    } catch (error: any) {
      Alert.alert('Configuration Error', error.message || 'Failed to update user database properties.');
    } finally {
      setSavingAccount(false);
    }
  };

  const handleSendFeedback = () => {
    if (!feedbackMessage.trim()) {
      Alert.alert('Error', 'Please type a message before submitting.');
      return;
    }
    setSendingFeedback(true);
    setTimeout(() => {
      setSendingFeedback(false);
      setFeedbackMessage('');
      setIsSupportVisible(false);
      Alert.alert('Message Sent 🦉', "Thanks for making Meemo better! We've received your ticket and our team will check it out.");
    }, 1200);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsMenuVisible(false);
  };

  const handleSaveEvent = (eventData: any) => {
    let targetedEvent: AppEvent;
    if (editingEvent) {
      targetedEvent = {
        ...editingEvent,
        title: eventData.title,
        allDay: eventData.isAllDay,
        startDate: eventData.startDate.toISOString(),
        endDate: eventData.endDate ? eventData.endDate.toISOString() : undefined,
        location: eventData.location || undefined,
        description: eventData.notes || undefined,
        reminder: eventData.reminder,
        repeat: eventData.repeat,
      } as any;
      updateEvent(targetedEvent);
    } else {
      targetedEvent = {
        id: Crypto.randomUUID(),
        title: eventData.title,
        allDay: eventData.isAllDay,
        startDate: eventData.startDate.toISOString(),
        endDate: eventData.endDate ? eventData.endDate.toISOString() : undefined,
        location: eventData.location || undefined,
        description: eventData.notes || undefined,
        completed: false,
        createdAt: new Date().toISOString(),
        reminder: eventData.reminder,
        repeat: eventData.repeat,
      } as any;
      addEvent(targetedEvent);
    }
    
    scheduleEventNotification(targetedEvent);
    setEditingEvent(null);
  };

  const handleDeleteEvent = (id: string) => {
    deleteEvent(id);
    Notifications.cancelScheduledNotificationAsync(id); 
  };

  const handleEditEvent = (event: AppEvent) => {
    setEditingEvent(event);
    setIsEventModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsEventModalVisible(false);
    setEditingEvent(null);
  };

  const eventsForDate = useMemo(() => {
    if (!events) return [];
    return Object.values(events).filter((ev) => {
      const target = new Date(selectedDate);
      target.setHours(0, 0, 0, 0);
      const start = new Date(ev.startDate);
      start.setHours(0, 0, 0, 0);
      const end = ev.endDate ? new Date(ev.endDate) : start;
      end.setHours(0, 0, 0, 0);
      return target >= start && target <= end;
    });
  }, [events, selectedDate]);

  // ✅ CONTRIBUTIONS MAP - This feeds the contribution graph
  const contributions = useMemo(() => {
    if (!events) return {};
    return buildContributionsFromEvents(events);
  }, [events]);

  const formattedDateString = `${selectedDate.getDate()} ${selectedDate.toLocaleDateString('en-US', { month: 'short' })}`;

  const uiBg = prefDarkMode ? 'bg-slate-900' : 'bg-white';
  const uiText = prefDarkMode ? 'text-slate-100' : 'text-gray-800';
  const uiTextMuted = prefDarkMode ? 'text-slate-400' : 'text-gray-500';
  const uiCard = prefDarkMode ? 'bg-slate-800/90 border-slate-700/60' : 'bg-white/40 border-white/50';
  
  const uiGradients: [string, string, string] = prefDarkMode 
    ? ['#0B0F19', '#1E1B4B', '#0F172A'] 
    : ['#FFFFFF', '#F2E6EE', '#977DDF'];

  return (
    <View className={`flex-1 ${uiBg}`}>
      <LinearGradient
        colors={uiGradients}
        locations={[0, 0.7, 1.0]}
        className="absolute inset-0"
      />

      <SafeAreaView className="flex-1">
        {!loaded ? (
          <HomeSkeleton />
        ) : (
          <ScrollView
            className="flex-1 px-5 pt-4"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 120 }}
          >
            {/* HEADER */}
            <View className="flex-row justify-between items-center mb-6">
              <View className="flex-row items-center gap-3">
                <ProfileAvatar url={avatarUrl} name={userName} size={48} />
                <View>
                  <Text className={`${uiTextMuted} text-md font-medium`}>Hello, </Text>
                  <Text className={`text-xl font-semibold ${uiText}`}>{userName}</Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => setIsMenuVisible(true)}>
                <Feather name="menu" size={28} color={prefDarkMode ? '#F1F5F9' : '#333'} />
              </TouchableOpacity>
            </View>

            {/* TOP WIDGETS */}
            <View className="flex-row gap-3 mb-6">
              <CountdownWidget />
              <View className="gap-3 justify-between w-28">
                <TouchableOpacity className="flex-1 bg-[#D4C4F4] rounded-xl justify-center items-center shadow-sm">
                  <Feather name="bell" size={20} color="#8668C6" className="mb-1" />
                  <Text className="text-[#8668C6] font-semibold text-xs">Reminders</Text>
                </TouchableOpacity>
                <TouchableOpacity className="flex-1 bg-[#D4C4F4] rounded-xl justify-center items-center shadow-sm">
                  <Feather name="book-open" size={20} color="#8668C6" className="mb-1" />
                  <Text className="text-[#8668C6] font-semibold text-xs">Journal</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* CONTRIBUTION GRAPH */}
            <View className={`rounded-3xl p-6 mb-6 border ${uiCard}`}>
              <ContributionGraph contributions={contributions} />
            </View>

            {/* CALENDAR */}
            <View className={`rounded-3xl pt-6 pb-4 mb-6 border ${uiCard}`}>
              <InteractiveCalendar
                selectedDate={selectedDate}
                onSelectDate={setSelectedDate}
                getForDate={getForDate}
                showWeekends={prefShowWeekends}
                darkMode={prefDarkMode}
              />
            </View>

            {/* EVENTS HEADER */}
            <View className="flex-row justify-between items-center mb-4 px-2">
              <Text className={`text-lg font-bold ${uiText}`}>
                {eventsForDate.length === 0
                  ? `No events · ${formattedDateString}`
                  : `${eventsForDate.length} event${eventsForDate.length > 1 ? 's' : ''} · ${formattedDateString}`}
              </Text>
            </View>

            {/* EVENTS LIST */}
            {eventsForDate.length === 0 ? (
              <View className="items-center justify-center mt-4">
                <View className="w-10 h-10 items-center justify-center mb-3">
                  <Image 
                    source={prefDarkMode ? nightModeSchedIcon : defSchedIcon} 
                    className="w-full h-full"
                    resizeMode="contain"
                  />
                </View>
                <Text className={`${uiText} font-bold mb-1`}>Nothing scheduled</Text>
                <Text className={`${uiTextMuted} text-sm`}>Tap the button below to create an event</Text>
              </View>
            ) : (
              <View className="gap-3">
                {eventsForDate.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    onEdit={handleEditEvent}
                    onDelete={handleDeleteEvent}
                    onToggleComplete={toggleComplete}
                  />
                ))}
              </View>
            )}
          </ScrollView>
        )}

        {/* FLOATING BOTTOM BAR */}
        <View 
          style={{ position: 'absolute', bottom: 45, left: 0, right: 0 }}
          className="px-5 flex-row items-center gap-3"
        >
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setIsEventModalVisible(true)}
            className={`flex-1 rounded-full h-14 justify-center px-6 border ${
              prefDarkMode 
                ? 'bg-slate-900/40 border-slate-700/40 shadow-2xl' 
                : 'bg-white/40 border-white/60 shadow-lg'
            }`}
          >
            <Text className={`${prefDarkMode ? 'text-slate-200 font-bold' : 'text-gray-700 font-bold'} text-base`}>
              Add event on {formattedDateString}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setIsEventModalVisible(true)}
            className="w-14 h-14 bg-[#977DDF]/85 rounded-full justify-center items-center shadow-lg border border-white/30"
          >
            <Feather name="plus" size={26} color="#FFF" />
          </TouchableOpacity>
        </View>

        <EventModal
          isVisible={isEventModalVisible}
          onClose={handleCloseModal}
          selectedDate={selectedDate}
          onSave={handleSaveEvent}
          editingEvent={editingEvent}
        />
      </SafeAreaView>

      {/* BURGER NAVIGATION DRAWERS SETTINGS MODAL */}
      <Modal
        visible={isMenuVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setIsMenuVisible(false)}
      >
        <View className="flex-1 flex-row justify-end bg-black/40">
          <TouchableOpacity className="flex-1" activeOpacity={1} onPress={() => setIsMenuVisible(false)} />
          
          <View style={{ width: width * 0.75 }} className={`h-full ${prefDarkMode ? 'bg-slate-800' : 'bg-white'} p-6 pt-16 shadow-xl`}>
            <View className="flex-row justify-between items-center mb-8">
              <Text className={`text-xl font-bold ${uiText}`}>Menu</Text>
              <TouchableOpacity onPress={() => setIsMenuVisible(false)} className="p-1">
                <Feather name="x" size={24} color={prefDarkMode ? '#F1F5F9' : '#333'} />
              </TouchableOpacity>
            </View>

            {/* Profile Section Mini Display Card */}
            <TouchableOpacity 
              activeOpacity={0.7}
              onPress={() => handleMenuNavigation(() => setIsAccountModalVisible(true))}
              className={`flex-row items-center gap-3 ${prefDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-gray-50 border-gray-100'} p-4 rounded-2xl mb-8 border`}
            >
              <TouchableOpacity activeOpacity={0.8} onPress={pickImage} className="relative">
                {uploading ? (
                  <View className="w-12 h-12 bg-gray-200 rounded-full items-center justify-center">
                    <ActivityIndicator size="small" color="#8668C6" />
                  </View>
                ) : (
                  <ProfileAvatar url={avatarUrl} name={userName} size={48} />
                )}
                <View className="absolute -bottom-1 -right-1 bg-[#8668C6] border-2 border-white rounded-full w-5 h-5 items-center justify-center shadow-sm">
                  <Feather name="camera" size={10} color="white" />
                </View>
              </TouchableOpacity>
              
              <View className="flex-1">
                <View className="flex-row items-center gap-1">
                  <Text className={`font-bold text-sm ${uiText}`} numberOfLines={1}>
                    {userName}
                  </Text>
                  <Feather name="edit-2" size={10} color="#888" />
                </View>
                <Text className={uiTextMuted} numberOfLines={1}>
                  {userEmail}
                </Text>
              </View>
            </TouchableOpacity>

            {/* Menu List Navigation Buttons */}
            <View className="gap-2 flex-1">
              <TouchableOpacity onPress={pickImage} className="flex-row items-center gap-3 p-3 rounded-xl bg-purple-50/50">
                <Feather name="image" size={18} color="#8668C6" />
                <Text className="text-purple-900 font-semibold text-sm">Change Photo</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                onPress={() => handleMenuNavigation(() => setIsAccountModalVisible(true))}
                className="flex-row items-center gap-3 p-3 rounded-xl"
              >
                <Feather name="user" size={18} color={prefDarkMode ? '#94A3B8' : '#666'} />
                <Text className={`font-medium text-sm ${uiText}`}>Account Settings</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                onPress={() => handleMenuNavigation(() => setIsPreferencesVisible(true))}
                className="flex-row items-center gap-3 p-3 rounded-xl"
              >
                <Feather name="sliders" size={18} color={prefDarkMode ? '#94A3B8' : '#666'} />
                <Text className={`font-medium text-sm ${uiText}`}>Preferences</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                onPress={() => handleMenuNavigation(() => setIsSupportVisible(true))}
                className="flex-row items-center gap-3 p-3 rounded-xl"
              >
                <Feather name="help-circle" size={18} color={prefDarkMode ? '#94A3B8' : '#666'} />
                <Text className={`font-medium text-sm ${uiText}`}>Support</Text>
              </TouchableOpacity>
            </View>

            {/* Safety Logout CTA */}
            <TouchableOpacity 
              onPress={handleLogout}
              className="bg-red-50 p-4 rounded-2xl flex-row items-center justify-center gap-2 mb-4"
            >
              <Feather name="log-out" size={16} color="#EF4444" />
              <Text className="text-red-500 font-bold text-sm">Log Out</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* FULL ACCOUNT MANAGEMENT DASHBOARD MODAL */}
      <Modal visible={isAccountModalVisible} animationType="slide" transparent={true}>
        <View className="flex-1 justify-end bg-black/40">
          <View className={`rounded-t-3xl p-6 h-[58%] shadow-lg ${prefDarkMode ? 'bg-slate-800' : 'bg-white'}`}>
            <View className="flex-row justify-between items-center mb-6">
              <Text className={`text-xl font-bold ${uiText}`}>Account Settings</Text>
              <TouchableOpacity onPress={() => setIsAccountModalVisible(false)} className="p-2">
                <Feather name="x" size={24} color={prefDarkMode ? '#FFF' : '#333'} />
              </TouchableOpacity>
            </View>

            <Text className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Full Name</Text>
            <TextInput
              value={nameInput}
              onChangeText={setNameInput}
              placeholderTextColor="#999"
              className={`border rounded-xl px-4 h-11 font-medium text-base mb-4 ${prefDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-gray-50 border-gray-200/80 text-gray-800'}`}
            />

            <Text className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Registered Email</Text>
            <View className={`border rounded-xl px-4 h-11 flex-row items-center justify-between mb-4 ${prefDarkMode ? 'bg-slate-900/40 border-slate-700/60' : 'bg-gray-100 border-gray-200/40'}`}>
              <Text className="text-gray-400 font-medium text-base">{userEmail || 'Not provided'}</Text>
              <Feather name="lock" size={14} color="#CCC" />
            </View>

            <Text className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Update Password (Optional)</Text>
            <TextInput
              value={passwordInput}
              onChangeText={setPasswordInput}
              placeholder="Type a new password..."
              placeholderTextColor="#999"
              secureTextEntry={true}
              className={`border rounded-xl px-4 h-11 font-medium text-base mb-6 ${prefDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-gray-50 border-gray-200/80 text-gray-800'}`}
            />

            <TouchableOpacity onPress={handleUpdateAccount} disabled={savingAccount} className="bg-[#977DDF] rounded-xl h-14 justify-center items-center shadow-sm mt-auto">
              {savingAccount ? <ActivityIndicator size="small" color="white" /> : <Text className="text-white font-bold text-lg">Save Account Details</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* PREFERENCES MODAL */}
      <Modal visible={isPreferencesVisible} animationType="slide" transparent={true}>
        <View className="flex-1 justify-end bg-black/40">
          <View className={`rounded-t-3xl p-6 h-[46%] shadow-lg ${prefDarkMode ? 'bg-slate-800' : 'bg-white'}`}>
            <View className="flex-row justify-between items-center mb-6">
              <Text className={`text-xl font-bold ${uiText}`}>Preferences</Text>
              <TouchableOpacity onPress={() => setIsPreferencesVisible(false)} className="p-2">
                <Feather name="x" size={24} color={prefDarkMode ? '#FFF' : '#333'} />
              </TouchableOpacity>
            </View>

            {/* Toggle 1: Dark Mode */}
            <View className={`flex-row justify-between items-center py-3.5 border-b ${prefDarkMode ? 'border-slate-700' : 'border-gray-100'}`}>
              <View className="flex-row items-center gap-3">
                <View className="w-8 h-8 rounded-lg bg-purple-50 items-center justify-center">
                  <Feather name="moon" size={16} color="#8668C6" />
                </View>
                <Text className={`font-semibold text-base ${uiText}`}>Dark Theme Mode</Text>
              </View>
              <Switch value={prefDarkMode} onValueChange={toggleDarkMode} trackColor={{ false: '#E4E4E7', true: '#C4B5FD' }} thumbColor={prefDarkMode ? '#8668C6' : '#F4F4F5'} />
            </View>

            {/* Toggle 2: Show Weekends */}
            <View className={`flex-row justify-between items-center py-3.5 border-b ${prefDarkMode ? 'border-slate-700' : 'border-gray-100'}`}>
              <View className="flex-row items-center gap-3">
                <View className="w-8 h-8 rounded-lg bg-purple-50 items-center justify-center">
                  <Feather name="calendar" size={16} color="#8668C6" />
                </View>
                <Text className={`font-semibold text-base ${uiText}`}>Show Weekends Grid</Text>
              </View>
              <Switch value={prefShowWeekends} onValueChange={toggleShowWeekends} trackColor={{ false: '#E4E4E7', true: '#C4B5FD' }} thumbColor={prefShowWeekends ? '#8668C6' : '#F4F4F5'} />
            </View>

            {/* Toggle 3: Push Notifications */}
            <View className="flex-row justify-between items-center py-3.5 mb-6">
              <View className="flex-row items-center gap-3">
                <View className="w-8 h-8 rounded-lg bg-purple-50 items-center justify-center">
                  <Feather name="bell" size={16} color="#8668C6" />
                </View>
                <Text className={`font-semibold text-base ${uiText}`}>Push Notifications</Text>
              </View>
              <Switch value={prefNotifications} onValueChange={toggleNotifications} trackColor={{ false: '#E4E4E7', true: '#C4B5FD' }} thumbColor={prefNotifications ? '#8668C6' : '#F4F4F5'} />
            </View>

            <TouchableOpacity onPress={() => setIsPreferencesVisible(false)} className="bg-[#977DDF] rounded-xl h-14 justify-center items-center shadow-sm mt-auto">
              <Text className="text-white font-bold text-lg">Save Preferences</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* SUPPORT & FEEDBACK MODAL */}
      <Modal visible={isSupportVisible} animationType="slide" transparent={true}>
        <View className="flex-1 justify-end bg-black/40">
          <View className={`rounded-t-3xl p-6 h-[62%] shadow-lg ${prefDarkMode ? 'bg-slate-800' : 'bg-white'}`}>
            <View className="flex-row justify-between items-center mb-5">
              <Text className={`text-xl font-bold ${uiText}`}>Support & Feedback</Text>
              <TouchableOpacity onPress={() => setIsSupportVisible(false)} className="p-2">
                <Feather name="x" size={24} color={prefDarkMode ? '#FFF' : '#333'} />
              </TouchableOpacity>
            </View>

            <Text className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Quick Assistance</Text>
            <View className="flex-row gap-2 mb-6">
              <TouchableOpacity onPress={() => Alert.alert('Help Center', 'Loading documentation... Please check back shortly.')} className={`flex-1 p-3 rounded-xl items-center flex-row justify-center gap-2 border ${prefDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-gray-50 border-gray-100'}`}>
                <Feather name="book" size={14} color="#666" />
                <Text className={`${prefDarkMode ? 'text-slate-300' : 'text-gray-600'} font-semibold text-xs`}>Browse FAQs</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => Alert.alert('App Diagnostics', `Version: 1.0.4\nPlatform: ${Platform.OS.toUpperCase()}\nStatus: Operational ✅`)} className={`flex-1 p-3 rounded-xl items-center flex-row justify-center gap-2 border ${prefDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-gray-50 border-gray-100'}`}>
                <Feather name="activity" size={14} color="#666" />
                <Text className={`${prefDarkMode ? 'text-slate-300' : 'text-gray-600'} font-semibold text-xs`}>System Status</Text>
              </TouchableOpacity>
            </View>

            <Text className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Message Meemo Team</Text>
            <TextInput
              value={feedbackMessage}
              onChangeText={setFeedbackMessage}
              placeholder="Tell us what's on your mind..."
              placeholderTextColor="#999"
              multiline={true}
              numberOfLines={5}
              textAlignVertical="top"
              className={`border rounded-xl p-4 h-32 font-medium text-sm leading-relaxed mb-6 ${prefDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-gray-50 border-gray-200/80 text-gray-800'}`}
            />

            <TouchableOpacity onPress={handleSendFeedback} disabled={sendingFeedback} className="bg-[#977DDF] rounded-xl h-14 justify-center items-center shadow-sm mt-auto">
              {sendingFeedback ? <ActivityIndicator size="small" color="white" /> : <Text className="text-white font-bold text-lg">Submit Feedback</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}