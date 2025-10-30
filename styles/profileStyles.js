// profileStyles.js
import { StyleSheet } from 'react-native';

export default function createStyles(theme = {}) {
  const t = {
    pageBackground: theme.pageBackground ?? '#eef2f5',
    textColor: theme.textColor ?? '#222',
    usernameColor: theme.usernameColor ?? '#333',
    bioTextColor: theme.bioTextColor ?? '#444',
    buttonBackground: theme.buttonBackground ?? '#0571d3',
    buttonTextColor: theme.buttonTextColor ?? '#fff',
    sectionTextColor: theme.sectionTextColor ?? '#333',
    postBackground: theme.postBackground ?? '#fff',
    commentBackground: theme.commentBackground ?? '#f5f5f5',
    profileBorderColor: theme.profileBorderColor ?? '#0571d3',
  };

  return StyleSheet.create({
    // MAIN PAGE
    pageContainer: {
      flex: 1,
      backgroundColor: t.pageBackground,
      paddingBottom: 20,
    },

    // PROFILE HEADER
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
      borderColor: t.profileBorderColor,
      backgroundColor: '#aaa',
    },
    username: {
      fontWeight: 'bold',
      color: t.usernameColor,
      fontSize: 18,
      marginTop: 6,
    },
    bioText: {
      marginTop: 10,
      marginHorizontal: 15,
      fontSize: 13,
      color: t.bioTextColor,
    },

    // ACTION BUTTONS
    actionBtn: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
      backgroundColor: t.buttonBackground,
    },
    actionBtnText: {
      color: t.buttonTextColor,
      fontWeight: 'bold',
      fontSize: 14,
    },

    // SECTION HEADERS
    sectionTitle: {
      fontSize: 15,
      fontWeight: 'bold',
      marginBottom: 6,
      color: t.sectionTextColor,
      marginHorizontal: 5,
    },

    // FRIENDS SECTION
    friendItem: {
      width: '48%',
      marginBottom: 10,
      aspectRatio: 1,
      borderRadius: 10,
      overflow: 'hidden',
    },
    friendImg: {
      width: '100%',
      height: '100%',
      resizeMode: 'cover',
    },
    viewAllFriendsBtn: {
      width: '100%',
      marginTop: 5,
    },
    viewAllFriendsText: {
      textAlign: 'center',
      color: t.buttonBackground,
      fontWeight: 'bold',
    },

    // GALLERY
    galleryItem: {
      width: '48%',
      marginBottom: 10,
      aspectRatio: 1,
      borderRadius: 10,
      overflow: 'hidden',
    },
    galleryImg: {
      width: '100%',
      height: '100%',
      resizeMode: 'cover',
    },

    // POSTS
    postCard: {
      backgroundColor: t.postBackground,
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
    postText: {
      color: t.textColor,
      fontSize: 13,
    },
    inlinePostImage: {
      width: 120,
      height: 120,
      borderRadius: 8,
      marginRight: 8,
    },
    imageContainer: {
      marginVertical: 8,
    },

    // COMMENTS
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
      backgroundColor: t.commentBackground,
    },
    commentUser: {
      fontWeight: 'bold',
      marginBottom: 1,
      color: t.usernameColor,
      fontSize: 12,
    },
    commentText: {
      color: t.textColor,
      fontSize: 12,
    },

    // FRIENDS & GALLERY GRID
    friendsGalleryRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 15,
      paddingHorizontal: 10,
    },
    friendsContainer: {
      flex: 1,
      marginRight: 10,
    },
    galleryContainer: {
      flex: 1,
      marginLeft: 10,
    },
    friendsGalleryGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
    },
  });
}
