
import pathMaker from './pathMaker.js';

/**
*  @private
*  @method
*  @param {String} errMsg
*/
export default function processPath(thisVal, errMsg) {
  const ctx = thisVal.ctx;
  const path = thisVal.path;
  thisVal.isPathProcessed = thisVal.isPathProcessed
                            || path.length;
  path.forEach((pathData, index) => {
    const type = pathData.type;
    const pathMakerList = pathMaker.list;
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
  path.length = 0;
  return thisVal;
}
