
/**
*  @private
*  @function
*  @param {*} n
*/
const stringifyNumber = n => (
  n + (['st', 'nd'][n % 10 - 1] || 'th')
);

export {stringifyNumber};
