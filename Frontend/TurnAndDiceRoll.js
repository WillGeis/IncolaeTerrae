import React from "react";
import { View, Text, StyleSheet } from "react-native";
 
export default function TurnAndDiceRoll({ currentDiceRoll, playerNamesList, playerTurn }) {
  return (
    <View style={styles.container}>
      {/* Dice Roll */}
      <View style={styles.diceSection}>
        <Text style={styles.diceLabel}>ROLL</Text>
        <Text style={styles.diceNumber}>
          {currentDiceRoll > 0 ? currentDiceRoll : "—"}
        </Text>
      </View>
 
      <View style={styles.divider} />
 
      {/* Player List */}
      <View style={styles.playerSection}>
        {playerNamesList.map((name, index) => {
          const isActive = index === playerTurn;
          return (
            <View key={index} style={styles.playerRow}>
              <Text style={[styles.triangle, isActive ? styles.triangleActive : styles.triangleHidden]}>
                ▶
              </Text>
              <Text
                style={[
                  styles.playerName,
                  isActive && styles.playerNameActive,
                ]}
                numberOfLines={1}
              >
                {name}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}
 
const styles = StyleSheet.create({
  container: {
    position: "absolute",
    right: 20,
    top: 20,
    zIndex: 20,
    backgroundColor: "#972929",
    padding: 10,
    width: 200,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    },
  diceSection: {
    alignItems: "center",
    paddingBottom: 6,
  },
  diceLabel: {
    fontFamily: "Jersey10",
    fontWeight: "bold",
    color: "#7a6000",
    fontSize: 18,
    letterSpacing: 4,
  },
  diceNumber: {
    fontFamily: "Jersey10",
    fontWeight: "bold",
    color: "#ffd000",
    fontSize: 64,
    lineHeight: 64,
    textAlign: "center",
  },
  divider: {
    height: 2,
    backgroundColor: "#7a2020",
    marginVertical: 6,
  },
  playerSection: {
    paddingTop: 2,
  },
  playerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 2,
  },
  triangle: {
    fontFamily: "Jersey10",
    fontSize: 16,
    width: 22,
    textAlign: "center",
  },
  triangleActive: {
    color: "#ffd000",
  },
  triangleHidden: {
    color: "transparent",
  },
  playerName: {
    fontFamily: "Jersey10",
    fontWeight: "bold",
    color: "#7a6000",
    fontSize: 22,
    flex: 1,
  },
  playerNameActive: {
    color: "#ffd000",
  },
});