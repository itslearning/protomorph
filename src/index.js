import Parent from './components/Parent';

// You'll probably want your local scss to come underneath components
// in the cascade.
import './index.scss';

console.log('Hello world!');

const data = {
    message: 'I am the parent!'
};

const target = document.querySelector('main');

new Parent({target, data}); // eslint-disable-line
