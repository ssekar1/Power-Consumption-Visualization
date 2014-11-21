function filterNearZeroEvents(event)
{
	return event.avgKW >= 0.01;
}

function drawEvents(options)
{
	drawOverview(options);
	drawZoomView(options);
	drawZoomTimeView(options);
}

function drawZoomView(options)
{
	var rangeInMilliseconds = options.zoomEndDate.getTime() - options.zoomStartDate.getTime();
	var svgBox = document.getElementById(options.zoomViewId).getBoundingClientRect();
	var svg = d3.select("#" + options.zoomViewId);
	
	var events = options.events.filter(filterNearZeroEvents);
  		
	svg.selectAll("g").remove();
	
	svg.append("g")
	.attr("class", "eventContainer")
	.selectAll("rect.event")
	.data(events).enter()
	.append("rect")
	.attr("class", "event")
	.attr("x", function(d){ return (new Date(d.start).getTime() - options.zoomStartDate.getTime()) / rangeInMilliseconds * svgBox.width;})
	.attr("y", function(d){ return options.selectedCircuits.indexOf(circuitNameToIndex[d.circuit]) * (svgBox.height / options.selectedCircuits.length);})
	.attr("width", function(d){ return (new Date(d.end).getTime() - new Date(d.start).getTime()) / rangeInMilliseconds * svgBox.width})
	.attr("height", function(d){ return svgBox.height / options.selectedCircuits.length;})
	.attr("data-start", function(d){ return d.start;})
	.attr("data-end", function(d){ return d.end;})
	.attr("avgKW", function(d){ return d.avgKW;})
	.attr("fill", function(d){
		return getColor(d.avgKW / maxCircuitValue);
	})
	.on("click", function(d, i){
		PowerGraph.render([circuitNameToIndex[d.circuit]], new Date(d.start), new Date(d.end));
	});
	
	d3.selectAll("#" + options.labelId + " svg").remove();
	var labels = d3.select("#" + options.labelId).append("svg")
	.attr("width", document.getElementById(options.labelId).clientWidth)
	.attr("height", document.getElementById(options.labelId).clientHeight)
	.selectAll("text")
	.data(options.selectedCircuits).enter()
	.append("text")
	.attr("x", function (d){ return document.getElementById(options.labelId).clientWidth;})
	.attr("y", function (d){ return ((options.selectedCircuits.indexOf(d) + 1) * svgBox.height / options.selectedCircuits.length);})  		
	.attr("text-anchor", "end")
	.attr("font-size", function(d) {return (svgBox.height / options.selectedCircuits.length) + "px"; })
	.text(function(d) {return indexToName[d]});
}
  	
function drawOverview(options)
{
	var rangeInMilliseconds = options.overviewEndDate.getTime() - options.overviewStartDate.getTime();
	
	var events = options.events.filter(filterNearZeroEvents);
	
	var canvas = document.getElementById(options.overviewId);
	var container = canvas.parentNode.getBoundingClientRect();
		
	canvas.width = container.width;
	canvas.height = container.height; 
	var context = canvas.getContext("2d");
	$.each(events, function(i, d){
		var x = ((new Date(d.start).getTime() - options.overviewStartDate.getTime()) / rangeInMilliseconds) * canvas.width;
		var y = options.selectedCircuits.indexOf(circuitNameToIndex[d.circuit]) * (canvas.height / options.selectedCircuits.length);
		var w = ((new Date(d.end).getTime() - new Date(d.start).getTime()) / rangeInMilliseconds) * canvas.width;
		var h = (canvas.height / options.selectedCircuits.length);
  			
		if(x < 0)
		{
			w += x;
			x = 0;
		}
  			
		context.fillStyle = getColor(d.avgKW / maxCircuitValue);
  		context.fillRect(x,y,w,h);
	});
  		  		
	drawScrollbar(canvas.width, canvas.height, options);
}
  	
function drawScrollbar(width, height, options)
{
	var svgElement = document.getElementById(options.scrollbarId);
	svgElement.setAttribute("viewBox", "0 0 " + width + " " + height);
	svgElement.setAttribute("preserveAspectRatio", "xMinYMin")
  	
	d3.select("#" + options.scrollbarId + " *").remove();
	var scrollbar = d3.select("#" + options.scrollbarId).append("g").attr("class", "scroll");
 		
	var scroll = scrollbar.append("rect")
	.attr("x", "0")
	.attr("y", "0")
	.attr("width", width)
	.attr("height", height);
	
	var leftHandle = scrollbar
	.append("polygon")
	.attr("class", "left-handle")
	.attr("transform", "translate(0,0)")
	.attr("points", "0,0 0," + height + " 10," + height + " 10," + (height - 5) + " 5," + (height - 5) + " 5,5 10,5 10,0");
	
	var rightHandle = scrollbar.append("polygon")
	.attr("class", "right-handle")
	.attr("transform", "translate(" + width + ",0)")
	.attr("points", "-10,0 0,0 0," + height + " -10," + height + " -10," + (height - 5) + " -5," + (height - 5) + " -5,5 -10,5");
	
	var dHandlers = dragHandlers(options, scroll, leftHandle, rightHandle);
  
	var leftHandleDrag = d3.behavior.drag()
		.on("drag", dHandlers.dragLeftHandle);
	var rightHandleDrag = d3.behavior.drag()
	  	.on("drag", dHandlers.dragRightHandle);
	var scrollDrag = d3.behavior.drag()
		.on("drag", dHandlers.dragScroll);	
	
	scroll.call(scrollDrag);
  		
	leftHandle.call(leftHandleDrag);
  		
	rightHandle.call(rightHandleDrag);
}
  	
function dragHandlers(options, scroll, leftHandle, rightHandle)
{
	var maxWidth = document.getElementById(options.overviewId).width,
		rightX = maxWidth, 
		scrollWidth = maxWidth, 
		leftX = 0;
  		
	function dragLeftHandle(d)
  	{
  		if(d3.event.x >= 0 && d3.event.x <= rightX)
  		{
  			leftX = d3.event.x;
  			scrollWidth = rightX - leftX;
  	  			
  			leftHandle.attr("transform", "translate(" + leftX + ", 0)");
  			scroll.attr("x", leftX)
  			.attr("width", scrollWidth);
  			
  			if(scrollWidth !== 0)
  			{
  				transformZoomView(maxWidth, scrollWidth, leftX, rightX, options);
  			}
  		}	
  	}
  	
  	function dragRightHandle(d)
  	{
  		if(d3.event.x >= leftX && d3.event.x <= maxWidth)
  		{
  			rightX = d3.event.x;
  			scrollWidth = rightX - leftX;
  			
  			rightHandle.attr("transform", "translate(" + rightX + ", 0)");
  			scroll.attr("width", scrollWidth);
  			
  			if(scrollWidth !== 0)
 			{
 				transformZoomView(maxWidth, scrollWidth, leftX, rightX, options);
 			}
  		}
  	}
  	
  	function dragScroll(d)
  	{
  		if(leftX + d3.event.dx >= 0 && rightX + d3.event.dx <= maxWidth)
		{
			leftX += d3.event.dx;
			rightX += d3.event.dx;
			
			leftHandle.attr("transform", "translate(" + leftX + ", 0)");
			rightHandle.attr("transform", "translate(" + rightX + ", 0)");
			scroll.attr("x", leftX);
			
			if(scrollWidth !== 0)
			{
				transformZoomView(maxWidth, scrollWidth, leftX, rightX, options);
	  		}
	  	}
  	}
  	  	
  	return {"dragLeftHandle": dragLeftHandle, "dragRightHandle": dragRightHandle, "dragScroll": dragScroll};
}
  	
function transformZoomView( overviewWidth, viewWidth, leftBoundary, rightBoundary, options)
{
	var scaleFactor = overviewWidth / viewWidth;
	
	$("#zoomView g").attr("transform","translate( " + (-leftBoundary * scaleFactor) + ", 0) scale(" + scaleFactor + ",1)");
	
	options.zoomStartDate = new Date(options.overviewStartDate.getTime() + ((options.overviewEndDate.getTime() - options.overviewStartDate.getTime()) * (leftBoundary / overviewWidth)));
	options.zoomEndDate = new Date(options.overviewStartDate.getTime() + ((options.overviewEndDate.getTime() - options.overviewStartDate.getTime()) * (rightBoundary / overviewWidth)));
	drawZoomTimeView(options);
}

function drawZoomTimeView(options)
{
	var timeCanvas = document.getElementById(options.timeViewId);
	var container = timeCanvas.parentNode;
	timeCanvas.width = container.getBoundingClientRect().width;
	timeCanvas.height = container.getBoundingClientRect().height;
	
	var range = options.zoomEndDate.getTime() - options.zoomStartDate.getTime();
	
	var labels = Dygraph.dateTicker(
		options.zoomStartDate.getTime(), 
		options.zoomEndDate.getTime(), 
		document.getElementById(options.timeContainerId).getBoundingClientRect().width, 
		function(val){
			if(val == "pixelsPerLabel") 
				return 50; 
			if(val == "axisLabelFormatter") 
				return Dygraph.dateAxisLabelFormatter;
		}, null, null);
	
	var context = timeCanvas.getContext("2d");
	context.clearRect(0,0,timeCanvas.width, timeCanvas.height);
	
	$.each(labels, function(i, data){
		var labelText = data.label, time = data.v;
		var x = ((data.v - options.zoomStartDate.getTime()) / range) * timeCanvas.width;
		var y = 10;
		context.font = "10px Georgia";
		context.textAlign = "center";
		context.fillStyle = "black";
		context.fillText(labelText, x, y);
		context.beginPath();
		context.moveTo(x,y);
		context.lineTo(x,timeCanvas.height);
		context.stroke();
	});
}