import Numeric from './modes/Numeric';
import Alphanumeric from './modes/Alphanumeric';
import Byte from './modes/Byte';
import Kanji from './modes/Kanji';

import sjis from './encode/sjis';
import utf8 from './encode/utf-8';
import qrcode from './qrcode';
import * as utils from './utils';
// const GBK = require('gbk.js');
// 数据模式
let QRModes = {
	Numeric: Numeric, //数字 0-9
	Alphanumeric: Alphanumeric, //支持数字,大写字母,英文空格及 % * + - . / : ;
	Byte: Byte(utf8), //以字节存储数据 utf8
	// 'Byte-GBK': Byte(GBK), //以字节存储数据 utf8
	'Byte-SJIS': Byte(sjis), //以字节存储数据 utf8
	Kanji: Kanji() //日文编码 SJIS
};

let defOptions = {
	errorCorrectionLevel: 'M',
	typeNumber: 0,
	maskPattern: 'auto',
	dataMode: 'Byte'
};
export {utils};
export default qrcode(QRModes, defOptions);

// module.exports = require('./src/index')(QRModes,defOptions);
