import glob
import os
from PIL import Image

uploaded = glob.glob(r'C:\Users\ASUS\.gemini\antigravity-ide\brain\dc6bce60-f0aa-41e6-accc-1d32c523728b\.user_uploaded\*.*')
for p in uploaded:
    try:
        im = Image.open(p)
        print(os.path.basename(p), im.size, im.format)
    except Exception as e:
        print(os.path.basename(p), e)
