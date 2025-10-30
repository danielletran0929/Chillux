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
    presetButton: {
  paddingVertical: 8,
  paddingHorizontal: 12,
  borderRadius: 8,
  marginRight: 10,
  marginBottom: 10,
},

  });
  
}
// --- Theme Presets ---
export const themePresets = {
  default: {
    pageBackground: '#eef2f5',
    headerBackground: '#38b6ff',
    buttonBackground: '#0571d3',
    buttonTextColor: '#fff',
    textColor: '#222',
    postBackground: '#fff',
    profileBorderColor: '#0571d3',
  },
  dark: {
    pageBackground: '#121212',
    headerBackground: '#1f1f1f',
    buttonBackground: '#bb86fc',
    buttonTextColor: '#000',
    textColor: '#e0e0e0',
    postBackground: '#1e1e1e',
    profileBorderColor: '#bb86fc',
  },
  sunset: {
    pageBackground: '#fff2e6',
    headerBackground: '#ff7f50',
    buttonBackground: '#ff4500',
    buttonTextColor: '#fff',
    textColor: '#4b2e2e',
    postBackground: '#ffe5d4',
    profileBorderColor: '#ff6347',
  },
  mint: {
    pageBackground: '#e6fff7',
    headerBackground: '#2ecc71',
    buttonBackground: '#27ae60',
    buttonTextColor: '#fff',
    textColor: '#145a32',
    postBackground: '#d4f7e3',
    profileBorderColor: '#27ae60',
  },
  pastel: {
    pageBackground: '#fff0f5',
    headerBackground: '#f7a1c4',
    buttonBackground: '#f06292',
    buttonTextColor: '#fff',
    textColor: '#4b2e2e',
    postBackground: '#ffe6f0',
    profileBorderColor: '#f06292',
  },
  
};

