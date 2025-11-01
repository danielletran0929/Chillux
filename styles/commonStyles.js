import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#121212', // true dark background
  },
  panel: {
    width: '100%',
    maxWidth: 350,
    backgroundColor: 'rgba(255, 255, 255, 0.08)', // softer glass effect
    padding: 25,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)', // subtle outline
    // Removed harsh elevation/shadows
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 4,
  },
  logo: {
    width: 110,
    height: 110,
    resizeMode: 'contain',
    marginBottom: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
    color: '#fff',
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    padding: 12,
    borderRadius: 8,
    marginVertical: 8,
    color: '#fff',
  },
  button: {
    paddingHorizontal: 50,
    paddingVertical: 14,
    borderRadius: 10,
    margin: -5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  forgotButton: {
    padding: 12,
    borderRadius: 10,
    marginTop: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
  fontSize: 16, 
  textAlign: 'center',
  color: '#ffffffff',
  fontWeight: '800',
  letterSpacing: 1, 
  textTransform: 'uppercase', 
  textShadowOffset: { width: 0, height: 1 },
  textShadowRadius: 1,
  },
  forgotButtonText: {
  fontSize: 16, 
  textAlign: 'center',
  color: '#ffffffff',
  fontWeight: '800',
  textShadowOffset: { width: 0, height: 1 },
  textShadowRadius: 1,
  },
  forgotButtonText2: {
  textAlign: 'center',
  fontSize: 12,
  color: '#fda85e',
  fontWeight: '500',
  },
});