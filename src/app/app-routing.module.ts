import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { LoginComponent } from './login/login.component';
import { BoardListComponent } from './boards/board-list.component';
import { BoardComponent } from './boards/board/board.component';
import { BoardResolver } from './boards/board/board.resolver';
import { ShareComponent } from './share/share.component';
import { ShareCanDeactivateGuard } from './share/share-can-deactivate.guard';

const routes: Routes = [
    {
        path: '',
        children: []
    },
    {
        path: 'login',
        component: LoginComponent
    },
    {
        path: 'list',
        component: BoardListComponent
    },
    {
        path: 'share/:id',
        component: ShareComponent,
        canDeactivate: [ShareCanDeactivateGuard],
        resolve: {
            detail: BoardResolver
        }
    },
    {
        path: 'board/:id',
        component: BoardComponent,
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
