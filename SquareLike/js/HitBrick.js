$.HitBrick = function HitBrick(x, y, shape, map) {
    $.Entity.call(this, x, y, shape, map, 5)
    this.SetShape( $.CreateShape(2, [
        [1, 1, 1]
    ]))
    
    

}
$.HitBrick.prototype = Object.assign(Object.create($.Entity.prototype),{
    Move:function(){
        return true
    },
    Do:function(){
        return true
    }
})

$.HitBrick.prototype.constructor=$.HitBrick

