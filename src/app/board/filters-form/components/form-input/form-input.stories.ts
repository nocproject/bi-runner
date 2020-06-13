import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { text, withKnobs } from '@storybook/addon-knobs';

import { FieldBuilder } from '@app/model';
import { moduleMetadata } from '@storybook/angular';
import { LanguageService } from '@app/services';
import { FormInputComponent } from '@filter/components';
import { BIValidators } from '../validators';
import { TranslateModule } from '@ngx-translate/core';

export default {
    title: 'Filters Components/input (CFS)',
    decorators: [
        withKnobs,
        moduleMetadata({
            providers: [
                LanguageService
            ],
            imports: [
                ReactiveFormsModule,
                TranslateModule.forRoot({})
            ]
        })
    ]
};

export const Default = () => ({
    component: FormInputComponent,
    props: {
        config: {
            controlName: 'value',
            disabled: false,
            label: text('label', 'Value'),
            placeholder: 'dd.mm.yyyy',
            type: 'input',
            validation: [Validators.required, BIValidators.date],
            value: '28.12.2015'
        },
        form: new FormGroup({
            name: new FormControl('date'),
            condition: new FormControl('$eq'),
            // value: new FormControl(text('value', '28.12.2015'))
            value: new FormControl('28.12.2015')
        }),
        field: new FieldBuilder()
            .name('date')
            .description('Date')
            .type('Date')
            .group(0)
            .pseudo(false)
            .build()
    }
});
