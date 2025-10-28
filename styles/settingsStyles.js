import { StyleSheet } from 'react-native';

export default function createSettingsStyles(theme = {}) {
  const defaultTheme = {
    pageBackground: '#eef2f5',
    headerBackground: '#38b6ff',
    textColor: '#222',
    buttonBackground: '#0571d3',
    buttonTextColor: '#fff',
    sectionBackground: '#fff',
    sectionTextColor: '#333',
    borderColor: '#ccc',
  };

  const customTheme = { ...defaultTheme, ...theme };

  return StyleSheet.create({
    pageContainer: {
      flex: 1,
      backgroundColor: customTheme.pageBackground,
      padding: 12,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: customTheme.sectionTextColor,
      marginVertical: 12,
    },
    sectionRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 14,
      paddingHorizontal: 12,
      backgroundColor: customTheme.sectionBackground,
      borderRadius: 12,
      marginBottom: 10,
      borderWidth: 1,
      borderColor: customTheme.borderColor,
      elevation: 3, // Android-only shadow
    },
    sectionText: {
      fontSize: 16,
      color: customTheme.sectionTextColor,
    },
    button: {
      backgroundColor: customTheme.buttonBackground,
      paddingVertical: 14,
      borderRadius: 10,
      alignItems: 'center',
      marginVertical: 20,
      elevation: 4, // Android-only shadow for button
    },
    buttonText: {
      color: customTheme.buttonTextColor,
      fontWeight: 'bold',
      fontSize: 16,
    },
  });
}
