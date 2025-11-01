// Profile.js
import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Keyboard,
  TouchableWithoutFeedback,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
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

  const [customEmojis, setCustomEmojis] = useState([]);
  const [emojiOptions, setEmojiOptions] = useState([]);
  const [activeCommentPostId, setActiveCommentPostId] = useState(null);
  const [commentText, setCommentText] = useState('');

  const defaultEmojis = ['👍', '😂', '🔥', '❤️', '😮'];

  // Styles depend on viewed user's theme
  const styles = createStyles(user?.theme || {});

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

  const persistUpdatedPost = async (updatedPost) => {
    try {
      const raw = await AsyncStorage.getItem('posts');
      const allPosts = raw ? JSON.parse(raw) : [];
      const newPosts = allPosts.map(p => p.id === updatedPost.id ? updatedPost : p);
      if (!newPosts.some(p => p.id === updatedPost.id)) newPosts.push(updatedPost);
      await AsyncStorage.setItem('posts', JSON.stringify(newPosts));
    } catch (err) {
      console.log('persistUpdatedPost error', err);
    }
  };

  const persistUpdatedUser = async (updatedUser) => {
    try {
      const raw = await AsyncStorage.getItem('users');
      const users = raw ? JSON.parse(raw) : [];
      const newUsers = users.map(u => u.id === updatedUser.id ? { ...u, ...updatedUser } : u);
      if (!newUsers.some(u => u.id === updatedUser.id)) newUsers.push(updatedUser);
      await AsyncStorage.setItem('users', JSON.stringify(newUsers));

      const currentRaw = await AsyncStorage.getItem('currentUser');
      const parsedCurrent = currentRaw ? JSON.parse(currentRaw) : null;
      if (parsedCurrent && parsedCurrent.id === updatedUser.id) {
        const sessionCopy = {
          id: updatedUser.id,
          username: updatedUser.username,
          profilePic: updatedUser.profilePhoto ?? updatedUser.profilePic ?? null,
          coverPhoto: updatedUser.coverPhoto ?? null,
          theme: updatedUser.theme ?? null,
        };
        await AsyncStorage.setItem('currentUser', JSON.stringify(sessionCopy));
        setCurrentUser(sessionCopy);
      }
    } catch (err) {
      console.log('persistUpdatedUser error', err);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      let mounted = true;
      async function loadUserData() {
        try {
          const currentUserRaw = await AsyncStorage.getItem('currentUser');
          const usersRaw = await AsyncStorage.getItem('users');
          const postsRaw = await AsyncStorage.getItem('posts');
          const customEmojisRaw = await AsyncStorage.getItem('customEmojis');

          const parsedCurrent = currentUserRaw ? JSON.parse(currentUserRaw) : null;
          const allUsers = usersRaw ? JSON.parse(usersRaw) : [];
          const allPosts = postsRaw ? JSON.parse(postsRaw) : [];

          setCurrentUser(parsedCurrent);
          setIsOwnProfile(parsedCurrent?.id === userId);

          const viewedUserFromUsers = allUsers.find(u => u.id === userId);
          const viewedUser = viewedUserFromUsers ? {
            ...viewedUserFromUsers,
            profilePic: viewedUserFromUsers.profilePhoto ?? viewedUserFromUsers.profilePic ?? null,
            coverPhoto: viewedUserFromUsers.coverPhoto ?? null,
            bio: viewedUserFromUsers.bio ?? '',
            theme: viewedUserFromUsers.theme ?? null,
          } : {
            id: userId,
            username: 'Other User',
            profilePic: null,
            coverPhoto: null,
            bio: 'This is their bio',
          };

          if (!mounted) return;
          setUser(viewedUser);

          const normalized = allPosts
            .filter(p => p.userId === userId)
            .map(p => ({
              ...p,
              profilePic: viewedUser.profilePic || p.profilePic || null,
              comments: (p.comments || []).map(c => {
                const author = allUsers.find(u => u.id === c.userId);
                return {
                  ...c,
                  profilePic: author ? author.profilePhoto ?? author.profilePic ?? null : c.profilePic ?? null,
                };
              }),
            }));
          setPosts(normalized);

          const picsRaw = await AsyncStorage.getItem(`uploadedPictures-${userId}`);
          setUploadedPictures(picsRaw ? JSON.parse(picsRaw) : []);

          const friendsRaw = await AsyncStorage.getItem(`friends-${userId}`);
          setFriends(friendsRaw ? JSON.parse(friendsRaw) : []);

          const parsedCustom = customEmojisRaw ? JSON.parse(customEmojisRaw) : [];
          setCustomEmojis(parsedCustom);
          setEmojiOptions([...defaultEmojis, ...parsedCustom]);
        } catch (err) {
          console.log('loadUserData error', err);
        }
      }

      loadUserData();
      return () => { mounted = false; };
    }, [userId])
  );

  const handleAddFriend = async () => {
    if (!currentUser) return Alert.alert('Not logged in');
    try {
      const targetKey = `friends-${user.id}`;
      const ownKey = `friends-${currentUser.id}`;

      const targetRaw = await AsyncStorage.getItem(targetKey);
      let targetList = targetRaw ? JSON.parse(targetRaw) : [];
      if (targetList.some(f => f.id === currentUser.id)) return Alert.alert('Already friends');
      const newTargetList = [...targetList, { id: currentUser.id, profilePic: currentUser.profilePic, username: currentUser.username }];
      await AsyncStorage.setItem(targetKey, JSON.stringify(newTargetList));

      const ownRaw = await AsyncStorage.getItem(ownKey);
      let ownList = ownRaw ? JSON.parse(ownRaw) : [];
      if (!ownList.some(f => f.id === user.id)) {
        ownList = [...ownList, { id: user.id, profilePic: user.profilePic, username: user.username }];
        await AsyncStorage.setItem(ownKey, JSON.stringify(ownList));
      }

      setFriends(newTargetList);
      Alert.alert('Friend added!');
    } catch (err) {
      console.log('handleAddFriend error', err);
    }
  };

  const handleLike = async (postId, emoji = '👍') => {
    if (!currentUser) return Alert.alert('Not logged in');
    try {
      const updated = posts.map(p => {
        if (p.id === postId) {
          const likes = { ...(p.likes || {}) };
          if (likes[currentUser.id]) delete likes[currentUser.id];
          else likes[currentUser.id] = emoji;
          const updatedPost = { ...p, likes };
          persistUpdatedPost(updatedPost);
          return updatedPost;
        }
        return p;
      });
      setPosts(updated);
    } catch (err) { console.log(err); }
  };

  const handleAddComment = async (postId, text) => {
    if (!currentUser || !text.trim()) return;
    const updated = posts.map(p => {
      if (p.id === postId) {
        const newComment = {
          user: currentUser.username,
          userId: currentUser.id,
          text,
          profilePic: currentUser.profilePic ?? null,
          time: new Date().toISOString(),
        };
        const updatedPost = { ...p, comments: [...(p.comments || []), newComment] };
        persistUpdatedPost(updatedPost);
        return updatedPost;
      }
      return p;
    });
    setPosts(updated);
    setCommentText('');
    setActiveCommentPostId(null);
  };

  if (!user) return null;

 return (
  <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
    <FlatList
      data={posts}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => {
        const postTheme = { ...(user?.theme || {}), ...(item?.theme || {}) };
        return (
          <PostCard
            post={item}
            currentUser={currentUser}
            onLike={(postId, emoji) => handleLike(postId, emoji)}
            onComment={(postId, text) => handleAddComment(postId, text)}
            navigation={navigation}
            showCustomThemes={true}
            theme={postTheme}
          />
        );
      }}
      ListHeaderComponent={
        <>
          <TouchableOpacity
            style={{ position: 'absolute', top: 40, left: 15, zIndex: 10 }}
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-back" size={28} color={user.theme?.textColor ?? '#fff'} />
          </TouchableOpacity>

          <Image
            source={user.coverPhoto ? { uri: user.coverPhoto } : require('../assets/cover_photo.png')}
            style={styles.coverPhoto}
          />

          <View style={styles.profileRow}>
            <View style={{ alignItems: 'center' }}>
              <TouchableOpacity
  onPress={() => {
    if (isOwnProfile) {
      if (user && Object.keys(user).length > 0) {
        navigation.navigate('EditProfile', { user });
      } else {
        Alert.alert('Please wait', 'User data is still loading.');
      }
    } else {
      if (user?.id) {
        navigation.navigate('Profile', { userId: user.id });
      } else {
        Alert.alert('Error', 'User information is missing.');
      }
    }
  }}
>

                <Image
                  source={user.profilePic ? { uri: user.profilePic } : require('../assets/placeholder.png')}
                  style={[styles.profilePic, { borderColor: user.theme?.profileBorderColor ?? '#fff' }]}
                />
              </TouchableOpacity>
              <Text
                style={{
                  marginTop: 8,
                  fontSize: 18,
                  fontWeight: 'bold',
                  color: user.theme?.textColor ?? '#222',
                }}
              >
                {user.username}
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: user.theme?.buttonBackground ?? '#0571d3' }]}
              onPress={isOwnProfile ? () => navigation.navigate('EditProfile', { user }) : handleAddFriend}
            >
              <Text
                style={[styles.actionBtnText, { color: user.theme?.buttonTextColor ?? '#fff' }]}
              >
                {isOwnProfile ? 'Edit Profile' : 'Add Friend'}
              </Text>
            </TouchableOpacity>
          </View>

          <Text
            style={[styles.bioText, { color: user.theme?.textColor ?? '#222' }]}
          >
            {user.bio || 'No bio yet.'}
          </Text>

          {/* Friends & Gallery */}
          <View style={styles.friendsGalleryRow}>
            <View style={styles.friendsContainer}>
              <Text
                style={[styles.sectionTitle, { color: user.theme?.sectionTextColor ?? '#333' }]}
              >
                Friends
              </Text>
              <View style={styles.friendsGalleryGrid}>
                {friends.length > 0 ? (
                  friends.slice(0, 6).map((f, idx) => (
                    <TouchableOpacity
                      key={idx}
                      style={styles.friendItem}
                      onPress={() => navigation.navigate('Profile', { userId: f.id })}
                    >
                      <Image
                        source={f.profilePic ? { uri: f.profilePic } : require('../assets/placeholder.png')}
                        style={styles.friendImg}
                      />
                    </TouchableOpacity>
                  ))
                ) : (
                  <Text style={{ color: '#555', fontStyle: 'italic' }}>
                    No friends yet
                  </Text>
                )}
                {friends.length > 6 && (
                  <TouchableOpacity style={styles.viewAllFriendsBtn}>
                    <Text
                      style={[
                        styles.viewAllFriendsText,
                        { color: user.theme?.buttonBackground ?? '#0571d3' },
                      ]}
                    >
                      View all {friends.length} friends
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>

            <View style={styles.galleryContainer}>
              <Text
                style={[styles.sectionTitle, { color: user.theme?.sectionTextColor ?? '#333' }]}
              >
                Gallery
              </Text>
              <View style={styles.friendsGalleryGrid}>
                {uploadedPictures.length > 0 ? (
                  uploadedPictures.slice(0, 6).map((uri, idx) => (
                    <View key={idx} style={styles.galleryItem}>
                      <Image source={{ uri }} style={styles.galleryImg} />
                    </View>
                  ))
                ) : (
                  <Text style={{ color: '#555', fontStyle: 'italic' }}>
                    No pictures uploaded
                  </Text>
                )}
              </View>
            </View>
          </View>
        </>
      }
      contentContainerStyle={{
        paddingBottom: 100,
        backgroundColor: user.theme?.pageBackground ?? '#eef2f5',
      }}
    />
  </TouchableWithoutFeedback>
);
}