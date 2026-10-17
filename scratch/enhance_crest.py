from PIL import Image, ImageEnhance

im = Image.open('public/images/png-crest-kumul.png')
w, h = im.size
upscaled = im.resize((w * 4, h * 4), Image.Resampling.LANCZOS)
enhancer = ImageEnhance.Sharpness(upscaled)
sharpened = enhancer.enhance(1.3)
sharpened.save('public/images/png-crest-kumul-hd.png')
print("Saved png-crest-kumul-hd.png:", sharpened.size)
