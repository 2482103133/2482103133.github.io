    $.Block = function (type) {
        //type:0为空气，1为砖块，2为玩家
        this.Type=type
    };

    $.Block.prototype ={
        Fill:function () {
            this.Filled=true;
        }
        ,
        UnFill:function () {
            this.Filled=false
        }
    }

    $.CreateShape=function(type,arr)
    {
        shape=[]
        for(i=0;i<arr.length;i++)
        {
            
            row=[]
            for(j=0;j<arr[i].length;j++)
                if(arr[i][j]!=0)
                {
                    row[j]=new $.Block(ToType(type))
                }
                else{
                    row[j]=new $.Block(0)
                }
            shape[i]=row
        }

        return shape
    }

    $.SetShapeType=function(type,shape)
    {

            for(i=0;i<shape.length;i++)
            {
                for(j=0;j<shape[i].length;j++)
                    if(shape[i][j].Type!=0)
                    shape[i][j].Type=type
            }

        
    }
