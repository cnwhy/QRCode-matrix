debugger;
var QR = require('../src/qr');
var QRi = require('../src/')
var op = {
	errorCorrectionLevel:QR.QRErrorCorrectionLevel.H,
	// typeNumber:7
}
debugger;
var qr = QR(op);
var qr1 = QRi(op);
//var str = '我们的想法是在模板矩阵中填入在所有V1-L QR码中都固定不变的标识来简化生成过程，那么首先我们得找出所有这样固定不变的标识。之前提到的功能性标识包含了大部分固定的图样，那么我们先填充出这些功能性标识。定位标识和校正标识可以定义为变量，但是定时标识会随版本变化有长度变化，为了代码的可扩展性，我们把定时标识定义为生成函数。';
// JSON.stringify()
var str = 123;
// console.log(JSON.stringify(qr(str)));
console.log('-----------');
// console.log(JSON.stringify(qr1(str)));
console.log('-----------');

var qr2 = QRi(op);
qr2.addData(str);
qr2.addData('12345',"Numeric");
console.log(JSON.stringify(qr2('abc')));