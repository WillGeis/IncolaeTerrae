import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { usePlayer } from "./PlayerContext";

export default function HostWaitingScreen({ route, navigation }) {
  const { hostConfig } = route.params;
  const [status, setStatus] = useState("Starting server...");
  const { setGuid } = usePlayer();

  useEffect(() => {
    const pingServer = async () => {
      try {
        const res = await fetch("http://localhost:5082/host", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(hostConfig),
        });

        const rawText = await res.text();
        if (!res.ok) throw new Error(`Server rejected host: ${rawText}`);
        const data = JSON.parse(rawText);

        const storedGuid = await AsyncStorage.getItem("playerGuid");

        const regRes = await fetch("http://localhost:5082/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: hostConfig.HostUsername,
            existingGuid: storedGuid ?? null,
          }),
        });

        const regData = await regRes.json();

        await AsyncStorage.setItem("playerGuid", regData.guid);
        await AsyncStorage.setItem("lastServerUrl", data.serverIP ?? "http://localhost:5082");

        setGuid(regData.guid);

        if (regData.reconnected) {
          setStatus("Reconnected as host. Waiting for players...");
        } else {
          setStatus("Server online. Waiting for players...");
        }

        setTimeout(() => {
          navigation.replace("PlayerWaiting", { serverIP: data.serverIP });
        }, 1500);

      } catch (err) {
        setStatus("Failed to start server");
        console.error(err);
      }
    };

    pingServer();
  }, []);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#e24b25" />
      <Text style={styles.text}>{status}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: 300,
    backgroundColor: "#1e293b",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
  },
  label: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Jersey10",
    marginBottom: 10,
  },
  mapSizeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  mapSizeButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: "#e24b25",
    borderRadius: 8,
    marginHorizontal: 5,
  },
  mapSizeButtonSelected: {
    backgroundColor: "#ffd700",
  },
  mapSizeText: {
    fontSize: 16,
    fontFamily: "Jersey10",
    fontWeight: "bold",
  },
  goButton: {
    backgroundColor: "#00ff00",
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 12,
    marginTop: 20,
  },
  buttonText: {
    color: "#000",
    fontSize: 18,
    fontFamily: "Jersey10",
    fontWeight: "bold",
    textAlign: "center",
  },
});