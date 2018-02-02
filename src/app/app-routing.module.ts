import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AuthGuard } from './services';
import { BoardResolver } from './board/services';

import { BoardComponent } from './board';
import { LoginComponent } from './login/login.component';
import { ShareComponent } from './share/share.component';
import { ShareCanDeactivateGuard } from './share/share-can-deactivate.guard';
import { BoardListComponent } from './board-list/board-list.component';

const routes: Routes = [
    {
        path: '',
        canActivate: [AuthGuard],
        children: []
    },
    {
        path: 'login',
        component: LoginComponent
    },
    {
        path: 'list',
        component: BoardListComponent,
        canActivate: [AuthGuard]
    },
    {
        path: 'share/:id',
        component: ShareComponent,
        canDeactivate: [ShareCanDeactivateGuard],
        canActivate: [AuthGuard],
        resolve: {
            detail: BoardResolver
        }
    },
    {
        path: 'board/:id',
        component: BoardComponent,
        canActivate: [AuthGuard],
        resolve: {
            detail: BoardResolver
        }
    }
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule {
}
