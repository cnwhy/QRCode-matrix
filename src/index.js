var utils = require('./utils');
// var qrNumber = require('./modes/Numeric'),
// 	qrAlphaNum = require('./modes/Alphanumeric'),
// 	qr8BitByte = require('./modes/Byte'),
// 	qrKanji = require('./modes/Kanji');

// 数据模式
var QRMode = QRcode.QRMode = {
	'Numeric': require('./modes/Numeric'),
	'Alphanumeric': require('./modes/Alphanumeric'),
	'Byte-UTF8': require('./modes/Byte')(),
	'Kanji-SJIS': require('./modes/Kanji')()
};

// 纠错等级
var QRErrorCorrectionLevel = QRcode.QRErrorCorrectionLevel = utils.QRErrorCorrectionLevel;

function QRcode(options) {
	options = options || {};
	var defOptions = {
		errorCorrectionLevel: QRErrorCorrectionLevel.M,
		typeNumber: 0,
		maskPattern: 'auto'
	}
	var _options = {};
	for (var k in defOptions) {
		_options[k] = options[k] == undefined ? defOptions[k] : options[k];
	}

	var cache = {};

	var newQR = function () {
		var _typeNumber = _options.typeNumber,
			_errorCorrectionLevel = _options.errorCorrectionLevel,
			_maskPattern = _options.maskPattern;

		var _moduleCount = 0,
			_dataList = [],
			_dataCache = null;

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
				_dataCache = utils.createData(_typeNumber, _errorCorrectionLevel, _dataList);
			}
			return utils.mapData(map, _dataCache, maskPattern);
		};

		var addData = function (data, mode) {
			mode = mode || 'Byte';
			var newData = null;
			if (typeof mode == 'function') {
				newData = mode(data);
				if (!(newData.getMode && newData.getLength && newData.write)) {
					throw 'mode invalid!'
				}
			} else {
				switch (mode) {
					case 'Numeric':
						newData = QRMode['Numeric'](data);
						break;
					case 'Alphanumeric':
						newData = QRMode['Alphanumeric'](data);
						break;
					case 'Byte':
						newData = QRMode['Byte-UTF8'](data);
						break;
					case 'Kanji':
						newData = QRMode['Kanji-SJIS'](data);
						break;
					default:
						throw 'mode:' + mode;
				}
			}
			_dataList.push(newData);
			_dataCache = null;
		};

		var make = function () {
			// 为指定TypeNumber，则记算适合的TypeNumber
			if (_typeNumber < 1) {
				var typeNumber = 1;
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

			// 掩码方案

			// 随机
			if (_maskPattern === 'random') { 
				_maskPattern = ~~(Math.random() * (7 + 1));
			// 指定方案
			} else if (0 <= _maskPattern && _maskPattern <= 7) {
				_maskPattern = _maskPattern >> 0;
			// 筛选最优掩码
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

			var map = makeImpl(false, _maskPattern);
			return map;
		}

		var _this = function (str) {
			_this.addData(str);
			return _this.make();
		};

		_this.setData = function(data,mode){
			_this._dataList = [];
			_this.addData(data,mode);
		};
		_this.addData = addData;
		_this.make = make;

		return _this;
	}
	var getfun = function (data,mode) {
		var qr = newQR();
		if(data){
			qr.addData(data,mode);
			return qr.make();
		}else{
			return qr;
		}
	}
	return getfun;
}

module.exports = QRcode;