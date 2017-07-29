import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { NgxErrorsModule } from '@ultimate/ngxerrors';

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

@NgModule({
    imports: [
        CommonModule,
        ReactiveFormsModule,
        NgxErrorsModule
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
