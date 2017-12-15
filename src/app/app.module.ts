import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { Http } from '@angular/http';

import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { TranslateLoader, TranslateModule, TranslateParser } from '@ngx-translate/core';

import { environment } from '../environments/environment';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HeaderComponent } from './header/header.component';
import {
    APIService, AuthenticationService, AuthGuard, DebugService, FilterService, LanguageService,
    MessageService
} from './services';
import { MessagesComponent } from './shared/messages/messages.component';
import { HttpModule } from './shared/interceptor/module';
import { BoardListComponent } from './boards/board-list.component';
import { LoginComponent } from './login/login.component';
import { BoardComponent } from './boards/board/board.component';
import { SelectorComponent } from './boards/selector/selector.component';
import { BoardResolver } from './boards/board/services/board.resolver';
import {
    BarComponent,
    BoxPlotComponent,
    CounterComponent,
    GeoComponent,
    LineComponent,
    PieComponent,
    RowComponent,
    SelectorMenuComponent,
    TableComponent
} from './boards/widgets';
import { AnchorDirective } from './shared/anchor.directive';
import { TimepickerComponent } from './shared/timepicker/timepicker.component';
import { GroupByComponent } from './boards/selector/groupby/groupby.component';

import { FiltersModule } from './filters/filters.module';
import { ModalModule } from './shared/modal';
import { ShareComponent } from './share/share.component';
import { DataGridComponent } from './shared/data-grid/data-grid.component';
import { AccessLevelComponent } from './header/access-level.component';
import { ShareCanDeactivateGuard } from './share/share-can-deactivate.guard';
import { TranslateHttpLoader } from './shared/translate/http-loader';
import { TranslateParserService } from './shared/translate/translate-parser.service';
import { MessageComponent } from './shared/messages/message.component';
import { DatexPipe } from './shared/datex.pipe';
import { ReportRangeComponent } from './shared/report-range/report-range.component';
import { MyDatePickerModule } from './shared/my-date-picker';

export const APP_SERVICES = [
    APIService,
    AuthGuard,
    AuthenticationService,
    FilterService,
    LanguageService,
    MessageService
];

@NgModule({
    declarations: [
        AppComponent,
        HeaderComponent,
        MessagesComponent,
        BoardListComponent,
        LoginComponent,
        BoardComponent,
        PieComponent,
        BoxPlotComponent,
        LineComponent,
        RowComponent,
        BarComponent,
        GeoComponent,
        SelectorMenuComponent,
        TableComponent,
        SelectorComponent,
        CounterComponent,
        AnchorDirective,
        GroupByComponent,
        TimepickerComponent,
        ShareComponent,
        DataGridComponent,
        AccessLevelComponent,
        MessageComponent,
        DatexPipe,
        ReportRangeComponent
    ],
    imports: [
        BrowserModule,
        HttpModule,
        AppRoutingModule,
        ModalModule,
        FiltersModule,
        ReactiveFormsModule,
        MyDatePickerModule,
        BsDropdownModule.forRoot(),
        TooltipModule.forRoot(),
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
