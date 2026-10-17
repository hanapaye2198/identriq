from PIL import Image

im = Image.open('public/images/png-national-id-reference.png')
# Card bounds are roughly:
# left ~ 10, top ~ 5, right ~ 290, bottom ~ 200
# Let's crop:
# 1. Left tapa: x=10..70, y=30..190
left_tapa = im.crop((10, 30, 70, 190))
left_tapa.save('scratch/zoom_left_tapa.png')

# 2. Right tapa: x=240..290, y=30..190
right_tapa = im.crop((240, 30, 290, 190))
right_tapa.save('scratch/zoom_right_tapa.png')

# 3. Center guilloche/watermark: x=130..230, y=50..150
center_bg = im.crop((130, 50, 230, 150))
center_bg.save('scratch/zoom_center_bg.png')

# 4. Chip: x=15..45, y=85..125
chip = im.crop((15, 85, 45, 125))
chip.save('scratch/zoom_chip.png')

# 5. Hologram over photo: x=80..130, y=90..150
hologram = im.crop((80, 90, 130, 150))
hologram.save('scratch/zoom_hologram.png')

print("Zoom crops saved successfully.")
