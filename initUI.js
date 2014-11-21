function initUI()
{
	$("#loading").puidialog({modal: true});
  		
	$("#circuitSelector").puidialog({
		afterHide:function(){
			drawEvents();
		}
	});
	
	$("#rawCircuitSelector").puidialog({
		afterHide:function(){
			if(rawStart && rawEnd && rawSelectedCircuits.length > 0)
				PowerGraph.render(rawSelectedCircuits, rawStart, rawEnd);
		}
	});
	  		
	$("#circuitSelector input").puicheckbox({
		change: function(event, checked){
			var circuit = parseInt($(this).val(), 10);
			
			if(checked && selectedCircuits.indexOf(circuit) < 0)
			{
				selectedCircuits.push(circuit);
				selectedCircuits.sort(function (a,b){ if (a===b) {return 0} else if (a < b){ return -1;} else {return 1;} });
			}
			else
			{
				for(var i = 0; i < selectedCircuits.length; i++)
  				{
  					if(circuit === selectedCircuits[i])
  					{
  						selectedCircuits.splice(i,1);
  					}	
  				}
			}
		}
	});
	
	$("#rawCircuitSelector input").puicheckbox({
		change: function(event, checked){
			var circuit = parseInt($(this).val(), 10);
			
			if(checked && rawSelectedCircuits.indexOf(circuit) < 0)
			{
				rawSelectedCircuits.push(circuit);
				rawSelectedCircuits.sort(function (a,b){ if (a===b) {return 0} else if (a < b){ return -1;} else {return 1;} });
			}
			else
			{
				for(var i = 0; i < rawSelectedCircuits.length; i++)
  				{
  					if(circuit === rawSelectedCircuits[i])
  					{
  						rawSelectedCircuits.splice(i,1);
  					}	
  				}
			}
		}
	});
	
	$("#load").button().click(function(){
		if(overviewStartDate && overviewEndDate && selectedCircuits.length > 0)
		{
			$("#loading").puidialog("show");
			var options = {
  	  				overviewId: "overviewBackground",
  	  		  		scrollbarId: "overviewScrollbar",
  	  		  		zoomViewId: "zoomView",
  	  				labelId: "labels",
  	  				timeViewId: "zoomTimeView",
  	  				timeContainerId: "zoomTimeLabel"
  	  		};
			zoomStartDate = overviewStartDate;
			zoomEndDate = overviewEndDate;
			loadEvents(overviewStartDate, overviewEndDate, selectedCircuits, options);
		}
	});
	
	$("#load2").button().click(function(){
		if(overviewStartDate && overviewEndDate && selectedCircuits2.length > 0)
		{
			$("#loading").puidialog("show");
			var options = {
					overviewId: "overviewBackground2",
	  		  		scrollbarId: "overviewScrollbar2",
	  		  		zoomViewId: "zoomView2",
	  				labelId: "labels2",
	  				timeViewId: "zoomTimeView2",
	  				timeContainerId: "zoomTimeLabel2"	
			};
			loadEvents(overviewStartDate, overviewEndDate, selectedCircuits2, options);
		}
	});
	
	$("#selectCircuits").button().click(function(){
		$("#circuitSelector").puidialog("show");
	});
}

function initDateFields(dateRange)
{
	//initialize date range widgets
		$(document).ready( function(){  				
			$("#startDate").datepicker({
				minDate: dateRange.start,
				maxDate: dateRange.end,
				onClose: function( selectedDate ) {
					$( "#endDate" ).datepicker( "option", "minDate", selectedDate !== "" ? selectedDate : dateRange.start);
					overviewStartDate = new Date(selectedDate);
				}
			});
	  	  	$("#endDate").datepicker({
	  	  		minDate: dateRange.start,
			maxDate: dateRange.end,
			onClose: function( selectedDate ) {
					$( "#startDate" ).datepicker( "option", "maxDate", selectedDate !== "" ? selectedDate : dateRange.end);
					overviewEndDate = new Date(selectedDate);
				}
	  	  	});
	  	  	overviewStartDate = $("#startDate").datepicker("getDate");
	  		overviewEndDate = $("#endDate").datepicker("getDate");
	  		
	  		$("#startDate2").datepicker({
			minDate: dateRange.start,
			maxDate: dateRange.end,
			onClose: function( selectedDate ) {
				$( "#endDate2" ).datepicker( "option", "minDate", selectedDate !== "" ? selectedDate : dateRange.start);
				overviewStartDate = new Date(selectedDate);
			}
		});
  	  	$("#endDate2").datepicker({
  	  		minDate: dateRange.start,
		maxDate: dateRange.end,
		onClose: function( selectedDate ) {
				$( "#startDate2" ).datepicker( "option", "maxDate", selectedDate !== "" ? selectedDate : dateRange.end);
				overviewEndDate = new Date(selectedDate);
			}
  	  	});
  	  	overviewStartDate2 = $("#startDate2").datepicker("getDate");
  		overviewEndDate2 = $("#endDate2").datepicker("getDate");
		});
}