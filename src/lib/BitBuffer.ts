interface BitBuffer{
	/**
	 * 获取buffer
	 */
	getBuffer():[];
	/**
	 * 位长度
	 */
	getLengthInBits():number;
	/**
	 * 获取指定位置的值
	 * @param i bitIndex;
	 */
	getAt(i:number):number;
	/**
	 * 插入一个Byte
	 */
	put(v,length):void;
	/**
	 * 增加一位
	 * @param v 值0/1
	 */
	putBit(v:boolean):void;
}

const BitBuffer = function():BitBuffer {
	var _buffer = [];
	var _length = 0;
	var _this:any = {};

	_this.getBuffer = function() {
		return _buffer;
	};

	_this.getAt = function(index) {
		var bufIndex = ~~(index / 8);
		var bitIndex = 7 - (index % 8);
		return ((_buffer[bufIndex] >>> bitIndex) & 1) === 1;
	};

	_this.put = function(num, length) {
		length = ~~length;
		if (length < 0) throw new Error('length:' + length);
		while (length--) {
			_this.putBit(((num >>> length) & 1) === 1);
		}
	};

	_this.getLengthInBits = function() {
		return _length;
	};

	_this.putBit = function(bit) {
		var bufIndex = ~~(_length / 8);
		var bitIndex = 7 - (_length % 8);
		if (_buffer.length <= bufIndex) {
			_buffer.push(0);
		}
		if (bit) {
			_buffer[bufIndex] |= 0x80 >>> _length % 8;
		}
		_length += 1;
	};

	return _this;
};



export default BitBuffer;