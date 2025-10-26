import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  pageContainer: {
    flex: 1,
    backgroundColor: '#eef2f5',
    paddingHorizontal: 10,
  },

  header: {
    width: '100%',
    padding: 12,
    backgroundColor: '#38b6ff',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 50,
  },
  logo: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  usernameHeader: {
    color: '#fff',
    fontWeight: 'bold',
    marginRight: 8,
  },
  logoutBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: '#fff',
    borderRadius: 6,
  },
  logoutText: {
    fontSize: 16,
  },

  newPost: {
    backgroundColor: '#fff',
    padding: 10,
    marginVertical: 8,
    width: '100%',
    borderRadius: 8,
  },
  postInput: {
    backgroundColor: '#eee',
    padding: 10,
    borderRadius: 6,
    marginBottom: 6,
  },
  quickActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  circleBtn: {
    width: 32,
    height: 32,
    backgroundColor: '#bbb',
    borderRadius: 16,
    marginRight: 6,
  },
  postButton: {
    backgroundColor: '#0571d3',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    marginLeft: 'auto',
  },
  postBtnText: {
    color: 'white',
    fontWeight: 'bold',
  },

  postCard: {
    backgroundColor: '#fff',
    padding: 12,
    marginVertical: 6,
    borderRadius: 10,
    width: '100%',
    borderBottomWidth: 1,
    borderColor: '#ddd',
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  userImg: {
    width: 40,
    height: 40,
    backgroundColor: '#aaa',
    borderRadius: 20,
    marginRight: 10,
  },
  username: {
    fontWeight: 'bold',
  },
  time: {
    color: '#555',
    fontSize: 12,
  },
  postText: {
    marginVertical: 8,
  },
  postImage: {
    width: '100%',
    height: 250,
    backgroundColor: '#bbb',
    borderRadius: 6,
    marginTop: 10,
  },

  actionsRow: {
    flexDirection: 'row',
    marginTop: 10,
    justifyContent: 'space-around',
  },
  actionText: {
    color: '#0571d3',
    fontWeight: '500',
  },
});
