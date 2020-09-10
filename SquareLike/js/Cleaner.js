$.Cleaner=function Cleaner(x,y,shape,map){
    $.Entity.call(this,x,y,shape,map,type)

    this.SetShape($.CreateShape(5,[
        [1,1],
        [1,1]
    ]))
}

$.Cleaner.prototype=Object.create($.Dynamite.prototype)
$.Cleaner.prototype.constructor=$.Cleaner

$.Cleaner.prototype.BecomeStone=function(){

    this.Explode();
    return 0
    
}
$.Cleaner.prototype.OnComeIntoGame=function () { 
        this.Die();
 }
