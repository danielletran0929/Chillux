import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import createChangeStyles from '../styles/changeStyles';

export default function ChangeUsername({ navigation }) {
  const styles = createChangeStyles();
  const [username, setUsername] = useState('');

  const saveUsername = async () => {
    if (!username.trim()) return Alert.alert('Error', 'Username cannot be empty.');
    const userRaw = await AsyncStorage.getItem('currentUser');
    if (!userRaw) return;
    const user = JSON.parse(userRaw);
    user.username = username;
    await AsyncStorage.setItem('currentUser', JSON.stringify(user));
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
