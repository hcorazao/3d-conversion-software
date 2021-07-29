import ViewAPI from '@app/modules/rendering/ViewApi';

export default class UndoRedo {
  protected undoStack: Array<any>;
  protected redoStack: Array<any>;

  constructor() {
    this.undoStack = new Array<any>();
    this.redoStack = new Array<any>();
  }

  /**
   * Adds an item which should be undoable/redoable. The function also handles the necessary calls
   * to Angular to enable/disable the undo/redo buttons.
   * @param item the item which should be undoable/redoable
   */
  add(item) {
    // clear redo stack and disable redo button
    this.redoStack.length = 0;
    ViewAPI.getInstance().API.setRedoButtonEnability(false);

    // add new item to undo stack
    this.undoStack.push(item);

    // enable undo button if necessary
    if (this.undoStack.length === 2) {
      ViewAPI.getInstance().API.setUndoButtonEnability(true);
    }
  }

  undo(): any {
    if (this.undoStack.length > 1) {
      // remove last item from undo stack
      const u = this.undoStack.pop();

      // push it to redo stack
      this.redoStack.push(u);

      // disable undo button if necessary
      if (this.undoStack.length === 1) {
        ViewAPI.getInstance().API.setUndoButtonEnability(false);
      }

      // enable redo button if necessary
      if (this.redoStack.length === 1) {
        ViewAPI.getInstance().API.setRedoButtonEnability(true);
      }

      // return item
      return this.undoStack[this.undoStack.length - 1];
    }
  }

  redo(): any {
    if (this.redoStack.length > 0) {
      // remove last item from redo stack
      const r = this.redoStack.pop();

      // push it to undo stack
      this.undoStack.push(r);

      // enable undo button if necessary
      if (this.undoStack.length === 2) {
        ViewAPI.getInstance().API.setUndoButtonEnability(true);
      }

      // enable redo button if necessary
      if (this.redoStack.length === 0) {
        ViewAPI.getInstance().API.setRedoButtonEnability(false);
      }

      // return item
      return this.undoStack[this.undoStack.length - 1];
    }
  }

  clear() {
    this.undoStack.length = 0;
    this.redoStack.length = 0;
    ViewAPI.getInstance().API.setUndoButtonEnability(false);
    ViewAPI.getInstance().API.setRedoButtonEnability(false);
  }
}
