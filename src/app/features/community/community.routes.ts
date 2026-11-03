import { Routes } from '@angular/router';

import { CommunityCreatePage } from './pages/community-create/community-create.page';
import { CommunityDetailPage } from './pages/community-detail/community-detail.page';
import { CommunityListPage } from './pages/community-list/community-list.page';

export const COMMUNITY_ROUTES: Routes = [
  {
    path: '',
    component: CommunityListPage,
  },
  {
    path: 'new',
    component: CommunityCreatePage,
  },
  {
    path: ':slug',
    component: CommunityDetailPage,
  },
];
