import React from "react";
import ParallaxScrollView from "../parallax-scroll-view";
import Animated from "react-native-reanimated";
import MediaParallaxBlur from "../media-parallax";
import { Image } from "expo-image";
import MediaDetails from "../media-details";
import { media } from "../mock";

const ParallaxBlur = () => {
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#fff", dark: "#000" }}
      headerImage={
        <Animated.View
          style={{
            width: "100%",
         
          }}
        >
          <Image
            contentFit="cover"
            source={{
              uri: `https://image.tmdb.org/t/p/original/tyfO9jHgkhypUFizRVYD0bytPjP.jpg`,
            }}
            style={{
              width: "100%",
              height: "100%",
            }}
            transition={300}
          />
        </Animated.View>
      }
    
    >
      <MediaDetails media={media} type="movie" />
      <MediaDetails media={media} type="movie" />
      <MediaDetails media={media} type="movie" />
    </ParallaxScrollView>
  );
};

export default ParallaxBlur;
