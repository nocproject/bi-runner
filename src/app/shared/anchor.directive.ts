import { Directive, ViewContainerRef } from '@angular/core';

@Directive({
    selector: '[biAnchor]'
})
export class AnchorDirective {

    constructor(public viewContainerRef: ViewContainerRef) {
    }

}
