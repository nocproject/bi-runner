import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Http } from '@angular/http';

import { TranslateLoader, TranslateModule, TranslateParser } from '@ngx-translate/core';

import { MessagesComponent } from './messages.component';
import { MessageComponent } from './message.component';
import { TranslateParserService } from '../translate/translate-parser.service';
import { HttpLoaderFactory } from '../../app.module';

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
        MessageComponent,
        MessagesComponent
    ],
    exports: [
        MessageComponent,
        MessagesComponent
    ]
})
export class MessagesModule {
}
