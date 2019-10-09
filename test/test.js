import("../core/core.js").then(({
  default: ChaningCanvas,
}) => {
  const canvas = ChaningCanvas.create({
    id: 'display',
    width: 1000,
    height: 1000,
  })
  .appendInto(document.body)
  .fill('#000')
  .set({ strokeStyle: '#fff', })
  .addPath([
    [1,1],
    [255,200],
    [900,22],
  ])
  .stroke();

  console.log(canvas.path);
});
