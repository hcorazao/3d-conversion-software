import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { newsList } from './news-modal.constants';
import { NewsItem } from './news-modal.types';

export const newsModalConfig = {
  height: '704px',
  width: '600px',
  panelClass: 'news-modal-box',
  autoFocus: false,
  backdropClass: 'modal-backdrop',
};

@Component({
  selector: 'app-news-modal',
  templateUrl: './news-modal.component.html',
  styleUrls: ['./news-modal.component.scss'],
})
export class NewsModalComponent implements OnInit {
  constructor(public translate: TranslateService) {}

  newsList: NewsItem[] = newsList;

  ngOnInit(): void {}
}
