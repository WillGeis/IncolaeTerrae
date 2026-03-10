import React from "react";
import { View, Pressable, StyleSheet } from "react-native";

const boatColors = ["gray", "blue", "yellow", "red", "green", "white"];

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
  const x = rowOffset + colIndex * xSpacing + (HEX_SIZE * 0.11); // center of dot

  return { x, y: y + (HEX_SIZE * 0.11) };
}

export default function VertexLayer({
  vertexData,
  boatData,
  HEX_WIDTH,
  HEX_HEIGHT,
  HEX_SIZE,
  MAP_SIZE,
  onPressVertex,
}) {
  const { xSpacing, oddRowOffset, evenRowOffset, horizontalShift, verticalShift } =
    getOffsets(MAP_SIZE, HEX_WIDTH, HEX_HEIGHT);

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
        row1 >= vertexData.length || row2 >= vertexData.length ||
        col1 >= vertexData[row1].length || col2 >= vertexData[row2].length
      ) return null;

      const p1 = getVertexScreenPos(row1, col1, vertexData, xSpacing, oddRowOffset, evenRowOffset, horizontalShift, verticalShift, totalWidth, HEX_SIZE);
      const p2 = getVertexScreenPos(row2, col2, vertexData, xSpacing, oddRowOffset, evenRowOffset, horizontalShift, verticalShift, totalWidth, HEX_SIZE);

      // Midpoint between the two vertices
      const midX = (p1.x + p2.x) / 2;
      const midY = (p1.y + p2.y) / 2;

      // Direction from center of screen outward
      // We treat (0,0) as the center reference since we're in absoluteFill
      const centerX = totalWidth / 2 + horizontalShift;
      const centerY = vertexData.length * ((oddRowOffset + evenRowOffset) / 2) / 2;

      const dx = midX - centerX;
      const dy = midY - centerY;
      const len = Math.sqrt(dx * dx + dy * dy) || 1;

      // Boat position shifted outward from midpoint
      const boatX = midX + (dx / len) * OUTWARD_SHIFT;
      const boatY = midY + (dy / len) * OUTWARD_SHIFT;

      const color = boatColors[resourceType] ?? "gray";

      // Line from boat center to p1
      const line1 = getLineStyle(boatX, boatY, p1.x, p1.y, LINE_WIDTH);
      // Line from boat center to p2
      const line2 = getLineStyle(boatX, boatY, p2.x, p2.y, LINE_WIDTH);

      return (
        <View key={boatIndex}>
          {/* Line to vertex 1 */}
          <View style={[styles.line, line1, { backgroundColor: color }]} />
          {/* Line to vertex 2 */}
          <View style={[styles.line, line2, { backgroundColor: color }]} />
          {/* Boat box */}
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
    <View style={StyleSheet.absoluteFill}>
      {/* Boats rendered beneath vertices */}
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
                    width: HEX_SIZE * 0.22,
                    height: HEX_SIZE * 0.22,
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