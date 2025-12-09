<template>
  <div class="christmas-snow-container">
    <canvas
      ref="snowCanvas"
      class="snow-canvas"
      :width="canvasWidth"
      :height="canvasHeight"
    ></canvas>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

interface Snowflake {
  x: number;
  y: number;
  radius: number;
  speed: number;
  wind: number;
  opacity: number;
  landed: boolean;
}

interface StackedSnow {
  x: number;
  y: number;
  radius: number;
  opacity: number;
  age: number;
}

const snowCanvas = ref<HTMLCanvasElement | null>(null);
const canvasWidth = ref(0);
const canvasHeight = ref(0);
const snowflakes = ref<Snowflake[]>([]);
const stackedSnow = ref<StackedSnow[]>([]);
const snowHeightMap = ref<number[]>([]);
let animationFrameId: number | null = null;
const GRID_SIZE = 5; // Granularité de la heightmap
const MAX_STACKED_SNOW = 1000; // Limite avant fusion
const MAX_FALLING_FLAKES = 150; // Nombre max de flocons qui tombent
const MAX_SNOW_HEIGHT = 150; // Hauteur max d'accumulation

// Initialize heightmap
const initHeightMap = () => {
  const gridCount = Math.ceil(canvasWidth.value / GRID_SIZE);
  snowHeightMap.value = new Array(gridCount).fill(0);
};

// Create a new snowflake
const createSnowflake = (isInitial = false): Snowflake => {
  return {
    x: Math.random() * canvasWidth.value,
    y: isInitial ? Math.random() * canvasHeight.value : -10,
    radius: 1.5 + Math.random() * 2.5,
    speed: 0.3 + Math.random() * 1.2,
    wind: (Math.random() - 0.5) * 0.3,
    opacity: 0 + Math.random() * 0.6,
    landed: false,
  };
};

// Get snow height at position
const getSnowHeightAt = (x: number): number => {
  const gridIndex = Math.floor(x / GRID_SIZE);
  if (gridIndex < 0 || gridIndex >= snowHeightMap.value.length) return 0;
  return snowHeightMap.value[gridIndex];
};

// Update heightmap when snow lands
const updateHeightMap = (x: number, radius: number) => {
  const gridIndex = Math.floor(x / GRID_SIZE);
  if (gridIndex >= 0 && gridIndex < snowHeightMap.value.length) {
    // Augmenter la hauteur avec un peu de spreading
    snowHeightMap.value[gridIndex] = Math.min(
      snowHeightMap.value[gridIndex] + radius * 0.3,
      MAX_SNOW_HEIGHT
    );

    // Spread to neighbors for smoother surface
    if (gridIndex > 0) {
      snowHeightMap.value[gridIndex - 1] = Math.min(
        snowHeightMap.value[gridIndex - 1] + radius * 0.15,
        MAX_SNOW_HEIGHT
      );
    }
    if (gridIndex < snowHeightMap.value.length - 1) {
      snowHeightMap.value[gridIndex + 1] = Math.min(
        snowHeightMap.value[gridIndex + 1] + radius * 0.15,
        MAX_SNOW_HEIGHT
      );
    }
  }
};

// Merge old stacked snow
const mergeStackedSnow = () => {
  if (stackedSnow.value.length > MAX_STACKED_SNOW) {
    // Trier par âge et ne garder que les plus récents
    stackedSnow.value.sort((a, b) => b.age - a.age);

    // Garder 70% des flocons les plus récents
    const keepCount = Math.floor(MAX_STACKED_SNOW * 0.7);
    stackedSnow.value = stackedSnow.value.slice(0, keepCount);
  }
};

// Update snowflake positions
const updateSnowflakes = () => {
  const width = canvasWidth.value;
  const height = canvasHeight.value;

  // Ensure we have enough falling snowflakes
  while (snowflakes.value.filter(f => !f.landed).length < MAX_FALLING_FLAKES) {
    snowflakes.value.push(createSnowflake());
  }

  snowflakes.value.forEach((flake, index) => {
    if (flake.landed) return;

    // Move snowflake
    flake.y += flake.speed;
    flake.x += flake.wind;

    // Wrap around horizontally
    if (flake.x > width) {
      flake.x = 0;
    } else if (flake.x < 0) {
      flake.x = width;
    }

    // Check if snowflake landed
    const snowHeight = getSnowHeightAt(flake.x);
    const groundY = height - snowHeight;

    if (flake.y + flake.radius >= groundY) {
      // Snowflake landed!
      flake.landed = true;

      // Add to stacked snow
      stackedSnow.value.push({
        x: flake.x,
        y: groundY - flake.radius,
        radius: flake.radius,
        opacity: flake.opacity * 0.9,
        age: 0,
      });

      // Update heightmap
      updateHeightMap(flake.x, flake.radius);

      // Remove this flake and create a new one
      snowflakes.value.splice(index, 1);
    }
  });

  // Age stacked snow and fade old ones
  stackedSnow.value.forEach(snow => {
    snow.age += 1;
    if (snow.age > 60) {
      snow.opacity = Math.max(0.3, snow.opacity - 0.01);
    }
  });

  // Merge if too many
  mergeStackedSnow();
};

// Draw snow accumulation based on heightmap
const drawSnowAccumulation = (ctx: CanvasRenderingContext2D) => {
  const width = canvasWidth.value;
  const height = canvasHeight.value;

  if (snowHeightMap.value.length === 0) return;

  // Create gradient for snow base
  const maxHeight = Math.max(...snowHeightMap.value);
  if (maxHeight <= 0) return;

  const gradient = ctx.createLinearGradient(0, height - maxHeight, 0, height);
  gradient.addColorStop(0, 'rgba(255, 255, 255, 0.6)');
  gradient.addColorStop(0.5, 'rgba(240, 248, 255, 0.7)');
  gradient.addColorStop(1, 'rgba(255, 255, 255, 0.8)');

  // Draw smooth heightmap
  ctx.beginPath();
  ctx.moveTo(0, height);

  for (let i = 0; i < snowHeightMap.value.length; i++) {
    const x = i * GRID_SIZE;
    const y = height - snowHeightMap.value[i];
    ctx.lineTo(x, y);
  }

  ctx.lineTo(width, height);
  ctx.lineTo(0, height);
  ctx.closePath();

  ctx.fillStyle = gradient;
  ctx.fill();
};

// Draw stacked snow particles
const drawStackedSnow = (ctx: CanvasRenderingContext2D) => {
  stackedSnow.value.forEach(snow => {
    ctx.beginPath();
    ctx.arc(snow.x, snow.y, snow.radius, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 255, 255, ${snow.opacity})`;
    ctx.fill();
  });
};

// Draw falling snowflakes
const drawSnowflakes = (ctx: CanvasRenderingContext2D) => {
  snowflakes.value.forEach(flake => {
    if (flake.landed) return;

    ctx.beginPath();
    ctx.arc(flake.x, flake.y, flake.radius, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 255, 255, ${flake.opacity})`;
    ctx.fill();
  });
};

// Animation loop
const animate = () => {
  if (!snowCanvas.value) return;

  const ctx = snowCanvas.value.getContext('2d');
  if (!ctx) return;

  // Clear canvas
  ctx.clearRect(0, 0, canvasWidth.value, canvasHeight.value);

  // Update and draw
  updateSnowflakes();
  drawSnowAccumulation(ctx);
  drawStackedSnow(ctx);
  drawSnowflakes(ctx);

  animationFrameId = requestAnimationFrame(animate);
};

// Resize canvas
const resizeCanvas = () => {
  if (snowCanvas.value) {
    const oldWidth = canvasWidth.value;
    canvasWidth.value = window.innerWidth;
    canvasHeight.value = window.innerHeight;

    // Rescale heightmap if width changed
    if (oldWidth !== canvasWidth.value) {
      const oldHeightMap = [...snowHeightMap.value];
      initHeightMap();

      // Interpolate old values
      if (oldHeightMap.length > 0) {
        for (let i = 0; i < snowHeightMap.value.length; i++) {
          const oldIndex = Math.floor((i * oldHeightMap.length) / snowHeightMap.value.length);
          snowHeightMap.value[i] = oldHeightMap[oldIndex] || 0;
        }
      }
    }

    // Recreate initial snowflakes (spread across screen)
    snowflakes.value = Array.from({ length: MAX_FALLING_FLAKES }, () => createSnowflake(true));
  }
};

onMounted(() => {
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  if (snowCanvas.value) {
    const ctx = snowCanvas.value.getContext('2d');
    if (ctx) {
      animationFrameId = requestAnimationFrame(animate);
    }
  }
});

onUnmounted(() => {
  window.removeEventListener('resize', resizeCanvas);
  if (animationFrameId !== null) {
    cancelAnimationFrame(animationFrameId);
  }
});
</script>

<style scoped>
.christmas-snow-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
  overflow: hidden;
}

.snow-canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}
</style>
