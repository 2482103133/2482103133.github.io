from PIL import Image

def imt_to_01(from_path,to_path,mode):
    img = Image.open(from_path)
    lines = []

    pixels = img.load()  # this is not a list, nor is it list()'able
    width, height = img.size

    all_pixels = []
    for x in range(width):
        line = "["
        for y in range(height):
            cpixel = pixels[x, y]

            if  mode:
                ch = "0"
                if(cpixel[2] == 0):
                 ch = "1"

                line = line+ch+","
                pass
            else :
                line=line+str(cpixel)+","
            
        line = line.rstrip(",")
        line = line+"],"
        lines.append(line+"\n")

        # all_pixels.append(cpixel)
    # for row in img.getdata():
    #     line=""
    #     for p in row:
    #         line=line+str(p)+","
    #         pass
    #     print(line)
    #     lines.append(line+"\n")
    #     pass
    file = open(to_path, "w")
    file.writelines(lines)
    file.close()

    
imt_to_01("tmp/tmp.png","tmp/result.txt",True)


