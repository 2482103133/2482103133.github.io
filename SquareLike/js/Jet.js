$.Jet = function Jet(x, y, shape, map) {
    $.Entity.call(this, x, y, shape, map, 5)
    this.SetShape( $.CreateShape(5, [
        [1, 0, 1],
        [0, 1, 0]
    ]))
    this.count = 10
    this.bullets=[]
    var that=this
    //当自己不再存活时才能结束子弹循环
    this.check_func=function(){
        return that.State==$.EntityState.Detached
    }
    
    this.PushBullet=this.Map.AddEntitiesOnInterval(this.bullets,3,this.check_func)
}

$.Jet.prototype = Object.create($.Dynamite.prototype)

$.Jet.prototype.constructor = $.Jet

$.Jet.prototype.BecomeStone = function () {
    return 0
}
$.Jet.prototype.Spin = function () {
    this.Up();
}
$.Jet.prototype.FailToGo = function () {
    // this.Up();
}



$.Jet.prototype.Do =
    function () {
        //发射一颗子弹
        if (--this.count <= 0) {


            for (const block of this.GetBlocks()) {
                bullet = this.create_bullet(block.X, block.Y)
                // this.Map.AddEntity(bullet)
                // this.bullets.push(bullet)
                this.PushBullet(bullet)
                // this.Map.AddEntitiesOnInterval([bullet],3)
            }
            this.EffectPlayer.PlayDie();
            this.Die()

        }
        else {
            this.EffectPlayer.PlayShot();
            this.Map.ShowMessage(this.count)
            bullet = this.create_bullet(this.X + 1, this.Y)
            this.PushBullet(bullet)
            this.Up()
        }
    }

$.Jet.prototype.create_bullet = function (x, y) {
    bullet = new $.Dynamite(x, y, $.CreateShape(6, [[1]]), this.Map)
    bullet.has_shadow = false
    return bullet
}
    // $.Jet.prototype.Do

