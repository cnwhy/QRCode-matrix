// 数据模式
var QRModes = {
	'Byte': require('./src/modes/Byte')()  //以字节存储数据 utf8
};
var defOptions = {
	errorCorrectionLevel: "M",
	typeNumber: 0,
	maskPattern: 'auto',
	dataMode: 'Byte'
}
module.exports = require('./src/index')(QRModes,defOptions);