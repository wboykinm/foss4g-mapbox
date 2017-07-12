# foss4g-mapbox
A Mapbox-powered FOSS4G 2017 Map

![map](https://www.dropbox.com/s/ww103sg1gfzfk32/Screenshot%202017-07-12%2010.12.23.png?dl=1)

Live map at [https://wboykinm.github.io/foss4g-mapbox/](https://wboykinm.github.io/foss4g-mapbox/)

### Build from source data
The FOSS4G 2017 organizing committee has helpfully provided a KML of conference locations. If they make any updates to that file, it can be preprocessed for this map:

```
wget -c http://2017.foss4g.org/foss4g_locations.kml
ogr2ogr -f GeoJSON foss4g_locations_b.geojson foss4g_locations.kml
```

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)