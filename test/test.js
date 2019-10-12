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
.setPath(
  ({point, circle}) => [
    point(20,20),
    point(255,200),
    point(900,22),
    point(20,20),
    circle(500, 500, 90),
  ]
)
.stroke()
.fill('blue');

canvas
  .toImage()
  .then(img => console.log(img.src));

console.log(canvas.path);
