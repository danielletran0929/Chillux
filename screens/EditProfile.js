import React, { useState } from 'react';
import { View, Text, TextInput, Image, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/Ionicons';

export default function EditProfile({ navigation, route }) {
  const { user } = route.params;

  const [profilePic, setProfilePic] = useState(user.profilePic);
  const [coverPhoto, setCoverPhoto] = useState(user.coverPhoto);
  const [bio, setBio] = useState(user.bio);
  const [backgroundImage, setBackgroundImage] = useState(user.backgroundImage || null);

  const [borderColor, setBorderColor] = useState(user.theme?.borderColor || '#000');
  const [cardStyle, setCardStyle] = useState(user.theme?.cardStyle || 'rounded');
  const [textColor, setTextColor] = useState(user.theme?.textColor || '#000');

  const [appBackgroundColor, setAppBackgroundColor] = useState(user.theme?.appBackgroundColor || '#eef2f5');
  const [postBackgroundColor, setPostBackgroundColor] = useState(user.theme?.postBackgroundColor || '#ffffff');

  const colorOptions = ['#000', '#ff4d4d', '#1e90ff', '#32cd32', '#9b59b6', '#edb51a', '#ffffff', '#eef2f5'];

  const cardOptions = [
    { key: 'rounded', label: 'Rounded Cards' },
    { key: 'square', label: 'Square Clean' },
    { key: 'shadow', label: 'Shadow Style' }
  ];

  const pickImage = async (setter) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images
    });
    if (!result.canceled) setter(result.assets[0].uri);
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
          borderColor,
          cardStyle,
          textColor,
          appBackgroundColor,
          postBackgroundColor
        }
      };

      await AsyncStorage.setItem('currentUser', JSON.stringify(updatedUser));

      const usersRaw = await AsyncStorage.getItem('users');
      let users = usersRaw ? JSON.parse(usersRaw) : [];

      const idx = users.findIndex(u => u.id === updatedUser.id);
      if (idx !== -1) users[idx] = updatedUser;
      else users.push(updatedUser);

      await AsyncStorage.setItem('users', JSON.stringify(users));
      navigation.goBack();
    } catch (err) {
      console.log('Save Profile Error:', err);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ paddingTop: 60, paddingBottom: 40 }}>
        <Text style={styles.title}>Edit Profile</Text>

        {/* Profile Picture */}
        <Text style={styles.label}>Profile Picture</Text>
        <TouchableOpacity onPress={() => pickImage(setProfilePic)}>
          <Image
            source={profilePic ? { uri: profilePic } : require('../assets/placeholder.png')}
            style={[styles.profileImage, { borderColor }]}
          />
          <Text style={{ color: textColor }}>Change</Text>
        </TouchableOpacity>

        {/* Cover Photo */}
        <Text style={styles.label}>Cover Photo</Text>
        <TouchableOpacity onPress={() => pickImage(setCoverPhoto)}>
          <Image
            source={coverPhoto ? { uri: coverPhoto } : require('../assets/cover_photo.png')}
            style={styles.coverPhoto}
          />
          <Text style={{ color: textColor }}>Change</Text>
        </TouchableOpacity>

        {/* Bio */}
        <Text style={styles.label}>Bio</Text>
        <TextInput
          value={bio}
          onChangeText={setBio}
          placeholder="Write your bio..."
          style={[styles.bioInput, { borderColor, color: textColor }]}
          placeholderTextColor="#666"
        />

        {/* Background Image */}
        <TouchableOpacity
          onPress={() => pickImage(setBackgroundImage)}
          style={styles.themeButton}
        >
          <Text style={styles.themeButtonText}>Background Image</Text>
          <Icon name="image" size={22} color="#333" />
        </TouchableOpacity>


        {/* THEME SETTINGS */}
        <Text style={styles.sectionTitle}>Custom Theme</Text>

        {/* Border Color */}
        <Text style={styles.label}>Border Color</Text>
        <View style={styles.row}>
          {colorOptions.map((c) => (
            <TouchableOpacity
              key={c + 'b'}
              onPress={() => setBorderColor(c)}
              style={[
                styles.colorCircle,
                { backgroundColor: c, borderWidth: borderColor === c ? 3 : 1 }
              ]}
            />
          ))}
        </View>

        {/* Text Color */}
        <Text style={styles.label}>Text Color</Text>
        <View style={styles.row}>
          {colorOptions.map((c) => (
            <TouchableOpacity
              key={c + 't'}
              onPress={() => setTextColor(c)}
              style={[
                styles.colorCircle,
                { backgroundColor: c, borderWidth: textColor === c ? 3 : 1 }
              ]}
            />
          ))}
        </View>

        {/* App Background */}
        <Text style={styles.label}>App Background Color</Text>
        <View style={styles.row}>
          {colorOptions.map((c) => (
            <TouchableOpacity
              key={c + 'a'}
              onPress={() => setAppBackgroundColor(c)}
              style={[
                styles.colorCircle,
                { backgroundColor: c, borderWidth: appBackgroundColor === c ? 3 : 1 }
              ]}
            />
          ))}
        </View>

        {/* Post Background */}
        <Text style={styles.label}>Post Card Background</Text>
        <View style={styles.row}>
          {colorOptions.map((c) => (
            <TouchableOpacity
              key={c + 'p'}
              onPress={() => setPostBackgroundColor(c)}
              style={[
                styles.colorCircle,
                { backgroundColor: c, borderWidth: postBackgroundColor === c ? 3 : 1 }
              ]}
            />
          ))}
        </View>

        {/* Card Style */}
        <Text style={styles.label}>Card Style</Text>
        {cardOptions.map((option) => (
          <TouchableOpacity
            key={option.key}
            onPress={() => setCardStyle(option.key)}
            style={[
              styles.cardOption,
              cardStyle === option.key && styles.cardOptionActive
            ]}
          >
            <Text style={{ fontWeight: 'bold' }}>{option.label}</Text>
          </TouchableOpacity>
        ))}

        {/* Save */}
        <TouchableOpacity onPress={saveProfile} style={styles.saveButton}>
          <Text style={{ color: '#fff', fontWeight: 'bold' }}>Save Changes</Text>
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
  themeButton: { flexDirection: 'row', justifyContent: 'space-between', padding: 12, backgroundColor: '#eee', borderRadius: 10, marginVertical: 10 },
  themeButtonText: { fontWeight: 'bold' },
  saveButton: { backgroundColor: '#0571d3', padding: 15, marginTop: 30, borderRadius: 12, alignItems: 'center' },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 10 },
  colorCircle: { width: 32, height: 32, borderRadius: 16, borderColor: '#333' },
  cardOption: { padding: 12, backgroundColor: '#eee', borderRadius: 8, marginTop: 10 },
  cardOptionActive: { backgroundColor: '#cce0ff', borderColor: '#0055cc', borderWidth: 2 }
});
