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
import { LinearGradient } from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import common from '../styles/commonStyles';
import styles from '../styles/loginStyles';

export default function LoginScreen({ navigation, setLoggedIn }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Ensure admin account exists when the screen mounts
  useEffect(() => {
    const ensureAdmin = async () => {
      const stored = await AsyncStorage.getItem('users');
      let users = stored ? JSON.parse(stored) : [];

      const adminExists = users.some(u => u.email === 'chillux@gmail.com');
      if (!adminExists) {
        users.push({
          id: Date.now().toString(),
          email: 'chillux@gmail.com',
          username: 'chillux',
          password: 'chillux',
          profilePhoto: null,
          coverPhoto: null,
          theme: {
            backgroundType: 'color',
            backgroundColor: '#eef2f5',
            accentColor: '#38b6ff',
            textColor: '#222222',
            borderColor: '#38b6ff',
          },
          role: 'admin', // Mark as admin
        });
        await AsyncStorage.setItem('users', JSON.stringify(users));
      }
    };

    ensureAdmin();
  }, []);

  const handleLogin = async () => {
    const stored = await AsyncStorage.getItem('users');
    if (!stored) {
      Alert.alert('Error', 'No users found');
      return;
    }

    const users = JSON.parse(stored);

    const found = users.find(
      u => u.email === email.trim() && u.password === password.trim()
    );

    if (!found) {
      Alert.alert('Error', 'Invalid email or password');
      return;
    }

    const userSession = {
      id: found.id,
      username: found.username,
      email: found.email,
      password: found.password,
      profilePhoto: found.profilePhoto,
      coverPhoto: found.coverPhoto,
      theme: found.theme,
      role: found.role || 'user', // default to 'user' if not set
    };

    await AsyncStorage.setItem('currentUser', JSON.stringify(userSession));
    await AsyncStorage.setItem('isLoggedIn', 'true');

    setLoggedIn(true);
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
        <Text style={common.title}>Login</Text>

        {/* Email Field */}
        <TextInput
          style={common.input}
          placeholder="Email"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />

        {/* Password Field with Eye Toggle */}
        <View style={{ position: 'relative', justifyContent: 'center' }}>
          <TextInput
            style={[common.input, { paddingRight: 40 }]} // space for icon
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

        {/* Forgot Password */}
        <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
          <Text style={styles.ForgotLink}>Forgot your password?</Text>
        </TouchableOpacity>

        {/* Login Button */}
        <TouchableOpacity style={common.button} onPress={handleLogin}>
          <LinearGradient
            colors={['#ffb300', '#ff8c00']}
            end={{ x: 1, y: 1 }}
            style={common.button}
          >
            <Text style={common.buttonText}>Login</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Create Account Button */}
        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
          <Text style={styles.SignInLink}>New Here? Create Account</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

