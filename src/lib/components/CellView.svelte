<script lang="ts">
    import { BoxPosition, type Cell } from "$lib";
    import { fade } from "svelte/transition";

    export let cell: Cell;
</script>

<div
    
    id="active-cell-{cell.id}"
    class={`flex absolute flex-row items-center text-3xl font-bold justify-center w-1/4 h-1/4 p-1 transition-transform ${BoxPosition(
        cell.coord
    )} `}
    data-id={cell.id}
    style="transform: {`translateX(${cell.coord[0] * 4}rem) translateY(${
        cell.coord[1] * 4
    }rem)`}; "
>
    <div
        class="bg-white text-neutral-600 w-full h-full flex items-center justify-center rounded-md"
    >
        {cell.value}
    </div>
</div>

<style>
    .transition-transform{
        transition: transform 1s linear;
    }
</style>