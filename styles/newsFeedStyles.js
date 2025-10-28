import { StyleSheet } from 'react-native';

export default function createStyles(theme = {}) {
  // default colors
  const defaultTheme = {
    pageBackground: '#eef2f5',
    headerBackground: '#38b6ff',
    usernameColor: '#555',
    buttonBackground: '#0571d3',
    buttonTextColor: '#fff',
    postBackground: '#fff',
    textColor: '#222',
    reactionTextColor: '#0571d3',
    commentBackground: '#f5f5f5',
    emojiPopupBackground: '#fff',
  };

  const customTheme = { ...defaultTheme, ...theme };

  return StyleSheet.create({
    pageContainer: {
      flex: 1,
      backgroundColor: customTheme.pageBackground,
      paddingHorizontal: 10,
    },
    header: {
      width: '100%',
      padding: 12,
      backgroundColor: customTheme.headerBackground,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 50,
    },
    logo: { width: 40, height: 40, resizeMode: 'contain' },
    headerRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    usernameHeader: {
      color: customTheme.usernameColor,
      fontWeight: 'bold',
      marginRight: 8,
    },
    logoutBtn: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      backgroundColor: customTheme.buttonBackground,
      borderRadius: 6,
    },
    logoutText: { fontSize: 16, color: customTheme.buttonTextColor },
    createPostBtn: {
      backgroundColor: customTheme.buttonBackground,
      paddingVertical: 12,
      borderRadius: 6,
      marginVertical: 10,
      alignItems: 'center',
    },
    createPostText: { color: customTheme.buttonTextColor, fontWeight: 'bold' },
    postCard: {
      backgroundColor: customTheme.postBackground,
      padding: 12,
      marginVertical: 6,
      borderRadius: 10,
      width: '100%',
      borderBottomWidth: 1,
      borderColor: '#ddd',
    },
    postHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
    userImgPlaceholder: {
      width: 40,
      height: 40,
      backgroundColor: '#aaa',
      borderRadius: 20,
      marginRight: 10,
    },
    username: { fontWeight: 'bold', color: customTheme.usernameColor },
    time: { color: '#555', fontSize: 12 },
    postText: { marginVertical: 8, color: customTheme.textColor },
    inlinePostImage: {
      width: 150,
      height: 150,
      borderRadius: 10,
      marginRight: 10,
    },
    imageContainer: { marginVertical: 10 },
    actionsRow: {
      flexDirection: 'row',
      marginTop: 10,
      justifyContent: 'space-around',
    },
    actionText: { color: customTheme.textColor, fontWeight: '500' },
    reactionsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginTop: 5,
    },
    reactionCount: { marginRight: 6, fontSize: 16, color: customTheme.reactionTextColor },
    commentsContainer: { marginTop: 6 },
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
      marginRight: 1,
    },
    commentBubble: {
      paddingVertical: 6,
      paddingHorizontal: 10,
      borderRadius: 12,
      flex: 1,
      backgroundColor: customTheme.commentBackground,
    },
    commentUser: {
      fontWeight: 'bold',
      marginBottom: 2,
      marginTop: -2,
      color: customTheme.usernameColor,
    },
    commentText: { color: customTheme.textColor, fontSize: 14 },
    commentInputRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 8,
    },
    commentInput: {
      flex: 1,
      borderWidth: 1,
      borderColor: '#ccc',
      borderRadius: 20,
      paddingHorizontal: 12,
      height: 36,
      color: customTheme.textColor,
    },
    commentBtnText: {
      marginLeft: 8,
      color: customTheme.buttonBackground,
      fontWeight: 'bold',
    },
    modalBackdrop: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.4)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    emojiPopup: {
      backgroundColor: customTheme.emojiPopupBackground,
      padding: 14,
      borderRadius: 12,
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'center',
    },
    emojiPopupText: { fontSize: 28 },
    bigEmojiSheet: {
      position: 'absolute',
      bottom: 0,
      width: '100%',
      height: '50%',
      backgroundColor: customTheme.pageBackground,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      paddingHorizontal: 5, // only horizontal padding
      paddingTop: 10,
      paddingBottom: 10,
      justifyContent: 'center',
      alignItems: 'center',
    },
    bigEmojiItem: {
  width: '15%', // ~1/6th minus spacing
  aspectRatio: 1, // square
  justifyContent: 'center',
  alignItems: 'center',
  marginVertical: 2,
},
    bigEmojiTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 10,
      textAlign: 'center',
      color: customTheme.textColor,
    },
    bigEmojiText: { fontSize: 30 },
    bigEmojiClose: {
      width: '100%',
      paddingVertical: 12,
      alignItems: 'center',
      backgroundColor: customTheme.buttonBackground,
      borderRadius: 10,
    },
  });
}
