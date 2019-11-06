"use strict";


(function(){
    let data = ""
    let svgContainer = ""
    const measurements = {
        width: 800,
        height: 650,
        marginAll: 50
    }

    let gen = "All"
    let leg = "All"

    const colors = {

        "Bug": "#4E79A7",
    
        "Dark": "#A0CBE8",
    
        "Electric": "#F28E2B",
    
        "Fairy": "#FFBE&D",
    
        "Fighting": "#59A14F",
    
        "Fire": "#8CD17D",
    
        "Ghost": "#B6992D",
    
        "Grass": "#499894",
    
        "Ground": "#86BCB6",
    
        "Ice": "#86BCB6",
    
        "Normal": "#E15759",
    
        "Poison": "#FF9D9A",
    
        "Psychic": "#79706E",
    
        "Steel": "#BAB0AC",
    
        "Water": "#D37295"
    
    }

    window.onload = function() {
        svgContainer = d3.select('body').append("svg")
            .attr('width', measurements.width)
            .attr('height', measurements.height);
        d3.csv("pokemon.csv")
            .then((csvData) => data = csvData)
            .then(() => makeScatterPlot());
            
    }

    function makeScatterPlot() {
        
        let spdef = data.map((row) => parseInt(row["Sp. Def"]))
        let totalStats = data.map((row) =>  parseFloat(row["Total"]))
        
        const limits = findMinMax(spdef, totalStats)

        let scaleX = d3.scaleLinear()
            .domain([limits.spdefMin - 5, limits.spdefMax])
            .range([0 + measurements.marginAll, (measurements.width - 200) - measurements.marginAll])

        let scaleY = d3.scaleLinear()
            .domain([limits.totalMax, limits.totalMin - 0.05])
            .range([0 + measurements.marginAll, measurements.height - measurements.marginAll])

        drawAxes(scaleX, scaleY)

        plotData(scaleX, scaleY)

        makeLabels()

        makeLegend()

    }

    // make title and axes labels
    function makeLabels() {

        svgContainer.append('text')
        .attr('x', ((measurements.width - 200) / 2))
        .attr('y', (measurements.height - 10))
        //.attr('y', 400)
        .style('font-size', '10pt')
        .text("Sp. Def");

        svgContainer.append('text')
        .attr('transform', 'translate(15, ' + (measurements.height / 2) + ')rotate(-90)')
        .style('font-size', '10pt')
        .text("Total");
    }

    // Code to make a legend, 
    // from (https://www.d3-graph-gallery.com/graph/custom_legend.html)
    function makeLegend(){

        // create a list of keys
        var keys = ["Bug",
    
        "Dark",
    
        "Electric",
    
        "Fairy",
    
        "Fighting",
    
        "Fire",
    
        "Ghost",
    
        "Grass",
    
        "Ground",
    
        "Ice",
    
        "Normal",
    
        "Poison",
    
        "Psychic",
    
        "Steel",
    
        "Water"]

        // Add one dot in the legend for each name.
        svgContainer.selectAll("mydots")
            .data(keys)
            .enter()
            .append("circle")
                .attr("cx", 650)
                .attr("cy", function(d,i){ return 100 + i*25}) // 100 is where the first dot appears. 25 is the distance between dots
                .attr("r", 7)
                .style("fill", function(d){ return colors[d]})

        // Add one dot in the legend for each name.
        svgContainer.selectAll("mylabels")
        .data(keys)
        .enter()
        .append("text")
            .attr("x", 670)
            .attr("y", function(d,i){ return 100 + i*25}) // 100 is where the first dot appears. 25 is the distance between dots
            .style("fill", function(d){ return colors[d]})
            .text(function(d){ return d})
            .attr("text-anchor", "left")
            .style("alignment-baseline", "middle")

    }

    function findMinMax(spdef, totalStats) {
        return {
            spdefMin: d3.min(spdef),
            spdefMax: d3.max(spdef),
            totalMin: d3.min(totalStats),
            totalMax: d3.max(totalStats)
        }
    }

    function drawAxes(scaleX, scaleY) {
        // these are not HTML elements. They're functions!
        let xAxis = d3.axisBottom()
            .scale(scaleX)

        let yAxis = d3.axisLeft()
            .scale(scaleY)
            
        svgContainer.append('g')
            .attr('transform', 'translate(0,600)')
            .call(xAxis)

        svgContainer.append('g')
            .attr('transform', 'translate(50, 0)')
            .call(yAxis)
    }

    function plotData(scaleX, scaleY) {
        const xMap = function(d) { return scaleX(+d["Sp. Def"]) }
        const yMap = function(d) { return scaleY(+d["Total"]) }   
        
        const circles = svgContainer.selectAll(".circle")
            .data(data)
            .enter()
            .append('circle')
                .attr('cx', xMap)
                .attr('cy', yMap)
                .attr('r', 6)
                .attr('fill', function(d) {
                    return colors[d["Type 1"]];
                })

        // Define the div for the tooltip
        var div = d3.select("body").append("div")	
            .attr("class", "tooltip")				
            .style("opacity", 0);

        circles.on("mouseover", function(d) {		
            div.transition()		
                .duration(200)		
                .style("opacity", .9);		
            div.html(d["Name"]+ "<br/>" + d["Type 1"] + "<br/>" + d["Type 2"])	
                .style("left", (d3.event.pageX) + "px")		
                .style("top", (d3.event.pageY - 28) + "px");	
            })					
        .on("mouseout", function(d) {		
            div.transition()		
                .duration(500)		
                .style("opacity", 0);	
        });

        makeDropDown(data, circles)

    }


    function makeDropDown(csvData, circles) {
        // Generation Drop Down
        var dropDown = d3.select("#filter").append("select")
                .attr("name", "Generation");

        // Legendary Drop Down
        var dropDown2 = d3.select("#filter2").append("select")
                .attr("name", "Legendary");
    
        // Generation Filter
        var defaultOption = dropDown.append("option")
                            .text("All");
        
        var options = dropDown.selectAll("option.state")
            .data(d3.map(data, function(d){return d.Generation;}).keys())
            .enter()
            .append("option")
            .classed("state", true);
        
        options.text(function (d) { return d; })
            .attr("value", function (d) { return d; });

        // Legendary Filter
        var defaultOption2 = dropDown2.append("option")
                    .text("All")
            
        var options2 = dropDown2.selectAll("option.state")
            .data(d3.map(data, function(d){return d.Legendary;}).keys())
            .enter()
            .append("option")
            .classed("state", true);
            
        options2.text(function (d) { return d; })
            .attr("value", function (d) { return d; });

        
        dropDown.on("change", function() {
            gen = this.value;

            filter(circles);
        })

        dropDown2.on("change", function() {
            leg = this.value;

            filter(circles);
        })

    }

        function filter(circles) {
            
            if (gen == "All" && leg == "All") {
                //show all data
                circles.attr("display", 'inline')

            } else if (gen == "All" && leg != "All") {
                //filter only by legend
                circles.filter(function(d) {
                    return leg != d['Legendary']
                }).attr("display", 'none')

                circles.filter(function(d) {
                    return leg == d['Legendary']
                }).attr("display", 'inline')

            } else if (gen != "All" && leg == "All") {

                //filter only by generation
                circles.filter(function(d) {
                    return gen != d['Generation']
                }).attr("display", 'none')

                circles.filter(function(d) {
                    return gen == d['Generation']
                }).attr("display", 'inline')

            } else {
                //filter by both conditions
                circles.filter(function(d) {
                    return !(leg == d['Legendary'] && gen == d['Generation'])
                }).attr("display", 'none')

                circles.filter(function(d) {
                    return leg == d['Legendary'] && gen == d['Generation']
                }).attr("display", 'inline')
            }


        }

    })()