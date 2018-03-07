<section>
    <h1>I am a header</h1>
</section>

<script>
    const something = "nothing";
    let somethingElse;

    export default {
        data() {
            return {
                foo: 'bar'
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
