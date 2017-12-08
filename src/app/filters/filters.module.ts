import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { Http } from '@angular/http';

import { NgxErrorsModule } from '@ultimate/ngxerrors';
import { TranslateLoader, TranslateModule, TranslateParser } from '@ngx-translate/core';
import { TreeviewModule } from 'ngx-treeview';
import { TooltipModule } from 'ngx-bootstrap/tooltip';

import { GroupComponent } from './containers/group/group.component';
import { FilterComponent } from './containers/filter/filter.component';
import { FilterFormComponent } from './containers/form/filter-form.component';
import {
    FormButtonComponent,
    FormCalendarComponent,
    FormDateRangeComponent,
    FormDictionaryComponent,
    FormInputComponent,
    FormModelComponent,
    FormSelectComponent
} from './components';
import { FormDropdownComponent } from './components/dropdown.component';

import { DynamicFieldDirective } from './components/dynamic-field.directive';
import { DictDirective } from './components/dict.directive';

import { ConditionService, EventService } from './services';
import { TranslateParserService } from '../shared/translate/translate-parser.service';
import { TranslateHttpLoader } from '../shared/translate/http-loader';

@NgModule({
    imports: [
        CommonModule,
        ReactiveFormsModule,
        NgxErrorsModule,
        TooltipModule,
        TreeviewModule.forRoot(),
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
        DynamicFieldDirective,
        DictDirective,
        FilterComponent,
        FilterFormComponent,
        FormButtonComponent,
        FormInputComponent,
        FormModelComponent,
        FormDropdownComponent,
        FormSelectComponent,
        GroupComponent,
        FormDictionaryComponent,
        FormCalendarComponent,
        FormDateRangeComponent
    ],
    exports: [
        FilterFormComponent
    ],
    providers: [
        ConditionService,
        EventService
    ],
    entryComponents: [
        GroupComponent,
        FormButtonComponent,
        FormCalendarComponent,
        FormDateRangeComponent,
        FormModelComponent,
        FormDictionaryComponent,
        FormInputComponent,
        FormSelectComponent
    ]
})
export class FiltersModule {
}

// AoT requires an exported function for factories
export function HttpLoaderFactory(http: Http) {
    return new TranslateHttpLoader(http);
}
