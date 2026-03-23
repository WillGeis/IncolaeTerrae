import * as signalR from "@microsoft/signalr";
import { useEffect, useRef, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function useGameHub(serverUrl, playerGUID, onGameStateUpdated, onPlayerJoined) {
  const connectionRef = useRef(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!serverUrl) return;

    const connect = async () => {
      const guid = playerGUID;

      const connection = new signalR.HubConnectionBuilder()
        .withUrl(`${serverUrl}/gamehub`)
        .withAutomaticReconnect()
        .build();

      connection.on("GameStateUpdated", (gameState) => {console.log("[SIGNALR] Game state updated!", JSON.stringify(gameState)); onGameStateUpdated?.(gameState);});

      connection.on("PlayerStateUpdated", (playerState) => { console.log("[SIGNALR] Player state updated!");onPlayerStateUpdated?.(playerState);});

      connection.on("PlayerJoined", (username) => {console.log(`[SIGNALR] ${username} joined!`); onPlayerJoined?.(username);});

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

  const sendMove = async (moveType, moveData) => {
    if (!connectionRef.current || !connected) {
      console.warn("[SIGNALR] Not connected, cannot send move!");
      return;
    }
    const guid = playerGUID;
    await connectionRef.current.invoke("PlayerMove", guid, moveType, moveData);
  };

  return { connected, sendMove };
}