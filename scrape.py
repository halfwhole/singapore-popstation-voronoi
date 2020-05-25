from pathlib import Path
import requests
import re
import json

CACHE_JSON = 'cache.json'
OUTPUT_JSON = 'data.json'
SPEEDPOST_URL = 'https://www.speedpost.com.sg/locate-us/get-map-data'


def load_json_popstations():
    if Path(CACHE_JSON).is_file():
        data = json.load(open(CACHE_JSON, 'r'))
    else:
        data = requests.post(SPEEDPOST_URL).json()
    popstations = [ft for ft in data['features'] if ft['type_name'] == 'popstation']
    return popstations


## Example output:
## {'name': 'POPStation@*SCAPE',
##  'address': '2 Orchard Link, *SCAPE, (Next to Taxi Stand), Singapore 237978',
##  'coordinates': [1.3012500, 103.8349991],
##  'operating_hours': '24 hours'}
def format_popstations(popstations):
    ## Input format: { 'days': str | list<str>, 'hours': str }
    def format_op_hour(op_hour):
        days = op_hour['days']
        days = days if type(days) == str else '/'.join(days)
        hours = op_hour['hours']
        return days + ': ' + hours

    def format_op_hours(op_hours):
        op_hours = [format_op_hour(op_hour) for op_hour in op_hours]
        return ', '.join(op_hours)

    ## Clean up the awfully inconsistent address formatting :(
    def format_address(address):
        split = address.strip().split(',')
        split = [x.strip() for x in split]
        join = ', '.join(split)
        join = re.sub('\(\s+', '(', join)
        join = re.sub('\s+\)', ')', join)
        return join

    formatted = []
    for ps in popstations:
        entry = {}
        entry['name'] = ps['name']
        entry['address'] = format_address(ps['address'])
        entry['coordinates'] = [float(ps['loc_y']), float(ps['loc_x'])]
        entry['operating_hours'] = '24 hours' if ps['always_open'] == '1' else format_op_hours(ps['operating_hours'])
        formatted.append(entry)

    return formatted


## Output format:
## {
##   'type': 'FeatureCollection',
##   'features': [
##      <features...>
##   ]
## }
def convert_geojson(popstations):
    ## Example output:
    ## {
    ##   'type': 'Feature',
    ##   'geometry': {'type': 'Point', 'coordinates': [1.30125, 103.8349991]},
    ##   'properties': {
    ##     'name': 'POPStation@*SCAPE',
    ##     'address': '2 Orchard Link, *SCAPE, (Next to Taxi Stand), Singapore 237978',
    ##     'operating_hours': '24 hours'
    ##    }
    ## }
    def convert_feature(popstation):
        result = {}
        result['type'] = 'Feature'
        result['geometry'] = {'type': 'Point', 'coordinates': popstation['coordinates']}
        result['properties'] = {
            'name': popstation['name'],
            'address': popstation['address'],
            'operating_hours': popstation['operating_hours']
        }
        return result

    features = [convert_feature(popstation) for popstation in popstations]
    geojson = {'type': 'FeatureCollection', 'features': features}
    return geojson


def save_geojson(geojson):
    with open(OUTPUT_JSON, 'w') as f:
        json.dump(geojson, f)


if __name__ == '__main__':
    popstations = load_json_popstations()
    popstations = format_popstations(popstations)
    geojson = convert_geojson(popstations)
    save_geojson(geojson)
