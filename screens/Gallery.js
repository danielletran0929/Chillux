import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  Modal,
  Alert,
  SafeAreaView,
  StyleSheet,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/Ionicons';
import { useFocusEffect } from '@react-navigation/native';

export default function Gallery({ route, navigation }) {
  const { userId, currentUserId } = route.params;
  const [images, setImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [theme, setTheme] = useState({});

  // Load user gallery + theme
  useFocusEffect(
    React.useCallback(() => {
      let mounted = true;
      async function loadGallery() {
        const raw = await AsyncStorage.getItem(`uploadedPictures-${userId}`);
        const parsedImages = raw ? JSON.parse(raw) : [];
        const currentUserRaw = await AsyncStorage.getItem('currentUser');
        const parsedCurrent = currentUserRaw ? JSON.parse(currentUserRaw) : null;
        if (!mounted) return;
        setImages(parsedImages);
        setIsOwnProfile(parsedCurrent?.id === userId);
        setTheme(parsedCurrent?.theme || {});
      }
      loadGallery();
      return () => {
        mounted = false;
      };
    }, [userId])
  );

  const handleDeleteImage = async (uri) => {
    Alert.alert(
      'Delete Photo',
      'Are you sure you want to delete this image?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const updated = images.filter((img) => img !== uri);
            setImages(updated);
            await AsyncStorage.setItem(
              `uploadedPictures-${userId}`,
              JSON.stringify(updated)
            );
          },
        },
      ]
    );
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.imageTile}
      onPress={() => setSelectedImage(item)}
      activeOpacity={0.8}
    >
      <Image source={{ uri: item }} style={styles.image} />
      {isOwnProfile && (
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteImage(item)}
        >
          <Icon name="trash-outline" size={20} color="#fff" />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: theme.pageBackground || '#f5f5f5' },
      ]}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={26} color={theme.textColor || '#000'} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.textColor || '#000' }]}>
          Gallery
        </Text>
        <View style={{ width: 26 }} /> {/* spacer */}
      </View>

      {/* Gallery grid */}
      {images.length > 0 ? (
        <FlatList
          data={images}
          keyExtractor={(item, index) => index.toString()}
          numColumns={3}
          renderItem={renderItem}
          contentContainerStyle={styles.grid}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: theme.textColor || '#777' }]}>
            No photos uploaded yet.
          </Text>
        </View>
      )}

      {/* Fullscreen preview */}
      <Modal visible={!!selectedImage} transparent animationType="fade">
        <View style={styles.modalBackground}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setSelectedImage(null)}
          >
            <Icon name="close" size={30} color="#fff" />
          </TouchableOpacity>
          {selectedImage && (
            <Image
              source={{ uri: selectedImage }}
              style={styles.fullscreenImage}
              resizeMode="contain"
            />
          )}
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  grid: {
    padding: 5,
  },
  imageTile: {
    width: '32%',
    aspectRatio: 1,
    margin: '1%',
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  deleteButton: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 14,
    padding: 4,
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullscreenImage: {
    width: '100%',
    height: '80%',
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 2,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontStyle: 'italic',
  },
});
