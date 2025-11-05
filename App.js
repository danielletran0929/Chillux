import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ActivityIndicator, View } from 'react-native';

import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import NewsFeed from './screens/NewsFeed';
import ForgotPassword from './screens/ForgotPassword';
import CreatePost from './screens/CreatePost';
import Comments from './screens/Comments';
import Profile from './screens/ProfileScreen';
import Settings from './screens/Settings';
import ChangeEmail from './screens/ChangeEmail';
import ChangePassword from './screens/ChangePassword';
import ChangeUsername from './screens/ChangeUsername';
import EditProfile from './screens/EditProfile';
import Gallery from './screens/Gallery';

const Stack = createStackNavigator();

export default function App() {
  const [loading, setLoading] = useState(true);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    async function checkLogin() {
      const isLogged = await AsyncStorage.getItem('isLoggedIn');
      setLoggedIn(isLogged === 'true');
      setLoading(false);
    }

    checkLogin();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
  <NavigationContainer>
    <Stack.Navigator screenOptions={{ headerShown: false }}>

      {loggedIn ? (
        <>
          <Stack.Screen name="Home">
            {props => <NewsFeed {...props} setLoggedIn={setLoggedIn} />}
          </Stack.Screen>
          <Stack.Screen name="CreatePost" component={CreatePost} />
          <Stack.Screen name="Comments" component={Comments} />
          <Stack.Screen name="Profile" component={Profile} />
          <Stack.Screen name="Settings">
            {props => <Settings {...props} setLoggedIn={setLoggedIn} />}
          </Stack.Screen>
          <Stack.Screen name="ChangeEmail" component={ChangeEmail} />
          <Stack.Screen name="ChangePassword" component={ChangePassword} />
          <Stack.Screen name="ChangeUsername" component={ChangeUsername} />
          <Stack.Screen name="EditProfile" component={EditProfile} />
          <Stack.Screen name="Gallery" component={Gallery} />
        </>
      ) : (
        <>
          <Stack.Screen name="Login">
            {props => <LoginScreen {...props} setLoggedIn={setLoggedIn} />}
          </Stack.Screen>
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen name="ForgotPassword" component={ForgotPassword} />
        </>
      )}

    </Stack.Navigator>
  </NavigationContainer>
);

}
