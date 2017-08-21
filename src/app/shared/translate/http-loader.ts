import { Http } from '@angular/http';
import { TranslateLoader } from '@ngx-translate/core';
import 'rxjs/add/operator/map';

export class TranslateHttpLoader implements TranslateLoader {
    private prefix: string = './assets/i18n/';
    private suffix: string = '.json';

    constructor(private http: Http) {
    }

    /**
     * Gets the translations from the server
     * @param lang
     * @returns {any}
     */
    public getTranslation(lang: string): any {
        return this.http.get(`${this.prefix}${lang}${this.suffix}`);
    }
}