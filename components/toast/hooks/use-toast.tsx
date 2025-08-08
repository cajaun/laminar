import { useCallback } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Octicons } from '@expo/vector-icons';
import type { Icon } from '@expo/vector-icons/build/createIconSet';
import uuid from 'react-native-uuid';
import { useStackedToast } from './hooks';

type IconName<T, H extends string> = T extends Icon<infer U, H> ? U : never;
// Is there a better way to do this?
type OcticonsIconName = IconName<typeof Octicons, 'octicons'>;

export type ShowToastParams = {
  title: string;
  iconName?: OcticonsIconName;
  trailing?: React.ReactNode;
};


export const useToast = () => {
  const { showStackedToast } = useStackedToast();

  const showToast = useCallback(
    ({ title, iconName, trailing }: ShowToastParams) => {
      const key = `toast-${uuid.v4() as string}`; // ensure it's a string
      return showStackedToast({
        key,
        children: () => {
          return (
            <View
            
           
              style={styles.container}>
              {iconName && <Octicons name={iconName} size={16} color="#fff" />}
              <Text style={styles.internalText}>{title}</Text>
              <View style={{ flex: 1 }} />
              {trailing}
            </View>
          );
        },
      });
    },
    [showStackedToast],
  );

  return {
    showToast,
  };
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#2A292F',
    flexDirection: 'row',
    paddingHorizontal: 20,
  },
  internalText: {
    fontFamily: 'SF-Pro-Rounded-Bold',
    fontSize: 14,
    color: 'white',
    marginLeft: 10,
  },
});