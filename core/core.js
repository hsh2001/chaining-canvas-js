
/**
*  @private
*  @function
*  @param val
*/
function isArrayLike(val) {
  return val != null && (
    Array.isArray(val) || (
      typeof val.length === 'number' &&
      val.length > -1
    )
  );
}

/**
*  @private
*  @function
*  @param n
*/
function stringifyNumber(n) {
  return n + (['st', 'nd'][n % 10 - 1] || 'th');
}


export default class ChaningCanvas {
  /*
  * @constructor
  * @param canvas HTMLCanvasElement
  */
  constructor(canvas) {
    this.element = canvas;
    this.ctx = canvas.getContext('2d');
  }

  /*
  * @method
  * @param attr Object (optional) will be assign to canvas object.
  */
  static create(attr) {
    const canvas = document.createElement('canvas');
    const defaultAttr = {
      width: 300,
      height: 300,
    };
    attr = {
      ...defaultAttr,
      ...Object(attr),
    };
    Object.assign(canvas, attr);
    return new ChaningCanvas(canvas);
  }

  /*
  * @method
  * @param styles Object (optional)
  */
  set(style) {
    return Object.assign(this, Object(style));
  }

  /*
  * @method
  * @param style Object (optional)
  * @param fn Function
  */
  execute(style, fn) {
    const ctx = this.ctx;
    ctx.save();
    this.set(style);
    fn(this);
    ctx.restore();
    return this;
  }

  /*
  * @method
  * @param [width=elem.width] Integer (optional)
  * @param [height=elem.height] Integer (optional)
  */
  clear(width, height) {
    const elem = this.element;
    width = width || elem.width;
    height = height || elem.height;
    this.ctx.clearRect(0, 0, width, height);
    return this;
  }

  /*
  * @method
  * @param [color="ctx.fillStyle"] String|CanvasGradient (optional)
  * @param [width=elem.width] Integer (optional)
  * @param [height=elem.height] Integer (optional)
  */
  fill(color, width, height) {
    const elem = this.element;
    const ctx = this.ctx;
    ctx.fillStyle = color || ctx.fillStyle;
    width = width || elem.width;
    height = height || elem.height;
    ctx.fillRect(0, 0, width, height);
    return this;
  }

  /*
  * @method
  * @param path Array<Array>
  * @param style Object (optional)
  */
  stroke(path, style) {
    const ctx = this.ctx;
    const errMsg = "Failed to execute 'stroke':";

    // Check path.
    // If the path cannot be converted to an array, `Array.from` will throw an error.
    if (!isArrayLike(path)) {
      throw new TypeError(
        `${errMsg} parameter 1 is not of type 'Array'.`
      );
    }

    path = Array.from(path).map((point, i) => {
      // Check point.
      // If the point cannot be converted to an array, `Array.from` will throw an error.
      if (!isArrayLike(point)) {
        throw new TypeError(
          `${errMsg} ${stringifyNumber(i)} element of path is not of type 'Array'.`
        );
      }

      point = Array.from(point);

      // potint array: [X, Y]
      // so, length is 2.
      if (point.length < 2) {
        throw new TypeError(
          `${errMsg} 2 element required, but only ${point.length} included in ${stringifyNumber(i)} element of path.`
        );
      }

      return Array.from(point);
    });

    return this.execute(style, () => {
      ctx.beginPath();
      ctx.moveTo(...path.shift());
      path.forEach(
        point => ctx.lineTo(...point)
      );
      ctx.stroke();
      ctx.closePath();
    });
  }
};
