import { mode } from './mode';
import BitBuffer from '../lib/BitBuffer';
const QR_MODE = 1 << 2;
const qr8BitByte = function(stringToBytes:(str:string)=>number[]) {
	// stringToBytes = typeof stringToBytes == 'function' ? stringToBytes : utf8;
	return function(data:string): mode {
		var _data = data + '';
		var _bytes = _data == data ? stringToBytes(_data) : data;
		_bytes = _bytes instanceof Array ? _bytes : [];
		var _this = {
			getMode: function() {
				return QR_MODE;
			},

			getLength: function() {
				return _bytes.length;
			},

			write: function(buffer:BitBuffer) {
				for (var i = 0; i < _bytes.length; i++) {
					buffer.put(_bytes[i], 8);
				}
			}
		};

		return _this;
	};
};

export default qr8BitByte;
