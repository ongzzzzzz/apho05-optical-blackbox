class Shape {
	constructor(lines, angle) {
		this.lines = lines.map(l =>
			l.map(p => p + expDim / 2)
		);
		this.angle = angle;
	}

	show() {
		this.lines.forEach(l => {
			line(l[0], l[1], l[2], l[3]);
		})
	}

	rotate(a) {
		for (let i = 0; i < this.lines.length; i++) {
			let l = this.lines[i];
			let lnew = [...l];
			lnew[0] = expDim / 2 + (l[0] - expDim / 2) * cos(a) - (l[1] - expDim / 2) * sin(a);
			lnew[1] = expDim / 2 + (l[0] - expDim / 2) * sin(a) + (l[1] - expDim / 2) * cos(a);
			lnew[2] = expDim / 2 + (l[2] - expDim / 2) * cos(a) - (l[3] - expDim / 2) * sin(a);
			lnew[3] = expDim / 2 + (l[2] - expDim / 2) * sin(a) + (l[3] - expDim / 2) * cos(a);

			this.lines[i] = lnew;
		}
	}
}

class Ray {
	constructor(x, y, dirx, diry) {
		this.pos = createVector(x, y);
		this.dir = createVector(dirx, diry).normalize()
	}



	lookAt(x, y) {
		this.dir.x = x - this.pos.x;
		this.dir.y = y - this.pos.y;
		this.dir.normalize();
	}

	update(x, y) {
		this.pos.set(x, y);
	}

	show() {
		line(this.pos.x, this.pos.y,
			this.pos.x + this.dir.x * 10,
			this.pos.y + this.dir.y * 10)
	}

	check(x1, y1, x2, y2) {
		// Checks if a line segment from (x1, y1) to (x2, y2) intersects with another line segment
		const x3 = this.pos.x,
			y3 = this.pos.y;
		const x4 = this.pos.x + this.dir.x,
			y4 = this.pos.y + this.dir.y;

		let den = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
		if (den == 0) {
			return false;
		}

		let t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / den;
		let u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / den;

		if (0 < t && t < 1 && u > 0) {
			let pt = createVector();
			pt.x = x1 + t * (x2 - x1);
			pt.y = y1 + t * (y2 - y1);

			return pt;
		} else return false;
	}

	cast(shapes) {
		let closest = false;
		let closestDist = Infinity;
		let hitLine = [];
		shapes.forEach(s => {
			s.lines.forEach(l => {
				let intersection = this.check(...l);
				if (intersection) {
					let d = p5.Vector.dist(this.pos, intersection);
					if (!closest || d < closestDist) {
						closest = intersection;
						closestDist = d;
						hitLine = l;
					}
				}
			})
		});

		return [closest, hitLine];
	}

	angleBetween(hitLine) {
		let m = gradient_of(hitLine);
		let raym = tan(this.dir.heading());
		let incident = atan(abs(
			(m - raym) / (1 + m * raym)
		));

		return incident;
	}

	reflect(hitLine) {
		const incidentAngle = this.angleBetween(hitLine);
		const normalAngle = atan(hitLine[3] - hitLine[1], hitLine[2] - hitLine[0]) + HALF_PI;
		const reflectionAngle = normalAngle + incidentAngle;

		this.dir.x = cos(reflectionAngle);
		this.dir.y = sin(reflectionAngle);
		this.dir.normalize();
	}

	simulate(shapes, maxReflect) {
		res = ray.cast(shapes);
		closest = res[0], hitLine = res[1];

		if (closest) {
			line(ray.pos.x, ray.pos.y, closest.x, closest.y);
			ellipse(closest.x, closest.y, 5, 5);
			n = 0;
			// check if closest lies on boundary
			while (!(closest.x == 0 || closest.x == expDim ||
				closest.y == 0 || closest.y == expDim)
				&& n < maxReflect) {
				let incident = ray.angleBetween(hitLine);
				let alpha = ray.dir.heading();
				let beta = atan(gradient_of(hitLine));

				// Adjust reflection logic to handle all cases involving alpha and beta
				let reflectionAngle = 2 * beta - alpha;
				ray.dir.setHeading(reflectionAngle);
				// Prevent the ray from reflecting into itself
				if (ray.dir.heading() === alpha) {
					ray.dir.rotate(PI);
				}

				// delta because of javascript fuckery
				let delta = p5.Vector.sub(closest, ray.pos).normalize();
				ray.pos.set(closest.x - delta.x, closest.y - delta.y);

				res = ray.cast(shapes);
				closest = res[0], hitLine = res[1];
				if (closest) {
					line(ray.pos.x, ray.pos.y, closest.x, closest.y);
					ellipse(closest.x, closest.y, 5, 5);
					n++;
				}
			}
		}
	}
}


function gradient_of(l) {
	return (l[3] - l[1]) / (l[2] - l[0]);
}
