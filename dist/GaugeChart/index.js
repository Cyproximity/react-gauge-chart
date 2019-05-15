import _classCallCheck from "@babel/runtime/helpers/esm/classCallCheck";
import _createClass from "@babel/runtime/helpers/esm/createClass";
import _possibleConstructorReturn from "@babel/runtime/helpers/esm/possibleConstructorReturn";
import _getPrototypeOf from "@babel/runtime/helpers/esm/getPrototypeOf";
import _assertThisInitialized from "@babel/runtime/helpers/esm/assertThisInitialized";
import _inherits from "@babel/runtime/helpers/esm/inherits";
import React from "react";
import * as d3 from "d3";
import "./style.css";
/*
GaugeChart creates a gauge chart using D3
The chart is responsive and will have the same width as the "container"
The radius of the gauge depends on the width and height of the container
It will use whichever is smallest of width or height
The svg element surrounding the gauge will always be square
"container" is the div where the chart should be placed
TODO: Lägg till info om 'data' i docs
*/
//Constants

var startAngle = -Math.PI / 2; //Negative x-axis

var endAngle = Math.PI / 2; //Positive x-axis

var GaugeChart =
  /*#__PURE__*/
  (function(_React$Component) {
    _inherits(GaugeChart, _React$Component);

    //TODO: Change props to props
    function GaugeChart(props) {
      var _this;

      _classCallCheck(this, GaugeChart);

      _this = _possibleConstructorReturn(
        this,
        _getPrototypeOf(GaugeChart).call(this, props)
      );

      _this.initChart = function() {
        _this.svg = _this.container.append("svg");
        _this.g = _this.svg.append("g"); //Used for margins

        _this.doughnut = _this.g.append("g").attr("class", "doughnut"); //Set up the pie generator
        //Each arc should be of equal length (or should they?)

        _this.pie
          .value(function(d) {
            return d.value;
          }) //.padAngle(arcPadding)
          .startAngle(startAngle)
          .endAngle(endAngle)
          .sort(null); //Add the needle element

        _this.needle = _this.g.append("g").attr("class", "needle"); //Set up resize event listener to re-render the chart everytime the window is resized

        window.addEventListener("resize", function() {
          var resize = true;

          _this.renderChart(resize);
        });

        _this.renderChart();
      };

      _this.renderChart = function(resize) {
        _this.updateDimensions(); //Set dimensions of svg element and translations

        _this.svg
          .attr("width", _this.width + _this.margin.left + _this.margin.right)
          .attr(
            "height",
            _this.height + _this.margin.top + _this.margin.bottom
          );

        _this.g.attr(
          "transform",
          "translate(" + _this.margin.left + ", " + _this.margin.top + ")"
        ); //Set the radius to lesser of width or height and remove the margins
        //Calculate the new radius

        _this.calculateRadius();

        _this.doughnut.attr(
          "transform",
          "translate(" + _this.outerRadius + ", " + _this.outerRadius + ")"
        ); //Setup the arc

        _this.arc
          .outerRadius(_this.outerRadius)
          .innerRadius(_this.outerRadius * (1 - _this.props.arcWidth))
          .cornerRadius(_this.props.cornerRadius)
          .padAngle(_this.props.arcPadding); //Remove the old stuff

        _this.doughnut.selectAll(".arc").remove();

        _this.needle.selectAll("*").remove();

        _this.g.selectAll(".text-group").remove(); //Draw the arc

        var arcPaths = _this.doughnut
          .selectAll(".arc")
          .data(_this.pie(_this.arcData))
          .enter()
          .append("g")
          .attr("class", "arc");

        arcPaths
          .append("path")
          .attr("d", _this.arc)
          .style("fill", function(d) {
            return d.data.color;
          });

        _this.drawNeedle(resize); //Translate the needle starting point to the middle of the arc

        _this.needle.attr(
          "transform",
          "translate(" + _this.outerRadius + ", " + _this.outerRadius + ")"
        );
      };

      _this.updateDimensions = function() {
        //TODO: Fix so that the container is included in the component
        var marginInPercent = _this.props.marginInPercent;

        var divDimensions = _this.container.node().getBoundingClientRect(),
          divWidth = divDimensions.width,
          divHeight = divDimensions.height; //Set the new width and horizontal margins

        _this.margin.left = divWidth * marginInPercent;
        _this.margin.right = divWidth * marginInPercent;
        _this.width = divWidth - _this.margin.left - _this.margin.right;
        _this.margin.top = divHeight * marginInPercent;
        _this.margin.bottom = divHeight * marginInPercent;
        _this.height = _this.width / 2 - _this.margin.top - _this.margin.bottom; //this.height = divHeight - this.margin.top - this.margin.bottom;
      };

      _this.calculateRadius = function() {
        //The radius needs to be constrained by the containing div
        //Since it is a half circle we are dealing with the height of the div
        //Only needs to be half of the width, because the width needs to be 2 * radius
        //For the whole arc to fit
        //First check if it is the width or the height that is the "limiting" dimension
        if (_this.width < 2 * _this.height) {
          //Then the width limits the size of the chart
          //Set the radius to the width - the horizontal margins
          _this.outerRadius =
            (_this.width - _this.margin.left - _this.margin.right) / 2;
        } else {
          _this.outerRadius =
            _this.height - _this.margin.top - _this.margin.bottom;
        }

        _this.centerGraph();
      };

      _this.centerGraph = function() {
        _this.margin.left =
          _this.width / 2 - _this.outerRadius + _this.margin.right;

        _this.g.attr(
          "transform",
          "translate(" + _this.margin.left + ", " + _this.margin.top + ")"
        );
      };

      _this.drawNeedle = function(resize) {
        var percent = _this.props.percent;

        var _assertThisInitialize = _assertThisInitialized(_this),
          container = _assertThisInitialize.container,
          calculateRotation = _assertThisInitialize.calculateRotation;

        var needleRadius = 15,
          centerPoint = [0, -needleRadius / 2]; //Draw the triangle
        //var pathStr = `M ${leftPoint[0]} ${leftPoint[1]} L ${topPoint[0]} ${topPoint[1]} L ${rightPoint[0]} ${rightPoint[1]}`;

        var pathStr = _this.calculateRotation(0);

        _this.needle
          .append("path")
          .attr("d", pathStr)
          .attr("fill", "#464A4F"); //Add a circle at the bottom of needle

        _this.needle
          .append("circle")
          .attr("cx", centerPoint[0])
          .attr("cy", centerPoint[1])
          .attr("r", needleRadius)
          .attr("fill", "#464A4F");

        _this.addText(_this.props.percent); //Rotate the needle

        if (!resize) {
          _this.needle
            .transition()
            .delay(500)
            .ease(d3.easeElastic)
            .duration(3000)
            .tween("progress", function() {
              return function(percentOfPercent) {
                var progress = percentOfPercent * percent;
                return container
                  .select(".needle path")
                  .attr("d", calculateRotation(progress));
              };
            });
        } else {
          container
            .select(".needle path")
            .attr("d", calculateRotation(percent));
        }
      };

      _this.calculateRotation = function(percent) {
        var needleLength = _this.outerRadius * 0.55,
          //TODO: Maybe it should be specified as a percentage of the arc radius?
          needleRadius = 15,
          theta = _this.percentToRad(percent),
          centerPoint = [0, -needleRadius / 2],
          topPoint = [
            centerPoint[0] - needleLength * Math.cos(theta),
            centerPoint[1] - needleLength * Math.sin(theta)
          ],
          leftPoint = [
            centerPoint[0] - needleRadius * Math.cos(theta - Math.PI / 2),
            centerPoint[1] - needleRadius * Math.sin(theta - Math.PI / 2)
          ],
          rightPoint = [
            centerPoint[0] - needleRadius * Math.cos(theta + Math.PI / 2),
            centerPoint[1] - needleRadius * Math.sin(theta + Math.PI / 2)
          ];

        var pathStr = "M "
          .concat(leftPoint[0], " ")
          .concat(leftPoint[1], " L ")
          .concat(topPoint[0], " ")
          .concat(topPoint[1], " L ")
          .concat(rightPoint[0], " ")
          .concat(rightPoint[1]);
        return pathStr;
      };

      _this.percentToRad = function(percent) {
        return percent * Math.PI;
      };

      _this.getColors = function() {
        var _this$props = _this.props,
          nrOfLevels = _this$props.nrOfLevels,
          colors = _this$props.colors;
        var colorScale = d3
          .scaleLinear()
          .domain([1, nrOfLevels])
          .range([colors[0], colors[colors.length - 1]]) //Use the first and the last color as range
          .interpolate(d3.interpolateHsl);
        var colorArray = [];

        for (var i = 1; i <= nrOfLevels; i++) {
          colorArray.push(colorScale(i));
        }

        return colorArray;
      };

      _this.addText = function(percentage) {
        var textPadding = 20;

        _this.g
          .append("g")
          .attr("class", "text-group")
          .attr(
            "transform",
            "translate("
              .concat(_this.outerRadius, ", ")
              .concat(_this.outerRadius / 2 + textPadding, ")")
          )
          .append("text")
          .text("".concat(percentage * 100, "%"))
          .style("font-size", function() {
            if (_this.width < 500 || _this.height < 250) return 40;
            if (_this.width < 1000 || _this.height < 500) return 80;
            else return 100;
          })
          .style("fill", _this.props.textColor)
          .attr("class", "percent-text");
      };

      var _this$props2 = _this.props,
        _nrOfLevels = _this$props2.nrOfLevels,
        _colors = _this$props2.colors; //Class variables

      _this.svg = {};
      _this.g = {};
      _this.width = {};
      _this.height = {};
      _this.doughnut = {};
      _this.needle = {};
      _this.data = {};
      _this.outerRadius = {};
      _this.margin = {}; // = {top: 20, right: 50, bottom: 50, left: 50},

      _this.arc = d3.arc();
      _this.pie = d3.pie(); //Check if the number of colors equals the number of levels
      //Otherwise make an interpolation

      if (_nrOfLevels === _colors.length) {
        _this.colorArray = _colors;
      } else {
        _this.colorArray = _this.getColors();
      } //The data that is used to create the arc
      //The value is 1 for all objects because the arcs should be of same size

      _this.arcData = [];

      for (var _i = 0; _i < _nrOfLevels; _i++) {
        var arcDatum = {
          value: 1,
          color: _this.colorArray[_i]
        };

        _this.arcData.push(arcDatum);
      }

      return _this;
    }

    _createClass(GaugeChart, [
      {
        key: "componentDidMount",
        value: function componentDidMount() {
          if (this.props.id) {
            this.container = d3.select("#".concat(this.props.id)); //Initialize chart

            this.initChart();
          }
        }
      },
      {
        key: "componentDidUpdate",
        value: function componentDidUpdate() {
          //Initialize chart
          //TODO: Maybe not call this here?
          this.initChart();
        }
      },
      {
        key: "render",
        value: function render() {
          return React.createElement("div", {
            id: this.props.id,
            style: {
              width: "100%"
            }
          });
        }
      }
    ]);

    return GaugeChart;
  })(React.Component);

export default GaugeChart;

GaugeChart.defaultProps = {
  marginInPercent: 0.05,
  cornerRadius: 6,
  nrOfLevels: 3,
  percent: 0.4,
  arcPadding: 0.05,
  //The padding between arcs, in rad
  arcWidth: 0.2,
  //The width of the arc given in percent of the radius
  colors: ["#00FF00", "#FF0000"],
  //Default defined colors
  textColor: "#fff"
};
