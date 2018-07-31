var utils = require('../src/utils.js');
var QR = require('../');
$(function(){
	var testArr = [];
	var testBox = $("#testBox"),
		tn = $("#typeNumber"),
		ecl = $("#errorCorrectionLevel");

	var getTN = function(){return +tn.val()};
	var getECL = function(){return +ecl.val()}
	function gethtml(data) {
		var x = data.length / 50 >> 0;
		var c = x ? "s" : "";
		c = c.padStart(Math.min(x, 3), "x");
		var html = '<div class="' + c + '">';
		for (let i = 0; i < data.length; i++) {
			var tr = data[i];
			for (let k = 0; k < tr.length; k++) {
				td = tr[k];
				html += td ? '<b></b>' : td === false ? '<i class="w"></i>' :'<i></i>';
			}
			html += '<br>';
		}
		html += '</div>';
		return html;
	}

	//svg
	function getSVG(data) {
		var size = 10;
		function makeSVG(tag, attrs) {
			var el = document.createElementNS('http://www.w3.org/2000/svg', tag);
			for (var k in attrs)
				if (attrs.hasOwnProperty(k)) el.setAttribute(k, attrs[k]);
			return el;
		}

		var isDark = function(x,y){
			return data[x][y];
		};

		var nCount = data.length;
		var svg = makeSVG("svg", { 'viewBox': '0 0 ' + (nCount * size) + " " + (nCount * size), 'width': '100%', 'height': '100%', 'fill': "#FFFFFF" });
		svg.setAttributeNS("http://www.w3.org/2000/xmlns/", "xmlns:xlink", "http://www.w3.org/1999/xlink");
		//_el.appendChild(svg);

		svg.appendChild(makeSVG("rect", { "fill": "#FFFFFF", "width": "100%", "height": "100%" }));
		svg.appendChild(makeSVG("rect", { "fill": "#000000", "width": size, "height": size, "id": "template" }));

		for (var row = 0; row < nCount; row++) {
			for (var col = 0; col < nCount; col++) {
				if (isDark(row, col)) {
					var child = makeSVG("use", { "x": col * size, "y": row * size });
					child.setAttributeNS("http://www.w3.org/1999/xlink", "href", "#template")
					svg.appendChild(child);
				}
			}
		}
		return svg;
	}


	function showArr(){
		testBox.html(gethtml(testArr))
	}
	$("#testReset").click(function(){
		testArr = utils.mapInit(getTN() * 4 + 17);
		showArr();
	})
	$("#a1").click(function(){
		utils.setupAllPositionProbePattern(testArr)
		showArr();
	})
	$("#a2").click(function(){
		utils.setupPositionAdjustPattern(testArr,getTN());
		// setupPositionAdjustPattern(testArr,getTN())
		showArr();
	})
	$("#a3").click(function(){
		utils.setupTimingPattern(testArr)
		showArr();
	})
	$("#a4").click(function(){
		utils.setupTypeInfo(testArr,false,getECL(),0)
		showArr();
	})
	$("#a5").click(function(){
		if(getTN() >=7 ){
			utils.setupTypeNumber(testArr,false,getTN())
			showArr();
		}
	})
	$("#a6").click(function(){

	})
	
	var op = {
		errorCorrectionLevel:QR.QRErrorCorrectionLevel.H,
		typeNumber:7
	}
	var box = $('#Box');
	var indata = $('#arr');
	window.show = function(){
		var T1 = Date.now(),T2;
		var qr = QR({minTypeNumber:3});
		qr.setData(indata.val());
		qr.make();
		T2 = Date.now(),console.log(T2 - T1),T1=Date.now();
		var all = qr.splitMake();
		T2 = Date.now(),console.log(T2 - T1),T1=Date.now();
		box.append($('<div class="showinit"></div>').append(gethtml(all.all)).append('<div class="showText">all</div>'));
		box.append($('<div class="showinit"></div>').append(gethtml(all.data)).append('<div class="showText">data</div>'));
		box.append($('<div class="showinit"></div>').append(gethtml(all.allDiscover)).append('<div class="showText">allDiscover</div>'));
		box.append($('<div class="showinit"></div>').append(gethtml(all.positionProbe)).append('<div class="showText">positionProbe</div>'));
		box.append($('<div class="showinit"></div>').append(gethtml(all.positionAdjust)).append('<div class="showText">positionAdjust</div>'));
		box.append($('<div class="showinit"></div>').append(gethtml(all.timing)).append('<div class="showText">timing</div>'));
	}

})
