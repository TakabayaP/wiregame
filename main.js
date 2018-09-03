phina.globalize();
const Assets = {
    images:{
    },
    FPS:60,
    AoG:30,//Acceleration of gravity,
    wPower:7,
    wSpeed:1,
    wLength:Math.sqrt((500**2)*2),
    maxSpeed:20,
    milPerFrame:1/60,//FPS
    playerMoveInterval:0.1,
    screenWidth:1024,
    screenHeight:1024,
    mapChipAdd:1.5,
    maps:{
        map1:{
            mapChipSize:1024/5,
            main:[
                [1,1,1,1,1,1,1,1,1,1,],
                [0,0,1,0,0,0,1,0,0,1,],
                [1,0,1,0,1,0,1,0,0,1,],
                [1,0,1,0,0,0,1,0,0,1,],
                [1,0,0,0,1,1,0,0,0,1,],
                [1,0,1,0,1,0,0,1,0,1,],
                [1,0,1,0,0,0,1,1,0,1,],
                [1,0,1,1,1,0,1,1,0,1,],
                [1,0,0,0,0,0,0,0,0,1,],
                [1,1,1,1,1,1,1,1,1,1,],],
            objects:[
                ["coin",2,2]
            ]
        },
        map2:{
            mapChipSize:1024/14
        }
    }
};

const Scenes = [{
    label: "test",
    className: "TestScene",
}];


phina.define("TestScene", {
    superClass: "DisplayScene",
    init: function (options) {
        this.superInit(options);
        this.backgroundColor = 'black';
        this.mapName = "map1";
        let self = this;
        this.gravity = Assets.AoG/Assets.FPS;
        this.mapGroup = DisplayElement().addChildTo(this).setPosition(0,0);
        this.objectGroup = DisplayElement().addChildTo(this).setPosition(0,0);
        this.objectGroup.move = function(x,y){
            for(let i in this.children){
                this.children[i].x -= x;
                this.children[i].y -= y;
            }
        }
        this.mapGroup.move = function(x,y){
            for(let i in this.children){
                this.children[i].x -= x;
                this.children[i].y -= y;
            }
            self.whx -=x;
            self.why -=y;
            self.objectGroup.move(x,y);
        };
        this.mapGroup.setMapPosition = function(x,y){
            this.mapChipSize = Assets.maps[self.mapName].mapChipSize;
            this.move(this.children[0].x-(3.5-x)*this.mapChipSize,this.children[0].y - (3.5-x)*this.mapChipSize); 
        };
        let elem = PlainElement({
            x:this.gridX.center(),
            y:this.gridY.center(),
            width:Assets.screenWidth,
            height:Assets.screenHeight,
        }).addChildTo(this);
        this.ctx = elem.canvas;
        this.ctx.strokeStyle = "#000000";
        this.ctx.lineWidth = 3;
        this.ctx.fillStyle = "rgba(0,0,0,0)";
        this.whx = 0;
        this.why = 0;
        this.mapGroup.ax = 0;
        this.mapGroup.ay = 0;
        MyMap(this.mapName).generateMap(this.mapGroup);
        this.player = Playert().addChildTo(this).setPosition(this.gridX.center(),this.gridY.center());
    },
    update: function (app) {
        this.onpointstart = function(e){//↓ウンコード
            let w = wireCollision({sx:this.gridX.center(),sy:this.gridY.center(),fx:test(e.pointer.x,e.pointer.y,this.gridX.center(),this.gridY.center(),Assets.wLength).x,fy:test(e.pointer.x,e.pointer.y,this.gridX.center(),this.gridY.center(),Assets.wLength).y},this.mapGroup.children,Assets.maps[this.mapName].mapChipSize);
            this.player.canMove = Assets.milPerFrame*(app.frame-this.player.moveCounter)>=Assets.playerMoveInterval&&w;
            if(this.player.canMove){
                this.whx = w.x;
                this.why = w.y;//ワイヤーのアンカーポイント
                this.mapGroup.moveWX = Math.cos(Math.atan2(e.pointer.y-this.player.y,e.pointer.x-this.player.x)+Math.PI)*Assets.wPower;
                this.mapGroup.moveWY = Math.sin(Math.atan2(e.pointer.y-this.player.y,e.pointer.x-this.player.x)+Math.PI)*Assets.wPower;
                this.mapGroup.ay *= Math.sign(e.pointer.y-this.player.y)===Math.sign(this.mapGroup.ay)?1:0;//同じ方向だったら加速、それ以外なら跳ね返り
                this.mapGroup.ax *= Math.sign(e.pointer.x-this.player.x)===Math.sign(this.mapGroup.ax)?1:0;
                this.mapGroup.ax -= this.mapGroup.moveWX;
                this.mapGroup.ay -= this.mapGroup.moveWY;
                this.mapGroup.pax = this.mapGroup.ax*1.5;
                this.mapGroup.pay = this.mapGroup.ay*1.5;
                this.player.moveCounter = app.frame;
                this.ctx.drawLine(this.gridX.center(),this.gridY.center(),this.whx,this.why);
                this.player.isCabling = true;
            }
        };
        this.onpointstay = function(e){
            if(this.player.canMove){
                this.mapGroup.ay = this.mapGroup.pay;
                this.mapGroup.ax = this.mapGroup.pax;
                console.log(this.whx)
                this.ctx.clear();
                this.ctx.drawLine(this.gridX.center(),this.gridY.center(),this.whx,this.why);
            }
        };
        this.onpointend = function(){
            this.ctx.clear();
            this.player.isCabling = false;
        }
        
        //this.mapGroup.x += this.ax;
        //this.mapGroup.y +=this.ay;
        this.mapGroup.move(Math.abs(this.mapGroup.ax)>this.player.maxSpeed?this.player.maxSpeed*Math.sign(this.mapGroup.ax):this.mapGroup.ax,Math.abs(this.mapGroup.ay)>this.player.maxSpeed?this.player.maxSpeed*Math.sign(this.mapGroup.ay):this.mapGroup.ay);
        this.mapGroup.ay +=this.gravity;
        
    }
});
phina.define("MyMap",{
    init:function(mapName){
        this.map = Assets.maps[mapName];
    },
    getMap:function(mapName){
        this.map = mapOrigin[mapName] || "error";
        if(this.map === "error")error("map name not defined");
        let rMap = [],x = this.map[0],y = this.map[1];
        for(i = 0;i < (this.map.length-2)/x;i++){
           rMap.push(this.map.slice(x*i+2,x*(i+1)+2));
        }
        return rMap;
    },
    generateMap:function(parent){
        for(let y in this.map.main){
            for(let x in this.map.main[y]){
                this.MapChip(this.map.main[y][x],this.map.mapChipSize).addChildTo(parent).setPosition(this.map.mapChipSize*x,this.map.mapChipSize*y);
            }
        }
    },
    generateObjects:function(parent){
        for(let n in this.map.objects){
            this.MapObject(this.map.object[n][0],this.map.mapChipSize).addChildTo(parent).setPosition(this.map.mapChipSize*this.map.objects[n][1],this.map.mapChipSize*this.map.objects[n][2]);
        }
    },
    MapChip:function(mapChipNo,size){
       switch(mapChipNo){
           case 0:return RectangleObject({width:size,height:size,collision:false});
           case 1:return Ground({width:size,height:size,collision:true});
           default:console.log("mapChipNo is not defined");return RectangleObject({width:size,height:size});
       }
    },
    MapObject:function(objectName){
        switch(objectName){
            case "coin":return Coin({width:size*0.9,height:size*0.9});
            default:console.log("objectName is not defined");return Coin()
        }
    }
});
phina.define("RectangleObject",{
    superClass:"RectangleShape",
    init:function(options){
        options = (options || {}).$safe(Ground.defaults);
        this.superInit(options);
        this.collision = options.collision;
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
        this.collision = options.collision;
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
            this.mapGroup = app.currentScene.mapGroup?app.currentScene.mapGroup:error("Group is not defined");
            this.player = app.currentScene.player?app.currentScene.player:error("Player is not defined");
            this.ctx = app.currentScene.ctx?app.currentScene.ctx:error("ctx is not defined");
        }
        if(this.hitTestElement(this.player)){
            //console.log(this.y)//this.mapGroup.y-this.player.y;
            /*this.mapGroup.move(0,-this.top+this.player.bottom);
            this.mapGroup.ay *= this.mapGroup.ay<this.minBounce?this.bounce:0;
            this.mapGroup.ax *= Math.abs(this.mapGroup.ax)>this.staticFriction?this.dynamicFriction:0;*/
            if(this.player.isCabling){
                this.player.canMove = false;
                this.ctx.clear();
            }
            let way = RectanglePointWay(this.left,this.top,this.left,this.bottom,this.right,this.bottom,this.right,this.up,this.player.top + (this.player.bottom-this.player.top)/2,this.player.left+(this.player.right-this.player.left)/2);
            if(way === "up"){
                this.mapGroup.move(0,this.top-this.player.bottom);
                this.mapGroup.ay *= this.mapGroup.ay>this.minBounce?-this.bounce:0;
                this.mapGroup.ax *= Math.abs(this.mapGroup.ax)>this.staticFriction?this.dynamicFriction:0;
            }else if(way === "down"){
                this.mapGroup.move(0,this.bottom-this.player.top);
                this.mapGroup.ay *= -this.bounce;
                this.mapGroup.ax *= Math.abs(this.mapGroup.ax)>this.staticFriction?this.dynamicFriction:0;
            }else if(way === "right"){
                this.mapGroup.move(this.right-this.player.left,0);
                this.mapGroup.ay *= this.dynamicFriction;
                this.mapGroup.ax *= -this.bounce;
            }else if(way === "left"){
                this.mapGroup.move(this.left-this.player.right,0);
                this.mapGroup.ay *= this.dynamicFriction;
                this.mapGroup.ax *= -this.bounce;
            }else if(way === "error"){
                console.log("Error at RectanglePointWay.Trying collision again.");
            }
            app.currentScene.onpointstay = function(){
                /*if(this.player.canMove){
                    this.mapGroup.ax = 0;
                    this.mapGroup.ay = 0;
                    this.mapGroup.pax = 0;
                    this.mapGroup.pay = 0;
                }*/
            };
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
        this.maxSpeed = 50;
        this.maxSpeed = Assets.maxSpeed;
        this.canMove = true;
        this.moveCounter = 0;
        this.radius = 20;
        isCabling = false;
    },
    update:function(app){
    },
});
phina.define("Coin",{
    superClass:"CircleShape",
    init:function(options){
        this.superInit(options);
        this.radius = 
    }
})
phina.define("WireHead",{
    superClass:"RectangleShape",
    init:function(options){
        this.superInit(options);
        this.width = 1;
        this.height = Assets.wLength;
        this.strokeWidth = 0;
    }
});
phina.main(function () {
    var app = GameApp({
        startLabel: 'test',
        //assets:Assets,
        width: 1024,
        height: 1024,
        scenes: Scenes,
    });
    app.fps = Assets.FPS;
    app.run();
});