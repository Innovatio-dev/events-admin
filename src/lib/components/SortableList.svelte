<script lang='ts'>
	import { SortableList } from '@jhubbardsf/svelte-sortablejs';
    import Icon from 'svelte-icons-pack';
	import CgMathEqual from 'svelte-icons-pack/cg/CgMathEqual';
	import MainButton from './MainButton.svelte';
    import BiEditAlt from "svelte-icons-pack/bi/BiEditAlt";
    import CgTrash from "svelte-icons-pack/cg/CgTrash";
	import ProfilePic from './ProfilePic.svelte';

const exampleItems = ['Item 1', 'Item 2', 'Item 3', 'Item 4', 'Item 5', 'Item 6'];

</script>

<div class='rounded-lg overflow-hidden w-full flex flex-col'>
    <div class='h-12 w-full bg-gd-icon flex justify-around text-white items-center'>
        <span>
            {'Col 1'}
        </span>
        <span>
            {'Col 2'}
        </span>

    </div>
    <div class='bg-white'>
        <SortableList class="list-group col divide-y" handle=".cursor-grab" animation={150}>
			{#each exampleItems as item}
				<li class="list-group-item text-sm font-semibold flex items-center justify-between text-neutral-4 w-full py-5 px-2 bg-white">
                    <div class='flex items-center gap-5'>
                        <span class="cursor-grab">
                            <Icon src={CgMathEqual} color="currentColor" size="25px" />                         
                        </span>
                        {item}
                    </div>
                    <div class='flex gap-10'>
                        <div class='w-12 h-12'>
                            <ProfilePic>
                                <img src="/favicon.png" alt='' class='object-contain'/>
                            </ProfilePic>
                        </div>
                        <div class='flex gap-2'>
                            <MainButton>
                                <Icon size='22px' color="currentColor"  src={BiEditAlt} />
                            </MainButton>
                            <MainButton>
                                <Icon size='22px' src={CgTrash} />
                            </MainButton>
                        </div>
                    </div>
				</li>
			{/each}
		</SortableList>

    </div>
</div>