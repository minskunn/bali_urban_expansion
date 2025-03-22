import rasterio
import numpy as np
import matplotlib.pyplot as plt
from scipy.ndimage import label,  generate_binary_structure

raster_image = 'Classified2024_clean.tif'
with rasterio.open(raster_image) as src:
    urban_raster = src.read(1)  # Read the first band
    transform = src.transform  # Spatial reference info

    #Convert Urban Areas to Binary (1 = urban, 0 = non-urban)
urban_binary = (urban_raster == 2).astype(np.uint8)  

structure = generate_binary_structure(2, 2) # 2D array with 8-connectivity

#Identify Urban Clusters
urban_clusters, num_clusters = label(urban_binary, structure=structure)  # Label connected urban areas

print(f"Total Urban Clusters: {num_clusters}")






