
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { 
  GRAVITY, 
  JUMP_FORCE, 
  DOUBLE_JUMP_FORCE,
  BASE_SPEED, 
  SPEED_INCREMENT, 
  METERS_PER_CITY, 
  TREX_IMAGE_URL,
  FLOATING_OBSTACLE_URL,
  POWERUP_BOOST_DISTANCE,
  BACKGROUND_URLS,
  MAX_LIVES_INITIAL,
  MAX_LIVES_LIMIT,
  SUNS_PER_LIFE,
} from '../constants';
import { CITIES } from '../types';

interface GameProps {
  onGameOver: (score: number, distance: number, city: string, win?: boolean) => void;
}

interface Particle {
  x: number; 
  y: number; 
  vx: number; 
  vy: number; 
  life: number; 
  size: number; 
  color: string;
  type: 'smoke' | 'shard' | 'paper';
  rotation?: number;
  vr?: number;
}

interface Collectible {
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'sun' | 'nitro';
}

interface Obstacle {
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'ground' | 'floating' | 'bill';
  isDoubleStory?: boolean;
  isLumaBill?: boolean;
  billPosition?: 'top' | 'bottom';
  bobOffset?: number;
}

const Game: React.FC<GameProps> = ({ onGameOver }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<number>(0);
  
  const gameActive = useRef(true);
  const distance = useRef(0);
  const sunsCollected = useRef(0);
  const totalScore = useRef(0);
  const currentCityIndex = useRef(0);
  const lives = useRef(MAX_LIVES_INITIAL);
  const obstacleCooldown = useRef(0);
  const collectibleCooldown = useRef(0);
  const invulnerableTimer = useRef(0);

  // Lógica de secuencia para paneles solares (3-2-3-5-3-2-5)
  const panelSequence = [3, 2, 3, 5, 3, 2, 5];
  const panelSequenceIdx = useRef(0);
  const panelsUntilNextDouble = useRef(panelSequence[0]);

  // Secuencia solicitada para Bills de LUMA: 1 1 2 1 2 2 1 1 2 1 2 2 1
  const billSequence = [1, 1, 2, 1, 2, 2, 1, 1, 2, 1, 2, 2, 1]; 
  const billSequenceIdx = useRef(0);
  
  const player = useRef({
    x: 150,
    y: 0,
    width: 100,
    height: 100,
    dy: 0,
    rotation: 0,
    targetRotation: 0,
    jumpCount: 0,
    boostRemaining: 0,
    guayandoTimer: 0,
    isJumping: false,
    vibrationY: 0,
    squashX: 1,
    squashY: 1,
    landingTimer: 0
  });

  const obstacles = useRef<Obstacle[]>([]);
  const collectibles = useRef<Collectible[]>([]);
  const particles = useRef<Particle[]>([]);
  const trexImg = useRef<HTMLImageElement>(new Image());
  const lumaBillImg = useRef<HTMLImageElement>(new Image());
  const backgroundImages = useRef<HTMLImageElement[]>([]);

  const handleJump = useCallback(() => {
    if (!gameActive.current) return;
    if (player.current.jumpCount < 2) {
      player.current.dy = player.current.jumpCount === 0 ? JUMP_FORCE : DOUBLE_JUMP_FORCE;
      player.current.jumpCount++;
      player.current.isJumping = true;
      player.current.squashX = 0.85;
      player.current.squashY = 1.15;
      createExplosion(player.current.x + 30, player.current.y + 90, '#ffffff', 'smoke', 6);
    }
  }, []);

  useEffect(() => {
    trexImg.current.src = TREX_IMAGE_URL;
    lumaBillImg.current.src = FLOATING_OBSTACLE_URL; // Usamos la URL del Bill de Luma proporcionada
    BACKGROUND_URLS.forEach((url, i) => {
      const img = new Image();
      img.src = url;
      backgroundImages.current[i] = img;
    });

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        handleJump();
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (gameActive.current) {
        e.preventDefault();
        handleJump();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('touchstart', handleTouchStart, { passive: false });
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('touchstart', handleTouchStart);
    };
  }, [handleJump]);

  const createExplosion = (x: number, y: number, color: string, type: 'smoke' | 'shard' | 'paper' = 'smoke', count: number = 8) => {
    for(let i=0; i<count; i++) {
      particles.current.push({
        x, y,
        vx: (Math.random() - 0.5) * (type === 'shard' ? 14 : 8),
        vy: (Math.random() - 0.5) * (type === 'shard' ? 14 : 8) - (type === 'shard' || type === 'paper' ? 5 : 0),
        life: 1.0,
        size: type === 'paper' ? 10 + Math.random() * 5 : (type === 'shard' ? 3 + Math.random() * 8 : 2 + Math.random() * 4),
        color,
        type,
        rotation: Math.random() * Math.PI * 2,
        vr: (Math.random() - 0.5) * (type === 'paper' ? 0.2 : 0.5)
      });
    }
  };

  const spawnObstacles = (canvasWidth: number, canvasHeight: number) => {
    if (obstacleCooldown.current > 0) {
      obstacleCooldown.current--;
      return;
    }

    const groundY = canvasHeight - 70;
    const rand = Math.random();

    if (rand < 0.48) {
      const type = billSequence[billSequenceIdx.current];
      if (type === 1) {
        obstacles.current.push({
          x: canvasWidth,
          y: groundY - 150,
          width: 55,
          height: 75,
          type: 'bill',
          isLumaBill: true,
          billPosition: 'top',
          bobOffset: Math.random() * Math.PI * 2
        });
      } else {
        obstacles.current.push({
          x: canvasWidth,
          y: groundY - 40,
          width: 55,
          height: 75,
          type: 'bill',
          isLumaBill: true,
          billPosition: 'bottom'
        });
        obstacles.current.push({
          x: canvasWidth + 90,
          y: groundY - 40,
          width: 55,
          height: 75,
          type: 'bill',
          isLumaBill: true,
          billPosition: 'bottom'
        });
      }
      billSequenceIdx.current = (billSequenceIdx.current + 1) % billSequence.length;
      obstacleCooldown.current = 85;
    } else {
      panelsUntilNextDouble.current--;
      let isDouble = false;
      if (panelsUntilNextDouble.current <= 0) {
        isDouble = true;
        panelSequenceIdx.current = (panelSequenceIdx.current + 1) % panelSequence.length;
        panelsUntilNextDouble.current = panelSequence[panelSequenceIdx.current];
      }

      const baseObsWidth = 85;
      const baseObsHeight = isDouble ? 160 : 95;
      const obsY = groundY - baseObsHeight + 35;

      obstacles.current.push({ 
        x: canvasWidth, 
        y: obsY, 
        width: baseObsWidth, 
        height: baseObsHeight, 
        type: 'ground',
        isDoubleStory: isDouble 
      });
      obstacleCooldown.current = isDouble ? 120 : 100;
    }
  };

  const spawnCollectibles = (canvasWidth: number, canvasHeight: number, groundY: number) => {
    if (collectibleCooldown.current > 0) {
      collectibleCooldown.current--;
      return;
    }

    if (Math.random() < 0.025) {
      const isNitro = Math.random() < 0.15;
      collectibles.current.push({ 
        x: canvasWidth, 
        y: groundY - 140 - Math.random() * 150, 
        width: isNitro ? 55 : 35,
        height: isNitro ? 55 : 35,
        type: isNitro ? 'nitro' : 'sun'
      });
      collectibleCooldown.current = 60 + Math.random() * 80;
    }
  }

  const update = useCallback(() => {
    if (!gameActive.current) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const groundY = height - 70; 

    const responsiveMultiplier = width < 600 ? 0.8 : 1;
    const isTurbo = player.current.boostRemaining > 0;
    const currentSpeed = (BASE_SPEED + (currentCityIndex.current * SPEED_INCREMENT) + (isTurbo ? 18 : 0)) * responsiveMultiplier;
    distance.current += currentSpeed / 60;
    
    const nextCityIndex = Math.floor(distance.current / METERS_PER_CITY);
    
    if (nextCityIndex >= CITIES.length) {
      gameActive.current = false;
      onGameOver(totalScore.current, distance.current, CITIES[CITIES.length-1], true);
      return;
    }

    if (nextCityIndex > currentCityIndex.current) {
      currentCityIndex.current = nextCityIndex;
      player.current.guayandoTimer = 100;
    }

    // --- PHYSICS ---
    player.current.y += player.current.dy;
    const actualFootY = groundY + 38; 
    
    if (player.current.y + player.current.height < actualFootY) {
      player.current.dy += GRAVITY;
      player.current.targetRotation = player.current.dy < 0 ? -0.1 : 0.05;
    } else {
      if (player.current.isJumping) {
        player.current.isJumping = false;
        player.current.squashX = 1.2; player.current.squashY = 0.8;
        player.current.landingTimer = 5;
      }
      player.current.y = actualFootY - player.current.height;
      player.current.dy = 0;
      player.current.jumpCount = 0;
      
      if (isTurbo) {
        player.current.targetRotation = -0.45 + Math.sin(Date.now() * 0.02) * 0.04;
      } else {
        player.current.targetRotation = Math.sin(Date.now() * 0.08) * 0.015;
      }

      if (player.current.landingTimer > 0) player.current.landingTimer--;
      else {
        player.current.squashX += (1 - player.current.squashX) * 0.2;
        player.current.squashY += (1 - player.current.squashY) * 0.2;
      }
      player.current.vibrationY = Math.sin(Date.now() * 0.15) * 1.5;
    }

    player.current.rotation += (player.current.targetRotation - player.current.rotation) * 0.12;

    if (isTurbo) player.current.boostRemaining -= currentSpeed;
    if (player.current.guayandoTimer > 0) player.current.guayandoTimer--;
    if (invulnerableTimer.current > 0) invulnerableTimer.current--;

    // Collision
    obstacles.current.forEach((obs, index) => {
      obs.x -= currentSpeed;
      const pX = player.current.x + 40;
      const pY = player.current.y + 40;
      const pW = player.current.width - 80;
      const pH = player.current.height - 60;
      
      const bob = (obs.isLumaBill && obs.billPosition === 'top') ? Math.sin(Date.now() * 0.01 + (obs.bobOffset || 0)) * 20 : 0;
      const actualObsY = obs.y + bob;

      if (gameActive.current && invulnerableTimer.current === 0 &&
          pX < obs.x + obs.width && pX + pW > obs.x &&
          pY < actualObsY + obs.height && pY + pH > actualObsY) {
        
        if (isTurbo) {
          obstacles.current.splice(index, 1);
          if (obs.isLumaBill) {
            createExplosion(obs.x + obs.width/2, actualObsY + obs.height/2, '#ffffff', 'paper', 15);
            totalScore.current += 1000;
          } else {
            createExplosion(obs.x + obs.width/2, actualObsY + obs.height/2, '#000000', 'shard', 15);
            createExplosion(obs.x + obs.width/2, actualObsY + obs.height/2, '#3b82f6', 'shard', 10);
            totalScore.current += 750;
          }
        } else {
          lives.current -= 1;
          invulnerableTimer.current = 70;
          obstacles.current.splice(index, 1);
          createExplosion(pX, pY, '#ef4444', 'smoke', 12);
          if (lives.current <= 0) {
            gameActive.current = false;
            onGameOver(totalScore.current, distance.current, CITIES[currentCityIndex.current]);
          }
        }
      }
      if (obs.x + obs.width < -500) obstacles.current.splice(index, 1);
    });

    collectibles.current.forEach((item, index) => {
      item.x -= currentSpeed;
      if (player.current.x < item.x + item.width && player.current.x + player.current.width > item.x &&
          player.current.y < item.y + item.height && player.current.y + player.current.height > item.y) {
        if (item.type === 'sun') {
          sunsCollected.current++;
          totalScore.current += 100;
          if (sunsCollected.current % SUNS_PER_LIFE === 0) {
            if (lives.current < MAX_LIVES_LIMIT) lives.current++;
          }
        } else {
          player.current.boostRemaining += POWERUP_BOOST_DISTANCE;
          player.current.guayandoTimer = 130;
          totalScore.current += 1500;
        }
        collectibles.current.splice(index, 1);
      }
    });

    particles.current.forEach((p, i) => {
      p.x += p.vx; p.y += p.vy; p.life -= 0.02;
      if (p.rotation !== undefined && p.vr !== undefined) p.rotation += p.vr;
      if (p.life <= 0) particles.current.splice(i, 1);
    });

    spawnObstacles(width, height);
    spawnCollectibles(width, height, groundY);
    draw(ctx, width, height, groundY);
    requestRef.current = requestAnimationFrame(update);
  }, [onGameOver, handleJump]);

  const draw = (ctx: CanvasRenderingContext2D, width: number, height: number, groundY: number) => {
    ctx.clearRect(0, 0, width, height);

    const bgImg = backgroundImages.current[currentCityIndex.current];
    if (bgImg?.complete) ctx.drawImage(bgImg, 0, 0, width, height);

    // Suelo
    ctx.fillStyle = '#064e3b'; ctx.fillRect(0, groundY, width, height - groundY);
    ctx.fillStyle = '#0f172a'; ctx.fillRect(0, groundY + 10, width, height - groundY - 10);
    
    // Carretera
    ctx.strokeStyle = '#fbbf24'; ctx.lineWidth = 5; ctx.setLineDash([60, 80]);
    ctx.lineDashOffset = (distance.current * 40) % 140;
    ctx.beginPath(); ctx.moveTo(0, groundY + (height - groundY)/2 + 5); 
    ctx.lineTo(width, groundY + (height - groundY)/2 + 5); ctx.stroke(); ctx.setLineDash([]);

    // --- OBSTACULOS ---
    obstacles.current.forEach(obs => {
      ctx.save();
      const bob = (obs.isLumaBill && obs.billPosition === 'top') ? Math.sin(Date.now() * 0.01 + (obs.bobOffset || 0)) * 20 : 0;
      ctx.translate(obs.x + obs.width/2, obs.y + obs.height/2 + bob);
      
      if (obs.isLumaBill) {
        // Bill de LUMA como Imagen
        if (lumaBillImg.current.complete) {
          ctx.drawImage(lumaBillImg.current, -obs.width/2, -obs.height/2, obs.width, obs.height);
          // Opcional: Filtro de brillo rojo suave para peligro
          ctx.globalCompositeOperation = 'source-atop';
          ctx.fillStyle = 'rgba(239, 68, 68, 0.1)';
          ctx.fillRect(-obs.width/2, -obs.height/2, obs.width, obs.height);
          ctx.globalCompositeOperation = 'source-over';
        } else {
          // Fallback visual si la imagen no carga
          ctx.fillStyle = 'white'; ctx.beginPath(); ctx.roundRect(-obs.width/2, -obs.height/2, obs.width, obs.height, 4); ctx.fill();
          ctx.fillStyle = 'red'; ctx.font = 'bold 12px sans-serif'; ctx.textAlign = 'center'; ctx.fillText("LUMA", 0, 0);
        }
      } else {
        // Panel Solar Negro/Azul
        ctx.fillStyle = '#000000'; 
        ctx.beginPath(); ctx.roundRect(-obs.width/2, -obs.height/2, obs.width, obs.height, 4); ctx.fill();
        const margin = 5;
        const innerW = obs.width - margin*2;
        const innerH = obs.height - margin*2;
        ctx.strokeStyle = '#3b82f6'; ctx.lineWidth = 1.5; ctx.shadowBlur = 8; ctx.shadowColor = '#3b82f6';
        const cols = 2, rows = obs.isDoubleStory ? 6 : 3;
        for(let i=0; i<=cols; i++) {
          const x = -innerW/2 + (innerW/cols)*i;
          ctx.beginPath(); ctx.moveTo(x, -innerH/2); ctx.lineTo(x, innerH/2); ctx.stroke();
        }
        for(let j=0; j<=rows; j++) {
          const y = -innerH/2 + (innerH/rows)*j;
          ctx.beginPath(); ctx.moveTo(-innerW/2, y); ctx.lineTo(innerW/2, y); ctx.stroke();
        }
        ctx.shadowBlur = 0;
      }
      ctx.restore();
    });

    // --- PLAYER ---
    const sW = player.current.width * player.current.squashX;
    const sH = player.current.height * player.current.squashY;
    const pX = player.current.x + player.current.width/2;
    const pY = player.current.y + player.current.height/2 + player.current.vibrationY;

    ctx.save();
    ctx.translate(pX, pY);

    if (player.current.guayandoTimer > 0) {
      ctx.save();
      const bW = 120, bH = 38, bubbleY = -sH/2 - 65;
      ctx.fillStyle = 'white'; ctx.strokeStyle = '#2563eb'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.roundRect(-bW/2, bubbleY, bW, bH, 12); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-10, bubbleY+bH); ctx.lineTo(10, bubbleY+bH); ctx.lineTo(0, bubbleY+bH+12); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#1e3a8a'; ctx.font = 'bold 18px Bangers'; ctx.textAlign = 'center';
      ctx.fillText("¡GUAYANDO!", 0, bubbleY + 25);
      ctx.restore();
    }

    ctx.save();
    ctx.rotate(player.current.rotation);
    if (invulnerableTimer.current > 0 && Math.floor(Date.now() / 50) % 2 === 0) ctx.globalAlpha = 0.4;
    if (player.current.boostRemaining > 0) { ctx.shadowBlur = 40; ctx.shadowColor = '#60a5fa'; }
    ctx.drawImage(trexImg.current, -sW/2, -sH/2, sW, sH);
    ctx.restore();

    ctx.restore();

    // Collectibles
    collectibles.current.forEach(item => {
      if (item.type === 'sun') {
        ctx.fillStyle = '#fde047'; ctx.beginPath(); ctx.arc(item.x + 18, item.y + 18, 16, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = '#ca8a04'; ctx.beginPath(); ctx.arc(item.x + 18, item.y + 18, 12, 0, Math.PI*2); ctx.fill();
      } else {
        ctx.font = '35px serif'; ctx.fillText("⚡", item.x, item.y + 35);
      }
    });

    // --- UI OVERLAYS ---
    const isMobile = width < 600;
    
    // 1. Barra de Progreso Superior
    const totalGoal = METERS_PER_CITY * CITIES.length;
    const progressPercent = Math.min(100, Math.floor((distance.current / totalGoal) * 100));
    const barW = isMobile ? width * 0.7 : 400;
    const barH = isMobile ? 25 : 30;
    const barX = (width - barW) / 2;
    const barY = 20;
    ctx.fillStyle = 'rgba(15, 23, 42, 0.7)';
    ctx.beginPath(); ctx.roundRect(barX, barY, barW, barH, barH/2); ctx.fill();
    ctx.strokeStyle = 'rgba(59, 130, 246, 0.5)'; ctx.lineWidth = 2; ctx.stroke();
    const fillW = (progressPercent / 100) * (barW - 6);
    if (fillW > 0) {
      const grad = ctx.createLinearGradient(barX, 0, barX + barW, 0);
      grad.addColorStop(0, '#3b82f6'); grad.addColorStop(1, '#fde047');
      ctx.fillStyle = grad;
      ctx.beginPath(); ctx.roundRect(barX + 3, barY + 3, fillW, barH - 6, (barH-6)/2); ctx.fill();
    }
    ctx.fillStyle = 'white'; ctx.font = 'bold 14px Bangers'; ctx.textAlign = 'center';
    ctx.fillText(`ISLA COMPLETADA: ${progressPercent}%`, width/2, barY + barH/2 + 5);

    // 2. Info de Ciudad, Soles y VIDAS
    ctx.textAlign = 'left';
    ctx.fillStyle = 'rgba(15, 23, 42, 0.9)'; ctx.beginPath(); ctx.roundRect(15, 15, isMobile ? 140 : 220, isMobile ? 80 : 110, 15); ctx.fill();
    ctx.fillStyle = 'white'; ctx.font = isMobile ? '14px Bangers' : '20px Bangers';
    ctx.fillText(`${CITIES[currentCityIndex.current]}`, 25, 40);
    ctx.fillText(`☀️ SOLES: ${sunsCollected.current}`, 25, isMobile ? 60 : 70);
    
    // Contador de Vidas (Corazones) - Límite Máximo 5
    ctx.font = isMobile ? '12px Bangers' : '16px Bangers';
    ctx.fillText('VIDAS:', 25, isMobile ? 85 : 100);
    const heartSize = isMobile ? 14 : 18;
    for(let i = 0; i < MAX_LIVES_LIMIT; i++) {
      ctx.font = `${heartSize}px serif`;
      ctx.fillText(i < lives.current ? '❤️' : '🖤', 75 + i * (heartSize + 2), isMobile ? 85 : 100);
    }

    // Particulas
    particles.current.forEach(p => {
      ctx.save(); ctx.globalAlpha = p.life; ctx.fillStyle = p.color; ctx.translate(p.x, p.y);
      if (p.type === 'shard' || p.type === 'paper') {
        if (p.rotation) ctx.rotate(p.rotation);
        ctx.fillRect(-p.size/2, -p.size/2, p.size, p.type === 'paper' ? p.size*1.4 : p.size);
      } else {
        ctx.beginPath(); ctx.arc(0, 0, p.size, 0, Math.PI*2); ctx.fill();
      }
      ctx.restore();
    });
    ctx.globalAlpha = 1.0;
  };

  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current && canvasRef.current.parentElement) {
        canvasRef.current.width = canvasRef.current.parentElement.clientWidth;
        canvasRef.current.height = canvasRef.current.parentElement.clientHeight;
      }
    };
    handleResize(); window.addEventListener('resize', handleResize);
    requestRef.current = requestAnimationFrame(update);
    return () => {
      window.removeEventListener('resize', handleResize);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [update]);

  return (
    <div ref={containerRef} className="w-full h-full relative overflow-hidden touch-none">
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
};

export default Game;
