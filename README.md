 - ~~填充侦测图~~
 - ~~填充校正图~~
 - ~~填充定位图~~
 - ~~填充格式信息~~
 - ~~填充版本信息~~
 - ~~字符串转字节数组~~
 - ~~gbk 两个二分法数组~~

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

### QRcode.QRModes 支持的的 mode 类型

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