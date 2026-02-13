import React from "react";
import { View, StyleSheet, Image } from "react-native";
import sprite1 from "./assets/hexSprites/sprite1.png";
import sprite2 from "./assets/hexSprites/sprite2.png";
import sprite3 from "./assets/hexSprites/sprite3.png";
import sprite4 from "./assets/hexSprites/sprite4.png";
import sprite5 from "./assets/hexSprites/sprite5.png";
import sprite6 from "./assets/hexSprites/sprite6.png";

const spriteMap = [sprite1, sprite2, sprite3, sprite4, sprite5, sprite6];

function getHexRowsFromLength(n) {
  const r = Math.round((3 + Math.sqrt(12 * n - 3)) / 6);
  const rows = [];
  for (let i = 0; i < r; i++) rows.push(r + i);
  for (let i = r - 2; i >= 0; i--) rows.push(r + i);
  return rows;
}

export default function HexGridScreen({ hexData, HEX_WIDTH, HEX_HEIGHT }) {
  if (!hexData?.length) return null;

  const rows = getHexRowsFromLength(hexData.length);
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
