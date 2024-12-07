const dotData = {
	sphere: [],
	cube: [],
	bunny: [],
	dragon: [],
};

const colorMins = [75, 75, 75];
const colorMaxes = [255, 255, 255];

function shuffleArray(array) {
	for (let i = array.length - 1; i >= 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[array[i], array[j]] = [array[j], array[i]];
	}
}

// Sphere
function generateSphere(numPoints) {
	dotData.sphere = [];
	for (let i = 0; i < numPoints; i++) {
		const r = 0.1;
		let x = 2 * Math.random() - 1;
		let y = 2 * Math.random() - 1;
		let z = 2 * Math.random() - 1;

		while (Math.hypot(x, y, z) < 0.001) {
			x = Math.random();
			y = Math.random();
			z = Math.random();
		}

		const hyp = Math.hypot(x, y, z);
		x /= hyp;
		y /= hyp;
		z /= hyp;

		dotData.sphere.push([r * x, r * y, r * z]);
	}

	generateColorData(dotData.sphere);
}

// Cube
function generateCube(numPoints) {
	dotData.cube = [];
	for (let i = 0; i < numPoints; i++) {
		const cubeScale = 0.065;
		const a = cubeScale * (2 * Math.random() - 1);
		const b = cubeScale * (2 * Math.random() - 1);
		let x;
		let y;
		let z;

		const surfaceChoice = Math.floor(Math.random() * 6);

		switch (surfaceChoice) {
			case 0:
				x = a;
				y = b;
				z = cubeScale;
				break;
			case 1:
				x = a;
				y = b;
				z = -cubeScale;
				break;
			case 2:
				x = a;
				y = cubeScale;
				z = b;
				break;
			case 3:
				x = a;
				y = -cubeScale;
				z = b;
				break;
			case 4:
				x = cubeScale;
				y = a;
				z = b;
				break;
			case 5:
				x = -cubeScale;
				y = a;
				z = b;
				break;
		}

		dotData.cube.push([x, y, z]);
	}

	generateColorData(dotData.cube);
}

// Bunny
fetch("./bunny.ply")
	.then((data) => data.text())
	.then((data) => {
		const avg = [0, 0, 0];
		const points = [];

		const pointCloud = data.split("\n");
		for (let i = 0; i < pointCloud.length; i++) {
			line = pointCloud[i].trim().split(" ");
			if (line.length !== 5) continue;
			const bunnyPoint = line.slice(0, 3).map((el) => Number.parseFloat(el));
			temp = bunnyPoint[2];
			bunnyPoint[2] = bunnyPoint[1];
			bunnyPoint[1] = temp;
			bunnyPoint[1] *= -1;

			avg[0] += bunnyPoint[0];
			avg[1] += bunnyPoint[1];
			avg[2] += bunnyPoint[2];

			points.push(bunnyPoint);
		}

		avg[0] /= points.length;
		avg[1] /= points.length;
		avg[2] /= points.length;

		for (const point of points) {
			point[0] -= avg[0];
			point[1] -= avg[1];
			point[2] -= avg[2];
			dotData.bunny.push(point);
		}

		shuffleArray(dotData.bunny);
		generateColorData(dotData.bunny);
	});

// Dragon
fetch("./dragon.ply")
	.then((data) => data.text())
	.then((data) => {
		const avg = [0, 0, 0];
		const points = [];

		const pointCloud = data.split("\n");
		for (let i = 0; i < pointCloud.length; i++) {
			line = pointCloud[i].trim().split(" ");
			if (line.length !== 3) continue;
			const dragonPoint = line.slice(0, 3).map((el) => Number.parseFloat(el));
			temp = dragonPoint[2];
			dragonPoint[2] = dragonPoint[1];
			dragonPoint[1] = temp;
			dragonPoint[1] *= -1;

			avg[0] += dragonPoint[0];
			avg[1] += dragonPoint[1];
			avg[2] += dragonPoint[2];

			points.push(dragonPoint);
		}

		avg[0] /= points.length;
		avg[1] /= points.length;
		avg[2] /= points.length;

		for (const point of points) {
			point[0] -= avg[0];
			point[1] -= avg[1];
			point[2] -= avg[2];
			dotData.dragon.push(point);
		}

		shuffleArray(dotData.dragon);
		generateColorData(dotData.dragon);
	});

function generateColorData(pointArr) {
	const mins = [0, 0, 0];
	const maxes = [0, 0, 0];

	for (const point of pointArr) {
		for (let i = 0; i < 3; i++) {
			if (point[i] < mins[i]) mins[i] = point[i];
			if (point[i] > maxes[i]) maxes[i] = point[i];
		}
	}

	const pointColors = [];
	for (const point of pointArr) {
		const colorArr = [];
		for (let i = 0; i < 3; i++) {
			let temp = (point[i] - mins[i]) / (maxes[i] - mins[i]);
			temp *= colorMaxes[i] - colorMins[i];
			temp += colorMins[i];
			colorArr[i] = temp;
		}
		point.push(colorArr);
	}

	return pointColors;
}

function getDots(time) {
	let model = document.querySelector(
		".num-inputs > div:nth-child(1) > select",
	).value;

	if (model === "sphere") {
		model = dotData[model];
	} else if (model === "cube") {
		model = dotData[model];
	} else {
		const numPoints = document.querySelector(
			".controls > div:nth-child(2) input",
		).value;
		if (model === "bunny") {
			model = dotData[model].slice(0, numPoints);
		} else if (model === "dragon") {
			model = dotData[model].slice(0, numPoints);
		}
	}

	const dots = [];
	const colors = [];

	for (const dot of model) {
		let [x, y, z, c] = dot;

		const scale =
			Number.parseFloat(
				document.querySelector(".num-inputs > div:nth-child(3) > input").value,
			) || 0;

		x *= scale;
		y *= scale;
		z *= scale;
		colors.push(c);

		const rotationSpeed =
			Number.parseFloat(
				document.querySelector(".num-inputs > div:nth-child(2) > input").value,
			) || 0;

		if (rotationSpeed !== 0) {
			r = Math.hypot(x, y, z);
			theta = Math.atan2(y, x);
			alpha = Math.atan(z / Math.hypot(x, y));
			theta += (time / 10000) * rotationSpeed;

			z = r * Math.sin(alpha);
			x = Math.sqrt(r * r - z * z) * Math.cos(theta);
			y = Math.sqrt(r * r - z * z) * Math.sin(theta);
		}
		dots.push(new Matrix([[x], [y + 1], [z], [1]]));
	}

	return [dots, colors];
}
