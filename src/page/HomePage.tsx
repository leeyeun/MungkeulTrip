import React, {useCallback, useEffect, useState} from 'react';
import {
  SafeAreaView,
  StatusBar,
  View,
  Dimensions,
  Platform,
  Alert,
  BackHandler,
  Linking,
} from 'react-native';
import RNExitApp from 'react-native-exit-app';
import {WebView} from 'react-native-webview';
import messaging from '@react-native-firebase/messaging';
import PushNotification, {Importance} from 'react-native-push-notification';
import PushNotificationIOS from '@react-native-community/push-notification-ios';
import appleAuth from '@invertase/react-native-apple-authentication';

const HomePage = props => {
  const {route, navigation} = props;
  const webViews = React.useRef();
  let {height, width} = Dimensions.get('window');
  const [token, setToken] = useState('');
  //웹작업 토큰이 회원테이블에 있으면 자동로그인 없으면 로그인 페이지로 작업
  const domain_url = 'https://lulu.dmonster.kr';
  const app_url = domain_url + '/';
  const url = `${app_url}auth.php?chk_app=Y&app_token=`;
  const indexurl = `${app_url}auth.php?chk_app=Y&app_token=${token}&chk_app=Y`;
  const [webview_url, set_webview_url] = React.useState(url);
  const [cangoback, setCangoBack] = useState(false);
  const [iosSwiper, setIosSwiper] = useState(true);
  useEffect(() => {
    PushDatas();
  }, []);

  const PushDatas = async () => {
    //포그라운드 노티 처리
    PushNotification.configure({
      onRegister: function (token) {
        console.log('TOKEN:', token);
      },
      onNotification: async function (notification) {
        const ttokenee = await messaging().getToken();
        console.log('ttokenee', ttokenee);
        console.log('-------------클릭시 먹는 페이지-------------');
        console.log(notification);
        console.log('------------------------------------------');
        notification.finish(PushNotificationIOS.FetchResult.NoData);
      },
      onAction: function (notification) {
        console.log('ACTION:', notification.action);
        console.log('NOTIFICATION:', notification);
      },
      onRegistrationError: function (err) {
        console.error(err.message, err);
      },
      permissions: {
        alert: true,
        badge: true,
        sound: true,
      },
      popInitialNotification: true,
      requestPermissions: true,
    });
  };
  React.useEffect(() => {
    //푸시 갯수 초기화
    PushNotification.setApplicationIconBadgeNumber(0);
    //기기토큰 가져오기
    async function requestUserPermission() {
      if (Platform.OS == 'android') {
        // console.log('~~~~~');
        const authStatus = await messaging().requestPermission();
        const enabled =
          authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
          authStatus === messaging.AuthorizationStatus.PROVISIONAL;
        if (enabled) {
          await get_token();
        }
      } else {
        const authorizationStatus = await messaging().requestPermission();
        // 권한상태 (-1: 요청 안함, 0: 거부, 1: 수락, 2: 임시권한)
        switch (authorizationStatus) {
          case 0:
            await get_token();
            break;
          case 1:
            // 토큰 요청
            await get_token();
            break;
          default:
            await get_token();
            break;
        }
      }
    }
    async function get_token() {
      await messaging()
        .getToken()
        .then(token => {
          if (token) {
            setToken(token);
            set_webview_url(
              `${domain_url}/auth.php?chk_app=Y&app_token=${token}`,
            );
            console.log('token:::::', token);
            return true;
          } else {
            return false;
          }
        });
    }
    requestUserPermission();
  }, []);
  const onWebViewMessage = (webViewss: any) => {
    let jsonData = JSON.parse(webViewss.nativeEvent.data);
    console.log('jsonData', jsonData);
    if (jsonData.id == 'pagemove') {
      Linking.openURL(jsonData.url);
    } else if (jsonData.id == 'appleLogin') {
      snsLoginWithApple();
    }
  };

  const onNavigationStateChange = async (webViewState: any) => {
    console.log('webViewState ======> ', webViewState.url);
    setCangoBack(webViewState.canGoBack);
    set_webview_url(webViewState.url);
    if (webViewState.url == 'https://lulu.dmonster.kr/') {
      setIosSwiper(false);
    } else {
      setIosSwiper(true);
    }
    BackHandler.addEventListener('hardwareBackPress', handleBackButton);
  };

  const handleBackButton = async () => {
    if (navigation.isFocused() === true) {
      // 제일 첫페이지, 특정 페이지에서 뒤로가기시 어플 종료
      if (
        webview_url == domain_url ||
        webview_url.includes('index.php') ||
        webview_url.includes('location.php') ||
        webview_url.includes('more.php') ||
        webview_url.includes('table_1.php') ||
        webview_url.includes('graph_1.php') ||
        webview_url.includes('board.php')
      ) {
        Alert.alert('뭉클트립', '어플을 종료할까요?', [
          {
            text: '네',
            onPress: () => {
              RNExitApp.exitApp();
            },
          },
          {
            text: '아니요',
            onPress: () => null,
          },
        ]);
        return true;
      } else {
        if (webViews.current && cangoback) {
          webViews.current.injectJavaScript('javascript:history.back();');
        } else {
          set_webview_url(webview_url);
          // set_webview_url(url + fcmToken);
        }
        // BackKeyApi(urls);
      }
      return true;
    } else {
      return false;
    }
  };

  // useEffect(() => {
  //   if (token != '') {
  //     set_webview_url(`${domain_url}/auth.php?chk_app=Y&app_token=${token}`);
  //   } else {
  //     set_webview_url(`${domain_url}`);
  //   }
  // }, [token]);

  const snsLoginWithApple = async () => {
    console.log('snsLoginWithApple');
    // performs login request
    const appleAuthRequestResponse = await appleAuth.performRequest({
      requestedOperation: appleAuth.Operation.LOGIN,
      requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME],
    });
    const credentialState = await appleAuth.getCredentialStateForUser(
      appleAuthRequestResponse.user,
    );

    if (credentialState === appleAuth.State.AUTHORIZED) {
      // user is authenticated
      console.log('로그인');
      const {identityToken, email, user, fullName, realUserStatus} =
        appleAuthRequestResponse;

      if (fullName?.middleName == null) {
        console.log('111111');
        set_webview_url(
          `${domain_url}/sns_login_apple_update.php?id_token=${identityToken}&user=${user}&name=${fullName?.familyName}${fullName?.givenName}`,
        );
      } else {
        console.log('22222');
        set_webview_url(
          `${domain_url}/sns_login_apple_update.php?id_token=${identityToken}&user=${user}&name=${fullName?.givenName}${fullName?.middleName}${fullName?.familyName}`,
        );
      }
    } else {
      console.log('애플 로그인 실패');
    }
  };
  useEffect(() => {
    if (Platform.OS == 'android') {
      StatusBar.setBackgroundColor('white');
      StatusBar.setBarStyle('dark-content');
    }
  }, []);
  return (
    <SafeAreaView style={{flex: 1, backgroundColor: '#fff'}}>
      <StatusBar animated={true} backgroundColor="#fff" />
      <View style={{flex: 1, height: height}}>
        <WebView
          ref={webViews}
          source={{uri: webview_url}}
          useWebKit={true}
          sharedCookiesEnabled
          onMessage={webViews => onWebViewMessage(webViews)}
          onContentProcessDidTerminate={syntheticEvent => {
            const {nativeEvent} = syntheticEvent;
            webViews.current.reload();
          }}
          onNavigationStateChange={webViews =>
            onNavigationStateChange(webViews)
          }
          allowFileAccess={true}
          mediaPlaybackRequiresUserAction={false}
          scalesPageToFit={true}
          allowsInlineMediaPlayback={true}
          allowsBackForwardNavigationGestures={iosSwiper}
          originWhitelist={[
            '*',
            'kakaotalk://*',
            'intent://*',
            'http://*',
            'https://*',
            'intent:kakaotalk://*',
          ]}
          mixedContentMode={'compatibility'}
          overScrollMode={'never'}
          userAgent={
            Platform.OS == 'ios'
              ? `Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.99 Safari/537.36 IOSAPP`
              : 'Mozilla/5.0 (Linux; Android 8.0.0; SM-G935S Build/R16NW) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.105 Mobile Safari/537.36'
          }
        />
      </View>
    </SafeAreaView>
  );
};

export default HomePage;
