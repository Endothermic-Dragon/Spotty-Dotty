const canvas = document.getElementsByTagName("canvas")[0];
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

window.cameraData = {
	disp: [0, 0, 0],
	dir: 0,
	tilt: 0,
};

window.keyData = {
	// Front is 1, back is -1
	frontBack: 0,
	// Right is 1, left is -1
	rightLeft: 0,
	// Up is 1, down is -1
	upDown: 0,
};

window.addEventListener("resize", () => {
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
});

document.querySelector("select").addEventListener("change", (e) => {
	const model = e.target.value;
	const pointsEl = document.querySelector(".controls > div:nth-child(2) input");
	if (["sphere", "cube"].includes(model)) {
		document.querySelector(".can-hide").style.display = "none";
		if (model === "sphere") {
			pointsEl.value = 7500;
			generateSphere(7500);
		} else if (model === "cube") {
			pointsEl.value = 10000;
			generateCube(10000);
		}
	} else {
		document.querySelector(".can-hide").style.display = "inline-block";
		const totalPointsEl = document.querySelector(".can-hide > input");
		if (model === "bunny") {
			pointsEl.value = Math.floor(35947 / 5);
			totalPointsEl.value = 35947;
		} else if (model === "dragon") {
			pointsEl.value = Math.floor(437645 / 50);
			totalPointsEl.value = 437645;
		}
		document
			.querySelector(".controls > div:nth-child(2) input")
			.dispatchEvent(new Event("input"));
	}
});

document
	.querySelector(".controls > div:nth-child(2) input")
	.addEventListener("input", (e) => {
		const model = document.querySelector("select").value;
		let numPoints;

		if (model === "sphere") return generateSphere(e.target.value);
		if (model === "cube") return generateCube(e.target.value);

		if (model === "bunny") numPoints = 35947;
		else if (model === "dragon") numPoints = 437645;

		document.querySelector(
			".controls > div:nth-child(2) input:nth-child(2)",
		).value = (e.target.value / numPoints).toFixed(4);
	});

document
	.querySelector(".controls > div:nth-child(2) input:nth-child(2)")
	.addEventListener("input", (e) => {
		const model = document.querySelector("select").value;
		let numPoints;
		if (model === "bunny") numPoints = 35947;
		else if (model === "dragon") numPoints = 437645;
		else return;

		document.querySelector(".controls > div:nth-child(2) input").value =
			e.target.value * numPoints;
	});

document.querySelector("select").dispatchEvent(new Event("change"));

function getDispMat() {
	const [x, y, z] = cameraData.disp;
	return new Matrix([
		[1, 0, 0, -x],
		[0, 1, 0, -y],
		[0, 0, 1, -z],
		[0, 0, 0, 1],
	]);
}

function getDirMat() {
	theta = cameraData.dir;
	return new Matrix([
		[Math.cos(theta), Math.sin(theta), 0, 0],
		[-Math.sin(theta), Math.cos(theta), 0, 0],
		[0, 0, 1, 0],
		[0, 0, 0, 1],
	]);
}

function getTiltMat() {
	theta = cameraData.tilt;
	return new Matrix([
		[1, 0, 0, 0],
		[0, Math.cos(theta), Math.sin(theta), 0],
		[0, -Math.sin(theta), Math.cos(theta), 0],
		[0, 0, 0, 1],
	]);
}

function drawDot(dot) {
	let [x, y, z] = dot;

	if (y > 0.001) {
		dist = Math.hypot(x, y + 0.5, z);
		x /= y;
		z /= y;

		// Transform into canvas's coordinate system
		x *= 1600;
		x += canvas.width / 2;
		z = canvas.height / 2 - z * 1600;

		ctx.beginPath();

		const dotSize =
			Number.parseFloat(
				document.querySelector(".num-inputs > div:nth-child(4) > input").value,
			) || 0;

		ctx.ellipse(x, z, dotSize / dist, dotSize / dist, 0, 0, 2 * Math.PI);
		ctx.fill();
	}
}

window.addEventListener("keydown", (e) => {
	if (document.activeElement.type === "number") return;

	const key = e.key.toLowerCase();

	if (["w", "a", "s", "d", " ", "Shift"].includes(key)) e.preventDefault();

	if (key === "w") keyData.frontBack = 1;
	else if (key === "s") keyData.frontBack = -1;
	else if (key === "d") keyData.rightLeft = 1;
	else if (key === "a") keyData.rightLeft = -1;
	else if (key === " " && !e.shiftKey) keyData.upDown = 1;
	else if (key === " " && e.shiftKey) keyData.upDown = -1;
	else if (key === "Shift" && keyData.upDown === -1) keyData.upDown = 1;
});

window.addEventListener("keyup", (e) => {
	if (document.activeElement.type === "number") return;

	const key = e.key.toLowerCase();
	if (key === "w" && keyData.frontBack === 1) keyData.frontBack = 0;
	else if (key === "s" && keyData.frontBack === -1) keyData.frontBack = 0;
	else if (key === "d" && keyData.rightLeft === 1) keyData.rightLeft = 0;
	else if (key === "a" && keyData.rightLeft === -1) keyData.rightLeft = 0;
	else if (key === " ") keyData.upDown = 0;
	else if (key === "Shift" && keyData.upDown === -1) keyData.upDown = 1;
});

function updateCameraAngles(e) {
	cameraData.dir -= e.movementX / 600;
	cameraData.tilt -= e.movementY / 600;
	cameraData.tilt = Math.min(Math.PI / 2, cameraData.tilt);
	cameraData.tilt = Math.max(-Math.PI / 2, cameraData.tilt);
}

document.addEventListener("pointerlockchange", () => {
	if (document.pointerLockElement === canvas) {
		document.addEventListener("mousemove", updateCameraAngles);
		document.querySelector(".controls").style.display = "none";
	} else {
		document.removeEventListener("mousemove", updateCameraAngles);
		document.querySelector(".controls").style.display = "block";
	}
});

canvas.addEventListener("click", async () => {
	await canvas.requestPointerLock();
});

let lastTime = 0;

function drawLoop(time) {
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	const dt = (time - lastTime) / 1500;
	lastTime = time;

	cameraData.disp[0] +=
		dt *
		(keyData.rightLeft * Math.cos(cameraData.dir) -
			keyData.frontBack * Math.sin(cameraData.dir));
	cameraData.disp[1] +=
		dt *
		(keyData.frontBack * Math.cos(cameraData.dir) +
			keyData.rightLeft * Math.sin(cameraData.dir));
	cameraData.disp[2] += dt * keyData.upDown;

	let [dots, colors] = getDots(time);
	dots = dots.map((dot) =>
		getTiltMat().m(getDirMat()).m(getDispMat()).m(dot).t().data[0].slice(0, 3),
	);
	dots.forEach((el, i) => el.push(colors[i]));
	colors = [];
	dots.sort(
		(a, b) => Math.hypot(b[0], b[1], b[2]) - Math.hypot(a[0], a[1], a[2]),
	);
	dots = dots.map((el) => {
		colors.push(el[3]);
		return el.slice(0, 3);
	});

	const toColor = document.querySelector(
		".controls > div:nth-child(3) > input",
	).checked;
	for (let i = 0; i < dots.length; i++) {
		const dot = dots[i];
		if (toColor) {
			const color = colors[i];
			ctx.fillStyle = `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
		} else {
			ctx.fillStyle = "white";
		}

		drawDot(dot);
	}

	window.requestAnimationFrame(drawLoop);
}

window.requestAnimationFrame(drawLoop);
