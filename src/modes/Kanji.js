var QR_MODE = 1 << 3;
var sjis = require('../ecode/sjis')
var qrKanji = function (stringToBytes) {
	stringToBytes = typeof stringToBytes == 'function' ? stringToBytes : sjis;
	if (!stringToBytes) {
		throw 'sjis not supported.';
	}! function (c, code) {
		// self test for sjis support.
		var test = stringToBytes(c);
		if (test.length != 2 || ((test[0] << 8) | test[1]) != code) {
			throw 'sjis not supported.';
		}
	}('\u53cb', 0x9746);
	return function (data) {
		var _mode = QR_MODE;
		var _data = data;
		
		var _bytes = stringToBytes(data);

		var _this = {};

		_this.getMode = function () {
			return _mode;
		};

		_this.getLength = function (buffer) {
			return ~~(_bytes.length / 2);
		};

		_this.write = function (buffer) {

			var data = _bytes;

			var i = 0;

			while (i + 1 < data.length) {

				var c = ((0xff & data[i]) << 8) | (0xff & data[i + 1]);

				if (0x8140 <= c && c <= 0x9FFC) {
					c -= 0x8140;
				} else if (0xE040 <= c && c <= 0xEBBF) {
					c -= 0xC140;
				} else {
					throw 'illegal char at ' + (i + 1) + '/' + c;
				}

				c = ((c >>> 8) & 0xff) * 0xC0 + (c & 0xff);

				buffer.put(c, 13);

				i += 2;
			}

			if (i < data.length) {
				throw 'illegal char at ' + (i + 1);
			}
		};

		return _this;
	};
};

module.exports = qrKanji;