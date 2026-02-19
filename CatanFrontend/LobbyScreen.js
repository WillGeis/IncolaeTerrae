import React, { useState, useRef } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import HostOptions from "./HostOptions";
import { usePlayer } from "./PlayerContext";

export default function LobbyScreen({ navigation }) {
  const { setUsername, setGuid, setIsHost } = usePlayer();
  const [hostOptionsVisible, setHostOptionsVisible] = useState(false);

  const hostRequestedRef = useRef(false);
  
  const handleModeSelect = (mode) => {
    if (mode === "host") {
      setHostOptionsVisible(true);
    } else {
      navigation.navigate("JoinGame");
    }
  };

  const handleStartGame = async (hostConfig) => {
    if (hostRequestedRef.current) return;
    hostRequestedRef.current = true;

    setHostOptionsVisible(false);

    try {
      const res = await fetch("http://localhost:5082/host", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(hostConfig),
      });

      const data = await res.json();

      setGuid(data.playerGUID);
      setIsHost(true);
      setUsername(hostConfig.HostUsername);

      navigation.navigate("HostWaiting", { hostConfig });
    } catch (err) {
      console.error("Failed to register host:", err);
      hostRequestedRef.current = false;
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Choose How You Play</Text>

      <Pressable style={styles.button} onPress={() => handleModeSelect("host")}>
        <Text style={styles.buttonText}>Host Game</Text>
      </Pressable>

      <Pressable style={styles.button} onPress={() => handleModeSelect("join")}>
        <Text style={styles.buttonText}>Join Game</Text>
      </Pressable>

      <HostOptions
        visible={hostOptionsVisible}
        onClose={() => setHostOptionsVisible(false)}
        onStartGame={handleStartGame}
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
    fontSize: 100,
    fontFamily: "Jersey10",
    fontWeight: "800",
    color: "#e0e7ff",
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#e24b25",
    paddingVertical: 30,
    paddingHorizontal: 100,
    borderRadius: 12,
    marginVertical: 10,
  },
  buttonText: {
    color: "#000",
    fontSize: 30,
    fontFamily: "Jersey10",
    fontWeight: "bold",
    textAlign: "center",
  },
});
