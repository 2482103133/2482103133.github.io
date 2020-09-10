$.Laser=function Laser(x,y,shape,map){
    $.Entity.call(this,x,y,shape,map,4)
    this.SetShape($.CreateShape(4,
        [
            [0,1,0],
            [0,1,0],
            [1,1,1],
            [0,1,0],
        ]
    ))
    var that=this
    this.Push=this.Map.AddEntitiesOnInterval([],3,function(){
        return that.State==$.EntityState.Detached
    })
};


$.Laser.prototype=Object.create($.Entity.prototype);

$.Laser.prototype.constructor=$.Laser;

$.Laser.prototype.BecomeStone=function () {
//    this.Do();
if(this.Did==true)
{
    return 0
}else{
    this.Map.Bonus("和平建国",2)
    return  $.Entity.prototype.BecomeStone.call(this)
}


}


$.Laser.prototype.Do=
    function () {

        if(this.Map.IsMapEmpty())
            {
                this.Map.Bonus("无漏可疏",2)
            }

        for(var i=0;i<this.Map.map[0].length;i++)
        {
            var y=i%2==0?0:1
            bullet=new $.Dynamite(i,y,$.CreateShape(6,
                [[1]]
            ), this.Map )

            bullet.has_shadow=false
            this.Push(bullet)
        }
        this.Did=true
        this.isAlive=false;
    };


