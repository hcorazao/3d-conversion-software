import { Injectable, ElementRef } from '@angular/core';
import { Panel } from './panel.model';
import { PositionerState, ScreenSizes } from './positioner-state.model';
import { PANEL_MARGIN, SIDE_MARGIN, TOP_MARGIN, BOTTOM_MARGIN } from './constants';
import { ToolboxesWithSettings } from '@app/models/toolbox-with-settings.model';
import { Store, select } from '@ngrx/store';
import * as fromSelectors from '@app/store/selectors';

@Injectable({
  providedIn: 'root',
})
export class PanelsPositionerService {
  panelsRepositioning = false;

  constructor(private store: Store) {
    this.store
      .pipe(select(fromSelectors.isPanelsRepositioningActive))
      .subscribe((panelsRepositioning) => (this.panelsRepositioning = panelsRepositioning));
  }

  previousPositionerState: PositionerState;

  /**
   * Only externalize function, checks if anything with screen or panels has changed, repositions panels in case of conflicts
   * @param allToolboxesWithSettings array with models representing panel HTML elements with their settings (ie. repositioning information)
   * @param mainElement screen element that contains all the panels
   */
  positionPanels(allToolboxesWithSettings: ToolboxesWithSettings, mainElement: ElementRef<HTMLElement>) {
    const positionerState = this.updatePositionerState(allToolboxesWithSettings, mainElement);
    if (!positionerState.changed) {
      return;
    }

    /**
     * categorize panels
     */
    const initiallyTopLeftPanels = [positionerState.devPanel];
    const initiallyBottomRightPanels = [positionerState.cadAssistantPanel, positionerState.caseObjectsPanel, positionerState.toolsPanel];
    const initiallyAllPanels = [...initiallyTopLeftPanels, ...initiallyBottomRightPanels];

    const initiallyTopLeftVisiblePanels = initiallyTopLeftPanels.filter((panel) => panel.element !== undefined);
    const initiallyBottomRightVisiblePanels = initiallyBottomRightPanels.filter((panel) => panel.element !== undefined);
    const allVisiblePanels = initiallyAllPanels.filter((panel) => panel.element !== undefined);

    const topLeftPanels = initiallyTopLeftVisiblePanels.filter((toolbox) => !toolbox.settings.repositioned);
    const bottomRightPanels = initiallyBottomRightVisiblePanels.filter((toolbox) => !toolbox.settings.repositioned);
    const repositionedVisiblePanels = allVisiblePanels.filter((panel) => panel.settings.repositioned);

    /**
     * initially position panels, without checking conflicts
     */
    this.initiallyPositionTopLeftToolboxes(topLeftPanels, positionerState.screen);
    this.initiallyPositionBottomRightToolboxes(bottomRightPanels, positionerState.screen);
    this.initiallyPositionRepositionedToolboxes(repositionedVisiblePanels, positionerState.screen);

    /**
     * sort panels, check and try to fix collisions
     */
    const allVisiblePanelsSorted = Panel.sortPanelsFromTopRight(allVisiblePanels);
    this.checkAndFixCollisions(allVisiblePanelsSorted, positionerState.screen);

    /**
     * fallback to default positioning if collisions still exist
     */
    if (this.isAnyCollision(allVisiblePanels) && this.isAnyHeaderCollision(allVisiblePanels)) {
      this.initiallyPositionTopLeftToolboxes(initiallyTopLeftVisiblePanels, positionerState.screen);
      this.initiallyPositionBottomRightToolboxes(initiallyBottomRightVisiblePanels, positionerState.screen);
    }

    /**
     * sort panels, add zIndexes, style panels with positioning and z-indexes
     */
    let zIndex = 300;
    Panel.sortPanelsFromTopRight(allVisiblePanels).forEach((panel) => (panel.zIndex = zIndex++));
    positionerState.styleAll();
  }

  private updatePositionerState(allToolboxesWithSettings: ToolboxesWithSettings, mainElement: ElementRef<HTMLElement>): PositionerState {
    const positionerState = PositionerState.createFromMainElementAndPanels(
      mainElement,
      allToolboxesWithSettings,
      this.panelsRepositioning,
      this.previousPositionerState
    );
    if (positionerState.changed) {
      if (this.panelsRepositioning) {
        positionerState.displayChange(this.previousPositionerState);
      }
      this.previousPositionerState = positionerState;
    }
    return positionerState;
  }

  private isAnyCollision(panels: Panel[]): boolean {
    for (let i = 0; i < panels.length; i++) {
      for (let j = i + 1; j < panels.length; j++) {
        if (panels[i].isCollisionWithPanel(panels[j])) {
          return true;
        }
      }
    }
    return false;
  }

  private isAnyHeaderCollision(panels: Panel[]): boolean {
    for (let i = 0; i < panels.length; i++) {
      for (let j = i + 1; j < panels.length; j++) {
        if (panels[i].isHeaderCollisionWithPanel(panels[j])) {
          return true;
        }
      }
    }
  }

  private checkAndFixCollisions(panels: Panel[], screen: ScreenSizes) {
    for (let i = 0; i < panels.length; i++) {
      for (let j = i + 1; j < panels.length; j++) {
        this.checkAndFixCollision(panels[i], panels[j], panels.slice(0, panels.length), screen);
      }
    }
  }

  private checkAndFixCollision(panel1: Panel, panel2: Panel, allPanels: Panel[], screen: ScreenSizes): boolean {
    const collision = panel1.isCollisionWithPanel(panel2);
    if (collision) {
      const otherPanelsIds = allPanels.filter((panel) => panel.id !== panel1.id && panel.id !== panel2.id).map((panel) => panel.id);
      this.fixCollision(panel1, panel2, allPanels, otherPanelsIds, screen);
    }
    return collision;
  }

  /**
   * initially position panels, without checking conflicts
   * @param panel1
   * @param panel2
   * @param allPanels used for checking if panel can be moved without colliding with another panel
   * @param otherMovablePanelsIds if moved panel will collide with another panel it can move if it's id is in this array
   * @param screen used for checking if moved panel will still fit into the screen
   * @returns information if collision was fixed
   */
  private fixCollision(panel1: Panel, panel2: Panel, allPanels: Panel[], otherMovablePanelsIds: number[], screen: ScreenSizes): boolean {
    /**
     * calculating intersection box - information about colliding area
     */
    const intersectionBoxX1 = Math.max(panel1.x1, panel2.x1);
    const intersectionBoxX2 = Math.min(panel1.x2, panel2.x2);
    const intersectionBoxCenterX = intersectionBoxX1 + (intersectionBoxX2 - intersectionBoxX1) / 2;
    const intersectionDeltaX = intersectionBoxX2 - intersectionBoxX1;
    const intersectionBoxY1 = Math.max(panel1.y1, panel2.y1);
    const intersectionBoxY2 = Math.min(panel1.y2, panel2.y2);
    const intersectionBoxCenterY = intersectionBoxY1 + (intersectionBoxY2 - intersectionBoxY1) / 2;
    const intersectionDeltaY = intersectionBoxY2 - intersectionBoxY1;
    const intersectionArea = intersectionDeltaX * intersectionDeltaY;

    /**
     * calculating in which way and how much panels should be moved
     */
    const moveLeft = intersectionDeltaY > intersectionDeltaX && panel1.centerX < intersectionBoxCenterX;
    const moveRight = intersectionDeltaY > intersectionDeltaX && panel1.centerX >= intersectionBoxCenterX;
    const offsetX = intersectionDeltaX * (moveRight ? 1 : moveLeft ? -1 : 0);
    const offsetXStep = offsetX ? offsetX / Math.abs(offsetX) : 0;

    const moveTop = intersectionDeltaX >= intersectionDeltaY && panel1.centerY < intersectionBoxCenterY;
    const moveBottom = intersectionDeltaX >= intersectionDeltaY && panel1.centerY >= intersectionBoxCenterY;
    const offsetY = intersectionDeltaY * (moveBottom ? 1 : moveTop ? -1 : 0);
    const offsetYStep = offsetY ? offsetY / Math.abs(offsetY) : 0;

    /**
     * panels take turns in moving away until they stop colliding or both cannot move anymore
     * the `fits` method is used to check if panel can be moved regarding screen and other panels
     */
    let movePanel1 = true;
    let panel1Movable = true; // panel1.settings.repositioned;
    let panel2Movable = true; // panel2.settings.repositioned;
    while (panel1.isCollisionWithPanel(panel2) && (panel1Movable || panel2Movable)) {
      if (movePanel1) {
        if (this.fits(panel1, panel2, offsetXStep, offsetYStep, screen, allPanels, otherMovablePanelsIds)) {
          panel1.x += offsetXStep;
          panel1.y += offsetYStep;
        } else {
          panel1Movable = false;
        }
      } else {
        if (this.fits(panel2, panel1, -offsetXStep, -offsetYStep, screen, allPanels, otherMovablePanelsIds)) {
          panel2.x -= offsetXStep;
          panel2.y -= offsetYStep;
        } else {
          panel2Movable = false;
        }
      }
      if (panel2Movable && (movePanel1 || !panel1Movable)) {
        movePanel1 = false;
      } else if (panel1Movable && (!movePanel1 || !panel2Movable)) {
        movePanel1 = true;
      } else {
        break;
      }
    }
    return panel1Movable || panel2Movable;
  }

  /**
   * initially position panels, without checking conflicts
   * @param panel1 panel to move
   * @param panel2
   * @param offsetX horizontal offset to move panel1
   * @param offsetY vertical offset to move panel1
   * @param screen used for checking if moved panel will still fit into the screen
   * @param allPanels used for checking if panel can be moved without colliding with another panel
   * @param otherMovablePanelsIds if moved panel will collide with another panel it can move if it's id is in this array
   * @returns information if panel1 can be moved
   */
  private fits(
    panel1: Panel,
    panel2: Panel,
    offsetX: number,
    offsetY: number,
    screen: ScreenSizes,
    allPanels: Panel[],
    otherMovablePanelsIds: number[]
  ): boolean {
    /**
     * filters movable and unmovable panels
     */
    const otherPanels = allPanels.filter((otherPanel) => otherPanel.id !== panel1.id && otherPanel.id !== panel2.id);
    const otherMovablePanels = otherPanels.filter((panel) => otherMovablePanelsIds.indexOf(panel.id) !== -1);
    const otherUnmovablePanels = otherPanels.filter((panel) => otherMovablePanelsIds.indexOf(panel.id) === -1);
    /**
     * getting coordinates of panel1 after moving
     */
    const x1 = panel1.x + offsetX;
    const x2 = x1 + panel1.width;
    const y1 = panel1.y + offsetY;
    const y2 = y1 + panel1.height;
    /**
     * checks for any unmovable panels that are colliding with moved panel1
     * collision is worse if panels are colliding with bigger intersection area than before moving panel1
     */
    const worseCollidingUnmovablePanels = otherUnmovablePanels.filter((otherPanel) => {
      const newCollision = y2 > otherPanel.y1 && otherPanel.y2 > y1 && x2 > otherPanel.x1 && otherPanel.x2 > x1;
      if (!newCollision) {
        return false;
      }
      const previousCollision =
        panel1.y2 > otherPanel.y1 && otherPanel.y2 > panel1.y1 && panel1.x2 > otherPanel.x1 && otherPanel.x2 > panel1.x1;
      if (!previousCollision) {
        return true;
      }
      const previousIntersectionDeltaX = Math.min(panel1.x2, otherPanel.x2) - Math.max(panel1.x1, otherPanel.x1);
      const previousIntersectionDeltaY = Math.min(panel1.y2, otherPanel.y2) - Math.max(panel1.y1, otherPanel.y1);
      const previousIntersectionArea = previousIntersectionDeltaX * previousIntersectionDeltaY;
      const newIntersectionDeltaX = Math.min(x2, otherPanel.x2) - Math.max(x1, otherPanel.x1);
      const newIntersectionDeltaY = Math.min(y2, otherPanel.y2) - Math.max(y1, otherPanel.y1);
      const newIntersectionArea = newIntersectionDeltaX * newIntersectionDeltaY;
      return newIntersectionArea > previousIntersectionArea;
    });
    /**
     * panel1 doesn't fit if is outside of screen or has any unmovable panels with worse collision than before moving
     */
    if (
      (offsetX && (x1 < 0 || x2 > screen.width)) ||
      (offsetY && (y1 < 0 || y2 > screen.height)) ||
      worseCollidingUnmovablePanels.length !== 0
    ) {
      return false;
    }
    /**
     * getting movable panels colliding with moved panel1 and trying to fix all those collision
     * colliding panels are treated as unmovable
     */
    const collidingMovablePanels = otherMovablePanels.filter(
      (otherPanel) => y2 > otherPanel.y1 && otherPanel.y2 > y1 && x2 > otherPanel.x1 && otherPanel.x2 > x1
    );
    /**
     * moving panel1 and trying to fix all those collision
     * colliding panel is treated as unmovable during that fix
     * panel1 is moved back, but if there are no collisions then it will be moved again by the caller
     */
    panel1.x += offsetX;
    panel1.y += offsetY;
    const collisionsAfterFixing = collidingMovablePanels.filter(
      (collidingPanel) =>
        !this.fixCollision(
          panel1,
          collidingPanel,
          allPanels,
          otherMovablePanelsIds.filter((panelId) => panelId !== collidingPanel.id),
          screen
        )
    );
    panel1.x -= offsetX;
    panel1.y -= offsetY;

    return collisionsAfterFixing.length === 0;
  }

  /**
   * set up x and y of not repositioned top-left panels
   * @param panels all not repositioned top-left panels
   * @param screen
   */
  private initiallyPositionTopLeftToolboxes(panels: Panel[], screen: ScreenSizes) {
    let offsetY = 0;
    let offsetX = 0;
    panels.forEach((panel) => {
      if (offsetY + panel.height > screen.height && offsetY > 0) {
        offsetY = 0;
        offsetX += panel.width;
      }
      panel.x = offsetX;
      panel.y = offsetY;
      offsetY += panel.height;
    });
  }

  /**
   * set up x and y of not repositioned bottom-right panels
   * @param panels all not repositioned bottom-right panels
   * @param screen
   */
  private initiallyPositionBottomRightToolboxes(panels: Panel[], screen: ScreenSizes) {
    let offsetY = 0;
    let offsetX = 0;
    panels.forEach((panel) => {
      const elementHeight = panel.height;
      if (offsetY + elementHeight > screen.height && offsetY > 0) {
        offsetY = 0;
        offsetX += panel.width;
      }
      panel.x = screen.width - offsetX - panel.width;
      panel.y = screen.height - offsetY - panel.height;
      offsetY += elementHeight;
    });
  }

  /**
   * set up x and y of repositioned panels to match their draggedX, draggedY and screen sizes
   * @param panels all repositioned panels
   * @param screen
   */
  private initiallyPositionRepositionedToolboxes(panels: Panel[], screen: ScreenSizes) {
    panels.forEach((panel) => {
      const draggedX = panel.settings.offsetX - SIDE_MARGIN - PANEL_MARGIN;
      const draggedY = panel.settings.offsetY - PANEL_MARGIN - (panel.settings.topHalf ? TOP_MARGIN : BOTTOM_MARGIN);
      if (panel.settings.leftHalf) {
        if (draggedX + panel.width <= screen.width) {
          panel.x = draggedX;
        } else {
          panel.x = screen.width - panel.width;
        }
      } else {
        if (draggedX + panel.width <= screen.width) {
          panel.x = screen.width - draggedX - panel.width;
        } else {
          panel.x = 0;
        }
      }
      if (panel.settings.topHalf) {
        if (draggedY + panel.height <= screen.height) {
          panel.y = draggedY;
        } else {
          panel.y = screen.height - panel.height;
        }
      } else {
        if (draggedY + panel.height <= screen.height) {
          panel.y = screen.height - draggedY - panel.height;
        } else {
          panel.y = 0;
        }
      }
    });
  }
}

export class PanelBox {
  constructor(
    public id: number,
    public x: number,
    public y: number,
    public width: number,
    public height: number,
    public movable: boolean
  ) {}
}
