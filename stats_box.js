var cover = svg.append('g')
			.attr('width', view_w/3)
			.attr('height', view_h);

cover.append('rect')
	 .classed('cover',true)
     .attr('width', view_w/3)
     .attr('height', view_h)
     .attr("transform", "translate(" + margin.left + "," + 0 + ")")
     .style("fill:white");	

var chart = svg.append("g")
			.classed("display", true)
			.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var chart2 = svg.append("g")
			.classed("display", true)
			.attr("transform", "translate(" + margin.left + "," + view_h/2 + ")");


month_list = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];

//Master object to hold loaded data from each year (so we only load it once)
var chart_data = {};

//Variable to show if we're creating our axes or if they've already been created
var initialize = true;

//Create initial scales for x, y positions, axes, and colors
var x = d3.scale.ordinal()
var y = d3.scale.linear()
var linearColorScale = d3.scale.linear()
var xAxis = d3.svg.axis()
var yAxis = d3.svg.axis()
var yGridlines = d3.svg.axis()

//Initial FIPS value
//Cleveland Co, OK
var FIPS = "40027";

//console.log(type)


//Once initial files (**will be changed to average and current year files**) load, run "county_populate" function
//Load up Cleveland CO OK file
queue().defer(d3.csv, "./county_files/co_40027.csv").await(county_populate);

//Function that runs after data are loaded 
/*function ready(error, mo_counts) {

	//Average for each month will be one of the initial charts --> 2016 data is a placeholder for the time being
	//chart_data['avg'] = JSON.parse(watches_2016);

	//Data for initial month loaded --> 2016 data is a placeholder for the time being
	//chart_data[FIPS] = JSON.parse(watches_2016);

	county_populate(mo_counts);
	
};*/

function drawAxis(params) {

	if(initialize === true){

		//Draw gridlines
		//this.append("g")
		//	.call(params.gridlines)
		//	.classed("gridline", true)
		//	.attr("transform", "translate(0,0)")

		//X axis
		this.append("g")
			.classed("x axis", true)
			.attr("transform","translate("+ 0 +"," + view_h/4 + ")")
			.call(params.axis.x)
				.selectAll("text")
					.classed("x-axis-label", true)
					.style("text-anchor", "end")
					.attr("dx", -8)
					.attr("dy", 4)
					.attr("transform", "translate("+ (-x.rangeBand()/8) + ",0) rotate(-45)")
					.attr("font-size","10px");

		//Y axis
		this.append("g")
			.classed("y axis", true)
			.attr("transform","translate(0," + 0 + ")")
			.call(params.axis.y)

		//y labels
		// this.select(".y.axis")
		// 	.append("text")
		// 	.attr("x", 0)
		// 	.attr("y", 0)
		// 	.style("text-anchor", "middle")
		// 	.attr("transform", "translate(-35," + height/2 + ") rotate(-90)")
		// 	.text("Count");

		//x labels
		this.select(".x.axis")
			.append("text")
			.classed("x axis text", true)
			.attr("x", 0)
			.attr("y", 0)
			.style("text-anchor", "left")
			.attr("transform", "translate(" + 0 + "," + 2*margin.top + ")")
			.text(params.title); 		//If you ever decide to place text below x-axis

	} else if(initialize === false) {
		/*this.selectAll("g.x.axis")
			//.transition()
			//.duration(500)
			//.call(params.axis.x);
		this.selectAll(".x-axis-label")
			.style("text-anchor", "end")
			.attr("dx", -8)
			.attr("dy", 4)
			.attr("transform", "translate("+ (-x.rangeBand()/8) + ",0) rotate(-45)")*/
		this.selectAll("g.y.axis")
			.call(params.axis.y);
		this.select(".x.axis.text")
			.text(params.title)
	}

}

function plot(params){

	//Update x & y functions for most recent data
	//** map calls the stated function on every element in array ('params.data') -- returns new array **
	//** rangeBands controls the x width of the charts **
	x.domain(params.data.map(function(entry) {
			return entry.key
		}))
		.rangeBands([0,view_w/3]);

	y.domain([0,d3.max(params.data, function(d){
			return d.value
		})])
		.range([view_h/4,0]);

	linearColorScale.domain([0,d3.max(params.data, function(d){
			return d.value;
		})]);
	
	//Change colors based on watch type	
	if (type == "a") {
		linearColorScale.range(["#f7fcfd", "#00441b"])
	}
	else if (type == "t") {
		linearColorScale.range(["#fff5f0","#67000d"])
	}
	else {
		linearColorScale.range(["#f7fbff","#08306b"])
	};

	xAxis.scale(x)
		.orient("bottom");

	yAxis.scale(y)
		.orient("left");

	/*yGridlines.scale(y)
		.tickSize(-view_w/10,0,0)
		.tickFormat("")
		.orient("left");*/

	//Draw axes and axes labels
	drawAxis.call(this, params)

	//enter
	this.selectAll(".bar")
		.data(params.data)
		.enter()
			.append("rect")
			.classed("bar", true)

	this.selectAll(".bar-label")
		.data(params.data)
		.enter()
			.append("text")
			.classed("bar-label", true);

	//update
	this.selectAll(".bar")
		.transition()
		.duration(500)
		.attr("x", function(d){
			return x(d.key)
		})
		.attr("y", function(d){
			return y(d.value);
		})
		.attr("width", function(d){	//d represents data to bind, i represents index 									of data
			return x.rangeBand()/2;				//pass width data into x scaling function
		})
		.attr("height", function(d) {
			return view_h/4 - y(d.value);
		})
		.style("fill", function(d){
			return linearColorScale(d.value);
		});

	this.selectAll(".bar-label")
		.transition()
		.duration(500)
		.attr("x", function(d,i){
			return x(d.key)// + (x.rangeBand()/3)
		})
		.attr("y", function(d,i){
			return y(d.value);
		})
		.attr("dx", x.rangeBand()/20)
		.attr("dy", -6)
		.text(function(d){
			//Provide label to one decimal place if the average, but whole number if the monthly total
			if (params.type == "Average") {
				return d.value.toFixed(1);
			} else {
				return d.value
			};
		})
		.attr("font-size","10px");

	//exit()
	/*this.selectAll(".bar")
		.data(params.data)
		.exit()
		.remove();

	this.selectAll(".bar-label")
		.data(params.data)
		.exit()
		.remove();*/
};

function county_clicked() {
	file_str = "./county_files/co_" + FIPS + ".csv"
	queue().defer(d3.csv, file_str).await(county_populate);
};

function push_chart_data(y) {

	//Set mo_bars equal to proper yearly data
	if (type == "t") {
		mo_bars = chart_data[y][0];
		avg_bars = all_averages[0];
	} else if (type == "s") {
		mo_bars = chart_data[y][1];
		avg_bars = all_averages[1];
	} else {
		mo_bars = chart_data[y][2];
		avg_bars = all_averages[2];
	};

	// aFunction.call results in the first argument being "this" in the called function
	plot.call(chart, {
		data: avg_bars,
		axis: {
			x: xAxis,
			y: yAxis
		},
		gridlines: yGridlines,
		title: "Monthly Average (County: " + clicked_co + ")",
		type: "Average"
	});

	plot.call(chart2, {
		data: mo_bars,
		axis: {
			x: xAxis,
			y: yAxis
		},
		gridlines: yGridlines,
		title: curValue + " Monthly Totals (County: " + clicked_co + ")",
		type: "Monthly"
	});

}

function county_populate(error, mo_counts) {

	//test = mo_counts;
	//var avg_bars = [];
	//var mo_bars  = {};
	//var averages = {0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0, 11: 0, 12: 0};

	all_averages = [[],[],[]];
	var avg_hold = [new Array(12).fill(0),new Array(12).fill(0)];


	mo_counts.forEach(function(e){
		
		var tor_arr = [];
		var svr_arr = [];
		var all_arr = [];
		var holding_arr = [];

		//Monthly counts from each year
		for (i = 1; i < 13; i++) {
			var mo_tor = +e[i].split(";")[0];
			var mo_svr = +e[i].split(";")[1];
			var mo_all = mo_tor + mo_svr;
			//console.log([i, mo_tor, mo_svr])
			tor_arr.push({key: month_list[i-1], value: mo_tor});
			svr_arr.push({key: month_list[i-1], value: mo_svr});
			all_arr.push({key: month_list[i-1], value: mo_all});

			avg_hold[0][i-1] = avg_hold[0][i-1] + mo_tor;
			avg_hold[1][i-1] = avg_hold[1][i-1] + mo_svr;
			//avg_hold[2][i-1] = avg_hold[2][i-1] + mo_all;
		};


		var holding_arr = [tor_arr,svr_arr,all_arr];

		//The reason for e[""] is that the years do not have a column name in the monthly csv files
		chart_data[e[""]] = holding_arr;

	});

	avg_hold[0] = avg_hold[0].map(function(x){
		return Math.round(x*10 / mo_counts.length)/10;
	});
	avg_hold[1] = avg_hold[1].map(function(x){
		return Math.round(x * 10 / mo_counts.length)/10;
	});
	//avg_hold[2] = avg_hold[2].map(function(x){
	//	return Math.round(x / mo_counts.length);
	//});

	for (i = 0; i < 12; i++) {
		all_averages[0].push({key: month_list[i], value: avg_hold[0][i]});
		all_averages[1].push({key: month_list[i], value: avg_hold[1][i]});
		all_averages[2].push({key: month_list[i], value: avg_hold[0][i] + avg_hold[1][i]});
	};


	push_chart_data(curValue);

	/*
	//Push monthly watch totals for selected year/county into plot1 dict

	if (type == "a") {
		for (i = 0; i < 12; i++) {

			total = chart_data['2016'][FIPS][month_list[i]]['S'].length + 
				chart_data['2016'][FIPS][month_list[i]]['T'].length

			plot1.push({key: month_list[i], value: total})
			plot2.push({key: month_list[i], value: total})

		}
	} else {
		for (i = 0; i < 12; i++) {
			
			//console.log(i)
			total = chart_data['2016'][FIPS][month_list[i]][type.toUpperCase()].length

			plot1.push({key: month_list[i], value: total})
			plot2.push({key: month_list[i], value: total})
		}
	}
	//console.log(plot1)

	//Push monthly averages for selected county into plot2 dict

	/*for (i = 0; i < 12; i++) {
		var mo_total = 0
		if (type == "a") {
			for (j = 0; j < year_list.length; j++) {
				var datayear = "data" + year_list[j]
				mo_total = mo_total + chart_data['2016'][FIPS][month_list[i]]['S'].length + 
					chart_data['2016'][FIPS][month_list[i]]['T'].length
			}
		} else {
			for (j = 0; i < year_list.length; j++) {

				mo_total = mo_total + chart_data['2016'][FIPS][month_list[i]][type.toUpperCase()].length

			}
		}
		mo_average = mo_total / year_list.length;
		plot2.push({key: month_list[i], value: mo_average});
	}

	plot.call(chart, {
		data: avg_bars,
		axis: {
			x: xAxis,
			y: yAxis
		},
		gridlines: yGridlines,
		title: "Monthly Average (" + clicked_co + ")"
	});

	plot.call(chart2, {
		data: mo_bars,
		axis: {
			x: xAxis,
			y: yAxis
		},
		gridlines: yGridlines,
		title: chart_year
	});*/

	initialize = false;

};