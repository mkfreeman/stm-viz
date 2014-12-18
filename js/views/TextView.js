// View for Chart1 -- inherited from SingleView
var TextView = function(sets) {
	var self = this 
	defaults = {
		xVar:'Topic 1', 
		yVar:'Topic 2',
		radiusVar:'Topic 1', 
		colorVar:'Topic 1',
		minRadius:2, 
		colorRange:colorbrewer['RdYlBu'][11],
		maxRadius:15,
		group:'All NCDs',
		selected:100,
		hasControls:true,  
	}
	var initSettings = $.extend(false, defaults, sets)
	self.init(initSettings)
}

TextView.prototype = Object.create(SingleView.prototype)

TextView.prototype.prepData = function(chart) {
	var self = this
	switch(chart) {
		case 'scatterChart':
			settings[chart].data = self.settings.data.map(function(d, i) {
				var id = self.settings.idVariable == undefined ? i : d[self.settings.id]
				return {x:d[self.settings.xVar], y:d[self.settings.yVar], id:id, text:d.body, radiusValue:d[self.settings.radiusVar], colorValue:Number(d[self.settings.colorVar])}
			})
			settings[chart].xLabel = self.settings.xVar
			settings[chart].yLabel = self.settings.yVar
			self.setRadius()
			self.setColor()
			break
		case 'textChart':
			settings[chart].text = self.settings.data.filter(function(d){return d.id == self.settings.selected})[0].body
			break
	}
	
}

TextView.prototype.setRadius = function() {
	var self = this
	if(self.settings.radiusVar == 'none') {
		settings['scatterChart'].getRadius = function(d) {return 10}
	}
	else {
		var min = d3.min(self.settings.data, function(d){return Number(d[self.settings.radiusVar])})
		var max = d3.max(self.settings.data, function(d){return Number(d[self.settings.radiusVar])})
		var radScale = d3.scale.linear().range([self.settings.minRadius, self.settings.maxRadius]).domain([min,max])
		settings['scatterChart'].getRadius = function(d) {return radScale(d.radiusValue)}	
	}
	settings['scatterChart'].getElementSize = function() {
		var size = self.settings.radiusVar == 'none' ? 10 : self.settings.maxRadius
		return {width:size, height:size}
	}
}

TextView.prototype.setColor = function() {
	var self = this
	settings['scatterChart'].colorRange = self.settings.colorRange
	if(self.settings.colorVar == 'none') {
		settings['scatterChart'].getColor = function(d) {return 10}
	}
	else {
		var min = d3.min(self.settings.data, function(d){return Number(d[self.settings.colorVar])})
		var max = d3.max(self.settings.data, function(d){return Number(d[self.settings.colorVar])})
		var colorDomain = d3.range(max,min, -(max - min)/11)
		var colorScale = d3.scale.linear().range(self.settings.colorRange).domain(colorDomain)
		settings['scatterChart'].getColor = function(d) {return colorScale(d.colorValue)}	
	}
}

TextView.prototype.loadData = function(callback) {
	var self = this
	if(self.charts == undefined) self.charts = []
	if(self.settings.loadedData != true) {
		d3.csv(self.settings.filePath, function(data) {
			self.settings.data = data.filter(function(d,i){
				if(d.id == undefined) d.id = i
				return i<1000} 
			)
			self.settings.loadedData = true
			if(typeof callback == 'function') {
				callback()

			}
		})
	}
	else {
		if(typeof callback == 'function') {
			callback()
		}
	}
}

TextView.prototype.getControlValues = function() {
	var self = this
	self.yVarValues = self.xVarValues = d3.keys(self.settings.data[0]).filter(function(d) {return d!='body'})
}

TextView.prototype.buildControls = function() {
	var self = this
	self.getControlValues()
	self.controlSettings = {}
	
	self.filterControlSettings = {}
	self.rightControlSettings = {}
	
	self.controlSettings['xVar'] = {
		id: 'xVar', 
		text: 'X Axis:', 
		type: 'select',
		options:function() {
			return self.xVarValues.map(function(d){return {id:d, text:d}})
		},
		default:self.settings.xVar
	}

	self.controlSettings['yVar'] = {
		id: 'yVar', 
		text: 'Y Axis:', 
		type: 'select',
		options:function() {
			return self.yVarValues.map(function(d){return {id:d, text:d}})
		},
		default:self.settings.yVar
	}

	self.controlSettings['radiusVar'] = {
		id: 'radiusVar', 
		text: 'Radius:', 
		type: 'select',
		options:function() {
			return self.yVarValues.map(function(d){return {id:d, text:d}})
		},
		default:self.settings.radiusVar
	}

	self.controlSettings['colorVar'] = {
		id: 'colorVar', 
		text: 'Color:', 
		type: 'select',
		options:function() {
			return self.yVarValues.map(function(d){return {id:d, text:d}})
		},
		default:self.settings.colorVar
	}
	// Bottom controls
	self.bottomControls = new Controls({
		controller:self, 
		container:'#bottom', 
		controls:self.controlSettings
	})
	

}