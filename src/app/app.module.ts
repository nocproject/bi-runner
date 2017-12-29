import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {HTTP_INTERCEPTORS, HttpClient, HttpClientModule} from '@angular/common/http';

import {TranslateLoader, TranslateModule, TranslateParser} from '@ngx-translate/core';
import {TranslateHttpLoader} from '@ngx-translate/http-loader';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {
  APIInterceptor, APIService, AuthenticationService, AuthGuard, CounterService, FilterService, LanguageService,
  MessageService
} from './services';
import {BoardResolver} from './boards/board/services/board.resolver';
import {BoardModule} from './boards/board.module';
import {HeaderModule} from './header/header.module';
import {LoginModule} from './login/login.module';
import {ShareModule} from './share/share.module';
import {MessagesModule} from './shared/messages/messages.module';
import {ShareCanDeactivateGuard} from './share/share-can-deactivate.guard';
import {TranslateParserService} from './shared/translate/translate-parser.service';

export const APP_SERVICES = [
    APIService,
    AuthGuard,
    AuthenticationService,
    CounterService,
    FilterService,
    LanguageService,
    MessageService
];

@NgModule({
    declarations: [
        AppComponent
    ],
    imports: [
        BrowserModule,
        HttpClientModule,
        BoardModule,
        MessagesModule,
        HeaderModule,
        LoginModule,
        ShareModule,
        AppRoutingModule,
        TranslateModule.forRoot({
            loader: {
                provide: TranslateLoader,
                useFactory: HttpLoaderFactory,
                deps: [HttpClient]
            },
            parser: {
                provide: TranslateParser,
                useClass: TranslateParserService
            }
        })
    ],
    providers: [
        BoardResolver,
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
    return new TranslateHttpLoader(http, '/ui/bi2/assets/i18n/');
}
