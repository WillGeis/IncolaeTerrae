// New file: useGameHub.js
import * as signalR from "@microsoft/signalr";
import { useEffect, useRef, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function useGameHub(serverUrl, onGameStateUpdated, onPlayerJoined) {
  const connectionRef = useRef(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!serverUrl) return;

    const connect = async () => {
      const guid = await AsyncStorage.getItem("playerGuid");

      const connection = new signalR.HubConnectionBuilder()
        .withUrl(`${serverUrl}/gamehub`)
        .withAutomaticReconnect()
        .build();

      connection.on("GameStateUpdated", (gameState) => { console.log("[SIGNALR] Game state updated!"); onGameStateUpdated?.(gameState); }); // Listen for game state updates pushed from server

      connection.on("PlayerJoined", (username) => { console.log(`[SIGNALR] ${username} joined!`); onPlayerJoined?.(username); }); // Listen for player join events

      connection.on("Error", (msg) => { console.error("[SIGNALR] Error:", msg); });

      connection.onreconnected(() => { console.log("[SIGNALR] Reconnected, rejoining room..."); connection.invoke("JoinRoom", guid); });

      await connection.start();
      await connection.invoke("JoinRoom", guid);

      connectionRef.current = connection;
      setConnected(true);
      console.log("[SIGNALR] Connected!");
    };

    connect().catch(err => console.error("[SIGNALR] Connection failed:", err));

    return () => {
      connectionRef.current?.stop();
    };
  }, [serverUrl]);

  // Call this to send a move to the server
  const sendMove = async (moveType, moveData) => {
    if (!connectionRef.current || !connected) {
      console.warn("[SIGNALR] Not connected, cannot send move!");
      return;
    }
    const guid = await AsyncStorage.getItem("playerGuid");
    await connectionRef.current.invoke("PlayerMove", guid, moveType, moveData);
  };

  return { connected, sendMove };
}