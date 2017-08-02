import { Component } from '@angular/core';

@Component({
    selector: 'bi-root',
    template: `
        <bi-header></bi-header>
        <bi-messages></bi-messages>
        <router-outlet></router-outlet>
    `
})
export class AppComponent {
}
