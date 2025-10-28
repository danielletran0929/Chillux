import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Image
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import styles from '../styles/commentsStyles';
import placeholderPic from '../assets/placeholder.png'; // your placeholder

export default function CommentPage({ route, navigation }) {
  const { postId } = route.params;
  const [posts, setPosts] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [commentText, setCommentText] = useState('');

  useEffect(() => {
    async function loadData() {
      const storedPosts = await AsyncStorage.getItem('posts');
      const userData = await AsyncStorage.getItem('currentUser');
      setPosts(storedPosts ? JSON.parse(storedPosts) : []);
      if (userData) setCurrentUser(JSON.parse(userData));
    }
    loadData();
  }, []);

  const post = posts.find(p => p.id === postId);
  const comments = post?.comments || [];

  const addComment = async () => {
    if (!commentText.trim() || !currentUser) return;

    const updatedPosts = posts.map(p => {
      if (p.id === postId) {
        const updatedComments = [
          ...(p.comments || []),
          { user: currentUser.username, text: commentText, profilePic: currentUser.profilePic || null }
        ];
        return { ...p, comments: updatedComments };
      }
      return p;
    });

    setPosts(updatedPosts);
    setCommentText('');
    await AsyncStorage.setItem('posts', JSON.stringify(updatedPosts));
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.container}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>⬅ Back</Text>
        </TouchableOpacity>

        {comments.length === 0 && (
          <Text style={styles.noCommentsText}>
            No comments yet. Be the first to comment!
          </Text>
        )}

        <FlatList
          data={comments}
          keyExtractor={(_, idx) => idx.toString()}
          renderItem={({ item, index }) => (
            <>
              <View style={styles.commentRow}>
                <Image
                  source={item.profilePic ? { uri: item.profilePic } : placeholderPic}
                  style={styles.profilePic}
                />
                <View style={styles.commentBubble}>
                  <Text style={styles.commentUser}>{item.user}:</Text>
                  <Text style={styles.commentText}>{item.text}</Text>
                </View>
              </View>
              {index < comments.length - 1 && <View style={styles.separator} />}
            </>
          )}
        />

      </View>

      <View style={styles.inputRow}>
        <TextInput
          style={styles.commentInput}
          placeholder="Write a comment..."
          value={commentText}
          onChangeText={setCommentText}
        />
        <TouchableOpacity style={styles.postCommentBtn} onPress={addComment}>
          <Text style={{ color: '#fff', fontWeight: 'bold' }}>Post</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
