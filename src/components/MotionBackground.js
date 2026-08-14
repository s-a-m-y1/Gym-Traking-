import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import { C } from '../constants';

// A lightweight, native-driver-only background treatment shared by the main screens.
// It deliberately uses plain Views so it works in Expo Go without an extra dependency.
export function MotionBackground({ tone = 'violet' }) {
  const drift = useRef(new Animated.Value(0)).current;
  const breathe = useRef(new Animated.Value(0)).current;
  const shimmer = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.parallel([
      Animated.loop(Animated.sequence([
        Animated.timing(drift, { toValue: 1, duration: 7600, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(drift, { toValue: 0, duration: 7600, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])),
      Animated.loop(Animated.sequence([
        Animated.timing(breathe, { toValue: 1, duration: 3000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(breathe, { toValue: 0, duration: 3000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])),
      Animated.loop(Animated.timing(shimmer, { toValue: 1, duration: 12000, easing: Easing.linear, useNativeDriver: true })),
    ]);
    animation.start();
    return () => animation.stop();
  }, [breathe, drift, shimmer]);

  const secondaryColor = tone === 'mint' ? C.cyan : tone === 'orange' ? C.orange : C.cyan;

  return (
    <View pointerEvents="none" style={styles.wrap}>
      <Animated.View style={[styles.orb, styles.primaryOrb, {
        opacity: breathe.interpolate({ inputRange: [0, 1], outputRange: [0.12, 0.27] }),
        transform: [
          { translateX: drift.interpolate({ inputRange: [0, 1], outputRange: [-24, 22] }) },
          { translateY: drift.interpolate({ inputRange: [0, 1], outputRange: [0, 34] }) },
          { scale: breathe.interpolate({ inputRange: [0, 1], outputRange: [0.92, 1.12] }) },
        ],
      }]} />
      <Animated.View style={[styles.orb, styles.secondaryOrb, { backgroundColor: secondaryColor, opacity: breathe.interpolate({ inputRange: [0, 1], outputRange: [0.04, 0.13] }), transform: [{ translateY: drift.interpolate({ inputRange: [0, 1], outputRange: [22, -28] }) }] }]} />
      <Animated.View style={[styles.beam, { opacity: breathe.interpolate({ inputRange: [0, 1], outputRange: [0.07, 0.18] }), transform: [{ translateX: shimmer.interpolate({ inputRange: [0, 1], outputRange: [-260, 460] }) }, { rotate: '-18deg' }] }]} />
      <View style={styles.grid} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { ...StyleSheet.absoluteFillObject, overflow: 'hidden' },
  orb: { position: 'absolute', borderRadius: 999, backgroundColor: C.accent },
  primaryOrb: { width: 290, height: 290, top: -145, right: -105, shadowColor: C.accent, shadowOpacity: 0.8, shadowRadius: 44 },
  secondaryOrb: { width: 240, height: 240, bottom: 40, left: -150 },
  beam: { position: 'absolute', top: 210, width: 120, height: 520, backgroundColor: C.hi, borderRadius: 99 },
  grid: { ...StyleSheet.absoluteFillObject, opacity: 0.025, borderWidth: 1, borderColor: C.hi },
});
