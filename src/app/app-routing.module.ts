import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AuthGuard, BoardService } from './services';

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
            detail: BoardService
        }
    },
    {
        path: 'board/:id',
        component: BoardComponent,
        canActivate: [AuthGuard],
        resolve: {
            detail: BoardService
        }
    }
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule {
}
