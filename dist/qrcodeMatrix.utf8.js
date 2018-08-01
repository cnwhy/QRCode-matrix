
/*!
 * qrcode-matrix v0.1.1
 * (c) 2018-present cnwhy <w.why@163.com>
 * Homepage https://github.com/cnwhy/QRCode-matrix
 * Released under the License MIT
 */

(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.qrcodeMatrix = factory());
}(this, (function () { 'use strict';

	function toUTF8Array(str) {
		var utf8 = [];
		for (var i = 0; i < str.length; i++) {
			var charcode = str.charCodeAt(i);
			if (charcode < 0x80) utf8.push(charcode);
			else if (charcode < 0x800) {
				utf8.push(0xc0 | (charcode >> 6),
					0x80 | (charcode & 0x3f));
			} else if (charcode < 0xd800 || charcode >= 0xe000) {
				utf8.push(0xe0 | (charcode >> 12),
					0x80 | ((charcode >> 6) & 0x3f),
					0x80 | (charcode & 0x3f));
			}
			// surrogate pair
			else {
				i++;
				// UTF-16 encodes 0x10000-0x10FFFF by
				// subtracting 0x10000 and splitting the
				// 20 bits of 0x0-0xFFFFF into two halves
				charcode = 0x10000 + (((charcode & 0x3ff) << 10) |
					(str.charCodeAt(i) & 0x3ff));
				utf8.push(0xf0 | (charcode >> 18),
					0x80 | ((charcode >> 12) & 0x3f),
					0x80 | ((charcode >> 6) & 0x3f),
					0x80 | (charcode & 0x3f));
			}
		}
		return utf8;
	}

	var utf8 = toUTF8Array;

	var QR_MODE = 1 << 2;
	var qr8BitByte = (function (stringToBytes) {
		stringToBytes = typeof stringToBytes == 'function' ? stringToBytes : utf8;
		return function (data) {
			var _data = data + '';
			var _bytes = _data == data ? stringToBytes(_data) : data;
			var _this = {};
			_bytes = _bytes instanceof Array ? _bytes : [];
			
			_this.getMode = function () {
				return QR_MODE;
			};

			_this.getLength = function (buffer) {
				return _bytes.length;
			};

			_this.write = function (buffer) {
				for (var i = 0; i < _bytes.length; i++) {
					buffer.put(_bytes[i], 8);
				}
			};
			return _this;
		}
	});

	var Byte = qr8BitByte;

	var QRMode = {
		MODE_NUMBER: 1 << 0,
		MODE_ALPHA_NUM: 1 << 1,
		MODE_8BIT_BYTE: 1 << 2,
		MODE_KANJI: 1 << 3
	};

	var QRErrorCorrectionLevel = {
		L: 1,
		M: 0,
		Q: 3,
		H: 2
	};

	var QRMaskPattern = {
		PATTERN000: 0,
		PATTERN001: 1,
		PATTERN010: 2,
		PATTERN011: 3,
		PATTERN100: 4,
		PATTERN101: 5,
		PATTERN110: 6,
		PATTERN111: 7
	};

	// 获取掩模函数
	var getQRMaskFunction = (function () {
		var QRMaskFunctions = [
			function (i, j) {
				return (i + j) % 2 == 0;
			},
			function (i, j) {
				return i % 2 == 0;
			},
			function (i, j) {
				return j % 3 == 0;
			},
			function (i, j) {
				return (i + j) % 3 == 0;
			},
			function (i, j) {
				return (Math.floor(i / 2) + Math.floor(j / 3)) % 2 == 0;
			},
			function (i, j) {
				return (i * j) % 2 + (i * j) % 3 == 0;
			},
			function (i, j) {
				return ((i * j) % 2 + (i * j) % 3) % 2 == 0;
			},
			function (i, j) {
				return ((i * j) % 3 + (i + j) % 2) % 2 == 0;
			}
		];
		return function (maskPattern) {
			var fn = QRMaskFunctions[maskPattern];
			if (!fn) throw new Error('maskPattern:' + maskPattern);
			return fn;
		}
	}());

	// 获取数据块长度
	var getLengthInBits = (function () {
		// 各模式数据块长度
		var BITS_LENGTH_LIST = {};
		BITS_LENGTH_LIST[QRMode.MODE_NUMBER] = [10, 12, 14];
		BITS_LENGTH_LIST[QRMode.MODE_ALPHA_NUM] = [9, 11, 13];
		BITS_LENGTH_LIST[QRMode.MODE_8BIT_BYTE] = [8, 16, 16];
		BITS_LENGTH_LIST[QRMode.MODE_KANJI] = [8, 10, 12];

		return function (mode, type) {
			if (1 <= type && type <= 40) {
				var lengths = BITS_LENGTH_LIST[mode];
				if (!lengths) throw 'mode:' + mode;
				var index = type <= 9 ? 0 :
					type <= 26 ? 1 :
						2;
				return lengths[index];
			} else {
				throw new Error('type:' + type);
			}
		}
	}());

	// 通过矩阵获取,版本
	var map2typeNumber = function (map) {
		return (map.length - 17) / 4;
	};

	var G15 = (1 << 10) | (1 << 8) | (1 << 5) | (1 << 4) | (1 << 2) | (1 << 1) | (1 << 0);
	var G18 = (1 << 12) | (1 << 11) | (1 << 10) | (1 << 9) | (1 << 8) | (1 << 5) | (1 << 2) | (1 << 0);
	var G15_MASK = (1 << 14) | (1 << 12) | (1 << 10) | (1 << 4) | (1 << 1);

	var getBCHDigit = function (data) {
		var digit = 0;
		while (data != 0) {
			digit++;
			data >>>= 1;
		}
		return digit;
	};

	var getBCHTypeInfo = function (data) {
		var d = data << 10;
		while (getBCHDigit(d) - getBCHDigit(G15) >= 0) {
			d ^= (G15 << (getBCHDigit(d) - getBCHDigit(G15)));
		}
		return ((data << 10) | d) ^ G15_MASK;
	};

	var getBCHTypeNumber = function (data) {
		var d = data << 12;
		while (getBCHDigit(d) - getBCHDigit(G18) >= 0) {
			d ^= (G18 << (getBCHDigit(d) - getBCHDigit(G18)));
		}
		return (data << 12) | d;
	};

	// 模拟Buffer
	var qrBitBuffer = function () {

		var _buffer = [];
		var _length = 0;
		var _this = {};

		_this.getBuffer = function () {
			return _buffer;
		};

		_this.getAt = function (index) {
			var bufIndex = ~~(index / 8);
			var bitIndex = 7 - index % 8;
			return ((_buffer[bufIndex] >>> bitIndex) & 1) === 1;
		};

		_this.put = function (num, length) {
			length = ~~length;
			if (length < 0) throw new Error('length:' + length)
			while (length--) {
				_this.putBit(((num >>> length) & 1) === 1);
			}
		};

		_this.getLengthInBits = function () {
			return _length;
		};

		_this.putBit = function (bit) {
			var bufIndex = ~~(_length / 8);
			if (_buffer.length <= bufIndex) {
				_buffer.push(0);
			}
			if (bit) {
				_buffer[bufIndex] |= (0x80 >>> (_length % 8));
			}
			_length += 1;
		};

		return _this;
	};

	// 填充侦测图
	var setupPositionProbePattern = function (map, row, col) {
		// var mapLength = map.length;
		// for (var r = -1; r <= 7; r++) {
		// 	if (row + r <= -1 || mapLength <= row + r) continue;
		// 	for (var c = -1; c <= 7; c++) {
		// 		if (col + c <= -1 || mapLength <= col + c) continue;
		// 		if ((0 <= r && r <= 6 && (c == 0 || c == 6)) ||
		// 			(0 <= c && c <= 6 && (r == 0 || r == 6)) ||
		// 			(2 <= r && r <= 4 && 2 <= c && c <= 4)) {
		// 			map[row + r][col + c] = true;
		// 		} else {
		// 			map[row + r][col + c] = false;
		// 		}
		// 	}
		// }
		square_wk(map, row - 1, col - 1, false, 7 + 2);
		square_wk(map, row, col, true, 7);
		square_wk(map, row + 1, col + 1, false, 7 - 2);
		square_fill(map, row + 2, col + 2, true, 3);
	};

	//画正方型
	var square_wk = function (map, row, col, val, L) {
		var mapLength = map.length;
		function w(x, y) {
			var l = L;
			while (--l) {
				row += x, col += y;
				if (row < 0 || col < 0 || row >= mapLength || col >= mapLength) continue;
				map[row][col] = val;
			}
		}
		if (L < 0) return;
		(row < 0 || col < 0 || row >= mapLength || col >= mapLength) || (map[row][col] = val);
		if (L > 1) {
			w(1, 0), w(0, 1), w(-1, 0), w(0, -1);
		}
	};

	//填充正方型
	var square_fill = function (map, row, col, val, L) {
		while (L > 0) {
			square_wk(map, row++, col++, val, L);
			L -= 2;
		}
	};

	// 填充所有侦测图
	var setupAllPositionProbePattern = function (map) {
		var mapLength = map.length;
		setupPositionProbePattern(map, 0, 0);
		setupPositionProbePattern(map, mapLength - 7, 0);
		setupPositionProbePattern(map, 0, mapLength - 7);
	};

	// 填充校正图
	var setupPositionAdjustPattern = (function () {
		var PATTERN_POSITION_TABLE = [
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
		];
		return function (map, typeNumber) {
			typeNumber = typeNumber || map2typeNumber(map);
			var pos = PATTERN_POSITION_TABLE[typeNumber - 1];
			for (var i = 0; i < pos.length; i++) {
				for (var j = 0; j < pos.length; j++) {
					var row = pos[i];
					var col = pos[j];
					if (map[row][col] != null) continue;
					for (var r = -2; r <= 2; r++) {
						for (var c = -2; c <= 2; c++) {
							if (r == -2 || r == 2 || c == -2 || c == 2 ||
								(r == 0 && c == 0)) {
								map[row + r][col + c] = true;
							} else {
								map[row + r][col + c] = false;
							}
						}
					}
				}
			}
		}
	}());

	// 填充定位图
	var setupTimingPattern = function (map) {
		var mapLength = map.length;
		for (var r = 8; r < mapLength - 8; r += 1) {
			if (map[r][6] != null) {
				continue;
			}
			map[r][6] = (r % 2 == 0);
		}
		for (var c = 8; c < mapLength - 8; c += 1) {
			if (map[6][c] != null) {
				continue;
			}
			map[6][c] = (c % 2 == 0);
		}
	};

	// 填充格式信息
	var setupTypeInfo = function (map, test, errorCorrectionLevel, maskPattern) {
		var mapLength = map.length;
		var data = (errorCorrectionLevel << 3) | maskPattern;
		var bits = getBCHTypeInfo(data);
		// vertical
		for (var i = 0; i < 15; i += 1) {
			var mod = (!test && ((bits >> i) & 1) == 1);
			if (i < 6) {
				map[i][8] = mod;
			} else if (i < 8) {
				map[i + 1][8] = mod;
			} else {
				map[mapLength - 15 + i][8] = mod;
			}
		}

		// horizontal
		for (var i = 0; i < 15; i += 1) {
			var mod = (!test && ((bits >> i) & 1) == 1);
			if (i < 8) {
				map[8][mapLength - i - 1] = mod;
			} else if (i < 9) {
				map[8][15 - i - 1 + 1] = mod;
			} else {
				map[8][15 - i - 1] = mod;
			}
		}

		// fixed module
		map[mapLength - 8][8] = (!test);
	};

	// 填充版本信息
	var setupTypeNumber = function (map, test, typeNumber) {
		typeNumber = typeNumber || map2typeNumber(map);
		var mapLength = map.length;
		var bits = getBCHTypeNumber(typeNumber);
		for (var i = 0; i < 18; i += 1) {
			var mod = (!test && ((bits >> i) & 1) == 1);
			map[Math.floor(i / 3)][i % 3 + mapLength - 8 - 3] = mod;
		}
		for (var i = 0; i < 18; i += 1) {
			var mod = (!test && ((bits >> i) & 1) == 1);
			map[i % 3 + mapLength - 8 - 3][Math.floor(i / 3)] = mod;
		}
	};

	// 生成空矩阵
	function mapInit(size) {
		try{
			var map = [],
				emptyArr = [];
			emptyArr.length = size;
			while (size--) {
				map.push(emptyArr.slice(0));
			}
			return map;
			
		}catch(e){
			console.log(size);
		}
	}

	// 拷贝矩阵
	function copyMap(map) {
		return map.map(function (v) {
			return v.slice(0);
		})
	}

	function compareMap(map, map1, type) {
		type = type || "and";
		var nMap = [];
		var fn = function () {
			switch (type) {
				case 'or':
				case '|':
					return function (r, c) { 
						var a = map[r][c],b = map1[r][c];
						if(a || b){return true}
						if(a === false || b === false){return false}
						// return map[r][c] || map1[r][c]; 
					}
				case 'xor':
				case '^':
					return function (r, c) {
						var a = map[r][c],b = map1[r][c];
						if(a !== b){ return a || b}	
						// return !map[r][c] != !map1[r][c]; 
					}
				case 'and':
				case '&':
					return function (r, c) {
						var a = map[r][c],b = map1[r][c];
						if(a && b){return true}
						if(a === false && b === false){return false}
						// return map[r][c] && map1[r][c]; 
					}
				default:
					throw 'type err!'
			}
		}();
		for (var r = 0; r < map.length; r++) {
			nMap[r] = [];
			for (var c = 0; c < map.length; c++) {
				nMap[r][c] = fn(r, c);
			}
		}
		return nMap;
	}

	// 获取数据块信息
	var getRSBlocks = (function () {
		var RS_BLOCK_TABLE = [

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
		];

		var qrRSBlock = function (totalCount, dataCount) {
			return {
				"totalCount": totalCount,
				"dataCount": dataCount
			}
		};

		var getRsBlockTable = function (typeNumber, errorCorrectionLevel) {
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
		};

		return function (typeNumber, errorCorrectionLevel) {
			var rsBlock = getRsBlockTable(typeNumber, errorCorrectionLevel);
			var length = rsBlock.length / 3;
			var list = [];
			for (var i = 0; i < length; i += 1) {

				var count = rsBlock[i * 3 + 0];
				var totalCount = rsBlock[i * 3 + 1];
				var dataCount = rsBlock[i * 3 + 2];

				for (var j = 0; j < count; j += 1) {
					list.push(qrRSBlock(totalCount, dataCount));
				}
			}
			return list;
		};
	}());

	// 矩阵分布评分 (筛选最优掩模方案)
	var getLostPoint = function (map) {
		var moduleCount = map.length;
		var lostPoint = 0;
		var isDark = function (row, col) {
			return map[row][col];
		};

		// LEVEL1
		for (var row = 0; row < moduleCount; row += 1) {
			for (var col = 0; col < moduleCount; col += 1) {
				var sameCount = 0;
				var dark = isDark(row, col);
				for (var r = -1; r <= 1; r += 1) {
					if (row + r < 0 || moduleCount <= row + r) {
						continue;
					}
					for (var c = -1; c <= 1; c += 1) {
						if (col + c < 0 || moduleCount <= col + c) {
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
					lostPoint += (3 + sameCount - 5);
				}
			}
		}
		// LEVEL2
		for (var row = 0; row < moduleCount - 1; row += 1) {
			for (var col = 0; col < moduleCount - 1; col += 1) {
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
		for (var row = 0; row < moduleCount; row += 1) {
			for (var col = 0; col < moduleCount - 6; col += 1) {
				if (isDark(row, col) &&
					!isDark(row, col + 1) &&
					isDark(row, col + 2) &&
					isDark(row, col + 3) &&
					isDark(row, col + 4) &&
					!isDark(row, col + 5) &&
					isDark(row, col + 6)) {
					lostPoint += 40;
				}
			}
		}

		for (var col = 0; col < moduleCount; col += 1) {
			for (var row = 0; row < moduleCount - 6; row += 1) {
				if (isDark(row, col) &&
					!isDark(row + 1, col) &&
					isDark(row + 2, col) &&
					isDark(row + 3, col) &&
					isDark(row + 4, col) &&
					!isDark(row + 5, col) &&
					isDark(row + 6, col)) {
					lostPoint += 40;
				}
			}
		}

		// LEVEL4

		var darkCount = 0;

		for (var col = 0; col < moduleCount; col += 1) {
			for (var row = 0; row < moduleCount; row += 1) {
				if (isDark(row, col)) {
					darkCount += 1;
				}
			}
		}

		var ratio = Math.abs(100 * darkCount / moduleCount / moduleCount - 50) / 5;
		lostPoint += ratio * 10;

		return lostPoint;
	};

	var getErrorCorrectPolynomial = function (errorCorrectLength) {
		var a = qrPolynomial([1], 0);
		for (var i = 0; i < errorCorrectLength; i += 1) {
			a = a.multiply(qrPolynomial([1, QRMath.gexp(i)], 0));
		}
		return a;
	};

	var qrPolynomial = function (num, shift) {

		if (typeof num.length == 'undefined') {
			throw num.length + '/' + shift;
		}

		var _num = function () {
			var offset = 0;
			while (offset < num.length && num[offset] == 0) {
				offset += 1;
			}
			var _num = new Array(num.length - offset + shift);
			for (var i = 0; i < num.length - offset; i += 1) {
				_num[i] = num[i + offset];
			}
			return _num;
		}();

		var _this = {};

		_this.getAt = function (index) {
			return _num[index];
		};

		_this.getLength = function () {
			return _num.length;
		};

		_this.multiply = function (e) {

			var num = new Array(_this.getLength() + e.getLength() - 1);

			for (var i = 0; i < _this.getLength(); i += 1) {
				for (var j = 0; j < e.getLength(); j += 1) {
					num[i + j] ^= QRMath.gexp(QRMath.glog(_this.getAt(i)) + QRMath.glog(e.getAt(j)));
				}
			}

			return qrPolynomial(num, 0);
		};

		_this.mod = function (e) {

			if (_this.getLength() - e.getLength() < 0) {
				return _this;
			}

			var ratio = QRMath.glog(_this.getAt(0)) - QRMath.glog(e.getAt(0));

			var num = new Array(_this.getLength());
			for (var i = 0; i < _this.getLength(); i += 1) {
				num[i] = _this.getAt(i);
			}

			for (var i = 0; i < e.getLength(); i += 1) {
				num[i] ^= QRMath.gexp(QRMath.glog(e.getAt(i)) + ratio);
			}

			// recursive call
			return qrPolynomial(num, 0).mod(e);
		};

		return _this;
	};

	var QRMath = (function () {

		var EXP_TABLE = new Array(256);
		var LOG_TABLE = new Array(256);

		// initialize tables
		for (var i = 0; i < 8; i += 1) {
			EXP_TABLE[i] = 1 << i;
		}
		for (var i = 8; i < 256; i += 1) {
			EXP_TABLE[i] = EXP_TABLE[i - 4] ^
				EXP_TABLE[i - 5] ^
				EXP_TABLE[i - 6] ^
				EXP_TABLE[i - 8];
		}
		for (var i = 0; i < 255; i += 1) {
			LOG_TABLE[EXP_TABLE[i]] = i;
		}

		var _this = {};

		_this.glog = function (n) {

			if (n < 1) {
				throw 'glog(' + n + ')';
			}

			return LOG_TABLE[n];
		};

		_this.gexp = function (n) {

			while (n < 0) {
				n += 255;
			}

			while (n >= 256) {
				n -= 255;
			}

			return EXP_TABLE[n];
		};

		return _this;
	}());

	var createBytes = function (buffer, rsBlocks) {
		var offset = 0;
		var maxDcCount = 0;
		var maxEcCount = 0;

		var dcdata = new Array(rsBlocks.length);
		var ecdata = new Array(rsBlocks.length);

		for (var r = 0; r < rsBlocks.length; r += 1) {
			var dcCount = rsBlocks[r].dataCount;
			var ecCount = rsBlocks[r].totalCount - dcCount;

			maxDcCount = Math.max(maxDcCount, dcCount);
			maxEcCount = Math.max(maxEcCount, ecCount);

			dcdata[r] = new Array(dcCount);
			for (var i = 0; i < dcdata[r].length; i += 1) {
				dcdata[r][i] = 0xff & buffer.getBuffer()[i + offset];
			}
			offset += dcCount;

			var rsPoly = getErrorCorrectPolynomial(ecCount);
			var rawPoly = qrPolynomial(dcdata[r], rsPoly.getLength() - 1);

			var modPoly = rawPoly.mod(rsPoly);
			ecdata[r] = new Array(rsPoly.getLength() - 1);
			for (var i = 0; i < ecdata[r].length; i += 1) {
				var modIndex = i + modPoly.getLength() - ecdata[r].length;
				ecdata[r][i] = (modIndex >= 0) ? modPoly.getAt(modIndex) : 0;
			}
		}

		var totalCodeCount = 0;
		for (var i = 0; i < rsBlocks.length; i += 1) {
			totalCodeCount += rsBlocks[i].totalCount;
		}

		var data = new Array(totalCodeCount);
		var index = 0;

		for (var i = 0; i < maxDcCount; i += 1) {
			for (var r = 0; r < rsBlocks.length; r += 1) {
				if (i < dcdata[r].length) {
					data[index] = dcdata[r][i];
					index += 1;
				}
			}
		}

		for (var i = 0; i < maxEcCount; i += 1) {
			for (var r = 0; r < rsBlocks.length; r += 1) {
				if (i < ecdata[r].length) {
					data[index] = ecdata[r][i];
					index += 1;
				}
			}
		}

		return data;
	};

	var _createData = function (buffer, rsBlocks) {
		var PAD0 = 0xEC;
		var PAD1 = 0x11;

		// calc num max data.
		var totalDataCount = 0;
		for (var i = 0; i < rsBlocks.length; i += 1) {
			totalDataCount += rsBlocks[i].dataCount;
		}

		if (buffer.getLengthInBits() > totalDataCount * 8) {
			throw 'code length overflow. (' +
			buffer.getLengthInBits() +
			'>' +
			totalDataCount * 8 +
			')';
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

		return createBytes(buffer, rsBlocks);
	};

	var createDataForBytes = function (typeNumber, errorCorrectionLevel, byteArray, mode) {
		var rsBlocks = getRSBlocks(typeNumber, errorCorrectionLevel);
		var buffer = qrBitBuffer();
		var data = byteArray;
		buffer.put(mode, 4);
		buffer.put(data.length, getLengthInBits(mode, typeNumber));
		for (var i = 0; i < data.length; i++) {
			buffer.put(data[i], 8);
		}
		return _createData(buffer, rsBlocks);
	};

	var createDataForModes = function (typeNumber, errorCorrectionLevel, dataList) {
		var rsBlocks = getRSBlocks(typeNumber, errorCorrectionLevel);
		var buffer = qrBitBuffer();
		for (var i = 0; i < dataList.length; i += 1) {
			var data = dataList[i];
			buffer.put(data.getMode(), 4);
			buffer.put(data.getLength(), getLengthInBits(data.getMode(), typeNumber));
			data.write(buffer);
		}
		return _createData(buffer, rsBlocks);
	};

	var createData = function (typeNumber, errorCorrectionLevel, byteArray, mode) {
		var cb = mode ? createDataForBytes : createDataForModes;
		return cb.apply(null, arguments)
	};

	var mapData = function (map, data, maskPattern) {
		var _moduleCount = map.length;
		var inc = -1;
		var row = _moduleCount - 1;
		var bitIndex = 7;
		var byteIndex = 0;
		var maskFunc = getQRMaskFunction(maskPattern);

		for (var col = _moduleCount - 1; col > 0; col -= 2) {
			if (col == 6) col -= 1;
			while (true) {
				for (var c = 0; c < 2; c += 1) {
					if (map[row][col - c] == null) {
						var dark = false;
						if (byteIndex < data.length) {
							dark = (((data[byteIndex] >>> bitIndex) & 1) == 1);
						}
						var mask = maskFunc(row, col - c);
						if (mask) {
							dark = !dark;
						}
						map[row][col - c] = dark;
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

		return map;
	};

	var utils = {
		QRMode: QRMode,
		QRErrorCorrectionLevel: QRErrorCorrectionLevel,
		QRMaskPattern: QRMaskPattern,
		qrBitBuffer: qrBitBuffer,
		setupAllPositionProbePattern: setupAllPositionProbePattern,
		setupPositionAdjustPattern: setupPositionAdjustPattern,
		setupTimingPattern: setupTimingPattern,
		setupTypeInfo: setupTypeInfo,
		setupTypeNumber: setupTypeNumber,
		mapInit: mapInit,
		copyMap: copyMap,
		compareMap: compareMap,
		createData: createData,
		mapData: mapData,
		getLengthInBits: getLengthInBits,
		getRSBlocks: getRSBlocks,
		getLostPoint: getLostPoint,
	};

	var QRErrorCorrectionLevel$1 = utils.QRErrorCorrectionLevel;
	var cache = {}; //缓存 

	var src = function (QRModes, defOptions) {
		QRcode.QRModes = QRModes;

		// 纠错等级
		// L: 1, 7%
		// M: 0, 15%
		// Q: 3, 25%
		// H: 2, 30%
		QRcode.QRErrorCorrectionLevel = QRErrorCorrectionLevel$1;

		/**
		 * 
		 * @param {object} options 
		 *	{
		 *		errorCorrectionLevel: "M", //纠错等级 默认M   'L','M','Q','H' -> [1,0,3,2]
		 *		typeNumber: 0,             //QR码版本 默认0 (自动)  1 to 40
		 *		minTypeNumber: 0,          //最小版本
		 *		maskPattern: 'auto',       //掩模 'random','auto'  [0-7]
		 *		dataMode: 'Byte'           //默认 数据类型 结合 QRModes 参数
		 *	}
		*/
		function QRcode(options) {
			options = options || {};
			// var _options = {};
			// for (var k in defOptions) {
			// 	_options[k] = options[k] == undefined ? defOptions[k] : options[k];
			// }
			var _options = Object.assign({},defOptions,options);

			return (function () {
				var _typeNumber = _options.typeNumber,
					_minTypeNumber = _options.minTypeNumber,
					_maskPattern = _options.maskPattern,
					_dataMode = _options.dataMode,
					_errorCorrectionLevel = (function () {
						var l = _options.errorCorrectionLevel;
						for (var k in QRErrorCorrectionLevel$1) {
							var v = QRErrorCorrectionLevel$1[k];
							if (l === k || +l === v) {
								return v;
							}
						}
					})();

				var _moduleCount = 0,
					_dataList = [],
					_dataCache = null;

				var makeImpl = function (test, maskPattern) {
					var map;
					if (cache['basemap_' + _typeNumber]) {
						//从缓存中读取
						map = utils.copyMap(cache['basemap_' + _typeNumber]);
					} else {
						//生成空矩阵 QR码尺寸
						map = utils.mapInit(_moduleCount);
						//填充探测图型
						utils.setupAllPositionProbePattern(map);
						//填充矫正位图
						utils.setupPositionAdjustPattern(map);
						//填充定位图
						utils.setupTimingPattern(map);

						//做个缓存 只要版本相同 '探测图型','矫正位图','定位图' 是固定的
						cache['basemap_' + _typeNumber] = utils.copyMap(map);
					}

					//填充格式信息
					utils.setupTypeInfo(map, test, _errorCorrectionLevel, maskPattern);

					//填充版本信息
					(_typeNumber >= 7) && utils.setupTypeNumber(map, test);

					//填充数据
					if (_dataCache == null) {
						_dataCache = utils.createData(_typeNumber, _errorCorrectionLevel, _dataList);
					}
					return utils.mapData(map, _dataCache, maskPattern);
				};

				var addData = function (data, mode) {
					mode = mode || _dataMode;
					var newData = null;
					if (typeof mode == 'function') {
						newData = mode(data);
						if (!(newData.getMode && newData.getLength && newData.write)) {
							throw 'mode invalid!'
						}
					} else {
						if (QRModes[mode]) {
							newData = QRModes[mode](data);
						} else {
							throw 'mode type invalid! mode is ' + mode;
						}
					}
					_dataList.push(newData);
					_dataCache = null;
				};

				var make = function () {
					// 如果未指定TypeNumber，则记算适合的TypeNumber
					if (_typeNumber < 1) {
						var typeNumber = _minTypeNumber ? _minTypeNumber : 1;
						for (; typeNumber < 40; typeNumber++) {
							var rsBlocks = utils.getRSBlocks(typeNumber, _errorCorrectionLevel);

							var buffer = utils.qrBitBuffer();
							for (var i = 0; i < _dataList.length; i++) {
								var data = _dataList[i];
								buffer.put(data.getMode(), 4);
								buffer.put(data.getLength(), utils.getLengthInBits(data.getMode(), typeNumber));
								data.write(buffer);
							}

							var totalDataCount = 0;
							for (var i = 0; i < rsBlocks.length; i++) {
								totalDataCount += rsBlocks[i].dataCount;
							}

							if (buffer.getLengthInBits() <= totalDataCount * 8) {
								break;
							}
						}
						_typeNumber = typeNumber;
					}

					_moduleCount = _typeNumber * 4 + 17;

					// 掩模

					// 随机
					if (_maskPattern === 'random') {
						_maskPattern = ~~(Math.random() * (7 + 1));
						// 指定方案
					} else if (0 <= _maskPattern && _maskPattern <= 7) {
						_maskPattern = _maskPattern >> 0;
						// 自动筛选最优掩模
					} else { //auto
						_maskPattern = (function () {
							var minLostPoint = 0;
							var pattern = 0;
							for (var i = 0; i < 8; i += 1) {
								var map = makeImpl(true, i);
								var lostPoint = utils.getLostPoint(map);
								if (i == 0 || minLostPoint > lostPoint) {
									minLostPoint = lostPoint;
									pattern = i;
								}
							}
							return pattern;
						}());
					}

					var map = makeImpl(false, _maskPattern);
					return map;
				};

				var splitMake = function () {
					var obj = {};
					obj.all = make();
					obj.allDiscover = utils.copyMap(cache['basemap_' + _typeNumber]),

						//positionProbe
						obj.positionProbe = utils.mapInit(_moduleCount),
						utils.setupAllPositionProbePattern(obj.positionProbe);

					//positionAdjust 
					var positionAdjust = utils.copyMap(obj.positionProbe);
					utils.setupPositionAdjustPattern(positionAdjust);
					obj.positionAdjust = utils.compareMap(obj.positionProbe, positionAdjust, 'xor');

					//timing
					var timing = utils.mapInit(_moduleCount);
					utils.setupTimingPattern(timing);
					obj.timing = utils.compareMap(obj.positionAdjust, timing, "and");
					obj.timing = utils.compareMap(obj.timing, timing, "xor");


					//data
					obj.data = utils.compareMap(obj.all, obj.allDiscover, 'xor');

					// console.log(obj.all);
					// console.log(obj.allDiscover);
					// console.log(obj.positionProbe);
					// console.log(obj.positionAdjust);
					// console.log(obj.timing)
					// console.log(obj.data)


					return obj;
				};

				var setData = function (data, mode) {
					_dataList = [];
					addData(data, mode);
				};

				var _this = function (str, mode) {
					setData(str, mode);
					return make();
				};

				//暴露到外部的方法
				_this.setData = setData;
				_this.addData = addData;
				_this.make = make;
				_this.splitMake = splitMake;

				return _this;
			})();
		}

		return QRcode;
	};

	// 数据模式
	var QRModes = {
		'Byte': Byte()  //以字节存储数据 utf8
	};
	var defOptions = {
		errorCorrectionLevel: "M",
		typeNumber: 0,
		maskPattern: 'auto',
		dataMode: 'Byte'
	};
	var onlyUTF8_temp = src(QRModes,defOptions);

	return onlyUTF8_temp;

})));
