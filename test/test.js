import("../core/core.js").then(({
  default: ChaningCanvas,
}) => {
  const canvas = ChaningCanvas.create({
    width: 1000,
    height: 1000
  }).stroke([
    [1,1],
    [255,200],
    [900,22],
  ]);
  document.body.appendChild(canvas.element);
});
