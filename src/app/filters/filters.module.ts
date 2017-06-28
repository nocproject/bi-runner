import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
// Animations
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
// PrimeNG
import { CalendarModule } from 'primeng/components/calendar/calendar';

import { GroupComponent } from './containers/group/group.component';
import { FilterComponent } from './containers/filter/filter.component';
import { FilterFormComponent } from './containers/form/filter-form.component';
import { FormButtonComponent } from './components/form-button/form-button.component';
import { FormCalendarComponent } from './components/form-calendar/form-calendar.component';
import { FormDateRangeComponent } from './components/form-date-range/form-date-range.component';
import { FormDictionaryComponent } from './components/form-dictionary/form-dictionary.component';
import { FormInputComponent } from './components/form-input/form-input.component';
import { FormInputMaskComponent } from './components/form-input-mask/form-input-mask.component';
import { FormSelectComponent } from './components/form-select/form-select.component';

import { DynamicFieldDirective } from './components/dynamic-field.directive';
import { MaskDirective } from './components/mask.directive';

import { ConditionService } from './services/condition.service';
import { EventService } from './services/event.service';
import { ValueService } from './services/value.service';

@NgModule({
    imports: [
        BrowserAnimationsModule,
        CalendarModule,
        CommonModule,
        ReactiveFormsModule
    ],
    declarations: [
        DynamicFieldDirective,
        MaskDirective,
        FilterComponent,
        FilterFormComponent,
        FormButtonComponent,
        FormInputComponent,
        FormInputMaskComponent,
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
        FormDictionaryComponent,
        FormInputComponent,
        FormInputMaskComponent,
        FormSelectComponent
    ]
})
export class FiltersModule {
}
