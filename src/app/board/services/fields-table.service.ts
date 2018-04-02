import { Injectable } from '@angular/core';

import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { cloneDeep, remove } from 'lodash';

import { Field } from '@app/model';

@Injectable()
export class FieldsTableService {
    // store state fields table
    private fieldsSubject = new BehaviorSubject<Field[]>([]);
    fields$: Observable<Field[]> = this.fieldsSubject.asObservable();

    fieldsNext(fields: Field[]) {
        this.fieldsSubject.next(this.fieldsSubject.getValue().concat(fields));
    }

    allFields(): Field[] {
        return cloneDeep(this.fieldsSubject.getValue());
    }

    cleanFields() {
        this.fieldsSubject.next([]);
    }

    removeField(field: Field) {
        const fields = cloneDeep(this.fieldsSubject.getValue());

        remove(fields, e => e.expr === field.name);

        if (field.dict || field.name === 'ip') {
            remove(fields, e => e.alias === `${field.name}_text`);
        }

        this.fieldsSubject.next(fields);
    }
}
