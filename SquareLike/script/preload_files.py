import os


def generate_preload_file(result=""):

    # traverse root directory, and list directories as dirs and files as files
    for root, dirs, files in os.walk("audio"):
        path = root.split(os.sep)
        print((len(path) - 1) * '---', os.path.basename(root))

        with open(result, "a") as fw:
            fw.write("//auto generated code\n")
            for file in files:
                # print(suffix+file)
                fw.write("preloadAudio('audio/"+file+"',update_tip)\n")
                # fw.write("$('html').append($(\"<audio class='preloaded_audio' src='audio/" + file+"' preload='auto'></audio>\"))\n")

    for root, dirs, files in os.walk("image"):
        path = root.split(os.sep)
        print((len(path) - 1) * '---', os.path.basename(root))

        with open(result, "a") as fw:
            fw.write("//auto generated code\n")
            for file in files:
                fw.write("preloadImage('image/"+file+"',update_tip)\n")
                # fw.write("$('html').append(\"<link rel='image' class='preloaded_image' href='image/"+file+"'>\")\n")


generate_preload_file(r"js\ResourceLoader.js")
