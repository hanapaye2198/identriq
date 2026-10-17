from PIL import Image
import numpy as np

im1 = Image.open('public/images/png-national-id-template.png')
im2 = Image.open('public/images/png-national-id-reference.png')
print("im1 size:", im1.size, "im2 size:", im2.size)

arr1 = np.array(im1)
arr2 = np.array(im2)
diff = np.abs(arr1.astype(int) - arr2.astype(int))
print("Max diff:", np.max(diff), "Mean diff:", np.mean(diff))
