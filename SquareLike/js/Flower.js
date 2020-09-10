$.Flower=function Flower(x, y, shape, map, type){
    var img=$("#sakura").get(0)
   var type= new $.ImageType(img,new $.ClearType())
   type.render_index=-1;
   type.is_block=false;
   type.is_dropping=true
   this.SetShape($.CreateShape(type,
        [
            [1]
        ]
    ))
    $.Entity.call(this,x,y,[[new $.Block()]],map,type)
    
    this.become_stone_when_dead=false
    this.loop=100
    this.has_shadow=false;
    // this.is_dropping=true
   
};


$.Flower.prototype=Object.create($.Entity.prototype);
$.Flower.prototype.constructor=$.Flower;
$.Flower.prototype.Do=function(){
    this.DownToHell()
    this.Map.Bonus("天女散花",1)
}
$.Flower.prototype.IsBlocking=function(fb,tb){
    if(ToType(tb.Type).IsBlock())
    return true

    return false
}
$.Flower.prototype.BecomeStone=function(){
    return this.Stonize(false,false)
}
// $.Flower.prototype.Move=function(){
//     var ok=$.Entity.prototype.Move.call(this)
//     if(!ok)
//         this.loop--
//     if(this.loop>=0)
//     return true 
//     return ok
// }