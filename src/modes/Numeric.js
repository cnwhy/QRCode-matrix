var QR_MODE = 1;

var qrNumber = function () {
	
	var strToNum = function (s) {
		for (var i = 0; i < s.length; i++) {
			var c = s.charAt(i);
			if (c < '0' || c > '9') {
				throw new Error('illegal char :' + c);
			}
		}
		return +s;
	};

	return function (data) {
		var _mode = QR_MODE;
		var _data = data;
		var _this = {};
		_this.getMode = function () {
			return _mode;
		};
		_this.getLength = function (buffer) {
			return _data.length;
		};
		_this.write = function (buffer) {
			var data = _data;
			var i = 0;
			while (i + 2 < data.length) {
				buffer.put(strToNum(data.substring(i, i + 3)), 10);
				i += 3;
			}
			if (i < data.length) {
				if (data.length - i == 1) {
					buffer.put(strToNum(data.substring(i, i + 1)), 4);
				} else if (data.length - i == 2) {
					buffer.put(strToNum(data.substring(i, i + 2)), 7);
				}
			}
		};
		return _this;
	}
}();

module.exports = qrNumber;