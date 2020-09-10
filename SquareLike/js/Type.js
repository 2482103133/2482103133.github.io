$.Type = function Type(type) {
    this.value = type
    this.fill_style = TypeToColor(this.value)
    if(type!=0)
    this.render_index=0
    else{
        this.render_index=-1
    }

    if(type!=0)
    {
        this.is_block=true
        this.is_dropping=true
    }
    else{
        this.is_block=false
        this.is_dropping=false
    }
    
}

$.Type.prototype.Paint = function (ctx, x, y, width, height) {
    ctx.fillStyle = this.fill_style
    ctx.fillRect(
        x,
        y,
        width,
        height);
}
$.Type.prototype.IsBlock = function () {
    return this.is_block;
}
$.Type.prototype.IsDropping = function () {
    return this.is_dropping;
}
$.Type.prototype.GetEntity = function () {
    return this.entity;
}
$.Type.prototype.GetRenderIndex = function () {
         return this.render_index;
}

//清楚样式
$.ClearType = function () {
    this.Paint = function (ctx, x, y, width, height) {
        ctx.clearRect(
            x,
            y,
            width,
            height);
    }
}

$.ClearType.prototype = new $.Type(0)
$.ClearType.prototype.constructor = $.ClearType


//嵌套类型
$.ChainType = function (type) {
   
    this.inner=IsNullOrUndefinedThenDefault(type,null);

    this.Paint = function (ctx, x, y, width, height) {
        if(this.inner!=null)
        {
            this.inner.Paint(ctx, x, y, width, height)
        }
     this.Do(ctx, x, y, width, height)
    }
}

$.ChainType.prototype = new $.Type(0)
$.ChainType.prototype.constructor = $.ChainType


//图片样式,允许效果多层叠加
$.ImageType = function (img,type) {
    $.ChainType.call(this,type)
    this.img=img
    // this.clear=new $.ClearType()
    // this.img.scr="image/sakura.png"
    this.Do = function (ctx, x, y, width, height) {

        ctx.drawImage(
            this.img,
            x,
            y
            ,
            width,
            height
            );
    }
}
$.ImageType.prototype = new $.ChainType()
$.ImageType.prototype.constructor = $.ImageType


//叠加类,将一个类型的使用加载中间
$.SandwichType = function (type) {
    var innerType=type
    $.Type.call(this,type)
    this.Before=function(ctx){

    }
    this.After=function(ctx){
        
    }
    this.Paint = function (ctx, x, y, width, height) {
        this.Before(ctx,x,y,width,height)
        // ctx.globalAlpha = opacity;
        innerType.Paint(ctx, x, y, width, height)
        this.After(ctx,x,y,width,height)
        // ctx.globalAlpha = 1.0;
    }
}

$.SandwichType.prototype = new $.Type(0)
$.SandwichType.prototype.constructor = $.SandwichType


//透明度为颜色修改透明度,支持Type类型对象传入
$.OpacityType = function (type,opacity) {
    $.SandwichType.call(this,type)
    this.Before=function(ctx){
        ctx.globalAlpha = opacity;
    }
    this.After=function(ctx){
        ctx.globalAlpha = 1.0;
    }
}
$.OpacityType.prototype = new $.SandwichType()
$.OpacityType.prototype.constructor = $.OpacityType



//将画笔旋转一定度数
$.RotateType = function (type,degree) {
    $.SandwichType.call(this,type)
    this.degree=degree
    this.Before=function(ctx,x,y,width,height){
        // ctx.arc(0, 0, 5, 0, 2 * Math.PI)
        // ctx.translate(x+(width/2), y+(height/2));
        pi= Math.PI
        ctx.rotate(this.degree*pi/180);
    }
    this.After=function(ctx){
        ctx.setTransform(1,0,0,1,0,0);
    }
    this.SetDegree=function(deg){
        this.degree=deg
    }
}
$.RotateType.prototype = new $.SandwichType()
$.RotateType.prototype.constructor = $.RotateType



function ToType(value) {
    if (typeof value === "number") {
        if(value==0)
        {
            return new $.ClearType();
        }
        return new $.Type(value);
    }
    if (value instanceof $.Type) {
        return value
    }

    throw "Unknow Type Type";

}

//每种类型对应的颜色
function TypeToColor(type) {
    dic = {
        0: "#6f6f6f",
        1: "#000000",
        2: "#ffebcd",
        3: "#FF1493",
        4: "#FFD700",
        5: "#AFEEEE",
        6: "#008080"
    }
    return dic[type]
}