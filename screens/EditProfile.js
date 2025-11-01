import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/Ionicons';
import { themePresets } from '../styles/editProfileStyles';

export default function EditProfile({ navigation, route }) {
  const user = route.params?.user || {}; // safely fallback to empty object

  // Default theme
  const defaultTheme = {
    pageBackground: '#eef2f5',
    headerBackground: '#38b6ff',
    buttonBackground: '#0571d3',
    buttonTextColor: '#fff',
    textColor: '#222',
    postBackground: '#fff',
    profileBorderColor: '#0571d3',
  };

  const theme = { ...defaultTheme, ...(user.theme || {}) };

  const [profilePic, setProfilePic] = useState(user.profilePic || null);
  const [coverPhoto, setCoverPhoto] = useState(user.coverPhoto || null);
  const [bio, setBio] = useState(user.bio || '');
  const [backgroundImage, setBackgroundImage] = useState(user.backgroundImage || null);

  const [pageBackground, setPageBackground] = useState(theme.pageBackground);
  const [headerBackground, setHeaderBackground] = useState(theme.headerBackground);
  const [buttonBackground, setButtonBackground] = useState(theme.buttonBackground);
  const [buttonTextColor, setButtonTextColor] = useState(theme.buttonTextColor);
  const [textColor, setTextColor] = useState(theme.textColor);
  const [postBackground, setPostBackground] = useState(theme.postBackground);
  const [profileBorderColor, setProfileBorderColor] = useState(theme.profileBorderColor);

  const colorOptions = ['#000', '#ff4d4d', '#1e90ff', '#32cd32', '#9b59b6', '#edb51a', '#ffffff', '#eef2f5'];

  const pickImage = async (setter) => {
    try {
      const result = await launchImageLibrary({ mediaType: 'photo', maxWidth: 800, maxHeight: 800, quality: 0.7 });
      if (result?.assets?.length > 0) setter(result.assets[0].uri);
    } catch (err) {
      console.log('Image picker error', err);
    }
  };

  const applyPreset = (preset) => {
    setPageBackground(preset.pageBackground);
    setHeaderBackground(preset.headerBackground);
    setButtonBackground(preset.buttonBackground);
    setButtonTextColor(preset.buttonTextColor);
    setTextColor(preset.textColor);
    setPostBackground(preset.postBackground);
    setProfileBorderColor(preset.profileBorderColor);
  };

  const saveProfile = async () => {
    try {
      const updatedUser = {
        ...user,
        profilePic,
        coverPhoto,
        bio,
        backgroundImage,
        theme: {
          pageBackground: pageBackground || defaultTheme.pageBackground,
          headerBackground: headerBackground || defaultTheme.headerBackground,
          buttonBackground: buttonBackground || defaultTheme.buttonBackground,
          buttonTextColor: buttonTextColor || defaultTheme.buttonTextColor,
          textColor: textColor || defaultTheme.textColor,
          postBackground: postBackground || defaultTheme.postBackground,
          profileBorderColor: profileBorderColor || defaultTheme.profileBorderColor,
        },
      };

      // Save current user
      await AsyncStorage.setItem('currentUser', JSON.stringify(updatedUser));

      // Update users list
      const usersRaw = await AsyncStorage.getItem('users');
      const users = usersRaw ? JSON.parse(usersRaw) : [];
      const idx = users.findIndex((u) => u.id === updatedUser.id);
      if (idx !== -1) users[idx] = updatedUser;
      else users.push(updatedUser);
      await AsyncStorage.setItem('users', JSON.stringify(users));

      navigation.goBack();
    } catch (err) {
      console.log('Save Profile Error:', err);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: pageBackground }}>
      <TouchableOpacity
        style={{ position: 'absolute', top: 40, left: 15, zIndex: 10 }}
        onPress={() => navigation.goBack()}
      >
        <Icon name="arrow-back" size={28} color={textColor} />
      </TouchableOpacity>

      <ScrollView contentContainerStyle={{ paddingTop: 60, paddingBottom: 40, paddingHorizontal: 20 }}>
        <Text style={[styles.title, { color: textColor }]}>Edit Profile</Text>

        <Text style={[styles.label, { color: textColor }]}>Profile Picture</Text>
        <TouchableOpacity onPress={() => pickImage(setProfilePic)}>
          <Image
            source={profilePic ? { uri: profilePic } : require('../assets/placeholder.png')}
            style={[styles.profileImage, { borderColor: profileBorderColor }]}
          />
          <Text style={{ color: textColor }}>Change</Text>
        </TouchableOpacity>

        <Text style={[styles.label, { color: textColor }]}>Cover Photo</Text>
        <TouchableOpacity onPress={() => pickImage(setCoverPhoto)}>
          <Image
            source={coverPhoto ? { uri: coverPhoto } : require('../assets/cover_photo.png')}
            style={styles.coverPhoto}
          />
          <Text style={{ color: textColor }}>Change</Text>
        </TouchableOpacity>

        <Text style={[styles.label, { color: textColor }]}>Bio</Text>
        <TextInput
          value={bio}
          onChangeText={setBio}
          placeholder="Write your bio..."
          style={[styles.bioInput, { borderColor: profileBorderColor, color: textColor }]}
          placeholderTextColor="#666"
        />

        <TouchableOpacity onPress={() => pickImage(setBackgroundImage)} style={styles.themeButton}>
          <Text style={styles.themeButtonText}>Background Image</Text>
          <Icon name="image" size={22} color="#333" />
        </TouchableOpacity>

        <Text style={[styles.sectionTitle, { color: textColor }]}>Custom Theme</Text>
        {[
          ['Page Background', pageBackground, setPageBackground],
          ['Header Background', headerBackground, setHeaderBackground],
          ['Button Background', buttonBackground, setButtonBackground],
          ['Button Text Color', buttonTextColor, setButtonTextColor],
          ['Text Color', textColor, setTextColor],
          ['Post Card Background', postBackground, setPostBackground],
          ['Profile Border Color', profileBorderColor, setProfileBorderColor],
        ].map(([label, value, setter]) => (
          <View key={label}>
            <Text style={[styles.label, { color: textColor }]}>{label}</Text>
            <View style={styles.row}>
              {colorOptions.map((c) => (
                <TouchableOpacity
                  key={c + label}
                  onPress={() => setter(c)}
                  style={[styles.colorCircle, { backgroundColor: c, borderWidth: value === c ? 3 : 1 }]}
                />
              ))}
            </View>
          </View>
        ))}

        <Text style={[styles.sectionTitle, { color: textColor }]}>Theme Presets</Text>
        <View style={styles.row}>
          {Object.keys(themePresets).map((presetName) => {
            const preset = themePresets[presetName];
            return (
              <TouchableOpacity
                key={presetName}
                onPress={() => applyPreset(preset)}
                style={[styles.presetButton, { backgroundColor: preset.buttonBackground }]}
              >
                <Text style={{ color: preset.buttonTextColor, fontWeight: 'bold' }}>
                  {presetName.charAt(0).toUpperCase() + presetName.slice(1)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <TouchableOpacity onPress={saveProfile} style={[styles.saveButton, { backgroundColor: buttonBackground }]}>
          <Text style={{ color: buttonTextColor, fontWeight: 'bold' }}>Save Changes</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 26, fontWeight: 'bold', margin: 20 },
  label: { fontWeight: 'bold', marginTop: 20, marginBottom: 8 },
  profileImage: { width: 100, height: 100, borderRadius: 50, borderWidth: 3 },
  coverPhoto: { width: '100%', height: 150, borderRadius: 10 },
  bioInput: { borderWidth: 2, borderRadius: 6, padding: 10, backgroundColor: '#fff' },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', marginTop: 30 },
  themeButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: '#eee',
    borderRadius: 10,
    marginVertical: 10,
  },
  themeButtonText: { fontWeight: 'bold' },
  saveButton: { padding: 15, marginTop: 30, borderRadius: 12, alignItems: 'center' },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 10 },
  colorCircle: { width: 32, height: 32, borderRadius: 16, borderColor: '#333' },
  presetButton: { padding: 10, borderRadius: 8, margin: 5 },
});