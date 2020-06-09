import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';

import { Field, FieldBuilder } from '@app/model';
import { FieldConfig } from '../../model';
import { ValueControl } from '../value-control';
import { BIValidators } from '../validators';

@Component({
    selector: 'bi-form-model',
    template: `
        <div class="form-group" [formGroup]="form">
            <label class="control-label">{{ config.label | translate }}:</label>
            <bi-dropdown *ngFor="let dict of dicts"
                         [config]="dict.config"
                         [field]="dict.field"
                         [formControlName]="dict.config.controlName"
                         [showRemove]="'true'"
                         (select)="onSelect()"></bi-dropdown>
        </div>
    `
})
export class FormModelComponent extends ValueControl implements OnInit {
    dicts: { config: FieldConfig, field: Field }[] = [];

    ngOnInit(): void {
        // hardcode
        this.dicts = [
            {
                config: {
                    placeholder: 'Платформа',
                    label: 'Value',
                    controlName: 'platform',
                    type: 'string',
                    disabled: false,
                    validation: [],
                    value: ''
                },
                field: new FieldBuilder()
                    .expr('platform')
                    .description('Платформа')
                    .datasource('dictionaries.platform')
                    .build()
            }, {
                config: {
                    placeholder: 'З.О.',
                    label: 'Value',
                    controlName: 'administrativedomain',
                    type: 'string',
                    disabled: false,
                    validation: [],
                    value: ''
                },
                field: new FieldBuilder()
                    .expr('administrativedomain')
                    .description('З.О.')
                    .datasource('dictionaries.administrativedomain')
                    .build()
            }, {
                config: {
                    placeholder: 'Производитель',
                    label: 'Value',
                    controlName: 'vendor',
                    type: 'string',
                    disabled: false,
                    validation: [],
                    value: ''
                },
                field: new FieldBuilder()
                    .expr('vendor')
                    .description('Производитель')
                    .datasource('dictionaries.vendor')
                    .build()
            }, {
                config: {
                    placeholder: 'Адрес',
                    label: 'Value',
                    controlName: 'container',
                    type: 'string',
                    disabled: false,
                    validation: [],
                    value: ''
                },
                field: new FieldBuilder()
                    .expr('container')
                    .description('Адрес')
                    .datasource('dictionaries.container')
                    .build()
            }, {
                config: {
                    placeholder: 'Профиль объекта',
                    label: 'Value',
                    controlName: 'profile',
                    type: 'string',
                    disabled: false,
                    validation: [],
                    value: ''
                },
                field: new FieldBuilder()
                    .expr('profile')
                    .description('Профиль объекта')
                    .datasource('dictionaries.profile')
                    .build()
            }, {
                config: {
                    placeholder: 'Сегмент сети',
                    label: 'Value',
                    controlName: 'networksegment',
                    type: 'string',
                    disabled: false,
                    validation: [],
                    value: ''
                },
                field: new FieldBuilder()
                    .expr('networksegment')
                    .description('Сегмент сети')
                    .datasource('dictionaries.networksegment')
                    .build()
            }, {
                config: {
                    placeholder: 'Имя Пула',
                    label: 'Value',
                    controlName: 'pool',
                    type: 'string',
                    disabled: false,
                    validation: [],
                    value: ''
                }, field: new FieldBuilder()
                    .expr('pool')
                    .description('Имя Пула')
                    .datasource('dictionaries.pool')
                    .build()
            }, {
                config: {
                    placeholder: 'Версия',
                    label: 'Value',
                    controlName: 'version',
                    type: 'string',
                    disabled: false,
                    validation: [],
                    value: ''
                }, field: new FieldBuilder()
                    .expr('version')
                    .description('Версия')
                    .datasource('dictionaries.version')
                    .build()
            }
        ];

        this.dicts.forEach(dict => {
            // Restore by this.config.value
            const controlName = dict.config.controlName;
            if (this.config.value
                && this.config.value.length === 3
                && this.config.value[2].hasOwnProperty(controlName)) {
                dict.config.value = this.config.value[2][controlName];
            }
            this.form.addControl(controlName, new FormControl(dict.config.value));
            this.form.setValidators(BIValidators.model);
        });
    }

    onSelect() {
        const data = this.form.value;
        const value = this.dicts.reduce((acc, dict) => {
            const controlName = dict.config.controlName;
            if (data.hasOwnProperty(controlName) && data[controlName]) {
                acc[controlName] = data[controlName];
            }
            return acc;
        }, {});

        this.form.patchValue({value: [{$field: `${this.field.name}`}, this.field.model, value]});
    }

}
