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
  Switch
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';

interface EventModalProps {
  isVisible: boolean;
  onClose: () => void;
  selectedDate: Date;
  onSave: (eventData: any) => void;
}

export default function EventModal({ isVisible, onClose, selectedDate, onSave }: EventModalProps) {
  // Top level tabs
  const [activeTab, setActiveTab] = useState<'Event' | 'Reminder'>('Event');

  // Form State
  const [title, setTitle] = useState('');
  const [isAllDay, setIsAllDay] = useState(false);
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  
  // Date/Time State
  const [startDate, setStartDate] = useState<Date>(selectedDate || new Date());
  const [endDate, setEndDate] = useState<Date>(
    new Date((selectedDate || new Date()).getTime() + 60 * 60 * 1000)
  );

  // Sync state when modal opens
  useEffect(() => {
    if (isVisible && selectedDate) {
      setStartDate(selectedDate);
      setEndDate(new Date(selectedDate.getTime() + 60 * 60 * 1000));
    }
  }, [isVisible, selectedDate]);

  // Picker State
  const [showPicker, setShowPicker] = useState(false);
  const [pickerMode, setPickerMode] = useState<'date' | 'time'>('date');
  const [pickerTarget, setPickerTarget] = useState<'start' | 'end'>('start');

  const handleClose = () => {
    setTitle('');
    setLocation('');
    setNotes('');
    setIsAllDay(false);
    setActiveTab('Event'); // Reset to default
    onClose();
  };

  const handleSave = () => {
    if (!title.trim()) return;
    
    // Pass the activeTab as the "type" so the parent knows what to save
    onSave({ 
      type: activeTab, 
      title, 
      isAllDay, 
      startDate, 
      // If it's a reminder, we don't need these extra fields
      endDate: activeTab === 'Event' ? endDate : null, 
      location: activeTab === 'Event' ? location : '', 
      notes: activeTab === 'Event' ? notes : '' 
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

  const isSaveDisabled = title.trim().length === 0;
  const themeColor = '#977DDF';

  return (
    <Modal visible={isVisible} animationType="slide" transparent={true}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <View className="flex-1 justify-end bg-black/40">
          <View className="bg-white rounded-t-3xl h-[85%] shadow-lg">
            
            {/* Header Tabs (Event / Reminder) */}
            <View className="items-center pt-4 pb-2 border-b border-gray-100">
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
            </View>

            <ScrollView className="flex-1 px-6 pt-4" showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              
              {/* SHARED: Title Section */}
              <View className="flex-row items-center border-b border-gray-100 pb-4 mb-2">
                <TextInput
                  placeholder={activeTab === 'Event' ? "Event Title" : "Remind me to..."}
                  placeholderTextColor="#999"
                  value={title}
                  onChangeText={setTitle}
                  className="flex-1 text-2xl font-medium text-gray-800"
                  autoFocus
                />
                <View className={`w-4 h-4 rounded-full ml-3 ${activeTab === 'Event' ? 'bg-[#977DDF]' : 'bg-[#D4C4F4]'}`} />
              </View>

              {/* SHARED: All Day Toggle */}
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

              {/* CONDITIONAL: Date / Time Selector Row */}
              {activeTab === 'Event' ? (
                // EVENT LAYOUT: Start Date -> End Date
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
                // REMINDER LAYOUT: Single Date/Time selection
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

              {/* CONDITIONAL: Event Only Fields */}
              {activeTab === 'Event' && (
                <>
                  <View className="flex-row items-center py-4 border-b border-gray-100">
                    <Feather name="map-pin" size={20} color="#666" />
                    <TextInput
                      placeholder="Location"
                      placeholderTextColor="#999"
                      value={location}
                      onChangeText={setLocation}
                      className="flex-1 text-gray-800 text-base ml-4"
                    />
                  </View>

                  <TouchableOpacity className="flex-row items-center py-4 border-b border-gray-100">
                    <Feather name="bell" size={20} color="#666" />
                    <Text className="text-gray-800 text-base ml-4">10 mins before</Text>
                  </TouchableOpacity>
                </>
              )}

              {/* SHARED: Repeat Field */}
              <TouchableOpacity className={`flex-row items-center py-4 border-b border-gray-100 ${activeTab === 'Reminder' ? 'mb-8' : ''}`}>
                <Feather name="repeat" size={20} color="#666" />
                <Text className="text-gray-800 text-base ml-4">Don't repeat</Text>
              </TouchableOpacity>

              {/* CONDITIONAL: Notes Field (Event Only) */}
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

            {/* Bottom Action Bar */}
            <View className="flex-row justify-between items-center px-6 py-4 border-t border-gray-100 pb-8">
              <TouchableOpacity onPress={handleClose} className="px-4 py-2">
                <Text className="text-gray-600 font-medium text-base">Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                onPress={handleSave} 
                disabled={isSaveDisabled}
                className="px-4 py-2"
              >
                <Text className={`font-bold text-base ${isSaveDisabled ? 'text-[#977DDF]/50' : 'text-[#977DDF]'}`}>
                  Save
                </Text>
              </TouchableOpacity>
            </View>

            {/* Native Date/Time Picker */}
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
    </Modal>
  );
}