// 3 imports from GEE assets

// Create urban masks
var urbanMask2019 = urban2019.eq(2); // Urban pixels become 1, others 0
var urbanMask2024 = urban2024.eq(2);

// 1. Growth rate.

//Compute urban expansion (only new urban pixels)
var urbanExpansion = urbanMask2024
  .and(urbanMask2019.not())
  .rename("Urban_Growth");

var expansionVis = { min: 0, max: 1, palette: ["white", "blue"] };
Map.addLayer(urbanExpansion, expansionVis, "Urban Expansion 2019-2024");

// 2. Proximity to Existing Urban Areas

// Compute Euclidean distance from each pixel to the nearest 2019 urban area (in meters)
var distToUrban2019 = urbanMask2019
  .fastDistanceTransform()
  .sqrt()
  .multiply(10) // Convert pixels to meters
  .rename("Distance_to_2019");

// Mask this distance map to only include new urban pixels (expansion)
var expansionProximity = distToUrban2019.updateMask(urbanExpansion);

// Create a binary map for pixels within 100m
var expansionNear2019 = expansionProximity.lt(100); // Urban growth within 100m

// Count how many of the new urban pixels are near 2019 areas
var stats = expansionNear2019.reduceRegion({
  reducer: ee.Reducer.sum(),
  scale: 10,
  maxPixels: 1e13,
});
print("New Urban Pixels <100m from 2019:", stats);

// Visualization (Optional)
var visNear = { min: 0, max: 1, palette: ["white", "blue"] };
Map.addLayer(expansionNear2019, visNear, "Urban Expansion <100m from 2019");

// 3. Proximity to coastline, 100m buffer

// AOI polygon geometry
var aoiBoundary = AOI.geometry();

// Add to the map to visualize
Map.addLayer(aoiBoundary, { color: "red" }, "AOI Boundary");

// Create a 100m inward buffer (200/2)
var coastalBuffer = aoiBoundary.buffer(200);

// Add it to the map for verification
Map.addLayer(coastalBuffer, { color: "blue" }, "100m Coastal Buffer");

//Clip urban pixels inside the buffer
var urban2019_coast = urbanMask2019
  .updateMask(urbanMask2019)
  .clip(coastalBuffer);
var urban2024_coast = urbanMask2024
  .updateMask(urbanMask2024)
  .clip(coastalBuffer);
var urbanExpansion_coast = urbanExpansion
  .updateMask(urbanExpansion)
  .clip(coastalBuffer);

var coastalUrban2019 = urban2019_coast.reduceRegion({
  reducer: ee.Reducer.count(),
  geometry: coastalBuffer,
  scale: 10,
  maxPixels: 1e13,
});

var coastalUrban2024 = urban2024_coast.reduceRegion({
  reducer: ee.Reducer.count(),
  geometry: coastalBuffer,
  scale: 10,
  maxPixels: 1e13,
});

var coastalUrbanExpansion = urbanExpansion_coast.reduceRegion({
  reducer: ee.Reducer.count(),
  geometry: coastalBuffer,
  scale: 10,
  maxPixels: 1e13,
});

print("Urban Pixels in 2019 (Coastal Zone):", coastalUrban2019);
print("Urban Pixels in 2024 (Coastal Zone):", coastalUrban2024);
print("Urban Expansion in Coastal Zone:", coastalUrbanExpansion);

var visCoastalUrban = { min: 0, max: 1, palette: ["white", "blue"] };
Map.addLayer(urban2019_coast, visCoastalUrban, "Urban 2019 (Coastal)");
Map.addLayer(urban2024_coast, visCoastalUrban, "Urban 2024 (Coastal)");
Map.addLayer(
  urbanExpansion_coast,
  { min: 0, max: 1, palette: ["white", "red"] },
  "Urban Expansion (Coastal)"
);
