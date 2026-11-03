import { Component, input, output } from '@angular/core';

export type PostSort = 'new' | 'hot' | 'top';

@Component({
  selector: 'app-post-sort-tabs',
  templateUrl: './post-sort-tabs.html',
  styleUrl: './post-sort-tabs.scss',
})
export class PostSortTabs {
  readonly sort = input.required<PostSort>();
  readonly sortChange = output<PostSort>();

  protected readonly options: { value: PostSort; label: string }[] = [
    { value: 'new', label: 'New' },
    { value: 'hot', label: 'Hot' },
    { value: 'top', label: 'Top' },
  ];
}
