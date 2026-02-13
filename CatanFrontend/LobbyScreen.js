import React, { useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import HostOptions from "./HostOptions";

export default function LobbyScreen({ navigation }) {
  const [hostOptionsVisible, setHostOptionsVisible] = useState(false);

  const handleModeSelect = (mode) => {
    if (mode === "host") {
      setHostOptionsVisible(true);
    } else {
      navigation.navigate("Game", { mode: "join" });
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Lobby</Text>

      <Pressable
        style={styles.button}
        onPress={() => handleModeSelect("host")}
      >
        <Text style={styles.buttonText}>Host Game</Text>
      </Pressable>

      <Pressable
        style={styles.button}
        onPress={() => handleModeSelect("join")}
      >
        <Text style={styles.buttonText}>Join Game</Text>
      </Pressable>

      <HostOptions
        visible={hostOptionsVisible}
        onClose={() => setHostOptionsVisible(false)}
        onStartGame={(mapSize, victoryPoints) => {
          setHostOptionsVisible(false);
          navigation.navigate("Game", {
            mode: "host",
            MAP_SIZE: mapSize,
            victoryPoints,
          });
        }}
      />
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
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#e24b25",
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 12,
    marginVertical: 10,
  },
  buttonText: {
    color: "#000",
    fontSize: 18,
    fontFamily: "Jersey10",
    fontWeight: "bold",
    textAlign: "center",
  },
});
