// 数据模式
var QRModes = {
	'Numeric': require('./src/modes/Numeric'),   //数字 0-9
	'Alphanumeric': require('./src/modes/Alphanumeric'), //支持数字,大写字母,英文空格及 % * + - . / : ;
	'Byte': require('./src/modes/Byte')(),  //以字节存储数据 utf8
	'Byte-GBK': require('./src/modes/Byte')(require('./src/encode/gbk')),  //以字节存储数据 utf8
	'Byte-SJIS': require('./src/modes/Byte')(require('./src/encode/sjis')),  //以字节存储数据 utf8
	'Kanji': require('./src/modes/Kanji')() //日文编码 SJIS
};

var defOptions = {
	errorCorrectionLevel: "M",
	typeNumber: 0,
	maskPattern: 'auto',
	dataMode: 'Byte'
}

module.exports = require('./src/index')(QRModes,defOptions);