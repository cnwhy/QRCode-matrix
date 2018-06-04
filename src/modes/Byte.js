var QR_MODE = 1 << 2;
var qr8BitByte = (function (stringToBytes) {
	stringToBytes = typeof stringToBytes == 'function' ? stringToBytes : require('../encode/utf-8');
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

module.exports = qr8BitByte;