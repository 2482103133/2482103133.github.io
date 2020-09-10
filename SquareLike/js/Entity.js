
$.GlobalEffectPlayer = new $.EffectPlayer()
$.Entity = function Entity(x, y, shape, map, type) {
    this.X = x;
    this.Y = y;
    this.EffectPlayer = $.GlobalEffectPlayer
    this.has_shadow = true
    if (typeof type === "undefined") {
        this.Type = 2
    } else {
        this.Type = type
    }
    if(!IsNullOrUndefined(shape))
    $.SetShapeType(this.Type, shape)
    this.SetShape(shape)
    this.Map = map;
    this.isAlive = true;
    this.Effective = true
    this.State = $.EntityState.Detached;
    this.become_stone_when_dead = true
    this.dead_type = 1
    this.isPersistent = false
    this.die_only_onground = true
    this.take_over=false
    this.events={}
};

$.EntityState = {
    Alive: 1,
    Ready: 2,
    Detached: 3
}
Keys={
    Right:39,
    Left:37,
    Down:40,
    Up:38,
    Space:32
}


$.Entity.prototype = {
    //向左键触发
    Left: function (isKeyboard) {

        return this.Go(-1, 0, isKeyboard)

    },//向右键触发
    Right: function (isKeyboard) {

        return this.Go(1, 0, isKeyboard)
    },//向下键触发
    Down: function (isKeyboard) {
        return this.Go(0, 1, isKeyboard)
    },//向上键触发
    Up: function (isKeyboard) {
        return this.Go(0, -1, isKeyboard)
    },
    __receiveKeyboardEvent: function (event) {

        if (event.keyCode == 39 || event.keyCode == 68) {
            this.Right(true);
        }
        else if (event.keyCode == 37 || event.keyCode == 65) {
            this.Left(true);
        }
        else if (event.keyCode == 40 || event.keyCode == 83) {
            this.Down(true);
        }
        else if (event.keyCode == 32) {

            this.Do(true);
        }
        //keycode up
        else if (event.keyCode == 38 || event.keyCode == 87) {
            this.Spin(true);
        }
    },__receiveMouseClickEvent(pos)
    {
        this.Do(true)
    }
    //判断某个block到另一个block是否会被堵塞
    ,IsBlocking(fb,tb){
        
        if (ToType(fb.Type).IsBlock()&&ToType(tb.Type).IsBlock()) {
            return true;
        }
        return false
    }
    ,//是否可以走到某个相对位置
    CanGo: function (i_x, i_y) {
        var shape = this.GetShape();

        for (var i = 0; i < shape.length; i++)
            for (var j = 0; j < shape[i].length; j++) {
                var to_x = this.X + j + i_x
                var to_y = this.Y + i + i_y

                
                if (this.Map.OutOfBounds(to_x, to_y))
                    return false

                var mb=shape[i][j];
                var tb=this.Map.map[to_y][to_x];

                if(this.IsBlocking(mb,tb))
                {
                    return false
                }
            }

        return true;
    },IsTakeOver:function(){
        return this.take_over
    }
    ,
    //判断是否是本身
    IsSelf: function (to_x, to_y) {

        var shape = this.GetShape()
        for (let i = 0; i < shape.length; i++) {
            const row = shape[i];
            for (let j = 0; j < row.length; j++) {
                const b = row[j];
                if (b.Type != 0 && ((to_x) == (this.X + j)) && ((to_y) == (this.Y + i))) {
                    return true
                }

            }
        }

        return false


    }
    ,
    //进入准备阶段,返回false则跳过该物体
    __ready: function () {
        this.State = $.EntityState.Ready;
        return this.OnReady()
    },
    OnReady: function () {
        return true
    },
    //自动切换为存活
    __comeIntoGame: function () {
        this.State = $.EntityState.Alive;
        return this.OnComeIntoGame();
    },
    //进入游戏时被调用
    OnComeIntoGame: function () {

    },
    //得到形状
    GetShape: function () {

        return this.Shape
    }
    //设置形状
    , SetShape: function (shape) {
        for (const row of shape) {
            for (const b of row) {
                if(b.Type!=0)
                {
                    b.Type=ToType(b.Type)
                b.Type.entity=this
                }
            }
        }
        this.Shape = shape
    }
    ,//获得相对位置的方块
    GetRBlock: function (r_x, r_y) {
        return this.Map.map[this.Y + to_y][this.X + to_x]
    }
    ,
    //地图自动调用的动作
    Move: function () {
        return this.Down();
    },
    //判断能否自动下落
    CanMove: function () {
        return this.CanGo(0, 1);
    }
    ,
    //某个点是否可达
    CanGoAbsolute: function (to_x, to_y) {
        if (this.Map.OutOfBounds(to_x, to_y))
            return false

        if (ToType(this.Map.map[to_y][to_x].Type).IsBlock()) {
            return false;
        }

        return true
    }//是否超越边界
    ,
    //执行Go这个动作
    Go: function (i_x, i_y, isKeyboard) {
        if (isKeyboard == true) {
            this.EffectPlayer.PlayMove()
        }
        if (this.CanGo(i_x, i_y)) {
            this.OkToGoAction(i_x, i_y);
            return true
        }
        this.FailToGo(i_x,i_y,isKeyboard)
        
        return false
    },//如果Go返回true时执行的函数
    OkToGoAction(i_x, i_y) {
        this.X = this.X + i_x;
        this.Y = this.Y + i_y
    }
    ,//在Go返回false之前触发
    FailToGo: function (i_x,i_y,isKeyboard) {

    },
    BeforeBecomeStone:function(){
        
    },
    __become_stone:function(){
        this.BeforeBecomeStone()
        var ret=this.BecomeStone();
        this.OnBecomeStone();
        return ret
    }
    ,//死亡时触发的函数,不要直接调用,这个将由Game调用
    BecomeStone: function () {
        try{
            this.Stonize(true,true)
        }catch(error)
        {
            console.log("shape has changed!")
        }
        return 0
    }
    ,OnBecomeStone:function(handler){
        if(!IsNullOrUndefined(handler)){
            this.AddEventListener("OnBecomeStone",handler)
        }else{
            this.RaiseEvent("OnBecomeStone")
        }
    }
    ,
    Stonize: function (sound,force) {
        if(sound==true)
        this.EffectPlayer.PlayHit();
        var shape = this.GetShape()
        for (i = 0; i < shape.length; i++)
            for (j = 0; j < shape[i].length; j++) {
                to_x = this.X + j
                to_y = this.Y + i
                
                if (shape[i][j].Type != 0)
                {
                    if(!force&&this.Map.map[to_y][to_x].Type!=0)
                    {
                        continue
                    }
                    if (this.become_stone_when_dead) {
                        this.Map.map[to_y][to_x].Type= this.dead_type;
                    }
                    else {
                        this.Map.map[to_y][to_x].Type = shape[i][j].Type;
                    }

                }
                    

            }

        this.isAlive = false
        return 0

    }
    ,
    //尝试设置map上的某一格的类型
    TrySetType: function (x, y, type) {

        if (!this.Map.OutOfBounds(x, y)) {
            var map_type = this.Map.map[y][x].Type;
            this.Map.map[y][x].Type = type;
            if (map_type != type)
                return true;
        }

        return false
    },//功能键触发函数
    Do: function () {
     
        this.DownToHell()
    },
    //掉到底
    DownToHell: function () {
        ok = false
        while (this.CanGo(0, 1)) {
            this.Down()
            ok = true
        }
        return ok
    }
    ,//旋转
    Spin: function (iskyey) {
        if (iskyey == true) {
            this.EffectPlayer.PlaySpin();
        }
        var bounds = this.GetBounds()
        var max_count = bounds.len
        var shape = this.GetShape()
        var new_shape = []
        var shift_x = 0, shift_y = 0

        shift_x = -(max_count / 2 - shape.length / 2) * 0.5
        shift_x = shift_x >= 0 ? Math.round(shift_x) : -(Math.round(-shift_x))
        shift_y = -shift_x

        for (let i = 0; i < max_count; i++) {
            var new_row = []
            for (let j = shape.length - 1; j >= 0; j--) {
                if (i < shape[j].length) {

                    new_row.push(new $.Block(shape[j][i].Type));
                }
                else {
                    new_row.push(new $.Block(0))
                }
            }
            new_shape.push(new_row)
        }

        //wait to enclose no time...
        var entity = new $.Entity(this.X, this.Y, [[]], this.Map)
        entity.SetShape(new_shape)
        if (entity.CanGo(shift_x, shift_y)) {
            this.SetShape(new_shape)
            this.X += shift_x
            this.Y += shift_y
        }
        else if (entity.CanGo(0, shift_y)) {
            this.SetShape(new_shape)
            this.X += 0
            this.Y += shift_y
        }

        return true
    },
    //获得中心线长度
    GetShapeLength: function () {

        var shape = this.GetShape()
        var max_length = 0

        for (let row of shape) {
            if (row.length > max_length) {
                max_length = row.length;
            }
        }

        return max_length
    },
    GetBounds: function () {
        var shape = this.GetShape()
        var max_length = shape.length
        var left = 0
        var top1 = 0
        var top2 = 0
        var temptop = 0
        var right = 0
        var left = max_length - 1
        var len = 0
        for (let row of shape) {
            for (let index = 0; index < row.length; index++) {
                const b = row[index];
                if (b.Type != 0) {
                    if (index < left) {
                        left = index
                        top1 = temptop
                    }
                    if (index > right) {
                        right = index
                        top2 = temptop
                    }
                }
            }

            if ((right - left + 1) > len) {
                len = right - left + 1
            }
            temptop++
        }
        max_length = len;
        return { left: left, top1: top1, top2: top2, len: len }
    },
    //获得近似圆半径
    GetRadius: function () {
        length = this.GetShapeLength();
        width = this.GetShape().length;
        return Math.pow(length * length + width * width, 0.5) / 2.0;
    },
    GetDescription: function () {
        func = Object.getPrototypeOf(this).constructor
        var ret = func.toString();
        ret = ret.substr('function '.length);
        ret = ret.substr(0, ret.indexOf('('));
        return Descriptions[Object.getPrototypeOf(this).constructor.name]
        // console.log(Object.getPrototypeOf(this).__proto__==$.Entity.prototype)
    }, GetBlocks: function () {
        var blocks = []
        var shape = this.GetShape()
        for (i = 0; i < shape.length; i++)
            for (j = 0; j < shape[i].length; j++) {
                to_x = this.X + j
                to_y = this.Y + i

                if (shape[i][j].Type != 0) {
                    block = shape[i][j]
                    block.X = to_x
                    block.Y = to_y
                    blocks.push(block)
                }
            }

        return blocks
    }
    //当被击杀的时候,返回false代表取消击杀
    , OnKill: function () {
        return true
    }
    , Die: function () {
        this.Map.KillEntity(this)
    }, NoEffect: function () {
        this.Effective = false;
    }, IsEffective: function () {
        return this.Effective
    }
    ,
    __leaveGame: function () {

        this.State = $.EntityState.Detached;
        return this.OnLeaveGame();
    }
    , OnLeaveGame: function () {
    }
    //是否有影子
    , HasShadow: function () {
        return this.has_shadow;
    }//不能自动移动后,是否自动销毁
    , IsPersistent: function () {
        return this.isPersistent;
    },

    AddEventListener: function(eventName, handler) {
        if(!(eventName in this.events))
            this.events[eventName] = [];

        this.events[eventName].push(handler);
    },

    RaiseEvent: function(eventName, args) {
        var currentEvents = this.events[eventName];
        if(!currentEvents) return;

        for(var i = 0; i < currentEvents.length; i++) {
           if(typeof currentEvents[i] == 'function') {
              currentEvents[i](args);
           }
        }
    }

}

$.Entity.prototype.constructor=$.Entity

$.DropEntity=function DropEntity(x,y,shape,map){
    $.Entity.call(this,x,y,shape,map)

};

$.DropEntity.prototype=Object.create($.Entity.prototype);

$.DropEntity.prototype.constructor=$.DropEntity;

$.DropEntity.prototype.BecomeStone=function(){
    if (this.CanGo(0, 1)) {
          
        var clone = Object.assign(new this.constructor(), this)
        clone.BecomeStone = this.Stonize
        clone.OnKill = function () { return false }
        this.Map.AddEntitiesOnInterval([clone], 5)
    }else{
        this.Stonize()
    }

}

$.DropEntity.prototype.Do= function () {

    this.BecomeStone()
}