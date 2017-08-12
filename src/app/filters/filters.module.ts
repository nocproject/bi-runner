import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { Http } from '@angular/http';

import { NgxErrorsModule } from '@ultimate/ngxerrors';
import { TranslateLoader, TranslateModule, TranslateParser } from '@ngx-translate/core';
import { TreeviewModule } from 'ngx-treeview';

import { GroupComponent } from './containers/group/group.component';
import { FilterComponent } from './containers/filter/filter.component';
import { FilterFormComponent } from './containers/form/filter-form.component';
import { FormButtonComponent } from './components/form-button/form-button.component';
import { FormCalendarComponent } from './components/form-calendar/form-calendar.component';
import { FormDateRangeComponent } from './components/form-date-range/form-date-range.component';
import { FormDictionaryComponent } from './components/form-dictionary/form-dictionary.component';
import { FormInputComponent } from './components/form-input/form-input.component';
import { FormSelectComponent } from './components/form-select/form-select.component';
import { FormModelComponent } from './components/form-model/form-model.component';
import { FormDropdownComponent } from './components/dropdown.component';

import { DynamicFieldDirective } from './components/dynamic-field.directive';
import { DictDirective } from './components/dict.directive';

import { ConditionService } from './services/condition.service';
import { EventService } from './services/event.service';
import { ValueService } from './services/value.service';
import { TranslateParserService } from '../shared/translate/translate-parser.service';
import { TranslateHttpLoader } from '../shared/translate/http-loader';

@NgModule({
    imports: [
        CommonModule,
        ReactiveFormsModule,
        NgxErrorsModule,
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
        EventService,
        ValueService
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
