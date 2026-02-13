import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";

export default function StartScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Cootan</Text>

      <Pressable
        style={({ pressed }) => [
          styles.button,
          pressed && styles.buttonPressed,
        ]}
        onPress={() => navigation.navigate("Lobby")}
      >
        <Text style={styles.buttonText}>Generate Game</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#090d18",
    justifyContent: "center",
    alignItems: "center",
  },

  title: {
    fontSize: 48,
    fontFamily: "Jersey10",
    fontWeight: "800",
    color: "#e0e7ff",
    marginBottom: 8,
  },

  button: {
    backgroundColor: "#e24b25",
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 12,
    shadowColor: "#ffffff",
    shadowOpacity: 0.3,
    shadowRadius: 100,
    elevation: 60,
  },

  buttonPressed: {
    transform: [{ scale: 0.97 }],
    opacity: 0.9,
  },

  buttonText: {
    color: "#000000",
    fontSize: 18,
    fontFamily: "Jersey10",
    fontWeight: "bold",
  },
});
