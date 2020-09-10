
var ImageID=0
// base_url="https://github.com/2482103133/DickSquare/raw/master/image/"
base_url="image/"
//加载一个图片并返回元素
function LoadImage(src){
    var img=$("<img>")
    img.css("display","none")
    img.attr("crossOrigin","Anonymous")
    img.attr("src",src)
    $("body").append(img)
    return img.get(0)
}

function decode_and_get_image(src){
    var res=responses[src]
    var blob=new Blob (new Uint8Array(res),{type:"image/png"})
    // var base64=atob(res)
    // var url="a:image/png;base64,"+base64

    var uInt8Array = res
    var i = uInt8Array.length;
    var binaryString = new Array(i);
    while (i--)
    {
      binaryString[i] = String.fromCharCode(uInt8Array[i]);
    }
    var data = binaryString.join('');

    var base64 = window.btoa(data);
    if(src.endsWith("png"))
    var url="data:image/png;base64," + base64;
    else if(src.endsWith("gif"))
    var url="data:image/gif;base64," + base64;

    return LoadImage(url)
}

__backGroundImages={
    // snowflake:LoadImage("image/snowflake.png")
    "turret":"image/turret.png",
    "bullet":"image/bullet.png",
    "tank":"image/tank.png",
    "snows":"image/snows.gif",
    "snows2":"image/snows2.gif",
    "shooter":"image/shooter.png"
}

function GetImage(name)
{
    // return decode_and_get_image(__backGroundImages[name])
    //缓存图片
    var img=BufferResultCall(decode_and_get_image,function(args){
        return new $.Key([],"decode_and_get_image",name)
    },__backGroundImages[name])

    return img
}

function MirrorImage(img) {
    
    var canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;

    canvas.style.position="absolute"

    $("body").append($(canvas))
 
    var rect=canvas.getBoundingClientRect()
    canvas.style.display="none"
    // canvas.style.transform="rotate("+0+"deg)"
    canvas.width=rect.width
    canvas.height=rect.height

    var context = canvas.getContext('2d');

    context.translate(canvas.width / 2, canvas.height / 2);
    // context.translate(-img.width / 2, -img.height / 2);
    pi = Math.PI
    context.scale(-1,1); 
    context.drawImage(img, -img.width / 2, -img.height / 2);

    var url = canvas.toDataURL();
    var tmp_img = LoadImage(url)
    tmp_img.width=canvas.width
    tmp_img.height=canvas.height


    return tmp_img
}

function GetBlankImage(width,height) {
    var canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    var url = canvas.toDataURL();
    var tmp_img = LoadImage(url)
    tmp_img.width=canvas.width
    tmp_img.height=canvas.height
    return tmp_img
}

function BufferedMirrorImage(img){
    return BufferResultCall(MirrorImage,function(args){
        var key=new $.Key([args[0]],"mirror")
        return key
    },img)
}

function BufferedRotateImage(img, degree){
    
    return BufferResultCall(RotateImage,function(args){
        return new $.Key([args[0]],"rotate",degree%360)
    },img, degree)
}

function RotateImage(img, degree) {

    if(degree==0)
        return img

    var canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    canvas.style.transform="rotate("+degree+"deg)"
    // canvas.style.display="none"
    canvas.style.position="absolute"
    
    $("body").append($(canvas))
 
    var rect=canvas.getBoundingClientRect()
    canvas.style.display="none"
    canvas.style.transform="rotate("+0+"deg)"
    canvas.width=rect.width
    canvas.height=rect.height

    var context = canvas.getContext('2d');

    context.translate(canvas.width / 2, canvas.height / 2);
    // context.translate(-img.width / 2, -img.height / 2);
    pi = Math.PI
    context.rotate(degree * pi / 180); 
    context.drawImage(img, -img.width / 2, -img.height / 2);

    var url = canvas.toDataURL();
    var tmp_img = LoadImage(url)
    tmp_img.width=canvas.width
    tmp_img.height=canvas.height
    
    return tmp_img
}

//判断是否空白
function IsCanvasBlank(canvas,x,y,w,h) {

    x=IsNullOrUndefinedThenDefault(x,0)
    y=IsNullOrUndefinedThenDefault(y,0)
    w=IsNullOrUndefinedThenDefault(w,canvas.width)
    h=IsNullOrUndefinedThenDefault(h,canvas.height)

    return !canvas.getContext('2d')
      .getImageData(x, y, w, h).data
      .some(channel => channel !== 0);
  }

//确保图片在load后执行某个函数
  function ExecuteIfLoaded(img,func)
  {
      var func=func 
      var img=img
      if(img.complete && img.naturalHeight !== 0)
      {
        //   console.log("complele image")
          func.call(img)
      }
      else{
          img.addEventListener("load",function(){
            //  console.log("onload")
              func.call(img)
            })
      }
  }
