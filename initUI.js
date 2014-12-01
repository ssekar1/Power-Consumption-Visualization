function initUI()
{
	$("#loading").puidialog({modal: true});
	
	$("#legend").puidialog();
  		
	$("#circuitSelector").puidialog({
		afterHide:function(){
			drawEvents(options1);
		}
	});
	
	$("#circuitSelector2").puidialog({
		afterHide:function(){
			drawEvents(options2);
		}
	});
	
	$("#circuitSelector input").puicheckbox({
		change: function(event, checked){
			var circuit = parseInt($(this).val(), 10);
			
			if(checked && options1.selectedCircuits.indexOf(circuit) < 0)
			{
				options1.selectedCircuits.push(circuit);
				options1.selectedCircuits.sort(function (a,b){ if (a===b) {return 0} else if (a < b){ return -1;} else {return 1;} });
			}
			else
			{
				for(var i = 0; i < options1.selectedCircuits.length; i++)
  				{
  					if(circuit === options1.selectedCircuits[i])
  					{
  						options1.selectedCircuits.splice(i,1);
  					}	
  				}
			}
		}
	});
	  		
	$("#circuitSelector2 input").puicheckbox({
		change: function(event, checked){
			var circuit = parseInt($(this).val(), 10);
			
			if(checked && options2.selectedCircuits.indexOf(circuit) < 0)
			{
				options2.selectedCircuits.push(circuit);
				options2.selectedCircuits.sort(function (a,b){ if (a===b) {return 0} else if (a < b){ return -1;} else {return 1;} });
			}
			else
			{
				for(var i = 0; i < options2.selectedCircuits.length; i++)
  				{
  					if(circuit === options2.selectedCircuits[i])
  					{
  						options2.selectedCircuits.splice(i,1);
  					}	
  				}
			}
		}
	});

	$("#rawCircuitSelector").puidialog({
		afterHide:function(){
			if(rawStart && rawEnd && rawSelectedCircuits.length > 0)
				PowerGraph.render(rawSelectedCircuits, rawStart, rawEnd);
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
		if(options1.overviewStartDate && options1.overviewEndDate && options1.selectedCircuits.length > 0)
		{
			$("#loading").puidialog("show");
			
			loadEvents(options1);
		}
	});
	
	$("#load2").button().click(function(){
		if(options2.overviewStartDate && options2.overviewEndDate && options2.selectedCircuits.length > 0)
		{
			$("#loading").puidialog("show");
			
			loadEvents(options2);
		}
	});
	
	$("#selectCircuits").button().click(function(){
		$("#circuitSelector").puidialog("show");
	});
	
	$("#selectCircuits2").button().click(function(){
		$("#circuitSelector2").puidialog("show");
	});
	
	$("#showLevels").click(function(){
		$("#circuitLevels").css("z-index", "2");
		$("#circuitQuery").css("z-index", "1");
		$(this).toggleClass("pui-tabview-selected ui-state-active");
		$("#showHistograms").toggleClass("pui-tabview-selected ui-state-active");
	});
	
	$("#showHistograms").click(function(){
		$("#circuitLevels").css("z-index", "1");
		$("#circuitQuery").css("z-index", "2");
		$(this).toggleClass("pui-tabview-selected ui-state-active");
		$("#showLevels").toggleClass("pui-tabview-selected ui-state-active");
	});
	
	$("#showLegend").click(function(){
		$("#legend").puidialog("show");
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
					options1.overviewStartDate = new Date(selectedDate);
				}
			});
	  	  	$("#endDate").datepicker({
	  	  		minDate: dateRange.start,
			maxDate: dateRange.end,
			onClose: function( selectedDate ) {
					$( "#startDate" ).datepicker( "option", "maxDate", selectedDate !== "" ? selectedDate : dateRange.end);
					options1.overviewEndDate = new Date(selectedDate);
				}
	  	  	});
	  	  	options1.overviewStartDate = $("#startDate").datepicker("getDate");
	  		options1.overviewEndDate = $("#endDate").datepicker("getDate");
	  		
	  		$("#startDate2").datepicker({
			minDate: dateRange.start,
			maxDate: dateRange.end,
			onClose: function( selectedDate ) {
				$( "#endDate2" ).datepicker( "option", "minDate", selectedDate !== "" ? selectedDate : dateRange.start);
				options2.overviewStartDate = new Date(selectedDate);
			}
		});
  	  	$("#endDate2").datepicker({
  	  		minDate: dateRange.start,
		maxDate: dateRange.end,
		onClose: function( selectedDate ) {
				$( "#startDate2" ).datepicker( "option", "maxDate", selectedDate !== "" ? selectedDate : dateRange.end);
				options2.overviewEndDate = new Date(selectedDate);
			}
  	  	});
  	  	options2.overviewStartDate = $("#startDate2").datepicker("getDate");
  		options2.overviewEndDate = $("#endDate2").datepicker("getDate");
		});
}