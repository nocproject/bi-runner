import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HTTP_INTERCEPTORS, HttpClient, HttpClientModule } from '@angular/common/http';

import { TranslateLoader, TranslateModule, TranslateParser } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
// @ngrx
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import {
    StoreRouterConnectingModule,
    RouterStateSerializer,
} from '@ngrx/router-store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
//
import { environment } from '../environments/environment';
import { AppRoutingModule } from './app-routing.module';
import { reducers, metaReducers } from './reducers';
import { CustomRouterStateSerializer } from './shared/utils';
import { AppComponent } from './app.component';
import {
    APIInterceptor, APIService, AuthenticationService, AuthGuard, CounterService, DebugService, FilterService,
    LanguageService, MessageService
} from './services';
import { BoardResolver } from './boards/board/services/board.resolver';
import { BoardModule } from './boards/board.module';
import { HeaderModule } from './header/header.module';
import { LoginModule } from './login/login.module';
import { ShareModule } from './share/share.module';
import { MessagesModule } from './shared/messages/messages.module';
import { ShareCanDeactivateGuard } from './share/share-can-deactivate.guard';
import { TranslateParserService } from './shared/translate/translate-parser.service';

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
        // @ngrx
        StoreModule.forRoot(reducers, { metaReducers }),
        StoreRouterConnectingModule,
        !environment.production
            ? StoreDevtoolsModule.instrument()
            : [],
        EffectsModule.forRoot([]),
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
                MessageService,
                DebugService
            ],
            multi: true
        },
        {
            provide: RouterStateSerializer,
            useClass: CustomRouterStateSerializer
        },
        !environment.production ? DebugService : []
    ],
    bootstrap: [AppComponent]
})
export class AppModule {
}

// AoT requires an exported function for factories
export function HttpLoaderFactory(http: HttpClient) {
    return new TranslateHttpLoader(http, '/ui/bi2/assets/i18n/');
}
