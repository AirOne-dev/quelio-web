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

export interface DayDetails {
  hours: string[]
  breaks: {
    morning: string
    noon: string
    afternoon: string
  }
  effective_to_paid: string[]
  effective: string
  paid: string
}

export interface WeekData {
  days: Record<string, DayDetails>
  total_effective: string
  total_paid: string
}

export interface ApiResponse {
  preferences?: UserPreferences
  token?: string
  weeks: Record<string, WeekData>
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
