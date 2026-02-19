import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";

export default function HostWaitingScreen({ route, navigation }) {
  const { hostConfig } = route.params;
  const [status, setStatus] = useState("Starting server...");

  useEffect(() => {
    const pingServer = async () => {
      try {
        const res = await fetch("http://localhost:5082/host", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(hostConfig),
        });

        console.log("HTTP status:", res.status);
        console.log("HTTP headers:", [...res.headers.entries()]);

        const rawText = await res.text();
        console.log("RAW RESPONSE BODY:", rawText);

        if (!res.ok) throw new Error("Server rejected host");

        let data;
        try {
          data = JSON.parse(rawText);
          console.log("PARSED JSON:", data);
        } catch (e) {
          console.error("JSON PARSE FAILED:", e);
          throw e;
        }

        setStatus("Server online. Waiting for players...");

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
  container: {
    flex: 1,
    backgroundColor: "#090d18",
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    color: "#e0e7ff",
    fontSize: 18,
    marginTop: 20,
  },
});
