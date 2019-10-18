
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

export {getTypeErrorMsg};
