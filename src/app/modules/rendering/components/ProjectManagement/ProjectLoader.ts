import MeditLoader from './../VendorLoaders/MeditLoader';
import AbstractLoader from './../VendorLoaders/AbstractLoader';
import ProjectManager from './ProjectManager';

/**
 * ProjectLoader is the class that coordinate the loading process
 * it works on two steps : detect the type of project that's being loaded, and load the information depending on the project type
 *
 */

export default class ProjectLoader {
  private projectInfo: object;
  private vendor: number;

  constructor() {
    //
  }

  loadProject(listOf3DModels, listOfXML, projectObject): void {
    // first we recognize the vender or we create the appropiate loader
    this.getVendorLoader(
      listOf3DModels,
      listOfXML,
      ((vendorLoader) => {
        // then we load the files using that loader
        vendorLoader.loadFromFiles(listOf3DModels, listOfXML, projectObject);
      }).bind(this)
    );
  }

  loadFromFileArray(array: Array<File>, projectObject) {
    const listOf3DModels = [];
    const listOfXML = [];

    // for (let i = 0; i < array.length; i++) {
    for (const element of array) {
      if (element.name.endsWith('xml') || element.name.toLowerCase().endsWith('dentalproject')) {
        listOfXML.push(element);
      }
      if (element.name.endsWith('stl') || element.name.endsWith('obj') || element.name.endsWith('ply')) {
        listOf3DModels.push(element);
      }
    }

    if (listOf3DModels.length === 0) {
      throw new Error('project is not valid : no OBJ incluided');
    }

    // if (listOfXML.length === 0) {
    //   throw new Error('project is not valid : no project information incluided');
    // }

    this.loadProject(listOf3DModels, listOfXML, projectObject);
  }

  getVendorLoader(listOf3DModels, listOfXML, callback): void {
    // we only test for medit for now
    this.vendor = 1;
    callback(new MeditLoader());
    /*
    listOf3DModels[0].text().then((str) => {
      if (str.split('\n')[0].trim() === '#<MEDIT>') {
        console.log('USING MEDIT');
        callback(new MeditLoader());
      }
    });
    */
  }
}
