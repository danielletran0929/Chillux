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
    (async () => {
      try {
        const userRaw = await AsyncStorage.getItem('currentUser');
        if (!userRaw) return;
        const parsedUser = JSON.parse(userRaw);
        setUser(parsedUser);
        setStyles(createChangeStyles(parsedUser.theme || {}));
      } catch (err) {
        console.log('Error loading user:', err);
      }
    })();
  }, []);

  const savePassword = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      return Alert.alert('Error', 'All fields are required.');
    }
    if (!user) {
      return Alert.alert('Error', 'User not found. Please log in again.');
    }

    // ✅ Validate old password
    if (!user.password) {
      return Alert.alert('Error', 'This account has no password set.');
    }
    if (oldPassword !== user.password) {
      return Alert.alert('Error', 'Old password is incorrect.');
    }

    // ✅ Validate new password rules
    if (newPassword === oldPassword) {
      return Alert.alert('Error', 'New password cannot be the same as old password.');
    }
    if (newPassword !== confirmPassword) {
      return Alert.alert('Error', 'Confirm password does not match new password.');
    }

    try {
      const updatedUser = { ...user, password: newPassword };

      // ✅ Update user list in AsyncStorage
      const usersRaw = await AsyncStorage.getItem('users');
      let users = usersRaw ? JSON.parse(usersRaw) : [];

      const index = users.findIndex(u => u.id === updatedUser.id);
      if (index !== -1) {
        users[index] = updatedUser;
      } else {
        // fallback if somehow not found
        users.push(updatedUser);
      }

      await AsyncStorage.setItem('users', JSON.stringify(users));
      await AsyncStorage.setItem('currentUser', JSON.stringify(updatedUser));

      Alert.alert('Success', 'Password updated successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);

      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      console.log('Error saving password:', err);
      Alert.alert('Error', 'Something went wrong while updating password.');
    }
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
        placeholderTextColor="#888"
        value={oldPassword}
        onChangeText={setOldPassword}
        secureTextEntry
      />

      <TextInput
        style={styles.input}
        placeholder="New Password"
        placeholderTextColor="#888"
        value={newPassword}
        onChangeText={setNewPassword}
        secureTextEntry
      />

      <TextInput
        style={styles.input}
        placeholder="Confirm New Password"
        placeholderTextColor="#888"
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
