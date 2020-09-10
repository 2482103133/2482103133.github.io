$.Dynamite = function Dynamite(x, y, shape, map) {
    $.Entity.call(this, x, y, shape, map,3)

}

$.Dynamite.prototype =Object.create($.Entity.prototype);

$.Dynamite.prototype.constructor = $.Dynamite

$.Dynamite.prototype.Move = function () {
    
    if(this.CanGo(0,1))
    {
        this.Down();
        return true
    }
    else{
        return false;
    }
};

$.Dynamite.prototype.CanMove = function () {
    return true;
};

$.Dynamite.prototype.OnReady=function(){
    // if(this.Map.IsMapEmpty())
    // {
    //     return false
    // }
    return true
}
$.Dynamite.prototype.OnComeIntoGame=function () { 
 }

$.Dynamite.prototype.BecomeStone = function () {
    return this.Explode();
};


$.Dynamite.prototype.Explode=function () {
    shape=this.GetShape()
    length = this.GetShapeLength()
    height = shape.length
    var r = this.GetRadius()*2;
    var heartX = this.X + length / 2.0
    var heartY = this.Y + height / 2.0
    var r2 = Math.pow(r, 2)
    var i = -r*3;
    var j = -r*3;
    var suc_count = 0;

    for (; i < r*3; i++) {
        for (; j <r*3; j++) {
            if (
                twoPointDistance( j,  i,  length/2.0,  height/2)<=r 
            ) {
               
                to_x = this.X + j
                to_y = this.Y + i
                
                suc_count = suc_count+ this.TrySetType(Math.round(to_x), Math.round(to_y), 0)
            }
        }
        j = -r*3;
    }
    this.isAlive = false;
    if(suc_count==0)
     this.NoEffect();
    // console.log(suc_count)
    if(suc_count>50&&this.Map.IsMapEmpty())
    {
        this.Map.Bonus("ALL CLEAR",2)
    }
    // if(suc_count==0&&this.Map.IsMapEmpty()){
        
    //     // this.Map.Bonus("设计者的懒惰",2)
    // }
    if(suc_count>=500)
    {
        this.Map.Bonus("核平天下",1)
    }
     if(r<=2)
    {
        this.EffectPlayer.PlayLittleExplosion();
    }
    else if(r>=25)
    {
        this.EffectPlayer.PlayLargeExplosion();
    }else{
        this.EffectPlayer.PlayMiddleExplosion();
    }
    
    // console.log("exploded radius :"+r)
    return suc_count
}

$.Dynamite.prototype.FailToGo=$.Dynamite.prototype.Die


