var histogramData = null;
var histogramNumberOfBins = 10;
var histogramStartRange = null;
var histogramEndRange = null;
var histogramSelector = null;

function setHistogramNumberOfBins(numberOfBins)
{
	histogramNumberOfBins = numberOfBins;
}

function setHistogramData(data)
{
	histogramData = data;
}

function setHistogramRange(start, end)
{
	histogramStartRange = start;
	histogramEndRange = end;
}

function setHistogramSelector(selector)
{
	histogramSelector = selector;
}

function histogram(callback)
{
	if(histogramData != null && histogramStartRange != null && histogramEndRange != null && histogramSelector != null)
	{
		d3.select(histogramSelector).select("svg").remove();
	
		// A formatter for counts.
		var formatCount = d3.format(",.0f");
	
		var margin = {top: 10, right: 30, bottom: 30, left: 30},
		    width = $(histogramSelector).width() - margin.left - margin.right,
		    height = $(histogramSelector).height() - margin.top - margin.bottom;
		
		var x = d3.scale.linear()
		    .domain([histogramStartRange, histogramEndRange])
		    .range([0, width]);
	
		var data = d3.layout.histogram()
		    .bins(x.ticks(histogramNumberOfBins))
		    (histogramData);
	
		var y = d3.scale.linear()
		    .domain([0, d3.max(data, function(d) { return d.y; })])
		    .range([height, 0]);
	
		var xAxis = d3.svg.axis()
		    .scale(x)
		    .orient("bottom");
	
		var svg = d3.select(histogramSelector).append("svg")
		    .attr("width", width + margin.left + margin.right)
		    .attr("height", height + margin.top + margin.bottom)
		  .append("g")
		    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
	
		var bar = svg.selectAll(".bar")
		    .data(data)
		  .enter().append("g")
		    .attr("class", "bar")
		    .attr("transform", function(d) { console.log( d.x, x(d.x)); return "translate(" + x(d.x) + "," + y(d.y) + ")"; });
		
		bar.append("rect")
			.attr("x", 1)
			.attr("y", -height)
			.attr("width", x(data[0].dx) - 1)
			.attr("height", height)
			.attr("style", "fill:white;")
			.on("click", function (d){callback({domain: { start: histogramStartRange, end: histogramEndRange}, numBins: histogramNumberOfBins);});
		
		bar.append("rect")
		    .attr("x", 1)
		    .attr("width", x(data[0].dx) - 1)
		    .attr("height", function(d) { return height - y(d.y); })
		    .on("click", function (d){callback(x);});
	
		/*bar.append("text")
		    .attr("dy", ".75em")
		    .attr("y", 6)
		    .attr("x", x(data[0].dx) / 2)
		    .attr("text-anchor", "middle")
		    .text(function(d) { return formatCount(d.y); });
		*/
		svg.append("g")
		    .attr("class", "x axis")
		    .attr("transform", "translate(0," + height + ")")
		    .call(xAxis);
	}
}
	