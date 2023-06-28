<script lang="ts">
    export let title:string;
    export let fields:string[];
    export let content:string[];
</script>

<div class="flex flex-col w-[400px] h-fit gap-y-4">
    <h3 class="">{title}</h3>
    <div class="grid grid-cols-2">
        <div>
            {#each fields as item}
            <p class="text-neutral-4 font-dm capitalize w-[180px] py-2">{item} :</p>
        {/each}
        </div>
        <div>
            {#each content as item}
            <p class="text-neutral-3 font-thin font-eesti min-w-fit w-[400px] py-2">{item}</p>
        {/each}
        </div>
       
    </div>
</div>