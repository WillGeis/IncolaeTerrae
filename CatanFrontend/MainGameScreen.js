import React from "react";
import { View, StyleSheet } from "react-native";
import HexGridScreen from "./HexGridScreen";
import VertexLayer from "./VertexLayer";
import ResourceOverlay from "./ResourceOverlay";

const SCALAR = 2.7;
const HEX_SIZE = 60 * SCALAR;
const HEX_WIDTH = HEX_SIZE;
const HEX_HEIGHT = HEX_SIZE * 1.1547;
const MAP_SIZE = 5;

export default function MainGameScreen({route}) {
  const MAP_SIZE = route.params?.MAP_SIZE || 5;
  
  const resourceData = [2, 3, 0, 1, 4]; // Wheat, Brick, Ore, Wood, Sheep
  let hexData = [];
  let vertexData = [];

  switch (MAP_SIZE) {
    case 5: // Hex data MapSize == 5
      hexData = [
        1, 2, 3,
        4, 5, 6, 1,
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
        [ -1, -1, -1, -1, -1 ], // 5
        [ 1, 1, 1, 1, 1 ], // 5
        [ -1, -1, -1, -1], // 4
        [ 1, 1, 1, 1], // 4
        [ -1, -1, -1] // 3
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

  return (
    <View style={styles.container}>
      <View style={styles.gridContainer}>
        <HexGridScreen
            hexData={hexData}
            HEX_SIZE={HEX_SIZE}
            HEX_WIDTH={HEX_WIDTH}
            HEX_HEIGHT={HEX_HEIGHT}
            MAP_SIZE={MAP_SIZE}
            />
        <VertexLayer
            vertexData={vertexData}
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