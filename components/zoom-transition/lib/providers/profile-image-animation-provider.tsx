import { useTargetMeasurement } from "@/hooks/use-target-measurment";
import { createContext, FC, PropsWithChildren, useContext } from "react";
import { useWindowDimensions } from "react-native";
import Animated, {
  AnimatedRef,
  Easing,
  runOnJS,
  SharedValue,
  useAnimatedReaction,
  useAnimatedRef,
  useScrollViewOffset,
  useSharedValue,
  withDelay,
  withTiming,
} from "react-native-reanimated";


// threads-profile-picture-animation 🔽

const _duration = 250;
export const _timingConfig = { duration: _duration, easing: Easing.out(Easing.quad) };

type ContextValue = {
  listRef: AnimatedRef<Animated.ScrollView>;
  listOffsetX: SharedValue<number>;
  defaultProfileImageSize: number;
  expandedProfileImageSize: number;
  targetRef: AnimatedRef<React.Component<{}, {}, any>>;
  onTargetLayout: () => void;
  imageState: SharedValue<"open" | "close">;
  imageXCoord: SharedValue<number>;
  imageYCoord: SharedValue<number>;
  imageSize: SharedValue<number>;
  blurIntensity: SharedValue<number>;
  closeBtnOpacity: SharedValue<number>;
  open: () => void;
  close: () => void;
};

const ProfileImageAnimationContext = createContext<ContextValue>({} as ContextValue);

export const ProfileImageAnimationProvider: FC<PropsWithChildren> = ({ children }) => {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();



  const screenCenterX = screenWidth / 2;
  const screenCenterY = screenHeight / 2;
  const defaultProfileImageSize = 70;
  const expandedProfileImageSize = screenWidth * 0.65;

  const listRef = useAnimatedRef<Animated.ScrollView>();
  const listOffsetX = useScrollViewOffset(listRef);

  const { targetRef, onTargetLayout, measurement } = useTargetMeasurement();

  const imageState = useSharedValue<"open" | "close">("close");
  const imageXCoord = useSharedValue(screenCenterX);
  const imageYCoord = useSharedValue(screenCenterY);
  const imageSize = useSharedValue(defaultProfileImageSize);
  const blurIntensity = useSharedValue(0);
  const closeBtnOpacity = useSharedValue(0);

  useAnimatedReaction(
    () => {
      return {
        measurement: measurement.value,
        listOffsetX: listOffsetX.value,
      };
    },
    ({ measurement, listOffsetX }) => {
      if (measurement === null) return;

      imageXCoord.value = measurement.pageX;
      imageYCoord.value = measurement.pageY - listOffsetX;
    }
  );

  const open = () => {
    "worklet";


    imageState.value = "open";
    blurIntensity.value = withTiming(100, _timingConfig);
    imageSize.value = withTiming(expandedProfileImageSize, _timingConfig);
    imageXCoord.value = withTiming(screenCenterX - expandedProfileImageSize / 2, _timingConfig);
    imageYCoord.value = withTiming(screenCenterY - expandedProfileImageSize / 2, _timingConfig);
    closeBtnOpacity.value = withDelay(_duration, withTiming(1));
  };

  const close = () => {
    "worklet";



    const x = measurement.value?.pageX ?? 0;
    const y = measurement.value?.pageY ?? 0;

    imageState.value = withDelay(_duration, withTiming("close", { duration: 0 }));
    blurIntensity.value = withTiming(0, _timingConfig);
    imageSize.value = withTiming(defaultProfileImageSize, _timingConfig);
    imageXCoord.value = withTiming(x, _timingConfig);
    imageYCoord.value = withTiming(y - listOffsetX.value, _timingConfig);
    closeBtnOpacity.value = withTiming(0, { duration: _duration });
  };

  return (
    <ProfileImageAnimationContext.Provider
      value={{
        listRef,
        listOffsetX,
        defaultProfileImageSize,
        expandedProfileImageSize,
        targetRef,
        onTargetLayout,
        imageState,
        imageXCoord,
        imageYCoord,
        imageSize,
        blurIntensity,
        closeBtnOpacity,
        open,
        close,
      }}
    >
      {children}
    </ProfileImageAnimationContext.Provider>
  );
};

export const useProfileImageAnimation = () => {
  const context = useContext(ProfileImageAnimationContext);

  if (!context) {
    throw new Error(
      "useProfileImageAnimation must be used within an ProfileImageAnimationProvider"
    );
  }

  return context;
};

// threads-profile-picture-animation 🔼
