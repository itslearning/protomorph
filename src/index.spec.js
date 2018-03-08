describe('dummy suite', () => {
    describe('methodName()', () => {
        it('should do something cool', testThatPasses);
        it('should do something uncool', testThatFails);
        it('should support DOM assertions', testDomAssertions);
    });

    // /////////////////////////////////////////////////////////////////////////

    function testThatPasses() {
        expect(true).to.equal(true);
    }

    function testThatFails() {
        expect(true).to.not.equal(true);
    }

    function testDomAssertions() {
        // @see http://chaijs.com/plugins/chai-dom/
        const heading = document.createElement('h1');

        heading.innerHTML = '<span>Woop</span>';

        heading.classList.add('boom');

        expect(heading).to.have.html('<span>Woop</span>');
        expect(heading).to.have.text('Woop');
        expect(heading).to.have.class('boom');
    }
});
