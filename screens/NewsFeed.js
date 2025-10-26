import React, { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, Image, TextInput } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import styles from '../styles/newsFeedStyles';

export default function NewsFeed({ navigation, setLoggedIn }) {
  const [text, setText] = useState('');
  const [posts, setPosts] = useState([
    {
      id: '1',
      user: 'John Doe',
      time: '2h ago',
      text: 'This is my first post!',
    }
  ]);
  const [username, setUsername] = useState('');

  useFocusEffect(
    React.useCallback(() => {
      async function loadUser() {
        const savedUser = await AsyncStorage.getItem('userData');
        if (savedUser) {
          const { username } = JSON.parse(savedUser);
          setUsername(username);
        }
      }
      loadUser();
    }, [])
  );

  const handleLogout = async () => {
  await AsyncStorage.removeItem('isLoggedIn');
  setLoggedIn(false);
};



  const handlePost = () => {
    if (!text.trim()) return;

    const newPost = {
      id: Date.now().toString(),
      user: username,
      time: 'Just now',
      text,
    };

    setPosts([newPost, ...posts]);
    setText('');
  };

  const renderPost = ({ item }) => (
    <View style={styles.postCard}>
      <View style={styles.postHeader}>
        <View style={styles.userImg} />
        <View style={styles.headerText}>
          <Text style={styles.username}>{item.user}</Text>
          <Text style={styles.time}>{item.time}</Text>
        </View>
      </View>

      <Text style={styles.postText}>{item.text}</Text>

      <View style={styles.postImage} />

      <View style={styles.actionsRow}>
        <Text style={styles.actionText}>Like</Text>
        <Text style={styles.actionText}>Comment</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.pageContainer}>
      
      {/* HEADER */}
      <View style={styles.header}>
        <Image 
          source={require('../assets/logo.png')} 
          style={styles.logo} 
        />

        <View style={styles.headerRight}>
          <Text style={styles.usernameHeader}>{username}</Text>
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <Text style={styles.logoutText}>Log Out</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* CREATE POST */}
      <View style={styles.newPost}>
        <TextInput
          style={styles.postInput}
          placeholder="What's on your mind?"
          value={text}
          onChangeText={setText}
        />

        <View style={styles.quickActions}>
          <View style={styles.circleBtn} />
          <View style={styles.circleBtn} />

          <TouchableOpacity style={styles.postButton} onPress={handlePost}>
            <Text style={styles.postBtnText}>Post</Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={posts}
        keyExtractor={item => item.id}
        renderItem={renderPost}
        contentContainerStyle={{ paddingBottom: 60 }}
      />
    </View>
  );
}
