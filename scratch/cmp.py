import filecmp

same = filecmp.cmp('public/images/png-national-id-template.png', 'public/images/png-national-id-reference.png')
print("Is template identical to reference?", same)
