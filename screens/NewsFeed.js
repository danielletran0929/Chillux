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
  Keyboard
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import createStyles from '../styles/newsFeedStyles'; // theme-based styles function

export default function NewsFeed({ navigation, setLoggedIn }) {
  const [posts, setPosts] = useState([]);
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

  // Generate all emojis
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
        try { emojiList.push(String.fromCodePoint(cp)); } catch {}
      }
    }
    const regionalStart = 0x1f1e6;
    const regionalEnd = 0x1f1ff;
    for (let first = regionalStart; first <= regionalEnd; first++) {
      for (let second = regionalStart; second <= regionalEnd; second++) {
        try { emojiList.push(String.fromCodePoint(first, second)); } catch {}
      }
    }
    return [...new Set(emojiList)];
  }, []);

  // Load posts, user, and custom emojis
  useFocusEffect(
    React.useCallback(() => {
      async function loadData() {
        const userDataRaw = await AsyncStorage.getItem('currentUser');
        const postsRaw = await AsyncStorage.getItem('posts');
        const customEmojisRaw = await AsyncStorage.getItem('customEmojis');

        if (userDataRaw) {
          const parsedUser = JSON.parse(userDataRaw);
          parsedUser.profilePic = parsedUser.profilePic || null;
          setCurrentUser(parsedUser);
        }

        const parsedPosts = postsRaw ? JSON.parse(postsRaw) : [];
        const normalizedPosts = parsedPosts.map(post => ({
          ...post,
          profilePic: post.profilePic || null,
          comments: post.comments?.map(comment => ({
            ...comment,
            profilePic: comment.profilePic || null,
            userId: comment.userId || comment.user
          })) || [],
          theme: post.theme || defaultTheme
        }));
        setPosts(normalizedPosts);

        const parsedCustom = customEmojisRaw ? JSON.parse(customEmojisRaw) : [];
        setCustomEmojis(parsedCustom);
        setEmojiOptions([...defaultEmojis, ...parsedCustom]);
      }
      loadData();
    }, [])
  );

  const handleLogout = async () => {
    await AsyncStorage.removeItem('isLoggedIn');
    await AsyncStorage.removeItem('currentUser');
    if (setLoggedIn) setLoggedIn(false);
  };

  const toggleLike = async (postId, emoji = '👍') => {
    if (!currentUser) return;
    const updatedPosts = posts.map(post => {
      if (post.id === postId) {
        const likes = post.likes || {};
        if (likes[currentUser.id]) {
          delete likes[currentUser.id];
          return { ...post, likes };
        }
        return { ...post, likes: { ...likes, [currentUser.id]: emoji } };
      }
      return post;
    });
    setPosts(updatedPosts);
    await AsyncStorage.setItem('posts', JSON.stringify(updatedPosts));
  };

  const saveCustomEmoji = async emoji => {
    if (!emoji || defaultEmojis.includes(emoji) || customEmojis.includes(emoji)) return;
    const updatedCustom = [...customEmojis, emoji];
    setCustomEmojis(updatedCustom);
    setEmojiOptions([...defaultEmojis, ...updatedCustom]);
    await AsyncStorage.setItem('customEmojis', JSON.stringify(updatedCustom));
  };

  const groupedReactions = likes => {
    if (!likes) return [];
    const reactionCounts = {};
    Object.values(likes).forEach(emoji => {
      reactionCounts[emoji] = (reactionCounts[emoji] || 0) + 1;
    });
    return Object.entries(reactionCounts);
  };

  const addComment = async (postId, text) => {
    if (!text.trim() || !currentUser) return;
    const updatedPosts = posts.map(post => {
      if (post.id === postId) {
        const newComment = {
          user: currentUser.username,
          userId: currentUser.id,
          text,
          profilePic: currentUser.profilePic || null
        };
        return { ...post, comments: [...(post.comments || []), newComment] };
      }
      return post;
    });
    setPosts(updatedPosts);
    setCommentText('');
    setActiveCommentPostId(null);
    await AsyncStorage.setItem('posts', JSON.stringify(updatedPosts));
  };

  const renderPost = ({ item }) => {
    const postTheme = showCustomThemes ? (item.theme || defaultTheme) : defaultTheme;
    const postStyles = createStyles(postTheme);

    const reactions = groupedReactions(item.likes);
    const userReacted = item.likes?.[currentUser?.id];
    const comments = item.comments || [];
    const isCommentBoxVisible = activeCommentPostId === item.id;

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
            <Text style={postStyles.username}>{item.user}</Text>
            <Text style={postStyles.time}>{item.time}</Text>
          </TouchableOpacity>
        </View>

        {item.text && <Text style={postStyles.postText}>{item.text}</Text>}

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
            onLongPress={() => { setActivePostId(item.id); setShowEmojiPopup(true); }}
          >
            <Text style={postStyles.actionText}>
              {userReacted ? '❌ Remove' : '👍 Like'} {item.likes ? Object.keys(item.likes).length : ''}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => {
            setActiveCommentPostId(isCommentBoxVisible ? null : item.id);
            if (!isCommentBoxVisible) setCommentText('');
          }}>
            <Text style={postStyles.actionText}>💬 Comment</Text>
          </TouchableOpacity>
        </View>

        {reactions.length > 0 && (
          <View style={postStyles.reactionsContainer}>
            {reactions.map(([emoji, count], idx) => (
              <Text key={idx} style={postStyles.reactionCount}>
                {emoji} {count}
              </Text>
            ))}
          </View>
        )}

        {comments.length > 0 && (
          <View style={postStyles.commentsContainer}>
            {comments.slice(0, 2).map((comment, idx) => (
              <View style={postStyles.commentRow} key={idx}>
                <TouchableOpacity onPress={() => navigation.navigate('Profile', { userId: comment.userId })}>
                  <Image
                    source={comment.profilePic ? { uri: comment.profilePic } : require('../assets/placeholder.png')}
                    style={postStyles.profilePic}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  style={postStyles.commentBubble}
                  onPress={() => navigation.navigate('Profile', { userId: comment.userId })}
                >
                  <Text style={postStyles.commentUser}>{comment.user}:</Text>
                  <Text style={postStyles.commentText}>{comment.text}</Text>
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

        {isCommentBoxVisible && (
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

  const pageStyles = createStyles(defaultTheme);

  return (
    <TouchableWithoutFeedback onPress={() => setActiveCommentPostId(null)}>
      <View style={pageStyles.pageContainer}>
        <View style={pageStyles.header}>
          <Image source={require('../assets/logo.png')} style={pageStyles.logo} />
          <View style={pageStyles.headerRight}>
            <Text style={pageStyles.usernameHeader}>{currentUser?.username || 'User'}</Text>
            <TouchableOpacity style={pageStyles.logoutBtn} onPress={handleLogout}>
              <Text style={pageStyles.logoutText}>Log Out</Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          style={pageStyles.createPostBtn}
          onPress={() => navigation.navigate('CreatePost')}
        >
          <Text style={pageStyles.createPostText}>➕ Create Post</Text>
        </TouchableOpacity>

        <FlatList
          data={posts}
          keyExtractor={item => item.id}
          renderItem={renderPost}
          contentContainerStyle={{ paddingBottom: 80 }}
        />

        {/* Emoji popup */}
        <Modal transparent visible={showEmojiPopup} animationType="fade">
          <TouchableOpacity
            style={pageStyles.modalBackdrop}
            onPress={() => setShowEmojiPopup(false)}
            activeOpacity={1}
          >
            <View style={pageStyles.emojiPopup}>
              {[...emojiOptions, addButton].map((emoji, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={pageStyles.emojiPopupItem}
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
                  <Text style={pageStyles.emojiPopupText}>{emoji.add ? '➕' : emoji}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </TouchableOpacity>
        </Modal>

        {/* Big emoji modal */}
        <Modal transparent visible={showAddEmojiModal} animationType="slide">
          <TouchableOpacity
            style={pageStyles.modalBackdrop}
            onPress={() => setShowAddEmojiModal(false)}
            activeOpacity={1}
          >
            <View style={pageStyles.bigEmojiSheet}>
              <Text style={pageStyles.bigEmojiTitle}>Pick any emoji</Text>

              <FlatList
                data={allEmojis}
                keyExtractor={(item, idx) => `${item}-${idx}`}
                numColumns={6}
                contentContainerStyle={{ paddingHorizontal: 5 }}
                columnWrapperStyle={{ justifyContent: 'space-between', marginBottom: 10 }}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={pageStyles.bigEmojiItem}
                    onPress={async () => {
                      await saveCustomEmoji(item);
                      toggleLike(activePostId, item);
                      setShowAddEmojiModal(false);
                    }}
                  >
                    <Text style={pageStyles.bigEmojiText}>{item}</Text>
                  </TouchableOpacity>
                )}
              />

              <TouchableOpacity
                style={pageStyles.bigEmojiClose}
                onPress={() => setShowAddEmojiModal(false)}
              >
                <Text style={{ fontWeight: 'bold' }}>Close</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>
      </View>
    </TouchableWithoutFeedback>
  );
}
