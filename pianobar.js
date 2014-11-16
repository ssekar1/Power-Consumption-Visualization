var leftHandle, rightHandle, scroll;

function filterNearZeroEvents(event)
{
	return event.avgKW >= 0.01;
}

function drawZoomView(events, start, end)
{
	var rangeInMilliseconds = end.getTime() - start.getTime();
	var svgBox = document.getElementById("zoomView").getBoundingClientRect();
	var svg = d3.select("#zoomView");
	
	var events = events.filter(filterNearZeroEvents);
  		
	svg.selectAll("g").remove();
	
	svg.append("g")
	.attr("class", "eventContainer")
	.selectAll("rect.event")
	.data(events).enter()
	.append("rect")
	.attr("class", "event")
	.attr("x", function(d){ return (new Date(d.start).getTime() - start.getTime()) / rangeInMilliseconds * svgBox.width;})
	.attr("y", function(d){ return circuitNameToIndex[d.circuit] * (svgBox.height / selectedCircuits.length);})
	.attr("width", function(d){ return (new Date(d.end).getTime() - new Date(d.start).getTime()) / rangeInMilliseconds * svgBox.width})
	.attr("height", function(d){ return svgBox.height / selectedCircuits.length;})
	.attr("data-start", function(d){ return d.start;})
	.attr("data-end", function(d){ return d.end;})
	.attr("avgKW", function(d){ return d.avgKW;})
	.attr("fill", function(d){
		return getColor(d.avgKW / maxCircuitValue);
	})
	.on("click", function(d, i){
		console.log("click");
		//drawRawDataGraph(d.start, d.end, d.circuit);
	});
	
	var labels = d3.select("#labels").append("svg")
	.attr("width", document.getElementById("labels").clientWidth)
	.attr("height", document.getElementById("labels").clientHeight)
	.selectAll("text")
	.data(selectedCircuits).enter()
	.append("text")
	.attr("x", function (d){ return document.getElementById("labels").clientWidth;})
	.attr("y", function (d){ return ((d + 1) * svgBox.height / selectedCircuits.length);})  		
	.attr("text-anchor", "end")
	.attr("font-size", function(d) {return (svgBox.height / selectedCircuits.length) + "px"; })
	.text(function(d) {return indexToName[d]});
}
  	
function drawOverview(events, startTime, endTime)
{
	var rangeInMilliseconds = endTime.getTime() - startTime.getTime();
	
	var events = events.filter(filterNearZeroEvents);
	
	var canvas = document.getElementById("overviewBackground");
	var container = canvas.parentNode.getBoundingClientRect();
		
	canvas.width = container.width;
	canvas.height = container.height; 
	var context = canvas.getContext("2d");
	$.each(events, function(i, d){
		var x = ((new Date(d.start).getTime() - startTime.getTime()) / rangeInMilliseconds) * canvas.width;
		var y = circuitNameToIndex[d.circuit] * (canvas.height / selectedCircuits.length);
		var w = ((new Date(d.end).getTime() - new Date(d.start).getTime()) / rangeInMilliseconds) * canvas.width;
		var h = (canvas.height / selectedCircuits.length);
  			
		if(x < 0) 
  			x = 0;
  			
		context.fillStyle = getColor(d.avgKW / maxCircuitValue);
  		context.fillRect(x,y,w,h);
	});
  		  		
	drawScrollbar(canvas.width, canvas.height);
}
  	
function drawScrollbar(width, height)
{
	var svgElement = document.getElementById("overviewScrollbar");
	svgElement.setAttribute("viewBox", "0 0 " + width + " " + height);
	svgElement.setAttribute("preserveAspectRatio", "xMinYMin")
  		
	var dHandlers = dragHandlers();
  
	var leftHandleDrag = d3.behavior.drag()
		.on("drag", dHandlers.dragLeftHandle);
	var rightHandleDrag = d3.behavior.drag()
	  	.on("drag", dHandlers.dragRightHandle);
	var scrollDrag = d3.behavior.drag()
		.on("drag", dHandlers.dragScroll);
  		
	d3.select("#overviewScrollbar *").remove();
	var scrollbar = d3.select("#overviewScrollbar").append("g").attr("class", "scroll");
 		
	scroll = scrollbar.append("rect")
	.attr("x", "0")
	.attr("y", "0")
	.attr("width", width)
	.attr("height", height)
	.call(scrollDrag);
  		
	leftHandle = scrollbar
	.append("polygon")
	.attr("class", "left-handle")
	.attr("transform", "translate(0,0)")
	.attr("points", "0,0 0," + height + " 10," + height + " 10," + (height - 5) + " 5," + (height - 5) + " 5,5 10,5 10,0")
	.call(leftHandleDrag);
  		
	rightHandle = scrollbar.append("polygon")
	.attr("class", "right-handle")
	.attr("transform", "translate(" + width + ",0)")
	.attr("points", "-10,0 0,0 0," + height + " -10," + height + " -10," + (height - 5) + " -5," + (height - 5) + " -5,5 -10,5")
	.call(rightHandleDrag);
}
  	
function dragHandlers()
{
	var maxWidth = document.getElementById("overviewBackground").width,
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
  				transformZoomView(maxWidth, scrollWidth, leftX, rightX);
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
 				transformZoomView(maxWidth, scrollWidth, leftX, rightX);
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
				transformZoomView(maxWidth, scrollWidth, leftX, rightX);
	  		}
	  	}
  	}
  	  	
  	return {"dragLeftHandle": dragLeftHandle, "dragRightHandle": dragRightHandle, "dragScroll": dragScroll};
}
  	
function transformZoomView( overviewWidth, viewWidth, leftBoundary, rightBoundary)
{
	var scaleFactor = overviewWidth / viewWidth;
	
	$("#zoomView g").attr("transform","translate( " + (-leftBoundary * scaleFactor) + ", 0) scale(" + scaleFactor + ",1)");
	
	zoomStartDate = new Date(overviewStartDate.getTime() + ((overviewEndDate.getTime() - overviewStartDate.getTime()) * (leftBoundary / overviewWidth)));
	zoomEndDate = new Date(overviewStartDate.getTime() + ((overviewEndDate.getTime() - overviewStartDate.getTime()) * (rightBoundary / overviewWidth)));
}

function drawZoomTimeView()
{
	var timeCanvas = document.getElementById("zoomTimeView");
	var context = timeCanvas.getContext("2d");
	
	
}