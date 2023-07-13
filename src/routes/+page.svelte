<script>
    import GameView from "$lib/components/+GameView.svelte";
    import InfoSection from "$lib/components/+InfoSection.svelte";

</script>
<svelte:head>
    <title>It's 2048!</title>
    <meta name="description" content="Play 2048 in your broowser for free.  Check leaderboards and previous high scores.">
</svelte:head>
<section id="title-view" class="">
    <h4>IT'S</h4>
    <h1 class="text-5xl font-bold">2048!</h1>
</section>
<section id="game-view-container" class="mt-12">
    <GameView />
</section>
<InfoSection></InfoSection>

