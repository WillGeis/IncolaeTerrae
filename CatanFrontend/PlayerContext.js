import React, { createContext, useContext, useState } from "react";

const PlayerContext = createContext();

export function PlayerProvider({ children }) {
  const [username, setUsername] = useState("");
  const [guid, setGuid] = useState(null);
  const [isHost, setIsHost] = useState(false);
  const [playerNumber, setPlayerNumber] = useState(-1);

  return (
    <PlayerContext.Provider
      value={{ username, setUsername, guid, setGuid, isHost, setIsHost, playerNumber, setPlayerNumber }}
    >
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  return useContext(PlayerContext);
}
