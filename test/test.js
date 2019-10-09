const canvas = ChaningCanvas.create({
  id: 'display',
  width: 1000,
  height: 1000,
})
.appendInto(document.body)
.fill('#000')
.set({
  strokeStyle: '#fff',
  lineWidth: 10,
})
.addPath(
  [20,20],
  [255,200],
  [900,22],
  [20,20],
)
.stroke()
.fill('blue');

console.log(canvas.path);
