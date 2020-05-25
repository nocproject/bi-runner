import { forwardRef, Inject, Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { AuthenticationService } from './authentication.service';

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(private router: Router,
                @Inject(forwardRef(() => AuthenticationService))
                private authService: AuthenticationService) {
    }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
        return this.authService.hasCookies().pipe(
            map(cookie => {
                if (!cookie) {
                    this.router.navigate(['login'], {queryParams: {url: state.url}});
                    return false;
                }
                this.authService.isLogin = true;
                return true;
            }));
    }
}
