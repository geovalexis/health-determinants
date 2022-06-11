

export function addInteractiveChoroplethMap(
    geojsonMap,
    element,
    viewCenter,
    viewZoom,
    propertyKey,
    featureKey,
    featureDescription,
    featureUnits,
    legendColors,
    minValue,
    colorsSpan
) {
    const map = L.map(element).setView(viewCenter, viewZoom);

    const tiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    // control that shows state info on hover
    const info = L.control();

    info.onAdd = function (map) {
        this._div = L.DomUtil.create('div', 'info');
        this.update();
        return this._div;
    };

    info.update = function (props) {
        this._div.innerHTML = `<h4>${featureDescription}</h4>` + (props ?
            '<b>' + props.NAME + '</b><br />' + (props[propertyKey]?.[featureKey] ?
                parseFloat(props[propertyKey][featureKey]).toFixed(2) + ` ${featureUnits}` : "No data")
            : 'Selecciona un país');
    };

    info.addTo(map);



    // get color depending on population density value
    function getColor(d) {
        let colorIndex = Math.floor((parseFloat(d) - minValue) / colorsSpan);
        if (colorIndex > legendColors.length-1) {
            colorIndex=legendColors.length-1;
        }
        return legendColors[colorIndex];
    }

    function style(feature) {
        return {
            weight: 2,
            opacity: 1,
            color: 'white',
            dashArray: '3',
            fillOpacity: 0.7,
            fillColor: getColor(feature.properties[propertyKey]?.[featureKey])
        };
    }

    function highlightFeature(e) {
        const layer = e.target;

        layer.setStyle({
            weight: 5,
            color: '#666',
            dashArray: '',
            fillOpacity: 0.7
        });

        if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
            layer.bringToFront();
        }

        info.update(layer.feature.properties);
    }

    function resetHighlight(e) {
        geojson.resetStyle(e.target);
        info.update();
    }

    function zoomToFeature(e) {
        map.fitBounds(e.target.getBounds());
    }

    function onEachFeature(feature, layer) {
        layer.on({
            mouseover: highlightFeature,
            mouseout: resetHighlight,
            click: zoomToFeature
        });
    }

    /* global statesData */
    const geojson = L.geoJson(geojsonMap, {
        style: style,
        onEachFeature: onEachFeature
    }).addTo(map);


    const legend = L.control({ position: 'bottomright' });

    legend.onAdd = function (map) {

        const div = L.DomUtil.create('div', 'info legend');
        const labels = [];
        let from, to;

        for (let i = 0; i < legendColors.length; i++) {
            from = minValue + colorsSpan * i;
            to = minValue + colorsSpan * (i + 1);

            labels.push(
                '<i style="background:' + getColor(from) + '"></i> ' +
                from.toFixed(2) + (to ? ' &ndash; ' + to.toFixed(2) : '+'));
        }

        div.innerHTML = labels.join('<br>');
        return div;
    };

    legend.addTo(map);

    return map;
}