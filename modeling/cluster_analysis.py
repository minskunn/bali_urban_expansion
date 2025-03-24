import rasterio
from rasterio.warp import calculate_default_transform, reproject, Resampling
import numpy as np
import matplotlib.pyplot as plt
from scipy.ndimage import label,  generate_binary_structure

#Reproject to local coordinate sytem 
input_raster = 'Classified2024_clean.tif'
output_raster = 'Classified2024_clean_reprojected.tif'
target_crs = 'EPSG:32750'

with rasterio.open(input_raster) as src:
    transform, width, height = calculate_default_transform(
        src.crs, target_crs, src.width, src.height, *src.bounds)
    profile = src.profile.copy()
    profile.update(crs=target_crs, transform=transform, width=width, height=height)
    with rasterio.open(output_raster, "w", **profile) as dst:
        for i in range(1, src.count + 1):
            reproject(
                source=rasterio.band(src, i),
                destination=rasterio.band(dst, i),
                src_transform=src.transform,
                src_crs=src.crs,
                dst_transform=transform,
                dst_crs=target_crs,
                resampling=Resampling.nearest)
print(f"Raster reprojected to: {target_crs}")

with rasterio.open(output_raster) as src:
    urban_raster = src.read(1)  # Read the first band
    nodata_value = src.nodata
    transform = src.transform  # Spatial reference info
    pixel_size = src.res[0] * src.res[1] #Calc pixel size

    urban_masked = np.ma.masked_equal(urban_raster, nodata_value)
    pixel_size = src.res[0] * src.res[1]  # Size of a single pixel in square meters
    valid_pixels = np.sum(~urban_masked.mask)

    total_area_km2 = (valid_pixels * pixel_size) / 1_000_000  # Convert from m² to km²

#Convert Urban Areas to Binary (1 = urban, 0 = non-urban)
urban_binary = (urban_raster == 2).astype(np.uint8)  

structure = generate_binary_structure(2, 2) # 2D array with 8-connectivity

#Identify Urban Clusters
urban_clusters, num_clusters = label(urban_binary, structure=structure)  # Label connected urban areas

# Calculate sizes of clusters
cluster_sizes = np.bincount(urban_clusters.ravel())[1:]  # Exclude background (cluster 0)

# Convert sizes from pixels to real-world area (in m²)
cluster_areas = cluster_sizes * pixel_size

# Calculate statistics
total_area = np.sum(cluster_areas)  # Total area of all urban clusters (m²)
average_mean_cluster_size = np.mean(cluster_areas)  # Average mean cluster size (m²)
average_median_cluster_size = np.median(cluster_areas)  # Average median cluster size (m²)
largest_cluster = np.max(cluster_areas)  # Largest cluster size (m²)
smallest_cluster = np.min(cluster_areas)  # Smallest cluster size (m²)

#debug
print(f"Spatial Resolution (src.res): {src.res}")
print(f"Pixel Size (square meters): {pixel_size}")
print(f"CRS: {src.crs}")  # Print Coordinate Reference System (CRS)


# Print statistics
print(f"Total Area of Raster (km²): {total_area_km2}")
print(f"Total number of pixels: {valid_pixels}")
print(f"Total Urban Clusters: {num_clusters}")
print(f"Total Urban Area (m²): {total_area}")
print(f"Average Mean Cluster Size (m²): {average_mean_cluster_size}")
print(f"Average Median Cluster Size (m²): {average_median_cluster_size}")
print(f"Largest Cluster Size (m²): {largest_cluster}")
print(f"Smallest Cluster Size (m²): {smallest_cluster}")






