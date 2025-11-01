// components/PostCard.js
import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ImageBackground,
  Modal,
  ScrollView as RNScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import createStyles from '../styles/newsFeedStyles';


export default function PostCard({
  post,
  currentUser,
  onLike,
  onComment,
  onDelete,
  navigation,
  theme: parentTheme = {},
  emojiOptions = ['👍', '😂', '🔥', '❤️', '😮'],
  customEmojis = [],
  setCustomEmojis = () => {},
}) {
  const defaultTheme = {
    pageBackground: '#eef2f5',
    headerBackground: '#38b6ff',
    buttonBackground: '#0571d3',
    buttonTextColor: '#fff',
    textColor: '#222',
    secondaryTextColor: '#555',
    postBackground: '#fff',
    profileBorderColor: '#0571d3',
    profileBorderWidth: 2,
    inputBackground: '#fff',
  };

  // ✅ Make theme reactive with useMemo
  const theme = useMemo(() => ({
    ...defaultTheme,
    ...(post.userTheme || {}),
    ...(post.theme || {}),
    ...parentTheme,
  }), [post.userTheme, post.theme, parentTheme]);

  const styles = createStyles(theme);

  const [activeCommentBox, setActiveCommentBox] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [showEmojiPopup, setShowEmojiPopup] = useState(false);
  const [showAddEmojiModal, setShowAddEmojiModal] = useState(false);
  const [activePostId, setActivePostId] = useState(null);

  const reactions = post.likes
    ? Object.entries(
        Object.values(post.likes).reduce((acc, emoji) => {
          acc[emoji] = (acc[emoji] || 0) + 1;
          return acc;
        }, {})
      )
    : [];

  const userReacted = post.likes?.[currentUser?.id];
  const postProfilePic =
    post.userId === currentUser?.id ? currentUser.profilePic : post.profilePic;

  const Wrapper = theme.backgroundImage ? ImageBackground : View;
  const wrapperProps = theme.backgroundImage
    ? { source: { uri: theme.backgroundImage }, resizeMode: 'cover' }
    : {};

  // All emojis for add modal
  const emojiRanges = [
    [0x1f600, 0x1f64f],
    [0x1f300, 0x1f5ff],
    [0x1f680, 0x1f6ff],
    [0x1f900, 0x1f9ff],
    [0x2700, 0x27bf],
    [0x2600, 0x26ff],
  ];
  const allEmojis = [];
  for (const [start, end] of emojiRanges) {
    for (let cp = start; cp <= end; cp++) {
      try {
        allEmojis.push(String.fromCodePoint(cp));
      } catch {}
    }
  }

  const handleAddComment = () => {
    if (!commentText.trim()) return;
    onComment(post.id, commentText);
    setCommentText('');
    setActiveCommentBox(false);
  };

  const handleEmojiSelect = async (emoji) => {
    if (!emoji) return;
    await onLike(post.id, emoji);
    setShowEmojiPopup(false);
  };

  const handleAddEmoji = async (emoji) => {
    if (!emojiOptions.includes(emoji) && !customEmojis.includes(emoji)) {
      const updated = [...customEmojis, emoji];
      setCustomEmojis(updated);
      await AsyncStorage.setItem('customEmojis', JSON.stringify(updated));
    }
    await onLike(post.id, emoji);
    setShowAddEmojiModal(false);
  };

  return (
    <Wrapper
      {...wrapperProps}
      style={[styles.postCard, { backgroundColor: theme.postBackground }]}
    >
      {/* Header */}
      <View style={styles.postHeader}>
        {currentUser?.id === post.userId && onDelete && (
          <TouchableOpacity
            onPress={() => onDelete(post.id)}
            style={{ marginRight: 8 }}
          >
            <Text style={{ fontSize: 18, color: 'red' }}>🗑️</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          onPress={() => navigation.navigate('Profile', { userId: post.userId })}
        >
          <Image
            source={
              postProfilePic
                ? { uri: postProfilePic }
                : require('../assets/placeholder.png')
            }
            style={[
              styles.userImgPlaceholder,
              {
                borderColor: theme.profileBorderColor,
                borderWidth: theme.profileBorderWidth,
              },
            ]}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={{ marginLeft: 8 }}
          onPress={() => navigation.navigate('Profile', { userId: post.userId })}
        >
          <Text style={[styles.username, { color: theme.textColor }]}>
            {post.user}
          </Text>
          <Text style={[styles.commentText, { color: theme.textColor }]}>
            {post.time}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Post Text */}
      {post.text ? (
        <Text style={[styles.postText, { color: theme.textColor }]}>
          {post.text}
        </Text>
      ) : null}

      {/* Post Images */}
      {post.images?.length ? (
        <ScrollView horizontal style={styles.imageContainer}>
          {post.images.map((uri, idx) => (
            <Image key={idx} source={{ uri }} style={styles.inlinePostImage} />
          ))}
        </ScrollView>
      ) : null}

      {/* Actions */}
      <View style={styles.actionsRow}>
        <TouchableOpacity
          onPress={() => onLike(post.id, userReacted || '👍')}
          onLongPress={() => {
            setActivePostId(post.id);
            setShowEmojiPopup(true);
          }}
        >
          <Text
            style={[
              styles.actionText,
              { color: userReacted ? theme.buttonBackground : theme.textColor },
            ]}
          >
            {userReacted ? '❌ Remove' : '👍 Like'}{' '}
            {post.likes ? Object.keys(post.likes).length : ''}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setActiveCommentBox(!activeCommentBox)}>
          <Text style={[styles.actionText, { color: theme.buttonBackground }]}>
            💬 Comment
          </Text>
        </TouchableOpacity>
      </View>

      {/* Emoji Popup */}
      <Modal transparent visible={showEmojiPopup} animationType="fade">
        <TouchableOpacity
          style={styles.modalBackdrop}
          onPress={() => setShowEmojiPopup(false)}
        >
          <View style={styles.emojiPopup}>
            {[...emojiOptions, { add: true }].map((emoji, idx) => (
              <TouchableOpacity
                key={idx}
                onPress={() => {
                  if (emoji.add) {
                    setShowEmojiPopup(false);
                    setShowAddEmojiModal(true);
                  } else handleEmojiSelect(emoji);
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

      {/* Add Emoji Modal */}
      <Modal transparent visible={showAddEmojiModal} animationType="slide">
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setShowAddEmojiModal(false)}
        >
          <View style={[styles.bigEmojiSheet, { maxHeight: '70%' }]}>
            <Text style={styles.bigEmojiTitle}>Pick any emoji</Text>
            <RNScrollView showsVerticalScrollIndicator={false}>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                {allEmojis.map((emoji) => (
                  <TouchableOpacity key={emoji} onPress={() => handleAddEmoji(emoji)}>
                    <Text style={styles.bigEmojiText}>{emoji}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </RNScrollView>
            <TouchableOpacity onPress={() => setShowAddEmojiModal(false)}>
              <Text style={{ fontWeight: 'bold', marginTop: 10 }}>Close</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Reactions */}
      {reactions.length > 0 && (
        <View style={styles.reactionsContainer}>
          {reactions.map(([emoji, count], idx) => (
            <Text key={idx} style={[styles.reactionCount, { color: theme.textColor }]}>
              {emoji} {count}
            </Text>
          ))}
        </View>
      )}

      {/* Comments */}
      {post.comments?.length ? (
        <View style={styles.commentsContainer}>
          {post.comments.slice(0, 2).map((comment, idx) => {
            const commentProfilePic =
              comment.userId === currentUser?.id
                ? currentUser.profilePic
                : comment.profilePic;
            return (
              <View key={idx} style={styles.commentRow}>
                <TouchableOpacity
                  onPress={() =>
                    navigation.navigate('Profile', { userId: comment.userId })
                  }
                >
                  <Image
                    source={
                      commentProfilePic
                        ? { uri: commentProfilePic }
                        : require('../assets/placeholder.png')
                    }
                    style={[
                      styles.profilePic,
                      { borderColor: theme.profileBorderColor },
                    ]}
                  />
                </TouchableOpacity>
                <View
                  style={[
                    styles.commentBubble,
                    { backgroundColor: theme.commentBackground || theme.postBackground },
                  ]}
                >
                  <TouchableOpacity
                    onPress={() =>
                      navigation.navigate('Profile', { userId: comment.userId })
                    }
                  >
                    <Text style={[styles.commentUser, { color: theme.textColor }]}>
                      {comment.user}:
                    </Text>
                  </TouchableOpacity>
                  <Text
                    style={[styles.commentText, { color: theme.textColor }]}
                  >
                    {comment.text}
                  </Text>
                </View>
              </View>
            );
          })}

          {post.comments.length > 2 && (
            <TouchableOpacity
              onPress={() => navigation.navigate('Comments', { postId: post.id })}
            >
              <Text
                style={[styles.viewAllCommentsText, { color: theme.buttonBackground }]}
              >
                View all {post.comments.length} comments
              </Text>
            </TouchableOpacity>
          )}
        </View>
      ) : null}

      {/* Comment Input */}
      {activeCommentBox && (
        <View style={styles.commentInputRow}>
          <TextInput
            style={[
              styles.commentInput,
              {
                backgroundColor: theme.inputBackground,
                color: theme.textColor,
                borderColor: theme.profileBorderColor,
              },
            ]}
            placeholder="Write a comment..."
            placeholderTextColor={theme.secondaryTextColor}
            value={commentText}
            onChangeText={setCommentText}
          />
          <TouchableOpacity onPress={handleAddComment}>
            <Text style={[styles.commentBtnText, { color: theme.buttonBackground }]}>
              Post
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </Wrapper>
  );
}
