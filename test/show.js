var utils = require('../src/utils.js');
$(function(){
	var testArr = [];
	var testBox = $("#testBox"),
		tn = $("#typeNumber"),
		ecl = $("#errorCorrectionLevel");

	var getTN = function(){return +tn.val()};
	var getECL = function(){return +ecl.val()}


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
})
