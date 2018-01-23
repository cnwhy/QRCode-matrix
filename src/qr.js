var utils = require('./utils');

// 数据模式
var QRMode = qr.QRMode = utils.QRMode;

// 纠错等级
var QRErrorCorrectionLevel = qr.QRErrorCorrectionLevel = utils.QRErrorCorrectionLevel;

function qr(options) {
	options = options || {};
	var defOptions = {
		mode: QRMode.MODE_8BIT_BYTE,
		errorCorrectionLevel: QRErrorCorrectionLevel.M,
		typeNumber: 0,
		str2ByteArray: toUTF8Array,
		maskPattern: 'auto'
	}
	var _options = {};
	for (var k in defOptions) {
		_options[k] = options[k] == undefined ? defOptions[k] : options[k];
	}

	var cache = {}
	var getfun = function () {
		return function (data) {
			var _mode = _options.mode,
				_typeNumber = _options.typeNumber,
				_errorCorrectionLevel = _options.errorCorrectionLevel,
				_maskPattern = _options.maskPattern;

			var _moduleCount = 0,
				_dataCache = null,
				_byteArray = _options.str2ByteArray(data.toString());
				
			var makeImpl = function (test, maskPattern) {
				var map;
				if (cache['basemap_' + _typeNumber]) {
					map = utils.copyMap(cache['basemap_' + _typeNumber]);
				} else {
					map = utils.mapInit(_moduleCount);
					//填充探测图型
					utils.setupAllPositionProbePattern(map);
					//填充矫正位图
					utils.setupPositionAdjustPattern(map, _typeNumber);
					//填充定位图
					utils.setupTimingPattern(map);
					cache['basemap_' + _typeNumber] = utils.copyMap(map);
				}
				//填充格式信息
				utils.setupTypeInfo(map, test, _errorCorrectionLevel, maskPattern);

				//填充版本信息
				(_typeNumber >= 7) && utils.setupTypeNumber(map, test, _typeNumber);

				//填充数据
				if (_dataCache == null) {
					_dataCache = utils.createData(_typeNumber, _errorCorrectionLevel, _byteArray, _options.mode);
				}
				return utils.mapData(map, _dataCache, maskPattern);
			};

			// 为指定TypeNumber，则记算适合的TypeNumber
			if (_typeNumber < 1) {
				var typeNumber = 1;
				for (; typeNumber < 40; typeNumber++) {
					var rsBlocks = utils.getRSBlocks(typeNumber, _errorCorrectionLevel);
					var buffer = utils.qrBitBuffer();

					var data = _byteArray;
					buffer.put(_options.mode, 4);
					buffer.put(data.length, utils.getLengthInBits(_options.mode, typeNumber));
					for (var i = 0; i < data.length; i++) {
						buffer.put(data[i], 8)
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

			// 记算最合适的掩码方案
			if (_maskPattern === 'random') {
				_maskPattern = ~~(Math.random() * (7 + 1));
			} else if (0 <= _maskPattern && _maskPattern <= 7) {
				_maskPattern = _maskPattern >> 0;
			} else {
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
			// console.log({
			// 	mode:_mode,
			// 	typeNumber:_typeNumber,
			// 	errorCorrectionLevel:_errorCorrectionLevel,
			// 	maskPattern:_maskPattern
			// })
			var map = makeImpl(false, _maskPattern);

			return map;
		}
	}
	return getfun();
}

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

module.exports = qr;
