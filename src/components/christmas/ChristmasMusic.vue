<template>
  <div class="christmas-music">
    <audio ref="audioPlayer" loop preload="auto">
      <source src="/audio/all i want for christmas.mp3" type="audio/mpeg" />
    </audio>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

const audioPlayer = ref<HTMLAudioElement | null>(null);
let hasStarted = false;

const tryPlayMusic = () => {
  if (audioPlayer.value && !hasStarted) {
    audioPlayer.value.volume = 0.3;
    
    const playPromise = audioPlayer.value.play();
    
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          console.log('🎵 Christmas music started');
          hasStarted = true;
          // Retirer les listeners une fois démarré
          removeListeners();
        })
        .catch((error) => {
          console.log('Autoplay blocked, waiting for user interaction:', error);
        });
    }
  }
};

const removeListeners = () => {
  document.removeEventListener('click', tryPlayMusic);
  document.removeEventListener('keydown', tryPlayMusic);
  document.removeEventListener('touchstart', tryPlayMusic);
  document.removeEventListener('scroll', tryPlayMusic);
};

onMounted(() => {
  // Essayer de jouer immédiatement
  tryPlayMusic();
  
  // Si ça ne marche pas, attendre la première interaction utilisateur
  document.addEventListener('click', tryPlayMusic, { once: false });
  document.addEventListener('keydown', tryPlayMusic, { once: false });
  document.addEventListener('touchstart', tryPlayMusic, { once: false });
  document.addEventListener('scroll', tryPlayMusic, { once: false, passive: true });
});

onUnmounted(() => {
  removeListeners();
  
  if (audioPlayer.value) {
    audioPlayer.value.pause();
    audioPlayer.value.currentTime = 0;
  }
});
</script>

<style scoped>
.christmas-music {
  display: none;
}
</style>
