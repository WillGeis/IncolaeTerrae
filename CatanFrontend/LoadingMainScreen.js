import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated, Easing } from "react-native";
import { usePlayer } from "./PlayerContext";

const API_BASE = "http://localhost:5082";

export default function LoadingScreenMain({ navigation }) {
  const spinAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const { guid } = usePlayer();

  useEffect(() => {
    // Spin animation SWAP WITH MORE FUN THING LATER
    Animated.loop(
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 1000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    // Pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.15,
          duration: 700,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 700,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Poll gamestate until received 3 seconds total
    let isMounted = true;
    const pollGameState = async () => {
      try {
        console.log("[DEBUG] Polling /gamestate...");
        const res = await fetch(`${API_BASE}/gamestate`);

        if (!res.ok) {
          console.warn("[WARN] /gamestate not ready, retrying...");
          if (isMounted) setTimeout(pollGameState, 1500);
          return;
        }

        const data = await res.json();
        console.log("[DEBUG] /gamestate received:", data);

        if (isMounted && data) {
          navigation.replace("Game", { gameState: data });
        }
      } catch (err) {
        console.error("[ERROR] /gamestate fetch failed:", err);
        if (isMounted) setTimeout(pollGameState, 1500);
      }
    };

    pollGameState();

    return () => {
      isMounted = false;
    };
  }, []);

  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Setting up game...</Text>

      <Animated.View style={[styles.pulseWrapper, { transform: [{ scale: pulseAnim }] }]}>
        <Animated.View style={[styles.spinner, { transform: [{ rotate: spin }] }]}>
          <View style={styles.spinnerInner} />
        </Animated.View>
      </Animated.View>

      <Text style={styles.subtitle}>Loading map & resources</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#090d18",
    justifyContent: "center",
    alignItems: "center",
    gap: 30,
  },
  title: {
    fontSize: 36,
    color: "#e0e7ff",
    fontFamily: "Jersey10",
    letterSpacing: 2,
  },
  pulseWrapper: {
    justifyContent: "center",
    alignItems: "center",
  },
  spinner: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 6,
    borderColor: "#00ff99",
    borderTopColor: "transparent",
    justifyContent: "center",
    alignItems: "center",
  },
  spinnerInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 4,
    borderColor: "#e24b25",
    borderBottomColor: "transparent",
  },
  subtitle: {
    fontSize: 20,
    color: "#444",
    fontFamily: "Jersey10",
  },
});