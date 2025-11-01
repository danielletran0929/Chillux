import { StyleSheet, Dimensions } from 'react-native';
const { width } = Dimensions.get('window');

export default function createStyles(theme = {}) {
  return StyleSheet.create({
    pageContainer: {
      flex: 1,
      padding: 20,
      backgroundColor: theme.pageBackground || '#fff',
    },
    headerText: {
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 20,
      color: theme.textColor || '#333',
    },
    postInput: {
      borderWidth: 1,
      borderColor: theme.inputBorderColor || '#ccc',
      borderRadius: 12,
      padding: 12,
      fontSize: 16,
      minHeight: 100,
      textAlignVertical: 'top',
      backgroundColor: theme.inputBackground || '#f9f9f9',
      marginBottom: 15,
      color: theme.textColor || '#000',
    },
    postButton: {
      backgroundColor: theme.buttonBackground || '#007bff',
      paddingVertical: 12,
      borderRadius: 12,
      alignItems: 'center',
      marginBottom: 15,
    },
    postBtnText: {
      color: theme.buttonTextColor || '#fff',
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
    backButton: {
      marginBottom: 15,
      paddingVertical: 6,
      paddingHorizontal: 10,
      borderRadius: 8,
      backgroundColor: theme.backButtonBackground || '#eee',
      alignSelf: 'flex-start',
    },
    backButtonText: {
      color: theme.backButtonTextColor || '#333',
      fontWeight: 'bold',
      fontSize: 16,
    },
  });
}
