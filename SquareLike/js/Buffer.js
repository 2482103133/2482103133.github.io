__buffer={}
function set_shape_buffer(img,degree,rotated)
{
    __buffer[String([objectId(img),degree%360])]=rotated
}
//重建buffer
function get_shape_buffer(img,degree)
{
   var buffer= __buffer[String([objectId(img),degree%360])]
   if(IsNullOrUndefined(buffer))
   return null
   return CopyTable(buffer)
}

$.Buffer=function Buffer(){

}

$.Buffer.prototype={
    __buffer:{},
    Set:function(key,value){
       this. __buffer[key.Convert()]=value
    },
    Get:function(key){
        return this.BeforeGet(this.__buffer[key.Convert()])
    },BeforeGet:function (value) {  
        return value
    }
}
$.Buffer.prototype.constructor=$.Buffer

//idObject,独一无二的object,将被转化为一个数字id
//args 可以被string化的字符串
$.Key=function(idObjects,...args){
    this.idObjects=IsNullOrUndefinedThenDefault(idObjects,[])
    this.args=IsNullOrUndefinedThenDefault(args,[])
}
$.Key.prototype.Convert=function(){
    var keys=[]
    for (const obj of this.idObjects) {
        keys.push(objectId(obj))
    }
    for (const arg of this.args) {
        keys.push(arg)
    }
    return String(keys)
}

function BufferResultCall(func,create_key,...args)
{
    
    var create_key=IsNullOrUndefinedThenDefault(create_key,function(args){
        return new $.Key(null,args)
    })
    var key=create_key.call(func,args)

    var buffer=GlobalBuffer.Get(key)
    if(IsNullOrUndefined(buffer))
    {
        var ret=func.apply(this,args)
        GlobalBuffer.Set(key,ret)
        // console.log("新建缓存"+key.Convert())
        return ret
    }
    else{
        // console.log("复用缓存"+key.Convert())
        return buffer
    }
}

//全局的缓存Buffer
GlobalBuffer=new $.Buffer()