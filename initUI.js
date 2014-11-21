function initUI()
{
	$("#loading").puidialog({modal: true});
  		
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
	  		options2.overviewEndDate = $("#endDate").datepicker("getDate");
	  		
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
  	  	options2.overviewStartDate2 = $("#startDate2").datepicker("getDate");
  		options2.overviewEndDate2 = $("#endDate2").datepicker("getDate");
		});
}