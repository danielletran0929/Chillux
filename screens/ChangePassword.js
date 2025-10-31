import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import createChangeStyles from '../styles/changeStyles';

export default function ChangePassword({ navigation }) {
  const [styles, setStyles] = useState(createChangeStyles());
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [user, setUser] = useState(null);

  useEffect(() => {
    async function loadUser() {
      const userRaw = await AsyncStorage.getItem('currentUser');
      if (!userRaw) return;
      const parsedUser = JSON.parse(userRaw);
      setUser(parsedUser);
      setStyles(createChangeStyles(parsedUser.theme || {}));
    }
    loadUser();
  }, []);

  const savePassword = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      return Alert.alert('Error', 'All fields are required.');
    }
    if (!user) return;
    if (oldPassword !== user.password) {
      return Alert.alert('Error', 'Old password is incorrect.');
    }
    if (newPassword === oldPassword) {
      return Alert.alert('Error', 'New password cannot be the same as old password.');
    }
    if (newPassword !== confirmPassword) {
      return Alert.alert('Error', 'Confirm password does not match new password.');
    }

    const updatedUser = { ...user, password: newPassword };

    const usersRaw = await AsyncStorage.getItem('users');
    const users = usersRaw ? JSON.parse(usersRaw) : [];
    const updatedUsers = users.map(u => u.id === user.id ? updatedUser : u);

    await AsyncStorage.setItem('users', JSON.stringify(updatedUsers));
    await AsyncStorage.setItem('currentUser', JSON.stringify(updatedUser));

    Alert.alert('Success', 'Password updated!');
    navigation.goBack();
  };

  return (
    <View style={styles.pageContainer}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Change Password</Text>

      <TextInput
        style={styles.input}
        placeholder="Old Password"
        value={oldPassword}
        onChangeText={setOldPassword}
        secureTextEntry
      />

      <TextInput
        style={styles.input}
        placeholder="New Password"
        value={newPassword}
        onChangeText={setNewPassword}
        secureTextEntry
      />

      <TextInput
        style={styles.input}
        placeholder="Confirm New Password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
      />

      <TouchableOpacity style={styles.saveBtn} onPress={savePassword}>
        <Text style={styles.saveText}>Save</Text>
      </TouchableOpacity>
    </View>
  );
}
