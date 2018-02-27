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
    GeoComponent,
    LineComponent,
    PieComponent,
    RowComponent,
    SelectMenuComponent,
    TableComponent
} from './index';

export const WIDGETS = [
    BarComponent,
    BoxPlotComponent,
    CounterComponent,
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
