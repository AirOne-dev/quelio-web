<template>
  <div class="christmas-emojis-container">
    <div
      v-for="emoji in emojis"
      :key="emoji.id"
      class="floating-emoji"
      :style="{
        left: `${emoji.x}%`,
        top: `${emoji.y}%`,
        fontSize: `${emoji.size}px`,
        animationDuration: `${emoji.duration}s`,
        animationDelay: `${emoji.delay}s`,
        opacity: emoji.opacity,
      }"
    >
      {{ emoji.symbol }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

interface ChristmasEmoji {
  id: number;
  symbol: string;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
  opacity: number;
}

const emojis = ref<ChristmasEmoji[]>([]);

// Liste d'emojis de Noël
const christmasSymbols = [
  '🎄', '🎅🏻', '🧑🏻‍🎄', '🎁', '⛄', '❄️', 
  '🔔', '⭐', '🕯️', '🦌', '🎀', '🧦',
  '🍪', '🎶', '✨', '🌟', '🎊',
];

// Générer des emojis aléatoires avec distribution par chunks
const generateEmojis = () => {
  const count = 25; // Nombre d'emojis
  const generated: ChristmasEmoji[] = [];
  
  // Diviser l'écran en grille (5x5 = 25 chunks)
  const gridCols = 5;
  const gridRows = 5;
  const maxEmojisPerChunk = 2; // Maximum 2 emojis par chunk
  
  // Créer une grille de chunks
  const chunks: number[][] = Array.from({ length: gridRows }, () => 
    Array.from({ length: gridCols }, () => 0)
  );
  
  let attempts = 0;
  const maxAttempts = count * 10; // Éviter boucle infinie
  
  for (let i = 0; i < count && attempts < maxAttempts; i++) {
    attempts++;
    
    // Choisir un chunk aléatoire
    const col = Math.floor(Math.random() * gridCols);
    const row = Math.floor(Math.random() * gridRows);
    
    // Vérifier si le chunk n'est pas plein
    if (chunks[row][col] >= maxEmojisPerChunk) {
      i--; // Réessayer
      continue;
    }
    
    // Calculer la position dans le chunk (avec marge)
    const chunkWidth = 100 / gridCols;
    const chunkHeight = 100 / gridRows;
    
    // Position aléatoire dans le chunk (avec 10% de marge de chaque côté)
    const x = col * chunkWidth + chunkWidth * (0.1 + Math.random() * 0.8);
    const y = row * chunkHeight + chunkHeight * (0.1 + Math.random() * 0.8);
    
    generated.push({
      id: i,
      symbol: christmasSymbols[Math.floor(Math.random() * christmasSymbols.length)],
      x,
      y,
      size: 20 + Math.random() * 30, // Taille (20-50px)
      duration: 3 + Math.random() * 4, // Durée animation (3-7s)
      delay: Math.random() * 5, // Délai avant démarrage (0-5s)
      opacity: 0.15 + Math.random() * 0.25, // Opacité (0.15-0.4)
    });
    
    // Incrémenter le compteur du chunk
    chunks[row][col]++;
  }

  emojis.value = generated;
};

onMounted(() => {
  generateEmojis();
});
</script>

<style scoped>
.christmas-emojis-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
  overflow: hidden;
}

.floating-emoji {
  position: absolute;
  pointer-events: none;
  user-select: none;
  animation: float-and-rotate infinite ease-in-out;
  transform-origin: center;
}

@keyframes float-and-rotate {
  0% {
    transform: translateY(0) rotate(0deg) scale(1);
  }
  25% {
    transform: translateY(-15px) rotate(5deg) scale(1.05);
  }
  50% {
    transform: translateY(-10px) rotate(-5deg) scale(1.1);
  }
  75% {
    transform: translateY(-20px) rotate(3deg) scale(1.05);
  }
  100% {
    transform: translateY(0) rotate(0deg) scale(1);
  }
}

/* Animation alternative pour certains emojis */
.floating-emoji:nth-child(2n) {
  animation-name: float-and-sway;
}

@keyframes float-and-sway {
  0% {
    transform: translateX(0) translateY(0) rotate(0deg);
  }
  25% {
    transform: translateX(10px) translateY(-10px) rotate(-5deg);
  }
  50% {
    transform: translateX(-5px) translateY(-15px) rotate(5deg);
  }
  75% {
    transform: translateX(5px) translateY(-10px) rotate(-3deg);
  }
  100% {
    transform: translateX(0) translateY(0) rotate(0deg);
  }
}

/* Animation plus lente pour certains */
.floating-emoji:nth-child(3n) {
  animation-name: gentle-pulse;
}

@keyframes gentle-pulse {
  0%, 100% {
    transform: scale(1) rotate(0deg);
  }
  50% {
    transform: scale(1.15) rotate(10deg);
  }
}

/* Petite rotation continue pour certains */
.floating-emoji:nth-child(5n) {
  animation-name: spin-slow;
}

@keyframes spin-slow {
  0% {
    transform: rotate(0deg) scale(1);
  }
  50% {
    transform: rotate(180deg) scale(1.1);
  }
  100% {
    transform: rotate(360deg) scale(1);
  }
}

/* Effet de balancement pour d'autres */
.floating-emoji:nth-child(7n) {
  animation-name: swing;
}

@keyframes swing {
  0%, 100% {
    transform: rotate(0deg) translateY(0);
  }
  25% {
    transform: rotate(15deg) translateY(-10px);
  }
  75% {
    transform: rotate(-15deg) translateY(-10px);
  }
}
</style>
