import { mode } from "./mode";
import BitBuffer from "../lib/BitBuffer";
import sjis from '../encode/sjis'

const QR_MODE = 1 << 3;
const qrKanji = function (stringToBytes?) {
	stringToBytes = typeof stringToBytes == 'function' ? stringToBytes : sjis;
	// !function (c, code) {
	// 	// self test for sjis support.
	// 	var test = stringToBytes(c);
	// 	if (test.length != 2 || ((test[0] << 8) | test[1]) != code) {
	// 		throw 'sjis not supported.';
	// 	}
	// }('\u53cb', 0x9746);
	return function (data):mode {
		var _data = data;
		var _bytes = stringToBytes(data);
		var _this = {
			getMode: function () {
				return QR_MODE;
			},
	
			getLength: function () {
				return ~~(_bytes.length / 2);
			},
	
			write: function (buffer:BitBuffer) {
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
			}
			
		};
		return _this;
	};
};

// module.exports = qrKanji;
export default qrKanji;