import React from "react";
import { View, Pressable, StyleSheet } from "react-native";

const boatColors = ["gray", "blue", "yellow", "red", "green", "white"];
const playerColors = ["red", "blue", "green", "yellow", "purple", "orange", "cyan", "magenta", "white", "black"];

// DEPRICATED METHOD //
/*
function getOffsets(MAP_SIZE, HEX_WIDTH, HEX_HEIGHT) {
  let xSpacing, oddRowOffset, evenRowOffset, horizontalShift, verticalShift;

  switch (MAP_SIZE) {
    case 5:
      xSpacing = HEX_WIDTH / .99;
      oddRowOffset = HEX_HEIGHT / 4.9;
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
*/

function getVertexScreenPos(rowIndex, colIndex, vertexData, xSpacing, oddRowOffset, evenRowOffset, horizontalShift, verticalShift, totalWidth, HEX_SIZE) {
  const y = (() => {
    let total = 0;
    for (let i = 0; i < rowIndex; i++) {
      total += i % 2 === 1 ? oddRowOffset : evenRowOffset;
    }
    total += rowIndex % 2 === 1 ? oddRowOffset : evenRowOffset;
    return total + verticalShift;
  })();

  const rowWidth = vertexData[rowIndex].length * xSpacing;
  const rowOffset = (totalWidth - rowWidth) / 2 + horizontalShift;
  const x = rowOffset + colIndex * xSpacing + (HEX_SIZE * 0.11);

  return { x, y: y + (HEX_SIZE * 0.11) };
}

export default function VertexLayer({ vertexData, boatData, mapConfig, isPlayerTurn, onPressVertex }) {
  const {
    HEX_SIZE,
    VERTEX_X_SPACING: xSpacing,
    VERTEX_ODD_OFFSET: oddRowOffset,
    VERTEX_EVEN_OFFSET: evenRowOffset,
    VERTEX_H_SHIFT: horizontalShift,
    VERTEX_V_SHIFT: verticalShift,
  } = mapConfig;

  const maxCols = Math.max(...vertexData.map((r) => r.length));
  const totalWidth = maxCols * xSpacing;

  const BOAT_SIZE = HEX_SIZE * 0.35;
  const OUTWARD_SHIFT = 50;
  const LINE_WIDTH = 20;

  function renderBoats() {
    if (!boatData) return null;

    return boatData.map((boat, boatIndex) => {
      const [col1, row1, col2, row2, resourceType] = boat;

      if (
        row1 < 0 || row2 < 0 || col1 < 0 || col2 < 0
      ) return null;

      if (
        row1 >= vertexData.length || row2 >= vertexData.length
      ) return null;

      if (
        col1 >= vertexData[row1].length || col2 >= vertexData[row2].length
      ) return null;

      const p1 = getVertexScreenPos(row1, col1, vertexData, xSpacing, oddRowOffset, evenRowOffset, horizontalShift, verticalShift, totalWidth, HEX_SIZE);
      const p2 = getVertexScreenPos(row2, col2, vertexData, xSpacing, oddRowOffset, evenRowOffset, horizontalShift, verticalShift, totalWidth, HEX_SIZE);

      const midX = (p1.x + p2.x) / 2;
      const midY = (p1.y + p2.y) / 2;

      const centerX = totalWidth / 2 + horizontalShift;
      const centerY = vertexData.length * ((oddRowOffset + evenRowOffset) / 2) / 2;

      const dx = midX - centerX;
      const dy = midY - centerY;
      const len = Math.sqrt(dx * dx + dy * dy) || 1;

      const boatX = midX + (dx / len) * OUTWARD_SHIFT;
      const boatY = midY + (dy / len) * OUTWARD_SHIFT;

      const color = boatColors[resourceType] ?? "gray";

      const line1 = getLineStyle(boatX, boatY, p1.x, p1.y, LINE_WIDTH);
      const line2 = getLineStyle(boatX, boatY, p2.x, p2.y, LINE_WIDTH);

      return (
        <View key={boatIndex}>
          <View style={[styles.line, line1, { backgroundColor: color }]} />
          <View style={[styles.line, line2, { backgroundColor: color }]} />
          <View
            style={{
              position: "absolute",
              left: boatX - BOAT_SIZE / 2,
              top: boatY - BOAT_SIZE / 2,
              width: BOAT_SIZE,
              height: BOAT_SIZE,
              backgroundColor: color,
              borderRadius: 4,
            }}
          />
        </View>
      );
    });
  }

  return (
    <View style={[StyleSheet.absoluteFill, { zIndex: 10 }]}>
      {renderBoats()}

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
              if (value === undefined || value === null) return null;

              const x        = colIndex * xSpacing;
              const isVacant = value === -1;

              const dotColor = isVacant
                ? (isPlayerTurn ? "#94a3b8" : "rgba(148,163,184,0.2)")
                : playerColors[value];

              const dotSize = isVacant && isPlayerTurn
                ? HEX_SIZE * 0.26
                : HEX_SIZE * 0.22;

              return (
                <Pressable
                  key={colIndex}
                  onPress={() => isPlayerTurn && onPressVertex(rowIndex, colIndex)}
                  disabled={!isPlayerTurn && isVacant}
                  style={{
                    position: "absolute",
                    left: x,
                    top: 0,
                    width: dotSize,
                    height: dotSize,
                    borderRadius: dotSize * 0.7,
                    backgroundColor: dotColor,
                    borderWidth: !isVacant ? 2 : (isPlayerTurn ? 1.5 : 0),
                    borderColor: !isVacant ? "#fff" : "rgba(255,255,255,0.45)",
                    zIndex: 10,
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

function getLineStyle(x1, y1, x2, y2, lineWidth) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const length = Math.sqrt(dx * dx + dy * dy);
  const angle = Math.atan2(dy, dx) * (180 / Math.PI);

  return {
    position: "absolute",
    left: x1,
    top: y1 - lineWidth / 2,
    width: length,
    height: lineWidth,
    transform: [{ rotate: `${angle}deg` }],
    transformOrigin: "0 50%",
  };
}

const styles = StyleSheet.create({
  line: {
    position: "absolute",
  },
});