import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store, select } from '@ngrx/store';
import * as fromSelectors from '@app/store/selectors';
import { ToolsSettings } from '@app/models/tools-settings.model';
import { FormToolEnum } from '@app/models/enums/tool-form';
import { UpdatedToolsSettings } from '@app/store/actions/settings.actions';
import { ButtonType } from '../button/button.component';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-tools-toolbox',
  templateUrl: './tools-toolbox.component.html',
  styleUrls: ['./tools-toolbox.component.scss'],
})
export class ToolsToolboxComponent implements OnInit, OnDestroy {
  ToolForm = FormToolEnum;
  ButtonType = ButtonType;

  private destroy$ = new Subject();

  toolsSettings: ToolsSettings = null;

  constructor(private store: Store) {}

  ngOnInit(): void {
    const toolsSettings$ = this.store.pipe(select(fromSelectors.getToolsSettings), takeUntil(this.destroy$));
    toolsSettings$.subscribe((toolsSettings: ToolsSettings) => {
      this.toolsSettings = toolsSettings;
    });
  }

  toggleProximalDistance() {
    this.updateToolsSettingsWithPatch({ proximalDistance: !this.toolsSettings.proximalDistance });
  }

  toggleOcclusalDistance() {
    this.updateToolsSettingsWithPatch({ occlusalDistance: !this.toolsSettings.occlusalDistance });
  }

  toggleMinimalThickness() {
    this.updateToolsSettingsWithPatch({ minimalThickness: !this.toolsSettings.minimalThickness });
  }

  updateForm(value) {
    if (this.toolsSettings.form === value) {
      this.updateToolsSettingsWithPatch({ form: FormToolEnum.NONE });
    } else {
      this.updateToolsSettingsWithPatch({ form: value });
    }
  }

  updateToolRadius(value) {
    this.updateToolsSettingsWithPatch({ toolRadius: value });
  }

  updateToolsSettingsWithPatch(toolsSettings: Partial<ToolsSettings>) {
    this.store.dispatch(
      new UpdatedToolsSettings({
        toolsSettings: {
          ...new ToolsSettings(),
          ...toolsSettings,
        },
      })
    );
  }

  ngOnDestroy() {
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }
}
