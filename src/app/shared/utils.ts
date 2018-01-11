import * as d3 from 'd3';

import { RouterStateSerializer } from '@ngrx/router-store';
import { Params, RouterStateSnapshot } from '@angular/router';

export class Utils {

    static reductionName(element): string {
        const name = element.desc;

        if (name && name.length > 10) {
            return name.substr(0, 10) + '...';
        }
        return name;
    };

    // use if property format exist in table query
    static dateToString(date, format?: string): string {
        format = typeof format !== 'undefined' ? format : '%d.%m.%y';

        return d3.time.format(format)(date);
    };

    static dateToTimeString(date, format?: string): string {
        format = typeof format !== 'undefined' ? format : '%H:%M';

        return d3.time.format(format)(date);
    };

    static dateToDateTimeString(date, format?: string): string {
        format = typeof format !== 'undefined' ? format : '%d.%m.%y %H:%M';

        return d3.time.format(format)(date);
    };

    static spanView(id: number): string {
        return `<a href="/api/card/view/span/${id}/" target="_blank" title="open"><ins>${id}</ins></a>`;
    }

    static stringDateTimeToTimeString(date: string): string {
        const time = date.split(' ')[1];
        return `${time.split(':')[0]}:${time.split(':')[1]}`;
    }

    static numberFormat(data) {
        return d3.format('.4f')(parseFloat(data));
    }

    static intFormat(data) {
        return d3.format('.0f')(parseFloat(data));
    }

    // use if property format exist in table query
    static secondsToString(sec) {
        const hours = Math.floor(sec / 3600);
        const minutes = Math.floor((sec % 3600) / 60);
        const seconds = sec % 60;

        return hours + ':' + d3.format('02d')(minutes) + ':' + d3.format('02d')(seconds);
    };
}

/**
 * The RouterStateSerializer takes the current RouterStateSnapshot
 * and returns any pertinent information needed. The snapshot contains
 * all information about the state of the router at the given point in time.
 * The entire snapshot is complex and not always needed. In this case, you only
 * need the URL and query parameters from the snapshot in the store. Other items could be
 * returned such as route parameters and static route data.
 */

export interface RouterStateUrl {
    url: string;
    queryParams: Params;
}

export class CustomRouterStateSerializer
    implements RouterStateSerializer<RouterStateUrl> {
    serialize(routerState: RouterStateSnapshot): RouterStateUrl {
        const { url } = routerState;
        const queryParams = routerState.root.queryParams;

        return { url, queryParams };
    }
}

