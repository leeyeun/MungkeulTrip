import React, {useState, useEffect, useRef} from 'react';
import {
  Text,
  View,
  Animated,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import {getFont, getHeight, getWidth} from '../Util';
/**
 *  공통 : Toast Message
 * 
//  * @param {number} message: Toast 메시지에서 출력할 텍스트
//  * @param {number} height : Toast 메시지의 높이
//  * @param {number} marginBottom : Toast 메시지의 하단 기준 Margin 
//  * @param {() => void} onClose: Toast 메시지의 처리 이후 부모창의 State 값을 초기화 해줍니다.
//  * @returns 
 */
interface Props {
  message: string;
  title: string;
  onClose: () => void;
  onPress: () => void;
}
const ToastScreen = ({message, title, onClose, onPress}: Props) => {
  const [isToastVisible, setIsToastVisible] = useState(true);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsToastVisible(false);
      onClose();
    }, 2000);

    Animated.timing(fadeAnim, {
      toValue: isToastVisible ? 1 : 0,
      duration: 500,
      useNativeDriver: true,
    }).start(() => {
      setIsToastVisible(true);
    });
    return () => clearTimeout(timer);
  }, []);

  console.log('title', title);
  console.log('isToastVisible', isToastVisible);
  return (
    <>
      {isToastVisible && (
        <TouchableOpacity
          style={styles.PushContainer}
          onPress={() => onPress()}>
          <View style={styles.PushView}>
            <View>
              <View style={{paddingRight: getWidth(60)}}>
                <Text
                  style={{
                    color: 'black',
                    fontSize: getFont(15),
                    textAlign: 'left',
                  }}>
                  {title}
                </Text>
                <Text
                  numberOfLines={3}
                  style={{
                    fontSize: getFont(15),
                  }}>
                  {message}
                </Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      )}
    </>
  );
};
const styles = StyleSheet.create({
  PushContainer: {
    width: '100%',
    paddingHorizontal: getWidth(20),
    position: 'absolute',
    zIndex: 1000000,
    flex: 1,
    marginTop: 20,
  },
  PushView: {
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: getWidth(20),
    paddingVertical: getHeight(20),
    borderRadius: getWidth(10),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.29,
    shadowRadius: 4.65,
    elevation: 7,
  },
  ToastBasicBox: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4A4753F2',
    borderRadius: 12,
    paddingVertical: getHeight(12),
    paddingHorizontal: getWidth(16),
  },
  ToastBasicText: {
    fontSize: getFont(15),
    color: '#ffffff',
  },
});
export default ToastScreen;
