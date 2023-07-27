import { writable } from 'svelte/store'

const state: { title: string | null; status: number | null } = { title: null, status: null }
const alert: { message: string | null; status: boolean } = { message: null, status: false }

export const pageStatus = writable(state)
export const pageAlert = writable(alert)
