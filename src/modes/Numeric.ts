import { mode } from './mode';
import BitBuffer from '../lib/BitBuffer';

var QR_MODE = 1;

var qrNumber = (function() {
	var strToNum = function(s) {
		for (var i = 0; i < s.length; i++) {
			var c = s.charAt(i);
			if (c < '0' || c > '9') {
				throw 'illegal char :' + c;
			}
		}
		return +s;
	};

	return function(data): mode {
		var _data = data;
		var _this = {
			getMode: function() {
				return QR_MODE;
			},
			getLength: function() {
				return _data.length;
			},
			write: function(buffer:BitBuffer) {
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
			}
		};
		return _this;
	};
})();

// module.exports = qrNumber;
export default qrNumber;
