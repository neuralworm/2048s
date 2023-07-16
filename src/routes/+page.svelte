<script>
    import GameView from "$lib/components/GameView.svelte";
    import InfoSection from "$lib/components/InfoSection.svelte";

</script>
<svelte:head>
    <title>It's 2048!</title>
    <meta name="description" content="Play 2048 in your broowser for free.  Check leaderboards and previous high scores.">
</svelte:head>
<section id="title-view" class="">
    <h4 class="font-bold text-neutral-100 tracking-tight bg-blue-500 w-10 h-10 flex items-center justify-center rounded-md">IT'S</h4>
    <h1 class="text-5xl lg:text-6xl font-bold tracking-tight font-extrabold text-transparent  bg-clip-text bg-gradient-to-r from-white to-neutral-600">2048!</h1>
</section>
<section id="game-view-container" class="mt-12">
    <GameView></GameView>
</section>
<InfoSection></InfoSection>

