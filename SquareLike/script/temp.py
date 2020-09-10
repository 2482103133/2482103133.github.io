o_a = [
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0]
]
need=[
    [1,1,1],
    [1,1,1],
    [1,1,1]
]
# need=[
#     [0, 1, 0],
#     [1, 0, 0],
#     [0, 0, 0]
# ]

def f(a, i, j):
    if i>=len(a) or i<0:
        return
    if j>=len(a[i]) or j<0:
        return
    a[i][j] = 1 if a[i][j]==0 else 0
   
def flip(a,i,j):
    try:
        a[i][j]
    except Exception as e:
        return
    y = [row[:] for row in a]
     
    f(y,i,j)
    f(y,i+1,j)
    f(y,i-1,j)
    f(y,i,j+1)
    f(y,i,j-1)

    return y

obj={"arr":o_a,"path":[]}
last_level=[obj]
this_level=[]
searched=[]
level=0
def find():
    global o_a
    while(len(last_level)>0):
        cur=last_level.pop(0)
        for i in range(0, len(cur["arr"])):
            for j in range(0, len(cur["arr"][i])):

                arr=flip(cur["arr"],i,j)

                already_has=False
                for s in searched:
                    if(s==arr):
                        # print("already")
                        already_has=True
                        break
                if(already_has):
                    continue

                # print("\n".join([ str(item) for item in arr]))

                path=cur["path"].copy()
                path.append((i,j))
                
                if(arr==need):
                    
                    print("result----------------------------")
                    print(path)
                    print("----------------------------------")

                    print("\n".join([ str(item) for item in o_a]))
                    print()
                    fliped=o_a
                    for p in path:
                        fliped=flip(fliped,p[0],p[1])
                        print("\n".join([ str(item) for item in fliped]))
                        print()
                    return

                new_obj={"arr":arr,"path":path}

                last_level.append(new_obj)
                searched.append(arr)

        global level
        level+=1
        # print("Level:"+str(level))
    
        pass

find()


        
    
