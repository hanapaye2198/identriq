from PIL import Image
import os

p1 = 'public/images/png-national-id-template.png'
p2 = r'C:\Users\ASUS\.gemini\antigravity-ide\brain\dc6bce60-f0aa-41e6-accc-1d32c523728b\.user_uploaded\media_1792208764066.png'

if os.path.exists(p1):
    im1 = Image.open(p1)
    print("p1 size:", im1.size, im1.format, im1.mode)
if os.path.exists(p2):
    im2 = Image.open(p2)
    print("p2 size:", im2.size, im2.format, im2.mode)
