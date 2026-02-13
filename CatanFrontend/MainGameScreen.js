import React from "react";
import { View, StyleSheet } from "react-native";
import HexGridScreen from "./HexGridScreen";
import VertexLayer from "./VertexLayer";

const SCALAR = 2.7;
const HEX_SIZE = 60 * SCALAR;
const HEX_WIDTH = HEX_SIZE;
const HEX_HEIGHT = HEX_SIZE * 1.1547;

export default function MainGameScreen() {
  // Hex data
  const hexData = [
    1, 2, 3,
    4, 5, 6, 1,
    2, 3, 4, 5, 6,
    1, 2, 3, 4,
    5, 6, 1
  ];

  // Sample data
  const vertexData = [
    [ 1, 1, 1],
    [ -1, -1, -1, -1],
    [ 1, 1, 1, 1],
    [ -1, -1, -1, -1, -1 ], 
    [ 1, 1, 1, 1, 1 ], 
    [ -1,  -1, -1,  -1, -1, -1 ],
    [ 1,  1, 1,  1, 1, 1 ],
    [ -1, -1, -1, -1, -1 ], 
    [ 1, 1, 1, 1, 1 ], 
    [ -1, -1, -1, -1],
    [ 1, 1, 1]
  ];

  return (
    <View style={styles.container}>
      <View style={styles.gridContainer}>
        <HexGridScreen
            hexData={hexData}
            HEX_SIZE={HEX_SIZE}
            HEX_WIDTH={HEX_WIDTH}
            HEX_HEIGHT={HEX_HEIGHT}
            />
        <VertexLayer
            vertexData={vertexData}
            HEX_WIDTH={HEX_WIDTH}
            HEX_HEIGHT={HEX_HEIGHT}
            HEX_SIZE={HEX_SIZE}
            onPressVertex={(row, col) =>
                console.log("Vertex pressed:", row, col)
            }
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#eef2ff",
    justifyContent: "center",
    alignItems: "center",
  },
  gridContainer: {
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },
});