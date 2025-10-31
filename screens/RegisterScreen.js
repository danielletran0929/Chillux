import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/Ionicons';
import common from '../styles/commonStyles';
import styles from '../styles/registerStyles';

export default function RegisterScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const defaultTheme = {
    backgroundType: 'color',
    backgroundColor: '#eef2f5',
    backgroundImage: null,
    accentColor: '#38b6ff',
    textColor: '#222222',
    borderColor: '#38b6ff'
  };

  const handleRegister = async () => {
    if (!email || !username || !password || !confirm) {
      Alert.alert('Error', 'All fields are required');
      return;
    }

    if (password !== confirm) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    const existing = await AsyncStorage.getItem('users');
    let users = existing ? JSON.parse(existing) : [];

    if (users.some(u => u.email === email.trim())) {
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
    };

    users.push(newUser);
    await AsyncStorage.setItem('users', JSON.stringify(users));

    Alert.alert('Success', 'Account created! You can now login.');
    navigation.navigate('Login');
  };

  return (
    <View style={common.container}>
      <Image source={require('../assets/logo.png')} style={common.logo} />

      <View style={common.panel}>
        <Text style={common.title}>Register</Text>

        {/* Email Field */}
        <TextInput
          style={common.input}
          placeholder="Email"
          value={email}
          autoCapitalize="none"
          onChangeText={setEmail}
        />

        {/* Username Field */}
        <TextInput
          style={common.input}
          placeholder="Username"
          value={username}
          onChangeText={setUsername}
        />

        {/* Password Field with Toggle */}
        <View style={{ position: 'relative', justifyContent: 'center' }}>
          <TextInput
            style={[common.input, { paddingRight: 40 }]}
            placeholder="Password"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={{
              position: 'absolute',
              right: 10,
              top: 12,
              padding: 4,
            }}
          >
            <Icon
              name={showPassword ? 'eye-off' : 'eye'}
              size={22}
              color="#666"
            />
          </TouchableOpacity>
        </View>

        {/* Confirm Password Field with Toggle */}
        <View style={{ position: 'relative', justifyContent: 'center' }}>
          <TextInput
            style={[common.input, { paddingRight: 40 }]}
            placeholder="Confirm Password"
            secureTextEntry={!showConfirm}
            value={confirm}
            onChangeText={setConfirm}
          />
          <TouchableOpacity
            onPress={() => setShowConfirm(!showConfirm)}
            style={{
              position: 'absolute',
              right: 10,
              top: 12,
              padding: 4,
            }}
          >
            <Icon
              name={showConfirm ? 'eye-off' : 'eye'}
              size={22}
              color="#666"
            />
          </TouchableOpacity>
        </View>

        {/* Register Button */}
        <TouchableOpacity style={common.button} onPress={handleRegister}>
          <Text style={common.buttonText}>Register</Text>
        </TouchableOpacity>

        {/* Login Link */}
        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.textLink}>Already have an account? Login</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
