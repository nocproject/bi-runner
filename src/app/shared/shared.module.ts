import { NgModule } from '@angular/core';

import { AnchorDirective } from './anchor.directive';
import { DatexPipe } from './datex.pipe';

export const PIPES = [
    DatexPipe
];

export const DIRECTIVES = [
    AnchorDirective
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
