import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { AuthenticationService } from '@app/services';

@Component({
    selector: 'bi-login',
    templateUrl: './login.component.html'
})
export class LoginComponent implements OnInit, OnDestroy {
    message = '';
    loginForm: FormGroup;
    returnUrl: string;

    constructor(private authService: AuthenticationService,
                private route: ActivatedRoute,
                private router: Router) {
        this.authService.logout();
    }

    ngOnInit() {
        this.loginForm = new FormGroup({
            'user': new FormControl(null, [Validators.required]),
            'password': new FormControl(null, [Validators.required])
        });
        // get return url from route parameters or default to '/'
        this.returnUrl = this.route.snapshot.queryParams['url'] || '/';
    }

    ngOnDestroy(): void {
    }

    onLogin(): void {
        this.authService.login(this.loginForm.value).subscribe(
            response => {
                if (response) {
                    this.router.navigate([this.returnUrl]);
                    this.message = '';
                } else {
                    this.message = 'Username or password incorrect!';
                    setTimeout(() => this.message = '', 5000);
                }
            }
        );
    }
}
