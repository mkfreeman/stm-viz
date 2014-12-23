var settings = {
	textView:{
		id:'textView',
		filePath:'data/output.csv', 
		charts:['scatterChart', 'textChart'], 
		buildChart:function(view, chart, index) {
			switch(chart) {
				case 'scatterChart':
					view.charts[index] = new ScatterChart(settings.scatterChart)
					break
				case 'textChart':
					view.charts[index] = new TextChart(settings.textChart)
					break
				default:
					break;
			}
		}, 
		poshyEvents:[
			{wrapper:'scatterChart-div', klass:'circle', content:function(d){
				var dat = this.__data__
				var text = '<b>' + view.settings.xVar + '</b>: ' + view.charts[0].settings.xTickFormat(Number(dat.x)) + '</br>'
				text += '<b>' + view.settings.yVar + '</b>: ' + view.charts[0].settings.yTickFormat(Number(dat.y)) + '</br>'
				text += dat.text.substr(0, 100) 
				if(dat.text.length>100) text += '...'
				return text
			}},
		], 
		clickEvents: [
			{wrapper:'scatterChart-div', klass:'circle', attribute:'circle-id', setting:'selected'},
		], 
	},
	scatterChart:{
		id:'scatterChart',
		getWidth:function(chart) {return $('#'+chart.settings.container).width()*2/3 - 10}, 
		getMargin:function() { 
			return {
				top:50, 
				bottom:20, 
				right:50, 
				left:150
			}
		}, 
		hasTitle:true, 
		getTitleText:function(chart) {
			return chart.settings.xLabel +  ' v.s. ' + chart.settings.yLabel
		}
	},
	textChart: {
		id:'textChart', 
		getWidth:function(chart) {return $('#'+chart.settings.container).width()/3},
		getPosition:function(chart){return {
			top:0, 
			left:$('#'+chart.settings.container).width()*2/3
		}}

	},
	flow: {
		id:'flow', 
		charts:['sankey'], 
		year:2012, 
		recipient:'Health Focus Area',
		hasTitle:true,
		parentTarget:26,
		// data:data,
		data:{},
		parentNode:25,
		node:25,
		getTitles:function(controller) {
			return ['Source', 'Channel', controller.settings.recipient]
		},
		getTitleText:function() {return 'The Flows of Global Health Finances'},
		buildChart:function(view, chart, i) {
		switch(chart) {
			case 'sankey':
				view.charts[i] = new SankeyChart(settings[chart]) 
				break;
			default:
				break;
		
			}
		}, 
		clickEvents: [
			{wrapper:'sankey-div', klass:'node', attribute:'node-id', setting:'node', default:function(view) {return view.settings.parentNode}},
			{wrapper:'sankey-div', klass:'link', attribute:'source-id', setting:'node', default:function(view) {return view.settings.parentNode}},
		], 
		poshyEvents:[
			{wrapper:'sankey-div', klass:'link', content:function(d){
				var valueFormat = d3.format('.2s')
				var pctFormat = d3.format('.2%')
				var dat = this.__data__
				if(dat == undefined) return
				var source = dat.source.name 
				var target = dat.target.name 
				var sourcePct = pctFormat(dat.value / dat.source.value)
				var targetPct = pctFormat(dat.value / dat.target.value)
				var value = valueFormat(dat.value).replace('G','B')
				var text = '<div style="font-size:1.3em; text-align:center;">' + source + ' \u2192 '+ target + '</div>'
				text += '<div style="text-align:center;"><b>$' + value + '</b></div><div style="text-align:center;">'
				if(sourcePct != '100.00%') {
					text += '<b>' + sourcePct + '</b> of given<b>' 
					if(targetPct!='100.00%') text += ' || '
				}
				if(targetPct != '100.00%') {
					text += '<b>' + targetPct+'</b> of received</div>'
				}
				return text
			}},
		]
	},
	sankey:{
		id:'sankey', 
		container:'container', 
	},
	app:{
		container:"container", 
		id:'app', 
		viewName:'flow', 
		baseURL:'',
		shortener:"http://prototypes-dev.ihme.washington.edu/url-shortener/shorten.php",
		hoverText:{
			'Trends':'View trends in development assistance for health by source, channel, recipient region, and health focus area', 
			'Flows':'Explore how development assistance for health flows from source to channel to health focus areas and geographic regions', 
			'Comparisons':'Map development assistance for health given or received, relative to population, government health expenditure, DALYs, and GDP',
		}

	},
	trend:{
		id:'trend',
		measure:'channel', 
		getFilter_menu:function(chart, t) {
			if(chart.settings.filter_menu != undefined && t != true) {
				return chart.settings.filter_menu
			}
			switch(chart.settings.measure) {
				case 'source':
					return 'channel'
				case 'region':
					return 'health focus area'
				case 'health focus area':
					return 'source'
				case 'channel':
					return 'source'
			}
		},
		filter:'none',
		colors:d3.scale.category20c(),
		filter_value:'all', 
		year:1990,
		year_range:[1990,2014],
		yview:'num',
		change:'num',
		container:'container',
		uncertainty:true,
		chartNames:['stack', 'bar'], 
		stack:{
			id:'stack',
			gap:20,

			getWidth:function(chart) {return chart.settings.size == 'full' ? settings.chartWidth : settings.chartWidth/2}, 
			getHeight:function(chart) { 
				return chart.settings.size == 'full' ? settings.chartHeight : settings.chartHeight
			}, 
			getMargin: function(chart) {
				var bottom = chart.settings.size == 'full' ? 90 : 90
				var right = chart.settings.size == 'full' ? 250 : 0
				return  {top: 20, right:right, bottom: bottom, left: 70}
			},
			barHeight:20,
			formatter:{
				x:d3.format('0'), 
				y:d3.format('0'), 
			},
			getPosition: function(chart) {
				var top = chart.settings.size == 'full' ? 0 : 0
				var left = chart.settings.size == 'full' ? 0 :settings.chartWidth*2/3
				return {
				top: top,
				left: left
			}},
			barTip:true,
			spacing:.2, 
			legend:{
				rectWidth:20,
			},
			hideticks:false
		},
		line:{
			id:'line',
			getWidth:function(chart) {return chart.settings.size == 'full' ? settings.chartWidth : settings.chartWidth/3}, 
			getHeight:function(chart) { 
				return chart.settings.size == 'full' ? settings.chartHeight : settings.chartHeight/2
			}, 
			getMargin: function() {return  {top: 20, right:40, bottom: 70, left: 70}},
			barHeight:20,
			formatter:{
				x:d3.format('0'), 
				y:d3.format('0'), 
			},
			getPosition: function(chart) {
				var top = chart.settings.size == 'full' ? 0 : settings.chartHeight/2
				var left = chart.settings.size == 'full' ? 0 :settings.chartWidth*2/3
				return {
				top: top,
				left: left
			}},
			colors:['green', 'purple'], 
			lineTip:false,
		},
		bar:{
			id:'bar',
			sortby:'value',
			legTip:true,
			getWidth:function(chart) {return chart.settings.size == 'full' ? settings.chartWidth : settings.chartWidth/2}, 
			getHeight:function(chart) { 
				return chart.settings.size == 'full' ? settings.chartHeight : settings.chartHeight
			}, 
			getMargin: function(chart) {
				var bottom = chart.settings.size == 'full' ? 90 : 90
				return  {top: 20, right:40, bottom: bottom, left: 250}
			},
			barHeight:20,
			formatter:{
				x:d3.format('0'), 
				y:d3.format('0'), 
			},
			getPosition: function(chart) {
				var top = chart.settings.size == 'full' ? 0 : 0
				var left = chart.settings.size == 'full' ? 0 :settings.chartWidth/2
				return {
				top: top,
				left: left
			}},
			barTip:true,
			controlWrapper:'bar-controller',
			clickClass:'bar', 
			clickSetting:'location_id',
			spacing:.2, 
			hideticks:{
				x:false, 
				y:true
			},
			legend:{
				rectWidth:20,
			}
		},
	},
	compare: {
		measure:'recipient', 
		health_focus:'none',
		filter_menu:'health focus area',
		year:2012,
		denominator:'pop',
		id:'compare', 
		container:'container', 
		chartNames:['map', 'scatter'],
		map: {
			id:'map',
			resizable:true,
			getHeight:function(chart) {return chart.settings.size == 'full' ? settings.chartHeight - chart.settings.legend.space: settings.chartHeight - chart.settings.legend.space}, 
			getWidth:function(chart) {return chart.settings.size == 'full' ? settings.chartWidth : settings.chartWidth*2/3},
			getScale:function(chart){
				// var scale = chart.settings.size == 'full' ? settings.mapScale * 2 : settings.mapScale;
				return 1100
			},
			getProjection:function(controller) {
				var self = controller
				var scale = self.settings.getScale(self);
				// var scale = 1000;
				var translate = [-15,40]
				function flat_proj(coordinates) { var x = (coordinates[0]) / 360,	y = (-coordinates[1]) / 360; return [ scale * x + translate[0], scale * Math.max(-.5, Math.min(.5, y)) + translate[1]]; }
				flat_proj.scale = function(x) { if (!arguments.length) return scale; scale = +x; return flat_proj; };
				flat_proj.translate = function(x) { if (!arguments.length) return translate; translate = [+x[0], +x[1]]; return flat_proj; };
				return flat_proj;	
			}, 	
			getScaleDirection: function() {
				var dir = 'negative'
				return dir
			},
			margin: {
				top:0, 
				bottom:75, 
				left:20, 
				right:0,
			
			},
			density:{
				height:40,
			},
			formatter: {
				legend:function(d) {
					var value = Math.pow(Math.E, d) 
					var formatType = value<.01 ? '.2e' : '.2s'
					var formatter = d3.format(formatType)
					return formatter(value)
				}, 
				hover: function(d) {
					var value = d
					var formatType = value<.01 ? '.2e' : '.2s'
					var formatter = d3.format(formatType)
					return formatter(value)
				}, 
				slider:function(d) {
					var value = Math.pow(Math.E, d)
					var formatType = value<.01 ? '.1s' : '.1s'
					var formatter = d3.format(formatType)
					return formatter(value).replace('0.', '.')
				}, 
			},
			maxZoom: 20,
			minZoom: .5,
			scale: 1,
			size:'full',
			translate: [0,0],
			sex: 'Male',
			year: 1989,
			county: null,
			colorClass: 'RdYlBu',
			colorSteps: 11,
			scaleFormat: 'd',
			stroke: {
				selected: 2,
				county: .25,
				state: 1
			},
			legend: {							 
				ticks: 10,
				height: 20,
				space:90,
				margin: {
					right: 15, 					 
					left: 15
				}, 
				shift:20
			},
			clickClass:['path', 'map-circle'], 
			clickSetting:['location_id','location_id'],
			clickWrapper:['map', 'map'], 
			tipContent:function(obj) {
				var self = app.view.charts[0]
				var location_id = obj.properties == undefined? obj.location_id : obj.properties.location_id
				var xvar = settings.measuremap[self.settings.xvar]
				var xval =	self.settings.formatter.x(obj.numerator).replace('G', 'B') 
				var yval =	self.settings.formatter.hover(obj.denominator).replace('G', 'B') 
				var ratio = self.settings.formatter.hover(obj.numerator/obj.denominator)
				var yvar = settings.measuremap[self.settings.yvar]
				var text = '<font size = "3"><b>' + settings.locationsMap[location_id] +  '</b><br/>' 
				if(obj.value == undefined) {
					return text
				}
				if(self.settings.yvar == 'none') {
					text += '<b>' + xvar  + ': </b> ' + xval + '</br>'
				}
				else {
					text += '<b>' + yvar  + ': </b> ' + yval + '</br>'
					text += '<b>' + xvar  + ': </b> ' + xval + '</br>'
					text += '<b>' + xvar + '/' + yvar + ': </b>' + ratio
				}
				return text
			},
		},
		scatter: {
			id:'scatter',
			getWidth:function(chart) {return chart.settings.size == 'full' ? settings.chartWidth : settings.chartWidth/3}, 
			getHeight:function(chart) { 
				return chart.settings.size == 'full' ? settings.chartHeight : settings.chartHeight
			}, 
			getMargin: function() {return  {top: 20, right:40, bottom: 90, left: 100}},
			barHeight:20,
			formatter:{
				x:d3.format('0'), 
				y:d3.format('0'), 
			},
			getPosition: function(chart) {
				var top = chart.settings.size == 'full' ? 0 : 0
				var left = chart.settings.size == 'full' ? 0 :settings.chartWidth*2/3
				return {
				top: top,
				left: left
			}},
			radius:5,
			colors:['green', 'purple'], 
			lineTip:false,
			clickClass:'point', 
			clickSetting:'location_id',
			clickWrapper:'scatter'
		},
	},
	sexmap: {
		1:'male', 
		2:'female', 
		3:'both'
	}, 
	measuremap:{
		none: '...', 
		pop: 'Population',
		daly: 'Disability Adjusted Life Years',
		gdp: 'Gross Domestic Product',
		ghes: 'Government Health Expenditure as Source',
		recipient:'Development assistance for health received', 
		source:'Development assistance for health  given'
	},
	denominators:{
		none: '...', 
		pop:'Population',
		daly: 'Disability Adjusted Life Years',
		gdp:'Gross Domestic Product',
		ghes:'Government Health Expenditure as Source',
	}
}


