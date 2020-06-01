## singapore-popstation-voronoi

![example image](image.png)

The translation isn't accounted for, so it's a little broken right now. :(

## Visiting the site

``` python
python -m SimpleHTTPServer
```

Then you can access `http://localhost:8000`.

## POPStation data

The POPStation data was retrieved by running `python3 scrape.py` on 25 May 2020.
The script will generate and update `data.json` to contain the latest POPStation
data in GeoJSON format.

Source: https://www.speedpost.com.sg/locate-us/
