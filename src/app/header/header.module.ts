import { NgModule } from '@angular/core';
import { AppRoutingModule } from '../app-routing.module';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { Http } from '@angular/http';

import { TranslateLoader, TranslateModule, TranslateParser } from '@ngx-translate/core';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';

import { HttpLoaderFactory } from '../app.module';
import { ModalModule } from '../shared/modal/modal.module';
import { WidgetsModule } from '../widgets/widgets.module';
//
import { TranslateParserService } from '../shared/translate/translate-parser.service';
//
import { AccessLevelComponent } from './access-level.component';
import { HeaderComponent } from './header.component';

export const COMPONENTS = [
    AccessLevelComponent,
    HeaderComponent
];

@NgModule({
    imports: [
        AppRoutingModule,
        CommonModule,
        ModalModule,
        ReactiveFormsModule,
        WidgetsModule,
        BsDropdownModule.forRoot(),
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
        ...COMPONENTS
    ],
    exports: [
        ...COMPONENTS
    ]
})
export class HeaderModule {
}
