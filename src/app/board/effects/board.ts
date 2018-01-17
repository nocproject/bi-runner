import { Injectable } from '@angular/core';

import { Action } from '@ngrx/store';
import { Actions, Effect } from '@ngrx/effects';

import { Observable } from 'rxjs/Observable';

import { Datasource } from 'app/model';
import { DatasourceService } from '../services/datasource-info.service';
import * as board from '../actions/board';
import * as field from '../actions/fields';
import * as option from '../actions/options';
import * as datasource from '../actions/datasource';

@Injectable()
export class FieldsEffects {
    constructor(private actions$: Actions,
                private infoService: DatasourceService) {
    }

    @Effect({dispatch: true}) load$: Observable<Action> = this.actions$
        .ofType(board.LOAD_DATASOURCE_INFO)
        .switchMap(() => this.infoService
            .info()
            .mergeMap((d: Datasource) => [
                    new field.ClearFields(),
                    new option.ClearOptions(),
                    new field.AddFields(d.fields),
                    new option.AddOptions(d.options),
                    new datasource.SetSample(d.sample),
                    new datasource.SetName(d.name),
                    new board.LoadInfoSuccess()
                ]
            )
        );
}