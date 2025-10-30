// styles/postCardStyles.js
import { StyleSheet } from 'react-native';

export default function createPostCardStyles(theme = {}) {
  return StyleSheet.create({
    postCard: {
      borderRadius: 14,
      borderWidth: 1,
      borderColor: theme.borderColor || '#ddd',
      marginBottom: 14,
      overflow: 'hidden',
      padding: 10,
      backgroundColor: theme.postBackground || '#fff',
      elevation: 2,
    },

    postHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    userImgPlaceholder: {
      width: 42,
      height: 42,
      borderRadius: 21,
      backgroundColor: theme.accentColor ? theme.accentColor + '33' : '#ccc',
    },
    username: {
      fontWeight: 'bold',
      fontSize: 15,
      color: theme.textColor || '#222',
    },
    time: {
      fontSize: 12,
      color: theme.secondaryTextColor || '#777',
    },

    postText: {
      fontSize: 15,
      color: theme.textColor || '#222',
      marginBottom: 8,
    },

    imageContainer: {
      flexDirection: 'row',
      marginVertical: 6,
    },
    inlinePostImage: {
      width: 220,
      height: 220,
      borderRadius: 10,
      marginRight: 8,
      resizeMode: 'cover',
    },

    actionsRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 8,
      borderTopWidth: 1,
      borderTopColor: theme.borderColor || '#eee',
      borderBottomWidth: 1,
      borderBottomColor: theme.borderColor || '#eee',
      marginTop: 8,
    },
    actionText: {
      fontSize: 14,
      color: theme.accentColor || '#0571d3',
      fontWeight: '600',
    },

    reactionsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginVertical: 4,
    },
    reactionCount: {
      fontSize: 13,
      marginRight: 6,
      color: theme.textColor || '#333',
    },

    commentsContainer: {
      marginTop: 6,
    },
    commentRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginVertical: 4,
    },
    profilePic: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: '#aaa',
      marginRight: 8,
    },
    commentBubble: {
      backgroundColor: theme.commentBackground || '#f1f0f0',
      borderRadius: 12,
      paddingVertical: 5,
      paddingHorizontal: 10,
      flex: 1,
    },
    commentUser: {
      fontWeight: 'bold',
      color: theme.textColor || '#222',
      marginBottom: 2,
    },
    commentText: {
      fontSize: 14,
      color: theme.secondaryTextColor || '#444',
    },

    viewAllCommentsText: {
      fontSize: 13,
      fontWeight: '500',
      color: theme.accentColor || '#0571d3',
      marginTop: 6,
      marginLeft: 40,
    },

    commentInputRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 8,
      borderTopWidth: 1,
      borderTopColor: theme.borderColor || '#ddd',
      paddingTop: 6,
    },
    commentInput: {
      flex: 1,
      backgroundColor: theme.inputBackground || '#fff',
      borderWidth: 1,
      borderColor: theme.borderColor || '#ccc',
      borderRadius: 8,
      paddingHorizontal: 10,
      paddingVertical: 6,
      color: theme.textColor || '#222',
      marginRight: 8,
      fontSize: 14,
    },
    commentBtnText: {
      fontWeight: '600',
      color: theme.accentColor || '#0571d3',
    },
  });
}
