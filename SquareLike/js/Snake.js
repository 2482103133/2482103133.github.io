$.Directions = {
    Left: {X: -1, Y: 0 },
    Right: { X: 1, Y: 0 },
    Up: { X: 0, Y: -1 },
    Down: { X: 0, Y: 1 }
}

$.Body = function (type, X, Y, last, Next) {
    $.Block.call(this, type)
    this.X = X
    this.Y = Y
    this.Last = last
    this.Next = Next
};
$.Food = function (x, y, map) {
    var shape = $.CreateShape( 3, [[1]])
    $.Entity.call(this, x, y, shape,map,3)
    this.has_shadow=false
};
$.Food.prototype = Object.create($.Entity.prototype)

$.Food.prototype.constructor = $.Food
$.Food.prototype.Move = function () {
    return true;
}
$.Food.prototype.BecomeStone = function () {
    return 0;
}

$.Snake = function Snake(x, y, shape, map) {
    $.Entity.call(this, x, y, shape, map,3)
    this.TailCount = 30
    // this.Type = 3
    this.Head = this.CreateBody(0, 1, null, null)
    this.Tail = this.CreateBody(0, 0, null, this.Head)

    this.Head.Next = null
    this.Head.Last = this.Tail

    this.Bodies = [this.Head]
    $.Shape = null
    this.Foods = []
    this.food_count=5
    this.Direction = $.Directions.Down
    this.kill_count=0
}


$.Snake.prototype = Object.create($.Dynamite.prototype)

$.Snake.prototype.constructor = $.Snake

$.Snake.prototype.OnComeIntoGame = function () {
    var part=this.Map.GetPart(this.X,this.Y,function(block){
        return  !ToType(block.Type).IsBlock()
    }).part
    var rand=function(x){return Math.floor(Math.random() *x)}

    for (let index = 0; index < this.food_count; index++) {
        var place=part[rand(part.length)]
        var food = new $.Food(place.X, place.Y, this.Map)
        var that=this;
        //死了就吃掉
        food.OnKill=function(){
            console.log("onkill!")
            that.Foods.splice(that.Foods.indexOf(this), 1)
              //化作金身
              if (that.Foods.length == 0) {
                var tmp = that.Head
                while (tmp != null) {
                    that.Type = 4
                    tmp = tmp.Last
                }
            }
            return true
        }
        this.Foods.push(food)
        this.Map.AddEntity(food)
    }
    
    this.Map.Intense();
}



$.Snake.prototype.OnLeaveGame = function () {
     //移除狗粮
    while(this.Foods.length>0)
    {
        this.Map.KillEntity(this.Foods[0])
    }
}
$.Snake.prototype.CreateBody = function (X, Y, Last, Next) {
    return new $.Body(this.Type, X, Y, Last, Next)
}
$.Snake.prototype.GetDirection=function(i_x, i_y)
{
    var direction= $.Directions.Down
    if (i_x == -1 && i_y == 0) {
        direction = $.Directions.Left
    }
    if (i_x == 1 && i_y == 0) {
        direction = $.Directions.Right
    }
    if (i_x == 0 && i_y == -1) {
        direction = $.Directions.Up
    }
    if (i_x == 0 && i_y == 1) {
        direction = $.Directions.Down
    }
    return direction;
}


//切换方向
$.Snake.prototype.OkToGoAction = function (i_x, i_y) {
    var last_direction= this.Direction
    this.Direction=this.GetDirection(i_x,i_y)
    if(last_direction==this.Direction)
    {
        //console.log("move")
        this.Map.AheadMove(this)
        this.Move()
    }
}


$.Snake.prototype.Do = function (iskey) {
    return this.Move(iskey)
}
//旋转映射为向上
$.Snake.prototype.Spin = function () {
    this.Up();
}

//从蛇身方块的坐标重建一张Shape表
$.Snake.prototype.GetShape = function () {
    // console.log("get shape")
    var max_x = -1000, max_y = -1000, min_x = 1000, min_y = 1000
    var tmp = this.Head
    while (tmp != null) {
        if (tmp.X > max_x) { max_x = tmp.X }
        if (tmp.X < min_x) { min_x = tmp.X }

        if (tmp.Y > max_y) { max_y = tmp.Y }
        if (tmp.Y < min_y) { min_y = tmp.Y }

        tmp = tmp.Last
    }

    this.X += min_x
    this.Y += min_y
    row_count = max_y - min_y + 1
    max_length = max_x - min_x + 1
    var arr = []

    for (let i = 0; i < row_count; i++) {
        row = []
        for (let j = 0; j < max_length; j++) {
            row.push((new $.Block(0)))
        }

        arr.push(row)
    }
    var tmp = this.Head
    while (tmp != null) {
        tmp.X -= min_x
        tmp.Y -= min_y

        arr[tmp.Y][tmp.X] = tmp
        tmp = tmp.Last
    }

    return arr
};
//判断是否是蛇身
$.Snake.prototype.IsBodyPlace = function (x, y) {
    var tmp = this.Head
    while (tmp != null) {
        if (tmp.X == x && tmp.Y == y) {
            return true;
        }
        tmp = tmp.Last
    }
    return false
}

//判断是否是蛇身
$.Snake.prototype.IsFood = function (x, y) {
    var tmp = this.Head

    for (const food of this.Foods) {
        if (food.X == x && food.Y == y) {
            return { result: true, food: food };
        }
    }

    return { result: false, food: null };
}

$.Snake.prototype.Reverse = function () {
    this.Direction = this.GetDirection( -this.Direction.X,-this.Direction.Y) 
}

//判断是否可以往前走,包括身体
$.Snake.prototype.CanMove = function() {
    to_x = this.Head.X + this.Direction.X;
    to_y = this.Head.Y + this.Direction.Y;
    return this.CanGo(this.Direction.X, this.Direction.Y)&&!this.IsBodyPlace(to_x, to_y)
}

//判断是否可以走到地图的某个点,不包括身体
$.Snake.prototype.CanGo = function (i_x, i_y) {
    return this.CanGoAbsolute(this.X + this.Head.X + i_x, this.Y + this.Head.Y + i_y)
},
    //尝试一次移动,失败则返回false
    $.Snake.prototype.TryMove = function () {
        to_x = this.Head.X + this.Direction.X;
        to_y = this.Head.Y + this.Direction.Y;
        if (!this.CanGo(this.Direction.X, this.Direction.Y)) {
            return false
        }
        //撞到身体
        if (this.IsBodyPlace(to_x, to_y)) {
            //如果是按反方向则没事
            if (this.Head.Last.X == to_x && this.Head.Last.Y == to_y) {
                this.Reverse()

                return this.Move()
            }
            return false
        } 

        //如果是食物则吃掉
        var re = this.IsFood(to_x + this.X, to_y + this.Y)
        if (re.result) {
            this.EffectPlayer.PlayBite()
            this.Map.KillEntity(re.food)
            this.kill_count++
            return this.Move();
        }

        
        // console.log("move")
        //添加头部
        var newHead = this.CreateBody(this.Head.X + this.Direction.X, this.Head.Y + this.Direction.Y, this.Head, null);
        this.Head.Next = newHead
        this.Head = newHead
        if (this.TailCount-- <= 0) {
            //移除尾部
            tmpTail = this.Tail
            this.Tail = tmpTail.Next
            this.Tail.Last = null

            tmpTail.Last = null
            tmpTail.Next = null
        }


        return true
    }
    
    $.Snake.prototype.Move = function () {
    if (!this.TryMove()) {
        this.Map.Easy();
        return false
    }

    $.Snake.prototype.BecomeStone=function(){
         //食物没吃够则变成石头
         if (this.Foods.length != 0)
         {
             if(this.kill_count==0){
                 this.Map.Bonus("手残党的骄傲",2)
             }
            return $.Entity.prototype.BecomeStone.call(this)
            //  this.BecomeStone =;
         }
         else{
           return  this.Explode();

         }
    }

    $.Snake.prototype.Explode = function () {

        var empty=this.Map.IsMapEmpty()
        var count=$.Dynamite.prototype.Explode.call(this);

        if(empty)
        {
            this.NoEffect();
            this.Map.Bonus("竹篮打水",1)
            return 0
        }

       

        if(count==0)
        {
            this.Map.Bonus("蛇皮走位",2)
        }

        if(count<=10)
        {
            this.Map.Bonus("牛刀杀鸡",2)
        }
     
        return count
        }

    return true;

}
$.Snake.prototype.HasShadow=function(){
    return false
} 


