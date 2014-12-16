// ScatterChart object function -- inherits from Chart
var ScatterChart = function(sets) {
	var self = this 
	defaults = {
		hasAxes:true, 
		hasSvg:true,
		xTickFormat:d3.format('.2s'),
		hoverFormat:d3.format('.2s'),
		yLine:0, 
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
		getLegend: function(chart) {
			return {
				width:chart.settings.plotWidth, 
				height:100,
				minElementWidth:100,
				elementHeight:30,
			}
		}, 
		xScaleType:'linear'
	}
	var initSettings = $.extend(false, defaults, sets)
	self.init(initSettings)
}

ScatterChart.prototype = Object.create(Chart.prototype)


// Get data limits
ScatterChart.prototype.getLimits = function() {
	var self = this
	if(typeof self.settings.customGetLimits == 'function') {
		return self.settings.customGetLimits(self)
	}
	var limits = {x:{}, y:{}}
	var values = []
	limits.x.min = d3.min(self.settings.data, function(d) {return d.x}) 
	limits.x.max = d3.max(self.settings.data, function(d) {return d.x}) 
	limits.y.min = self.settings.showZero == true ? 0 : d3.min(self.settings.data, function(d) {return Number(d.y)}) 
	limits.y.max = d3.max(self.settings.data, function(d) {return Number(d.y)}) 
	return limits
}

// Draw elements -- called on build and resize
ScatterChart.prototype.draw = function(build, reset, changeOpacity, duration) {
	var self = this
	duration = duration == undefined ? 500 : duration
	if(self.settings.hasLegend == true) self.drawLegend()	
	console.log('scatter draw get size ')
	self.getSize()
	self.setScales()
	// draw bubbles
	var circles = self.g.selectAll('.circle').data(self.settings.data, function(d) {return d.id})
	circles.exit().remove()
	circles.enter().append('circle').call(self.circlePositionFunction)
	self.g.selectAll('.circle').transition().duration(500).call(self.circlePositionFunction)

	if(self.settings.zoomAble == true) {
		self.g.call(d3.behavior.zoom().x(self.xScale).y(self.yScale).scaleExtent([1, 8]).on("zoom", self.zoom))
	}
}
