import { Dimensions } from 'react-native';

const { height: screenHeight } = Dimensions.get('window');

export const SheetHeight = screenHeight * 0.55;

export const BaseOffset = (SheetHeight - 44) / 2;