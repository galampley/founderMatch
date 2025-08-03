import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import { ChevronLeft, Camera, Plus } from 'lucide-react-native';
import { router } from 'expo-router';
import { useUser } from '@/contexts/UserContext';

// Sample photos for demo purposes
const samplePhotos = [
  'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=400',
  'https://images.pexels.com/photos/1212984/pexels-photo-1212984.jpeg?auto=compress&cs=tinysrgb&w=400',
  'https://images.pexels.com/photos/1516680/pexels-photo-1516680.jpeg?auto=compress&cs=tinysrgb&w=400',
  'https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg?auto=compress&cs=tinysrgb&w=400',
  'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=400',
  'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=400',
];

export default function Photos() {
  const { user, updateUser } = useUser();
  const [selectedPhotos, setSelectedPhotos] = useState<string[]>([]);

  const handlePhotoSelect = (photo: string) => {
    if (selectedPhotos.includes(photo)) {
      setSelectedPhotos(prev => prev.filter(p => p !== photo));
    } else if (selectedPhotos.length < 6) {
      setSelectedPhotos(prev => [...prev, photo]);
    } else {
      Alert.alert('Photo Limit', 'You can select up to 6 photos.');
    }
  };

  const handleNext = () => {
    if (selectedPhotos.length === 0) {
      Alert.alert('Add Photos', 'Please select at least one photo to continue.');
      return;
    }

    console.log('Updating user with photos:', selectedPhotos);

    updateUser({
      photos: selectedPhotos,
    });

    router.push('/onboarding/prompts');
  };

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
        <Text style={styles.headerTitle}>Add Photos</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.instructions}>
          <Text style={styles.instructionTitle}>Choose your best photos</Text>
          <Text style={styles.instructionText}>
            Select up to 6 photos that show your personality. Your first photo will be your main profile picture.
          </Text>
          <Text style={styles.photoCount}>
            {selectedPhotos.length}/6 photos selected
          </Text>
        </View>

        <View style={styles.selectedPhotos}>
          <Text style={styles.sectionTitle}>Selected Photos</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.selectedPhotosContainer}>
              {Array.from({ length: 6 }).map((_, index) => (
                <View key={index} style={styles.selectedPhotoSlot}>
                  {selectedPhotos[index] ? (
                    <TouchableOpacity
                      onPress={() => handlePhotoSelect(selectedPhotos[index])}
                    >
                      <Image 
                        source={{ uri: selectedPhotos[index] }} 
                        style={styles.selectedPhoto} 
                      />
                      <View style={styles.photoNumber}>
                        <Text style={styles.photoNumberText}>{index + 1}</Text>
                      </View>
                    </TouchableOpacity>
                  ) : (
                    <View style={styles.emptyPhotoSlot}>
                      <Plus size={24} color="#666" />
                    </View>
                  )}
                </View>
              ))}
            </View>
          </ScrollView>
        </View>

        <View style={styles.photoGrid}>
          <Text style={styles.sectionTitle}>Choose from sample photos</Text>
          <Text style={styles.sectionSubtitle}>
            In a real app, you'd upload your own photos
          </Text>
          <View style={styles.grid}>
            {samplePhotos.map((photo, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.photoOption,
                  selectedPhotos.includes(photo) && styles.selectedPhotoOption
                ]}
                onPress={() => handlePhotoSelect(photo)}
              >
                <Image source={{ uri: photo }} style={styles.photoOptionImage} />
                {selectedPhotos.includes(photo) && (
                  <View style={styles.selectedOverlay}>
                    <View style={styles.selectedBadge}>
                      <Text style={styles.selectedBadgeText}>
                        {selectedPhotos.indexOf(photo) + 1}
                      </Text>
                    </View>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity 
          style={[
            styles.nextButton,
            selectedPhotos.length === 0 && styles.disabledButton
          ]} 
          onPress={handleNext}
          disabled={selectedPhotos.length === 0}
        >
          <Text style={[
            styles.nextButtonText,
            selectedPhotos.length === 0 && styles.disabledButtonText
          ]}>
            Next
          </Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
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
  photoCount: {
    fontSize: 14,
    color: '#0077b5',
    fontWeight: '600',
  },
  selectedPhotos: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
    paddingHorizontal: 20,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#999',
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  selectedPhotosContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
  },
  selectedPhotoSlot: {
    position: 'relative',
  },
  selectedPhoto: {
    width: 80,
    height: 100,
    borderRadius: 12,
  },
  emptyPhotoSlot: {
    width: 80,
    height: 100,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#333',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#2a2a2a',
  },
  photoNumber: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#0077b5',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoNumberText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  photoGrid: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  photoOption: {
    width: '31%',
    aspectRatio: 0.8,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  selectedPhotoOption: {
    borderWidth: 3,
    borderColor: '#0077b5',
  },
  photoOptionImage: {
    width: '100%',
    height: '100%',
  },
  selectedOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 119, 181, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedBadge: {
    backgroundColor: '#0077b5',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedBadgeText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
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
});