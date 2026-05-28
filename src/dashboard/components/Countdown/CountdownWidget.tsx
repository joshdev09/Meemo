import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, Platform, Image } from 'react-native';
import { Feather } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';
// Import SVG elements for the crisp performance vector ring
import Svg, { Circle } from 'react-native-svg';

const logoImg = require('../../../assets/images/logo.png');

export default function CountdownWidget() {
  const [startDate, setStartDate] = useState<Date>(new Date()); 
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [daysLeft, setDaysLeft] = useState<number | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  
  const [showPicker, setShowPicker] = useState(false);
  const [pickerType, setPickerType] = useState<'start' | 'end'>('start');

  useEffect(() => {
    const loadSavedTimeline = async () => {
      try {
        const storedStart = await AsyncStorage.getItem('@countdown_start_date');
        const storedEnd = await AsyncStorage.getItem('@countdown_end_date');
        
        if (storedStart && storedEnd) {
          const parsedStart = new Date(storedStart);
          const parsedEnd = new Date(storedEnd);
          
          setStartDate(parsedStart);
          setEndDate(parsedEnd);
          
          const today = new Date();
          today.setHours(0, 0, 0, 0); 
          parsedEnd.setHours(0, 0, 0, 0);

          const diffTime = parsedEnd.getTime() - today.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          setDaysLeft(diffDays > 0 ? diffDays : 0);
        }
      } catch (error) {
        console.error('Error loading persistent countdown dates:', error);
      }
    };

    loadSavedTimeline();
  }, []);

  const calculateDays = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); 
    
    const end = new Date(endDate);
    end.setHours(0, 0, 0, 0);

    const diffTime = end.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    setDaysLeft(diffDays > 0 ? diffDays : 0);
  };

  // Computes time elapsed ratio dynamically to map into vector stroke properties
  const getProgressPercentage = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(0, 0, 0, 0);

    const totalDuration = end.getTime() - start.getTime();
    if (totalDuration <= 0) return 0;

    const timePassed = today.getTime() - start.getTime();
    // Clamp values smoothly between 0% and 100%
    const ratio = timePassed / totalDuration;
    return Math.max(0, Math.min(1, ratio));
  };

  const handleSave = async () => {
    calculateDays();
    setIsModalVisible(false);

    try {
      await AsyncStorage.setItem('@countdown_start_date', startDate.toISOString());
      await AsyncStorage.setItem('@countdown_end_date', endDate.toISOString());
    } catch (error) {
      console.error('Error saving countdown dates to storage:', error);
    }
  };

  const handleDeleteTimeline = async () => {
    try {
      await AsyncStorage.removeItem('@countdown_start_date');
      await AsyncStorage.removeItem('@countdown_end_date');
      
      setDaysLeft(null);
      setStartDate(new Date());
      setEndDate(new Date());
      setIsModalVisible(false);
    } catch (error) {
      console.error('Error clearing saved timeline dates:', error);
    }
  };

  const onDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
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

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // SVG Geometry Config variables
  const radius = 34;
  const strokeWidth = 5.5;
  const circumference = 2 * Math.PI * radius;
  const progressValue = getProgressPercentage();
  const strokeDashoffset = circumference * (1 - progressValue);

  return (
    <>
      {/* MAIN WIDGET CARD */}
      <TouchableOpacity 
        activeOpacity={0.8}
        onPress={() => setIsModalVisible(true)}
        className="flex-1 bg-[#8668C6] rounded-3xl p-5 justify-center min-h-[136px] shadow-sm"
      >
        {daysLeft !== null ? (
          // ACTIVE STATE: Progress Ring Layout
          <View className="flex-1 justify-between">
            <View className="flex-row justify-between items-center mb-1">
              <Text className="text-white/70 text-[10px] font-bold uppercase tracking-widest">
                Timeline
              </Text>
              <Feather name="edit-3" size={13} color="rgba(255,255,255,0.6)" />
            </View>
            
            <View className="flex-row items-center gap-4 flex-1">
              {/* Crisp Vector Progress Circle */}
              <View className="items-center justify-center relative w-[82px] h-[82px]">
                <Svg width="82" height="82" viewBox="0 0 82 82">
                  <Circle
                    cx="41"
                    cy="41"
                    r={radius}
                    stroke="rgba(255, 255, 255, 0.18)"
                    strokeWidth={strokeWidth}
                    fill="transparent"
                  />
                  <Circle
                    cx="41"
                    cy="41"
                    r={radius}
                    stroke="white"
                    strokeWidth={strokeWidth}
                    fill="transparent"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    transform="rotate(-90, 41, 41)"
                  />
                </Svg>
                
                <View className="absolute inset-0 items-center justify-center">
                  <Text 
                    className="text-white text-2xl font-black tracking-tight"
                    style={{ includeFontPadding: false }}
                    numberOfLines={1}
                  >
                    {daysLeft}
                  </Text>
                </View>
              </View>

              <View className="flex-1 justify-center">
                <Text className="text-white text-base font-black leading-tight tracking-tight">
                  Days Left
                </Text>
                <Text className="text-white/75 text-[11px] font-medium leading-normal mt-0.5">
                  Remaining out of your custom schedule tracking frame.
                </Text>
              </View>
            </View>
          </View>
        ) : (
          // ✅ FIXED EMPTY STATE: Completely centered stacked grid layout
          <View className="items-center justify-center gap-2.5 w-full py-1">
            <Image 
              source={logoImg} 
              className="w-14 h-14 rounded-full border-2 border-white/20"
              resizeMode="cover"
            />
            <View className="items-center gap-0.5">
              <Text className="text-white font-bold text-base leading-tight text-center">
                Set Your Timeline
              </Text>
              <Text className="text-white/80 text-xs leading-normal text-center">
                Tap to add your start & end dates.
              </Text>
            </View>
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
          <View className="bg-white rounded-t-3xl p-6 h-[72%] shadow-lg">
            
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
              className="bg-gray-100 rounded-xl px-4 h-12 justify-center border border-gray-200/60"
            >
              <Text className="text-gray-800 font-medium">{formatDate(startDate)}</Text>
            </TouchableOpacity>

            {/* End Date Button */}
            <Text className="text-sm font-semibold text-gray-600 mb-2 mt-6">End Date</Text>
            <TouchableOpacity 
              onPress={() => openPicker('end')}
              className="bg-gray-100 rounded-xl px-4 h-12 justify-center border border-gray-200/60"
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

            {/* ACTION BUTTON CONSOLE GRIDS */}
            <View className="mt-auto mb-6 gap-3">
              {/* Save Button */}
              <TouchableOpacity 
                onPress={handleSave}
                className="bg-[#8668C6] rounded-xl h-14 justify-center items-center shadow-sm"
              >
                <Text className="text-white font-bold text-lg">Save Dates</Text>
              </TouchableOpacity>

              {/* Contextual Delete Button */}
              {daysLeft !== null && (
                <TouchableOpacity 
                  onPress={handleDeleteTimeline}
                  activeOpacity={0.7}
                  className="bg-[#EF4444] rounded-xl h-14 justify-center items-center shadow-sm"
                >
                  <View className="flex-row items-center gap-2">
                    <Feather name="trash-2" size={16} color="white" />
                    <Text className="text-white font-bold text-lg">Delete Timeline</Text>
                  </View>
                </TouchableOpacity>
              )}
            </View>

          </View>
        </View>
      </Modal>
    </>
  );
}