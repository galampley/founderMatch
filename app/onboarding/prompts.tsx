import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import { ChevronLeft, Plus } from 'lucide-react-native';
import { router } from 'expo-router';
import { useUser } from '@/contexts/UserContext';

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

interface PromptAnswer {
  question: string;
  answer: string;
}

export default function Prompts() {
  const { updateUser } = useUser();
  const [prompts, setPrompts] = useState<PromptAnswer[]>([]);
  const [showPromptPicker, setShowPromptPicker] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const addPrompt = (question: string) => {
    if (prompts.length < 3) {
      setPrompts(prev => [...prev, { question, answer: '' }]);
      setEditingIndex(prompts.length);
    }
    setShowPromptPicker(false);
  };

  const updatePromptAnswer = (index: number, answer: string) => {
    setPrompts(prev => prev.map((prompt, i) => 
      i === index ? { ...prompt, answer } : prompt
    ));
  };

  const removePrompt = (index: number) => {
    setPrompts(prev => prev.filter((_, i) => i !== index));
    if (editingIndex === index) {
      setEditingIndex(null);
    }
  };

  const handleNext = () => {
    const completedPrompts = prompts.filter(p => p.answer.trim().length > 0);
    
    if (completedPrompts.length === 0) {
      Alert.alert('Add Prompts', 'Please answer at least one prompt to continue.');
      return;
    }

    console.log('Updating user with prompts:', completedPrompts);

    updateUser({
      prompts: completedPrompts,
    });

    router.push('/onboarding/complete');
  };

  const availableQuestions = availablePrompts.filter(
    prompt => !prompts.some(p => p.question === prompt)
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
        <Text style={styles.headerTitle}>Prompts</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.instructions}>
          <Text style={styles.instructionTitle}>Show your personality</Text>
          <Text style={styles.instructionText}>
            Answer up to 3 prompts to help others get to know you better. These will appear on your profile.
          </Text>
          <Text style={styles.promptCount}>
            {prompts.filter(p => p.answer.trim().length > 0).length}/3 prompts completed
          </Text>
        </View>

        <View style={styles.promptsContainer}>
          {prompts.map((prompt, index) => (
            <View key={index} style={styles.promptCard}>
              <View style={styles.promptHeader}>
                <Text style={styles.promptQuestion}>{prompt.question}</Text>
                <TouchableOpacity 
                  onPress={() => removePrompt(index)}
                  style={styles.removeButton}
                >
                  <Text style={styles.removeButtonText}>×</Text>
                </TouchableOpacity>
              </View>
              <TextInput
                style={styles.promptInput}
                value={prompt.answer}
                onChangeText={(text) => updatePromptAnswer(index, text)}
                placeholder="Your answer..."
                placeholderTextColor="#666"
                multiline
                maxLength={150}
                onFocus={() => setEditingIndex(index)}
                onBlur={() => setEditingIndex(null)}
              />
              <Text style={styles.characterCount}>
                {prompt.answer.length}/150
              </Text>
            </View>
          ))}

          {prompts.length < 3 && (
            <TouchableOpacity 
              style={styles.addPromptButton}
              onPress={() => setShowPromptPicker(true)}
            >
              <Plus size={24} color="#0077b5" />
              <Text style={styles.addPromptText}>Add a prompt</Text>
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity 
          style={[
            styles.nextButton,
            prompts.filter(p => p.answer.trim().length > 0).length === 0 && styles.disabledButton
          ]} 
          onPress={handleNext}
          disabled={prompts.filter(p => p.answer.trim().length > 0).length === 0}
        >
          <Text style={[
            styles.nextButtonText,
            prompts.filter(p => p.answer.trim().length > 0).length === 0 && styles.disabledButtonText
          ]}>
            Complete Profile
          </Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>

      {showPromptPicker && (
        <View style={styles.pickerOverlay}>
          <View style={styles.pickerContainer}>
            <Text style={styles.pickerTitle}>Choose a prompt</Text>
            <ScrollView style={styles.pickerScroll}>
              {availableQuestions.map((question) => (
                <TouchableOpacity
                  key={question}
                  style={styles.pickerOption}
                  onPress={() => addPrompt(question)}
                >
                  <Text style={styles.pickerOptionText}>{question}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity 
              style={styles.pickerCloseButton} 
              onPress={() => setShowPromptPicker(false)}
            >
              <Text style={styles.pickerCloseText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
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
  instructions: {
    padding: 20,
    alignItems: 'center',
  },
  instructionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },
  instructionText: {
    fontSize: 16,
    color: '#ccc',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 16,
  },
  promptCount: {
    fontSize: 14,
    color: '#0077b5',
    fontWeight: '600',
  },
  promptsContainer: {
    paddingHorizontal: 20,
    marginBottom: 32,
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
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  promptQuestion: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    flex: 1,
  },
  removeButton: {
    padding: 4,
    marginLeft: 8,
  },
  removeButtonText: {
    fontSize: 24,
    color: '#666',
    fontWeight: '300',
  },
  promptInput: {
    fontSize: 16,
    color: '#fff',
    lineHeight: 22,
    minHeight: 60,
    textAlignVertical: 'top',
  },
  characterCount: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
    marginTop: 8,
  },
  addPromptButton: {
    backgroundColor: '#2a2a2a',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#0077b5',
    borderStyle: 'dashed',
  },
  addPromptText: {
    fontSize: 16,
    color: '#0077b5',
    fontWeight: '600',
    marginLeft: 8,
  },
  nextButton: {
    backgroundColor: '#0077b5',
    marginHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 25,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#333',
  },
  nextButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  disabledButtonText: {
    color: '#666',
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
    width: '90%',
  },
  pickerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  pickerScroll: {
    maxHeight: 400,
  },
  pickerOption: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  pickerOptionText: {
    fontSize: 16,
    color: '#fff',
  },
  pickerCloseButton: {
    padding: 16,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  pickerCloseText: {
    fontSize: 16,
    color: '#0077b5',
    fontWeight: '600',
  },
});