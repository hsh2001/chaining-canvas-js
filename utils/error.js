
/**
*  @private
*  @function
*  @param {String} errMsg
*  @param {Integer} paramIndex
*  @param {String} typeName
*/
const getTypeErrorMsg = (prefix, paramIndex, typeName) => (
  `${prefix} parameter ${paramIndex} is not of type '${typeName}'.`
);

/**
*  @private
*  @function
*  @param {String} errMsg
*  @param {Integer} paramIndex
*  @param {*} targetValue
*  @param {Function} checkType
*/
const throwTypeError = ({ prefix, paramIndex, typeName }) => {
  const msg = getTypeErrorMsg(prefix, paramIndex, typeName);
  throw new TypeError(msg);
};

export { getTypeErrorMsg, throwTypeError };
