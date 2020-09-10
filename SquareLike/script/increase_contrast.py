from PIL import Image
def change_contrast(img, level):
    factor = (259 * (level + 255)) / (255 * (259 - level))

    def contrast(c):
        return 128 + factor * (c - 128)
        
    return img.point(contrast)




# img=change_contrast(Image.open(r"C:\Users\c7563\Desktop\audio\pot.png"), 1000)
img=change_contrast(Image.open(r"tmp/tmp.png"), 1000)
img.save("tmp/tmp.png")