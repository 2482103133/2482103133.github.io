$.Medecine=function Medecine(x,y,shape,map){
    $.Entity.call(this,x,y,shape,map,2)
    
    this.SetShape($.CreateShape(2,
        [
            [1]
        ]
    ))
};

$.Medecine.prototype=Object.create($.Entity.prototype);

$.Medecine.prototype.constructor=$.Medecine;
$.Medecine.prototype.Spin=function(){
    this.Go(0,-1)
}

$.Medecine.prototype.BecomeStone=function(){
    radius=2
	start_x=this.X-radius
    start_y=this.Y-radius

	for(i=0;i<1+2*radius;i++)
                for(j=0;j<1+2*radius;j++) {
                    to_x = start_x + j
                    to_y = start_y + i
					
                    if (!this.Map.OutOfBounds(to_x,to_y) )
					{
						//alert("to_x:"+to_x+"to_y:"+to_y)
						this.Map.map[to_y][to_x].Type = 1;
					}
                }
				
            this.isAlive=false
			return 0
}



