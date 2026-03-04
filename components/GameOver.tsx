
import React, { useMemo } from 'react';
import { METERS_PER_CITY, WIN_PHRASES, LOSS_PHRASES } from '../constants';
import { CITIES } from '../types';

interface GameOverProps {
  score: number;
  distance: number;
  city: string;
  onRestart: () => void;
  win?: boolean;
}

const GameOver: React.FC<GameOverProps> = ({ score, distance, city, onRestart, win }) => {
  const totalGoal = METERS_PER_CITY * CITIES.length;
  const progressPercent = Math.min(100, Math.floor((distance / totalGoal) * 100));

  const localPhrase = useMemo(() => {
    const pool = win ? WIN_PHRASES : LOSS_PHRASES;
    return pool[Math.floor(Math.random() * pool.length)];
  }, [win]);

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 sm:p-6 overflow-hidden">
      <div className={`bg-white rounded-[3rem] p-6 sm:p-10 max-w-xl w-full border-8 sm:border-[12px] ${win ? 'border-yellow-400' : 'border-red-600'} shadow-[0_0_80px_rgba(0,0,0,0.5)] text-center overflow-y-auto max-h-[95vh] animate-pop-in`}>
        {win ? (
          <div className="animate-bounce-short">
            <h2 className="text-5xl sm:text-7xl font-cartoon text-yellow-600 mb-2 drop-shadow-md uppercase tracking-tight">¡LEYENDA SOLAR!</h2>
            <p className="text-2xl sm:text-3xl font-graffiti text-blue-700 mb-6 italic animate-pulse">
              {localPhrase}
            </p>
          </div>
        ) : (
          <div>
            <h2 className="text-5xl sm:text-7xl font-cartoon text-red-600 mb-2 uppercase leading-none drop-shadow-md">¡APAGÓN TOTAL!</h2>
            <p className="text-2xl sm:text-3xl font-graffiti text-gray-800 mb-6 italic">
              {localPhrase}
            </p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 mb-8 bg-gray-100 p-5 rounded-[2rem] shadow-inner animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <div className="text-left border-r border-gray-300 pr-2">
            <span className="block text-[12px] font-black text-gray-400 uppercase tracking-widest">DISTANCIA</span>
            <span className="text-3xl sm:text-4xl font-cartoon text-blue-600">{Math.floor(distance)}m</span>
          </div>
          <div className="text-left pl-2">
            <span className="block text-[12px] font-black text-gray-400 uppercase tracking-widest">CIUDAD</span>
            <span className="text-xl sm:text-2xl font-cartoon text-emerald-600 leading-tight block truncate">
              {city.split(' (')[0]}
            </span>
          </div>
        </div>

        <div className="mb-8 px-4 animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <div className="flex justify-between text-xs font-black text-gray-500 mb-2 tracking-tighter">
            <span>PROGRESO ISLA</span>
            <span>{progressPercent}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-6 border-2 border-gray-300 overflow-hidden shadow-inner p-1">
            <div 
              className={`h-full rounded-full transition-all duration-1000 ease-out shadow-lg ${win ? 'bg-yellow-400' : 'bg-blue-500'}`} 
              style={{ width: `${progressPercent}%` }}
            >
              <div className="w-full h-full shimmer-effect opacity-30"></div>
            </div>
          </div>
        </div>

        <div className="animate-slide-up" style={{ animationDelay: '0.4s' }}>
          <button 
            onClick={onRestart}
            className={`group relative w-full py-5 sm:py-6 ${win ? 'bg-yellow-500' : 'bg-red-600'} text-white font-cartoon text-3xl sm:text-5xl rounded-[2rem] shadow-[0_10px_0_rgba(0,0,0,0.2)] hover:scale-[1.03] transition-all active:scale-95 border-b-8 sm:border-b-[12px] ${win ? 'border-yellow-800' : 'border-red-900'} uppercase overflow-hidden`}
          >
            <span className="relative z-10">{win ? "¡DALE OTRA VEZ!" : "INTENTAR DE NUEVO"}</span>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameOver;