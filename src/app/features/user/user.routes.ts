import { Routes } from '@angular/router';

import { ProfilePage } from './pages/profile/profile.page';

export const USER_ROUTES: Routes = [
  {
    path: '',
    component: ProfilePage,
  },
  {
    path: ':userId',
    component: ProfilePage,
  },
];
