import React, { useState } from "react";
import { View, StyleSheet, Pressable, Text } from "react-native";
import HexGridScreen from "./HexGridScreen";
import VertexLayer from "./VertexLayer";
import ResourceOverlay from "./ResourceOverlay";
import PanZoomView from "./PanZoomView";
import DevCardOverlay from "./DevCardOverlay";
import { usePlayer } from "./PlayerContext";
import useGameHub from "./useGameHub";


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
  const resourceData = [0, 0, 0, 0, 0];
  const devCards = playerState?.playerDevCardsjson ?? [];
  const playerPoints = playerState?.playerPoints ?? 0;
  const playerTurn   = gameState?.currentPlayerIndex ?? -1;
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
              mapConfig={mapConfig}
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


////// *1 //////
// Debug logs
  //console.log("[LOG]vertexData:", JSON.stringify(vertexData));
  //console.log("[LOG] gameState keys:", gameState ? Object.keys(gameState) : "NO GAMESTATE");
  //if (!MAP_SIZE) throw new Error("[ERROR] map size not received from server");

  // OLD HARDCODED DATA, KEEP FOR TESTING
  /*
  const resourceData = [2, 3, 0, 1, 4]; // Wheat, Brick, Ore, Wood, Sheep
  let hexData = [];
  let vertexData = [];
  let edgeData = []; 
  let hexRollData = []; 
  let boatData = [];
  let robberHex = -1;
  let playerNumber = -1;
  let playerTurn = 3; // change this for check (-1 means game startup)
  let isBuildingRoad = true;
  let roadSelectorVisible = true; // set this to false later

  switch (MAP_SIZE) {
    case 5: // Hex data MapSize == 5
      hexData = [
        1, 2, 3,
        4, 5, 6, 1,
        2, 3, 4, 5, 6,
        1, 2, 3, 4,
        5, 6, 1
      ];
      
      hexRollData = [
        5, 2, 6,
        3, 8, 10, 9,
        12, 11, 4, 8, 10,
        9, 4, 5, 6,
        3, 11, 2
      ];

      robberHex = 7;
      
      vertexData = [
        [ -1, -1, -1], // 3
        [ -1, -1, -1, -1], // 4
        [ -1, -1, -1, -1], // 4
        [ -1, -1, -1, -1, -1 ], // 5
        [ -1, -1, -1, -1, -1 ], // 5
        [ -1,  -1, -1, -1, -1, -1 ], // 6
        [ -1,  -1, -1, -1, -1, -1 ], // 6
        [ -1, -1, -1, -1, -1 ], // 5
        [ -1, -1, -1, -1, -1 ], // 5
        [ -1, -1, -1, -1], // 4
        [ -1, -1, -1, -1], // 4
        [ -1, -1, -1] // 3
      ];

      boatData = [
        [ 1, 0, 0, 0, 0], // boat 1 3 to 1 //
        [ 2, 0, 3, 1, 1], // boat 2 Wheat //
        [ 3, 2, 4, 3, 2], // boat 3 Brick //
        [ 5, 5, 5, 6, 3], // boat 4 Ore //
        [ 4, 8, 3, 9, 4], // boat 5 Wood
        [ 2, 10, 1, 11, 5], // boat 6 Sheep //
        [ 0, 10, 0, 11, 0], // boat 7 3 to 1 //
        [ 0, 7, 0, 8, 1], // boat 8 Wheat //
        [ 0, 3, 0, 4, 2], // boat 9 Brick //
      ];

      edgeData= [ 
        [3, -1, -1, -1, -1, -1], // hex 1 data
        [-1, -1, -1, -1, -1, -1], // hex 2 data
        [-1, -1, -1, -1, -1, -1], // hex 3 data
        [-1, -1, -1, -1, -1, -1], // hex 4 data
        [-1, -1, -1, -1, -1, -1], // hex 5 data
        [-1, -1, -1, -1, -1, -1], // hex 6 data
        [-1, -1, -1, -1, -1, -1], // hex 7 data
        [-1, -1, -1, -1, -1, -1], // hex 8 data
        [-1, -1, -1, -1, 3, -1], // hex 9 data
        [-1, -1, -1, -1, -1, -1], // hex 10 data
        [-1, -1, -1, -1, -1, -1], // hex 11 data
        [-1, -1, -1, -1, -1, -1], // hex 12 data
        [-1, -1, -1, 3, -1, -1], // hex 13 data
        [-1, -1, -1, -1, -1, -1], // hex 14 data
        [-1, -1, -1, -1, -1, -1], // hex 15 data
        [-1, -1, -1, -1, -1, -1], // hex 16 data
        [-1, -1, -1, -1, -1, -1], // hex 17 data
        [-1, -1, -1, -1, -1, -1], // hex 18 data
        [-1, -1, -1, -1, -1, -1], // hex 19 data
      ];
      break;
    case 7: // Hex data MapSize == 7
      hexData = [
        1, 2, 3,
        4, 5, 6, 1,
        2, 3, 4, 5, 6,
        2, 3, 4, 5, 6, 1,
        2, 3, 4, 5, 6,
        1, 2, 3, 4,
        5, 6, 1
      ];

      vertexData = [
        [ 1, 1, 1], // 3
        [ -1, -1, -1, -1], // 4
        [ 1, 1, 1, 1], // 4
        [ -1, -1, -1, -1, -1 ], // 5
        [ 1, 1, 1, 1, 1 ], // 5
        [ -1,  -1, -1, -1, -1, -1 ], // 6
        [ 1, 1, 1, 1, 1, 1 ], // 6
        [ -1,  -1, -1, -1, -1, -1 , -1], // 7
        [ 1, 1, 1, 1, 1, 1, 1], // 7
        [ -1,  -1, -1, -1, -1, -1 ], // 6
        [ 1, 1, 1, 1, 1, 1 ], // 6
        [ -1, -1, -1, -1, -1 ], // 5
        [ 1, 1, 1, 1, 1 ], // 5
        [ -1, -1, -1, -1], // 4
        [ 1, 1, 1, 1], // 4
        [ -1, -1, -1] // 3
      ];
      break;
    case 9: // Hex data MapSize == 9
        hexData = [
          1, 2, 3,
          4, 5, 6, 1,
          2, 3, 4, 5, 6,
          2, 3, 4, 5, 6, 1,
          2, 3, 4, 5, 6, 1, 3,
          2, 3, 4, 5, 6, 1,
          2, 3, 4, 5, 6,
          1, 2, 3, 4,
          5, 6, 1
        ];

        // Sample data
        vertexData = [
          [ 1, 1, 1], // 3
          [ -1, -1, -1, -1], // 4
          [ 1, 1, 1, 1], // 4
          [ -1, -1, -1, -1, -1 ], // 5
          [ 1, 1, 1, 1, 1 ], // 5
          [ -1, -1, -1, -1, -1, -1 ], // 6
          [ 1, 1, 1, 1, 1, 1 ], // 6
          [ -1, -1, -1, -1, -1, -1 , -1], // 7
          [ 1, 1, 1, 1, 1, 1, 1], // 7
          [ -1, -1, -1, -1, -1, -1 , -1, -1], // 8
          [ 1, 1, 1, 1, 1, 1, 1, 1], // 8
          [ -1, -1, -1, -1, -1, -1 , -1], // 7
          [ 1, 1, 1, 1, 1, 1, 1], // 7
          [ -1, -1, -1, -1, -1, -1 ], // 6
          [ 1, 1, 1, 1, 1, 1 ], // 6
          [ -1, -1, -1, -1, -1 ], // 5
          [ 1, 1, 1, 1, 1 ], // 5
          [ -1, -1, -1, -1], // 4
          [ 1, 1, 1, 1], // 4
          [ -1, -1, -1] // 3
        ];
        break;
      default:
        throw new error("invalid map size");
       

  }

  */ 
 ////// end of *1 //////