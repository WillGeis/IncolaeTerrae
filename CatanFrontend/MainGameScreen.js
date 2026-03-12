import React from "react";
import { View, StyleSheet } from "react-native";
import HexGridScreen from "./HexGridScreen";
import VertexLayer from "./VertexLayer";
import ResourceOverlay from "./ResourceOverlay";

const SCALAR = 2.7;
const HEX_SIZE = 60 * SCALAR;
const HEX_WIDTH = HEX_SIZE;
const HEX_HEIGHT = HEX_SIZE * 1.1547;
const ROAD_WIDTH = 14;

const playerColors = ["red", "blue", "green", "yellow", "purple", "orange", "cyan", "magenta", "white", "black"];

export default function MainGameScreen({route}) {
  const gameState = route.params?.gameState;

  const MAP_SIZE = Number(gameState?.mapSizejson);
  if (!MAP_SIZE) throw new Error("[ERROR] map size not received from server");

  const hexData = gameState?.resourcemapjson ?? [];
  const hexRollData = gameState?.resourcerollsjson ?? [];
  const edgeData = gameState?.edgedatajson ?? [];
  const boatData = gameState?.boatdatajson ?? [];
  const robberHex = gameState?.robberhexjson ?? -1;
  const vertexData = gameState?.nodegraphjson ?? [];
  const resourceData = [0, 0, 0, 0, 0];

  const playerNumber = -1;
  const playerTurn = -1;
  const isBuildingRoad = false;
  const roadSelectorVisible = false;


  console.log("vertexData:", JSON.stringify(vertexData));
  console.log("gameState keys:", gameState ? Object.keys(gameState) : "NO GAMESTATE");

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
  return (
    <View style={styles.container}>
      <View style={styles.gridContainer}>
        <HexGridScreen
            hexData={hexData}
            edgeData={edgeData}
            hexRollData={hexRollData}
            robberHex={robberHex}
            roadSelectorVisible={roadSelectorVisible}
            HEX_SIZE={HEX_SIZE}
            HEX_WIDTH={HEX_WIDTH}
            HEX_HEIGHT={HEX_HEIGHT}
            MAP_SIZE={MAP_SIZE}
            ROAD_WIDTH={ROAD_WIDTH}
            playerTurn={playerTurn}
            playerNumber={playerNumber}
            isBuildingRoad={isBuildingRoad}
            />
        <VertexLayer
            vertexData={vertexData}
            boatData={boatData}
            HEX_WIDTH={HEX_WIDTH}
            HEX_HEIGHT={HEX_HEIGHT}
            HEX_SIZE={HEX_SIZE}
            MAP_SIZE={MAP_SIZE}
            onPressVertex={(row, col) =>
                console.log("Vertex pressed:", row, col)
            }
        />
      </View>
      <ResourceOverlay resources={resourceData} />
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
});