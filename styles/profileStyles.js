import { StyleSheet } from 'react-native';

export default function createStyles() {
  const theme = {
    pageBackground: '#eef2f5',
    textColor: '#222',
    usernameColor: '#555',
    buttonBackground: '#0571d3',
    buttonTextColor: '#fff',
    sectionTextColor: '#333',
    postBackground: '#fff',
    commentBackground: '#f5f5f5',
  };

  return StyleSheet.create({
    // Profile screen
    pageContainer: {
      flex: 1,
      backgroundColor: theme.pageBackground,
      paddingBottom: 20,
    },
    coverPhoto: {
      width: '100%',
      height: 180,
    },
    profileRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: -45,
      paddingHorizontal: 15,
      justifyContent: 'space-between',
    },
    profilePic: {
      width: 90,
      height: 90,
      borderRadius: 45,
      borderWidth: 3,
      borderColor: '#fff',
      backgroundColor: '#aaa',
    },
    actionBtn: {
      backgroundColor: theme.buttonBackground,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
    },
    actionBtnText: {
      color: theme.buttonTextColor,
      fontWeight: 'bold',
      fontSize: 14,
    },
    bioText: {
      marginTop: 10,
      marginHorizontal: 15,
      fontSize: 13,
      color: theme.textColor,
    },

    // Sections
    sectionTitle: {
      fontSize: 15,
      fontWeight: 'bold',
      marginBottom: 6,
      color: theme.sectionTextColor,
      marginHorizontal: 5,
    },

    // Friends list
    friendImg: {
      width: 48,
      height: 48,
      borderRadius: 24,
    },
    friendItem: {
      margin: 3,
    },

    // Uploaded gallery
    galleryImg: {
      width: '48%',
      aspectRatio: 1,
      margin: '1%',
      borderRadius: 8,
    },

    // Posts
    postCard: {
      backgroundColor: theme.postBackground,
      padding: 10,
      marginVertical: 6,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: '#ddd',
    },
    postHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 6,
    },
    username: {
      fontWeight: 'bold',
      color: theme.usernameColor,
      fontSize: 14,
      marginBottom: 2,
    },
    postText: { color: theme.textColor, fontSize: 13 },
    inlinePostImage: {
      width: 120,
      height: 120,
      borderRadius: 8,
      marginRight: 8,
    },
    imageContainer: { marginVertical: 8 },

    commentRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginVertical: 3,
    },
    profilePicSmall: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: '#aaa',
      marginRight: 4,
    },
    commentBubble: {
      paddingVertical: 4,
      paddingHorizontal: 8,
      borderRadius: 10,
      flex: 1,
      backgroundColor: theme.commentBackground,
    },
    commentUser: {
      fontWeight: 'bold',
      marginBottom: 1,
      color: theme.usernameColor,
      fontSize: 12,
    },
    commentText: { color: theme.textColor, fontSize: 12 },

    // Friends & gallery row
    friendsGalleryRow: {
      flexDirection: 'row',
      marginTop: 15,
      paddingHorizontal: 10,
    },
    friendsContainer: { flex: 1, marginRight: 5 },
    galleryContainer: { flex: 1, marginLeft: 5 },
    galleryGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  });
}
