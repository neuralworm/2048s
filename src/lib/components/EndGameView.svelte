<script lang="ts">
    import { fade } from "svelte/transition";
    export let createNewGame: Function

</script>

<div transition:fade class="absolute top-0 bottom-0 left-0 right-0 bg-neutral-400 z-10 bg-opacity-90 flex flex-col items-center justify-center">
    <h3 class="font-extrabold tracking-tighter text-black text-4xl">GAME OVER</h3>
    <button class="bg-neutral-700 rounded-lg px-4 py-2 mt-4 hover:opacity-60" on:click={()=>createNewGame()}>
        NEW GAME
    </button>
</div>