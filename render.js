var rootPath;
var paths = [];

$(document).ready(init);

function init()
{

}

function createABox(point, size) {
  var path = new Path.Rectangle({
    point: point,
    size: size,
    onMouseMove: onMouseOverBox
  });

  var bounds = {
    x: point.x,
    y: point.y,
    width: size.width,
    height: size.height
  };

  path.fillColor = raster.getAverageColor(bounds);
  paths.push(path);

  return path;
}

function removeABox(path)
{
  path.remove();
}

function createPhysicsFor(path)
{
  // Store the box
  paths.push(box);

  // Birth the box
  world.add(box);

  return path;
}

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

  splitABox(box, 3, true);
}

function splitARandomBox() {
  var path = _.sample(paths, 1);
  splitABox(path[0], 1);
}

function splitABox(box, iterations, splitBoth) {
	if (!loaded) return;
	if (lastPos.getDistance(box.point) < 10) return;
  if (box.bounds.size.height === 0) return;
  if (box.bounds.size.width === 0) return;
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
