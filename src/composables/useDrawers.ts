import { ref } from 'vue'

export function useDrawers() {
  const showSettingsDrawer = ref(false)
  const showAbsenceDrawer = ref(false)
  const presenceDate = ref<string | null>(null)

  const toggleSettingsDrawer = () => {
    showSettingsDrawer.value = !showSettingsDrawer.value
  }

  const toggleAbsenceDrawer = () => {
    showAbsenceDrawer.value = !showAbsenceDrawer.value
  }

  const handleMarkAbsent = (date: string) => {
    presenceDate.value = date
    toggleAbsenceDrawer()
  }

  return {
    showSettingsDrawer,
    showAbsenceDrawer,
    presenceDate,
    toggleSettingsDrawer,
    toggleAbsenceDrawer,
    handleMarkAbsent
  }
}
