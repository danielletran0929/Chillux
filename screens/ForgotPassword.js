import React, { useState } from 'react';
import { View, TextInput, Text, TouchableOpacity, Image, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import common from '../styles/commonStyles';
import styles from '../styles/loginStyles';

export default function ForgotPasswordScreen({ navigation }) {
  const [email, setEmail] = useState('');

  const handleRecover = async () => {
    const savedData = await AsyncStorage.getItem('userData');

    if (!savedData) {
      Alert.alert('Error', 'No registered user found');
      return;
    }

    const { email: savedEmail, password } = JSON.parse(savedData);

    if (email.trim() === savedEmail) {
      Alert.alert('Your Password', `Password: ${password}`);
    } else {
      Alert.alert('Error', 'Email does not match registered account');
    }
  };

  return (
    <View style={common.container}>
      <Image source={require('../assets/logo.png')} style={common.logo} />

      <View style={common.panel}>
        <Text style={common.title}>Forgot Password</Text>

        <TextInput 
          style={common.input}
          placeholder="Enter Registered Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
        />

        <TouchableOpacity style={common.button} onPress={handleRecover}>
          <Text style={common.buttonText}>Recover Password</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[common.button, styles.secondaryButton]} onPress={() => navigation.navigate('Login')}>
          <Text style={common.buttonText}>Back to Login</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
