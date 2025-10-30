// components/PostCard.js
import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ImageBackground,
} from 'react-native';
import createStyles from '../styles/newsFeedStyles';

export default function PostCard({
  post,
  currentUser,
  onLike,
  onComment,
  navigation,
  theme: parentTheme, // 🧩 get theme from parent (Profile.js)
}) {
  // 🧩 Default fallback theme to prevent layout issues
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

  // 🧠 Final theme priority:
  // 1. theme from Profile.js
  // 2. post’s userTheme/theme (used in news feed)
  // 3. defaultTheme
  const theme = { ...defaultTheme, ...(parentTheme || post.userTheme || post.theme || {}) };
  const styles = createStyles(theme);

  const [activeCommentBox, setActiveCommentBox] = useState(false);
  const [commentText, setCommentText] = useState('');

  const reactions = post.likes
    ? Object.entries(
        Object.values(post.likes).reduce((acc, emoji) => {
          acc[emoji] = (acc[emoji] || 0) + 1;
          return acc;
        }, {})
      )
    : [];

  const userReacted = post.likes?.[currentUser?.id];

  const handleAddComment = () => {
    if (!commentText.trim()) return;
    onComment(post.id, commentText);
    setCommentText('');
    setActiveCommentBox(false);
  };

  const postProfilePic =
    post.userId === currentUser?.id ? currentUser.profilePic : post.profilePic;

  // 🧠 Use ImageBackground if theme has backgroundImage
  const Wrapper = theme.backgroundImage ? ImageBackground : View;
  const wrapperProps = theme.backgroundImage
    ? {
        source: { uri: theme.backgroundImage },
        resizeMode: 'cover',
      }
    : {};

  return (
    <Wrapper
      {...wrapperProps}
      style={[
        styles.postCard,
        { backgroundColor: theme.postBackground || '#fff' },
      ]}
    >
      {/* Header */}
      <View style={styles.postHeader}>
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
          <Text style={{ color: theme.secondaryTextColor, fontSize: 12 }}>
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
        <TouchableOpacity onPress={() => onLike(post.id)}>
          <Text
            style={[
              styles.actionText,
              {
                color: userReacted
                  ? theme.buttonBackground
                  : theme.textColor,
              },
            ]}
          >
            {userReacted ? '❌ Remove' : '👍 Like'}{' '}
            {post.likes ? Object.keys(post.likes).length : ''}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setActiveCommentBox(!activeCommentBox)}>
          <Text
            style={[styles.actionText, { color: theme.buttonBackground }]}
          >
            💬 Comment
          </Text>
        </TouchableOpacity>
      </View>

      {/* Reactions */}
      {reactions.length > 0 && (
        <View style={styles.reactionsContainer}>
          {reactions.map(([emoji, count], idx) => (
            <Text
              key={idx}
              style={[styles.reactionCount, { color: theme.textColor }]}
            >
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
                    { backgroundColor: theme.postBackground },
                  ]}
                >
                  <Text
                    style={[styles.commentUser, { color: theme.textColor }]}
                  >
                    {comment.user}:
                  </Text>
                  <Text
                    style={{
                      color: theme.secondaryTextColor,
                      fontSize: 14,
                    }}
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
                style={[
                  styles.viewAllCommentsText,
                  { color: theme.buttonBackground },
                ]}
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
            <Text
              style={[
                styles.commentBtnText,
                { color: theme.buttonBackground },
              ]}
            >
              Post
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </Wrapper>
  );
}
