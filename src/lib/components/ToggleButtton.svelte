<script lang="ts">
    export let checked: boolean;
    export let id: string;
    export let left: string = "";
    export let right: string = "";
    export let text: boolean;
    export let disabled: boolean = false;
    function toggleState() {
        checked= !checked    
    }
</script>
<div class="flex flex-row min-w-[120px] min-h-16 items-center justify-around capitalize">
    {#if text}
        <p class={`mx-2 ${!checked ? 'text-primary-purple' : 'text-neutral-3'}`}>
            {left}
        </p>
    {/if}
    <input type="checkbox" id={id} checked={checked} on:click={toggleState} disabled={disabled}  />
    <label for={id}></label>
    {#if text}
        <p class={`mx-2 ${checked ? 'text-primary-purple' : 'text-neutral-3'}`}>
            {right}
        </p>
    {/if}
</div>
<style>
    input[type=checkbox]{
        height: 0;
        width: 0;
        visibility: hidden;
    }
    label {
        cursor: pointer;
        text-indent: -9999px;
        width: 60px;
        height: 30px;
        background: var(--gd-icon);
        display: block;
        border-radius: 100px;
        position: relative;
    }
    label:after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 30px;
        height: 30px;
        background: white;
        border: 2px solid var(--neutral-1);
        border-radius: 90px;
        transition: 0.3s;
    }
    input:checked + label:after {
       left: 100%;
       transform: translateX(-100%);
    }
    input:disabled + label {
        background: var(--neutral-1);
    }
    input:disabled + label:after{
        background: var(--neutral-3);
        border: 2px solid var(--neutral-3);
    }

</style>