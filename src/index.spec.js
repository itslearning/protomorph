import Component from '../lint-examples/Component';

describe('dummy suite', () => {
    describe('methodName()', () => {
        it('should do something cool', testThatPasses);
        it('should deliberately fail test', testThatFails);
        it('should support DOM assertions', testDomAssertions);
        it('should compile Svelte v2 syntax', testV2Template);
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

    function testV2Template() {
        const target = document.createElement('main');
        const data = { message: 'boom boom wa wa' };

        const component = new Component({ target, data });

        expect(component.refs.message.textContent).to.equal('boom boom wa wa');
    }
});
