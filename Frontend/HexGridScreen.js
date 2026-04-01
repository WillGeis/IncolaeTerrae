import React, { useState } from "react";
import { View, StyleSheet, Image, Text, TouchableOpacity, Pressable  } from "react-native";
import sprite1 from "./assets/hexSprites/sprite1.png";
import sprite2 from "./assets/hexSprites/sprite2.png";
import sprite3 from "./assets/hexSprites/sprite3.png";
import sprite4 from "./assets/hexSprites/sprite4.png";
import sprite5 from "./assets/hexSprites/sprite5.png";
import sprite6 from "./assets/hexSprites/sprite6.png";

const spriteMap = [sprite1, sprite2, sprite3, sprite4, sprite5, sprite6];
const playerColors = ["red", "blue", "green", "yellow", "purple", "orange", "cyan", "magenta", "white", "black"];

function getHexEdgeVertices(hexRow, hexCol, edgeIndex) {
  const R = hexRow;
  const C = hexCol;
  switch (edgeIndex) {
    case 0: return [[2*R, C], [2*R+1, C]];
    case 1: return [[2*R, C+1], [2*R+1, C+1]];
    case 2: return [[2*R, C], [2*R, C+1]];
    case 3: return [[2*R+2, C], [2*R+2, C+1]];
    case 4: return [[2*R+1, C], [2*R+2, C]];
    case 5: return [[2*R+1, C+1], [2*R+2, C+1]];
    default: return null;
  }
}

const EDGE_POSITIONS = [
  { x: 0, y: 0.5 }, // 0 - left
  { x: 1, y: 0.5 }, // 1 - right
  { x: 0.25, y: 0.125 }, // 2 - top left
  { x: 0.75, y: 0.125 }, // 3 - top right
  { x: 0.25, y: 0.875 }, // 4 - bottom left
  { x: 0.75, y: 0.875 }, // 5 - bottom right
]

const EDGE_NEIGHBORS = [
  { rowOff: 0, colOff: -1, neighborEdge: 1 }, // 0: left  = neighbor's right
  { rowOff: 0, colOff:  1, neighborEdge: 0 }, // 1: right = neighbor's left
  { rowOff: -1, colOff: -1, neighborEdge: 5 }, // 2: top left = neighbor's bottom right (upper-left row is offset)
  { rowOff: -1, colOff: 0, neighborEdge: 4 }, // 3: top right = neighbor's bottom left
  { rowOff: 1, colOff: 0, neighborEdge: 2 }, // 4: bottom left = neighbor's top left (lower row offset)
  { rowOff: 1, colOff: 1, neighborEdge: 3 }, // 5: bottom right = neighbor's top right
];

// change mapsize accordingly
function getHexRowsFromLength(totalHexes, topRow = 3, mapSize) {
  //console.log(`MapSize: ${mapSize}, Total Hexes: ${totalHexes}`);
  
  mapSize = Number(mapSize);
  
  if (mapSize < 4) {
    throw new Error("MapSize must be at least 4");
  }

  const rows = [];
  let xSize = topRow;
  const midpoint = Math.floor(mapSize / 2);
  let remainingHexes = totalHexes;

  for (let i = 0; i < mapSize; i++) {
    //console.log(`Row ${i}: xSize = ${xSize}, remainingHexes = ${remainingHexes}`);
    
    // Make sure we don’t add more hexes than we have remaining
    const rowHexes = Math.min(xSize, remainingHexes);
    rows.push(rowHexes);
    remainingHexes -= rowHexes;

    if (i < midpoint) {
      xSize++; // increase toward midpoint
    } else {
      xSize--; // decrease after midpoint
    }

    // safety check
    if (xSize < topRow) break;
  }

  let idx = Math.floor(rows.length / 2);
  while (remainingHexes > 0) {
    rows[idx]++;
    remainingHexes--;
    idx = (idx + 1) % rows.length;
  }

  return rows;
}

function buildHexIndexMap(rows) {
  const map = [];
  let idx = 0;
  for (let r = 0; r < rows.length; r++) {
    map[r] = [];
    for (let c = 0; c < rows[r]; c++) {
      map[r][c] = idx++;
    }
  }
  return map;
}

export default function HexGridScreen({ hexData, hexRollData, robberHex, edgeData, roadSelectorVisible, playerTurn, playerNumber, isBuildingRoad, isPlayerTurn, mapConfig, serverUrl, guid, onRoadPopup }) {
  const { HEX_WIDTH, HEX_HEIGHT, MAP_SIZE, ROAD_WIDTH } = mapConfig;
  
  if (!hexData?.length) return null;
  if (!edgeData?.length) return null;

  const rows = getHexRowsFromLength(hexData.length, 3, MAP_SIZE);
  const maxRow = Math.max(...rows);
  const hexIndexMap = buildHexIndexMap(rows);
  let dataIndex = 0;

  const gridWidth = maxRow * HEX_WIDTH;
  const gridHeight = rows.length * HEX_HEIGHT * 0.75;

  function getEdgeColor(value, isPlayerTurn) {
    if (value !== -1) return playerColors[value];
    return "transparent";
  }

  function getNeighborHexIndex(rowIndex, colIndex, edgeIdx) {
    const { rowOff, colOff, neighborEdge } = EDGE_NEIGHBORS[edgeIdx];
    const neighborRow = rowIndex + rowOff;

    if (neighborRow < 0 || neighborRow >= rows.length) return null;

    const currentRowLen = rows[rowIndex];
    const neighborRowLen = rows[neighborRow];
    const midpoint = Math.floor(rows.length / 2);

    let neighborCol;
    if (rowOff === 0) {
      neighborCol = colIndex + colOff;
    } else if (rowOff === -1) {
      if (neighborRowLen < currentRowLen) {
        neighborCol = colIndex + colOff + 1;
      } else {
        neighborCol = colIndex + colOff + 1;
      }
    } else {
      if (neighborRowLen < currentRowLen) {
        neighborCol = colIndex + colOff;
      } else {
        neighborCol = colIndex + colOff;
      }
    }

    if (neighborCol < 0 || neighborCol >= neighborRowLen) return null;
    return { hexIndex: hexIndexMap[neighborRow][neighborCol], neighborEdge };
  }

  const roadBubbles = [];
  if (isPlayerTurn) {
    let bubbleDataIndex = 0;
    rows.forEach((count, rowIndex) => {
      const offsetX = (maxRow - count) * (HEX_WIDTH / 2);
      const offsetY = rowIndex * (HEX_HEIGHT * 0.75);
      Array.from({ length: count }).forEach((_, colIndex) => { const hexIndex = bubbleDataIndex++; const edges = edgeData[hexIndex]; const CIRCLE_SIZE = HEX_WIDTH * 0.18;
        EDGE_POSITIONS.forEach((pos, edgeIdx) => {
          if (edges[edgeIdx] !== -1) return;
          const verts = getHexEdgeVertices(rowIndex, colIndex, edgeIdx);
          roadBubbles.push({
            key: `${hexIndex}-${edgeIdx}`,
            x: offsetX + colIndex * HEX_WIDTH + pos.x * HEX_WIDTH - CIRCLE_SIZE / 2,
            y: offsetY + pos.y * HEX_HEIGHT - CIRCLE_SIZE / 2,
            size: CIRCLE_SIZE,
            hexIndex,
            edgeIdx,
            screenX: offsetX + colIndex * HEX_WIDTH + pos.x * HEX_WIDTH,
            screenY: offsetY + pos.y * HEX_HEIGHT,
          });
        });
      });
    });
  }

  return (
    <View style={{ width: gridWidth, height: gridHeight, overflow: "visible" }} >
      {rows.map((count, rowIndex) => {
        const offsetX = (maxRow - count) * (HEX_WIDTH / 2);
        const offsetY = rowIndex * (HEX_HEIGHT * 0.75);

        return (
          <View
            key={rowIndex}
            pointerEvents="box-none"
            style={{
              position: "absolute",
              top: offsetY,
              left: offsetX,
              flexDirection: "row",
              overflow: "visible",
            }}
          >
            {Array.from({ length: count }).map((_, colIndex) => {
              const hexIndex = dataIndex;
              const sprite = spriteMap[hexData[dataIndex++] - 1];
              const edges = edgeData[hexIndex];
              const CIRCLE_SIZE = HEX_WIDTH * 0.18;

              return (
                <View
                  key={colIndex}
                  pointerEvents="box-none"
                  style={{ width: HEX_WIDTH, height: HEX_HEIGHT, overflow: "visible" }}
                >
                  <View
                    pointerEvents="none"
                    style={{
                      width: HEX_WIDTH,
                      height: HEX_HEIGHT,
                      overflow: "hidden",
                      clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
                    }}
                  >
                    <Image source={sprite} style={{ width: HEX_WIDTH, height: HEX_HEIGHT, resizeMode: "cover" }} />
                      {/* left */}
                      <Pressable
                        onPress={(e) => {
                          if (isPlayerTurn && edges[0] === -1) {
                            console.log(`[DEBUG] hexIndex:${hexIndex} edgeIndex:0`);
                            onRoadPopup({ x: e.nativeEvent.pageX, y: e.nativeEvent.pageY, hexIndex, edgeIndex: 0 });
                          }
                        }}
                        disabled={edges[0] !== -1 || !isPlayerTurn}
                        style={{ position: "absolute", top: HEX_HEIGHT * 0.25, bottom: HEX_HEIGHT * 0.25, left: 0, width: ROAD_WIDTH, backgroundColor: getEdgeColor(edges[0], isPlayerTurn) }}
                      />
                      {/* right */}
                      <Pressable
                        onPress={(e) => {
                          if (isPlayerTurn && edges[1] === -1) {
                            console.log(`[DEBUG] hexIndex:${hexIndex} edgeIndex:1`);
                            onRoadPopup({ x: e.nativeEvent.pageX, y: e.nativeEvent.pageY, hexIndex, edgeIndex: 1 });
                          }
                        }}
                        disabled={edges[1] !== -1 || !isPlayerTurn}
                        style={{ position: "absolute", top: HEX_HEIGHT * 0.25, bottom: HEX_HEIGHT * 0.25, right: 0, width: ROAD_WIDTH, backgroundColor: getEdgeColor(edges[1], isPlayerTurn) }}
                      />
                      {/* top left */}
                      <Pressable
                        onPress={(e) => {
                          if (isPlayerTurn && edges[1] === -1) {
                            console.log(`[DEBUG] hexIndex:${hexIndex} edgeIndex:1`);
                            onRoadPopup({ x: e.nativeEvent.pageX, y: e.nativeEvent.pageY, hexIndex, edgeIndex: 1 });
                          }
                        }}
                        disabled={edges[2] !== -1 || !isPlayerTurn}
                        style={{ position: "absolute", width: ROAD_WIDTH, height: HEX_HEIGHT * .5, top: 0, left: 0, backgroundColor: getEdgeColor(edges[2], isPlayerTurn), transform: [{ rotate: "60deg" }, { translateY: -HEX_HEIGHT * 0.25 }] }}
                      />
                      {/* top right */}
                      <Pressable
                        onPress={(e) => {
                          if (isPlayerTurn && edges[3] === -1) {
                            console.log(`[DEBUG] hexIndex:${hexIndex} edgeIndex:3`);
                            onRoadPopup({ x: e.nativeEvent.pageX, y: e.nativeEvent.pageY, hexIndex, edgeIndex: 3 });
                          }
                        }}
                        disabled={edges[3] !== -1 || !isPlayerTurn}
                        style={{ position: "absolute", width: ROAD_WIDTH, height: HEX_HEIGHT * .5, top: 0, right: 0, backgroundColor: getEdgeColor(edges[3], isPlayerTurn), transform: [{ rotate: "-60deg" }, { translateY: -HEX_HEIGHT * 0.25 }] }}
                      />
                      {/* bottom left */}
                      <Pressable
                        onPress={(e) => {
                        if (isPlayerTurn && edges[4] === -1) {
                          console.log(`[DEBUG] hexIndex:${hexIndex} edgeIndex:4`);
                          onRoadPopup({ x: e.nativeEvent.pageX, y: e.nativeEvent.pageY, hexIndex, edgeIndex: 4 });
                        }
                      }}
                        disabled={edges[4] !== -1 || !isPlayerTurn}
                        style={{ position: "absolute", width: ROAD_WIDTH, height: HEX_HEIGHT * .5, bottom: 0, left: 0, backgroundColor: getEdgeColor(edges[4], isPlayerTurn), transform: [{ rotate: "-60deg" }, { translateY: HEX_HEIGHT * 0.25 }] }}
                      />
                      {/* bottom right */}
                      <Pressable
                        onPress={(e) => {
                          if (isPlayerTurn && edges[5] === -1) {
                            console.log(`[DEBUG] hexIndex:${hexIndex} edgeIndex:5`);
                            onRoadPopup({ x: e.nativeEvent.pageX, y: e.nativeEvent.pageY, hexIndex, edgeIndex: 5 });
                          }
                        }}
                        disabled={edges[5] !== -1 || !isPlayerTurn}
                        style={{ position: "absolute", width: ROAD_WIDTH, height: HEX_HEIGHT * .5, bottom: 0, right: 0, backgroundColor: getEdgeColor(edges[5], isPlayerTurn), transform: [{ rotate: "60deg" }, { translateY: HEX_HEIGHT * 0.25 }] }}
                      />
                    </View>
                    <View style={{ position: "absolute", top: 0, left: 0, width: HEX_WIDTH, height: HEX_HEIGHT, justifyContent: "center", alignItems: "center", pointerEvents: "none" }}>
                      <Text style={{ color: "white", fontSize: HEX_WIDTH * 0.18, fontWeight: "bold" }}>
                        {hexRollData[hexIndex]}
                      </Text>
                      {robberHex === hexIndex && (
                        <View style={{ position: "absolute", width: HEX_WIDTH * 0.2, height: HEX_HEIGHT * 0.4, backgroundColor: "gray", borderRadius: 4 }} />
                      )}
                    </View>
                </View>
              );
            })}
          </View>
        );
      })}
      {roadBubbles.map((b) => (
        <Pressable
          key={b.key}
          onPress={(e) => {
            const { pageX, pageY } = e.nativeEvent;
            console.log(`[DEBUG] hexIndex:${b.hexIndex} edgeIdx:${b.edgeIdx}`);
            onRoadPopup({ x: pageX, y: pageY, hexIndex: b.hexIndex, edgeIndex: b.edgeIdx });
          }}
          style={{
            position: "absolute",
            left: b.x,
            top: b.y,
            width: b.size,
            height: b.size,
            borderRadius: b.size / 2,
            backgroundColor: "rgba(255, 255, 255, 0.6)",
            zIndex: 30,
          }}
        />
      ))}
    </View>
  );
}