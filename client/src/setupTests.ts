const storage: Record<string, string> = {}

if (typeof globalThis.localStorage === 'undefined' || !globalThis.localStorage.setItem) {
  globalThis.localStorage = {
    getItem: (key: string) => storage[key] ?? null,
    setItem: (key: string, value: string) => { storage[key] = String(value) },
    removeItem: (key: string) => { delete storage[key] },
    clear: () => {
      for (const k in storage) delete storage[k]
    },
    length: Object.keys(storage).length,
    key: (i: number) => Object.keys(storage)[i] || null
  } as any
}
