import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { UserService } from '../services';

@Component({
    selector: 'bi-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, OnDestroy {
    message = '';
    loginForm: FormGroup;

    constructor(private userService: UserService,
                private router: Router) {
        console.log('LoginComponent constructor');
        this.userService.logout();
    }

    ngOnInit() {
        console.log('LoginComponent ngOnInit');
        this.loginForm = new FormGroup({
            'user': new FormControl(null, [Validators.required]),
            'password': new FormControl(null, [Validators.required])
        });
    }

    ngOnDestroy(): void {
        console.log('LoginComponent ngOnDestroy');
        this.userService.isLoginOpen = false;
    }

    onLogin(): void {
        this.userService.login(this.loginForm.value).subscribe(
            response => {
                if (response) {
                    this.userService.userInfo();
                    this.router.navigate(['']);
                    this.message = '';
                } else {
                    this.message = 'Username or password incorrect!';
                    setTimeout(() => this.message = '', 5000);
                }
            }
        );
    }
}
