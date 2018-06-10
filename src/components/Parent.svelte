<p class="parent">{message}</p>

<Child1 />
<Child2 />

<script>
    import Child1 from './Child1';
    import Child2 from './Child2';

    export default {
        components: {
            Child1,
            Child2
        }
    };
</script>
