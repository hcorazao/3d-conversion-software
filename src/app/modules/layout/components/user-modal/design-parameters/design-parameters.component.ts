import { Component, OnInit, OnDestroy } from '@angular/core';
import { Strength } from '@app/models/enums/strength.enum';
import { MatSliderChange } from '@angular/material/slider';
import { DesignParameters } from '@app/models/design-parameters.model';
import { UpdateDesignParameters } from '@app/store/actions/settings.actions';
import { Store, select } from '@ngrx/store';
import * as fromSelectors from '@app/store/selectors';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

const OCCLUSAL_CONTACT_STRENGTH_NAME = 'occlusalContactStrength';
const PROXIMAL_CONTACT_STRENGTH_NAME = 'proximalContactStrength';
const OCCLUSAL_MINIMAL_THICKNESS_NAME = 'occlusalMinimalThickness';
const RADIAL_MINIMAL_THICKNESS_NAME = 'radialMinimalThickness';
const SPACER_STRENGTH_NAME = 'spacerStrength';

const occlusalContactOptions = [
  {
    strength: Strength.light,
    translationPrefix: 'userMenu.designParameters.occlusalContactStrength.options.light.',
  },
  {
    strength: Strength.medium,
    translationPrefix: 'userMenu.designParameters.occlusalContactStrength.options.medium.',
  },
  {
    strength: Strength.heavy,
    translationPrefix: 'userMenu.designParameters.occlusalContactStrength.options.heavy.',
  },
];
const proximalContactOptions = [
  {
    strength: Strength.light,
    translationPrefix: 'userMenu.designParameters.proximalContactStrength.options.light.',
  },
  {
    strength: Strength.medium,
    translationPrefix: 'userMenu.designParameters.proximalContactStrength.options.medium.',
  },
  {
    strength: Strength.heavy,
    translationPrefix: 'userMenu.designParameters.proximalContactStrength.options.heavy.',
  },
];
const spacerOptions = [
  {
    strength: Strength.light,
    translationPrefix: 'userMenu.designParameters.spacers.options.light.',
  },
  {
    strength: Strength.medium,
    translationPrefix: 'userMenu.designParameters.spacers.options.medium.',
  },
  {
    strength: Strength.heavy,
    translationPrefix: 'userMenu.designParameters.spacers.options.heavy.',
  },
];

@Component({
  selector: 'app-design-parameters',
  templateUrl: './design-parameters.component.html',
  styleUrls: ['./design-parameters.component.scss'],
})
export class DesignParametersComponent implements OnInit, OnDestroy {
  Strength = Strength;

  occlusalContactOptions = occlusalContactOptions;
  proximalContactOptions = proximalContactOptions;
  spacerOptions = spacerOptions;

  private destroy$ = new Subject();

  designParameters: DesignParameters;

  constructor(private store: Store) {}

  ngOnInit(): void {
    this.store.pipe(select(fromSelectors.getDesignParameters), takeUntil(this.destroy$)).subscribe((designParameters: DesignParameters) => {
      this.designParameters = designParameters;
    });
  }

  chooseOcclusalContactStrength(strength: Strength) {
    if (this.designParameters.occlusalContactStrength !== strength) {
      this.updateDesignParametersWithPatch({ [OCCLUSAL_CONTACT_STRENGTH_NAME]: strength });
    }
  }

  chooseProximalContactStrength(strength: Strength) {
    if (this.designParameters.proximalContactStrength !== strength) {
      this.updateDesignParametersWithPatch({ [PROXIMAL_CONTACT_STRENGTH_NAME]: strength });
    }
  }

  chooseSpacerStrength(strength: Strength) {
    if (this.designParameters.spacerStrength !== strength) {
      this.updateDesignParametersWithPatch({ [SPACER_STRENGTH_NAME]: strength });
    }
  }

  occlusalMinimalThicknessChanged(change: MatSliderChange) {
    const minimalThickness = change.value;
    if (this.designParameters.occlusalMinimalThickness !== minimalThickness) {
      this.updateDesignParametersWithPatch({ [OCCLUSAL_MINIMAL_THICKNESS_NAME]: minimalThickness });
    }
  }

  radialMinimalThicknessChanged(change: MatSliderChange) {
    const minimalThickness = change.value;
    if (this.designParameters.radialMinimalThickness !== minimalThickness) {
      this.updateDesignParametersWithPatch({ [RADIAL_MINIMAL_THICKNESS_NAME]: minimalThickness });
    }
  }

  updateDesignParametersWithPatch(designParametersPatch: Partial<DesignParameters>) {
    const updateDesignParameters: DesignParameters = {
      ...this.designParameters,
      ...designParametersPatch,
    };
    this.store.dispatch(new UpdateDesignParameters({ designParameters: updateDesignParameters }));
  }

  ngOnDestroy() {
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }
}
