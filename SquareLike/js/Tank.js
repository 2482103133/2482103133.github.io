$.Tank = function Tank(x, y, shape, map, type, img, x_size) {
    x_size = IsNullOrUndefinedThenDefault(x_size, 10)
    img = IsNullOrUndefinedThenDefault(img, GetImage("tank"))
    $.ImageEntity.call(this, x, y, img, x_size, map)
    this.loop = 500
    this.is_block = true
    this.die_only_onground = false
    this.radius = 30
    //杀掉的花的数量
    this.flower_count = 0
    this.kills = {}
    this.settled = false
    this.aim_angle = -180
    this.speed = 500
    this.is_left = true
    this.bullets = []
    this.mirror = BufferedMirrorImage(this.img)
    this.duration = 120
    this.score = 0
    this.bullet_radius = 5
    this.entity_list = []
    this.cross_hair = new $.LineEffect(100000, 0, 0, 0, 0, "red", 1)
    this.bullet_size = 1
    this.runner = new $.ObjectRunner(map, this.duration, this.bullet_size)
    var that = this
    this.fire_locker = new $.IntervalLocker(function (args) {
        that.Fire.apply(that, args)
    }, 1000, true)

    var that = this
    this.cross_hair.BeforePaint = function () {
        var info = that.GetShotInfo()
        var cross_hair = that.cross_hair
        cross_hair.Args.FromX = info.SendX
        cross_hair.Args.FromY = info.SendY
        cross_hair.Args.ToX = info.SendX + info.Vx / 10
        cross_hair.Args.ToY = info.SendY + info.Vy / 10
    }

    this.respawn_timer = new $.Timer(function () {
        //随机生成方块,并随机位置
        var e = that.Map.GetRandomEntity([$.Entity])
        var len = e.GetShapeLength()
        e.X = GetRandomInt($.GameMap.defaultOptions.X_SIZE - len);
        that.Map.AddEntity(e)
        that.entity_list.push(e)

    }, 5000)

    this.bullet_count = 0
    this.success_count = 0
};

$.Tank.prototype = Object.create($.ImageEntity.prototype);
$.Tank.prototype.constructor = $.Tank;
$.Tank.prototype.SetFireInterval = function (interval) {
    this.fire_locker.Interval = interval
}
$.Tank.prototype.GetShotInfo = function () {
    var send_x = (this.X + (this.is_left ? 0 : this.GetShape()[0].length)) * this.Map.block_size
    var send_y = this.Y * this.Map.block_size
    var vx = this.speed * Math.cos(this.aim_angle * Math.PI / 180)
    var vy = this.speed * Math.sin(this.aim_angle * Math.PI / 180)

    return { SendX: send_x, SendY: send_y, Vx: vx, Vy: vy }
}

//加入游戏时
$.Tank.prototype.OnComeIntoGame = function () {
    if (this.Map.MainEntity == this) {
        // this.fire_locker.Start()
        this.Map.AddEffect(this.cross_hair)
        this.isPersistent = true;
        this.take_over = true
        this.spawn_time = new Date().getTime()
        var that = this

        //创建计时器用来计算当前子弹的方位
        this.runner.Start()


        this.respawn_timer.Start()
    }
    return true
}

//被杀死的时候
$.Tank.prototype.OnKill = function () {
    this.isPersistent = false
    this.take_over = false
    this.respawn_timer.Stop()
    this.runner.Stop()
    // this.fire_locker.Stop()
    if (this == this.Map.MainEntity) {



        for (const e of this.entity_list) {
            this.Map.__remove_entity(e)
        }
    }
    return true
}
$.Tank.prototype.BecomeStone = function () {
    this.OnKill()
    this.cross_hair.Duration = 0
    $.Entity.prototype.BecomeStone.call(this)
    //返回击杀分数
    return 0
}
$.Tank.prototype.Do = function () {
    this.fire_locker.Request()
}

$.Tank.prototype.Fire = function (send_x, send_y) {

    if (this.CanMove()) {
        return $.Entity.prototype.DownToHell.call(this)
    }
    else {
        var send_x = IsNullOrUndefinedThenDefault(send_x, (this.X + (this.is_left ? 0 : this.GetShape()[0].length)) * this.Map.block_size)
        var send_y = IsNullOrUndefinedThenDefault(send_y, this.Y * this.Map.block_size)

        var vx = this.speed * Math.cos(this.aim_angle * Math.PI / 180)
        var vy = this.speed * Math.sin(this.aim_angle * Math.PI / 180)

        var bullet = new $.ImageEffect(this.Map, GetImage("bullet"), 0, send_x, send_y, this, 20 * this.bullet_size, 10 * this.bullet_size)

        bullet.send_time = new Date().getTime()
        bullet.x0 = send_x
        bullet.y0 = send_y
        bullet.vx = vx
        bullet.vy = vy

        bullet.radius = this.bullet_radius
        var my = Math.floor(bullet.py / bullet.map.block_size)
        var mx = Math.floor(bullet.px / bullet.map.block_size)
        bullet.first_block = { X: mx, Y: my }
        this.runner.Add(bullet)
    }

}

$.Tank.prototype.Left = function (iskey) {
    if (!this.is_left) {
        var shape = this.BufferedCreateShape(this.img, 0)

        this.SetShape(shape)
        this.aim_angle += 180 - 2 * this.aim_angle
        this.aim_angle %= 360
        this.is_left = !this.is_left
    }
    return $.Entity.prototype.Left.call(this, iskey)
}

$.Tank.prototype.Right = function (iskey) {
    if (this.is_left) {
        this.aim_angle += 180 - 2 * this.aim_angle
        this.aim_angle %= 360
        this.is_left = !this.is_left
        var shape = this.BufferedCreateShape(this.mirror, 0)

        this.SetShape(shape)
    }
    return $.Entity.prototype.Right.call(this, iskey)
}

$.Tank.prototype.Spin = function () {

    this.EffectPlayer.PlaySpin()
    this.aim_angle += this.is_left ? 10 : -10
    this.aim_angle %= 360
    //改变射击方向
}

$.Tank.prototype.Down = function () {
    if (!this.CanMove()) {

        this.aim_angle -= this.is_left ? 10 : -10
        this.aim_angle %= 360
    }
    else {
        return $.Entity.prototype.Down.call(this)
    }
}

$.Tank.prototype.Move = function () {
    if (this.CanMove())
        return $.Entity.prototype.Move.call(this)
    else {
        if (this.duration-- <= 0) {
            this.OnKill()
            return false
        }
    }
    return true
}

$.Tank.prototype.FailToGo = function (i_x, i_y, isKeyboard) {
    return true
}
$.Tank.prototype.CreateExplosion = function (x, y, radius) {
    radius = Math.ceil(IsNullOrUndefinedThenDefault(radius, 2) * this.bullet_size)
    var exp = new $.Dynamite(x, y, CreateShape(radius, radius, 3), this.Map).BecomeStone()
    //创建一个炸弹并爆炸
    this.Map.score += Math.ceil(exp / (3 * radius))
    this.Map.__requestElimination()
}

$.ObjectRunner = function (map, duration, bullet_size, force = { x: 0, y: 200 }) {
    this.bullets = []
    this.Map = map
    this.duration = duration
    this.bullet_size = bullet_size
    this.bullet_count = 0
    this.success_count = 0
    this.force = force
    let that = this
    //创建计时器用来计算当前子弹的方位
    this.timer = new $.Timer(function () {
        var now = new Date().getTime()
        var bullets = []
        var pass_time = (now - that.spawn_time) / 1000
        if (pass_time >= that.duration) {
            this.Stop()
            that.Map.KillEntity(that)
        }
        for (const b of that.bullets) {
            bullets.push(b)
        }
        for (const b of bullets) {
            var xg = force.x
            var g = force.y
            pass_time = (now - b.send_time) / 1000
            var vy1 = b.vy + g * pass_time
            var vx1 = b.vx + xg * pass_time
            var shift_x = b.vx * pass_time + xg * pass_time * pass_time * 0.5
            var shift_y = b.vy * pass_time + g * pass_time * pass_time * 0.5

            b.px = b.x0 + shift_x
            b.py = b.y0 + shift_y
            b.angle = Math.atan2(vy1, vx1)

            var my = Math.floor(b.py / that.Map.block_size)
            var mx = Math.floor(b.px / that.Map.block_size)

            if (that.Map.OutOfBounds(mx, my)) {
                that.OnOutOfBounds(b, mx, my)
                continue
            }

            if (touch(mx, my)) continue
            my = Math.floor((b.py + b.radius) / that.Map.block_size)
            mx = Math.floor((b.px + b.radius) / that.Map.block_size)
            if (touch(mx, my)) continue
            my = Math.floor((b.py + b.radius) / that.Map.block_size)
            mx = Math.floor((b.px - b.radius) / that.Map.block_size)
            if (touch(mx, my)) continue
            my = Math.floor((b.py - b.radius) / that.Map.block_size)
            mx = Math.floor((b.px + b.radius) / that.Map.block_size)
            if (touch(mx, my)) continue
            my = Math.floor((b.py - b.radius) / that.Map.block_size)
            mx = Math.floor((b.px - b.radius) / that.Map.block_size)
            if (touch(mx, my)) continue

            function touch(mx, my) {
                if (that.Map.OutOfBounds(mx, my)) {
                    return false
                }
                var block = that.Map.last_map[my][mx]
                //如果撞到了block或者entity
                if (mx != b.first_block.X && my != b.first_block.Y && ToType(block.Type).IsBlock()) {
                    var e = ToType(block.Type).GetEntity()
                    that.OnCollide(b, mx, my, e)
                }
                return false
            }
        }

        for (const b of bullets) {
            if (b.Duration == 0) {
                that.bullets.splice(that.bullets.indexOf(b), 1)
                that.OnDie(b)
            }
        }
    }, 10)
}

$.ObjectRunner.prototype = {
    Start: function () { this.timer.Start() },
    Stop: function () {
        this.timer.Stop()

        for (const b of this.bullets) {
            this.Map.EffectList.delete(b)
        }
    },
    Pause: function () { this.timer.Stop() },
    Add: function (ef) { },
    OnCollide: function (b, mx, my, e = null) {
        let that = this
        if (!IsNullOrUndefined(e)) {
            if (e != b.sender) {
                b.Duration = 0
                b.success = true
                e.OnBecomeStone(function () {
                    var len = e.GetShapeLength()
                    var len1 = e.GetShape().length
                    that.CreateExplosion(mx, my, len > len1 ? len : len1)
                    if (len <= 3 || len1 <= 3)
                        that.Map.Bonus("精准打击", 3)
                    // args.Cancel = true

                })
                this.Map.KillEntity(e)
                //创建一个炸弹并爆炸
                b.Duration = 0
                return true
            }
        }
        else {
            this.CreateExplosion(mx, my)
            b.Duration = 0
            return true
        }
    }, OnDie: function (b) {
        that.bullet_count++
        if (b.success == true) {
            that.success_count++
            if (that.success_count == that.bullet_count) {
                if (that.success_count >= 5) {
                    that.Map.Bonus("弹无虚发", 2)
                }

                if (that.success_count >= 9) {
                    that.Map.Bonus("神射手", 1)
                }
            }
        }
        if (that.kh != true && that.bullet_count > 50) {
            that.kh = true
            that.Map.Bonus("狂轰滥炸", 2)
        }
    }, Add: function (b) {
        this.bullets.push(b)
        this.Map.AddEffect(b)
    }, OnOutOfBounds: function (b, mx, my) {
        this.CreateExplosion(mx, my)
        b.Duration = 0
    }, CreateExplosion: function (x, y, radius) {
        radius = Math.ceil(IsNullOrUndefinedThenDefault(radius, 2) * this.bullet_size)
        let exp = new $.Dynamite(x, y, CreateShape(radius, radius, 3), this.Map).BecomeStone()
        //创建一个炸弹并爆炸
        this.Map.score += Math.ceil(exp / (3 * radius))
        this.Map.__requestElimination()
    }
}

