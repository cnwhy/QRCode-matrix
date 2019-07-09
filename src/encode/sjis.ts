import { SJIS_BASE64, SJIS_COUNT } from './sjisData';

var base64DecodeInputStream = function(str) {
	var _str = str;
	var _pos = 0;
	var _buffer = 0;
	var _buflen = 0;

	var _this = {
		read: function() {
			while (_buflen < 8) {
				if (_pos >= _str.length) {
					if (_buflen == 0) {
						return -1;
					}
					throw 'unexpected end of file./' + _buflen;
				}

				var c = _str.charAt(_pos);
				_pos += 1;

				if (c == '=') {
					_buflen = 0;
					return -1;
				} else if (c.match(/^\s$/)) {
					// ignore if whitespace.
					continue;
				}

				_buffer = (_buffer << 6) | decode(c.charCodeAt(0));
				_buflen += 6;
			}

			var n = (_buffer >>> (_buflen - 8)) & 0xff;
			_buflen -= 8;
			return n;
		}
	};

	var decode = function(c) {
		if (0x41 <= c && c <= 0x5a) {
			return c - 0x41;
		} else if (0x61 <= c && c <= 0x7a) {
			return c - 0x61 + 26;
		} else if (0x30 <= c && c <= 0x39) {
			return c - 0x30 + 52;
		} else if (c == 0x2b) {
			return 62;
		} else if (c == 0x2f) {
			return 63;
		} else {
			throw 'c:' + c;
		}
	};

	return _this;
};

var createStringToBytes = function(unicodeData, numChars) {
	// create conversion map.

	var unicodeMap = (function() {
		var bin = base64DecodeInputStream(unicodeData);
		var read = function() {
			var b = bin.read();
			if (b == -1) throw 'eof';
			return b;
		};

		var count = 0;
		var unicodeMap = {};
		while (true) {
			var b0 = bin.read();
			if (b0 == -1) break;
			var b1 = read();
			var b2 = read();
			var b3 = read();
			var k = String.fromCharCode((b0 << 8) | b1);
			var v = (b2 << 8) | b3;
			unicodeMap[k] = v;
			count += 1;
		}
		if (count != numChars) {
			throw count + ' != ' + numChars;
		}

		return unicodeMap;
	})();

	var unknownChar = '?'.charCodeAt(0);

	return function(s) {
		var bytes = [];
		for (var i = 0; i < s.length; i += 1) {
			var c = s.charCodeAt(i);
			if (c < 128) {
				bytes.push(c);
			} else {
				var b = unicodeMap[s.charAt(i)];
				if (typeof b == 'number') {
					if ((b & 0xff) == b) {
						// 1byte
						bytes.push(b);
					} else {
						// 2bytes
						bytes.push(b >>> 8);
						bytes.push(b & 0xff);
					}
				} else {
					bytes.push(unknownChar);
				}
			}
		}
		return bytes;
	};
};

var SJIS = createStringToBytes(SJIS_BASE64, SJIS_COUNT);

// module.exports = SJIS;
export default SJIS;
