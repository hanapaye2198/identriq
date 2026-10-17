from PIL import Image

im = Image.open(r'C:\Users\ASUS\.gemini\antigravity-ide\brain\dc6bce60-f0aa-41e6-accc-1d32c523728b\.user_uploaded\media_1792208764066.png')
print("Image size:", im.size)
print("Image mode:", im.mode)

# Let's save a clean copy to public/images/png-national-id-template.png if needed, but let's see how clear it is
# Let's also inspect the regions:
# Header: y=10..50
# Photo: x=40..120, y=60..160
# ID Number: x=125..240, y=60..90
# Signature: x=130..220, y=150..195
# QR: x=240..290, y=140..190

# Let's crop the crest, logo, etc.
crest = im.crop((20, 10, 85, 60))
crest.save('scratch/extracted_crest.png')

logo = im.crop((230, 10, 290, 60))
logo.save('scratch/extracted_logo.png')

print("Extracted test crops done.")
