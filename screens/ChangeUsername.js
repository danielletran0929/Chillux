import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import createChangeStyles from '../styles/changeStyles';

export default function ChangeUsername({ navigation }) {
  const [styles, setStyles] = useState(createChangeStyles());
  const [username, setUsername] = useState('');
  const [user, setUser] = useState(null);

  useEffect(() => {
    async function loadThemeAndUser() {
      const userRaw = await AsyncStorage.getItem('currentUser');
      if (!userRaw) return;
      const parsedUser = JSON.parse(userRaw);
      setUser(parsedUser);
      setStyles(createChangeStyles(parsedUser.theme || {}));
    }
    loadThemeAndUser();
  }, []);

  const saveUsername = async () => {
  if (!username.trim()) return Alert.alert('Error', 'Username cannot be empty.');

  try {
    // Load full users array
    const usersRaw = await AsyncStorage.getItem('users');
    const users = usersRaw ? JSON.parse(usersRaw) : [];

    // Find the full current user by ID
    const fullUser = users.find(u => u.id === user.id);
    if (!fullUser) return Alert.alert('Error', 'User not found');

    // Update only the username
    const updatedUser = { ...fullUser, username };

    // Update users array
    const updatedUsers = users.map(u => (u.id === updatedUser.id ? updatedUser : u));
    await AsyncStorage.setItem('users', JSON.stringify(updatedUsers));

    // Update session (currentUser)
    await AsyncStorage.setItem('currentUser', JSON.stringify(updatedUser));
    setUser(updatedUser);

    // Update posts & comments
    const postsRaw = await AsyncStorage.getItem('posts');
    const posts = postsRaw ? JSON.parse(postsRaw) : [];
    const updatedPosts = posts.map(p => ({
      ...p,
      user: p.userId === updatedUser.id ? username : p.user,
      comments: p.comments?.map(c => c.userId === updatedUser.id ? { ...c, user: username } : c) || [],
    }));
    await AsyncStorage.setItem('posts', JSON.stringify(updatedPosts));

    Alert.alert('Success', 'Username updated!');
    navigation.goBack();
  } catch (err) {
    console.log('Error updating username:', err);
    Alert.alert('Error', 'Something went wrong.');
  }
};




  return (
    <View style={styles.pageContainer}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Change Username</Text>

      <TextInput
        style={styles.input}
        placeholder="New Username"
        value={username}
        onChangeText={setUsername}
      />

      <TouchableOpacity style={styles.saveBtn} onPress={saveUsername}>
        <Text style={styles.saveText}>Save</Text>
      </TouchableOpacity>
    </View>
  );
}