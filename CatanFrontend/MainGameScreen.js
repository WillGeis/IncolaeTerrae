import React from "react";
import { View, StyleSheet } from "react-native";
import HexGridScreen from "./HexGridScreen";

export default function MainGameScreen() {
  const hexData = [
    1, 2, 3,
    4, 5, 6, 1,
    2, 3, 4, 5, 6,
    1, 2, 3, 4,
    5, 6, 1
  ];

  return (
    <View style={styles.container}>
      <HexGridScreen hexData={hexData} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#eef2ff",
    justifyContent: "center",
  },
});
