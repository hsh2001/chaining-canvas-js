
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

const preloadImage = src => new Promise((resolve, reject) => {
  const img = new Image;
  img.onload = () => resolve(img);
  img.onerror = reject;
  img.src = src;
});

export {imgConstructorList, isImage, preloadImage};
