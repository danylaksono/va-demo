import React from 'react';
import {render} from 'react-dom';

import DeckGL from '@deck.gl/react';
import {MapView} from '@deck.gl/core';
import {MVTLayer, H3HexagonLayer, TileLayer} from '@deck.gl/geo-layers';
import {BitmapLayer, PathLayer} from '@deck.gl/layers';
import {DataFilterExtension} from '@deck.gl/extensions';

const INITIAL_VIEW_STATE = {
  latitude: 51.753,
  longitude: -1.245,
  zoom: 10.5,
  maxZoom: 20,
  maxPitch: 89,
  bearing: 0
};

const COPYRIGHT_LICENSE_STYLE = {
  position: 'absolute',
  right: 0,
  bottom: 0,
  backgroundColor: 'hsla(0,0%,100%,.5)',
  padding: '0 5px',
  font: '12px/20px Helvetica Neue,Arial,Helvetica,sans-serif'
};

const LINK_STYLE = {
  textDecoration: 'none',
  color: 'rgba(0,0,0,.75)',
  cursor: 'grab'
};

const DATA_URL = './GroundmountPV_h3.csv'

const PARKING =
'https://geo-server.advanced-infrastructure.co.uk/geoserver/gwc/service/wmts?REQUEST=GetTile&SERVICE=WMTS&VERSION=1.0.0&LAYER=oxford:groundmountpv&STYLE=&TILEMATRIX=EPSG:900913:{z}&TILEMATRIXSET=EPSG:900913&FORMAT=application/vnd.mapbox-vector-tile&TILECOL={x}&TILEROW={y}';


/* global window */
const devicePixelRatio = (typeof window !== 'undefined' && window.devicePixelRatio) || 1;

function getTooltip({tile}) {
  const {x, y, z} = tile.index;
  return tile && `tile: x: ${x}, y: ${y}, z: ${z}`;
}

export default function App({h3data, showBorder = false, onTilesLoad = null}) {
  const tileLayer = new TileLayer({
    // https://wiki.openstreetmap.org/wiki/Slippy_map_tilenames#Tile_servers
    data: [
      'https://a.tile.openstreetmap.org/{z}/{x}/{y}.png',
      'https://b.tile.openstreetmap.org/{z}/{x}/{y}.png',
      'https://c.tile.openstreetmap.org/{z}/{x}/{y}.png'
    ],

    // Since these OSM tiles support HTTP/2, we can make many concurrent requests
    // and we aren't limited by the browser to a certain number per domain.
    maxRequests: 20,

    pickable: false,
    onViewportLoad: onTilesLoad,
    autoHighlight: showBorder,
    highlightColor: [60, 60, 60, 40],
    // https://wiki.openstreetmap.org/wiki/Zoom_levels
    minZoom: 0,
    maxZoom: 19,
    tileSize: 256,
    zoomOffset: devicePixelRatio === 1 ? -1 : 0,
    renderSubLayers: props => {
      const {
        bbox: {west, south, east, north}
      } = props.tile;

      return [
        new BitmapLayer(props, {
          data: null,
          image: props.data,
          bounds: [west, south, east, north]
        }),
        showBorder &&
          new PathLayer({
            id: `${props.id}-border`,
            visible: props.visible,
            data: [
              [
                [west, north],
                [west, south],
                [east, south],
                [east, north],
                [west, north]
              ]
            ],
            getPath: d => d,
            getColor: [255, 0, 0],
            widthMinPixels: 4
          })
      ];
    }
  });

  const mvtlayer = new MVTLayer({
    id: 'mvt',
    data: PARKING,
    filled: true,
    onTileError: () => {},
    // Styles                
    getSourcePosition: f => [-1.245184590946568, 51.75307306057298], // oxford
    getTargetPosition: f => f.geometry.coordinates,
    getLineColor: [192, 192, 192],
    //getFillColor: [50, 50, 255],
    getFillColor: f => {
      switch (f.properties.Agri_Grade) {
        case 'falsen Agricultural':
          return [200, 250, 55];
        case 'Grade 1':
          return [200, 220, 200];
        case 'Grade 2':
          return [130, 140, 30];
        case 'Grade 3':
          return [30, 20, 230];
        case 'Grade 4':
          return [230, 24, 20];
        case 'Grade 5':
          return [130, 240, 20];
        case 'urban':
          return [230, 110, 20];  
        default:
          return [130, 110, 220];
      }
    },
    getWidth: 1,
    pickable: true,
    autoHighlight: true,
    getFilterValue: d => d.properties.Area_Ha,
    filterRange: [0, 300],
    extensions: [new DataFilterExtension({filterSize: 1})]
  });

  const H3layer = new H3HexagonLayer({
    id: 'h3-hexagon-layer',
    data: h3data,
    pickable: false,
    wireframe: false,
    filled: true,
    extruded: false,
    elevationScale: 20,
    getHexagon: d => d.h3_polyfill,
    getFillColor: [255, 250, 0],
    //getElevation: d => d.count
  });

  return (
    <DeckGL
      layers={[tileLayer, mvtlayer, H3layer]}
      views={new MapView({repeat: true})}
      initialViewState={INITIAL_VIEW_STATE}
      controller={true}
      getTooltip={({object}) => object && (object.properties.Agri_Grade)}
      //getTooltip={getTooltip}
    >
      <div style={COPYRIGHT_LICENSE_STYLE}>
        {'© '}
        <a style={LINK_STYLE} href="http://www.openstreetmap.org/copyright" target="blank">
          OpenStreetMap contributors
        </a>
      </div>
    </DeckGL>
  );
}

export function renderToDOM(container) {
  render(<App />, container);

  require('d3-fetch').csv(DATA_URL, (error, response) => {
    if (!error) {
      const h3data = response.map(d => [String(d.h3_polyfill), Number(d.index)]);
      console.log(h3data);
      render(<App data={data} />, container);
    }
  });
}
