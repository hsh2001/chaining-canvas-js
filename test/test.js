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
  ({point, circle}) => [
    point(20,20),
    point(255,200),
    point(900,22),
    point(20,20),
    circle(500, 500, 30),
  ]
)
.stroke()
.fill('blue');

console.log(canvas.path);
