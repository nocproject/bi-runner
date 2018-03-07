import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
//
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { TranslateModule } from '@ngx-translate/core';
import {
    BarComponent,
    BoxPlotComponent,
    CounterComponent,
    ExportComponent,
    GeoComponent,
    LineComponent,
    PieComponent,
    RowComponent,
    SelectMenuComponent,
    TableComponent
} from './index';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';

export const WIDGETS = [
    BarComponent,
    BoxPlotComponent,
    CounterComponent,
    ExportComponent,
    GeoComponent,
    LineComponent,
    PieComponent,
    RowComponent,
    SelectMenuComponent,
    TableComponent
];

@NgModule({
    imports: [
        CommonModule,
        NgxDatatableModule,
        ReactiveFormsModule,
        TooltipModule.forRoot(),
        TranslateModule
    ],
    declarations: [
        ...WIDGETS
    ],
    exports: [
        ...WIDGETS
    ]
})
export class WidgetsModule {
}
