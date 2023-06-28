import Gb from 'svelte-flag-icons/Gb.svelte';
import Es from 'svelte-flag-icons/Es.svelte';
import Br from 'svelte-flag-icons/Br.svelte';
import Cn from 'svelte-flag-icons/Cn.svelte';
    
export const FLAG_BADGES= [
    {   label:'ENG',
        flag: Gb,
        id:0
    },
    {   label:'SPA',
        flag: Es,
        id:1
    },
    {   label:'POR',
        flag: Br,
        id:2
    },
    {   label:'CHN',
        flag: Cn,
        id:3
    },
]

export const BADGES= [
    {   type:'primary',
        id:0
    },
    {   type:'secondary',
        id:1
    },
    {   type:'error',
        id:2
    },
    {   type:'success',
        id:3
    },
]