import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, ScrollView, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import createStyles from '../styles/createPostStyles';

export default function CreatePost({ navigation, theme = {} }) {
  const styles = createStyles(theme);
  const [text, setText] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [images, setImages] = useState([]);

  useEffect(() => {
    async function loadUser() {
      const savedUser = await AsyncStorage.getItem('currentUser');
      if (savedUser) setCurrentUser(JSON.parse(savedUser));
    }
    loadUser();
  }, []);

  const pickImages = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.7,
      selectionLimit: 5,
    });

    if (!result.canceled) {
      setImages([...images, ...result.assets.map(a => a.uri)]);
    }
  };

  const handlePost = async () => {
    if (!text.trim() && images.length === 0) {
      Alert.alert('Error', 'Please write something or select at least one image.');
      return;
    }
    if (!currentUser) return;

    const storedPosts = await AsyncStorage.getItem('posts');
    const posts = storedPosts ? JSON.parse(storedPosts) : [];

    const newPost = {
      id: Date.now().toString(),
      userId: currentUser.id,
      text: text.trim(),
      images,
      comments: [],
      likes: {},
      timestamp: Date.now(),
    };

    await AsyncStorage.setItem('posts', JSON.stringify([newPost, ...posts]));
    setText('');
    setImages([]);
    navigation.goBack();
  };

  return (
    <ScrollView style={styles.pageContainer}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Text style={styles.backButtonText}>⬅ Back</Text>
      </TouchableOpacity>

      <Text style={styles.headerText}>Create Post</Text>

      <TextInput
        style={styles.postInput}
        placeholder="Write something..."
        value={text}
        onChangeText={setText}
        multiline
        placeholderTextColor={theme.placeholderTextColor || '#888'}
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

      <TouchableOpacity
        style={[styles.postButton,
        (!text.trim() && images.length === 0) && { opacity: 0.4 }]}
        disabled={!text.trim() && images.length === 0}
        onPress={handlePost}
      >
        <Text style={styles.postBtnText}>Post</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
