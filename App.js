import React, { useEffect, useState } from 'react';
import {
  NavigationContainer,
  getFocusedRouteNameFromRoute,
} from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ActivityIndicator, View } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

// Screens
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
const Tab = createBottomTabNavigator();

/* ✅ Profile Stack (handles your profile + others') */
function ProfileStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {/* Your profile when accessed from the tab */}
      <Stack.Screen name="MyProfile">
        {props => <Profile {...props} fromTab={true} />}
      </Stack.Screen>

      {/* Other people's profiles */}
      <Stack.Screen name="Profile" component={Profile} />
      <Stack.Screen name="EditProfile" component={EditProfile} />
      <Stack.Screen name="Gallery" component={Gallery} />
    </Stack.Navigator>
  );
}

/* ✅ Main Tabs (Bottom Navbar) */
function MainTabs({ setLoggedIn }) {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopColor: '#ddd',
          height: 60,
          paddingBottom: 6,
          paddingTop: 6,
        },
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: '#777',
      }}
    >
      {/* ---------- FEED TAB ---------- */}
      <Tab.Screen
        name="Feed"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <Icon
              name={focused ? 'home' : 'home-outline'}
              size={22}
              color={color}
            />
          ),
        }}
      >
        {props => <NewsFeed {...props} setLoggedIn={setLoggedIn} />}
      </Tab.Screen>

      {/* ---------- PROFILE STACK TAB ---------- */}
      <Tab.Screen
        name="ProfileStack"
        component={ProfileStack}
        options={({ route }) => {
          const routeName = getFocusedRouteNameFromRoute(route) ?? 'MyProfile';
          const isMyProfileActive = routeName === 'MyProfile';

          return {
            title: 'Profile',
            tabBarIcon: ({ color }) => (
              <Icon
                name={isMyProfileActive ? 'person' : 'person-outline'}
                size={22}
                color={color}
              />
            ),
            tabBarActiveTintColor: isMyProfileActive ? '#007AFF' : '#777',
          };
        }}
        listeners={({ navigation }) => ({
          tabPress: e => {
            // Always return to your own profile when pressing the Profile tab
            e.preventDefault();
            navigation.navigate('ProfileStack', { screen: 'MyProfile' });
          },
        })}
      />

      {/* ---------- SETTINGS TAB ---------- */}
      <Tab.Screen
        name="Settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, focused }) => (
            <Icon
              name={focused ? 'settings' : 'settings-outline'}
              size={22}
              color={color}
            />
          ),
        }}
      >
        {props => <Settings {...props} setLoggedIn={setLoggedIn} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

/* ---------- APP ROOT ---------- */
export default function App() {
  const [loading, setLoading] = useState(true);
  const [loggedIn, setLoggedIn] = useState(false);

  // Check login status
  useEffect(() => {
    async function checkLogin() {
      const isLogged = await AsyncStorage.getItem('isLoggedIn');
      setLoggedIn(isLogged === 'true');
      setLoading(false);
    }
    checkLogin();
  }, []);

  // Loading screen
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
            {/* ✅ Tabs */}
            <Stack.Screen name="Main">
              {props => <MainTabs {...props} setLoggedIn={setLoggedIn} />}
            </Stack.Screen>

            {/* ✅ Allow viewing other users' profiles */}
            <Stack.Screen name="ProfileView" component={Profile} />

            {/* ✅ Other modal screens */}
            <Stack.Screen name="CreatePost" component={CreatePost} options={{ presentation: 'modal' }} />
            <Stack.Screen name="Comments" component={Comments} options={{ presentation: 'modal' }} />

            <Stack.Screen name="ChangeEmail" component={ChangeEmail} />
            <Stack.Screen name="ChangePassword" component={ChangePassword} />
            <Stack.Screen name="ChangeUsername" component={ChangeUsername} />
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
