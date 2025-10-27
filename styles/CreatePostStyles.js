import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export default StyleSheet.create({
  pageContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },

  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },

  postInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
    backgroundColor: '#f9f9f9',
    marginBottom: 15,
  },

  postButton: {
    backgroundColor: '#007bff',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 15,
  },

  postBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },

  imagePreviewContainer: {
    flexDirection: 'row',
    marginBottom: 15,
  },

  postImage: {
    width: width / 3 - 20,
    height: width / 3 - 20,
    borderRadius: 10,
    marginRight: 10,
  },
});
