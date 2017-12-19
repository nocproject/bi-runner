import { NgModule } from '@angular/core';

import { DatexPipe } from './datex.pipe';

export const PIPES = [
    DatexPipe
];

export const DIRECTIVES = [
];

@NgModule({
    declarations: [
        ...PIPES,
        ...DIRECTIVES
    ],
    exports: [
        ...PIPES,
        ...DIRECTIVES
    ]
})
export class SharedModule {
}
