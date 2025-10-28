import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  FlatList,
  TextInput,
  TouchableWithoutFeedback,
  Keyboard,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import createStyles from '../styles/profileStyles';
import PostCard from '../components/PostCard';
import Icon from 'react-native-vector-icons/Ionicons';

export default function Profile({ navigation, route }) {
  const { userId } = route.params;

  const [user, setUser] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [uploadedPictures, setUploadedPictures] = useState([]);
  const [friends, setFriends] = useState([]);
  const [isOwnProfile, setIsOwnProfile] = useState(false);

  // Emoji & comment states
  const [customEmojis, setCustomEmojis] = useState([]);
  const [emojiOptions, setEmojiOptions] = useState([]);
  const [activePostId, setActivePostId] = useState(null);
  const [activeCommentPostId, setActiveCommentPostId] = useState(null);
  const [commentText, setCommentText] = useState('');

  const defaultEmojis = ['👍', '😂', '🔥', '❤️', '😮'];
  const defaultTheme = {
    pageBackground: '#eef2f5',
    headerBackground: '#38b6ff',
    usernameColor: '#333',
    textColor: '#222',
    postBackground: '#fff',
    commentBackground: '#eee',
    buttonBackground: '#0571d3',
    buttonTextColor: '#fff',
    reactionTextColor: '#0571d3',
    emojiPopupBackground: '#fff',
  };

  const styles = createStyles();

  const allEmojis = useMemo(() => {
    const emojiList = [];
    const ranges = [
      [0x1f600, 0x1f64f],
      [0x1f300, 0x1f5ff],
      [0x1f680, 0x1f6ff],
      [0x1f900, 0x1f9ff],
      [0x2700, 0x27bf],
      [0x2600, 0x26ff],
    ];
    ranges.forEach(([start, end]) => {
      for (let cp = start; cp <= end; cp++) {
        try { emojiList.push(String.fromCodePoint(cp)); } catch {}
      }
    });
    for (let first = 0x1f1e6; first <= 0x1f1ff; first++) {
      for (let second = 0x1f1e6; second <= 0x1f1ff; second++) {
        try { emojiList.push(String.fromCodePoint(first, second)); } catch {}
      }
    }
    return [...new Set(emojiList)];
  }, []);

  useEffect(() => {
    async function loadUserData() {
      const currentUserRaw = await AsyncStorage.getItem('currentUser');
      const postsRaw = await AsyncStorage.getItem('posts');
      const customEmojisRaw = await AsyncStorage.getItem('customEmojis');
      const friendsRaw = await AsyncStorage.getItem('friends');

      if (currentUserRaw) {
        const parsedUser = JSON.parse(currentUserRaw);
        setCurrentUser(parsedUser);
        setIsOwnProfile(parsedUser.id === userId);
      }

      if (currentUserRaw && JSON.parse(currentUserRaw).id === userId) {
        setUser(JSON.parse(currentUserRaw));
      } else {
        setUser({
          id: userId,
          username: 'Other User',
          profilePic: null,
          coverPhoto: null,
          bio: 'This is their bio',
        });
      }

      const initialFriends = friendsRaw ? JSON.parse(friendsRaw) : [
        { id: '1', profilePic: null },
        { id: '2', profilePic: null },
        { id: '3', profilePic: null },
      ];
      setFriends(initialFriends);

      const picsRaw = await AsyncStorage.getItem(`uploadedPictures-${userId}`);
      setUploadedPictures(picsRaw ? JSON.parse(picsRaw) : []);

      const parsedPosts = postsRaw ? JSON.parse(postsRaw) : [];
      setPosts(parsedPosts.filter(p => p.userId === userId));

      const parsedCustom = customEmojisRaw ? JSON.parse(customEmojisRaw) : [];
      setCustomEmojis(parsedCustom);
      setEmojiOptions([...defaultEmojis, ...parsedCustom]);
    }
    loadUserData();
  }, [userId]);

  const pickProfilePic = async () => {
    if (!isOwnProfile) return;
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.7,
      });
      if (!result.canceled) {
        const uri = result.assets[0].uri;
        setUser({ ...user, profilePic: uri });
        if (currentUser.id === user.id) {
          await AsyncStorage.setItem(
            'currentUser',
            JSON.stringify({ ...currentUser, profilePic: uri })
          );
        }
      }
    } catch (e) {
      console.log('Error picking profile pic:', e);
    }
  };

  const handleAddFriend = async () => {
    if (!currentUser) return;
    if (friends.some(f => f.id === user.id)) {
      Alert.alert('Already friends');
      return;
    }
    const updatedFriends = [...friends, { id: user.id, profilePic: user.profilePic || null }];
    setFriends(updatedFriends);
    await AsyncStorage.setItem('friends', JSON.stringify(updatedFriends));
    Alert.alert('Friend added!');
  };

  const handleLike = (postId, emoji = '👍') => {
    const updatedPosts = posts.map(post => {
      if (post.id === postId) {
        const likes = post.likes || {};
        if (likes[currentUser.id]) delete likes[currentUser.id];
        else likes[currentUser.id] = emoji;
        return { ...post, likes };
      }
      return post;
    });
    setPosts(updatedPosts);
    AsyncStorage.setItem('posts', JSON.stringify(updatedPosts));
  };

  const handleAddComment = (postId, text) => {
    if (!text.trim()) return;
    const updatedPosts = posts.map(post => {
      if (post.id === postId) {
        const newComment = {
          user: currentUser.username,
          userId: currentUser.id,
          text,
          profilePic: currentUser.profilePic || null,
        };
        return { ...post, comments: [...(post.comments || []), newComment] };
      }
      return post;
    });
    setPosts(updatedPosts);
    setCommentText('');
    setActiveCommentPostId(null);
    AsyncStorage.setItem('posts', JSON.stringify(updatedPosts));
  };

  if (!user) return null;

  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      <ScrollView style={styles.pageContainer}>
        <Image
          source={user.coverPhoto ? { uri: user.coverPhoto } : require('../assets/cover_photo.png')}
          style={styles.coverPhoto}
        />

        <View style={styles.profileRow}>
          <TouchableOpacity onPress={pickProfilePic}>
            <Image
              source={user.profilePic ? { uri: user.profilePic } : require('../assets/placeholder.png')}
              style={styles.profilePic}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={isOwnProfile ? null : handleAddFriend}
          >
            <Text style={styles.actionBtnText}>
              {isOwnProfile ? 'Edit Theme' : 'Add Friend'}
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.bioText}>{user.bio || 'No bio yet.'}</Text>

        {/* Friends & Gallery stacked */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <Text style={styles.sectionTitle}>Friends</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
              {friends.slice(0, 6).map((f, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={{ width: '48%', margin: '1%' }}
                  onPress={() => navigation.navigate('Profile', { userId: f.id })}
                >
                  <Image
                    source={f.profilePic ? { uri: f.profilePic } : require('../assets/placeholder.png')}
                    style={{ width: '100%', aspectRatio: 1, borderRadius: 8 }}
                  />
                </TouchableOpacity>
              ))}
              {friends.length > 6 && (
                <TouchableOpacity
                  style={{ width: '100%', marginTop: 4 }}
                  onPress={() => navigation.navigate('FriendsList')}
                >
                  <Text style={{ textAlign: 'center', color: '#0571d3' }}>
                    View all {friends.length} friends
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          <View style={{ flex: 1, marginLeft: 8 }}>
            <Text style={styles.sectionTitle}>Gallery</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
              {uploadedPictures.slice(0, 6).map((uri, idx) => (
                <Image
                  key={idx}
                  source={{ uri }}
                  style={{ width: '48%', aspectRatio: 1, margin: '1%', borderRadius: 8 }}
                />
              ))}
            </View>
          </View>
        </View>

        <FlatList
          data={posts}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <PostCard
              post={item}
              currentUser={currentUser}
              onLike={handleLike}
              onComment={handleAddComment}
              navigation={navigation}
              showCustomThemes={true}
            />
          )}
          contentContainerStyle={{ paddingBottom: 80 }}
        />
      </ScrollView>
    </TouchableWithoutFeedback>
  );
}
