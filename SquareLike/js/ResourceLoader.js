var responses={}
function update_tip(url,no_callback) {
  
    $("#tip").stop().fadeIn(50)
    var src = url
    loaded_count++
    $("#tip").text(" 加载资源:" + loaded_count + "/" + sum + " " + src)
    if(loaded_count==sum){
        $("#tip").fadeOut(3000)
        if(no_callback!=true)
        {
            on_resource_loaded()
        }

    }
    
}

//显示资源加载
loaded_count = 0
sum = 0
function preloadImage(url, callback) {
    fetch_src(url,"arraybuffer",callback)
    sum++;
}
function preloadAudio(url, callback) {
    fetch_src(url,"arraybuffer",callback)
    sum++;
}

function preload(img, callback) {

    var call=function(){
        callback.call(img,img.src.substr(0,21),true)
    }
    if (img.complete) {
        sum++
        call()
    }
    else
    {
        sum++
        img.onload =function(){
            call()
        } 
    }
}

function fetch_src (url,type, callback) {

  var request = new XMLHttpRequest();
  request.open('GET', url, true);
  request.responseType = type;
  request.onload = function () { 
    callback(url)
    // console.log("fetch success!")
    var audioData = request.response;
    
    responses[url]=new Uint8Array(request.response)
     }

     request.onerror=function(){
        console.error("failed to fectch file!"+url)
    }

  request.send()
}


function on_resource_loaded() {
    //预加载旋转后的图片
    var turret = GetImage("turret")
    ExecuteIfLoaded(turret,function(){
        // console.log("preload turret rotation")
        preload(BufferedRotateImage(turret, 0), update_tip)
        preload(BufferedRotateImage(turret, 90), update_tip)
        preload(BufferedRotateImage(turret, 180), update_tip)
        preload(BufferedRotateImage(turret, 270), update_tip)
    })
   
    var tank = GetImage("tank")
    ExecuteIfLoaded(tank,function(){
        // console.log("preload tank rotation")
        preload(BufferedRotateImage(tank, 0), update_tip)
        preload(BufferedRotateImage(tank, 90), update_tip)
        preload(BufferedRotateImage(tank, 180), update_tip)
        preload(BufferedRotateImage(tank, 270), update_tip)

        var buuferd_tank=BufferedMirrorImage(tank)
        ExecuteIfLoaded(buuferd_tank,function(){
            // console.log("preload mirror tank rotation")
            BufferedRotateImage(this, 0), update_tip
            BufferedRotateImage(this, 90), update_tip
            BufferedRotateImage(this, 180), update_tip
            BufferedRotateImage(this, 270), update_tip
        })
    })

   

}


//auto generated code
preloadAudio('audio/background.mp3',update_tip)
preloadAudio('audio/bite.mp3',update_tip)
preloadAudio('audio/bite1.mp3',update_tip)
preloadAudio('audio/bite2.mp3',update_tip)
preloadAudio('audio/bonus.mp3',update_tip)
preloadAudio('audio/die.mp3',update_tip)
preloadAudio('audio/die.wav',update_tip)
preloadAudio('audio/exp11.wav',update_tip)
preloadAudio('audio/exp12.wav',update_tip)
preloadAudio('audio/exp13.wav',update_tip)
preloadAudio('audio/exp21.wav',update_tip)
preloadAudio('audio/exp31.wav',update_tip)
preloadAudio('audio/exp32.wav',update_tip)
preloadAudio('audio/hit.mp3',update_tip)
preloadAudio('audio/ice_creak.mp3',update_tip)
preloadAudio('audio/ice_creak1.mp3',update_tip)
preloadAudio('audio/laser.mp3',update_tip)
preloadAudio('audio/pingpong-gone.mp3',update_tip)
preloadAudio('audio/pingpong.wav',update_tip)
preloadAudio('audio/powerdown.wav',update_tip)
preloadAudio('audio/rock-debris1.wav',update_tip)
preloadAudio('audio/rock_debris.wav',update_tip)
preloadAudio('audio/spin1.wav',update_tip)
preloadAudio('audio/spin2.wav',update_tip)
preloadAudio('audio/spin3.wav',update_tip)
preloadAudio('audio/swoosh_down.mp3',update_tip)
preloadAudio('audio/swoosh_down1.mp3',update_tip)
//auto generated code
//auto generated code
preloadImage('image/bullet.png',update_tip)
preloadImage('image/down-arrow.png',update_tip)
preloadImage('image/Fish.png',update_tip)
preloadImage('image/fist.png',update_tip)
preloadImage('image/HammarAndSickle.png',update_tip)
preloadImage('image/left-arrow.png',update_tip)
preloadImage('image/mango.png',update_tip)
preloadImage('image/right-arrow.png',update_tip)
preloadImage('image/sakura.png',update_tip)
preloadImage('image/shooter.png',update_tip)
preloadImage('image/snowflake.png',update_tip)
preloadImage('image/snows.gif',update_tip)
preloadImage('image/snows2.gif',update_tip)
preloadImage('image/tank.png',update_tip)
preloadImage('image/turret.png',update_tip)
preloadImage('image/up-arrow.png',update_tip)
