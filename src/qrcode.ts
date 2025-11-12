import * as utils from './utils';
import QRMatrix from './lib/QRMatrix';
// var utils = require('./utils');
// var QRErrorCorrectionLevel = utils.QRErrorCorrectionLevel;
namespace Class {
	export interface qrcodeOptions {
		errorCorrectionLevel: string | number; //纠错等级 默认M   'L','M','Q','H' -> [1,0,3,2]
		typeNumber: number; //QR码版本 默认0 (自动)  1 to 40
		minTypeNumber?: number;
		maskPattern: string | number;
		dataMode: string | object;
	}
	export interface QRcom {
		(data, mode?): QRMatrix;
		splitMake(): any;
		make(): QRMatrix;
		addData(data, mode?);
		setData(data, mode?);
	}
}

// function create(QRModes, defOptions) {}

// module.exports = function(QRModes, defOptions) {
function Class(QRModes: any, defOptions: Class.qrcodeOptions): (x) => Class.QRcom {
	QRcode.QRModes = QRModes;

	// 纠错等级
	// L: 1, 7%
	// M: 0, 15%
	// Q: 3, 25%
	// H: 2, 30%
	let QRErrorCorrectionLevels = (QRcode.QRErrorCorrectionLevels = Object.keys(
		utils.QRErrorCorrectionLevel
	));

	/**
	 *
	 *	{
	 *		errorCorrectionLevel: "M", //纠错等级 默认M   'L','M','Q','H' -> [1,0,3,2]
	 *		typeNumber: 0,             //QR码版本 默认0 (自动)  1 to 40
	 *		minTypeNumber: 0,
	 *		maskPattern: 'auto',
	 *		dataMode: 'Byte'
	 *	}
	 * @param {object} options
	 * @param {string} options.errorCorrectionLevel //纠错等级 默认M   'L','M','Q','H'
	 * @param {number} options.typeNumber //QR码版本 默认0 (自动)  1 to 40
	 * @param {number} options.minTypeNumber //最小版本 版本自动时生效果
	 * @param {string|number} options.maskPattern //掩模 'random','auto'  [0-7]
	 * @param {string} options.dataMode //默认 数据类型 结合 QRModes 参数
	 */
	function QRcode(options): Class.QRcom {
		options = options || {};
		// var _options = {};
		// for (var k in defOptions) {
		// 	_options[k] = options[k] == undefined ? defOptions[k] : options[k];
		// }
		// let _options:qrcodeOptions = Object.assign({}, defOptions, options);
		let _options: Class.qrcodeOptions = { ...defOptions, ...options };

		return (function() {
			let _typeNumber = _options.typeNumber,
				_minTypeNumber = _options.minTypeNumber,
				_maskPattern = _options.maskPattern,
				_dataMode = _options.dataMode,
				_errorCorrectionLevel = (function() {
					let l = _options.errorCorrectionLevel + '';
					l = l.toUpperCase();
					return ~QRErrorCorrectionLevels.indexOf(l)
						? utils.QRErrorCorrectionLevel[l]
						: utils.QRErrorCorrectionLevel.M;
				})();

			let _moduleCount = 0,
				_dataList = [],
				_dataCache: number[] = null;

			let makeImpl = function(test: boolean, maskPattern: number): QRMatrix {
				let matrix: QRMatrix = utils.getBaseQRMatrix(_typeNumber);

				//填充格式信息
				utils.setupTypeInfo(matrix, test, _errorCorrectionLevel, maskPattern);

				//填充版本信息
				_typeNumber >= 7 && utils.setupTypeNumber(matrix, test);
				// return matrix;
				// //填充数据
				if (_dataCache == null) {
					_dataCache = utils.createData(_typeNumber, _errorCorrectionLevel, _dataList);
				}

				utils.setupData(matrix, _dataCache, maskPattern);
				return matrix;
			};

			var addData = function(data, mode?) {
				mode = mode || _dataMode;
				var newData = null;
				if (typeof mode == 'function') {
					newData = mode(data);
					if (!(newData.getMode && newData.getLength && newData.write)) {
						throw 'mode invalid!';
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

			var make = function() {
				// 如果未指定TypeNumber，则记算适合的TypeNumber
				if (_typeNumber < 1) {
					var typeNumber = _minTypeNumber ? _minTypeNumber : 1;
					for (; typeNumber < 40; typeNumber++) {
						// var rsBlocks = utils.getRSBlocks(typeNumber, _errorCorrectionLevel);

						// var buffer = utils.BitBuffer();
						// for (var i = 0; i < _dataList.length; i++) {
						// 	var data = _dataList[i];
						// 	// console.log(data.getMode)
						// 	buffer.put(data.getMode(), 4);
						// 	buffer.put(data.getLength(), utils.getLengthInBits(data.getMode(), typeNumber));
						// 	data.write(buffer);
						// }

						// var totalDataCount = 0;
						// for (var i = 0; i < rsBlocks.length; i++) {
						// 	totalDataCount += rsBlocks[i].dataCount;
						// }
						var buffer = utils.getBufferForModes(typeNumber, _dataList);
						var totalDataCount = utils.getMaxDataCount(typeNumber, _errorCorrectionLevel);

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
				} else if (typeof _maskPattern === 'number' && 0 <= _maskPattern && _maskPattern <= 7) {
					_maskPattern = Number(_maskPattern) >> 0;
					// 自动筛选最优掩模
				} else {
					//auto
					_maskPattern = (function() {
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
					})();
				}

				var map = makeImpl(false, _maskPattern);
				return map;
			};

			var splitMake = function() {
				var obj: any = {};
				obj.all = make();

				obj.allDiscover = utils.getBaseQRMatrix(_typeNumber);

				//positionProbe
				obj.positionProbe = utils.mapInit(_moduleCount);
				utils.setupAllPositionProbePattern(obj.positionProbe);

				//positionAdjust
				// var positionAdjust = utils.copyMap(obj.positionProbe);
				obj.positionAdjust = utils.mapInit(_moduleCount);
				utils.setupPositionAdjustPattern(obj.positionAdjust);
				// obj.positionAdjust = utils.compareMap(obj.positionProbe, positionAdjust, 'xor');

				//timing
				obj.timing = utils.mapInit(_moduleCount);
				utils.setupTimingPattern(obj.timing);

				// obj.timing = utils.compareMap(obj.positionAdjust, timing, 'and');
				// obj.timing = utils.compareMap(obj.timing, timing, 'xor');

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

			var setData = function(data, mode?) {
				_dataList = [];
				addData(data, mode);
			};

			var _this: any = function(str, mode?) {
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
export default Class;
