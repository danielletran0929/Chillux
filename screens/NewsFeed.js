import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Image,
  Modal,
  ScrollView
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import styles from '../styles/newsFeedStyles';

/**
 * NewsFeed.js — full emoji-grid implementation (full Unicode set approximation).
 * Paste this entire file over your current NewsFeed.js.
 */

export default function NewsFeed({ navigation, setLoggedIn }) {
  const [posts, setPosts] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  const defaultEmojis = ['👍', '😂', '🔥', '❤️', '😮'];
  const plusButton = { add: true };

  const [customEmojis, setCustomEmojis] = useState([]);
  const [emojiOptions, setEmojiOptions] = useState(defaultEmojis);

  const [showEmojiPopup, setShowEmojiPopup] = useState(false);
  const [activePostId, setActivePostId] = useState(null);

  const [showAddEmojiModal, setShowAddEmojiModal] = useState(false);

  // Build a large emoji list from known Unicode ranges.
  // This is an approximation of the "full" emoji set (faces, symbols, transport, flags, etc.)
  // It's generated at runtime and memoized to avoid rebuilding on every render.
  const allEmojis = useMemo(() => {
    const ranges = [
      // Emoticons
      [0x1f600, 0x1f64f],
      // Misc symbols and pictographs
      [0x1f300, 0x1f5ff],
      // Transport & map symbols
      [0x1f680, 0x1f6ff],
      // Supplemental Symbols and Pictographs
      [0x1f900, 0x1f9ff],
      // Dingbats
      [0x2700, 0x27bf],
      // Misc symbols (e.g., geometric shapes)
      [0x2600, 0x26ff],
      // Enclosed characters
      [0x24c2, 0x24c2],
      // Additional arrows and symbols (some overlap)
      [0x2934, 0x2935],
    ];

    const list = [];

    ranges.forEach(([start, end]) => {
      for (let cp = start; cp <= end; cp++) {
        try {
          const ch = String.fromCodePoint(cp);
          // Basic filter: skip invisible control-like codepoints
          if (ch && ch.trim() !== '') list.push(ch);
        } catch (e) {
          // ignore invalid code points
        }
      }
    });

    // Add flag emojis (regional indicator pairs) A..Z -> 26*26 = 676 flags (covers country flags)
    const regionalStart = 0x1f1e6; // regional indicator A
    const regionalEnd = 0x1f1ff; // Z
    for (let a = regionalStart; a <= regionalEnd; a++) {
      for (let b = regionalStart; b <= regionalEnd; b++) {
        try {
          list.push(String.fromCodePoint(a, b));
        } catch (e) {
          // ignore
        }
      }
    }

    // Deduplicate while preserving order
    const seen = new Set();
    const dedup = [];
    for (const e of list) {
      if (!seen.has(e)) {
        seen.add(e);
        dedup.push(e);
      }
    }

    return dedup;
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      async function loadData() {
        const userData = await AsyncStorage.getItem('currentUser');
        const storedPosts = await AsyncStorage.getItem('posts');
        const storedCustom = await AsyncStorage.getItem('customEmojis');

        if (userData) setCurrentUser(JSON.parse(userData));
        setPosts(storedPosts ? JSON.parse(storedPosts) : []);

        if (storedCustom) {
          const parsed = JSON.parse(storedCustom);
          setCustomEmojis(parsed);
          setEmojiOptions([...defaultEmojis, ...parsed]);
        } else {
          setEmojiOptions(defaultEmojis);
        }
      }
      loadData();
    }, [])
  );

  const handleLogout = async () => {
    await AsyncStorage.removeItem('isLoggedIn');
    await AsyncStorage.removeItem('currentUser');
    if (typeof setLoggedIn === 'function') setLoggedIn(false);
  };

  const toggleLike = async (id, emoji = '👍') => {
    if (!currentUser) return;

    const updated = posts.map(post => {
      if (post.id === id) {
        const likes = post.likes || {};
        const userLiked = likes[currentUser.id];

        if (userLiked) {
          const updatedLikes = { ...likes };
          delete updatedLikes[currentUser.id];
          return { ...post, likes: updatedLikes };
        }

        return {
          ...post,
          likes: {
            ...likes,
            [currentUser.id]: emoji
          }
        };
      }
      return post;
    });

    setPosts(updated);
    await AsyncStorage.setItem('posts', JSON.stringify(updated));
  };

  const saveCustomEmoji = async emoji => {
    if (!emoji) return;
    if (defaultEmojis.includes(emoji) || customEmojis.includes(emoji)) return;

    const updated = [...customEmojis, emoji];
    setCustomEmojis(updated);
    const combined = [...defaultEmojis, ...updated];
    setEmojiOptions(combined);
    await AsyncStorage.setItem('customEmojis', JSON.stringify(updated));
  };

  const groupedReactions = likes => {
    if (!likes) return null;
    return Object.entries(
      Object.values(likes).reduce((acc, emoji) => {
        acc[emoji] = (acc[emoji] || 0) + 1;
        return acc;
      }, {})
    );
  };

  const renderPost = ({ item }) => {
    const reactions = groupedReactions(item.likes);
    const userReacted = item.likes && item.likes[currentUser?.id];

    return (
      <View style={styles.postCard}>
        <View style={styles.postHeader}>
          {/* you use userImgPlaceholder elsewhere; ensure styles contains it */}
          <View style={styles.userImgPlaceholder} />
          <View>
            <Text style={styles.username}>{item.user}</Text>
            <Text style={styles.time}>{item.time}</Text>
          </View>
        </View>

        {item.text !== '' && <Text style={styles.postText}>{item.text}</Text>}

        {item.images && item.images.length > 0 && (
  <ScrollView horizontal style={styles.imageContainer}>
    {item.images.map((uri, index) => {
      console.log('Image URI:', uri); // 👈
      return (
        <Image
          key={index}
          source={{ uri }}
          style={styles.inlinePostImage}
        />
      );
    })}
  </ScrollView>
)}


        <View style={styles.actionsRow}>
          <TouchableOpacity
            onPress={() => toggleLike(item.id)}
            onLongPress={() => {
              setActivePostId(item.id);
              setShowEmojiPopup(true);
            }}
          >
            <Text style={styles.actionText}>
              {userReacted ? '❌ Remove' : '👍 Like'}{' '}
              {item.likes ? Object.keys(item.likes).length : ''}
            </Text>
          </TouchableOpacity>

          <Text style={styles.actionText}>💬 Comment</Text>
        </View>

        {reactions && (
          <View style={styles.reactionsContainer}>
            {reactions.map(([emoji, count], index) => (
              <Text key={index} style={styles.reactionCount}>
                {emoji} {count}
              </Text>
            ))}
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.pageContainer}>
      <View style={styles.header}>
        <Image source={require('../assets/logo.png')} style={styles.logo} />
        <View style={styles.headerRight}>
          <Text style={styles.usernameHeader}>
            {currentUser ? currentUser.username : 'User'}
          </Text>
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

      {/* EMOJI POPUP (default + custom emojis, plus button) */}
      <Modal transparent visible={showEmojiPopup} animationType="fade">
        <TouchableOpacity
          style={styles.modalBackdrop}
          onPress={() => setShowEmojiPopup(false)}
          activeOpacity={1}
        >
          <View style={styles.emojiPopup}>
            {[...emojiOptions, plusButton].map((emoji, index) => (
              <TouchableOpacity
                key={index}
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
                <Text style={styles.emojiPopupText}>
                  {emoji.add ? '➕' : emoji}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* BIG EMOJI GRID — shows MANY emojis (generated from Unicode ranges) */}
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

            <TouchableOpacity
              style={styles.bigEmojiClose}
              onPress={() => setShowAddEmojiModal(false)}
            >
              <Text style={{ fontWeight: 'bold' }}>Close</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}
