
import { throwTypeError } from './error.js';

/**
*  @private
*  @function
*  @param {*} key
*/
const isValidStyleKey = key => key in _ctx;

/**
*  @private
*  @function
*  @param {*} val
*/
const isCanvasColor = val => (
  typeof val === "string"
  || [
    CanvasGradient,
    CanvasPattern
  ].some(o => val instanceof o)
);

const prepareStyle = style => {
  for (let key in style) {
    if (!isValidStyleKey(key)) {
      console.warn(`Can't find ${key} is valid style key.`);
    }
  }
  return style;
}

/**
*  @see https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/createPattern
*/
const createPattern = (ctx, image, repetition) => {
  const errMsg = `Failed to execute 'createPattern':`;
  isImage(image) || throwTypeError({
    prefix: errMsg,
    paramIndex: 1,
    typeName: imgConstructorList.join(' or ')
  });
  return ctx.createPattern(image, repetition);
}

export {isValidStyleKey, isCanvasColor, prepareStyle, createPattern};
