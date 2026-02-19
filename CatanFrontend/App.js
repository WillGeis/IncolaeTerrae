import React from "react";
import { StyleSheet, Text } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import * as Font from "expo-font";
import { useState, useEffect } from "react";

import StartScreen from "./StartScreen";
import MainGameScreen from "./MainGameScreen";
import LobbyScreen from "./LobbyScreen";
import HostWaitingScreen from "./HostWaitingScreen";
import PlayerWaitingScreen from "./PlayerWaitingScreen";

const Stack = createNativeStackNavigator();

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
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Start">
        <Stack.Screen
          name="Start"
          component={StartScreen}
          options={{
            title: "Cootan Main",
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
            title: "Lobby",
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
      </Stack.Navigator>
    </NavigationContainer>
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
