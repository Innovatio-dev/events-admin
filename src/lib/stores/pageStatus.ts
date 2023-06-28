import { writable } from 'svelte/store'

const state: {title:string|null,status:number|null} = {title:null,status:null}

export const pageStatus = writable(state)
