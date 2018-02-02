import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { TranslateModule } from '@ngx-translate/core';

import { DataGridModule } from '../shared/data-grid/data-grid.module';
import { FiltersModule } from './filters/filters.module';
import { ModalModule } from '../shared/modal/modal.module';
import { MyDatePickerModule } from '../shared/my-date-picker';
import { SharedModule } from '../shared/shared.module';
import { TimepickerModule } from '../shared/timepicker/timepicker.module';
import { WidgetsModule } from '../widgets/widgets.module';
//
import { BoardComponent, FieldsComponent, ReportRangeComponent, SelectorComponent } from './index';
import { CounterService, DatasourceService, FilterService } from './services';

export const COMPONENTS = [
    BoardComponent,
    FieldsComponent,
    ReportRangeComponent,
    SelectorComponent
];

@NgModule({
    imports: [
        CommonModule,
        FiltersModule,
        DataGridModule,
        ModalModule,
        MyDatePickerModule,
        SharedModule,
        TimepickerModule,
        WidgetsModule,
        ReactiveFormsModule,
        TooltipModule.forRoot(),
        TranslateModule
    ],
    declarations: [
        ...COMPONENTS
    ],
    exports: [
        ...COMPONENTS
    ],
    providers: [
        CounterService,
        FilterService
    ]
})
export class BoardModule {
}
