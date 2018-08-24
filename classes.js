phina.define("Line",{
    sx:0,
    sy:0,
    fx:0,
    fy:0,
    init:function(sx,sy,fx,fy){
        this.sx = sx,
        this.sy = sy,
        this.fx = fx,
        this.fy = fy;
    }
});
function error(message){
    throw new Error(message);
}
function drawLine(sx,sy,ex,ey){
    this.beginPath();
    this.moveTo(sx,sy);
    this.lineTo(ex,ey);
    this.closePath();
    this.stroke();
}
function LineLineCollision(asx,asy,afx,afy,bsx,bsy,bfx,bfy){
    if(!isLineLineCollision(asx,asy,afx,afy,bsx,bsy,bfx,bfy))return false;
    let a = new Vector2(bfx-bsx,bfy-bsy).cross(new Vector2(bsx-asx,bsy-asy)),
    b = new Vector2(bfx-bsx,bfy-bsy).cross(new Vector2(afx-asx,afy-asy));
    if (!b)return false;
    let t = a/b;
    return {
        x:asx + (afx-asx)*t,
        y:asy + (afy-asy)*t
    };
}
function test(a,b,c,d,l){
    let e = Math.sqrt((a-c)**2+(b-d)**2);
    return {x:l*(a-c)/e+c,y:l*(b-d)/e+d};
}
function isLineLineCollision(ax, ay, bx, by, cx, cy, dx, dy) {
    var ta = (cx - dx) * (ay - cy) + (cy - dy) * (cx - ax);
    var tb = (cx - dx) * (by - cy) + (cy - dy) * (cx - bx);
    var tc = (ax - bx) * (cy - ay) + (ay - by) * (ax - cx);
    var td = (ax - bx) * (dy - ay) + (ay - by) * (ax - dx);
  
    //return tc * td < 0 && ta * tb < 0;
    return tc * td <= 0 && ta * tb <= 0; // 端点を含む場合
}//https://qiita.com/ykob/items/ab7f30c43a0ed52d16f2
//console.log(LineLineCollision(1,1,3,1,2,0,2,3));


function isPointCircleCollision(px,py,cx,cy,cr){
    return (px - cx)**2 + (py - cy)**2 <= cr**2
}

function wireCollision(line,children,mapChipSize){ //this で当たり判定したい一つの方 引数 判定したい集合のArray
    let mapChipMaxL = Math.sqrt(((mapChipSize/2)**2)*2),sx = line.sx,sy = line.sy,fx = line.fx,fy = line.fy,list1 = [],fin,v = [["top","left","top","right"],["top","right","bottom","right"],["bottom","right","bottom","left"],["top","left","bottom","left"]];
    for(let i in children){
        if(isPointCircleCollision(children[i].x,children[i].y,sx,sy,Assets.wLength+mapChipMaxL)&&children[i].collision)list1.push(children[i]);
        //console.log(children[i])
    }
    //console.log(list1)
    if(list1.length === 0)return false;
    console.log(" not 0");
    for(let l in list1){
        let obj = list1[l];
        for(let j = 0;j <= 3;j++){
            let o = LineLineCollision(obj[v[j][1]],obj[v[j][0]],obj[v[j][3]],obj[v[j][2]],sx,sy,fx,fy);
            
            if(o){console.log(o)
                if(!fin)fin = o;
                else if((o.x-sx)**2+(o.y-sy)**2 < (fin.x-sx)**2+(fin.y-sy)**2)fin = o;
            }
        }
    }
    console.log(fin)
    if(fin === undefined)return false;
    return fin
}
//console.log(wireCollision({sx:0,sy:0,fx:10,fy:10},[{x:5,y:5,top:7,bottom:3,left:3,right:7},{x:6,y:6,top:8,bottom:4,left:4,right:8}],0));

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