import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Image,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  runOnJS,
  interpolate,
} from 'react-native-reanimated';
import { Heart, X, MapPin, Briefcase, Lightbulb, Users, Send } from 'lucide-react-native';
import { useUser } from '@/contexts/UserContext';
import { router } from 'expo-router';
import { useEffect } from 'react';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface UserProfile {
  id: number;
  name: string;
  age: number;
  photo: string;
  title: string;
  company?: string;
  skills: string[];
  experience: string;
  startup: string;
  location: string;
  lookingFor: string;
  exploring: string;
  interestedIn: string[];
}


const sampleProfiles: UserProfile[] = [
  {
    id: 1,
    name: 'Sarah Chen',
    age: 28,
    photo: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=400',
    title: 'Full-Stack Developer',
    company: 'Ex-Google',
    skills: ['React', 'Node.js', 'Python', 'AWS'],
    experience: '5 years at Google, 2 years at startup',
    startup: 'AI-powered healthcare platform',
    location: 'San Francisco',
    lookingFor: 'Business Co-founder',
    exploring: 'Healthcare AI solutions, B2B SaaS platforms and generally interested in vertical AI.',
    interestedIn: ['AI', 'Healthcare', 'B2B SaaS', 'Machine Learning', 'Data Analytics']
  },
  {
    id: 2,
    name: 'Alex Rodriguez',
    age: 32,
    photo: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=400',
    title: 'AI/ML Engineer',
    company: 'Ex-OpenAI',
    skills: ['Python', 'TensorFlow', 'Docker', 'Kubernetes'],
    experience: 'PhD in ML, 3 years at OpenAI',
    startup: 'Autonomous vehicle software',
    location: 'Austin',
    lookingFor: 'Technical Co-founder',
    exploring: 'Autonomous systems, Computer vision applications and generally interested in robotics.',
    interestedIn: ['Computer Vision', 'Robotics', 'Autonomous Systems', 'Deep Learning', 'Edge Computing']
  },
  {
    id: 3,
    name: 'Maya Patel',
    age: 29,
    photo: 'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=400',
    title: 'Product Manager',
    company: 'Ex-Uber',
    skills: ['Product Strategy', 'User Research', 'Analytics'],
    experience: 'Ex-Uber PM, launched 3 products',
    startup: 'Fintech for small businesses',
    location: 'New York',
    lookingFor: 'Technical Co-founder',
    exploring: 'Fintech solutions, Small business tools and generally interested in financial inclusion.',
    interestedIn: ['Fintech', 'Payments', 'Small Business', 'Financial Inclusion', 'Mobile Banking']
  },
  {
    id: 4,
    name: 'David Kim',
    age: 35,
    photo: 'https://images.pexels.com/photos/1036623/pexels-photo-1036623.jpeg?auto=compress&cs=tinysrgb&w=400',
    title: 'DevOps Engineer',
    company: 'Ex-Netflix',
    skills: ['AWS', 'Kubernetes', 'Go', 'Terraform'],
    experience: '8 years scaling infrastructure',
    startup: 'B2B SaaS platform',
    location: 'Seattle',
    lookingFor: 'Business Co-founder',
    exploring: 'Cloud infrastructure, Developer tools and generally interested in enterprise software.',
    interestedIn: ['Cloud Computing', 'DevOps', 'Enterprise Software', 'Developer Tools', 'Infrastructure']
  },
  {
    id: 5,
    name: 'Lisa Wang',
    age: 26,
    photo: 'https://images.pexels.com/photos/1181519/pexels-photo-1181519.jpeg?auto=compress&cs=tinysrgb&w=400',
    title: 'Growth Marketing Lead',
    company: 'Ex-Stripe',
    skills: ['Growth Marketing', 'Brand Strategy', 'Analytics'],
    experience: 'Grew 2 startups from 0 to $10M ARR',
    startup: 'Consumer mobile app',
    location: 'Los Angeles',
    lookingFor: 'Technical Co-founder',
    exploring: 'Consumer apps, Social platforms and generally interested in creator economy.',
    interestedIn: ['Creator Economy', 'Social Media', 'Consumer Apps', 'Mobile Development', 'Community Building']
  }
];

export default function DiscoverScreen() {
  const { user } = useUser();
  
  const [profiles, setProfiles] = useState(sampleProfiles);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [selectedSection, setSelectedSection] = useState<{type: string, content: string} | null>(null);
  const [responseText, setResponseText] = useState('');
  
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);

  const gestureHandler = useAnimatedGestureHandler({
    onStart: () => {
      scale.value = withSpring(0.98);
    },
    onActive: (event) => {
      translateX.value = event.translationX;
      translateY.value = event.translationY * 0.1;
    },
    onEnd: (event) => {
      const shouldDismiss = event.translationX < -screenWidth * 0.25;
      
      if (shouldDismiss) {
        translateX.value = withSpring(-screenWidth * 1.2);
        runOnJS(handleSwipe)('pass');
      } else {
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
      }
      
      scale.value = withSpring(1);
    },
  });

  function handleSwipe(action: 'pass') {
    setTimeout(() => {
      setCurrentIndex(prev => prev + 1);
      translateX.value = 0;
      translateY.value = 0;
    }, 200);
  }

  const handlePass = () => {
    translateX.value = withSpring(-screenWidth * 1.2);
    handleSwipe('pass');
  };

  const handleSectionPress = (type: string, content: string) => {
    setSelectedSection({ type, content });
    setShowResponseModal(true);
  };

  const handleSendResponse = () => {
    if (!responseText.trim()) {
      Alert.alert('Empty Response', 'Please write a response before sending.');
      return;
    }

    const currentProfile = profiles[currentIndex];
    
    // Here you would typically send the response to your backend
    Alert.alert(
      'Response Sent!', 
      `Your response to "${selectedSection?.type}" has been sent to ${currentProfile.name}.`,
      [
        {
          text: 'OK',
          onPress: () => {
            setShowResponseModal(false);
            setResponseText('');
            setSelectedSection(null);
            // Move to next profile after successful response
            handleSwipe('pass');
          }
        }
      ]
    );
  };

  const handleCloseModal = () => {
    setShowResponseModal(false);
    setResponseText('');
    setSelectedSection(null);
  };


  const animatedStyle = useAnimatedStyle(() => {
    const rotate = interpolate(
      translateX.value,
      [-screenWidth, 0, screenWidth],
      [-15, 0, 15]
    );

    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { scale: scale.value },
        { rotate: `${rotate}deg` },
      ],
    };
  });

  if (currentIndex >= profiles.length) {
    return (
      <>
        <View style={styles.container}>
          <StatusBar barStyle="light-content" backgroundColor="#1a1a1a" />
          <View style={styles.emptyContainer}>
            <Users size={64} color="#666" />
            <Text style={styles.emptyText}>No more profiles!</Text>
            <Text style={styles.emptySubtext}>Check back later for new co-founders</Text>
          </View>
        </View>

        {/* Response Modal */}
        <Modal
          visible={showResponseModal}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={handleCloseModal}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={handleCloseModal}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Respond to User</Text>
              <TouchableOpacity onPress={handleSendResponse}>
                <Send size={20} color="#0077b5" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalContent}>
              <View style={styles.selectedSectionContainer}>
                <Text style={styles.selectedSectionLabel}>{selectedSection?.type}</Text>
                <Text style={styles.selectedSectionText}>{selectedSection?.content}</Text>
              </View>

              <View style={styles.responseContainer}>
                <Text style={styles.responseLabel}>Your response:</Text>
                <TextInput
                  style={styles.responseInput}
                  value={responseText}
                  onChangeText={setResponseText}
                  placeholder="Write your response..."
                  placeholderTextColor="#666"
                  multiline
                  maxLength={300}
                  autoFocus
                />
                <Text style={styles.characterCount}>{responseText.length}/300</Text>
              </View>
            </View>
          </View>
        </Modal>
      </>
    );
  }

  const currentProfile = profiles[currentIndex];
  const nextProfile = profiles[currentIndex + 1];

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#1a1a1a" />
        
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Discover</Text>
        </View>

        <View style={styles.cardContainer}>
          {/* Next card (background) */}
          {nextProfile && (
            <View style={[styles.card, styles.nextCard]}>
              <View style={styles.profileHeader}>
                <Image source={{ uri: nextProfile.photo }} style={styles.profilePhoto} />
                <View style={styles.profileHeaderInfo}>
                  <View>
                    <View style={styles.nameRow}>
                      <Text style={styles.profileName}>{nextProfile.name}, {nextProfile.age}</Text>
                      <View style={styles.linkedinBadge}>
                        <Text style={styles.linkedinText}>in</Text>
                      </View>
                    </View>
                    <Text style={styles.companyText}>{nextProfile.title} • {nextProfile.company}</Text>
                  </View>
                </View>
              </View>
            </View>
          )}

          {/* Current card */}
          <PanGestureHandler onGestureEvent={gestureHandler}>
            <Animated.View style={[styles.card, animatedStyle]}>
              <View style={styles.profileHeader}>
                <Image source={{ uri: currentProfile.photo }} style={styles.profilePhoto} />
                <View style={styles.profileHeaderInfo}>
                  <View>
                    <View style={styles.nameRow}>
                      <Text style={styles.profileName}>{currentProfile.name}, {currentProfile.age}</Text>
                      <View style={styles.linkedinBadge}>
                        <Text style={styles.linkedinText}>in</Text>
                      </View>
                    </View>
                    <Text style={styles.companyText}>{currentProfile.title} • {currentProfile.company}</Text>
                  </View>
                </View>
              </View>

              <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <TouchableOpacity 
                  style={styles.section}
                  onPress={() => handleSectionPress('Exploring', currentProfile.exploring)}
                >
                  <View style={styles.sectionHeader}>
                    <Text style={styles.sectionLabel}>Exploring</Text>
                    <Heart size={16} color="#0077b5" style={styles.responseIcon} />
                  </View>
                  <Text style={styles.sectionText}>{currentProfile.exploring}</Text>
                </TouchableOpacity>

                <View style={styles.detailsContainer}>
                  <TouchableOpacity 
                    style={styles.detailRow}
                    onPress={() => handleSectionPress('Location', currentProfile.location)}
                  >
                    <MapPin size={16} color="#999" />
                    <Text style={styles.detailText}>{currentProfile.location}</Text>
                    <Heart size={16} color="#0077b5" style={styles.responseIcon} />
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={styles.detailRow}
                    onPress={() => handleSectionPress('Looking For', currentProfile.lookingFor)}
                  >
                    <Users size={16} color="#999" />
                    <Text style={styles.detailText}>Looking for: {currentProfile.lookingFor}</Text>
                    <Heart size={16} color="#0077b5" style={styles.responseIcon} />
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={styles.detailRow}
                    onPress={() => handleSectionPress('Experience', currentProfile.experience)}
                  >
                    <Briefcase size={16} color="#999" />
                    <Text style={styles.detailText}>{currentProfile.experience}</Text>
                    <Heart size={16} color="#0077b5" style={styles.responseIcon} />
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={styles.detailRow}
                    onPress={() => handleSectionPress('Startup Idea', currentProfile.startup)}
                  >
                    <Lightbulb size={16} color="#999" />
                    <Text style={styles.detailText}>{currentProfile.startup}</Text>
                    <Heart size={16} color="#0077b5" style={styles.responseIcon} />
                  </TouchableOpacity>
                </View>

                <TouchableOpacity 
                  style={styles.section}
                  onPress={() => handleSectionPress('Skills', currentProfile.skills.join(', '))}
                >
                  <View style={styles.sectionHeader}>
                    <Text style={styles.sectionLabel}>Skills</Text>
                    <Heart size={16} color="#0077b5" style={styles.responseIcon} />
                  </View>
                  <View style={styles.skillsList}>
                    {currentProfile.skills.map((skill, index) => (
                      <View key={index} style={styles.skillTag}>
                        <Text style={styles.skillText}>{skill}</Text>
                      </View>
                    ))}
                  </View>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.section}
                  onPress={() => handleSectionPress('Interested In', currentProfile.interestedIn.join(', '))}
                >
                  <View style={styles.sectionHeader}>
                    <Text style={styles.sectionLabel}>Interested In</Text>
                    <Heart size={16} color="#0077b5" style={styles.responseIcon} />
                  </View>
                  <View style={styles.interestsList}>
                    {currentProfile.interestedIn.map((interest, index) => (
                      <View key={index} style={styles.interestTag}>
                        <Text style={styles.interestText}>{interest}</Text>
                      </View>
                    ))}
                  </View>
                </TouchableOpacity>

                <View style={{ height: 100 }} />
              </ScrollView>
            </Animated.View>
          </PanGestureHandler>
        </View>

      </View>

      {/* Bottom left X button */}
      <TouchableOpacity style={styles.bottomLeftButton} onPress={handlePass}>
        <X size={20} color="#666" />
      </TouchableOpacity>

      {/* Response Modal */}
      <Modal
        visible={showResponseModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={handleCloseModal}>
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Respond to {currentProfile?.name || 'User'}</Text>
            <TouchableOpacity onPress={handleSendResponse}>
              <Send size={20} color="#0077b5" />
            </TouchableOpacity>
          </View>

          <View style={styles.modalContent}>
            <View style={styles.selectedSectionContainer}>
              <Text style={styles.selectedSectionLabel}>{selectedSection?.type}</Text>
              <Text style={styles.selectedSectionText}>{selectedSection?.content}</Text>
            </View>

            <View style={styles.responseContainer}>
              <Text style={styles.responseLabel}>Your response:</Text>
              <TextInput
                style={styles.responseInput}
                value={responseText}
                onChangeText={setResponseText}
                placeholder="Write your response..."
                placeholderTextColor="#666"
                multiline
                maxLength={300}
                autoFocus
              />
              <Text style={styles.characterCount}>{responseText.length}/300</Text>
            </View>
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
  bottomLeftButton: {
    position: 'absolute',
    bottom: 24,
    left: 24,
    width: 50,
    height: 50,
    borderRadius: 22,
    backgroundColor: 'rgba(42, 42, 42, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
    zIndex: 1000,
  },
  cardContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  card: {
    width: screenWidth - 32,
    height: screenHeight * 0.75,
    borderRadius: 16,
    backgroundColor: '#2a2a2a',
    position: 'absolute',
    overflow: 'hidden',
  },
  nextCard: {
    transform: [{ scale: 0.95 }],
    opacity: 0.6,
    zIndex: -1,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  profilePhoto: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  profileHeaderInfo: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    marginRight: 8,
  },
  linkedinBadge: {
    backgroundColor: '#0077b5',
    width: 20,
    height: 20,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  linkedinText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  moreButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 24,
    borderRadius: 12,
    backgroundColor: '#333',
    padding: 16,
    borderWidth: 1,
    borderColor: '#444',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionLabel: {
    fontSize: 14,
    color: '#999',
    fontWeight: '500',
  },
  sectionText: {
    fontSize: 16,
    color: '#fff',
    lineHeight: 22,
  },
  interestsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  interestTag: {
    backgroundColor: '#333',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  interestText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '500',
  },
  detailsContainer: {
    marginBottom: 24,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: '#333',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#444',
  },
  detailText: {
    fontSize: 14,
    color: '#ccc',
    marginLeft: 8,
    flex: 1,
  },
  companyText: {
    fontSize: 14,
    color: '#999',
    marginLeft: 4,
  },
  responseIcon: {
    marginLeft: 8,
  },
  skillsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  skillTag: {
    backgroundColor: '#0077b5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  skillText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '500',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 40,
  },
  passButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#2a2a2a',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ff4458',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#fff',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 16,
    color: '#999',
    marginTop: 8,
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
  selectedSectionContainer: {
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#333',
  },
  selectedSectionLabel: {
    fontSize: 14,
    color: '#0077b5',
    fontWeight: '600',
    marginBottom: 8,
  },
  selectedSectionText: {
    fontSize: 16,
    color: '#fff',
    lineHeight: 22,
  },
  responseContainer: {
    flex: 1,
  },
  responseLabel: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
    marginBottom: 12,
  },
  responseInput: {
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#fff',
    borderWidth: 1,
    borderColor: '#333',
    minHeight: 120,
    textAlignVertical: 'top',
  },
  characterCount: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
    marginTop: 8,
  },
});