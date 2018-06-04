var QR_MODE = 1 << 1;
var qrAlphaNum = function () {
	var Code0 = '0'.charCodeAt(0),
		Code9 = '9'.charCodeAt(0),
		CodeA = 'A'.charCodeAt(0),
		CodeZ = 'Z'.charCodeAt(0);

	var getCode = function (s) {
		var c = s.charCodeAt(0);
		// 0 - 9
		if (Code0 <= c && c <= Code9) {
			return c - Code0;
			// A - Z
		} else if (CodeA <= c && c <= CodeZ) {
			return c - CodeA + 10;
		} else {
			var other = [' ', '$', '%', '*', '+', '-', '.', '/', ':'];
			var i = other.indexOf(s);
			if (~i) {
				return i + 36;
			} else {
				throw 'illegal char :' + s;
			}
		}
	};

	return function (data) {
		var _data = data;
		var _this = {};

		_this.getMode = function () {
			return QR_MODE;
		};

		_this.getLength = function (buffer) {
			return _data.length;
		};

		_this.write = function (buffer) {
			var s = _data;
			var i = 0;
			while (i + 1 < s.length) {
				buffer.put(getCode(s.charAt(i)) * 45 + getCode(s.charAt(i + 1)), 11);
				i += 2;
			}
			if (i < s.length) {
				buffer.put(getCode(s.charAt(i)), 6);
			}
		};
		return _this;
	};

}();

module.exports = qrAlphaNum;