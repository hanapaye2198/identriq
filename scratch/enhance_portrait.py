from PIL import Image, ImageFilter, ImageEnhance

im = Image.open('public/images/john-kumal-portrait.png')
# Scale up with Lanczos
w, h = im.size
upscaled = im.resize((w * 4, h * 4), Image.Resampling.LANCZOS)

# Subtle unsharp mask to bring out facial contours cleanly
enhancer = ImageEnhance.Sharpness(upscaled)
sharpened = enhancer.enhance(1.4)

sharpened.save('public/images/john-kumal-portrait-hd.png')
print("Saved john-kumal-portrait-hd.png:", sharpened.size)
