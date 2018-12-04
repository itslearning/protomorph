import App from '{{entryname}}';
{{additionalImports}}
import { Initialize } from '@itslearning/protomorph/itslearning-svelte/Core';

Initialize();
const elementTargets = {{instancesSelector}};

if (!elementTargets || !elementTargets.length) {
    console.error('Target elements not found, check your view.json instancesSelector property.');
} else {
    for (let i = 0, len = elementTargets.length; i < len; i++) {
        const elementTarget = elementTargets[i];
        const dataForTargetAsString = elementTarget.getAttribute('data-svelte-component-data');
        const dataForTarget = dataForTargetAsString ? JSON.parse(dataForTargetAsString) : {};
        const app = new App({ // eslint-disable-line no-unused-vars
            target: elementTarget,
            store: {{storeInitialization}},
            data: dataForTarget
        });
    }
}
