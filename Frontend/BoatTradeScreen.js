import React, { useState } from "react";
import { View, Text, Pressable, StyleSheet, ScrollView } from "react-native";

const RESOURCE_NAMES = ["Wheat", "Brick", "Ore", "Wood", "Sheep"];
const RESOURCE_COLORS = ["#d4a017", "#b5651d", "#708090", "#228b22", "#90ee90"];

function encodeTradeData(offerIndex, desireIndex) {
  return ((offerIndex + 1) << 4) | (desireIndex + 1);
}

export default function BoatTradeScreen({
  x,
  y,
  boat,
  resourceType,
  onClose,
  playerNumber,
  serverUrl,
  guid,
}) {
  const isWildcard = resourceType === 0;
  const [selectedIndex, setSelectedIndex] = useState(
    isWildcard ? null : resourceType - 1,
  );
  const [loading, setLoading] = useState(false);
  const fixedofferIndex = isWildcard ? null : resourceType - 1;

  const [col1, row1, col2, row2, boatType] = boat;

  const canConfirm = selectedIndex !== null;

  const executeTrade = async () => {
    if (!canConfirm || loading) return;
    setLoading(true);
    try {
      const moveData = {
        PlayerID: playerNumber,
        TradeData: [
          col1,
          row1,
          col2,
          row2,
          boatType,
          fixedofferIndex + 1,
          selectedIndex + 1,
        ],
      };
      const url = `${serverUrl}/processMove?guid=${guid}&moveType=7&moveDataJson=${encodeURIComponent(JSON.stringify(moveData))}`;
      const res = await fetch(url);
      const json = await res.json();
      if (!json.success) console.warn("[BOAT TRADE] Rejected:", json.error);
      else onClose();
    } catch (err) {
      console.error("[BOAT TRADE] Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const resources = isWildcard
    ? RESOURCE_NAMES.map((name, i) => ({ name, i }))
    : [{ name: RESOURCE_NAMES[fixedofferIndex], i: fixedofferIndex }];

  return (
    <Pressable style={StyleSheet.absoluteFill} onPress={onClose}>
      <Pressable
        style={[styles.container, { left: x - 10, top: y - 10 }]}
        onPress={(e) => e.stopPropagation()}
      >
        <View style={styles.listCol}>
          {resources.map(({ name, i }) => (
            <Pressable
              key={i}
              style={styles.resourceRow}
              onPress={() => isWildcard && setSelectedIndex(i)}
            >
              <Text
                style={[
                  styles.resourceName,
                  isWildcard &&
                    selectedIndex === i &&
                    styles.resourceNameSelected,
                ]}
              >
                {name} {isWildcard ? "3:1" : "2:1"}
              </Text>
            </Pressable>
          ))}
          <Pressable
            style={[
              styles.confirmBtn,
              !canConfirm && styles.confirmBtnDisabled,
            ]}
            onPress={executeTrade}
            disabled={!canConfirm || loading}
          >
            <Text
              style={[
                styles.confirmText,
                !canConfirm && styles.confirmTextDisabled,
              ]}
            >
              {loading ? "..." : "Confirm"}
            </Text>
          </Pressable>
        </View>
      </Pressable>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    backgroundColor: "#1a1f2e",
    borderWidth: 1.5,
    borderColor: "#ffd000",
    padding: 10,
    zIndex: 1000,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    elevation: 10,
  },
  confirmCol: {
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 6,
  },
  confirmArrow: {
    fontSize: 28,
    color: "#4a4a4a",
  },
  confirmArrowReady: {
    color: "#ef4444",
  },
  listCol: {
    gap: 8,
  },
  title: {
    fontFamily: "Jersey10",
    color: "#ffd000",
    fontSize: 22,
    marginBottom: 4,
  },
  sectionLabel: {
    fontFamily: "Jersey10",
    color: "#94a3b8",
    fontSize: 16,
    marginBottom: 2,
  },
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 4,
  },
  resourceNameSelected: {
    color: "#ffd000",
  },
  resourceBtn: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderWidth: 1.5, //
    borderRadius: 3,
    backgroundColor: "transparent", //
  },
  resourceBtnDisabled: {
    opacity: 0.2,
  },
  resourceName: {
    fontFamily: "Jersey10",
    color: "#e2e8f0",
    fontSize: 20,
  },
  desireArrow: {
    fontSize: 22,
    color: "#4a4a4a",
  },
  desireArrowSelected: {
    color: "#22c55e",
  },
  resourceText: {
    fontFamily: "Jersey10",
    color: "#e2e8f0",
    fontSize: 15,
  },
  resourceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 24,
  },
  resourceTextSelected: {
    color: "#0f172a",
  },
  summary: {
    fontFamily: "Jersey10",
    color: "#ffd000",
    fontSize: 17,
    textAlign: "center",
    marginVertical: 4,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
    marginTop: 4,
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: "#2d1a1a",
    padding: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#7a2020",
  },
  cancelText: {
    fontFamily: "Jersey10",
    color: "#ef4444",
    fontSize: 22,
  },
  confirmBtn: {
    flex: 3,
    backgroundColor: "#972929",
    padding: 8,
    alignItems: "center",
  },
  confirmBtnDisabled: {
    backgroundColor: "#4a1a1a",
  },
  confirmText: {
    fontFamily: "Jersey10",
    color: "#ffd000",
    fontSize: 22,
  },
  confirmTextDisabled: {
    color: "#7a6000",
  },
});
