import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  TextInput,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  Switch,
  ActivityIndicator,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { AppEvent } from '../../types';

interface EventModalProps {
  isVisible: boolean;
  onClose: () => void;
  selectedDate: Date;
  onSave: (eventData: any) => void;
  editingEvent?: AppEvent | null;
}

const REMINDER_OPTIONS = [
  { label: 'None', value: 'none' },
  { label: 'At time of event', value: '0m' },
  { label: '10 mins before', value: '10m' },
  { label: '1 hour before', value: '1h' },
  { label: '1 day before', value: '1d' },
];

const REPEAT_OPTIONS = [
  { label: "Don't repeat", value: 'none' },
  { label: 'Daily', value: 'daily' },
  { label: 'Weekly', value: 'weekly' },
  { label: 'Monthly', value: 'monthly' },
];

export default function EventModal({ isVisible, onClose, selectedDate, onSave, editingEvent }: EventModalProps) {
  const [activeTab, setActiveTab] = useState<'Event' | 'Reminder'>('Event');
  const [title, setTitle] = useState('');
  const [isAllDay, setIsAllDay] = useState(false);
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [startDate, setStartDate] = useState<Date>(selectedDate || new Date());
  const [endDate, setEndDate] = useState<Date>(
    new Date((selectedDate || new Date()).getTime() + 60 * 60 * 1000)
  );

  const [reminder, setReminder] = useState('10m');
  const [repeat, setRepeat] = useState('none');
  const [activePickerModal, setActivePickerModal] = useState<'none' | 'reminder' | 'repeat'>('none');

  const [showPicker, setShowPicker] = useState(false);
  const [pickerMode, setPickerMode] = useState<'date' | 'time'>('date');
  const [pickerTarget, setPickerTarget] = useState<'start' | 'end'>('start');

  // Location & Autocomplete States
  const [mapCoords, setMapCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [geocoding, setGeocoding] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [deviceCoords, setDeviceCoords] = useState<{ lat: number; lon: number } | null>(null);

  // Pre-fill form when editing an existing event
  useEffect(() => {
    if (isVisible) {
      if (editingEvent) {
        setTitle(editingEvent.title || '');
        setIsAllDay(editingEvent.allDay || false);
        setLocation(editingEvent.location || '');
        setNotes(editingEvent.description || '');
        setStartDate(new Date(editingEvent.startDate));
        setEndDate(editingEvent.endDate ? new Date(editingEvent.endDate) : new Date(new Date(editingEvent.startDate).getTime() + 60 * 60 * 1000));
        setReminder((editingEvent as any).reminder || '10m');
        setRepeat((editingEvent as any).repeat || 'none');
        setActiveTab(editingEvent.endDate ? 'Event' : 'Reminder');
      } else {
        setTitle('');
        setIsAllDay(false);
        setLocation('');
        setNotes('');
        setStartDate(selectedDate);
        setEndDate(new Date(selectedDate.getTime() + 60 * 60 * 1000));
        setReminder('10m');
        setRepeat('none');
        setActiveTab('Event');
      }
      setMapCoords(null);
      setSuggestions([]);
      setShowDropdown(false);
    }
  }, [isVisible, editingEvent, selectedDate]);

  // Request location permissions on mount to anchor searches locally (Proximity Bias)
  useEffect(() => {
    async function getPermission() {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const currentLoc = await Location.getCurrentPositionAsync({});
          setDeviceCoords({
            lat: currentLoc.coords.latitude,
            lon: currentLoc.coords.longitude,
          });
        }
      } catch (error) {
        console.log("Error getting location permission:", error);
      }
    }
    if (isVisible) {
      getPermission();
    }
  }, [isVisible]);

  // Fetch address recommendations via Autocomplete API with local proximity bias
  useEffect(() => {
    if (!location.trim() || location.trim().length < 2 || !showDropdown) {
      if (!location.trim()) setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setGeocoding(true);
        const LOCATION_IQ_KEY = process.env.EXPO_PUBLIC_LOCATION_IQ_KEY;

        if (!LOCATION_IQ_KEY) {
          console.warn("LocationIQ API Key is missing!");
          return;
        }

        // Base URL filtered to the Philippines
        let url = `https://us1.locationiq.com/v1/autocomplete?key=${LOCATION_IQ_KEY}&q=${encodeURIComponent(location)}&limit=5&countrycodes=ph`;

        // If user coordinates exist, append them to weight local results first
        if (deviceCoords) {
          url += `&lat=${deviceCoords.lat}&lon=${deviceCoords.lon}`;
        }

        const res = await fetch(url, { headers: { 'User-Agent': 'MeemoApp/1.0' } });
        const data = await res.json();
        
        if (Array.isArray(data)) {
          setSuggestions(data);
        } else {
          setSuggestions([]);
        }
      } catch (error) {
        console.error("Autocomplete fetch failed:", error);
        setSuggestions([]);
      } finally {
        setGeocoding(false);
      }
    }, 400); // Shorter user typing response gap

    return () => clearTimeout(timer);
  }, [location, showDropdown, deviceCoords]);

  const handleSelectLocation = (item: any) => {
    setLocation(item.display_name);
    setMapCoords({ lat: parseFloat(item.lat), lon: parseFloat(item.lon) });
    setSuggestions([]);
    setShowDropdown(false);
  };

  const handleClose = () => {
    onClose();
  };

  const handleSave = () => {
    if (!title.trim()) return;
    onSave({
      type: activeTab,
      title,
      isAllDay,
      startDate,
      endDate: activeTab === 'Event' ? endDate : null,
      location: activeTab === 'Event' ? location : '',
      notes: activeTab === 'Event' ? notes : '',
      reminder: reminder,
      repeat: repeat,
    });
    handleClose();
  };

  const openPicker = (target: 'start' | 'end', mode: 'date' | 'time') => {
    setPickerTarget(target);
    setPickerMode(mode);
    setShowPicker(true);
  };

  const onDateTimeChange = (event: DateTimePickerEvent, selected?: Date) => {
    if (Platform.OS === 'android') setShowPicker(false);
    if (selected) {
      if (pickerTarget === 'start') {
        setStartDate(selected);
        if (selected >= endDate) {
          setEndDate(new Date(selected.getTime() + 60 * 60 * 1000));
        }
      } else {
        setEndDate(selected);
      }
    }
  };

  const formatDate = (date: Date) => date.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' });
  const formatTime = (date: Date) => date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }).toLowerCase();

  const getReminderLabel = () => REMINDER_OPTIONS.find(o => o.value === reminder)?.label || '10 mins before';
  const getRepeatLabel = () => REPEAT_OPTIONS.find(o => o.value === repeat)?.label || "Don't repeat";

  const isSaveDisabled = title.trim().length === 0;
  const themeColor = '#977DDF';
  const isEditing = !!editingEvent;

  return (
    <Modal visible={isVisible} animationType="slide" transparent={true}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <View className="flex-1 justify-end bg-black/40">
          <View className="bg-white rounded-t-3xl h-[85%] shadow-lg">

            {/* Header */}
            <View className="items-center pt-4 pb-2 border-b border-gray-100">
              {isEditing ? (
                <Text className="text-lg font-bold text-gray-800 mb-2">Edit Event</Text>
              ) : (
                <View className="flex-row bg-gray-100 rounded-full p-1 w-3/4 max-w-[250px] mb-2">
                  <TouchableOpacity
                    onPress={() => setActiveTab('Event')}
                    className={`flex-1 py-2 rounded-full items-center ${activeTab === 'Event' ? 'bg-white shadow-sm' : ''}`}
                  >
                    <Text className={`font-semibold ${activeTab === 'Event' ? 'text-gray-800' : 'text-gray-500'}`}>Event</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setActiveTab('Reminder')}
                    className={`flex-1 py-2 rounded-full items-center ${activeTab === 'Reminder' ? 'bg-white shadow-sm' : ''}`}
                  >
                    <Text className={`font-semibold ${activeTab === 'Reminder' ? 'text-gray-800' : 'text-gray-500'}`}>Reminder</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            <ScrollView className="flex-1 px-6 pt-4" showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

              {/* Title */}
              <View className="flex-row items-center border-b border-gray-100 pb-4 mb-2">
                <TextInput
                  placeholder={activeTab === 'Event' ? 'Event Title' : 'Remind me to...'}
                  placeholderTextColor="#999"
                  value={title}
                  onChangeText={setTitle}
                  className="flex-1 text-2xl font-medium text-gray-800"
                  autoFocus
                />
                <View className={`w-4 h-4 rounded-full ml-3 ${activeTab === 'Event' ? 'bg-[#977DDF]' : 'bg-[#D4C4F4]'}`} />
              </View>

              {/* All Day */}
              <View className="flex-row justify-between items-center py-4">
                <View className="flex-row items-center">
                  <Feather name="clock" size={20} color="#666" />
                  <Text className="text-gray-800 text-base ml-4">All day</Text>
                </View>
                <Switch
                  value={isAllDay}
                  onValueChange={setIsAllDay}
                  trackColor={{ false: '#E5E7EB', true: `${themeColor}80` }}
                  thumbColor={isAllDay ? themeColor : '#f4f3f4'}
                />
              </View>

              {/* Date/Time Row */}
              {activeTab === 'Event' ? (
                <View className="flex-row justify-between items-center py-2 pb-6 border-b border-gray-100 pl-9">
                  <View className="items-start">
                    <TouchableOpacity onPress={() => openPicker('start', 'date')} className="mb-2">
                      <Text className="text-gray-800 text-base font-medium">{formatDate(startDate)}</Text>
                    </TouchableOpacity>
                    {!isAllDay && (
                      <TouchableOpacity onPress={() => openPicker('start', 'time')}>
                        <Text className="text-gray-500 text-sm">{formatTime(startDate)}</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                  <Feather name="arrow-right" size={16} color="#999" />
                  <View className="items-end">
                    <TouchableOpacity onPress={() => openPicker('end', 'date')} className="mb-2">
                      <Text className="text-gray-800 text-base font-medium">{formatDate(endDate)}</Text>
                    </TouchableOpacity>
                    {!isAllDay && (
                      <TouchableOpacity onPress={() => openPicker('end', 'time')}>
                        <Text className="text-gray-500 text-sm">{formatTime(endDate)}</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              ) : (
                <View className="flex-row items-center py-2 pb-6 border-b border-gray-100 pl-9 gap-6">
                  <TouchableOpacity onPress={() => openPicker('start', 'date')}>
                    <Text className="text-gray-800 text-base font-medium">{formatDate(startDate)}</Text>
                  </TouchableOpacity>
                  {!isAllDay && (
                    <TouchableOpacity onPress={() => openPicker('start', 'time')}>
                      <Text className="text-gray-800 text-base font-medium">{formatTime(startDate)}</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}

              {/* Event-only fields */}
              {activeTab === 'Event' && (
                <View className="border-b border-gray-100 pb-3 z-50">
                  <View className="flex-row items-center py-4">
                    <Feather name="map-pin" size={20} color="#666" />
                    <TextInput
                      placeholder="Location"
                      placeholderTextColor="#999"
                      value={location}
                      onChangeText={(text) => {
                        setLocation(text);
                        setShowDropdown(true);
                      }}
                      onFocus={() => setShowDropdown(true)}
                      className="flex-1 text-gray-800 text-base ml-4 pr-4"
                    />
                    {location.length > 0 && (
                      <TouchableOpacity onPress={() => { setLocation(''); setMapCoords(null); setSuggestions([]); setShowDropdown(false); }}>
                        <Feather name="x-circle" size={16} color="#BBB" />
                      </TouchableOpacity>
                    )}
                    {geocoding && <ActivityIndicator size="small" color="#977DDF" className="ml-2" />}
                  </View>

                  {/* Dynamic Suggestion Dropdown Overlay */}
                  {showDropdown && suggestions.length > 0 && (
                    <View className="ml-9 bg-white border border-gray-200 rounded-xl shadow-lg mb-3 overflow-hidden">
                      {suggestions.map((item, index) => (
                        <TouchableOpacity
                          key={index}
                          onPress={() => handleSelectLocation(item)}
                          className="p-3 border-b border-gray-100 active:bg-gray-50"
                        >
                          <Text className="text-sm text-gray-700 font-medium" numberOfLines={2}>
                            {item.display_name}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}

                  {/* Mini Map Box */}
                  {mapCoords && !showDropdown && (
                    <View className="ml-9 h-36 rounded-2xl border border-gray-200 overflow-hidden mt-1 mb-1 bg-gray-100">
                      <MapView
                        style={{ width: '100%', height: '100%' }}
                        region={{
                          latitude: mapCoords.lat,
                          longitude: mapCoords.lon,
                          latitudeDelta: 0.006,
                          longitudeDelta: 0.006,
                        }}
                        zoomEnabled={true}
                        scrollEnabled={true}
                      >
                        <Marker
                          coordinate={{
                            latitude: mapCoords.lat,
                            longitude: mapCoords.lon,
                          }}
                          title="Selected Location"
                          pinColor="#977DDF"
                        />
                      </MapView>
                    </View>
                  )}
                </View>
              )}

              {/* Notification Dropdown Row */}
              <TouchableOpacity
                onPress={() => setActivePickerModal('reminder')}
                className="flex-row items-center justify-between py-4 border-b border-gray-100"
              >
                <View className="flex-row items-center">
                  <Feather name="bell" size={20} color="#666" />
                  <Text className="text-gray-800 text-base ml-4">{getReminderLabel()}</Text>
                </View>
                <Feather name="chevron-right" size={16} color="#CCC" />
              </TouchableOpacity>

              {/* Repeat Dropdown Row */}
              <TouchableOpacity
                onPress={() => setActivePickerModal('repeat')}
                className={`flex-row items-center justify-between py-4 border-b border-gray-100 ${activeTab === 'Reminder' ? 'mb-8' : ''}`}
              >
                <View className="flex-row items-center">
                  <Feather name="repeat" size={20} color="#666" />
                  <Text className="text-gray-800 text-base ml-4">{getRepeatLabel()}</Text>
                </View>
                <Feather name="chevron-right" size={16} color="#CCC" />
              </TouchableOpacity>

              {activeTab === 'Event' && (
                <View className="flex-row items-start py-4 mb-8">
                  <Feather name="align-left" size={20} color="#666" style={{ marginTop: 2 }} />
                  <TextInput
                    placeholder="Notes"
                    placeholderTextColor="#999"
                    value={notes}
                    onChangeText={setNotes}
                    multiline
                    textAlignVertical="top"
                    className="flex-1 text-gray-800 text-base ml-4 min-h-[80px]"
                  />
                </View>
              )}
            </ScrollView>

            {/* Bottom Actions */}
            <View className="flex-row justify-between items-center px-6 py-4 border-t border-gray-100 pb-8">
              <TouchableOpacity onPress={handleClose} className="px-4 py-2">
                <Text className="text-gray-600 font-medium text-base">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleSave} disabled={isSaveDisabled} className="px-4 py-2">
                <Text className={`font-bold text-base ${isSaveDisabled ? 'text-[#977DDF]/50' : 'text-[#977DDF]'}`}>
                  {isEditing ? 'Update' : 'Save'}
                </Text>
              </TouchableOpacity>
            </View>

            {showPicker && (
              <DateTimePicker
                value={pickerTarget === 'start' ? startDate : endDate}
                mode={pickerMode}
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={onDateTimeChange}
              />
            )}
          </View>
        </View>
      </KeyboardAvoidingView>

      {/* DYNAMIC ACTION SELECTION SHEET MODAL */}
      <Modal
        visible={activePickerModal !== 'none'}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setActivePickerModal('none')}
      >
        <View className="flex-1 justify-end bg-black/30">
          <TouchableOpacity
            className="flex-1"
            activeOpacity={1}
            onPress={() => setActivePickerModal('none')}
          />
          <View className="bg-white rounded-t-3xl p-6 pb-10 max-h-[50%] shadow-2xl">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-lg font-bold text-gray-800">
                {activePickerModal === 'reminder' ? 'Select Alert Time' : 'Select Repeat Interval'}
              </Text>
              <TouchableOpacity onPress={() => setActivePickerModal('none')}>
                <Feather name="x" size={20} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {(activePickerModal === 'reminder' ? REMINDER_OPTIONS : REPEAT_OPTIONS).map((option) => {
                const isSelected = activePickerModal === 'reminder' ? reminder === option.value : repeat === option.value;
                return (
                  <TouchableOpacity
                    key={option.value}
                    onPress={() => {
                      if (activePickerModal === 'reminder') {
                        setReminder(option.value);
                      } else {
                        setRepeat(option.value);
                      }
                      setActivePickerModal('none');
                    }}
                    className={`flex-row items-center justify-between p-4 rounded-xl mb-1.5 ${isSelected ? 'bg-purple-50' : 'bg-transparent'}`}
                  >
                    <Text className={`text-base ${isSelected ? 'text-[#977DDF] font-bold' : 'text-gray-700 font-medium'}`}>
                      {option.label}
                    </Text>
                    {isSelected && <Feather name="check" size={18} color={themeColor} />}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </Modal>
  );
}