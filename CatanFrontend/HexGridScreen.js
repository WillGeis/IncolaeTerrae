import React from "react";
import { View, StyleSheet, Image } from "react-native";
import sprite1 from "./assets/hexSprites/sprite1.png";
import sprite2 from "./assets/hexSprites/sprite2.png";
import sprite3 from "./assets/hexSprites/sprite3.png";
import sprite4 from "./assets/hexSprites/sprite4.png";
import sprite5 from "./assets/hexSprites/sprite5.png";
import sprite6 from "./assets/hexSprites/sprite6.png";

const spriteMap = [sprite1, sprite2, sprite3, sprite4, sprite5, sprite6];

const HEX_SIZE = 60; // width of hexagon
const HEX_HEIGHT = HEX_SIZE * 0.866; // visual height = width * 0.866

const Hex = () => {
  return <View style={styles.hex} />;
};

const HexRow = ({ count, offset }) => {
  return (
    <View
      style={[
        styles.row,
        offset && { marginLeft: ROW_OFFSET }
      ]}
    >
      {Array.from({ length: count }).map((_, i) => (
        <Hex key={i} />
      ))}
    </View>
  );
};

function getHexRowsFromLength(n) {
  //  $r_n(r_{n-1}) + 1 = n$
  const r = Math.round((3 + Math.sqrt(12 * n - 3)) / 6);
  const rows = [];

  for (let i = 0; i < r; i++) rows.push(r + i);
  for (let i = r - 2; i >= 0; i--) rows.push(r + i);

  return rows;
}

export default function HexGridScreen({ hexData }) {
  if (!hexData || hexData.length === 0) return null;

  const rows = getHexRowsFromLength(hexData.length);
  const maxRow = Math.max(...rows);

  let dataIndex = 0;

  return (
    <View style={styles.container}>
      {rows.map((count, rowIndex) => {
        const offset = (maxRow - count) * (HEX_SIZE / 2);

        return (
          <View
            key={rowIndex}
            style={[styles.row, { marginLeft: offset }]}
          >
            {Array.from({ length: count }).map((_, colIndex) => {
              const value = hexData[dataIndex++] - 1;
              const sprite = spriteMap[value];

              return (
                <Image
                  key={colIndex}
                  source={sprite}
                  style={styles.hex}
                />
              );
            })}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  row: {
    flexDirection: "row",
    marginVertical: -10, // overlap rows
  },

  hex: {
    width: HEX_SIZE,
    height: HEX_HEIGHT,
    marginHorizontal: 5,
  },
});
