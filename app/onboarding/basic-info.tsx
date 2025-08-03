import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Alert,
} from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
import { router } from 'expo-router';
import { useUser } from '@/contexts/UserContext';

const heightOptions = [
  "5'0\"", "5'1\"", "5'2\"", "5'3\"", "5'4\"", "5'5\"", "5'6\"", 
  "5'7\"", "5'8\"", "5'9\"", "5'10\"", "5'11\"", "6'0\"", "6'1\"", 
  "6'2\"", "6'3\"", "6'4\"", "6'5\"", "6'6\""
];

const religionOptions = [
  'Christian', 'Catholic', 'Jewish', 'Muslim', 'Hindu', 'Buddhist', 
  'Spiritual', 'Agnostic', 'Atheist', 'Other', 'Prefer not to say'
];

const lookingForOptions = [
  'Technical Co-founder', 'Business Co-founder', 'Marketing Co-founder',
  'Product Co-founder', 'Any co-founder', 'Not sure yet'
];

export default function BasicInfo() {
  const { updateUser } = useUser();
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    location: '',
    height: '',
    education: '',
    jobTitle: '',
    religion: '',
    lookingFor: '',
  });

  const [showHeightPicker, setShowHeightPicker] = useState(false);
  const [showReligionPicker, setShowReligionPicker] = useState(false);
  const [showLookingForPicker, setShowLookingForPicker] = useState(false);

  const handleNext = () => {
    if (!formData.name || !formData.age || !formData.location) {
      Alert.alert('Missing Information', 'Please fill in your name, age, and location to continue.');
      return;
    }

    const age = parseInt(formData.age);
    if (isNaN(age) || age < 18 || age > 100) {
      Alert.alert('Invalid Age', 'Please enter a valid age between 18 and 100.');
      return;
    }

    console.log('Updating user with basic info:', {
      name: formData.name,
      age: age,
      location: formData.location,
      basics: {
        height: formData.height,
        education: formData.education,
        jobTitle: formData.jobTitle,
        religion: formData.religion,
        lookingFor: formData.lookingFor,
      }
    });

    updateUser({
      name: formData.name,
      age: age,
      location: formData.location,
      basics: {
        height: formData.height,
        education: formData.education,
        jobTitle: formData.jobTitle,
        religion: formData.religion,
        lookingFor: formData.lookingFor,
      }
    });

    router.push('/onboarding/photos');
  };

  const renderPicker = (
    options: string[], 
    selectedValue: string, 
    onSelect: (value: string) => void,
    onClose: () => void
  ) => (
    <View style={styles.pickerOverlay}>
      <View style={styles.pickerContainer}>
        <ScrollView style={styles.pickerScroll}>
          {options.map((option) => (
            <TouchableOpacity
              key={option}
              style={[
                styles.pickerOption,
                selectedValue === option && styles.selectedOption
              ]}
              onPress={() => {
                onSelect(option);
                onClose();
              }}
            >
              <Text style={[
                styles.pickerOptionText,
                selectedValue === option && styles.selectedOptionText
              ]}>
                {option}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <TouchableOpacity style={styles.pickerCloseButton} onPress={onClose}>
          <Text style={styles.pickerCloseText}>Close</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a1a" />
      
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ChevronLeft size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Basic Info</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Name *</Text>
            <TextInput
              style={styles.input}
              value={formData.name}
              onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
              placeholder="Enter your first name"
              placeholderTextColor="#666"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Age *</Text>
            <TextInput
              style={styles.input}
              value={formData.age}
              onChangeText={(text) => setFormData(prev => ({ ...prev, age: text }))}
              placeholder="Enter your age"
              placeholderTextColor="#666"
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Location *</Text>
            <TextInput
              style={styles.input}
              value={formData.location}
              onChangeText={(text) => setFormData(prev => ({ ...prev, location: text }))}
              placeholder="City, State"
              placeholderTextColor="#666"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Height</Text>
            <TouchableOpacity
              style={styles.input}
              onPress={() => setShowHeightPicker(true)}
            >
              <Text style={[styles.inputText, !formData.height && styles.placeholder]}>
                {formData.height || 'Select your height'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Education</Text>
            <TextInput
              style={styles.input}
              value={formData.education}
              onChangeText={(text) => setFormData(prev => ({ ...prev, education: text }))}
              placeholder="School or degree"
              placeholderTextColor="#666"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Job Title</Text>
            <TextInput
              style={styles.input}
              value={formData.jobTitle}
              onChangeText={(text) => setFormData(prev => ({ ...prev, jobTitle: text }))}
              placeholder="What do you do?"
              placeholderTextColor="#666"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Religion</Text>
            <TouchableOpacity
              style={styles.input}
              onPress={() => setShowReligionPicker(true)}
            >
              <Text style={[styles.inputText, !formData.religion && styles.placeholder]}>
                {formData.religion || 'Select your religion'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Looking For</Text>
            <TouchableOpacity
              style={styles.input}
              onPress={() => setShowLookingForPicker(true)}
            >
              <Text style={[styles.inputText, !formData.lookingFor && styles.placeholder]}>
                {formData.lookingFor || 'What are you looking for?'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextButtonText}>Next</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>

      {showHeightPicker && renderPicker(
        heightOptions,
        formData.height,
        (value) => setFormData(prev => ({ ...prev, height: value })),
        () => setShowHeightPicker(false)
      )}

      {showReligionPicker && renderPicker(
        religionOptions,
        formData.religion,
        (value) => setFormData(prev => ({ ...prev, religion: value })),
        () => setShowReligionPicker(false)
      )}

      {showLookingForPicker && renderPicker(
        lookingForOptions,
        formData.lookingFor,
        (value) => setFormData(prev => ({ ...prev, lookingFor: value })),
        () => setShowLookingForPicker(false)
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  header: {
    backgroundColor: '#2a2a2a',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  form: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#fff',
    borderWidth: 1,
    borderColor: '#333',
    justifyContent: 'center',
  },
  inputText: {
    fontSize: 16,
    color: '#fff',
  },
  placeholder: {
    color: '#666',
  },
  nextButton: {
    backgroundColor: '#0077b5',
    marginHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 25,
    alignItems: 'center',
  },
  nextButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  pickerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickerContainer: {
    backgroundColor: '#2a2a2a',
    borderRadius: 16,
    margin: 20,
    maxHeight: '70%',
    width: '80%',
  },
  pickerScroll: {
    maxHeight: 300,
  },
  pickerOption: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  selectedOption: {
    backgroundColor: '#0077b5',
  },
  pickerOptionText: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
  },
  selectedOptionText: {
    color: '#fff',
    fontWeight: '600',
  },
  pickerCloseButton: {
    padding: 16,
    alignItems: 'center',
  },
  pickerCloseText: {
    fontSize: 16,
    color: '#0077b5',
    fontWeight: '600',
  },
});