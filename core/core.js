
const ChaningCanvas = ((global, document) => {


// define private canvas object.
const _canvas = document.createElement('canvas');
const _ctx = _canvas.getContext('2d');

// define error message.
const Failed_to_execute = "Failed to execute";

//  define pathMaker.
const pathMaker = {};

//  define image object constructor list.
const imgConstructorList = [
  "Image",
  "CSSImageValue",
  "HTMLImageElement",
  "SVGImageElement",
  "HTMLVideoElement",
  "HTMLCanvasElement",
  "ImageBitmap",
  "OffscreenCanvas",
];

//  define methods for pathMaker.
[
  ["moveTo", 2],
  ["point", 2],
  ["arc", 6],
  ["bezierCurve", 6],
  ["ellipse", 8],
].forEach(([name, argLength]) => {
  pathMaker[name] = function (...params) {
    return {
      type: name,
      params: prepareParams(params, argLength),
    };
  };
});

pathMaker.lineTo = pathMaker.point;
pathMaker.circle = function circle(x, y, r) {
  params = prepareParams([x, y, r], 3);
  params.push(0, 6.283185307/* 2 times PI */);
  return [
    pathMaker.moveTo(x + r, y),
    pathMaker.arc(...params),
  ];
};

/**
*  @private
*  @function
*  @param {*} key
*/
function isValidStyleKey(key) {
  return key in _ctx;
}

/**
*  @private
*  @function
*/
function numberOrZero(n) {
  return +n || 0;
}

/**
*  @private
*  @function
*  @param {Array} params
*  @param {Integer} minLength
*  @param {Function} [mappingFn=numberOrZero]
*/
function prepareParams(params, minLength, mappingFn) {
  return params
          .concat(
            Array(minLength).fill()
          )
          .slice(0, minLength)
          .map(mappingFn || numberOrZero);
}

/**
*  @private
*  @function
*  @param {*} val
*/
function isCanvasColor(val) {
  return typeof val === "string" || val instanceof CanvasGradient;
}

/**
*  @private
*  @function
*  @param {*} val
*/
function isImage(val) {
  return val
         && imgConstructorList.some(
           key => val instanceof window[key]
         );
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

/**
*  @private
*  @function
*  @param {String} errMsg
*  @param {Integer} paramIndex
*  @param {String} typeName
*/
function getTypeErrorMsg(errMsg, paramIndex, typeName) {
  return `${errMsg} parameter ${paramIndex} is not of type '${typeName}'.`;
}

/**
*  @private
*  @method
*  @param {String} errMsg
*/
function processPath(thisVal, errMsg) {
  const ctx = thisVal.ctx;
  thisVal.path.forEach((pathData, index) => {
    switch (pathData.type) {
      case "moveTo":
        ctx.moveTo(...pathData.params);
        break;

      case "point":
        ctx[`${index? "line" : "move"}To`](...pathData.params);
        break;

      case "arc":
        ctx.arc(...pathData.params);
        break;

      case "bezierCurve":
        ctx.bezierCurveTo(...pathData.params);
        break;

      case "ellipse":
        ctx.ellipse(...pathData.params);
        break;

      default:
        thisVal.path.length = 0;
        throw new TypeError(
          `${errMsg} ${stringifyNumber(i)} element of path data is Unkwon path type.`
        );
    }
  });
  return thisVal;
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
        getTypeErrorMsg(
          `${Failed_to_execute} 'appendInto':`,
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
  *  @return {Promise} resolve image object when process is done.
  */
  toImg(...p) { return this.toImage(...p); }
  toImage(format) {
    const element = this.element;
    const img = new Image;
    return new Promise((resolve, reject) => {
      img.src = element.toDataURL(format);
      img.onload = () => resolve(img);
      img.onerror = reject;
    });
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
    ].map(a => numberOrZero(a));
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
          ...[x, y].map(a => numberOrZero(a)),
          1, 1,
        )
        .data;
    return { r, g, b, a, };
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
  *  @param {Image|CSSImageValue|HTMLImageElement|SVGImageElement|HTMLVideoElement|HTMLCanvasElement|ImageBitmap|OffscreenCanvas} img
  *  @param {Integer} x
  *  @param {Integer} y
  *  @param {...Integer} params
  */
  drawImg(...p) { return this.drawImage(...p); }
  drawImage(img, x, y, ...params) {
    const errMsg = `${Failed_to_execute} 'drawImage':`;

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
  *  @method
  */
  resetPath(...p) { return this.closePath(...p); }
  closePath() {
    this.ctx.closePath();
    this.path.length = 0;
    return this;
  }

  /**
  *  @method
  *  @param {Function} cb
  */
  addPath(cb) {
    const ctx = this.ctx;
    const errMsg = `${Failed_to_execute} 'addPath':`;
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
  *  @param {Function} cb
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

    fillStyle = isCanvasColor(fillStyle)
                ? { fillStyle }
                : { };

    if (
      [ 0, 1 ].includes(arguments.length)
      && this.path.length
    ) {
      return processPath(
               this, `${Failed_to_execute} 'fill':`
             ).execute(
               fillStyle, () => ctx.fill()
             );
    }

    sx = sx || 0;
    sy = sy || 0;
    ex = ex == null? elem.width : ex;
    ey = ey == null? elem.height : ey;

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
            this, `${Failed_to_execute} 'stroke':`
          ).execute(
            style, thisVal => thisVal.ctx.stroke()
          );
  }
};




})(this, document);
