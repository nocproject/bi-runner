import { Http } from '@angular/http';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { TranslateLoader, TranslateModule, TranslateParser } from '@ngx-translate/core';

import { TranslateParserService } from '../translate/translate-parser.service';
import { HttpLoaderFactory } from '../../app.module';
import { DataGridComponent } from './data-grid.component';

@NgModule({
    imports: [
        CommonModule,
        ReactiveFormsModule,
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
        DataGridComponent
    ],
    exports: [
        DataGridComponent
    ]
})
export class DataGridModule {
}
