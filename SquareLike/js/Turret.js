// shape_buffer = new $.Buffer()
// shape_buffer.BeforeGet = function (value) {

//     if (IsNullOrUndefined(value))
//         return null
//     return CopyTable(value)
// }


$.ImageEntity = function ImageEntity(x, y, img, x_size, map) {
    //使用jquery对象
    $.Entity.call(this, x, y, [[]], map, 2)
    this.img = img
    this.angle = 0
    var that = this
    ExecuteIfLoaded(img, function () {
        that.x_size = x_size
        that.y_size = Math.ceil((img.height / img.width * x_size))
        var shape = that.BufferedCreateShape(img, 0)
        that.SetShape(shape)
    })
};

$.ImageEntity.prototype = Object.create($.Entity.prototype);
$.ImageEntity.prototype.GetXSize = function () {
    var times = Math.round(this.angle / 90) //旋转的次数
    return times % 2 == 0 ? this.x_size : this.y_size
}
$.ImageEntity.prototype.GetYSize = function () {
    var times = Math.round(this.angle / 90) //旋转的次数
    return times % 2 != 0 ? this.x_size : this.y_size
}

$.ImageEntity.prototype.BufferedCreateShape = function (img, degree) {
    var that = this
    var img = img
    var degree = degree
    var x_size = this.GetXSize()

    var value = BufferResultCall(
        function () { return that.__create_shape(img, degree) }
        ,
        function (args) {
            return new $.Key([img],"shape", x_size, degree)
        }
        , img, degree)

    if (IsNullOrUndefined(value))
        return null
    return CopyTable(value)
}

$.ImageEntity.prototype.__create_shape = function (img, degree) {
    var x_size = this.GetXSize()
    var y_size = this.GetYSize()
    degree = IsNullOrUndefinedThenDefault(degree, 0)

    img = BufferedRotateImage(img, degree)

    var shape = CreateShape(x_size, this.GetYSize())
    var current_x = 0, curretn_y = 0

    var width = img.width / x_size
    var img1 = new Image();
    // img1.onload = function() {
    // //   ctx.drawImage(img1, 40, 10);
    //   $("#canvas1").get(0).getContext('2d').drawImage(img,0,0,255,255,0,0,255,255);
    // }
    // img1.src = 'data:image/png;base64,' + 'iVBORw0KGgoAAAANSUhEUgAAABIAAAASCAMAAABhEH5lAAAABGdBTUEAALGPC/xhBQAAAa1QTFRF5H444Ho14Xo15oQ45YQ45oI56os854Y443423HYtAAAA3HctzGAT9plE+qZM/eHE+bt///36/dy6+bVz+aFH/OHI/Nm1+aRP/vXr//jw5o9p/N/E/vPo9Kpw9bWD/vPq/vTs/enX/erW/MqV/ObT+8aR9ZM5+Zs7+sma4XRC+dGv98CR+LFs/dWt/vDh+9Ov+uDN+uDP/vj0/fDo9JRA8JFG9beG+ta686ds+6hQ+adV9ruN5oJN/PLt9MKj53Yx+qBC+J1C7qN599bD6IVM/O3h8Jxa97Bu//79+7Vu+Ld787mW/fTt8Jtf6oE78pA795c5/fPs64I77JRZ/NOq/Nu8/Lhv/unU/u7d3WQv4no343s3///++Zw995k843w3/vXt5XYy64s75H045oE45X846oo75oI554Q55YA46IU66IQ65oE56ok66IY654M56Yg62l0p3GAq3WMr5XMu6nwx53gv4Gcs/vv54mwt64Ay7YQz5HAu74c053Uv6Yc6+pw5+Jg48Ys084416Xow9JI27H8y9ZI3+Zo59pU374Y0+54695c48ow1////AGx8/AAAAA10Uk5T/fn5+fn9/fn5ywDLKOfV8VwAAAEpSURBVBjTVc5TcwMBFAXgWyVZ1LZt27YV2+aGm0YNNvc3d9PMdKbn8Xs45wBJEyKtwWi2s06bXi2kaBLoGpXX7wuFo4lkOsdlZQIaCJX3+elP4gU5BSKv/1F6uj69Upav72rQ+n03yKdnpixFFgy+0Nna1CCidPagJHkLGEPhVb6nuQNx7pCXjAPM4ahyoLuBa2lCnOclZQV7NKHkq+rrCm2IG5lUzARsInk+MYTY2V7bj8t3sYgOnKU/48ON2FrsRbyOBDVgS+ceLjcLo4h9mUU8DgYUoM9xL3ixNTaCC6k93A14JKDmsu+IV8VtXNo/Qpx0i0GYjb99vN7nbxnmZIdhulwVQMl+P/PrkWDA43Z9EkAL5P8EaCBpqoq1OKwmnUYhEVcSNPkD6BN5Z82OyewAAAAASUVORK5CYII=';
    var canvas = $("<canvas>").get(0)
    // degree = IsNullOrUndefinedThenDefault(rotate, 0)
    //在这里将图片分解成方块们
    for (var y = 0; y < y_size; ++y) {
        for (var x = 0; x < x_size; ++x) {

            // var canvas = document.createElement('canvas');
            // var canvas = $("#canvas1").get(0)

            // $(document.body).append($(canvas))
            canvas.allowTaint = true,
                canvas.foreignObjectRendering = true
            canvas.width = width;
            canvas.height = width;
            var context = canvas.getContext('2d');
            var tmpwidth = width
            var tempheight = width
            //如果超出范围则补全
            if (curretn_y + tempheight > img.height) {
                tempheight = img.height - curretn_y
            }



            context.drawImage(img, current_x, curretn_y, tmpwidth, tempheight, 0, 0, canvas.width, canvas.height);
            var url = canvas.toDataURL();
            var tmp_img = LoadImage(url)
            if (IsCanvasBlank(canvas)) {
                // shape[y][x].Type = new $.ClearType()
                shape[y][x].Type = 0
            }
            else {
                shape[y][x].Type = new $.ImageType(tmp_img, new $.ClearType())
                shape[y][x].Type.is_block = true
            }
            // shape[y][x].Type =IsCanvasBlank(canvas)? new $.ClearType():new $.ImageType(tmp_img, new $.ClearType())

            // shape[y][x].Type = new $.ImageType(tmp_img, new $.ClearType())

            current_x += width
        }

        current_x = 0
        curretn_y += width
    }

    if (shape[0].length == 2) {
        console.log("strange shape!")
    }

    return shape
}

function getRectFourPoints(x, y, width, height, ang, isDeg = false) {

    if (isDeg) ang = ang * (Math.PI / 180)

    const points = { first: { x, y } }
    const sinAng = Math.sin(ang)
    const cosAng = Math.cos(ang)

    let upDiff = sinAng * width
    let sideDiff = cosAng * width
    const sec = { x: x + sideDiff, y: y + upDiff }
    points.sec = sec

    upDiff = cosAng * height
    sideDiff = sinAng * height
    points.third = { x: x + sideDiff, y: y - upDiff }

    const fourth = { x: sec.x + sideDiff, y: sec.y - upDiff }
    points.fourth = fourth
    return points
}

$.ImageEntity.prototype.Spin = function () {
    this.angle += 90;
    this.angle = this.angle % 360
    this.SetShape(this.BufferedCreateShape(this.img, this.angle))
}

$.ImageEntity.prototype.constructor = $.ImageEntity;

$.Turret = function Turret(x, y, shape, map, type) {
    $.ImageEntity.call(this, x, y, GetImage("turret"), 2, map)
    this.loop = 2000
    this.isPersistent = true;
    this.is_block = true
    this.die_only_onground = false
    this.radius = 30
    //杀掉的花的数量
    this.flower_count = 0
    this.kills = {}
};

$.Turret.prototype = Object.create($.ImageEntity.prototype);
$.Turret.prototype.constructor = $.Turret;
$.Turret.prototype.Sum = function (type) {
    this.kills[type] = IsNullOrUndefinedThenDefault(this.kills[type], 0)
    this.kills[type]++
}
$.Turret.prototype.WhenKillBonus = function (type, num, title, level) {

    if (this.kills[type] == num) {
        this.Map.Bonus(title, level)
        this.kills[type] = 0
    }
}
$.Turret.prototype.Move = function () {
    this.Attack()
    var ok = $.Entity.prototype.Move.call(this)
    if (!ok) {
        this.loop--;
    }
    if (!(this.loop >= 0))
        this.isPersistent = false

    return ok
}
// $.Turret.prototype.Spin = function () {

// }

$.Turret.prototype.BecomeStone = function () {


    this.isPersistent = false
    this.EffectPlayer.PlayPowerDown()
    return $.Entity.prototype.Stonize.call(this)
}
$.Turret.prototype.OnKill = function () {
    this.isPersistent = false
    return true
}
$.Turret.prototype.PlayShot = function (to_x, to_y) {

    this.Map.AddEffect(new $.LineEffect(15, this.X + (this.GetShape()[0].length) / 2, this.Y + this.GetShape().length / 2, to_x + 0.5, to_y + 0.5, "red"))
    this.EffectPlayer.PlayShot()
    this.loop /= 1.1
    this.Map.score++
}

$.Turret.prototype.Attack = function () {
    if (this.CanMove()) {
        return
    }

    //从地图找最近的方块消掉
    var that = this
    var ret = { Value: null }
    var part = this.Map.GetPart(this.X, this.Y, function (b, args) {

        if (twoPointDistance(that.X, that.Y, b.X, b.Y) < that.radius / 2) {
            if (b.Type != 0) {
                args.Cancel = true
                // args.Block=b;
                ret.Value = b;

            }
            return true
        }

        return false
    })

    //找到了就消掉
    if (ret.Value != null) {
        var part = part.part;

        b = ret.Value;
        this.Map.map[b.Y][b.X].Type = 0
        this.Map.__requestElimination();
        this.PlayShot(b.X, b.Y)
        this.Sum($.Block)

        this.WhenKillBonus($.Block, 30, "挖掘机", 2)

    }

    for (const e of this.Map.entities) {
        if (e != this && twoPointDistance(this.X, this.Y, e.X, e.Y) < this.radius) {

            var count = 1
            if (e.constructor == $.Entity) {
                count = 3
            }

            while (count-- > 0) {
                //随机打掉一个方块
                var shape = e.GetShape()
                var rand_y = Math.floor(Math.random() * shape.length)
                var row = shape[rand_y]
                if (!IsNullOrUndefined(row)) {
                    var rand_x = (Math.floor(Math.random() * row.length))
                    var pre = row[rand_x].Type
                    row[rand_x].Type = 0
                }
                this.PlayShot(e.X + rand_x, e.Y + rand_y)

            }

            StraitenShape(shape)

            var empty = true
            for (const row of shape) {
                for (const b of row) {
                    if (b.Type != 0)
                        empty = false
                }
            }

            //如果物体被打空了或者是个机器人就杀死
            if (empty || pre != 0 && e instanceof $.Turret) {
                this.Map.KillEntity(e)
            }
            this.Sum(e.constructor)


            this.WhenKillBonus($.Flower, 30, "辣手摧花", 1)
            this.WhenKillBonus($.Snake, 10, "夸父追日", 2)
            this.WhenKillBonus($.Turret, 3, "机器人终结者", 1)

            return
        }
    }

}






