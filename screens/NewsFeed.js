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
import styles from '../styles/newsFeedStyles';

export default function NewsFeed({ navigation, setLoggedIn }) {
  const [posts, setPosts] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [customEmojis, setCustomEmojis] = useState([]);
  const [emojiOptions, setEmojiOptions] = useState([]);
  const [showEmojiPopup, setShowEmojiPopup] = useState(false);
  const [activePostId, setActivePostId] = useState(null);
  const [showAddEmojiModal, setShowAddEmojiModal] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [activeCommentPostId, setActiveCommentPostId] = useState(null); // which post's comment input is visible

  const defaultEmojis = ['👍', '😂', '🔥', '❤️', '😮'];
  const addButton = { add: true };

  // Generate all emojis
  const allEmojis = useMemo(() => {
    const emojiList = [];

    // Basic emoji ranges
    const emojiRanges = [
      [0x1f600, 0x1f64f], // Emoticons
      [0x1f300, 0x1f5ff], // Misc symbols
      [0x1f680, 0x1f6ff], // Transport & map
      [0x1f900, 0x1f9ff], // Supplemental
      [0x2700, 0x27bf],   // Dingbats
      [0x2600, 0x26ff],   // Misc symbols
    ];

    for (const [startCode, endCode] of emojiRanges) {
      for (let codePoint = startCode; codePoint <= endCode; codePoint++) {
        try {
          const emojiChar = String.fromCodePoint(codePoint);
          if (emojiChar && emojiChar.trim() !== '') emojiList.push(emojiChar);
        } catch (error) {}
      }
    }

    // Regional indicator symbols (flags)
    const regionalStart = 0x1f1e6;
    const regionalEnd = 0x1f1ff;
    for (let first = regionalStart; first <= regionalEnd; first++) {
      for (let second = regionalStart; second <= regionalEnd; second++) {
        try {
          emojiList.push(String.fromCodePoint(first, second));
        } catch (error) {}
      }
    }

    return [...new Set(emojiList)];
  }, []);

  // Load posts, user, and custom emojis from storage
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
            profilePic: comment.profilePic || null
          })) || []
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
          text,
          profilePic: currentUser.profilePic || null
        };
        return { ...post, comments: [...(post.comments || []), newComment] };
      }
      return post;
    });

    setPosts(updatedPosts);
    setCommentText('');
    setActiveCommentPostId(null); // hide input after posting
    await AsyncStorage.setItem('posts', JSON.stringify(updatedPosts));
  };

  const renderPost = ({ item }) => {
    const reactions = groupedReactions(item.likes);
    const userReacted = item.likes?.[currentUser?.id];
    const comments = item.comments || [];
    const isCommentBoxVisible = activeCommentPostId === item.id;

    return (
      <View style={styles.postCard}>
        <View style={styles.postHeader}>
          <Image
            source={item.profilePic ? { uri: item.profilePic } : require('../assets/placeholder.png')}
            style={styles.userImgPlaceholder}
          />
          <View style={{ marginLeft: 8 }}>
            <Text style={styles.username}>{item.user}</Text>
            <Text style={styles.time}>{item.time}</Text>
          </View>
        </View>

        {item.text ? <Text style={styles.postText}>{item.text}</Text> : null}

        {item.images?.length > 0 && (
          <ScrollView horizontal style={styles.imageContainer}>
            {item.images.map((uri, idx) => (
              <Image key={idx} source={{ uri }} style={styles.inlinePostImage} />
            ))}
          </ScrollView>
        )}

        <View style={styles.actionsRow}>
          <TouchableOpacity
            onPress={() => toggleLike(item.id)}
            onLongPress={() => { setActivePostId(item.id); setShowEmojiPopup(true); }}
          >
            <Text style={styles.actionText}>
              {userReacted ? '❌ Remove' : '👍 Like'} {item.likes ? Object.keys(item.likes).length : ''}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => {
            setActiveCommentPostId(isCommentBoxVisible ? null : item.id);
            if (!isCommentBoxVisible) setCommentText('');
          }}>
            <Text style={styles.actionText}>💬 Comment</Text>
          </TouchableOpacity>
        </View>

        {reactions.length > 0 && (
          <View style={styles.reactionsContainer}>
            {reactions.map(([emoji, count], idx) => (
              <Text key={idx} style={styles.reactionCount}>
                {emoji} {count}
              </Text>
            ))}
          </View>
        )}

        {comments.length > 0 && (
          <View style={styles.commentsContainer}>
            {comments.slice(0, 2).map((comment, idx) => (
              <View style={styles.commentRow} key={idx}>
                <Image
                  source={comment.profilePic ? { uri: comment.profilePic } : require('../assets/placeholder.png')}
                  style={styles.profilePic}
                />
                <View style={styles.commentBubble}>
                  <Text style={styles.commentUser}>{comment.user}:</Text>
                  <Text style={styles.commentText}>{comment.text}</Text>
                </View>
              </View>
            ))}
            {comments.length > 2 && (
              <TouchableOpacity onPress={() => navigation.navigate('Comments', { postId: item.id })}>
                <Text style={styles.viewAllCommentsText}>View all {comments.length} comments</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {isCommentBoxVisible && (
          <View style={styles.commentInputRow}>
            <TextInput
              style={styles.commentInput}
              placeholder="Write a comment..."
              value={commentText}
              onChangeText={text => setCommentText(text)}
            />
            <TouchableOpacity onPress={() => addComment(item.id, commentText)}>
              <Text style={styles.commentBtnText}>Post</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  return (
    <TouchableWithoutFeedback onPress={() => setActiveCommentPostId(null)}>
      <View style={styles.pageContainer}>
        <View style={styles.header}>
          <Image source={require('../assets/logo.png')} style={styles.logo} />
          <View style={styles.headerRight}>
            <Text style={styles.usernameHeader}>{currentUser?.username || 'User'}</Text>
            <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
              <Text style={styles.logoutText}>Log Out</Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          style={styles.createPostBtn}
          onPress={() => navigation.navigate('CreatePost')}
        >
          <Text style={styles.createPostText}>➕ Create Post</Text>
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
            style={styles.modalBackdrop}
            onPress={() => setShowEmojiPopup(false)}
            activeOpacity={1}
          >
            <View style={styles.emojiPopup}>
              {[...emojiOptions, addButton].map((emoji, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={styles.emojiPopupItem}
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
        </Modal>

        {/* Big emoji modal */}
        <Modal transparent visible={showAddEmojiModal} animationType="slide">
          <TouchableOpacity
            style={styles.modalBackdrop}
            onPress={() => setShowAddEmojiModal(false)}
            activeOpacity={1}
          >
            <View style={styles.bigEmojiSheet}>
              <Text style={styles.bigEmojiTitle}>Pick any emoji</Text>
              <FlatList
                data={allEmojis}
                keyExtractor={(item, idx) => `${item}-${idx}`}
                numColumns={6}
                initialNumToRender={60}
                windowSize={10}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.bigEmojiItem}
                    onPress={async () => {
                      await saveCustomEmoji(item);
                      toggleLike(activePostId, item);
                      setShowAddEmojiModal(false);
                    }}
                  >
                    <Text style={styles.bigEmojiText}>{item}</Text>
                  </TouchableOpacity>
                )}
              />
              <TouchableOpacity style={styles.bigEmojiClose} onPress={() => setShowAddEmojiModal(false)}>
                <Text style={{ fontWeight: 'bold' }}>Close</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>
      </View>
    </TouchableWithoutFeedback>
  );
}
