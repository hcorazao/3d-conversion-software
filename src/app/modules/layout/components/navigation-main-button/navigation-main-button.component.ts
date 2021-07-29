import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-navigation-main-button',
  templateUrl: './navigation-main-button.component.html',
  styleUrls: ['./navigation-main-button.component.scss'],
})
export class NavigationMainButtonComponent implements OnInit {
  @Input() imageSource?: string;
  @Input() text?: string;
  @Input() gravatarText?: string;
  @Input() activatedImageSource?: string;
  @Input() hoverImageSource?: string;
  @Input() activated = false;
  @Input() flatRightEdge = false;
  @Input() flatLeftEdge = false;
  @Input() noShadow = false;
  @Input() resizeOnHover = true;
  @Input() dark = false;
  @Input() avatar = false;
  @Input() isInUserbar?: boolean;
  @Output() clicked = new EventEmitter<void>();

  constructor() {}

  ngOnInit(): void {}
}
