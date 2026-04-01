import React, { useState } from "react";
import { View, Text, Pressable, StyleSheet, Modal } from "react-native";
import Slider from "@react-native-community/slider";
import { usePlayer } from "./PlayerContext";

export default function HostOptions({ visible, onClose, onStartGame }) {
  const [mapSize, setMapSize] = useState(null);
  const [victoryPoints, setVictoryPoints] = useState(10);
  const { username } = usePlayer();

  const handleGo = () => {
    if (!mapSize) return;
    onStartGame({
      HostUsername: username,
      MapSize: mapSize,
      MapType: 1,
      WinCondition: 1,
      WinPoints: victoryPoints,
    });
  };

  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onClose}>
      <View style={styles.modalBackground}>
        <View style={styles.modalContainer}>

          <Text style={styles.label}>Map Size</Text>
          <View style={styles.mapSizeContainer}>
            {[5, 7, 9].map((size) => (
              <Pressable
                key={size}
                style={[styles.mapSizeButton, mapSize === size && styles.mapSizeButtonSelected]}
                onPress={() => setMapSize(size)}
              >
                <Text style={styles.mapSizeText}>{size}</Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.label}>Victory Points: {victoryPoints}</Text>
          <Slider
            style={{ width: "100%", height: 40 }}
            minimumValue={5}
            maximumValue={20}
            step={1}
            value={victoryPoints}
            onValueChange={(val) => setVictoryPoints(val)}
            minimumTrackTintColor="#00ff99"
            maximumTrackTintColor="#334155"
            thumbTintColor="#e24b25"
          />

          <Pressable style={styles.goButton} onPress={handleGo}>
            <Text style={styles.buttonText}>Host Game</Text>
          </Pressable>

          <Pressable onPress={onClose} style={{ marginTop: 12 }}>
            <Text style={{ color: "#94a3b8", fontFamily: "Jersey10", fontSize: 16 }}>Cancel</Text>
          </Pressable>

        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: 300,
    backgroundColor: "#1e293b",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
  },
  label: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Jersey10",
    marginBottom: 10,
  },
  mapSizeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  mapSizeButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: "#e24b25",
    borderRadius: 8,
    marginHorizontal: 5,
  },
  mapSizeButtonSelected: {
    backgroundColor: "#ffd700",
  },
  mapSizeText: {
    fontSize: 16,
    fontFamily: "Jersey10",
    fontWeight: "bold",
  },
  goButton: {
    backgroundColor: "#00ff00",
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 12,
    marginTop: 20,
  },
  buttonText: {
    color: "#000",
    fontSize: 18,
    fontFamily: "Jersey10",
    fontWeight: "bold",
    textAlign: "center",
  },
});