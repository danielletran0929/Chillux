import React, { useState } from 'react';
import { View, TextInput, Text, TouchableOpacity, Image, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'react-native-linear-gradient';
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
    <LinearGradient
      colors={['#2d006f', '#a56a3c']}
      start={{ x: 0, y: 0 }}
      end={{ x: 2, y: 1 }}
      style={common.container}
    >
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

        <TouchableOpacity onPress={handleRecover}>
           <LinearGradient
              colors={['#ffb300', '#ff8c00']} 
              end={{ x: 1, y: 1 }}
              style={common.forgotButton} 
            >
            <Text style={common.forgotButtonText}>Recover Password</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          style={[common.button, styles.secondaryButton]}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={common.forgotButtonText2}>Back to Login</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}
