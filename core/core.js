
import { getTypeErrorMsg } from '../utils/error.js';
import { isArrayLike } from '../utils/array.js';
import {
  imgConstructorList, isImage, preloadImage
} from '../utils/image.js';
import { PI, PI2, numberOrZero } from '../utils/math.js';
import {
  isValidStyleKey, isCanvasColor, prepareStyle
 } from '../utils/canvas.js';
import { isHTMLElement } from '../utils/html.js';
import { stringifyNumber } from '../utils/string.js';
import { prepareParams } from '../utils/parameter.js';
import pathMaker from './pathMaker.js';
import processPath from './pathProcessor.js';

// define private canvas object.
const _canvas = document.createElement('canvas');
const _ctx = _canvas.getContext('2d');

export default class ChaningCanvas {
  /**
  *  @constructor
  *  @param {HTMLCanvasElement} canvas
  */
  constructor(canvas) {
    this.element = canvas;
    this.ctx = canvas.getContext('2d');
    this.path = [];
  }

  /**
  *  @method
  *  @param {Object} attr (optional) will be assign to canvas object.
  */
  static create(attr) {
    const canvas = document.createElement('canvas');
    attr = {
      // default values
      width: 300,
      height: 300,
      // values provided by the parameter.
      ...Object(attr),
    };
    Object.assign(canvas, attr);
    return new ChaningCanvas(canvas);
  }

  /**
  *  @method
  *  @param {Object} style
  */
  static prepareStyle(style) {
    return prepareStyle(style);
  }

  /**
  *  @method
  *  @param {HTMLElement} parentNode
  */
  appendInto(parentNode) {
    if (!isHTMLElement(parentNode)) {
      throw new TypeError(
        getTypeErrorMsg(
          `Failed to execute 'appendInto':`,
          1,
          "HTMLElement",
        )
      );
    }
    parentNode.appendChild(this.element);
    return this;
  }

  /**
  *  @method
  *  @param {String} format (optional)
  *  @param {ImageEventHandler} cb (optional)
  *  @return {Promise} (When cb is not a function) resolve image object when process is done.
  */
  /**
  *  @callback ImageEventHandler
  *  @param {Image} img
  *  @param {Error} error
  */
  toImg(...p) { return this.toImage(...p); }
  toImage(format, cb) {
    const element = this.element;
    const img = new Image;
    const src = element.toDataURL(format || "image/png");
    const promise = preloadImage(src);

    if (typeof cb === "function") {
      promise
      .then(img => cb(img, null))
      .catch(err => cb(null, err));
      return this;
    }

    return promise;
  }

  /**
  *  @method
  *  @param {Integer} [x=0] (optional)
  *  @param {Integer} [y=0] (optional)
  *  @param {Integer} [width=0] (optional)
  *  @param {Integer} [height=0] (optional)
  *  @return {Uint8ClampedArray} Image data.
  */
  getImgData(...p) { return this.getImageData(...p); }
  getImageData(x, y, width, height) {
    const params = [
      x, y, width, height,
    ].map(numberOrZero);
    return this.ctx.getImageData(...params).data;
  }

  /**
  *  @method
  *  @param {Integer} [x=0] (optional)
  *  @param {Integer} [y=0] (optional)
  *  @return {Object} Pixel data.
  */
  getPixelData(...p) { return this.getPixel(...p); }
  getPixel(x, y) {
    const [
      r, g, b, a
    ] = this
        .ctx
        .getImageData(
          ...[x, y].map(numberOrZero),
          1, 1,
        )
        .data;
    return { r, g, b, a, };
  }

  /**
  *  @method
  *  @param {Object} style (optional)
  */
  setContext(...p) { return this.set(...p); }
  set(style) {
    //  deep-copy style object.
    style = { ...Object(style) };

    [
      'lineDash',
      'transform',
      'scale',
    ].forEach(key => {
      if (key in style) {
        this[key] = style[key];
        delete style[key];
      }
    });

    Object.assign(this.ctx, style);
    return this;
  }

  /**
  *  @method
  *  @param {Object} attributes (optional)
  */
  setCanvas(attributes) {
    attributes = Object(attributes);
    Object.assign(this.element, attributes);
    return this;
  }

  /**
  *  @see https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/setLineDash
  */
  set lineDash(segments) {
    return this.ctx.setLineDash(segments);
  }

  get lineDash() {
    return this.ctx.getLineDash();
  }

  /**
  *  @see https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/setTransform
  */
  set transform(val) {
    return this.ctx.setTransform(
      ...(
        isArrayLike(val)
        ? Array.from(val)
        : [val]
      )
    );
  }

  get transform() {
    return this.ctx.getTransform();
  }

  /**
  *  @see https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/setTransform
  */
  set scale([x, y]) {
    this._scale = [x, y];
    this.ctx.scale(x, y);
    return [x, y];
  }

  get scale() {
    return this._scale || [1,1];
  }

  /**
  *  @method
  *  @param {Object} style (optional)
  *  @param {CanvasExecuter} fn
  */
  /**
  *  @callback CanvasExecuter
  *  @param {ChaningCanvas} canvas
  */
  execute(style, fn) {
    const ctx = this.ctx;
    ctx.save();
    this.set(style);
    fn(this);
    ctx.restore();
    return this;
  }

  /**
  *  @method
  *  @param {Image|CSSImageValue|HTMLImageElement|SVGImageElement|HTMLVideoElement|HTMLCanvasElement|ImageBitmap|OffscreenCanvas} img
  *  @param {Integer} x
  *  @param {Integer} y
  *  @param {...Integer} params
  */
  drawImg(...p) { return this.drawImage(...p); }
  drawImage(img, x, y, ...params) {
    const errMsg = `Failed to execute 'drawImage':`;

    if (!isImage(img)) {
      const constList = imgConstructorList.join(' or ');
      throw new TypeError(
        getTypeErrorMsg(errMsg, 1, constList)
      );
    }

    x = +x || 0;
    y = +y || 0;
    this.ctx.drawImage(img, x, y, ...params);

    return this;
  }

  /**
  *  @method
  *  @param {Integer} [width=elem.width] (optional)
  *  @param {Integer} [height=elem.height] (optional)
  */
  clear(width, height) {
    const elem = this.element;
    width = width || elem.width;
    height = height || elem.height;
    this.ctx.clearRect(0, 0, width, height);
    return this;
  }

  /**
  *  @see https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/clip
  */
  clip(...p) {
    this.ctx.clip(...p);
    return this;
  }

  /**
  *  @method
  */
  resetPath(...p) { return this.closePath(...p); }
  closePath() {
    this.ctx.closePath();
    this.path.length = 0;
    this.isPathProcessed = false;
    return this;
  }

  /**
  *  @method
  *  @param {PathGenerator} cb
  *  @example
  *    canvas.setPath(
  *      ({point, circle}) => [
  *        point(20,20),
  *        point(255,200),
  *        point(900,22),
  *        point(20,20),
  *        circle(500, 500, 90),
  *      ]
  *    )
  *    .stroke()
  */
  addPath(cb) {
    const ctx = this.ctx;
    const errMsg = `Failed to execute 'addPath':`;
    let path;

    if (typeof cb !== "function") {
      throw new TypeError(
        getTypeErrorMsg(errMsg, 1, "Function")
      );
    }

    path = cb(pathMaker);

    if (!isArrayLike(path)) {
      throw new TypeError(
        `${errMsg} callback function must return value, which is type of Array.`
      );
    }

    path = Array.from(path).flat(Infinity);
    path.forEach((elem, i) => {
      if (!elem || !elem.type) {
        throw new TypeError(
          `${errMsg} ${stringifyNumber(i)} element of path data is Unkwon path type.`
        );
      }
    });

    this.path.push(...path);
    return this;
  }

  /**
  *  @method
  *  @param {PathGenerator} cb
  */
  setPath(cb) {
    return this
            .closePath()
            .addPath(cb);
  }

  /**
  *  @method
  *  @param {String|CanvasGradient} fillStyle (optional)
  *  @param {Integer} [sx=0] (optional)
  *  @param {Integer} [sy=0] (optional)
  *  @param {Integer} [ex=elem.width] (optional)
  *  @param {Integer} [ey=elem.height] (optional)
  */
  fill(fillStyle, sx, sy, ex, ey) {
    const elem = this.element;
    const ctx = this.ctx;
    const { width, height } = elem;

    fillStyle = isCanvasColor(fillStyle)
                ? { fillStyle }
                : { };

    if (
      [ 0, 1 ].includes(arguments.length)
      && [sx, sy, ex, ey].every(x => x == null)
      && this.isPathProcessed
    ) {
      return processPath(
               this, `Failed to execute 'fill':`
             ).execute(
               fillStyle, () => ctx.fill()
             );
    }

    sx = sx || 0;
    sy = sy || 0;
    ex = ex == null? width : ex;
    ey = ey == null? height : ey;

    return this.execute(
      fillStyle,
      () => ctx.fillRect(sx, sy, ex, ey)
    );
  }

  /**
  *  @method
  *  @param {Object} style (optional)
  */
  stroke(style) {
    return processPath(
            this, `Failed to execute 'stroke':`
          ).execute(
            style, thisVal => thisVal.ctx.stroke()
          );
  }
};
