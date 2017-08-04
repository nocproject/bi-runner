import { Component } from '@angular/core';

@Component({
    selector: 'bi-root',
    template: `
        <bi-header></bi-header>
        <router-outlet></router-outlet>
        <bi-messages class="footer navbar-fixed-bottom"></bi-messages>
    `
})
export class AppComponent {
}
