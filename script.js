let expDim;
let graphW, graphH;

let expBound;
let shape;
let ray;

let graphXmin, graphXmax, graphYmin, graphYmax;
let rotSlider;
let clearGraphBtn;
let redrawShapeBtn;

let maxReflect = 20;
function setup() {
  	createCanvas(windowWidth, windowHeight);
    background(0);
	stroke(255);
	fill(0);

	expDim = height;
	graphW = width - expDim;
	graphH = height * 0.75;

	expBound = new Shape([
		[0, 0, expDim, 0],
		[expDim, 0, expDim, expDim],
		[expDim, expDim, 0, expDim],
		[0, expDim, 0, 0]
	].map(arr => arr.map(i => i - expDim/2)), 0);

	// // regular square
	// shape = new Shape([
	// 	[50, -50, 50, 50],
	// 	[50, -50, -50, -50],
	// 	[-50, -50, -50, 50],
	// 	[-50, 50, 50, 50],
	// ], 0);

	shape = new Shape([
		[-40, -40, 30, 20],
		[30, 20, 20, -30],
		[20, -30, -40, -40],
	], 0);

	ray = new Ray(expDim/2, height, 0, -1)

	rect(expDim, 0, width, graphH);
	graphXmin = expDim+50, graphXmax = width-50;
	graphYmin = 0.5*graphH, graphYmax = 10;

	rotSlider = createSlider(0, 2*Math.PI, 0, 0);
	rotSlider.position(10, 10);
	rotSlider.style("width", `${expDim-25}px`);

	clearGraphBtn = createButton("Clear Graph");
	clearGraphBtn.position(expDim+10, graphH+10);
	clearGraphBtn.mousePressed(() => {
		stroke(255); fill(0);
		rect(expDim, 0, width, graphH);
	});

	redrawShapeBtn = createButton("Redraw Shape");
	redrawShapeBtn.position(expDim+10, graphH+35);
	redrawShapeBtn.mousePressed(redrawShape);
}

let n;
let res, closest, hitLine;
let finalAngle;
function draw() {
	stroke(255);
	fill(0);

	rect(0, 0, expDim, expDim);
	// ellipse(expDim/2, expDim/2, expDim, expDim)

	//////////////////// run simulation here ////////////////////
	shape.show();
	// ray.show();
	// ray.lookAt(mouseX, mouseY);

	let finalPos = ray.simulate([expBound, shape], maxReflect);

	finalAngle = atan2(finalPos[1] - expDim/2, finalPos[0] - expDim/2);
	finalAngle = 90 - degrees(finalAngle);
	if (finalAngle > 180) finalAngle -= 360;
	if (finalAngle < -180) finalAngle += 360;
	// console.log(finalAngle);

	ray.pos.set(expDim/2, height);
	ray.dir.set(0, -1); ray.dir.normalize();

	//////////////////// draw graph here ////////////////////
	drawGraph();
	stroke(255); fill(0);
	if (n < maxReflect)
		point(
			lerp(graphXmin, graphXmax, rotSlider.value() / (2*(Math.PI))),
			lerp(graphYmin, graphYmax, finalAngle)
		);

	rect(expDim, graphH, width, height);
	//////////////////// sliders here ////////////////////
	if (shape.angle != rotSlider.value()) {
		shape.rotate(rotSlider.value() - shape.angle);
		shape.angle = rotSlider.value();
	}
}

function drawGraph() {
	// x axis
	line(expDim+10, 0.5*graphH, width-10, 0.5*graphH)
	// y axis
	line(expDim+50, 10, expDim+50, graphH-10);
	// tick marks
	for (let i=0; i<=360; i+=360/12) {
		stroke(0); fill(255);
		let x = lerp(graphXmin, graphXmax, i/360);
		text(`${i}`, x-10, graphYmin+15);
		stroke(255); fill(0);
		line(x, graphYmin-5, x, graphYmin+5);
	}
	for (let i=-180; i<=180; i+=360/12) {
		let y = lerp(graphYmin, graphYmax, i/180);
		stroke(0); fill(255);
		text(`${i}`, graphXmin-30, y+5);
		stroke(255); fill(0);
		line(graphXmin-5, y, graphXmin+5, y);
	}
}

async function redrawShape() {
	noLoop();
	await sleep(50);

	stroke(255); fill(0);
	rect(0, 0, expDim, expDim);
	rotSlider.value(0);
	rect(expDim, 0, width, graphH);
	drawGraph();

	let lines = await getLines();
	shape = new Shape(lines, 0)
	loop();
}

async function getLines() {
	let lines = [];
	return new Promise(async (resolve, reject) => {
		let p0 = await getPoint();
		let p = p0.copy(), q = createVector(width, height);

		while (p0.dist(q) > 8) {
			q = await getPoint();
			lines.push([p.x, p.y, q.x, q.y].map(j => j-expDim/2));
			line(p.x, p.y, q.x, q.y);
			p = q.copy();
		}
		let last = lines[lines.length-1];
		last[2] = p0.x-expDim/2, last[3] = p0.y-expDim/2;

		resolve(lines);
	})
}

async function getPoint() {
	return new Promise(async (resolve, reject) => {
		let coords;
		window.mouseClicked = function () {
			if (mouseX < expDim && mouseY < expDim) {
				coords = createVector(mouseX, mouseY);
				window.mouseClicked = function () { }

				ellipse(coords.x, coords.y, 8, 8);
				resolve(coords);
			}
		}
	})
}


function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }
