import React, {useCallback, useEffect, useState} from 'react';
import {
  SafeAreaView,
  StatusBar,
  View,
  Dimensions,
  Platform,
  Alert,
  BackHandler,
} from 'react-native';
import RNExitApp from 'react-native-exit-app';
import {WebView} from 'react-native-webview';

const HomePage = props => {
  const {route, navigation} = props;
  const webViews = React.useRef();
  let {height, width} = Dimensions.get('window');
  //웹작업 토큰이 회원테이블에 있으면 자동로그인 없으면 로그인 페이지로 작업
  const domain_url = 'https://lulu.dmonster.kr/';
  const [webview_url, set_webview_url] = React.useState(domain_url);

  const [cangoback, setCangoBack] = useState(false);
  const onWebViewMessage = (webViewss: any) => {
    let jsonData = JSON.parse(webViewss.nativeEvent.data);
  };

  const onNavigationStateChange = async (webViewState: any) => {
    console.log('webViewState ======> ', webViewState.url);
    setCangoBack(webViewState.canGoBack);
    set_webview_url(webViewState.url);

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
