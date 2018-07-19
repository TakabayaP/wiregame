//app.currentSceneだよ!!!
phina.globalize();
const Assets = {
    images:{
    },
    FPS:60,
    AoG:5,//Acceleration of gravity,
    wPower:6,
    maxSpeed:1,
    milPerFrame:1/60,//FPS
    playerMoveInterval:0.3,
    screenWidth:1024,
    screenHeight:1024,
    mapChipAdd:1.5,
    maps:{
        map1:{
            mapHeight:10,
            mapWidth:10,
            mapChipSize:1024/5,
            main:[
                [1,1,1,1,1,1,1,1,1,1,],
                [1,0,1,0,0,0,1,0,0,1,],
                [1,0,1,0,1,0,1,0,0,1,],
                [1,0,1,0,0,0,1,0,0,1,],
                [1,0,0,0,1,1,0,0,0,1,],
                [1,0,1,0,1,0,0,1,0,1,],
                [1,0,1,0,0,0,1,1,0,1,],
                [1,0,1,1,1,0,1,1,0,1,],
                [1,0,0,0,1,0,0,1,0,1,],
                [1,1,1,1,1,1,1,1,1,1,],]
        }
    }
};

const Scenes = [{
    label: "test",
    className: "TestScene",
}];

function error(message){
    throw new Error(message);
}

function TrianglePointCollision(ax,ay,bx,by,cx,cy,px,py){//in triangle's each vertex's coordinate and the coordinate of the point
    let a = new Vector2(bx-ax,by-ay).cross(new Vector2(px-bx,py-by)),
    b = new Vector2(cx-bx,cy-by).cross(new Vector2(px-cx,py-cy)),
    c = new Vector2(ax-cx,ay-cy).cross(new Vector2(px-ax,py-ay));
    //console.log(a,b,c);
    return a<=0 &&
    b<=0 &&
    c<=0;
}//out boolean is point in or out of the triangle

function RectanglePointWay(ax,ay,bx,by,cx,cy,dx,dy,px,py){//in a d rectangle's each vertex's coordinate and the coordinate of the point
    let ex = ax + (dx-ax)/2,ey = ay + (by-ay)/2;          //   b c
    let a = (new Vector2(bx-ax,by-ay).cross(new Vector2(px-ax,py-ay))<0?"-":"+")+
    (new Vector2(ex-ax,ey-ay).cross(new Vector2(px-ex,py-ey))<0?"-":"+")+
    (new Vector2(ex-bx,ey-by).cross(new Vector2(px-bx,py-by))<0?"-":"+");
    //console.log(a);
    return (a==="+--"||a==="---")?"up":(a==="+-+"||a==="--+"?"right":(a==="-++"||a==="+++"?"down":(a==="++-"||a==="-+-"?"left":"error")));
}//out boolean way 
phina.define("TestScene", {
    superClass: "DisplayScene",
    init: function (options) {
        this.superInit(options);
        this.backgroundColor = 'black';
        this.mapName = "map1";
        this.group = DisplayElement().addChildTo(this).setPosition(0,0);
        this.group.move = function(x,y){
            for(let i in this.children){
                this.children[i].x -= x;
                this.children[i].y -= y;
            }
        };
        let self = this;
        this.group.setMapPosition = function(x,y){
            console.log(this.children[0].x,this.children[0].y);
            this.mapChipSize = Assets.maps[self.mapName].mapChipSize;
            this.move(this.children[0].x-(3.5-x)*this.mapChipSize,this.children[0].y - (3.5-x)*this.mapChipSize); 
        }
        ;
        this.group.ax = 0;
        this.group.ay = 0;
        MyMap(this.mapName).generate(this.group);
        this.player = Playert().addChildTo(this).setPosition(this.gridX.center(),this.gridY.center());
        this.group.setMapPosition(2,2);
    },
    update: function (app) {
        this.onpointstart = function(e){
            this.player.canMove = Assets.milPerFrame*(app.frame-this.player.moveCounter)>=Assets.playerMoveInterval;
            if(this.player.canMove){
                this.group.ay *= this.group.ay<0?0:1;
                this.group.ax = -Math.cos(Math.atan2(e.pointer.y-this.player.y,e.pointer.x-this.player.x)+Math.PI)*Assets.wPower;
                this.group.ay = -Math.sin(Math.atan2(e.pointer.y-this.player.y,e.pointer.x-this.player.x)+Math.PI)*Assets.wPower;
                this.player.moveCounter = app.frame;
        }
        };
        this.group.move(this.group.ax,this.group.ay);
        this.group.ay += this.group.ay>this.player.maxSpeed?0:Assets.AoG/Assets.FPS;
        this.group.ay *= this.group.ay>this.player.maxSpeed?0.95:1;
        this.group.ax *= Math.abs(this.group.ax)>this.player.maxSpeed?0.95:0.995;
    }
});
phina.define("MyMap",{
    init:function(mapName){
        this.map = Assets.maps[mapName];
    },
    generate:function(parent){
        for(let y in this.map.main){
            for(let x in this.map.main[y]){
                MapChip(this.map.main[y][x],this.map.mapChipSize).addChildTo(parent).setPosition(this.map.mapChipSize*x,this.map.mapChipSize*y);
            }
        }
    }
});
function MapChip(mapChipNo,size){
    if(mapChipNo === 0)return ImageObject({width:size,height:size});
    if(mapChipNo === 1)return Ground({width:size,height:size});
}

phina.define("ImageObject",{
    superClass:"RectangleShape",
    init:function(options){
        options = (options || {}).$safe(Ground.defaults);
        this.superInit(options);
        this.fill = "yellow";
        this.strokeWidth = 0;
        this.width = options.width + Assets.mapChipAdd;
        this.height = options.height + Assets.mapChipAdd;
    }
});
phina.define("Ground",{
    superClass:"RectangleShape",
    init:function(options){
        options = (options || {}).$safe(Ground.defaults);
        this.superInit(options);
       
        this.width = options.width + Assets.mapChipAdd;
        this.height = options.height + Assets.mapChipAdd;
        this.strokeWidth = 0;
        this.staticFriction = options.staticFriction;
        this.dynamicFriction = options.dynamicFriction;
        this.bounce = options.bounce;
        this.minBounce = options.minBounce;
    },
    update:function(app){
        if(app.frame === 0){
            this.group = app.currentScene.group?app.currentScene.group:error("Group is not defined");
            this.player = app.currentScene.player?app.currentScene.player:error("Player is not defined");
        }
        if(this.hitTestElement(this.player)){
            let way = RectanglePointWay(this.left,this.top,this.left,this.bottom,this.right,this.bottom,this.right,this.up,this.player.top + (this.player.bottom-this.player.top)/2,this.player.left+(this.player.right-this.player.left)/2);
            if(way === "up"){
                this.group.move(0,this.top-this.player.bottom);
                this.group.ay *= this.group.ay>this.minBounce?-this.bounce:0;
                this.group.ax *= Math.abs(this.group.ax)>this.staticFriction?this.dynamicFriction:0;
            }else if(way === "down"){
                this.group.move(0,this.bottom-this.player.top);
                this.group.ay *= -this.bounce;
                this.group.ax *= Math.abs(this.group.ax)>this.staticFriction?this.dynamicFriction:0;
            }else if(way === "right"){
                this.group.move(this.right-this.player.left,0);
                this.group.ay *= this.dynamicFriction;
                this.group.ax *= -this.bounce;
            }else if(way === "left"){
                this.group.move(this.left-this.player.right,0);
                this.group.ay *= this.dynamicFriction;
                this.group.ax *= -this.bounce;
            }else if(way === "error"){
                console.log("Error at RectanglePointWay.Trying collision again.");
            }

        }
    },
    _static:{
        defaults:{
            staticFriction:0.7,
            dynamicFriction:0.4,
            bounce:0.3,
            minBounce:0.1,
        }
    }
});
phina.define("Playert",{
    superClass:"CircleShape",
    init:function(options){
        this.superInit(options);
        this.maxSpeed = Assets.maxSpeed;
        this.canMove = true;
        this.moveCounter = 0;
    },
    update:function(app){
    },
});
phina.main(function () {
    var app = GameApp({
        startLabel: 'test',
        //assets:Assets,
        width: Assets.screenWidth,
        height: Assets.screenHeight,
        scenes: Scenes,
    });
    app.fps = Assets.FPS;
    app.run();
});