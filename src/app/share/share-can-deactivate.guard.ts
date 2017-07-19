import { CanDeactivate } from '@angular/router';
import { Injectable } from '@angular/core';

import { Observable } from 'rxjs/Observable';
import { ShareComponent } from './share.component';

@Injectable()
export class ShareCanDeactivateGuard implements CanDeactivate<ShareComponent> {
    // ToDo check: @HostListener('window:beforeunload')
    // @HostListener('window:beforeunload', ['$event'])
    // unloadNotification($event: any) {
    //     if (!this.canDeactivate(null)) {
    //         $event.returnValue = "This message is displayed to the user in IE and Edge when they navigate without using Angular routing (type another URL/close the browser/etc)";
    //     }
    // }
    canDeactivate(component: ShareComponent): Observable<boolean> | Promise<boolean> | boolean {
        if (component.unsavedData) {
            component.confirmDialog.open();
            return component.confirmAnswer$;
        }
        return true;
    }
}