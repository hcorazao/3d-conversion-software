import ITransition from './ITransition';
import ITransitionFactory from './ITransitionFactory';
import { TransitionEnum } from './TransitionEnum';
import { AppFacadeApi } from '@app/facade/app-facade-api';
import { StateEnum } from '../states/StateEnum';
import IStateFactory from '../states/IStateFactory';

import AllTrueTransition from './AllTrueTransition';
import EvalToFalseTransition from './EvalToFalseTransition';

// 1 Import
import StartTransition from './1-import/StartTransition';
import Start2PrepImportedTransition from './1-import/Start2PrepImportedTransition';
import PrepImported2EnterMarginTransition from './1-import/PrepImported2EnterMarginTransition';

// 2 Preparation Margin
import Enter2EnteredMarginTransition from './2-preparation-margin/Enter2EnteredMarginTransition';
import Entered2EnterMarginTransition from './2-preparation-margin/Entered2EnterMarginTransition';
import PrepMargin2CreateInsertionAxisTransition from './2-preparation-margin/PrepMargin2CreateInsertionAxisTransition';
import EnterPrepMargin2AppStartedTransition from './2-preparation-margin/EnterPrepMargin2AppStartedTransition';
import PrepMarginEntered2AppStartedTransition from './2-preparation-margin/PrepMarginEntered2AppStartedTransition';
import PrepMargin2InsertionAxisTransition from './2-preparation-margin/PrepMargin2InsertionAxisTransition';
import PrepMargin2CopyLineTransition from './2-preparation-margin/PrepMargin2CopyLineTransition';
import PrepMargin2CopyRestorationTransition from './2-preparation-margin/PrepMargin2CopyRestorationTransition';
import PrepMargin2ExportRestorationTransition from './2-preparation-margin/PrepMargin2ExportRestorationTransition';

// 3 Insertion Axis
import InsertionAxis2CopyLineTransition from './3-insertion-axis/InsertionAxis2CopyLineTransition';
import InsertionAxis2CopyRestorationTransition from './3-insertion-axis/InsertionAxis2CopyRestorationTransition';

// 4 Copy Line
import CopyLine2CreateCopyRestorationTransition from './4-copy-line/CopyLine2CreateCopyRestorationTransition';
import CopyLine2CopyRestorationTransition from './4-copy-line/CopyLine2CopyRestorationTransition';

// 5 Restoration
import Create2CreatedCopyRestorationTransition from './5-copy-restoration/Create2CreatedCopyRestorationTransition';
import Adjust2MesialContactTransition from './5-copy-restoration/Adjust2MesialContactTransition';
import Adjust2DistalContactTransition from './5-copy-restoration/Adjust2DistalContactTransition';
import Adjust2OcclusalContactTransition from './5-copy-restoration/Adjust2OcclusalContactTransition';
// 6 Export

/**
 * Transition factory for creating transitions, implemented as a Singleton.
 */
export default class TransitionFactory implements ITransitionFactory {
  protected static instance: TransitionFactory;
  protected appFacadeApi: AppFacadeApi;
  public stateFactory: IStateFactory;

  protected instances: ITransition[];

  protected constructor(appFacadeApi: AppFacadeApi) {
    this.appFacadeApi = appFacadeApi;
    this.instances = [];
  }

  /**
   * Gets the instance of the TransitionFactory (Singleton)
   * @param appFacadeApi the API to Angular
   * @returns instance of TransitionFactory
   */
  static GetInstance(appFacadeApi: AppFacadeApi): TransitionFactory {
    if (!this.instance) {
      this.instance = new TransitionFactory(appFacadeApi);
    }
    return this.instance;
  }

  isActiveStateLinkedWith(state: StateEnum): { linked: boolean; evaluate: boolean } {
    let linked = false;
    let evaluate = false;
    const transition = this.stateFactory.getActiveState().getTransition(state);

    if (transition) {
      linked = true;
      evaluate = transition.evaluate();
    }

    return { linked, evaluate };
  }

  gotoState(state: StateEnum): boolean {
    const transition = this.stateFactory.getActiveState().getTransition(state);
    if (transition) {
      return transition.execute();
    }
    return undefined;
  }

  getTransition(transition: TransitionEnum): ITransition {
    if (this.instances[transition]) {
      return this.instances[transition];
    }

    switch (transition) {
      // 1 Import
      case TransitionEnum.Start:
        this.instances[transition] = new StartTransition(this.appFacadeApi, this.stateFactory);
        break;
      case TransitionEnum.Start2PrepImported:
        this.instances[transition] = new Start2PrepImportedTransition(this.appFacadeApi, this.stateFactory);
        break;
      case TransitionEnum.PrepImported2EnterMargin:
        this.instances[transition] = new PrepImported2EnterMarginTransition(this.appFacadeApi, this.stateFactory);
        break;

      // 2 Preparation Margin
      case TransitionEnum.Enter2EnteredMargin:
        this.instances[transition] = new Enter2EnteredMarginTransition(this.appFacadeApi, this.stateFactory);
        break;
      case TransitionEnum.Entered2EnterMargin:
        this.instances[transition] = new Entered2EnterMarginTransition(this.appFacadeApi, this.stateFactory);
        break;
      case TransitionEnum.PrepMargin2CreateInsertionAxis:
        this.instances[transition] = new PrepMargin2CreateInsertionAxisTransition(this.appFacadeApi, this.stateFactory);
        break;
      case TransitionEnum.EnterPrepMargin2AppStarted:
        this.instances[transition] = new EnterPrepMargin2AppStartedTransition(this.appFacadeApi, this.stateFactory);
        break;
      case TransitionEnum.PrepMarginEntered2AppStarted:
        this.instances[transition] = new PrepMarginEntered2AppStartedTransition(this.appFacadeApi, this.stateFactory);
        break;
      case TransitionEnum.PrepMargin2InsertionAxis:
        this.instances[transition] = new PrepMargin2InsertionAxisTransition(this.appFacadeApi, this.stateFactory);
        break;
      case TransitionEnum.PrepMargin2CopyLine:
        this.instances[transition] = new PrepMargin2CopyLineTransition(this.appFacadeApi, this.stateFactory);
        break;
      case TransitionEnum.PrepMargin2CopyRestoration:
        this.instances[transition] = new PrepMargin2CopyRestorationTransition(this.appFacadeApi, this.stateFactory);
        break;
      case TransitionEnum.PrepMargin2ExportRestoration:
        this.instances[transition] = new PrepMargin2ExportRestorationTransition(this.appFacadeApi, this.stateFactory);
        break;

      // 3 Insertion Axis
      case TransitionEnum.Create2CreatedInsertionAxis:
        this.instances[transition] = new AllTrueTransition(
          TransitionEnum.Create2CreatedInsertionAxis,
          StateEnum.CreateInsertionAxis,
          StateEnum.InsertionAxisCreated,
          this.appFacadeApi,
          this.stateFactory
        );
        break;
      case TransitionEnum.InsertionAxis2CreateCopyLine:
        this.instances[transition] = new AllTrueTransition(
          TransitionEnum.InsertionAxis2CreateCopyLine,
          StateEnum.InsertionAxisCreated,
          StateEnum.CreateCopyLine,
          this.appFacadeApi,
          this.stateFactory
        );
        break;
      case TransitionEnum.InsertionAxis2AppStarted:
        this.instances[transition] = new AllTrueTransition(
          TransitionEnum.InsertionAxis2AppStarted,
          StateEnum.InsertionAxisCreated,
          StateEnum.AppStarted,
          this.appFacadeApi,
          this.stateFactory
        );
        break;
      case TransitionEnum.InsertionAxis2PrepMargin:
        this.instances[transition] = new AllTrueTransition(
          TransitionEnum.InsertionAxis2PrepMargin,
          StateEnum.InsertionAxisCreated,
          StateEnum.PreparationMarginEntered,
          this.appFacadeApi,
          this.stateFactory
        );
        break;
      case TransitionEnum.InsertionAxis2CopyLine:
        this.instances[transition] = new InsertionAxis2CopyLineTransition(this.appFacadeApi, this.stateFactory);
        break;
      case TransitionEnum.InsertionAxis2CopyRestoration:
        this.instances[transition] = new InsertionAxis2CopyRestorationTransition(this.appFacadeApi, this.stateFactory);
        break;
      case TransitionEnum.InsertionAxis2ExportRestoration:
        this.instances[transition] = new EvalToFalseTransition(
          TransitionEnum.InsertionAxis2ExportRestoration,
          StateEnum.InsertionAxisCreated,
          StateEnum.ExportRestoration,
          this.appFacadeApi,
          this.stateFactory
        );
        break;

      // 4 Copy Line
      case TransitionEnum.Create2CreatedCopyLine:
        this.instances[transition] = new AllTrueTransition(
          TransitionEnum.Create2CreatedCopyLine,
          StateEnum.CreateCopyLine,
          StateEnum.CopyLineCreated,
          this.appFacadeApi,
          this.stateFactory
        );
        break;
      case TransitionEnum.CopyLine2CreateCopyRestoration:
        this.instances[transition] = new CopyLine2CreateCopyRestorationTransition(this.appFacadeApi, this.stateFactory);
        break;
      case TransitionEnum.CopyLine2AppStarted:
        this.instances[transition] = new AllTrueTransition(
          TransitionEnum.CopyLine2AppStarted,
          StateEnum.CopyLineCreated,
          StateEnum.AppStarted,
          this.appFacadeApi,
          this.stateFactory
        );
        break;
      case TransitionEnum.CopyLine2PrepMargin:
        this.instances[transition] = new AllTrueTransition(
          TransitionEnum.CopyLine2PrepMargin,
          StateEnum.CopyLineCreated,
          StateEnum.PreparationMarginEntered,
          this.appFacadeApi,
          this.stateFactory
        );
        break;
      case TransitionEnum.CopyLine2InsertionAxis:
        this.instances[transition] = new AllTrueTransition(
          TransitionEnum.CopyLine2InsertionAxis,
          StateEnum.CopyLineCreated,
          StateEnum.InsertionAxisCreated,
          this.appFacadeApi,
          this.stateFactory
        );
        break;
      case TransitionEnum.CopyLine2CopyRestoration:
        this.instances[transition] = new CopyLine2CopyRestorationTransition(this.appFacadeApi, this.stateFactory);
        break;
      case TransitionEnum.CopyLine2ExportRestoration:
        this.instances[transition] = new EvalToFalseTransition(
          TransitionEnum.CopyLine2ExportRestoration,
          StateEnum.CopyLineCreated,
          StateEnum.ExportRestoration,
          this.appFacadeApi,
          this.stateFactory
        );
        break;

      // 5 Copy Restoration
      case TransitionEnum.Create2CreatedCopyRestoration:
        this.instances[transition] = new Create2CreatedCopyRestorationTransition(this.appFacadeApi, this.stateFactory);
        break;
      case TransitionEnum.Adjust2MesialContact:
        this.instances[transition] = new Adjust2MesialContactTransition(this.appFacadeApi, this.stateFactory);
        break;
      case TransitionEnum.Adjust2DistalContact:
        this.instances[transition] = new Adjust2DistalContactTransition(this.appFacadeApi, this.stateFactory);
        break;
      case TransitionEnum.Adjust2OcclusalContact:
        this.instances[transition] = new Adjust2OcclusalContactTransition(this.appFacadeApi, this.stateFactory);
        break;
      case TransitionEnum.CopyRestoration2AppStarted:
        this.instances[transition] = new AllTrueTransition(
          TransitionEnum.CopyRestoration2AppStarted,
          StateEnum.CopyRestorationCreated,
          StateEnum.AppStarted,
          this.appFacadeApi,
          this.stateFactory
        );
        break;
      case TransitionEnum.CopyRestoration2PrepMargin:
        this.instances[transition] = new AllTrueTransition(
          TransitionEnum.CopyRestoration2PrepMargin,
          StateEnum.CopyRestorationCreated,
          StateEnum.PreparationMarginEntered,
          this.appFacadeApi,
          this.stateFactory
        );
        break;
      case TransitionEnum.CopyRestoration2InsertionAxis:
        this.instances[transition] = new AllTrueTransition(
          TransitionEnum.CopyRestoration2InsertionAxis,
          StateEnum.CopyRestorationCreated,
          StateEnum.InsertionAxisCreated,
          this.appFacadeApi,
          this.stateFactory
        );
        break;
      case TransitionEnum.CopyRestoration2CopyLine:
        this.instances[transition] = new AllTrueTransition(
          TransitionEnum.CopyRestoration2CopyLine,
          StateEnum.CopyRestorationCreated,
          StateEnum.CopyLineCreated,
          this.appFacadeApi,
          this.stateFactory
        );
        break;
      case TransitionEnum.CopyRestoration2ExportRestoration:
        this.instances[transition] = new AllTrueTransition(
          TransitionEnum.CopyRestoration2ExportRestoration,
          StateEnum.CopyRestorationCreated,
          StateEnum.ExportRestoration,
          this.appFacadeApi,
          this.stateFactory
        );
        break;

      default:
        console.warn('No transition found!');
    }
    return this.instances[transition];
  }
}
