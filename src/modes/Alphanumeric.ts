import { mode } from './mode';
import BitBuffer from '../lib/BitBuffer';

const QR_MODE = 1 << 1;
const [Code0, Code9, CodeA, CodeZ] = ['0', '9', 'A', 'Z'].map(v => v.charCodeAt(0));

const qrAlphaNum = (function() {
	var getCode = function(s) {
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

	return function(data): mode {
		var _data = data;
		var _this = {
			getMode: function() {
				return QR_MODE;
			},

			getLength: function() {
				return _data.length;
			},

			write: function(buffer: BitBuffer) {
				var s = _data;
				var i = 0;
				while (i + 1 < s.length) {
					buffer.put(getCode(s.charAt(i)) * 45 + getCode(s.charAt(i + 1)), 11);
					i += 2;
				}
				if (i < s.length) {
					buffer.put(getCode(s.charAt(i)), 6);
				}
			}
		};
		return _this;
	};
})();

// module.exports = qrAlphaNum;
export default qrAlphaNum;
