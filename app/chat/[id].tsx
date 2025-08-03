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
} from 'react-native';
import { ChevronLeft, Send, MoveHorizontal as MoreHorizontal } from 'lucide-react-native';
import { router, useLocalSearchParams } from 'expo-router';

interface Message {
  id: number;
  text: string;
  timestamp: string;
  isMe: boolean;
  isRead?: boolean;
}

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
        
        <TouchableOpacity style={styles.moreButton}>
          <MoreHorizontal size={24} color="#fff" />
        </TouchableOpacity>
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
});