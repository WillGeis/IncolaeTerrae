import React from "react";
import { View, Pressable, StyleSheet } from "react-native";

function getOffsets(MAP_SIZE, HEX_WIDTH, HEX_HEIGHT) {
  let xSpacing, oddRowOffset, evenRowOffset, horizontalShift, verticalShift;

  switch (MAP_SIZE) {
    case 5:
      xSpacing = HEX_WIDTH / 1.01;
      oddRowOffset = HEX_HEIGHT / 5.15;
      evenRowOffset = HEX_HEIGHT / 1.75;
      horizontalShift = -20;
      verticalShift = -130;
      break;
    case 7:
      xSpacing = HEX_WIDTH / 1.01;
      oddRowOffset = HEX_HEIGHT / 5.15;
      evenRowOffset = HEX_HEIGHT / 1.75;
      horizontalShift = -20;
      verticalShift = -140;
      break;
    case 9:
      xSpacing = HEX_WIDTH / 1.01;
      oddRowOffset = HEX_HEIGHT / 5.15;
      evenRowOffset = HEX_HEIGHT / 1.75;
      horizontalShift = -20;
      verticalShift = -140;
      break;
    default:
      xSpacing = HEX_WIDTH / 1.01;
      oddRowOffset = HEX_HEIGHT / 5.15;
      evenRowOffset = HEX_HEIGHT / 1.75;
      horizontalShift = -20;
      verticalShift = -140;
      throw new Error("MapSize unsupported, bugs likely");
      break;
  }

  if (
    [xSpacing, oddRowOffset, evenRowOffset, horizontalShift, verticalShift].some(
      (v) => v == null
    )
  ) {
    throw new Error("Offsets were not properly initialized!");
  }

  return { xSpacing, oddRowOffset, evenRowOffset, horizontalShift, verticalShift };
}

export default function VertexLayer({
  vertexData,
  HEX_WIDTH,
  HEX_HEIGHT,
  HEX_SIZE,
  MAP_SIZE,
  onPressVertex,
  //horizontalShift = -20, 
  //verticalShift = -130
}) {
  const { xSpacing, oddRowOffset, evenRowOffset, horizontalShift, verticalShift } =
    getOffsets(MAP_SIZE, HEX_WIDTH, HEX_HEIGHT);

  const maxCols = Math.max(...vertexData.map((r) => r.length));
  const totalWidth = maxCols * xSpacing;

  return (
    <View style={StyleSheet.absoluteFill}>
      {vertexData.map((row, rowIndex) => {
        const y = (() => {
          let total = 0;
          for (let i = 0; i < rowIndex; i++) {
            total += i % 2 === 1 ? oddRowOffset : evenRowOffset;
          }
          total += rowIndex % 2 === 1 ? oddRowOffset : evenRowOffset;
          return total + verticalShift;
        })();

        const rowWidth = row.length * xSpacing;
        const rowOffset = (totalWidth - rowWidth) / 2 + horizontalShift;

        return (
          <View
            key={rowIndex}
            style={{
              flexDirection: "row",
              position: "absolute",
              top: y,
              left: rowOffset,
            }}
          >
            {row.map((value, colIndex) => {
              if (value !== 1 && value !== -1) return null;

              const x = colIndex * xSpacing;

              return (
                <Pressable
                  key={colIndex}
                  onPress={() => onPressVertex(rowIndex, colIndex)}
                  style={{
                    position: "absolute",
                    left: x,
                    top: 0,
                    width: HEX_SIZE * 0.3,
                    height: HEX_SIZE * 0.3,
                    borderRadius: HEX_SIZE * 0.15,
                    backgroundColor: value === 1 ? "black" : "white",
                    borderWidth: 1,
                    borderColor: "black",
                  }}
                />
              );
            })}
          </View>
        );
      })}
    </View>
  );
}