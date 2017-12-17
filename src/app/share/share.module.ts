import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { Http } from '@angular/http';
//
import { TranslateLoader, TranslateModule, TranslateParser } from '@ngx-translate/core';
//
import { DataGridModule } from '../shared/data-grid/data-grid.module';
import { ModalModule } from '../shared/modal/modal.module';
import { HttpLoaderFactory } from '../app.module';
//
import { TranslateParserService } from '../shared/translate/translate-parser.service';
//
import { ShareComponent } from './share.component';

@NgModule({
    imports: [
        CommonModule,
        DataGridModule,
        ReactiveFormsModule,
        ModalModule,
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
    declarations: [ShareComponent],
    exports: [ShareComponent]
})
export class ShareModule {
}
