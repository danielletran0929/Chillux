import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  ImageBackground,
  Modal,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/Ionicons';
import { ColorPicker } from 'react-native-color-picker'; // ✅ NEW IMPORT
import { themePresets } from '../styles/editProfileStyles';

export default function EditProfile({ navigation, route }) {
  const user = route.params?.user || {};

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

  // For opening color picker modals
  const [activePicker, setActivePicker] = useState(null);

  const pickImage = async (setter) => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'We need access to your photos to continue.');
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (!result.canceled && result.assets?.length > 0) {
        setter(result.assets[0].uri);
      }
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
          pageBackground,
          headerBackground,
          buttonBackground,
          buttonTextColor,
          textColor,
          postBackground,
          profileBorderColor,
        },
      };

      await AsyncStorage.setItem('currentUser', JSON.stringify(updatedUser));

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
    <ImageBackground
      source={backgroundImage ? { uri: backgroundImage } : null}
      style={{ flex: 1 }}
      resizeMode="cover"
      imageStyle={{ opacity: 0.25 }}
    >
      <View style={{ flex: 1, backgroundColor: pageBackground + 'AA' }}>
        <TouchableOpacity
          style={{ position: 'absolute', top: 40, left: 15, zIndex: 10 }}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={28} color={textColor} />
        </TouchableOpacity>

        <ScrollView
          contentContainerStyle={{ paddingTop: 60, paddingBottom: 40, paddingHorizontal: 20 }}
        >
          <Text style={[styles.title, { color: textColor }]}>Edit Profile</Text>

          {/* Profile Picture */}
          <Text style={[styles.label, { color: textColor }]}>Profile Picture</Text>
          <TouchableOpacity onPress={() => pickImage(setProfilePic)}>
            <Image
              source={profilePic ? { uri: profilePic } : require('../assets/placeholder.png')}
              style={[styles.profileImage, { borderColor: profileBorderColor }]}
            />
            <Text style={{ color: textColor }}>Change</Text>
          </TouchableOpacity>

          {/* Cover Photo */}
          <Text style={[styles.label, { color: textColor }]}>Cover Photo</Text>
          <TouchableOpacity onPress={() => pickImage(setCoverPhoto)}>
            <Image
              source={coverPhoto ? { uri: coverPhoto } : require('../assets/cover_photo.png')}
              style={styles.coverPhoto}
            />
            <Text style={{ color: textColor }}>Change</Text>
          </TouchableOpacity>

          {/* Bio */}
          <Text style={[styles.label, { color: textColor }]}>Bio</Text>
          <TextInput
            value={bio}
            onChangeText={setBio}
            placeholder="Write your bio..."
            style={[styles.bioInput, { borderColor: profileBorderColor, color: textColor }]}
            placeholderTextColor="#666"
          />

          {/* Background Image */}
          <TouchableOpacity onPress={() => pickImage(setBackgroundImage)} style={styles.themeButton}>
            <Text style={styles.themeButtonText}>Background Image</Text>
            <Icon name="image" size={22} color="#333" />
          </TouchableOpacity>

          {/* Theme customization with color pickers */}
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
            <View key={label} style={{ marginVertical: 10 }}>
              <Text style={[styles.label, { color: textColor }]}>{label}</Text>
              <TouchableOpacity
                onPress={() => setActivePicker({ label, setter })}
                style={[
                  styles.colorPreview,
                  { backgroundColor: value, borderColor: '#333' },
                ]}
              />
            </View>
          ))}

          {/* Presets */}
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

          {/* Save Button */}
          <TouchableOpacity
            onPress={saveProfile}
            style={[styles.saveButton, { backgroundColor: buttonBackground }]}
          >
            <Text style={{ color: buttonTextColor, fontWeight: 'bold' }}>Save Changes</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Modal Color Picker */}
        <Modal visible={!!activePicker} animationType="slide" transparent={true}>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>{activePicker?.label}</Text>
              <ColorPicker
                onColorSelected={(color) => {
                  activePicker?.setter(color);
                  setActivePicker(null);
                }}
                style={{ flex: 1 }}
              />
              <TouchableOpacity
                onPress={() => setActivePicker(null)}
                style={styles.closeButton}
              >
                <Text style={{ color: '#fff', fontWeight: 'bold' }}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 26, fontWeight: 'bold', margin: 20 },
  label: { fontWeight: 'bold', marginTop: 10, marginBottom: 6 },
  profileImage: { width: 100, height: 100, borderRadius: 50, borderWidth: 3 },
  coverPhoto: { width: '100%', height: 150, borderRadius: 10 },
  bioInput: { borderWidth: 2, borderRadius: 6, padding: 10, backgroundColor: '#fff' },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', marginTop: 20 },
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
  presetButton: { padding: 10, borderRadius: 8, margin: 5 },
  colorPreview: {
    width: 60,
    height: 30,
    borderWidth: 1,
    borderRadius: 8,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#000000AA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    height: 400,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
  },
  modalTitle: { fontWeight: 'bold', fontSize: 18, marginBottom: 10 },
  closeButton: {
    marginTop: 10,
    backgroundColor: '#333',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
});
