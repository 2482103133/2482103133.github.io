$.PhantomEntity = function PictrueEntity(x, y, img, x_size,y_size,map) {
    var type=new $.ClearType()
    type.is_block=true
    //使用jquery对象
    this.img = img
    $.Entity.call(this, x, y, CreateShape(x_size,y_size,type), map, type)

    var that = this
    ExecuteIfLoaded(img, function () {
        that.x_size = x_size
        that.y_size = y_size

        var ratio=(that.Map.block_size*x_size)/img.width

        that.effect=new $.ImageEffect(map,img,0,x*map.block_size, y*map.block_size,this,img.width*ratio,img.height*ratio)

        that.Map.AddEffect(that.effect)

        that.effect.BeforePaint=function () {
            //获取角度,位置
            var px=that.Map.block_size*(that.X+that.GetShapeLength()/2)
            var py=that.Map.block_size*(that.Y+that.GetShape().length/2)
            var angle= Math.atan2(that.Map.MousePosition.y-py, that.Map.MousePosition.x-px)  
            
            this.angle=angle
            this.px=px
            this.py=py
          }
    })
};

$.PhantomEntity.prototype = Object.create($.Entity.prototype);

$.PhantomEntity.prototype.constructor=$.PhantomEntity
function CreatePhantom(entity,img, x_size,y_size)
{
    // var type=new $.ClearType()?
    var x_size=x_size
    var y_size=y_size

    //使用jquery对象
    var img = img

    ExecuteIfLoaded(img, function () {

        var map=entity.Map
        var ratio=(map.block_size*x_size)/img.width
        var x=entity.X
        var y=entity.Y
        var effect=new $.ImageEffect(map,img,0,x*map.block_size, y*map.block_size,this,img.width*ratio,img.height*ratio)

        map.AddEffect(effect)
        entity.effect=effect
        effect.BeforePaint=function () {
            //获取角度,位置
            var px=map.block_size*(entity.X+entity.GetShapeLength()/2)
            var py=map.block_size*(entity.Y+entity.GetShape().length/2)
            var angle= Math.atan2(map.MousePosition.y-py, map.MousePosition.x-px)  
            
            this.angle=angle
            this.px=px
            this.py=py
          }

        map.AddEntityDisposedListener(function(e){
            if(e==entity)
             effect.Duration=0
        })
    })
}

$.Shooter = function Shooter(x, y, shape, map, type) {

    var blank=GetBlankImage(200,200)
    $.Tank.call(this,x, y, shape, map, type,blank,4)
    
    //禁用准信
    this.cross_hair.Duration=0
    this.fire_interval=200
    this.bullet_size=0.3
    this.speed=800

    var img=GetImage("shooter")
    CreatePhantom(this,img, 4,4)
    // $.PhantomEntity.call(this,x, y, img, 4,4,map)

};

$.Shooter.prototype = Object.create($.Tank.prototype);

$.Shooter.prototype.constructor=$.Shooter

// $.Shooter.prototype.Move=function(){
//     $.Entity.prototype.Move.call(this)
//     return true
// }
$.Shooter.prototype.__receiveMouseClickEvent=function(pos)
{
    this.effect.BeforePaint()
    this.aim_angle=this.effect.angle*180/ Math.PI
    var px=this.Map.block_size*(this.X+this.GetShapeLength()/2)
    var py=this.Map.block_size*(this.Y+this.GetShape().length/2)
    this.Fire(px,py)
}
$.Shooter.prototype.Left=function(pos)
{
    $.Entity.prototype.Left.call(this)
}
$.Shooter.prototype.Right=function(pos)
{
    $.Entity.prototype.Right.call(this)
}

$.Shooter.prototype.Do=function(pos)
{
    this.fire_locker.Request()
}
$.Shooter.prototype.__create_shape=function(a,b,c,d)
{
    var shape=$.Tank.prototype.__create_shape.call(this,a,b,c,d)
    for (const r of shape) {
        for (const b of r) {
            b.Type=new $.ClearType()
            b.Type.is_block=true
        }
    }
    return shape

}
