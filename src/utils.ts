// var bch = require('./bch');
import BitMatrix from 'bitmatrix/lib/BitMatrix';
import BitBuffer from './lib/BitBuffer';
import QRMatrix from './lib/QRMatrix';
import {fillRect, rectBorder} from './lib/draw'
import {
	QRErrorCorrectionLevel,
	QRMode,
	getBCHTypeInfo,
	getRSBlocks,
	getBCHTypeNumber,
	getLengthInBits,
	getBufferForModes,
	getMaxDataCount,
	createData
} from './lib/bch-encode';


const QRMaskPattern = {
	PATTERN000: 0,
	PATTERN001: 1,
	PATTERN010: 2,
	PATTERN011: 3,
	PATTERN100: 4,
	PATTERN101: 5,
	PATTERN110: 6,
	PATTERN111: 7
};

const PATTERN_POSITION_TABLE: Uint8Array[] = [
	[],
	[6, 18],
	[6, 22],
	[6, 26],
	[6, 30],
	[6, 34],
	[6, 22, 38],
	[6, 24, 42],
	[6, 26, 46],
	[6, 28, 50],
	[6, 30, 54],
	[6, 32, 58],
	[6, 34, 62],
	[6, 26, 46, 66],
	[6, 26, 48, 70],
	[6, 26, 50, 74],
	[6, 30, 54, 78],
	[6, 30, 56, 82],
	[6, 30, 58, 86],
	[6, 34, 62, 90],
	[6, 28, 50, 72, 94],
	[6, 26, 50, 74, 98],
	[6, 30, 54, 78, 102],
	[6, 28, 54, 80, 106],
	[6, 32, 58, 84, 110],
	[6, 30, 58, 86, 114],
	[6, 34, 62, 90, 118],
	[6, 26, 50, 74, 98, 122],
	[6, 30, 54, 78, 102, 126],
	[6, 26, 52, 78, 104, 130],
	[6, 30, 56, 82, 108, 134],
	[6, 34, 60, 86, 112, 138],
	[6, 30, 58, 86, 114, 142],
	[6, 34, 62, 90, 118, 146],
	[6, 30, 54, 78, 102, 126, 150],
	[6, 24, 50, 76, 102, 128, 154],
	[6, 28, 54, 80, 106, 132, 158],
	[6, 32, 58, 84, 110, 136, 162],
	[6, 26, 54, 82, 110, 138, 166],
	[6, 30, 58, 86, 114, 142, 170]
].map(v => new Uint8Array(v));

// 获取掩模函数
const getQRMaskFunction: (a: number) => (a: number, b: number) => boolean = (function() {
	const QRMaskFunctions: ((a: number, b: number) => boolean)[] = [
		function(i: number, j: number) {
			return (i + j) % 2 == 0;
		},
		function(i: number, j: number) {
			return i % 2 == 0;
		},
		function(i: number, j: number) {
			return j % 3 == 0;
		},
		function(i: number, j: number) {
			return (i + j) % 3 == 0;
		},
		function(i: number, j: number) {
			return (Math.floor(i / 2) + Math.floor(j / 3)) % 2 == 0;
		},
		function(i: number, j: number) {
			return ((i * j) % 2) + ((i * j) % 3) == 0;
		},
		function(i: number, j: number) {
			return (((i * j) % 2) + ((i * j) % 3)) % 2 == 0;
		},
		function(i: number, j: number) {
			return (((i * j) % 3) + ((i + j) % 2)) % 2 == 0;
		}
	];
	return function(maskPattern: number) {
		var fn = QRMaskFunctions[maskPattern];
		if (!fn) throw new Error('maskPattern:' + maskPattern);
		return fn;
	};
})();

// 通过size反推QR码版本
function size2TypeNumber(size: number) {
	return (size - 17) / 4;
}

// 通过QR码版本计算矩阵size
function typeNumber2Size(typeNumber: number) {
	return typeNumber * 4 + 17
}

// 在指定位置 绘制一个侦测图 ◈
const setupPositionProbePattern = function(matrix: BitMatrix, row: number, col: number) {
	rectBorder(matrix, 0, row - 1, col - 1, 9, 9);
	rectBorder(matrix, 1, row, col, 7, 7);
	rectBorder(matrix, 0, row + 1, col + 1, 5, 5);
	fillRect(matrix, 1, row + 2, col + 2, 3, 3);
};

// 填充所有侦测图 
const setupAllPositionProbePattern = function(matrix: QRMatrix) {
	let size = matrix.size;
	setupPositionProbePattern(matrix, 0, 0);
	setupPositionProbePattern(matrix, size - 7, 0);
	setupPositionProbePattern(matrix, 0, size - 7);
};

// 填充校正图
const setupPositionAdjustPattern = function(matrix: QRMatrix, typeNumber?: number) {
	let { size } = matrix;
	typeNumber = typeNumber || size2TypeNumber(size);
	let pos = PATTERN_POSITION_TABLE[typeNumber - 1];
	for (let i = 0; i < pos.length; i++) {
		for (let j = 0; j < pos.length; j++) {
			let row = pos[i];
			let col = pos[j];
			// if (matrix[row][col] != null) continue;
			if (row < 9 || col < 9) {
				let m = size - 9;
				if ((row < 9 || row > m) && (col < 9 || col > m)) continue;
			}
			for (let r = -2; r <= 2; r++) {
				for (let c = -2; c <= 2; c++) {
					if (r == -2 || r == 2 || c == -2 || c == 2 || (r == 0 && c == 0)) {
						// matrix[row + r][col + c] = true;
						matrix.set(col + c, row + r, 1);
					} else {
						matrix.set(col + c, row + r, 0);
						// matrix[row + r][col + c] = false;
					}
				}
			}
		}
	}
};

// 填充定位图
const setupTimingPattern = function(matrix: BitMatrix) {
	let mapLength = matrix.width;
	for (let r = 8; r < mapLength - 8; r += 1) {
		matrix.set(r, 6, r % 2 == 0);
		matrix.set(6, r, r % 2 == 0);
	}
};

// 填充格式信息
const setupTypeInfo = function(
	matrix: BitMatrix,
	test: boolean,
	errorCorrectionLevel: number,
	maskPattern: number
) {
	let mapLength = matrix.width;
	let data = (errorCorrectionLevel << 3) | maskPattern;
	let bits = getBCHTypeInfo(data);
	// vertical
	for (let i = 0; i < 15; i += 1) {
		let mod = !test && ((bits >> i) & 1) == 1;
		if (i < 6) {
			matrix.set(8, i, mod);
		} else if (i < 8) {
			matrix.set(8, i + 1, mod);
		} else {
			matrix.set(8, mapLength - 15 + i, mod);
		}

		if (i < 8) {
			matrix.set(mapLength - i - 1, 8, mod);
		} else if (i < 9) {
			matrix.set(15 - i, 8, mod);
		} else {
			matrix.set(15 - i - 1, 8, mod);
		}
	}

	// horizontal
	// for (var i = 0; i < 15; i += 1) {
	// 	var mod = !test && ((bits >> i) & 1) == 1;
	// 	if (i < 8) {
	// 		matrix.set(mapLength - i - 1,8,mod);
	// 	} else if (i < 9) {
	// 		matrix.set(15 - i,8,mod);
	// 	} else {
	// 		matrix.set(15 - i - 1,8,mod);
	// 	}
	// }

	// fixed module
	matrix.set(8, mapLength - 8, !test);
};

// 填充版本信息
var setupTypeNumber = function(matrix: BitMatrix, test: boolean, typeNumber?: number) {
	let mapLength = matrix.width;
	typeNumber = typeNumber || size2TypeNumber(mapLength);
	let bits = getBCHTypeNumber(typeNumber);
	for (let i = 0; i < 18; i += 1) {
		let mod = !test && ((bits >> i) & 1) == 1;
		// matrix[Math.floor(i / 3)][(i % 3) + mapLength - 8 - 3] = mod;
		matrix.set((i % 3) + mapLength - 8 - 3, Math.floor(i / 3), mod);
		matrix.set(Math.floor(i / 3), (i % 3) + mapLength - 8 - 3, mod);
	}
};

// 生成空矩阵
function mapInit(size: number): QRMatrix {
	return new QRMatrix(size);
}

const MatrixCache:QRMatrix[] = [];
function createQRmatrix(typeNumber:number):QRMatrix{
	let size = typeNumber2Size(typeNumber);
	let matrix = mapInit(size);
	setupAllPositionProbePattern(matrix);
	//填充矫正位图
	setupPositionAdjustPattern(matrix);
	//填充定位图
	setupTimingPattern(matrix);
	return matrix;
}
function getBaseQRMatrix(typeNumber:number):QRMatrix{
	let matrix =  MatrixCache[typeNumber] || (MatrixCache[typeNumber] = createQRmatrix(typeNumber));
	return matrix.clone();
}



// 拷贝矩阵
function copyMap(matrix: QRMatrix): QRMatrix {
	return matrix.clone();
}

//矩阵对比操作
function compareMap(m1: QRMatrix, m2: QRMatrix, type: string): QRMatrix {
	type = type || 'and';
	if (m1.total !== m2.total) throw 'Different size';
	let matrix = new QRMatrix(m1.size);

	let _d1 = m1.getPrototypeData();
	let _m1 = m1.markMatrix.getPrototypeData();

	let _d2 = m2.getPrototypeData();
	let _m2 = m2.markMatrix.getPrototypeData();

	let md = matrix.getPrototypeData();
	let _md = matrix.markMatrix.getPrototypeData();

	for (let i = 0; i < _d1.length; i++) {
		switch (type) {
			case 'or':
			case '|':
				var mk = (_md[i] = _m1[i] | _m2[i]);
				_md[i] = (_m1[i] | _m2[i]) & mk;
				break;
			case 'xor':
			case '^':
				var mk = (_md[i] = _m1[i] ^ _m2[i]);
				md[i] = (_d1[i] ^ _d2[i]) & mk;
				break;
			case 'and':
			case '&':
				var mk = (_md[i] = _m1[i] & _m2[i]);
				md[i] = _d1[i] & _d2[i] & mk;
				break;
			default:
				throw 'type err!';
		}
	}
	return matrix;
}

// 矩阵分布评分 (筛选最优掩模方案)
const getLostPoint = function(matrix: BitMatrix): number {
	let size = matrix.width;
	let lostPoint = 0;
	let isDark = function(row, col) {
		return matrix.get(col, row);
	};

	// LEVEL1
	for (let row = 0; row < size; row += 1) {
		for (let col = 0; col < size; col += 1) {
			let sameCount = 0;
			let dark = isDark(row, col);
			for (let r = -1; r <= 1; r += 1) {
				if (row + r < 0 || size <= row + r) {
					continue;
				}
				for (let c = -1; c <= 1; c += 1) {
					if (col + c < 0 || size <= col + c) {
						continue;
					}
					if (r == 0 && c == 0) {
						continue;
					}
					if (dark == isDark(row + r, col + c)) {
						sameCount += 1;
					}
				}
			}
			if (sameCount > 5) {
				lostPoint += 3 + sameCount - 5;
			}
		}
	}

	// LEVEL2
	for (var row = 0; row < size - 1; row += 1) {
		for (var col = 0; col < size - 1; col += 1) {
			var count = 0;
			if (isDark(row, col)) count += 1;
			if (isDark(row + 1, col)) count += 1;
			if (isDark(row, col + 1)) count += 1;
			if (isDark(row + 1, col + 1)) count += 1;
			if (count == 0 || count == 4) {
				lostPoint += 3;
			}
		}
	}

	// LEVEL3
	for (var row = 0; row < size; row += 1) {
		for (var col = 0; col < size - 6; col += 1) {
			if (
				isDark(row, col) &&
				!isDark(row, col + 1) &&
				isDark(row, col + 2) &&
				isDark(row, col + 3) &&
				isDark(row, col + 4) &&
				!isDark(row, col + 5) &&
				isDark(row, col + 6)
			) {
				lostPoint += 40;
			}
		}
	}

	for (var col = 0; col < size; col += 1) {
		for (var row = 0; row < size - 6; row += 1) {
			if (
				isDark(row, col) &&
				!isDark(row + 1, col) &&
				isDark(row + 2, col) &&
				isDark(row + 3, col) &&
				isDark(row + 4, col) &&
				!isDark(row + 5, col) &&
				isDark(row + 6, col)
			) {
				lostPoint += 40;
			}
		}
	}

	// LEVEL4

	var darkCount = 0;

	for (var col = 0; col < size; col += 1) {
		for (var row = 0; row < size; row += 1) {
			if (isDark(row, col)) {
				darkCount += 1;
			}
		}
	}

	var ratio = Math.abs((100 * darkCount) / size / size - 50) / 5;
	lostPoint += ratio * 10;

	return lostPoint;
};

// 填充数据
const setupData = function(matrix: QRMatrix, data: number[], maskPattern: number) {
	let _moduleCount = matrix.width;
	let inc = -1;
	let row = _moduleCount - 1;
	let bitIndex = 7;
	let byteIndex = 0;
	let maskFunc = getQRMaskFunction(maskPattern);

	for (var col = _moduleCount - 1; col > 0; col -= 2) {
		if (col == 6) col -= 1;
		while (true) {
			for (var c = 0; c < 2; c += 1) {
				if (!matrix.has(col - c, row)) {
					var dark = false;
					if (byteIndex < data.length) {
						dark = ((data[byteIndex] >>> bitIndex) & 1) == 1;
					}
					var mask = maskFunc(row, col - c);
					if (mask) {
						dark = !dark;
					}
					matrix.set(col - c, row, dark);
					bitIndex -= 1;
					if (bitIndex == -1) {
						byteIndex += 1;
						bitIndex = 7;
					}
				}
			}
			row += inc;
			if (row < 0 || _moduleCount <= row) {
				row -= inc;
				inc = -inc;
				break;
			}
		}
	}
};

export {
	QRMode,
	QRErrorCorrectionLevel,
	QRMaskPattern,
	BitBuffer,
	getBaseQRMatrix,
	setupAllPositionProbePattern,
	setupPositionAdjustPattern,
	setupTimingPattern,
	setupTypeInfo,
	setupTypeNumber,
	mapInit,
	copyMap,
	compareMap,
	createData,
	setupData,
	getLengthInBits,
	getLostPoint,
	getRSBlocks,
	getBufferForModes,
	getMaxDataCount
};
