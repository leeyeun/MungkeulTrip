/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import messaging from '@react-native-firebase/messaging';

// messaging().setBackgroundMessageHandler(async remoteMessage => {
//   console.log('Message handled in the background!1111', remoteMessage);
//   // PushNotification.setApplicationIconBadgeNumber(0);
//   // if (Platform.OS === 'ios') {
//   //     PushNotificationIOS.getApplicationIconBadgeNumber(function (number) {
//   //         console.log(number);
//   //         PushNotificationIOS.setApplicationIconBadgeNumber(number + 1);
//   //     });
//   // }
// });

AppRegistry.registerComponent(appName, () => App);
