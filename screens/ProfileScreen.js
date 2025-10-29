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

  const [user, setUser] = useState(null); // viewed user
  const [currentUser, setCurrentUser] = useState(null); // logged-in session
  const [posts, setPosts] = useState([]); // posts filtered to viewed user
  const [uploadedPictures, setUploadedPictures] = useState([]);
  const [friends, setFriends] = useState([]); // friends for viewed user
  const [isOwnProfile, setIsOwnProfile] = useState(false);

  // Emoji & comment states (used for PostCard callbacks)
  const [customEmojis, setCustomEmojis] = useState([]);
  const [emojiOptions, setEmojiOptions] = useState([]);
  const [activePostId, setActivePostId] = useState(null);
  const [activeCommentPostId, setActiveCommentPostId] = useState(null);
  const [commentText, setCommentText] = useState('');

  const defaultEmojis = ['👍', '😂', '🔥', '❤️', '😮'];

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

  // Helper: update global posts array with a post update
  const persistUpdatedPost = async (updatedPost) => {
    try {
      const raw = await AsyncStorage.getItem('posts');
      const allPosts = raw ? JSON.parse(raw) : [];
      const newPosts = allPosts.map(p => (p.id === updatedPost.id ? updatedPost : p));
      // if updated post not in allPosts (unlikely), append
      if (!newPosts.some(p => p.id === updatedPost.id)) newPosts.push(updatedPost);
      await AsyncStorage.setItem('posts', JSON.stringify(newPosts));
    } catch (err) {
      console.log('persistUpdatedPost error', err);
    }
  };

  // Helper: update a user inside 'users' list (persist)
  const persistUpdatedUser = async (updatedUser) => {
    try {
      const raw = await AsyncStorage.getItem('users');
      const users = raw ? JSON.parse(raw) : [];
      const newUsers = users.map(u => (u.id === updatedUser.id ? { ...u, ...updatedUser } : u));
      if (!newUsers.some(u => u.id === updatedUser.id)) newUsers.push(updatedUser);
      await AsyncStorage.setItem('users', JSON.stringify(newUsers));

      // if currentUser is same user, update currentUser storage
      const currentRaw = await AsyncStorage.getItem('currentUser');
      const parsedCurrent = currentRaw ? JSON.parse(currentRaw) : null;
      if (parsedCurrent && parsedCurrent.id === updatedUser.id) {
        const sessionCopy = {
          id: updatedUser.id,
          username: updatedUser.username,
          profilePhoto: updatedUser.profilePhoto ?? updatedUser.profilePic ?? null,
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

  // load everything for profile when screen focused or userId changes
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

          // set session
          if (parsedCurrent) {
            setCurrentUser(parsedCurrent);
            setIsOwnProfile(parsedCurrent.id === userId);
          } else {
            setCurrentUser(null);
            setIsOwnProfile(false);
          }

          // locate the viewed user from users list (preferred)
          const viewedUserFromUsers = allUsers.find(u => u.id === userId);
          const viewedUser = viewedUserFromUsers
            ? {
                ...viewedUserFromUsers,
                profilePic: viewedUserFromUsers.profilePhoto ?? viewedUserFromUsers.profilePic ?? null,
                coverPhoto: viewedUserFromUsers.coverPhoto ?? null,
                bio: viewedUserFromUsers.bio ?? '',
                theme: viewedUserFromUsers.theme ?? null,
              }
            : // fallback minimal user (keeps backward compatibility)
              {
                id: userId,
                username: 'Other User',
                profilePic: null,
                coverPhoto: null,
                bio: 'This is their bio',
              };

          if (!mounted) return;
          setUser(viewedUser);

          // posts for this user (and normalize profilePic inside them to the latest stored in users)
          const normalized = allPosts
            .filter(p => p.userId === userId)
            .map(p => {
              // prefer viewedUser.profilePic if the post is by viewedUser
              const postCopy = { ...p };
              postCopy.profilePic = viewedUser.profilePic || postCopy.profilePic || null;
              // normalize comment profile pictures with current users list (if we have matching users)
              postCopy.comments = (postCopy.comments || []).map(c => {
                const commentAuthor = allUsers.find(u => u.id === c.userId);
                return {
                  ...c,
                  profilePic: commentAuthor ? (commentAuthor.profilePhoto ?? commentAuthor.profilePic ?? null) : (c.profilePic ?? null),
                };
              });
              return postCopy;
            });
          setPosts(normalized);

          // uploaded pictures stored under 'uploadedPictures-{userId}'
          const picsRaw = await AsyncStorage.getItem(`uploadedPictures-${userId}`);
          setUploadedPictures(picsRaw ? JSON.parse(picsRaw) : []);

          // friends stored per-user under 'friends-{userId}'
          const friendsRaw = await AsyncStorage.getItem(`friends-${userId}`);
          setFriends(friendsRaw ? JSON.parse(friendsRaw) : []);

          // custom emoji options
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

  // Add friend — store under both users' friend lists for a real social feel
  const handleAddFriend = async () => {
    if (!currentUser) {
      Alert.alert('Not logged in');
      return;
    }
    try {
      // the viewed user's friend list key
      const targetKey = `friends-${user.id}`;
      const ownKey = `friends-${currentUser.id}`;

      // update target's friend list (so when visiting them later it'll show)
      const targetRaw = await AsyncStorage.getItem(targetKey);
      let targetList = targetRaw ? JSON.parse(targetRaw) : [];
      if (targetList.some(f => f.id === currentUser.id)) {
        Alert.alert('Already friends');
        return;
      }
      const newTargetList = [...targetList, { id: currentUser.id, profilePic: currentUser.profilePhoto ?? currentUser.profilePic ?? null, username: currentUser.username }];
      await AsyncStorage.setItem(targetKey, JSON.stringify(newTargetList));

      // update current user's friend list
      const ownRaw = await AsyncStorage.getItem(ownKey);
      let ownList = ownRaw ? JSON.parse(ownRaw) : [];
      if (!ownList.some(f => f.id === user.id)) {
        ownList = [...ownList, { id: user.id, profilePic: user.profilePic ?? null, username: user.username }];
        await AsyncStorage.setItem(ownKey, JSON.stringify(ownList));
      }

      // update friends state in UI for the viewed profile
      setFriends(newTargetList);

      Alert.alert('Friend added!');
    } catch (err) {
      console.log('handleAddFriend error', err);
    }
  };

  // Like handler: update local profile posts and persist to global posts array
  const handleLike = async (postId, emoji = '👍') => {
    if (!currentUser) {
      Alert.alert('Not logged in');
      return;
    }
    try {
      // update local list
      const updatedLocal = posts.map(post => {
        if (post.id === postId) {
          const likes = { ...(post.likes || {}) };
          if (likes[currentUser.id]) {
            delete likes[currentUser.id];
          } else {
            likes[currentUser.id] = emoji;
          }
          const updated = { ...post, likes };
          // persist updated to global posts
          persistUpdatedPost(updated);
          return updated;
        }
        return post;
      });
      setPosts(updatedLocal);
    } catch (err) {
      console.log('handleLike error', err);
    }
  };

  // Add comment: update local posts and persist to global posts array
  const handleAddComment = async (postId, text) => {
    if (!currentUser) {
      Alert.alert('Not logged in');
      return;
    }
    if (!text || !text.trim()) return;
    try {
      const updatedLocal = posts.map(post => {
        if (post.id === postId) {
          const newComment = {
            user: currentUser.username,
            userId: currentUser.id,
            text,
            profilePic: currentUser.profilePhoto ?? currentUser.profilePic ?? null,
            time: new Date().toISOString(),
          };
          const updated = { ...post, comments: [...(post.comments || []), newComment] };
          persistUpdatedPost(updated);
          return updated;
        }
        return post;
      });
      setPosts(updatedLocal);
      setCommentText('');
      setActiveCommentPostId(null);
    } catch (err) {
      console.log('handleAddComment error', err);
    }
  };

  // When returning from EditProfile, EditProfile should have saved the updated user into 'users' and into 'currentUser' if it's the session user.
  // We already reload on focus above, so changes will reflect automatically.

  if (!user) return null;

  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      <ScrollView style={styles.pageContainer}>
        {/* BACK BUTTON */}
        <TouchableOpacity
          style={{ position: 'absolute', top: 40, left: 15, zIndex: 10 }}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={28} color="#fff" />
        </TouchableOpacity>

        {/* Cover Photo */}
        <Image
          source={user.coverPhoto ? { uri: user.coverPhoto } : require('../assets/cover_photo.png')}
          style={styles.coverPhoto}
        />

        <View style={styles.profileRow}>
          {/* Profile Pic (navigate to edit if own profile) */}
          <TouchableOpacity onPress={() => {
            if (isOwnProfile) navigation.navigate('EditProfile', { user });
            else navigation.navigate('Profile', { userId: user.id });
          }}>
            <Image
              source={user.profilePic ? { uri: user.profilePic } : require('../assets/placeholder.png')}
              style={styles.profilePic}
            />
          </TouchableOpacity>

          {/* Edit Profile / Add Friend Button */}
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={isOwnProfile ? () => navigation.navigate('EditProfile', { user }) : handleAddFriend}
          >
            <Text style={styles.actionBtnText}>
              {isOwnProfile ? 'Edit Profile' : 'Add Friend'}
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.bioText}>{user.bio || 'No bio yet.'}</Text>

        {/* Friends and Gallery */}
        <View style={styles.friendsGalleryRow}>
          {/* Friends */}
          <View style={styles.friendsContainer}>
            <Text style={styles.sectionTitle}>Friends</Text>
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
                <Text style={{ color: '#555', fontStyle: 'italic' }}>No friends yet</Text>
              )}
              {friends.length > 6 && (
                <TouchableOpacity style={styles.viewAllFriendsBtn}>
                  <Text style={styles.viewAllFriendsText}>View all {friends.length} friends</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Gallery */}
          <View style={styles.galleryContainer}>
            <Text style={styles.sectionTitle}>Gallery</Text>
            <View style={styles.friendsGalleryGrid}>
              {uploadedPictures.length > 0 ? (
                uploadedPictures.slice(0, 6).map((uri, idx) => (
                  <View key={idx} style={styles.galleryItem}>
                    <Image source={{ uri }} style={styles.galleryImg} />
                  </View>
                ))
              ) : (
                <Text style={{ color: '#555', fontStyle: 'italic' }}>No pictures uploaded</Text>
              )}
            </View>
          </View>
        </View>

        {/* Posts */}
        <FlatList
          data={posts}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <PostCard
              post={item}
              currentUser={currentUser}
              onLike={(postId) => handleLike(postId)}
              onComment={(postId, text) => handleAddComment(postId, text)}
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
