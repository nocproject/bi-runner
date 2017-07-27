import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { LoginComponent } from './login/login.component';
import { BoardListComponent } from './boards/board-list.component';
import { BoardComponent } from './boards/board/board.component';
import { BoardResolver } from './boards/board/board.resolver';
import { ShareComponent } from './share/share.component';
import { ShareCanDeactivateGuard } from './share/share-can-deactivate.guard';
import { AuthGuard } from './api/auth.guard';

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
