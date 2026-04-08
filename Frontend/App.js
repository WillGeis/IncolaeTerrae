
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import * as Font from "expo-font";
import { useState, useEffect } from "react";

import StartScreen from "./StartScreen";
import MainGameScreen from "./MainGameScreen";
import LobbyScreen from "./LobbyScreen";
import HostWaitingScreen from "./HostWaitingScreen";
import PlayerWaitingScreen from "./PlayerWaitingScreen";
import JoinGame from "./JoinGame";
import LoadingScreenMain from "./LoadingMainScreen";
import { PlayerProvider, usePlayer } from "./PlayerContext";


const Stack = createNativeStackNavigator();

// /* //this the main app, I comment/uncomment it to test the game
export default function App() {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    async function loadFonts() {
      await Font.loadAsync({
        Jersey10: require("./assets/fonts/Jersey10-Regular.ttf"),
      });
      setFontsLoaded(true);
    }
    loadFonts();
  }, []);

  if (!fontsLoaded) return null;

  return (
    <PlayerProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Start">
          <Stack.Screen
            name="Start"
            component={StartScreen}
            options={{
              title: "Incolae Terrae",
              headerTransparent: true,
              headerShadowVisible: false,
              headerTitleStyle: {
                fontFamily: "Jersey10",
                fontSize: 28,
                color: "#1e3a8a",
              },
              headerTitleAlign: "center",
            }}
          />
          <Stack.Screen
            name="Lobby"
            component={LobbyScreen}
            options={{
              headerTransparent: true,
              headerShadowVisible: false,
              headerTitleStyle: {
                fontFamily: "Jersey10",
                fontSize: 28,
                color: "#8a8a1e",
              },
              headerTitleAlign: "center",
            }}
          />
          <Stack.Screen
            name="Game"
            component={MainGameScreen}
            options={{ 
              title: "Game Screen",
              headerTransparent: true,
              headerShadowVisible: false,
              headerTitleStyle: {
                fontFamily: "Jersey10",
                fontSize: 28,
                color:"#1e3a8a",
              }, 
            }}
          />
          <Stack.Screen
            name="HostWaiting"
            component={HostWaitingScreen}
            options={{ headerShown: false }}
          />

          <Stack.Screen
            name="PlayerWaiting"
            component={PlayerWaitingScreen}
            options={{ headerShown: false }}
          />

          <Stack.Screen
            name="JoinGame"
            component={JoinGame}
            options={{ headerShown: false }}
          />

          <Stack.Screen
            name="Loading"
            component={LoadingScreenMain}
            options={{ headerShown: false }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </PlayerProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },

  headerTitleStyle: {
  fontFamily: "Jersey10",
  fontSize: 24,
  color: "#fff", 
},
});
// */

/*
export default function App() {
  return (
    <View style={styles.container}>
      <MainGameScreen
        route={{
          params: { MAP_SIZE: 5 },
        }}
      />
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
});
*/