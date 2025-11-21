import { ref } from 'vue'

export function useModals() {
  const showSettingsModal = ref(false)
  const showPresenceModal = ref(false)
  const presenceDate = ref<string | null>(null)

  const toggleBottomModal = () => {
    showSettingsModal.value = !showSettingsModal.value
  }

  const togglePresenceModal = () => {
    showPresenceModal.value = !showPresenceModal.value
  }

  const handleMarkAbsent = (date: string) => {
    presenceDate.value = date
    togglePresenceModal()
  }

  return {
    showSettingsModal,
    showPresenceModal,
    presenceDate,
    toggleBottomModal,
    togglePresenceModal,
    handleMarkAbsent
  }
}
