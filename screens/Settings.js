import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Switch, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import createSettingsStyles from '../styles/settingsStyles';
import { Ionicons } from '@expo/vector-icons'; // make sure expo/vector-icons is installed

export default function Settings({ navigation, setLoggedIn }) {
  const styles = createSettingsStyles();
  const [customThemeEnabled, setCustomThemeEnabled] = useState(true);

  useEffect(() => {
    async function loadThemeSetting() {
      const saved = await AsyncStorage.getItem('customThemeEnabled');
      if (saved !== null) setCustomThemeEnabled(JSON.parse(saved));
    }
    loadThemeSetting();
  }, []);

  const toggleCustomTheme = async () => {
    const newValue = !customThemeEnabled;
    setCustomThemeEnabled(newValue);
    await AsyncStorage.setItem('customThemeEnabled', JSON.stringify(newValue));
    Alert.alert('Custom Theme', newValue ? 'Enabled' : 'Disabled');
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('isLoggedIn');
    await AsyncStorage.removeItem('currentUser');
    if (setLoggedIn) setLoggedIn(false);
  };

  const handleNavigate = (screenName) => {
    navigation.navigate(screenName);
  };

  const renderAccountRow = (label, screenName) => (
    <TouchableOpacity style={styles.sectionRow} onPress={() => handleNavigate(screenName)}>
      <Text style={styles.sectionText}>{label}</Text>
      <Ionicons name="chevron-forward" size={20} color="#888" />
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.pageContainer}>
      {/* Back Button */}
      <TouchableOpacity
        style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={24} color="#333" />
        <Text style={{ fontSize: 18, marginLeft: 6 }}>Settings</Text>
      </TouchableOpacity>

      {/* Custom Theme */}
      <Text style={styles.sectionTitle}>Custom Theme</Text>
      <View style={styles.sectionRow}>
        <Text style={styles.sectionText}>Enable Custom Theme</Text>
        <Switch value={customThemeEnabled} onValueChange={toggleCustomTheme} />
      </View>

      {/* Account Section */}
      <Text style={styles.sectionTitle}>Account</Text>
      {renderAccountRow('Change Email', 'ChangeEmail')}
      {renderAccountRow('Change Password', 'ChangePassword')}
      {renderAccountRow('Change Username', 'ChangeUsername')}

      {/* Logout Button */}
      <TouchableOpacity style={styles.button} onPress={handleLogout}>
        <Text style={styles.buttonText}>Log Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
