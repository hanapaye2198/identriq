from PIL import Image

im = Image.open('public/images/png-crest-kumul.png')
print("Crest size:", im.size, "mode:", im.mode)

im2 = Image.open('public/images/john-kumal-portrait.png')
print("Portrait size:", im2.size, "mode:", im2.mode)

im3 = Image.open('public/images/identriq-mark.png')
print("Identriq mark size:", im3.size, "mode:", im3.mode)
