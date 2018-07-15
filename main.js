phina.globalize();
const Assets = {
    images:{
    },
    FPS:60,
    AoG:20,//9.8,//acceleration of gravity,
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
        this.player = Playert().addChildTo(this).setPosition(this.gridX.span(2),this.gridY.span(14));        
        Ground({player:this.player}).addChildTo(this).setPosition(this.gridX.center(),this.gridY.span(15));
    },
    update: function (a) {
        this.onpointstart = function(e){
            //console.log(e);
            this.player.move(e);
        };
    }
});
phina.define("Blockt",{
    superClass:"RectangleShape",
    init:function(options,player){
        this.superInit(options);
        this.player = player;
        
    },
    update:function(app){
        if(this.hitTestElement(this.player)){

        }
    }
});
phina.define("Ground",{
    superClass:"RectangleShape",
    init:function(options){
        options = (options || {}).$safe(Ground.defaults);
        this.superInit(options);
        this.player = options.player?options.player:error("Player is not defined");//console.error("player is undefined");
        this.width = 1024;
        this.staticFriction = options.staticFriction;
        this.dynamicFriction = options.dynamicFriction;
        this.bounce = -options.bounce;
        this.minBounce = options.minBounce;
    },
    update:function(app){
        if(this.hitTestElement(this.player)){
            this.player.bottom = this.top;
            this.player.ay *= this.player.ay>this.minBounce?this.bounce:0;
            this.player.ax *= Math.abs(this.player.ax)>this.staticFriction?this.dynamicFriction:0;
            
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
        this.ax = 0;
        this.ay = 0;
    },
    move:function(e){
       // console.log("move");
        this.ay *= this.ay>0?0:1;
        //this.ay -= 1;
        //console.log("move" + this.ay)*/
        /*this.ax = e.pointer.x/Math.sqrt((e.pointer.x-this.x)**2+(e.pointer.y-this.y)**2);
        this.ay -= e.pointer.y/Math.sqrt((e.pointer.x-this.x)**2+(e.pointer.y-this.y)**2);*/
        //console.log((Math.atan2(e.pointer.y-this.y,e.pointer.x-this.x)/Math.PI)*180+180);
        this.ax = -Math.cos(Math.atan2(e.pointer.y-this.y,e.pointer.x-this.x)+Math.PI)*Assets.wPower;
        this.ay = -Math.sin(Math.atan2(e.pointer.y-this.y,e.pointer.x-this.x)+Math.PI)*Assets.wPower;
        
    },
    update:function(app){
        //this.c++;
        //this.y +=Assets.AoG*0.5*((this.c/Assets.FPS)**2);
        /*if(this.bottom > 1024){
            this.ax = 0;
            this.ay = -0.01;
        }*/
        //console.log("update" + this.ay)
        this.x += this.ax;
        this.y +=this.ay;
        
        this.ay += Assets.AoG/Assets.FPS;
        //console.log(this.ax);
        
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