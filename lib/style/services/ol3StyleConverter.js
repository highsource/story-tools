(function() {
    'use strict';

    var module = angular.module('mapstory.styleEditor.ol3StyleConverter', []);

    module.factory('ol3MarkRenderer', function(ol3StyleConverter) {
        return function(shapeName, size) {
            var black = ol3StyleConverter.getColor('#000000');
            var strokeWidth = 3; // hack to fix down-scaling for x and cross
            var opts = {color: black, width: strokeWidth};
            var canvas = angular.element(ol3StyleConverter.generateShape({
                    symbol: {shape: shapeName, size: size - strokeWidth}
                },
                new ol.style.Fill(opts),
                new ol.style.Stroke(opts)).getImage());
            return canvas;
        };
    });

    module.factory('ol3StyleConverter', function(stSvgIcon) {
        return {
            generateShapeConfig: function(style, fill, stroke) {
                var shape = style.symbol.shape,
                    // final size is actually (2 * (radius + stroke.width)) + 1
                    radius = style.symbol.size / 2;
                if (shape === 'circle') {
                    return {
                        fill: fill,
                        stroke: stroke,
                        radius: radius
                    };
                } else if (shape === 'square') {
                    return {
                        fill: fill,
                        stroke: stroke,
                        points: 4,
                        radius: radius,
                        angle: Math.PI / 4
                    };
                } else if (shape === 'triangle') {
                    return {
                        fill: fill,
                        stroke: stroke,
                        points: 3,
                        radius: radius,
                        angle: 0
                    };
                } else if (shape === 'star') {
                    return {
                        fill: fill,
                        stroke: stroke,
                        points: 5,
                        radius: radius,
                        radius2: 0.5*radius,
                        angle: 0
                    };
                } else if (shape === 'cross') {
                    return {
                        fill: fill,
                        stroke: stroke,
                        points: 4,
                        radius: radius,
                        radius2: 0,
                        angle: 0
                    };
                } else if (shape === 'x') {
                    return {
                        fill: fill,
                        stroke: stroke,
                        points: 4,
                        radius: radius,
                        radius2: 0,
                        angle: Math.PI / 4
                    };
                }
            },
            generateShape: function(style, fill, stroke) {
                var config = this.generateShapeConfig(style, fill, stroke);
                if (style.symbol.graphic) {
                    var info = stSvgIcon.getImage(style.symbol.graphic, fill.getColor(), stroke.getColor(), true);
                    return new ol.style.Icon({
                        src: info.dataURI,
                        scale: style.symbol.size / Math.max(info.width, info.height),
                        opacity: style.symbol.opacity
                    });
                } else if (style.symbol.shape === 'circle') {
                    return new ol.style.Circle(config);
                } else {
                    return new ol.style.RegularShape(config);
                }
            },
            getText: function(style, feature) {
                if (style.label && style.label.attribute) {
                    return '' + feature.get(style.label.attribute);
                } else {
                    return undefined;
                }
            },
            generateText: function(style, stroke, feature) {
                if (style.label && style.label.attribute !== null) {
                    return new ol.style.Text({
                        fill: new ol.style.Fill({color: style.label.fillColor}),
                        stroke: stroke,
                        font: style.label.fontStyle + ' ' + style.label.fontWeight + ' ' + style.label.fontSize + 'px ' + style.label.fontFamily,
                        text: this.getText(style, feature)
                    });
                }
            },
            getColor: function(color, opacity) {
                var rgba = ol.color.asArray(color);
                if (opacity !== undefined) {
                    rgba = rgba.slice();
                    rgba[3] = opacity/100;
                }
                return 'rgba(' + rgba.join(',') + ')';
            },
            generateStyle: function(style, feature, resolution) {
                var result;
                if (!this.styleCache_) {
                    this.styleCache_ = {};
                }
                var key = JSON.stringify(style);
                if (this.styleCache_[key]) {
                    if (!this.styleCache_[key].length) {
                        var key2, text = this.getText(style, feature);
                        if (style.classify && style.classify.attribute) {
                            if (text) {
                                key2 = feature.get(style.classify.attribute) + '|' + text;
                            } else {
                                key2 = feature.get(style.classify.attribute);
                            }
                        } else {
                            key2 = this.getText(style, feature);
                        }
                        if (this.styleCache_[key][key2]) {
                            return this.styleCache_[key][key2];
                        }
                    } else {
                        return this.styleCache_[key];
                    }
                }
                var stroke;
                if (style.stroke) {
                    var lineDash;
                    if (style.stroke.strokeStyle === 'dashed') {
                        lineDash = [5];
                    } else if (style.stroke.strokeStyle === 'dotted') {
                        lineDash = [1,2];
                    }
                    stroke = new ol.style.Stroke({
                        lineDash: lineDash,
                        color: this.getColor(style.stroke.strokeColor, style.stroke.strokeOpacity),
                        width: style.stroke.strokeWidth
                    });
                }
                if (style.classify && style.classify.attribute !== null && style.rules.length > 0) {
                    var label;
                    for (var i=0, ii=style.rules.length; i<ii; ++i) {
                        var rule = style.rules[i];
                        var attrVal = feature.get(style.classify.attribute);
                        var match = false;
                        if (rule.value !== undefined) {
                            match = attrVal === rule.value;
                        } else if (rule.range) {
                            match = (attrVal >= rule.range.min && attrVal < rule.range.max);
                        }
                        if (match) {
                            // since there is no way for the user to select the point symbol in this case
                            // we default to a circle with a 10px radius
                            label = this.generateText(style, stroke, feature);
                            if (style.geomType === 'point' && rule.style.symbol.fillColor) {
                                result = [new ol.style.Style({
                                    text: label,
                                    image: new ol.style.Circle({
                                        fill: new ol.style.Fill({color: rule.style.symbol.fillColor}),
                                        stroke: stroke,
                                        radius: 10
                                    })
                                })];
                            } else if (style.geomType === 'line' && rule.style.stroke.strokeColor) {
                                result = [new ol.style.Style({
                                    text: label,
                                    stroke: new ol.style.Stroke({
                                        color: rule.style.stroke.strokeColor,
                                        width: 2
                                    })
                                })];
                            }
                            // TODO other geometry types
                        }
                    }
                    if (result) {
                        if (!this.styleCache_[key]) {
                            this.styleCache_[key] = {};
                        }
                        if (label) {
                            this.styleCache_[key][feature.get(style.classify.attribute) + '|' + this.getText(style, feature)] = result;
                        } else {
                            this.styleCache_[key][feature.get(style.classify.attribute)] = result;
                        }
                    }
                } else {
                    var fill = new ol.style.Fill({
                        color: this.getColor(style.symbol.fillColor, style.symbol.fillOpacity)
                    });
                    result = [
                        new ol.style.Style({
                            image: this.generateShape(style, fill, stroke),
                            fill: fill,
                            stroke: stroke,
                            text: this.generateText(style, stroke, feature)
                        })
                    ];
                }
                if (result) {
                    var hasText = result[0].getText();
                    if (hasText) {
                        if (!this.styleCache_[key]) {
                            this.styleCache_[key] = {};
                        }
                        this.styleCache_[key][this.getText(style, feature)] = result;
                    } else if (!(style.classify && style.classify.attribute)) {
                        this.styleCache_[key] = result;
                    }
                }
                return result;
            }
        };
    });
})();
