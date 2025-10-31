import React, { useState } from 'react';
import { View, TextInput, Text, TouchableOpacity, Image, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import common from '../styles/commonStyles';
import styles from '../styles/loginStyles';

export default function ForgotPasswordScreen({ navigation }) {
  const [email, setEmail] = useState('');

  const handleRecover = async () => {
    const stored = await AsyncStorage.getItem('users');

    if (!stored) {
      Alert.alert('Error', 'No registered users found');
      return;
    }

    const users = JSON.parse(stored);
    const found = users.find(u => u.email === email.trim());

    if (!found) {
      Alert.alert('Error', 'No account found with that email');
      return;
    }

    Alert.alert('Password Recovery', `Your password is: ${found.password}`);
  };

  return (
    <View style={common.container}>
      <Image source={require('../assets/logo.png')} style={common.logo} />

      <View style={common.panel}>
        <Text style={common.title}>Forgot Password</Text>

        <TextInput 
          style={common.input}
          placeholder="Enter your registered email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
        />

        <TouchableOpacity style={common.button} onPress={handleRecover}>
          <Text style={common.buttonText}>Recover Password</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[common.button, styles.secondaryButton]}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={common.buttonText}>Back to Login</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
