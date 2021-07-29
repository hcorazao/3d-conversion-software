import { EngineService } from './engine/engine.service';
import { Canvas3dComponent } from './components/canvas3d/canvas3d.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Engine3dRoutingModule } from './engine3d-routing.module';

@NgModule({
  declarations: [Canvas3dComponent],
  imports: [CommonModule, Engine3dRoutingModule],
})
export class Engine3dModule {}
