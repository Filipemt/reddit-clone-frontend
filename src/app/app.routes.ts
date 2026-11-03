import { Routes } from '@angular/router';

import { authGuard } from './core/auth/auth.guard';
import { Shell } from './core/layout/shell';
import { HomePage } from './features/home/pages/home.page';

export const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then((m) => m.AUTH_ROUTES),
  },
  {
    path: '',
    component: Shell,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        component: HomePage,
      },
      {
        path: 'users',
        loadChildren: () => import('./features/user/user.routes').then((m) => m.USER_ROUTES),
      },
      {
        path: 'communities',
        loadChildren: () =>
          import('./features/community/community.routes').then((m) => m.COMMUNITY_ROUTES),
      },
      {
        path: 'posts',
        loadChildren: () => import('./features/post/post.routes').then((m) => m.POST_ROUTES),
      },
      {
        path: 'comments',
        loadChildren: () =>
          import('./features/comment/comment.routes').then((m) => m.COMMENT_ROUTES),
      },
      {
        path: 'votes',
        loadChildren: () => import('./features/vote/vote.routes').then((m) => m.VOTE_ROUTES),
      },
      {
        path: 'search',
        loadChildren: () => import('./features/search/search.routes').then((m) => m.SEARCH_ROUTES),
      },
      {
        path: 'notifications',
        loadChildren: () =>
          import('./features/notification/notification.routes').then((m) => m.NOTIFICATION_ROUTES),
      },
    ],
  },
  {
    path: '**',
    redirectTo: '',
  },
];
