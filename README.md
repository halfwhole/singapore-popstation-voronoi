## singapore-popstation-voronoi

Singapore split by the nearest POPStation. Made with Leaflet and D3.js.


![Example image](image.png)

## Visiting the site

``` python
python -m SimpleHTTPServer
```

Then you can access `http://localhost:8000`.

## POPStation data

The POPStation data was retrieved by running `python3 scrape.py` on 25 May 2020.
The script will generate and update `data.json` to contain the latest POPStation
data in GeoJSON format.

## Credits

Inspiration: https://github.com/jtlx/singapore-mrt-voronoi

Data source: https://www.speedpost.com.sg/locate-us
