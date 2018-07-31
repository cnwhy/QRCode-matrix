/*!
 * qrcode-matrix v0.1.1
 * Homepage https://github.com/cnwhy/QRCode-matrix
 * License MIT
 */

(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.qrcodeMatrix = factory());
}(this, (function () { 'use strict';

	var QR_MODE = 1;

	var qrNumber = function () {
		
		var strToNum = function (s) {
			for (var i = 0; i < s.length; i++) {
				var c = s.charAt(i);
				if (c < '0' || c > '9') {
					throw 'illegal char :' + c;
				}
			}
			return +s;
		};

		return function (data) {
			var _data = data;
			var _this = {};
			_this.getMode = function () {
				return QR_MODE;
			};
			_this.getLength = function (buffer) {
				return _data.length;
			};
			_this.write = function (buffer) {
				var data = _data;
				var i = 0;
				while (i + 2 < data.length) {
					buffer.put(strToNum(data.substring(i, i + 3)), 10);
					i += 3;
				}
				if (i < data.length) {
					if (data.length - i == 1) {
						buffer.put(strToNum(data.substring(i, i + 1)), 4);
					} else if (data.length - i == 2) {
						buffer.put(strToNum(data.substring(i, i + 2)), 7);
					}
				}
			};
			return _this;
		}
	}();

	var Numeric = qrNumber;

	var QR_MODE$1 = 1 << 1;
	var qrAlphaNum = function () {
		var Code0 = '0'.charCodeAt(0),
			Code9 = '9'.charCodeAt(0),
			CodeA = 'A'.charCodeAt(0),
			CodeZ = 'Z'.charCodeAt(0);

		var getCode = function (s) {
			var c = s.charCodeAt(0);
			// 0 - 9
			if (Code0 <= c && c <= Code9) {
				return c - Code0;
				// A - Z
			} else if (CodeA <= c && c <= CodeZ) {
				return c - CodeA + 10;
			} else {
				var other = [' ', '$', '%', '*', '+', '-', '.', '/', ':'];
				var i = other.indexOf(s);
				if (~i) {
					return i + 36;
				} else {
					throw 'illegal char :' + s;
				}
			}
		};

		return function (data) {
			var _data = data;
			var _this = {};

			_this.getMode = function () {
				return QR_MODE$1;
			};

			_this.getLength = function (buffer) {
				return _data.length;
			};

			_this.write = function (buffer) {
				var s = _data;
				var i = 0;
				while (i + 1 < s.length) {
					buffer.put(getCode(s.charAt(i)) * 45 + getCode(s.charAt(i + 1)), 11);
					i += 2;
				}
				if (i < s.length) {
					buffer.put(getCode(s.charAt(i)), 6);
				}
			};
			return _this;
		};

	}();

	var Alphanumeric = qrAlphaNum;

	function toUTF8Array(str) {
		var utf8 = [];
		for (var i = 0; i < str.length; i++) {
			var charcode = str.charCodeAt(i);
			if (charcode < 0x80) utf8.push(charcode);
			else if (charcode < 0x800) {
				utf8.push(0xc0 | (charcode >> 6),
					0x80 | (charcode & 0x3f));
			} else if (charcode < 0xd800 || charcode >= 0xe000) {
				utf8.push(0xe0 | (charcode >> 12),
					0x80 | ((charcode >> 6) & 0x3f),
					0x80 | (charcode & 0x3f));
			}
			// surrogate pair
			else {
				i++;
				// UTF-16 encodes 0x10000-0x10FFFF by
				// subtracting 0x10000 and splitting the
				// 20 bits of 0x0-0xFFFFF into two halves
				charcode = 0x10000 + (((charcode & 0x3ff) << 10) |
					(str.charCodeAt(i) & 0x3ff));
				utf8.push(0xf0 | (charcode >> 18),
					0x80 | ((charcode >> 12) & 0x3f),
					0x80 | ((charcode >> 6) & 0x3f),
					0x80 | (charcode & 0x3f));
			}
		}
		return utf8;
	}

	var utf8 = toUTF8Array;

	var QR_MODE$2 = 1 << 2;
	var qr8BitByte = (function (stringToBytes) {
		stringToBytes = typeof stringToBytes == 'function' ? stringToBytes : utf8;
		return function (data) {
			var _data = data + '';
			var _bytes = _data == data ? stringToBytes(_data) : data;
			var _this = {};
			_bytes = _bytes instanceof Array ? _bytes : [];
			
			_this.getMode = function () {
				return QR_MODE$2;
			};

			_this.getLength = function (buffer) {
				return _bytes.length;
			};

			_this.write = function (buffer) {
				for (var i = 0; i < _bytes.length; i++) {
					buffer.put(_bytes[i], 8);
				}
			};
			return _this;
		}
	});

	var Byte = qr8BitByte;

	var commonjsGlobal = typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

	function createCommonjsModule(fn, module) {
		return module = { exports: {} }, fn(module, module.exports), module.exports;
	}

	var gbk = createCommonjsModule(function (module, exports) {
	/*!
	 * gbk.js v0.2.3
	 * Homepage https://github.com/cnwhy/GBK.js
	 * License MIT
	 */

	(function (global, factory) {
		module.exports = factory();
	}(commonjsGlobal, (function () {
		var GBK = function (gbk_us) {
			var arr_index = 0x8140; //33088;
			var gbk = {
				decode: function (arr) {
					var str = "";
					for (var n = 0, max = arr.length; n < max; n++) {
						var Code = arr[n];
						if (Code & 0x80) {
							Code = gbk_us[(Code << 8 | arr[++n]) - arr_index];
						}
						str += String.fromCharCode(Code || 63);
					}
					return str;
				},
				encode: function (str) {
					str += '';
					var gbk = [];
					var wh = '?'.charCodeAt(0); //gbk中没有的字符的替换符
					for (var i = 0; i < str.length; i++) {
						var charcode = str.charCodeAt(i);
						if (charcode < 0x80) gbk.push(charcode);
						else {
							var gcode = gbk_us.indexOf(charcode);
							if (~gcode) {
								gcode += arr_index;
								gbk.push(0xFF & (gcode >> 8), 0xFF & gcode);
							} else {
								gbk.push(wh);
							}
						}
					}
					return gbk;
				}
			};
			return gbk;
		};
		var gbk = GBK;

		var URI = function(GBK){
			var passChars = '!\'()*-._~';	
			var otherPassChars = '#$&+,/:;=?@';
			function getModue(passChars){
				var passBits = passChars.split('').sort();
				var isPass = function (s){
					return ~passChars.indexOf(s) || /[0-9a-zA-Z]/.test(s)
				};
				return {
					encode:function(str){
						return (str+'').replace(/./g,function(v){
							if(isPass(v)) return v;
							var bitArr = GBK.encode(v);
							for(var i=0; i<bitArr.length; i++){
								bitArr[i] = '%' + ('0'+bitArr[i].toString(16)).substr(-2).toUpperCase();
							}
							return bitArr.join('');
						})
					},
					decode:function(enstr){
						return enstr.replace(/(%[\dA-Za-z]{2})+/g,function(a,b,c){
							var str = '';
							var arr = a.match(/.../g);
							for(var i=0; i < arr.length; i++){
								var hex = arr[i];
								var code = parseInt(hex.substr(1),16);
								if(code & 0x80){
									str += GBK.decode([code,parseInt(arr[++i].substr(1),16)]);
								}else{
									var char = String.fromCharCode(code);
									if(isPass(char)){
										str += hex;
									}else{
										str += char;
									}
								}
							}
							return str;
						})
					}
				}
			}

			var URIComponent = getModue(passChars);
			var URI = getModue(passChars + otherPassChars);

			return {
				encodeURI:URI.encode,
				decodeURI:URI.decode,
				encodeURIComponent:URIComponent.encode,
				decodeURIComponent:URIComponent.decode
			}
		};

		var src = function (gbk_us){
		    var gbk$$1 = gbk(gbk_us);
		    gbk$$1.URI = URI(gbk$$1);
		    return gbk$$1;
		};

		// 多进制转换后的数字还原函数 构建时会替换占位符
		var Fn_Hex_decode = function decode(){
					var n = 0, str = arguments[0];
					for (var i = 0,w = str.length; i < w; i++) {
						var code = str.charCodeAt(i);
						if(code < 38 || code > 126) return NaN;
						n += (code - 38) * Math.pow(89, w - i - 1);
					}
					return n;
				};

		// 解压Unicode编码字符串函数 构建时会替换占位符
		var Fn_unzip = function unZip() {
					return arguments[0].replace(/\x23(\d+)\x24/g, function (a, b) {
							return Array(+b + 4).join("#");
						})
						.replace(/[\x26-\x7e]\x25[\x26-\x7e]/g,function(a){
							var b = a.substr(0,1).charCodeAt(0)
								,e = a.substr(2).charCodeAt(0)
								,str = String.fromCharCode(b);				
							while(b++<e){
								str += String.fromCharCode(b);
							}
							return str;
						})
						.replace(/\x23/g, "###")
						.replace(/([\x26-\x7e]{2})\x21([\x26-\x7e\x23]+)(?:\x20|$)/g, function (all, hd, dt) {
							return dt.replace(/./g, function (a) {
								if (a != "#") {
									return hd + a;
								} else {
									return a;
								}
							});
						})
						.match(/.../g);
				};

		function gbkArray(gbkArr) {
			var data = [];
			for (var i = 0x81, k = 0; i <= 0xfe; i++) {
				if (data.length > 0) {
					data.length += 0x40 + 1;
				}
				for (var j = 0x40; j <= 0xfe; j++) {
					if (
						(j == 0x7f) ||
						((0xa1 <= i && i <= 0xa7) && j <= 0xa0) ||
						((0xaa <= i && i <= 0xaf) && j >= 0xa1) ||
						(0xf8 <= i && j >= 0xa1)
					) {
						data.push(undefined);
						continue;
					}
					var hex = gbkArr[k++];
					var key = Fn_Hex_decode(hex);
					data.push(key ? key : undefined);
				}
			}
			return data;
		}
		var GBK$1 = function () {
			// 生成按GBk编码顺数排列的编码映射数组  构建时会替换 zipData 的占位符
			var gbk_us = gbkArray(Fn_unzip("(T!HJ%LUX]e%gilotuwy{} (U!)-%/137>BDGHO%RTUW%\\_a%jl%rtw} (V!*+-0%27>C%EHJ%MP%R\\`cdfn%ptvz{} (W!()*,/3%579;=%CFGM%QWX\\^cdg%ilnprtvy%} (X!&')%.468CDHJLMOPSTWY%\\_b%dg%ilnprtuwxz%|~ (Y!'(*+-469%=?%GI%KO%RT%V[%_bdikmnptuy{}~ (Z!&')+%-/%;>@ACE%GKMNPR%TW[_%ikmo%rt%vy%{} ([!'(%+-%024%;=%BD%LO%QSTX%[]^`%ce%y{} (\\!()+%/1%7:%LN%SU%WY%cf%im%prt%xz%~ (]!&'%*-%/1%68%EG%cgloqs%uwx|%~ (^!')%-/02356;>FJKOPRSVWZ%]_`dfi%kmor%vyz (_!'+%-124%68;=@ACE%MOQRUVX%]_adegjqwx|~ (`!&)*-%/689;%=?%ADFIKLNOVX^%cehilmoq%uwyz|%~ (a!'),%/124%=?AD%HJ%PRSU%[]e%ho%qu%~ (b!()*,%.024%79;%=?A%FH%KM%WY%`c%ei%loq%tvy%| (c!'*+-.1346%8:%<>%GKLOQSUZ%\\_cghjltwy{| (d!(,/1%4679=>@D%JLMOQRTVWZ]`%ce%km%pr%tvy%} (e!+,-/0279%;>?DQW[%]_bdhqu%wy (f!&().47:;>ACEFHIKMP%SU^a%egikm%tx}~ (g!)*,.02%58<>BCGI%MPY[]`%bdeginpuv (h!(*-2%6=>A%CF%KMPRT%WZ\\%`deg%ln%qswxz{} (i!&+-%/1%469;>@AD%HJ%MP%TV%Y[\\abdh%mrsvx~ (j!&,%.0235%7:;>@%FH%PRTVXZ\\_%cf%hjkn%puw%{~ (k!').04578;=?%CFI%NQRTW%^`acdg%ilmo%ru%wz|~ (l!&(*%,.%9=%ACDHIK%OQS%U[%^`%ce%hk%ru%{~ (m!&')%79%CE%KM%PR%^`%hjkmnqxz%~ (n!&(*+./2%478<%>ACG%WYZ\\%^`%cgmnp%txy{} (o!&'%)+,.5%9;<EFHJOQS%UWX[%]`%dj%mp%tw%} (p!&'%)/2469%;=?%AC%KN%TVWZ[]`aefhk%mo%vxz%} (q!&'(,-/024%69%;=?%AC%EG%IK%NPSTV%Z\\%`b%eg%tv%| (r!&'(*+-%/1%57%<>%BE%UWZ\\^%`b%il%ps%ux%~ (s!&)%:<%?A%CE%OQ%SU%bd%ilnpqstvwy%~ (t!&')+,.%246%9=>ACDF%ILNRVXY[\\ac%fiklprsvxy (u!&(%,.013%?BDG%IK%MRVXY[%^abeg%jl%ostyz}~ (v!'(%,.013%9;%=@%CIJMOR%VXZ[]%_a%lnp%rtv~ (w!&(%+-/%24%689<=?A%CE%KNPR%VX%Z\\%`bcf%oq%tv%|~ (x!&'(*+-%5:;=%@B%SU%[^%km%svxy{%~ (y!&(),%1346%:<>@B%DF%HKMNPQSU%Y[%qs%~ (z!()%ACEFH%OQ%_bfnpqwx{}~ ({!&)+-%023569=ADEG%IKMV^%`c%fhinq%swxz (|!&'%)+%-/2%:>@ADEG%KMO%U[\\^`acefi%lnpquwy|%~ (}!&(+-%02%578:%<HIKLQRW%Y[%]_%bdgil%ruw%} (~!'(%*,/%35%7:;>?AI%MP%TVZ%\\^`be%hjlnoq%vx%} )&!&'%+-%356:<>?ABD%MO%TWX[%`b%fhj%mopr%vx{}~ )'!&)%-/%69%@BCG%QSTVX%bdghj%mo%{}~ )(!&'%9;%=?%WY%eg%mo%{} ))!'(+,2458=>@%DGHLOQ%SUVZ[_f%mp%twxz%~ )*!()-%025%:<%BE%IKLNOR%`dfhmp%rtwx{%} )+!(.137%:>%BD%HJP%SU%^a%fjkm%pr%} ),!&(%02568%:B%DFI%KMOQSVWY%[^%aehikmo%uxz%|~ )-!&'%358=%@B%DGIKLORSVX%Z\\^a%cgjq%suwxz~ ).!&(%+-%2467:%?AC%FI%MRSUVY^%`e%gijmnpqstwz{}~ )/!&()+,.9%;=>BCEIJLPQT%V^%`b%fh%loprv%|~ )0!'(*,-/%1457%:>?GJKMNPWY%[^%acdg%jlnp%ruwz{}~ )1!')*.035%79:=%DG%IL%PR%TVWY[^a%ejqruwx{%~ )2!&)%,.1%37%;=%@B%EHILO%QS%eg%nprtvwy%{}~ )3!&'%*,%/1%47%=?%BDF%XZ[]%ac%jl%txy{%~ )4!&'%+-%24%68%<>A%EHJ%Z\\%ik%su%z|~ )5!/058%:<?B%EGIK%NQRT%X^`%bfklq%suvx%~ )6!'(+4578:;=>@D%FH%KN%SW\\_%afijlmp%su%wy%{} )7!(*+-59;?GHJKNTUZ\\_b%ejm%pt%wyz|%~ )8!&(%*-78:=%?ABD%ILMO%RUXY[b%eg%nqu%wy{%} )9!'(*%-014%79;%>CEIK%MOQ%WY\\^cgijmnqsuw%{} ):!&')%+02%46%<>AC%GJKM%PRTVX%[]bce%ilmpqt%y|~ );!()%+-%/14%9;%?ABDFHIOQ%WY[%]_%ce%lnp%rt%} )<!()%.035%=@ADEG%JL%PR%UWX\\^%acfhj%lnpqs%y|~ )=!'(%*-%13%579;%SU%\\^%eg%km%xz%~ )>!'(+%.2578;%?ABEFHIKM%ORSUWZ%\\_`b%eh%jlnpqs%~ )?!&'(*%,/%146%8:<?@BDEHJLNPS%Z\\]`%bdi%lorsu%wz%~ )@!&'(*,-34;%>ABD%HJMNP%RTVY%[_%ac%egj%mor%uwy{| )A!'(%+-/024%:=>@AHIK%NPRSUWY%]a%cehik%mo%qsuvx%{}~ )B!&')%,/%35%=@%DF%JL%OQ%TV%oqu%|~ )C!&(%-/34689;?%EJLMO%QTV%XZ\\^%ceglnpqt%wyz|} )D!&)*,/0279:<%@BG%IKLPQSVY[]%`beghjkmoq%tv%y{~ )E!'+%-0258:=>@E%LNQ%Za%cgkmopr%tvwyz~ )F!()%/14%79@CEGHK%OQ%SU%[^%dg%imnrz~ )G!'),0%9DF%MOR%Z\\^a%hj%ln%pr%{}~ )H!&*%-/2357%@BD%IKMO%RTUWXZ\\%`bce%nps%uw%y|~ )I!&'(*%,.%2479;%FI%KM%TVWY%[]%`b%dfhik%{}~ )J!'(*+.01346%9;<>?A%EIJL%NPRTY%[]%befhil%uxy{}~ )K!&()+,.%02%68%?ACEG%IK%PR%TW%bd%gi%rtv%~ )L!&(%36%;=?%DFH%KMO%QS%Y\\%`bce%ln%twy%} )M!&'(*%46%<>?A%CE%GI%QSV%Z\\%ce%lnq%~ )N!&'%~ )O!&'%178:%CE%HJM%OQ%TVWZ\\]_%jl%sz{}~ )P!&'%136%9>AEG%JMNP%RU%Y[%bd%koq%wy|} )Q!&'%*,.018:<%@B%IL%NP%RTV%XZ%\\^%dh%lnrw|%~ )R!'*,2%48:=>@%CEFJ%LOR%VX%Z]_%aijl%nr%vxz|~ )S!&(%*-.2589;<?@C%FHJ%LNPVZ]^b%ehn%qt%vy{%} )T!&'-%/1249;<>ABGINTUWXZ[]%_bd%fh%kmqrt%y{}~ )U!()+,02%46;<>@EHLQ%TWY[]^`acdg%il%oqru%wy%} )V!&')*-.02359%=?EHOPSTVWYZ\\%ad%fk%mp%su%xz}~ )W!&),-/1%479:<>%@BDG%NP%SUY\\]_bcefhilp%rtvxz{} )X!&'(*,%36%=@%CFHJKM%OQ%[]^`%nq%suxy{%~ )Y!&)%/1%35689;<>@AC%FHKMPQTV%X[%^`%bd%fhjnpqs%u{ )Z!&)%24%79%@B%DFGI%MO%QU%^`%bd%gkmoqstv%|~ )[!&'%+.%024%=?%ACE%GI%KM%RU%WY[%]_ac%ik%mpqu%~ )\\!&'(*%-/%35%?ABDEG%LNP%UW%]`%jlo%z}~ )]!&'%DF%MP%VX%hj%ln%~ )^!&()+%8:%EIL%ORT%VX\\%_a%cf%hj%lnrsuvy%~ )_!&'%,246%8<@AF%IKM%Y\\^%`b%eglpr%xz|%~ )`!'(%14%8:;=@D%NP%W[%^`%mo%rtvx%~ )a!&'%+-/%359%=?%AD%GIKLN%SU%Y[%^`%ce%gj%nq%wy%{}~ )b!&'%)+-%/1%9;%DF%JM%VX%[]_%df%oq%|~ )c!&'%:<%EGIK%MP%RXZ\\^%dg%il%oq%suvxz|~ )d!()*-/%25689;%=@%BGHJ%NQSUVX%ce%psv%xz )e!&'%,1%35%8;=?%BDFG 'W!,-. &(+&.'&-~&'u'W!/1 ')>.<V')!@PBCFG 'W!@A4%;BC<= &'~&(!Kk '/!J;< '.!~| '/!>= '.u'/!K. '0`'/!94 '1t'0T'/!?Bu`\\Q1t '0!)* '/!xy2IH ';!*( &'}')!\\] '+{.;U&'q.>!&' ')Z&'t',5':!GF '9!eiha`;:ML ')e'-!XVWY 'W?'-!67%?#3$ '6!-.%@ '5!rs%~ '6!&'%, '5!^_%g## ']!67%?## '-!&'%1## .;!RST .>+.;!VW%~ .<!&'%U .>)'W!mn%~ 'X!&'%f#8$t%~ 'Y!&'%p#5$ &0!=>%MO%U#5$]%mo%u#4$ .9!89<=BC@AD%G##>?:;4#67#6$ &1!cd%hTi%~ &2!&'%)#12$*%/K0%I#10$ &.!()7 ')!=?O_ '+}',('-!\\]%_ '/!)37fz{ '0z'8!CD%ft%~ '9!&'%)-%/VW|%~ ':!&J '0P'W!>IJ#8$ &(!uU &+7&(T&).&(]&)6&(\\&)F&(a&+9&(`&)h&(g&+;&(f&*-&(n&+=&(m&+!?ACE &(!p^ &,a-Qc&)!_c -Qd&,q#1$'Z!&'%J#18$ 'W!MN%U '^`'a!@AN%PSv 'b!'*+. .93.>!(*# ',@']G#'):#0$'Yv'X!no 'Y!wx 'W2'X!pq .9!LM%UW%Z\\%ik%n -R!*+%6 'W3#10$'7!LM%~ '8!&'%>#12$ )e!HIKN%SVWabei%lnp%uw%y{%~ )f!'+%-23679%;@BCEFHIM%PS%_abdf%ik%rt%~ )g!(*%79%=?@BDFGIJL%OQ%TV%XZ[]%bdfgkn%prsv%y{}~ )h!&'(,-/3%9;%>@B%EGIK%MO%RT%cehil%or%z}~ )i!&'%)+,/13579:?%CE%HJ%\\^`eh%tvwy%} )j!'(%,.13%57%9;<>@%JLN%UY%hj%~ )k!&')%1357;=%CF%IKN%TV%Y[%bdfhj%mqstv%z|} )l!'+1369:<>%ACDFGJM%PR%UZ%ad%fh%npr%tw%{}~ )m!&()+%.0%2479<?@BFJ%NQZ[^_c%ejopr%uw{}~ )n!'(*%,047%:=>@%CEFHIMOQ%TVX%Z\\%_aeg%ilnrswyz|} )o!()+%-/346%=@%EGI%MOQ%TV%\\^%`b%iklnq%suw{|~ )p!&()+-.013%<>%FHILN%WYZ\\ (iC*r5(pM)89(gy(h[(gk)p*)o>*A;)s|*9E)ui)cO*s5*ux)R/({@(Z*)7s)B.(~d*4~)F{*42)@K)pg(_l)>Q)a|*2'*Jb(\\0(u2)4?)\\@*9t)8])5n(eJ(f+)|s(^7)mH))<)7>*Yr*ua)6M*2O(o@*t|*0J)cV)oo)E[)op);L(XR*W~)7F)z6)?3)hN);2)66*8L*xa)Dd)cf)61)76(Wo)k9(cY(a_*.d*b,))v)G`)Jk*6R*.k)HS)vH*E'*oR([d*U/*:L*4b(bm*L>(a&)p!]`bdelnrsu%wy%} )q!&'%-035%7:;=?@BCEFJLN%X[%^ac%egj%lnp%ty{}~ )r!&)+%-/%69%@C *B**t=(Yf(qR*{F({T)6!th )BK*V+++A)b})DT)um)12(c!`& *^r*4P*Wv*mT(Z=)e4(t-)1k)`B*K0(tz*:])Cj)}<)&|*/8)l*)TJ*[[*`!0t +3')Q4*cF)}()-`)v**@.*A<)Q!596 ))I)*v)nD*q<)>X),G).P*_0(s@*7;*a^*rQ*v?*_J*/W*X,)5](YH(e5(cm*_!9:< *a,)F:)-N*6j*JF+,1)3Y(`E)nu)-P)?.)\\_)Z'({u);N(^!A| )EP(T_)yA*{Q)_5)r!DE%GKNPQT%_a%ch%jm%rvwz%~ )s!&'%,/12469;%=?@BD%HJLN%Z\\%df%hk%or )mi)*e)gu*=C)<Z)7R*mh)T7(ci(b+):n*mu)~O(Wj))c*8V*5A*6\\)Wn)Sx*~=)8f(ck(hL*JC(pj(TS))K)Ow*'H*bn)/H)=:)f/*KF)D5)5i*W{)rS*Zw*eB)-M*=?*@y*z>(dx*E0)PD)1!mh )^Z*:;*8Q(Vg)SU*Bu)<z*)0)Ks)C7*;^(dK)}j(Y0(^X)UG(}G*[b):1(e&*;!AK )Eq)v7);C(|=(~@))6*TK)70)F'*V,):_)9r*G2*{`*T{*/a*nL(V;*q_*y+)@U)f))s!tvx}~ )t!&')*,.%18%=?@C%EHJNPSU%WY]_`cdf%hjkrtv%y{}~ )u!&')+-/04%8:%EK%RT%WY%_ (nv(|{)*'*p'([V*3}(d8)>Y)lB(i*(ZQ*Y,)6G*mQ)C[(ky)[T))*(f9)^m*^P)62)<Q)9[)-_)[n*bz*7\\*_A(|v)AX).|)S7*r>*Y(*JJ)<>)yh(pX)Lv)5,(fL(UE)z*)1i)[j*T>)6B*`V*~U)y\\(e`)n?)7k(c()Rg*_p),X*~:*2q+3k(Xj(}?*Xd*1T)?G)_?(]j(^~*D_)&Z({W)7'*d@)lq*ZZ)z?)2()~4(V[*/9)rl(TW*7f(`7(_m)M5(d^*[|*n^*sl)YY*rZ)J))u!`abdfgklnp%ruyz|~ )v!')+%28%;=%@BCE%GI%KO%RT%VY%[]%jl%np%tvxy{|~ )w!&'%*,%.0%6 )tu(\\&)se):o*N`(t*):B)(~){E)Ie(W[*8Y(j8(Tx)mR){])*!Qy *q>(`5(f=)^e)9.*n~(oe)@n)Ig*d[(hY)W=*.I*IY)5O*/1)mY*;=)vD*si*_/)2o)kM*T1)Ov(`T*XP)O3*3G*>{(n-(bn(Vb(Ta(_D*(G*d_*&i(YL*[t*&C){b);m)&g(\\**51)nL*(i)W6*1o)D6(zh(|V)vN)<[):r)9b)8<*ns);3*_O)}h)nt)5o(tM(fJ)P2([z)5P))n)P?(Vw*X7*Ji)-i*`f)w!78%<>%GI%MO%]_%cgil%oqt%|~ )x!&)*2457:%=?A%GJL%PSTW%Z\\%_a%c )/R*2s)7/(U&(cd*b~)9p*4J)@/)R5(X()1n)W+*TB),v*Ef)-7)82(^&*;v)G=(_s)8t*[=(ZB(~G)xH(|Z(`J)zZ)1<*a2)pp).B)-{)ov*[a)^J)om)}])s8(_f*ar(qU(X0)Z3*_{)>G)}/)e0)VG*1n(yJ)6x)++(nl*?3)}@))e),\\*`J*/U*y')9:)Y_)ut)_;(^D*uF(p5)l2(W~)l5)+-)1f(u-)Vc)Px)ue(eY*sr(_!>t )9A(eg*mF*Tg*Ys)cW)u{*G_*_~*Tq(e=)x!de%jl%wy%~ )y!&'%*,%047:<=?@BDF%HKLNOQ%VX%Z]`bdfi%oqrtvwy|} )z!&'%)+.%24578:; (TG)q/(eK*m<*xV+2S*o.({Q*S_(T!hb (^x*>m)47(ai)F>(Xy)0D(_.)Ts(^()6Y)?9*rW*UQ*`O)m|*c*)rJ)Q2)dO)eX*T_(qf)r`*XL)DA*oA*3w)+<)Wk(u_)|\\)s{*o<)Pn)?O*/O(q7(]v*qn(|W(s((f,*[g)>a*x_(my*mP)q>*`y)9?(gq(t!@` (o~*\\N)Cs*ZH*8U(`[)1p(qF*F@)&;+0<(YM*x}*Sv(w@)0O(d:)6?*a.*c/*{T)0B*2B(]d*2i(|r*{J)U-(Uy)z!<>@AC%QS%UWY]_%df%oq%uw%~ ){!&'%57%9;A%DHKMO%RT%VYZ_%adgh *X0(e.*0B)}c(WK(U<*qO)T*)h1*C6))N)lg*21)L')t3*mE*-4(_T)_h(e**_e*:q*X))dt*{B)T0(o-*9z)?[*4.)5[*r((uu(W:*S|*.T)>9*=U*uI(iZ*ye*4)(c9*Ta(e}*4>)+5)Sf*X9*9s*d.(f-)Q{(_y*.Q(oB)`C)S,*(9(tq(W8)/1)2K*(Z(Tv(|_)E7*FD)&C*ne*yU)mS)`&*`Z(^{*/^*Sz(to(_W(X=(f*(tQ)>r*4(({,)69)7,*^z)*4)R&)}:(WJ(Ya)CK){!ijmo%qt%xz%~ )|!&'%+-%79%BDEG%JNOQT%Y[]%ehikm%ortvy%{} )}!&'*%,.0135%7;=A )Uj)VM)x`*K6),T)l()6]*^o(Yx*eW)?I*5!Z| )+2*5{*Xt(a0*MY*XK(t3([\\(Vl*qk)cT*6K*Wx(|**S`*r:(uT*/[(g;(ld(kU*TI)>4)JQ*mL)po)Xz)*a)kn)D+)E])|l*3z*Xv)2F)y>)>]*Xc(^T(`4*mU*/y*3x*.L(~C)Wy)DE*&;)o}+&I*6a*0|*),):}*oQ)z^(fN(h7)O^):`)4}+04*4w)m=(a3*uT*>e)Fo*F&*qP*s1*nF(Tp(ea*.s)Fl*Z-*2K)C2)+0*1H)}!CDFH%KMOQS%XZ\\^abgikmprsuw%~ )~!&'(*+./13578:<%?A%GIJL%NQS%VY%[^%`i%kmnp%rt%{}~ *&&(pL*2u)Gq))-)>6(a`)0F+4-(X}*\\H(^8({b),P))1)Re)7[*Wz(^=*m\\(bf)SM*:M)eC(p,)Di*X-(tE*_-*=*(g@)~H(Wk)Sk(zt(vE+2X(eA*Ee*~r*UB*3~)>@*x^(n6*sd(`H)k2(`j(|?)7l*L.(UC)7:)/\\)H{(^?({O(^l*N<)~\\*{[*08)1o)^'*X/(]n)*n*`S)ix*N>(ni)tz)-6+42*qI*^R+'T*TE)oj)Fu)Eh*Z8*X5(`W*^t)Yr)HN*n_*bs(n9)E(*K~*_X(gs*&!'*%-/%246%:=>@%BD%FI%KM%OQRT%XZ%]_a%hj%lopr%wy%~ *'!&')%.124%@B%GK +&)(zy)Us)R-(V9({j*~Q*d7)3v*b5*v{(f/)VX(|0(_p(j**0=*2&)<i)8^)@:)43)0f)`3)R!^P (tU)DR*8J(sT(l|*Uu)QK*bc(uJ*2M(eT)Ue(fy(j=*<3*=2)Fk)y6(g7(X7(ee)pk*V;*qQ)Sa)V[*Xk*L<+0[*X:(l-+1o)my)-l)eL)0A(hN(V<)LG*J?)0+*^Z(go)_Z*Dm+06)U&({F),U*.<(j)(Y8)fG(f@(dP(ZI(ek(g'(U;)//)ib(su*>u*4e*G])e<*(z)XG*'!LM%UW%{~ *(!&'%*.%8:%@CDFI%KPQSV%Y[%]_`d%hjk ),d*DB(h~)6g(V&)SX)5S*9x(h)(c])fQ)Yi)l8(`,(b~*TA)KF)-n)/2)W8(o2)O4)gi)G-*_i*/T)8s)0|(hv)n5*Um)`>)VF({])*j*;g)2s+1b)v}*G@*'0)oy(_c)1v)`u)A3)*;)0&*Tr)^K)86*^s).H)0;*Eo(ms)Pz)0m)35(cX)1`)AV*X?)yu(WU)_k)RN*Sp*TV*.r*;y)@X(wu+'Z)UM)WA*UL)U7(WT)^F*<s)52)1Q*tQ*X')xI(_n(nz(q+)Cx)lu)z\\)yg)~P*(!opr%tvy{~ *)!&'%+/12458%>@%EG%NPQS%`b%vxz%} **!&'(*%,.%4 *3i*{:*`1)\\M*Sb+/q(v`*/!*J (ef)Df)HY*^{*'V*sc(e')/W)mb)Ry(d)(y2*.A)85(_S*55))9*@7)6C(^L(zs(WI)x>(`\\)18)UJ({!{y *S!^m )@+).W*r;(u`*/(*.D(kP)EC(t_(XU({m(aa*;o*xj*X>)l/*mq(Zw)z[(W2)EB*~H(y*)P5)pj(o=(|t)}N*qC)`w(^H*4-*97(uE*/E*;<)HA)Ex)v4)uS)7M)8r)~;(Yv(a+(_B*;e)KQ*g=*ZC*X1*N;*o/)~h(W1**!56%km%tv%~ *+!&'%= ([<*8P(`k*{D)WZ)Xv)VJ),7(\\s(vP(|d)UB)Rf)m**?<)GB(t|*So(c/*dE*rC*AH)I:)w+)`O*4z(V8*bP)UC*~N(v{(mQ):d*nJ)sy(Y.*5E)eM*NL*{O*/u*.x(a@)>T*dI*^!im (eH){\\):L)9])ox)yp*J5*r,)5F(al*9I)G.)DU)9/)rR)|Z)TV*.m*N](vD)5.*Bo*9l)lI(ZO(V_)mI*TO(}O))F)}_)?F*eL(V^)Tz*M2*)~*o'(VY*U3*_l*u^)A;)xR*_b)_n)Ut*+!>?%JL%RT%~ *,!&'%F (}B(as*;[(^.*:|)rB)Af++l(V@)1J*(!nc *.i(V)*R|)A_*xh*uD(r[)>g*o])-h)mm*uA)|!LK (_3)_1){^):I){<*.:)gP*w&(U2)^S(UJ*d&(d_)>L)@0*7!u~ (g9(}6)m>*v2)7B)eE)ma(}J*~C*=-(}E(g+)sw(U+)S\\*37)7<)9&))0(^C*Z!+l *o0(Yz(eB)1g)_.(a()8a+0:(w:(ZV)qw(d-*.|)<2)>&)6L)9P(ZD)cS*NC(_&*S}*.w(o**=/*mZ(^g(ex)&N*,!GH%~ *-!&'%-/%35%9;%P (YS)|P)UV*bg*~Y(iy(gA(cp(gZ),=):H)JF(_b)36(_}(q[(b@(o1)tB)qK)+M)3E*)7)5w)6Z(V6)^p*29)7a)_f*uK(oZ*:I)E{)Hv)vX*xw)yI(sr(g^(eL)W~(]p(`U({Y*Tb*43(i<(p0)0L(o4(f1){@)0)(zd)9_)6c(e@)6&({~)E;(h?){e*:T*dK)+)*Ki(t^(p8)7x*Z6*4s(o:)~2(Y2).v({t)OP(c0)}d)e.)Fy)t4)qv)@@(_((U|)pm(~k){k*?&(tt+'Y([W*-!QR%tv%~ *.!&'%46%8HNUVp~ */!-:KQ_xz|%~ *0!&'%)+.%7:; *{])2N)Xt(oG)@O)8W(n,)7V)6,)+i*qc(of)73(j'*Fc*5u*_4(i_*<m)DJ*XV*@5(x,)FB)7P*&P*q`(^<)\\)*U;):\\*NB)4G*/G)_D)Y})hf)Jc)eh)+`*bT)CU)Uf)8o(at)d'*27(XN(vY*d>)_[)V@(b:(U=*t;*on*A})vM**-(]F(ou)<o*3h*(+)T?)Hr)J-(_*(dN)H))dF+1l*&S)ed)y3)ZR)hg)D3*eG++X)wf*<E*;i(el)FJ(U*(d?(ar)ts(d<(`C([_(Xm(YY*0!>AC%FHK%OS%UWX[]%`b%eghj%qsuw%{}~ *1!&'(*+/12457%=@B%FIJMOQ%SU%XZ\\^%befh%mqr )n-)|8*(B)SS*sS(a\\)j2(h;(Yr*31*<n*_o*oq)+_)/N)VB))`)>V*5c*nX)/})_>*.]*(^(_<)G[*(a*96(Tj*^p*eJ)An(VB*Ti)<V*3'(\\X)m;)bE(|C*_N)[L(Us)</*od)+l)?;(`1*KG)_J(ad)ez)i;)D|)vz*tZ(Tz*bA+,9)Vn(_N*XA(ez)78)gl*=T*t:+3p*mv(Wq*1)(_?)^P*rk(~Y*xf(eC(Vx)Y4)hj)K*)uG*{d)lV(`2)no)U=)F&(^9+4,*3((gD)}P)|,*1!svwy%|~ *2!(*%03%58=%@DEGIPQS%UWYZa%fhjoprtvwz{}~ *3!&+%.02%468%EH%MO%Z *r|(og)7L*r=)JK(vx):a*&5)ZN*rA*9m(cq*xe)+&)^d)9k(cs*DC++5+11)uh*tv*Z=*XB+0v)[D)xU)-9*r<)5J*~>(er*n7(Y,)?g(}!jf */V*DE)R6)-o)gA)Y|*/@)&9)8,(zz)Y~(d+(U^)9X)lb)6d*^X(Wa(Ve)ST*.P*Sw*>'*HJ*0?*`s*n})~d*~k*K}*>G)Tp*~P*.v(uU+1Y)gU)t6*Dv*~!6L (kb(et(pU(U]+1D(ce*_Y*54)ry*{g*F0)Yy*@k)C:)30)Zj*3![^_begj%oqrtv{ *4!'*%,0479:<=?IK%OS%Y\\cdfgjry{} *5!&)%,.%02367@BDF%HJ%VXY[^%`bd%hj *U4*9Y*;@)q2)Qs).d*<y)f>*:s*nt)Q;)si*my(c~*:p(^^)*,*V>*X8(U5)ge)E&)G_*dJ*tM)a4)SO)qI(xT*oB)Q/*0v)@p(|.(v-(x\\*q!7F (W'*=o*?J)Mp)px*o1)f.)H'(zo)qo*dn*uL*)3*`/*U'),b*'|)yP*N?)Sz*F^({})*1)HJ)q`*/6(^a(]r(b1(wD*/F*uM*:E):.)rk*Bv)yJ)X+)+/(uf*@i)^H)Qq)7))pX)>J)1/*qL)@W*H/+/s*nG(ej(g(*U7);~*5!kl%prtx%z} *6!()*-%13%68:<%>ADEG%JSU%Y[]%`bd%iklp%tvwy{}~ *7!&'%+-%25%8=>@%BDF%L )<&*C^)L>*6n)vk);o+'l)6|)Ci*<g(s'+1v)SY)Z_(|<*rB*To)c})E\\)71)d&(V=(v:)Q-(rk)BE)*D(bG)2|)Cf)q.)rM)d,)ze)7i(h<(fT*mS*b)(w7*.M)Qv(U0(uC*2F(tn(cf)l4*s[(m_)81*5<)0U*qH)Vy(ff*{V(^Q(yR*5((u{*tW(ZZ)T:(}A)7I(XB(cN*6M*`>)YR*A*)72)*c)vA)<b)93)/'(w3*dS+/o(}D)8`*2x({4(ig*o!KN )V()1()El)eJ(_P({8*7!MN%[]%_abdg%kn%svx| *8!'(%+./135%:=@D%GINRZ\\]_%cefhjl%np%wy{%~ *9!'(%.0 )7Q)T3)cy)60*ma*.W*5>)UO(^h),A(uA(ak)/D(u@)B-*DD)mC)8;)4[*)F*T^(h8)O9+/u)Pm*B{(fY([M)SR(ic*Y[)cJ))])/G)i>)77)9J)cj)-|)X4)U:)=T)[>)pq)vS)q<)lQ(`>(e8(U@)+4)?c*2`*4Z)6^(g1(`B)_0*Jk*Yx)T6(f|*4^(q**Ky*XT*r`*cz(XK)SI(jW)p_)te)6k)_{)[t)-Q*@D)H[)uX*&Y*6z)CI+0F)8x)v3(oR)tG*t})6!<n (aI)i=)Q7*9!12%48<%?BCGHJL%NPSWZ%]abegijny|} *:!()*-.01347>DGHKPU%XZ%\\^`acdfhj%nxy{~ *;!'(+-.2%;>?CEGLPR (i]*5i)mV)pG(cH)n)(\\y(}F*S)*&)([&)ce*~a*y_)ZA)k8)x9)<4)s3)7f*xq*X+(gl*35(U?(oM*:g*=p)*b(_`)kL*T((}T(oD)TQ*xg(wa)ti+'\\*_|*(E(`p)5m*nT(VZ*<B*>k*=L*?c(p^)Cr(n?)A^)Ub*U<)Bt)]E)C])OL)FI)56(v/(TI(_7)ZE)E^)S=(^B)HL(tm)Oy)lc)&a*5;+3<)?y)w!rk *~[*Xw(~.(UK(W<(f3(tw)tA(lV)Qt*_U),@)S+)T8*Sh)9H*;!STVWYZ]_%chj%nrw *<!,-%256:%@CDF%IK%MP%SUVY[]%ch%kqwz{~ *=!&')+,.013%68:<%>AE%GI%KN%P )0I)U9)d:)6)*m!Ax (cR*_R)~9(Vs*U1(Uk+1r*m!df (`g)[B*aB)UA*U?(qB)'F)O!2[ )E6(f_*6&*0t(rq*A6),w)6e)Ld*o:)>m)0])G?)s5(UA(Y1))/*v*)<Y*1g)&@(YX){S(_z*:r(TZ)/a){I*mY(Y>(VF)y^)i<(bL*:')=&)y5(|;)S/*u=*^e)R)(Zn(d5)WO)<{)Ad)R7)1E*xW*T[)*u)iD){=)yC(T^*b7)hd)RI(mo*cx)Ss*Y2(cI*Ea)C0*\\K(}M*~;)Wj*=!QRV%Z]%_a%cehj%msu%z|%~ *>!()%-3%:<%AC%EH%OQ%Z\\%`bg%jln%rtx%z|~ *?!(*,- (e3(wQ+3w*YJ(dq(nD*y.)D(*do)Sw(^4)mn)7])dq(`R(a^*/{)^o)o*(d*+0A)K-)uJ*s]*K^*13)`_)b:(^U)E_)k:(sc)=l(mL*Sf*{K)63*.o)1y)_o(sk(V!UN ).X*vy(W6*Sa(_v(uW*.E)5p(Va)@.)5**;M*?z*;x*Gv)ad)YN({p*.l(^c):()E`*3f*;N*IL(]7({1(uO*_B(U`)Rd(^1*LQ*^Y*q}*AI)if*nj*q?)VI*:S),n)<?)Tg*>2*6@++w(r6*X[(TO(dw*?!./%24%7;>@%GIKLN%QS%_abdf%hlmoqstv%y|} *@!&'*,-/%469:<?%CE%GI%SUVX%Z (WY)>^)G+(js(Tm):s*~d)6.(y+)ig*99)VL)Ho(\\e*<J)t7)C~(`S)SG*.K(\\9(i^)a.)}o)AB)h+*:Y)D.(}v(`:)aM*JI*q9*rK)<r*Xa*7,(i})R\\)5c*/o(rj(W_(i?*XO)A<(TP(|x*Kx)G|)8_)z,)_i*9T(bb*w/(|o(h:*b;*.g(u/*XJ*Eb*8!,- *Xf);J(|b)2x)V,)wh*S{)tl)l0(g&(Ws*\\G)W;(w;*._)x/)S6({X(x8)kp*4B)2u)Wa(so)k!u{ )d7(cV*/4*@![\\%ce%hjl%npqs%vxz%~ *A!&'%),%5=%AC%FJ%TVWY%\\^%bd%fh%prt%w{|~ *B!&' )qA)pt(a**4`(n_))P(tW)eZ)?_)Xp*T;(}=*De(cP)t()7h)@?(VT*yf*Dt({U*T*(eO)sp(Xa(}S*~@(v?),L)wd(sj(T\\)F2(Ux)7W*P[*`U(b')@x(j|(lZ*`:(Vi(Xo*eE*{E)Qo))J)/u({[*N@*T9)>1)5g*{k({?(|])9@(i'(e4)nq(^I*A+)E.)H4)PC)6U*^}(e1*82)Vt)m3(US*XN({')ao*BU)B!(p *0Z*FB+1k+2e(}c)Cm*`()FD)DD)5))|C(r])+L)>k)Zp*B!(),.%46%@C%IK%MOQ%SW%\\^`%fh%np%twxz|%~ *C!&'(*%02%57%E )0.(`Q*2C);Z*JN)l&))M)FF)7^*t`(e))c[*Te)R;)rH)z-(f2)s:*xZ*8<*TX)u1)CR)_C)?Q)<B(k})/O)y9(eU(Tc)P4*3c(|X(k*(mp(W!uw *{G));)Dc*2n)/4*xb*`9({B*Sy*TY):{*8x)=2(kD*:=*d9(Y`*)w*`W*(O(\\q(r))YG({v*T-*3`*dL*?M)~R*Dq*s!(, */&+&D)uj(~-)zv*`z*sD)x0(zi)8p)|x*@))H.(hX*/j)hq*)y*n[)5\\(q}(Vj({:(uF(r,*C!FGI%KM%QS%]_%bd%suw%~ *D!&'%+-%/1%@FGI%MO%QS%UW%^ )g')8/*[@*Z]*4R*:B)6o(eM)TE*d2(tP)/3)Rw(o0);P*X*)nv)Z((o>)MD)n;)[S*U8*Tl(oI)QO*Jp)v6)9Z(eV)_/)Rk(r0);0(q3)Ha*6m(hb*)-(ZH*\\V)Vo*YF)_m)9G)V>)Yl*/'*=g)Fv*`;)V{*rl*Se(t})d>*C1*6P)m`*PR)H0(`n*Zp*nk):/*xx*[9(iu(X5)C=(l})1U)V8(`](}N(tO)WE(rC)l-)kr)0E*84*5q)7{)DF*_s)qz*ZA*X4*mt))^(d;(f0)_E*D!acdf%lw%} *E!)*%-/1%69%=@AFHIMNR%TV%Z\\%^`cghmnp%ruwx{%~ *F!'(%*,%.17%9<%?ACF%HMNP%SVX )RG),4([3(VA)+C)8K*8g*`R)G**dB)sA(ei*n6)-H)|R)GP)8V)}f*.y)n&([N)6X(tZ*`G(_k)y;){G(n:)-v*`L)U~(}e(n[(em(]y)X>(mw)9`*xs*6Q*FW*LV*`8(e{(}t*79)7@)5t*5\\+0,*r6*~!8F )IU(ur)7=(i7)8'(gr*Et)U8(vw)k<*Jz)O|(t<*UW),l)Xo)gc*x](T~)_y({C)us)8N)AJ)p/)1K({R(wd(TM*6')Rq)gE(V5)Dn*09)-d)@C)CY).c(uQ(vu*F![]_abfh%jl%oqrtuwxz%|~ *G!&)%/3468%;=%?AC%HJKO%VXZ%\\^`%ch%jmoprsuw%{}~ *H!&(%.0%4 )(n).9(d'*vx*_n)Fx(n0(i()1_(U')[3*/5*:5*=q(vH(W!Ze (}C*.F)Ch*@r(fw)lL*4G(i{+'g(X/)Ww*Tw(|g)3>(cz)nj)Ws*D~)?)*qJ*.S(f?)zR*)a*q=(k(*1P)kD)8.*FY)VD){c)5-)?C(cv):@)S1))3(f`*m[(U9)Rh*TP(}P)@)*9c)H((f!B8 )Q+)Ox(V()8S(cW*8>(WH(Y7(oA)5&*tB)AT)d.(bg(ab)0x*TS)@])ai)Du*MR)u.)t2)A`(l)(f<*n{)d?*H!5679:>@%BDF%IKLNOQ%UW%Y\\%`d%jl%oq%tv%y{%} *I!&'%/1%46%9;%@B%IKN%QS%WZ )yx)0H))T)0b*6o(t;)1\\)aT)_q)YB)RW)dE)MH*K2))u(UM(xu(j<*n=)Tl*)R*s6)5+*.`)ru*Dr(c2*tb*_')Aw)&4(Y))eY(TQ(d\\(t5(ep)98*o)(]m(Vm++P*.>(gc*W}*J2*8W*qA)V1),c(y5)A.*r_)gj)fA(du*6L*{Z*10({a*r!mF *.Y)q8(dX*ow*{n)~l*Lp)XI(UN*1c)x6*TJ)1s(gx(V?*xY))?)L~(\\M(en*Ul*>1)u9*tH(`d(h@(m8*nZ)V+({l)Vi)AC*I![\\%hj%oqrt%vx%z}~ *J!&'%),%13468%>DEHKMOQ%TV%Z^adeghjl%oq%su%y{%~ *K!&(*%/ (|m(zm)FT*3s(iq)|~)>C)I|(V/)OY*G7*uv(c^)80);@*b0)?>*4E*Tt(^e)H1(d.*I0)4=)Sr)TP*U-(}V*BP*9v*nf)O5*_,)?R)/-).N(Yj*I|)@h*67)f<)1z(^@(`+(on)-F*b(*J**df)*g)D4)/Y(vG(]i(_i*4|(bp)S'*sa)aZ(WL(Yw*1-)C{(je*nb)y8*Jt*.}(rw)5(*tD*DN(k_*x[)-t*Su*?u*d+(e6)@6)*~)lY)0=**l(xA*/!+. *^S(jG({Z)1,)?m)g>*K!13%57%;=%@B%EHILMO%RT%VX[\\_%cefkln%twz%| *L!&')+%-/%57%;=@%DH%LN%PR%UX%[]%_ac *`A)oU)qi*.t*u_*BA(zv){:*t.*Iw(b3)a_).5)@5*TF(|Y*~9))))PB)Rb*S!jl *`B*_V(dA)7&+/!v} (fD(Tq*:+)cw*E7)&i*J7)VR*sb(g|(V.*Ss)`2(gh*qX)_a)WC)pi(Tk)tI*FT(~U),3*Nz*x|*q])^i)Sm(tj)9a)q|*J+)ZS*9:(qa)bL(dB)tO*s^(hS)-J)`Y({k*T~*~V)P<(tT+0&)y_)DM)6/(XQ)mE*0r)T`*r))R.(W+)mv(^G)Fj)Z}*a_*6B(uc)i~*L!de%lnoq%~ *M!&'%03%8:%MO%QSUWXZ%t );M(},*aD){W*U.(vN(gW*7y*<+*MT*26)IX(l<*2l)cU*eI(_)(UL*xU)9N(T`(eS)C1*5v(tB)VU(TF(sx(cJ):5*nK(Y&(WE*JA*xp(t]*a6)ys(V~*4t)m5)S0({S(v\\)-A)I-*Du(ZJ)):(UF)sq(Vy*9A)6T)@\\*ap(}~(VS)-]*7?*`p*3a)mO(V:*KY)26)P~).Q(U6)pc)Y:*TG*Sk*T!n5 ),?*22*1[*.h*;J*<'(mu)Pp*w,*r*(vo(e|*nP)W5({|*{C(}>),R*s-*M!uv%~ *N!&'%:=GM%OQ%SUWY%\\^a%df%hj%ln%y{%~ *O!&')%> (d&*:_)LN(x6+0g)+**/i*<u*>!./ *;|*G0*__*Xb)pa)-U*xv)uH)@i(h1)7O(XE*7<)ml)+N*sj*ZX*F;(g:)TH)V/)R?)0X(b/)k~)*l(WS)0y).r(}))l.*b4*ms)d~)Sg)X)*cv)CG(e!(P (X3*eD*TU(d~)*k*_S)W.(U{)p[)JU*DR)2A*8&(X;(Yg*`v++0)20)W!g^ *r{(Uu(wL*t,(TT(~+)y1({>*TQ*1L)gC(pi*9R*bG(e^*a&(j[)&=).,)2/)OD)e]*46*PQ*O!?@%^`%hj%~ *P!&'%@B%H )Up(|1*KZ*xd*Uv*~7+0*)WT(^p(]h(p-*J_(dU):S*_&(n)(f\\(nB)fR)Y(*/Y*_m*:?)2f)/Z*rX)C.*.@*Y!1j *mX(~_*(T)CF)1&*qT*2N(U~*bm(bh*r^(]f*_a*As*d1)AE*w.(ze(c,)tm)D')Fp(gt)^Y({g*^g(^Y(nd(g\\)=f)Ar*X!^C *5:*>v*aL*)6(_r*CH)E/)@2)\\.*E?*[v(lX*`X)ot)^Q)b\\*W|)7S(`3)TR*X<)/@(rv)3\\)C<*X`)5j(jS)Wm)Ck*^Q*P!IJ%PS%Z\\%~ *Q!&'%R *n;*qG)qh)F8)Jw(g6(U:)_:*T,);^)?-({<){J(Zj(|F)sI)QA*PA*(H)Sl)ph)?K*_()''(}Z*D,)F;(co)54)|F)XL*/>)L<)|M)-T)Zr),])9D)VK)D;(TN))X*X&(Vk*4D)o&*s9)7E)@v)6A)Sj*Xu)a7*0Q(]k*3d(eI*aM)6[(hD*F2*_**2;*nq*@o*_j)UU)h.)?A)q_)kZ)t\\*7t*Ww*m;(Y/)Dz)m]*T.*tK)8@*oH*r+*?i)84)r()-e)e\\(Uv)/F)>o)7Y)Ou)>:*Q!ST%uw%~ *R!&'%;=%[ ))o)mk*bW*S~*9d)E))>*(f5*FZ)ss*4&*5-)RH(U8*.a*3))q4)I5)PO)6*(Zl(Xf(n|)7q)Ot*Ye(eG)@1*.R).b)8+)9o*7!lm *0V))d)&,(`P)Aj)ya)z9*X()^t)mx)Yv)Si){X(Ts)p^).k*mR*JU*.b)yE*4C*eH(W!-R *8?(fl))&)U.*T0*(U*^^*3u))b(g=)pJ({P)A,*~n)hA)F]*Ev)Co)f=*T!\\? *`H)|f)_])a>)7.)s7(kx(U(*>a)E}(aj*E[*X.*nR)}e*R!\\]%{}~ *S!&'(*%\\inx *T!+4Nm *U)(X1)T=)x.*~E)6V)cH)7g(TY)tK*^V)<]*XZ*&()GC)*s*KJ(uS)<K(sm)d{)I6*o&*`5*XX(oC*/A*Tj(_9)8Z)7C(cb)G&)i**:o*cy(i=)r')^W)UF(^E(gS*XD(vs)Yc)Vg(zl**)(Vh*(-)Yk(z`*7c)WW(zg+&t)HV*Zx({N*/=)/m*.O*b?*Xp(tu):,)yW*YZ(ca)?q)x'*T)*r1*.^*mn*-u(k{*d])C>*0R(|h*aT)@q)).(X2)Ej([1(X>(o3)+=#2$*U!CD%KM%PSUVX%_a%df%kn%tw%} *V!&'%)-%3568%:=?%EG%IK%_ (Uz(TR(]e(TV),<(cT(T[(V,(Td+'J(z|(lW(Tn)y2(U,(b}(U4(tS)cY(c})Qp(mt*4h*{l)Q3)re+2\\(T|(V3+2U(U!IV (V'*9O(zk(ie(kV(VX(d!CSY[d *uP*X](c)(eR(c!5=M *X\\(c!ur (_!u{ (`!(GMYZfx{v *?`(a!>CBQT (^N*0<(V!OW]V|u (W&(Vr(W!V.] (XF(W!0`bDf (X!@I )>3(X!<? *V!`a%~ *W!&'%f (X!A9 (W!mx (X!XVskeq`] (Y3(X^(Y5(Xv(Y!oqsNcleZh (Z!(Y| (Y|(Z!\\?^].L<UX ([U(Zs([,(Z!x~ ([!CR|~ (\\!'8T (]+(\\!kjdl (]!,0 (Vq)RD(X!:G (YW+43)RM*'}(^:))E+1g*{m(^M(t:(b!au *O((bx(_^(t?(]z(V4(]{(VG*JL*K)(VI*5?*KW)xQ(zD*I:*1G(^!w} (_!0/ *W!gh%uy *X!QRW_eh%jlnoqrx%~ *Y!&')*-%03%79:<%EG%IK%WY]^`bdg%iln%qtwy%{ (_:(^!bnq *S!]cdgqrt *T!&'/326%8:<=@CDHLMRTWZ]`cdfhkpsuvx%z} *U&*T|*U!(*%,02569:=>@A (cx(d0*q!lqp *r'*qy*r!328?JU]bhj~ *s!*4M *a!vz|x *b!2':9<@ *Y|*Z!&'*.%03%57;<>%@BDJL%RT%VY[\\^%ac%jnor%vy{~ *[!'()+%-01348:;A%EH%MO%Z\\]_`cf *b!>6UKDVJMYlhb]aqu *c!+1OKP^\\fps (`'(th(a!cmn (b&(hQ(b!8>X (e<)be)s[),1(_!ho +'G(dl),>)lW))7(o/(p!3+ (rV(s!;DP (n!ehfoujk (o?(n!w~ (o!LhNi_^KPYV (p!7. (oo(p!<Y1> (ov(p!*_bdc\\B~y (q)(p!ng *[!hjl%prsuw%y{}~ *\\!&'%*-%/1%79;%FIJLMO%UW%ik%~ *]!&' (q!<>. (pw(q!1OJuQ (r!=DYarX *{}+2^)4t*9!@DFVQoKUX^`r *:!&, *9w*:!68Q *9!_~u *:!9:/ *9!p{hqf *:!2< *9k*:!OweR}uJb@FziA *;!&/ *:t*;!)* *:!NC *;!1fpq *:v*<N*;!QIF *<W*;!sDd\\XtU,uBOH{z *]!()%~ *^!&'%. *;!}0~ *<!(&)*l4op\\fOXA8re9t7TZdvx} *=!dH; (q8*=!{n@`9 *>!&B *=!ti7Brf[\\M( *<|*>0*=!SD *>!f[dc} *?!89+:) *>!FPs *?!'=? *>!;w *?!r~ *@!(> *?n*@+*?!{pk *@8*?!RjeH *@!=;d )kc*A7*@H*A8*@w*A9*^!/0%OTjv| *_!.1%35%8;=%@C%FHIK%MPQTWZ%^`cghkqrtx} *`!')*,%.2%467?@DFKMP *A!U: *@!WT *A!XGgc]y )s0*A!Bqz *B!JN-5 *Ax*B!TB+_]Vyg *C!)LtRvc *D0),!;E (t!bg *2m(t{(u'(t~(bw(}!'*19 )5h)6!-b~ )7!4DAX )83)7`)8!J\\T )9e):U)9!)2Fl )8~)9!dB )8z)9!ft ):!QW?^ )9|):!=- );X)9!~v );!KG ):!jz );&):k);!,'d )<1);s)<C*`!QT[%]_%dh%loqruwx{}~ *a!'(%+-3%589;%@CEFH%KN%RU%[]`c%fhik%oqsuwy{}~ *b!&*+-%/138=BCEF )<!'deFgm} )=!+86]y )>)),H).])ko),N(cn(e!NZFEXosc (f!OV%XZG (e~(f![]'6 (g!-? (f!{uh (g!EF/ (f!zj (g!H{Xm_}RQ~ (h&(fv(gN(h'(g!fjw (h!+,. (g!TUO (h/(gz(h!0m9rOfEtuacy| (i`(j!/U (i!Bf:N8I5 *b!HILNOQ%SXZ%\\^%`d%fi%koprtv%y{%} *c!&'%),%.02%EG%JL%NQ%[]_%eg%oq (i!0On%p,)U (j!+r (i|(j!QY( (iz(j?(iw(j!v1 (it(k&(j!]^49 (k!1> (ji(kf(jq(k!23 (jt(k-(j!}d (k!6,9: (j!lm (k!/<+ *^~(k!eOSHkjEGnt (l!F'E (ks(l!;PGJ:BtR_Yijs (m!(Dilrv (n!1'5;@FEX ))!Wa\\Yy )*!*+ *c!rtu~ *d!'(%*,-/034:%<?AGN%PT%XZ\\^bcg%mp%ux%} *e!&'+%.1%46%ACFKM%VX%` )*!&3CJMP (~!8&9<B4DE=FHaNiXW]Omcp~ )&7(~w)&!8UVzy )'()&!wqYn )'!R8.7fUiWeEDcn| )(!:> *U~)(!Xf )-!W[fkmpy} ).!'38@G *J@)-E)d!ruy|} )e!/-:9>T[U^`cm_of *e!ab%~ *f!&'%g )eg)f!*&4 )ev)f!10(5L8?KDc`js )g!&)8 *8;(tK*yn(t!J( *{!8<%AILRUY\\_befh%j )*o)+')*z)+!,;6OKTI *XS)+!hgq~ ),'*73).!OTaZ )/5).y)/6).!lo )/!078 ).!ux )/!*KgXMA?[]<qS )0!QRTS )/t*f!hi%~ *g!&'%<>%VX%p )0!CVos )1-)0!v\\ket )1!l;1]XFZ4 )2!GM<J )1t)2!'5Rq )3!Czbu )4!,Ij ).h*sP*q!8:@BDEKMRSUWY%\\^ad%fhi (Tr)c])51)R!<[cQ )S!Q3>B: )R!op{} )S!4W~ )T))S[)T!LMF, )S`)T!5+O@C )S_)T!(DS *g!qr%vx%~ *h!&'%79%y )U5)T!|a )U!?D )T!\\Ync )U!'I*1 )To)U!KNP/ )V4)Uk)V!AC )UZ)V!67 )U!X\\x_ )Wd)V!jh )W!(X )Vb)W!*[0' )V|)W`)VN)WV)VQ)Wu)X!_?\\ )YJ)X!PwDE )W!|o )X5)Y!wI0x )Zl)Y!z=?USOoLg'Z7 )[!H,- )Z!cT8nu )[!1Z )Z!iHh )[!osr^Xb` )\\^*h!z{%~ *i!&'%TV%~ *j!&') )\\!V4FCOn{km| )]!NWOmi )^!*9 ({!7;LJ\\o )l,*~h);:(|!BL *L\\(|N*[<*Qv*_!Gdfv *`&*_!uzw *`+*_y*`!=<C^IENYmneg| *a!01/G7A: )BP*a!S\\agbj )-!4;:< (}@(gV(}!U^ ({((}!hk *1K),!gfj *9;),y+'S(}s(u!NPZvwp *j!*+%LN%~ *k!&'%.0%2 (ud(v>(u!xkq (v!F& (u|(v!K2yzQ|WLm (w'(v}(w!MO,>.[ (x)(w!epW} (x7*4p(x!l]9< (y!'T (xt(y!;= (xz(y!ILZ?OAEr (z!'&BGP (|!sz (z!ju ({*(z!acr *~!?ABDIGJKORTZ\\]`be%gijlmoq *.!9;=?BC *k!34%:<%~ *l!&'%: *.!GJXZ%\\cefjnquz{ */!),/023N7;<?B%DHILMPRSXZ]\\`b%hk%np%tv )*i)l|)(|)l;*at)g!HKh\\Y )h0)g|)h2)g!qmz )h!*)F: *x\\)h!kJH? )gt)h!Sp )i!2c.-0864 *l!;<%IK%vx%~ *m!&'%7DIKz *n!)-.4@Uvz )h!|{ )i!Id_]a )j&)iu)j!-K=/06:MWX?V )k()ji*v!|}~ )D!18C-N )E1)D!lOX} )E3)DZ)E!4*9 )D!p\\a )E|)F<)Ed)F=)E!u< )F?)E!eAf?i )F3)E!ODn )FA)EM)F!0ef )G!:;(< )Fw)G!>] )FP)G!/@ )Ft)GA)F!sq}|\\ )H6)G!iNQmE )HC)J=)H})I!GH )Hz*o!(4>DILV[aouvx%~ *p!&(%s )IL)Hq)I!3) )J&)Hd)I8)J@)Ia)J/)Ij)J!,S:OgG )I\\)KB)J!VW )KD)J!X52Hjv )K1)J!z| )K!J'7@U )Jd)KV)J\\)Ku)LL)Kc)L!45 )M))Kh)L!a[ )Md)L!mxR )M!R= )L!ZEu )M!@UTm[o )f!Je )P!:;@=KLFSTZc *^!UW[%]_`bacdfhklnqu *p!tu%~ *q!&'%6;NVbgjmor%xz%|~ *r!&-%0479@DEG%IL%PR%TVY[\\ac%gin%z} *s!&' *^!wxy *_!)+ *\\j)5!'37;>=A@H *7`)k!EJUegi )>/)@!789Sb )DW)@!L^I )^`)C5)@!f}z )A&)@~*2<)A!OD1?FQGgt| )B!>4Urs} )C'*X!236;=@EFHIGMUY *N!AD%FH%K )d!3d )c{)d!+4CDIPRTW )7r)8C)9h*s!)+.%02378:%CE%LNOQRTUWX\\_`eghmnpqs%|~ *t!&'%+/%24%689<>%ACFGIN%PT%VXY[%_acd );E)=,*2:)Q!JS]UYegfmux%z )R!(0+19 )>!0Pf )c!kptN *DV(`0*3!|yp *4@)CH*4!A5/18;k%n_FH]Q[ )CN*4!aouxq *5!89 *4v*5')CS*5=*Ue*5!aIWC]sw~ *6!F+,C2;NO?9 (q~(xw*6!ZTc )Ym*6!u| *7E)Cd*7!C4 *t!ef%moprsuw%{~ *u!&'(*%<?@BCEGHJNOQ%SU%]`b%fh%oq%uwy%{~ *v!'()+%/ *7:*6x)O!6IKUXk *y!XYZ\\`a )Pl),})P{*Nm)?2+3=)?!5^hfenptx )^![wqx )_!=B9-3jL )`!9<?XZ )a!C,8 )`n)aB)`s)a!HJh )b!*, )a!xp )b!WK^p )c!;F )^G)`A)a6)b0)5!ZY_de )w!ejps )x!,- )w})x!+3(1@8KV[kx )y+).!\\[ *v!01346%<>@BCEG%wz *w!'(%+-0%G )/n)0!63@ )/s)0!2< )1+)2!-4 )3!+wk )4!@F{ *3!]\\ )SA)TK)WF)t!+-5>LMF )?M)t!bQRn%pTqZaX^ )u!*I23 )t[)u,)t|)u!(Fwovcx} )v!&5<(W\\Lou )w/)vw)w!=NH^ +4.+2!>@A )q!1DM9GHZbYmfux )r!78.*AO *w!HI%~ *x!&'%N )r!ILftdgsx )s!-.>CK )l!7=KHEXov )m'*0!@IG *Oi*0!P\\Yaif )p!f~ *Ii*m!89:>=?@BCGJHM%OVW^]`_bcegi%moprw{%~ *n!&'(*%,/%13258%:<>?ABD *x!OP%Tknruy *y!*/%TVW[]^b%dg%mp%~ *z!&'%5 *n!CEHIM%OQSVWY]\\`acdg%il%pruw%y| *o!+,*-2357%9=?@C6E%GJMOPS%UW%Z\\_`^bce%mpr%t; )s!uz *sf)y!Me[c~ )'A)y!{z )z!=3 *z!67%:<=?%[]%~ *{!&'(+%79;HMNPSWX^ )z!XVp +1m*{z){6)oz)p!',2= )k!46 )l)+/!prx%| +0!)(-/.01589;=%@BCEHLNQ%SUZ]%chdj )m!68:DAPGWX\\hUTgfzq )n!.31/62N<GJ[KPWbUpc`d *{!aco%y{|~ *|!&'%u )nf)o.)n!mk )o2)n!x{ )o!1'50 )n~)o!?PFNH]a *1Y)|S){!>?FLN[lfrnsy *J!BGP[]` *K!'K<ANgShjv *L!F( *Km*L**Ku*L!ME?G6`Wbm *M!9N )m/*4i)p!KM )sj*2!HJLRVX[%]_^gAky| *3!*/FN *MV*x!X`c *|!vw%~ *}!&'%| *x!ilmotz{~ *y!&(),- *D!AH`bsnpo *E!C(&G8B>E.DQ_PiKULJdjO *F!+34/5 *Ek*FU*Ey*F6*E!zsl *F!EI:JLOKe}`gp\\ *G!'1 *F!vsky *G!(k *Fd*G!fgdIY5Wt<LeMBN| *H!?8b *}!}~ *~!&'%5<MSWX^_cps%y|%~ +&!&*,.%0457%;>%ACE%HJ%OQS%VX%[]_a%ikm%su%w *HV*G!qn *H!=' *Gl*H!;u<EC[cMaPZkzp~ *I!MJ5ARXps */w*0!*,- *80)|!gjupq )}))|w)}?)||)}![L>-BE498GR2lnY )~0)}!`qt )~!)6 )}v)~!-,KabsgXc@eW]fo *&3)~|*&!.?<GHLn`^qxm +&!xz%~ +'!&(%*,%68%:<%FHIK%RU%X^b%dfhjkm%~ +(!&'%: *'!(3/AJI *7!wz{}e *I{*8!ABCMOHKX[ST^dikoz *9!&/ *J!\\cf *K!]d *M1*1!,.6>?A *(,)>D*(!AMLNRblmqw|}xu *)!.? *95)B?*1!N]dtpux} *2)*)O**u*+!KS *-:*.5+1!VR *Xs*Y!+;8X *X!gm *U!RT *c!w}{| *d8+(!;<%~ +)!&'%A *d!65D=CQRFHM`Ydaevw~ *e!()*0/5 *U`+0u*Y_*Z!9S *[!N^ *Y!\\fcak}~ *Z!(, *Y!uv *Z)*Ym*Z!:EF1GI2WKbkmz|q} *[!/5.*2&>67FG?ekqdiz *\\!+0,8: *V!*4<7JF )?=*N!PXTV +)!BC%~ +*!&'%H *N!_ei *O_*R<*u>*t!-73JELSRnqt *u)+3!loq%vx +2!CPR *s!VYZko )sM*s}*g!Ww *h8*iU*j(*k/*jM*l!Jw ++!369%< )zB++!?BD%FHINOR%WY%]_abd%kn%qx%{~ +,&+*!IJ%~ ++!&'%/12478=>@CGJ%MQ^`cmr%v|} +,!,-56;<'%+.%02%478:= *u!gp|} *v!&A=5DF *~!{z +&(+0O+&!'+-2163<=B +'!][_a`ei *yo*z!;\\ *{!*) +&!PRW`\\l^jy +'!'+7; +1![\\ *-.+0!y~ +1!&)0 *k;+1!;=y%{~} +2!'.,*/4gqt~| +3!)*0 +,!>?%~ +-!&'%~ +.!&'%~ +/!&'%ntw~ +0!'+237DGI%KMPTV%Y\\efik%twxz%} +1!'(*%/2%:<>%CE%QS%UWXZ]%ac%fh%jnpqs%uwx| +2!&()+-0%35%=?BD%OQTVWY%[]_%dfh%prsu%{} +3!&(+%/1%;>%jmny%~ +4!&'%+/%14%8 .*f.+!Zv .,!oy .-!;<%>@BCGN%PRSV%X -R!XY%~ -S!&'%N"));
			var gbk = src(gbk_us);
			return gbk;
		}();

		var gbk_build = GBK$1;

		return gbk_build;

	})));
	});

	var SJIS_BASE64 = "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MIWC4zCGguQwh4LlMIiC5jCJgucwioLoMIuC6TCMguowjYLrMI6C7DCPgu0wkILuMJGC7zCSgvAwk4LxMJuBSjCcgUswnYFUMJ6BVTChg0AwooNBMKODQjCkg0MwpYNEMKaDRTCng0YwqINHMKmDSDCqg0kwq4NKMKyDSzCtg0wwroNNMK+DTjCwg08wsYNQMLKDUTCzg1IwtINTMLWDVDC2g1Uwt4NWMLiDVzC5g1gwuoNZMLuDWjC8g1swvYNcML6DXTC/g14wwINfMMGDYDDCg2Eww4NiMMSDYzDFg2QwxoNlMMeDZjDIg2cwyYNoMMqDaTDLg2owzINrMM2DbDDOg20wz4NuMNCDbzDRg3Aw0oNxMNODcjDUg3Mw1YN0MNaDdTDXg3Yw2IN3MNmDeDDag3kw24N6MNyDezDdg3ww3oN9MN+DfjDgg4Aw4YOBMOKDgjDjg4Mw5IOEMOWDhTDmg4Yw54OHMOiDiDDpg4kw6oOKMOuDizDsg4ww7YONMO6DjjDvg48w8IOQMPGDkTDyg5Iw84OTMPSDlDD1g5Uw9oOWMPuBRTD8gVsw/YFSMP6BU04AiOpOAZKaTgOOtU4HlpxOCI/kTgmOT04Kj+NOC4m6Tg2Vc04Ol15OEJigThGJTk4Uio5OFZihThaQok4XmcBOGIt1ThmVuE4ej+VOIZe8TiaVwE4qmKJOLZKGTjGYo04yi/hONpikTjiK2045kk9OO47lTjyYpU4/mKZOQpinTkOUVE5Fi3ZOS5RWTk2T4U5OjMFOT5ZSTlXlaE5WmKhOV4/mTliYqU5ZibNOXYvjTl6M7k5fludOYpukTnGXkE5zk/tOfoqjToCLVE6CmKpOhZirToaXuU6Il1xOiZGIToqYrU6LjpZOjJPxTo6YsE6RiV1OkozdTpSM3E6ViOROmJhqTpmYaU6bjbFOnIifTp6YsU6fmLJOoJizTqGWU06imLROpIzwTqWI5U6mlpJOqIucTquLnU6si55OrZLgTq6Xuk6wmLVOs5i2TraYt066kGxOwI9ZTsGQbU7CmLxOxJi6TsaYu07Hi3dOyo2hTsuJ7k7NmLlOzpi4Ts+Vp07UjmVO1Y5kTtaRvE7XmL1O2JV0TtmQ5U7dgVdO3pi+Tt+YwE7jkeNO5JffTuWIyE7tmL9O7om8TvCLwk7ykodO9oyPTveYwU77lENPAYrpTwmYwk8KiMlPDYzeTw6K6k8PlZpPEJSwTxGLeE8aie9PHJjlTx2TYE8vlIxPMJjETzSUuk82l+BPOJBMTzqOZk88jpdPPYm+T0OSz09GkkFPR5jIT02Iyk9OkuFPT49aT1CNsk9Rl0NPU5HMT1WJvU9XmMdPWZddT1qYw09bmMVPXI3sT12Yxk9em0NPaZjOT2+Y0U9wmM9Pc4nAT3WVuU92mMlPe5jNT3yM8U9/jmdPg4qkT4aY0k+ImMpPi5fhT42OmE+PmMtPkZjQT5aY00+YmMxPm4ufT52Iy0+gi6BPoYm/T6ubRE+tlplPrpWOT6+M8k+1kE5Ptpe1T7+V1k/CjFdPw5GjT8SJ4k/Kj3JPzpjXT9CY3E/RmNpP1JjVT9eRrU/YmNhP2pjbT9uY2U/dldtP35jWT+GQTU/jlpNP5JjdT+WY3k/uj0NP75jrT/OUb0/1lVVP9pjmT/iV7k/6ibRP/pjqUAWY5FAGmO1QCZFxUAuMwlANlHtQD+DFUBGY7FASk3xQFJjhUBaM9FAZjPNQGpjfUB+O2FAhmOdQI5XtUCSSbFAlmONQJoyRUCiY4FApmOhQKpjiUCuXz1AsmOlQLZhgUDaL5FA5jJBQQ5juUEeY71BImPNQSYjMUE+VzlBQmPJQVZjxUFaY9VBamPRQXJLiUGWMklBsmPZQco7DUHSRpFB1kuNQdov0UHiY91B9i1VQgJj4UIWY+lCNllRQkYyGUJiOUFCZlPVQmpj5UKyNw1Ctl2JQspj8ULOZQlC0mPtQtY3CULePnVC+jFhQwplDUMWLzVDJmUBQyplBUM2TrVDPkZxQ0YuhUNWWbFDWmURQ2pe7UN6ZRVDjmUhQ5ZlGUOeRbVDtmUdQ7plJUPWZS1D5mUpQ+5XGUQCLVlEBmU1RAplOUQSJrVEJmUxREo7yURSZUVEVmVBRFplPURiY1FEamVJRH4+eUSGZU1Eql0RRMpbXUTeZVVE6mVRRO5lXUTyZVlE/mVhRQJlZUUGI8lFDjLNRRIxaUUWPW1FGkptRR4uiUUiQ5lFJjPVRS42OUUyZW1FNlsZRTpNlUVCOmVFSmVpRVJlcUVqTfVFcipVRYpldUWWT/FFokVNRaZlfUWqZYFFrlKpRbIz2UW2YWlFumWFRcYukUXWVulF2kbRRd4vvUXiTVFF8jJNRgJliUYKZY1GFk+BRhol+UYmZZlGKjftRjJllUY2NxFGPmWdRkOPsUZGZaFGSlmBRk5lpUZWZalGWmWtRl4/nUZmOylGgiqVRopluUaSZbFGllrtRppltUaiVeVGpmW9RqplwUauZcVGsk35RsJl1UbGZc1GymXRRs5lyUbSN4VG1mXZRtpboUbeX4lG9mXdRxJCmUcWZeFHGj3lRyZl5UcuSnFHMl71RzZOAUdaZw1HbmXpR3OqjUd2Lw1HgmXtR4ZZ9UeaPiFHnkfpR6Zl9UeqT4lHtmX5R8JmAUfGKTVH1mYFR9oulUfiTylH5iZpR+o9vUf2Un1H+mYJSAJOBUgOQblIEmYNSBpWqUgeQ2FIIiqBSCoqnUguZhFIOmYZSEYxZUhSZhVIXl/FSHY+JUiSUu1IllcpSJ5mHUimXmFIqmYhSLpmJUjCTnlIzmYpSNpCnUjeN/FI4jJRSOZmLUjqOaFI7jY9SQ5LkUkSZjVJHkaVSSo3tUkuZjlJMmY9STZFPUk+ZjFJUmZFSVpZVUluNhFJemZBSY4yVUmSN3FJllI1SaZmUUmqZklJvlZtScI/oUnGZm1JyioRSc5mVUnSZk1J1kW5SfZmXUn+ZllKDimNSh4yAUoiZnFKJl6tSjZmYUpGZnVKSmZpSlJmZUpuXzVKfjPdSoInBUqOX8lKpj5VSqpN3UquNhVKsmaBSrZmhUrGX41K0mEpStZmjUrmM+FK8maJSvopOUsGZpFLDlnVSxZK6UseXRVLJlddSzZmlUtLo01LVk65S15mmUtiKqFLZlrFS3Y+fUt6Zp1LfleVS4JmrUuKQqFLjmahS5IvOUuaZqVLniqlS8oxNUvOZrFL1ma1S+JmuUvmZr1L6jtlS/oz5Uv+W3FMBluZTApP1UwWV71MGmbBTCJmxUw2Zs1MPmbVTEJm0UxWZtlMWibtTF5ZrUxmN+lMambdTHZF4UyCPoFMhi6dTI5m4UyqU2VMvmblTMZm6UzOZu1M4mbxTOZVDUzqL5lM7iONTP5O9U0CZvVNBj1xTQ5DnU0WZv1NGmb5TR4+hU0iM31NJmcFTSpS8U02ZwlNRlNpTUpGyU1OR7FNUi6ZTV5PsU1iSUFNalI5TXJZtU16ZxFNgkOhTZoxUU2mZxVNumcZTb4lLU3CI81NxiutTc5GmU3SLcFN1l5FTd5nJU3iJtVN7mchTf4uoU4KZylOElu9TlpnLU5iX0FOajPpTn4y0U6CZzFOlmc5TppnNU6iQflOpiVhTrYl9U66Zz1OwmdBTs4y1U7aZ0VO7i45Two5RU8OZ0lPIlpRTyY2zU8qLeVPLl0ZTzJFvU82UvVPOjvtT1I9mU9aO5lPXjvNT2Y+WU9uUvlPfmdVT4YliU+KRcFPjjPtT5IzDU+WL5VPomdlT6ZJAU+qR/FPri6lT7I+iU+2Z2lPumdhT74nCU/CR5FPxjrZT8o5qU/OJRVP2ipBT942GU/iOaVP6mdtUAZncVAOLaFQEimVUCI2HVAmLZ1QKkt1UC4lEVAyTr1QNlrxUDo1AVA+XmVQQk2ZUEYz8VBuMTlQdmeVUH4vhVCCWaVQmlNtUKZnkVCuK3FQsmd9ULZngVC6Z4lQ2meNUOIt6VDmQgVQ7latUPJnhVD2Z3VQ+jOFUQJneVEKYQ1RGlfBUSJLmVEmM4FRKjZBUTpnmVFGT21RfmepUaI78VGqO9FRwme1UcZnrVHOWoVR1mehUdpnxVHeZ7FR7me9UfIzEVH2WvVSAmfBUhJnyVIaZ9FSLje5UjJhhVI6Z6VSPmedUkJnzVJKZ7lSimfZUpJpCVKWZ+FSomfxUq5pAVKyZ+VSvml1Uso3nVLOKUFS4mfdUvJpEVL2I9FS+mkNUwIijVMGVaVTCmkFUxJn6VMeZ9VTImftUyY3GVNiaRVThiPVU4ppOVOWaRlTmmkdU6I+jVOmWiVTtmkxU7ppLVPKTTlT6mk1U/ZpKVQSJU1UGjbRVB5BPVQ+aSFUQk4JVFJpJVRaIoFUumlNVL5dCVTGPpVUzmllVOJpYVTmaT1U+kcFVQJpQVUSR7VVFmlVVRo+kVUyaUlVPluJVU4xbVVaaVlVXmldVXJpUVV2aWlVjmlFVe5pgVXyaZVV+mmFVgJpcVYOaZlWEkVBVh5poVYmNQVWKml5Vi5KdVZiaYlWZmltVmoqrVZyK7FWdioVVnppjVZ+aX1WnjJZVqJppVamaZ1WqkXJVq4tpVayLqlWummRVsIvyVbaJY1XEmm1VxZprVceapVXUmnBV2ppqVdyablXfmmxV445rVeSab1X3mnJV+Zp3Vf2adVX+mnRWBpJRVgmJw1YUmnFWFppzVhePplYYiVJWG5p2VimJ3FYvmoJWMY/6VjKafVY0mntWNpp8VjiaflZCiVxWTJFYVk6aeFZQmnlWW4qaVmSagVZoiu1WapqEVmuagFZsmoNWdJWsVniT01Z6lLZWgJqGVoaahVaHimRWipqHVo+ailaUmolWoJqIVqKUWFalmotWrpqMVrSajla2mo1WvJqQVsCak1bBmpFWwpqPVsOaklbImpRWzpqVVtGallbTmpdW15qYVtiZZFbajvpW245sVt6J8VbgiPZW45JjVu6amVbwjaJW8ojNVvOQfVb5mppW+ozFVv2NkVb/mpxXAJqbVwOV3lcEmp1XCJqfVwmanlcLmqBXDZqhVw+Ml1cSiYBXE5qiVxaapFcYmqNXHJqmVx+TeVcmmqdXJ4izVyiN3VctjFxXMJJuVzeaqFc4mqlXO5qrV0CarFdCjeJXR4vPV0qWVldOmqpXT5qtV1CNv1dRjUJXYZqxV2SNo1dmklJXaZquV2qS2Fd/mrJXgpCCV4iasFeJmrNXi4xeV5OatFegmrVXoo1DV6OKX1ekmrdXqpq4V7CauVezmrZXwJqvV8OaulfGmrtXy5aEV86P6VfSmr1X05q+V9SavFfWmsBX3JRXV9+I5lfglXVX45rBV/SP+1f3jrdX+ZR8V/qK7lf8jelYAJZ4WAKTsFgFjJhYBpHNWAqav1gLmsJYFZHCWBmaw1gdmsRYIZrGWCSS51gqiqxYL+qfWDCJgVgxlfFYNI/qWDWTZ1g6jeRYPZrMWECVu1hBl9tYSonyWEuayFhRkVlYUprLWFSTg1hXk2hYWJOEWFmUt1hakstYXo3HWGKax1hpiZZYa5NVWHCayVhymsVYdZBvWHmazVh+j21Yg4urWIWazliTleZYl5GdWJySxFifmtBYqJZuWKua0ViumtZYs5WtWLia1Vi5ms9YuprSWLua1Fi+jaRYwZXHWMWa11jHkmRYyonzWMyP61jRmtlY05rYWNWNiFjXmtpY2JrcWNma21jcmt5Y3prTWN+a4Fjkmt9Y5ZrdWOuObVjskHBY7pFzWO+a4VjwkLpY8YjrWPKUhFj3ktlY+ZrjWPqa4lj7muRY/JrlWP2a5lkCmudZCZXPWQqa6FkPicRZEJrpWRWXW1kWik9ZGJnHWRmPZ1kakb1ZG5rqWRyW6VkilrJZJZrsWSeR5Vkpk1ZZKpG+WSuVdlksmu1ZLZruWS6Jm1kxjrhZMprvWTeIzlk4mvBZPprxWUSJgllHiu9ZSJPeWUmV8llOmvVZT5F0WVCa9FlRjF9ZVJZ6WVWa81lXk4VZWJr3WVqa9llgmvlZYpr4WWWJnFlnmvpZaI+nWWma/FlqkkRZbJr7WW6VsVlzj5dZdJN6WXibQFl9jURZgZtBWYKUQFmDlNxZhJbPWYqURFmNm0pZk4tXWZaXZFmZlq1Zm5uqWZ2bQlmjm0VZpZHDWaiWV1msk2lZsptGWbmWhVm7jchZvo+oWcabR1nJjm9Zy45uWdCIt1nRjMZZ05CpWdSIz1nZm0tZ2ptMWdybSVnliVdZ5oqtWeibSFnqlsNZ65VQWfaIpln7iPdZ/45wWgGI0FoDiKFaCZtRWhGbT1oYlrpaGptSWhybUFofm05aIJBQWiWbTVopldhaL4ziWjWbVlo2m1daPI+pWkCbU1pBmEtaRpRrWkmbVVpajaVaYptYWmaVd1pqm1labJtUWn+WuVqSlH1amptaWpuVUVq8m1tavZtfWr6bXFrBicVawpteWsmOuVrLm11azIyZWtCba1rWm2Ra15thWuGShFrjm2Ba5ptiWumbY1r6m2Va+5tmWwmK8FsLm2hbDJtnWxabaVsij+xbKptsWyyS2lswiWRbMptqWzabbVs+m25bQJtxW0Obb1tFm3BbUI5xW1GbcltUjUVbVZtzW1eOmltYkbZbWpt0W1ubdVtcjnlbXY1GW1+W0Ftji0dbZIzHW2WbdltmindbaZt3W2uRt1twm3hbcZuhW3ObeVt1m3pbeJt7W3qbfVuAm35bg5uAW4WR7luHiUZbiI7nW4mIwFuLkXZbjIquW42Os1uPjUdblZOGW5ePQFuYiq9bmZKIW5qS6FubiLZbnItYW52V81ufjsBbootxW6OQ6VukjrpbpZdHW6abgVuui3tbsI3JW7OKUVu0iYNbtY+qW7aJxlu4m4JbuZdlW7+PaFvCjuJbw5uDW8SK8VvFk9BbxpanW8ebhFvJm4VbzJV4W9Cbh1vSiqZb04v1W9SbhlvbirBb3ZBRW96bi1vfjkBb4YnHW+Kbilvkm4hb5ZuMW+abiVvnlEpb6J7LW+mQUlvrm41b7pe+W/Cbjlvzm5Bb9ZKeW/abj1v4kKFb+o6bW/6Rzlv/jvVcAZWVXAKQ6lwEjstcBZuRXAaPq1wHm5JcCJuTXAmI0VwKkbhcC5BxXA2blFwOk7FcD4+sXBGPrVwTm5VcFpDrXBqPrlwgm5ZcIpuXXCSW3lwom5hcLYvEXDGPQVw4m5lcOZuaXDqO2lw7kEtcPJPyXD2Qc1w+lPZcP5RBXECLx1xBm5tcRYuPXEabnFxIi/xcSpPNXEuJrlxNjnJcTpudXE+boFxQm59cUYv7XFObnlxVk1dcXpGuXGCTalxhjsZcZJF3XGWXmlxsm6JcbpujXG+T1FxxjlJcdpulXHmbplyMm6dckIryXJGbqFyUm6lcoYmqXKiRWlypiuJcq5urXKyWplyxkdBcs4p4XLabrVy3m69cuIrdXLubrFy8m65cvpuxXMWbsFzHm7Jc2ZuzXOCTu1zhi6xc6InjXOmbtFzqm7lc7Zu3XO+V9VzwlfRc9pOHXPqbtlz7j3Nc/Zu1XQeQkl0Lm7pdDo3oXRGbwF0Um8FdFZu7XRaKUl0Xm7xdGJvFXRmbxF0am8NdG5u/XR+bvl0im8JdKZX2XUubyV1Mm8ZdTpvIXVCXkl1Sm8ddXJu9XWmQk11sm8pdb421XXOby112m8xdgpvPXYSbzl2Hm81di5OIXYybuF2Qm9VdnZvRXaKb0F2sm9JdrpvTXbeb1l26l+RdvJvXXb2b1F3Jm9hdzIreXc2b2V3Sm9td05vaXdab3F3bm91d3ZDsXd6PQl3hj4Rd45GDXeWNSF3mjbZd541JXeiLkF3rm95d7o23XfGMyF3ym99d85akXfSUYl31m+Bd941KXfuKql39kkZd/ovQXgKOc14DlXpeBpS/Xgub4V4MivNeEZvkXhaSn14Zm+NeGpviXhub5V4dkuleJZCDXiuOdF4tkMheL5HRXjCLQV4zkqBeNpvmXjeb5144j+1ePZZYXkCb6l5Dm+leRJvoXkWVnV5Hm/FeTJZ5Xk6b615Um+1eVZaLXleb7F5fm+5eYZSmXmKb715jlbxeZJvwXnKKsV5zlb1edJROXnWb8l52m/NeeI1LXnmKsl56m/Ree4y2XnyXY159l0hefor0Xn+b9l6BkqFeg41MXoSPr16HlN1eio+wXo+PmF6VkupelpX3XpeTWF6ajU1enJV7XqCb916mk3hep43AXquMyV6tkutetYjBXraPjl63jU5euJdmXsGb+F7Cm/lew5RwXsib+l7Jl/VeyphMXs+b/F7Qm/te04pmXtacQF7anENe25xEXt2cQl7flV9e4I+xXuGcRl7inEVe45xBXuicR17pnEhe7JxJXvCcTF7xnEpe85xLXvScTV72iYRe95LsXvicTl76jJpe+4n0XvyUVV7+nE9e/5P5XwGV2V8DnFBfBJhNXwmcUV8Klb5fC5xUXwyYn18NmK9fD46uXxCT818RnFVfE4t8XxSSol8ViPhfFpxWXxeVpF8YjU9fG5JvXx+S7V8llu1fJoy3XyeMyl8pnFdfLZxYXy+cXl8xjuNfNZKjXzeLrV84nFlfPJVKXz6SZV9BnFpfSJxbX0qLrl9MnFxfTpxdX1GcX19Tk5ZfVpxgX1ecYV9ZnGJfXJxTX12cUl9hnGNfYoxgX2aVRl9pjcpfapVWX2uSpF9slWpfbZxkX3CPsl9xiWVfc5xlX3ecZl95lvBffJTeX3+caV+AiZ1fgZCqX4KcaF+DnGdfhIxhX4WR0l+HnG1fiJxrX4qcal+Ll6VfjIzjX5CPmV+RnGxfkpNrX5OPXV+Xk75fmJxwX5mcb1+enG5foJxxX6GM5F+onHJfqZWcX6qPel+tnHNfrpT3X7OTv1+0kqVfuZNPX7ycdF+9i0pfw5BTX8WVS1/MivVfzZRFX9acdV/XjnVf2JZZX9mWWl/ciZ5f3Zx6X+CSiV/knHdf64n1X/Ccq1/xnHlf9ZRPX/iceF/7nHZf/Y2aX/+cfGAOnINgD5yJYBCcgWASk3tgFZyGYBaVfGAZnIBgG5yFYByX5WAdjnZgIJHTYCGcfWAli31gJpyIYCeQq2AoiYVgKZyCYCqJ9mArnIdgL4uvYDGchGA6nIpgQZyMYEKclmBDnJRgRpyRYEqckGBLl/ZgTZySYFCLsGBSjVBgVY+aYFmcmWBanItgX5yPYGCcfmBiifhgY5yTYGSclWBlknBgaI2mYGmJtmBqnI1ga5yYYGycl2Bti7Fgb5GnYHCKhmB1jGJgd5yOYIGcmmCDnJ1ghJyfYImOu2CLnKVgjJLuYI2cm2CSnKNglIn3YJacoWCXnKJgmpyeYJucoGCfjOVgoJdJYKOKs2CmiXhgp5ykYKmUWWCqiKtgspTfYLOce2C0nKpgtZyuYLaW42C4nKdgvJOJYL2crGDFj+5gxpytYMeT1WDRmGZg05ypYNicr2DajZtg3JDJYN+I0mDgnKhg4ZymYOOReWDnnJxg6I5TYPCRxGDxnLtg85F6YPSctmD2nLNg95y0YPmO5GD6nLdg+5y6YQCctWEBj0RhA5y4YQacsmEIlvphCZb5YQ2cvGEOnL1hD4jTYRWcsWEai/BhG4ikYR+KtGEhnLlhJ5zBYSicwGEsnMVhNJzGYTycxGE9nMdhPpy/YT+cw2FCnMhhRJzJYUecvmFIjpxhSpzCYUuR1GFMjVFhTZywYU6QVGFTnNZhVZXnYViczGFZnM1hWpzOYV2c1WFfnNRhYpadYWOKtWFlnNJhZ4xkYWiKU2FrnM9hbpe2YW+c0WFwiNRhcZzTYXOcymF0nNBhdZzXYXaMY2F3nMthfpd8YYKXSmGHnNphipzeYY6RnmGQl/dhkZzfYZSc3GGWnNlhmZzYYZqc3WGkla5hp5OyYamMZWGrnOBhrJzbYa6c4WGyjJthtomvYbqc6WG+irZhw5znYcac6GHHjadhyJzmYcmc5GHKnONhy5zqYcyc4mHNnOxh0In5YeOc7mHmnO1h8pKmYfSc8WH2nO9h95zlYfiMnGH6nPBh/Jz0Yf2c82H+nPVh/5zyYgCc9mIInPdiCZz4YgqV6GIMnPpiDZz5Yg6PXmIQkKxiEYnkYhKJ+mIUnPtiFoi9YhqQymIbnPxiHebBYh6dQGIfjIFiIZ1BYiaQ7WIqnUJiLp1DYi+LWWIwnURiMp1FYjOdRmI0kdViOIzLYjuW32I/lltiQI+KYkGdR2JHkO5iSOe7YkmU4GJLjuhiTY3LYk6dSGJTkcViVZWlYliR72JbnUtiXp1JYmCdTGJjnUpiaJ1NYm6Vr2JxiLVidpV9YnmU4WJ8nU5ifp1RYn+Ps2KAi1pigp1PYoOdVmKEj7RiiZ1QYoqUY2KRl31ikp1SYpOdU2KUnVdilZOKYpadVGKXjVJimJDcYpudZWKclLJinpHwYquU4mKsnatisZX4YrWS72K5lpViu51aYryJn2K9kopiwp1jYsWSU2LGnV1ix51kYsidX2LJnWZiyp1iYsydYWLNlI9iz51bYtCJ+2LRnVli0ouRYtOR8WLUnVVi151YYtiNU2LZkNli24+1YtydYGLdlHFi4IuSYuGKZ2Lsiodi7ZBAYu6daGLvnW1i8Z1pYvOMnWL1nW5i9o5BYveNiWL+j0Vi/51cYwGOnWMCnWtjB453YwidbGMJiMJjDJ1nYxGSp2MZi5NjH4uyYyedamMoiKVjK43BYy+QVWM6kvBjPZTSYz6dcGM/kX1jSZGoY0yOSmNNnXFjT51zY1Cdb2NVld9jV5K7Y1yRe2NnlfljaI7MY2mdgGNrnX5jbpCYY3KMnmN2nXhjd4+3Y3qT5mN7lFBjgJ12Y4ORfGOIjvZjiZ17Y4yPtmOOnXVjj516Y5KUcmOWnXRjmIxAY5uKfGOfnXxjoJepY6GNzGOiklRjo515Y6WQ2mOnjVRjqJCEY6mJhmOqkVtjq513Y6yLZGOyjGZjtJLNY7WdfWO7kX5jvp2BY8Cdg2PDkbVjxJ2JY8adhGPJnYZjz5VgY9CS8WPSnYdj1pdLY9qXZ2Pbirdj4YisY+OdhWPpnYJj7or2Y/SJh2P2nYhj+pdoZAadjGQNkblkD52TZBOdjWQWnYpkF52RZBydcmQmnY5kKJ2SZCyUwGQtk4tkNJ2LZDadj2Q6jGdkPo3vZEKQ22ROnZdkWJNFZGedlGRploBkb52VZHadlmR4lsxkepCgZIOMgmSInZ1kko5UZJOdmmSVnZlkmpRRZJ6Ts2Skk1BkpZ2bZKmdnGSrlY9krZRkZK6OQmSwkO9kspZvZLmKaGS7naNkvJ2eZMGXaWTCnaVkxZ2hZMedomTNkYBk0p2gZNSdXmTYnaRk2p2fZOCdqWThnapk4pNGZOOdrGTmjkNk552nZOyLW2Tvna1k8Z2mZPKdsWT0nbBk9p2vZPqdsmT9nbRk/o/vZQCds2UFnbdlGJ21ZRydtmUdnZBlI525ZSSduGUqnZhlK526ZSydrmUvjnhlNJ27ZTWdvGU2nb5lN529ZTidv2U5ifxlO41VZT6V+mU/kK1lRYzMZUidwWVNncRlT5VxZVGLfmVVncNlVp3CZVeUc2VYncVlWYuzZV2dx2VencZlYoq4ZWOOVWVmk9ZlbIxoZXCQlGVynchldJCuZXWTR2V3lX5leJ3JZYKdymWDnctlh5W2ZYibfGWJkMRljJVrZY6N1mWQlONlkZTBZZeTbGWZl79lm53NZZyOzmWfnc5loYi0ZaSL0mWlkMtlp5WAZaudz2WsjmFlrZJmZa+OemWwkFZlt53QZbmV+2W8iZdlvY57ZcGd02XDndFlxJ3UZcWXt2XGndJly5D5Zcyd1WXPkbBl0p3WZdeK+GXZndhl253XZeCd2WXhndpl4or5ZeWT+mXmklVl54uMZeiOfGXpkYFl7I97Ze2IrmXxndtl+omgZfud32YCjVZmA53eZgaNqWYHj7hmCp3dZgyPuWYOlr5mD42oZhOI1WYUkMxmHJ3kZh+Qr2YgiWZmJY90ZieWhmYojfBmLY+6Zi+QpWY0neNmNZ3hZjad4mY8kotmP55FZkGd6GZCjp5mQ41XZkSd5mZJnedmS5BXZk+d5WZSjk5mXZ3qZl6d6WZfne5mYp3vZmSd62ZmikFmZ53sZmid7WZplNNmbpWBZm+MaWZwnfBmdJCwZnaPu2Z6knFmgYvFZoOd8WaEnfVmh4nJZoid8maJnfRmjp3zZpGPi2aWkmdml4jDZpid9madnfdmopKoZqaX72arjmJmrpXpZrSWXGa4nkFmuZ35Zryd/Ga+nftmwZ34ZsSeQGbHk9xmyZ36ZtaeQmbZj4xm2p5DZtyXambdlJhm4J5EZuaeRmbpnkdm8J5IZvKLyGbziWdm9I1YZvWeSWb3nkpm+I+RZvmRgmb8mdZm/ZFdZv6RXGb/kdZnAI3FZwOY8GcIjI5nCZdMZwuV/GcNlZ5nD55LZxSN8WcVkr1nFp5MZxeYTmcbll1nHZKpZx6eTWcfivpnJp5OZyeeT2colthnKpaiZyuWlmcslntnLY5EZy6eUWcxjulnNJZwZzaeU2c3nlZnOJ5VZzqK92c9i4BnP55SZ0GeVGdGnldnSZCZZ06Xm2dPiMdnUI3eZ1GRumdTjttnVo/xZ1meWmdck21nXp5YZ1+RqWdgnllnYY/wZ2KW22djnltnZJ5cZ2WXiGdqnmFnbY1ZZ2+UdGdwnl5ncZOMZ3Kd3GdzneBndYtuZ3eUZmd8nmBnfo+8Z3+UwmeFnmZnh5T4Z4meXWeLnmNnjJ5iZ5CQzWeVlo1nl5fRZ5qWh2ecicpnnY59Z6CYZ2ehnmVnopCVZ6aeZGepnl9nr4zNZ7Oea2e0nmlntonLZ7eeZ2e4nm1nuZ5zZ8GRxmfElb9nxp51Z8qVQWfOnnRnz5SQZ9CWXmfRirln05D1Z9SPX2fYktFn2pdNZ92ecGfenm9n4p5xZ+SebmfnnnZn6Z5sZ+yeamfunnJn755oZ/GSjGfzlvZn9I7EZ/WN8mf7jbhn/paPZ/+KYGgCksxoA5PIaASJaGgTkPBoFpCyaBeMSWgennhoIY1aaCKKnGgpnnpoKoqUaCuegWgynn1oNJDxaDiKamg5japoPIppaD2NzWhAnntoQYyFaEKMamhDk41oRp55aEiIxGhNnnxoTp5+aFCLy2hRjEtoU4q6aFSLamhZnoJoXI33aF2WkWhfjlZoY56DaGeVT2h0no9odomxaHeehGh+npVof56FaIGXwGiDnoxohZR+aI2elGiPnodok4iyaJSeiWiXjVtom56LaJ2eimifnoZooJ6RaKKPvWimmutop4zmaKiXnGitnohor5LyaLCKQmixjatos56AaLWekGi2ioFouZ6OaLqekmi8k45oxIr8aMaesGjJlsdoyp6XaMuK+2jNnp5o0pZfaNSen2jVnqFo156laNiemWjakklo35OPaOCeqWjhnpxo456maOeeoGjukFho756qaPKQsWj5nqho+oq7aQCYb2kBnpZpBJ6kaQWI1mkInphpC5a4aQyenWkNkEFpDpLFaQ+ek2kSnqNpGZCaaRqerWkbipFpHIyfaSGer2kinpppI56uaSWep2kmnptpKJ6raSqerGkwnr1pNJPMaTaeomk5nrlpPZ67aT+S1mlKl2tpU5WWaVSetmlVkchpWZ68aVqRXmlcnrNpXZ7AaV6ev2lgk+1pYZ6+aWKT6GlqnsJpa561aW2Lxmlunrhpb498aXOUgGl0nrppdYvJaXeesml4nrRpeZ6xaXyYT2l9inlpfp63aYGewWmCilRpio3laY6JfGmRntJplJhQaZWe1WmbkFlpnJ7UaaCe02mnntBprp7EabGe4WmynsNptJ7Wabuezmm+nslpv57GacGex2nDns9px+qgacqezGnLjVxpzJLGac2RhGnOnspp0J7FadOeyGnYl2xp2ZaKad2ezWnentdp557faeie2GnrnuVp7Z7jafKe3mn5nt1p+5LOaf2RhWn/nttqAp7ZagWe4GoKnuZqC5Tzagye7GoSnudqE57qahSe5GoXkpRqGZVXahue2moenuJqH4++aiGWzWoinvZqI57paimMoGoqiaFqK4p+ai6e0Wo1j79qNp7uajie9Wo5jvdqOoqSaj2STWpEnutqR57wakie9GpLi7RqWItralme8mpfi0BqYZPJamKe8WpmnvNqcp7tanie72p/ioBqgJJoaoSe+mqNnvhqjoznapCe92qXn0BqnJ53aqCe+Wqinvtqo578aqqfS2qsn0dqrp6NarOfRmq4n0Vqu59CasGe6GrCn0Rqw59DatGfSWrTmEVq2p9MatuL+Wren0hq359KauiUpWrqn01q+p9RavufTmsEl5NrBZ9Pawqe3GsSn1JrFp9Tax2JVGsfn1VrIIyHayGOn2sji9NrJ4miazKXfms3n1drOJ9WazmfWWs6i1xrPYvUaz6KvGtDn1xrR59ba0mfXWtMicxrTpJWa1CfXmtTir1rVJ9ga1mfX2tbn2FrX59ia2GfY2tijn5rY5Cza2SNn2tmlZBraZXga2qYY2tvjpVrc43Oa3SX8Gt4n2RreZ9la3uOgGt/n2ZrgJ9na4OfaWuEn2hrhpZ3a4mPfWuKjupri45ja42famuVn2xrlpBCa5ifa2uen21rpJ9ua6qfb2urn3Brr59xa7Gfc2uyn3Jrs590a7SJo2u1kmlrt591a7qORWu7imtrvJ92a7+TYWvAmsprxYtCa8afd2vLn3hrzZXqa86WiGvSk8Vr0595a9SU5GvYlPlr25bRa9+femvrn3xr7J97a++ffmvzn31sCJ+BbA+OgWwRlq9sE5+CbBSfg2wXi0NsG5+EbCOfhmwkn4VsNJCFbDeVWGw4iWlsPpTDbECS82xBj2BsQouBbE6UxGxQjqxsVZ+IbFeKvmxaiZhsXZPwbF6fh2xfjV1sYJJybGKfiWxon5Fsap+KbHCRv2xyi4Jsc5+SbHqMiGx9i0Rsfp+QbIGfjmyCn4tsg5eAbIiSvmyMk9dsjZ+MbJCflGySn5Nsk4xCbJaJq2yZjblsmp+NbJufj2yhlnZsopHybKuWl2yun5xssZ+dbLOJzWy4laZsuZb7bLqfn2y7jqFsvI/AbL2fmGy+n55sv4mIbMGLtWzEn5VsxZ+abMmQ8mzKlJFszJTlbNOfl2zVlkBs15+ZbNmfomzbn6Bs3Z+bbOGWQWzilGds44uDbOWTRGzoko1s6p+jbO+foWzwkdds8Z+WbPOJam0Ll21tDJ+ubRKfrW0XkPRtGZ+qbRuXjG0ek7RtH5+kbSWSw20piWttKo1ebSufp20yj0ZtM5+sbTWfq202n6ZtOJ+pbTuKiG09n6htPpRobUGXrG1Ej/JtRZDzbVmftG1an7JtXJVsbWOfr21kn7FtZolZbWmNX21qmFFtbIpcbW6Vgm10l4Ftd4pDbXiQWm15n7NthZ+4bYiPwW2Ml09tjp+1bZOfsG2Vn7ZtmZfcbZuTk22ck8Btr4pVbbKJdG21n7xtuJ+/bbyXwW3Al4RtxZ/GbcafwG3Hn71ty5fS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hWmToIVqlZOFbeVKhXflUIV+5VGFgOVEhYSUloWH5U6FiOVGhYrlSIWQ5VKFkeVHhZTlS4WXiZKFmZPjhZvlTIWc5U+FpOVFhaaRRYWo5UmFqY5GhaqQZIWrjE+FrJbyha6W94Wvj5KFueVWhbrlVIXBmG2FyeVThc2XlYXP5VWF0OVXhdXlWIXc5VuF3eVZheSToYXl5VqF6ZTLherlTYX3j5OF+eVchfrlYYX7kZSF/uVghgLlQYYG5WKGB5FohgrlXYYL5V+GE+VehhafUIYXn0GGGuVkhiLlY4Ytl5aGL+G6hjDlZYY/5WaGTeVnhk6M1YZQi3OGVOVphlWZfIZai5WGXJe4hl6L8YZf5WqGZ+VrhmuSjoZx5WyGeZP4hnuIuIaKieGGi+VxhozlcoaT5W2GlY5chqPlboaklGGGqeVvhqrlcIar5XqGr+V0hrDld4a25XOGxOV1hsbldobHjtaGyeV4hsuSYIbNjHWGzophhtTle4bZil6G2+WBht7lfIbf5YCG5JS4hunlfYbs5X6G7ZVnhu6U2Ibv5YKG+JH7hvnljIb75YiG/onphwDlhocClkmHA+WHhwblhIcI5YWHCeWKhwrljYcN5YuHEeWJhxLlg4cYkneHGuWUhxyWqIcl5ZKHKeWThzTljoc35ZCHO+WRhz/lj4dJkOSHS5hYh0zlmIdO5ZmHU+Wfh1WQSYdX5ZuHWeWeh1/llodg5ZWHY+Wgh2aJ2odo5ZyHauWhh27lnYd05ZqHdpKxh3jll4d/lIiHguWlh42XWoef5aSHouWjh6vlrIev5aaHs+Wuh7qXhoe75bGHveWoh8DlqYfE5a2HxuWwh8flr4fL5aeH0OWqh9Llu4fg5bSH7+Wyh/Lls4f25biH9+W5h/mKSYf7i2GH/uW3iAXloogN5baIDuW6iA/ltYgR5byIFeW+iBblvYgh5cCIIuW/iCPleYgn5cSIMeXBiDblwog55cOIO+XFiECMjIhC5ceIROXGiEaPT4hMjXOITZ+liFLlyIhTj3CIV4pYiFnlyYhbiXGIXY/ViF7lyohhjXSIYuXLiGOI34holVyIa+XMiHCQiohy5dOIdeXQiHeSj4h95dGIfuXOiH+L3IiB5c2IguXUiIiMVYiLkdyIjeXaiJLl1oiWkbOIl+XViJnl2Iie5c+IouXZiKTl24irlO2IruXX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ljKWaJY7kWqWP4iilkCRyZZC6JiWRJWNlkvom5ZM6JmWTY1+lk/ompZQjMCWW5XDllzonZZd6J+WXuiell/ooJZiiUCWY5B3lmSPnJZliteWZuihlmqUhpZs6KOWcIlBlnLoopZzksKWdZfLlnaTqZZ36JyWeJeklnqMr5Z9l3qWhYv3loaXspaIjEeWipHglovkQJaN6KSWjopLlo+Qj5aUinWWleimlpfop5aY6KWWmYyElpuN25acj+GWoIlClqOX15an6KmWqOeslqroqJaw6KyWseiqlrLoq5a06K2WtuiulreX6pa46K+WueiwlruQx5a8lLmWwJCdlsGK5ZbEl1mWxYnrlsaPV5bHjNmWyeizlsvospbMjpOWzei0ls7osZbRjkeW1ei4ltblq5bZmdSW25CXltzotpbil6OW45PvluiJSpbqkOGW6460lvCVtZbyiV+W9pfrlveXi5b56LmW+5NklwCO+ZcE6LqXBui7lweQa5cI6LyXCpfslw3ot5cO6L6XD+jAlxHov5cT6L2XFujBlxnowpcckZqXHonglyTow5cnlraXKujElzDoxZcymEmXOJ5Qlznoxpc96MeXPujIl0LozJdE6MmXRujKl0joy5dJ6M2XUpDCl1aW9ZdZkMOXXOjOl16U8Zdg6M+XYepyl2KWypdk6NCXZujRl2jo0pdpinaXa+jUl22QeJdx6NWXdIxDl3no1pd66NqXfOjYl4Ho2ZeEipOXhejXl4bo25eL6NyXjYjGl4/o3ZeQ6N6XmI/il5zo35egi2aXo+jil6bo4Zeo6OCXq+aRl62V2pez6OOXtOjkl8Po5ZfG6OaXyOjnl8vo6JfTitiX3Ojpl+3o6pfulEKX8ujsl/OJuZf16O+X9ujul/uJQ5f/i7+YAZXFmAKSuJgDjaCYBY2AmAaPh5gIkHuYDOjxmA/o8JgQl2GYEYrmmBKU0JgTk9qYF5CcmBiXzJgajHqYIej0mCTo85gslmqYLZOqmDSJb5g36PWYOOjymDuVcJg8l4qYPej2mEbo95hL6PmYTJHomE2KephOinuYT+j4mFSK55hVjLCYWIromFuTXphel96YZ4zamGvo+phv6PuYcOj8mHHpQJhz6UKYdOlBmKiVl5iq6UOYr+lEmLHpRZi26UaYw+lImMTpR5jG6UmY25TymNzjypjfkEiY4otRmOnpSpjr6UuY7ZmqmO6fWpjvlNGY8oj5mPSIuZj8jpSY/ZZPmP6P/JkD6UyZBZbdmQnpTZkKl3uZDIlhmRCOYJkS6U6ZE4nsmRTpT5kY6VCZHelSmR7pU5kg6VWZIelRmSTpVJkoitmZLOlWmS7pV5k96ViZPulZmULpWplF6VyZSelbmUvpXplM6WGZUOldmVHpX5lS6WCZVelimVeLwJmWjvGZl+ljmZjpZJmZjYGZpellmaiKXZmslG6Zrelmma7pZ5mzknmZtJPpmbzpaJnBlJ2ZxJHKmcWJd5nGi+yZyIvtmdCSk5nR6W2Z0ovumdWJ7ZnY6WyZ2+lqmd3pa5nf6WmZ4ul3me3pbpnu6W+Z8elwmfLpcZn46XOZ++lymf+PeJoB6XSaBel2mg6LUpoP6XWaEpGbmhOMsZoZ6XiaKJHLmivpeZowk6uaN+l6mj7pgJpA6X2aQul8mkPpfppF6XuaTemCmlXpgZpX6YSaWovBmlvpg5pf6YWaYumGmmTpiJpl6YeaaemJmmrpi5pr6YqaqI2cmq3pjJqw6Y2auIpbmrzpjprA6Y+axJCRms/pkJrR6ZGa0+mSmtTpk5rYjYKa3umUmt/plZri6Zaa4+mXmubpmJrqlK+a6+mamu2VRZru6Zua7+mZmvHpnZr06Zya9+memvvpn5sG6aCbGOmhmxrpopsf6aObIumkmyPppZsl6aabJ+mnmyjpqJsp6ambKumqmy7pq5sv6aybMZ9UmzLprZs74vabPItTm0GKQJtCjbCbQ+mvm0TprptFlqObTemxm07psptP6bCbUemzm1SWgptY6bSbWoubm2+YRJt06bWbg+m3m46IvJuR6bibkpWpm5PptpuW6bmbl+m6m5/pu5ug6bybqOm9m6qWjpurjkybrY34m66RTpu06b6buenBm8Dpv5vG6cKbyYzvm8rpwJvP6cOb0enEm9LpxZvU6cmb1o5Jm9uR4pvh6cqb4unHm+Ppxpvk6cib6Ix+m/Dpzpvx6c2b8unMm/WIsZwE6dicBunUnAjp1ZwJ6dGcCunXnAzp05wNioKcEJhrnBLp1pwT6dKcFOnQnBXpz5wb6dqcIendnCTp3Jwl6ducLZVonC7p2ZwviPGcMOnenDLp4Jw5io+cOunLnDuJVpw+6eKcRunhnEfp35xIkkycUpaQnFeX2Jxa6eOcYOnknGfp5Zx26eaceOnnnOWSuZzn6eic6ZS1nOvp7Zzs6emc8OnqnPOWUJz0lsKc9pPOnQPp7p0G6e+dB5O8nQjp7J0J6eudDomonRLp950V6fadG4mVnR/p9J0j6fOdJunxnSiKm50q6fCdK46wnSyJp507jYOdPun6nT/p+Z1B6fidROn1nUbp+51I6fydUOpEnVHqQ51Z6kWdXIlMnV3qQJ1e6kGdYI2UnWGWt51k6kKdbJZRnW/qSp1y6kadeupLnYfqSJ2J6kedj4x7nZrqTJ2k6k2dqepOnavqSZ2v6fKdsupPnbSS35246lOduupUnbvqUp3B6lGdwupXncTqUJ3G6lWdz+pWndPqWZ3Z6lid5upbne3qXJ3v6l2d8phonfjqWp35kemd+o3rnf3qXp4a6l+eG+pgnh7qYZ516mKeeIyynnnqY5596mSef46tnoHqZZ6I6maei+pnnozqaJ6R6muekuppnpOYW56V6mqel5ftnp3qbJ6fl9mepeptnqaUnp6p6m6equpwnq3qcZ646m+euY2NnrqWy567loOevJv1nr6fgJ6/lpuexImpnszqc57Ni2+ezup0ns/qdZ7Q6nae0o2VntTqd57Y4NKe2ZbZntuR4Z7c6nie3ep6nt7qeZ7g6nue5ep8nujqfZ7v6n6e9OqAnvbqgZ736oKe+eqDnvvqhJ786oWe/eqGnwfqh58I6oifDpNDnxOM258V6oqfIJFsnyHqi58s6oyfO5VAnz7qjZ9K6o6fS+JWn07m2J9P6OufUuqPn1TqkJ9f6pKfYOqTn2HqlJ9il+6fY+qRn2bqlZ9n6pafauqYn2zql59y6pqfduqbn3fqmZ+Nl7Sfleqcn5zqnZ+d4nOfoOqe/wGBSf8DgZT/BIGQ/wWBk/8GgZX/CIFp/wmBav8KgZb/C4F7/wyBQ/8OgUT/D4Fe/xCCT/8RglD/EoJR/xOCUv8UglP/FYJU/xaCVf8Xglb/GIJX/xmCWP8agUb/G4FH/xyBg/8dgYH/HoGE/x+BSP8ggZf/IYJg/yKCYf8jgmL/JIJj/yWCZP8mgmX/J4Jm/yiCZ/8pgmj/KoJp/yuCav8sgmv/LYJs/y6Cbf8vgm7/MIJv/zGCcP8ygnH/M4Jy/zSCc/81gnT/NoJ1/zeCdv84gnf/OYJ4/zqCef87gW3/PIFf/z2Bbv8+gU//P4FR/0CBTf9BgoH/QoKC/0OCg/9EgoT/RYKF/0aChv9Hgof/SIKI/0mCif9Kgor/S4KL/0yCjP9Ngo3/ToKO/0+Cj/9QgpD/UYKR/1KCkv9TgpP/VIKU/1WClf9Wgpb/V4KX/1iCmP9Zgpn/WoKa/1uBb/9cgWL/XYFw/2EAof9iAKL/YwCj/2QApP9lAKX/ZgCm/2cAp/9oAKj/aQCp/2oAqv9rAKv/bACs/20Arf9uAK7/bwCv/3AAsP9xALH/cgCy/3MAs/90ALT/dQC1/3YAtv93ALf/eAC4/3kAuf96ALr/ewC7/3wAvP99AL3/fgC+/38Av/+AAMD/gQDB/4IAwv+DAMP/hADE/4UAxf+GAMb/hwDH/4gAyP+JAMn/igDK/4sAy/+MAMz/jQDN/44Azv+PAM//kADQ/5EA0f+SANL/kwDT/5QA1P+VANX/lgDW/5cA1/+YANj/mQDZ/5oA2v+bANv/nADc/50A3f+eAN7/nwDf/+OBUP/lgY8=";
	var SJIS_COUNT = 7070;
	var base64DecodeInputStream = function (str) {

		var _str = str;
		var _pos = 0;
		var _buffer = 0;
		var _buflen = 0;

		var _this = {};

		_this.read = function () {

			while (_buflen < 8) {

				if (_pos >= _str.length) {
					if (_buflen == 0) {
						return -1;
					}
					throw 'unexpected end of file./' + _buflen;
				}

				var c = _str.charAt(_pos);
				_pos += 1;

				if (c == '=') {
					_buflen = 0;
					return -1;
				} else if (c.match(/^\s$/)) {
					// ignore if whitespace.
					continue;
				}

				_buffer = (_buffer << 6) | decode(c.charCodeAt(0));
				_buflen += 6;
			}

			var n = (_buffer >>> (_buflen - 8)) & 0xff;
			_buflen -= 8;
			return n;
		};

		var decode = function (c) {
			if (0x41 <= c && c <= 0x5a) {
				return c - 0x41;
			} else if (0x61 <= c && c <= 0x7a) {
				return c - 0x61 + 26;
			} else if (0x30 <= c && c <= 0x39) {
				return c - 0x30 + 52;
			} else if (c == 0x2b) {
				return 62;
			} else if (c == 0x2f) {
				return 63;
			} else {
				throw 'c:' + c;
			}
		};

		return _this;
	};

	var createStringToBytes = function (unicodeData, numChars) {

		// create conversion map.

		var unicodeMap = function () {

			var bin = base64DecodeInputStream(unicodeData);
			var read = function () {
				var b = bin.read();
				if (b == -1) throw 'eof';
				return b;
			};

			var count = 0;
			var unicodeMap = {};
			while (true) {
				var b0 = bin.read();
				if (b0 == -1) break;
				var b1 = read();
				var b2 = read();
				var b3 = read();
				var k = String.fromCharCode((b0 << 8) | b1);
				var v = (b2 << 8) | b3;
				unicodeMap[k] = v;
				count += 1;
			}
			if (count != numChars) {
				throw count + ' != ' + numChars;
			}

			return unicodeMap;
		}();

		var unknownChar = '?'.charCodeAt(0);

		return function (s) {
			var bytes = [];
			for (var i = 0; i < s.length; i += 1) {
				var c = s.charCodeAt(i);
				if (c < 128) {
					bytes.push(c);
				} else {
					var b = unicodeMap[s.charAt(i)];
					if (typeof b == 'number') {
						if ((b & 0xff) == b) {
							// 1byte
							bytes.push(b);
						} else {
							// 2bytes
							bytes.push(b >>> 8);
							bytes.push(b & 0xff);
						}
					} else {
						bytes.push(unknownChar);
					}
				}
			}
			return bytes;
		};
	};

	var SJIS = createStringToBytes(SJIS_BASE64,SJIS_COUNT);

	var sjis = SJIS;

	var QR_MODE$3 = 1 << 3;
	var qrKanji = function (stringToBytes) {
		stringToBytes = typeof stringToBytes == 'function' ? stringToBytes : sjis;
		// !function (c, code) {
		// 	// self test for sjis support.
		// 	var test = stringToBytes(c);
		// 	if (test.length != 2 || ((test[0] << 8) | test[1]) != code) {
		// 		throw 'sjis not supported.';
		// 	}
		// }('\u53cb', 0x9746);
		return function (data) {
			var _bytes = stringToBytes(data);
			var _this = {};

			_this.getMode = function () {
				return QR_MODE$3;
			};

			_this.getLength = function (buffer) {
				return ~~(_bytes.length / 2);
			};

			_this.write = function (buffer) {
				var data = _bytes;
				var i = 0;

				while (i + 1 < data.length) {
					var c = ((0xff & data[i]) << 8) | (0xff & data[i + 1]);
					if (0x8140 <= c && c <= 0x9FFC) {
						c -= 0x8140;
					} else if (0xE040 <= c && c <= 0xEBBF) {
						c -= 0xC140;
					} else {
						throw 'illegal char at ' + (i + 1) + '/' + c;
					}
					c = ((c >>> 8) & 0xff) * 0xC0 + (c & 0xff);
					buffer.put(c, 13);
					i += 2;
				}

				if (i < data.length) {
					throw 'illegal char at ' + (i + 1);
				}
			};

			return _this;
		};
	};

	var Kanji = qrKanji;

	var QRMode = {
		MODE_NUMBER: 1 << 0,
		MODE_ALPHA_NUM: 1 << 1,
		MODE_8BIT_BYTE: 1 << 2,
		MODE_KANJI: 1 << 3
	};

	var QRErrorCorrectionLevel = {
		L: 1,
		M: 0,
		Q: 3,
		H: 2
	};

	var QRMaskPattern = {
		PATTERN000: 0,
		PATTERN001: 1,
		PATTERN010: 2,
		PATTERN011: 3,
		PATTERN100: 4,
		PATTERN101: 5,
		PATTERN110: 6,
		PATTERN111: 7
	};

	// 获取掩模函数
	var getQRMaskFunction = (function () {
		var QRMaskFunctions = [
			function (i, j) {
				return (i + j) % 2 == 0;
			},
			function (i, j) {
				return i % 2 == 0;
			},
			function (i, j) {
				return j % 3 == 0;
			},
			function (i, j) {
				return (i + j) % 3 == 0;
			},
			function (i, j) {
				return (Math.floor(i / 2) + Math.floor(j / 3)) % 2 == 0;
			},
			function (i, j) {
				return (i * j) % 2 + (i * j) % 3 == 0;
			},
			function (i, j) {
				return ((i * j) % 2 + (i * j) % 3) % 2 == 0;
			},
			function (i, j) {
				return ((i * j) % 3 + (i + j) % 2) % 2 == 0;
			}
		];
		return function (maskPattern) {
			var fn = QRMaskFunctions[maskPattern];
			if (!fn) throw new Error('maskPattern:' + maskPattern);
			return fn;
		}
	}());

	// 获取数据块长度
	var getLengthInBits = (function () {
		// 各模式数据块长度
		var BITS_LENGTH_LIST = {};
		BITS_LENGTH_LIST[QRMode.MODE_NUMBER] = [10, 12, 14];
		BITS_LENGTH_LIST[QRMode.MODE_ALPHA_NUM] = [9, 11, 13];
		BITS_LENGTH_LIST[QRMode.MODE_8BIT_BYTE] = [8, 16, 16];
		BITS_LENGTH_LIST[QRMode.MODE_KANJI] = [8, 10, 12];

		return function (mode, type) {
			if (1 <= type && type <= 40) {
				var lengths = BITS_LENGTH_LIST[mode];
				if (!lengths) throw 'mode:' + mode;
				var index = type <= 9 ? 0 :
					type <= 26 ? 1 :
						2;
				return lengths[index];
			} else {
				throw new Error('type:' + type);
			}
		}
	}());

	// 通过矩阵获取,版本
	var map2typeNumber = function (map) {
		return (map.length - 17) / 4;
	};

	var G15 = (1 << 10) | (1 << 8) | (1 << 5) | (1 << 4) | (1 << 2) | (1 << 1) | (1 << 0);
	var G18 = (1 << 12) | (1 << 11) | (1 << 10) | (1 << 9) | (1 << 8) | (1 << 5) | (1 << 2) | (1 << 0);
	var G15_MASK = (1 << 14) | (1 << 12) | (1 << 10) | (1 << 4) | (1 << 1);

	var getBCHDigit = function (data) {
		var digit = 0;
		while (data != 0) {
			digit++;
			data >>>= 1;
		}
		return digit;
	};

	var getBCHTypeInfo = function (data) {
		var d = data << 10;
		while (getBCHDigit(d) - getBCHDigit(G15) >= 0) {
			d ^= (G15 << (getBCHDigit(d) - getBCHDigit(G15)));
		}
		return ((data << 10) | d) ^ G15_MASK;
	};

	var getBCHTypeNumber = function (data) {
		var d = data << 12;
		while (getBCHDigit(d) - getBCHDigit(G18) >= 0) {
			d ^= (G18 << (getBCHDigit(d) - getBCHDigit(G18)));
		}
		return (data << 12) | d;
	};

	// 模拟Buffer
	var qrBitBuffer = function () {

		var _buffer = [];
		var _length = 0;
		var _this = {};

		_this.getBuffer = function () {
			return _buffer;
		};

		_this.getAt = function (index) {
			var bufIndex = ~~(index / 8);
			var bitIndex = 7 - index % 8;
			return ((_buffer[bufIndex] >>> bitIndex) & 1) === 1;
		};

		_this.put = function (num, length) {
			length = ~~length;
			if (length < 0) throw new Error('length:' + length)
			while (length--) {
				_this.putBit(((num >>> length) & 1) === 1);
			}
		};

		_this.getLengthInBits = function () {
			return _length;
		};

		_this.putBit = function (bit) {
			var bufIndex = ~~(_length / 8);
			if (_buffer.length <= bufIndex) {
				_buffer.push(0);
			}
			if (bit) {
				_buffer[bufIndex] |= (0x80 >>> (_length % 8));
			}
			_length += 1;
		};

		return _this;
	};

	// 填充侦测图
	var setupPositionProbePattern = function (map, row, col) {
		// var mapLength = map.length;
		// for (var r = -1; r <= 7; r++) {
		// 	if (row + r <= -1 || mapLength <= row + r) continue;
		// 	for (var c = -1; c <= 7; c++) {
		// 		if (col + c <= -1 || mapLength <= col + c) continue;
		// 		if ((0 <= r && r <= 6 && (c == 0 || c == 6)) ||
		// 			(0 <= c && c <= 6 && (r == 0 || r == 6)) ||
		// 			(2 <= r && r <= 4 && 2 <= c && c <= 4)) {
		// 			map[row + r][col + c] = true;
		// 		} else {
		// 			map[row + r][col + c] = false;
		// 		}
		// 	}
		// }
		square_wk(map, row - 1, col - 1, false, 7 + 2);
		square_wk(map, row, col, true, 7);
		square_wk(map, row + 1, col + 1, false, 7 - 2);
		square_fill(map, row + 2, col + 2, true, 3);
	};

	//画正方型
	var square_wk = function (map, row, col, val, L) {
		var mapLength = map.length;
		function w(x, y) {
			var l = L;
			while (--l) {
				row += x, col += y;
				if (row < 0 || col < 0 || row >= mapLength || col >= mapLength) continue;
				map[row][col] = val;
			}
		}
		if (L < 0) return;
		(row < 0 || col < 0 || row >= mapLength || col >= mapLength) || (map[row][col] = val);
		if (L > 1) {
			w(1, 0), w(0, 1), w(-1, 0), w(0, -1);
		}
	};

	//填充正方型
	var square_fill = function (map, row, col, val, L) {
		while (L > 0) {
			square_wk(map, row++, col++, val, L);
			L -= 2;
		}
	};

	// 填充所有侦测图
	var setupAllPositionProbePattern = function (map) {
		var mapLength = map.length;
		setupPositionProbePattern(map, 0, 0);
		setupPositionProbePattern(map, mapLength - 7, 0);
		setupPositionProbePattern(map, 0, mapLength - 7);
	};

	// 填充校正图
	var setupPositionAdjustPattern = (function () {
		var PATTERN_POSITION_TABLE = [
			[],
			[6, 18],
			[6, 22],
			[6, 26],
			[6, 30],
			[6, 34],
			[6, 22, 38],
			[6, 24, 42],
			[6, 26, 46],
			[6, 28, 50],
			[6, 30, 54],
			[6, 32, 58],
			[6, 34, 62],
			[6, 26, 46, 66],
			[6, 26, 48, 70],
			[6, 26, 50, 74],
			[6, 30, 54, 78],
			[6, 30, 56, 82],
			[6, 30, 58, 86],
			[6, 34, 62, 90],
			[6, 28, 50, 72, 94],
			[6, 26, 50, 74, 98],
			[6, 30, 54, 78, 102],
			[6, 28, 54, 80, 106],
			[6, 32, 58, 84, 110],
			[6, 30, 58, 86, 114],
			[6, 34, 62, 90, 118],
			[6, 26, 50, 74, 98, 122],
			[6, 30, 54, 78, 102, 126],
			[6, 26, 52, 78, 104, 130],
			[6, 30, 56, 82, 108, 134],
			[6, 34, 60, 86, 112, 138],
			[6, 30, 58, 86, 114, 142],
			[6, 34, 62, 90, 118, 146],
			[6, 30, 54, 78, 102, 126, 150],
			[6, 24, 50, 76, 102, 128, 154],
			[6, 28, 54, 80, 106, 132, 158],
			[6, 32, 58, 84, 110, 136, 162],
			[6, 26, 54, 82, 110, 138, 166],
			[6, 30, 58, 86, 114, 142, 170]
		];
		return function (map, typeNumber) {
			typeNumber = typeNumber || map2typeNumber(map);
			var pos = PATTERN_POSITION_TABLE[typeNumber - 1];
			for (var i = 0; i < pos.length; i++) {
				for (var j = 0; j < pos.length; j++) {
					var row = pos[i];
					var col = pos[j];
					if (map[row][col] != null) continue;
					for (var r = -2; r <= 2; r++) {
						for (var c = -2; c <= 2; c++) {
							if (r == -2 || r == 2 || c == -2 || c == 2 ||
								(r == 0 && c == 0)) {
								map[row + r][col + c] = true;
							} else {
								map[row + r][col + c] = false;
							}
						}
					}
				}
			}
		}
	}());

	// 填充定位图
	var setupTimingPattern = function (map) {
		var mapLength = map.length;
		for (var r = 8; r < mapLength - 8; r += 1) {
			if (map[r][6] != null) {
				continue;
			}
			map[r][6] = (r % 2 == 0);
		}
		for (var c = 8; c < mapLength - 8; c += 1) {
			if (map[6][c] != null) {
				continue;
			}
			map[6][c] = (c % 2 == 0);
		}
	};

	// 填充格式信息
	var setupTypeInfo = function (map, test, errorCorrectionLevel, maskPattern) {
		var mapLength = map.length;
		var data = (errorCorrectionLevel << 3) | maskPattern;
		var bits = getBCHTypeInfo(data);
		// vertical
		for (var i = 0; i < 15; i += 1) {
			var mod = (!test && ((bits >> i) & 1) == 1);
			if (i < 6) {
				map[i][8] = mod;
			} else if (i < 8) {
				map[i + 1][8] = mod;
			} else {
				map[mapLength - 15 + i][8] = mod;
			}
		}

		// horizontal
		for (var i = 0; i < 15; i += 1) {
			var mod = (!test && ((bits >> i) & 1) == 1);
			if (i < 8) {
				map[8][mapLength - i - 1] = mod;
			} else if (i < 9) {
				map[8][15 - i - 1 + 1] = mod;
			} else {
				map[8][15 - i - 1] = mod;
			}
		}

		// fixed module
		map[mapLength - 8][8] = (!test);
	};

	// 填充版本信息
	var setupTypeNumber = function (map, test, typeNumber) {
		typeNumber = typeNumber || map2typeNumber(map);
		var mapLength = map.length;
		var bits = getBCHTypeNumber(typeNumber);
		for (var i = 0; i < 18; i += 1) {
			var mod = (!test && ((bits >> i) & 1) == 1);
			map[Math.floor(i / 3)][i % 3 + mapLength - 8 - 3] = mod;
		}
		for (var i = 0; i < 18; i += 1) {
			var mod = (!test && ((bits >> i) & 1) == 1);
			map[i % 3 + mapLength - 8 - 3][Math.floor(i / 3)] = mod;
		}
	};

	// 生成空矩阵
	function mapInit(size) {
		try{
			var map = [],
				emptyArr = [];
			emptyArr.length = size;
			while (size--) {
				map.push(emptyArr.slice(0));
			}
			return map;
			
		}catch(e){
			console.log(size);
		}
	}

	// 拷贝矩阵
	function copyMap(map) {
		return map.map(function (v) {
			return v.slice(0);
		})
	}

	function compareMap(map, map1, type) {
		type = type || "and";
		var nMap = [];
		var fn = function () {
			switch (type) {
				case 'or':
				case '|':
					return function (r, c) { 
						var a = map[r][c],b = map1[r][c];
						if(a || b){return true}
						if(a === false || b === false){return false}
						// return map[r][c] || map1[r][c]; 
					}
				case 'xor':
				case '^':
					return function (r, c) {
						var a = map[r][c],b = map1[r][c];
						if(a !== b){ return a || b}	
						// return !map[r][c] != !map1[r][c]; 
					}
				case 'and':
				case '&':
					return function (r, c) {
						var a = map[r][c],b = map1[r][c];
						if(a && b){return true}
						if(a === false && b === false){return false}
						// return map[r][c] && map1[r][c]; 
					}
				default:
					throw 'type err!'
			}
		}();
		for (var r = 0; r < map.length; r++) {
			nMap[r] = [];
			for (var c = 0; c < map.length; c++) {
				nMap[r][c] = fn(r, c);
			}
		}
		return nMap;
	}

	// 获取数据块信息
	var getRSBlocks = (function () {
		var RS_BLOCK_TABLE = [

			// L
			// M
			// Q
			// H

			// 1
			[1, 26, 19],
			[1, 26, 16],
			[1, 26, 13],
			[1, 26, 9],

			// 2
			[1, 44, 34],
			[1, 44, 28],
			[1, 44, 22],
			[1, 44, 16],

			// 3
			[1, 70, 55],
			[1, 70, 44],
			[2, 35, 17],
			[2, 35, 13],

			// 4
			[1, 100, 80],
			[2, 50, 32],
			[2, 50, 24],
			[4, 25, 9],

			// 5
			[1, 134, 108],
			[2, 67, 43],
			[2, 33, 15, 2, 34, 16],
			[2, 33, 11, 2, 34, 12],

			// 6
			[2, 86, 68],
			[4, 43, 27],
			[4, 43, 19],
			[4, 43, 15],

			// 7
			[2, 98, 78],
			[4, 49, 31],
			[2, 32, 14, 4, 33, 15],
			[4, 39, 13, 1, 40, 14],

			// 8
			[2, 121, 97],
			[2, 60, 38, 2, 61, 39],
			[4, 40, 18, 2, 41, 19],
			[4, 40, 14, 2, 41, 15],

			// 9
			[2, 146, 116],
			[3, 58, 36, 2, 59, 37],
			[4, 36, 16, 4, 37, 17],
			[4, 36, 12, 4, 37, 13],

			// 10
			[2, 86, 68, 2, 87, 69],
			[4, 69, 43, 1, 70, 44],
			[6, 43, 19, 2, 44, 20],
			[6, 43, 15, 2, 44, 16],

			// 11
			[4, 101, 81],
			[1, 80, 50, 4, 81, 51],
			[4, 50, 22, 4, 51, 23],
			[3, 36, 12, 8, 37, 13],

			// 12
			[2, 116, 92, 2, 117, 93],
			[6, 58, 36, 2, 59, 37],
			[4, 46, 20, 6, 47, 21],
			[7, 42, 14, 4, 43, 15],

			// 13
			[4, 133, 107],
			[8, 59, 37, 1, 60, 38],
			[8, 44, 20, 4, 45, 21],
			[12, 33, 11, 4, 34, 12],

			// 14
			[3, 145, 115, 1, 146, 116],
			[4, 64, 40, 5, 65, 41],
			[11, 36, 16, 5, 37, 17],
			[11, 36, 12, 5, 37, 13],

			// 15
			[5, 109, 87, 1, 110, 88],
			[5, 65, 41, 5, 66, 42],
			[5, 54, 24, 7, 55, 25],
			[11, 36, 12, 7, 37, 13],

			// 16
			[5, 122, 98, 1, 123, 99],
			[7, 73, 45, 3, 74, 46],
			[15, 43, 19, 2, 44, 20],
			[3, 45, 15, 13, 46, 16],

			// 17
			[1, 135, 107, 5, 136, 108],
			[10, 74, 46, 1, 75, 47],
			[1, 50, 22, 15, 51, 23],
			[2, 42, 14, 17, 43, 15],

			// 18
			[5, 150, 120, 1, 151, 121],
			[9, 69, 43, 4, 70, 44],
			[17, 50, 22, 1, 51, 23],
			[2, 42, 14, 19, 43, 15],

			// 19
			[3, 141, 113, 4, 142, 114],
			[3, 70, 44, 11, 71, 45],
			[17, 47, 21, 4, 48, 22],
			[9, 39, 13, 16, 40, 14],

			// 20
			[3, 135, 107, 5, 136, 108],
			[3, 67, 41, 13, 68, 42],
			[15, 54, 24, 5, 55, 25],
			[15, 43, 15, 10, 44, 16],

			// 21
			[4, 144, 116, 4, 145, 117],
			[17, 68, 42],
			[17, 50, 22, 6, 51, 23],
			[19, 46, 16, 6, 47, 17],

			// 22
			[2, 139, 111, 7, 140, 112],
			[17, 74, 46],
			[7, 54, 24, 16, 55, 25],
			[34, 37, 13],

			// 23
			[4, 151, 121, 5, 152, 122],
			[4, 75, 47, 14, 76, 48],
			[11, 54, 24, 14, 55, 25],
			[16, 45, 15, 14, 46, 16],

			// 24
			[6, 147, 117, 4, 148, 118],
			[6, 73, 45, 14, 74, 46],
			[11, 54, 24, 16, 55, 25],
			[30, 46, 16, 2, 47, 17],

			// 25
			[8, 132, 106, 4, 133, 107],
			[8, 75, 47, 13, 76, 48],
			[7, 54, 24, 22, 55, 25],
			[22, 45, 15, 13, 46, 16],

			// 26
			[10, 142, 114, 2, 143, 115],
			[19, 74, 46, 4, 75, 47],
			[28, 50, 22, 6, 51, 23],
			[33, 46, 16, 4, 47, 17],

			// 27
			[8, 152, 122, 4, 153, 123],
			[22, 73, 45, 3, 74, 46],
			[8, 53, 23, 26, 54, 24],
			[12, 45, 15, 28, 46, 16],

			// 28
			[3, 147, 117, 10, 148, 118],
			[3, 73, 45, 23, 74, 46],
			[4, 54, 24, 31, 55, 25],
			[11, 45, 15, 31, 46, 16],

			// 29
			[7, 146, 116, 7, 147, 117],
			[21, 73, 45, 7, 74, 46],
			[1, 53, 23, 37, 54, 24],
			[19, 45, 15, 26, 46, 16],

			// 30
			[5, 145, 115, 10, 146, 116],
			[19, 75, 47, 10, 76, 48],
			[15, 54, 24, 25, 55, 25],
			[23, 45, 15, 25, 46, 16],

			// 31
			[13, 145, 115, 3, 146, 116],
			[2, 74, 46, 29, 75, 47],
			[42, 54, 24, 1, 55, 25],
			[23, 45, 15, 28, 46, 16],

			// 32
			[17, 145, 115],
			[10, 74, 46, 23, 75, 47],
			[10, 54, 24, 35, 55, 25],
			[19, 45, 15, 35, 46, 16],

			// 33
			[17, 145, 115, 1, 146, 116],
			[14, 74, 46, 21, 75, 47],
			[29, 54, 24, 19, 55, 25],
			[11, 45, 15, 46, 46, 16],

			// 34
			[13, 145, 115, 6, 146, 116],
			[14, 74, 46, 23, 75, 47],
			[44, 54, 24, 7, 55, 25],
			[59, 46, 16, 1, 47, 17],

			// 35
			[12, 151, 121, 7, 152, 122],
			[12, 75, 47, 26, 76, 48],
			[39, 54, 24, 14, 55, 25],
			[22, 45, 15, 41, 46, 16],

			// 36
			[6, 151, 121, 14, 152, 122],
			[6, 75, 47, 34, 76, 48],
			[46, 54, 24, 10, 55, 25],
			[2, 45, 15, 64, 46, 16],

			// 37
			[17, 152, 122, 4, 153, 123],
			[29, 74, 46, 14, 75, 47],
			[49, 54, 24, 10, 55, 25],
			[24, 45, 15, 46, 46, 16],

			// 38
			[4, 152, 122, 18, 153, 123],
			[13, 74, 46, 32, 75, 47],
			[48, 54, 24, 14, 55, 25],
			[42, 45, 15, 32, 46, 16],

			// 39
			[20, 147, 117, 4, 148, 118],
			[40, 75, 47, 7, 76, 48],
			[43, 54, 24, 22, 55, 25],
			[10, 45, 15, 67, 46, 16],

			// 40
			[19, 148, 118, 6, 149, 119],
			[18, 75, 47, 31, 76, 48],
			[34, 54, 24, 34, 55, 25],
			[20, 45, 15, 61, 46, 16]
		];

		var qrRSBlock = function (totalCount, dataCount) {
			return {
				"totalCount": totalCount,
				"dataCount": dataCount
			}
		};

		var getRsBlockTable = function (typeNumber, errorCorrectionLevel) {
			switch (errorCorrectionLevel) {
				case QRErrorCorrectionLevel.L:
					return RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 0];
				case QRErrorCorrectionLevel.M:
					return RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 1];
				case QRErrorCorrectionLevel.Q:
					return RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 2];
				case QRErrorCorrectionLevel.H:
					return RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 3];
				default:
					throw 'bad rs block @ typeNumber:' + typeNumber + '/errorCorrectionLevel:' + errorCorrectionLevel;
			}
		};

		return function (typeNumber, errorCorrectionLevel) {
			var rsBlock = getRsBlockTable(typeNumber, errorCorrectionLevel);
			var length = rsBlock.length / 3;
			var list = [];
			for (var i = 0; i < length; i += 1) {

				var count = rsBlock[i * 3 + 0];
				var totalCount = rsBlock[i * 3 + 1];
				var dataCount = rsBlock[i * 3 + 2];

				for (var j = 0; j < count; j += 1) {
					list.push(qrRSBlock(totalCount, dataCount));
				}
			}
			return list;
		};
	}());

	// 矩阵分布评分 (筛选最优掩模方案)
	var getLostPoint = function (map) {
		var moduleCount = map.length;
		var lostPoint = 0;
		var isDark = function (row, col) {
			return map[row][col];
		};

		// LEVEL1
		for (var row = 0; row < moduleCount; row += 1) {
			for (var col = 0; col < moduleCount; col += 1) {
				var sameCount = 0;
				var dark = isDark(row, col);
				for (var r = -1; r <= 1; r += 1) {
					if (row + r < 0 || moduleCount <= row + r) {
						continue;
					}
					for (var c = -1; c <= 1; c += 1) {
						if (col + c < 0 || moduleCount <= col + c) {
							continue;
						}
						if (r == 0 && c == 0) {
							continue;
						}
						if (dark == isDark(row + r, col + c)) {
							sameCount += 1;
						}
					}
				}
				if (sameCount > 5) {
					lostPoint += (3 + sameCount - 5);
				}
			}
		}
		// LEVEL2
		for (var row = 0; row < moduleCount - 1; row += 1) {
			for (var col = 0; col < moduleCount - 1; col += 1) {
				var count = 0;
				if (isDark(row, col)) count += 1;
				if (isDark(row + 1, col)) count += 1;
				if (isDark(row, col + 1)) count += 1;
				if (isDark(row + 1, col + 1)) count += 1;
				if (count == 0 || count == 4) {
					lostPoint += 3;
				}
			}
		}

		// LEVEL3
		for (var row = 0; row < moduleCount; row += 1) {
			for (var col = 0; col < moduleCount - 6; col += 1) {
				if (isDark(row, col) &&
					!isDark(row, col + 1) &&
					isDark(row, col + 2) &&
					isDark(row, col + 3) &&
					isDark(row, col + 4) &&
					!isDark(row, col + 5) &&
					isDark(row, col + 6)) {
					lostPoint += 40;
				}
			}
		}

		for (var col = 0; col < moduleCount; col += 1) {
			for (var row = 0; row < moduleCount - 6; row += 1) {
				if (isDark(row, col) &&
					!isDark(row + 1, col) &&
					isDark(row + 2, col) &&
					isDark(row + 3, col) &&
					isDark(row + 4, col) &&
					!isDark(row + 5, col) &&
					isDark(row + 6, col)) {
					lostPoint += 40;
				}
			}
		}

		// LEVEL4

		var darkCount = 0;

		for (var col = 0; col < moduleCount; col += 1) {
			for (var row = 0; row < moduleCount; row += 1) {
				if (isDark(row, col)) {
					darkCount += 1;
				}
			}
		}

		var ratio = Math.abs(100 * darkCount / moduleCount / moduleCount - 50) / 5;
		lostPoint += ratio * 10;

		return lostPoint;
	};

	var getErrorCorrectPolynomial = function (errorCorrectLength) {
		var a = qrPolynomial([1], 0);
		for (var i = 0; i < errorCorrectLength; i += 1) {
			a = a.multiply(qrPolynomial([1, QRMath.gexp(i)], 0));
		}
		return a;
	};

	var qrPolynomial = function (num, shift) {

		if (typeof num.length == 'undefined') {
			throw num.length + '/' + shift;
		}

		var _num = function () {
			var offset = 0;
			while (offset < num.length && num[offset] == 0) {
				offset += 1;
			}
			var _num = new Array(num.length - offset + shift);
			for (var i = 0; i < num.length - offset; i += 1) {
				_num[i] = num[i + offset];
			}
			return _num;
		}();

		var _this = {};

		_this.getAt = function (index) {
			return _num[index];
		};

		_this.getLength = function () {
			return _num.length;
		};

		_this.multiply = function (e) {

			var num = new Array(_this.getLength() + e.getLength() - 1);

			for (var i = 0; i < _this.getLength(); i += 1) {
				for (var j = 0; j < e.getLength(); j += 1) {
					num[i + j] ^= QRMath.gexp(QRMath.glog(_this.getAt(i)) + QRMath.glog(e.getAt(j)));
				}
			}

			return qrPolynomial(num, 0);
		};

		_this.mod = function (e) {

			if (_this.getLength() - e.getLength() < 0) {
				return _this;
			}

			var ratio = QRMath.glog(_this.getAt(0)) - QRMath.glog(e.getAt(0));

			var num = new Array(_this.getLength());
			for (var i = 0; i < _this.getLength(); i += 1) {
				num[i] = _this.getAt(i);
			}

			for (var i = 0; i < e.getLength(); i += 1) {
				num[i] ^= QRMath.gexp(QRMath.glog(e.getAt(i)) + ratio);
			}

			// recursive call
			return qrPolynomial(num, 0).mod(e);
		};

		return _this;
	};

	var QRMath = (function () {

		var EXP_TABLE = new Array(256);
		var LOG_TABLE = new Array(256);

		// initialize tables
		for (var i = 0; i < 8; i += 1) {
			EXP_TABLE[i] = 1 << i;
		}
		for (var i = 8; i < 256; i += 1) {
			EXP_TABLE[i] = EXP_TABLE[i - 4] ^
				EXP_TABLE[i - 5] ^
				EXP_TABLE[i - 6] ^
				EXP_TABLE[i - 8];
		}
		for (var i = 0; i < 255; i += 1) {
			LOG_TABLE[EXP_TABLE[i]] = i;
		}

		var _this = {};

		_this.glog = function (n) {

			if (n < 1) {
				throw 'glog(' + n + ')';
			}

			return LOG_TABLE[n];
		};

		_this.gexp = function (n) {

			while (n < 0) {
				n += 255;
			}

			while (n >= 256) {
				n -= 255;
			}

			return EXP_TABLE[n];
		};

		return _this;
	}());

	var createBytes = function (buffer, rsBlocks) {
		var offset = 0;
		var maxDcCount = 0;
		var maxEcCount = 0;

		var dcdata = new Array(rsBlocks.length);
		var ecdata = new Array(rsBlocks.length);

		for (var r = 0; r < rsBlocks.length; r += 1) {
			var dcCount = rsBlocks[r].dataCount;
			var ecCount = rsBlocks[r].totalCount - dcCount;

			maxDcCount = Math.max(maxDcCount, dcCount);
			maxEcCount = Math.max(maxEcCount, ecCount);

			dcdata[r] = new Array(dcCount);
			for (var i = 0; i < dcdata[r].length; i += 1) {
				dcdata[r][i] = 0xff & buffer.getBuffer()[i + offset];
			}
			offset += dcCount;

			var rsPoly = getErrorCorrectPolynomial(ecCount);
			var rawPoly = qrPolynomial(dcdata[r], rsPoly.getLength() - 1);

			var modPoly = rawPoly.mod(rsPoly);
			ecdata[r] = new Array(rsPoly.getLength() - 1);
			for (var i = 0; i < ecdata[r].length; i += 1) {
				var modIndex = i + modPoly.getLength() - ecdata[r].length;
				ecdata[r][i] = (modIndex >= 0) ? modPoly.getAt(modIndex) : 0;
			}
		}

		var totalCodeCount = 0;
		for (var i = 0; i < rsBlocks.length; i += 1) {
			totalCodeCount += rsBlocks[i].totalCount;
		}

		var data = new Array(totalCodeCount);
		var index = 0;

		for (var i = 0; i < maxDcCount; i += 1) {
			for (var r = 0; r < rsBlocks.length; r += 1) {
				if (i < dcdata[r].length) {
					data[index] = dcdata[r][i];
					index += 1;
				}
			}
		}

		for (var i = 0; i < maxEcCount; i += 1) {
			for (var r = 0; r < rsBlocks.length; r += 1) {
				if (i < ecdata[r].length) {
					data[index] = ecdata[r][i];
					index += 1;
				}
			}
		}

		return data;
	};

	var _createData = function (buffer, rsBlocks) {
		var PAD0 = 0xEC;
		var PAD1 = 0x11;

		// calc num max data.
		var totalDataCount = 0;
		for (var i = 0; i < rsBlocks.length; i += 1) {
			totalDataCount += rsBlocks[i].dataCount;
		}

		if (buffer.getLengthInBits() > totalDataCount * 8) {
			throw 'code length overflow. (' +
			buffer.getLengthInBits() +
			'>' +
			totalDataCount * 8 +
			')';
		}

		// end code
		if (buffer.getLengthInBits() + 4 <= totalDataCount * 8) {
			buffer.put(0, 4);
		}

		// padding
		while (buffer.getLengthInBits() % 8 != 0) {
			buffer.putBit(false);
		}

		// padding
		while (true) {

			if (buffer.getLengthInBits() >= totalDataCount * 8) {
				break;
			}
			buffer.put(PAD0, 8);

			if (buffer.getLengthInBits() >= totalDataCount * 8) {
				break;
			}
			buffer.put(PAD1, 8);
		}

		return createBytes(buffer, rsBlocks);
	};

	var createDataForBytes = function (typeNumber, errorCorrectionLevel, byteArray, mode) {
		var rsBlocks = getRSBlocks(typeNumber, errorCorrectionLevel);
		var buffer = qrBitBuffer();
		var data = byteArray;
		buffer.put(mode, 4);
		buffer.put(data.length, getLengthInBits(mode, typeNumber));
		for (var i = 0; i < data.length; i++) {
			buffer.put(data[i], 8);
		}
		return _createData(buffer, rsBlocks);
	};

	var createDataForModes = function (typeNumber, errorCorrectionLevel, dataList) {
		var rsBlocks = getRSBlocks(typeNumber, errorCorrectionLevel);
		var buffer = qrBitBuffer();
		for (var i = 0; i < dataList.length; i += 1) {
			var data = dataList[i];
			buffer.put(data.getMode(), 4);
			buffer.put(data.getLength(), getLengthInBits(data.getMode(), typeNumber));
			data.write(buffer);
		}
		return _createData(buffer, rsBlocks);
	};

	var createData = function (typeNumber, errorCorrectionLevel, byteArray, mode) {
		var cb = mode ? createDataForBytes : createDataForModes;
		return cb.apply(null, arguments)
	};

	var mapData = function (map, data, maskPattern) {
		var _moduleCount = map.length;
		var inc = -1;
		var row = _moduleCount - 1;
		var bitIndex = 7;
		var byteIndex = 0;
		var maskFunc = getQRMaskFunction(maskPattern);

		for (var col = _moduleCount - 1; col > 0; col -= 2) {
			if (col == 6) col -= 1;
			while (true) {
				for (var c = 0; c < 2; c += 1) {
					if (map[row][col - c] == null) {
						var dark = false;
						if (byteIndex < data.length) {
							dark = (((data[byteIndex] >>> bitIndex) & 1) == 1);
						}
						var mask = maskFunc(row, col - c);
						if (mask) {
							dark = !dark;
						}
						map[row][col - c] = dark;
						bitIndex -= 1;
						if (bitIndex == -1) {
							byteIndex += 1;
							bitIndex = 7;
						}
					}
				}
				row += inc;
				if (row < 0 || _moduleCount <= row) {
					row -= inc;
					inc = -inc;
					break;
				}
			}
		}

		return map;
	};

	var utils = {
		QRMode: QRMode,
		QRErrorCorrectionLevel: QRErrorCorrectionLevel,
		QRMaskPattern: QRMaskPattern,
		qrBitBuffer: qrBitBuffer,
		setupAllPositionProbePattern: setupAllPositionProbePattern,
		setupPositionAdjustPattern: setupPositionAdjustPattern,
		setupTimingPattern: setupTimingPattern,
		setupTypeInfo: setupTypeInfo,
		setupTypeNumber: setupTypeNumber,
		mapInit: mapInit,
		copyMap: copyMap,
		compareMap: compareMap,
		createData: createData,
		mapData: mapData,
		getLengthInBits: getLengthInBits,
		getRSBlocks: getRSBlocks,
		getLostPoint: getLostPoint,
	};

	var QRErrorCorrectionLevel$1 = utils.QRErrorCorrectionLevel;
	var cache = {}; //缓存 

	var src = function (QRModes, defOptions) {
		QRcode.QRModes = QRModes;

		// 纠错等级
		// L: 1, 7%
		// M: 0, 15%
		// Q: 3, 25%
		// H: 2, 30%
		QRcode.QRErrorCorrectionLevel = QRErrorCorrectionLevel$1;

		/**
		 * 
		 * @param {object} options 
		 *	{
		 *		errorCorrectionLevel: "M", //纠错等级 默认M   'L','M','Q','H' -> [1,0,3,2]
		 *		typeNumber: 0,             //QR码版本 默认0 (自动)  1 to 40
		 *		minTypeNumber: 0,          //最小版本
		 *		maskPattern: 'auto',       //掩模 'random','auto'  [0-7]
		 *		dataMode: 'Byte'           //默认 数据类型 结合 QRModes 参数
		 *	}
		*/
		function QRcode(options) {
			options = options || {};
			// var _options = {};
			// for (var k in defOptions) {
			// 	_options[k] = options[k] == undefined ? defOptions[k] : options[k];
			// }
			var _options = Object.assign({},defOptions,options);

			return (function () {
				var _typeNumber = _options.typeNumber,
					_minTypeNumber = _options.minTypeNumber,
					_maskPattern = _options.maskPattern,
					_dataMode = _options.dataMode,
					_errorCorrectionLevel = (function () {
						var l = _options.errorCorrectionLevel;
						for (var k in QRErrorCorrectionLevel$1) {
							var v = QRErrorCorrectionLevel$1[k];
							if (l === k || +l === v) {
								return v;
							}
						}
					})();

				var _moduleCount = 0,
					_dataList = [],
					_dataCache = null;

				var makeImpl = function (test, maskPattern) {
					var map;
					if (cache['basemap_' + _typeNumber]) {
						//从缓存中读取
						map = utils.copyMap(cache['basemap_' + _typeNumber]);
					} else {
						//生成空矩阵 QR码尺寸
						map = utils.mapInit(_moduleCount);
						//填充探测图型
						utils.setupAllPositionProbePattern(map);
						//填充矫正位图
						utils.setupPositionAdjustPattern(map);
						//填充定位图
						utils.setupTimingPattern(map);

						//做个缓存 只要版本相同 '探测图型','矫正位图','定位图' 是固定的
						cache['basemap_' + _typeNumber] = utils.copyMap(map);
					}

					//填充格式信息
					utils.setupTypeInfo(map, test, _errorCorrectionLevel, maskPattern);

					//填充版本信息
					(_typeNumber >= 7) && utils.setupTypeNumber(map, test);

					//填充数据
					if (_dataCache == null) {
						_dataCache = utils.createData(_typeNumber, _errorCorrectionLevel, _dataList);
					}
					return utils.mapData(map, _dataCache, maskPattern);
				};

				var addData = function (data, mode) {
					mode = mode || _dataMode;
					var newData = null;
					if (typeof mode == 'function') {
						newData = mode(data);
						if (!(newData.getMode && newData.getLength && newData.write)) {
							throw 'mode invalid!'
						}
					} else {
						if (QRModes[mode]) {
							newData = QRModes[mode](data);
						} else {
							throw 'mode type invalid! mode is ' + mode;
						}
					}
					_dataList.push(newData);
					_dataCache = null;
				};

				var make = function () {
					// 如果未指定TypeNumber，则记算适合的TypeNumber
					if (_typeNumber < 1) {
						var typeNumber = _minTypeNumber ? _minTypeNumber : 1;
						for (; typeNumber < 40; typeNumber++) {
							var rsBlocks = utils.getRSBlocks(typeNumber, _errorCorrectionLevel);

							var buffer = utils.qrBitBuffer();
							for (var i = 0; i < _dataList.length; i++) {
								var data = _dataList[i];
								buffer.put(data.getMode(), 4);
								buffer.put(data.getLength(), utils.getLengthInBits(data.getMode(), typeNumber));
								data.write(buffer);
							}

							var totalDataCount = 0;
							for (var i = 0; i < rsBlocks.length; i++) {
								totalDataCount += rsBlocks[i].dataCount;
							}

							if (buffer.getLengthInBits() <= totalDataCount * 8) {
								break;
							}
						}
						_typeNumber = typeNumber;
					}

					_moduleCount = _typeNumber * 4 + 17;

					// 掩模

					// 随机
					if (_maskPattern === 'random') {
						_maskPattern = ~~(Math.random() * (7 + 1));
						// 指定方案
					} else if (0 <= _maskPattern && _maskPattern <= 7) {
						_maskPattern = _maskPattern >> 0;
						// 自动筛选最优掩模
					} else { //auto
						_maskPattern = (function () {
							var minLostPoint = 0;
							var pattern = 0;
							for (var i = 0; i < 8; i += 1) {
								var map = makeImpl(true, i);
								var lostPoint = utils.getLostPoint(map);
								if (i == 0 || minLostPoint > lostPoint) {
									minLostPoint = lostPoint;
									pattern = i;
								}
							}
							return pattern;
						}());
					}

					var map = makeImpl(false, _maskPattern);
					return map;
				};

				var splitMake = function () {
					var obj = {};
					obj.all = make();
					obj.allDiscover = utils.copyMap(cache['basemap_' + _typeNumber]),

						//positionProbe
						obj.positionProbe = utils.mapInit(_moduleCount),
						utils.setupAllPositionProbePattern(obj.positionProbe);

					//positionAdjust 
					var positionAdjust = utils.copyMap(obj.positionProbe);
					utils.setupPositionAdjustPattern(positionAdjust);
					obj.positionAdjust = utils.compareMap(obj.positionProbe, positionAdjust, 'xor');

					//timing
					var timing = utils.mapInit(_moduleCount);
					utils.setupTimingPattern(timing);
					obj.timing = utils.compareMap(obj.positionAdjust, timing, "and");
					obj.timing = utils.compareMap(obj.timing, timing, "xor");


					//data
					obj.data = utils.compareMap(obj.all, obj.allDiscover, 'xor');

					// console.log(obj.all);
					// console.log(obj.allDiscover);
					// console.log(obj.positionProbe);
					// console.log(obj.positionAdjust);
					// console.log(obj.timing)
					// console.log(obj.data)


					return obj;
				};

				var setData = function (data, mode) {
					_dataList = [];
					addData(data, mode);
				};

				var _this = function (str, mode) {
					setData(str, mode);
					return make();
				};

				//暴露到外部的方法
				_this.setData = setData;
				_this.addData = addData;
				_this.make = make;
				_this.splitMake = splitMake;

				return _this;
			})();
		}

		return QRcode;
	};

	// 数据模式
	var QRModes = {
		'Numeric': Numeric,   //数字 0-9
		'Alphanumeric': Alphanumeric, //支持数字,大写字母,英文空格及 % * + - . / : ;
		'Byte': Byte(),  //以字节存储数据 utf8
		'Byte-GBK': Byte(gbk.encode),  //以字节存储数据 utf8
		'Byte-SJIS': Byte(sjis),  //以字节存储数据 utf8
		'Kanji': Kanji() //日文编码 SJIS
	};

	var defOptions = {
		errorCorrectionLevel: "M",
		typeNumber: 0,
		maskPattern: 'auto',
		dataMode: 'Byte'
	};

	var index_temp = src(QRModes,defOptions);

	return index_temp;

})));
