import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

export const aboutModalConfig = {
  height: 'auto',
  width: '330px',
  panelClass: 'about-modal-box',
  autoFocus: false,
  backdropClass: 'modal-backdrop',
};

@Component({
  selector: 'app-about-modal',
  templateUrl: './about-modal.component.html',
  styleUrls: ['./about-modal.component.scss'],
})
export class AboutModalComponent implements OnInit {
  constructor(public translate: TranslateService) {}

  copyrightDate = new Date().getFullYear();

  ngOnInit(): void {}
}
