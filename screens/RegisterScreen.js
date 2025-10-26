import React, { useState } from 'react';
import { View, TextInput, Text, TouchableOpacity, Image, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import common from '../styles/commonStyles';
import styles from '../styles/registerStyles';

export default function RegisterScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');

  const handleRegister = async () => {
    if (!email || !username || !password) {
      Alert.alert('Error', 'All fields are required');
      return;
    }
    

    if (password !== confirm) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    await AsyncStorage.setItem(
      'userData',
      JSON.stringify({ email, username, password })
    );

    await AsyncStorage.setItem('userData', JSON.stringify({ email, username, password }));
    await AsyncStorage.setItem('isLoggedIn', 'true');
    Alert.alert('Success', 'Account created');
    navigation.navigate('Login');
  };

  return (
    <View style={common.container}>
      <Image source={require('../assets/logo.png')} style={common.logo} />

      <View style={common.panel}>
        <Text style={common.title}>Register</Text>

        <TextInput style={common.input} placeholder="Email" value={email} onChangeText={setEmail} />
        <TextInput style={common.input} placeholder="Username" value={username} onChangeText={setUsername} />
        <TextInput style={common.input} placeholder="Password" secureTextEntry value={password} onChangeText={setPassword} />
        <TextInput style={common.input} placeholder="Confirm Password" secureTextEntry value={confirm} onChangeText={setConfirm} />

        <TouchableOpacity style={common.button} onPress={handleRegister}>
          <Text style={common.buttonText}>Register</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.textLink}>Have an account? Return to Login</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
