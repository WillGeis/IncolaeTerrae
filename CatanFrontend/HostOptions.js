import React, { useState } from "react";
import { View, Text, Pressable, StyleSheet, Modal } from "react-native";
import Slider from "@react-native-community/slider";

export default function HostOptions({ visible, onClose, onStartGame }) {
  const [mapSize, setMapSize] = useState(5);
  const [victoryPoints, setVictoryPoints] = useState(10);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalBackground}>
        <View style={styles.modalContainer}>
          <Text style={styles.label}>Select Map Size:</Text>
          <View style={styles.mapSizeContainer}>
            {[5, 7, 9].map((size) => (
              <Pressable
                key={size}
                style={[
                  styles.mapSizeButton,
                  mapSize === size && styles.mapSizeButtonSelected,
                ]}
                onPress={() => setMapSize(size)}
              >
                <Text style={styles.mapSizeText}>{size}</Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.label}>
            Victory Points Needed: {victoryPoints}
          </Text>
          <Slider
            style={{ width: 250, height: 40 }}
            minimumValue={5}
            maximumValue={30}
            step={1}
            value={victoryPoints}
            onValueChange={setVictoryPoints}
            minimumTrackTintColor="#e24b25"
            maximumTrackTintColor="#fff"
          />

          <Pressable
            style={styles.goButton}
            onPress={() => onStartGame(mapSize, victoryPoints)}
          >
            <Text style={styles.buttonText}>Go</Text>
          </Pressable>

          <Pressable
            style={[styles.goButton, { backgroundColor: "#e24b25", marginTop: 10 }]}
            onPress={onClose}
          >
            <Text style={styles.buttonText}>Cancel</Text>
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
