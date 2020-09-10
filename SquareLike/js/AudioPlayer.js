const AudioContext = window.AudioContext || window.webkitAudioContext;
const audioContext = new AudioContext();

playing=new Set()

$.Player = function (loop, srcs, baseUrl, multiple) {

    if (typeof multiple === "undefined") {
        multiple = false
    }

    this.Srcs = srcs
    this.BaseUrl = baseUrl
    this.Loop = loop

    this.Multiple = multiple
    this.Audios = [this.CreateAudio()]
    this.CurrentSrc = this.NextSrc()
    //30 for keyboard interval
    this.SomeSrcInterval = 27
    this.LastPlayedTime = new Date().getTime()
    var that=this
    this.src_lockers={}
    this.gain_node=audioContext.createGain()
    // this.gain_node.gain.setValueAtTime()
    this.gain_node.connect(audioContext.destination)
}

//已经开始播放但是未准备号的audio集合
$.NotReadySet = new Set()

//获得可用的audio
$.Player.prototype.GetAvalibleAudio = function (src) {
    var found = null
    if (!this.Multiple) {
        return this.Audios[0]
    }
    var audio = null
    var that = this

    for (const audio of this.Audios) {
        if (!this.IsPlaying(audio)) {
            return audio;
        }
    }

    found = this.CreateAudio();
    this.Audios.push(found)
    return found
}

//创建一个audio
$.Player.prototype.CreateAudio = function () {
    var jqAudio = $(document.createElement("audio"))
    $("body").append(jqAudio)
    var audio = jqAudio.get(0)
    //预加载
    audio.preload = 'auto'
    thatPlayer = this
    audio.loop = this.Loop

    audio.addEventListener("ended", function (event) {
        if (thatPlayer.HasAudio(event.target) && thatPlayer.Loop == true) {
            thatPlayer.Play()
        }
    })
    audio.volume = 0.5
    return audio
}


$.Player.prototype.SetVolume = function (vol) {
    this.gain_node.gain.setValueAtTime(vol*2,audioContext.currentTime)
}

//判断一首音乐是否正在播放
$.Player.prototype.IsPlaying = function (audio) {
    return (audio.currentTime > 0 && !audio.paused && !audio.ended) || $.NotReadySet.has(audio)
}

//从缓冲列表获得资源并播放
$.Player.prototype.decode_and_play= function(src,loop){
    var loop=IsNullOrUndefinedThenDefault(loop,false)
    var data=responses[src]
    var that=this
    audioContext.decodeAudioData(new Uint8Array(data).buffer,function(buffer){ that.onBuffer(buffer,src,loop)}, function(e){console.error(e)})
}

//当转码成功后调用
$.Player.prototype.onBuffer=function (buffer,src,loop) {
    var source = audioContext.createBufferSource();
    source.buffer = buffer;
    // source.connect(context.destination);
    source.loop = loop;
    source.src=src
    source.connect(this.gain_node)
    source.start_time=new Date().getTime()
    playing.add(source)
    source.addEventListener("ended",function(){
      playing.delete(source)
    })
    source.start()
  }

$.Player.prototype.TryPlay=function(){
    //对每一种声音上间隔锁
    var locker=this.src_lockers[this.CurrentSrc]
    var last_time=new Date().getTime()
    if(IsNullOrUndefined(locker))
    {
        var that=this
        locker= new $.IntervalLocker(function(){

        var count=0
        for (const s of playing) {
            if(s.src==that.CurrentSrc)
            {
                count++
                // console.log("stop")
                s.stop
            }
        }

        var now=new Date().getTime()
        var lag=now-last_time
        last_time=now
        // if(lag<this.Interval)
        // console.log("strange interval")

        // console.log("play:"+that.CurrentSrc+" stop:"+count +" lag:"+lag)
        
        that.decode_and_play(that.CurrentSrc,that.Loop)
        },this.SomeSrcInterval)
        // locker.Start()
        this.src_lockers[this.CurrentSrc]=locker
        // return false
    }

    if(!locker.Request()){
        // console.log("wait")
    }

}

var version=0
$.Player.prototype.Play = function () {
    this.TryPlay()
}

//播放一些歌中随机一首
$.Player.prototype.PlaySrc = function (...srcs) {
    var src = this.BaseUrl + "/" + srcs[Math.floor(Math.random() * srcs.length)]

    this.CurrentSrc = src
    this.Play()
}


//下一首歌
$.Player.prototype.Next = function () {
    this.CurrentSrc = this.NextSrc()
    this.Play()
}

//得到播放列表的下一个链接
$.Player.prototype.NextSrc = function () {
    // ==="undefined"
    if (typeof this.Getter === "undefined") {
        this.Getter = this.__getSrc()
    }
    var next = this.Getter.next()
    if (typeof next.value === "undefined" || next.done) {
        this.Getter = this.__getSrc()
        next = this.Getter.next()
    }
    return this.BaseUrl + "/" + next.value
}

//遍历器
$.Player.prototype.__getSrc = function* () {
    for (const src of this.Srcs) {
        yield src
    }
}

