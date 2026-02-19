import React, { useState } from "react";
import { View, Text, Pressable, StyleSheet, TextInput } from "react-native";
import { usePlayer } from "./PlayerContext";

export default function JoinGame({ navigation }) {
  const [serverUrl, setServerUrl] = useState("");
  const [status, setStatus] = useState("");
  const { username, guid, setGuid } = usePlayer();

  const joinGame = async () => {
    if (!username) {
        setStatus("Missing username");
        return;
    }

    if (!serverUrl) {
        setStatus("Missing server URL");
        return;
    }

    try {
      const res = await fetch(`${serverUrl}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ Username: username }),
      });

      const data = await res.json();

      if (data.success) {
        setStatus("Joined successfully!");
        setGuid(data.playerGUID);
        navigation.navigate("PlayerWaiting");
      } else {
        setStatus("Failed to join: " + (data.message || "Unknown error"));
      }
    } catch (err) {
      console.error("Failed to join:", err);
      setStatus("Failed to join game.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Join Game</Text>

      <TextInput
        style={styles.input}
        placeholder="Paste Host Server URL"
        placeholderTextColor="#94a3b8"
        value={serverUrl}
        onChangeText={setServerUrl}
        autoCapitalize="none"
        autoCorrect={false}
      />

      <Pressable style={styles.button} onPress={joinGame}>
        <Text style={styles.buttonText}>Go</Text>
      </Pressable>

      {!!status && <Text style={styles.status}>{status}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#090d18", 
    justifyContent: "center", 
    alignItems: "center" 
  },
  title: { 
    fontSize: 64, 
    fontFamily: "Jersey10", 
    color: "#e0e7ff", 
    marginBottom: 20 
  },
  input: {
    width: "80%",
    backgroundColor: "#020617",
    color: "#e5e7eb",
    borderRadius: 10,
    padding: 16,
    fontSize: 18,
    marginBottom: 20,
  },
  button: { 
    backgroundColor: "#e24b25", 
    paddingVertical: 16, 
    paddingHorizontal: 60, 
    borderRadius: 12 
  },
  buttonText: { 
    fontSize: 24, 
    fontFamily: "Jersey10", 
    color: "#000" 
  },
  status: { 
    marginTop: 20, 
    color: "#94a3b8", 
    fontFamily: "Jersey10", 
    fontSize: 18 
  },
});
