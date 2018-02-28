import { ErrorHandler, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HTTP_INTERCEPTORS, HttpClient, HttpClientModule } from '@angular/common/http';

import { TranslateLoader, TranslateModule, TranslateParser } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import * as Raven from 'raven-js';
//
import { environment } from '@env/environment';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import {
    APIInterceptor,
    APIService,
    AuthenticationService,
    AuthGuard,
    LanguageService,
    LayoutService,
    MessageService
} from './services';
import { BoardResolver } from './board/services/board.resolver';
import { BoardListModule } from './board-list/board-list.module';
import { BoardModule } from './board/board.module';
import { HeaderModule } from './header/header.module';
import { LoginModule } from './login/login.module';
import { ShareModule } from './share/share.module';
import { MessagesModule } from './shared/messages/messages.module';
import { ShareCanDeactivateGuard } from './share/share-can-deactivate.guard';
import { TranslateParserService } from './shared/translate/translate-parser.service';

Raven
    .config('https://848c4563b88d476fae5581361e064fdc@sentry.dv.rt.ru/4')
    .install();

export class RavenErrorHandler implements ErrorHandler {
    handleError(err: any): void {
        Raven.captureException(err);
    }
}

export function provideErrorHandler() {
    if (environment.production) {
        return new RavenErrorHandler();
    } else {
        return new ErrorHandler();
    }
}

export const APP_SERVICES = [
    APIService,
    AuthGuard,
    AuthenticationService,
    LanguageService,
    LayoutService,
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
        BoardListModule,
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
        },
        {
            provide: ErrorHandler,
            // useClass: RavenErrorHandler
            useFactory: provideErrorHandler
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
