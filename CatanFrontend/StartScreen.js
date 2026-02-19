import React from "react";
import { View, Text, StyleSheet, Pressable, Linking, TextInput } from "react-native";
import { usePlayer } from "./PlayerContext";

const REPO_URL = "https://github.com/WillGeis/CatanOnline";

export default function StartScreen({ navigation }) {
  const [localUsername, setLocalUsername] = React.useState("");
  const { setUsername } = usePlayer();
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Cootan</Text>

      <TextInput
        placeholder="Enter username"
        placeholderTextColor="#8fa2ff"
        value={localUsername}
        onChangeText={setLocalUsername}
        style={styles.input}
      />

      <Pressable
        disabled={!localUsername}
        style={styles.button}
        onPress={() => {
          setUsername(localUsername);
          navigation.navigate("Lobby");
        }}
      >
        <Text style={styles.buttonText}>Open Game</Text>
      </Pressable>

      <Pressable
        style={styles.repoContainer}
        onPress={() => Linking.openURL(REPO_URL)}
      >
        <Text style={styles.repoText}>Github Project Repo</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#090d18",
    justifyContent: "center",
    alignItems: "center",
  },

  title: {
    fontSize: 200,
    fontFamily: "Jersey10",
    fontWeight: "800",
    color: "#e0e7ff",
    marginBottom: 8,
  },

  button: {
    backgroundColor: "#e24b25",
    paddingVertical: 50,
    paddingHorizontal: 100,
    borderRadius: 5,
    shadowColor: "#ffffff",
    shadowOpacity: 0.3,
    shadowRadius: 100,
    elevation: 60,
  },

  buttonPressed: {
    transform: [{ scale: 0.97 }],
    opacity: 0.9,
  },

  buttonText: {
    color: "#000000",
    fontSize: 50,
    fontFamily: "Jersey10",
    fontWeight: "bold",
  },

  repoContainer: {
    position: "absolute",
    bottom: 24,
  },

  repoText: {
    color: "#8fa2ff",
    fontSize: 20,
    fontFamily: "Jersey10",
    textDecorationLine: "underline",
    opacity: 0.85,
  },

  input: {
    borderWidth: 2,
    borderColor: "#8fa2ff",
    color: "#e0e7ff",
    fontSize: 24,
    padding: 12,
    marginBottom: 24,
    width: 300,
    textAlign: "center",
    fontFamily: "Jersey10",
  },
});
