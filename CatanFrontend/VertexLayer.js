import React from "react";
import { View, Pressable, StyleSheet } from "react-native";

export default function VertexLayer({
  vertexData,
  HEX_WIDTH,
  HEX_HEIGHT,
  HEX_SIZE,
  onPressVertex,
  horizontalShift = -20, // left/right adjustment
  verticalShift = -130, // shift all dots up/down
}) {
  const xSpacing = HEX_WIDTH / 1.01; // horizontal spacing
  const oddRowOffset = HEX_HEIGHT / 5.45; // vertical spacing
  const evenRowOffset = HEX_HEIGHT / 1.75; // stagger even rows vertically

  const maxCols = Math.max(...vertexData.map(r => r.length));
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
