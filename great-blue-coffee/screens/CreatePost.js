import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, ScrollView, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import styles from '../styles/CreatePostStyles';

export default function CreatePost({ navigation }) {
  const [text, setText] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [images, setImages] = useState([]);

  useEffect(() => {
    // Load current user from AsyncStorage
    async function loadUser() {
      try {
        const savedUser = await AsyncStorage.getItem('currentUser');
        if (savedUser) setCurrentUser(JSON.parse(savedUser));
      } catch (e) {
        console.log('Error loading user:', e);
      }
    }
    loadUser();
  }, []);

  // Pick images from the gallery
  const pickImages = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.7,
        selectionLimit: 5
      });

      if (!result.canceled) {
        setImages([...images, ...result.assets.map(a => a.uri)]);
      }
    } catch (e) {
      console.log('Error picking images:', e);
    }
  };

  // Handle post submission
  // Handle post submission
const handlePost = async () => {
  if (!text.trim() && images.length === 0) {
    Alert.alert('Error', 'Please enter text or select at least one image.');
    return;
  }
  if (!currentUser) {
    Alert.alert('Error', 'User not found.');
    return;
  }

  try {
    const storedPosts = await AsyncStorage.getItem('posts');
    const posts = storedPosts ? JSON.parse(storedPosts) : [];

    const newPost = {
      id: Date.now().toString(),
      userId: currentUser.id,
      user: currentUser.username,
      time: 'Just now',
      text: text.trim(),
      likes: {},       // empty object for likes
      images           // array of images (can be empty)
    };

    await AsyncStorage.setItem('posts', JSON.stringify([newPost, ...posts]));

    // Clear fields
    setText('');
    setImages([]);

    // Go back to the previous screen
    navigation.goBack();
  } catch (e) {
    console.log('Error saving post:', e);
  }
};


  return (
    <ScrollView style={styles.pageContainer} contentContainerStyle={{ paddingBottom: 20 }}>
      <Text style={styles.headerText}>Create Post</Text>

      <TextInput
        style={styles.postInput}
        placeholder="Write something..."
        value={text}
        onChangeText={setText}
        multiline
      />

      <TouchableOpacity style={styles.postButton} onPress={pickImages}>
        <Text style={styles.postBtnText}>📸 Add Images</Text>
      </TouchableOpacity>

      {images.length > 0 && (
        <ScrollView horizontal style={styles.imagePreviewContainer}>
          {images.map((uri, index) => (
            <Image key={index} source={{ uri }} style={styles.postImage} />
          ))}
        </ScrollView>
      )}

      <TouchableOpacity style={styles.postButton} onPress={handlePost}>
        <Text style={styles.postBtnText}>Post</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
