export interface Credentials {
  username: string
  password: string
}

export interface TimeBlock {
  start: string
  end: string
  duration: string
}

export interface UserPreferences {
  theme?: string
  minutes_objective?: number
}

export interface ApiResponse {
  hours: Record<string, string[]>
  total_effective: string
  total_paid: string
  last_save?: string
  preferences?: UserPreferences
  token?: string
  error?: string
}

export interface CustomBornes {
  startMorning?: string
  endMorning?: string
  startAfternoon?: string
  endAfternoon?: string
}

export type CustomBornesForSuggestions = Record<string, CustomBornes>

export interface DefaultBornes {
  startMorning: string
  endMorning: string
  startAfternoon: string
  endAfternoon: string
}

export interface BornesTime {
  typeHandler: 'startMorning' | 'endMorning' | 'startAfternoon' | 'endAfternoon' | undefined
  minPosition: number
  maxPosition: number
}

export interface LogEntry {
  type: 'log' | 'warn' | 'error'
  message: string
}

export type ThemeName = 'midnight' | 'light' | 'abyss' | 'ocean' | 'forest' | 'sunset' | 'lavender' | 'christmas'

export interface Theme {
  name: ThemeName
  label: string
  colors: {
    primary: string
    secondary: string
    accent: string
  }
}

export interface DayData {
  date: string
  dayName: string
  totalMinutes: number
  present: boolean
  timeBlocks: string[]
  minutesObjective?: number
}
