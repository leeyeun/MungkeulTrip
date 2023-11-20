#import "AppDelegate.h"
#import "RNSplashScreen.h"
#import <Firebase.h>
#import <React/RCTBridge.h>
#import <React/RCTBundleURLProvider.h>
#import <React/RCTRootView.h>
#import <UserNotifications/UserNotifications.h>
#import <RNCPushNotificationIOS.h>
#import <React/CoreModulesPlugins.h>
#import <React/RCTCxxBridgeDelegate.h>
#import <ReactCommon/RCTTurboModuleManager.h>
#import "RNFBMessagingModule.h"
#import <React/RCTLinkingManager.h>
@implementation AppDelegate

//푸시관련 ----------------------------------------
- (void)application:(UIApplication *)application didRegisterForRemoteNotificationsWithDeviceToken:(NSData *)deviceToken
{
  // 
  [FIRMessaging messaging].APNSToken = deviceToken;
  NSString *fcmToken = [FIRMessaging messaging].FCMToken;
  NSLog(@"++APNST deviceToken : %@", deviceToken);
  NSLog(@"++FCM device token : %@", fcmToken);
  [RNCPushNotificationIOS didRegisterForRemoteNotificationsWithDeviceToken:deviceToken];
}
// Required for the notification event. You must call the completion handler after handling the remote notification.
- (void)application:(UIApplication *)application didReceiveRemoteNotification:(NSDictionary *)userInfo
fetchCompletionHandler:(void (^)(UIBackgroundFetchResult))completionHandler
{
  if (application.applicationState == UIApplicationStateActive) {
          // 포그라운드에서 알림을 받았을 때의 동작 구현
          // ...
      } else {
          // 백그라운드에서 알림을 받았을 때의 동작 구현
          // 알림 뱃지 수 증가 코드
          NSInteger badgeCount = [UIApplication sharedApplication].applicationIconBadgeNumber;
          badgeCount++;
//          NSLog(@"++FCM badgeCount : %id", badgeCount);
          [UIApplication sharedApplication].applicationIconBadgeNumber = badgeCount;
      }

  [RNCPushNotificationIOS didReceiveRemoteNotification:userInfo fetchCompletionHandler:completionHandler];
}
// Required for the registrationError event.
- (void)application:(UIApplication *)application didFailToRegisterForRemoteNotificationsWithError:(NSError *)error
{
 [RNCPushNotificationIOS didFailToRegisterForRemoteNotificationsWithError:error];
}
// Required for localNotification event
- (void)userNotificationCenter:(UNUserNotificationCenter *)center
didReceiveNotificationResponse:(UNNotificationResponse *)response
         withCompletionHandler:(void (^)(void))completionHandler
{
  // [RNCPushNotificationIOS didReceiveNotificationResponse:response];
  NSMutableDictionary *userData = [NSMutableDictionary dictionaryWithDictionary:response.notification.request.content.userInfo];
  [userData setObject:@YES forKey:@"userInteraction"];
  [RNCPushNotificationIOS didReceiveRemoteNotification:userData];
}

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
    RCTBridge *bridge = [[RCTBridge alloc] initWithDelegate:self launchOptions:launchOptions];
  [FIRApp configure];
  UNUserNotificationCenter *center = [UNUserNotificationCenter currentNotificationCenter];
  center.delegate = self;

//추가
  [center requestAuthorizationWithOptions:(UNAuthorizationOptionSound | UNAuthorizationOptionAlert | UNAuthorizationOptionBadge)
  completionHandler:^(BOOL granted, NSError * _Nullable error) {
    if( !error ) {
       // required to get the app to do anything at all about push notifications
        dispatch_async(dispatch_get_main_queue(), ^{
          [[UIApplication sharedApplication] registerForRemoteNotifications];
        });
        NSLog( @"Push registration success." );
    } else {
        NSLog( @"Push registration FAILED" );
        NSLog( @"ERROR: %@ - %@", error.localizedFailureReason, error.localizedDescription );
        NSLog( @"SUGGESTIONS: %@ - %@", error.localizedRecoveryOptions, error.localizedRecoverySuggestion );
    }
  }];

   [FIROptions defaultOptions].deepLinkURLScheme = @"com.mungkeultrip";
  
  RCTRootView *rootView = [[RCTRootView alloc] initWithBridge:bridge
                                              moduleName:@"mungkeultrip"
                                            initialProperties:nil];

  self.window = [[UIWindow alloc] initWithFrame:[UIScreen mainScreen].bounds];
  UIViewController *rootViewController = [UIViewController new];
  rootViewController.view = rootView;
  self.window.rootViewController = rootViewController;
  [self.window makeKeyAndVisible];
  [RNSplashScreen show];
  return YES;
}

//Called when a notification is delivered to a foreground app.
- (void)userNotificationCenter:(UNUserNotificationCenter *)center willPresentNotification:(UNNotification *)notification withCompletionHandler:(void (^)(UNNotificationPresentationOptions options))completionHandler
{
  
  completionHandler(UNNotificationPresentationOptionSound | UNNotificationPresentationOptionBanner | UNNotificationPresentationOptionBadge);
}

- (BOOL)application:(UIApplication *)application
   openURL:(NSURL *)url
   options:(NSDictionary<UIApplicationOpenURLOptionsKey,id> *)options
{
  if ([RCTLinkingManager application:application openURL:url sourceApplication:nil annotation:nil]) {
    return YES;
  } 
return YES;
}

- (NSURL *)sourceURLForBridge:(RCTBridge *)bridge
{
#if DEBUG
  return [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index"];
#else
  return [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
#endif
}

@end
