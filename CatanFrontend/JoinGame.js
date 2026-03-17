import React, { useState, useEffect } from "react";
import { View, Text, Pressable, StyleSheet, TextInput } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { usePlayer } from "./PlayerContext";

export default function JoinGame({ navigation }) {
  const [serverUrl, setServerUrl] = useState("");
  const [status, setStatus] = useState("");
  const { username, guid, setGuid } = usePlayer();

  useEffect(() => {
    const loadStored = async () => {
      const storedUrl = await AsyncStorage.getItem("lastServerUrl");
      if (storedUrl) setServerUrl(storedUrl);
    };
    loadStored();
  }, []);

  const joinGame = async () => {
    if (!username) { setStatus("Missing username"); return; }
    if (!serverUrl) { setStatus("Missing server URL"); return; }

    try {
      const storedGuid = await AsyncStorage.getItem("playerGuid");

      const res = await fetch(`${serverUrl}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username,
          existingGuid: storedGuid ?? null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setStatus("[ERROR] Failed to join: " + (data || "[ERROR] Unknown error"));
        return;
      }

      await AsyncStorage.setItem("playerGuid", data.guid);
      await AsyncStorage.setItem("lastServerUrl", serverUrl);

      setGuid(data.guid);

      if (data.reconnected) {
        setStatus("[CONNECTION] Reconnected to existing session!");
      } else {
        setStatus("[CONNECTION] Joined successfully!");
      }

      navigation.navigate("PlayerWaiting", { serverIP: serverUrl });

    } catch (err) {
      console.error("[ERROR] Failed to join:", err);
      setStatus("[ERROR] Failed to join game.");
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
