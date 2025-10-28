// PostCard.js
import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from 'react-native';
import createStyles from '../styles/newsFeedStyles';

export default function PostCard({ post, currentUser, onLike, onComment, navigation, showCustomThemes }) {
  const postTheme = showCustomThemes ? post.theme : undefined;
  const postStyles = createStyles(postTheme);

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

  return (
    <View style={postStyles.postCard}>
      {/* Header */}
      <View style={postStyles.postHeader}>
        <TouchableOpacity onPress={() => navigation.navigate('Profile', { userId: post.userId })}>
          <Image
            source={post.profilePic ? { uri: post.profilePic } : require('../assets/placeholder.png')}
            style={postStyles.userImgPlaceholder}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={{ marginLeft: 8 }}
          onPress={() => navigation.navigate('Profile', { userId: post.userId })}
        >
          <Text style={postStyles.username}>{post.user}</Text>
          <Text style={postStyles.time}>{post.time}</Text>
        </TouchableOpacity>
      </View>

      {/* Text */}
      {post.text && <Text style={postStyles.postText}>{post.text}</Text>}

      {/* Images */}
      {post.images?.length > 0 && (
        <ScrollView horizontal style={postStyles.imageContainer}>
          {post.images.map((uri, idx) => (
            <Image key={idx} source={{ uri }} style={postStyles.inlinePostImage} />
          ))}
        </ScrollView>
      )}

      {/* Actions */}
      <View style={postStyles.actionsRow}>
        <TouchableOpacity onPress={() => onLike(post.id)}>
          <Text style={postStyles.actionText}>
            {userReacted ? '❌ Remove' : '👍 Like'} {post.likes ? Object.keys(post.likes).length : ''}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setActiveCommentBox(!activeCommentBox)}>
          <Text style={postStyles.actionText}>💬 Comment</Text>
        </TouchableOpacity>
      </View>

      {/* Reactions */}
      {reactions.length > 0 && (
        <View style={postStyles.reactionsContainer}>
          {reactions.map(([emoji, count], idx) => (
            <Text key={idx} style={postStyles.reactionCount}>
              {emoji} {count}
            </Text>
          ))}
        </View>
      )}

      {/* Comments */}
      {post.comments?.length > 0 && (
        <View style={postStyles.commentsContainer}>
          {post.comments.slice(0, 2).map((comment, idx) => (
            <View key={idx} style={postStyles.commentRow}>
              <TouchableOpacity onPress={() => navigation.navigate('Profile', { userId: comment.userId })}>
                <Image
                  source={comment.profilePic ? { uri: comment.profilePic } : require('../assets/placeholder.png')}
                  style={postStyles.profilePic}
                />
              </TouchableOpacity>
              <TouchableOpacity style={postStyles.commentBubble}>
                <Text style={postStyles.commentUser}>{comment.user}:</Text>
                <Text style={postStyles.commentText}>{comment.text}</Text>
              </TouchableOpacity>
            </View>
          ))}
          {post.comments.length > 2 && (
            <TouchableOpacity onPress={() => navigation.navigate('Comments', { postId: post.id })}>
              <Text style={postStyles.viewAllCommentsText}>View all {post.comments.length} comments</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Comment input */}
      {activeCommentBox && (
        <View style={postStyles.commentInputRow}>
          <TextInput
            style={postStyles.commentInput}
            placeholder="Write a comment..."
            value={commentText}
            onChangeText={setCommentText}
          />
          <TouchableOpacity onPress={handleAddComment}>
            <Text style={postStyles.commentBtnText}>Post</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
