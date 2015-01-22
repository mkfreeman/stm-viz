// Parent chart function to draw any chart type
var Chart = function() {}

// Initialize -- passes settings to chart
Chart.prototype.init = function(settings) {
	var self = this
	var defaults = {
		getHeight:function() {
			return $('#' + self.settings.container).innerHeight() - 40 - $('#bottom').height()
		},
		getWidth:function() {return $(window).width() - 20}, 
		hasXAxis:true,
		hasYAxis:true,
		hasSvg:true,
		hasLegend:false,
		hasXLabel:true,
		getXrangeBand:function() {return 1},
		xAxisPosition:'bottom',
		hasYLabel:true,
		bottomPadding:0, 
		opacity:function(d) {return 1},
		ordinalType:'bands',
		getXtickSize:function() {return 6},
		getYtickSize:function() {return -self.settings.plotWidth},
		getMargin:function() { 
			return {
				top:50, 
				bottom:30, 
				right:50, 
				left:150
			}
		}, 
		getPosition:function() {
			return {top: $('.view-title').height(), left:0}
		},
		fontFamily:'helvetica', 
		fontSize:'25px',
		getLegend:function() {},
		yTickFormat:d3.format('.2s'), 
		xTickFormat:d3.format('.2s'),
		pointRadius:10,
		getTitleText:function() {return 'This is a chart title'}, 
		yLabel:'Vertical axis text',
		xLabel:'Horizontal axis text',
		drawPoints:true,
		fadeInCircles:false,
		filterPoints:[], 
		filterLines:[], 
		filterLabels:[],
		fadeInText:true,
		drawLines:true,
		labelText:true,
		color:function() {
			return 'black'
		}, 
		yLineStroke:'1px', 
		yLineColor:'black', 
		yLineDash:'5,5', 
		xLineStroke:'1px', 
		xScaleType:'ordinal', 
		xLineColor:'black', 
		xLineDash:'5,5', 
		getElementSize:function() {
			return {width:self.settings.pointRadius, height:self.settings.pointRadius}
		}
	}
	self.settings = $.extend(false, defaults, settings)
	self.data = self.settings.data
	self.defineFunctions()
	self.build()
}

// Get size - calculates width, height, position
Chart.prototype.getSize = function() {
	var self = this
	self.settings.height = self.settings.getHeight(self) 
	self.settings.width = self.settings.getWidth(self)
	self.settings.margin = self.settings.getMargin()
	self.settings.svgHeight =  self.settings.height  - $('#' + self.settings.id + '-divtitle').outerHeight() - $('.view-title').outerHeight()  - self.settings.bottomPadding
	self.settings.plotHeight = self.settings.svgHeight - self.settings.margin.top - self.settings.margin.bottom
	self.settings.plotWidth = self.settings.width - self.settings.margin.left - self.settings.margin.right
	self.settings.legend = self.settings.getLegend(self)	
	self.settings.position = self.settings.getPosition(self)
	if(self.settings.type == 'map') {
		self.settings.mapHeight = self.settings.height - self.settings.legend.space - $('#' + self.settings.id + '-divtitle').outerHeight() - $('.view-title').outerHeight()
	}
}

// Set scales
Chart.prototype.setScales = function() {
	var self = this
	// console.log('set scales')
	if(self.settings.hasScale == false) return
	var elementSize = self.settings.getElementSize()
	var limits = self.settings.lock == true ? self.settings.limits : self.getLimits()
	if(limits != undefined && limits.x != undefined) {
		if(self.settings.xScaleType == 'ordinal' && self.settings.ordinalType == 'bands') {
			self.xScale = d3.scale.ordinal().rangeRoundBands([elementSize.width, self.settings.plotWidth - elementSize.width], self.settings.getXrangeBand()).domain(limits.x)
		}
		else if (self.settings.xScaleType == 'ordinal' && self.settings.ordinalType == 'points') {
			self.xScale = d3.scale.ordinal().rangePoints([elementSize.width/2, self.settings.plotWidth - elementSize.width/2],  self.settings.getXrangeBand(self)).domain(limits.x)		
		}
		else {
			var width = self.settings.bin == 'outliers' ? self.settings.legend.width : self.settings.plotWidth
			self.xScale = d3.scale.linear().range([elementSize.width, width - elementSize.width]).domain([limits.x.min, limits.x.max])
		}
		self.settings.xAxisTop = self.settings.xAxisPosition == 'bottom' ? self.settings.plotHeight : 0
		 self.xaxis = d3.svg.axis()
			.scale(self.xScale)
			.orient(self.settings.xAxisPosition)
			.ticks(5)
			.tickSize(self.settings.getXtickSize())
			.tickFormat(self.settings.xTickFormat)
			.tickValues(d3.keys(self.settings.xAxisLabels).length >0 ? d3.values(self.settings.xAxisLabels) : null)
	}
	if(limits != undefined && limits.y != undefined) {
		self.yScale= d3.scale.linear().range([self.settings.plotHeight - elementSize.height, elementSize.height]).domain([limits.y.min, limits.y.max])
		self.yaxis = d3.svg.axis()
					.scale(self.yScale)
					.orient("left")
					.tickSize(self.settings.getYtickSize())
					.ticks(5)
					.tickFormat(self.settings.yTickFormat)
					.tickValues(d3.keys(self.settings.yAxisLabels).length >0 ? d3.values(self.settings.yAxisLabels) : null)

	}
	// console.log('set scales ', self.xScale.range(), self.xScale.domain())

}

// Build chart elements
Chart.prototype.build = function() {
	var self = this
	self.getSize()
	self.div = d3.select('#' + self.settings.container).append("div").attr('id', self.settings.id + '-div').attr('class', 'chart').style('position', 'absolute').style('top', self.settings.position.top + 'px').style('left', self.settings.position.left + 'px')

	// Draw titles
	if(self.settings.hasTitle == true) {
		self.buildTitle()
		self.changeTitle()
	}

	self.getSize()
	self.setScales()

	// Draw SVG & G
	if(self.settings.hasSvg == true) {
		self.svgWrapper = d3.select('#' + self.settings.id + '-div').append("div").style('height', self.settings.svgHeight + 'px').style('width', self.settings.width + 'px').style("position", "relative")
		self.svg = self.svgWrapper.append("svg")
			.attr("width", '100%')
			.attr("height", '100%')
			.attr('viewbox', '0,0,' + self.settings.width + ',' + self.settings.svgHeight)
			.attr('id', self.settings.id + '-svg')
		
		self.g = self.svg.append("g")
			.attr("id", self.settings.id + '-g')
			.attr('transform', 'translate(' + self.settings.margin.left + ',' + self.settings.margin.top + ')')

		if(self.settings.zoomAble == true) {
			self.g.call(d3.behavior.zoom().x(self.xScale).y(self.yScale).scaleExtent([1, 15]).on("zoom", self.zoom))
			self.g.append('rect')
				.attr("class", "overlay")
				.attr("id", "clip")
			    .attr("width", self.settings.plotWidth)
			    .attr("height", self.settings.plotHeight);
		}
	}
	
// 	// Build axes
	self.buildAxes()
 
 	// Draw Axes
	self.drawAxes()
 	// Build axis labels
	self.buildAxisLabels()	
	
// // 	// Draw
	self.draw(true)	
}

// Draw - intended to be overwritten by inherited objects
Chart.prototype.draw = function() {}	

// Build axes 
Chart.prototype.buildAxes = function() {
	var self = this
	self.setScales()
	if(self.settings.hasXAxis == true) {
		self.xaxisLabels = self.g.append("g")
			.attr("class", "axis xaxis")
			.attr("id", "xaxis")
			.attr('transform', 'translate(' + 0 + ',' + self.settings.xAxisTop + ')')
	}
	
	
	if(self.settings.hasYAxis == true) {
		self.yaxisLabels = self.g.append('g')
			.attr('class', 'axis yaxis')
			.attr('transform', function() {
				return 'translate(' + 0 + ',0)'
			 })
			.attr('id', 'yaxis')	
	}
}

// Build Titles
Chart.prototype.buildTitle = function() {
	var self = this
	self.title = d3.select('#' + self.settings.id +'-div').append('div')
		.attr('class', 'div-title')
		.attr('id', self.settings.id + '-divtitle')
		.style('width', self.settings.plotWidth + 'px')
		.style('margin-left', self.settings.margin.left + 'px')
	
	self.titleText = self.title.append('text').attr('id', self.settings.id + '-divtitle-text')
}

// Change Title Text
Chart.prototype.changeTitle = function(duration) {
	var self = this
	self.title.style('width', self.settings.plotWidth + 'px')
	self.titleText.text(self.settings.getTitleText(self))
}

// Draw axes 
Chart.prototype.drawAxes = function(duration) {
	var self = this
	var duration = duration || 1500;
	self.setScales()
	if(self.settings.hasYAxis == true) self.yaxisLabels.transition().duration(duration).call(self.yaxis)
	if(self.settings.hasXAxis == true) self.xaxisLabels.transition().duration(duration).call(self.xaxis)
}

// Build axis labels
Chart.prototype.buildAxisLabels = function() {
	var self = this
	
	// y-label
	var width = self.settings.plotHeight
	var height = self.settings.plotHeight
	if(self.settings.hasYLabel == true) {
		self.ytitleDiv = self.div.append('div').attr('class', 'ytitle-div').style('width', self.settings.plotHeight+ 'px').style('left', (self.settings.margin.left -75) + 'px')
		self.ytitle = self.ytitleDiv.append('text')
			.text(self.settings.yLabel)
			.attr('transform', 'translate(0,0) rotate(-90)')
			.attr('id', self.settings.id + '-yaxis-label')
			.attr('class', 'axis-label')
	}
		

// x-label
if(self.settings.hasXLabel == true) {
		self.xtitleDiv = self.div.append('div').attr('class', 'xtitle-div').style('width', self.settings.plotWidth+ 'px').style('margin-left', self.settings.margin.left + 'px')
		self.xtitle = self.xtitleDiv.append('text')
			.text(self.settings.xLabel)
			.attr('id', self.settings.id + '-xaxis-label')
			.attr('class', 'axis-label')
	}
}

// Update
Chart.prototype.update = function(sets, resetScale) {
	var self = this
	var resetScale = resetScale == undefined ? true : resetScale
	self.settings = $.extend(false, self.settings, sets)
	self.data = self.settings.data
	if(typeof self.filterData == 'function') self.filterData()
	if(typeof self.settings.customUpdate == 'function') {
		self.settings.customUpdate(self)
		return
	}
	if(self.settings.hasYLabel == true) {
		self.ytitle 
			.text(self.settings.yLabel)
	}
	if(self.settings.hasXLabel == true) {
		self.xtitle 
			.text(self.settings.xLabel)
	}
	self.resize(resetScale)	
	self.draw(resetScale)
}

// Resize event - repositions elements
Chart.prototype.resize = function(resetScale) {
	var self = this
	console.log('resize build ', resetScale)
	if(self.settings.resize == false) return
	self.getSize()
	if(self.settings.hasTitle) self.changeTitle()		
	self.getSize()
	if(resetScale == true) self.setScales()
	var build = build || true;
	var transition = build == true? 0 : 1500
	self.div.transition().duration(transition).style('top', self.settings.position.top + 'px').style('left', self.settings.position.left + 'px')

	if(self.settings.hasSvg ==true) {
		self.svgWrapper.style('height', self.settings.svgHeight + 'px').style('width', self.settings.width + 'px')
		self.svg
			.attr("width", '100%')
			.attr("height", '100%')
			.attr('viewbox', '0,0,' + self.settings.width + ',' + self.settings.svgHeight)
	}
		
	if(self.settings.hasYLabel == true)self.ytitleDiv.style('width', self.settings.plotHeight+ 'px')
	
	if(self.settings.hasXLabel == true) {
		self.xtitleDiv.style('width', self.settings.plotWidth+ 'px').style('margin-left', self.settings.margin.left + 'px')		
	}
	
	if(self.settings.hasXAxis == true) {
		self.xaxisLabels.attr('transform', 'translate(' + 0 + ',' + self.settings.xAxisTop + ')')
	}
	
	if(resetScale == true)  self.drawAxes(transition)
	
	
	if(self.settings.hasMapLegend == true) {
		self.updateLegend()
	}
}

Chart.prototype.getElementByValue = function(arr, idVariable, idValue, valueVariable) {
	var ret = arr.filter(function(d) {
		return d[idVariable] == idValue
	})[0][valueVariable]
	return ret
}

// Generate test data
Chart.prototype.generateData = function(observations) {
	var data = []
	d3.range(observations).map(function(d,i) {
		var obs = {
			x:i, 
			y:Math.random()
		}
		data.push(obs)
	})
	return data
}


// Define set of functions for positioning, interactivity, etc. 
Chart.prototype.defineFunctions = function() {
	var self = this

	self.zoomTransform = function(d) {
		// console.log('zoom transform ', self.xScale(d.x))
		return 'translate(' + self.xScale(d.x) + ',' + self.yScale(d.y) + ')'
	}
	// Zooming
	self.zoom = function() {
 		self.g.selectAll('.circle').call(self.circlePositionFunction)
		self.xaxisLabels.call(self.xaxis)
		self.yaxisLabels.call(self.yaxis)
	}

	// Circle position function
	self.circlePositionFunction = function(circle) {
		circle
			// .attr('transform', function(d){return 'translate(' + self.xScale(d.x) + ',' + self.yScale(d.y) + ')'})
			.attr('transform', self.zoomTransform)
			// .attr('cx', function(d) {if(d.x>.1) {console.log(d.x, self.xScale(d.x))};return self.xScale(d.x)})
			// .attr('cy', function(d) {return self.yScale(d.y)})
			.attr('r', function(d) {return self.settings.getRadius(d)})
			.style('fill', function(d) {return self.settings.getColor(d)})
			.attr('class', 'circle')
			.attr('circle-id', function(d) {return d.id})
			.style('visibility', function(d) {
				if(self.xScale(d.x)<0 | self.xScale(d.x) > self.settings.plotWidth | self.yScale(d.y)<0 | self.yScale(d.y)>self.settings.plotHeight){
					return 'hidden'
				} 
				else return 'visible'
			})
	}
	
	// Sankey node function
	self.nodeFunction = function(node) {
		node.attr("class", "node")
			.attr('node-id', function(d) {return d.id})
			.attr("transform", function(d) {return "translate(" + d.x + "," + d.y + ")"; })
			
	}

	// Sankey text function
	self.sankeyTextFunction = function(text, klass, sankey) {
		text.attr("x", function(d) {
				return d.x < self.settings.width / 2 ? -6 : 6 + sankey.nodeWidth()
			})
		    .attr("y", function(d) { 
		    	var y = klass == 'num' ? ((d.dy + 20.5)/ 2) : ((d.dy - 11)/ 2); 
		    	return y })
		    .attr("dy", "3px")
		    .attr("text-anchor", function(d) {
		    	return d.x < self.settings.width / 2 ? "end" : "start"
		    })
		    .attr('class', klass)
		    .text(function(d) { return klass == 'num' ? self.settings.numberFormat(d.value) : d.name ; })
			.style("font-weight", function(d) {return klass == 'num' ? 'normal':'bold'})
	}

	// Sankey link function
	self.sankeyLinkFunction = function(link, sankey) {
		link.attr("class", "link")
			.attr("d", sankey.link())
			.attr('value', function(d) {return d.value})
			.attr('source-id', function(d) {return d.source.id})
			.attr('origin-id', function(d) {return d.origin})			
			.style("stroke", function(d) { 
				return self.settings.color(d, 'link')
			})
			.style("stroke-width", function(d) { return Math.max(1, d.dy); })
	}
	// Sankey rect function
	self.sankeyRectFunction = function(rect, sank) {
		rect.attr("height", function(d) { return d.dy; })
			.attr("width", sank.nodeWidth())
			.attr('class', 'sankey-rect')
			.style("fill", function(d) {return self.settings.color(d)})
			.style("stroke", function(d) { return d3.rgb(d.color) ; })
	}

	// Line function
	self.lineFunction = function(dat) {
		var line = d3.svg.line().interpolate('cardinal');
		var data = [];
		dat.map(function(d) {
			data.push([self.xScale(d.x), self.yScale(d.y)])
		})
		return line(data)
	}

	
	
	// Update circle
	self.circleUpdate = function(d) {
		var path = d3.select(this).node()
		var circle = d3.select('#' + self.settings.id + '-' + d.key + '-circle')
		var l = path.getTotalLength()
		var p = path.getPointAtLength(l);
		circle.transition().duration(500).attr("transform", "translate(" + p.x + "," + p.y + ")").attr('r', function(d,i) {
				return self.settings.radiusData == undefined ? self.settings.pointRadius : self.settings.radiusData[d.key]
			})
	}
	
	// Simple line position function
	self.linePositionFunction = function(line, changeOpacity) {
		line.attr('class', 'line')
			.style('fill', 'none')
			.attr('d', function(d) {return self.lineFunction(d.values)})
			.style('stroke', function(d,i) {
				var color = self.settings.color(d.key)
				return color
			})		
			.attr("stroke-dasharray", function(d) {
				var dash = self.settings.dash(d)
				return dash
			})
			.attr('line-id', function(d) { return self.settings.id + '-' + d.key})
			.style('stroke-width', function(d) { return self.settings.strokeWidth(d,self)})
			
		if(changeOpacity == true) {
			line.style('opacity', function(d) {
				return self.settings.opacity(d,self)
			})
		}
			
	}
	

	// Line enter function
	self.lineEnterFunction = function(line) {
		line.attr('class', 'line')
			.attr('id', function(d) {
				return self.settings.id + '-' + d.key + '-line'
			})
			.style('fill', 'none')
			.attr('d', function(d) {return self.lineFunction(d.values)})
			// .attr("stroke-dasharray", function(d) {
// 				var len = d3.select(this).node().getTotalLength()
// 				return len
// 			})
// 			
// 			.attr('stroke-dashoffset', function(d) {
// 				var len = d3.select(this).node().getTotalLength()
// 				return len
// 			})
			.style('stroke', function(d,i) {
				var color = self.settings.color(d)
				return color
			})	
			.style('stroke-width', self.settings.strokeWidth)	
	}
	
	// Line label function
	self.lineLabelFunction = function(lab){
		var opacity = self.settings.fadeInText == true ? 0 : 1
		lab.attr('x', self.settings.plotWidth)		
			.attr('y', function(d) {return self.yScale(d.values[d.values.length - 1].y) + 3})
			.attr('class', 'line-label')
			.style('fill', function(d) {return self.settings.color(d)})
			.style('opacity', opacity)
		if(opacity == 0) setTimeout(function() {lab.transition().duration(1000).style('opacity', 1).each('end', function() {d3.select(this).attr('class', 'line-label entered')})}, 2000)
		else lab.attr('class', 'line-label entered')
	}
	
	// Label update function
	self.labelUpdateFunction = function(lab) {
		lab.attr('x', self.settings.plotWidth + 5)		
			.attr('y', function(d) {return self.yScale(d.values[d.values.length - 1].y) + 5})

	}
	
	// Circle along path 
	self.transitionCircle = function(d) {
		var path = d3.select(this)
		var direction = path.attr('class').indexOf('exiting') == -1 ? 'forward' : 'backward'
		var circle = d3.select('#' + self.settings.id + '-' + d.key + '-circle')
		circle.style('opacity', 1)
		circle.transition()
			.duration(2000)
			.attrTween("transform", self.translateAlong(path.node(), direction))
			.attr('r', function(d,i) {
				return self.settings.radiusData == undefined ? self.settings.pointRadius : self.settings.radiusData[d.key]
			})
	}
	
	// Translate circle along path 
	self.translateAlong = function(path, direction) {	
 		var l = path.getTotalLength();
		return function(d, i, a) {
			return function(t) {
				var fraction = direction == 'forward' ? (t) : (1-t)
		 		var p = path.getPointAtLength((fraction) * l);
		 		return "translate(" + p.x + "," + p.y + ")";
			};
		};
	}
	
	
	
	// Reverse translate along
	self.reverseTranslateAlong = function(path) {
 		var l = path.getTotalLength();
		return function(d, i, a) {
			return function(t) {
		 		var p = path.getPointAtLength((1-t) * l);
		 		return "translate(" + p.x + "," + p.y + ")";
			};
		};
	}
	
	// Function for lead circles
	self.leadCircleFunction = function(circle) {
		var opacity = self.settings.fadeInCircles == true ? 0 : 1
		circle.attr('r', function(d,i) {
				return self.settings.radiusData == undefined ? self.settings.pointRadius : self.settings.radiusData[d.key]
			})
			.attr('transform', function(d) {
				return 'translate(' + [self.xScale(d.values[0].x),self.yScale(d.values[0].y)] + ')'
			})
			.attr('id', function(d) {
				return self.settings.id + '-' + d.key + '-circle'
			})
			.attr('class', function() {
				opacity == 0 ? 'point' : 'point entered'
			})
			.style('fill', function(d,i) {
				var color = self.settings.color(d)
				return color
			})
			.style('opacity', opacity)
			
		if(opacity == 0) circle.transition().duration(1000).style('opacity', 1).each('end', function() {d3.select(this).attr('class', 'point entered')})
	}
	
	// Function to update circles without lines
	self.circleOnlyUpdate = function(circle) {
		circle
			.attr('transform', function(d) {
				return 'translate(' + [self.xScale(d.values[0].x),self.yScale(d.values[0].y)] + ')'
			})
			.attr('r', function(d,i) {
				return self.settings.radiusData == undefined ? self.settings.pointRadius : self.settings.radiusData[d.key]
			})
	}
	
	// Function for progress Gs
	self.progressPosition = function(label) {
		label.attr('transform', function(d,i) {return 'translate(' + self.textScale(i) + ',0)'})
			.attr('class', 'label')
			.attr('width', self.settings.textWidth)
			.style("text-anchor", 'middle')
			.style('opacity', function(d) {
				if(self.settings.highlighted == undefined) return 1
				return self.settings.highlighted == d ? 1 : .3
			})
	}
	
	self.progressCircleFunction = function(circle)  {
		circle.attr('r', function(d,i) {
				return self.settings.radiusData == undefined ? self.settings.pointRadius : self.settings.radiusData[d.key]
			})
			.attr('cx', function(d,i) {return self.pointScale(i)})
			.attr('cy', 20)
			.attr('class', 'point')
			.style('fill', self.settings.circleColor)
			.style('opacity', function(d) {
				if(self.settings.highlighted == undefined | self.settings.highlightedStep == undefined) return 1
				return self.settings.highlighted == d.category && self.settings.highlightedStep == d.step ? 1 : .3
			})
	}
	
	self.iconFunction = function(icon) {
		icon.attr('class', function(d) {return d + ' icon'})
		.style('color', self.settings.iconColor)
		.style('opacity', self.settings.iconOpacity)
	}
	
	self.iconDivFunction = function(div) {
		div.style('top', self.settings.iconTop + 'px')
		.style('right', self.settings.iconRight + 'px')
		.style('font-size', self.settings.iconSize)
	}
	
	self.rectEnterFunction = function(rect) {
		rect.attr('id', function(d) {return self.settings.id + '-' + d.id})
		.attr('x', function(d) {return self.xScale(d.id)})
		.attr('y', function(d) {
			if(self.settings.yMirror == true) {
				var value = d.value < 0 ? self.yScale(0) : self.yScale(d.value)
			}
			return self.yScale(0)
		})
		.attr('height', function(d) {
			return 0
		})
		.attr('width', self.xScale.rangeBand())
		.attr('class', 'bar')
		.style('fill', function(d) {return self.settings.color(d)})
		
	}
	
	self.rectPositionFunction = function(rect) {
		rect
			.attr('x', function(d) {return self.xScale(d.id)})
			.attr('y', function(d) {
				if(self.settings.yMirror == true) {
					var value = d.value < 0 ? self.yScale(0) : self.yScale(d.value)
				}
				return value
			})
			.attr('height', function(d) {
				if(self.settings.yMirror == true) {
					var value = d.value < 0 ? self.yScale(d.value) - self.yScale(0) : self.yScale(0) - self.yScale(d.value)
				}
				return value
			})
			.attr('width', self.xScale.rangeBand())
			.style('fill', function(d) {return self.settings.color(d)})
			.style('opacity', function(d) {
				if(self.settings.highlighted == undefined) return 1
				return d.id == self.settings.highlighted ? 1 : .3
			})
	}
	
	self.drawYLineFunction = function(line) {
		line.attr('x1', 0)
			.attr('x2', self.settings.plotWidth)
			.attr('y1', self.yScale(self.settings.yLine))
			.attr('y2', self.yScale(self.settings.yLine))
			.attr('class', 'yline')
			.style('stroke-width', self.settings.yLineStroke)
			.style('stroke', self.settings.yLineColor)
			.style("stroke-dasharray", self.settings.yLineDash)
	}
	
	self.drawXLineFunction = function(line) {
		line.attr('y1', 0)
			.attr('y2', self.settings.plotHeight)
			.attr('x1', self.xScale(self.settings.xLine))
			.attr('x2', self.xScale(self.settings.xLine))
			.attr('class', 'xline')
			.style('stroke-width', self.settings.xLineStroke)
			.style('stroke', self.settings.xLineColor)
			.style("stroke-dasharray", self.settings.xLineDash)
	}
	
	self.areaFunction = function(data) {
		var shape = d3.svg.area()
					.x(function(d) {return self.xScale(d.x)})
					.y0(function(d) {return self.yScale(d.y0)})
					.y1(function(d) {return self.yScale(d.y1)})
		return shape(data)
	}
	
	self.hoverPointFunction = function(point) {
		point
			.attr('class', 'hover hover-point')
			.attr('cx', function(d) {return self.xScale(d.x)})
			.attr('cy', function(d) {return d.y})
			.attr('r', self.settings.pointRadius)
			.attr('fill', function(d) {return self.settings.color(d.id)})
			.style('stroke', 'black')
			.style('stroke-width', '1px')
	}
	
	self.hoverTextFunction = function(text) {
		text
			.attr('class', 'hover hover-text')
			.attr('x', function(d) {return self.xScale(d.x) + self.settings.pointRadius+2})
			.attr('y', function(d) {return d.y + 5})
			.style('opacity', .7)
			.style('font-family', 'helvetica')
			.text(function(d) {return d.text})
	}
	
	self.hoverLabelFunction = function(text) {
		text
			.attr('class', 'hover hover-label')
			.attr('x', function(d) {return d})
			.attr('y', function(d) {return -10})
			.text(function(d) {return self.settings.xTickFormat(self.xScale.invert(d))})
			.style('text-anchor', 'middle')
			.style('opacity', '.4')
	}
	
	self.hoverLineFunction = function(line) {
		line.attr('y1', 0)
			.attr('class', 'hover hover-line')
			.attr('y2', self.settings.plotHeight)
			.attr('x1', function(d) {return d})
			.attr('x2', function(d) {return d})
			.style('stroke', 'black')
			.style('stroke-width', '1px')	
			.style('opacity', '.2')		
	}
	
	self.textColumnFunction = function(d,i) {
		var txt = d3.select(this)
			txt.text(d)
			
			.attr('y', self.yScale(i))
			.attr('class', 'text')
			.attr('text-id', d)
			.style('fill', self.settings.color(d))
			.style('opacity', self.settings.opacity(d,self))
			.style('cursor', 'pointer')
		if(self.settings.explicitFont == true) {
			txt.style('font-family', self.settings.fontFamily)
			.style('font-size', self.settings.fontSize)
		}
	}
	
	self.arrowRectFunction = function(rect) {
		rect.attr('x', function(d) {return self.xScale(d.x) - self.settings.rectWidth/2})
			.attr('y', function(d) {return self.yScale(d.y)})
			.attr('width', self.settings.rectWidth)
			.attr('height', self.settings.rectHeight)
			.style('fill', 'white')
			.style('stroke', function(d) {return self.settings.color(d.id)})
			.style('stroke-width', function(d) {
				var width = d.id == self.settings.highlighted ? self.settings.highlightedWidth : self.settings.strokeWidth
				return width
			})
			.attr('class', 'box')
			.attr('rect-id', function(d) {return d.id})

	}
	
	self.arrowLinkFunction = function(link) {
		var diagonal = d3.svg.diagonal()
					.source(function(d) {return {x:self.xScale(d.values[0].x) + self.settings.rectWidth/2, y:self.yScale(d.values[0].y) + self.settings.rectHeight/2}})
					.target(function(d) {return {x:self.xScale(d.values[1].x) - self.settings.rectWidth/2 , y:self.yScale(d.values[1].y)+ self.settings.rectHeight/2}})
		link.attr('d', diagonal).attr('class', 'link')
			.style('stroke', function(d) {return self.settings.color(d.key)})
			.style('stroke-width', function(d) {
				var width = d.key == self.settings.highlighted ? self.settings.highlightedWidth : self.settings.strokeWidth
				return width
			})
			.attr('link-id', function(d) {return d.key})
			.attr("stroke-dasharray", function(d) {
				return self.settings.dash(d)
			})

	}
	
	self.arrowTextFunction = function(text) {
		text.attr('x', function(d) {return self.xScale(d.x) - self.settings.rectWidth/2 + self.settings.textPadding})
			.attr('y', function(d) {return self.yScale(d.y) + self.settings.rectHeight/2 + 5})
			.text(function(d) {return d.yText + ': ' + d.id})
			.attr('class', 'label')
			.style('text-anchor', 'start')
			
	}
	
}

// Functions for computing hover positions
Chart.prototype.moveHoverText = function() {
	var self = this
	self.hoverText = self.g.selectAll('.hover-text').data(self.hoverTextValues, function(d) {return d.id})
	self.hoverText.enter().append('text').call(self.hoverTextFunction)
	self.hoverText.exit().remove()
	self.g.selectAll('.hover-text').transition().duration(0).call(self.hoverTextFunction)
}

Chart.prototype.moveHoverLabel = function() {
	var self = this
	self.hoverLabel = self.g.selectAll('.hover-label').data(self.hoverLineValue, function(d) {return d.id})
	self.hoverLabel.enter().append('text').call(self.hoverLabelFunction)
	self.hoverLabel.exit().remove()
	self.g.selectAll('.hover-label').transition().duration(0).call(self.hoverLabelFunction)
}

Chart.prototype.moveHoverPoints = function() {
	var self = this
	self.hoverPoints = self.g.selectAll('.hover-point').data(self.hoverPointValues, function(d) {return d.id})
	self.hoverPoints.enter().append('circle').call(self.hoverPointFunction)
	self.hoverPoints.exit().remove()
	self.g.selectAll('.hover-point').transition().duration(0).call(self.hoverPointFunction)
}

Chart.prototype.moveHoverLine = function() {
	var self = this
	self.hoverLine = self.g.selectAll('.hover-line').data(self.hoverLineValue, function(d) {return d.id})
	self.hoverLine.enter().append('line').call(self.hoverLineFunction)
	self.hoverLine.exit().remove()
	self.g.selectAll('.hover-line').transition().duration(0).call(self.hoverLineFunction)
}

Chart.prototype.findYatX = function(x, line, start) {
	var self = this
	var maxIters = 1000
	if(line==undefined) return
     function getXY(len) {
          var point = line.getPointAtLength(len);
          return [point.x, point.y];
     }
     var curlen = x - start;
	 var iteration = 0 
	 var max = x 
	 var id = d3.select(line).attr('line-id') 	 
     while (getXY(curlen)[0] < max && iteration<maxIters) { 
		iteration += 1
		curlen += 3; 
	}
     return getXY(curlen)[1];
}
