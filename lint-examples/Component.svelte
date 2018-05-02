<section>
    <h1>I am a header</h1>

    {#if message}
    <p ref:message>{message}</p>
    {/if}
</section>

<script>
    const something = "nothing";
    let somethingElse;

    export default {
        data() {
            return {
                message: 'Hear me roar!'
            };
        },

        methods: {
            doSomething() {
                const peeps = ['Jeff', 'Fred', 'Sarah'];

                const morePeeps = ['Knut', ...peeps];

                console.log(morePeeps);
            }
        }
    };
</script>
