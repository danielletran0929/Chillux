import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import createChangeStyles from '../styles/changeStyles';

export default function ChangeEmail({ navigation }) {
  const styles = createChangeStyles();
  const [email, setEmail] = useState('');

  const saveEmail = async () => {
    if (!email.includes('@')) return Alert.alert('Invalid Email', 'Enter a valid email.');

    const usersRaw = await AsyncStorage.getItem('users');
    const users = usersRaw ? JSON.parse(usersRaw) : [];

    if (users.some(u => u.email === email)) {
      return Alert.alert('Error', 'Email already in use.');
    }

    const userRaw = await AsyncStorage.getItem('currentUser');
    if (!userRaw) return;
    const user = JSON.parse(userRaw);

    user.email = email;

    const updatedUsers = users.map(u => u.id === user.id ? user : u);
    await AsyncStorage.setItem('users', JSON.stringify(updatedUsers));
    await AsyncStorage.setItem('currentUser', JSON.stringify(user));

    Alert.alert('Success', 'Email updated!');
    navigation.goBack();
  };

  return (
    <View style={styles.pageContainer}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Change Email</Text>

      <TextInput
        style={styles.input}
        placeholder="New Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TouchableOpacity style={styles.saveBtn} onPress={saveEmail}>
        <Text style={styles.saveText}>Save</Text>
      </TouchableOpacity>
    </View>
  );
}
