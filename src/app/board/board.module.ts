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
import { WidgetsModule } from './widgets/widgets.module';
//
import { BoardComponent, FieldsComponent, ReportRangeComponent, SelectorComponent } from './index';
import { ConditionService } from './services/condition.service';
import { CounterService } from './services/counter.service';
import { EventService } from './services/event.service';
import { FilterService } from './services/filter.service';
import { DatasourceService } from './services/datasource-info.service';

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
        ConditionService,
        DatasourceService,
        EventService,
        CounterService,
        FilterService
    ]
})
export class BoardModule {
}
