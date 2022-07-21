import React from 'react';
import {render} from 'react-dom';
import DeckGL, {GeoJsonLayer, ArcLayer} from 'deck.gl';
import {MVTLayer} from '@deck.gl/geo-layers';

// source: Natural Earth http://www.naturalearthdata.com/ via geojson.xyz
const COUNTRIES =
  'https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_50m_admin_0_scale_rank.geojson'; //eslint-disable-line
const STOPS = 
//'https://geo-server.advanced-infrastructure.co.uk/geoserver/gwc/service/tms/1.0.0/dev:brighton_parking@EPSG:4326@pbf/{z}/{x}/{y}.pbf'
//"https://geo-server.advanced-infrastructure.co.uk/geoserver/dev/wms?service=WMS&version=1.1.0&request=GetMap&layers=dev%3Abrighton_parking&bbox=-0.277121633291245%2C50.8162384033203%2C-0.098754189908504%2C50.8547058105469&width=768&height=330&srs=EPSG%3A4326&styles=&format=geojson&tiled=true"
"https://geo-server.advanced-infrastructure.co.uk/geoserver/gwc/service/wmts?REQUEST=GetTile&SERVICE=WMTS&VERSION=1.0.0&LAYER=dev:brighton_parking&STYLE=&TILEMATRIX=EPSG:4326:{z}&TILEMATRIXSET=EPSG:4326&FORMAT=application/vnd.mapbox-vector-tile&TILECOL={x}&TILEROW={y}"

const INITIAL_VIEW_STATE = {
  latitude: 51.47,
  longitude: 0.45,
  zoom: 6,
  bearing: 0,
  pitch: 0
};

function Root() {
  const onClick = info => {
    if (info.object) {
      // eslint-disable-next-line
      alert(`${info.object.properties.name} (${info.object.properties.abbrev})`);
    }
  };

  return (
    <DeckGL controller={true} initialViewState={INITIAL_VIEW_STATE}>
      <GeoJsonLayer
        id="base-map"
        data={COUNTRIES}
        stroked={true}
        filled={true}
        lineWidthMinPixels={2}
        opacity={0.4}
        getLineColor={[60, 60, 60]}
        getFillColor={[200, 200, 200]}
      />
      <GeoJsonLayer
        id="brighton-parking"
        data={STOPS}
        stroked={true}
        filled={true}
        lineWidthMinPixels={2}
        getLineColor={[60, 60, 60]}
        getFillColor={[250, 56, 10]}
      />
    </DeckGL>
  );
}

/* global document */
render(<Root />, document.body.appendChild(document.createElement('div')));
