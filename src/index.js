import Parent from './components/Parent';

console.log('Hello world!');

const data = {
    message: 'I am the parent!'
};

const target = document.querySelector('main');

new Parent({target, data}); // eslint-disable-line
