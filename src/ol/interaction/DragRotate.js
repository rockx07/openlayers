/**
 * @module ol/interaction/DragRotate
 */
import {disable} from '../rotationconstraint.js';
import ViewHint from '../ViewHint.js';
import {altShiftKeysOnly, mouseOnly, mouseActionButton} from '../events/condition.js';
import {FALSE} from '../functions.js';
import {rotate, rotateWithoutConstraints} from './Interaction.js';
import PointerInteraction from './Pointer.js';


/**
 * @typedef {Object} Options
 * @property {import("../events/condition.js").Condition} [condition] A function that takes an
 * {@link module:ol/MapBrowserEvent~MapBrowserEvent} and returns a boolean
 * to indicate whether that event should be handled.
 * Default is {@link module:ol/events/condition~altShiftKeysOnly}.
 * @property {number} [duration=250] Animation duration in milliseconds.
 */


/**
 * @classdesc
 * Allows the user to rotate the map by clicking and dragging on the map,
 * normally combined with an {@link module:ol/events/condition} that limits
 * it to when the alt and shift keys are held down.
 *
 * This interaction is only supported for mouse devices.
 * @api
 */
class DragRotate extends PointerInteraction {

  /**
   * @param {Options=} opt_options Options.
   */
  constructor(opt_options) {

    const options = opt_options ? opt_options : {};

    super({
      stopDown: FALSE
    });

    /**
     * @private
     * @type {import("../events/condition.js").Condition}
     */
    this.condition_ = options.condition ? options.condition : altShiftKeysOnly;

    /**
     * @private
     * @type {number|undefined}
     */
    this.lastAngle_ = undefined;

    /**
     * @private
     * @type {number}
     */
    this.duration_ = options.duration !== undefined ? options.duration : 250;

  }

  /**
   * @inheritDoc
   */
  handleDragEvent(mapBrowserEvent) {
    if (!mouseOnly(mapBrowserEvent)) {
      return;
    }

    const map = mapBrowserEvent.map;
    const view = map.getView();
    if (view.getConstraints().rotation === disable) {
      return;
    }
    const size = map.getSize();
    const offset = mapBrowserEvent.pixel;
    const theta =
        Math.atan2(size[1] / 2 - offset[1], offset[0] - size[0] / 2);
    if (this.lastAngle_ !== undefined) {
      const delta = theta - this.lastAngle_;
      const rotation = view.getRotation();
      rotateWithoutConstraints(view, rotation - delta);
    }
    this.lastAngle_ = theta;
  }


  /**
   * @inheritDoc
   */
  handleUpEvent(mapBrowserEvent) {
    if (!mouseOnly(mapBrowserEvent)) {
      return true;
    }

    const map = mapBrowserEvent.map;
    const view = map.getView();
    view.setHint(ViewHint.INTERACTING, -1);
    const rotation = view.getRotation();
    rotate(view, rotation, undefined, this.duration_);
    return false;
  }


  /**
   * @inheritDoc
   */
  handleDownEvent(mapBrowserEvent) {
    if (!mouseOnly(mapBrowserEvent)) {
      return false;
    }

    if (mouseActionButton(mapBrowserEvent) && this.condition_(mapBrowserEvent)) {
      const map = mapBrowserEvent.map;
      map.getView().setHint(ViewHint.INTERACTING, 1);
      this.lastAngle_ = undefined;
      return true;
    } else {
      return false;
    }
  }
}

export default DragRotate;
