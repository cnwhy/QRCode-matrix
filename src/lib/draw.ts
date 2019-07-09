import BitMatrix from 'bitmatrix';
// import BitMatrix = require('bitmatrix');

const drawLoop = function(
	matrix: BitMatrix,
	value: number,
	x: number,
	y: number,
	offsetX: number,
	offsetY: number,
	length: number
): void {
	let { width, height } = matrix;
	let v = value ? 1 : 0;
	let _x = x;
	let _y = y;
	if (length <= 0) return;
	while (length--) {
		if (_x >= 0 && _x < width && _y >= 0 && _y < height) {
			matrix.set(_x, _y, v);
		}
		_x += offsetX;
		_y += offsetY;
	}
};

//bit矩阵中 绘一个矩形
const rectBorder = function(
	matrix: BitMatrix,
	val: number,
	row: number,
	col: number,
	width: number,
	height: number
) {
	if (width < 0 || height < 0) return;
	let set = drawLoop.bind(null, matrix, val ? 1 : 0);
	if (width === 1) {
		return set(row, col, 0, 1, height);
	}
	if (height === 1) {
		return set(row, col, 1, 0, width);
	}
	let _w = width - 1;
	let _h = height - 1;
	set(row, col, 1, 0, _w);
	set((row += width - 1), col, 0, 1, _h);
	set(row, (col += height - 1), -1, 0, _w);
	set((row -= width - 1), col, 0, -1, _h);
};

//bit矩阵中 填充一个矩形
const fillRect = function(
	matrix: BitMatrix,
	val: number,
	row: number,
	col: number,
	width: number,
	height: number
) {
	let { width: _width, height: _height } = matrix;
	let v = val ? 1 : 0;
	let _x = row > 0 ? row : 0;
	let _y = col > 0 ? col : 0;
	let maxX = Math.min(row + width, _width);
	let maxY = Math.min(col + height, _height);
	for (let y = _y; y < maxY; y++) {
		for (let x = _x; x < maxX; x++) {
			matrix.set(x, y, v);
		}
	}
};

export {
	rectBorder,
	fillRect
}
