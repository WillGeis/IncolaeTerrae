import React, { useState } from "react";
import { View, StyleSheet, Pressable, Text } from "react-native";
import HexGridScreen from "./HexGridScreen";
import VertexLayer from "./VertexLayer";
import ResourceOverlay from "./ResourceOverlay";
import PanZoomView from "./PanZoomView";
import DevCardOverlay from "./DevCardOverlay";
import RoadBuyScreen from "./RoadBuyScreen";
import { usePlayer } from "./PlayerContext";
import useGameHub from "./useGameHub";
import TurnAndDice from "./TurnAndDiceRoll";


const BASE_HEX_SIZE = 60;
const MAP_DEFAULTS = {
  5: { scalar: 2.7, roadWidth: 14 },
  7: { scalar: 1.9, roadWidth: 10 },
  9: { scalar: 1.45, roadWidth: 8  },
};

export default function MainGameScreen({route}) {
  const { playerNumber, serverUrl, guid } = usePlayer();
  const [gameState, setGameState]     = useState(route.params?.gameState);
  const [playerState, setPlayerState] = useState(route.params?.playerState);

  const [roadPopup, setRoadPopup] = useState(null);

  useGameHub(
    serverUrl,
    guid,
    (newGameState) => {
      console.log("[SIGNALR] MainGameScreen: game state update received");
      setGameState(newGameState);
    },
    (newPlayerState) => {
      console.log("[SIGNALR] MainGameScreen: player state update received");
      setPlayerState(newPlayerState);
    },
    (username) => {
      console.log(`[SIGNALR] ${username} joined`);
    }
  );

  const MAP_SIZE = Number(gameState?.mapSizejson);

  if (!gameState || !MAP_DEFAULTS[MAP_SIZE]) {
    return <View style={{ flex: 1, backgroundColor: "#090d18" }} />;
  }
  
  /*
  Data from server setters
  */
  const hubConnection = route.params?.hubConnection;

  if (!gameState || !MAP_DEFAULTS[MAP_SIZE]) {
    return <View style={{ flex: 1, backgroundColor: "#090d18" }} />;
  }

  const hexData = gameState?.resourcemapjson ?? [];
  const hexRollData = gameState?.resourcerollsjson ?? [];
  const edgeData = gameState?.edgedatajson ?? [];
  const boatData = gameState?.boatdatajson ?? [];
  const robberHex = gameState?.robberhexjson ?? -1;
  const vertexData = gameState?.nodegraphjson ?? [];
  const resourceData = playerState?.playerResourcesjson ?? [0, 0, 0, 0, 0];
  const devCards = playerState?.playerDevCardsjson ?? [];
  const playerPoints = playerState?.playerPoints ?? 0;
  const playerTurn = gameState?.currentPlayerIndex ?? -1;
  const playerNamesList = gameState?.playerNamesList ?? [];
  const currentDiceRoll = gameState?.currentDiceRoll ?? -1;
  const isPlayerTurn = playerTurn === playerNumber;
  const isBuildingRoad = false;
  const roadSelectorVisible = false;

  /*
  Map size/aestetics
  */
  // GENERAL //
  const defaults  = MAP_DEFAULTS[MAP_SIZE];
  const SCALAR = defaults.scalar;
  const HEX_SIZE = BASE_HEX_SIZE * SCALAR;
  const HEX_WIDTH = HEX_SIZE;
  const HEX_HEIGHT = HEX_SIZE * 1.1547;
  const ROAD_WIDTH = defaults.roadWidth;

  // NODE //
  const VERTEX_X_SPACING = HEX_WIDTH  / 1.0;
  const VERTEX_ODD_OFFSET = HEX_HEIGHT / 5.0;
  const VERTEX_EVEN_OFFSET = HEX_HEIGHT / 1.75;
  const VERTEX_H_SHIFT = -HEX_WIDTH * 0.12;
  const VERTEX_V_SHIFT = -(HEX_HEIGHT * 0.55) - 30;

  // MAP CONFIG OBJ //
  const mapConfig = {
    MAP_SIZE,
    HEX_SIZE,
    HEX_WIDTH,
    HEX_HEIGHT,
    ROAD_WIDTH,
    VERTEX_X_SPACING,
    VERTEX_ODD_OFFSET,
    VERTEX_EVEN_OFFSET,
    VERTEX_H_SHIFT,
    VERTEX_V_SHIFT,
  };

  const handleEndTurn = async () => {
    if (!isPlayerTurn || !serverUrl) return;
    console.log("[END TURN] Button pressed by player", playerNumber);
    try {
      const moveData = JSON.stringify({ PlayerID: playerNumber });
      const url = `${serverUrl}/processMove?guid=${guid}&moveType=5&moveDataJson=${encodeURIComponent(moveData)}`;
      const res  = await fetch(url);
      const json = await res.json();
      if (!json.success) console.warn("[END TURN] Rejected:", json.error);
    } catch (err) {
      console.error("[END TURN] Fetch error:", err);
    }
  };


  ///// *1 //////

  return (
      <View style={styles.container}>
        <PanZoomView>
          <View style={styles.gridContainer}>
            <HexGridScreen
              hexData={hexData}
              edgeData={edgeData}
              hexRollData={hexRollData}
              robberHex={robberHex}
              roadSelectorVisible={roadSelectorVisible}
              playerTurn={playerTurn}
              playerNumber={playerNumber}
              isBuildingRoad={isBuildingRoad}
              isPlayerTurn={isPlayerTurn}
              mapConfig={mapConfig}
              serverUrl={serverUrl}
              guid={guid}
              onRoadPopup={(popup) => setRoadPopup(popup)}
            />
            <VertexLayer
              vertexData={vertexData}
              boatData={boatData}
              mapConfig={mapConfig}
              isPlayerTurn={isPlayerTurn}
              onPressVertex={(row, col) => console.log("Vertex pressed:", row, col)}
              playerNumber={playerNumber}
              serverUrl={serverUrl}
              guid={guid}
            />
          </View>
        </PanZoomView>

        <ResourceOverlay resources={resourceData} />
        <DevCardOverlay devCards={devCards} playerPoints={playerPoints} />

        <TurnAndDice
          currentDiceRoll={currentDiceRoll}
          playerNamesList={playerNamesList}
          playerTurn={playerTurn}
        />

        {roadPopup && (
          <RoadBuyScreen
            x={roadPopup.x}
            y={roadPopup.y}
            hexIndex={roadPopup.hexIndex}
            edgeIndex={roadPopup.edgeIndex}
            onClose={() => setRoadPopup(null)}
            onSelectRoad={() => setRoadPopup(null)}
            playerNumber={playerNumber}
            serverUrl={serverUrl}
            guid={guid}
          />
        )}

        <Pressable
          style={({ pressed }) => [
            styles.endTurnButton,
            !isPlayerTurn && styles.endTurnButtonDisabled,
            pressed && isPlayerTurn && styles.endTurnButtonPressed,
          ]}
          onPress={handleEndTurn}
          disabled={!isPlayerTurn}
        >
          <Text style={[styles.endTurnText, !isPlayerTurn && styles.endTurnTextDisabled]}>
            {isPlayerTurn ? "End Turn ▶" : "Waiting..."}
          </Text>
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
    gridContainer: {
      position: "relative",
      justifyContent: "center",
      alignItems: "center",
    },
    endTurnButton: {
      position: "absolute",
      right: 20,
      top: "50%",
      transform: [{ translateY: -30 }],
      zIndex: 20,
      backgroundColor: "#972929",
      padding: 10,
      width: 200,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },
    endTurnButtonDisabled: {
      backgroundColor: "#4a1a1a",
    },
    endTurnButtonPressed: {
      backgroundColor: "#7a2020",
    },
    endTurnText: {
      fontWeight: "bold",
      fontFamily: "Jersey10",
      color: "#ffd000",
      fontSize: 36,
      textAlign: "center",
    },
    endTurnTextDisabled: {
      color: "#7a6000",
    },
  });