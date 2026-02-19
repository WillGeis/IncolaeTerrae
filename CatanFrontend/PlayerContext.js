import React, { createContext, useContext, useState } from "react";

const PlayerContext = createContext();

export function PlayerProvider({ children }) {
  const [username, setUsername] = useState("");
  const [guid, setGuid] = useState(null);

  return (
    <PlayerContext.Provider value={{ username, setUsername, guid, setGuid }}>
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  return useContext(PlayerContext);
}
