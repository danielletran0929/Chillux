import React, { useState, useEffect } from 'react';
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import common from '../styles/commonStyles';
import styles from '../styles/registerStyles';

export default function RegisterScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');

  const defaultTheme = {
    backgroundType: 'color',
    backgroundColor: '#eef2f5',
    backgroundImage: null,
    accentColor: '#38b6ff',
    textColor: '#222222',
    borderColor: '#38b6ff',
  };

  // Ensure admin account exists on first load
  useEffect(() => {
    const createAdminAccount = async () => {
      const existing = await AsyncStorage.getItem('users');
      let users = existing ? JSON.parse(existing) : [];

      // Check if admin exists
      const adminExists = users.some(
        (u) => u.email.toLowerCase() === 'chillux@gmail.com'
      );

      if (!adminExists) {
        const adminUser = {
          id: Date.now().toString(),
          email: 'chillux@gmail.com',
          username: 'chillux',
          password: 'chillux',
          profilePhoto: null,
          coverPhoto: null,
          theme: defaultTheme,
          role: 'admin',
        };

        users.push(adminUser);
        await AsyncStorage.setItem('users', JSON.stringify(users));
        console.log('Admin account created.');
      }
    };

    createAdminAccount();
  }, []);

  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleRegister = async () => {
    if (!email || !username || !password || !confirm) {
      Alert.alert('Error', 'All fields are required');
      return;
    }

    if (!validateEmail(email.trim())) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    if (password !== confirm) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    const existing = await AsyncStorage.getItem('users');
    let users = existing ? JSON.parse(existing) : [];

    if (users.some((u) => u.email.toLowerCase() === email.trim().toLowerCase())) {
      Alert.alert('Error', 'Email already registered');
      return;
    }

    const newUser = {
      id: Date.now().toString(),
      email: email.trim(),
      username: username.trim(),
      password: password.trim(),
      profilePhoto: null,
      coverPhoto: null,
      theme: defaultTheme,
      role: 'user',
    };

    users.push(newUser);
    await AsyncStorage.setItem('users', JSON.stringify(users));

    Alert.alert('Success', 'Account created! You can now login.');
    navigation.navigate('Login');
  };

  return (
    <LinearGradient
      colors={['#2d006f', '#a56a3c']}
      start={{ x: 0, y: 0 }}
      end={{ x: 2, y: 1 }}
      style={common.container}
    >
      <Image source={require('../assets/logo.png')} style={common.logo} />

      <View style={common.panel}>
        <Text style={common.title}>Register</Text>

        <TextInput
          style={common.input}
          placeholder="Email"
          value={email}
          autoCapitalize="none"
          onChangeText={setEmail}
        />
        <TextInput
          style={common.input}
          placeholder="Username"
          value={username}
          onChangeText={setUsername}
        />
        <TextInput
          style={common.input}
          placeholder="Password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
        <TextInput
          style={common.input}
          placeholder="Confirm Password"
          secureTextEntry
          value={confirm}
          onChangeText={setConfirm}
        />

        <TouchableOpacity style={common.button} onPress={handleRegister}>
          <LinearGradient
            colors={['#ffb300', '#ff8c00']}
            end={{ x: 1, y: 1 }}
            style={common.button}
          >
            <Text style={common.buttonText}>Register</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.textLink}>Already have an account? Login</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}
