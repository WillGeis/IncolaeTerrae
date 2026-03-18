import React from 'react';
import { StyleSheet, View, Platform } from 'react-native';
import { GestureDetector, Gesture, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import Slider from '@react-native-community/slider';

export default function PanZoomView({ children }) {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);
  const savedX = useSharedValue(0);
  const savedY = useSharedValue(0);
  const savedScale = useSharedValue(1);

  const [sliderValue, setSliderValue] = React.useState(1);

  const MIN_SCALE = 0.3;
  const MAX_SCALE = 3;

  const syncSlider = (val) => {
    setSliderValue(val);
  };

  const pan = Gesture.Pan()
    .activeOffsetX([-5, 5])
    .activeOffsetY([-5, 5])
    .onStart(() => {
      savedX.value = translateX.value;
      savedY.value = translateY.value;
    })
    .onUpdate((e) => {
      translateX.value = savedX.value + e.translationX;
      translateY.value = savedY.value + e.translationY;
    });

  const pinch = Gesture.Pinch()
    .onStart(() => {
      savedScale.value = scale.value;
    })
    .onUpdate((e) => {
      const next = Math.max(MIN_SCALE, Math.min(MAX_SCALE, savedScale.value * e.scale));
      scale.value = next;
      runOnJS(syncSlider)(next);
    });

  const doubleTap = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd(() => {
      translateX.value = withTiming(0);
      translateY.value = withTiming(0);
      scale.value = withTiming(1);
      savedX.value = 0;
      savedY.value = 0;
      savedScale.value = 1;
      runOnJS(syncSlider)(1);
    });

  const composed = Gesture.Simultaneous(pan, pinch);
  const withReset = Gesture.Exclusive(doubleTap, composed);

  const animStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  const containerRef = React.useRef(null);
  React.useEffect(() => {
    if (Platform.OS !== 'web') return;

    const el = containerRef.current;
    if (!el) return;

    const onWheel = (e) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      const next = Math.max(MIN_SCALE, Math.min(MAX_SCALE, scale.value * delta));
      scale.value = next;
      setSliderValue(next);
    };

    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, []);

  const handleSlider = (val) => {
    scale.value = val;
    setSliderValue(val);
  };

  const gestureContent = (
    <GestureDetector gesture={withReset}>
      <Animated.View style={[styles.content, animStyle]}>
        {children}
      </Animated.View>
    </GestureDetector>
  );

  return (
    <GestureHandlerRootView style={styles.outer}>
      {Platform.OS === 'web' ? (
        <div ref={containerRef} style={{ flex: 1, width: '100%', overflow: 'hidden', display: 'flex' }}>
          {gestureContent}
        </div>
      ) : (
        <View style={styles.inner}>
          {gestureContent}
        </View>
      )}

      <View style={styles.sliderContainer}>
        <Slider
          style={styles.slider}
          minimumValue={MIN_SCALE}
          maximumValue={MAX_SCALE}
          step={0.01}
          value={sliderValue}
          onValueChange={handleSlider}
          minimumTrackTintColor="#00ff99"
          maximumTrackTintColor="#334155"
          thumbTintColor="#e24b25"
        />
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  outer: {
    flex: 1,
    width: '100%',
  },
  inner: {
    flex: 1,
    overflow: 'hidden',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sliderContainer: {
    position: 'absolute',
    bottom: 30,
    left: '10%',
    right: '10%',
    alignItems: 'stretch',
    backgroundColor: 'rgba(9, 13, 24, 0.7)',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  slider: {
    width: '100%',
    height: 40,
  },
});