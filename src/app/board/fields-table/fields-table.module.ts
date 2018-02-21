import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TranslateModule } from '@ngx-translate/core';
import { TooltipModule } from 'ngx-bootstrap/tooltip';

import { FieldsTableComponent } from './fields-table.component';

export const COMPONENTS = [FieldsTableComponent];

@NgModule({
    imports: [
        CommonModule,
        TooltipModule.forRoot(),
        TranslateModule
    ],
    declarations: [
        ...COMPONENTS
    ],
    exports: [
        ...COMPONENTS
    ]
})
export class FieldsTableModule {
}
