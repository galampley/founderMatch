import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  StatusBar,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { CreditCard as Edit, Camera, Settings, MapPin, X, Plus } from 'lucide-react-native';
import { router } from 'expo-router';
import { useUser } from '@/contexts/UserContext';


export default function ProfileScreen() {
  const { user } = useUser();
  const { updateUser } = useUser();
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [editingData, setEditingData] = useState<any>(null);
  const [showPromptPicker, setShowPromptPicker] = useState(false);

  const availablePrompts = [
    'My startup idea in one sentence',
    'The biggest challenge I need help with',
    'My technical skills include',
    'My business experience is',
    'I\'m looking for a co-founder who',
    'My biggest strength as a founder',
    'The industry I\'m passionate about',
    'My previous startup experience',
    'What motivates me most',
    'My ideal working style',
    'The problem I want to solve',
    'My long-term vision is',
    'I bring to the table',
    'My leadership style',
    'What excites me about startups',
    'My approach to risk',
    'I\'m most productive when',
    'My networking philosophy',
  ];

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

  const handleEditBasicInfo = () => {
    setEditingSection('basicInfo');
    setEditingData({
      name: user?.name || '',
      age: user?.age?.toString() || '',
      location: user?.location || '',
    });
  };

  const handleEditBasics = () => {
    setEditingSection('basics');
    setEditingData({
      height: user?.basics?.height || '',
      education: user?.basics?.education || '',
      jobTitle: user?.basics?.jobTitle || '',
      religion: user?.basics?.religion || '',
      lookingFor: user?.basics?.lookingFor || '',
    });
  };

  const handleEditPrompt = (index: number) => {
    setEditingSection('prompt');
    setEditingData({
      index,
      question: user?.prompts?.[index]?.question || '',
      answer: user?.prompts?.[index]?.answer || '',
    });
  };

  const handleAddPrompt = () => {
    if ((user?.prompts?.length || 0) >= 3) {
      Alert.alert('Prompt Limit', 'You can have up to 3 prompts.');
      return;
    }
    setShowPromptPicker(true);
  };

  const handleSelectPrompt = (question: string) => {
    setShowPromptPicker(false);
    setEditingSection('prompt');
    setEditingData({
      index: -1, // New prompt
      question,
      answer: '',
    });
  };

  const handleSaveEdit = () => {
    if (!editingData) return;

    switch (editingSection) {
      case 'basicInfo':
        const age = parseInt(editingData.age);
        if (!editingData.name || !editingData.age || !editingData.location) {
          Alert.alert('Missing Information', 'Please fill in all required fields.');
          return;
        }
        if (isNaN(age) || age < 18 || age > 100) {
          Alert.alert('Invalid Age', 'Please enter a valid age between 18 and 100.');
          return;
        }
        updateUser({
          name: editingData.name,
          age: age,
          location: editingData.location,
        });
        break;

      case 'basics':
        updateUser({
          basics: {
            ...user?.basics,
            height: editingData.height,
            education: editingData.education,
            jobTitle: editingData.jobTitle,
            religion: editingData.religion,
            lookingFor: editingData.lookingFor,
          }
        });
        break;

      case 'prompt':
        if (!editingData.answer.trim()) {
          Alert.alert('Empty Answer', 'Please provide an answer to the prompt.');
          return;
        }
        const currentPrompts = user?.prompts || [];
        let newPrompts;
        
        if (editingData.index === -1) {
          // Adding new prompt
          newPrompts = [...currentPrompts, {
            question: editingData.question,
            answer: editingData.answer,
          }];
        } else {
          // Editing existing prompt
          newPrompts = currentPrompts.map((prompt, index) =>
            index === editingData.index
              ? { question: editingData.question, answer: editingData.answer }
              : prompt
          );
        }
        updateUser({ prompts: newPrompts });
        break;
    }

    setEditingSection(null);
    setEditingData(null);
  };

  const handleDeletePrompt = (index: number) => {
    Alert.alert(
      'Delete Prompt',
      'Are you sure you want to delete this prompt?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            const newPrompts = user?.prompts?.filter((_, i) => i !== index) || [];
            updateUser({ prompts: newPrompts });
          }
        }
      ]
    );
  };

  const handleCancelEdit = () => {
    setEditingSection(null);
    setEditingData(null);
    setShowPromptPicker(false);
  };

  console.log('Profile screen - Current user:', user);
  console.log('Profile screen - User photos:', user?.photos);
  console.log('Profile screen - User prompts:', user?.prompts);
  console.log('Profile screen - User basics:', user?.basics);

  const renderPhoto = (uri: string, index: number) => (
    <View key={index} style={styles.photoContainer}>
      <Image source={{ uri }} style={styles.photo} />
      <TouchableOpacity style={styles.editPhotoButton}>
        <Camera size={20} color="#fff" />
      </TouchableOpacity>
    </View>
  );

  const renderPrompt = (prompt: { question: string; answer: string }, index: number) => (
    <View key={index} style={styles.promptCard}>
      <View style={styles.promptHeader}>
        <Text style={styles.promptQuestion}>{prompt.question}</Text>
        <TouchableOpacity onPress={() => handleEditPrompt(index)}>
          <Edit size={16} color="#0077b5" />
        </TouchableOpacity>
      </View>
      <Text style={styles.promptAnswer}>{prompt.answer}</Text>
      <TouchableOpacity 
        style={styles.deletePromptButton}
        onPress={() => handleDeletePrompt(index)}
      >
        <Text style={styles.deletePromptText}>Delete</Text>
      </TouchableOpacity>
    </View>
  );

  // Show message if no user data instead of redirecting
  if (!user) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#1a1a1a" />
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>My Profile</Text>
          </View>
        </View>
        <View style={[styles.content, { justifyContent: 'center', alignItems: 'center' }]}>
          <Text style={{ color: '#fff', fontSize: 18, marginBottom: 8 }}>No profile data</Text>
          <Text style={{ color: '#999', fontSize: 14 }}>Please complete onboarding first</Text>
        </View>
      </View>
    );
  }

  // Debug log to see what data we have
  console.log('User data in profile:', user);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a1a" />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Profile</Text>
      </View>
      
      <TouchableOpacity style={styles.settingsButton}>
        <Settings size={24} color="#fff" />
      </TouchableOpacity>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.profileNameContainer}>
            <Text style={styles.profileName}>
              {user.name}, {user.age}
            </Text>
            <TouchableOpacity onPress={handleEditBasicInfo}>
              <Edit size={20} color="#0077b5" />
            </TouchableOpacity>
          </View>
          <View style={styles.locationContainer}>
            <MapPin size={16} color="#999" />
            <Text style={styles.location}>{user.location}</Text>
          </View>
        </View>

        {/* Photos Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Photos</Text>
            <TouchableOpacity>
              <Text style={styles.addButton}>+ Add</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.photosGrid}>
            {user.photos?.map((photo, index) => renderPhoto(photo, index))}
            {(!user.photos || user.photos.length < 6) && (
              <TouchableOpacity style={styles.addPhotoButton}>
                <Camera size={32} color="#666" />
                <Text style={styles.addPhotoText}>Add Photo</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Prompts Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Prompts</Text>
            <TouchableOpacity onPress={handleAddPrompt}>
              <Text style={styles.addButton}>+ Add</Text>
            </TouchableOpacity>
          </View>
          {user.prompts && user.prompts.length > 0 ? (
            user.prompts.map((prompt, index) => renderPrompt(prompt, index))
          ) : (
            <View style={styles.emptyPrompts}>
              <Text style={styles.emptyText}>No prompts added yet</Text>
              <TouchableOpacity onPress={handleAddPrompt}>
                <Text style={styles.addButton}>Add your first prompt</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Basics Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Basics</Text>
            <TouchableOpacity onPress={handleEditBasics}>
              <Edit size={16} color="#0077b5" />
            </TouchableOpacity>
          </View>
          <View style={styles.basicsContainer}>
            <View style={styles.basicItem}>
              <Text style={styles.basicLabel}>Height</Text>
              <Text style={styles.basicValue}>{user.basics?.height || 'Not specified'}</Text>
            </View>
            <View style={styles.basicItem}>
              <Text style={styles.basicLabel}>Education</Text>
              <Text style={styles.basicValue}>{user.basics?.education || 'Not specified'}</Text>
            </View>
            <View style={styles.basicItem}>
              <Text style={styles.basicLabel}>Job Title</Text>
              <Text style={styles.basicValue}>{user.basics?.jobTitle || 'Not specified'}</Text>
            </View>
            <View style={styles.basicItem}>
              <Text style={styles.basicLabel}>Religion</Text>
              <Text style={styles.basicValue}>{user.basics?.religion || 'Not specified'}</Text>
            </View>
            <View style={styles.basicItem}>
              <Text style={styles.basicLabel}>Looking For</Text>
              <Text style={styles.basicValue}>{user.basics?.lookingFor || 'Not specified'}</Text>
            </View>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Edit Modals */}
      <Modal
        visible={editingSection === 'basicInfo'}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={handleCancelEdit}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={handleCancelEdit}>
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Edit Basic Info</Text>
            <TouchableOpacity onPress={handleSaveEdit}>
              <Text style={styles.modalSaveText}>Save</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Name *</Text>
              <TextInput
                style={styles.textInput}
                value={editingData?.name || ''}
                onChangeText={(text) => setEditingData(prev => ({ ...prev, name: text }))}
                placeholder="Enter your name"
                placeholderTextColor="#666"
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Age *</Text>
              <TextInput
                style={styles.textInput}
                value={editingData?.age || ''}
                onChangeText={(text) => setEditingData(prev => ({ ...prev, age: text }))}
                placeholder="Enter your age"
                placeholderTextColor="#666"
                keyboardType="numeric"
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Location *</Text>
              <TextInput
                style={styles.textInput}
                value={editingData?.location || ''}
                onChangeText={(text) => setEditingData(prev => ({ ...prev, location: text }))}
                placeholder="City, State"
                placeholderTextColor="#666"
              />
            </View>
          </ScrollView>
        </View>
      </Modal>

      <Modal
        visible={editingSection === 'basics'}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={handleCancelEdit}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={handleCancelEdit}>
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Edit Basics</Text>
            <TouchableOpacity onPress={handleSaveEdit}>
              <Text style={styles.modalSaveText}>Save</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Height</Text>
              <TouchableOpacity
                style={styles.textInput}
                onPress={() => {
                  Alert.alert(
                    'Select Height',
                    '',
                    heightOptions.map(height => ({
                      text: height,
                      onPress: () => setEditingData(prev => ({ ...prev, height }))
                    })).concat([{ text: 'Cancel', style: 'cancel' }])
                  );
                }}
              >
                <Text style={[styles.inputText, !editingData?.height && styles.placeholderText]}>
                  {editingData?.height || 'Select height'}
                </Text>
              </TouchableOpacity>
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Education</Text>
              <TextInput
                style={styles.textInput}
                value={editingData?.education || ''}
                onChangeText={(text) => setEditingData(prev => ({ ...prev, education: text }))}
                placeholder="School or degree"
                placeholderTextColor="#666"
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Job Title</Text>
              <TextInput
                style={styles.textInput}
                value={editingData?.jobTitle || ''}
                onChangeText={(text) => setEditingData(prev => ({ ...prev, jobTitle: text }))}
                placeholder="What do you do?"
                placeholderTextColor="#666"
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Religion</Text>
              <TouchableOpacity
                style={styles.textInput}
                onPress={() => {
                  Alert.alert(
                    'Select Religion',
                    '',
                    religionOptions.map(religion => ({
                      text: religion,
                      onPress: () => setEditingData(prev => ({ ...prev, religion }))
                    })).concat([{ text: 'Cancel', style: 'cancel' }])
                  );
                }}
              >
                <Text style={[styles.inputText, !editingData?.religion && styles.placeholderText]}>
                  {editingData?.religion || 'Select religion'}
                </Text>
              </TouchableOpacity>
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Looking For</Text>
              <TouchableOpacity
                style={styles.textInput}
                onPress={() => {
                  Alert.alert(
                    'Looking For',
                    '',
                    lookingForOptions.map(option => ({
                      text: option,
                      onPress: () => setEditingData(prev => ({ ...prev, lookingFor: option }))
                    })).concat([{ text: 'Cancel', style: 'cancel' }])
                  );
                }}
              >
                <Text style={[styles.inputText, !editingData?.lookingFor && styles.placeholderText]}>
                  {editingData?.lookingFor || 'What are you looking for?'}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>

      <Modal
        visible={editingSection === 'prompt'}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={handleCancelEdit}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={handleCancelEdit}>
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {editingData?.index === -1 ? 'Add Prompt' : 'Edit Prompt'}
            </Text>
            <TouchableOpacity onPress={handleSaveEdit}>
              <Text style={styles.modalSaveText}>Save</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Question</Text>
              <Text style={styles.promptQuestionText}>{editingData?.question}</Text>
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Your Answer</Text>
              <TextInput
                style={[styles.textInput, styles.multilineInput]}
                value={editingData?.answer || ''}
                onChangeText={(text) => setEditingData(prev => ({ ...prev, answer: text }))}
                placeholder="Your answer..."
                placeholderTextColor="#666"
                multiline
                maxLength={150}
              />
              <Text style={styles.characterCount}>
                {(editingData?.answer || '').length}/150
              </Text>
            </View>
          </ScrollView>
        </View>
      </Modal>

      <Modal
        visible={showPromptPicker}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={handleCancelEdit}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={handleCancelEdit}>
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Choose a Prompt</Text>
            <View style={{ width: 40 }} />
          </View>
          <ScrollView style={styles.modalContent}>
            {availablePrompts
              .filter(prompt => !user?.prompts?.some(p => p.question === prompt))
              .map((prompt, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.promptOption}
                  onPress={() => handleSelectPrompt(prompt)}
                >
                  <Text style={styles.promptOptionText}>{prompt}</Text>
                </TouchableOpacity>
              ))}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
  },
  settingsButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    padding: 8,
    zIndex: 10,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  profileNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  profileName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  location: {
    fontSize: 16,
    color: '#999',
    marginLeft: 4,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#fff',
  },
  addButton: {
    fontSize: 16,
    color: '#0077b5',
    fontWeight: '500',
  },
  photosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  photoContainer: {
    position: 'relative',
  },
  photo: {
    width: 100,
    height: 140,
    borderRadius: 12,
  },
  editPhotoButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 16,
    padding: 6,
  },
  addPhotoButton: {
    width: 100,
    height: 140,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#333',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addPhotoText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  promptCard: {
    backgroundColor: '#2a2a2a',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  promptHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  promptQuestion: {
    fontSize: 14,
    color: '#999',
    fontWeight: '500',
  },
  promptAnswer: {
    fontSize: 16,
    color: '#fff',
    lineHeight: 22,
  },
  deletePromptButton: {
    marginTop: 12,
    alignSelf: 'flex-start',
  },
  deletePromptText: {
    fontSize: 14,
    color: '#ef4444',
  },
  basicsContainer: {
    backgroundColor: '#2a2a2a',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#333',
  },
  basicItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  basicLabel: {
    fontSize: 16,
    color: '#999',
    fontWeight: '500',
  },
  basicValue: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
  },
  emptyPrompts: {
    backgroundColor: '#2a2a2a',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#333',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginBottom: 8,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: '#2a2a2a',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  modalCancelText: {
    fontSize: 16,
    color: '#999',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  modalSaveText: {
    fontSize: 16,
    color: '#0077b5',
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  inputGroup: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  textInput: {
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
  placeholderText: {
    color: '#666',
  },
  multilineInput: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  characterCount: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
    marginTop: 8,
  },
  promptQuestionText: {
    fontSize: 16,
    color: '#0077b5',
    fontWeight: '500',
    backgroundColor: '#2a2a2a',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  promptOption: {
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  promptOptionText: {
    fontSize: 16,
    color: '#fff',
  },
});