from PIL import Image

im = Image.open(r'C:\Users\ASUS\.gemini\antigravity-ide\brain\dc6bce60-f0aa-41e6-accc-1d32c523728b\.user_uploaded\media_1792208764066.png')
w, h = im.size
print("Width:", w, "Height:", h)

# Sample corners and borders
corners = {
    'top-left (0,0)': im.getpixel((0,0)),
    'top-right': im.getpixel((w-1, 0)),
    'bottom-left': im.getpixel((0, h-1)),
    'bottom-right': im.getpixel((w-1, h-1)),
    'mid-left (0, h//2)': im.getpixel((0, h//2)),
    'mid-right (w-1, h//2)': im.getpixel((w-1, h//2)),
    'bottom-mid (w//2, h-1)': im.getpixel((w//2, h-1)),
}
for k, v in corners.items():
    print(k, v)
