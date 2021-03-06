require('../lib/style/services/SLDStyleConverter.js');

describe('SLDStyleConverter', function() {

    beforeEach(function() {
        // window.angular.mock.module is work around browserify conflict
        window.angular.mock.module('mapstory.styleEditor.SLDStyleConverter');

        inject(function(SLDStyleConverter) {
            this.SLDStyleConverter = SLDStyleConverter;
        });
    });

    it('should convert simple types (point)', inject(function(SLDStyleConverter) {
        var styleConfig = {
            "typeName": "simple",
            "symbol": {
                "size": 10,
                "shape": "circle",
                "graphic": null,
                "graphicType": null,
                "fillColor": "#ff0000",
                "fillOpacity": 80
            },
            "stroke": {
                "strokeColor": "#ffff00",
                "strokeWidth": 3,
                "strokeStyle": "solid",
                "strokeOpacity": 90
            },
            "geomType": "point"
        };
        var style = SLDStyleConverter.generateStyle(styleConfig);
        expect(style).toBe('<p0:StyledLayerDescriptor xmlns:p0="http://www.opengis.net/sld" version="1.0.0"><p0:NamedLayer><p0:Name>simple</p0:Name><p0:UserStyle><p0:FeatureTypeStyle><p0:Rule><p0:PointSymbolizer><p0:Graphic><p0:Mark><p0:WellKnownName>circle</p0:WellKnownName><p0:Fill><p0:CssParameter name="fill">#ff0000</p0:CssParameter><p0:CssParameter name="fill-opacity">0.8</p0:CssParameter></p0:Fill><p0:Stroke><p0:CssParameter name="stroke">#ffff00</p0:CssParameter><p0:CssParameter name="stroke-width">3</p0:CssParameter><p0:CssParameter name="stroke-opacity">0.9</p0:CssParameter></p0:Stroke></p0:Mark></p0:Graphic></p0:PointSymbolizer></p0:Rule></p0:FeatureTypeStyle></p0:UserStyle></p0:NamedLayer></p0:StyledLayerDescriptor>');
        // svg symbol (graphic)
        styleConfig = {
            "typeName": "simple",
            "symbol": {
                "size": 10,
                "shape": null,
                "graphic": "icon.svg",
                "graphicType": null,
                "fillColor": "#ff0000",
                "fillOpacity": 80
            },
            "stroke": {
                "strokeColor": "#ffff00",
                "strokeWidth": 3,
                "strokeStyle": "solid",
                "strokeOpacity": 90
            },
            "geomType": "point"
        };
        style = SLDStyleConverter.generateStyle(styleConfig);
        // TODO add expect call when https://github.com/highsource/ogc-schemas/issues/34 gets resolved
    }));

    it('should convert simple types (line)', inject(function(SLDStyleConverter) {
        var styleConfig = {
            "typeName": "simple line",
            "stroke": {
                "strokeColor": "#ffff00",
                "strokeWidth": 3,
                "strokeStyle": "dashed",
                "strokeOpacity": 90
            },
            "geomType": "line"
        };
        var style = SLDStyleConverter.generateStyle(styleConfig);
        expect(style).toBe('<p0:StyledLayerDescriptor xmlns:p0="http://www.opengis.net/sld" version="1.0.0"><p0:NamedLayer><p0:Name>simple line</p0:Name><p0:UserStyle><p0:FeatureTypeStyle><p0:Rule><p0:LineSymbolizer><p0:Stroke><p0:CssParameter name="stroke">#ffff00</p0:CssParameter><p0:CssParameter name="stroke-width">3</p0:CssParameter><p0:CssParameter name="stroke-opacity">0.9</p0:CssParameter><p0:CssParameter name="stroke-dasharray">5 5</p0:CssParameter></p0:Stroke></p0:LineSymbolizer></p0:Rule></p0:FeatureTypeStyle></p0:UserStyle></p0:NamedLayer></p0:StyledLayerDescriptor>');
    }));

    it('should convert labels', inject(function(SLDStyleConverter) {
        var styleConfig = {
            "typeName": "simple",
            "symbol": {
                "size": 10,
                "shape": "circle",
                "graphic": null,
                "graphicType": null,
                "fillColor": "#ff0000",
                "fillOpacity": 80
            },
            "stroke": {
                "strokeColor": "#ffff00",
                "strokeWidth": 3,
                "strokeStyle": "solid",
                "strokeOpacity": 90
            },
            "label": {
                "attribute": "foo",
                "fillColor": "#000000",
                "fontFamily": "Serif",
                "fontSize": 10,
                "fontStyle": "normal",
                "fontWeight": "normal"
            },
            "geomType": "point"
        };
        var style = SLDStyleConverter.generateStyle(styleConfig);
        expect(style).toBe('<p0:StyledLayerDescriptor xmlns:p0="http://www.opengis.net/sld" version="1.0.0"><p0:NamedLayer><p0:Name>simple</p0:Name><p0:UserStyle><p0:FeatureTypeStyle><p0:Rule><p0:PointSymbolizer><p0:Graphic><p0:Mark><p0:WellKnownName>circle</p0:WellKnownName><p0:Fill><p0:CssParameter name="fill">#ff0000</p0:CssParameter><p0:CssParameter name="fill-opacity">0.8</p0:CssParameter></p0:Fill><p0:Stroke><p0:CssParameter name="stroke">#ffff00</p0:CssParameter><p0:CssParameter name="stroke-width">3</p0:CssParameter><p0:CssParameter name="stroke-opacity">0.9</p0:CssParameter></p0:Stroke></p0:Mark></p0:Graphic></p0:PointSymbolizer><p0:TextSymbolizer><p0:Label><p1:PropertyName xmlns:p1="http://www.opengis.net/ogc">foo</p1:PropertyName></p0:Label><p0:Font><p0:CssParameter name="font-family">Serif</p0:CssParameter><p0:CssParameter name="font-size">10</p0:CssParameter><p0:CssParameter name="font-style">normal</p0:CssParameter><p0:CssParameter name="font-weight">normal</p0:CssParameter></p0:Font><p0:Fill><p0:CssParameter name="fill">#000000</p0:CssParameter></p0:Fill></p0:TextSymbolizer></p0:Rule></p0:FeatureTypeStyle></p0:UserStyle></p0:NamedLayer></p0:StyledLayerDescriptor>');
    }));

    it('should convert unique classification', inject(function(SLDStyleConverter) {
        var styleConfig = {
            "stroke": {
                "strokeColor": "#ffff00"
            },
            "geomType": "point",
            "classify": {
                "attribute": "foo"
            },
            "rules": [{
                "value": "bar",
                "style": {
                    "symbol": {
                        "fillColor": "#ff9900"
                    }
                }
            }, {
                "value": "baz",
                "style": {
                    "symbol": {
                        "fillColor": "#b36b00"
                    }
                }
            }]
        };
        var style = SLDStyleConverter.generateStyle(styleConfig);
        expect(style).toBe('<p0:StyledLayerDescriptor xmlns:p0="http://www.opengis.net/sld" version="1.0.0"><p0:NamedLayer><p0:UserStyle><p0:FeatureTypeStyle><p0:Rule><p1:Filter xmlns:p1="http://www.opengis.net/ogc"><p1:PropertyIsEqualTo><p1:PropertyName>foo</p1:PropertyName><p1:Literal>bar</p1:Literal></p1:PropertyIsEqualTo></p1:Filter><p0:PointSymbolizer><p0:Graphic><p0:Mark><p0:WellKnownName>circle</p0:WellKnownName><p0:Fill><p0:CssParameter name="fill">#ff9900</p0:CssParameter><p0:CssParameter name="fill-opacity">1</p0:CssParameter></p0:Fill><p0:Stroke><p0:CssParameter name="stroke">#ffff00</p0:CssParameter><p0:CssParameter name="stroke-width"/><p0:CssParameter name="stroke-opacity"/></p0:Stroke></p0:Mark></p0:Graphic></p0:PointSymbolizer></p0:Rule><p0:Rule><p2:Filter xmlns:p2="http://www.opengis.net/ogc"><p2:PropertyIsEqualTo><p2:PropertyName>foo</p2:PropertyName><p2:Literal>baz</p2:Literal></p2:PropertyIsEqualTo></p2:Filter><p0:PointSymbolizer><p0:Graphic><p0:Mark><p0:WellKnownName>circle</p0:WellKnownName><p0:Fill><p0:CssParameter name="fill">#b36b00</p0:CssParameter><p0:CssParameter name="fill-opacity">1</p0:CssParameter></p0:Fill><p0:Stroke><p0:CssParameter name="stroke">#ffff00</p0:CssParameter><p0:CssParameter name="stroke-width"/><p0:CssParameter name="stroke-opacity"/></p0:Stroke></p0:Mark></p0:Graphic></p0:PointSymbolizer></p0:Rule></p0:FeatureTypeStyle></p0:UserStyle></p0:NamedLayer></p0:StyledLayerDescriptor>');
    }));

    it('should convert ranges of a classification', inject(function(SLDStyleConverter) {
        var styleConfig = {
            "stroke": {
                "strokeColor": "#ffff00"
            },  
            "geomType": "point",
            "classify": {
                "attribute": "foo"
            },      
            "rules": [{
                "range": {
                    "min": 0,
                    "max": 10
                },  
                "style": {
                    "symbol": {
                        "fillColor": "#ff9900"
                    }   
                }   
            }, {
                "range": {
                    "min": 10,
                    "max": 20
                },
                "style": {
                    "symbol": {
                        "fillColor": "#b36b00"
                    }
                }
            }]
        };  
        var style = SLDStyleConverter.generateStyle(styleConfig);
        expect(style).toBe('<p0:StyledLayerDescriptor xmlns:p0="http://www.opengis.net/sld" version="1.0.0"><p0:NamedLayer><p0:UserStyle><p0:FeatureTypeStyle><p0:Rule><p1:Filter xmlns:p1="http://www.opengis.net/ogc"><p1:PropertyIsBetween><p1:PropertyName>foo</p1:PropertyName><p1:LowerBoundary><p1:Literal>0</p1:Literal></p1:LowerBoundary><p1:UpperBoundary><p1:Literal>10</p1:Literal></p1:UpperBoundary></p1:PropertyIsBetween></p1:Filter><p0:PointSymbolizer><p0:Graphic><p0:Mark><p0:WellKnownName>circle</p0:WellKnownName><p0:Fill><p0:CssParameter name="fill">#ff9900</p0:CssParameter><p0:CssParameter name="fill-opacity">1</p0:CssParameter></p0:Fill><p0:Stroke><p0:CssParameter name="stroke">#ffff00</p0:CssParameter><p0:CssParameter name="stroke-width"/><p0:CssParameter name="stroke-opacity"/></p0:Stroke></p0:Mark></p0:Graphic></p0:PointSymbolizer></p0:Rule><p0:Rule><p2:Filter xmlns:p2="http://www.opengis.net/ogc"><p2:PropertyIsBetween><p2:PropertyName>foo</p2:PropertyName><p2:LowerBoundary><p2:Literal>10</p2:Literal></p2:LowerBoundary><p2:UpperBoundary><p2:Literal>20</p2:Literal></p2:UpperBoundary></p2:PropertyIsBetween></p2:Filter><p0:PointSymbolizer><p0:Graphic><p0:Mark><p0:WellKnownName>circle</p0:WellKnownName><p0:Fill><p0:CssParameter name="fill">#b36b00</p0:CssParameter><p0:CssParameter name="fill-opacity">1</p0:CssParameter></p0:Fill><p0:Stroke><p0:CssParameter name="stroke">#ffff00</p0:CssParameter><p0:CssParameter name="stroke-width"/><p0:CssParameter name="stroke-opacity"/></p0:Stroke></p0:Mark></p0:Graphic></p0:PointSymbolizer></p0:Rule></p0:FeatureTypeStyle></p0:UserStyle></p0:NamedLayer></p0:StyledLayerDescriptor>');
    }));

});
