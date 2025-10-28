import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  pageContainer: {
    flex: 1,
    backgroundColor: '#eef2f5',
    paddingHorizontal: 10
  },

  header: {
    width: '100%',
    padding: 12,
    backgroundColor: '#38b6ff',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 50
  },
  logo: {
    width: 40,
    height: 40,
    resizeMode: 'contain'
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  usernameHeader: {
    color: '#fff',
    fontWeight: 'bold',
    marginRight: 8
  },
  logoutBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: '#fff',
    borderRadius: 6
  },
  logoutText: {
    fontSize: 16
  },

  createPostBtn: {
    backgroundColor: '#0571d3',
    paddingVertical: 12,
    borderRadius: 6,
    marginVertical: 10,
    alignItems: 'center'
  },
  createPostText: {
    color: '#fff',
    fontWeight: 'bold'
  },

  postCard: {
    backgroundColor: '#fff',
    padding: 12,
    marginVertical: 6,
    borderRadius: 10,
    width: '100%',
    borderBottomWidth: 1,
    borderColor: '#ddd'
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6
  },
  userImgPlaceholder: {
    width: 40,
    height: 40,
    backgroundColor: '#aaa',
    borderRadius: 20,
    marginRight: 10
  },
  username: {
    fontWeight: 'bold'
  },
  time: {
    color: '#555',
    fontSize: 12
  },
  postText: {
    marginVertical: 8
  },

  inlinePostImage: {
    width: 150,
    height: 150,
    borderRadius: 10,
    marginRight: 10
  },
  imageContainer: {
    marginVertical: 10
  },

  actionsRow: {
    flexDirection: 'row',
    marginTop: 10,
    justifyContent: 'space-around'
  },
  actionText: {
    color: '#0571d3',
    fontWeight: '500'
  },

  reactionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 5
  },
  reactionCount: {
    marginRight: 6,
    fontSize: 16
  },

  commentsContainer: {
    marginTop: 6
  },
  commentItem: {
    flexDirection: 'row',
    marginVertical: 2
  },
  commentUser: {
    fontWeight: 'bold',
    marginRight: 4
  },
  commentText: {},
  viewAllCommentsText: {
    color: '#0571d3',
    marginTop: 4,
    fontWeight: '500'
  },

  commentInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8
  },
  commentInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 20,
    paddingHorizontal: 12,
    height: 36
  },
  commentBtnText: {
    marginLeft: 8,
    color: '#0571d3',
    fontWeight: 'bold'
  },

  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center'
  },

  emojiPopup: {
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 12,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center'
  },
  emojiPopupItem: {
    margin: 6
  },
  emojiPopupText: {
    fontSize: 28
  },

  bigEmojiSheet: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: '50%',
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 15
  },
  bigEmojiTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center'
  },
  bigEmojiItem: {
    width: '16%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  bigEmojiText: {
    fontSize: 30
  },
  bigEmojiClose: {
    width: '100%',
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#eee',
    marginTop: 6,
    borderRadius: 10
  },

  commentBox: {
    backgroundColor: '#fff',
    padding: 18,
    borderRadius: 12,
    width: '90%'
  },
  postCommentBtn: {
    backgroundColor: '#0571d3',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8
  },
  cancelCommentBtn: {
    backgroundColor: '#ccc',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8
  },
  commentRow: {
  flexDirection: 'row',
  alignItems: 'flex-start',
  marginVertical: 4
},
profilePic: {
  width: 32,
  height: 32,
  borderRadius: 16,
  backgroundColor: '#aaa',
  marginRight: 1
},
commentBubble: {
  paddingVertical: 6,
  paddingHorizontal: 10,
  borderRadius: 12,
  flex: 1
},
commentUser: {
  fontWeight: 'bold',
  marginBottom: 2,
  color: '#333',
  marginTop: -2
},
commentText: {
  color: '#222',
  fontSize: 14
}

});
