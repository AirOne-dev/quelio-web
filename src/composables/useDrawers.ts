import { ref } from 'vue'

const drawerCount = ref(0);

export function useDrawers() {
  const showSettingsDrawer = ref(false),
    showAbsenceDrawer = ref(false),
    presenceDate = ref<string | null>(null);

  const toggleSettingsDrawer = () => {
    showSettingsDrawer.value = !showSettingsDrawer.value;
  }

  const toggleAbsenceDrawer = () => {
    showAbsenceDrawer.value = !showAbsenceDrawer.value;
  }

  const handleMarkAbsent = (date: string) => {
    presenceDate.value = date
    toggleAbsenceDrawer()
  }

  const setDrawerCount = (n: number) => {
    if (n < 0) {
      drawerCount.value = 0;
    } else {
      drawerCount.value = n;
    }
  }

  return {
    showSettingsDrawer,
    showAbsenceDrawer,
    presenceDate,
    drawerCount,
    toggleSettingsDrawer,
    toggleAbsenceDrawer,
    handleMarkAbsent,
    setDrawerCount,
  }
}
