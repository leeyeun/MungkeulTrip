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
import {useEffect, useState} from 'react';
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
import VersionCheck from 'react-native-version-check';
import {Alert} from 'react-native';
import {Linking} from 'react-native';

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
  // const [checkVersion, setChekcVersion] = useState(false);
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

  // const AppVersionCheck = async () => {
  //   console.log('첫진입 시작');
  //   //기기에 설치되 있는 버전
  //   let CurrentVersion = VersionCheck.getCurrentVersion();
  //   //앱의 최신버전
  //   let LatestVersion = await VersionCheck.getLatestVersion();

  //   console.log('CurrentVersion', CurrentVersion);
  //   console.log('LatestVersion', LatestVersion);
  //   //기기에 설치되있는 버전과 앱에 올려져있는 최신버전을 비교
  //   VersionCheck.needUpdate({
  //     currentVersion: CurrentVersion,
  //     latestVersion: LatestVersion,
  //   }).then((res: any) => {
  //     if (res.isNeeded) {
  //       Alert.alert(
  //         '현재 최신버전이 아닙니다. 업데이트를 위해 스토어 페이지로 이동합니다.',
  //         '',
  //         [
  //           {
  //             text: '스토어이동',
  //             onPress: () => {
  //               if (Platform.OS == 'android') {
  //                 VersionCheck.getStoreUrl({
  //                   appID: 'com.mungkeultrip',
  //                   packageName: 'com.mungkeultrip',
  //                 }).then(e => Linking.openURL(res.storeUrl));
  //                 // Linking.openURL(안드로이드 앱스토어 주소);
  //               } else {
  //                 VersionCheck.getAppStoreUrl({
  //                   appID: 'com.mungkeultrip',
  //                 }).then(e => Linking.openURL(res.storeUrl));
  //                 // Linking.openURL(IOS 앱스토어 주소);
  //               }
  //             },
  //           },
  //         ],
  //       );
  //     }
  //   });
  // };
  // useEffect(() => {
  //   AppVersionCheck();
  // }, []);
  //권한 받기
  useEffect(() => {
    if (Platform.OS == 'android') {
      const granted = requestMultiple([
        PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
        PERMISSIONS.ANDROID.CAMERA,
        PERMISSIONS.ANDROID.READ_MEDIA_IMAGES,
        PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE,
        PERMISSIONS.ANDROID.POST_NOTIFICATIONS,
      ]);
    } else {
      getRequestIosPermission();
    }
  }, []);

  const getRequestIosPermission = async () => {
    await requestMultiple([
      PERMISSIONS.IOS.LOCATION_WHEN_IN_USE,
      PERMISSIONS.IOS.LOCATION_ALWAYS,
      PERMISSIONS.IOS.CAMERA,
      PERMISSIONS.IOS.PHOTO_LIBRARY,
    ]).then(res => {
      console.log('request result !!!!!!!!!!!! ', res);
    });
    await check(PERMISSIONS.IOS.CAMERA).then(res => {
      console.log('res CAMERA =====>', res);
    });
    await check(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE).then(res => {
      console.log('res LOCATION_WHEN_IN_USE =====>', res);
    });
    await check(PERMISSIONS.IOS.LOCATION_ALWAYS).then(res => {
      console.log('res LOCATION_ALWAYS =====>', res);
    });
    await check(PERMISSIONS.IOS.PHOTO_LIBRARY).then(res => {
      console.log('res PHOTO_LIBRARY =====>', res);
    });

    // console.log('request result !!!!!!!!!!!! ');
  };

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
