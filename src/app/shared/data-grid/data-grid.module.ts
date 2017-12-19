import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { TranslateModule } from '@ngx-translate/core';
import { DataGridComponent } from './data-grid.component';

@NgModule({
    imports: [
        CommonModule,
        ReactiveFormsModule,
        TranslateModule
    ],
    declarations: [
        DataGridComponent
    ],
    exports: [
        DataGridComponent
    ]
})
export class DataGridModule {
}
