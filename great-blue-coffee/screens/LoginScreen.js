import React, { useState } from 'react';
import { View, TextInput, Text, TouchableOpacity, Image, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import common from '../styles/commonStyles';
import styles from '../styles/loginStyles';

export default function LoginScreen({ navigation, setLoggedIn }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    const stored = await AsyncStorage.getItem('users');
    
    if (!stored) {
      Alert.alert('Error', 'No user registered');
      return;
    }

    const users = JSON.parse(stored);
    const found = users.find(
      u => u.email === email.trim() && u.password === password.trim()
    );

    if (!found) {
      Alert.alert('Error', 'Invalid credentials');
      return;
    }

    await AsyncStorage.setItem('currentUser', JSON.stringify(found));
    await AsyncStorage.setItem('isLoggedIn', 'true');
    setLoggedIn(true);
  };

  return (
    <View style={common.container}>
      <Image source={require('../assets/logo.png')} style={common.logo} />

      <View style={common.panel}>
        <Text style={common.title}>Login</Text>

        <TextInput style={common.input} placeholder="Email" value={email} onChangeText={setEmail} autoCapitalize="none" />
        <TextInput style={common.input} placeholder="Password" secureTextEntry value={password} onChangeText={setPassword} />

        <TouchableOpacity style={common.button} onPress={handleLogin}>
          <Text style={common.buttonText}>Login</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[common.button, styles.secondaryButton]} onPress={() => navigation.navigate('Register')}>
          <Text style={common.buttonText}>Create Account</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
