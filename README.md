# qrcode-matrix
> `qrcode-matrix` 是QR码矩阵数据生成库, 最终生成QR码的二维数组.
> 非一步一位生成二维码图片, 主要用于二维码图片生成/美化, 矢量图片二维码生成等场景

特点:  
`splitMake` 方法, 会返回二维码不同功能的点阵信息二维数组.

## demo
```js
var QRCode = require('qrcode.js');
var qrcode = QRCode({
	errorCorrectionLevel: "M", //纠错等级 默认M   'L','M','Q','H' -> [1,0,3,2]
	typeNumber: 0,             //QR码版本 默认0 (自动)  1 to 40
	maskPattern: 'auto',       //掩模 'random','auto'  [0-7]
	dataMode: 'Byte'           //默认数据类型 结合 QRModes 参数
})
qrcode.setData('1234');
var date = qrcode.make(); // 一个布尔值的二维数组
date.forEach(function(v,i){
	console.log(v.map(function(item){return item?'☐':'◼︎'}).join(' '))
})
/*
☐ ☐ ☐ ☐ ☐ ☐ ☐ ◼︎ ◼︎ ☐ ◼︎ ☐ ◼︎ ◼︎ ☐ ☐ ☐ ☐ ☐ ☐ ☐
☐ ◼︎ ◼︎ ◼︎ ◼︎ ◼︎ ☐ ◼︎ ◼︎ ☐ ☐ ☐ ☐ ◼︎ ☐ ◼︎ ◼︎ ◼︎ ◼︎ ◼︎ ☐
☐ ◼︎ ☐ ☐ ☐ ◼︎ ☐ ◼︎ ☐ ◼︎ ☐ ☐ ◼︎ ◼︎ ☐ ◼︎ ☐ ☐ ☐ ◼︎ ☐
☐ ◼︎ ☐ ☐ ☐ ◼︎ ☐ ◼︎ ☐ ☐ ◼︎ ◼︎ ☐ ◼︎ ☐ ◼︎ ☐ ☐ ☐ ◼︎ ☐
☐ ◼︎ ☐ ☐ ☐ ◼︎ ☐ ◼︎ ☐ ☐ ◼︎ ☐ ☐ ◼︎ ☐ ◼︎ ☐ ☐ ☐ ◼︎ ☐
☐ ◼︎ ◼︎ ◼︎ ◼︎ ◼︎ ☐ ◼︎ ☐ ◼︎ ◼︎ ◼︎ ☐ ◼︎ ☐ ◼︎ ◼︎ ◼︎ ◼︎ ◼︎ ☐
☐ ☐ ☐ ☐ ☐ ☐ ☐ ◼︎ ☐ ◼︎ ☐ ◼︎ ☐ ◼︎ ☐ ☐ ☐ ☐ ☐ ☐ ☐
◼︎ ◼︎ ◼︎ ◼︎ ◼︎ ◼︎ ◼︎ ◼︎ ☐ ☐ ☐ ☐ ☐ ◼︎ ◼︎ ◼︎ ◼︎ ◼︎ ◼︎ ◼︎ ◼︎
☐ ◼︎ ☐ ☐ ☐ ☐ ☐ ◼︎ ◼︎ ☐ ☐ ◼︎ ☐ ◼︎ ☐ ☐ ☐ ☐ ☐ ◼︎ ◼︎
☐ ☐ ☐ ◼︎ ◼︎ ☐ ◼︎ ◼︎ ☐ ☐ ◼︎ ◼︎ ☐ ◼︎ ◼︎ ☐ ◼︎ ◼︎ ☐ ☐ ☐
◼︎ ◼︎ ☐ ☐ ◼︎ ◼︎ ☐ ◼︎ ☐ ☐ ☐ ☐ ◼︎ ☐ ◼︎ ◼︎ ☐ ◼︎ ◼︎ ◼︎ ◼︎
☐ ☐ ◼︎ ◼︎ ☐ ◼︎ ◼︎ ☐ ◼︎ ☐ ☐ ◼︎ ◼︎ ◼︎ ◼︎ ☐ ☐ ◼︎ ☐ ☐ ◼︎
◼︎ ◼︎ ☐ ◼︎ ☐ ☐ ☐ ☐ ☐ ☐ ◼︎ ☐ ◼︎ ☐ ◼︎ ◼︎ ☐ ☐ ◼︎ ◼︎ ◼︎
◼︎ ◼︎ ◼︎ ◼︎ ◼︎ ◼︎ ◼︎ ◼︎ ☐ ◼︎ ◼︎ ☐ ☐ ☐ ☐ ◼︎ ◼︎ ◼︎ ☐ ☐ ☐
☐ ☐ ☐ ☐ ☐ ☐ ☐ ◼︎ ◼︎ ◼︎ ☐ ◼︎ ☐ ◼︎ ☐ ☐ ◼︎ ☐ ◼︎ ◼︎ ◼︎
☐ ◼︎ ◼︎ ◼︎ ◼︎ ◼︎ ☐ ◼︎ ☐ ☐ ☐ ☐ ☐ ☐ ☐ ◼︎ ◼︎ ◼︎ ☐ ◼︎ ◼︎
☐ ◼︎ ☐ ☐ ☐ ◼︎ ☐ ◼︎ ☐ ☐ ☐ ◼︎ ☐ ◼︎ ◼︎ ☐ ◼︎ ☐ ◼︎ ☐ ◼︎
☐ ◼︎ ☐ ☐ ☐ ◼︎ ☐ ◼︎ ☐ ◼︎ ☐ ◼︎ ☐ ◼︎ ◼︎ ☐ ◼︎ ☐ ☐ ◼︎ ◼︎
☐ ◼︎ ☐ ☐ ☐ ◼︎ ☐ ◼︎ ☐ ☐ ◼︎ ☐ ◼︎ ☐ ◼︎ ◼︎ ☐ ◼︎ ☐ ◼︎ ◼︎
☐ ◼︎ ◼︎ ◼︎ ◼︎ ◼︎ ☐ ◼︎ ◼︎ ◼︎ ☐ ◼︎ ◼︎ ◼︎ ◼︎ ☐ ☐ ◼︎ ☐ ◼︎ ◼︎
☐ ☐ ☐ ☐ ☐ ☐ ☐ ◼︎ ☐ ◼︎ ◼︎ ☐ ◼︎ ☐ ◼︎ ◼︎ ☐ ◼︎ ☐ ☐ ◼︎
*/
``` 

## API 
### 数据类型 `mode`
- 'Numeric'      //数字 0-9
- 'Alphanumeric' //支持数字,大写字母,英文空格及 % * + - . /: 
- 'Byte'         //以字节存储数据 字符串数据默认会转为UTF-8编码存储
- 'Byte-GBK'     //以字节存储数据 字符串转为'GBK'编码字节
- 'Kanji'        //双字节日文编码 字符串数据默认会以SJIS编码存储

### QRcode.QRErrorCorrectionLevel 纠错等级
```js
QRcode.QRErrorCorrectionLevel['L'] = 1 // 7%
QRcode.QRErrorCorrectionLevel['M'] = 0 // 15%
QRcode.QRErrorCorrectionLevel['Q'] = 3 // 25%
QRcode.QRErrorCorrectionLevel['H'] = 2 // 30%
```

### QRcode.QRModes 支持的的 mode 类型列表
``` js
var QRCode = require('qrcode.js') 
var QRCode_utf8 = require('qrcode.js/anlyUTF8') //QRModes只有一种 即 'Byte', 用于web端, 引用文件较小

console.log(Object.keys(QRCode.QRModes)); 
//["Numeric","Alphanumeric","Byte","Byte-GBK","Kanji"]

console.log(Object.keys(QRCode_utf8.QRModes));
//["Byte"]
```

### QRcode(options) 根据配制生成一个 `qrcode` 对像 

### qrcode.addData(data,mode) //添加数据 可以多次添加

### qucode.setData(data,mode) //重新添加数据 会移出之前的数据

### qucode.make() //根据添加的数生成QR码的二维数组

### qucode(data,mode) //一个语法糖
```js
//等同于执行以下代码
qucode.setData(data,mode)
return qucode.make();
```

### qucode.splitMake() //拆分QR码的二维数组 将返回一个对像
 - `all` : 所有数据 `make` 方法返回的二维矩阵相同
 - `data` : 除探测相并数据 的其它数据
 - `allDiscover` : 所有定位,矫正 等数据
 - `positionProbe` : 定位图数据
 - `positionAdjust` : 矫正图数据
 - `timing` : 定位图
![splitMake](https://github.com/cnwhy/QRCode/blob/master/test/splitMake.png?raw=true)

大至关系如下:
```js
all  == data | allDiscover
allDiscover == positionProbe | positionAdjust | timing
```