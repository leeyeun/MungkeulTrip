/**
 * @format
 */

import {
  AppRegistry,
  Text,
  TextInput,
  LogBox,
  Platform,
  AppState,
} from 'react-native';
import {name as appName} from './app.json';
import Router from './src/router/Router';
import SplashScreen from 'react-native-splash-screen';
import {useEffect} from 'react';
import {
  check,
  PERMISSIONS,
  request,
  RESULTS,
  requestMultiple,
  requestNotifications,
} from 'react-native-permissions';
import messaging from '@react-native-firebase/messaging';
import PushNotification, {Importance} from 'react-native-push-notification';
import PushNotificationIOS from '@react-native-community/push-notification-ios';
interface TextWithDefaultProps extends Text {
  defaultProps?: {allowFontScaling?: boolean};
}

interface TextInputWithDefaultProps extends TextInput {
  defaultProps?: {allowFontScaling?: boolean};
}

LogBox.ignoreLogs(['new NativeEventEmitter']); // Ignore log notification by message
LogBox.ignoreAllLogs(); //Ignore all log notifications

(Text as unknown as TextWithDefaultProps).defaultProps =
  (Text as unknown as TextWithDefaultProps).defaultProps || {};
(Text as unknown as TextWithDefaultProps).defaultProps!.allowFontScaling =
  false;
(TextInput as unknown as TextInputWithDefaultProps).defaultProps =
  (TextInput as unknown as TextInputWithDefaultProps).defaultProps || {};
(
  TextInput as unknown as TextInputWithDefaultProps
).defaultProps!.allowFontScaling = false;

// Register background handler

function App() {
  // firebase.initializeApp();
  useEffect(() => {
    try {
      setTimeout(() => {
        SplashScreen.hide(); /** 추가 **/
      }, 2000); /** 스플래시 시간 조절 (2초) **/
    } catch (e) {
      console.warn('에러발생');
      console.warn(e);
    }
  });

  const handleAppStateChange = () => {
    if (Platform.OS == 'ios') {
      // PushNotificationIOS.removeAllDeliveredNotifications();
      PushNotificationIOS.setApplicationIconBadgeNumber(0);
      // PushNotificationIOS.getBadgeCount()
    }
    PushNotification.cancelAllLocalNotifications();
  };

  useEffect(() => {
    const addListenerEvent = AppState.addEventListener(
      'change',
      handleAppStateChange,
    );
    return () => {
      addListenerEvent.remove();
    };
  }, []);

  useEffect(() => {
    if (Platform.OS == 'android') {
      (async () => {
        PushNotification.createChannel(
          {
            channelId: 'mungkeultrip', // (required)
            channelName: '뭉클트립', // (required)
            channelDescription: 'A channel to categorise your notifications', // (optional) default: undefined.
            playSound: true, // (optional) default: true
            soundName: 'default', // (optional) See `soundName` parameter of `localNotification` function
            importance: Importance.HIGH, // (optional) default: Importance.HIGH. Int value of the Android notification importance
            vibrate: true, // (optional) default: true. Creates the default vibration patten if true.
          },
          created => console.log(`createChannel returned '${created}'`), // (optional) callback returns whether the channel was created, false means it already existed.
        );
      })();
    }
  }, []);
  return <Router />;
}

export default App;
