//特效类
$.Effect = function Effect(duration,args) {
    this.Duration=duration
    this.Args=args
    
    
}
$.Effect.prototype = {
    //在map的draweffect中调用
    Paint: function (ctx) {
        this.BeforePaint(ctx)
        this.DoPaint(ctx);
        this.Duration--;
    },
    IsExpired:function(){
        return this.Duration<=0
    },
    BeforePaint :function(ctx){

    },
    DoPaint :function(ctx){

    }
}
$.Effect.prototype.constructor = $.Effect


//线条特效
//duration延迟效果
$.LineEffect = function LineEffect(duration,from_x,from_y,to_x,to_y,style,len) {
    len=IsNullOrUndefinedThenDefault(len,$.GameMap.defaultOptions.block_size)
    style=IsNullOrUndefinedThenDefault(style,"black")
    $.Effect.call(this,duration,{FromX:from_x,FromY:from_y,ToX:to_x,ToY:to_y,Style:style,Len:len})
}
$.LineEffect.prototype = new $.Effect()

$.LineEffect.prototype.constructor = $.LineEffect

$.LineEffect.prototype.DoPaint = function (ctx) {
    var args=this.Args
    ctx.beginPath();
    ctx.setLineDash([1,0])
    ctx.strokeStyle=args.Style
    ctx.moveTo(args.FromX*args.Len, args.FromY*args.Len);
    ctx.lineTo(args.ToX*args.Len, args.ToY*args.Len);
    ctx.stroke()
}

//线条特效
//duration延迟效果
$.ArcEffect = function ArcEffect(duration,px,py,radius,style) {
    len=IsNullOrUndefinedThenDefault(len,$.GameMap.defaultOptions.block_size)
    style=IsNullOrUndefinedThenDefault(style,"black")
    this.X=px
    this.Y=py
    this.R=radius
    this.Style=style
}
$.ArcEffect.prototype = new $.Effect()

$.ArcEffect.prototype.constructor = $.ArcEffect

$.ArcEffect.prototype.DoPaint = function (ctx) {
    var args=this.Args
    ctx.beginPath();
    ctx.arc(this.X,this.Y,this.R,0,2*Math.PI)
    ctx.stroke()
}


