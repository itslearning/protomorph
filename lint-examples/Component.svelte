<section>
    <h1>I am a header</h1>

    {#if message}
    <p bind:this=messageElement>{message}</p>
    {/if}
</section>

<script>
    const something = "nothing";
    let somethingElse;
    let messageElement;

    export let message = 'Hear me roar!'

    function doSomething() {
        const peeps = ['Jeff', 'Fred', 'Sarah'];

        const morePeeps = ['Knut', ...peeps];

        console.log({morePeeps});
    }
</script>
