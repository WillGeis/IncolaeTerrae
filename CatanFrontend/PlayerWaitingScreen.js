import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";

export default function PlayerWaitingScreen() {
  const [serverIP, setServerIP] = useState("Loading...");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  let isMounted = true;

    const fetchServerIP = async () => {
      try {
        let retries = 0;

        while (retries < 30) {
          const res = await fetch("http://localhost:5082/server-info");
          if (!res.ok) throw new Error("Failed to fetch server info");

          const data = await res.json();

          if (data.ready && data.serverIP) {
            if (isMounted) {
              setServerIP(data.serverIP);
              setLoading(false);
            }
            return;
          }

          retries++;
          await new Promise(res => setTimeout(res, 500));
        }

        throw new Error("Cloudflare tunnel not ready");
      } catch (err) {
        console.error(err);
        if (isMounted) setServerIP("Error fetching server URL");
      }
    };

    fetchServerIP();
    return () => {
      isMounted = false;
    };
  }, []);

  const copyToClipboard = () => {
      try {
        navigator.clipboard.writeText(serverIP);
        Alert.alert("Copied to clipboard!", serverIP);
      } catch {
        Alert.alert("Clipboard not supported.");
      }
    };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Players Connected:</Text>

      <View style={styles.playerList}>
        <Text style={styles.player}>Fugly ahh Player 1 (Host)</Text>
      </View>

      <Text style={styles.status}>Waiting for more than one of you...</Text>

      {/* Top-right box for server IP */}
      <Pressable style={styles.ipBox} onPress={copyToClipboard}>
        <Text style={styles.ipText}>{serverIP}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#090d18",
    padding: 40,
  },
  title: {
    fontSize: 28,
    color: "#e0e7ff",
    marginBottom: 20,
    textAlign: "center",
  },
  playerList: {
    marginTop: 20,
  },
  player: {
    fontSize: 18,
    color: "#00ff99",
    marginBottom: 10,
  },
  status: {
    marginTop: 40,
    color: "#aaa",
    textAlign: "center",
  },
  ipBox: {
    position: "absolute",
    top: 20,
    right: 20,
    backgroundColor: "#1e1e2f",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#00ff99",
  },
  ipText: {
    color: "#00ff99",
    fontWeight: "bold",
  },
});
