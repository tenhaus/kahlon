var rootPath = {};
var boxes = [];

var world = Physics();
var gravity = Physics.behavior('constant-acceleration', {
    acc: { x : 0, y: 0.001 } // this is the default
});

world.add( gravity );

Physics.util.ticker.stop();

function addBox(path)
{
  var box = Physics.body('rectangle', {
    x: path.point.x,
    y: path.point.y,
    width: path.size.width,
    height: path.size.height,
    weight: Math.random() * 100
  });

  box.path = path;
  world.add(box);
  boxes.push(box);
}

function removeBox(path)
{
}

function onFrame() {
  _.forEach(boxes, function(box) {
    var path = box.path;

    path.position.x = box.state.pos.x + path.size.width/2;
    path.position.y = box.state.pos.y + path.size.height/2;
  });
}


Physics.util.ticker.on(function( time ){
    world.step(time);
});


// $(document).ready(function() {
//   $('a').click(function(event) {
//     event.preventDefault();
//     _.forEach(boxes, function(box) {
//       var direction = Math.random()*10 >=5? -1:1;
//       box.applyForce({x:Math.random()*.10*direction, y:Math.random()*.10});
//     });
//     Physics.util.ticker.start();
//   });
// });

// Create a raster item:
var raster = new Raster('abdu.jpg');
var loaded = false;

raster.on('load', function() {
	loaded = true;
	onResize();
});

// Make the raster invisible:
raster.visible = false;

var lastPos = view.center;
function moveHandler(event) {
	if (!loaded)
		return;
	if (lastPos.getDistance(event.point) < 10)
		return;
	lastPos = event.point;

	var size = this.bounds.size.clone();
	var isLandscape = size.width > size.height;

	// If the path is in landscape orientation, we're going to
	// split the path horizontally, otherwise vertically:

	size /= isLandscape ? [2, 1] : [1, 2];

	var path = new Path.Rectangle({
		point: this.bounds.topLeft.floor(),
		size: size.ceil(),
		onMouseMove: moveHandler
	});

	path.fillColor = raster.getAverageColor(path);
  addBox(path);

	var path = new Path.Rectangle({
		point: isLandscape
			? this.bounds.topCenter.ceil()
			: this.bounds.leftCenter.ceil(),
		size: size.floor(),
		onMouseMove: moveHandler
	});

	path.fillColor = raster.getAverageColor(path);
  addBox(path);

  removeBox(this);
	this.remove();
}

function onResize(event) {
	if (!loaded)
		return;
	project.activeLayer.removeChildren();

	// Transform the raster so that it fills the bounding rectangle
	// of the view:
	raster.fitBounds(view.bounds, true);

	// Create a path that fills the view, and fill it with
	// the average color of the raster:
	rootPath = new Path.Rectangle({
		rectangle: view.bounds,
		fillColor: raster.getAverageColor(view.bounds),
		onMouseMove: moveHandler
	});
}
