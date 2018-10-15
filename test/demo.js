var QRCode = require('../');
var qrcode = QRCode({
	errorCorrectionLevel: 'M', //纠错等级 默认M   'L','M','Q','H' -> [1,0,3,2]
	typeNumber: 0, //QR码版本 默认0 (自动)  1 to 40
	minTypeNumber: 0, //最小typeNumber版本,当typeNumber自动时才有效
	maskPattern: 'auto', //掩模 'random','auto'  [0-7]
	dataMode: 'Byte' //默认数据类型, 参看 QRCode.QRModes 对像
});
qrcode.setData('1234');
var date = qrcode.make(); // 一个布尔值的二维数组

//在控制台打印出二维码试试 (我的控制台是黑色背景,所以我加上了一圈边框)
var $0 = '◼︎ ',
    $1 = '  ';
console.log($0.repeat(date.length + 2));
date.forEach(function(v, i) {
	let str = v.map(item => (item ? $1 : $0)).join('');
	console.log($0 + str + $0);
});
console.log($0.repeat(date.length + 2));
