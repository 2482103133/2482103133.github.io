
function GetRandomShape(shapes) {
    var shapes = IsNullOrUndefinedThenDefault(shapes, ShapeList)
    return StraitenShape(shapes[Math.floor(Math.random() * shapes.length)])
}
function GetRandomInt(ceiling, floor) {
    var floor = IsNullOrUndefinedThenDefault(floor, 0)

    return Math.floor(Math.random() * (ceiling - floor)) + floor
}

function GetRandomEntity(map, entities, shapes) {
    entities = IsNullOrUndefinedThenDefault(entities, EntityList)

    //随机类型
    var entity_func = entities[Math.floor(Math.random() * entities.length)]

    //随机形状
    var shape = GetRandomShape(shapes);
    //创建对象
    var entity = new entity_func(0, 0, $.CreateShape(2, shape), map)

    return entity
}

function CopyTable(table) {

    var newArray = [];

    for (const row of table) {
        var newrow = []
        for (const block of row) {
            newrow.push(new $.Block(block.Type))
        }
        newArray.push(newrow)
    }
    return newArray

}

function ClearShape(shape) {

    for (const row of shape) {
        for (let i = 0; i < row.length; i++) {
            const b = row[i];
            b.Type = 0
        }
    }
}

var __next_objid = 1;
function objectId(obj) {
    if (obj == null) return null;
    if (obj.__obj_id == null) obj.__obj_id = __next_objid++;
    return obj.__obj_id;
}

function CreateShape(X, Y, type) {
    var map = new Array(Y)
    for (i = 0; i < Y; i++) {
        row = new Array(X)
        for (j = 0; j < X; j++)
            row[j] = new $.Block(type);
        map[i] = row
    }
    return map

}


function CreateEmptyShape(X, Y) {
    return CreateShape(X, Y, 0)
}

function CopyTableTo(table, totable) {

    for (let i = 0; i < table.length; i++) {
        const row = table[i];
        for (let j = 0; j < row.length; j++) {
            const b = row[j];
            totable[i][j].Type = table[i][j].Type
        }

    }
}
function IsNullOrUndefined(obj) {
    return obj == null || typeof obj === "undefined"
}
function IsNullOrUndefinedThenDefault(obj, def) {
    if (IsNullOrUndefined(obj)) {
        return def
    }
    return obj
}
function ApplyTableTo(table, totable, X, Y) {
    if (IsNullOrUndefined(X)) {
        X = 0
    }
    if (IsNullOrUndefined(Y)) {
        Y = 0
    }

    for (let i = 0; i < table.length; i++) {
        const row = table[i];
        if (totable.length <= i)
            break;

        for (let j = 0; j < row.length; j++) {
            const b = row[j];
            if (totable[i + Y].length <= j)
                break;

            totable[i + Y][j + X].Type = table[i][j].Type
        }

    }
}
//保证返回的Shape没有开头结尾空行空列的
function StraitenShape(shape) {

    //trim top
    while (shape.length > 0) {
        const row = shape[0];
        if (!isLineAllAir(row)) {
            break
        } else {
            shape.shift()
        }
    }

    //trim bottom
    while (shape.length > 0) {
        const row = shape[shape.length - 1];
        if (!isLineAllAir(row)) {
            break
        } else {
            shape.pop()
        }
    }

    //trim left
    for (let index = 0; index < getMaxCount(shape); index++) {
        if (isColAllAirOrBlank(shape, index)) {
            spliceColumn(shape, index)
        }
        else {
            break
        }

    }

    //trim right
    for (let index = getMaxCount(shape) - 1; index >= 0; index--) {
        if (isColAllAirOrBlank(shape, index)) {
            spliceColumn(shape, index)
        }
        else {
            break
        }
    }

    return shape


    function isLineAllAir(line) {

        for (const b of line) {
            if (typeof b.Type === "undefined") {
                if (b != 0) {
                    return false
                }
            }
            else {
                if (b.Type != 0) {
                    return false
                }
            }

        }
        return true
    }
    function isColAllAirOrBlank(matrix, index) {

        for (const row of matrix) {
            if (row.length <= index) {
                continue
            }
            else if (row[index] != 0 || (typeof row[index].Type !== "undefined" && row[index].Type != 0))
                return false
        }
        return true

    }
    function spliceColumn(matrix, index) {
        for (const row of matrix) {
            if (row.length <= index) {
                continue
            }
            else
                row.splice(index, 1)
        }
    }

    function getMaxCount(matrix) {
        var max = 0
        for (const row of matrix) {
            if (row.length > max) { max = row.length }
        }
        return max
    }

}

function twoPointDistance(x1, y1, x2, y2) {
    let dep = Math.sqrt(Math.pow((x1 - x2), 2) + Math.pow((y1 - y2), 2));
    return dep;
}
//获得浏览器宽度
function getWidth() {
    return window.innerWidth
        || document.documentElement.clientWidth
        || document.body.clientWidth
        || 0;
}

//获得浏览器高度
function getHeight() {
    return window.innerHeight
        || document.documentElement.clientHeight
        || document.body.clientHeight
        || 0;
}


var first_resize = true
var ratio = 1
//自动调整大小
function Resize() {

    if (first_resize) {
        first_resize = false
        ratio = 2
        $("#shell").get(0).style.transform = "scale(" + ratio + "," + ratio + ")"
    }
    // $("#shell").get(0).style.zoom=ratio
    var width = getWidth()
    var height = getHeight()
    var rect = $("#shell").get(0).getBoundingClientRect();

    if (rect.left < 0 || rect.top < 0 || (rect.left + rect.width) >= width || (rect.top + rect.height) >= height) {
        ratio -= 0.01
        $("#shell").get(0).style.transform = " translate(-50%,-50%) scale(" + ratio + "," + ratio + ") "
        setTimeout(Resize, 0)

    }
    else {
        first_resize = true
    }
    return
}

//判断是否是手机端
function IsMobilePhone() {
    var sUserAgent = navigator.userAgent;
    return sUserAgent.indexOf('Android') > -1 || sUserAgent.indexOf('iPhone') > -1 || sUserAgent.indexOf('iPad') > -1 || sUserAgent.indexOf('iPod') > -1 || sUserAgent.indexOf('Symbian') > -1
};

//全屏显示
function full(ele) {
    if (ele.requestFullscreen) {
        ele.requestFullscreen();
    } else if (ele.mozRequestFullScreen) {
        ele.mozRequestFullScreen();
    } else if (ele.webkitRequestFullscreen) {
        ele.webkitRequestFullscreen();
    } else if (ele.msRequestFullscreen) {
        ele.msRequestFullscreen();
    }
}

//下载某一文本
function download(filename, text) {
    var pom = document.createElement('a');
    pom.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    pom.setAttribute('download', filename);

    if (document.createEvent) {
        var event = document.createEvent('MouseEvents');
        event.initEvent('click', true, true);
        pom.dispatchEvent(event);
    } else {
        pom.click();
    }
}








