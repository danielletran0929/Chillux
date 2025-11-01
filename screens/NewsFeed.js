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
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'react-native-linear-gradient';
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
            setTheme(parsed.theme || {});
            setCurrentUser(parsed);
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

  const getAvatar = (u) =>
    u?.profilePic ?? u?.profilePhoto ?? u?.profilePhotoUrl ?? u?.avatarUrl ?? null;
  const getUsername = (u) => u?.username ?? u?.name ?? 'User';

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

          const parsedUsers = usersRaw ? JSON.parse(usersRaw) : [];
          const parsedPosts = postsRaw ? JSON.parse(postsRaw) : [];

          const normalized = parsedPosts.map((post) => {
            const owner = parsedUsers.find((u) => u.id === post.userId);
            return {
              ...post,
              user: post.user ?? getUsername(owner),
              profilePic: getAvatar(owner) ?? post.profilePic,
              theme: owner?.theme ?? post.theme ?? defaultTheme,
              comments: (post.comments || []).map((c) => {
                const commentOwner = parsedUsers.find((u) => u.id === c.userId);
                return {
                  ...c,
                  user: c.user ?? getUsername(commentOwner),
                  profilePic: getAvatar(commentOwner) ?? c.profilePic,
                };
              }),
            };
          });

          if (cancelled) return;
          setUsers(parsedUsers);
          setPosts(normalized);
          const parsedCustom = customRaw ? JSON.parse(customRaw) : [];
          setCustomEmojis(parsedCustom);
          setEmojiOptions([...defaultEmojis, ...parsedCustom]);
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

        {item.images?.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            scrollEnabled={item.images.length > 1}
            style={postStyles.imageContainer}
          >
            {item.images.map((uri, idx) => (
              <Image key={idx} source={{ uri }} style={postStyles.inlinePostImage} />
            ))}
          </ScrollView>
        )}

        <View style={postStyles.actionsRow}>
          <TouchableOpacity
            onPress={() => toggleLike(item.id)}
            onLongPress={() => {
              setActivePostId(item.id);
              setShowEmojiPopup(true);
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
                {userReacted ? 'Unlike' : 'Like'}
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
            {comments.slice(0, 2).map((c, i) => (
              <View style={postStyles.commentRow} key={i}>
                <TouchableOpacity onPress={() => navigation.navigate('Profile', { userId: c.userId })}>
                  <Image
                    source={c.profilePic ? { uri: c.profilePic } : require('../assets/placeholder.png')}
                    style={postStyles.profilePic}
                  />
                </TouchableOpacity>
                <View>
                  <TouchableOpacity onPress={() => navigation.navigate('Profile', { userId: c.userId })}>
                    <Text style={postStyles.commentText}>{c.user}:</Text>
                  </TouchableOpacity>
                  <Text style={postStyles.commentText}>{c.text}</Text>
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
            <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
              <Icon name="settings-outline" size={28} color={styles.usernameHeader.color} />
            </TouchableOpacity>
          </View>
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
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}
