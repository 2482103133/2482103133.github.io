// (
//     function ($) {
$.GameMap = function (element) {
    //定义了目标对象,要求是Canvas元素
    this.element = (element instanceof $) ? element : $(element);
    this.map = []
    this.score = 0
    this.level = 1
    this.GameOver = false
    this.WaitToDispose = new Set()
    this.last_refresh_time = 0
    this.EffectPlayer = $.GlobalEffectPlayer
    this.x_size = $.GameMap.defaultOptions.X_SIZE
    this.y_size = $.GameMap.defaultOptions.Y_SIZE
    this.block_size = $.GameMap.defaultOptions.block_size

    this.ready_xsize = 20
    this.ready_ysize = this.y_size
    this.Intervals = {}
    this.id = 0
    this.map = CreateEmptyShape($.GameMap.defaultOptions.X_SIZE, $.GameMap.defaultOptions.Y_SIZE)

    that = this;

    //本次将要渲染的map
    this.render_map = CreateEmptyShape($.GameMap.defaultOptions.X_SIZE + this.ready_xsize, $.GameMap.defaultOptions.Y_SIZE)
    //上一次渲染的map
    this.last_map = CopyTable(this.render_map)
    //准备的entity的渲染map
    this.ready_map = CreateEmptyShape(this.ready_xsize, this.ready_ysize)

    //最低帧率
    this.min_refresh_rate = 1000
    //当前帧率
    this.rate = 1000
    //地图主inteval的实体列表
    this.entities = [];
    //正在操控的实体
    this.MainEntity = null;

    //是否有消除的请求
    this.isEliminatingRequestWaiting = false;

    //创建描述
    this.CreateDescriptions()

    this.elimination_locker = new $.IntervalLocker(
        function () {
            that.EliminateBlocks()
        },
        $.GameMap.defaultOptions.eliminating_interval)
    //判断消除的触发间隔
    this.EliminatingInterval =
        //上一次触发消除的时间
        this.lastEliminationTime = new Date().getTime()

    this.__start_draw_effects()
    this.__startEliminationDetection()

    this.read_width = this.block_size * this.ready_xsize

    this.map_width = $.GameMap.defaultOptions.block_size * ($.GameMap.defaultOptions.X_SIZE + this.ready_xsize)
    this.map_height = $.GameMap.defaultOptions.block_size * $.GameMap.defaultOptions.Y_SIZE
    this.real_map_width = $.GameMap.defaultOptions.block_size * $.GameMap.defaultOptions.X_SIZE



    $(".game_panel").attr("width", this.map_width)
    $(".game_panel").attr("height", this.map_height)

    this.HeadEvent = null
    //按键监听
    document.onkeydown = function (event) {

        that.HeadEvent = event
        if (that.MainEntity != null) {

            that.MainEntity.__receiveKeyboardEvent(event)

            if (that.MainEntity != null && !that.MainEntity.isAlive) {
                that.Respawn();
            }

            that.Refresh(event);
        }
    };

    this.GetCanvas3().addEventListener('mousemove', function (evt) {
        var mousePos = getMousePos(evt.target, evt);
        that.MousePosition = mousePos

        that.AddEffect(new $.LineEffect(50, mousePos.x, mousePos.y, mousePos.x - 1, mousePos.y, "red", 1))
    }, false);
    this.GetCanvas3().addEventListener('click', function (evt) {
        var mousePos = getMousePos(evt.target, evt);
        if(that.MainEntity!=null)
        that.MainEntity.__receiveMouseClickEvent(mousePos)
    }, false);
    //获得鼠标在canvas的坐标
    function getMousePos(canvas, evt) {
        var rect = canvas.getBoundingClientRect();
        return {
            x: evt.offsetX,
            y: evt.offsetY
        };
    }
};

async function sleep(time) {
    await new Promise(r => setTimeout(r, time));
}

//设置默认游戏选项
$.GameMap.defaultOptions = {
    //X轴方块个数
    X_SIZE: 100,
    //Y轴方块个数
    Y_SIZE: 100,
    //方块大小
    block_size: 8,
    //每一等级速度增长率
    slope: 1.10,
    initial_interval: 300,
    respawn_interval: 300,
    exp_gain_rate: 0.2,
    eliminating_interval: 1000
};

$.GameMap.prototype = {
    //开始游戏
    Play: function () {

        that = this;
        that.interval = $.GameMap.defaultOptions.initial_interval
        that.StartMain()
        that.start_score = that.score == 0 ? 1 : that.score
        this.ShowMessage("游戏开始!")

        this.Easy();

        if (this.MainEntity == null) {
            this.Respawn()
        }

        that.game_interval_id = setInterval(function () {

            if (that.GameOver == true) {
                alert("游戏结束!")
                that.main_timer.Stop()
                // clearInterval(that.main_timer)
                clearInterval(that.game_interval_id)
            }

            if (that.GetSetting("design") && Object.getPrototypeOf(that.MainEntity).constructor != $.Builder) {
                that.ReadyEntity = new $.Builder(0, 0, null, that)
                that.KillEntity(that.MainEntity);
                //that.Respawn();
            }

            if (that.GetSetting("pause")) {
                that.main_timer.Stop()
                // clearInterval(that.main_timer)

                that.main_timer = null
            }
            else {

                if (that.main_timer == null) {
                    // setTimeout(function () {
                    that.StartMain()

                    // }, 100)
                }

                //速度随机分加快
                if (that.score >= that.NextLevelScore()) {
                    that.main_timer.Stop()
                    // clearInterval(that.main_timer)
                    // setTimeout(function () {
                    that.level += 1
                    switch (that.level) {
                        case 10:
                            that.Bonus("进击的菜鸟", 1)
                            break;
                        case 15:
                            that.Bonus("初出茅庐", 1)
                            break;
                        case 20:
                            that.Bonus("升堂入室", 1)
                            break;
                        case 22:
                            that.Bonus("登峰造极", 1)
                            break;
                        default:
                            if (that.level > 24)
                                that.Bonus("我是传说", 1)
                    }

                    that.interval /= $.GameMap.defaultOptions.slope
                    that.start_score = that.score
                    that.StartMain()

                }
            }
        }, 3000);
    },
    StartMain() {
        that = this
        that.Main(that.interval).then(function (param) {
            that.main_timer = param
        })
    },
    //遍历图
    TraverseMap: function* () {
        var i = 0, j = 0;
        for (const row of this.map) {

            for (const b of row) {
                b.X = j
                b.Y = i
                yield b;
                j++;
            }
            j = 0;
            i++;
        }
    },
    //判断地图是否为空
    IsMapEmpty: function () {
        for (const b of this.TraverseMap()) {
            if (b.Type != 0)
                return false
        }
        return true
    },
    //紧张气氛
    Intense: function () {
        this.SetBackGroundImage(GetImage("snows2").src)
    },
    //闲适气氛
    Easy: function () {

        this.SetBackGroundImage(GetImage("snows").src)
    }
    //设置背景图片
    , SetBackGroundImage(src) {

        this.__getContainer().attr("style", "background-image:url('" + src + "')")
    }

    //销毁第一个待销毁列表的对象
    , __tryDispose: function () {

        var i = 0
        var entities = []
        for (const entity of this.WaitToDispose) {
            entities.push(entity)
        }
        for (const entity of entities) {

            this.WaitToDispose.delete(entity)
            if (entity.State == $.EntityState.Detached) {
                continue
            }
            // entity.BeforeBecomeStone()
            var score=entity.__become_stone();
            this.score += score;
            var isEffective = entity.IsEffective();
            if (isEffective)
                this.__requestElimination();

            if (!entity.IsPersistent()) {
                // console.log("disposed!")
                entity.State = $.EntityState.Detached
                this.__remove_entity(entity)
                //调用disposed监听列表
                this.__on_entity_disposed(entity);
            }
        }

    }
    //物体销毁监听列表
    , __entity_disposed_listener: []
    //销毁时调用的函数
    , __on_entity_disposed(entity) {
        var no_longer_list = []
        for (const li of this.__entity_disposed_listener) {
            var args = { Cancel: false }
            li.call(this, entity, args)
            //如果args被设置为取消则取消
            if (args.Cancel) {
                no_longer_list.push(li)
            }
        }
        //从监听列表中移除
        for (const li of no_longer_list) {
            this.__entity_disposed_listener.splice(this.__entity_disposed_listener.indexOf(li), 1)
        }
    }
    , AddEntityDisposedListener(callback) {
        this.__entity_disposed_listener.push(callback)
    }
    //开始方块消除检测
    , __startEliminationDetection: function () {
        // this.elimination_locker.Start()
        // var that = this
        // setInterval(function () {
        //     if (that.isEliminatingRequestWaiting) {
        //         that.isEliminatingRequestWaiting = false
        //         that.EliminateBlocks();
        //     }
        // }, this.EliminatingInterval)
    }
    //请求一次方块消除
    , __requestElimination: function () {
        this.elimination_locker.Request()

        // if (this.isEliminatingRequestWaiting) {
        //     //    console.log("Eliminate ignored!")
        //     return
        // }
        // this.isEliminatingRequestWaiting = true
    }
    //销毁实体
    , DisposeEntity: function (entity) {
        //不是持续性物体则销毁
        if (entity.IsPersistent()) {
            return
        }
        //将entity加入待销毁列表
        this.WaitToDispose.add(entity)

        //启动一次异步销毁
        setTimeout(() => {
            this.__tryDispose();
        }, 0);
    },
    //创建描述
    CreateDescriptions() {
        var stop = 0

        for (const v in Descriptions) {
            $("#class").append($("<p>" + Descriptions[v] + "</p>"))
        }
    },
    Bonuses: {
    },
    //发送一条奖励信息
    Bonus: function (message, level) {
        this.Bonuses[message] = IsNullOrUndefinedThenDefault(this.Bonuses[message], { Count: 0, Level: level })
        this.Bonuses[message].Count++
        this.score += (4 - level) * (4 - level) * this.level
        this.Refresh2()

        if (level <= 1) {
            //创建一排花作为奖励,如果是一级奖励的话
            for (let index = 0; index < this.x_size; index++) {
                this.AddEntity(new $.Flower(index, 0, null, this))
            }
        }

        this.ShowMessage("<span class='anaglyph'>" + message + "</span>", level)
    }
    ,
    //显示一条信息,level越小越显眼时间越久
    ShowMessage: function (message, level) {
        // $("h2").remove()
        var height = this.map_height / 2
        var width = this.map_width / 2
        if (typeof level === "undefined") {
            level = 3
        }
        timeout = (5 - level + 1) * 2000
        var relevel = 5 - level
        $('.message').each(function () {
            if ($(this).attr("level") >= level) {
                $(this).remove()
            }
        });

        var h1 = $("<div class='message' level='" + level + "' style='float:left;transform:translate(-50%,-50%) scale(" + 3 / level + "," + 3 / level + ");display:inline-block;position:fixed;top:" + height + "px;left:" + width + "px;color:Ivory;'>" + message + "</div>");
        h1.css("z-index", 5 - level)
        // h1.css("transform:","translate(-50%,-50%) scale("+3/level+","+3/level+")")
        // var h1 = $("<h2 style='display:inline-block;transform:translate(-50%,-50%);position:absolute;top:50%;left:50%;color:Ivory;'>" + message + "</h2>");
        this.__getContainer().append(h1);

        if (level < 3) {
            var fs = h1.css("font-size")
            h1.animate({
                fontSize: "150%"
            }, "fast")
            h1.animate({
                fontSize: fs
            }, "slow")
        }
        h1.animate({
            opacity: 0.0,
            top: "-=" + width,
        },
            timeout,
            function (param) {
                h1.remove()
            })
    }
    //获得画布容器
    , __getContainer: function () {
        var con = $(".container");
        return con
    },
    //获得一个设置
    GetSetting: function (name) {
        return $("#" + name).is(":checked")
    },
    //清除已经没有对象在运行的Intervals
    ClearingIntervals: function (key) {
        var args = this.Intervals[key]
        if (!IsNullOrUndefined(args)) {

            //如果checkfunction不决定清除Timer
            if (!IsNullOrUndefined(args.clear_check_function)) {
                if (!args.clear_check_function()) {
                    return
                }
            }
            key.Stop()
            this.intervals_count--;
            console.log("Intervals:" + this.intervals_count + " clearing:" + this.intervals_count)
            delete this.Intervals[key]
        } else {
            console.log("not clearing")
        }
        // for (const key in this.Intervals) {
        //     if(key!=this.main_timer)
        //     {   
        //         var args=this.Intervals[key]

        //         if(args.endWhenClear)
        //         continue
        //         var end=true

        //         //判断列表物体死否死光
        //             for (const e1 of entities) {
        //                 if(e1.State==$.EntityState.Detached)
        //                 {
        //                     end=false
        //                 }
        //             }

        //         //最后的检查
        //         if(args.clear_check_function())
        //         {
        //             if(end)
        //             {
        //                 this.intervals_count--;
        //                 console.log("Intervals:"+this.intervals_count+" clearing:"+this.intervals_count)
        //                 delete this.Intervals[key]


        //             }
        //         }
        //     }
        // }
    }
    , intervals_count: 0
    //方块下落控制进程
    , Main: async function (interval, entities, endWhenClear, clear_check_function) {

        this.id++;
        that = this;
        if (that.GameOver == true) {
            return
        }

        //此过程控制的实体列表
        entities = IsNullOrUndefinedThenDefault(entities, that.entities)
        //是否在实体列表清空时结束过程
        endWhenClear = IsNullOrUndefinedThenDefault(endWhenClear, false)
        //用来判断是否结束过程
        clear_check_function = IsNullOrUndefinedThenDefault(clear_check_function, function () { return true })
        that.last_respawn_time = new Date().getTime()

        var timer = new $.Timer(function () {
            this.last_refresh_time = new Date().getTime()
            var index = 0
            var waitToMove = []
            var end = true

            //是否所有的实体都处于Alive状态
            for (const e1 of entities) {
                if (e1.State == $.EntityState.Alive) {
                    end = false
                }
            }


            if (endWhenClear && end) {
                that.ClearingIntervals(this)
                return
            }

            for (; index < entities.length; index++) {
                entity = entities[index]
                if (entity != null) {
                    waitToMove.push(entity)
                }
            }

            for (const entity of waitToMove) {
                that.MoveEntity(entity)
            }

            if (entities.length > 0)
                that.Refresh();

        }, interval)

        timer.Start()

        return timer
    },
    //将一个列表的物体添加到地图,并设置自定义频率,返回一个方法用于后于继续通过该入口添加同样频率的物体
    //clear_check_function 在检测到物体已经全部离开地图后进行最后的判断是否结束该interval
    AddEntitiesOnInterval: function (entities, level, clear_check_function) {

        clear_check_function = IsNullOrUndefinedThenDefault(clear_check_function, function () { return true })
        for (const e of entities) {
            this.AddEntity(e)
        }

        var entities = entities;
        var that = this
        var interval = this.interval / level


        //找到同level的inteval
        for (const key in this.Intervals) {

            var interval = this.Intervals[key]
            if (interval.level == level) {
                var this_check = clear_check_function
                var pre_check = interval.clear_check_function

                //将check_function合并
                var now = function () {
                    return this_check.call() && pre_check.call()
                }
                interval.clear_check_function = now
                for (const e of entities) {
                    interval.entities.push(e)
                }
                return interval.push_function;
            }
        }

        //push入口函数
        var push = function (entity) {
            that.AddEntity(entity)
            entities.push(entity)
        }

        this.Main(this.interval / level, entities, true, clear_check_function).then(function (param) {
            that.Intervals[param] = { entities: entities, level: level, endWhenClear: true, clear_check_function: clear_check_function, push_function: push }
        })

        this.intervals_count++;
        console.log("Intervals:" + this.intervals_count)
        return push
    },
    MoveEntityPosition: function (to_x, to_y) {

    }
    ,
    //控制物体自动移动
    MoveEntity: function (entity) {
        if (entity.SkipOnce == true) {
            entity.SkipOnce = false
            return true
        }

        var res = entity.Move();

        if (!res) {
            //如果是主体
            if (entity === that.MainEntity) {

                this.Respawn()
            }
            else {

                this.DisposeEntity(entity)
            }
        }
        return res
    }
    //提前移动一次
    , AheadMove: function (entity) {
        entity.SkipOnce = false
        this.MoveEntity(entity);
        entity.SkipOnce = true;
    }
    ,
    //得到下一等级积分
    NextLevelScore: function () {
        s = this.level + 1
        return s * s * s;
    }
    ,
    //杀死一个已经存在的物体
    KillEntity: function (entity) {

        if (!entity.OnKill()) {
            console.log("kill canceled")
            return
        }

        if (entity == this.MainEntity) {
            this.Respawn()
        }
        else if (entity.State != $.EntityState.Detached) {
            this.DisposeEntity(entity)
        }
    }
    ,
    //移除一个物体,当元素操作全全都执行完,离开地图时调用
    __remove_entity: function (entity) {

        if (typeof entity === "undefined" || entity == null)
            return

        //到底了
        index = 0;
        //删除元素
        for (index; index < that.entities.length; index++) {
            if (that.entities[index] === entity) {
                that.entities.splice(index, 1)
                break;
            }
        }

        entity.__leaveGame();
    },
    //消除方块,控制下落
    EliminateBlocks: function () {
        //掉落方块们
        if (!that.GetSetting("fall"))
            this.DropParts()

        //一行满了则消除它
        for (var i = 0; i < $.GameMap.defaultOptions.Y_SIZE; i++) {
            var all_block = true

            for (var j = 0; j < $.GameMap.defaultOptions.X_SIZE; j++) {
                if (!ToType(that.map[i][j].Type).IsBlock()) {
                    all_block = false;
                    break;
                }
            }

            if (all_block) {

                this.Bonus("Braaaavo!!", 1)

                this.score += this.GetLineExp()
                //消除一行,并新增一行
                that.map.splice(i, 1)
                row = []
                for (j = 0; j < $.GameMap.defaultOptions.Y_SIZE; j++)
                    row[j] = new $.Block(0);
                that.map.unshift(row)
            }
        }


    }
    //获得消除一行的经验值
    , GetLineExp: function () {
        return this.x_size * this.x_size * $.GameMap.defaultOptions.exp_gain_rate;
    }
    ,
    //重生主物体
    Respawn: function () {

        if (this.GameOver == true) {
            return
        }

        var that = this
        if (that.MainEntity != null)
            if (!that.MainEntity.IsTakeOver())
                that.DisposeEntity(that.MainEntity)
            else {
                that.AddEntity(that.GetRandomEntity())
                return
            }

        that.MainEntity = null

        setTimeout(() => {


            if (typeof that.ReadyEntity === "undefined" || that.ReadyEntity == null) {
                that.ReadyEntity = that.GetRandomEntity()
            }

            //是否提示
            if (!that.GetSetting("inform")) {
                that.ShowMessage(that.ReadyEntity.GetDescription());
            }

            that.MainEntity = that.ReadyEntity;

            that.ReadyEntity = that.GetRandomEntity()


            if (!that.MainEntity.CanMove()) {
                that.GameOver = true
            }
            else {
                this.last_refresh_time = new Date().getTime()
                that.AddEntity(that.MainEntity)
            }


        }, $.GameMap.defaultOptions.respawn_interval);
    },
    //获得随即实体
    GetRandomEntity: function (entities, shapes) {
        var entity = GetRandomEntity(this, entities, shapes)

        entity.X = $.GameMap.defaultOptions.X_SIZE / 2

        while (!(entity.__ready() && entity.GetShape().length <= this.y_size && entity.GetShapeLength() <= this.x_size)) {
            entity = GetRandomEntity(this)
        }
        return entity
    }
    ,
    //重绘方块
    Refresh: function (event) {

        if (this.last_refresh_time == 0)
            this.last_refresh_time = new Date().getTime()

        // console.log("refresh")
        this.DrawBlocks();
        this.DrawEntities();
        this.Refresh2()
        this.ApplyRenderMap();
        CopyTableTo(this.render_map, this.last_map)

        var lag = new Date().getTime() - this.last_refresh_time
        this.rate = 1 / (lag / 1000)
        if (this.min_refresh_rate >= this.rate) {
            this.min_refresh_rate = this.rate
        }
        this.last_refresh_time = new Date().getTime()
    }
    //将要绘制的特效集合
    , EffectList: new Set()
    //添加一个特效
    , AddEffect: function (ef) {
        // new Timer()
        this.EffectList.add(ef)
    }
    ,
    //刷新第二层特效面板
    Refresh2: function () {
        var ctx = this.GetContext2();
        ctx.save();
        $("#panel2").attr("width", this.map_width)
        $("#panel2").attr("height", this.map_height)
        this.DrawLines();
        this.DrawCrosshairs();
        this.DrawReadyEntity();
        this.DrawInfo();
        // this.DrawEffects();
        ctx.restore();
    }
    , __start_draw_effects: function () {
        var that = this
        new $.Timer(function () {

            that.DrawEffects()
        }, 5).Start()
    }
    //绘制特效
    , DrawEffects: function () {
        var ctx = this.GetContext3();
        ctx.save();
        $("#panel3").attr("width", this.map_width)
        $("#panel3").attr("height", this.map_height)
        // ctx.clearRect
        for (const ef of this.EffectList) {

            //如果过期了则移除特效
            if (!ef.IsExpired())
                ef.Paint(ctx)
            else {
                this.EffectList.delete(ef)
            }
        }
        ctx.restore();
    }
    //绘制信息面板
    , DrawInfo: function () {
        // var x_size = $.GameMap.defaultOptions.X_SIZE, y_size = 5;
        // var line_height = 20 / $.GameMap.defaultOptions.block_size
        $("#game_info").css("width", this.read_width)
        var header = $($("#game_info>span").get(0))
        var body = $($("#game_info>span").get(1))
        header.empty();
        body.empty();

        // String()
        add_pair("Score:", "")
        add_pair(
            "<span style='font-size: 30px;'> </span>",
            "<span style='font-size: 30px;'>" + this.score + "</span>")
        add_pair("Level:", this.level)
        add_pair("Next:", this.NextLevelScore())
        add_pair("FPS:", this.rate.toFixed(2))
        add_pair("Min-FPS:", this.min_refresh_rate.toFixed(2))
        add_pair("Blocks:", this.block_count)
        add_pair("Chieves:", "")

        var that = this
        add_bonus(1)
        add_bonus(2)
        add_bonus(3)

        //某个等级的成就情况
        function add_bonus(level) {
            for (const bonus in that.Bonuses) {
                var b = that.Bonuses[bonus]
                if (b.Level == level)
                    add_bonus_pair(bonus)
            }
        }

        //添加成就
        function add_bonus_pair(bonus) {
            var b = that.Bonuses[bonus]
            add_pair(
                "<span style='font-size: " + (4 - b.Level) * 6 + "px;'>" + bonus + "</span>",
                "<span style='font-size: " + (4 - b.Level) * 6 + "px;'>" + "X" + b.Count + "</span>"
            )
        }

        //添加一条信息
        function add_pair(h, b) {
            header.append("<span>" + h + "</span><br>")
            body.append("<span>" + b + "</span><br>")
        }

    }
    //渲染实体和方块
    , ApplyRenderMap: function () {
        this.block_count = 0
        var ctx = this.GetContext1();
        ctx.save();

        for (var i = 0; i < this.render_map.length; i++) {

            for (var j = 0; j < this.render_map[i].length; j++) {
                if (this.render_map[i][j].Type != this.last_map[i][j].Type) {


                    // ctx.fillStyle = TypeToColor(this.render_map[i][j].Type)
                    // this.FillRect(j, i, ctx)

                    t = ToType(this.render_map[i][j].Type)
                    this.FillRect(j, i, ctx, t)

                }

            }
        }
        // this.last_map=CopyTable(this.map)
        ctx.restore();
        ctx.stroke()

    }
    //画刷新率
    , DrawRefreshRate: function () {

    }
    //画分数
    , DrawScore: function () {

    }
    //画下一个物体
    , DrawReadyEntity: function () {
        if (typeof this.ReadyEntity === 'undefined')
            return;
        var block_size = $.GameMap.defaultOptions.block_size;
        var x_size = $.GameMap.defaultOptions.X_SIZE, y_size = $.GameMap.defaultOptions.Y_SIZE;
        var shape = this.ReadyEntity.GetShape()
        ClearShape(this.ready_map)
        // ApplyTableTo(this.ready_map,this.last_map,x_size,0)
        ApplyTableTo(shape, this.ready_map)
        ApplyTableTo(this.ready_map, this.render_map, x_size, 0)
    }
    //获得画布1的ctx
    , GetContext1: function () {
        return this.GetCanvas1().getContext("2d")
    },
    //获得画布2的ctx
    GetContext2: function () {
        return $("#panel2").get(0).getContext("2d")
    },
    //获得画布3的ctx
    GetContext3: function () {
        return $("#panel3").get(0).getContext("2d")
    },
    GetCanvas1: function () {
        return $("#panel1").get(0)
    }
    ,
    GetCanvas3: function () {
        return $("#panel3").get(0)
    }
    //设置正在控制的实体
    , SetMainEntity: function (entity) {
        this.MainEntity = entity;
    },
    //绘制实体
    DrawEntities: function () {
        //实体
        for (var i = 0; i < this.entities.length; i++) {
            entity = this.entities[i]
            var shape = entity.GetShape()

            //实体的影子
            var tmpY = 0
            var draw_shadow = entity == this.MainEntity && entity.HasShadow()

            if (draw_shadow)
                while (entity.CanGo(0, tmpY)) {
                    tmpY++;
                }

            try {
                for (j = 0; j < shape.length; j++)
                    for (k = 0; k < shape[j].length; k++) {
                        block = shape[j][k]

                        if (block.Type != 0) {
                            if (ToType(this.render_map[entity.Y + j][entity.X + k].Type).GetRenderIndex() <= ToType(block.Type).GetRenderIndex())
                                this.render_map[entity.Y + j][entity.X + k].Type = block.Type
                        }

                        if (draw_shadow)
                            if (tmpY > shape.length && block.Type != 0) {
                                var clone = Object.assign(new $.Type(), ToType(block.Type))
                                clone.is_block = false;
                                this.render_map[entity.Y + tmpY - 1 + j][entity.X + k].Type = new $.OpacityType(clone, 0.3)
                            }
                    }


            } catch (error) {
                console.log("shape has changed")
            }


        }

    },


    //添加一个实体
    AddEntity: function (entity) {
        this.entities.push(entity)

        entity.__comeIntoGame();

    },


    //绘制地面
    DrawBlocks: function () {

        this.block_count = 0
        var ctx = this.GetContext1();
        ctx.save();

        for (i = 0; i < $.GameMap.defaultOptions.Y_SIZE; i++) {
            for (j = 0; j < $.GameMap.defaultOptions.X_SIZE; j++) {
                this.render_map[i][j].Type = this.map[i][j].Type
                if (this.map[i][j].Type != 0)
                    this.block_count++;
            }
        }
        // this.last_map=CopyTable(this.map)
        ctx.restore();
        ctx.stroke()
    },
    //填充某一个方格
    FillRect: function (x, y, ctx, type) {
        block_size = $.GameMap.defaultOptions.block_size
        type.Paint(ctx, x * block_size, y * block_size, block_size, block_size)

    },
    //在某个格子画字符串
    DrawString: function (x, y, str) {
        var ctx = this.GetContext2();
        var block_size = $.GameMap.defaultOptions.block_size
        ctx.textBaseline = "top";
        ctx.fillStyle = "black";
        ctx.fillText(
            str,
            x * block_size,
            y * block_size);
        ctx.stroke();
    },
    //绘制表格
    DrawLines: function () {
        var current_x = 0, current_y = 0, block_size = $.GameMap.defaultOptions.block_size, x_size = $.GameMap.defaultOptions.X_SIZE, y_size = $.GameMap.defaultOptions.Y_SIZE;

        // //绘制表
        var width = this.real_map_width
        var height = this.map_height
        var ctx = this.GetContext2();
        ctx.strokeStyle = "black"
        //是否画网格
        if (that.GetSetting("web")) {

            i = 0
            for (; i < x_size; i++) {
                current_x = $.GameMap.defaultOptions.block_size * (i + 1.0)
                ctx.moveTo(current_x + 0.5, 0);
                ctx.lineTo(current_x + 0.5, height);
                ctx.stroke();
            }

            i = 0
            for (; i < y_size; i++) {
                current_y = $.GameMap.defaultOptions.block_size * (i + 1.0)
                ctx.moveTo(0 + 0.5, current_y);
                ctx.lineTo(width + 0.5, current_y);
                ctx.stroke();
            }

        }
        else {
            //画边界线
            ctx.moveTo(width, 0);
            ctx.lineTo(width, height);
            ctx.stroke()
        }

    }

    //画准星线
    , DrawCrosshairs: function () {

        if (IsNullOrUndefined(this.MainEntity) || !this.MainEntity.HasShadow())
            return
        var current_x = 0, current_y = 0, block_size = $.GameMap.defaultOptions.block_size, x_size = $.GameMap.defaultOptions.X_SIZE, y_size = $.GameMap.defaultOptions.Y_SIZE;

        // //绘制表
        // var width = x_size * block_size
        // var height = this.element.attr('height')

        var ctx = this.GetContext2();

        try {
            x = this.MainEntity.X
        } catch (error) {
            return
        }

        var x = this.MainEntity.X
        var y = this.MainEntity.Y
        var shape = this.MainEntity.GetShape();
        var bounds = this.MainEntity.GetBounds();
        var max_length = shape[0].length
        var left = bounds.left
        var top1 = bounds.top1
        var top2 = bounds.top2
        var len = bounds.len

        var max_length = len;

        x = x + left
        ctx.setLineDash([2, 5]);
        ctx.strokeStyle = "#FFC661"
        ctx.beginPath();
        current_x = x * block_size
        current_y = (y + top1) * block_size

        ctx.moveTo(current_x + 1, current_y);
        ctx.lineTo(current_x + 1, this.map_height);

        current_x = (x + max_length) * block_size
        current_y = (y + top2) * block_size
        ctx.moveTo(current_x + 1, current_y);
        ctx.lineTo(current_x + 1, this.map_height);
        ctx.stroke();
    },
    //判断某个坐标是否越界
    OutOfBounds: function (to_x, to_y) {

        if (to_x < 0 || to_x >= $.GameMap.defaultOptions.X_SIZE) {
            return true;
        }

        if (to_y < 0 || to_y >= $.GameMap.defaultOptions.Y_SIZE) {
            return true;
        }

        return false
    },
    //isNeed 所需方块的判断条件,传入的参数是block,和参数args
    //从地图上获得满足条件的一部分
    //on_ground储存已经确定被排除的部分
    //visited 本次已经访问过的部分
    GetPart: function (x, y, isNeed, blocks, visited, on_ground) {
        if (typeof visited === "undefined") {
            visited = new Set()
        }

        if (typeof on_ground === "undefined") {
            on_ground = new Set()
        }

        var map = this.map
        var game_map = this
        if (typeof blocks === "undefined") {
            blocks = new Array($.GameMap.defaultOptions.Y_SIZE)
            //重新封装map
            for (i = 0; i < $.GameMap.defaultOptions.Y_SIZE; i++) {
                blocks[i] = new Array($.GameMap.defaultOptions.X_SIZE)
                for (j = 0; j < $.GameMap.defaultOptions.X_SIZE; j++) {
                    blocks[i][j] = {
                        X: j,
                        Y: i,
                        Type: this.map[i][j].Type
                    }
                }
            }
        }

        return {
            part: get_part_and_visit(x, y),
            visited: visited,
            blocks: blocks
        }
        //获得一个部分
        function get_part_and_visit(x, y) {
            var first = blocks[y][x]
            var wait = []
            var parts = []

            if (
                !isNeed(blocks[y][x], { Part: parts }) ||
                visited.has(blocks[y][x])) {
                return [];
            }

            //访问一个坐标的块块
            function visit(x, y, from) {
                var args = { Cancel: false, Part: parts }
                if (game_map.OutOfBounds(x, y) || !isNeed(blocks[y][x], args)) {
                    return args
                }

                if (!visited.has(blocks[y][x])) {
                    wait.push(blocks[y][x])
                    visited.add(blocks[y][x])
                }
                else if
                    (on_ground.has(blocks[y][x])) {
                    //不动的方块

                    for (const b of parts.splice(0, parts.length)) {
                        visited.add(b)
                        on_ground.add(b)
                    }
                    ;
                }

                return args
            }


            wait.push(first)
            visited.add(first)
            if (on_ground.has(first)) {
                return []
            }
            while (wait.length != 0) {
                one = wait[0]
                var x = one.X
                var y = one.Y
                parts.push(one)

                //如果访问被取消(在args里面cancel被设置为true)则立刻返回
                if (!visit_four(one)) {
                    return parts
                }
                // var args=visit(x, y - 1, one)

                // args=visit(x, y + 1, one)
                // args=visit(x - 1, y, one)
                // args=visit(x + 1, y, one)

                shifed = wait.shift()
            }


            return parts;

            //访问一个点的四个不同方向
            function visit_four(one) {
                var point = [
                    [0, 1],
                    [0, -1],
                    [1, 0],
                    [-1, 0]
                ]
                for (const p of point) {
                    args = visit(one.X + p[0], one.Y + p[1], one)
                    if (args.Cancel)
                        return false
                }
                return true
            }
        }
    },
    //截图
    Capture: function (name) {

        exportCanvasAsPNG("game_panel", "image/" + name + ".png")
        function exportCanvasAsPNG(id, fileName) {

            var canvasElement = document.getElementById(id);

            var MIME_TYPE = "image/png";

            var imgURL = canvasElement.toDataURL(MIME_TYPE);

            var dlLink = document.createElement('a');
            dlLink.download = fileName;
            dlLink.href = imgURL;
            dlLink.dataset.downloadurl = [MIME_TYPE, dlLink.download, dlLink.href].join(':');

            document.body.appendChild(dlLink);
            dlLink.click();
            document.body.removeChild(dlLink);
        }

    },
    //执行一次坠落过程,频繁调用将导致卡顿
    DropParts: function () {
        var isNeed = function (b, args) {

            if (IsNullOrUndefined(args) || IsNullOrUndefined(args.Part) || args.Part.length == 0)
                return ToType(b.Type).IsDropping()

            if (!ToType(args.Part[0].Type).IsBlock()) {
                args.Cancel = true
                return false
            }

            return ToType(b.Type).IsBlock()
            // if(!IsNullOrUndefined(args)&&args.Part.length>0)
            // {
            //     if(!ToType(args.Part[0].Type).IsBlock()){
            //         args.Cancel=true
            //     }else if(!ToType(b.Type).IsBlock()){
            //         return false
            //     }
            // }
            //搜索需要掉路的块块
            // return ToType(b.Type).IsDropping()
        }

        var ret = this.GetPart(0, 0, isNeed)
        var visited = ret.visited
        var map = this.map
        var game_map = this
        var blocks = ret.blocks
        var recheck = []
        var totol_drops = 0
        var block_count = 0
        var wait_to_check = []
        var that = this
        var last_visited = null;
        var on_ground = new Set()

        //从底到顶找黑方块
        for (i = $.GameMap.defaultOptions.Y_SIZE - 1; i >= 0; i--) {
            for (j = 0; j < $.GameMap.defaultOptions.X_SIZE; j++) {
                var b = blocks[i][j]
                if (isNeed(b) && !visited.has(b)) {
                    wait_to_check.push(b)
                }
            }
        }
        var sum = 0
        var count = 1
        do {

            while (recheck.length > 0) {
                rb = recheck.shift()
                rb.Type = this.map[rb.Y][rb.X].Type;
                wait_to_check.push(rb)
            }

            while (wait_to_check.length > 0) {
                var b = wait_to_check.shift();
                if (b.X == 5 && b.Y == 75) {
                    //console.log("here comes the point")
                }
                if (b.Type == 0)
                    continue;
                // //console.log("b:" + b.X + "," + b.Y + " Type:" + b.Type + " InVisited:" + visited.has(b))
                var part = this.GetPart(b.X, b.Y, isNeed, blocks, visited, on_ground).part

                var buttoms = get_bottom(part);
                var droped = drop_part(part, buttoms)

                // console.log(droped.length)

                block_count += part.length
                totol_drops += droped.length
                sum += droped.length
                for (const ib of droped) {
                    {
                        recheck.push(ib)
                    }
                }

            }

            block_count = 0
            totol_drops = 0
            //console.log("loop count:" + count)
            count++;

        } while (recheck.length > 0)
        if (sum > 0) {
            that.EffectPlayer.PlayDebris();
        }

        if (sum >= 500) {
            that.Bonus("过河拆桥", 1)
        }

        // console.log("drop parts:"+sum)
        function drop_part(part, bottom) {
            var min_len = $.GameMap.defaultOptions.Y_SIZE
            var to = []

            if (bottom.length == 0) {
                bottom = part
            }
            //获得里底部最近的块块
            for (const b of bottom) {
                var dis = 0
                var tmpy = b.Y + 1
                while (tmpy < $.GameMap.defaultOptions.Y_SIZE) {
                    if (!ToType(blocks[tmpy][b.X].Type).IsBlock()) {
                        tmpy++;
                        dis++;
                        continue
                    } else {
                        break;
                    }
                }

                if (min_len > dis) {
                    min_len = dis
                }
            }
            var visit_id = 0


            if (part.length == 0)
                return to

            if (min_len != 0) {
                sum += part.length

            }

            var isOnGround = false

            //判断块块是否掉到底部
            for (const b of bottom) {
                if (b.Y + min_len == $.GameMap.defaultOptions.Y_SIZE - 1) {
                    isOnGround = true
                    break
                }
            }

            if (!isOnGround)
                for (const b of bottom) {
                    if ((b.Y + min_len + 1) < $.GameMap.defaultOptions.Y_SIZE && on_ground.has(blocks[b.Y + min_len + 1][b.X])) {
                        isOnGround = true
                        break;
                    }
                }

            //如果不是掉到底部则继续监视
            if (isOnGround) {
                for (const b of part) {
                    tb = blocks[b.Y + min_len][b.X]

                    if (ToType(tb.Type).IsBlock())
                        on_ground.add(tb)
                }
            }
            else {
                for (const b of part) {
                    tb = blocks[b.Y + min_len][b.X]

                    to.push(tb)
                }
            }

            if (min_len == 0 || min_len == $.GameMap.defaultOptions.Y_SIZE)
                return to

            var count = 0
            //集体下落
            for (const b of part) {
                tb = blocks[b.Y + min_len][b.X]
                if (tb == b)
                    count++
            }

            //把原来的visited从里删除
            for (const b of part) {
                count += visited.delete(b)
            }

            //集体下落
            for (const b of part) {
                map[b.Y][b.X].Type = 0
            }

            var erase_count = 0
            for (const b of part) {

                map[b.Y + min_len][b.X].Type = blocks[b.Y][b.X].Type;
            }

            //更新blocks
            for (const b of part) {
                blocks[b.Y][b.X].Type = map[b.Y][b.X].Type
                blocks[b.Y + min_len][b.X].Type = map[b.Y + min_len][b.X].Type
            }


            return to
        }

        //获得一个部分的底部线
        function get_bottom(part) {
            var bottom = []
            for (const b of part) {
                // if(!ToType(b.Type).IsBlock())
                // {
                //     continue
                // }
                if ((b.Y + 1 >= $.GameMap.defaultOptions.Y_SIZE) || !ToType(blocks[b.Y + 1][b.X].Type).IsBlock()) {
                    var islowest = true
                    for (const ob of part) {
                        if (ob.X == b.X && ob.Y > b.Y)
                            islowest = false
                    }
                    if (islowest)
                        bottom.push(b)
                }
            }

            return bottom
        }
    }
};

// }(jQuery));

