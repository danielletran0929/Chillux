// styles/commentsStyles.js
import { StyleSheet } from 'react-native';

export default function createStyles(theme = {}) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.pageBackground || '#eef2f5',
      padding: 10,
    },
    backButton: {
      marginBottom: 10,
    },
    backText: {
      color: theme.linkColor || theme.textColor || '#0571d3',
      fontWeight: 'bold',
    },
    noCommentsText: {
      textAlign: 'center',
      marginTop: 20,
      color: theme.textColor || '#555',
    },
    commentRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginVertical: 6,
    },
    profilePic: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: '#aaa',
      marginRight: 0,
      borderWidth: 1,
      borderColor: theme.profileBorderColor || '#ccc',
    },
    commentBubble: {
      backgroundColor: theme.postBackground || '#f1f0f0',
      paddingVertical: 6,
      paddingHorizontal: 10,
      borderRadius: 12,
      flex: 1,
      borderWidth: 1,
      borderColor: theme.borderColor || '#ddd',
    },
    commentUser: {
      fontWeight: 'bold',
      marginBottom: 2,
      color: theme.textColor || '#333',
      marginTop: -2,
    },
    commentText: {
      color: theme.textColor || '#222',
      fontSize: 14,
    },
    separator: {
      height: 1,
      backgroundColor: theme.borderColor || '#ccc',
      marginVertical: 6,
      marginLeft: 42,
    },
    inputRow: {
      flexDirection: 'row',
      padding: 10,
      borderTopWidth: 1,
      borderColor: theme.borderColor || '#ddd',
      backgroundColor: theme.inputBackground || '#fff',
    },
    commentInput: {
      flex: 1,
      marginRight: 10,
      minHeight: 40,
      borderWidth: 1,
      borderColor: theme.borderColor || '#ccc',
      borderRadius: 6,
      paddingHorizontal: 10,
      paddingVertical: 6,
      color: theme.textColor || '#000',
    },
    postCommentBtn: {
      backgroundColor: theme.buttonBackground || '#0571d3',
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: 8,
      justifyContent: 'center',
      alignItems: 'center',
    },
  });
}