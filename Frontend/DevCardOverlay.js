import React, { useState, useEffect } from "react";
import { View, Text, Pressable, StyleSheet, Image, Animated } from "react-native";

const API_BASE = "http://localhost:5082";

const DEV_CARD_SPRITES = {
  5: require("./assets/devCardSprites/VPDevCard.png"),
  1: require("./assets/devCardSprites/KnightDevCard.png"),
  2: require("./assets/devCardSprites/MonoDevCard.png"),
  3: require("./assets/devCardSprites/RBDevCard.png"),
  4: require("./assets/devCardSprites/YoPDevCard.png"),
};

const CARD_ORDER = [5, 1, 2, 3, 4];

const CARD_NAMES = {
  1: "Knight",
  2: "Monopoly",
  3: "Road Building",
  4: "Year of Plenty",
  5: "Victory Point",
};

const CARD_WIDTH = 60;
const CARD_HEIGHT = 90;
const STACK_OFFSET = 10;


export default function DevCardOverlay({ devCards = [], playerPoints }) {
  const [expanded, setExpanded] = useState(false);

  const cardCounts = {};
  for (const card of devCards) {
    cardCounts[card] = (cardCounts[card] ?? 0) + 1;
  }

  const cardGroups = CARD_ORDER.filter((type) => (cardCounts[type] ?? 0) > 0);
  const stackWidth = (count) => CARD_WIDTH + (count - 1) * STACK_OFFSET;

  return (
    <Animated.View style={[styles.container, expanded && styles.expanded]}>
      <Pressable style={styles.tab} onPress={() => setExpanded(!expanded)}>
        <Text style={styles.tabText}>{expanded ? "◀" : "▶"}</Text>
      </Pressable>

      {expanded && (
        <View style={styles.content}>
          <Text style={styles.pointsText}>
            Victory Points: {playerPoints ?? "—"}
          </Text>

          <View style={styles.cardList}>
            {cardGroups.length === 0 && (
              <Text style={styles.emptyText}>No dev cards</Text>
            )}

            {cardGroups.map((type) => {
              const count = cardCounts[type];
              const totalWidth = stackWidth(count);

              return (
                <View
                  key={type}
                  style={[styles.cardGroup, { width: totalWidth, height: CARD_HEIGHT }]}
                >
                  {Array.from({ length: count }).map((_, i) => (
                    <Image
                      key={i}
                      source={DEV_CARD_SPRITES[type]}
                      style={[
                        styles.card,
                        { left: i * STACK_OFFSET, zIndex: i },
                      ]}
                    />
                  ))}
                </View>
              );
            })}
          </View>
        </View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: "30%",
    left: 0,
    backgroundColor: "#972929",
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    minHeight: 60,
  },
  expanded: {
    paddingRight: 16,
  },
  tab: {
    width: 28,
    paddingVertical: 20,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#7a2020",
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
  },
  tabText: {
    color: "#ffd000",
    fontSize: 36,
    fontFamily: "Jersey10",
  },
  content: {
    paddingLeft: 12,
    paddingTop: 12,
    paddingBottom: 12,
  },
  pointsText: {
    color: "#ffd000",
    fontFamily: "Jersey10",
    fontSize: 36,
    marginBottom: 12,
  },
  cardList: {
    flexDirection: "column",
    gap: 16,
  },
  cardGroup: {
    position: "relative",
  },
  card: {
    position: "absolute",
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    resizeMode: "contain",
    borderRadius: 0,
  },
  emptyText: {
    color: "#ffd000",
    fontFamily: "Jersey10",
    fontSize: 24,
  },
});