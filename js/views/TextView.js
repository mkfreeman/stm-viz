// View for Chart1 -- inherited from SingleView
var TextView = function(sets) {
	var self = this 
	defaults = {
		xVar:'Topic 1', 
		yVar:'Topic 2',
		group:'All NCDs',
		selected:100,
		hasControls:false,  
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
				return {x:d[self.settings.xVar], y:d[self.settings.yVar], id:id, text:d.body}
			})
			settings[chart].xLabel = self.settings.xVar
			settings[chart].yLabel = self.settings.yVar
			break
		case 'textChart':
			settings[chart].text = self.settings.data.filter(function(d){return d.id == self.settings.selected})[0].body
			break
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

TextView.prototype.buildControls = function() {
	var self = this
	self.controlSettings = {}
	self.filterControlSettings = {}
	self.rightControlSettings = {}
	

	self.controlSettings['year'] = {
		id: 'year', 
		text: 'Year:', 
		type: 'slider',
		options:function() {
			var min = self.settings.denominator == 'ghes' ? 1995 : 1990
			return d3.range(min, 2012).map(function(d) {return {id:d, text:d}})
		},
		step:1,
		default:self.settings.year
	}

	// Add option for percent v.s. absolute change
	self.controlSettings['recipient'] = {
		id:'recipient', 
		text:'', 
		step:1,
		options:[{id:'Region', text:'Region'},{id:'Health Focus Area', text:'Health Focus Area'}],
		type:'buttonset',
		default:self.settings.recipient, 
		change:function() {
			console.log(self.settings.recipient)
			self.settings.node = self.settings.parentNode = self.settings.recipient == 'Region' ? 23 : 25
			self.settings.parentTarget = self.settings.recipient == 'Region' ? 24 : 26

			self.updateCharts()
		}
	}

	// Bottom controls
	self.bottomControls = new Controls({
		controller:self, 
		gaCategory:'fgh-' + self.settings.id,
		container:'#bottom-control-container-middle', 
		controls:self.controlSettings
	})
	
	$('#bottom-control-container-middle').css('width', '100%')	

}