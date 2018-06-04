var QRCode = require("../index");

var img_width = 210;
var img_height = 210;


function gethtml(data) {
	var x = data.length / 50 >> 0;
	var c = x ? "s" : "";
	c = c.padStart(Math.min(x, 3), "x");
	var html = '<div class="' + c + '">';
	for (let i = 0; i < data.length; i++) {
		var tr = data[i];
		for (let k = 0; k < tr.length; k++) {
			td = tr[k];
			html += td ? '<b></b>' : '<i></i>';
		}
		html += '<br>';
	}
	html += '</div>';
	return html;
}

function getSVG(data){
	function makeSVG(tag, attrs) {
		var el = document.createElementNS('http://www.w3.org/2000/svg', tag);
		for (var k in attrs)
			if (attrs.hasOwnProperty(k)) el.setAttribute(k, attrs[k]);
		return el;
	}
	
	function isDark(x,y){
		return data[x][y];
	}

	var nCount = data.length;
	var svg = makeSVG("svg" , {'viewBox': '0 0 ' + String(nCount) + " " + String(nCount), 'width': '100%', 'height': '100%', 'fill': "#FFFFFF"});
	svg.setAttributeNS("http://www.w3.org/2000/xmlns/", "xmlns:xlink", "http://www.w3.org/1999/xlink");
	//_el.appendChild(svg);

	svg.appendChild(makeSVG("rect", {"fill": "#FFFFFF", "width": "100%", "height": "100%"}));
	svg.appendChild(makeSVG("rect", {"fill": "#000000", "width": "1", "height": "1", "id": "template"}));

	for (var row = 0; row < nCount; row++) {
		for (var col = 0; col < nCount; col++) {
			if (isDark(row, col)) {
				var child = makeSVG("use", {"x": String(col), "y": String(row)});
				child.setAttributeNS("http://www.w3.org/1999/xlink", "href", "#template")
				svg.appendChild(child);
			}
		}
	}
	return svg;
}

function canvasResize(old,w,h){
	var canvas = document.createElement("canvas");
	var context = canvas.getContext("2d");
	canvas.width = w;
	canvas.height = h;
	context.drawImage(old,0,0,w,h);
	return canvas;
}

// svgdata = encodeURIComponent(svgtext);
// 'data:image/svg+xml,'+svgdata;

function canvas2dataUrl(canvas,width,height){
	if(width && height && !(canvas.width == width && canvas.height == height)){
		canvas = canvasResize(canvas,width,height);
	}
	return canvas.toDataURL('image/png')
}

function getCanvas(data){
	var size = 10;
	var canvas = document.createElement("canvas");
	var context = canvas.getContext("2d");
	var nCount = data.length;
	canvas.width = nCount * size;
	canvas.height = nCount * size;
	function isDark(x,y){
		return data[x][y];
	}
	// context.fillStyle = "#FFFFFF";
	// context.fillRect(0,0,canvas.width,canvas.height);
	
	context.fillStyle = "#000000";
	for (var row = 0; row < nCount; row++) {
		for (var col = 0; col < nCount; col++) {
			if(!isDark(row, col)) continue;
			var nLeft = col * size;
			var nTop = row * size;
			/* 方型
			context.lineWidth = 1;
			context.fillRect(nLeft, nTop, size, size); 
			*/
			context.beginPath();
			context.arc(nLeft+(size/2),nTop+(size/2),(size/2),0,Math.PI*2,true);
			context.closePath();
			context.fill();
		}
	}
	// return canvas;
	// return canvasResize(canvas,img_width,img_height);
	// context.drawImage(canvas,0,0,img_width,img_height);


	// canvas.width = img_width;
	// canvas.height = img_height;

	// canvas.style.width = img_width + "px";
	// canvas.style.height = img_height + "px";
	var img = document.createElement('img')
	img.src = canvas2dataUrl(canvas,img_width,img_height);
	return img;
}

new Vue({
	el: "#app",
	data: function(){
		return {
			typeNumber:0,
			errorCorrectionLevel:"M",
			mode:'Byte',
			Modes: QRCode.QRModes,
			input:"",
			outCode:[],
		}
	},
	computed: {
		// outHtml: {
		// 	get: function(){
		// 		// return gethtml(this.outCode);
		// 		return getSVG(this.outCode);
		// 	}
		// }
	},
	methods: {
		getQRCode: function(){
			console.log({
				errorCorrectionLevel: this.errorCorrectionLevel,
				typeNumber: this.typeNumber,
				dataMode: this.dataMode,
				input:this.input,
				mode:this.mode
			});
			var qrcode = QRCode({
				errorCorrectionLevel: this.errorCorrectionLevel,
				typeNumber: this.typeNumber,
				dataMode: this.dataMode
			})

			this.outCode = qrcode(this.input,this.mode);
		}
	},
	watch:{
		outCode: function(val){
			this.$nextTick(()=>{
				// this.$refs.outBox.appendChild(getSVG(this.outCode));
				this.$refs.outBox.appendChild(getCanvas(this.outCode));
			})
		}
	}
})