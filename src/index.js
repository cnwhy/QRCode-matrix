var utils = require('./utils');
var QRErrorCorrectionLevel = utils.QRErrorCorrectionLevel;
var cache = {}; //缓存 

module.exports = function(QRModes,defOptions){
	QRcode.QRModes = QRModes;
	
	// 纠错等级
	// L: 1, 7%
	// M: 0, 15%
	// Q: 3, 25%
	// H: 2, 30%
	QRcode.QRErrorCorrectionLevel = QRErrorCorrectionLevel;

	/**
	 * 
	 * @param {object} options 
	 *	{
	 *		errorCorrectionLevel: "M", //纠错等级 默认M   'L','M','Q','H' -> [1,0,3,2]
	 *		typeNumber: 0,             //QR码版本 默认0 (自动)  1 to 40
	 *		maskPattern: 'auto',       //掩模 'random','auto'  [0-7]
	 *		dataMode: 'Byte'           //默认 数据类型 结合 QRModes 参数
	 *	}
	*/
	function QRcode(options) {
		options = options || {};
		var _options = {};
		for (var k in defOptions) {
			_options[k] = options[k] == undefined ? defOptions[k] : options[k];
		}
		
		return (function () {
			var _typeNumber = _options.typeNumber,
				_maskPattern = _options.maskPattern,
				_dataMode = _options.dataMode,
				_errorCorrectionLevel = (function(){
					var l = _options.errorCorrectionLevel;
					for(var k in QRErrorCorrectionLevel){
						var v = QRErrorCorrectionLevel[k]
						if(l === k || +l === v){
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
					if(QRModes[mode]){
						newData = QRModes[mode](data);
					}else{
						throw 'mode type invalid! mode is ' + mode;
					}
				}
				_dataList.push(newData);
				_dataCache = null;
			};

			var make = function () {
				// 如果未指定TypeNumber，则记算适合的TypeNumber
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
			}
			
			var splitMake = function(){
				var obj = {}
				obj.all = make();
				obj.allDiscover = utils.copyMap(cache['basemap_' + _typeNumber]),
				
				//positionProbe
				obj.positionProbe = utils.mapInit(_moduleCount),
				utils.setupAllPositionProbePattern(obj.positionProbe);

				//positionAdjust 
				var positionAdjust = utils.copyMap(obj.positionProbe)
				utils.setupPositionAdjustPattern(positionAdjust);
				obj.positionAdjust = utils.compareMap(obj.positionProbe,positionAdjust,'xor')

				//timing
				var timing = utils.mapInit(_moduleCount);
				utils.setupTimingPattern(timing);
				obj.timing = utils.compareMap(obj.positionAdjust,timing,"and")
				obj.timing = utils.compareMap(obj.timing,timing,"xor")
				
				
				//data
				obj.data = utils.compareMap(obj.all,obj.allDiscover,'xor');

				// console.log(obj.all);
				// console.log(obj.allDiscover);
				// console.log(obj.positionProbe);
				// console.log(obj.positionAdjust);
				// console.log(obj.timing)
				// console.log(obj.data)


				return obj;
			}

			var setData = function(data,mode){
				_dataList = [];
				addData(data,mode);
			}

			var _this = function (str,mode) {
				setData(str,mode);
				return make();
			};

			//暴露到外部的方法
			_this.setData = setData
			_this.addData = addData;
			_this.make = make;
			_this.splitMake = splitMake;

			return _this;
		})();
	}
	
	return QRcode;
}