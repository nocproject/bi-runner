import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

import { environment } from '../../environments/environment';

@Injectable()
export class LanguageService {
    constructor(private translate: TranslateService) {
        // this language will be used as a fallback when a translation isn't found in the current language
        translate.setDefaultLang('en');

        // the lang to use, if the lang isn't available, it will use the current loader to get them
        translate.use(this.current);
        translate.stream('WIDGET.DAYS').subscribe(value => {
            this._days = JSON.parse(value);
        });
        translate.stream('SELECT_MENU.PROMPT').subscribe(value => {
            this._selectMenuPrompt = value;
        });
    }

    private _languages: string[] = ['ru', 'en'];

    get languages(): string[] {
        return this._languages;
    }

    private _current: string = environment.language ? environment.language : 'en';

    get current(): string {
        return this._current;
    }

    set current(value: string) {
        this._current = value;
    }

    private _days: string[];
    private _selectMenuPrompt: string;

    get days(): string[] {
        return this._days;
    }

    get selectMenuPrompt() {
      return this._selectMenuPrompt;
    }

    use(lang: string) {
        this.translate.use(lang);
        this.current = lang;
    }
}
