var PowerGraph = (function() {
	var canvas = document.getElementById("rawDataCanvas");
	var context = canvas.getContext("2d");
	canvas.width = canvas.parentNode.getBoundingClientRect().width;
	canvas.height = canvas.parentNode.getBoundingClientRect().height;
	
	// origin of coordination
	var originX = 30;
	var originY = canvas.height - 30;

	// get checkboxes
	//var circuits = document.getElementsByName("circuits");

	var startTime, endTime, queryEndTime;

	//MaximumValue = 1.8 (10), 2.4 (5), 3.6 (4), 6 (2)
	var maximumValueY = 6.0;

	// draw x-axis, y-axis, and labels
	function drawAxes() {
	    
	    context.beginPath();
	    context.moveTo(originX, 0);
	    context.lineTo(originX, originY);
	    context.lineTo(canvas.width, originY);
	    context.strokeStyle = "#000000";
	    context.globalAlpha = 1;
	    context.stroke();

	    // make labels for axes (x: Time, y: KW)
	    context.fillText("KW", originX - 20, 30);
	    context.fillText("Time", canvas.width - originX, originY + 15);

	    // make labels for Max and half value of circuits on Y-axis
	    context.fillText(maximumValueY, originX - 20, originY - (((maximumValueY) / maximumValueY) * originY) + 10);
	    context.fillText(maximumValueY / 2, originX - 20, originY - (((maximumValueY / 2) / maximumValueY) * originY));
	}

	function drawCircuit(circuits, startTime, endTime) {
	    
	    $.getJSON("http://nodejs-gressc.rhcloud.com/data/raw/" + circuits.join(",") + "/" + startTime.getTime() + "/" + queryEndTime.getTime())
	        .done(function (data) {

	        var numItems = data.data.length;
	        var numCircuits = data.fieldNames.length - 1;
	        var rangeInMilliseconds = queryEndTime.getTime() - startTime.getTime();
	        var graphWidth = canvas.width - originX;
	        var graphHeight = originY;

	        for (var i = 1; i <= numCircuits; i++) {

	            context.beginPath();
	            context.moveTo(originX, originY);
	            context.globalAlpha = 0.5;

	            for (var j = 0; j < numItems; j++) {
	                var x = ((new Date(data.data[j][data.fieldNames[0]]).getTime() - startTime.getTime()) / rangeInMilliseconds) * graphWidth;
	                var y = originY - (((data.data[j][data.fieldNames[i]]) / maximumValueY) * graphHeight);
	                context.lineTo((originX + x), y);
	            }

	            context.strokeStyle = getColor(data.fieldNames[i]);
	            context.stroke();
	        }
	    });
	}

	function getColor(circuitName) {

	    var circuitNameToIndex = {
	        "c1": 0,
	            "c2": 1,
	            "c3": 2,
	            "c4": 3,
	            "c5": 4,
	            "c6": 5,
	            "c7a": 6,
	            "c7b": 7,
	            "c8": 8,
	            "c9": 9,
	            "c10": 10,
	            "c11": 11,
	            "c12": 12,
	            "c13": 13,
	            "c14": 14,
	            "c15": 15,
	            "c16": 16,
	            "c17": 17,
	            "c18": 18,
	            "c19": 19,
	            "c20": 20
	    };

	    // assume that the number of circuits is 21
	    var colors = ["#FF0000", "#FF6600", "#FFFF00", "#008000", "#99CCFF", "#333399", "#800080", "#FF00FF", "#666600", "#CC3300", "#00FFFF", "#0099FF", "#0000FF", "#FF7FFF", "#663300", "#CCCC66", "#7FFF7F", "#00FF00", "#9999FF", "#33CCFF", "#003300"];

	    return colors[circuitNameToIndex[circuitName]];
	}
	
	this.render = function(circuits, startTime, endTime) {

	    context.clearRect(0, 0, canvas.width, canvas.height);
	    drawAxes();
        drawCircuit(circuits, startTime, endTime);
	};
	
	return this;
})();

