var rootPath;
var boxes;
var world;

$(document).ready(init);

function init()
{
  boxes = [];
  world = Physics();
  Physics.util.ticker.stop();

  var gravity = Physics.behavior('constant-acceleration', {
      acc: { x : 0, y: 0.001 }
  });

  world.add(gravity);
}

function createABox(point, size) {
  var path = new Path.Rectangle({
    point: point,
    size: size,
    onMouseMove: onMouseOverBox
  });

  // createPhysicsFor(path);

  var bounds = {
    x: point.x,
    y: point.y,
    width: size.width,
    height: size.height
  };

  path.fillColor = raster.getAverageColor(bounds);

  return path;
}

function removeABox(path)
{
  world.remove(path.box);
  path.remove();
}

function createPhysicsFor(path)
{
  var box = Physics.body('rectangle', {
    x: path.point.x,
    y: path.point.y,
    width: path.size.width,
    height: path.size.height,
    weight: Math.random() * 100
  });

  // Let's hug
  box.path = path;
  path.box = box;

  // Store the box
  boxes.push(box);

  // Birth the box
  world.add(box);

  return path;
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

function onMouseOverBox(event)
{
  var box = event.target;
  box.point = event.point;

  splitABox(box, 1);
}

function splitABox(box, iterations, splitBoth) {
	if (!loaded) return;
	if (lastPos.getDistance(box.point) < 1) return;

  lastPos = box.point;

  var thisBox = box;
	var size = thisBox.bounds.size.clone();
	var isLandscape = size.width > size.height;

	// If the path is in landscape orientation, we're going to
	// split the path horizontally, otherwise vertically:

	size /= isLandscape ? [2, 1] : [1, 2];

  // Create the first box

  var firstBox = createABox(
    thisBox.bounds.topLeft.floor(),
    size.ceil()
  );

  // Second Box

  var point;

  if (isLandscape) point = thisBox.bounds.topCenter.ceil();
  else point = thisBox.bounds.leftCenter.ceil();

  var secondBox = createABox(
    point, size.floor()
  );

  // The box we just split owned
  // this event handler.

  // We're going to remove that box now
  // that we split it.

  removeABox(thisBox);

  if(iterations && iterations > 1)
  {
    iterations--;

    splitABox(firstBox, iterations, splitBoth);
    if (splitBoth) splitABox(secondBox, iterations, splitBoth);
  }
}

function onResize(event) {
	if (!loaded) return;

  // Clear all of the children

	project.activeLayer.removeChildren();

	// Transform the raster so that it fills the bounding rectangle
	// of the view:

	raster.fitBounds(view.bounds, true);

  // Create a path that fills the view, and fill it with
	// the average color of the raster:

  var rootBox = createABox(
    view.bounds.point,
    view.bounds
  );

  splitABox(rootBox, 5, true);
}
