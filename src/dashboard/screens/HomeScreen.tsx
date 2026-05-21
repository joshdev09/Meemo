import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';

// Import your components
import CountdownWidget from '../components/Countdown/CountdownWidget';
import InteractiveCalendar from '../components/Calendar/InteractiveCalendar';
import EventModal from '../components/Events/EventModal';

export default function HomeScreen() {
  const [isEventModalVisible, setIsEventModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const handleSaveEvent = (eventData: any) => {
    console.log("Saved Event: ", eventData);
  };

  const getEventsForDate = (dateKey: string) => {
    return []; 
  };

  // Format date to match "21 May" style
  const formattedDateString = `${selectedDate.getDate()} ${selectedDate.toLocaleDateString('en-US', { month: 'short' })}`;

  return (
    <View className="flex-1 bg-white">
      {/* Background Gradient */}
      <LinearGradient
        colors={['#FFFFFF', '#F2E6EE', '#977DDF']}
        locations={[0, 0.7, 1.0]}
        className="absolute inset-0"
      />

      <SafeAreaView className="flex-1">
        {/* ADDED paddingBottom: 100 so the content doesn't hide behind the new floating bar */}
        <ScrollView 
          className="flex-1 px-5 pt-4" 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 120 }} 
        >
          
          {/* HEADER */}
          <View className="flex-row justify-between items-center mb-6">
            <View className="flex-row items-center gap-3">
              <Image 
                source={{ uri: 'https://i.pravatar.cc/150?img=11' }} 
                className="w-12 h-12 rounded-full border border-gray-200"
              />
              <View>
                <Text className="text-gray-500 text-xs font-medium">Good morning! 👋</Text>
                <Text className="text-xl font-semibold text-gray-800">Shua</Text>
              </View>
            </View>
            <TouchableOpacity>
              <Feather name="menu" size={28} color="#333" />
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

          {/* CALENDAR SECTION */}
          <View className="bg-white/40 rounded-3xl pt-6 pb-4 mb-6 border border-white/50 shadow-sm">
            <InteractiveCalendar 
              selectedDate={selectedDate} 
              onSelectDate={setSelectedDate} 
              getForDate={getEventsForDate} 
            />
          </View>

          {/* EVENTS LIST HEADER (Removed the boring + Add text) */}
          <View className="flex-row justify-between items-center mb-4 px-2">
            <Text className="text-lg font-bold text-gray-800">
              No events · {formattedDateString}
            </Text>
          </View>

          {/* EMPTY STATE */}
          <View className="items-center justify-center mt-4">
            <View className="w-12 h-12 bg-white/50 rounded-xl items-center justify-center mb-3">
              <Text className="text-2xl">📅</Text>
            </View>
            <Text className="text-gray-800 font-bold mb-1">Nothing scheduled</Text>
            <Text className="text-gray-500 text-sm">Tap the button below to create an event</Text>
          </View>

        </ScrollView>

        {/* --- THE NEW FLOATING BOTTOM ACTION BAR --- */}
        <View className="absolute bottom-6 w-full px-5 flex-row items-center gap-3">
          {/* Pill Input */}
          <TouchableOpacity 
            activeOpacity={0.8}
            onPress={() => setIsEventModalVisible(true)}
            className="flex-1 bg-white/70 border border-white rounded-full h-14 justify-center px-6 shadow-sm"
          >
            <Text className="text-gray-600 font-medium text-base">
              Add event on {formattedDateString}
            </Text>
          </TouchableOpacity>
          
          {/* Circular Plus Button */}
          <TouchableOpacity 
            activeOpacity={0.8}
            onPress={() => setIsEventModalVisible(true)}
            className="w-14 h-14 bg-[#977DDF] rounded-full justify-center items-center shadow-md border border-white/20"
          >
            <Feather name="plus" size={26} color="#FFF" />
          </TouchableOpacity>
        </View>

        {/* THE MODAL */}
        <EventModal 
          isVisible={isEventModalVisible} 
          onClose={() => setIsEventModalVisible(false)} 
          selectedDate={selectedDate} 
          onSave={handleSaveEvent} 
        />

      </SafeAreaView>
    </View>
  );
}