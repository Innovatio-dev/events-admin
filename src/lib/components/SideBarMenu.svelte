<script lang="ts">
	import { createEventDispatcher, onMount } from "svelte";
	import Icon from "svelte-icons-pack";
    import CgMenuGridO from "svelte-icons-pack/cg/CgMenuGridO";
    interface ISidebarMenuProps {
        path: string;
        name: string;
        icon: any;
    }
    export let items: ISidebarMenuProps[];
    export let selectedIndex: number = 0
    export let expanded:boolean = true
    export let expandedWidth:number = 250
    export let collapsedWidth:number = 70
    export let floating: boolean = false
    export let floatingBreakpoint: number | undefined = undefined
    const dispatch = createEventDispatcher()
    const handleToggle = ()=>{
        expanded = !expanded
        dispatch('toggle', {expanded, expandedWidth, collapsedWidth})
    }
    onMount(()=>{
        handleResize()
    })
    const handleResize = ()=>{
        if (floatingBreakpoint!==undefined){
            floating = window.innerWidth < floatingBreakpoint
            if (innerWidth < floatingBreakpoint){
                expanded = false
            }
        }
    }
</script>

<svelte:window on:resize={handleResize}/>
<aside>
    <div class="flex flex-col items-start justify-start overflow-hidden transition-all" style="width: {expanded?expandedWidth:collapsedWidth}px">
        <div class="relative p-4" style="width: {expandedWidth}px">
            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <div class="item cursor-pointer w-full" on:click={handleToggle}>
                <div class="icon">
                    <div class="iconWrapper">
                        <Icon src={CgMenuGridO} color="currentColor"/>
                    </div>
                </div>
                <span class="text-lg text-neutral-2 font-[500]">MENU</span>
            </div>
            <ul class="flex hover:none flex-col w-full h-fit justify-around mt-6">
                {#each items as item, index}
                    <li class="w-full">
                        <a href={item.path} class="item" class:active={index == selectedIndex}>
                            <div class="icon">
                                <div class="iconWrapper">
                                    <svelte:component this={item.icon}/>
                                </div>
                            </div>
                            <span>{item.name}</span>
                        </a>
                    </li>
                {/each}
            </ul>
        </div>
    </div>
</aside>
<style lang="scss">
    .item{
        display: flex;
        gap: 1rem;
        width: 100%;
        align-items: center;
        color: var(--neutral-4);
        font-weight: 400;
        letter-spacing: 0.5px;
        height: 3rem;
        transition: all 0.2s ease-in-out;
        user-select: none;
        .icon{
            font-size: 1.5rem;
            width: 2.5rem;
            height: 2.5rem;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            position: relative;
            transition: all 0.2s ease-in-out;
            &::before{
                content: '';
                position: absolute;
                inset: 0px;
                border-radius: 50%;
                background: var(--gd-icon);
                opacity: 0;
                z-index: 0;
                transition: all 0.2s ease-in-out;
            }
            .iconWrapper{
                position: relative;
                z-index: 1;
            }
        }
        &:hover, &.active{
            text-decoration: none;
            font-size: 1.1em;
            color: var(--black);
            .icon{
                color: var(--white);
                box-shadow: var(--shadow-icon);
                &::before{
                    opacity: 1;
                }
            }
        }
    }
</style>