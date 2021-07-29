import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule } from '@angular/material/dialog';

import { ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { SwitchComponent } from './components/switch/switch.component';

@NgModule({
  declarations: [SwitchComponent, SwitchComponent],
  exports: [TranslateModule, SwitchComponent],
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule],
})
export class SharedModule {}
