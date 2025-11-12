import QRCode from '../src/index';
var qrcode = QRCode({
	errorCorrectionLevel: 'M', //纠错等级 默认M   'L','M','Q','H' -> [1,0,3,2]
	typeNumber: 2, //QR码版本 默认0 (自动)  1 to 40
	minTypeNumber: 0, //最小typeNumber版本,当typeNumber自动时才有效
	maskPattern: 'auto', //掩模 'random','auto'  [0-7]
	dataMode: 'Byte' //默认数据类型, 参看 QRCode.QRModes 对像
});
qrcode.setData('1234');
var matrix = qrcode.make(); // 一个布尔值的二维数组

var splitMake = qrcode.splitMake()

// console.log(splitMake);
var attr = [
	`all`,
	`data`,
	`allDiscover`,
	`positionProbe`,
	`positionAdjust`,
	`timing`,
]
//在控制台打印出二维码试试 (我的控制台是黑色背景,所以我加上了一圈边框)
var $0 = '8 ', // 0
    $1 = '  ', // 1
	$E = '* '; // 未设定

function showV(matrix){
	const showPadding = true;
	showPadding && console.log($0.repeat(matrix.width + 2));
	for(var r =0; r<matrix.height; r++){
		// let row = matrix.getRow(r);
		// let str = row.map(item => (item ? $1 : $0)).join('');
		var str = '';
		for(var h=0; h<matrix.width; h++){
			str += matrix.has(r,h) ? matrix.get(r,h) ? $1 : $0 : $E;
		}
		showPadding ? console.log($0 + str + $0) : console.log(str);
	}
	showPadding && console.log($0.repeat(matrix.width + 2));
}
attr.map(att=>{
	console.log(att);
	splitMake[att] && showV(splitMake[att]);
})
console.log('make');
showV(matrix);