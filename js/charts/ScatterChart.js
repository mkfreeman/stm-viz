// ScatterChart object function -- inherits from Chart
var ScatterChart = function(sets) {
	var self = this 
	defaults = {
		hasAxes:true, 
		hasSvg:true,
		xTickFormat:function(d) {
			if(d3.keys(self.settings.xAxisLabels).length >0) {
				return self.getKeyByValue(self.settings.xAxisLabels, d)
			}				
			var formatter = d3.format('.2s')
			return formatter(d)
		},
		yTickFormat:function(d) {
			if(d3.keys(self.settings.yAxisLabels).length >0) {
				return self.getKeyByValue(self.settings.yAxisLabels, d)
				// return 'test'
			}				
			var formatter = d3.format('.2s')
			return formatter(d)
		},
		hoverFormat:d3.format('.2s'),
		yLine:0, 
		ordinalType:'overwrite',
		legendType:'continuous',
		getHeight:function(chart) {
			var val = chart.settings.legendType == 'continuous' ? 80 : 20
			return $('#' + self.settings.container).innerHeight() - val - $('#bottom').height()
		},
		zoomAble:true,
		pointRadius:10,
		getRadius:function(d) {return 10},
		color:d3.scale.category10(),
		dash:function(d) {
			return "5,0"
		}, 
		showZero:true, 
		strokeWidth:function(d) {return '4px'},
		multiHover:true,
		hasLegend:false,
		hasRect:false,
		xScaleType:'linear',
		getLegend:function(chart){
			return {	
				height:12, 
				width:chart.settings.plotWidth,
				shift:chart.settings.margin.left,
				rectWidth:20, 
			}
		},
	}
	var initSettings = $.extend(false, defaults, sets)
	self.init(initSettings)
}

ScatterChart.prototype = Object.create(Chart.prototype)


// Get data limits
ScatterChart.prototype.getLimits = function() {
	var self = this
	var limits = {x:{}, y:{}}
	if(typeof self.settings.customGetLimits == 'function') {
		return self.settings.customGetLimits(self)
	}
	if(self.settings.xScaleType == 'ordinal') {
		var included = []
		self.settings.data.map(function(d) {
			if(included.indexOf(d.x) == -1) {
				included.push(d.x)
			}
		})
		limits.x.min = -1
		limits.x.max = included.length
	}
	else {
		limits.x.min = d3.min(self.settings.data, function(d) {return d.x}) 
		limits.x.max = d3.max(self.settings.data, function(d) {return d.x}) 
	}
	var values = []
	limits.y.min = self.settings.showZero == true ? 0 : d3.min(self.settings.data, function(d) {return Number(d.y)}) 
	limits.y.max = d3.max(self.settings.data, function(d) {return Number(d.y)}) 
	return limits
}

// Draw elements -- called on build and resize
ScatterChart.prototype.draw = function(resetScale, duration) {
	var self = this
	duration = duration == undefined ? 500 : duration
	if(self.settings.hasLegend == true) self.drawLegend()	
	if(resetScale == true) self.setScales()
	self.getSize()
	if(resetScale == true) self.setScales()
	// draw bubbles
	var circles = self.g.selectAll('.circle').data(self.settings.data, function(d) {return d.id})
	circles.exit().remove()
	circles.enter().append('circle').call(self.circlePositionFunction)
	self.g.selectAll('.circle').transition().duration(500).call(self.circlePositionFunction)
	
	if(self.settings.zoomAble == true && resetScale == true) {
		self.g.call(d3.behavior.zoom().x(self.xScale).y(self.yScale).scaleExtent([1, 8]).on("zoom", self.zoom))
	}
	self.drawLegend()
}

ScatterChart.prototype.drawLegend = function() {
	var self = this
	if(self.settings.legendBuilt != true) {
		self.legendWrapper = self.div.append('div').attr('id', self.settings.id + '-legend-wrapper').style('pointer-events', 'none').style('margin-top', '26px')
		self.legendDiv = self.legendWrapper.append('div').attr('id', self.settings.id + '-legend-div')
		self.legend = self.legendDiv
			.append("svg")		
			.attr('id', self.settings.id + '-legend-svg')

		self.gradient = self.legend
		.append("svg:defs")
			.append("svg:linearGradient")
			.attr("id", "map-gradient")
			.attr("x1", "0%")
			.attr("y1", "0%")
			.attr("x2", "100%")
			.attr("y2", "0%");
		$.extend([],self.settings.colorRange).reverse().forEach(function(d,i){
			self.gradient.append("svg:stop")
				.attr("offset",((i+1)/(12)))
				.attr("stop-color", d)
				.attr('id', 'stop-color-' + i)
		});

		self.legendBar = self.legend.append("g")
		self.legendRect = self.legendBar.append('rect').attr('id', self.settings.id + '-legendrect')

		self.legendLabels = self.legend.append('g')
			.attr('transform', 'translate(' + self.settings.legend.shift+ ',' + (self.settings.legend.height) + ')')
			.attr('class', 'axis')

		self.legendText = self.legend.append('g')
			.attr('transform', 'translate(' + (self.settings.legend.shift -50)+ ',' + (self.settings.legend.height/2 + 5) + ')')
			.append('text')
	}

	self.legend
		.attr("height", self.settings.legend.height + 40)
		.attr("width", self.settings.legend.width + self.settings.legend.shift + 24)
	
	
	self.legendBar
		.attr('transform', 'translate(' + self.settings.legend.shift+',0)')	
	
	self.legendRect		
			.attr('y', '0px')
			.attr('x', '0px')
			.attr('height', self.settings.legend.height)
			.attr('width',  self.settings.legend.width)
			.attr('stroke', 'none')
			.attr('fill', 'url(#map-gradient)')

	self.settings.legendScale.range([0, self.settings.plotWidth])
	self.legendAxes = d3.svg.axis()
		.scale(self.settings.legendScale)
		.orient('bottom')
		.ticks(4)
	
	self.legendLabels
		.call(self.legendAxes);
		
	self.legendText.text(self.settings.legendLabel)

	self.settings.legendBuilt = true

}

ScatterChart.prototype.getKeyByValue = function( obj, value ) {
    for( var prop in obj ) {
        if( obj.hasOwnProperty( prop ) ) {
             if( obj[ prop ] === value )
                 return prop;
        }
    }
}
