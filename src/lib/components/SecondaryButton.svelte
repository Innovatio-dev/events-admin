<script lang="ts">
    // Svelte
    import { createEventDispatcher } from 'svelte/internal';
    const dispatch = createEventDispatcher();
    // Props
    export let disabled = false
    export let loading = false; 

    function handleClick() { // To use on click events when instanced.
        dispatch('click');
    }
</script>
  
<button
    class='{disabled ? 'pointer-events-none' : ''} hover:bg-gd-icon bg-gd-linear text-white px-10 py-2 flex w-full justify-evenly gap-5 rounded-lg font-medium transition-all ease-in-out'
    disabled={disabled || loading}
    on:click={handleClick}
>
    {#if loading}
        <span class='cursor-wait w-full h-full'>
            Loading...
        </span>
    {:else}
        <slot />
    {/if}
</button>