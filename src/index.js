import Component from '../lint-examples/Component';

console.log('Hello world!');

const data = {
    foo: 'bar'
};

const target = document.querySelector('not-important');
const component = new Component({target, data: {...data}});

console.log(component);
