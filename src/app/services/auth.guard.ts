import { forwardRef, Inject, Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';

import { Observable } from 'rxjs/Observable';

import { AuthenticationService } from './authentication.service';

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(private router: Router,
                @Inject(forwardRef(() => AuthenticationService))
                private authService: AuthenticationService) {
    }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
        return this.authService.checkConnection()
            .map(isLogin => {
                if (!isLogin) {
                    this.router.navigate(['login'], {queryParams: {url: state.url}});
                    return false;
                }
                return true;
            });
    }
}
