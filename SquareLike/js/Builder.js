$.Builder=function Builder(x,y,shape,map){
    $.Entity.call(this,x,y,$.CreateShape(2,[
        [1]
    ]),map,2)

    this.has_shadow=false
};

$.Builder.prototype=Object.create($.Entity.prototype);

$.Builder.prototype.constructor=$.Builder;
$.Builder.prototype.Spin=function(){
    this.Go(0,-1)
}
$.Builder.prototype.CanGo=function(i_x,i_y){
    if(this.Map.OutOfBounds(this.X+i_x,this.Y+i_y))
    {
        return false
    }
    return true;
}
$.Builder.prototype.Do=function(){
    this.EffectPlayer.PlaySpin()
    this.Map.map[this.Y][this.X].Type=ToType(this.Map.map[this.Y][this.X].Type).IsBlock()?0:1
}
$.Builder.prototype.Move=function(){
    return true
}
$.Builder.prototype.FailToGo=function(){
    // this.Go(0,-1)
}


