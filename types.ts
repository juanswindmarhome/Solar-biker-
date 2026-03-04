
export enum GameState {
  MENU = 'MENU',
  PLAYING = 'PLAYING',
  GAMEOVER = 'GAMEOVER',
  WIN = 'WIN'
}

export interface GameObject {
  x: number;
  y: number;
  width: number;
  height: number;
}

export const CITIES = [
  "San Juan (Metro)",
  "Mayagüez (Oeste)",
  "Ponce (Sur)",
  "Arecibo (Norte)",
  "Fajardo (Este)",
  "Vieques (Isla)",
  "Culebra (Paraíso)"
];
