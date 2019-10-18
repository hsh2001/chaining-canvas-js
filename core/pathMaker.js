
import { prepareParams } from '../utils/parameter.js';
import { PI, PI2, numberOrZero } from '../utils/math.js';

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
pathMaker.list = [
  ["moveTo", 2],
  ["point", 2],
  ["arc", 6],
  ["bezierCurveTo", 6],
  ["quadraticCurveTo", 4],
  ["ellipse", 8],
];

//  define methods for pathMaker.
pathMaker
.list
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

export default pathMaker;
