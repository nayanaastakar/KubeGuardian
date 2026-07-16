import { create } from 'zustand'

type UiState = {
  darkMode: boolean
  setDarkMode: (value: boolean) => void
}

export const useUiStore = create<UiState>((set) => ({
  darkMode: true,
  setDarkMode: (value) => set(() => ({ darkMode: value }))
}))
