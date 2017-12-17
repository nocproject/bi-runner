import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Http } from '@angular/http';
//
import { TranslateLoader, TranslateModule, TranslateParser } from '@ngx-translate/core';
//
import { TranslateParserService } from '../shared/translate/translate-parser.service';
import { HttpLoaderFactory } from '../app.module';

import {
    BarComponent, BoxPlotComponent, CounterComponent, GeoComponent, LineComponent, PieComponent, RowComponent,
    SelectMenuComponent, TableComponent
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
        TranslateModule.forRoot({
            loader: {
                provide: TranslateLoader,
                useFactory: HttpLoaderFactory,
                deps: [Http]
            },
            parser: {
                provide: TranslateParser,
                useClass: TranslateParserService
            }
        })
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
