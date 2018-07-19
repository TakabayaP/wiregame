phina.globalize();
const Assets = {
    images:{
    },
    FPS:60,
    AoG:5,//Acceleration of gravity,
    wPower:20,//6,
    maxSpeed:1,
    milPerFrame:1/60,//FPS
    playerMoveInterval:0,//.5,
    screenWidth:1024,
    screenHeight:1024,
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
var NowScene;

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
        NowScene = this;
        this.backgroundColor = 'black';
        this.player = Playert().addChildTo(this).setPosition(this.gridX.center(),this.gridY.center());
        this.group = DisplayElement().addChildTo(this).setPosition(0,0);
        this.group.move = function(x,y){
            for(let i in this.children){
                this.children[i].x -= x;
                this.children[i].y -= y;
            }
        }; 
        this.group.ax = 0;
        this.group.ay = 0;
        MyMap("map1").generate(this.group);
        /*Ground({player:this.player,group:this.group}).addChildTo(this.group).setPosition(this.gridX.center(),this.gridY.center(5));//span(15));
        Ground({player:this.player,group:this.group}).addChildTo(this.group).setPosition(this.gridX.center(14),this.gridY.center(-2));
        Ground({player:this.player,group:this.group}).addChildTo(this.group).setPosition(this.gridX.center(30),this.gridY.center(-2));
        Ground({player:this.player,group:this.group}).addChildTo(this.group).setPosition(this.gridX.center(14),this.gridY.center(-6));*/
    },
    update: function (app) {
        this.onpointstart = function(e){
            //this.player.move(e);
            this.player.canMove = Assets.milPerFrame*(app.frame-this.player.moveCounter)>=Assets.playerMoveInterval;
            console.log(Assets.milPerFrame*(app.frame-this.player.moveCounter));
            if(this.player.canMove){
                this.group.ay *= this.group.ay<0?0:1;
                this.group.ax = -Math.cos(Math.atan2(e.pointer.y-this.player.y,e.pointer.x-this.player.x)+Math.PI)*Assets.wPower;
                this.group.ay = -Math.sin(Math.atan2(e.pointer.y-this.player.y,e.pointer.x-this.player.x)+Math.PI)*Assets.wPower;
                this.player.moveCounter = app.frame;
        }
        };
        //this.group.x += this.ax;
        //this.group.y +=this.ay;
        this.group.move(this.group.ax,this.group.ay);//(function(ax,pmx){return Math.abs(ax)>pmx?ax:0;})(this.group.ax,this.player.maxSpeed),this.group.ay);
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
                /*Ground({
                    width:this.map.mapChipSize,
                    height:this.mapChipSize,
                }).addChildTo();*/
                console.log("Gen");
                if(this.map.main[y][x]!==0)MapChip(this.map.main[y][x],this.map.mapChipSize).addChildTo(parent).setPosition(this.map.mapChipSize*x,this.map.mapChipSize*y);
            }
        }
    }
});
function MapChip(mapChipNo,size){
    //if(mapChipNo === 0)return ImageObject({})
    if(mapChipNo === 1)return Ground({width:size,height:size});
}

phina.define("ImageObject",{
    superClass:"RectangleShape",
    init:function(options){
        options = (options || {}).$safe(Ground.defaults);
        this.superInit(options);
        this.color = "yellow";
    }
})
phina.define("Ground",{
    superClass:"RectangleShape",
    init:function(options){
        options = (options || {}).$safe(Ground.defaults);
        this.superInit(options);
        this.group = NowScene.group?NowScene.group:error("Group is not defined");
        this.player = NowScene.player?NowScene.player:error("Player is not defined");
        this.width = options.width;
        this.height = options.height;
        this.staticFriction = options.staticFriction;
        this.dynamicFriction = options.dynamicFriction;
        this.bounce = options.bounce;
        this.minBounce = options.minBounce;
    },
    update:function(app){
        if(this.hitTestElement(this.player)){
            //console.log(this.y)//this.group.y-this.player.y;
            /*this.group.move(0,-this.top+this.player.bottom);
            this.group.ay *= this.group.ay<this.minBounce?this.bounce:0;
            this.group.ax *= Math.abs(this.group.ax)>this.staticFriction?this.dynamicFriction:0;*/
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
        /*this.ax = 0;
        this.ay = 0;*/
    },
    /*move:function(e){
        this.ay *= this.ay>0?0:1;
        this.ax = -Math.cos(Math.atan2(e.pointer.y-this.y,e.pointer.x-this.x)+Math.PI)*Assets.wPower;
        this.ay = -Math.sin(Math.atan2(e.pointer.y-this.y,e.pointer.x-this.x)+Math.PI)*Assets.wPower;
        
    },*/
    update:function(app){/*
        this.x += this.ax;
        this.y +=this.ay;
        this.ay += Assets.AoG/Assets.FPS;*/
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