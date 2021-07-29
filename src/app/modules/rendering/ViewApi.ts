import { AppFacadeApi } from '@app/facade/app-facade-api';
/**
 * ViewAPI defines the output of the babylonjs component to communicate with the other angular componenets
 *
 * This class uses the singleton pattern.
 */

export default class ViewAPI {
  private static instance: ViewAPI;
  public API: AppFacadeApi;

  constructor() {}

  static getInstance(): ViewAPI {
    if (!ViewAPI.instance) {
      ViewAPI.instance = new ViewAPI();
    }
    return ViewAPI.instance;
  }

  setExternalAPI(externalAPI) {
    this.API = externalAPI;
  }
}
