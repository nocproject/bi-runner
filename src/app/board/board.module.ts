import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { TranslateModule } from '@ngx-translate/core';

import { DataGridModule } from '../shared/data-grid/data-grid.module';
import { FiltersFormModule } from './filters-form/filters-form.module';
import { ModalModule } from '../shared/modal/modal.module';
import { MyDatePickerModule } from '../shared/my-date-picker';
import { SharedModule } from '../shared/shared.module';
import { TimepickerModule } from '../shared/timepicker/timepicker.module';
import { WidgetsModule } from './widgets/widgets.module';
//
import { BoardComponent, ReportRangeComponent, SelectorComponent } from './index';
import { CounterService } from './services/counter.service';
import { EventService } from './services/event.service';
import { FilterService } from './services/filter.service';
import { FieldsTableService } from './services/fields-table.service';
import { FieldsTableModule } from './fields-table/fields-table.module';

export const COMPONENTS = [
    BoardComponent,
    ReportRangeComponent,
    SelectorComponent
];

@NgModule({
    imports: [
        CommonModule,
        FiltersFormModule,
        FieldsTableModule,
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
        EventService,
        FieldsTableService,
        FilterService
    ]
})
export class BoardModule {
}
