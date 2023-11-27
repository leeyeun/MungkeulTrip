import {NativeScrollEvent, NativeSyntheticEvent} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Dimensions} from 'react-native';
import {
  responsiveScreenHeight,
  responsiveScreenWidth,
} from 'react-native-responsive-dimensions';

const FIGMA_WINDOW_WIDTH = 390;
const FIGMA_WINDOW_HEIGHT = 844;
const portrait =
  Dimensions.get('window').width < Dimensions.get('window').height;

//onBoarding
export const onScrollSlide = (
  e: NativeSyntheticEvent<NativeScrollEvent>,
  setState: React.Dispatch<React.SetStateAction<number>>,
  width: number,
) => {
  setState(Math.round(e.nativeEvent.contentOffset.x / width));
};

export function getWidth(width: number) {
  const percentage = portrait
    ? (width / FIGMA_WINDOW_WIDTH) * 100
    : (width / FIGMA_WINDOW_HEIGHT) * 100;
  return responsiveScreenWidth(percentage);
}

export function getHeight(height: number) {
  const percentage = portrait
    ? (height / FIGMA_WINDOW_HEIGHT) * 100
    : (height / FIGMA_WINDOW_WIDTH) * 100;
  return responsiveScreenHeight(percentage);
}

export function getFont(size: number) {
  const percentage = portrait
    ? (size / FIGMA_WINDOW_WIDTH) * 100
    : (size / FIGMA_WINDOW_HEIGHT) * 100;
  return responsiveScreenWidth(percentage);
}
