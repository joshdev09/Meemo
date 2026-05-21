import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';

export default function CountdownWidget() {
  // Use actual Date objects now instead of strings
  const [startDate, setStartDate] = useState<Date>(new Date()); 
  const [endDate, setEndDate] = useState<Date>(new Date());
  
  // State for UI and Picker logic
  const [daysLeft, setDaysLeft] = useState<number | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  
  // Picker visibility and mode state
  const [showPicker, setShowPicker] = useState(false);
  const [pickerType, setPickerType] = useState<'start' | 'end'>('start');

  // Calculate days left whenever the endDate changes
  useEffect(() => {
    // We only calculate if the user has actively saved the dates (represented by daysLeft being set)
    // Or if you want it to calculate immediately, you can adjust this logic.
    if (daysLeft !== null) {
      calculateDays();
    }
  }, [endDate]);

  const calculateDays = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); 
    
    const end = new Date(endDate);
    end.setHours(0, 0, 0, 0);

    const diffTime = end.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    setDaysLeft(diffDays > 0 ? diffDays : 0);
  };

  const handleSave = () => {
    calculateDays();
    setIsModalVisible(false);
  };

  const onDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    // Handle Android cancel button
    if (Platform.OS === 'android') {
      setShowPicker(false);
    }

    if (selectedDate) {
      if (pickerType === 'start') {
        setStartDate(selectedDate);
      } else {
        setEndDate(selectedDate);
      }
    }
  };

  const openPicker = (type: 'start' | 'end') => {
    setPickerType(type);
    setShowPicker(true);
  };

  // Helper to format dates nicely for the UI (e.g., "Aug 15, 2026")
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <>
      {/* MAIN WIDGET CARD */}
      <TouchableOpacity 
        activeOpacity={0.8}
        onPress={() => setIsModalVisible(true)}
        className="flex-1 bg-[#8668C6] rounded-2xl p-4 shadow-sm justify-center min-h-[140px]"
      >
        {daysLeft !== null ? (
          // ACTIVE STATE: Countdown
          <View className="flex-1 justify-between">
            <View className="flex-row justify-between items-start">
              <Text className="text-white/80 text-sm font-medium">Days left</Text>
              <Feather name="edit-2" size={14} color="rgba(255,255,255,0.6)" />
            </View>
            <View className="flex-row items-baseline gap-1 mt-2">
              <Text className="text-5xl font-bold text-white">{daysLeft}</Text>
              <Text className="text-lg font-medium text-white/90">Days</Text>
            </View>
          </View>
        ) : (
          // EMPTY STATE
          <View className="items-center justify-center pt-2">
            <Text className="text-3xl mb-2">🎯</Text>
            <Text className="text-gray-900 font-semibold text-sm mb-1">
              No upcoming events
            </Text>
            <Text className="text-gray-900/40 text-xs text-center">
              Tap to set your start{'\n'}and end dates
            </Text>
          </View>
        )}
      </TouchableOpacity>

      {/* EDIT MODAL */}
      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
      >
        <View className="flex-1 justify-end bg-black/40">
          <View className="bg-white rounded-t-3xl p-6 h-2/3 shadow-lg">
            
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-xl font-bold text-gray-800">Set Timeline</Text>
              <TouchableOpacity onPress={() => setIsModalVisible(false)} className="p-2">
                <Feather name="x" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            {/* Start Date Button */}
            <Text className="text-sm font-semibold text-gray-600 mb-2 mt-4">Start Date</Text>
            <TouchableOpacity 
              onPress={() => openPicker('start')}
              className="bg-gray-100 rounded-xl px-4 h-12 justify-center border border-gray-200"
            >
              <Text className="text-gray-800 font-medium">{formatDate(startDate)}</Text>
            </TouchableOpacity>

            {/* End Date Button */}
            <Text className="text-sm font-semibold text-gray-600 mb-2 mt-6">End Date</Text>
            <TouchableOpacity 
              onPress={() => openPicker('end')}
              className="bg-gray-100 rounded-xl px-4 h-12 justify-center border border-gray-200"
            >
              <Text className="text-gray-800 font-medium">{formatDate(endDate)}</Text>
            </TouchableOpacity>

            {/* Native Date Picker */}
            {showPicker && (
              <DateTimePicker
                value={pickerType === 'start' ? startDate : endDate}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={onDateChange}
              />
            )}

            {/* Save Button */}
            <TouchableOpacity 
              onPress={handleSave}
              className="bg-[#8668C6] rounded-xl h-14 justify-center items-center mt-auto mb-8 shadow-sm"
            >
              <Text className="text-white font-bold text-lg">Save Dates</Text>
            </TouchableOpacity>

          </View>
        </View>
      </Modal>
    </>
  );
}