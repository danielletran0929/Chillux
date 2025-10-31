import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Image,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import createStyles from '../styles/commentsStyles';
import placeholderPic from '../assets/placeholder.png';

export default function CommentPage({ route, navigation }) {
  const { postId } = route.params;
  const [posts, setPosts] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [theme, setTheme] = useState({});

  useFocusEffect(
    React.useCallback(() => {
      async function loadTheme() {
        const savedUser = await AsyncStorage.getItem('currentUser');
        if (savedUser) {
          const parsed = JSON.parse(savedUser);
          setTheme(parsed.theme || {});
        }
      }
      loadTheme();
    }, [])
  );

  const styles = createStyles(theme);

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
        const newComment = {
          user: currentUser.username,
          userId: currentUser.id,
          text: commentText,
          profilePic: currentUser.profilePic || null,
        };
        return { ...p, comments: [...(p.comments || []), newComment] };
      }
      return p;
    });

    setPosts(updatedPosts);
    setCommentText('');
    await AsyncStorage.setItem('posts', JSON.stringify(updatedPosts));
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: theme.pageBackground || '#f9f9f9' }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.container}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={[styles.backText, { color: theme.textColor || '#000' }]}>⬅ Back</Text>
        </TouchableOpacity>

        {comments.length === 0 ? (
          <Text style={[styles.noCommentsText, { color: theme.textColor || '#777' }]}>
            No comments yet. Be the first to comment!
          </Text>
        ) : (
          <FlatList
            data={comments}
            keyExtractor={(_, idx) => idx.toString()}
            renderItem={({ item, index }) => (
              <>
                <View style={styles.commentRow}>
                  <TouchableOpacity
                    onPress={() =>
                      navigation.navigate('Profile', { userId: item.userId })
                    }>
                    <Image
                      source={item.profilePic ? { uri: item.profilePic } : placeholderPic}
                      style={[styles.profilePic, { borderColor: theme.profileBorderColor || '#ccc' }]}
                    />
                  </TouchableOpacity>

                  <View
                    style={[
                      styles.commentBubble,
                      {
                        backgroundColor: theme.postBackground || '#fff',
                        borderColor: theme.borderColor || '#ddd',
                      },
                    ]}
                  >
                  <TouchableOpacity onPress={() => navigation.navigate('Profile', { userId: c.userId })}>
                    <Text style={[styles.commentUser, { color: theme.textColor || '#000' }]}>
                      {item.user}:
                    </Text>
                  </TouchableOpacity>
                    <Text style={[styles.commentText, { color: theme.textColor || '#333' }]}>
                      {item.text}
                    </Text>
                  </View>
                </View>

                {index < comments.length - 1 && (
                  <View style={[styles.separator, { borderBottomColor: theme.borderColor || '#eee' }]} />
                )}
              </>
            )}
          />
        )}
      </View>

      <View
        style={[
          styles.inputRow,
          { backgroundColor: theme.inputBackground || '#fff', borderTopColor: theme.borderColor || '#ddd' },
        ]}
      >
        <TextInput
          style={[
            styles.commentInput,
            {
              color: theme.textColor || '#000',
              borderColor: theme.borderColor || '#ccc',
            },
          ]}
          placeholder="Write a comment..."
          placeholderTextColor={theme.placeholderTextColor || '#888'}
          value={commentText}
          onChangeText={setCommentText}
        />
        <TouchableOpacity
          style={[styles.postCommentBtn, { backgroundColor: theme.buttonBackground || '#0571d3' }]}
          onPress={addComment}
        >
          <Text style={{ color: theme.buttonTextColor || '#fff', fontWeight: 'bold' }}>Post</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
