import React, { useState } from "react";
import { View, Text, Pressable, StyleSheet, Animated } from "react-native";

const resourceNames = ["Wheat", "Brick", "Ore", "Wood", "Sheep"];

export default function ResourceOverlay({ resources }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Animated.View style={[styles.container, expanded && styles.expanded]}>
      <Pressable onPress={() => setExpanded(!expanded)}>
        <Text style={styles.title}>{expanded ? "Resources ▲" : "Resources ▼"}</Text>
      </Pressable>
      {expanded &&
        resources.map((count, i) => (
          <Text key={i} style={styles.resourceText}>
            {resourceNames[i]}: {count}
          </Text>
        ))}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: "#972929",
    padding: 10,
    borderRadius: 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    width: 200,
  },
  expanded: {
    width: 300,
  },
  title: {
    fontWeight: "bold",
    fontFamily: "Jersey10",
    color: "#ffd000",
    fontSize: 36,
    marginBottom: 5,
  },
  resourceText: {
    fontSize: 24,
    fontFamily: "Jersey10",
    marginVertical: 2,
  },
});
