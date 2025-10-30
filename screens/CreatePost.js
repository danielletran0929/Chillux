import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import createStyles from '../styles/createPostStyles';

export default function CreatePost({ navigation }) {
  const [text, setText] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [images, setImages] = useState([]);
  const [theme, setTheme] = useState({});

  useEffect(() => {
    async function loadUser() {
      const savedUser = await AsyncStorage.getItem('currentUser');
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        setCurrentUser(parsed);
        setTheme(parsed.theme || {}); // ✅ apply theme from user
      }
    }
    loadUser();
  }, []);

  const styles = createStyles(theme);

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
      user: currentUser.username,
      time: 'Just now',
      text: text.trim(),
      likes: {},
      images,
      profilePic: currentUser.profilePic || null,
      comments: [],
      theme: currentUser.theme || {}, // ✅ keep theme in the post itself
    };

    await AsyncStorage.setItem('posts', JSON.stringify([newPost, ...posts]));
    setText('');
    setImages([]);
    navigation.goBack();
  };

  return (
    <ScrollView style={[styles.pageContainer, { backgroundColor: theme.pageBackground || '#f2f2f2' }]}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Text style={[styles.backButtonText, { color: theme.textColor || '#000' }]}>⬅ Back</Text>
      </TouchableOpacity>

      <Text style={[styles.headerText, { color: theme.headerTextColor || '#222' }]}>Create Post</Text>

      <TextInput
        style={[styles.postInput, { color: theme.textColor || '#000', borderColor: theme.borderColor || '#ccc' }]}
        placeholder="Write something..."
        value={text}
        onChangeText={setText}
        multiline
        placeholderTextColor={theme.placeholderTextColor || '#888'}
      />

      <TouchableOpacity
        style={[styles.postButton, { backgroundColor: theme.buttonBackground || '#0571d3' }]}
        onPress={pickImages}
      >
        <Text style={[styles.postBtnText, { color: theme.buttonTextColor || '#fff' }]}>📸 Add Images</Text>
      </TouchableOpacity>

      {images.length > 0 && (
        <ScrollView horizontal style={styles.imagePreviewContainer}>
          {images.map((uri, index) => (
            <Image key={index} source={{ uri }} style={styles.postImage} />
          ))}
        </ScrollView>
      )}

      <TouchableOpacity
        style={[
          styles.postButton,
          { backgroundColor: theme.buttonBackground || '#0571d3' },
          (!text.trim() && images.length === 0) && { opacity: 0.4 }
        ]}
        disabled={!text.trim() && images.length === 0}
        onPress={handlePost}
      >
        <Text style={[styles.postBtnText, { color: theme.buttonTextColor || '#fff' }]}>Post</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
