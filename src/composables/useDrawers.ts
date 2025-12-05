import { ref } from 'vue'

const drawerCount = ref(0);

export function useDrawers() {
  const setDrawerCount = (n: number) => {
    if (n < 0) {
      drawerCount.value = 0;
    } else {
      drawerCount.value = n;
    }
  }

  return {
    ANIMATION_DURATION: 500,
    drawerCount,
    setDrawerCount,
  }
}
