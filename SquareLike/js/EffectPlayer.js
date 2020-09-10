$.EffectPlayer = function EffectPlayer() {
    $.Player.call(this, false, [], "audio",true)
};

$.EffectPlayer.prototype = Object.create($.Player.prototype);

$.EffectPlayer.prototype.constructor = $.EffectPlayer;

$.EffectPlayer.prototype.PlayMove = function (direction) {
    this.PlaySrc("pingpong.wav")
}
$.EffectPlayer.prototype.PlayHit = function (direction) {
    this.PlaySrc("hit.mp3")
}

$.EffectPlayer.prototype.PlayDebris = function (direction) {

    this.PlaySrc(
        "rock-debris1.wav",
        "rock_debris.wav"
        )
}
$.EffectPlayer.prototype.PlayLittleExplosion = function (direction) {

    this.PlaySrc(
        "exp11.wav",
        "exp12.wav",
        "exp13.wav"
        )
}
$.EffectPlayer.prototype.PlayMiddleExplosion = function (direction) {

    this.PlaySrc(
        "exp21.wav"
        )
}
$.EffectPlayer.prototype.PlayLargeExplosion = function (direction) {

    this.PlaySrc(

        "exp31.wav"
        )
}
$.EffectPlayer.prototype.PlaySpin = function (direction) {

    this.PlaySrc(
        "spin1.wav",
        "spin2.wav",
        "spin3.wav"
        )
}
$.EffectPlayer.prototype.PlayShot = function (direction) {

    this.PlaySrc(
        "laser.mp3",
        // "spin2.wav",
        // "spin3.wav"
        )
}
$.EffectPlayer.prototype.PlayDie = function (direction) {

    this.PlaySrc(
        "die.wav"
        // ,
        // "spin2.wav",
        // "spin3.wav"
        )
}
$.EffectPlayer.prototype.PlayPowerDown = function (direction) {

    this.PlaySrc(
        "powerdown.wav"
        )
}
$.EffectPlayer.prototype.PlayBite = function (direction) {

    this.PlaySrc(
        "bite.mp3",
        "bite1.mp3",
        "bite2.mp3"
        )
}
