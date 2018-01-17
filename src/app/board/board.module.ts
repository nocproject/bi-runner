import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
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
//
import { reducers } from './reducers';
import { FieldsEffects } from './effects/board';
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
        TranslateModule,
        StoreModule.forFeature('board', reducers),
        EffectsModule.forFeature([FieldsEffects])
    ],
    declarations: [
        ...COMPONENTS
    ],
    exports: [
        ...COMPONENTS
    ],
    providers: [
        DatasourceService
    //     {
    //         provide: DatasourceService,
    //         useClass: DatasourceService,
    //         deps: [APIService, BoardResolver]
    //     }
    ]
})
export class BoardModule {
}
