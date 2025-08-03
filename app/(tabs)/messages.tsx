import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  StatusBar,
  Modal,
} from 'react-native';
import { MessageCircle, Heart, Clock } from 'lucide-react-native';
import { router } from 'expo-router';

interface Match {
  id: number;
  name: string;
  photo: string;
  title: string;
  company?: string;
  lastMessage?: string;
  timestamp: string;
  isOnline: boolean;
  hasUnread: boolean;
  designation: 'In Consideration' | 'In Queue' | 'In Collab' | 'In Waiting' | 'Closed';
}

const sampleMatches: Match[] = [
  {
    id: 1,
    name: 'Sarah Chen',
    photo: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=400',
    title: 'Full-Stack Developer',
    company: 'Ex-Google',
    lastMessage: 'I love your startup idea! Would love to discuss more.',
    timestamp: '2m ago',
    isOnline: true,
    hasUnread: true,
    designation: 'In Consideration',
  },
  {
    id: 2,
    name: 'Alex Rodriguez',
    photo: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=400',
    title: 'AI/ML Engineer',
    company: 'Ex-OpenAI',
    lastMessage: 'Thanks for responding to my skills section!',
    timestamp: '1h ago',
    isOnline: false,
    hasUnread: false,
    designation: 'In Queue',
  },
  {
    id: 3,
    name: 'Maya Patel',
    photo: 'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=400',
    title: 'Product Manager',
    company: 'Ex-Uber',
    lastMessage: 'Your experience in fintech is impressive.',
    timestamp: '3h ago',
    isOnline: true,
    hasUnread: true,
    designation: 'In Collab',
  },
  {
    id: 4,
    name: 'David Kim',
    photo: 'https://images.pexels.com/photos/1036623/pexels-photo-1036623.jpeg?auto=compress&cs=tinysrgb&w=400',
    title: 'DevOps Engineer',
    company: 'Ex-Netflix',
    timestamp: '1d ago',
    isOnline: false,
    hasUnread: false,
    designation: 'In Waiting',
  },
];

export default function MessagesScreen() {
  const [matches, setMatches] = useState(sampleMatches);
  const [showDesignationModal, setShowDesignationModal] = useState(false);
  const [selectedMatchId, setSelectedMatchId] = useState<number | null>(null);

  const manualDesignations = ['In Consideration', 'In Queue', 'Closed'] as const;

  const getDesignationColor = (designation: string) => {
    switch (designation) {
      case 'In Consideration': return '#f59e0b'; // amber
      case 'In Queue': return '#3b82f6'; // blue
      case 'In Collab': return '#10b981'; // green
      case 'In Waiting': return '#8b5cf6'; // purple
      case 'Closed': return '#6b7280'; // gray
      default: return '#6b7280';
    }
  };

  const handleDesignationPress = (matchId: number) => {
    setSelectedMatchId(matchId);
    setShowDesignationModal(true);
  };

  const updateDesignation = (designation: 'In Consideration' | 'In Queue' | 'Closed') => {
    if (selectedMatchId) {
      setMatches(prev => prev.map(match => 
        match.id === selectedMatchId 
          ? { ...match, designation }
          : match
      ));
    }
    setShowDesignationModal(false);
    setSelectedMatchId(null);
  };

  const renderMatch = (match: Match) => (
    <View key={match.id} style={styles.matchCard}>
      <TouchableOpacity 
        style={styles.matchContent}
        onPress={() => router.push(`/chat/${match.id}`)}
      >
        <View style={styles.photoContainer}>
          <Image source={{ uri: match.photo }} style={styles.matchPhoto} />
          {match.isOnline && <View style={styles.onlineIndicator} />}
        </View>
        
        <View style={styles.matchInfo}>
          <View style={styles.matchHeader}>
            <Text style={styles.matchName}>{match.name}</Text>
            <Text style={styles.timestamp}>{match.timestamp}</Text>
          </View>
          
          <Text style={styles.matchTitle}>
            {match.title}{match.company && ` • ${match.company}`}
          </Text>
          
          {match.lastMessage ? (
            <Text style={[
              styles.lastMessage,
              match.hasUnread && styles.unreadMessage
            ]}>
              {match.lastMessage}
            </Text>
          ) : (
            <View style={styles.newMatchContainer}>
              <Heart size={14} color="#ff4458" />
              <Text style={styles.newMatchText}>New match! Say hello</Text>
            </View>
          )}
        </View>
        
        {match.hasUnread && <View style={styles.unreadDot} />}
      </TouchableOpacity>
      
      <View style={styles.designationContainer}>
        <TouchableOpacity 
          style={[
            styles.designationBadge,
            { backgroundColor: getDesignationColor(match.designation) }
          ]}
          onPress={() => handleDesignationPress(match.id)}
          disabled={match.designation === 'In Collab' || match.designation === 'In Waiting'}
        >
          <Text style={styles.designationText}>{match.designation}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a1a" />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Messages</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.matchesList}>
          {matches.map(renderMatch)}
        </View>
      </ScrollView>

      {/* Designation Modal */}
      <Modal
        visible={showDesignationModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDesignationModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.designationModal}>
            <Text style={styles.modalTitle}>Change Status</Text>
            <Text style={styles.modalSubtitle}>Select a new status for this conversation</Text>
            
            {manualDesignations.map((designation) => (
              <TouchableOpacity
                key={designation}
                style={styles.designationOption}
                onPress={() => updateDesignation(designation)}
              >
                <View style={[
                  styles.designationOptionBadge,
                  { backgroundColor: getDesignationColor(designation) }
                ]}>
                  <Text style={styles.designationOptionText}>{designation}</Text>
                </View>
              </TouchableOpacity>
            ))}
            
            <TouchableOpacity 
              style={styles.modalCancelButton}
              onPress={() => setShowDesignationModal(false)}
            >
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
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
  content: {
    flex: 1,
  },
  matchesList: {
    padding: 20,
  },
  matchCard: {
    backgroundColor: '#2a2a2a',
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  matchContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    position: 'relative',
  },
  photoContainer: {
    position: 'relative',
    marginRight: 16,
  },
  matchPhoto: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#10b981',
    borderWidth: 2,
    borderColor: '#2a2a2a',
  },
  matchInfo: {
    flex: 1,
  },
  matchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  matchName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  timestamp: {
    fontSize: 12,
    color: '#999',
  },
  matchTitle: {
    fontSize: 14,
    color: '#ccc',
    marginBottom: 8,
  },
  lastMessage: {
    fontSize: 14,
    color: '#999',
    lineHeight: 18,
  },
  unreadMessage: {
    color: '#fff',
    fontWeight: '500',
  },
  newMatchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  newMatchText: {
    fontSize: 14,
    color: '#ff4458',
    marginLeft: 6,
    fontWeight: '500',
  },
  unreadDot: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#0077b5',
  },
  designationContainer: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  designationBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  designationText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  designationModal: {
    backgroundColor: '#2a2a2a',
    borderRadius: 16,
    padding: 24,
    margin: 20,
    minWidth: 280,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginBottom: 24,
  },
  designationOption: {
    marginBottom: 12,
  },
  designationOptionBadge: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  designationOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  modalCancelButton: {
    marginTop: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 16,
    color: '#999',
  },
});