var score_filter_from = 1
var score_filter_to = 5
var price_filter_from = 10
var price_filter_to = 60
var clock_from = 6
var clock_to = 24
var current_type = "scatter"
var pop_threshold = 20

var meals_flag = 0;
var cname = "test";
var cid = "";
var cuid = ""
var sid = "0"
var keyword = ""

var chartDom = document.getElementById('map_view');
var myChart = echarts.init(chartDom);
var option;

option = {
	title: {
		text: '',
		left: 'center'
	},
	bmap: {
		center: [104.741722, 31.46402],
		zoom: 12,
		roam: true,
		enableMapClick: false
	},
	visualMap: {
		show: false,
		top: 'top',
		min: 0,
		max: 20,
		seriesIndex: 0,
		calculable: true,
		inRange: {
			color: ['green', 'yellow', 'rgba(218, 68, 83, 0.8)'],
		},
	},
	series: [{
		type: 'scatter',
		coordinateSystem: 'bmap',
		itemStyle: {
			color: 'rgba(218, 68, 83, 0.8)',
		},
		large: true,
		data: [],
		symbolSize: 10,
		encode: {
			value: 2
		},
		label: {
			formatter: '{b}',
			position: 'right',
			show: false
		},
		emphasis: {
			label: {
				show: true
			},
		}
	}]
};

switch_to_scatter()
myChart.on('click', function(param) {
	click_on_shop(param.data)
});

var pieChartDom = document.getElementById('star_pie');
var pieChart = echarts.init(pieChartDom);

pie_option = {
	tooltip: {
		trigger: 'item'
	},
	legend: {
		top: '5%',
		left: 'center'
	},
	series: [{
		type: 'pie',
		radius: ['40%', '70%'],
		avoidLabelOverlap: false,
		itemStyle: {
			borderRadius: 10,
			borderColor: '#fff',
			borderWidth: 2
		},
		label: {
			show: false,
			position: 'center'
		},
		emphasis: {
			label: {
				show: true,
				fontSize: '40',
				fontWeight: 'bold'
			}
		},
		labelLine: {
			show: false
		},
		data: [{
				value: 1048,
				name: '1星'
			},
			{
				value: 735,
				name: '2星'
			},
			{
				value: 580,
				name: '3星'
			},
			{
				value: 484,
				name: '4星'
			},
			{
				value: 1300,
				name: '5星'
			}
		]
	}]
};
pieChart.setOption(pie_option)

var barChartDomP = document.getElementById('price_dist');
var barChartP = echarts.init(barChartDomP);
var barOptionP;
barOptionP = {
	title: {
		text: "该用户消费价格区间分布"
	},
	xAxis: {
		type: 'category',
		data: ['0-15', '15-30', '30-45', '45-60', '60+']
	},
	yAxis: {
		type: 'value'
	},
	series: [{
		data: [120, 200, 150, 80, 70],
		type: 'bar',
		itemStyle:{
			color:"dodgerblue"
		},
		showBackground: true,
		backgroundStyle: {
			color: 'rgba(180, 180, 180, 0.2)'
		}
	}]
};
barChartP.setOption(barOptionP)
barChartP.resize({
	height: 280,
	width: 440
})

var barChartDomT = document.getElementById('time_dist');
var barChartT = echarts.init(barChartDomT);
var barOptionT;
barOptionT = {
	title: {
		text: "该用户消费时间分布"
	},
	xAxis: {
		type: 'category',
		data: ['0-2', '2-4', '4-6', '6-8', '8-10', '10-12', '12-14', '14-18', '18-20', '20-22', '22-24']
	},
	yAxis: {
		type: 'value'
	},
	series: [{
		data: [120, 200, 150, 80, 70, 1, 1, 1, 1, 1, 1, 1],
		type: 'bar',
		itemStyle:{
			color:"dodgerblue"
		},
		showBackground: true,
		backgroundStyle: {
			color: 'rgba(180, 180, 180, 0.2)'
		}
	}]
};
barChartT.setOption(barOptionT)
barChartT.resize({
	height: 280,
	width: 440
})
