// View for Chart1 -- inherited from SingleView
var TextView = function(sets) {
	var self = this 
	defaults = {
		xVar:'Topic 6', 
		yVar:'Condition',
		radiusVar:'Topic 1', 
		colorVar:'Condition',
		minRadius:5, 
		colorRange:colorbrewer['RdYlBu'][11],
		maxRadius:20,
		group:'All NCDs',
		selected:77,
		hasControls:true,  
	}
	var initSettings = $.extend(false, defaults, sets)
	self.init(initSettings)
}


TextView.prototype = Object.create(SingleView.prototype)

TextView.prototype.getLabels = function() {
	var self = this
	self.settings.changedColorType = false
	var oldColorLabels = $.extend(false, {},self.settings.colorLabels)
	var oldColorLength = d3.keys(self.settings.colorLabels).length
	self.settings.xAxisLabels = {}
	self.settings.yAxisLabels = {}
	self.settings.colorLabels = {}
	if(Number(self.settings.data[0][self.settings.xVar]) != self.settings.data[0][self.settings.xVar]) {
		var names = []
		self.settings.data.map(function(d){
			if(names.indexOf(d[self.settings.xVar]) == -1) names.push(d[self.settings.xVar])
		})
		names.sort(function(a,b) {
			if(a < b) return -1;
		    if(a > b) return 1;
		    return 0;
		}).map(function(d,i){
			self.settings.xAxisLabels[d] = i
		})
	}
	if(Number(self.settings.data[0][self.settings.yVar]) != self.settings.data[0][self.settings.yVar]) {
		
		var names = []
		self.settings.data.map(function(d){
			if(names.indexOf(d[self.settings.yVar]) == -1) names.push(d[self.settings.yVar])
		})
		names.sort(function(a,b) {
			if(a < b) return -1;
		    if(a > b) return 1;
		    return 0;
		}).map(function(d,i){
			self.settings.yAxisLabels[d] = i
		})
	}
	if(Number(self.settings.data[0][self.settings.colorVar]) != self.settings.data[0][self.settings.colorVar]) {
		if(d3.keys(oldColorLabels).length == 0 ) self.settings.changedColorType = true
		var names = []
		self.settings.data.map(function(d){
			if(names.indexOf(d[self.settings.colorVar]) == -1) names.push(d[self.settings.colorVar])
		})
		names.sort(function(a,b) {
			if(a < b) return -1;
		    if(a > b) return 1;
		    return 0;
		}).map(function(d,i){
			self.settings.colorLabels[d] = d
		})
	}
	if((oldColorLength == 0 && d3.keys(self.settings.colorLabels).length > 0) | (d3.keys(oldColorLabels).length > 0 && d3.keys(self.settings.colorLabels).length == 0)) {
		self.settings.changedColorType = true
	}
}

TextView.prototype.prepData = function(chart) {
	var self = this
	switch(chart) {
		case 'scatterChart':
			self.update = function(control) {
				self.getLabels()
				var resetScale = (self.settings.changedColorType == false && (control[0] == 'radiusVar' | control[0] == 'colorVar' |  control == 'click') | control == 'zoom') ? false : true
				console.log('update reset scale ', resetScale)
				self.charts.map(function(chart,i) {
					self.prepData(chart.settings.id)
					self.changeTitle()
					chart.update(settings[chart.settings.id], resetScale)
				})
				self.updatePoshys()
			}
			settings[chart].data = self.settings.data.map(function(d, i) {
				var id = self.settings.idVariable == undefined ? i : d[self.settings.id]
				var xVal = Number(d[self.settings.xVar]) != d[self.settings.xVar] ? self.settings.xAxisLabels[d[self.settings.xVar]] : d[self.settings.xVar]
				var yVal = Number(d[self.settings.yVar]) != d[self.settings.yVar]  ? self.settings.yAxisLabels[d[self.settings.yVar]] : d[self.settings.yVar]
				return {x:xVal, y:yVal, id:id, text:d.body, radiusValue:d[self.settings.radiusVar], colorValue:d[self.settings.colorVar]}
			})
			settings[chart].xLabel = self.settings.xVar
			settings[chart].xAxisLabels = self.settings.xAxisLabels
			settings[chart].yAxisLabels = self.settings.yAxisLabels
			settings[chart].colorLabels = self.settings.colorLabels
			settings[chart].yLabel = self.settings.yVar
			settings[chart].selected = Number(self.settings.selected)
			settings[chart].legendLabel = self.settings.colorVar
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
		var colorScale = Number(self.settings.data[0][self.settings.colorVar]) != self.settings.data[0][self.settings.colorVar] ? d3.scale.category10(): d3.scale.linear().range(self.settings.colorRange).domain(colorDomain)
		settings['scatterChart'].getColor = function(d) {return colorScale(d)}	
		settings['scatterChart'].legendScale = d3.scale.linear().domain([min,max])
	}
}

TextView.prototype.loadData = function(callback) {
	var self = this
	var args = []
	for(var i=1; i<arguments.length; i++) {
		if(arguments[i] == undefined) return
    	if(arguments[i].id != undefined) args.push(arguments[i].id)
    }
	if(self.charts == undefined) self.charts = []
	if(typeof data != 'undefined') {
		self.settings.data = data
		if(self.settings.loadedData != true) self.getLabels()
		self.settings.loadedData = true
			if(typeof callback == 'function') {
				callback(args)

			}
	}
	else if(self.settings.loadedData != true ) {
		alert('reading csv')
		d3.csv(self.settings.filePath, function(data) {
			self.settings.data = data.filter(function(d,i){
				if(d.id == undefined) d.id = i
				return i<1000} 
			)
			self.settings.loadedData = true
			if(typeof callback == 'function') {
				callback(args)

			}
		})
	}
	else {
		if(typeof callback == 'function') {
			callback(args)
		}
	}
}

TextView.prototype.getControlValues = function() {
	var self = this
	self.yVarValues = self.xVarValues = self.colorValues = d3.keys(self.settings.data[0]).filter(function(d) {
		return d!= 'body'
	})

	self.radiusValues =  d3.keys(self.settings.data[0])
		.filter(function(d) {return isNaN(Number(self.settings.data[0][d])) == false})
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
			return self.radiusValues.map(function(d){return {id:d, text:d}})
		},
		default:self.settings.radiusVar
	}

	self.controlSettings['colorVar'] = {
		id: 'colorVar', 
		text: 'Color:', 
		type: 'select',
		options:function() {
			return self.colorValues.map(function(d){return {id:d, text:d}})
		},
		default:self.settings.colorVar
	}

	// self.controlSettings['reset'] = {
	// 	id: 'reset', 
	// 	text: 'Center', 
	// 	type: 'button',
	// 	default:true, 
	// 	change:function() {
	// 		self.update('recenter')
	// 		// alert('test')
	// 		$('#control-button-reset').blur()
	// 	}
	// }

	// Bottom controls
	self.bottomControls = new Controls({
		controller:self, 
		container:'#bottom', 
		controls:self.controlSettings
	})

	// Zoom controls
	self.zoomControls = new Controls({
		controller:self, 
		container:'#container', 
		controls: {
			zoom:{
				id:'zoom', 
				type:'buttons', 
				options:[
					{id:'in', text:'+', change:function(d){view.charts[0].zoomIn();$('#control-button-in').blur()}},
					{id:'reset', text:'•',  change:function(d){self.update('reset');$('#control-button-reset').blur()}},
					{id:'out', text:'-',  change:function(d){view.charts[0].zoomOut();$('#control-button-out').blur()}}],
			}
		}
	})
	

}