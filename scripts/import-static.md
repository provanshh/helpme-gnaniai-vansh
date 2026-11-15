# Static import scripts (not live API calls)

## Blood banks (data.gov.in)

1. Download the national blood bank directory CSV from data.gov.in.
2. Geocode missing coordinates with Mapbox Geocoding (batch; cache results).
3. Upsert into `places` with `source=import`, `kind=blood_bank`.

## NGO Darpan

1. Download NGO Darpan CSV (name, district, sector — typically **no coordinates**).
2. Geocode district/city with Mapbox; set `data_quality.approximateCoords=true`.
3. Upsert with `source=import`, `kind=ngo`.

Run importers offline; do not call these portals from the browser or per user request.
