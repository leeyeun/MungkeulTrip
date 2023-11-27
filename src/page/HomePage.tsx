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
  Text,
} from 'react-native';
import RNExitApp from 'react-native-exit-app';
import {WebView} from 'react-native-webview';
import messaging from '@react-native-firebase/messaging';
import PushNotification, {Importance} from 'react-native-push-notification';
import PushNotificationIOS from '@react-native-community/push-notification-ios';
import appleAuth from '@invertase/react-native-apple-authentication';
import dynamicLinks from '@react-native-firebase/dynamic-links';
import Share from 'react-native-share';
import ToastScreen from './ToastScreen';

const HomePage = props => {
  const {route, navigation} = props;
  const webViews = React.useRef();
  let {height, width} = Dimensions.get('window');
  const [token, setToken] = useState('');
  //웹작업 토큰이 회원테이블에 있으면 자동로그인 없으면 로그인 페이지로 작업
  const domain_url = 'https://moongcletrip.com';
  const app_url = domain_url + '/';
  const url = `${app_url}auth.php?chk_app=Y&version=1.0&app_token=`;
  const indexurl = `${app_url}auth.php?chk_app=Y&version=1.0&app_token=${token}&chk_app=Y`;
  const [webview_url, set_webview_url] = React.useState(domain_url);
  const [cangoback, setCangoBack] = useState(false);
  const [iosSwiper, setIosSwiper] = useState(true);
  const [deeplink, setDeepLink] = useState('');
  const [intent, setIntent] = useState('');
  const [webviewUrl, setWebviewUrl] = useState('');
  const [isShowToast, setIsShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState({
    title: '',
    message: '',
    intent: '',
  });
  useEffect(() => {
    PushDatas();
  }, []);

  const PushDatas = async () => {
    //포그라운드 노티 처리
    PushNotification.configure({
      onRegister: function (token) {
        // console.log('TOKEN:', token);
      },
      onNotification: async function (notification) {
        const ttokenee = await messaging().getToken();
        // console.log('ttokenee', ttokenee);
        console.log('-------------클릭시 먹는 페이지-------------');
        console.log(notification);
        setIntent(notification.data.intent);

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

  //알림창 클릭시 페이지 이동
  useEffect(() => {
    // AutoLogin();
    messaging().onMessage(remoteMessage => {
      if (remoteMessage?.data?.title != '') {
        setIsShowToast(true);
        setToastMessage({
          title: String(remoteMessage?.data?.title),
          message: String(remoteMessage?.data?.message),
          intent: String(remoteMessage?.data?.intent),
        });
      }
    });

    //알림창을 클릭한 경우 호출됨
    messaging().onNotificationOpenedApp(remoteMessage => {
      console.log('onNotificationOpenedApp remoteMessage', remoteMessage);
    });

    //어플이 종료된 상태
    messaging()
      .getInitialNotification()
      .then(remoteMessage => {
        console.log('getInitialNotification remoteMessage', remoteMessage);
        // handleCloudMsg(remoteMessage); // console.log('data', data);
      });

    messaging().setBackgroundMessageHandler(async remoteMessage => {});
  }, []);

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
    if (jsonData.id == 'pagemove') {
      Linking.openURL(jsonData.url);
    } else if (jsonData.id == 'outLink') {
      Linking.openURL(jsonData.url);
    } else if (jsonData.id == 'appleLogin') {
      snsLoginWithApple();
    } else if (jsonData.id == 'share') {
      onShare(jsonData.url, jsonData.title, jsonData.image);
    }
  };

  //공유하기
  const onShare = async (url: string, title: string, image: string) => {
    const link =
      // Platform.OS === 'android'
      await dynamicLinks().buildShortLink({
        link: url.includes('ft_idx')
          ? `https://moongcletrip.page.link/detail?ft_idx=${url.split('=')[1]}`
          : `https://moongcletrip.page.link/time_detail?tt_idx=${
              url.split('=')[1]
            }`,
        domainUriPrefix: 'https://moongcletrip.page.link',
        social: {
          title: title,
          descriptionText: '[뭉클트립]',
          imageUrl: image,
        },
        android: {
          packageName: 'com.mungkeultrip',
        },
        ios: {
          bundleId: 'com.honolulu.mungkeultrip',
          appStoreId: '6472235149',
        },
      });
    Share.open({
      message: `[뭉클트립] ${title} \n${link}`,
    });
  };

  useEffect(() => {
    const unsubscribe = dynamicLinks().onLink(handleDynamicLink);
    dynamicLinks()
      .getInitialLink()
      .then(link => {
        if (link) {
          if (Platform.OS == 'android') {
            DeepLinkAndroid(link);
          } else {
            DiLinkUrl(decodeURIComponent(link));
          }
        }
      });
    return () => unsubscribe();
  }, []);

  const handleDynamicLink = link => {
    if (link) {
      if (Platform.OS == 'ios') {
        //IOS 일때에 처리하기
        DiLinkUrl(decodeURIComponent(link?.url));
      } else {
        console.log('link=====>', link);
        DeepLinkAndroid(link);
      }
    }
  };

  // 딥링크 ios
  const DiLinkUrl = value => {
    let valueUrl = decodeURIComponent(value);
    console.log('valueUrl', valueUrl);
    const iosParams = String(valueUrl).split('?')[1];
    if (valueUrl.includes('ft_idx')) {
      const ft_idx = iosParams.replace('ft_idx=', '');
      set_webview_url(`${domain_url}/detail.php?ft_idx=${ft_idx}`);
    } else if (valueUrl.includes('tt_idx')) {
      const tt_idx = iosParams.replace('tt_idx=', '');
      set_webview_url(`${domain_url}/time_detail.php?tt_idx=${tt_idx}`);
    } else if (valueUrl.includes('booking_list')) {
      set_webview_url(`${domain_url}/booking_list.php`);
    }
  };

  const [ftidx, setFtIdx] = useState('');
  // // 딥링크 android
  const DeepLinkAndroid = async value => {
    setDeepLink(value.url);
    const androidParams = value.url.split('?')[1];

    if (value.url.includes('ft_idx')) {
      const ft_idx = androidParams.replace('ft_idx=', '');
      set_webview_url(`${domain_url}/detail.php?ft_idx=${ft_idx}`);
    } else if (value.url.includes('tt_idx')) {
      const tt_idx = androidParams.replace('tt_idx=', '');
      set_webview_url(`${domain_url}/time_detail.php?tt_idx=${tt_idx}`);
    } else if (value.url.includes('booking_list')) {
      set_webview_url(`${domain_url}/booking_list.php`);
    }

    setFtIdx(androidParams.replace('ft_idx=', ''));
    const fcmToken = await messaging().getToken();
  };
  useEffect(() => {
    console.log('webviewUrl', webviewUrl);
  }, [webviewUrl]);

  useEffect(() => {
    console.log('webview_url', webview_url);
  }, [webview_url]);

  const onNavigationStateChange = async (webViewState: any) => {
    console.log('webViewState ======> ', webViewState.url);
    setCangoBack(webViewState.canGoBack);
    setWebviewUrl(webViewState.url);
    // set_webview_url(webViewState.url);
    if (webViewState.url == domain_url) {
      setIosSwiper(false);
    } else {
      setIosSwiper(true);
    }

    // if (webViewState.url == app_url) {
    //   set_webview_url(webViewState.url);
    // }
    if (
      (!webViewState.url.includes(`${domain_url}?chk_app=Y&app_token=`) ||
        !webViewState.url.includes('chk_app=Y&app_token=') ||
        !webViewState.url.includes('kakao')) &&
      webViewState.url != app_url &&
      webViewState.url.includes(domain_url)
    ) {
      console.log('webViewState.url', webViewState.url);
      set_webview_url(webViewState.url);
    }

    BackHandler.addEventListener('hardwareBackPress', handleBackButton);
  };

  const handleBackButton = async () => {
    if (navigation.isFocused() === true) {
      // 제일 첫페이지, 특정 페이지에서 뒤로가기시 어플 종료
      if (
        webviewUrl == app_url ||
        webviewUrl.includes('index.php') ||
        webviewUrl.includes('location.php') ||
        webviewUrl.includes('more.php') ||
        webviewUrl.includes('table_1.php') ||
        webviewUrl.includes('graph_1.php') ||
        webviewUrl.includes('board.php')
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
          // set_webview_url()
          webViews.current.injectJavaScript('javascript:history.back();');
        } else {
          if (
            webviewUrl.includes('my_notice_detail.php') ||
            webviewUrl.includes('detail.php')
          ) {
            set_webview_url(app_url);
          } else {
            set_webview_url(webview_url);
          }

          // set_webview_url(url + fcmToken);
        }
        // BackKeyApi(urls);
      }
      return true;
    } else {
      return false;
    }
  };

  useEffect(() => {
    if (token != '' && intent == '') {
      set_webview_url(
        `${domain_url}/auth.php?chk_app=Y&version=1.0&app_token=${token}`,
      );
    } else if (intent !== '' && token !== '') {
      set_webview_url(intent);
    } else {
      set_webview_url(`${domain_url}`);
    }
  }, [token, intent]);

  const snsLoginWithApple = async () => {
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
        set_webview_url(
          `${domain_url}/sns_login_apple_update.php?id_token=${identityToken}&user=${user}&name=${fullName?.familyName}${fullName?.givenName}`,
        );
      } else {
        set_webview_url(
          `${domain_url}/sns_login_apple_update.php?id_token=${identityToken}&user=${user}&name=${fullName?.givenName}${fullName?.middleName}${fullName?.familyName}`,
        );
      }
    } else {
      Alert.alert('애플 로그인이 실패되었습니다.');
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
        {isShowToast && (
          <ToastScreen
            title={toastMessage.title}
            message={toastMessage.message}
            onClose={() => setIsShowToast(false)}
            onPress={() => setIntent(toastMessage.intent)}
          />
        )}
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
              : ''
          }
        />
      </View>
    </SafeAreaView>
  );
};

export default HomePage;
