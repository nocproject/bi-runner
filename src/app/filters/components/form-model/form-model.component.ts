import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';

import { FilterControl } from '../../models/field.interface';
import { FieldConfig } from '../../models/form-config.interface';

@Component({
    selector: 'bi-form-model',
    template: `
        <div class="form-group" [formGroup]="form">
            <label class="control-label" translate>{{ config.label }}:</label>
            <bi-form-dropdown *ngFor="let dict of dicts"
                              [config]="dict"
                              [showRemove]="'true'"
                              [formControlName]="dict.expr"
                              (select)="onSelect()"></bi-form-dropdown>
        </div>
    `
})
export class FormModelComponent implements FilterControl, OnInit {
    config: FieldConfig;
    form: FormGroup;

    dicts: FieldConfig[] = [];

    ngOnInit(): void {
        // hardcode
        this.dicts = [{
            datasource: 'dictionaries.platform',
            // dict: 'platform',
            expr: 'platform',
            label: 'Value',
            name: 'valueFirst',
            description: 'Платформа',
            pseudo: false,
            type: 'string'
        }, {
            datasource: 'dictionaries.administrativedomain',
            // dict: 'administrativedomain',
            expr: 'administrative_domain',
            label: 'Value',
            name: 'valueFirst',
            description: 'З.О.',
            pseudo: false,
            type: 'string'
        }, {
            datasource: 'dictionaries.vendor',
            // dict: 'vendor',
            expr: 'vendor',
            label: 'Value',
            name: 'valueFirst',
            description: 'Производитель',
            pseudo: false,
            type: 'string'
        }, {
            datasource: 'dictionaries.container',
            // dict: 'container',
            expr: 'container',
            label: 'Value',
            name: 'valueFirst',
            description: 'Адрес',
            pseudo: false,
            type: 'string'
        }, {
            datasource: 'dictionaries.profile',
            // dict: 'profile',
            expr: 'profile',
            label: 'Value',
            name: 'valueFirst',
            description: 'Профиль объекта',
            pseudo: false,
            type: 'string'
        }, {
            datasource: 'dictionaries.networksegment',
            // dict: 'networksegment',
            expr: 'segment',
            label: 'Value',
            name: 'valueFirst',
            description: 'Сегмент сети',
            pseudo: false,
            type: 'string'
        }, {
            datasource: 'dictionaries.pool',
            // dict: 'pool',
            expr: 'pool',
            label: 'Value',
            name: 'valueFirst',
            description: 'Имя Пула',
            pseudo: false,
            type: 'string'
        }, {
            datasource: 'dictionaries.version',
            // dict: 'version',
            expr: 'version',
            label: 'Value',
            name: 'valueFirst',
            description: 'Версия',
            pseudo: false,
            type: 'string'
        }];

        this.dicts.forEach(dict => {
            if (this.config.value && this.config.value[2].hasOwnProperty(dict.expr)) {
                dict.value = this.config.value[2][dict.expr];
            }
            this.form.addControl(dict.expr, new FormControl(dict.value));
        });
    }

    onSelect() {
        const data = this.form.value;
        const value = this.dicts.reduce((acc, dict) => {
            if (data.hasOwnProperty(dict.expr) && data[dict.expr]) {
                acc[dict.expr] = data[dict.expr];
            }
            return acc;
        }, {});

        if (Object.keys(value).length) {
            // {"$selector": [{"$field": "managed_object"}, "sa.ManagedObject", {"administrative_domain": 15}]}
            // console.log(JSON.stringify({valueFirst: [{field$: this.config.expr}, this.config.model, value]}));
            this.form.patchValue({valueFirst: [{$field: `${this.config.expr}`}, this.config.model, value]});
        }
    }
}