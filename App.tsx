
import React, { useState } from 'react';
import { GameState, CITIES } from './types';
import Game from './components/Game';
import Menu from './components/Menu';
import GameOver from './components/GameOver';
import { LOGO_IMAGE_URL } from './constants';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.MENU);
  const [score, setScore] = useState(0);
  const [distance, setDistance] = useState(0);
  const [finalCity, setFinalCity] = useState(CITIES[0]);
  const [isWin, setIsWin] = useState(false);

  const startGame = () => {
    setGameState(GameState.PLAYING);
    setScore(0);
    setDistance(0);
    setIsWin(false);
  };

  const endGame = (finalScore: number, finalDist: number, city: string, win?: boolean) => {
    setScore(finalScore);
    setDistance(Math.floor(finalDist));
    setFinalCity(city);
    setIsWin(!!win);
    setGameState(win ? GameState.WIN : GameState.GAMEOVER);
  };

  return (
    <div className="h-screen w-full bg-[#030712] flex flex-col items-center p-1 sm:p-2 select-none overflow-hidden transition-colors duration-500">
      {/* TITULO MINIMALISTA */}
      <header className="flex flex-row items-center justify-center gap-2 mb-1 w-full max-w-7xl animate-slide-up shrink-0">
        <img src={LOGO_IMAGE_URL} alt="L" className="h-4 sm:h-8 w-auto opacity-70" />
        <h1 className="text-lg sm:text-3xl font-cartoon text-blue-500 tracking-tighter uppercase whitespace-nowrap">
          WINDMAR RUNNER
        </h1>
        <img src={LOGO_IMAGE_URL} alt="R" className="h-4 sm:h-8 w-auto opacity-70" />
      </header>

      {/* MARCO DE JUEGO MAXIMIZADO */}
      <main className="relative w-full max-w-[99%] sm:max-w-7xl flex-grow bg-black border-[2px] sm:border-[6px] border-[#1e293b] rounded-lg sm:rounded-[1.5rem] shadow-2xl overflow-hidden ring-1 ring-blue-500/20">
        <div className="w-full h-full relative">
          {gameState === GameState.MENU && <Menu onStart={startGame} />}
          {gameState === GameState.PLAYING && <Game onGameOver={endGame} />}
          {(gameState === GameState.GAMEOVER || gameState === GameState.WIN) && (
            <GameOver 
              score={score} 
              distance={distance} 
              city={finalCity} 
              onRestart={startGame} 
              win={isWin}
            />
          )}
        </div>
      </main>

      {/* COPYRIGHT MINIMALISTA */}
      <footer className="mt-1 flex flex-row items-center justify-center w-full max-w-7xl px-3 animate-slide-up shrink-0 opacity-40">
        <p className="text-slate-500 text-[8px] sm:text-[10px] font-bold uppercase tracking-widest">
          WINDMAR © 2025
        </p>
      </footer>
    </div>
  );
};

export default App;
