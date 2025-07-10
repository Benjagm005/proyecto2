import React, { useState, useEffect } from 'react';
import './PokemonFetcher.css';

const PokemonFetcher = () => {
  const [pokemones, setPokemones] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [tipos, setTipos] = useState([]);
  const [tipoSeleccionado, setTipoSeleccionado] = useState('');

  useEffect(() => {
    const fetchTipos = async () => {
      try {
        const res = await fetch('https://pokeapi.co/api/v2/type');
        const data = await res.json();
        const tiposValidos = data.results.filter(t => !['unknown', 'shadow'].includes(t.name));
        setTipos(tiposValidos);
      } catch (err) {
        console.error('Error al cargar los tipos:', err);
      }
    };
    fetchTipos();
  }, []);

  useEffect(() => {
    const fetchPokemones = async () => {
      try {
        setCargando(true);
        setError(null);
        const fetchedPokemones = [];
        const pokemonIds = new Set();

        while (pokemonIds.size < 7) {
          const randomId = Math.floor(Math.random() * 898) + 1;
          pokemonIds.add(randomId);
        }

        const idsArray = Array.from(pokemonIds);

        for (const id of idsArray) {
          const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}/`);
          if (!response.ok) {
            throw new Error(`Error al cargar el Pokémon con ID ${id}: ${response.statusText}`);
          }
          const data = await response.json();
          fetchedPokemones.push({
            id: data.id,
            nombre: data.name,
            imagen: data.sprites.front_default,
            tipos: data.types.map(typeInfo => typeInfo.type.name),
          });
        }
        setPokemones(fetchedPokemones);
      } catch (err) {
        setError(err.message);
      } finally {
        setCargando(false);
      }
    };

    // Solo buscar aleatorios si no hay tipo seleccionado
    if (!tipoSeleccionado) {
      fetchPokemones();
    }
  }, [tipoSeleccionado]);

  const handleTipoChange = async (e) => {
    const tipo = e.target.value;
    setTipoSeleccionado(tipo);

    if (!tipo) return;

    try {
      setCargando(true);
      const res = await fetch(`https://pokeapi.co/api/v2/type/${tipo}`);
      const data = await res.json();
      const pokemonsFiltrados = data.pokemon.slice(0, 7);

      const detalles = await Promise.all(
        pokemonsFiltrados.map(async (p) => {
          const r = await fetch(p.pokemon.url);
          const d = await r.json();
          return {
            id: d.id,
            nombre: d.name,
            imagen: d.sprites.front_default,
            tipos: d.types.map(t => t.type.name),
          };
        })
      );

      setPokemones(detalles);
    } catch (err) {
      setError('Error al buscar Pokémon por tipo');
    } finally {
      setCargando(false);
    }
  };

  if (cargando) {
    return <div className="pokemon-container">Cargando Pokémon...</div>;
  }

  if (error) {
    return <div className="pokemon-container error">Error: {error}</div>;
  }

  return (
    <div className='pokemon-container'>
      <h2>{tipoSeleccionado ? `Pokémon de tipo: ${tipoSeleccionado.charAt(0).toUpperCase() + tipoSeleccionado.slice(1)}` : 'Tus Pokémon Aleatorios'}</h2>

      <div className="buscador-container">
        <label htmlFor="tipo">Buscar por tipo: </label>
        <select id="tipo" value={tipoSeleccionado} onChange={handleTipoChange}>
          <option value="">Selecciona un tipo</option>
          {tipos.map((tipo) => (
            <option key={tipo.name} value={tipo.name}>
              {tipo.name.charAt(0).toUpperCase() + tipo.name.slice(1)}
            </option>
          ))}
        </select>
      </div>

      <div className="pokemon-list">
        {pokemones.length > 0 ? (
          pokemones.map(pokemon => (
            <div key={pokemon.id} className="pokemon-card">
              <h3>{pokemon.nombre.charAt(0).toUpperCase() + pokemon.nombre.slice(1)}</h3>
              <img src={pokemon.imagen} alt={pokemon.nombre} />
              <p>
                <strong>Tipos:</strong> {pokemon.tipos.map(type => type.charAt(0).toUpperCase() + type.slice(1)).join(', ')}
              </p>
            </div>
          ))
        ) : (
          <p>No se encontraron Pokémon.</p>
        )}
      </div>
    </div>
  );
};

export default PokemonFetcher;
