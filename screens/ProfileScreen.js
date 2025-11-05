import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  FlatList,
  Keyboard,
  TouchableWithoutFeedback,
  Alert,
  SafeAreaView,
  StyleSheet,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
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
  const [isEditMode, setIsEditMode] = useState(false);
  const [customEmojis, setCustomEmojis] = useState([]);
  const [emojiOptions, setEmojiOptions] = useState([]);
  const [activeCommentPostId, setActiveCommentPostId] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [hasPendingRequest, setHasPendingRequest] = useState(false); // NEW: pending request state

  const defaultEmojis = ['👍', '😂', '🔥', '❤️', '😮'];
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
        try {
          emojiList.push(String.fromCodePoint(cp));
        } catch {}
      }
    });
    return [...new Set(emojiList)];
  }, []);

  const persistUpdatedPost = async (updatedPost) => {
    try {
      const raw = await AsyncStorage.getItem('posts');
      const allPosts = raw ? JSON.parse(raw) : [];
      const newPosts = allPosts.map((p) =>
        p.id === updatedPost.id ? updatedPost : p
      );
      if (!newPosts.some((p) => p.id === updatedPost.id))
        newPosts.push(updatedPost);
      await AsyncStorage.setItem('posts', JSON.stringify(newPosts));
    } catch (err) {
      console.log('persistUpdatedPost error', err);
    }
  };

  const persistUpdatedUser = async (updatedUser) => {
    try {
      const raw = await AsyncStorage.getItem('users');
      const users = raw ? JSON.parse(raw) : [];
      const newUsers = users.map((u) =>
        u.id === updatedUser.id ? { ...u, ...updatedUser } : u
      );
      if (!newUsers.some((u) => u.id === updatedUser.id))
        newUsers.push(updatedUser);
      await AsyncStorage.setItem('users', JSON.stringify(newUsers));

      const currentRaw = await AsyncStorage.getItem('currentUser');
      const parsedCurrent = currentRaw ? JSON.parse(currentRaw) : null;
      if (parsedCurrent && parsedCurrent.id === updatedUser.id) {
        const sessionCopy = {
          id: updatedUser.id,
          username: updatedUser.username,
          profilePic:
            updatedUser.profilePhoto ?? updatedUser.profilePic ?? null,
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

  // load user data and also check for pending request (request sent by current user to the viewed user)
  useFocusEffect(
    React.useCallback(() => {
      let mounted = true;
      async function loadUserData() {
        try {
          const currentUserRaw = await AsyncStorage.getItem('currentUser');
          const usersRaw = await AsyncStorage.getItem('users');
          const postsRaw = await AsyncStorage.getItem('posts');
          const customEmojisRaw = await AsyncStorage.getItem('customEmojis');

          const parsedCurrent = currentUserRaw
            ? JSON.parse(currentUserRaw)
            : null;
          const allUsers = usersRaw ? JSON.parse(usersRaw) : [];
          const allPosts = postsRaw ? JSON.parse(postsRaw) : [];

          setCurrentUser(parsedCurrent);
          setIsOwnProfile(parsedCurrent?.id === userId);

          const viewedUserFromUsers = allUsers.find((u) => u.id === userId);
          const viewedUser = viewedUserFromUsers
            ? {
                ...viewedUserFromUsers,
                profilePic:
                  viewedUserFromUsers.profilePhoto ??
                  viewedUserFromUsers.profilePic ??
                  null,
                coverPhoto: viewedUserFromUsers.coverPhoto ?? null,
                bio: viewedUserFromUsers.bio ?? '',
                theme: viewedUserFromUsers.theme ?? {},
              }
            : {
                id: userId,
                username: 'Other User',
                profilePic: null,
                coverPhoto: null,
                bio: 'This is their bio',
                theme: {},
              };

          if (!mounted) return;
          setUser(viewedUser);

          const normalized = allPosts
            .filter((p) => p.userId === userId)
            .map((p) => ({
              ...p,
              profilePic: viewedUser.profilePic || p.profilePic || null,
              comments: (p.comments || []).map((c) => {
                const author = allUsers.find((u) => u.id === c.userId);
                return {
                  ...c,
                  profilePic: author
                    ? author.profilePhoto ?? author.profilePic ?? null
                    : c.profilePic ?? null,
                };
              }),
            }));
          setPosts(normalized);

          const picsRaw = await AsyncStorage.getItem(`uploadedPictures-${userId}`);
          setUploadedPictures(picsRaw ? JSON.parse(picsRaw) : []);

          const friendsRaw = await AsyncStorage.getItem(`friends-${userId}`);
          const syncedFriends = await syncFriendsWithLatestProfiles(userId);
          setFriends(syncedFriends);


          const parsedCustom = customEmojisRaw
            ? JSON.parse(customEmojisRaw)
            : [];
          setCustomEmojis(parsedCustom);
          setEmojiOptions([...defaultEmojis, ...parsedCustom]);

          // NEW: check whether currentUser has already sent a friend request to this viewed user
          if (parsedCurrent && parsedCurrent.id) {
            const frRaw = await AsyncStorage.getItem(`friendRequests-${userId}`);
            const frList = frRaw ? JSON.parse(frRaw) : [];
            const alreadySent = frList.some((r) => r.fromId === parsedCurrent.id);
            setHasPendingRequest(Boolean(alreadySent));
          } else {
            setHasPendingRequest(false);
          }
        } catch (err) {
          console.log('loadUserData error', err);
        }
      }

      loadUserData();
      return () => {
        mounted = false;
      };
    }, [userId])
  );

  // NEW: send friend request (adds to friendRequests-<targetId>) instead of immediately adding to friends
  const handleAddFriend = async () => {
    if (!currentUser) return Alert.alert('Not logged in');
    try {
      // Prevent sending requests to self
      if (currentUser.id === user.id) return Alert.alert("You can't friend yourself");

      // Check if already friends
      const targetFriendsRaw = await AsyncStorage.getItem(`friends-${user.id}`);
      const targetFriends = targetFriendsRaw ? JSON.parse(targetFriendsRaw) : [];
      if (targetFriends.some((f) => f.id === currentUser.id)) {
        return Alert.alert('Already friends');
      }

      // Load target's friendRequests list and check duplicates
      const frKey = `friendRequests-${user.id}`;
      const frRaw = await AsyncStorage.getItem(frKey);
      let frList = frRaw ? JSON.parse(frRaw) : [];

      // If there's already a request from this user, do nothing (or show message)
      if (frList.some((r) => r.fromId === currentUser.id)) {
        setHasPendingRequest(true);
        return Alert.alert('Request already sent');
      }

      // Push new request
      const newReq = {
        fromId: currentUser.id,
        fromUsername: currentUser.username,
        fromProfilePic: currentUser.profilePic ?? null,
        time: new Date().toISOString(),
        // optional message could be added
      };
      frList = [newReq, ...frList];
      await AsyncStorage.setItem(frKey, JSON.stringify(frList));

      setHasPendingRequest(true);
      Alert.alert('Friend request sent');
    } catch (err) {
      console.log('handleAddFriend error', err);
      Alert.alert('Error', 'Could not send friend request');
    }
  };

  // This helper can be used if you need to programmatically refresh friends after an accept happens elsewhere
  const refreshFriends = async () => {
    try {
      const syncedFriends = await syncFriendsWithLatestProfiles(userId);
      setFriends(syncedFriends);

    } catch (err) {
      console.log('refreshFriends error', err);
    }
  };

  const handleLike = async (postId, emoji = '👍') => {
    if (!currentUser) return Alert.alert('Not logged in');
    try {
      const updated = posts.map((p) => {
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
    } catch (err) {
      console.log(err);
    }
  };

  const syncFriendsWithLatestProfiles = async (userId) => {
  try {
    const usersRaw = await AsyncStorage.getItem('users');
    const allUsers = usersRaw ? JSON.parse(usersRaw) : [];

    const friendsRaw = await AsyncStorage.getItem(`friends-${userId}`);
    const oldFriends = friendsRaw ? JSON.parse(friendsRaw) : [];

    const updatedFriends = oldFriends.map(f => {
      const latest = allUsers.find(u => u.id === f.id);
      return latest
        ? {
            id: latest.id,
            username: latest.username,
            profilePic: latest.profilePhoto ?? latest.profilePic ?? null,
          }
        : f;
    });

    await AsyncStorage.setItem(`friends-${userId}`, JSON.stringify(updatedFriends));
    return updatedFriends;
  } catch (err) {
    console.log('syncFriendsWithLatestProfiles error', err);
    return [];
  }
};


  const handleAddComment = async (postId, text) => {
    if (!currentUser || !text.trim()) return;
    const updated = posts.map((p) => {
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

  // Upload to Gallery
  const handleUploadToGallery = async () => {
    if (!isOwnProfile) return;
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      return Alert.alert('Permission required', 'You need to allow access to your gallery.');
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled && result.assets?.length > 0) {
      const uri = result.assets[0].uri;
      const updatedGallery = [...uploadedPictures, uri];
      setUploadedPictures(updatedGallery);
      await AsyncStorage.setItem(`uploadedPictures-${user.id}`, JSON.stringify(updatedGallery));
      Alert.alert('Image uploaded to gallery!');
    }
  };

  const handleDeleteFromGallery = async (uriToDelete) => {
    Alert.alert('Delete Image', 'Are you sure you want to delete this photo?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          const updated = uploadedPictures.filter((uri) => uri !== uriToDelete);
          setUploadedPictures(updated);
          await AsyncStorage.setItem(
            `uploadedPictures-${user.id}`,
            JSON.stringify(updated)
          );
        },
      },
    ]);
  };

  if (!user) return null;

  // RENDER START
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: user.theme?.pageBackground ?? '#eef2f5' }}>
      <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
        <FlatList
          data={posts}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <PostCard
              post={item}
              currentUser={currentUser}
              onLike={(postId, emoji) => handleLike(postId, emoji)}
              onComment={(postId, text) => handleAddComment(postId, text)}
              navigation={navigation}
              showCustomThemes={true}
              theme={user.theme || {}}
            />
          )}
          ListHeaderComponent={
            <>
              {/* BACK BUTTON */}
              <TouchableOpacity
                style={{ position: 'absolute', top: 40, left: 15, zIndex: 10 }}
                onPress={() => navigation.goBack()}
              >
                <Icon name="arrow-back" size={28} color={user.theme?.textColor ?? '#fff'} />
              </TouchableOpacity>

              {/* COVER PHOTO */}
              <Image
                source={
                  user.coverPhoto
                    ? { uri: user.coverPhoto }
                    : require('../assets/cover_photo.png')
                }
                style={[styles.coverPhoto, { backgroundColor: user.theme?.headerBackground ?? '#ccc' }]}
              />

              {/* PROFILE HEADER */}
              <View style={styles.profileRow}>
                <View style={{ alignItems: 'center' }}>
                  <TouchableOpacity
                    onPress={() =>
                      isOwnProfile
                        ? navigation.navigate('EditProfile', { user })
                        : navigation.navigate('Profile', { userId: user.id })
                    }
                  >
                    <Image
                      source={
                        user.profilePic
                          ? { uri: user.profilePic }
                          : require('../assets/placeholder.png')
                      }
                      style={[styles.profilePic, { borderColor: user.theme?.profileBorderColor ?? '#fff' }]}
                    />
                  </TouchableOpacity>
                  <Text style={{ marginTop: 8, fontSize: 18, fontWeight: 'bold', color: user.theme?.textColor ?? '#222' }}>
                    {user.username}
                  </Text>
                </View>

                {/* Action button behavior:
                    - If own profile => Edit Profile
                    - Else if already friend => maybe show 'Friends' or message (we check earlier)
                    - Else if pending request (currentUser sent request to this user) => show 'Requested'
                    - Else => show 'Add Friend' which sends a request
                */}
                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: user.theme?.buttonBackground ?? '#0571d3' }]}
                  onPress={() => {
                    if (isOwnProfile) return navigation.navigate('EditProfile', { user });
                    // if already friends, maybe navigate or show message
                    (async () => {
                      try {
                        const targetFriendsRaw = await AsyncStorage.getItem(`friends-${user.id}`);
                        const targetFriends = targetFriendsRaw ? JSON.parse(targetFriendsRaw) : [];
                        if (targetFriends.some((f) => f.id === currentUser?.id)) {
                          Alert.alert('You are already friends');
                          return;
                        }
                        if (hasPendingRequest) {
                          Alert.alert('Request pending', 'You have already sent a friend request to this user.');
                          return;
                        }
                        await handleAddFriend();
                      } catch (e) {
                        console.log(e);
                      }
                    })();
                  }}
                >
                  <Text style={{ color: user.theme?.buttonTextColor ?? '#fff', fontWeight: '600' }}>
                    {isOwnProfile
                      ? 'Edit Profile'
                      : friends.some(f => f.id === currentUser?.id)
                      ? 'Friends ✅'
                      : hasPendingRequest
                      ? 'Requested'
                      : 'Add Friend'}
                  </Text>

                </TouchableOpacity>
              </View>

              {/* BIO */}
              <Text style={[styles.bioText, { color: user.theme?.textColor ?? '#222' }]}>
                {user.bio || 'No bio yet.'}
              </Text>

              {/* FRIENDS & GALLERY */}
              <View style={styles.friendsGalleryRow}>
                {/* FRIENDS SECTION */}
<View style={styles.friendsContainer}>
  <Text
    style={[
      styles.sectionTitle,
      { color: user.theme?.sectionTextColor ?? '#333' },
    ]}
  >
    Friends
  </Text>

  <View style={friendStyles.friendsGrid}>
    {friends.length > 0 ? (
      friends.slice(0, 6).map((f, idx) => (
        <TouchableOpacity
          key={idx}
          style={friendStyles.friendItem}
          onPress={() => navigation.navigate('Profile', { userId: f.id })}
        >
          <Image
            source={
              f.profilePic
                ? { uri: f.profilePic }
                : require('../assets/placeholder.png')
            }
            style={friendStyles.friendImg}
          />
          <Text
            style={[
              friendStyles.friendName,
              { color: user.theme?.textColor ?? '#222' },
            ]}
            numberOfLines={1}
          >
            {f.username || 'User'}
          </Text>
        </TouchableOpacity>
      ))
    ) : (
      <Text
        style={{
          color: user.theme?.textColor ?? '#555',
          fontStyle: 'italic',
          textAlign: 'center',
          width: '100%',
        }}
      >
        No friends yet
      </Text>
    )}
  </View>

  {/* View All Friends button */}
  {friends.length > 6 && (
    <TouchableOpacity
      style={friendStyles.viewAllBtn}
      onPress={() =>
        navigation.navigate('FriendsList', { userId: user.id, friends })
      }
    >
      <Text style={friendStyles.viewAllText}>View All Friends</Text>
    </TouchableOpacity>
  )}
</View>


                {/* GALLERY SECTION */}
                <View style={styles.galleryContainer}>
                  <Text style={[styles.sectionTitle, { color: user.theme?.sectionTextColor ?? '#333' }]}>
                    Gallery
                  </Text>

                  <View style={galleryStyles.galleryGrid}>
                    {uploadedPictures.length > 0 ? (
                      uploadedPictures.slice(0, 6).map((uri, idx) => (
                        <View key={idx} style={galleryStyles.galleryItem}>
                          <TouchableOpacity
                            onPress={() =>
                              !isEditMode &&
                              navigation.navigate('Gallery', {
                                userId: user.id,
                                currentUserId: currentUser?.id,
                              })
                            }
                          >
                            <Image source={{ uri }} style={galleryStyles.img} />
                          </TouchableOpacity>
                          {isOwnProfile && isEditMode && (
                            <TouchableOpacity
                              style={galleryStyles.deleteBtn}
                              onPress={() => handleDeleteFromGallery(uri)}
                            >
                              <Icon name="close-circle" size={22} color="#ff4d4d" />
                            </TouchableOpacity>
                          )}
                        </View>
                      ))
                    ) : (
                      <Text style={{ color: user.theme?.textColor ?? '#555', fontStyle: 'italic' }}>
                        No pictures uploaded
                      </Text>
                    )}
                  </View>

                  {/* 📸 Upload + Edit Buttons */}
                  {isOwnProfile && (
                    <View style={{ alignItems: 'center', marginTop: 10 }}>
                      {!isEditMode && (
                        <TouchableOpacity
                          style={[styles.uploadBtn, {
                            backgroundColor: user.theme?.buttonBackground ?? '#0571d3',
                          }]}
                          onPress={handleUploadToGallery}
                        >
                          <Text style={{ color: user.theme?.buttonTextColor ?? '#fff', fontWeight: '600' }}>
                            Upload to Gallery
                          </Text>
                        </TouchableOpacity>
                      )}
                      <TouchableOpacity
                        style={[styles.editBtn, {
                          backgroundColor: isEditMode ? '#ff9800' : '#444',
                          marginTop: 6,
                        }]}
                        onPress={() => setIsEditMode(!isEditMode)}
                      >
                        <Text style={{ color: '#fff', fontWeight: '600' }}>
                          {isEditMode ? 'Done' : 'Edit Gallery'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}
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
    </SafeAreaView>
  );
}

const galleryStyles = StyleSheet.create({
  galleryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  galleryItem: {
    width: '48%',
    aspectRatio: 1,
    marginBottom: 6,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  img: { width: '100%', height: '100%' },
  deleteBtn: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 50,
  },
});

const friendStyles = StyleSheet.create({
  friendsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start', // ✅ bring them closer instead of spaced out
    marginTop: 6,
    gap: 10, // ✅ small spacing between avatars
  },
  friendItem: {
    width: 65, // ✅ fixed small width instead of %
    alignItems: 'center',
  },
  friendImg: {
    width: 65,
    height: 65,
    borderRadius: 32.5,
    backgroundColor: '#ccc',
    marginBottom: 4,
  },
  friendName: {
    fontSize: 11,
    textAlign: 'center',
    fontWeight: '600',
  },
  viewAllBtn: {
    backgroundColor: '#007bff',
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 14,
    alignSelf: 'center',
    marginTop: 6,
  },
  viewAllText: {
    color: '#fff',
    fontWeight: '600',
  },
});

