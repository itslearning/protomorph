import Component from '../lint-examples/Component';

console.log('Hello world!');

const data = {
    message: 'I am the law!'
};

const target = document.querySelector('main');
const component = new Component({target, data: {...data}});

console.log(component);
