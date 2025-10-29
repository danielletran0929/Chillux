import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export default function createStyles() {
  return StyleSheet.create({
    pageContainer: {
      flex: 1,
      padding: 15,
    },

    profilePic: {
      width: 120,
      height: 120,
      borderRadius: 60,
      alignSelf: 'center',
      marginVertical: 10,
      borderWidth: 2,
      borderColor: '#ccc',
    },

    coverPhoto: {
      width: width - 30,
      height: 180,
      borderRadius: 10,
      alignSelf: 'center',
      marginVertical: 10,
    },

    changeText: {
      textAlign: 'center',
      color: '#555',
      marginBottom: 15,
    },

    bioInput: {
      borderWidth: 1,
      borderColor: '#ccc',
      borderRadius: 8,
      padding: 10,
      fontSize: 16,
      marginBottom: 20,
    },

    saveBtn: {
      padding: 15,
      borderRadius: 10,
      marginVertical: 20,
      alignItems: 'center',
      justifyContent: 'center',
    },

    saveBtnText: {
      fontSize: 18,
      fontWeight: 'bold',
    },

    // Theme color boxes
    colorBox: {
      width: '100%',
      padding: 15,
      borderRadius: 8,
      marginBottom: 10,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: '#ccc',
    },

    colorBoxText: {
      fontWeight: 'bold',
      color: '#fff',
    },
  });
}
