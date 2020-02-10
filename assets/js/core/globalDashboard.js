
(function (namespace, $) {
	"use strict";


	var DemoDashboard = function () {
		// Create reference to this instance
		var o = this;
		// Initialize app when document is ready

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

	p.initialize = function (chartData, dashboardData, salesChart, ordersChart, customersChart, cashChart, cardChart, walletChart, voucherChart, partyChart) {
		//this._initSparklines();
		//this._initFlotVisitors(chartData);
		//this._initRickshaw();
		//this._initKnob();
		this._initDashboardCharts(salesChart, 'displaySalesChart','Sales Trends',0);
		this._initDashboardCharts(ordersChart, 'displayOrdersChart','Orders Trends',0);
		this._initDashboardCharts(customersChart, 'displayCustomersChart','Customers Trends',0);

		var paymentChart = [
			{
				label:"Cash",
				data:cashChart,
				last:true
			},

			{
				label:"Card",
				data:cardChart,
				last:true
			},

			{
				label:"Wallet",
				data:walletChart,
				last:true
			},

			{
				label:"Voucher",
				data:voucherChart,
				last:true
			},

			{
				label:"Party Sales",
				data:partyChart,
				last:true
			},
		];

		this._initDashboardCharts(paymentChart,'displayPaymentChart','Payment Trends',1);
		this._changeValues(dashboardData);
		//this._initDatePicker();

	};

	p.updateValues = function(getData){
		this._changeValues(getData);
	};
	// =========================================================================
	// Sparklines
	// =========================================================================

	p._changeValues = function(data){

		$('#chains').text(data.chains);
		$('#stores').text(data.stores);
		$('#licences').text(data.licences);
		$('#totalSales').text("₹" + data.totalSales);
		$('#totalOrders').text(data.totalOrders);
		$('#totalCustomers').text(data.totalCustomers);
		$('#totalOrders').text(data.totalOrders);
	 	$('#totalCashSales').text("₹" + data.totalCashSales);
	 	$('#totalCardSales').text("₹" + data.totalCardSales);
	 	$('#totalWalletSales').text("₹" + data.totalWalletSales);
	 	$('#totalVoucherSales').text("₹" + data.totalVoucherSales);
	 	$('#totalPartySales').text("₹" + data.totalPartySales);

		$('#totalRangeSales').text("₹" + data.rangeTotal.totalSales);
		$('#totalRangeOrders').text(data.rangeTotal.totalOrders);
		$('#totalRangeCustomers').text(data.rangeTotal.totalCustomers);
		$('#totalRangeOrders').text(data.rangeTotal.totalOrders);
	 	$('#totalRangeCashSales').text("₹" + data.rangeTotal.totalCashSales);
	 	$('#totalRangeCardSales').text("₹" + data.rangeTotal.totalCardSales);
	 	$('#totalRangeWalletSales').text("₹" + data.rangeTotal.totalWalletSales);
	 	$('#totalRangeVoucherSales').text("₹" + data.rangeTotal.totalVoucherSales);
	 	$('#totalRangePartySales').text("₹" + data.rangeTotal.totalPartySales);

	 	

	};

	// =========================================================================
	// FLOT
	// =========================================================================

	p._initDashboardCharts = function (data, divELement,label, flag) {
		var o = this;
		var chart = $("#"+ divELement);

		// Elements check
		if (!$.isFunction($.fn.plot) || chart.length === 0) {
			return;
		}

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

		var finalChartData = [];
		if (flag == 0) {
		
		finalChartData = [{label:label,data:data}];

		}else{
			finalChartData = data;
		}

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
