
function filterNearZeroEvents(event)
{
	return event.avgKW >= 0.01;
}

function filterShortEvents(event)
{
	return (new Date(event.end).getTime() - new Date(event.start).getTime()) >= 10000.0;
}

function filterCircuits(options)
{
	var e = [];
	
	for(var i = 0; i < options.selectedCircuits.length; i++)
	{
		for(var j = 0; j < options.events.length; j++)
		{
			if(circuitNameToIndex[options.events[j].circuit] === options.selectedCircuits[i])
			{
				e.push(options.events[j]);
			}
		}
			
	}
	
	return e;
}

function showAvg(event)
{
	return event.avgKW;
}

function showDuration(event)
{
	return (new Date(event.end).getTime() - new Date(event.start).getTime()) / 1000.0;
}

function loadEvents(options)
{
	$.getJSON("/data/powerEvents/" + options.overviewStartDate.getTime() + "/" + options.overviewEndDate.getTime() ).done(function(events)
  	{
		var circuit = "";
		options.events = events;
		options.zoomStartDate = options.overviewStartDate;
		options.zoomEndDate = options.overviewEndDate;
		options.brushTime = options.overviewStartDate;
		options.circuitStartingEventIndex = [];
		
		for(var i = 0; i < events.length; i++)
		{
			if(events[i].circuit !== circuit)
			{
				options.circuitStartingEventIndex.push(i);
				circuit = events[i].circuit;
			}
		}
		
		attachTimeBrushEvent(options);
		drawEvents(options);
		$("#loading").puidialog("hide");
 	});	
}

function attachTimeBrushEvent(options)
{
	$("#" + options.timeViewId).click(function(event){
		var posX = $(this).offset().left;
		var width = $(this).width();
		var x = event.pageX - posX;
        var zoomRange = options.zoomEndDate.getTime() - options.zoomStartDate.getTime();
        var offsetTime = (x/width) * zoomRange;
        options.brushTime = new Date(options.zoomStartDate.getTime() + offsetTime);
        drawBrushes(options);
	});
}
function drawEvents(options)
{
	drawOverview(options);
	drawZoomView(options);
	drawBrushes(options);
	drawHistograms(options);
}

function drawBrushes(options)
{
	drawZoomTimeView(options);
    drawOverviewBrush(options);
    drawZoomBrush(options);
    getSelectedEvents(options);
    drawCircuits(options);
}

function drawCircuits(options)
{
}

function drawHistograms(options)
{
	var evts = filterCircuits(options);
	
	setHistogramNumberOfBins(49);
  	setHistogramData(evts.filter(filterNearZeroEvents).map(showAvg));
  	setHistogramRange(0, 3.5);
  	setHistogramSelector("#" + options.kwHistogramId);
  	histogram();
  	
  	setHistogramNumberOfBins(50);
  	setHistogramData(evts.filter(filterNearZeroEvents).filter(filterShortEvents).map(showDuration));
  	setHistogramRange(0, 1000);
  	setHistogramSelector("#" + options.durationHistogramId);
  	histogram();
}

function getSelectedEvents(options)
{
	options.intersectingEvents = [];
	targetTime = options.brushTime;
	
	for (var i = 0; i < options.selectedCircuits.length; i++)
	{
		if(i < options.selectedCircuits.length - 1)
		{
			options.intersectingEvents.push(findEvent(options.events, targetTime, options.circuitStartingEventIndex[options.selectedCircuits[i]], options.circuitStartingEventIndex[options.selectedCircuits[i] + 1]));
		}
		else
		{
			options.intersectingEvents.push(findEvent(options.events, targetTime, options.circuitStartingEventIndex[options.selectedCircuits[i]], options.events.length));
		}
	}
}

function findEvent (events, target, start, end)
{
	index = start + Math.floor((end - start) / 2);
	startDate = new Date(events[index].start);
	endDate = new Date(events[index].end);
	if (startDate.getTime() <= target.getTime() && target.getTime() < endDate.getTime())
		return events[index];
	else if (startDate.getTime() > target.getTime())
	{
		return findEvent(events, target, start, index - 1);
	}
	else
	{
		return findEvent(events, target, index + 1, end);
	}
}

function drawZoomBrush(options)
{
	var svgBox = document.getElementById(options.zoomViewId).getBoundingClientRect();
	var rangeInMilliseconds = options.zoomEndDate.getTime() - options.zoomStartDate.getTime();
	if (options.zoomBrush)
	{
		options.zoomBrush.attr("x", ((options.brushTime.getTime() - options.zoomStartDate.getTime()) / rangeInMilliseconds) * svgBox.width);
	}
}

function drawZoomView(options)
{
	var rangeInMilliseconds = options.zoomEndDate.getTime() - options.zoomStartDate.getTime();
	var svgBox = document.getElementById(options.zoomViewId).getBoundingClientRect();
	var svg = d3.select("#" + options.zoomViewId);
	
	var events = options.events.filter(filterNearZeroEvents);
	var brushDragHandler = d3.behavior.drag()
	.on("drag", function(d){ options.dragHandlers.dragZoomBrush(options)});
  		
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
	.attr("data-avgKW", function(d){ return d.avgKW;})
	.attr("fill", function(d){
		return getColor(d.avgKW / maxCircuitValue);
	})
	.on("click", function(d, i){
		PowerGraph.render([circuitNameToIndex[d.circuit]], new Date(d.start), new Date(d.end));
	});
	
	options.zoomBrush = svg.append("rect")
	.attr("class", "zoom brush")
	.attr("x", ((options.brushTime.getTime() - options.zoomStartDate.getTime()) / rangeInMilliseconds) * svgBox.width)
	.attr("y", 0)
	.attr("width", 2)
	.attr("height", svgBox.height)
	.call(brushDragHandler);
	
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
  	
function drawOverviewBrush(options)
{
	var canvas = document.getElementById(options.overviewId);
	var range = options.overviewEndDate.getTime() - options.overviewStartDate.getTime();
	var x = ((options.brushTime.getTime() - options.overviewStartDate.getTime()) / range) * canvas.width;
	d3.select("#" + options.scrollbarId + " .brush").remove();
	options.overviewBrush = d3.select("#" + options.scrollbarId).append("rect")
	.attr("class", "brush")
	.attr("x", x)
	.attr("y", 0)
	.attr("width", 1)
	.attr("height", canvas.height);
}

function drawScrollbar(width, height, options)
{
	var svgElement = document.getElementById(options.scrollbarId);
	svgElement.setAttribute("viewBox", "0 0 " + width + " " + height);
	svgElement.setAttribute("preserveAspectRatio", "xMinYMin");
  	
	d3.select("#" + options.scrollbarId + " *").remove();
	var scrollbar = d3.select("#" + options.scrollbarId).append("g").attr("class", "scroll");
 		
	options.scroll = scrollbar.append("rect")
	.attr("x", "0")
	.attr("y", "0")
	.attr("width", width)
	.attr("height", height);
	
	options.leftHandle = scrollbar
	.append("polygon")
	.attr("class", "left-handle")
	.attr("transform", "translate(0,0)")
	.attr("points", "0,0 0," + height + " 10," + height + " 10," + (height - 5) + " 5," + (height - 5) + " 5,5 10,5 10,0");
	
	options.rightHandle = scrollbar.append("polygon")
	.attr("class", "right-handle")
	.attr("transform", "translate(" + width + ",0)")
	.attr("points", "-10,0 0,0 0," + height + " -10," + height + " -10," + (height - 5) + " -5," + (height - 5) + " -5,5 -10,5");
	
	options.dragHandlers = dragHandlers(options);
  
	var leftHandleDrag = d3.behavior.drag()
		.on("drag", options.dragHandlers.dragLeftHandle);
	var rightHandleDrag = d3.behavior.drag()
	  	.on("drag", options.dragHandlers.dragRightHandle);
	var scrollDrag = d3.behavior.drag()
		.on("drag", options.dragHandlers.dragScroll);	
	
	attachScrollbarBrushEvents(options);
	
	options.scroll.call(scrollDrag);
  		
	options.leftHandle.call(leftHandleDrag);
  		
	options.rightHandle.call(rightHandleDrag);
}

function attachScrollbarBrushEvents(options)
{
	$("#" + options.scrollbarId).click(function(event){
		var width = $(this).width();
		var posX = $(this).offset().left;
		var x = event.pageX - posX;
		var range = options.overviewEndDate.getTime() - options.overviewStartDate.getTime();
		        
        var offsetTime = (x/width) * range;
        options.brushTime = new Date(options.overviewStartDate.getTime() + offsetTime);
        drawBrushes(options);
	});
	$("#" + options.scrollbarId + " *").click(function(event){
		event.stopPropagation();
	});
}

function dragHandlers(options)
{
	var maxWidth = document.getElementById(options.overviewId).width,
		rightX = maxWidth, 
		scrollWidth = maxWidth, 
		leftX = 0,
		currentMouseX,
		intervalId;
  	
	// options1 has a overview and zoom date range, so does options2.
	// zoom date range should remained synced in length
	// zoom date range should be limited to smallest overviewDateRange
	// only width should be synced, the offsets should be allowed to remain disjoint so we compare day 2 to day 3
	// when the left handle is used, the other left handle should change.
	// when the right handle is used, the other right handle should change.
	
	
	function scrollWithBrush(options)
	{
		console.log(currentMouseX + " " + leftX + " " + rightX);
		if(currentMouseX <= 10 && leftX > 0)
		{
			if (leftX < 10)
			{
				rightX -= leftX;
				leftX = 0;
			}
			else{	
				leftX -= 10;
				rightX -= 10;
			}
			
			options.leftHandle.attr("transform", "translate(" + leftX + ", 0)");
			options.rightHandle.attr("transform", "translate(" + rightX + ", 0)");
			options.scroll.attr("x", leftX);
			transformZoomView(maxWidth, scrollWidth, leftX, rightX, options);
			dragZoomBrush(options);
		}
		else if(currentMouseX >= (maxWidth - 10) && rightX < maxWidth)
		{
			if (leftX < 10)
			{
				leftX += rightX;
				rightX = maxWidth;
			}
			else{	
				leftX += 10;
				rightX += 10;
			}
			
			options.leftHandle.attr("transform", "translate(" + leftX + ", 0)");
			options.rightHandle.attr("transform", "translate(" + rightX + ", 0)");
			options.scroll.attr("x", leftX);
			transformZoomView(maxWidth, scrollWidth, leftX, rightX, options);
			dragZoomBrush(options);
		}
		else
		{
			stopDragBrush();
		}
	}
	
	function dragZoomBrush(options)
	{
		currentMouseX = d3.event.x;
		var range = options.zoomEndDate.getTime() - options.zoomStartDate.getTime();
			
		if(d3.event.x >= 0 && d3.event.x <= maxWidth)
		{
			var offsetTime = (d3.event.x / maxWidth) * range;
	        options.brushTime = new Date(options.zoomStartDate.getTime() + offsetTime);
					
			drawBrushes(options);
		}
		
		if((leftX >= 10 || rightX <= maxWidth - 10) && (currentMouseX <= 10 || currentMouseX >= (maxWidth - 10)) && intervalId < 0)
			intervalId = setInterval(function(){scrollWithBrush(options);}, 16);
		else
		{
			stopDragBrush();
		}
	}
	
	function stopDragBrush()
	{
		clearInterval(intervalId);
		intervalId = -1;
	}
	
	function dragLeftHandle(d)
  	{
  		if(d3.event.x >= 0 && d3.event.x <= rightX)
  		{
  			leftX = d3.event.x;
  			scrollWidth = rightX - leftX;
  			
  			options.leftHandle.attr("transform", "translate(" + leftX + ", 0)");
  			options.scroll.attr("x", leftX)
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
  			
  			options.rightHandle.attr("transform", "translate(" + rightX + ", 0)");
  			options.scroll.attr("width", scrollWidth);
  			
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
			
			options.leftHandle.attr("transform", "translate(" + leftX + ", 0)");
			options.rightHandle.attr("transform", "translate(" + rightX + ", 0)");
			options.scroll.attr("x", leftX);
			
			if(scrollWidth !== 0)
			{
				transformZoomView(maxWidth, scrollWidth, leftX, rightX, options);
	  		}
	  	}
  	}
  	  	
  	return {"dragLeftHandle": dragLeftHandle, "dragRightHandle": dragRightHandle, "dragScroll": dragScroll, "dragZoomBrush": dragZoomBrush};
}
  	
function transformZoomView( overviewWidth, viewWidth, leftBoundary, rightBoundary, options)
{
	var scaleFactor = overviewWidth / viewWidth;
	
	$("#" + options.zoomViewId + " g").attr("transform","translate( " + (-leftBoundary * scaleFactor) + ", 0) scale(" + scaleFactor + ",1)");
	
	options.zoomStartDate = new Date(options.overviewStartDate.getTime() + ((options.overviewEndDate.getTime() - options.overviewStartDate.getTime()) * (leftBoundary / overviewWidth)));
	options.zoomEndDate = new Date(options.overviewStartDate.getTime() + ((options.overviewEndDate.getTime() - options.overviewStartDate.getTime()) * (rightBoundary / overviewWidth)));
	drawBrushes(options);
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
		context.strokeStyle = "black";
		context.beginPath();
		context.moveTo(x,y);
		context.lineTo(x,timeCanvas.height);
		context.stroke();
	});
	
	var x = ((options.brushTime.getTime() - options.zoomStartDate.getTime()) / range) * timeCanvas.width;
	if(x < timeCanvas.width && x > 0)
	{
		context.strokeStyle = "red";
		context.beginPath();
		context.moveTo(x,0);
		context.lineTo(x,timeCanvas.height);
		context.stroke();
	}	
}