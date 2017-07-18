import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
// ToDo delete
import { DateTimePickerModule } from 'ng-pick-datetime';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HeaderComponent } from './header/header.component';
import { DropdownDirective } from './shared/dropdown.directive';
import { APIService, DebugService, FilterService, MessageService, UserService } from './services';
import { MessagesComponent } from './shared/messages/messages.component';
import { HttpModule } from './shared/interceptor/module/http.module';
import { BoardListComponent } from './boards/board-list.component';
import { LoginComponent } from './login/login.component';
import { BoardComponent } from './boards/board/board.component';
import { BoardResolver } from './boards/board/board.resolver';
import { BarComponent, LineComponent, PieComponent, RowComponent, TableComponent } from './boards/widgets';
import { SelectorComponent } from './boards/selector/selector.component';
import { CounterComponent } from './boards/widgets/counter/counter.component';
import { AnchorDirective } from './shared/anchor.directive';
import { DatetimeRangeComponent } from './shared/datetime-range/datetime-range.component';
import { TimepickerComponent } from './shared/timepicker/timepicker.component';
import { GroupByComponent } from './boards/selector/groupby/groupby.component';
import { SelectComponent } from './shared/select/select.component';

import { FiltersModule } from './filters/filters.module';
import { ModalModule } from './shared/modal';
import { ShareComponent } from './share/share.component';
import { DataGridComponent } from './shared/data-grid/data-grid.component';
import { AccessLevelComponent } from './header/access-level.component';

@NgModule({
    declarations: [
        AppComponent,
        HeaderComponent,
        DropdownDirective,
        MessagesComponent,
        BoardListComponent,
        LoginComponent,
        BoardComponent,
        PieComponent,
        LineComponent,
        RowComponent,
        BarComponent,
        TableComponent,
        SelectorComponent,
        CounterComponent,
        AnchorDirective,
        DatetimeRangeComponent,
        GroupByComponent,
        TimepickerComponent,
        SelectComponent,
        ShareComponent,
        DataGridComponent,
        AccessLevelComponent
    ],
    imports: [
        BrowserModule,
        HttpModule,
        AppRoutingModule,
        ModalModule,
        DateTimePickerModule,
        FiltersModule,
        ReactiveFormsModule
    ],
    providers: [
        APIService,
        BoardResolver,
        DebugService,
        FilterService,
        MessageService,
        UserService
    ],
    bootstrap: [AppComponent]
})
export class AppModule {
}
