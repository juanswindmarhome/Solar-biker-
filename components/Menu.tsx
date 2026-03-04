
import React from 'react';
import { TREX_IMAGE_URL } from '../constants';

interface MenuProps {
  onStart: () => void;
}

const Menu: React.FC<MenuProps> = ({ onStart }) => {
  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 overflow-hidden">
      <div className="bg-slate-900/95 rounded-[1.5rem] sm:rounded-[2rem] p-5 sm:p-8 max-w-xl w-full border-2 border-blue-600 shadow-2xl text-white flex flex-col items-center animate-pop-in">
        
        {/* Encabezado */}
        <div className="text-center mb-4">
          <h2 className="text-3xl sm:text-5xl font-cartoon text-blue-400 leading-tight uppercase tracking-tight">
            ¡DALE JHONNY!
          </h2>
          <div className="h-1 w-20 bg-yellow-500 mx-auto mt-1 rounded-full"></div>
        </div>

        {/* Explicación Ligera */}
        <div className="text-center mb-6 px-2">
          <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed italic">
            "Jhonny el T-Rex tiene una misión: llevar energía solar a todo Puerto Rico. ¡Esquiva los obstáculos de LUMA y recoge los soles para iluminar la isla!"
          </p>
        </div>

        {/* Personaje */}
        <div className="relative mb-6">
          <div className="absolute -inset-3 bg-blue-500/10 rounded-full blur-xl animate-pulse"></div>
          <div className="relative w-20 h-20 sm:w-28 sm:h-28 bg-slate-800 rounded-full border-2 border-blue-500 flex items-center justify-center overflow-hidden">
             <img src={TREX_IMAGE_URL} alt="Jhonny" className="w-4/5 h-4/5 object-contain" />
          </div>
        </div>
        
        {/* Controles e Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full mb-8">
          <div className="bg-slate-800/80 p-3 rounded-xl border border-blue-500/30">
            <h4 className="font-cartoon text-blue-400 text-xs sm:text-sm mb-1 uppercase">Controles</h4>
            <div className="flex flex-col gap-1">
              <p className="text-[10px] sm:text-xs text-slate-400"><span className="text-yellow-500">MÓVIL:</span> Toca la pantalla</p>
              <p className="text-[10px] sm:text-xs text-slate-400"><span className="text-yellow-500">PC:</span> Espacio / Flecha Arriba</p>
            </div>
          </div>
          <div className="bg-slate-800/80 p-3 rounded-xl border border-yellow-500/30">
            <h4 className="font-cartoon text-yellow-400 text-xs sm:text-sm mb-1 uppercase">Poderes</h4>
            <div className="flex flex-col gap-1">
              <p className="text-[10px] sm:text-xs text-slate-400">☀️ <span className="font-bold">5 SOLES</span> = +1 VIDA</p>
              <p className="text-[10px] sm:text-xs text-slate-400">⚡ <span className="font-bold text-blue-300">NITRO</span> = ¡A FUEGO!</p>
            </div>
          </div>
        </div>

        {/* Botón Acción */}
        <button 
          onClick={onStart}
          className="group relative w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-cartoon text-2xl sm:text-4xl rounded-xl shadow-[0_4px_0_rgb(30,58,138)] active:translate-y-1 active:shadow-none transition-all uppercase tracking-widest overflow-hidden"
        >
          <span className="relative z-10">¡ARRANCAR!</span>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
        </button>
      </div>
    </div>
  );
};

export default Menu;
