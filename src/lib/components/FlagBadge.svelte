<script lang="ts">
    // Svelte
    import {fade} from 'svelte/transition';
	import type { SvelteComponent } from 'svelte';
    // Icons
    import Icon from 'svelte-icons-pack/Icon.svelte';
    import AiOutlineCloseCircle from "svelte-icons-pack/ai/AiOutlineCloseCircle";
    //Props
    export let label: string | undefined = undefined
    export let flag:typeof SvelteComponent | undefined = undefined;
    export let onClose:() => void = () => {};
    // State
    let visible = true

    const handleClick = () =>{
        visible = false;
        onClose()
    }
</script>

{#if visible}
    <span transition:fade="{{ duration: 200 }}" class='text-neutral-4 fill-neutral-4 w-fit py-2 flex items-center rounded-full pl-5 pr-3 bg-badge-flag'>
        <div class='flex gap-5 items-center'>
            <div class='flex gap-2 items-center text-base '>
                <svelte:component this={flag} class='rounded-md h-5 w-7' />
                {label} 
            </div>            
            <button class='rounded-lg overflow-hidden' on:click={handleClick} >
                <Icon 
                src={AiOutlineCloseCircle} 
                className='w-5 h-5 hover:fill-neutral-3'
                />
            </button>
        </div>
    </span>
{/if}