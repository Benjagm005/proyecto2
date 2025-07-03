// src/App.js o cualquier otro componente padre
import React from "react";
import PokemonFetcher from "./PokemonFetcher"; //

function App() {
  return (
    <>
      <h1>¡Conoce a tus Pokemon!</h1>
        <PokemonFetcher />
    </>
  );
}
export default App;
