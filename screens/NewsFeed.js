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
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import createStyles from '../styles/newsFeedStyles';

export default function NewsFeed({ navigation, setLoggedIn }) {
  const [posts, setPosts] = useState([]);
  const [users, setUsers] = useState([]); // canonical users list
  const [currentUser, setCurrentUser] = useState(null);
  const [customEmojis, setCustomEmojis] = useState([]);
  const [emojiOptions, setEmojiOptions] = useState([]);
  const [showEmojiPopup, setShowEmojiPopup] = useState(false);
  const [activePostId, setActivePostId] = useState(null);
  const [showAddEmojiModal, setShowAddEmojiModal] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [activeCommentPostId, setActiveCommentPostId] = useState(null);
  const [showCustomThemes, setShowCustomThemes] = useState(true);

  const defaultEmojis = ['👍', '😂', '🔥', '❤️', '😮'];
  const addButton = { add: true };

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

  // helper to extract avatar from various possible user property names
  const getAvatar = (u) =>
    u?.profilePic ?? u?.profilePhoto ?? u?.profilePhotoUrl ?? u?.avatarUrl ?? null;

  // helper to extract username field consistently
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

  // normalize posts + comments to use canonical users list
  useFocusEffect(
    React.useCallback(() => {
      let cancelled = false;
      async function loadAll() {
        try {
          const [userDataRaw, postsRaw, usersRaw, customEmojisRaw] = await Promise.all([
            AsyncStorage.getItem('currentUser'),
            AsyncStorage.getItem('posts'),
            AsyncStorage.getItem('users'),
            AsyncStorage.getItem('customEmojis'),
          ]);

          const parsedUsers = usersRaw ? JSON.parse(usersRaw) : [];
          setUsers(parsedUsers);

          // Resolve session currentUser: prefer currentUser stored, but if it's only id,
          // try to find full record in users list.
          const sess = userDataRaw ? JSON.parse(userDataRaw) : null;
          let resolvedSession = sess;
          if (sess && sess.id && (!sess.username || !getAvatar(sess))) {
            const found = parsedUsers.find((u) => u.id === sess.id);
            if (found) {
              // build a lightweight session object but keep canonical fields
              resolvedSession = {
                id: found.id,
                username: getUsername(found),
                profilePic: getAvatar(found),
                // keep other session props if needed
                ...sess,
              };
            }
          } else if (sess) {
            // ensure canonical names
            resolvedSession = {
              ...sess,
              username: sess.username ?? getUsername(parsedUsers.find(u => u.id === sess.id) ?? {}),
              profilePic: sess.profilePic ?? getAvatar(parsedUsers.find(u => u.id === sess.id) ?? {}),
            };
          }
          setCurrentUser(resolvedSession);

          const parsedPosts = postsRaw ? JSON.parse(postsRaw) : [];

          // normalize: ensure each post and its comments use canonical username & avatar when available
          const normalized = parsedPosts.map((post) => {
            const owner = parsedUsers.find((u) => u.id === post.userId);
            const normalizedPost = {
              ...post,
              user: post.user ?? getUsername(owner) ?? 'User',
              profilePic: getAvatar(owner) ?? post.profilePic ?? null,
              theme: post.theme ?? defaultTheme,
              comments: (post.comments || []).map((c) => {
                const commentOwner = parsedUsers.find((u) => u.id === c.userId);
                return {
                  ...c,
                  user: c.user ?? getUsername(commentOwner) ?? 'User',
                  profilePic: getAvatar(commentOwner) ?? c.profilePic ?? null,
                };
              }),
            };
            return normalizedPost;
          });

          if (cancelled) return;
          setPosts(normalized);

          // Persist normalized posts back so next loads are consistent
          await AsyncStorage.setItem('posts', JSON.stringify(normalized));

          const parsedCustom = customEmojisRaw ? JSON.parse(customEmojisRaw) : [];
          setCustomEmojis(parsedCustom);
          setEmojiOptions([...defaultEmojis, ...parsedCustom]);
        } catch (err) {
          console.log('NewsFeed loadAll error', err);
        }
      }
      loadAll();
      return () => {
        cancelled = true;
      };
    }, [])
  );

  const handleLogout = async () => {
    await AsyncStorage.removeItem('isLoggedIn');
    if (currentUser) await AsyncStorage.setItem('lastLoggedInUser', JSON.stringify(currentUser.id));
    if (setLoggedIn) setLoggedIn(false);
    // navigate back to Login and reset nav so user can't go back
    navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
  };

  const persistPosts = async (updatedPosts) => {
    setPosts(updatedPosts);
    try {
      await AsyncStorage.setItem('posts', JSON.stringify(updatedPosts));
    } catch (err) {
      console.log('persistPosts error', err);
    }
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

  const saveCustomEmoji = async (emoji) => {
    if (!emoji || defaultEmojis.includes(emoji) || customEmojis.includes(emoji)) return;
    const updated = [...customEmojis, emoji];
    setCustomEmojis(updated);
    setEmojiOptions([...defaultEmojis, ...updated]);
    await AsyncStorage.setItem('customEmojis', JSON.stringify(updated));
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
          user: currentUser.username ?? getUsername(users.find(u => u.id === currentUser.id) ?? {}),
          userId: currentUser.id,
          text,
          profilePic: currentUser.profilePic ?? getAvatar(users.find(u => u.id === currentUser.id) ?? {}),
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
    const postTheme = showCustomThemes ? item.theme || defaultTheme : defaultTheme;
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
            onPress={() => navigation.navigate('Profile', { userId: item.userId })}>
            <Text style={postStyles.username}>{item.user}</Text>
            <Text style={postStyles.time}>{item.time}</Text>
          </TouchableOpacity>
        </View>

        {item.text ? <Text style={postStyles.postText}>{item.text}</Text> : null}

        {item.images?.length > 0 && (
          <ScrollView horizontal style={postStyles.imageContainer}>
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
            }}>
            <Text style={postStyles.actionText}>
              {userReacted ? '❌ Remove' : '👍 Like'} {item.likes ? Object.keys(item.likes).length : ''}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              setActiveCommentPostId(showInput ? null : item.id);
              if (!showInput) setCommentText('');
            }}>
            <Text style={postStyles.actionText}>💬 Comment</Text>
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
                  <Image source={c.profilePic ? { uri: c.profilePic } : require('../assets/placeholder.png')} style={postStyles.profilePic} />
                </TouchableOpacity>
                <TouchableOpacity style={postStyles.commentBubble} onPress={() => navigation.navigate('Profile', { userId: c.userId })}>
                  <Text style={postStyles.commentUser}>{c.user}:</Text>
                  <Text style={postStyles.commentText}>{c.text}</Text>
                </TouchableOpacity>
              </View>
            ))}
            {comments.length > 2 && (
              <TouchableOpacity onPress={() => navigation.navigate('Comments', { postId: item.id })}>
                <Text style={postStyles.viewAllCommentsText}>View all {comments.length} comments</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {showInput && (
          <View style={postStyles.commentInputRow}>
            <TextInput style={postStyles.commentInput} placeholder="Write a comment..." value={commentText} onChangeText={setCommentText} />
            <TouchableOpacity onPress={() => addComment(item.id, commentText)}>
              <Text style={postStyles.commentBtnText}>Post</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  const pageStyles = createStyles(defaultTheme);

  return (
    <TouchableWithoutFeedback onPress={() => setActiveCommentPostId(null)}>
      <View style={pageStyles.pageContainer}>
        <View style={pageStyles.header}>
          <Image source={require('../assets/logo.png')} style={pageStyles.logo} />

          <View style={pageStyles.headerRight}>
            <TouchableOpacity
              style={pageStyles.userInfoRow}
              onPress={() => navigation.navigate('Profile', { userId: currentUser?.id })}>
              <Image
                source={currentUser?.profilePic ? { uri: currentUser.profilePic } : require('../assets/placeholder.png')}
                style={pageStyles.headerProfilePic}
              />
              <Text style={pageStyles.usernameHeader}>{currentUser?.username || 'User'}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={{ paddingHorizontal: 8 }} onPress={() => navigation.navigate('Settings')}>
              <Icon name="settings-outline" size={28} color={pageStyles.usernameHeader.color} />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity style={pageStyles.createPostBtn} onPress={() => navigation.navigate('CreatePost')}>
          <Text style={pageStyles.createPostText}>➕ Create Post</Text>
        </TouchableOpacity>

        <FlatList data={posts} keyExtractor={(item) => item.id} renderItem={renderPost} contentContainerStyle={{ paddingBottom: 80 }} />

        <Modal transparent visible={showEmojiPopup} animationType="fade">
          <TouchableOpacity style={pageStyles.modalBackdrop} onPress={() => setShowEmojiPopup(false)}>
            <View style={pageStyles.emojiPopup}>
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
                  }}>
                  <Text style={pageStyles.emojiPopupText}>{emoji.add ? '➕' : emoji}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </TouchableOpacity>
        </Modal>

        <Modal transparent visible={showAddEmojiModal} animationType="slide">
          <TouchableOpacity style={pageStyles.modalBackdrop} onPress={() => setShowAddEmojiModal(false)}>
            <View style={pageStyles.bigEmojiSheet}>
              <Text style={pageStyles.bigEmojiTitle}>Pick any emoji</Text>
              <FlatList data={allEmojis} keyExtractor={(i) => i} numColumns={6} renderItem={({ item }) => (
                <TouchableOpacity onPress={async () => { await saveCustomEmoji(item); toggleLike(activePostId, item); setShowAddEmojiModal(false); }}>
                  <Text style={pageStyles.bigEmojiText}>{item}</Text>
                </TouchableOpacity>
              )} />
              <TouchableOpacity onPress={() => setShowAddEmojiModal(false)}>
                <Text style={{ fontWeight: 'bold' }}>Close</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>
      </View>
    </TouchableWithoutFeedback>
  );
}
