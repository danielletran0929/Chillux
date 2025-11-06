// NewsFeed.js
import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Image,
  Modal,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import createStyles from '../styles/newsFeedStyles';

export default function NewsFeed({ navigation, setLoggedIn }) {
  const [posts, setPosts] = useState([]);
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [theme, setTheme] = useState({});
  const [customEmojis, setCustomEmojis] = useState([]);
  const [emojiOptions, setEmojiOptions] = useState([]);
  const [showEmojiPopup, setShowEmojiPopup] = useState(false);
  const [showAddEmojiModal, setShowAddEmojiModal] = useState(false);
  const [activePostId, setActivePostId] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [activeCommentPostId, setActiveCommentPostId] = useState(null);
  const [showCustomThemes, setShowCustomThemes] = useState(true);

  // ---------- NEW: friend request state ----------
  const [friendRequests, setFriendRequests] = useState([]); // array of { fromId, fromUsername, time? }
  const [showRequestsModal, setShowRequestsModal] = useState(false);
  // ------------------------------------------------

  const defaultEmojis = ['👍', '😂', '🔥', '❤️', '😮'];
  const addButton = { add: true };

  const defaultTheme = {
    pageBackground: '#eef2f5',
    headerBackground: '#38b6ff',
    buttonBackground: '#0571d3',
    buttonTextColor: '#fff',
    textColor: '#222',
    postBackground: '#fff',
    profileBorderColor: '#0571d3',
    profileBorderWidth: 2,
  };

  useFocusEffect(
    React.useCallback(() => {
      async function loadTheme() {
        try {
          const savedUser = await AsyncStorage.getItem('currentUser');
            if (savedUser) {
              const parsed = JSON.parse(savedUser);
              const allUsersRaw = await AsyncStorage.getItem('users');
              const allUsers = allUsersRaw ? JSON.parse(allUsersRaw) : [];

              // Find the latest version of this user
              const latestUser = allUsers.find((user) => user.id === parsed.id) || parsed;

              // Update AsyncStorage to ensure future screens use the fresh version
              await AsyncStorage.setItem('currentUser', JSON.stringify(latestUser));

              setTheme(latestUser.theme || {});
              setCurrentUser(latestUser);
            }

        } catch (err) {
          console.log('Load Theme Error:', err);
        }
      }
      loadTheme();
    }, [])
  );

  const mergedTheme = { ...defaultTheme, ...theme };
  const styles = createStyles(mergedTheme);

  const getAvatar = (user) =>
    user?.profilePic ?? user?.profilePhoto ?? user?.profilePhotoUrl ?? user?.avatarUrl ?? null;
  const getUsername = (user) => user?.username ?? user?.name ?? 'User';

  const allEmojis = useMemo(() => {
    const emojiList = [];
    const emojiRanges = [
      [0x1f600, 0x1f64f],
      [0x1f300, 0x1f5ff],
      [0x1f680, 0x1f6ff],
      [0x1f900, 0x1f9ff],
      [0x2700, 0x27bf],
      [0x2600, 0x26ff],
    ];
    for (const [start, end] of emojiRanges) {
      for (let cp = start; cp <= end; cp++) {
        try {
          emojiList.push(String.fromCodePoint(cp));
        } catch {}
      }
    }
    return [...new Set(emojiList)];
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      let cancelled = false;
      async function loadData() {
        try {
          const [postsRaw, usersRaw, customRaw] = await Promise.all([
            AsyncStorage.getItem('posts'),
            AsyncStorage.getItem('users'),
            AsyncStorage.getItem('customEmojis'),
          ]);

          const allUsers = usersRaw ? JSON.parse(usersRaw) : [];
          const parsedPosts = postsRaw ? JSON.parse(postsRaw) : [];

          const normalized = parsedPosts.map((post) => {
            const owner = allUsers.find((user) => user.id === post.userId);
            return {
              ...post,
              user: post.user ?? getUsername(owner),
              profilePic: getAvatar(owner) ?? post.profilePic,
              theme: owner?.theme ?? post.theme ?? defaultTheme,
              comments: (post.comments || []).map((comment) => {
                const commentOwner = allUsers.find((user) => user.id === comment.userId);
                return {
                  ...comment,
                  user: comment.user ?? getUsername(commentOwner),
                  profilePic: getAvatar(commentOwner) ?? comment.profilePic,
                };
              }),
            };
          });

          if (cancelled) return;
          setUsers(allUsers);
          setPosts(normalized);
          const parsedCustom = customRaw ? JSON.parse(customRaw) : [];
          setCustomEmojis(parsedCustom);
          setEmojiOptions([...defaultEmojis, ...parsedCustom]);

          // ---------- NEW: load friend requests for current user ----------
          const currentRaw = await AsyncStorage.getItem('currentUser');
          const currentUserData = currentRaw ? JSON.parse(currentRaw) : null;
          if (currentUserData) {
            const friendRequestsRaw = await AsyncStorage.getItem(`friendRequests-${currentUserData.id}`);
            const friendRequestsList = friendRequestsRaw ? JSON.parse(friendRequestsRaw) : [];

            // Add missing profile pictures using users data
            const enhancedFR = friendRequestsList.map((request) => {
              if (request.profilePic) return request; // already has a profilePic
              const senderUser = allUsers.find((user) => user.id === request.fromId);
              return {
                ...request,
                profilePic: senderUser?.profilePic ?? senderUser?.profilePhoto ?? null,
              };
            });

            setFriendRequests(enhancedFR);

          } else {
            setFriendRequests([]);
          }
          // ---------------------------------------------------------------
        } catch (err) {
          console.log('Load Data Error:', err);
        }
      }
      loadData();
      return () => {
        cancelled = true;
      };
    }, [])
  );

  const deletePost = async (postId) => {
  if (!currentUser || currentUser.role !== 'admin') return;

  Alert.alert(
    'Delete Post',
    'Are you sure you want to delete this post?',
    [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          const updatedPosts = posts.filter(post => post.id !== postId);
          setPosts(updatedPosts);
          await AsyncStorage.setItem('posts', JSON.stringify(updatedPosts));
          Alert.alert('Post deleted');
        },
      },
    ]
  );
};

  const persistPosts = async (updatedPosts) => {
    setPosts(updatedPosts);
    await AsyncStorage.setItem('posts', JSON.stringify(updatedPosts));
  };

  const toggleLike = async (postId, emoji = '👍') => {
    if (!currentUser) return;
    const updated = posts.map((post) => {
      if (post.id === postId) {
        const likes = { ...(post.likes || {}) };
        if (likes[currentUser.id]) delete likes[currentUser.id];
        else likes[currentUser.id] = emoji;
        return { ...post, likes };
      }
      return post;
    });
    await persistPosts(updated);
  };

  const groupedReactions = (likes) => {
    if (!likes) return [];
    const counts = {};
    Object.values(likes).forEach((e) => (counts[e] = (counts[e] || 0) + 1));
    return Object.entries(counts);
  };

  const addComment = async (postId, text) => {
    if (!text.trim() || !currentUser) return;
    const updated = posts.map((post) => {
      if (post.id === postId) {
        const newComment = {
          user: currentUser.username,
          userId: currentUser.id,
          text,
          profilePic: currentUser.profilePic,
          time: new Date().toISOString(),
        };
        return { ...post, comments: [...(post.comments || []), newComment] };
      }
      return post;
    });
    setCommentText('');
    setActiveCommentPostId(null);
    await persistPosts(updated);
  };

  const renderPost = ({ item }) => {
    const postTheme = showCustomThemes ? { ...mergedTheme, ...(item.theme || {}) } : mergedTheme;
    const postStyles = createStyles(postTheme);

    const reactions = groupedReactions(item.likes);
    const userReacted = item.likes?.[currentUser?.id];
    const comments = item.comments || [];
    const showInput = activeCommentPostId === item.id;

    return (
      <View style={postStyles.postCard}>
        {currentUser?.role === 'admin' && (
          <TouchableOpacity
            onPress={() => deletePost(item.id)}
            style={{
              position: 'absolute',
              top: 8,
              right: 8,
              padding: 4,
              zIndex: 10,
            }}
          >
            <Icon name="trash-outline" size={22} color="#e63946" />
          </TouchableOpacity>
        )}

        <View style={postStyles.postHeader}>
          <TouchableOpacity onPress={() => navigation.navigate('Profile', { userId: item.userId })}>
            <Image
              source={item.profilePic ? { uri: item.profilePic } : require('../assets/placeholder.png')}
              style={postStyles.userImgPlaceholder}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={{ marginLeft: 8 }}
            onPress={() => navigation.navigate('Profile', { userId: item.userId })}
          >
            <Text style={postStyles.commentText}>{item.user}</Text>
            <Text style={postStyles.commentText}>{item.time}</Text>
          </TouchableOpacity>
        </View>

        {item.text ? <Text style={postStyles.postText}>{item.text}</Text> : null}

        {/* IMAGE HANDLING */}
{item.images?.length > 0 && (
  item.text?.trim()
    ? (
      // Normal image layout when text exists
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        scrollEnabled={item.images.length > 1}
        style={postStyles.imageContainer}
      >
        {item.images.map((uri, idx) => (
          <Image
            key={idx}
            source={{ uri }}
            style={[
              postStyles.inlinePostImage,
              { borderRadius: 10, marginRight: 8 },
            ]}
          />
        ))}
      </ScrollView>
    )
    : (
      // BIG layout for image-only posts
      <View style={{ width: '100%', marginTop: 6 }}>
        {item.images.map((uri, idx) => (
          <Image
            key={idx}
            source={{ uri }}
            style={{
              width: '100%',
              aspectRatio: 1,
              borderRadius: 14,
              marginBottom: item.images.length > 1 ? 10 : 0,
              resizeMode: 'cover',
            }}
          />
        ))}
      </View>
    )
)}


        <View style={postStyles.actionsRow}>
          <TouchableOpacity
  onPress={() => {
    if (userReacted) {
      toggleLike(item.id);
    } else {
      setActivePostId(item.id);
      setShowEmojiPopup(true);
    }
  }}
>
  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
    <Icon
      name={userReacted ? 'thumbs-up' : 'thumbs-up-outline'}
      size={18}
      color={userReacted ? '#007AFF' : mergedTheme.text}
      style={{ marginRight: 4 }}
    />
    <Text style={postStyles.actionText}>
      {userReacted ? 'Reacted' : 'React'}
    </Text>
  </View>
</TouchableOpacity>


          <TouchableOpacity
            onPress={() => {
              setActiveCommentPostId(showInput ? null : item.id);
              if (!showInput) setCommentText('');
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Icon
                name="chatbubble-outline"
                size={18}
                color={mergedTheme.text}
                style={{ marginRight: 4 }}
              />
              <Text style={postStyles.actionText}>Comment</Text>
            </View>
          </TouchableOpacity>
        </View>

        {reactions.length > 0 && (
          <View style={postStyles.reactionsContainer}>
            {reactions.map(([emoji, count]) => (
              <Text key={emoji} style={postStyles.reactionCount}>
                {emoji} {count}
              </Text>
            ))}
          </View>
        )}

        {comments.length > 0 && (
          <View style={postStyles.commentsContainer}>
            {comments.slice(0, 2).map((comment, i) => (
              <View style={postStyles.commentRow} key={i}>
                <TouchableOpacity onPress={() => navigation.navigate('Profile', { userId: comment.userId })}>
                  <Image
                    source={comment.profilePic ? { uri: comment.profilePic } : require('../assets/placeholder.png')}
                    style={postStyles.profilePic}
                  />
                </TouchableOpacity>
                <View>
                  <TouchableOpacity onPress={() => navigation.navigate('Profile', { userId: comment.userId })}>
                    <Text style={postStyles.commentText}>{comment.user}:</Text>
                  </TouchableOpacity>
                  <Text style={postStyles.commentText}>{comment.text}</Text>
                </View>
              </View>
            ))}

            {comments.length > 2 && (
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate('Comments', {
                    postId: item.id,
                    postOwner: item.user,
                    postTheme: item.theme || mergedTheme,
                  })
                }
              >
                <Text style={postStyles.viewAllCommentsText}>
                  View all {comments.length} comments
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {showInput && (
          <View style={postStyles.commentInputRow}>
            <TextInput
              style={postStyles.commentInput}
              placeholder="Write a comment..."
              value={commentText}
              onChangeText={setCommentText}
            />
            <TouchableOpacity onPress={() => addComment(item.id, commentText)}>
              <Text style={postStyles.commentBtnText}>Post</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  // ---------- NEW: helper functions for friend requests ----------
  const refreshFriendRequests = async (userId) => {
    if (!userId) return setFriendRequests([]);
    try {
      const raw = await AsyncStorage.getItem(`friendRequests-${userId}`);
      const parsed = raw ? JSON.parse(raw) : [];
      setFriendRequests(parsed);
    } catch (err) {
      console.log('refreshFriendRequests error', err);
      setFriendRequests([]);
    }
  };
  const addFriendBothSides = async (userA, userB) => {
  try {
    const friendsKeyA = `friends-${userA.id}`;
    const friendsKeyB = `friends-${userB.id}`;

    const friendsOfAData = await AsyncStorage.getItem(friendsKeyA);
    const friendsOfAList = friendsOfAData ? JSON.parse(friendsOfAData) : [];

    const friendsBRaw = await AsyncStorage.getItem(friendsKeyB);
    const friendsB = friendsBRaw ? JSON.parse(friendsBRaw) : [];

    const entryForA = {
      id: userB.id,
      username: userB.username,
      profilePic: userB.profilePhoto ?? userB.profilePic ?? null,
    };
    const entryForB = {
      id: userA.id,
      username: userA.username,
      profilePic: userA.profilePhoto ?? userA.profilePic ?? null,
    };

    const updatedA = friendsOfAList.some((f) => f.id === userB.id)
      ? friendsOfAList
      : [...friendsOfAList, entryForA];

    const updatedB = friendsB.some((f) => f.id === userA.id)
      ? friendsB
      : [...friendsB, entryForB];

    await AsyncStorage.setItem(friendsKeyA, JSON.stringify(updatedA));
    await AsyncStorage.setItem(friendsKeyB, JSON.stringify(updatedB));
  } catch (err) {
    console.log('addFriendBothSides error', err);
  }
};

  const acceptRequest = async (request) => {
  try {
    const currentUserRaw = await AsyncStorage.getItem('currentUser');
    const storedUser = currentUserRaw ? JSON.parse(currentUserRaw) : null;
    if (!storedUser) return;


    const usersRaw = await AsyncStorage.getItem('users');
    const users = usersRaw ? JSON.parse(usersRaw) : [];

    // senderUser info
    const senderUser = users.find((user) => user.id === request.fromId);
    if (!senderUser) return;

    // get friends list for both
    const currentFriendsRaw = await AsyncStorage.getItem(`friends-${currentUser.id}`);
    const senderFriendsRawData = await AsyncStorage.getItem(`friends-${senderUser.id}`);

    const currentFriends = currentFriendsRaw ? JSON.parse(currentFriendsRaw) : [];
    const senderFriends = senderFriendsRawData ? JSON.parse(senderFriendsRawData) : [];

    // check if they’re already friends
    const alreadyFriends = currentFriends.some((f) => f.id === senderUser.id);
    if (!alreadyFriends) {
  await addFriendBothSides(currentUser, senderUser);
}

  const syncProfileAcrossFriends = async (updatedUser) => {
  try {
    const usersRaw = await AsyncStorage.getItem('users');
    const users = usersRaw ? JSON.parse(usersRaw) : [];

    for (const friend of users) {
      const key = `friends-${friend.id}`;
      const listRaw = await AsyncStorage.getItem(key);
      const list = listRaw ? JSON.parse(listRaw) : [];
      const updatedList = list.map(f =>
        f.id === updatedUser.id
          ? { ...f, profilePic: updatedUser.profilePic, username: updatedUser.username }
          : f
      );
      await AsyncStorage.setItem(key, JSON.stringify(updatedList));
    }
  } catch (err) {
    console.log('syncProfileAcrossFriends error', err);
  }
};


    // remove the request
    const friendRequestsKey = `friendRequests-${currentUser.id}`;
    const reqRaw = await AsyncStorage.getItem(friendRequestsKey);
    const requests = reqRaw ? JSON.parse(reqRaw) : [];
    const updatedRequests = requests.filter((r) => r.fromId !== request.fromId);
    await AsyncStorage.setItem(friendRequestsKey, JSON.stringify(updatedRequests));
    setFriendRequests(updatedRequests);

    Alert.alert('Success', 'Friend request accepted!');
  } catch (err) {
    console.log('acceptRequest error:', err);
    Alert.alert('Error', 'Something went wrong while accepting.');
  }
};


  const declineRequest = async (request) => {
    if (!currentUser) return;
    try {
      const friendRequestsKey = `friendRequests-${currentUser.id}`;
      const friendRequestsRaw = await AsyncStorage.getItem(friendRequestsKey);
      let friendsList = friendRequestsRaw ? JSON.parse(friendRequestsRaw) : [];
      friendsList = friendsList.filter((r) => r.fromId !== request.fromId);
      await AsyncStorage.setItem(friendRequestsKey, JSON.stringify(friendsList));
      setFriendRequests(friendsList);
      Alert.alert('Request declined');
    } catch (err) {
      console.log('declineRequest error', err);
      Alert.alert('Error', 'Could not decline request.');
    }
  };

  // When we open the requests modal ensure we have fresh data
  const openRequests = async () => {
    await refreshFriendRequests(currentUser?.id);
    setShowRequestsModal(true);
  };
  // ---------------------------------------------------------------

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1, backgroundColor: mergedTheme.pageBackground }}
    >
      <LinearGradient
        colors={[mergedTheme.headerBackground, mergedTheme.pageBackground]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.pageContainer}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <Image source={require('../assets/logo.png')} style={styles.logo} />

          {/* ---------- NEW: Bell icon with badge (left of profile) ---------- */}
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity
              onPress={openRequests}
              style={{ marginRight: 12, paddingHorizontal: 6, paddingVertical: 4 }}
            >
              <View>
                <Icon name="notifications-outline" size={26} color={styles.usernameHeader.color} />
                {friendRequests.length > 0 && (
                  <View
                    style={{
                      position: 'absolute',
                      top: -6,
                      right: -6,
                      backgroundColor: '#ff3b30',
                      minWidth: 18,
                      height: 18,
                      borderRadius: 9,
                      justifyContent: 'center',
                      alignItems: 'center',
                      paddingHorizontal: 4,
                    }}
                  >
                    <Text style={{ color: '#fff', fontSize: 12, fontWeight: '700' }}>
                      {friendRequests.length > 99 ? '99+' : String(friendRequests.length)}
                    </Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>

            <View style={styles.headerRight}>
              <TouchableOpacity
                style={styles.userInfoRow}
                onPress={() => navigation.navigate('Profile', { userId: currentUser?.id })}
              >
                <Image
                  source={
                    currentUser?.profilePic
                      ? { uri: currentUser.profilePic }
                      : require('../assets/placeholder.png')
                  }
                  style={styles.headerProfilePic}
                />
                <Text style={styles.commentText}>{currentUser?.username || 'User'}</Text>
              </TouchableOpacity>
            </View>
          </View>
          {/* --------------------------------------------------------------- */}
        </View>

        {/* CREATE POST */}
        <TouchableOpacity
          style={styles.createPostBox}
          onPress={() => navigation.navigate('CreatePost')}
        >
          <TouchableOpacity
            style={styles.userInfoRow}
            onPress={() => navigation.navigate('Profile', { userId: currentUser?.id })}
          >
            <Image
              source={
                currentUser?.profilePic
                  ? { uri: currentUser.profilePic }
                  : require('../assets/placeholder.png')
              }
              style={styles.headerProfilePic}
            />
          </TouchableOpacity>
          <Text style={styles.createPostPlaceholder}>
            What's on your mind, {currentUser?.username || 'User'}?
          </Text>
          <Icon
            name="images-outline"
            size={22}
            color={mergedTheme.textColor}
            style={styles.createPostIcon}
          />
        </TouchableOpacity>

        {/* POSTS */}
        <FlatList
          data={posts}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderPost}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 0 }}
        />

        {/* EMOJI POPUP */}
        <Modal transparent visible={showEmojiPopup} animationType="fade">
          <View style={styles.modalBackdrop} pointerEvents="box-none">
            <TouchableOpacity
              style={styles.modalInner}
              onPress={() => setShowEmojiPopup(false)}
              activeOpacity={1}
            >
              <View style={styles.emojiPopup}>
                {[...emojiOptions, addButton].map((emoji, idx) => (
                  <TouchableOpacity
                    key={idx}
                    onPress={() => {
                      if (emoji.add) {
                        setShowEmojiPopup(false);
                        setShowAddEmojiModal(true);
                      } else {
                        toggleLike(activePostId, emoji);
                        setShowEmojiPopup(false);
                      }
                    }}
                  >
                    <Text style={styles.emojiPopupText}>{emoji.add ? '➕' : emoji}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </TouchableOpacity>
          </View>
        </Modal>

        {/* BIG EMOJI MODAL */}
        <Modal transparent visible={showAddEmojiModal} animationType="slide">
          <View style={styles.modalBackdrop}>
            <View
              style={[
                styles.bigEmojiSheet,
                {
                  maxHeight: '60%',
                  overflow: 'hidden',
                  paddingBottom: Platform.OS === 'android' ? 30 : 20,
                },
              ]}
            >
              <Text style={styles.bigEmojiTitle}>Pick any emoji</Text>
              <ScrollView
                contentContainerStyle={{
                  flexDirection: 'row',
                  flexWrap: 'wrap',
                  justifyContent: 'center',
                }}
              >
                {allEmojis.map((item) => (
                  <TouchableOpacity
                    key={item}
                    onPress={async () => {
                      if (!defaultEmojis.includes(item) && !customEmojis.includes(item)) {
                        const updated = [...customEmojis, item];
                        setCustomEmojis(updated);
                        setEmojiOptions([...defaultEmojis, ...updated]);
                        await AsyncStorage.setItem('customEmojis', JSON.stringify(updated));
                      }
                      await toggleLike(activePostId, item);
                      setShowAddEmojiModal(false);
                    }}
                  >
                    <Text style={styles.bigEmojiText}>{item}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <TouchableOpacity onPress={() => setShowAddEmojiModal(false)}>
                <Text style={{ fontWeight: 'bold' }}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* ---------- NEW: Friend Requests modal ---------- */}
        <Modal visible={showRequestsModal} animationType="slide" transparent>
  <View style={[styles.modalBackdrop, { justifyContent: 'center', padding: 20 }]}>
    <View style={[styles.bigEmojiSheet, { padding: 16 }]}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={[styles.bigEmojiTitle, { marginBottom: 8 }]}>Friend Requests</Text>
        <TouchableOpacity onPress={() => setShowRequestsModal(false)}>
          <Icon name="close" size={24} />
        </TouchableOpacity>
      </View>

      {friendRequests.length === 0 ? (
        <View style={{ paddingVertical: 20, alignItems: 'center' }}>
          <Text>No friend requests</Text>
        </View>
      ) : (
        <ScrollView
  style={{
    width: '100%',
    maxHeight: 350,
  }}
  contentContainerStyle={{
    padding: 10,
  }}
>
  {friendRequests.map((request, idx) => (
    <View
      key={idx}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#f7f7f7',
        borderRadius: 10,
        padding: 10,
        marginBottom: 10, // <-- THIS is what spaces them apart vertically
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
        <Image
          source={
            request.profilePic
              ? { uri: request.profilePic }
              : require('../assets/placeholder.png')
          }
          style={{
            width: 45,
            height: 45,
            borderRadius: 22.5,
            marginRight: 10,
          }}
        />
        <Text style={{ fontWeight: '600', fontSize: 15 }}>{request.fromUsername}</Text>
      </View>

      <View style={{ flexDirection: 'row' }}>
        <TouchableOpacity
          onPress={() => acceptRequest(request)}
          style={{
            backgroundColor: '#28a745',
            paddingVertical: 6,
            paddingHorizontal: 12,
            borderRadius: 6,
            marginRight: 5,
          }}
        >
          <Text style={{ color: 'white', fontWeight: '600' }}>Accept</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => declineRequest(request)}
          style={{
            backgroundColor: '#e63946',
            paddingVertical: 6,
            paddingHorizontal: 12,
            borderRadius: 6,
          }}
        >
          <Text style={{ color: 'white', fontWeight: '600' }}>Decline</Text>
        </TouchableOpacity>
      </View>
    </View>
  ))}
</ScrollView>
      )}
    </View>
  </View>
</Modal>

        {/* ------------------------------------------------- */}
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}
