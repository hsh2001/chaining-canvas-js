
const ChaningCanvas = ((global, document) => {


// define private canvas object.
const _canvas = document.createElement('canvas');
const _ctx = _canvas.getContext('2d');

// define error message.
const Failed_to_execute = "Failed to execute";

/**
*  @private
*  @function
*  @param {String} key
*/
function isValidStyleKey(key) {
  return key in _ctx;
}

/**
*  @private
*  @function
*  @param {*} val
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
*  @param {*} n
*/
function stringifyNumber(n) {
  return n + (['st', 'nd'][n % 10 - 1] || 'th');
}


/**
*  @private
*  @function
*  @param {*} val
*/
function isHTMLElement(val) {
  return val instanceof window.HTMLElement;
}


return class ChaningCanvas {
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
    for (let key in style) {
      if (!isValidStyleKey(key)) {
        console.warn(`Can't find ${key} is valid style key.`);
      }
    }

    return style;
  }

  /**
  *  @method
  *  @param {HTMLElement} parentNode
  */
  appendInto(parentNode) {
    if (!isHTMLElement(parentNode)) {
      throw new TypeError(
        `${Failed_to_execute} 'appendInto': parameter 1 is not of type 'HTMLElement'.`
      );
    }
    parentNode.appendChild(this.element);
    return this;
  }

  /**
  *  @method
  *  @param {Object} style (optional)
  */
  set(style) {
    Object.assign(this.ctx, Object(style));
    return this;
  }

  /**
  *  @method
  *  @param {Object} style (optional)
  *  @param {Function} fn
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
  *  @method
  */
  closePath() {
    this.ctx.closePath();
    return this;
  }

  /**
  *  @method
  *  @param {...Array} path
  */
  addPath(...path) {
    const ctx = this.ctx;
    const errMsg = `${Failed_to_execute} 'addPath':`;

    path = path.map((point, i) => {
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

    this.path.push(
      ...path.map(
        point => ({
          type: "point",
          point,
        })
      )
    );

    return this;
  }

  /**
  *  @method
  *  @param {String|CanvasGradient} [fillStyle="ctx.fillStyle"] (optional)
  *  @param {Integer} [width=elem.width] (optional)
  *  @param {Integer} [height=elem.height] (optional)
  */
  fill(fillStyle, width, height) {
    const elem = this.element;
    const ctx = this.ctx;
    fillStyle = fillStyle || ctx.fillStyle;
    width = width || elem.width;
    height = height || elem.height;
    return this.execute({ fillStyle }, () => {
      ctx.fillRect(0, 0, width, height);
    });
  }

  /**
  *  @method
  *  @param {Object} style (optional)
  */
  stroke(style) {
    const ctx = this.ctx;
    const errMsg = `${Failed_to_execute} 'stroke':`;

    this.path.forEach((pathData, index) => {
      switch (pathData.type) {
        case "point":
          ctx[`${index? "line" : "move"}To`](...pathData.point);
          break;

        default:
          this.path.length = 0;
          throw new Error(
            `${errMsg} ${stringifyNumber(i)} element of path data is Unkwon path type.`
          );
      }
    });

    return this.execute( style, () => ctx.stroke() );
  }
};




})(this, document);
