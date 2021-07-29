import { Component, Input, OnInit } from '@angular/core';
import { BrowserService } from '../../../services/utils/browser.service';

@Component({
  selector: 'app-keyboard-shortcut-description',
  templateUrl: './keyboard-shortcut-description.component.html',
  styleUrls: ['./keyboard-shortcut-description.component.scss'],
})
export class KeyboardShortcutDescriptionComponent implements OnInit {
  @Input() shortcutKey: string;
  @Input() description: string;

  isHardwareApple = this.browserService.checkIfHardwareApple();

  constructor(private browserService: BrowserService) {}

  ngOnInit(): void {}
}
