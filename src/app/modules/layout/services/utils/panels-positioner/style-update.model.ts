export class StyleUpdate {
  display: string;
  opacity: string;
  top: string;
  right: string;
  bottom: string;
  left: string;
  zIndex: string;
  static builder(): StyleUpdateBuilder {
    return new StyleUpdateBuilder();
  }
}

export class StyleUpdateBuilder {
  styleUpdate: StyleUpdate;

  constructor() {
    this.styleUpdate = new StyleUpdate();
  }

  withDisplay(display: string): StyleUpdateBuilder {
    this.styleUpdate.display = display;
    return this;
  }
  withOpacity(opacity: string): StyleUpdateBuilder {
    this.styleUpdate.opacity = opacity;
    return this;
  }
  withTop(top: string): StyleUpdateBuilder {
    this.styleUpdate.top = top;
    return this;
  }
  withRight(right: string): StyleUpdateBuilder {
    this.styleUpdate.right = right;
    return this;
  }
  withBottom(bottom: string): StyleUpdateBuilder {
    this.styleUpdate.bottom = bottom;
    return this;
  }
  withLeft(left: string): StyleUpdateBuilder {
    this.styleUpdate.left = left;
    return this;
  }
  withZIndex(zIndex: string): StyleUpdateBuilder {
    this.styleUpdate.zIndex = zIndex;
    return this;
  }

  build() {
    return this.styleUpdate;
  }
}
