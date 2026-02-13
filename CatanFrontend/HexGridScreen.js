import React from "react";
import { View, StyleSheet, Image } from "react-native";
import sprite1 from "./assets/hexSprites/sprite1.png";
import sprite2 from "./assets/hexSprites/sprite2.png";
import sprite3 from "./assets/hexSprites/sprite3.png";
import sprite4 from "./assets/hexSprites/sprite4.png";
import sprite5 from "./assets/hexSprites/sprite5.png";
import sprite6 from "./assets/hexSprites/sprite6.png";

const spriteMap = [sprite1, sprite2, sprite3, sprite4, sprite5, sprite6];

// change mapsize accordingly
function getHexRowsFromLength(totalHexes, topRow = 3, mapSize) {
  if (mapSize < 4) {
    throw new Error("MapSize must be at least 4");
  }

  const rows = [];
  let xSize = topRow;
  const midpoint = Math.floor(mapSize / 2);
  let remainingHexes = totalHexes;

  for (let i = 0; i < mapSize; i++) {
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

  // If there are leftover hexes, distribute them starting from the middle
  let idx = Math.floor(rows.length / 2);
  while (remainingHexes > 0) {
    rows[idx]++;
    remainingHexes--;
    idx = (idx + 1) % rows.length;
  }

  return rows;
}


export default function HexGridScreen({ hexData, HEX_WIDTH, HEX_HEIGHT, MAP_SIZE }) {
  if (!hexData?.length) return null;

  const rows = getHexRowsFromLength(hexData.length, 3, MAP_SIZE);
  const maxRow = Math.max(...rows);
  let dataIndex = 0;

  const gridWidth = maxRow * HEX_WIDTH;
  const gridHeight = rows.length * HEX_HEIGHT * 0.75;

  return (
    <View style={{ width: gridWidth, height: gridHeight }}>
      {rows.map((count, rowIndex) => {
        const offsetX = (maxRow - count) * (HEX_WIDTH / 2);
        const offsetY = rowIndex * (HEX_HEIGHT * 0.75);

        return (
          <View
            key={rowIndex}
            style={{
              position: "absolute",
              top: offsetY,
              left: offsetX,
              flexDirection: "row",
            }}
          >
            {Array.from({ length: count }).map((_, colIndex) => {
              const sprite = spriteMap[hexData[dataIndex++] - 1];
              return (
                <View
                  key={colIndex}
                  style={{ width: HEX_WIDTH, height: HEX_HEIGHT }}
                >
                  <View
                    style={{
                      width: HEX_WIDTH,
                      height: HEX_HEIGHT,
                      overflow: "hidden",
                      clipPath:
                        "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
                    }}
                  >
                    <Image
                      source={sprite}
                      style={{
                        width: HEX_WIDTH,
                        height: HEX_HEIGHT,
                        resizeMode: "cover",
                      }}
                    />
                  </View>
                </View>
              );
            })}
          </View>
        );
      })}
    </View>
  );
}
