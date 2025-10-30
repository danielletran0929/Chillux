import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
  ImageBackground
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import createSettingsStyles from '../styles/settingsStyles';
import { Ionicons } from '@expo/vector-icons';

export default function Settings({ navigation, setLoggedIn }) {
  const [theme, setTheme] = useState(null);
  const [customThemeEnabled, setCustomThemeEnabled] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    async function loadUserAndTheme() {
      const savedUser = await AsyncStorage.getItem('currentUser');
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        setCurrentUser(parsed);
        setTheme(parsed.theme || {});
      }

      const saved = await AsyncStorage.getItem('customThemeEnabled');
      if (saved !== null) setCustomThemeEnabled(JSON.parse(saved));
    }
    loadUserAndTheme();
  }, []);

  const styles = createSettingsStyles(theme || {});

  const toggleCustomTheme = async () => {
    const newValue = !customThemeEnabled;
    setCustomThemeEnabled(newValue);
    await AsyncStorage.setItem('customThemeEnabled', JSON.stringify(newValue));

    if (currentUser) {
      const updatedUser = {
        ...currentUser,
        themeEnabled: newValue
      };
      await AsyncStorage.setItem('currentUser', JSON.stringify(updatedUser));
      setCurrentUser(updatedUser);
    }

    Alert.alert('Custom Theme', newValue ? 'Enabled' : 'Disabled');
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('isLoggedIn');

      const currentUserRaw = await AsyncStorage.getItem('currentUser');
      if (currentUserRaw) {
        const parsedUser = JSON.parse(currentUserRaw);
        await AsyncStorage.setItem('lastLoggedInUser', JSON.stringify(parsedUser.id));
      }

      if (setLoggedIn) setLoggedIn(false);
      navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
    } catch (error) {
      console.log('Logout error:', error);
    }
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
    <ImageBackground
      source={theme?.backgroundImage ? { uri: theme.backgroundImage } : null}
      style={[styles.pageContainer, theme?.pageBackground ? { backgroundColor: theme.pageBackground } : {}]}
      resizeMode="cover"
    >
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Back Button */}
        <TouchableOpacity
          style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={theme?.textColor || '#333'} />
          <Text style={[styles.sectionTitle, { fontSize: 18, marginLeft: 6 }]}>
            Settings
          </Text>
        </TouchableOpacity>

        {/* Custom Theme Section */}
        <Text style={styles.sectionTitle}>Custom Theme</Text>
        <View style={styles.sectionRow}>
          <Text style={styles.sectionText}>Enable Custom Theme</Text>
          <Switch
            value={customThemeEnabled}
            onValueChange={toggleCustomTheme}
            thumbColor={customThemeEnabled ? theme?.accentColor || '#4CAF50' : '#ccc'}
          />
        </View>

        {/* Account Section */}
        <Text style={styles.sectionTitle}>Account</Text>
        {renderAccountRow('Change Email', 'ChangeEmail')}
        {renderAccountRow('Change Password', 'ChangePassword')}
        {renderAccountRow('Change Username', 'ChangeUsername')}

        {/* Logout */}
        <TouchableOpacity style={styles.button} onPress={handleLogout}>
          <Text style={styles.buttonText}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </ImageBackground>
  );
}
