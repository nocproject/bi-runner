import { NgModule } from '@angular/core';
import { HTTP_INTERCEPTORS, HttpClient, HttpClientModule } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
//
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import {
    APIInterceptor,
    APIService,
    AuthGuard,
    BoardService,
    DatasourceService,
    LanguageService,
    LayoutService,
    MessageService
} from './services';
import { BoardListModule } from './board-list/board-list.module';
import { BoardModule } from './board/board.module';
import { HeaderModule } from './header/header.module';
import { LoginModule } from './login/login.module';
import { ShareModule } from './share/share.module';
import { MessagesModule } from './shared/messages/messages.module';
import { ShareCanDeactivateGuard } from './share/share-can-deactivate.guard';

export const APP_SERVICES = [
    APIService,
    AuthGuard,
    BoardService,
    DatasourceService,
    LanguageService,
    LayoutService,
];

@NgModule({
    declarations: [
        AppComponent
    ],
    imports: [
        BrowserModule,
        HttpClientModule,
        BoardModule,
        BoardListModule,
        MessagesModule,
        HeaderModule,
        LoginModule,
        ShareModule,
        AppRoutingModule,
        BrowserAnimationsModule,
        TranslateModule.forRoot({
            loader: {
                provide: TranslateLoader,
                useFactory: HttpLoaderFactory,
                deps: [
                    HttpClient
                ]
            },
        })
    ],
    providers: [
        ShareCanDeactivateGuard,
        // Application services
        ...APP_SERVICES,
        {
            provide: HTTP_INTERCEPTORS,
            useClass: APIInterceptor,
            deps: [
                MessageService
            ],
            multi: true
        }
    ],
    bootstrap: [AppComponent]
})
export class AppModule {
}

// AoT requires an exported function for factories
export function HttpLoaderFactory(http: HttpClient) {
    return new TranslateHttpLoader(http, 'assets/i18n/');
}
