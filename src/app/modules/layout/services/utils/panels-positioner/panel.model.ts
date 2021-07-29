import { ToolboxSettings } from '@app/models/toolbox-settings.model';
import { StyleUpdate } from './style-update.model';
import { PANEL_MARGIN, SIDE_MARGIN, TOP_MARGIN, PANEL_HEADER_MAX_HEIGHT } from './constants';
import { ToolboxElementAndSettings } from '@app/models/toolbox-with-settings.model';

const SIZE_CHANGE_PIXEL_ROUNDING_ERROR_MARGIN = 1;

export class Panel {
  id: number;
  element: HTMLElement;
  changed: boolean;
  height: number;
  width: number;
  x: number;
  y: number;
  get x1(): number {
    return this.x;
  }
  get y1(): number {
    return this.y;
  }
  get x2(): number {
    return this.x + this.width;
  }
  get y2(): number {
    return this.y + this.height;
  }
  get centerX(): number {
    return this.x1 + (this.x2 - this.x1) / 2;
  }
  get centerY(): number {
    return this.y1 + (this.y2 - this.y1) / 2;
  }

  zIndex: number;
  settings: ToolboxSettings;

  static create(id: number, panelWithElement: ToolboxElementAndSettings, comparisonPanel: Panel | null): Panel {
    const result = new Panel();
    result.id = id;
    result.element = panelWithElement.element;
    result.height = panelWithElement.element?.offsetHeight + 2 * PANEL_MARGIN;
    result.width = panelWithElement.element?.offsetWidth + 2 * PANEL_MARGIN;
    result.x = undefined;
    result.y = undefined;
    result.settings = panelWithElement.settings;
    result.changed =
      !comparisonPanel ||
      Math.abs(result.height - comparisonPanel.height) > SIZE_CHANGE_PIXEL_ROUNDING_ERROR_MARGIN ||
      Math.abs(result.width - comparisonPanel.width) > SIZE_CHANGE_PIXEL_ROUNDING_ERROR_MARGIN ||
      JSON.stringify(result.settings) !== JSON.stringify(comparisonPanel.settings);
    return result;
  }

  private static updateElementStyle(element: HTMLElement, update: StyleUpdate): string {
    let newStyle = '';
    newStyle += Panel.updateElementStyleFragment('display', element.style.display, update.display);
    newStyle += Panel.updateElementStyleFragment('opacity', element.style.opacity, update.opacity);
    newStyle += Panel.updateElementStyleFragment('top', element.style.top, update.top);
    newStyle += Panel.updateElementStyleFragment('right', element.style.right, update.right);
    newStyle += Panel.updateElementStyleFragment('bottom', element.style.bottom, update.bottom);
    newStyle += Panel.updateElementStyleFragment('left', element.style.left, update.left);
    newStyle += Panel.updateElementStyleFragment('z-index', element.style.zIndex, update.zIndex);
    return newStyle;
  }

  private static updateElementStyleFragment(label, previousValue, newValue): string {
    if (newValue === null || (newValue === undefined && previousValue === '')) {
      return '';
    } else if (newValue === undefined && previousValue !== '') {
      return `${label}: ${previousValue};`;
    } else {
      return `${label}: ${newValue};`;
    }
  }

  public static sortPanelsFromTopRight(panels: Panel[]): Panel[] {
    return panels.sort((panel1: Panel, panel2: Panel) => {
      const deltaX = panel2.x1 - panel1.x1;
      const deltaY = panel2.y1 - panel1.y1;
      return deltaY < 0 || (deltaY === 0 && deltaX < 0) ? 1 : -1;
    });
  }

  getChange(comparisonPanel: Panel): string {
    if (!comparisonPanel) {
      return `previous panel was empty`;
    }
    const changes = [];
    if (this.height !== comparisonPanel.height) {
      changes.push(`height changed ${comparisonPanel.height}->${this.height}`);
    }
    if (this.width !== comparisonPanel.width) {
      changes.push(`width changed ${comparisonPanel.width}->${this.width}`);
    }
    if (JSON.stringify(this.settings) !== JSON.stringify(comparisonPanel.settings)) {
      changes.push(`settings changed ${JSON.stringify(comparisonPanel.settings)}->${JSON.stringify(this.settings)}`);
    }
    return changes.join(', ');
  }

  getStyle(): string {
    return Panel.updateElementStyle(
      this.element,
      StyleUpdate.builder()
        .withLeft(`${Math.floor(SIDE_MARGIN + PANEL_MARGIN + this.x)}px`)
        .withTop(`${Math.floor(TOP_MARGIN + PANEL_MARGIN + this.y)}px`)
        .withRight(null)
        .withBottom(null)
        .withZIndex(`${this.zIndex}`)
        .build()
    );
  }

  isCollisionWithPanel(panel: Panel) {
    return this.y2 > panel.y1 && panel.y2 > this.y1 && this.x2 > panel.x1 && panel.x2 > this.x1;
  }

  isHeaderCollisionWithPanel(panel: Panel) {
    return (
      this.y1 + PANEL_HEADER_MAX_HEIGHT > panel.y1 &&
      panel.y1 + PANEL_HEADER_MAX_HEIGHT > this.y1 &&
      this.x2 > panel.x1 &&
      panel.x2 > this.x1
    );
  }
}
