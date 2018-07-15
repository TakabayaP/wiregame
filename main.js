phina.globalize();
const Assets = {
    images:{
    },
    FPS:60,
    AoG:20,//Acceleration of gravity,
    wPower:10
};

const Scenes = [{
    label: "test",
    className: "TestScene",
}];

function error(message){
    throw new Error(message);
}

phina.define("TestScene", {
    superClass: "DisplayScene",
    init: function (options) {
        this.superInit(options);
        this.backgroundColor = 'black';
        this.player = Playert().addChildTo(this).setPosition(this.gridX.center(),this.gridY.center());
        this.group = DisplayElement().addChildTo(this).setPosition(0,0);
        this.group.move = function(x,y){
            for(let i in this.children){
                this.children[i].x += x;
                this.children[i].y += y;
            }
        }; 
        this.group.ax = 0;
        this.group.ay = 0;
        Ground({player:this.player,group:this.group}).addChildTo(this.group).setPosition(this.gridX.center(),this.gridY.center(5));//span(15));
        Ground({player:this.player,group:this.group}).addChildTo(this.group).setPosition(this.gridX.center(14),this.gridY.center(-2));
    },
    update: function (a) {
        this.onpointstart = function(e){
            //this.player.move(e);
            this.group.ay *= this.group.ay<0?0:1;
            this.group.ax = Math.cos(Math.atan2(e.pointer.y-this.player.y,e.pointer.x-this.player.x)+Math.PI)*Assets.wPower;
            this.group.ay = Math.sin(Math.atan2(e.pointer.y-this.player.y,e.pointer.x-this.player.x)+Math.PI)*Assets.wPower;
        };
        //this.group.x += this.ax;
        //this.group.y +=this.ay;
        this.group.move(this.group.ax,this.group.ay);
        this.group.ay -= Assets.AoG/Assets.FPS;
    }
});
phina.define("Ground",{
    superClass:"RectangleShape",
    init:function(options){
        options = (options || {}).$safe(Ground.defaults);
        this.superInit(options);
        this.group = options.group?options.group:error("Group is not defined");
        this.player = options.player?options.player:error("Player is not defined");
        this.width = 1024;
        this.staticFriction = options.staticFriction;
        this.dynamicFriction = options.dynamicFriction;
        this.bounce = -options.bounce;
        this.minBounce = options.minBounce;
    },
    update:function(app){
        if(this.hitTestElement(this.player)){
            //console.log(this.y)//this.group.y-this.player.y;
            this.group.move(0,-this.top+this.player.bottom);
            this.group.ay *= this.group.ay<this.minBounce?this.bounce:0;
            this.group.ax *= Math.abs(this.group.ax)>this.staticFriction?this.dynamicFriction:0;
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
        width: 1024,
        height: 1024,
        scenes: Scenes,
    });
    app.fps = Assets.FPS;
    app.run();
});