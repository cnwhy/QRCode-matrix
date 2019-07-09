// var QRCode = require('../src/').default;
import QRCode from '../src/index';

var qrcode = QRCode({
	errorCorrectionLevel: 'M', //纠错等级 默认M   'L','M','Q','H' -> [1,0,3,2]
	typeNumber: 5, //QR码版本 默认0 (自动)  1 to 40
	minTypeNumber: 0, //最小typeNumber版本,当typeNumber自动时才有效
	maskPattern: 'auto', //掩模 'random','auto'  [0-7]
	dataMode: 'Byte' //默认数据类型, 参看 QRCode.QRModes 对像
});
qrcode.setData('火车头');
// var all = qrcode.make(); // 一个布尔值的二维数组
//@ts-ignore
console.log(QRCode.QRErrorCorrectionLevels);

shwoData(qrcode.make());
// var data = qrcode.splitMake();
// shwoData(data.all);
// shwoData(data.allDiscover);
// shwoData(data.positionProbe);
// shwoData(data.positionAdjust);
// shwoData(data.timing);
// shwoData(data.data);


// console.log(all);
// return;
// return;
//在控制台打印出二维码试试 (我的控制台是黑色背景,所以我加上了一圈边框)
// shwoData(all);



function shwoData(data){
	// var $0 = '  ',
    // $1 = '◼︎ ';
	var $0 = '◼︎ ',$1 = '  ';
	var width = data.width;
	var height = data.height;
	var str = ''	
	str +=  $0.repeat(width + 2) + '\n';
	for (let y = 0; y < height; y++) {
		str += $0;
		for (let x = 0; x < width; x++) {
			var item = data.get(x,y);
			str += item ? $1 : $0;
		}
		str += $0 + '\n'
	}
	str += $0.repeat(width + 2);
	console.log(str);
	console.log('');
}
