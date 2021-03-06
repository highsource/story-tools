'use strict';

(function() {

    var module = angular.module('styleExample', [
        'mapstory.styleEditor',
        'colorpicker.module']);
    var map;

    function makeLayers() {
        function makeLayer(name, type, data, atts) {
            var f = data.map(function(d) {
                for (var i=0, ii=atts.length; i<ii; ++i) {
                    d[atts[i]] = parseInt(Math.random()*10);
                }
                return new ol.Feature(d);
            });
            var vector = new ol.layer.Vector({
                source: new ol.source.Vector({
                    features: f
                })
            });
            vector._styles = null;
            vector._layerInfo = {
                geomType: type,
                attributes: atts
            };
            vector.set('id', name);
            map.addLayer(vector);
        }
        makeLayer('point1', 'point', [
            {'geometry': new ol.geom.Point([-500000, -500000])},
            {'geometry': new ol.geom.Point([-500000, -400000])},
            {'geometry': new ol.geom.Point([-500000, -300000])},
            {'geometry': new ol.geom.Point([-500000, -200000])},
            {'geometry': new ol.geom.Point([-500000, -100000])}
        ], ['p1a1','p1a2','p1a3']);
        makeLayer('point2', 'point', [
            {'geometry': new ol.geom.Point([-750000, -500000])},
            {'geometry': new ol.geom.Point([-750000, -400000])},
            {'geometry': new ol.geom.Point([-750000, -300000])},
            {'geometry': new ol.geom.Point([-750000, -200000])},
            {'geometry': new ol.geom.Point([-750000, -100000])}
        ], ['p2a1','p2a2','p2a3']);
        makeLayer('line', 'line', [
            {'geometry': new ol.geom.LineString([[0, 0], [-500000, 500000]])}
        ], ['l1','l2','l3']);
    }

    module.run(function(iconCommons) {
        map = new ol.Map({
            layers: [new ol.layer.Tile({
                    source: new ol.source.MapQuest({layer: 'sat'})
                })],
            target: 'map',
            view: new ol.View({
                center: [0, 0],
                zoom: 3
            })
        });
        window.map = map;

        makeLayers();


        (function() {
            var root = angular.element(document.getElementsByTagName('body'));
            var last;
            var watchers = 0;

            var f = function(element) {
                if (element.data().hasOwnProperty('$scope')) {
                    watchers += (element.data().$scope.$$watchers || []).length;
                }

                angular.forEach(element.children(), function(childElement) {
                    f(angular.element(childElement));
                });
            };

            window.setInterval(function() {
                watchers = 0;
                f(root);
                if (watchers != last) {
                   console.log(watchers);
                }
                last = watchers;
            }, 1000);

        })();
    });

    // inject some high-contrast defaults
    module.provider('stStyleDefaults', function() {
        // default values
        var values = {
            fillColor: '#ff0000',
            strokeColor: '#ffff00',
            strokeWidth: 3,
            size: 24
        };
        return {
            $get: function() {
                return values;
            }
        };
    });

    module.controller('exampleController', function($scope, $http, ol3StyleConverter) {
        $scope.styleFormInvalid = false;
        $scope.styleChanged = function(layer) {
            $scope.styleJSON = angular.toJson(layer.style, true);
            layer._layer.setStyle(function(feature, resolution) {
                return ol3StyleConverter.generateStyle(layer.style, feature, resolution);
            });
            $scope.loaddata = function(geojson) {
                $http.get(geojson).success(function(data) {
                    var layer = new ol.layer.Vector({
                        source: new ol.source.GeoJSON({
                            object: data,
                            projection: 'EPSG:3857'
                        })
                    });
                    layer._layerInfo = {
                        geomType: data.features[0].geometry.type.toLowerCase(),
                        attributes: Object.keys(data.features[0].properties)
                    };
                    layer.set('id', geojson);
                    map.addLayer(layer);
                    map.getView().fitExtent(layer.getSource().getExtent(), map.getSize());
                });
            };
        };
        $scope.formChanged = function(form) {
            $scope.styleFormInvalid = form.$invalid;
        };
    });

    module.controller('layerController', function($scope) {
        $scope.layers = [];
        function update() {
            $scope.layers = map.getLayers().getArray().slice(1).map(function(l) {
                return {
                    _layer: l,
                    info: l._layerInfo
                };
            });
        }
        map.getLayers().on('add', function() {
           update();
        });
        update();
    });

    // this is a dummy
    module.factory('stLayerClassificationService', function($q) {
        return {
            classify: function(layer, attribute, method, numClasses) {
                var defer = $q.defer();
                var classes = numClasses || (Math.random() * 10) + 1;
                var values = [], i, ii;
                var unique = method == 'unique';
                if (unique) {
                    var features = layer.getSource().getFeatures();
                    for (i=0, ii=features.length; i<ii; ++i) {
                        var val = features[i].get(attribute);
                        if (values.indexOf(val) === -1) {
                            values.push(val);
                        }
                    }
                    classes = Math.min(classes, values.length);
                }
                var classBreak = (Math.random() * 10).toFixed(2) + 1;
                var results = [];
                for (i = 0; i < classes; i++) {
                    var value = unique ? values[i] : {
                        min : (classBreak * i).toFixed(2),
                        max: (classBreak * (i + 1)).toFixed(2)
                    };
                    var rule = {
                        name: unique ? value : value.min + '-' + value.max
                    };
                    rule[unique ? 'value' : 'range'] = value;
                    results.push(rule);
                }
                defer.resolve(results);
                return defer.promise;
            }
        };
    });

    module.factory('iconCommonsImpl', function() {
        return {
            defaults: ["golf-18.svg",
                "cafe-18.svg",
                "restaurant-18.svg",
                "car-18.svg",
                "harbor-18.svg",
                "hospital-18.svg",
                "farm-18.svg",
                "zoo-18.svg",
                "water-18.svg",
                "heart-18.svg",
                "town-hall-18.svg",
                "industrial-18.svg"].map(function(n) {
                return '/assets/style_editor/icons/' + n;
            })
        };
    });

    module.directive("layerSelector", function() {
            return {
                restrict: "E",
                templateUrl: "layer-selector-template",
                link: function(scope, elem) {
                    scope.selectedLayer = null;
                    scope.setLayer = function(layer) {
                        if (!layer) return;
                        var old = scope.selectedLayer;
                        if (old) {
                            old._selected = false;
                        }
                        scope.selectedLayer = layer;
                        scope.selectedLayer._selected = true;
                    };
                    scope.setLayer(scope.layers[0]);
                }
            };
        });
})();
