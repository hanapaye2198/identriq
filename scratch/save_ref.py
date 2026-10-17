from PIL import Image
import numpy as np

im = Image.open(r'C:\Users\ASUS\.gemini\antigravity-ide\brain\dc6bce60-f0aa-41e6-accc-1d32c523728b\.user_uploaded\media_1792208764066.png')
print("Uploaded image mode:", im.mode, "size:", im.size)

# Let's save it directly as the official reference asset in public/images/png-national-id-reference.png
im.save('public/images/png-national-id-reference.png')
print("Saved public/images/png-national-id-reference.png")
