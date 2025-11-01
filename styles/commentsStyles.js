import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#eef2f5',
    padding: 10
  },
  backButton: {
    marginBottom: 10
  },
  backText: {
    color: '#0571d3',
    fontWeight: 'bold'
  },
  noCommentsText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#555'
  },
  commentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginVertical: 6
  },
  profilePic: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#aaa',
    marginRight: 0 // smaller gap
  },
  commentBubble: {
  backgroundColor: '#f1f0f0',
  paddingVertical: 6,  // reduce top/bottom padding to lift text
  paddingHorizontal: 10,
  borderRadius: 12,
  flex: 1
},
commentUser: {
  fontWeight: 'bold',
  marginBottom: 2,
  color: '#333',
  marginTop: -2  // slightly move up
},
  commentText: {
    color: '#222',
    fontSize: 14
  },
  separator: {
    height: 1,
    backgroundColor: '#ccc',
    marginVertical: 6,
    marginLeft: 42 // aligns with bubble start
  },
  inputRow: {
    flexDirection: 'row',
    padding: 10,
    borderTopWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff'
  },
  commentInput: {
    flex: 1,
    marginRight: 10,
    minHeight: 40,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6
  },
  postCommentBtn: {
    backgroundColor: '#0571d3',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center'
  }
});
