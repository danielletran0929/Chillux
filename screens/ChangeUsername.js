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
    if (!user) return;

    const usersRaw = await AsyncStorage.getItem('users');
    const users = usersRaw ? JSON.parse(usersRaw) : [];

    const updatedUser = { ...user, username };
    const updatedUsers = users.map(u => u.id === user.id ? updatedUser : u);

    await AsyncStorage.setItem('users', JSON.stringify(updatedUsers));
    await AsyncStorage.setItem('currentUser', JSON.stringify(updatedUser));

    Alert.alert('Success', 'Username updated!');
    navigation.goBack();
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
