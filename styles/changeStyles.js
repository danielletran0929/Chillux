import { StyleSheet } from 'react-native';

export default function createChangeStyles(theme = {}) {
  const defaultTheme = {
    pageBackground: '#eef2f5',
    textColor: '#222',
    inputBackground: '#fff',
    inputBorder: '#ccc',
    buttonBackground: '#0571d3',
    buttonTextColor: '#fff',
  };

  const customTheme = { ...defaultTheme, ...theme };

  return StyleSheet.create({
    pageContainer: {
      flex: 1,
      backgroundColor: customTheme.pageBackground,
      padding: 16,
    },
    backBtn: {
      marginBottom: 20,
    },
    backText: {
      color: customTheme.textColor,
      fontSize: 16,
    },
    title: {
      fontSize: 22,
      fontWeight: 'bold',
      color: customTheme.textColor,
      marginBottom: 20,
    },
    input: {
      backgroundColor: customTheme.inputBackground,
      borderWidth: 1,
      borderColor: customTheme.inputBorder,
      borderRadius: 10,
      paddingHorizontal: 12,
      paddingVertical: 10,
      fontSize: 16,
      marginBottom: 20,
    },
    saveBtn: {
      backgroundColor: customTheme.buttonBackground,
      paddingVertical: 14,
      borderRadius: 10,
      alignItems: 'center',
    },
    saveText: {
      color: customTheme.buttonTextColor,
      fontWeight: 'bold',
      fontSize: 16,
    },
  });
}
