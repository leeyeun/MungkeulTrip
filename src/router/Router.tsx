import React, {useEffect} from 'react';
import {NavigationContainer, DefaultTheme} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {Linking} from 'react-native';
import {HomePage} from '../page';
const Stack = createStackNavigator();
const Router = (props: any) => {
  const forFade = ({current}) => ({
    cardStyle: {opacity: current.progress},
  });
  const linking = {
    prefixes: [
      'kakao469ed0cdfd8041341909dcc7d2ce0ac5://',
      'https://...',
      'http://localhost:3000',
      'intent:',
      'intent:kakaotalk://',
      'kakaotalk://',
    ],
  };
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: '#ffffff',
          },
          headerTintColor: '#ffffff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          headerShown: false,
        }}
        initialRouteName={'HomePage'}>
        {/* 홈 화면 */}
        <Stack.Screen
          name="HomePage"
          component={HomePage}
          headerShown={false}
          options={{
            gestureEnabled: true,
            headerShown: false,
            cardStyleInterpolator: forFade,
            gestureDirection: 'horizontal',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
export default Router;
Router.defatulProps = {
  userInfo: null,
};
