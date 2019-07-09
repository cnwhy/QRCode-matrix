import BitBuffer from './BitBuffer';

const QRErrorCorrectionLevel = {
	L: 1,
	M: 0,
	Q: 3,
	H: 2
};

const QRMode = {
	MODE_NUMBER: 1 << 0,
	MODE_ALPHA_NUM: 1 << 1,
	MODE_8BIT_BYTE: 1 << 2,
	MODE_KANJI: 1 << 3
};

const G15: number = (1 << 10) | (1 << 8) | (1 << 5) | (1 << 4) | (1 << 2) | (1 << 1) | (1 << 0);
const G18: number = (1 << 12) | (1 << 11) | (1 << 10) | (1 << 9) | (1 << 8) | (1 << 5) | (1 << 2) | (1 << 0);
const G15_MASK: number = (1 << 14) | (1 << 12) | (1 << 10) | (1 << 4) | (1 << 1);
const G15_BCH_DIGIT = getBCHDigit(G15);
const G18_BCH_DIGIT = getBCHDigit(G18);

const RS_BLOCK_TABLE: Uint8Array[] = [
	// L
	// M
	// Q
	// H

	// 1
	[1, 26, 19],
	[1, 26, 16],
	[1, 26, 13],
	[1, 26, 9],

	// 2
	[1, 44, 34],
	[1, 44, 28],
	[1, 44, 22],
	[1, 44, 16],

	// 3
	[1, 70, 55],
	[1, 70, 44],
	[2, 35, 17],
	[2, 35, 13],

	// 4
	[1, 100, 80],
	[2, 50, 32],
	[2, 50, 24],
	[4, 25, 9],

	// 5
	[1, 134, 108],
	[2, 67, 43],
	[2, 33, 15, 2, 34, 16],
	[2, 33, 11, 2, 34, 12],

	// 6
	[2, 86, 68],
	[4, 43, 27],
	[4, 43, 19],
	[4, 43, 15],

	// 7
	[2, 98, 78],
	[4, 49, 31],
	[2, 32, 14, 4, 33, 15],
	[4, 39, 13, 1, 40, 14],

	// 8
	[2, 121, 97],
	[2, 60, 38, 2, 61, 39],
	[4, 40, 18, 2, 41, 19],
	[4, 40, 14, 2, 41, 15],

	// 9
	[2, 146, 116],
	[3, 58, 36, 2, 59, 37],
	[4, 36, 16, 4, 37, 17],
	[4, 36, 12, 4, 37, 13],

	// 10
	[2, 86, 68, 2, 87, 69],
	[4, 69, 43, 1, 70, 44],
	[6, 43, 19, 2, 44, 20],
	[6, 43, 15, 2, 44, 16],

	// 11
	[4, 101, 81],
	[1, 80, 50, 4, 81, 51],
	[4, 50, 22, 4, 51, 23],
	[3, 36, 12, 8, 37, 13],

	// 12
	[2, 116, 92, 2, 117, 93],
	[6, 58, 36, 2, 59, 37],
	[4, 46, 20, 6, 47, 21],
	[7, 42, 14, 4, 43, 15],

	// 13
	[4, 133, 107],
	[8, 59, 37, 1, 60, 38],
	[8, 44, 20, 4, 45, 21],
	[12, 33, 11, 4, 34, 12],

	// 14
	[3, 145, 115, 1, 146, 116],
	[4, 64, 40, 5, 65, 41],
	[11, 36, 16, 5, 37, 17],
	[11, 36, 12, 5, 37, 13],

	// 15
	[5, 109, 87, 1, 110, 88],
	[5, 65, 41, 5, 66, 42],
	[5, 54, 24, 7, 55, 25],
	[11, 36, 12, 7, 37, 13],

	// 16
	[5, 122, 98, 1, 123, 99],
	[7, 73, 45, 3, 74, 46],
	[15, 43, 19, 2, 44, 20],
	[3, 45, 15, 13, 46, 16],

	// 17
	[1, 135, 107, 5, 136, 108],
	[10, 74, 46, 1, 75, 47],
	[1, 50, 22, 15, 51, 23],
	[2, 42, 14, 17, 43, 15],

	// 18
	[5, 150, 120, 1, 151, 121],
	[9, 69, 43, 4, 70, 44],
	[17, 50, 22, 1, 51, 23],
	[2, 42, 14, 19, 43, 15],

	// 19
	[3, 141, 113, 4, 142, 114],
	[3, 70, 44, 11, 71, 45],
	[17, 47, 21, 4, 48, 22],
	[9, 39, 13, 16, 40, 14],

	// 20
	[3, 135, 107, 5, 136, 108],
	[3, 67, 41, 13, 68, 42],
	[15, 54, 24, 5, 55, 25],
	[15, 43, 15, 10, 44, 16],

	// 21
	[4, 144, 116, 4, 145, 117],
	[17, 68, 42],
	[17, 50, 22, 6, 51, 23],
	[19, 46, 16, 6, 47, 17],

	// 22
	[2, 139, 111, 7, 140, 112],
	[17, 74, 46],
	[7, 54, 24, 16, 55, 25],
	[34, 37, 13],

	// 23
	[4, 151, 121, 5, 152, 122],
	[4, 75, 47, 14, 76, 48],
	[11, 54, 24, 14, 55, 25],
	[16, 45, 15, 14, 46, 16],

	// 24
	[6, 147, 117, 4, 148, 118],
	[6, 73, 45, 14, 74, 46],
	[11, 54, 24, 16, 55, 25],
	[30, 46, 16, 2, 47, 17],

	// 25
	[8, 132, 106, 4, 133, 107],
	[8, 75, 47, 13, 76, 48],
	[7, 54, 24, 22, 55, 25],
	[22, 45, 15, 13, 46, 16],

	// 26
	[10, 142, 114, 2, 143, 115],
	[19, 74, 46, 4, 75, 47],
	[28, 50, 22, 6, 51, 23],
	[33, 46, 16, 4, 47, 17],

	// 27
	[8, 152, 122, 4, 153, 123],
	[22, 73, 45, 3, 74, 46],
	[8, 53, 23, 26, 54, 24],
	[12, 45, 15, 28, 46, 16],

	// 28
	[3, 147, 117, 10, 148, 118],
	[3, 73, 45, 23, 74, 46],
	[4, 54, 24, 31, 55, 25],
	[11, 45, 15, 31, 46, 16],

	// 29
	[7, 146, 116, 7, 147, 117],
	[21, 73, 45, 7, 74, 46],
	[1, 53, 23, 37, 54, 24],
	[19, 45, 15, 26, 46, 16],

	// 30
	[5, 145, 115, 10, 146, 116],
	[19, 75, 47, 10, 76, 48],
	[15, 54, 24, 25, 55, 25],
	[23, 45, 15, 25, 46, 16],

	// 31
	[13, 145, 115, 3, 146, 116],
	[2, 74, 46, 29, 75, 47],
	[42, 54, 24, 1, 55, 25],
	[23, 45, 15, 28, 46, 16],

	// 32
	[17, 145, 115],
	[10, 74, 46, 23, 75, 47],
	[10, 54, 24, 35, 55, 25],
	[19, 45, 15, 35, 46, 16],

	// 33
	[17, 145, 115, 1, 146, 116],
	[14, 74, 46, 21, 75, 47],
	[29, 54, 24, 19, 55, 25],
	[11, 45, 15, 46, 46, 16],

	// 34
	[13, 145, 115, 6, 146, 116],
	[14, 74, 46, 23, 75, 47],
	[44, 54, 24, 7, 55, 25],
	[59, 46, 16, 1, 47, 17],

	// 35
	[12, 151, 121, 7, 152, 122],
	[12, 75, 47, 26, 76, 48],
	[39, 54, 24, 14, 55, 25],
	[22, 45, 15, 41, 46, 16],

	// 36
	[6, 151, 121, 14, 152, 122],
	[6, 75, 47, 34, 76, 48],
	[46, 54, 24, 10, 55, 25],
	[2, 45, 15, 64, 46, 16],

	// 37
	[17, 152, 122, 4, 153, 123],
	[29, 74, 46, 14, 75, 47],
	[49, 54, 24, 10, 55, 25],
	[24, 45, 15, 46, 46, 16],

	// 38
	[4, 152, 122, 18, 153, 123],
	[13, 74, 46, 32, 75, 47],
	[48, 54, 24, 14, 55, 25],
	[42, 45, 15, 32, 46, 16],

	// 39
	[20, 147, 117, 4, 148, 118],
	[40, 75, 47, 7, 76, 48],
	[43, 54, 24, 22, 55, 25],
	[10, 45, 15, 67, 46, 16],

	// 40
	[19, 148, 118, 6, 149, 119],
	[18, 75, 47, 31, 76, 48],
	[34, 54, 24, 34, 55, 25],
	[20, 45, 15, 61, 46, 16]
].map(arr => new Uint8Array(arr));

//内存能省一点是一点
// if(typeof Uint8Array == 'function'){
// 	RS_BLOCK_TABLE = RS_BLOCK_TABLE.map(arr=>new Uint8Array(arr));
// }

interface RSBlock {
	totalCount: number;
	dataCount: number;
}

interface mode {
	getMode(): number;
	getLength(): number;
	write(b: BitBuffer): mode;
}

// 获取数据块长度
const getLengthInBits: (mode: number | string, typeNumber: number) => number = (function() {
	// 各模式数据块长度
	const BITS_LENGTH_LIST = {
		[QRMode.MODE_NUMBER]: [10, 12, 14],
		[QRMode.MODE_ALPHA_NUM]: [9, 11, 13],
		[QRMode.MODE_8BIT_BYTE]: [8, 16, 16],
		[QRMode.MODE_KANJI]: [8, 10, 12]
	};
	return function(mode: number | string, type: number): number {
		if (1 <= type && type <= 40) {
			var lengths = BITS_LENGTH_LIST[mode];
			if (!lengths) throw 'mode:' + mode;
			var index = type <= 9 ? 0 : type <= 26 ? 1 : 2;
			return lengths[index];
		} else {
			throw new Error('type:' + type);
		}
	};
})();

// 获取最高位
function getBCHDigit(data: number): number {
	let digit = 0;
	while (data != 0) {
		digit++;
		data >>>= 1;
	}
	return digit;
}

function getBCHTypeInfo(data: number): number {
	let d = data << 10;
	while (getBCHDigit(d) >= G15_BCH_DIGIT) {
		d ^= G15 << (getBCHDigit(d) - G15_BCH_DIGIT);
	}
	return ((data << 10) | d) ^ G15_MASK;
}

function getBCHTypeNumber(data: number): number {
	var d = data << 12;
	while (getBCHDigit(d) - G18_BCH_DIGIT >= 0) {
		d ^= G18 << (getBCHDigit(d) - G18_BCH_DIGIT);
	}
	return (data << 12) | d;
}

function getRsBlockTable(typeNumber: number, errorCorrectionLevel: number): Uint8Array {
	switch (errorCorrectionLevel) {
		case QRErrorCorrectionLevel.L:
			return RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 0];
		case QRErrorCorrectionLevel.M:
			return RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 1];
		case QRErrorCorrectionLevel.Q:
			return RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 2];
		case QRErrorCorrectionLevel.H:
			return RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 3];
		default:
			throw 'bad rs block @ typeNumber:' + typeNumber + '/errorCorrectionLevel:' + errorCorrectionLevel;
	}
}

function getRSBlocks(typeNumber: number, errorCorrectionLevel: number): RSBlock[] {
	let rsBlock: Uint8Array = getRsBlockTable(typeNumber, errorCorrectionLevel);
	let length: number = rsBlock.length / 3;
	let list: RSBlock[] = [];
	for (let i = 0; i < length; i += 1) {
		let count = rsBlock[i * 3 + 0];
		let totalCount = rsBlock[i * 3 + 1];
		let dataCount = rsBlock[i * 3 + 2];

		for (let j = 0; j < count; j += 1) {
			list.push({ totalCount, dataCount });
		}
	}
	return list;
}

const QRMath = (function() {
	const EXP_TABLE = new Uint8Array(256);
	const LOG_TABLE = new Uint8Array(256);

	// initialize tables
	for (let i = 0; i < 8; i += 1) {
		EXP_TABLE[i] = 1 << i;
	}
	for (let i = 8; i < 256; i += 1) {
		EXP_TABLE[i] = EXP_TABLE[i - 4] ^ EXP_TABLE[i - 5] ^ EXP_TABLE[i - 6] ^ EXP_TABLE[i - 8];
	}
	for (let i = 0; i < 255; i += 1) {
		LOG_TABLE[EXP_TABLE[i]] = i;
	}

	let _this = {
		glog: function(n) {
			if (n < 1) {
				throw 'glog(' + n + ')';
			}

			return LOG_TABLE[n];
		},
		gexp: function(n) {
			while (n < 0) {
				n += 255;
			}

			while (n >= 256) {
				n -= 255;
			}

			return EXP_TABLE[n];
		}
	};

	return _this;
})();

const qrPolynomial = function(num, shift) {
	if (typeof num.length == 'undefined') {
		throw num.length + '/' + shift;
	}

	let _num = (function() {
		let offset = 0;
		while (offset < num.length && num[offset] == 0) {
			offset += 1;
		}
		let _num = new Array(num.length - offset + shift);
		for (let i = 0; i < num.length - offset; i += 1) {
			_num[i] = num[i + offset];
		}
		return _num;
	})();

	let _this = {
		getAt: function(index) {
			return _num[index];
		},
		getLength: function() {
			return _num.length;
		},
		multiply: function(e) {
			let num = new Array(_this.getLength() + e.getLength() - 1);
			for (let i = 0; i < _this.getLength(); i += 1) {
				for (let j = 0; j < e.getLength(); j += 1) {
					num[i + j] ^= QRMath.gexp(QRMath.glog(_this.getAt(i)) + QRMath.glog(e.getAt(j)));
				}
			}
			return qrPolynomial(num, 0);
		},
		mod: function(e) {
			if (_this.getLength() - e.getLength() < 0) {
				return _this;
			}

			let ratio = QRMath.glog(_this.getAt(0)) - QRMath.glog(e.getAt(0));

			let num = new Array(_this.getLength());
			for (let i = 0; i < _this.getLength(); i += 1) {
				num[i] = _this.getAt(i);
			}

			for (let i = 0; i < e.getLength(); i += 1) {
				num[i] ^= QRMath.gexp(QRMath.glog(e.getAt(i)) + ratio);
			}

			// recursive call
			return qrPolynomial(num, 0).mod(e);
		}
	};
	return _this;
};

//纠错相关
const getErrorCorrectPolynomial = function(errorCorrectLength) {
	let a = qrPolynomial([1], 0);
	for (let i = 0; i < errorCorrectLength; i += 1) {
		a = a.multiply(qrPolynomial([1, QRMath.gexp(i)], 0));
	}
	return a;
};

//RS编码
const createBytes = function(buffer: BitBuffer, rsBlocks: RSBlock[]) {
	let offset = 0;
	let maxDcCount = 0;
	let maxEcCount = 0;

	let dcdata = new Array(rsBlocks.length);
	let ecdata = new Array(rsBlocks.length);

	for (let r = 0; r < rsBlocks.length; r += 1) {
		let dcCount = rsBlocks[r].dataCount;
		let ecCount = rsBlocks[r].totalCount - dcCount;

		maxDcCount = Math.max(maxDcCount, dcCount);
		maxEcCount = Math.max(maxEcCount, ecCount);

		dcdata[r] = new Array(dcCount);
		for (let i = 0; i < dcdata[r].length; i += 1) {
			dcdata[r][i] = 0xff & buffer.getBuffer()[i + offset];
		}
		offset += dcCount;

		let rsPoly = getErrorCorrectPolynomial(ecCount);
		let rawPoly = qrPolynomial(dcdata[r], rsPoly.getLength() - 1);

		let modPoly = rawPoly.mod(rsPoly);
		ecdata[r] = new Array(rsPoly.getLength() - 1);
		for (let i = 0; i < ecdata[r].length; i += 1) {
			let modIndex = i + modPoly.getLength() - ecdata[r].length;
			ecdata[r][i] = modIndex >= 0 ? modPoly.getAt(modIndex) : 0;
		}
	}

	let totalCodeCount = 0;
	for (let i = 0; i < rsBlocks.length; i += 1) {
		totalCodeCount += rsBlocks[i].totalCount;
	}

	let data = new Array(totalCodeCount);
	let index = 0;

	for (let i = 0; i < maxDcCount; i += 1) {
		for (let r = 0; r < rsBlocks.length; r += 1) {
			if (i < dcdata[r].length) {
				data[index] = dcdata[r][i];
				index += 1;
			}
		}
	}

	for (let i = 0; i < maxEcCount; i += 1) {
		for (let r = 0; r < rsBlocks.length; r += 1) {
			if (i < ecdata[r].length) {
				data[index] = ecdata[r][i];
				index += 1;
			}
		}
	}

	return data;
};

function getTotal(rsBlocks):number{
	let totalDataCount = 0;
	for (var i = 0; i < rsBlocks.length; i += 1) {
		totalDataCount += rsBlocks[i].dataCount;
	}
	return totalDataCount;
}

const getMaxDataCount = function(typeNumber:number, errorCorrectionLevel:number):number{
	let rsBlocks = getRSBlocks(typeNumber, errorCorrectionLevel);
	return getTotal(rsBlocks);
}

// 通过buffer 创建 QR 数据块
const paddingBuffer = function(buffer: BitBuffer, rsBlocks: RSBlock[]) {
	const PAD0 = 0xec;
	const PAD1 = 0x11;

	// calc num max data.
	let totalDataCount = getTotal(rsBlocks);

	if (buffer.getLengthInBits() > totalDataCount * 8) {
		throw 'code length overflow. (' + buffer.getLengthInBits() + '>' + totalDataCount * 8 + ')';
	}

	// end code
	if (buffer.getLengthInBits() + 4 <= totalDataCount * 8) {
		buffer.put(0, 4);
	}

	// padding
	while (buffer.getLengthInBits() % 8 != 0) {
		buffer.putBit(false);
	}

	// padding
	while (true) {
		if (buffer.getLengthInBits() >= totalDataCount * 8) {
			break;
		}
		buffer.put(PAD0, 8);

		if (buffer.getLengthInBits() >= totalDataCount * 8) {
			break;
		}
		buffer.put(PAD1, 8);
	}

	// return createBytes(buffer, rsBlocks);
};

const getBufferForBytes = function(typeNumber, byteArray, mode) {
	let buffer = BitBuffer();
	let data = byteArray;
	buffer.put(mode, 4);
	buffer.put(data.length, getLengthInBits(mode, typeNumber));
	for (let i = 0; i < data.length; i++) {
		buffer.put(data[i], 8);
	}
	return buffer;
	// return _createData(buffer, rsBlocks);
};

const getBufferForModes = function(typeNumber, dataList) {
	let buffer = BitBuffer();
	for (let i = 0; i < dataList.length; i += 1) {
		let data = dataList[i];
		buffer.put(data.getMode(), 4);
		buffer.put(data.getLength(), getLengthInBits(data.getMode(), typeNumber));
		data.write(buffer);
	}
	return buffer;
	// return _createData(buffer, rsBlocks);
};

function createData(typeNumber: number, errorCorrectionLevel: number, byteArray: mode[]);
function createData(typeNumber: number, errorCorrectionLevel: number, byteArray: number[], mode?: mode);
function createData(typeNumber: number, errorCorrectionLevel: number, byteArray: any, mode?: mode) {
	let rsBlocks = getRSBlocks(typeNumber, errorCorrectionLevel); //RS 算法矩阵
	//1. 数据通过 mode 编码为 buffer;
	let buffer: BitBuffer;
	if (mode) {
		buffer = getBufferForBytes(typeNumber, byteArray, mode);
	} else {
		buffer = getBufferForModes(typeNumber, byteArray);
	}
	//修整 buffer
	paddingBuffer(buffer, rsBlocks);
	return createBytes(buffer, rsBlocks);
}

export {
	QRErrorCorrectionLevel,
	QRMode,
	getLengthInBits,
	getBCHTypeInfo,
	getBCHTypeNumber,
	getMaxDataCount,
	getRSBlocks,
	RSBlock,
	getBufferForModes,
	createData
};

// module.exports = {
// 	QRErrorCorrectionLevel,
// 	getBCHTypeInfo,
// 	getBCHTypeNumber,
// 	getRSBlocks
// };
