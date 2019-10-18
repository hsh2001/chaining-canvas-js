
import { numberOrZero } from './math.js';

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

export { prepareParams };
