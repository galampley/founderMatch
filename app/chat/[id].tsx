import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Image,
  Modal,
  Alert,
} from 'react-native';
import { ChevronLeft, Send, MoveHorizontal as MoreHorizontal, UserPlus, Clock, Code, Target, Lightbulb, Users } from 'lucide-react-native';
import { router, useLocalSearchParams } from 'expo-router';

interface Message {
  id: number;
  text: string;
  timestamp: string;
  isMe: boolean;
  isRead?: boolean;
}

interface Collab {
  id: number;
  title: string;
  description: string;
  duration: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  category: 'Technical' | 'Business' | 'Product' | 'Design';
  icon: React.ReactNode;
}

const availableCollabs: Collab[] = [
  {
    id: 1,
    title: 'Code Review Challenge',
    description: 'Review each other\'s code samples and provide constructive feedback to assess technical compatibility.',
    duration: '2-3 hours',
    difficulty: 'Easy',
    category: 'Technical',
    icon: <Code size={24} color="#0077b5" />,
  },
  {
    id: 2,
    title: 'Mini Product Sprint',
    description: 'Build a simple feature or prototype together over a weekend to test collaboration dynamics.',
    duration: '2-3 days',
    difficulty: 'Medium',
    category: 'Product',
    icon: <Target size={24} color="#0077b5" />,
  },
  {
    id: 3,
    title: 'Business Case Study',
    description: 'Analyze a real business problem and present solutions together to evaluate strategic thinking.',
    duration: '4-5 hours',
    difficulty: 'Medium',
    category: 'Business',
    icon: <Lightbulb size={24} color="#0077b5" />,
  },
  {
    id: 4,
    title: 'Startup Pitch Workshop',
    description: 'Develop and refine each other\'s startup ideas through structured feedback sessions.',
    duration: '3-4 hours',
    difficulty: 'Easy',
    category: 'Business',
    icon: <Users size={24} color="#0077b5" />,
  },
  {
    id: 5,
    title: 'Technical Architecture Design',
    description: 'Collaborate on designing the technical architecture for a hypothetical or real project.',
    duration: '3-4 hours',
    difficulty: 'Hard',
    category: 'Technical',
    icon: <Code size={24} color="#0077b5" />,
  },
  {
    id: 6,
    title: 'Customer Interview Practice',
    description: 'Conduct mock customer interviews to validate a business idea and practice user research skills.',
    duration: '2-3 hours',
    difficulty: 'Easy',
    category: 'Product',
    icon: <Target size={24} color="#0077b5" />,
  },
];

const dummyMessages: { [key: string]: Message[] } = {
  '1': [
    {
      id: 1,
      text: "Hi! I saw your response to my startup idea section. Really impressed with your background!",
      timestamp: "2:30 PM",
      isMe: false,
    },
    {
      id: 2,
      text: "Thanks! Your AI healthcare platform sounds fascinating. I'd love to learn more about it.",
      timestamp: "2:32 PM",
      isMe: true,
    },
    {
      id: 3,
      text: "I love your startup idea! Would love to discuss more. The healthcare AI space is so exciting right now.",
      timestamp: "2:35 PM",
      isMe: false,
    },
    {
      id: 4,
      text: "Absolutely! I've been working on some ML models for patient diagnosis. What's your experience with healthcare regulations?",
      timestamp: "2:38 PM",
      isMe: true,
    },
    {
      id: 5,
      text: "I actually worked on HIPAA compliance at my previous startup. It's complex but definitely manageable with the right approach.",
      timestamp: "2:40 PM",
      isMe: false,
    },
    {
      id: 6,
      text: "That's perfect! Would you be interested in a call this week to discuss potential collaboration?",
      timestamp: "2:42 PM",
      isMe: true,
    },
  ],
  '2': [
    {
      id: 1,
      text: "Thanks for responding to my skills section! Your AI/ML background is exactly what I'm looking for.",
      timestamp: "1:15 PM",
      isMe: true,
    },
    {
      id: 2,
      text: "Thanks! Your autonomous vehicle project sounds incredible. I've been working on computer vision for the past 3 years.",
      timestamp: "1:18 PM",
      isMe: false,
    },
    {
      id: 3,
      text: "Perfect! Computer vision is crucial for what we're building. Do you have experience with real-time processing?",
      timestamp: "1:20 PM",
      isMe: true,
    },
  ],
  '3': [
    {
      id: 1,
      text: "Your experience in fintech is impressive. I'm working on a B2B fintech solution for small businesses.",
      timestamp: "Yesterday",
      isMe: false,
    },
    {
      id: 2,
      text: "That sounds great! I've helped scale two fintech startups. What specific pain points are you addressing?",
      timestamp: "Yesterday",
      isMe: true,
    },
  ],
};

const userProfiles: { [key: string]: { name: string; photo: string; title: string; company?: string } } = {
  '1': {
    name: 'Sarah Chen',
    photo: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=400',
    title: 'Full-Stack Developer',
    company: 'Ex-Google',
  },
  '2': {
    name: 'Alex Rodriguez',
    photo: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=400',
    title: 'AI/ML Engineer',
    company: 'Ex-OpenAI',
  },
  '3': {
    name: 'Maya Patel',
    photo: 'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=400',
    title: 'Product Manager',
    company: 'Ex-Uber',
  },
};

export default function ChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [messages, setMessages] = useState<Message[]>(dummyMessages[id || '1'] || []);
  const [newMessage, setNewMessage] = useState('');
  const [showCollabModal, setShowCollabModal] = useState(false);
  const [selectedCollab, setSelectedCollab] = useState<Collab | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  
  const userProfile = userProfiles[id || '1'];

  useEffect(() => {
    // Scroll to bottom when messages change
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages]);

  const sendMessage = () => {
    if (newMessage.trim()) {
      const message: Message = {
        id: messages.length + 1,
        text: newMessage.trim(),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isMe: true,
      };
      
      setMessages(prev => [...prev, message]);
      setNewMessage('');
    }
  };

  const handleSendCollab = () => {
    setShowCollabModal(true);
  };

  const handleCollabSelect = (collab: Collab) => {
    setSelectedCollab(collab);
  };

  const handleSendCollabInvite = () => {
    if (!selectedCollab) {
      Alert.alert('No Collaboration Selected', 'Please select a collaboration to send.');
      return;
    }
    
    Alert.alert(
      'Collaboration Invite Sent!', 
      `You've sent a "${selectedCollab.title}" collaboration invite to ${userProfile.name}.`,
      [
        {
          text: 'OK',
          onPress: () => {
            setShowCollabModal(false);
            setSelectedCollab(null);
          }
        }
      ]
    );
  };

  const handleCloseCollabModal = () => {
    setShowCollabModal(false);
    setSelectedCollab(null);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return '#10b981';
      case 'Medium': return '#f59e0b';
      case 'Hard': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Technical': return '#3b82f6';
      case 'Business': return '#8b5cf6';
      case 'Product': return '#10b981';
      case 'Design': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const renderMessage = (message: Message) => (
    <View
      key={message.id}
      style={[
        styles.messageContainer,
        message.isMe ? styles.myMessageContainer : styles.theirMessageContainer,
      ]}
    >
      <View
        style={[
          styles.messageBubble,
          message.isMe ? styles.myMessageBubble : styles.theirMessageBubble,
        ]}
      >
        <Text style={[
          styles.messageText,
          message.isMe ? styles.myMessageText : styles.theirMessageText,
        ]}>
          {message.text}
        </Text>
      </View>
      <Text style={[
        styles.messageTimestamp,
        message.isMe ? styles.myMessageTimestamp : styles.theirMessageTimestamp,
      ]}>
        {message.timestamp}
      </Text>
    </View>
  );

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="light-content" backgroundColor="#1a1a1a" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ChevronLeft size={24} color="#fff" />
        </TouchableOpacity>
        
        <View style={styles.headerInfo}>
          <Image source={{ uri: userProfile?.photo }} style={styles.headerPhoto} />
          <View style={styles.headerText}>
            <Text style={styles.headerName}>{userProfile?.name}</Text>
            <Text style={styles.headerTitle}>
              {userProfile?.title}{userProfile?.company && ` • ${userProfile.company}`}
            </Text>
          </View>
        </View>
        
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.sendCollabButton} onPress={handleSendCollab}>
            <UserPlus size={16} color="#0077b5" />
            <Text style={styles.sendCollabText}>Send Collab</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.moreButton}>
            <MoreHorizontal size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Messages */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
      >
        {messages.map(renderMessage)}
      </ScrollView>

      {/* Input */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          value={newMessage}
          onChangeText={setNewMessage}
          placeholder="Type a message..."
          placeholderTextColor="#666"
          multiline
          maxLength={500}
        />
        <TouchableOpacity 
          style={[
            styles.sendButton,
            newMessage.trim() ? styles.sendButtonActive : styles.sendButtonInactive
          ]}
          onPress={sendMessage}
          disabled={!newMessage.trim()}
        >
          <Send size={20} color={newMessage.trim() ? "#fff" : "#666"} />
        </TouchableOpacity>
      </View>

      {/* Collaboration Selection Modal */}
      <Modal
        visible={showCollabModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={handleCloseCollabModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={handleCloseCollabModal}>
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Send Collaboration to {userProfile?.name}</Text>
            <TouchableOpacity 
              onPress={handleSendCollabInvite}
              disabled={!selectedCollab}
              style={[styles.sendButton, !selectedCollab && styles.sendButtonDisabled]}
            >
              <Send size={20} color={selectedCollab ? "#0077b5" : "#666"} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <Text style={styles.collabSectionTitle}>Choose a collaboration</Text>
            <Text style={styles.collabSectionSubtitle}>Select a collaboration method to propose to {userProfile?.name}</Text>
            
            {availableCollabs.map((collab) => (
              <TouchableOpacity
                key={collab.id}
                style={[
                  styles.collabCard,
                  selectedCollab?.id === collab.id && styles.collabCardSelected
                ]}
                onPress={() => handleCollabSelect(collab)}
              >
                <View style={styles.collabCardHeader}>
                  <View style={styles.collabIcon}>
                    {collab.icon}
                  </View>
                  <View style={styles.collabCardInfo}>
                    <Text style={[
                      styles.collabCardTitle,
                      selectedCollab?.id === collab.id && styles.collabCardTitleSelected
                    ]}>
                      {collab.title}
                    </Text>
                    <Text style={styles.collabCardDescription}>{collab.description}</Text>
                  </View>
                  {selectedCollab?.id === collab.id && (
                    <View style={styles.selectedIndicator}>
                      <Text style={styles.selectedCheck}>✓</Text>
                    </View>
                  )}
                </View>
                
                <View style={styles.collabCardMeta}>
                  <View style={styles.collabMetaItem}>
                    <Clock size={14} color="#999" />
                    <Text style={styles.collabMetaText}>{collab.duration}</Text>
                  </View>
                  <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(collab.difficulty) }]}>
                    <Text style={styles.difficultyText}>{collab.difficulty}</Text>
                  </View>
                  <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(collab.category) }]}>
                    <Text style={styles.categoryText}>{collab.category}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 16,
    paddingHorizontal: 16,
    backgroundColor: '#2a2a2a',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerPhoto: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  headerName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  headerTitle: {
    fontSize: 14,
    color: '#999',
  },
  moreButton: {
    padding: 8,
    marginLeft: 8,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
  },
  messageContainer: {
    marginBottom: 16,
  },
  myMessageContainer: {
    alignItems: 'flex-end',
  },
  theirMessageContainer: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
  },
  myMessageBubble: {
    backgroundColor: '#0077b5',
    borderBottomRightRadius: 4,
  },
  theirMessageBubble: {
    backgroundColor: '#2a2a2a',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  myMessageText: {
    color: '#fff',
  },
  theirMessageText: {
    color: '#fff',
  },
  messageTimestamp: {
    fontSize: 12,
    marginTop: 4,
  },
  myMessageTimestamp: {
    color: '#999',
    textAlign: 'right',
  },
  theirMessageTimestamp: {
    color: '#999',
    textAlign: 'left',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 16,
    backgroundColor: '#2a2a2a',
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  textInput: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#fff',
    maxHeight: 100,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonActive: {
    backgroundColor: '#0077b5',
  },
  sendButtonInactive: {
    backgroundColor: '#333',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sendCollabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 119, 181, 0.1)',
    borderWidth: 1,
    borderColor: '#0077b5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  sendCollabText: {
    fontSize: 12,
    color: '#0077b5',
    fontWeight: '600',
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
  modalContent: {
    flex: 1,
    padding: 20,
  },
  sendButton: {
    padding: 4,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  collabSectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  collabSectionSubtitle: {
    fontSize: 14,
    color: '#999',
    marginBottom: 24,
  },
  collabCard: {
    backgroundColor: '#2a2a2a',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  collabCardSelected: {
    borderColor: '#0077b5',
    backgroundColor: 'rgba(0, 119, 181, 0.05)',
  },
  collabCardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  collabIcon: {
    width: 48,
    height: 48,
    backgroundColor: '#333',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  collabCardInfo: {
    flex: 1,
  },
  collabCardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  collabCardTitleSelected: {
    color: '#0077b5',
  },
  collabCardDescription: {
    fontSize: 14,
    color: '#ccc',
    lineHeight: 20,
  },
  selectedIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#0077b5',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  selectedCheck: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  collabCardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  collabMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  collabMetaText: {
    fontSize: 12,
    color: '#999',
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
});