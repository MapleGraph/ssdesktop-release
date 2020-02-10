(function (namespace, $) {
	"use strict";


	var DemoDashboard = function () {
		// Create reference to this instance
		var o = this;
		// Initialize app when document is ready
		$(document).ready(function () {

			// var promise = sendData('getDashStats');
			//  promise.success(function(data){
			// 	var dashboardData = JSON.parse(data);
			// 	var chartData = dashboardData.chart.salesData;
			// 	 o.initialize(chartData, dashboardData);
				 
			// });

			// $('#getDashboardData').click(function(){
			// 	var promise = sendData('getDashStats');
			// 	 promise.success(function(data){
			// 		var dashboardData = JSON.parse(data);
			// 		var chartData = dashboardData.chart.salesData;
			// 		 o.initialize(chartData, dashboardData);
			// 	});
			// });

			if ( $.isFunction($.fn.daterangepicker)) {


			    var start = moment();
			    var end = moment();

			    function cb(start, end) {
					$('#fromDate').val(start.format('Do MMM YYYY'));
					$('#toDate').val(end.format('Do MMM YYYY'));
					var headerLabel = 'Dashboard |  '+start.format('Do MMM YYYY') +' - '+ end.format('Do MMM YYYY');
			        $('#setFeatureHeader').text(headerLabel);

					var promise = sendData('getDashStats');
					 promise.success(function(data){
						var dashboardData = JSON.parse(data);
						// var chartData = dashboardData.chart.salesData;
						var chartData = [];
						 o.initialize(chartData, dashboardData);
					});

			    }

			    $('#getDashboardData').daterangepicker({
			        startDate: start,
			        endDate: end,
			        opens:'right',
			        alwaysShowCalendars:true,
			        autoApply:true,
			        ranges: {
			           'Today': [moment(), moment()],
			           'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
			           'Last 7 Days': [moment().subtract(6, 'days'), moment()],
			           'Last 30 Days': [moment().subtract(29, 'days'), moment()],
			           'This Month': [moment().startOf('month'), moment().endOf('month')],
			           'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
			        }
			    }, cb);

			    cb(start, end);
				$('#getDashboardData').on('apply.daterangepicker', function(ev, picker) {
				  $('#fromDate').val(picker.startDate.format('Do MMM YYYY'));
				  $('#toDate').val(picker.endDate.format('Do MMM YYYY'));
				  var headerLabel = 'Dashboard |  '+picker.startDate.format('Do MMM YYYY') +' - '+ picker.endDate.format('Do MMM YYYY');
				  $('#setFeatureHeader').text(headerLabel);
					
					// var promise = sendData('getDashStats');
					//  promise.success(function(data){
					// 	var dashboardData = JSON.parse(data);
					// 	var chartData = dashboardData.chart.salesData;
					// 	 o.initialize(chartData, dashboardData);
					// });
				  
				});	    
			
			}else{
				
				// console.log(today);
			}


		});

	};
	var p = DemoDashboard.prototype;

	// =========================================================================
	// MEMBERS
	// =========================================================================

	p.rickshawSeries = [[], []];
	p.rickshawGraph = null;
	p.rickshawRandomData = null;
	p.rickshawTimer = null;

	// =========================================================================
	// INIT
	// =========================================================================

	p.initialize = function (chartData,dashboardData) {
		//this._initSparklines();
		this._initFlotVisitors(chartData);
		//this._initRickshaw();
		//this._initKnob();
		//this._initFlotRegistration();
		this._changeValues(dashboardData);
		//this._initDatePicker();
	};

	p.updateValues = function(getData){
		this._changeValues(getData);
	}
	// =========================================================================
	// Sparklines
	// =========================================================================

	p._changeValues = function(data){

		if (data.grossSales == '' || data.grossSales == 'undefined') {
			data.grossSales == 0.00;
		}
		if (data.orderCount == '' || data.orderCount == 'undefined') {
			data.orderCount == 0.00;
		}
		var getCurr = currFormat.format(0);
		var currCode = getCurr[0];

		if (data.grossSales > 0) {
			$('#grossSaleToday').text(currCode + " " + currencyFormat((data.grossSales).toString()))
		}else{
			$('#grossSaleToday').text(currCode + " " + data.grossSales);
		}

		if (data.netSales > 0) {
			$('#netSaleToday').text(currCode + " " + currencyFormat((data.netSales).toString()))
		}else{
			$('#netSaleToday').text(currCode + " " + data.netSales);
		}
		
		$('#totalOrderToday').text(data.orderCount);

		var grossSalesNew = data.grossSales;
		var grossSalesOld = data.grossSalesOld;

		if (grossSalesOld > 0) {
			var grossChange = ((grossSalesNew - grossSalesOld)/grossSalesOld)*100;
			grossChange = Math.round(grossChange * 100) / 100;	
		}else{
			var grossChange = 0;
		}

		
		if (grossChange < 0) {
			$('#grossPointer').attr('class','fa fa-sort-desc');
		}
		// $('#grossPerformance').text(grossChange + '%');
		

		var netSalesNew = data.netSales;
		var netSalesOld = data.netSalesOld;

		if (netSalesOld > 0) {
			var netChange = ((netSalesNew - netSalesOld)/netSalesOld)*100;
			netChange = Math.round(netChange * 100) / 100;	
		}else{
			var netChange = 0;
		}
		
		if (netChange < 0) {
			$('#netPointer').attr('class','fa fa-sort-desc');
		}
		// $('#netPerformance').text(netChange + '%');

		var orderCountNew = data.orderCount;
		var orderCountOld = data.orderCountOld;

		if (orderCountOld > 0) {
			var orderChange = ((orderCountNew - orderCountOld)/orderCountOld)*100;
			orderChange = Math.round(orderChange * 100) / 100;	
		}else{
			var orderChange = 0;
		}
		
		if (orderChange < 0) {
			$('#orderPointer').attr('class','fa fa-sort-desc');
		}
		// $('#orderPerformance').text(orderChange + '%');
		
	 	$('#newCustomer').text(data.newCustomerCount);
	 	$('#totalCustomer').text(data.totalCustomerCount);

	 	if (data.payment.length > 0) {
		 	for (var i = 0; i < data.payment.length; i++) {
		 		var paymentType = data.payment[i].paymentType;
		 		var paymentSales = data.payment[i].grossSales;
		 		if (paymentSales > 0) {
		 			paymentSales = currencyFormat((paymentSales).toString());
		 		}
		 		if (paymentType == 'PAYMENT_CASH') {
		 			$('#cash').text(currCode + " " +paymentSales);		
		 		}else if (paymentType == 'PAYMENT_CARD') {
		 			$('#card').text(currCode + " " +paymentSales);	

		 		}else if (paymentType == 'PAYMENT_VOUCHER') {
		 			$('#voucher').text(currCode + " " +paymentSales);		
		 		}else if (paymentType == 'PAYMENT_NO_CHARGE') {
		 			$('#nc').text(currCode + " " +paymentSales);		
		 		}else if (paymentType == 'PAYMENT_WALLET') {
		 			$('#wallet').text(currCode + " " +paymentSales);		
		 		}else if (paymentType == 'PAYMENT_CHEQUE') {
		 			$('#cheque').text(currCode + " " +paymentSales);		
		 		}else if (paymentType == 'PAYMENT_CREDIT') {
		 			$('#credit').text(currCode + " " +paymentSales);		
		 		}
		 	}

		 }else{
		 	$('#cash').text(currCode + " 0.00");
		 	$('#card').text(currCode + " 0.00");
		 	$('#voucher').text(currCode + " 0.00");
		 	$('#nc').text(currCode + " 0.00");
		 	$('#wallet').text(currCode + " 0.00");
		 	$('#cheque').text(currCode + " 0.00");
		 	$('#credit').text(currCode + " 0.00");				
		 }
	 		
        /*
	 		var j = 1;
			for (var i = 0; i < data.topItemSales.length; i++) {
				if (data.topItemSales[i].variantName != '' && data.topItemSales[i].variantName != null) {
					var productName = data.topItemSales[i].productName + " ("+ data.topItemSales[i].variantName +")";	
				}else{
					var productName = data.topItemSales[i].productName;
				}

				var unitName = data.topItemSales[i].unitName;
				
				var varCount = data.topItemSales[i].variantCount;
				var prodSales = data.topItemSales[i].grossSales;

				if (prodSales > 0) {
					prodSales = currencyFormat(prodSales);
				}
				var getDiv = '';
				// if (i == 0) {
				// 	$('#topItems1').children('#itemNumber').text(j + ".");
				// 	$('#topItems1').children('#itemName').text(productName);
				// 	$('#topItems1').children('#itemCount').text(varCount);
				// 	$('#topItems1').children('#itemGrossSales').text("₹" + prodSales);
				// }else{
				// 	getDiv = $('#topItems1').clone().appendTo('#topItems');

				// 	getDiv.children('#itemNumber').text(j+ ".");
				// 	getDiv.children('#itemName').text(productName);
				// 	getDiv.children('#itemCount').text(varCount);
				// 	getDiv.children('#itemGrossSales').text("₹" + prodSales);
				// }

				$('#prodName' + j).text(productName);
				$('#prodQuant' + j).text(varCount);
				$('#prodSale' + j).text(currCode + " " +prodSales);

				j++;

			}
			*/
			/*

			for (var g = j; g < 6; g++) {
				var productName = '-';
				var varCount = 0.00;
				var prodSales = 0.00;
				$('#prodName' + j).text(productName);
				$('#prodQuant' + j).text(varCount);
				$('#prodSale' + j).text(currCode + " " +prodSales);

				j++;
			}
			*/
            
            /*
	 		var k = 1;
			for (var i = 0; i < data.topCatSales.length; i++) {
				var categoryName = data.topCatSales[i].categoryName;
				if (categoryName == '') {
					categoryName = 'None';
				}
				var catCount = data.topCatSales[i].catCount;
				var catSales = data.topCatSales[i].grossSales;

				if (catSales > 0) {
					catSales = currencyFormat(catSales);	
				}
				var getDiv = '';
				// if (i == 0) {
				// 	$('#topCat1').children('#catNumber').text(k + ".");
				// 	$('#topCat1').children('#catName').text(categoryName);
				// 	$('#topCat1').children('#catCount').text(catCount);
				// 	$('#topCat1').children('#catGrossSales').text("₹" + catSales);
				// }else{
				// 	getDiv = $('#topCat1').clone().appendTo('#topCat');

				// 	getDiv.children('#catNumber').text(k + ".");

				// 	getDiv.children('#catName').text(categoryName);
				// 	getDiv.children('#catCount').text(catCount);
				// 	getDiv.children('#catGrossSales').text("₹" + catSales);
				// }
				$('#catName' + k).text(categoryName);
				$('#catQuant' + k).text(catCount);
				$('#catSale' + k).text(currCode + " " +catSales);

				k++;

			}
			*/

			/*

			for (var g = k; g < 6; g++) {
				var categoryName = '-';
				var catCount = 0.00;
				var catSales = 0.00;
				$('#catName' + k).text(categoryName);
				$('#catQuant' + k).text(catCount);
				$('#catSale' + k).text(currCode + " " +catSales);

				k++;
			}
			*/


	 		var k = 1;
			for (var i = 0; i < data.topChainSales.length; i++) {
				var brandName = data.topChainSales[i].brandName;
				
				var chainGross = data.topChainSales[i].grossSales;
				var chainNet = data.topChainSales[i].netSales;
				if (chainGross > 0) {
					chainGross = currencyFormat((chainGross).toString());
				}

				if (chainNet > 0) {
					chainNet = currencyFormat((chainNet).toString());
				}
				var getDiv = '';
				// if (i == 0) {
				// 	$('#topStore1').children('#storeNumber').text(k + ".");
				// 	$('#topStore1').children('#storeName').text(storeName);
				// 	$('#topStore1').children('#storeGrossSales').text("₹" + storeSales);
				// }else{
				// 	getDiv = $('#topStore1').clone().appendTo('#topStore');

				// 	getDiv.children('#storeNumber').text(k + ".");
				// 	getDiv.children('#storeName').text(storeName);
				// 	getDiv.children('#storeGrossSales').text("₹" + storeSales);
				// }

				$('#storeName' + k).text(brandName);
				$('#storeGross' + k).text(currCode + " " +chainGross);
				$('#storeNet' + k).text(currCode + " " +chainNet);

				k++;


			}

			for (var g = k; g < 6; g++) {
				var chainName = '-';
				var chainGross = 0.00;
				var chainNet = 0.00;
				$('#storeName' + k).text(chainName);
				$('#storeGross' + k).text(currCode + " " +chainGross);
				$('#storeNet' + k).text(currCode + " " +chainNet);

				k++;
			}


	}

	// =========================================================================
	// Date Picker
	// =========================================================================

	p._initDatePicker = function () {
		if (!$.isFunction($.fn.datepicker)) {
			return;
		}

		$('#demo-date').datepicker({autoclose: true, todayHighlight: true});
		$('#demo-date-month').datepicker({autoclose: true, todayHighlight: true, minViewMode: 1});
		$('#demo-date-format').datepicker({autoclose: true, todayHighlight: true, format: "yyyy/mm/dd"});
		$('#demo-date-range').datepicker({todayHighlight: true});
		$('#demo-date-inline').datepicker({todayHighlight: true});
	};

	p._initSparklines = function () {
		// Generate random sparkline data
		var points = [20, 10, 25, 15, 30, 20, 30, 10, 15, 10, 20, 25, 25, 15, 20, 25, 10, 67, 10, 20, 25, 15, 25, 97, 10, 30, 10, 38, 20, 15, 82, 44, 20, 25, 20, 10, 20, 38];

		materialadmin.App.callOnResize(function () {
			var options = $('.sparkline-revenue').data();
			options.type = 'line';
			options.width = '100%';
			options.height = $('.sparkline-revenue').height() + 'px';
			options.fillColor = false;
			$('.sparkline-revenue').sparkline(points, options);
		});

		materialadmin.App.callOnResize(function () {
			var parent = $('.sparkline-visits').closest('.card-body');
			var barWidth = 6;
			var spacing = (parent.width() - (points.length * barWidth)) / points.length;

			var options = $('.sparkline-visits').data();
			options.type = 'bar';
			options.barWidth = barWidth;
			options.barSpacing = spacing;
			options.height = $('.sparkline-visits').height() + 'px';
			options.fillColor = false;
			$('.sparkline-visits').sparkline(points, options);
		});
	};

	// =========================================================================
	// FLOT
	// =========================================================================

	p._initFlotVisitors = function (chartData) {
		var o = this;
		var chart = $("#flot-visitors");

		// Elements check
		if (!$.isFunction($.fn.plot) || chart.length === 0) {
			return;
		}

		// Chart data
		var data = [
			{
				label: 'Pageviews',
				data: [
					[moment().subtract(168, 'hours').valueOf(), 50],
					[moment().subtract(144, 'hours').valueOf(), 620],
					[moment().subtract(108, 'hours').valueOf(), 380],
					[moment().subtract(70, 'hours').valueOf(), 880],
					[moment().subtract(30, 'hours').valueOf(), 450],
					[moment().subtract(12, 'hours').valueOf(), 600],
					[moment().valueOf(), 20]
				],
				last: true
			},
			{
				label: 'Visitors',
				data: [
					[moment().subtract(168, 'hours').valueOf(), 50],
					[moment().subtract(155, 'hours').valueOf(), 520],
					[moment().subtract(132, 'hours').valueOf(), 200],
					[moment().subtract(36, 'hours').valueOf(), 800],
					[moment().subtract(12, 'hours').valueOf(), 150],
					[moment().valueOf(), 20]
				],
				last: true
			}
		];

		// Chart options
		var labelColor = chart.css('color');
		var options = {
			colors: chart.data('color').split(','),
			series: {
				shadowSize: 0,
				lines: {
					show: true,
					lineWidth: false,
					fill: true
				},
				curvedLines: {
					apply: true,
					active: true,
					monotonicFit: false
			   }
			},
			legend: {
				container: $('#flot-visitors-legend')
			},
			xaxis: {
				mode: "time",
				timeformat: "%d %b",
				minTickSize: [1,"day"],
				font: {color: labelColor}
			},
			yaxis: {
				font: {color: labelColor}
			},
			grid: {
				borderWidth: 0,
				color: labelColor,
				hoverable: true
			}
		};
		chart.width('100%');
		var finalChartData = [];
		finalChartData = [{label:chartData.label,data:chartData.data}];

		// Create chart
		var plot = $.plot(chart, finalChartData, options);

		// Hover function
		var tip, previousPoint = null;
		chart.bind("plothover", function (event, pos, item) {
			if (item) {
				if (previousPoint !== item.dataIndex) {
					previousPoint = item.dataIndex;

					var x = item.datapoint[0];
					var y = item.datapoint[1];
					var tipLabel = '<strong>' + $(this).data('title') + '</strong>';
					var tipContent = Math.round(y) + " " + item.series.label.toLowerCase() + " on " + moment(x).format('dddd');

					if (tip !== undefined) {
						$(tip).popover('destroy');
					}
					tip = $('<div></div>').appendTo('body').css({left: item.pageX, top: item.pageY - 5, position: 'absolute'});
					tip.popover({html: true, title: tipLabel, content: tipContent, placement: 'top'}).popover('show');
				}
			}
			else {
				if (tip !== undefined) {
					$(tip).popover('destroy');
				}
				previousPoint = null;
			}
		});
	};

	// =========================================================================
	// Rickshaw
	// =========================================================================

	p._initRickshaw = function () {
		// Don't init a rickshaw graph twice
		if (this.rickshawGraph !== null) {
			return;
		}

		var o = this;

		// Create random data
		this.rickshawRandomData = new Rickshaw.Fixtures.RandomData(50);
		for (var i = 0; i < 75; i++) {
			this.rickshawRandomData.addData(this.rickshawSeries);
		}

		// Update knob charts
		this._updateKnob();

		// Init Richshaw graph
		this.rickshawGraph = new Rickshaw.Graph({
			element: $('#rickshawGraph').get(0),
			width: $('#rickshawGraph').closest('.card-body').width(),
			height: $('#rickshawGraph').height(),
			interpolation: 'linear',
			renderer: 'area',
			series: [
				{
					data: this.rickshawSeries[0],
					color: $('#rickshawGraph').data('color1'),
					name: 'temperature'
				}, {
					data: this.rickshawSeries[1],
					color: $('#rickshawGraph').data('color2'),
					name: 'heat index'
				}
			]
		});

		// Add hover info
		var hoverDetail = new Rickshaw.Graph.HoverDetail({
			graph: this.rickshawGraph
		});

		// Render graph
		this.rickshawGraph.render();

		// Add animated data
		clearInterval(this.rickshawTimer);
		this.rickshawTimer = setInterval(function () {
			o._refreshRickshaw();
		}, 2000);

		materialadmin.App.callOnResize(function () {
			o.rickshawGraph.configure({
				height: $('#rickshawGraph').height(),
				width: $('#rickshawGraph').closest('.card-body').outerWidth()
			});
			o.rickshawGraph.render();
		});
	};

	p._refreshRickshaw = function () {
		this.rickshawRandomData.removeData(this.rickshawSeries);
		this.rickshawRandomData.addData(this.rickshawSeries);
		this.rickshawGraph.update();
		this._updateKnob();
	};

	// =========================================================================
	// KNOB
	// =========================================================================

	p._initKnob = function () {
		if (!$.isFunction($.fn.knob)) {
			return;
		}

		$('.dial').each(function () {
			var options = materialadmin.App.getKnobStyle($(this));
			$(this).knob(options);
		});
	};

	p._updateKnob = function () {
		var val1 = this.rickshawSeries[0][this.rickshawSeries[0].length - 2];
		var val2 = this.rickshawSeries[0][this.rickshawSeries[0].length - 1];

		$({animatedVal: val1.y}).animate({animatedVal: val2.y}, {
			duration: 1200,
			easing: "swing",
			step: function () {
				$('#serverStatusKnob input').val(Math.ceil(this.animatedVal)).trigger("change");
			}
		});
	};

	// =========================================================================
	// FLOT
	// =========================================================================

	p._initFlotRegistration = function () {
		var o = this;
		var chart = $("#flot-registrations");

		// Elements check
		if (!$.isFunction($.fn.plot) || chart.length === 0) {
			return;
		}

		// Chart data
		var data = [
			{
				label: 'Registrations',
				data: [
					[moment().subtract(11, 'month').valueOf(), 1100],
					[moment().subtract(10, 'month').valueOf(), 2450],
					[moment().subtract(9, 'month').valueOf(), 3800],
					[moment().subtract(8, 'month').valueOf(), 2650],
					[moment().subtract(7, 'month').valueOf(), 3905],
					[moment().subtract(6, 'month').valueOf(), 5250],
					[moment().subtract(5, 'month').valueOf(), 3600],
					[moment().subtract(4, 'month').valueOf(), 4900],
					[moment().subtract(3, 'month').valueOf(), 6200],
					[moment().subtract(2, 'month').valueOf(), 5195],
					[moment().subtract(1, 'month').valueOf(), 6500],
					[moment().valueOf(), 7805]
				],
				last: true
			}
		];

		// Chart options
		var labelColor = chart.css('color');
		var options = {
			colors: chart.data('color').split(','),
			series: {
				shadowSize: 0,
				lines: {
					show: true,
					lineWidth: 2
				},
				points: {
					show: true,
					radius: 3,
					lineWidth: 2
				}
			},
			legend: {
				show: false
			},
			xaxis: {
				mode: "time",
				timeformat: "%b %y",
				color: 'rgba(0, 0, 0, 0)',
				font: {color: labelColor}
			},
			yaxis: {
				font: {color: labelColor}
			},
			grid: {
				borderWidth: 0,
				color: labelColor,
				hoverable: true
			}
		};
		chart.width('100%');

		// Create chart
		var plot = $.plot(chart, data, options);

		// Hover function
		var tip, previousPoint = null;
		chart.bind("plothover", function (event, pos, item) {
			if (item) {
				if (previousPoint !== item.dataIndex) {
					previousPoint = item.dataIndex;

					var x = item.datapoint[0];
					var y = item.datapoint[1];
					var tipLabel = '<strong>' + $(this).data('title') + '</strong>';
					var tipContent = y + " " + item.series.label.toLowerCase() + " on " + moment(x).format('dddd');

					if (tip !== undefined) {
						$(tip).popover('destroy');
					}
					tip = $('<div></div>').appendTo('body').css({left: item.pageX, top: item.pageY - 5, position: 'absolute'});
					tip.popover({html: true, title: tipLabel, content: tipContent, placement: 'top'}).popover('show');
				}
			}
			else {
				if (tip !== undefined) {
					$(tip).popover('destroy');
				}
				previousPoint = null;
			}
		});
	};

	// =========================================================================
	namespace.DemoDashboard = new DemoDashboard;
}(this.materialadmin, jQuery)); // pass in (namespace, jQuery):
