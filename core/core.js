
const ChaningCanvas = ((window, document, Array) => {

const PI  = Math.PI;
const PI2 = PI * 2;

// define private canvas object.
const _canvas = document.createElement('canvas');
const _ctx = _canvas.getContext('2d');

// define error message.
const Failed_to_execute = "Failed to execute";

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

//  define pathMaker.
/**
*  @callback PathGenerator
*  @param {Object} pathMaker
*    @param {PathMoveTo} pathMaker.moveTo
*      @callback PathMoveTo
*      @param {Integer} [x=0]
*      @param {Integer} [y=0]
*    @param {PathLineTo} pathMaker.lineTo
*      @callback PathLineTo
*      @param {Integer} [x=0]
*      @param {Integer} [y=0]
*    @param {PathPoint} pathMaker.point
*      @callback PathPoint
*      @param {Integer} [x=0]
*      @param {Integer} [y=0]
*    @param {PathArc} pathMaker.arc
*      @callback PathArc
*      @see https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/arc
*      @param {Integer} [x=0]
*      @param {Integer} [y=0]
*      @param {Integer} [r=0]
*      @param {Float} [sAngle=0]
*      @param {Float} [eAngle=0]
*      @param {Boolean} [counterclockwise=false]
*    @param {PathCircle} pathMaker.circle
*      @callback PathCircle
*      @param {Integer} [x=0]
*      @param {Integer} [y=0]
*      @param {Integer} [r=0]
*    @param {PathQuadraticCurveTo} pathMaker.quadraticCurveTo
*      @callback PathQuadraticCurveTo
*      @see https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/quadraticCurveTo
*      @param {Integer} [cpx=0]
*      @param {Integer} [cpy=0]
*      @param {Integer} [x=0]
*      @param {Integer} [y=0]
*    @param {PathBezierCurveTo} pathMaker.bezierCurveTo
*      @callback PathBezierCurveTo
*      @see https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/bezierCurveTo
*      @param {Integer} [cp1x=0]
*      @param {Integer} [cp1y=0]
*      @param {Integer} [cp2x=0]
*      @param {Integer} [cp2y=0]
*      @param {Integer} [x=0]
*      @param {Integer} [y=0]
*    @param {PathEllipse} pathMaker.ellipse
*      @callback PathEllipse
*      @see https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/ellipse
*      @param {Integer} [x=0]
*      @param {Integer} [y=0]
*      @param {Integer} [radiusX=0]
*      @param {Integer} [radiusY=0]
*      @param {Float} [rotation=0]
*      @param {Float} [sAngle=0]
*      @param {Float} [eAngle=0]
*      @param {Boolean} [anticlockwise=false]
*/
const pathMaker = {};
const pathMakerList = [
  ["moveTo", 2],
  ["point", 2],
  ["arc", 6],
  ["bezierCurveTo", 6],
  ["quadraticCurveTo", 4],
  ["ellipse", 8],
];

//  define methods for pathMaker.
pathMakerList
.forEach(([name, argLength]) => {
  pathMaker[name] = (...params) => ({
    type: name,
    params: prepareParams(params, argLength),
  });
});

pathMaker.lineTo = pathMaker.point;
pathMaker.circle = (x, y, r) => {
  [ x, y, r ] = [ x, y, r ].map(numberOrZero);
  return [
    pathMaker.moveTo(x + r, y),
    pathMaker.arc(x, y, r, 0, PI2),
  ];
};

pathMaker.deg = t => 180 * t / PI;

/**
*  @private
*  @function
*  @param {*} key
*/
const isValidStyleKey = key => key in _ctx;

/**
*  @private
*  @function
*/
const numberOrZero = n => (+n || 0);

/**
*  @private
*  @function
*  @param {Array} params
*  @param {Integer} minLength
*  @param {Function} [mappingFn=numberOrZero]
*/
const prepareParams = (
  params, minLength, mappingFn
) => (
  params
   .concat(
     Array(minLength).fill()
   )
   .slice(0, minLength)
   .map(mappingFn || numberOrZero)
);

/**
*  @private
*  @function
*  @param {*} val
*/
const isCanvasColor = val => (
  typeof val === "string"
  || val instanceof CanvasGradient
);

/**
*  @private
*  @function
*  @param {*} val
*/
const isImage = val => (
  val
  && imgConstructorList.some(
    key => val instanceof window[key]
  )
);

/**
*  @private
*  @function
*  @param {*} val
*/
const isArrayLike = val => (
  val
  && (
    Array.isArray(val) || (
      typeof val.length === 'number' &&
      val.length > -1
    )
  )
);

/**
*  @private
*  @function
*  @param {*} n
*/
const stringifyNumber = n => (
  n + (['st', 'nd'][n % 10 - 1] || 'th')
);

/**
*  @private
*  @function
*  @param {*} val
*/
const isHTMLElement = val => (
  val instanceof window.HTMLElement
);

/**
*  @private
*  @function
*  @param {String} errMsg
*  @param {Integer} paramIndex
*  @param {String} typeName
*/
const getTypeErrorMsg = (errMsg, paramIndex, typeName) => (
  `${errMsg} parameter ${paramIndex} is not of type '${typeName}'.`
);

/**
*  @private
*  @method
*  @param {String} errMsg
*/
const processPath = (thisVal, errMsg) => {
  const ctx = thisVal.ctx;
  thisVal.path.forEach((pathData, index) => {
    const type = pathData.type;
    for (let i = 0; i < pathMakerList.length; i++) {
      const name = pathMakerList[i][0];
      if (type === name && ctx[type]) {
        return ctx[type](...pathData.params);
      }
    }
    switch (type) {
      case "point":
        ctx[`${index? "line" : "move"}To`](...pathData.params);
        break;

      default:
        thisVal.path.length = 0;
        throw new TypeError(
          `${errMsg} ${stringifyNumber(i)} element of path data is Unkwon path type.`
        );
    }
  });
  thisVal.path.length = 0;
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
    const promise = new Promise((resolve, reject) => {
      img.src = element.toDataURL(format || "image/png");
      img.onload = () => resolve(img);
      img.onerror = reject;
    });

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

    fillStyle = isCanvasColor(fillStyle)
                ? { fillStyle }
                : { };

    if (
      [ 0, 1 ].includes(arguments.length)
      && [sx, sy, ex, ey].every(x => x == null)
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




})(this, document, Array);
