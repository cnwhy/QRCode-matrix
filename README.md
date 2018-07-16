## API 
### 数据类型 `mode`
- 'Numeric'      //数字 0-9
- 'Alphanumeric' //支持数字,大写字母,英文空格及 % * + - . /: 
- 'Byte'         //以字节存储数据 字符串数据默认会转为UTF-8编码存储
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
//["Numeric","Alphanumeric","Byte","Byte-GBK","Byte-SJIS","Kanji"]

console.log(Object.keys(QRCode_utf8.QRModes));
//["Byte"]
```

### QRcode(options) 根据配制生成一个 `qrcode` 对像 

### qrcode.addData(data,mode) //添加数据

### qucode.setData(data,mode) //重新添加数据

### qucode.make() //根据添加的数生成QR码的二维数组

### qucode(data,mode) //一个语法糖
```js
//等同于执行以下代码
qucode.setData(data,mode)
return qucode.make();
```

### qucode.splitMake() //拆分QR码的二维数组
 - `all` : 所有数据 `make` 方法返回的二维矩阵相同
 - `data` : 除探测相并数据 的其它数据
 - `allDiscover` : 所有定位,矫正 等数据
 - `positionProbe` : 定位图数据
 - `positionAdjust` : 矫正图数据
 - `timing` : 定位图

大至关系如下:
```js
all  == data | allDiscover
allDiscover == positionProbe | positionAdjust | timing
```

