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
.fill('blue')
.toImage(null, (img, err) => {
  for (let i = 1; i < 10; i++) {
    setTimeout(() => {
      canvas.drawImg(img, 100 * i, 100 * i);
    }, i * 100);
  }
});

console.log(canvas);
