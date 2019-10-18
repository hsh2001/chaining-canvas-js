
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

export {isArrayLike};
