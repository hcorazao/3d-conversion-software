import { AdvancedDynamicTexture, Button, Control } from '@babylonjs/gui';
import { of } from 'rxjs';

/**
 * GUI is an utility module that allows to draw buttons and text with their callback in a simple way.
 */

export class GUI {
  static buttonCounters = 0;
  /**
   * Creates a Gui Texture
   */
  public static createGUI() {
    return AdvancedDynamicTexture.CreateFullscreenUI('UI');
  }

  /**
   * Creates new buttons
   * @param guiTexture No idea
   * @param btnName The unique internal button name
   * @param btnText The display text of the button
   * @param btnClicked The button event handler
   */
  public static createButton(
    guiTexture: AdvancedDynamicTexture,
    btnName: string,
    btnText: string,
    btnClicked: (button: Button, counter?) => void
  ) {
    let counter = 0;
    const btnTest = Button.CreateSimpleButton(btnName, btnText);
    btnTest.width = '150px';
    btnTest.height = '40px';
    btnTest.color = 'white';
    btnTest.background = 'grey';

    btnTest.onPointerUpObservable.add(() => {
      if (btnClicked) {
        btnClicked(btnTest, counter++);
      }
    });
    btnTest.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    btnTest.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
    btnTest.left = 12;
    btnTest.top = this.buttonCounters++ * 50 + 10;

    guiTexture.addControl(btnTest);
  }

  /**
   * Creates a File input for a single File
   * @param guiTexture
   * @param btnText
   * @param btnClicked
   */
  public static createFileInput(guiTexture: AdvancedDynamicTexture, btnName: string, btnText: string, btnClicked: (event) => void) {
    const hiddenInput = document.createElement('input');
    hiddenInput.setAttribute('type', 'file');
    hiddenInput.style.display = 'none';

    function handleFiles(files) {
      if (btnClicked) {
        btnClicked(files.target.files[0]);
      }
    }

    hiddenInput.addEventListener('change', handleFiles, false);

    const btnTest = Button.CreateSimpleButton(btnName, btnText);
    btnTest.width = '150px';
    btnTest.height = '40px';
    btnTest.color = 'white';
    btnTest.background = 'grey';

    btnTest.onPointerUpObservable.add(() => {
      if (btnClicked) {
        hiddenInput.click();
      }
    });
    btnTest.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    btnTest.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
    btnTest.left = 12;
    btnTest.top = this.buttonCounters++ * 50 + 10;

    guiTexture.addControl(btnTest);
  }

  /**
   * Creates a File input for a folder
   * @param guiTexture
   * @param btnText
   * @param btnClicked
   */
  public static createFolderInput(guiTexture: AdvancedDynamicTexture, btnName: string, btnText: string, callback: (event) => void) {
    const hiddenInput = document.createElement('input');
    hiddenInput.setAttribute('type', 'file');
    hiddenInput.style.display = 'none';
    // hiddenInput.multiple = true;
    // tslint:disable-next-line: no-string-literal
    hiddenInput['webkitdirectory'] = true;
    // tslint:disable-next-line: no-string-literal
    hiddenInput['directory'] = true;
    document.body.append(hiddenInput);

    function handleFiles(event) {
      callback(event.target.files);
    }

    hiddenInput.addEventListener('change', handleFiles, false);

    const btnTest = Button.CreateSimpleButton(btnName, btnText);
    btnTest.width = '150px';
    btnTest.height = '40px';
    btnTest.color = 'white';
    btnTest.background = 'grey';

    btnTest.onPointerUpObservable.add(() => {
      hiddenInput.click();
    });

    btnTest.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    btnTest.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
    btnTest.left = 12;
    btnTest.top = this.buttonCounters++ * 50 + 10;

    guiTexture.addControl(btnTest);
  }
}
