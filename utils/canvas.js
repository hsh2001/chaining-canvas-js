
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
  || val instanceof CanvasGradient
);

const prepareStyle = style => {
  for (let key in style) {
    if (!isValidStyleKey(key)) {
      console.warn(`Can't find ${key} is valid style key.`);
    }
  }
  return style;
}

export {isValidStyleKey, isCanvasColor, prepareStyle};
