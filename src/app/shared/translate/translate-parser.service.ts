import { Injectable } from '@angular/core';
import { Response } from '@angular/http';

import { TranslateParser } from '@ngx-translate/core';

@Injectable()
export class TranslateParserService extends TranslateParser {
    templateMatcher: RegExp = /{{\s?([^{}\s]*)\s?}}/g;

    interpolate(expr: string, params?: any): string {
        if (typeof expr !== 'string' || !params) {
            return expr;
        }

        return expr.replace(this.templateMatcher, (substring: string, b: string) => {
            let r = this.getValue(params, b);
            return isDefined(r) ? r : substring;
        });
    }

    getValue(target: any, key: string): string {
        let keys = key.split('.');
        if (target instanceof Response) {
            target = target.json();
        }

        key = '';
        do {
            key += keys.shift();
            if (isDefined(target) && isDefined(target[key]) && (typeof target[key] === 'object' || !keys.length)) {
                target = target[key];
                key = '';
            } else if (!keys.length) {
                target = undefined;
            } else {
                key += '.';
            }
        } while (keys.length);

        return target;
    }
}

function isDefined(value: any): boolean {
    return typeof value !== 'undefined' && value !== null;
}