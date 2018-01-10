import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedModule } from '../shared.module';
//
import { TimepickerComponent } from './timepicker.component';

@NgModule({
    imports: [
        CommonModule,
        SharedModule
    ],
    declarations: [
        TimepickerComponent
    ],
    exports: [
        TimepickerComponent
    ]
})
export class TimepickerModule {
}
