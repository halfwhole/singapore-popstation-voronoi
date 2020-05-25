## Running locally

``` python
python -m SimpleHTTPServer
```

Then you can access `http://localhost:8000`.

## POPStation data

``` python
python3 scrape.py
```

This will generate and update `data.json` to contain the latest POPStation data
in GeoJSON format. The information is accurate as of 25 May 2020.

Source: https://www.speedpost.com.sg/locate-us/get-map-data
