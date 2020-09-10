$.ImageEffect = function ImageEffect(map,img,angle,px, py,sender,width,height) {
    this.px=px
    this.py=py
    this.angle=angle
    this.map=map
    this.sender=sender
    this.img= img 
    this.width=width
    this.height=height
    if(IsNullOrUndefined(width))
    {
        var that=this
        ExecuteIfLoaded(img,function(){
            that.width=img.width
            that.height=img.height
        })
    }

    $.Effect.call(this,100000)
}

$.ImageEffect.prototype = new $.Effect()

$.ImageEffect.prototype.constructor = $.ImageEffect

$.ImageEffect.prototype.DoPaint = function (ctx) {
    var width=this.width
    var height=this.height
    ctx.beginPath();
    ctx.translate(this.px,this.py)
    ctx.rotate(this.angle)
    ctx.drawImage(this.img,-width/2,-height/2,width,height)
    ctx.setTransform(1,0,0,1,0,0);
    ctx.arc(this.px,this.py, 1, 0, 2 * Math.PI, true)
    ctx.stroke()
}
