import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { Http } from '@angular/http';
import { TranslateLoader, TranslateModule, TranslateParser } from '@ngx-translate/core';

import { environment } from '../environments/environment';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import {
    APIService, AuthenticationService, AuthGuard, CounterService, DebugService, FilterService, LanguageService,
    MessageService
} from './services';
import { HttpModule } from './shared/interceptor/module';
import { BoardResolver } from './boards/board/services/board.resolver';
import { BoardModule } from './boards/board.module';
import { HeaderModule } from './header/header.module';
import { LoginModule } from './login/login.module';
import { ShareModule } from './share/share.module';
import { MessagesModule } from './shared/messages/messages.module';
import { ShareCanDeactivateGuard } from './share/share-can-deactivate.guard';
import { TranslateHttpLoader } from './shared/translate/http-loader';
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
        BoardModule,
        MessagesModule,
        HeaderModule,
        LoginModule,
        ShareModule,
        BrowserModule,
        HttpModule,
        AppRoutingModule,
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
    providers: [
        BoardResolver,
        ShareCanDeactivateGuard,
        // Application services
        ...APP_SERVICES,
        !environment.production ? DebugService : []
    ],
    bootstrap: [AppComponent]
})
export class AppModule {
}

// AoT requires an exported function for factories
export function HttpLoaderFactory(http: Http) {
    return new TranslateHttpLoader(http);
}
