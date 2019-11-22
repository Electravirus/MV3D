/*:
@plugindesc 3D rendering in RPG Maker MV with babylon.js
@author Dread/Nyanak
@version 0.3.3
@help

If you are making a game with this plugin, please consider supporting my patreon.  
https://www.patreon.com/cutievirus  
A list of patrons can be found at the bottom of this file.

Make sure you have both the `babylon.js` plugin and `mv3d-babylon.js` plugin loaded, in
that order.

Now when you run your game, the map should be rendered in 3D.

The A3 and A4 tiles will be rendered as walls. You can also change the height
of tiles using regions and terrain tags.

By default, regions 1-7 are configured to affect the height.

Terrain tag 1 is configured to use a cross shape, so tiles with this tag will
stand up like a tree.

Terrain tag 2 is configured to use a fence shape. Try putting this tag on the
fence autotiles that come with MV.

The regions and terrain tags can be reconfigured however you want.

---

## Tileset Configuration

A more advanced feature, the tileset configuration should be placed in the
tileset's note, and should be wrapped in an <mv3d></mv3d> block.

Each line in the configuration should start by identifying the tile you want
to configure, followed by a colon, and then a list of configuration functions.

Choosing a tile is done with the format `img,x,y`, where img is name of the
tileset image (A1, A2, B, C, etc.), and x and y are the position of that tile
on the tileset. For example, `A2,0,0` would be the top left A2 tile. On the
outdoor tileset, this would be the grass autotile.

Each tile can have 3 different textures. The top texture, side texture, and
inside texture. The side texture is used on the side of the tile when it has a
positive height, and the inside texture is used when it has a negative height.

If inside texture isn't specified, all sides will use the same texture.  
If side texture isn't specified, then sides will use the top texture.

---

	texture(img,x,y)
	top(img,x,y)
	side(img,x,y)
	inSide(img,x,y)

These functions will use the specified tile for the current tile's textures.  
texture() sets both the top and side textures.

---

	offset(x,y)
	offsetTop(x,y)
	offsetSide(x,y)
	offsetInside(x,y)

These functions will use an offset to get a texture from a tile near this one.
These should only be used to point to tiles on the same tileset image.

---

	rect(img,x,y,w,h)
	rectTop(img,x,y,w,h)
	rectSide(img,x,y,w,h)
	rectInside(img,x,y,w,h)

These functions use a specified region from a tileset image as the texture.
They use pixel coordinates rather than tile coordinates.

---

	shape(s)

The shape function can set the tile's shape to FLAT, FENCE, CROSS, or XCROSS.
Each of which have their own behavior. FLAT is default.

---

	float(n)

The float function will make water vehicles float a certain height above the
tile.

---

	fringe(n)

The fringe function will move the tile into the air by the specified distance.
Usually used for tiles with star passability.

---

	alpha(n)

Turns on alpha blending for the tile and, if n is less than 1,
makes tile transparent.

---

	glow(n)

Makes tile glow in the dark. Good for lava.

---

As a simple example, we'll give the water tile in the outdoor tileset a
negative height so it will sink into the ground.

    <MV3D>
      A1,0,0:top(A1,0,0),rectSide(A1,31,54,31,14),height(-0.3),float(0.1)
    </MV3D>

But this example doesn't look very good when we place it on the edge of a
cliff, so we can configure it to use waterfall textures on the outside walls.

    <mv3d>
      A1,0,0:top(A1,0,0),side(A1,1,1),rectInside(A1,31,54,31,14),height(-0.3),float(0.1)
    </mv3d>

---

## Event Configuration

Event configurations can be placed in either the note or comment.  
Event configurations should be contained in an <mv3d: > tag, where a list of
configuration functions goes after the colon.

---

	x(n)
	y(n)

The x and y functions shift position of the event's mesh.

---

	height(n)

The height function sets the height of the event above the ground.

---

	z(n)

The z function sets the z position of the event. Ignores ground level.

---

	pos(x,y)

The Pos function sets the position of the event.   
If in the note tag, position will only be set when the event is created.  
If in the comments, position will be set when event changes pages.  
Prefix numbers with + to use relative coordinates.  

---

	side(s)

Which sides of the mesh will be rendered. Can be FRONT, BACK, or DOUBLE.

---

	shape(s)

Sets the shape of the event's mesh.

Valid shapes:

 -   FLAT - Event lies flat on the ground like a tile.
 - SPRITE - Event rotations both pitch and yaw to face camera.
 -   TREE - Event stands straight up, rotating to match camera yaw.
 -  FENCE - Event stands straight up, facing south. (rotate using rot)

---

	scale(x,y)

Sets the scale of the event's mesh.


---

	rot(n)

Rotates the event. Only works with flat and fence shapes.  
0 is south, 90 is east, 180 is north, and 270 is west.  

---

	bush(true/false)

Whether the event is affected by bush tiles.

---

	shadow(true/false)

Whether the event has a shadow.

---

	shadowScale(n)

Set's the scale of the event's shadow.

---

	lamp(color,intensity,distance)
	flashlight(color,intensity,distance,angle)

Sets up light sources on this event.  
Color should be a hex code.  
Intensity is the brightness of the light.  
Distance is how far the light travels.   
Angle is the width of the flashlight's beam.   

If configured on note, these settings are applied only when event is created.  
If in comment, settings applied when switching pages.

---

	flashlightYaw(deg)
	flashlightPitch(deg)

Sets the pitch and yaw of the event's flashlight.  
Prefix the yaw angle with + to set yaw relative to event's facing.

---

	lightHeight(n)

Sets the height of the light sources on the event.

---

	lightOffset(x,y)

Offsets the position of the event's light sources.

---

As an example, to make a door event render on the edge of a building's wall,
you might do something like this:

    <mv3d:shape(fence),scale(0.9,1.3),y(0.51),rot(0),z(0)>

---

## Map Configuration

Map configuration goes in the note area of the map settings. Configurations
should be placed in an <mv3d></mv3d> block, which should contain a list of
configuration functions.

Some of these configurations apply when the map is loaded, and some affect how it's rendered

---

	light(color,intensity)
	fog(color,near,far)

Setup the ambient light and fog of the map.

---

	yaw(deg)
	pitch(deg)
	dist(n)
	height(n)
	cameraYaw(deg)
	cameraPitch(deg)
	cameraDist(n)
	cameraHeight(n)

Sets the camera yaw, pitch, distance, and height for the map.   

---

	mode(s)
	cameraMode(s)

Set either PERSPECTIVE or ORTHOGRAPHIC mode.

---

	edge(true/false)

If false, walls aren't rendered at the edges of the map.

---

	ceiling(img,x,y,height)

Uses the tile texture specified by `img,x,y` to render a ceiling for the map.  
Good for indoor areas. If height isn't specified, default will be used.

---

## Plugin Commands

In the following commands, the parts surrounded with angle bracks such as <n> are parameters.

Some commands (like lamp and flashlight) act on a character. By default the
target character will be the current event.
You can define your own target using the following syntax:

	mv3d ＠target rest of the command

If the second word in the command starts with `＠`, that will be interpreted
as the target.

Valid targets:

- ＠p or ＠player: Targets $gamePlayer.
- ＠e0, ＠e1, ＠e2, ＠e25 etc: Targets event with specified id.
- ＠f0, ＠f1, ＠f2, etc: Targets first, second, third follower, etc.
- ＠v0, ＠v1, ＠v2: Boat, Ship, Airship.

Some parameters can be prefixed with + to be set relative to the current
value.

For example:

	mv3d camera yaw +-45 0.5

---

	mv3d camera pitch <n> <t>
	mv3d camera yaw <n> <t>
	mv3d camera dist <n> <t>
	mv3d camera height <n> <t>

Sets the camera properties, where <n> is the new value and <t> is the time to
interpolate to the new value.   
Prefix <n> with + to modify the current value instead of setting a new
value.

---

	mv3d camera mode <mode>

Set camera mode to PERSPECTIVE or ORTHOGRAPHIC

---

	mv3d rotationMode <mode>

Set the keyboard control mode for rotating the camera.

Modes:

- OFF - Can't rotate camera with keyboard.
- AUTO - A&D while in 1st person mode. Otherwise Q&E.
- Q&E - Rotate camera with Q&E keys.
- A&D - Rotate camera with left & right or A&D. Move with Q&E.

---

	mv3d pitchMode <true/false>

Allow player to control camera pitch with pageup and pagedown.

---

	mv3d fog color <color> <t>
	mv3d fog near <n> <t>
	mv3d fog far <n> <t>
	mv3d fog dist <near> <far> <t>
	mv3d fog <color> <near> <far> <t>

<t> is time.  
Prefix values with + to modify the current values instead of setting new
values.

---

	mv3d light color <color> <t>
	mv3d light intensity <n> <t>
	mv3d light <color> <intensity> <t>

---

	mv3d ＠t lamp color <color> <t>
	mv3d ＠t lamp intensity <n> <t>
	mv3d ＠t lamp dist <n> <t>
	mv3d ＠t lamp <color> <intensity> <dist> <t>

---

	mv3d ＠t flashlight color <color> <t>
	mv3d ＠t flashlight intensity <n> <t>
	mv3d ＠t flashlight dist <n> <t>
	mv3d ＠t flashlight angle <deg> <t>
	mv3d ＠t flashlight pitch <deg> <t>
	mv3d ＠t flashlight yaw <deg> <t>
	mv3d ＠t flashlight <color> <intensity> <dist> <angle> <t>

Angle is beam width of the flashlight.

---

	mv3d camera target ＠t <t>

Change the camera's target.
Camera will transition to the new target over time <t>.

---

	mv3d camera pan <x> <y> <t>
	mv3d pan <x> <y> <t>

Pans the camera view, relative to current target.

---

### Vehicle Commands

	mv3d <vehicle> big <true/false>
	mv3d <vehicle> scale <n>
	mv3d <vehicle> speed <n>
	mv3d airship ascentspeed <n>
	mv3d airship descentspeed <n>
	mv3d airship height <n>

"Big" vehicles can't be piloted too close to walls. This can be useful to
avoid clipping with vehicles with large scales.   
Speed of the vehicle should be 1-6. It works the same as event speed.   
A higher airship can fly over higher mountains. Perhaps you could let the
player upgrade their airship's height and speed.

---

Patrons:

- Whitely

@param graphics
@text Graphics

@param renderDist
@text Render Distance
@desc The distance in tiles that will be rendered in 3D.
@parent graphics
@type Number
@default 20

@param antialiasing
@text Antialiasing
@parent graphics
@type Boolean
@default true

@param fov
@text FOV
@parent graphics
@type Number
@default 65

@param edgefix
@text Edge Fix
@desc Fixes rendering issues at the edges of tiles.
@parent graphics
@type Number
@decimals 1
@default 0.5

@param alphatest
@text Alpha Cutoff
@desc Pixels with alpha below this value will not be rendered.
@parent graphics
@type Number
@decimals 2
@min 0.01 @max 1
@default 0.51

@param fog
@text Fog

@param fogColor
@text Fog Color
@desc The color of the fog. Use css color code or name (example: #ffffff)
@parent fog
@type Color
@default white

@param fogNear
@text Fog Start Distance
@desc The distance in tiles at which the fog will start.
@parent fog
@type Number
@decimals 1
@default 15.0

@param fogFar
@text Fog End Distance
@desc The distance in tiles at which the fog will finish. Maybe set this to the same as render distance.
@parent fog
@type Number
@decimals 1
@default 20.0

@param light
@text Light & Shadow

@param ambientColor
@text Ambient Color
@desc The color of the ambient light.
@parent light
@type Color
@default white

@param characterShadows
@text Character Shadows
@parent light
@type Boolean
@default true

@param shadowScale
@text Default Shadow Scale
@parent light
@desc The default size of character shadows.
@type Number
@decimals 1
@default 0.8

@param shadowDist
@text Shadow Distance
@parent light
@desc How far above the ground before a character's shadow fades completely. 
@type Number
@decimals 1
@default 4.0

@param input
@text Input

@param keyboardPitch
@text Control pitch with keyboard
@parent input
@desc Allow player to change pitch with pageup & pagedown.
@type Boolean
@default true

@param keyboardTurn
@text Rotate camera with keyboard
@parent input
@desc In 3rd person mode, Q&E will rotate camera.
@type Boolean
@default true

@param keyboardStrafe
@text Enable Strafing
@parent input
@desc In 1st person mode, Q&E will strafe left and right.
@type Boolean
@default true

@param tileconfig
@text Tile Config

@param wallHeight
@text Wall Height
@desc The default height for wall tiles
@parent tileconfig
@type Number
@min -9999 @max 9999
@decimals 1
@default 2.0

@param tableHeight
@text Table Height
@desc The default height for table tiles
@parent tileconfig
@type Number
@min -9999 @max 9999
@decimals 2
@default 0.33

@param fringeHeight
@text Fringe Height
@parent tileconfig
@type Number
@min -9999 @max 9999
@decimals 1
@default 2.0

@param ceilingHeight
@text Ceiling Height
@desc Default height of ceiling for maps with ceiling enabled.
@parent tileconfig
@type Number
@min -9999 @max 9999
@decimals 1
@default 2.0

@param layerDist
@text Layering Distance
@desc The distance between tile layers. If this is too small
there may be z-fighting issues. (default: 0.0100)
@parent tileconfig
@type Number
@decimals 4
@default 0.0100

@param animDelay
@text Animation Speed
@desc The number of milliseconds between each frame in tile animations.
@parent tileconfig
@type Number
@default 333

@param regions
@text Regions
@desc use regions to determine tile height.
@parent tileconfig
@type struct<RegionHeight>[]
@default ["{\"regionId\":\"1\",\"conf\":\"height(1)\"}","{\"regionId\":\"2\",\"conf\":\"height(2)\"}","{\"regionId\":\"3\",\"conf\":\"height(3)\"}","{\"regionId\":\"4\",\"conf\":\"height(4)\"}","{\"regionId\":\"5\",\"conf\":\"height(5)\"}","{\"regionId\":\"6\",\"conf\":\"height(6)\"}","{\"regionId\":\"7\",\"conf\":\"height(7)\"}"]

@param ttags
@text Terrain Tags
@desc use terrain tags to determine tile height.
@parent tileconfig
@type struct<TTagHeight>[]
@default ["{\"terrainTag\":\"1\",\"conf\":\"height(1),shape(xcross)\"}","{\"terrainTag\":\"2\",\"conf\":\"height(1),shape(fence)\"}"]

@param characters
@text Characters

@param eventShape
@text Default Event Shape
@parent characters
@type combo
@option FLAT
@option SPRITE
@option TREE
@default SPRITE

@param eventHeight
@text Event "Above Characters" Default Height
@parent characters
@type Number
@decimals 1
@default 2.0

@param boatSettings
@text Boat Settings
@parent characters
@type struct<BoatStruct>
@default {"scale":"1","zoff":"-0.16","big":"false"}

@param shipSettings
@text Ship Settings
@parent characters
@type struct<BoatStruct>
@default {"scale":"1","zoff":"0.0","big":"false"}

@param airshipSettings
@text Airship Settings
@parent characters
@type struct<AirshipStruct>
@default {"scale":"1","height":"2.0","shadowScale":"1.0","shadowDist":"6.0","big":"false","bushLanding":"false"}

@param vehicleBush
@text Vehicle Bush
@parent characters
@desc Whether vehicles should be affected by bush tiles.
@type Boolean
@default false
*/
/*~struct~RegionHeight:
@param regionId
@text Region Id
@type Number
@min 1 @max 255
@default 1

@param conf
@text Configuration Functions
@desc See tileset configuration for list of functions
@type Text
@default height(2)
*/
/*~struct~TTagHeight:
@param terrainTag
@text Terrain Tag
@type Number
@min 1 @max 7
@default 1

@param conf
@text Configuration Functions
@desc See tileset configuration for list of functions
@type Text
@default height(0),shape(flat)
*/
/*~struct~BoatStruct:
@param scale
@text Scale
@type Number
@decimals 1
@default 1

@param zoff
@text Z Offset
@type Number
@min -9999 @max 9999
@decimals 2
@default 0.0

@param big
@text Big
@desc If true, vehicle requires a 3x3 space to move through. good for vehicles with large scales.
@type Boolean
@default false

*/
/*~struct~AirshipStruct:
@param scale
@text Scale
@type Number
@decimals 1
@default 1

@param height
@text Height
@type Number
@decimals 1
@default 2.0

@param shadowScale
@text Shadow Scale
@desc The default size of character shadows.
@type Number
@decimals 1
@default 1.0

@param shadowDist
@text Shadow Distance
@desc How far above the ground before Airship's shadow fades completely. 
@type Number
@decimals 1
@default 6.0

@param big
@text Big
@desc If true, vehicle requires a 3x3 space to move through. good for vehicles with large scales.
@type Boolean
@default false

@param bushLanding
@text Land on Bush Tiles
@desc Whether the airship can land on bush tiles.
@type Boolean
@default false

*/!function(t){var e={};function i(a){if(e[a])return e[a].exports;var s=e[a]={i:a,l:!1,exports:{}};return t[a].call(s.exports,s,s.exports,i),s.l=!0,s.exports}i.m=t,i.c=e,i.d=function(t,e,a){i.o(t,e)||Object.defineProperty(t,e,{enumerable:!0,get:a})},i.r=function(t){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})},i.t=function(t,e){if(1&e&&(t=i(t)),8&e)return t;if(4&e&&"object"==typeof t&&t&&t.__esModule)return t;var a=Object.create(null);if(i.r(a),Object.defineProperty(a,"default",{enumerable:!0,value:t}),2&e&&"string"!=typeof t)for(var s in t)i.d(a,s,function(e){return t[e]}.bind(null,s));return a},i.n=function(t){var e=t&&t.__esModule?function(){return t.default}:function(){return t};return i.d(e,"a",e),e},i.o=function(t,e){return Object.prototype.hasOwnProperty.call(t,e)},i.p="",i(i.s=2)}([function(t,e){t.exports=require("fs")},function(t,e){t.exports=require("path")},function(t,e,i){"use strict";i.r(e);const{Vector2:a,Vector3:s,Color3:r,Color4:h}=window.BABYLON,n=t=>{if("number"==typeof t)return{r:(t>>16)/255,g:(t>>8&255)/255,b:(255&t)/255,a:1};if(t instanceof r)return t.toColor4();if(t instanceof h)return t;{const e=document.createElement("canvas");e.width=1,e.height=1;const i=e.getContext("2d");i.fillStyle=t,i.fillRect(0,0,1,1);const a=i.getImageData(0,0,1,1).data;return new h(a[0]/255,a[1]/255,a[2]/255,a[3]/255)}},o=(t,e)=>{if(""===e)return+t;const i=/^[+]/.test(e);return i&&(e=e.substr(1)),e=Number(e),Number.isNaN(e)?+t:i?+t+e:+e},l=t=>Boolean(c(t)),c=t=>{if(!t)return!1;"string"!=typeof t&&(t=String(t));const e=t.toUpperCase();return!c.values.includes(e)&&t};c.values=["OFF","FALSE","UNDEFINED","NULL","DISABLE","DISABLED"];const p=(t=0)=>new Promise(e=>setTimeout(e,t)),g=t=>t*Math.PI/180,u=t=>180*t/Math.PI,d=()=>m(),m=()=>Game_Map.prototype.tileWidth(),f=()=>Game_Map.prototype.tileHeight(),_=new s(1,0,0),T=new s(0,1,0),b=new s(0,0,1),C=(new a(0,0),new s(0,0,0),window.BABYLON),{Scene:y,Engine:S,FreeCamera:E,HemisphericLight:M,DirectionalLight:I,SpotLight:w,PointLight:v,ShadowGenerator:A,Vector2:x,Vector3:F,Vector4:L,Color3:N,Color4:D,Plane:P,Node:O,TransformNode:R,Texture:H,StandardMaterial:V,Mesh:G,VertexData:$,MeshBuilder:B,AssetsManager:Y,SceneSerializer:k}=C,{FRONTSIDE:z,BACKSIDE:X,DOUBLESIDE:W}=G,{PERSPECTIVE_CAMERA:j,ORTHOGRAPHIC_CAMERA:U}=C.Camera,{FOGMODE_NONE:Z,FOGMODE_EXP:K,FOGMODE_EXP2:J,FOGMODE_LINEAR:q}=y,Q=C.Space.WORLD,tt=C.Space.LOCAL;C.Space.BONE;H.prototype.crop=function(t=0,e=0,i=0,a=0){const{width:s,height:r}=this.getBaseSize();i||(i=s-t),a||(a=r-e),rt.EDGE_FIX&&(t+=rt.EDGE_FIX,e+=rt.EDGE_FIX,i-=2*rt.EDGE_FIX,a-=2*rt.EDGE_FIX),this.uScale=i/s,this.vScale=a/r,this.uOffset=t/s,this.vOffset=1-e/r-this.vScale},Object.defineProperties(O.prototype,{x:{get(){return this.position?this.position.x:void 0},set(t){this.position&&(this.position.x=t)}},y:{get(){return this.position?-this.position.z:void 0},set(t){this.position&&(this.position.z=-t)}},z:{get(){return this.position?this.position.y:void 0},set(t){this.position&&(this.position.y=t)}},pitch:{get(){return this.rotation?-u(this.rotation.x):void 0},set(t){this.rotation&&(this.rotation.x=-g(t))}},yaw:{get(){return this.rotation?-u(this.rotation.y):void 0},set(t){this.rotation&&(this.rotation.y=-g(t))}},roll:{get(){return this.rotation?-u(this.rotation.z):void 0},set(t){this.rotation&&(this.rotation.z=-g(t))}}}),Object.defineProperty(G.prototype,"order",{get(){return this._order},set(t){this._order=t,this._scene.sortMeshes()}});const et=(t,e)=>(0|t._order)-(0|e._order);y.prototype.sortMeshes=function(){this.meshes.sort(et)};const it=y.prototype.addMesh;y.prototype.addMesh=function(t){it.apply(this,arguments),"number"==typeof t._order&&this.sortMeshes()};const at=y.prototype.removeMesh;y.prototype.removeMesh=function(t){at.apply(this,arguments),this.sortMeshes()},N.prototype.toNumber=D.prototype.toNumber=function(){return 255*this.r<<16|255*this.g<<8|255*this.b};const st={setup(){this.setupParameters(),this.canvas=document.createElement("canvas"),this.texture=PIXI.Texture.fromCanvas(this.canvas),this.engine=new S(this.canvas,this.ANTIALIASING),this.scene=new y(this.engine),this.scene.clearColor.set(0,0,0,0),this.cameraStick=new R("cameraStick",this.scene),this.cameraNode=new R("cameraNode",this.scene),this.cameraNode.parent=this.cameraStick,this.camera=new E("camera",new F(0,0,0),this.scene),this.camera.parent=this.cameraNode,this.camera.fov=g(st.FOV),this.camera.orthoLeft=-Graphics.width/2/d(),this.camera.orthoRight=Graphics.width/2/d(),this.camera.orthoTop=Graphics.height/2/d(),this.camera.orthoBottom=-Graphics.height/2/d(),this.camera.minZ=.1,this.camera.maxZ=this.RENDER_DIST,this.scene.ambientColor=new N(1,1,1),this.scene.fogMode=q,this.map=new O("map",this.scene),this.cells={},this.characters=[],this.setupBlenders(),this.setupInput(),this.setupSpriteMeshes()},updateCanvas(){this.canvas.width=Graphics._width,this.canvas.height=Graphics._height},render(){this.scene.render(),this.texture.update()},lastMapUpdate:0,update(){performance.now()-this.lastMapUpdate>1e3&&!this.mapUpdating&&(this.updateMap(),this.lastMapUpdate=performance.now()),this.updateAnimations(),this.updateCharacters(),this.updateBlenders(),(st.KEYBOARD_TURN||this.is1stPerson())&&(Input.isTriggered("rotleft")?this.blendCameraYaw.setValue(this.blendCameraYaw.targetValue()+90,.5):Input.isTriggered("rotright")&&this.blendCameraYaw.setValue(this.blendCameraYaw.targetValue()-90,.5),this.is1stPerson()&&(Input.isTriggered("rotleft")||Input.isTriggered("rotright"))&&this.playerFaceYaw()),st.KEYBOARD_PITCH&&(Input.isPressed("pageup")&&Input.isPressed("pagedown")||(Input.isPressed("pageup")?this.blendCameraPitch.setValue(Math.min(180,this.blendCameraPitch.targetValue()+1.5),.1):Input.isPressed("pagedown")&&this.blendCameraPitch.setValue(Math.max(0,this.blendCameraPitch.targetValue()-1.5),.1)));for(const t in this.cells)this.cells[t].update();this.updateSerializer()},loadData:(t,e)=>$gameVariables&&$gameVariables.mv3d&&t in $gameVariables.mv3d?$gameVariables.mv3d[t]:e,saveData(t,e){if(!$gameVariables)return console.warn(`MV3D: Couldn't save data ${t}:${e}`);$gameVariables.mv3d||($gameVariables.mv3d={}),$gameVariables.mv3d[t]=e},updateCameraMode(){this.cameraMode.startsWith("O")?this.camera.mode!==U&&(this.camera.mode=U):this.camera.mode!==j&&(this.camera.mode=j)},get cameraMode(){return this.loadData("cameraMode",this.CAMERA_MODE).toUpperCase()},set cameraMode(t){t=String(t).toUpperCase().startsWith("O")?"ORTHOGRAPHIC":"PERSPECTIVE",this.saveData("cameraMode",t),this.updateBlenders(!0)},is1stPerson(t){const e=t?"currentValue":"targetValue";return this.getCameraTarget()===$gamePlayer&&this.blendCameraTransition[e]()<=0&&this.blendCameraDist[e]()<=0&&0===this.blendPanX[e]()&&0===this.blendPanY[e]()},loopCoords(t,e){if($gameMap.isLoopHorizontal()){const e=$gameMap.width(),i=this.cameraStick.x-e/2;t=(t-i).mod(e)+i}if($gameMap.isLoopVertical()){const t=$gameMap.height(),i=this.cameraStick.y-t/2;e=(e-i).mod(t)+i}return new x(t,e)},playerFaceYaw(){let t=Math.floor((45-st.blendCameraYaw.targetValue())/90).mod(4);t>1&&(t+=(t+1)%2*2-1),t=10-(2*t+2),$gamePlayer.setDirection(t)},dirToYaw(t){let e=t/2-1;return e>1&&(e+=(e+1)%2*2-1),e=-90*e+180},transformDirectionYaw(t,e=this.blendCameraYaw.currentValue(),i=!1){if(0==t)return 0;(t=t/2-1)>1&&(t+=(t+1)%2*2-1);const a=Math.floor((e+45)/90);return(t=i?(t-a).mod(4):(t+a).mod(4))>1&&(t+=(t+1)%2*2-1),2*t+2}};window.mv3d=st;var rt=st;const ht=Graphics._createCanvas;Graphics._createCanvas=function(){rt.setup(),rt.updateCanvas(),ht.apply(this,arguments)};const nt=Graphics._updateAllElements;Graphics._updateAllElements=function(){nt.apply(this,arguments),rt.updateCanvas()};const ot=Graphics.render;Graphics.render=function(){rt.render(),ot.apply(this,arguments)};const lt=Scene_Map.prototype.update;Scene_Map.prototype.update=function(){lt.apply(this,arguments),rt.update()},ShaderTilemap.prototype.renderWebGL=function(t){};const ct=Spriteset_Map.prototype.createTilemap;Spriteset_Map.prototype.createTilemap=function(){ct.apply(this,arguments),this._tilemap.visible=!1,this._baseSprite.addChild(new PIXI.Sprite(rt.texture))};const pt=Sprite_Character.prototype.setCharacter;Sprite_Character.prototype.setCharacter=function(t){pt.apply(this,arguments),Object.defineProperty(t,"mv_sprite",{value:this,configurable:!0})};const gt=Game_Player.prototype.performTransfer;Game_Player.prototype.performTransfer=function(){const t=this._newMapId!==$gameMap.mapId();t&&rt.clearMap(),gt.apply(this,arguments)};const ut=Scene_Map.prototype.onMapLoaded;Scene_Map.prototype.onMapLoaded=function(){ut.apply(this,arguments),rt.mapLoaded||(rt.mapReady=!1,rt.loadMap()),rt.updateBlenders(!0)};const dt=Scene_Map.prototype.isReady;Scene_Map.prototype.isReady=function(){let t=dt.apply(this,arguments);return t&&rt.mapReady};const mt=PluginManager.parameters("mv3d-babylon");Object.assign(rt,{CAMERA_MODE:"PERSPECTIVE",ORTHOGRAPHIC_DIST:100,MV3D_FOLDER:"img/MV3D",ANIM_DELAY:Number(mt.animDelay),ALPHA_CUTOFF:Math.max(.01,mt.alphatest),EDGE_FIX:Number(mt.edgefix),ANTIALIASING:l(mt.antialiasing),FOV:Number(mt.fov),WALL_HEIGHT:Number(mt.wallHeight),TABLE_HEIGHT:Number(mt.tableHeight),FRINGE_HEIGHT:Number(mt.fringeHeight),CEILING_HEIGHT:Number(mt.ceilingHeight),LAYER_DIST:Number(mt.layerDist),CELL_SIZE:10,RENDER_DIST:Number(mt.renderDist),FOG_COLOR:n(mt.fogColor).toNumber(),FOG_NEAR:Number(mt.fogNear),FOG_FAR:Number(mt.fogFar),AMBIENT_COLOR:n(mt.ambientColor).toNumber(),LIGHT_HEIGHT:.5,LIGHT_DECAY:1,LIGHT_DIST:3,LIGHT_ANGLE:45,FLASHLIGHT_EXTRA_ANGLE:10,CHARACTER_SHADOWS:l(mt.characterShadows),SHADOW_SCALE:Number(mt.shadowScale),SHADOW_DIST:Number(mt.shadowDist),KEYBOARD_PITCH:l(mt.keyboardPitch),KEYBOARD_TURN:l(mt.keyboardTurn),KEYBOARD_STRAFE:l(mt.keyboardStrafe),REGION_DATA:{},TTAG_DATA:{},EVENT_HEIGHT:Number(mt.eventHeight),VEHICLE_BUSH:l(mt.vehicleBush),BOAT_SETTINGS:JSON.parse(mt.boatSettings),SHIP_SETTINGS:JSON.parse(mt.shipSettings),AIRSHIP_SETTINGS:JSON.parse(mt.airshipSettings),setupParameters(){for(let t of JSON.parse(mt.regions)){t=JSON.parse(t);const e=this.readConfigurationFunctions(t.conf,this.tilesetConfigurationFunctions);this.REGION_DATA[t.regionId]=e,"height"in e&&(e.regionHeight=e.height,delete e.height)}for(let t of JSON.parse(mt.ttags))t=JSON.parse(t),this.TTAG_DATA[t.terrainTag]=this.readConfigurationFunctions(t.conf,this.tilesetConfigurationFunctions);this.BOAT_SETTINGS.scale=Number(this.BOAT_SETTINGS.scale),this.BOAT_SETTINGS.zoff=Number(this.BOAT_SETTINGS.zoff),this.BOAT_SETTINGS.big=l(this.BOAT_SETTINGS.big),this.SHIP_SETTINGS.scale=Number(this.SHIP_SETTINGS.scale),this.SHIP_SETTINGS.zoff=Number(this.SHIP_SETTINGS.zoff),this.SHIP_SETTINGS.big=l(this.SHIP_SETTINGS.big),this.AIRSHIP_SETTINGS.scale=Number(this.AIRSHIP_SETTINGS.scale),this.AIRSHIP_SETTINGS.height=Number(this.AIRSHIP_SETTINGS.height),this.AIRSHIP_SETTINGS.shadowScale=Number(this.AIRSHIP_SETTINGS.shadowScale),this.AIRSHIP_SETTINGS.shadowDist=Number(this.AIRSHIP_SETTINGS.shadowDist),this.AIRSHIP_SETTINGS.big=l(this.AIRSHIP_SETTINGS.big),this.AIRSHIP_SETTINGS.bushLanding=l(this.AIRSHIP_SETTINGS.bushLanding),this.EVENT_SHAPE=this.configurationShapes[mt.eventShape.toUpperCase()]}}),Object.assign(rt,{cameraTargets:[],getCameraTarget(){return this.cameraTargets[0]},setCameraTarget(t,e){t?(this.cameraTargets.unshift(t),this.cameraTargets.length>2&&(this.cameraTargets.length=2),this.saveData("cameraTarget",this.getTargetString(t)),this.blendCameraTransition.value=1,this.blendCameraTransition.setValue(0,e)):this.cameraTargets.length=0},clearCameraTarget(){this.cameraTargets.length=0},resetCameraTarget(){this.clearCameraTarget(),this.setCameraTarget($gamePlayer,0)},rememberCameraTarget(){const t=this.loadData("cameraTarget");t&&this.setCameraTarget(this.targetChar(t),0)},setupBlenders(){this.blendFogColor=new ColorBlender("fogColor",this.FOG_COLOR),this.blendFogNear=new blenders_Blender("fogNear",this.FOG_NEAR),this.blendFogFar=new blenders_Blender("fogFar",this.FOG_FAR),this.blendCameraYaw=new blenders_Blender("cameraYaw",0),this.blendCameraYaw.cycle=360,this.blendCameraPitch=new blenders_Blender("cameraPitch",60),this.blendCameraPitch.min=0,this.blendCameraPitch.max=180,this.blendCameraDist=new blenders_Blender("cameraDist",10),this.blendCameraHeight=new blenders_Blender("cameraHeight",.7),this.blendAmbientColor=new ColorBlender("ambientColor",this.AMBIENT_COLOR),this.blendSunlightColor=new ColorBlender("light_color",16777215),this.blendSunlightIntensity=new blenders_Blender("light_intensity",1),this.blendPanX=new blenders_Blender("panX",0),this.blendPanY=new blenders_Blender("panY",0),this.blendCameraTransition=new blenders_Blender("cameraTransition",0)},updateBlenders(t){if(this.updateCameraMode(),this.cameraTargets.length||$gamePlayer&&(this.cameraTargets[0]=$gamePlayer),this.blendCameraTransition.update()&&this.cameraTargets.length>=2){const t=this.blendCameraTransition.currentValue();let e=this.cameraTargets[0];e===$gamePlayer&&$gamePlayer.isInVehicle()&&(e=$gamePlayer.vehicle());let i=this.cameraTargets[1];i===$gamePlayer&&$gamePlayer.isInVehicle()&&(i=$gamePlayer.vehicle()),this.cameraStick.x=e._realX*(1-t)+i._realX*t,this.cameraStick.y=e._realY*(1-t)+i._realY*t,e.mv3d_sprite&&i.mv3d_sprite?this.cameraStick.z=e.mv3d_sprite.z*(1-t)+i.mv3d_sprite.z*t:e.mv3d_sprite&&(this.cameraStick.z=e.mv3d_sprite.z)}else if(this.cameraTargets.length){let t=this.getCameraTarget();t===$gamePlayer&&$gamePlayer.isInVehicle()&&(t=$gamePlayer.vehicle()),this.cameraStick.x=t._realX,this.cameraStick.y=t._realY,t.mv3d_sprite&&(this.cameraStick.z=t.mv3d_sprite.z)}this.blendPanX.update(),this.blendPanY.update(),this.cameraStick.x+=this.blendPanX.currentValue(),this.cameraStick.y+=this.blendPanY.currentValue(),t|this.blendCameraPitch.update()|this.blendCameraYaw.update()|this.blendCameraDist.update()|this.blendCameraHeight.update()&&(this.cameraNode.pitch=this.blendCameraPitch.currentValue()-90,this.cameraNode.yaw=this.blendCameraYaw.currentValue(),this.cameraNode.position.set(0,0,0),this.cameraNode.translate(b,-this.blendCameraDist.currentValue(),tt),this.camera.mode===U?(this.camera.maxZ=this.RENDER_DIST,this.camera.minZ=-this.RENDER_DIST):(this.cameraNode.z<0&&(this.cameraNode.z=0),this.camera.maxZ=this.RENDER_DIST,this.camera.minZ=.1),this.cameraNode.z+=this.blendCameraHeight.currentValue()),t|this.blendFogColor.update()|this.blendFogNear.update()|this.blendFogFar.update()&&(this.scene.fogStart=this.blendFogNear.currentValue(),this.scene.fogEnd=this.blendFogFar.currentValue(),this.scene.fogColor.copyFromFloats(this.blendFogColor.r.currentValue()/255,this.blendFogColor.g.currentValue()/255,this.blendFogColor.b.currentValue()/255)),t|this.blendAmbientColor.update()&&this.scene.ambientColor.copyFromFloats(this.blendAmbientColor.r.currentValue()/255,this.blendAmbientColor.g.currentValue()/255,this.blendAmbientColor.b.currentValue()/255)}});class blenders_Blender{constructor(t,e){this.key=t,this.dfault=rt.loadData(t,e),this.value=e,this.speed=1,this.max=1/0,this.min=-1/0,this.cycle=!1}setValue(t,e=0){let i=(t=Math.min(this.max,Math.max(this.min,t)))-this.value;if(i){if(this.saveValue(this.key,t),this.cycle)for(;Math.abs(i)>this.cycle/2;)this.value+=Math.sign(i)*this.cycle,i=t-this.value;this.speed=Math.abs(i)/(60*e)}}currentValue(){return this.value}targetValue(){return this.loadValue(this.key)}defaultValue(){return this.dfault}update(){const t=this.targetValue();if(this.value===t)return!1;const e=t-this.value;return this.speed>Math.abs(e)?this.value=t:this.value+=this.speed*Math.sign(e),!0}storageLocation(){return $gameVariables?($gameVariables.mv3d||($gameVariables.mv3d={}),$gameVariables.mv3d):(console.warn("MV3D: Couldn't get Blend storage location."),{})}loadValue(t){const e=this.storageLocation();return t in e?e[t]:this.dfault}saveValue(t,e){this.storageLocation()[t]=e}}class ColorBlender{constructor(t,e){this.dfault=e,this.r=new blenders_Blender(`${t}_r`,e>>16),this.g=new blenders_Blender(`${t}_g`,e>>8&255),this.b=new blenders_Blender(`${t}_b`,255&e)}setValue(t,e){this.r.setValue(t>>16,e),this.g.setValue(t>>8&255,e),this.b.setValue(255&t,e)}currentValue(){return this.r.value<<16|this.g.value<<8|this.b.value}targetValue(){return this.r.targetValue()<<16|this.g.targetValue()<<8|this.b.targetValue()}defaultValue(){return this.dfault}update(){let t=0;return t|=this.r.update(),t|=this.g.update(),t|=this.b.update(),Boolean(t)}get storageLocation(){return this.r.storageLocation}set storageLocation(t){this.r.storageLocation=t,this.g.storageLocation=t,this.b.storageLocation=t}currentComponents(){return[this.r.currentValue()/255,this.g.currentValue()/255,this.b.currentValue()/255]}targetComponents(){return[this.r.targetValue()/255,this.g.targetValue()/255,this.b.targetValue()/255]}}function ft(t,e,i){let a=void 0;return{configurable:!0,get:()=>null!=a?a:SceneManager._scene instanceof Scene_Map?rt.is1stPerson()?i:e:t,set(t){a=t}}}Object.assign(Input.keyMapper,{81:"rotleft",69:"rotright",87:"up",65:"left",83:"down",68:"right"}),rt.setupInput=function(){const t={left:ft("left","left","rotleft"),rotleft:ft("pageup","rotleft",rt.KEYBOARD_STRAFE?"left":void 0),right:ft("right","right","rotright"),rotright:ft("pagedown","rotright",rt.KEYBOARD_STRAFE?"right":void 0)};Object.defineProperties(Input.keyMapper,{37:t.left,39:t.right,81:t.rotleft,69:t.rotright,65:t.left,68:t.right})},Game_Player.prototype.getInputDirection=function(){let t=Input.dir4;return rt.transformDirectionYaw(t,rt.blendCameraYaw.currentValue(),!0)};const _t=Game_Player.prototype.updateMove;Game_Player.prototype.updateMove=function(){_t.apply(this,arguments),!this.isMoving()&&rt.is1stPerson()&&rt.playerFaceYaw()};const Tt=Game_Player.prototype.moveStraight;Game_Player.prototype.moveStraight=function(t){Tt.apply(this,arguments),!this.isMovementSucceeded()&&rt.is1stPerson()&&rt.playerFaceYaw()};const bt=t=>!!(t.isEnabled()&&t.isVisible&&t.isPickable)&&(!t.character||!t.character.isFollower&&!t.character.isPlayer);Scene_Map.prototype.processMapTouch=function(){if(TouchInput.isTriggered()||this._touchCount>0)if(TouchInput.isPressed()){if(0===this._touchCount||this._touchCount>=15){const t=rt.scene.pick(TouchInput.x,TouchInput.y,bt);if(t.hit){const e={x:t.pickedPoint.x,y:-t.pickedPoint.z},i=t.pickedMesh;i.character&&(e.x=i.character.x,e.y=i.character.y),$gameTemp.setDestination(Math.round(e.x),Math.round(e.y))}}this._touchCount++}else this._touchCount=0};const Ct=Game_Player.prototype.findDirectionTo;Game_Player.prototype.findDirectionTo=function(){const t=Ct.apply(this,arguments);if(rt.is1stPerson()&&t){let e=rt.dirToYaw(t);rt.blendCameraYaw.setValue(e,.25)}return t};class ConfigurationFunction{constructor(t,e){this.groups=t.match(/\[?[^[\]|]+\]?/g),this.labels={};for(let t=0;t<this.groups.length;++t){for(;this.groups[t]&&"["===this.groups[t][0];)this.labels[this.groups[t].slice(1,-1)]=t,this.groups.splice(t,1);if(t>this.groups.length)break;this.groups[t]=this.groups[t].split(",").map(t=>t.trim())}this.func=e}run(t,e){const i=/([,|])?(?:(\w+):)?([^,|\r\n]+)/g;let a,s=0,r=0;const h={};for(let t=0;t<this.groups.length;++t)h[`group${t+1}`]=[];for(;a=i.exec(e);){if(("|"===a[1]||s>=this.groups[r].length)&&(s=0,++r),a[2])if(a[2]in this.labels)r=this.labels[a[2]];else{let t=!1;t:for(let e=0;e<this.groups.length;++e)for(let i=0;i<this.groups[e].length;++i)if(this.groups[e][i]===a[2]){t=!0,r=e,s=i;break t}if(!t)break}if(r>this.groups.length)break;h[this.groups[r][s]]=h[`group${r+1}`][s]=a[3].trim(),++s}this.func(t,h)}}function yt(t,e=""){return new ConfigurationFunction(`img,x,y,w,h|${e}|alpha|glow[anim]animx,animy`,(function(e,i){if(5===i.group1.length){const[a,s,r,h,n]=i.group1;e[`${t}_id`]=rt.constructTileId(a,0,0),e[`${t}_rect`]=new PIXI.Rectangle(s,r,h,n)}else if(3===i.group1.length){const[a,s,r]=i.group1;e[`${t}_id`]=rt.constructTileId(a,s,r)}else if(2===i.group1.length){const[a,s]=i.group1;e[`${t}_offset`]=new x(Number(a),Number(s))}i.animx&&i.animy&&(e[`${t}_animData`]={animX:Number(i.animx),animY:Number(i.animy)}),i.height&&(e[`${t}_height`]=Number(i.height)),i.alpha&&(e[`${t}_alpha`]=Number(i.alpha)),i.glow&&(e[`${t}_glow`]=Number(i.glow))}))}Object.assign(rt,{tilesetConfigurations:{},mapConfigurations:{},loadMapSettings(){this.tilesetConfigurations={};const t=this.readConfigurationBlocks($gameMap.tileset().note),e=/^\s*([abcde]\d?\s*,\s*\d+\s*,\s*\d+)\s*:(.*)$/gim;let i;for(;i=e.exec(t);){const t=i[1],e=this.readConfigurationFunctions(i[2],this.tilesetConfigurationFunctions),a=this.constructTileId(...t.split(","));a in this.tilesetConfigurations?Object.assign(this.tilesetConfigurations[a],e):this.tilesetConfigurations[a]=e}const a=this.mapConfigurations={};if(this.readConfigurationFunctions(this.readConfigurationBlocks($dataMap.note),this.mapConfigurationFunctions,a),"fog"in a){const t=a.fog;"color"in t&&this.blendFogColor.setValue(t.color,0),"near"in t&&this.blendFogNear.setValue(t.near,0),"far"in t&&this.blendFogFar.setValue(t.far,0)}"light"in a&&this.blendAmbientColor.setValue(a.light.color,0),"cameraDist"in a&&this.blendCameraDist.setValue(a.cameraDist,0),"cameraHeight"in a&&this.blendCameraHeight.setValue(a.cameraHeight,0),"cameraMode"in a&&(this.cameraMode=a.cameraMode),"cameraPitch"in a&&this.blendCameraPitch.setValue(a.cameraPitch,0),"cameraYaw"in a&&this.blendCameraYaw.setValue(a.cameraYaw,0)},getMapConfig(t,e){return t in this.mapConfigurations?this.mapConfigurations[t]:e},getCeilingConfig(){let t={};for(const e in this.mapConfigurations)e.startsWith("ceiling_")&&(t[e.replace("ceiling_","bottom_")]=this.mapConfigurations[e]);return t.bottom_id=this.getMapConfig("ceiling_id",0),t.height=this.getMapConfig("ceiling_height",this.CEILING_HEIGHT),t},readConfigurationBlocks(t){const e=/<MV3D>([\s\S]*?)<\/MV3D>/gi;let i,a="";for(;i=e.exec(t);)a+=i[1]+"\n";return a},readConfigurationTags(t){const e=/<MV3D:([\s\S]*?)>/gi;let i,a="";for(;i=e.exec(t);)a+=i[1]+"\n";return a},readConfigurationFunctions(t,e=rt.configurationFunctions,i={}){const a=/(\w+)\((.*?)\)/g;let s;for(;s=a.exec(t);){const t=s[1].toLowerCase();t in e&&(e[t]instanceof ConfigurationFunction?e[t].run(i,s[2]):e[t](i,...s[2].split(",")))}return i},configurationSides:{front:z,back:X,double:W},configurationShapes:{FLAT:1,TREE:2,SPRITE:3,FENCE:4,CROSS:5,XCROSS:6},tilesetConfigurationFunctions:{height(t,e){t.height=Number(e)},fringe(t,e){t.fringe=Number(e)},float(t,e){t.float=Number(e)},top:yt("top"),side:yt("side"),inside:yt("inside"),bottom:yt("bottom"),texture:Object.assign(yt("hybrid"),{func(t,e){rt.tilesetConfigurationFunctions.top.func(t,e),rt.tilesetConfigurationFunctions.side.func(t,e)}}),shape(t,e){t.shape=rt.configurationShapes[e.toUpperCase()]},alpha(t,e){t.transparent=!0,t.alpha=Number(e)},glow(t,e){t.glow=Number(e)}},eventConfigurationFunctions:{height(t,e){t.height=Number(e)},z(t,e){t.z=Number(e)},x(t,e){t.x=Number(e)},y(t,e){t.y=Number(e)},scale(t,e,i){t.scale=new x(Number(e),Number(i))},rot(t,e){t.rot=Number(e)},bush(t,e){t.bush=l(e)},shadow(t,e){t.shadow=Number(c(e))},shape(t,e){t.shape=rt.configurationShapes[e.toUpperCase()]},pos(t,e,i){t.pos={x:e,y:i}},lamp:new ConfigurationFunction("color,intensity,distance|height",(function(t,e){const{color:i="white",intensity:a=1,distance:s=rt.LIGHT_DIST}=e;t.lamp={color:n(i).toNumber(),intensity:Number(a),distance:Number(s)}})),flashlight:new ConfigurationFunction("color,intensity,distance,angle|yaw,pitch",(function(t,e){const{color:i="white",intensity:a=1,distance:s=rt.LIGHT_DIST,angle:r=rt.LIGHT_ANGLE}=e;t.flashlight={color:n(i).toNumber(),intensity:Number(a),distance:Number(s),angle:Number(r)},e.yaw&&(t.flashlightYaw=e.yaw),e.pitch&&(t.flashlightPitch=Number(e.pitch))})),flashlightpitch(t,e="90"){t.flashlightPitch=Number(e)},flashlightyaw(t,e="+0"){t.flashlightYaw=e},lightheight(t,e=1){t.lightHeight=Number(e)},lightoffset(t,e=0,i=0){t.lightOffset={x:+e,y:+i}},alpha(t,e){t.alpha=Number(e)}},mapConfigurationFunctions:{light(t,e){t.light={color:n(e).toNumber()}},fog:new ConfigurationFunction("color|near,far",(function(t,e){const{color:i,near:a,far:s}=e;t.fog||(t.fog={}),i&&(t.fog.color=n(i).toNumber()),a&&(t.fog.near=Number(a)),s&&(t.fog.far=Number(s))})),camera:new ConfigurationFunction("yaw,pitch|dist|height|mode",(function(t,e){const{yaw:i,pitch:a,dist:s,height:r,mode:h}=e;i&&(t.cameraYaw=Number(i)),a&&(t.cameraPitch=Number(a)),s&&(t.cameraDist=Number(s)),r&&(t.cameraHeight=Number(r)),h&&(t.cameraMode=h)})),ceiling:yt("ceiling","height")}});const St=Game_Event.prototype.setupPage;Game_Event.prototype.setupPage=function(){St.apply(this,arguments),this.mv3d_sprite&&(this.mv3d_needsConfigure=!0,this.mv3d_sprite.eventConfigure())};const Et=Game_Event.prototype.initialize;Game_Event.prototype.initialize=function(){Et.apply(this,arguments),rt.mapLoaded&&rt.createCharacterFor(this);const t=this.event();let e={};rt.readConfigurationFunctions(rt.readConfigurationTags(t.note),rt.eventConfigurationFunctions,e),"pos"in e&&this.locate(o(t.x,e.pos.x),o(t.y,e.pos.y)),this.mv3d_blenders||(this.mv3d_blenders={}),"lamp"in e&&(this.mv3d_blenders.lampColor_r=e.lamp.color>>16,this.mv3d_blenders.lampColor_g=e.lamp.color>>8&255,this.mv3d_blenders.lampColor_b=255&e.lamp.color,this.mv3d_blenders.lampIntensity=e.lamp.intensity,this.mv3d_blenders.lampDistance=e.lamp.distance),"flashlight"in e&&(this.mv3d_blenders.flashlightColor_r=e.flashlight.color>>16,this.mv3d_blenders.flashlightColor_g=e.flashlight.color>>8&255,this.mv3d_blenders.flashlightColor_b=255&e.flashlight.color,this.mv3d_blenders.flashlightIntensity=e.flashlight.intensity,this.mv3d_blenders.flashlightDistance=e.flashlight.distance,this.mv3d_blenders.flashlightAngle=e.flashlight.angle),"flashlightPitch"in e&&(this.mv3d_blenders.flashlightPitch=Number(e.flashlightPitch)),"flashlightYaw"in e&&(this.mv3d_blenders.flashlightYaw=e.flashlightYaw),this.mv3d_needsConfigure=!0};const Mt=Game_Interpreter.prototype.pluginCommand;Game_Interpreter.prototype.pluginCommand=function(t,e){if("mv3d"!==t.toLowerCase())return Mt.apply(this,arguments);const i=new rt.PluginCommand;if(i.INTERPRETER=this,i.FULL_COMMAND=[t,...e].join(" "),e=e.filter(t=>t),i.CHAR=$gameMap.event(this._eventId),e[0]){const t=e[0][0];"@"!==t&&"＠"!==t||(i.CHAR=i.TARGET_CHAR(e.shift()))}const a=e.shift().toLowerCase();a in i&&i[a](...e)},rt.PluginCommand=class{async camera(...t){var e=this._TIME(t[2]);switch(t[0].toLowerCase()){case"pitch":return void this.pitch(t[1],e);case"yaw":return void this.yaw(t[1],e);case"dist":case"distance":return void this.dist(t[1],e);case"height":return void this.height(t[1],e);case"mode":return void this.cameramode(t[1]);case"target":return void this._cameraTarget(t[1],e);case"pan":return void this.pan(t[1],t[2],t[3])}}yaw(t,e=1){this._RELATIVE_BLEND(rt.blendCameraYaw,t,e),rt.is1stPerson()&&rt.playerFaceYaw()}pitch(t,e=1){this._RELATIVE_BLEND(rt.blendCameraPitch,t,e)}dist(t,e=1){this._RELATIVE_BLEND(rt.blendCameraDist,t,e)}height(t,e=1){this._RELATIVE_BLEND(rt.blendCameraHeight,t,e)}_cameraTarget(t,e){rt.setCameraTarget(this.TARGET_CHAR(t),e)}pan(t,e,i=1){console.log(t,e,i),i=this._TIME(i),this._RELATIVE_BLEND(rt.blendPanX,t,i),this._RELATIVE_BLEND(rt.blendPanY,e,i)}rotationmode(t){rt.rotationMode=t}pitchmode(t){rt.pitchMode=t}_VEHICLE(t,e,i){e=e.toLowerCase();const a=`${Vehicle}_${e}`;i="big"===e?booleanString(i):o(rt.loadData(a,0),i),rt.saveData(a,i)}boat(t,e){this._VEHICLE("boat",t,e)}ship(t,e){this._VEHICLE("ship",t,e)}airship(t,e){this._VEHICLE("airship",t,e)}cameramode(t){rt.cameraMode=t}fog(...t){var e=this._TIME(t[2]);switch(t[0].toLowerCase()){case"color":return void this._fogColor(t[1],e);case"near":return void this._fogNear(t[1],e);case"far":return void this._fogFar(t[1],e);case"dist":case"distance":return e=this._TIME(t[3]),this._fogNear(t[1],e),void this._fogFar(t[2],e)}e=this._TIME(t[3]),this._fogColor(t[0],e),this._fogNear(t[1],e),this._fogFar(t[2],e)}_fogColor(t,e){rt.blendFogColor.setValue(n(t).toNumber(),e)}_fogNear(t,e){this._RELATIVE_BLEND(rt.blendFogNear,t,e)}_fogFar(t,e){this._RELATIVE_BLEND(rt.blendFogFar,t,e)}light(...t){var e=this._TIME(t[2]);switch(t[0].toLowerCase()){case"color":return void this._lightColor(t[1],e)}e=this._TIME(t[1]),this._lightColor(t[0],e)}_lightColor(t,e=1){rt.blendAmbientColor.setValue(n(t).toNumber(),e)}async lamp(...t){const e=await this.AWAIT_CHAR(this.CHAR);e.setupLamp();var i=this._TIME(t[2]);switch(t[0].toLowerCase()){case"color":return void this._lampColor(e,t[1],i);case"intensity":return void this._lampIntensity(e,t[1],i);case"dist":case"distance":return void this._lampDistance(e,t[1],i)}i=this._TIME(t[3]),this._lampColor(e,t[0],i),this._lampIntensity(e,t[1],i),this._lampDistance(e,t[2],i)}_lampColor(t,e,i=1){t.blendLampColor.setValue(n(e).toNumber(),i)}_lampIntensity(t,e,i=1){this._RELATIVE_BLEND(t.blendLampIntensity,e,i)}_lampDistance(t,e,i=1){this._RELATIVE_BLEND(t.blendLampDistance,e,i)}async flashlight(...t){const e=await this.AWAIT_CHAR(this.CHAR);e.setupFlashlight();var i=this._TIME(t[2]);switch(t[0].toLowerCase()){case"color":return void this._flashlightColor(e,t[1],i);case"intensity":return void this._flashlightIntensity(e,t[1],i);case"dist":case"distance":return void this._flashlightDistance(e,t[1],i);case"angle":return void this._flashlightAngle(e,t[1],i);case"yaw":return void this._flashlightYaw(e,t[1],i);case"pitch":return void this._flashlightPitch(e,t[1],i)}i=this._TIME(t[4]),this._flashlightColor(e,t[0],i),this._flashlightIntensity(e,t[1],i),this._flashlightDistance(e,t[2],i),this._flashlightAngle(e,t[3],i)}_flashlightColor(t,e,i){t.blendFlashlightColor.setValue(n(e).toNumber(),i)}_flashlightIntensity(t,e,i){this._RELATIVE_BLEND(t.blendFlashlightIntensity,e,i)}_flashlightDistance(t,e,i){this._RELATIVE_BLEND(t.blendFlashlightDistance,e,i)}_flashlightAngle(t,e,i){this._RELATIVE_BLEND(t.blendFlashlightAngle,e,i)}_flashlightPitch(t,e,i){this._RELATIVE_BLEND(t.blendFlashlightPitch,e,i)}_flashlightYaw(t,e,i){t.flashlightTargetYaw=e}_RELATIVE_BLEND(t,e,i){t.setValue(o(t.targetValue(),e),Number(i))}_TIME(t){return"number"==typeof t?t:(t=Number(t),Number.isNaN(t)?1:t)}ERROR_CHAR(){console.warn(`MV3D: Plugin command \`${this.FULL_COMMAND}\` failed because target character was invalid.`)}async AWAIT_CHAR(t){if(!t)return this.ERROR_CHAR();let e=0;for(;!t.mv3d_sprite;)if(await sleep(100),++e>10)return this.ERROR_CHAR();return t.mv3d_sprite}TARGET_CHAR(t){return rt.targetChar(t,$gameMap.event(this.INTERPRETER._eventId),this.CHAR)}},rt.targetChar=function(t,e=null,i=null){if(!t)return i;let a=t.toLowerCase().match(/[a-z]+/);const s=a?a[0]:"e",r=(a=t.match(/\d+/))?Number(a[0]):0;switch(s[0]){case"s":return e;case"p":return $gamePlayer;case"e":return r?$gameMap.event(r):e;case"v":return $gameMap.vehicle(r);case"f":return $gamePlayer.followers()._data[r]}return char},rt.getTargetString=function(t){return t instanceof Game_Player?"@p":t instanceof Game_Event?`@e${t._eventId}`:t instanceof Game_Follower?`@f${$gamePlayer._followers._data.indexOf(t)}`:t instanceof Game_Vehicle?`@v${$gameMap._vehicles.indexOf(t)}`:void 0},Object.assign(rt,{_tilemap:null,getTilemap(){return SceneManager._scene&&SceneManager._scene._spriteset&&(this._tilemap=SceneManager._scene._spriteset._tilemap),this._tilemap},getSetNumber:t=>Tilemap.isAutotile(t)?Tilemap.isTileA1(t)?0:Tilemap.isTileA2(t)?1:Tilemap.isTileA3(t)?2:3:Tilemap.isTileA5(t)?4:5+Math.floor(t/256),getTerrainTag:t=>$gameMap.tilesetFlags()[t]>>12,getMaterialOptions(t,e){const i={};return"alpha"in t&&(i.alpha=t.alpha),"glow"in t&&(i.glow=t.glow),e&&(`${e}_alpha`in t&&(i.alpha=t[`${e}_alpha`]),`${e}_glow`in t&&(i.glow=t[`${e}_glow`])),"alpha"in i&&(i.transparent=!0),i},getTileAnimationData(t,e){const i=t[`${e}_id`];if(`${e}_animData`in t)return t[`${e}_animData`];const a={animX:0,animY:0};if(Tilemap.isTileA1(i)){const t=Tilemap.getAutotileKind(i);a.animX=t<=1?2:t<=3?0:t%2?0:2,a.animY=t<=3?0:t%2?1:0}return a},getTileConfig(t,e,i,a){const s={},r=this.getTerrainTag(t);r&&r in this.TTAG_DATA&&Object.assign(s,this.TTAG_DATA[r]);const h=this.tilesetConfigurations[this.normalizeAutotileId(t)];if(h&&Object.assign(s,h),0===a){const t=$gameMap.regionId(e,i);t&&t in rt.REGION_DATA&&Object.assign(s,this.REGION_DATA[t])}return s},getTileTextureOffsets(t,e,i,a){const s=this.getTileConfig(t,e,i,a),r=Tilemap.isAutotile(t)?48:1,h=this.getTilemap();return s.hasInsideConf=Boolean(s.inside_offset||s.rectInside||"inside_id"in s),s.hasBottomConf=Boolean(s.bottom_offset||s.rectBottom||"bottom_id"in s),null==s.top_id&&(s.top_id=t,s.top_offset&&(s.top_id=t+s.top_offset.x*r+s.top_offset.y*r*8)),null==s.side_id&&(s.side_id=t,s.side_offset&&(s.side_id=t+s.side_offset.x*r+s.side_offset.y*r*8)),null==s.inside_id&&(s.inside_id=s.side_id,s.inside_offset&&(s.inside_id=t+s.inside_offset.x*r+s.inside_offset.y*r*8)),null==s.bottom_id&&(s.bottom_id=s.top_id,s.bottom_offset&&(s.bottom_id=t+s.bottom_offset.x*r+s.bottom_offset.y*r*8)),s.fringeHeight=s.height||0,null==s.fringe&&(s.fringe=!this.isTileEmpty(t)&&h&&h._isHigherTile(t)?this.FRINGE_HEIGHT:0),s},getTileData(t,e){if(!$dataMap||!$dataMap.data)return[0,0,0,0];const i=$dataMap.data,a=$dataMap.width,s=$dataMap.height;if($gameMap.isLoopHorizontal()&&(t=t.mod(a)),$gameMap.isLoopVertical()&&(e=e.mod(s)),t<0||t>=a||e<0||e>=s)return[0,0,0,0];const r=[];for(let h=0;h<4;++h)r[h]=i[(h*s+e)*a+t]||0;return r},getTileHeight(t,e,i=0){if(!$dataMap)return 0;$gameMap.isLoopHorizontal()&&(t=t.mod($dataMap.width)),$gameMap.isLoopVertical()&&(e=e.mod($dataMap.height));const a=this.getTileData(t,e)[i];if(this.isTileEmpty(a)&&i>0)return 0;const s=this.getTilemap();if(s&&s._isHigherTile(a))return 0;const r=this.getTileConfig(a,t,e,i);if("regionHeight"in r){let t=r.regionHeight;return r.height<0&&(t+=r.height),t}return"height"in r?r.height:this.isWallTile(a)?this.WALL_HEIGHT:s&&s._isTableTile(a)?this.TABLE_HEIGHT:this.isSpecialShape(r.shape)?1:0},getStackHeight(t,e,i=3){let a=0;for(let s=0;s<=i;++s)a+=this.getTileHeight(t,e,s);return a},getWalkHeight(t,e){const i=Math.round(t),a=Math.round(e),s=this.getTileData(i,a);let r=0,h=0;for(let t=0;t<=3;++t){const e=s[t];if(this.isTileEmpty(e)&&t>0)continue;r+=h,h=this.getTileHeight(i,a,t);const n=this.getTileConfig(e,i,a,t).shape;this.isSpecialShape(n)||(r+=h,h=0)}return r},getFloatHeight(t,e){const i=this.getTileData(t,e);let a=0;for(let s=0;s<=3;++s){const r=i[s];if(this.isTileEmpty(r))continue;const h=this.getTileConfig(r,t,e,s);h&&"float"in h&&(a+=h.float)}return a},getFringeHeight(t,e,i=3){let a=this.getStackHeight(t,e,i-1);const s=this.getTileData(t,e)[i],r=this.getTileConfig(s,t,e,i);return r&&this.getTilemap()._isHigherTile(s)?a+(r.fringe||this.FRINGE_HEIGHT)+(r.height||0):0},getCullingHeight(t,e,i=3,a=!1){const s=this.getTileData(t,e);let r=0;for(let h=0;h<=i;++h){const i=s[h],n=this.getTileConfig(i,t,e,h),o=n.shape;if(this.isSpecialShape(o))return r;a&&n.height<0&&(r-=n.height),r+=this.getTileHeight(t,e,h)}return r},tileHasPit(t,e,i=3){const a=this.getTileData(t,e);for(let s=0;s<=i;++s){const i=a[s];if(this.getTileConfig(i,t,e,s).height<0)return!0}return!1},getTileRects(t){const e=[],i=this.getTilemap(),a=i._isTableTile(t);if(i._drawTile({addRect:(t,i,a,s,r,h,n,o,l)=>{e.push({setN:t,x:i,y:a,width:h,height:n,ox:s,oy:r})}},t,0,0),a)for(let t=e.length-1;t>=0;--t)e[t].oy>d()/2&&(e[t-1].y+=2*d()/3,e.splice(t,1));return e},isTileEmpty:t=>!t||1544===t,isWallTile(t){const e=Tilemap.getAutotileKind(t),i=Math.floor(e/8),a=Tilemap.isTileA3(t)||Tilemap.isTileA4(t);return a&&i%2?2:a},isTableTile(t){return Boolean(this.getTilemap()._isTableTile(t))},isFringeTile(t){return Boolean(this.getTilemap()._isHigherTile(t))},isWaterfallTile(t){const e=Tilemap.getAutotileKind(t);return Tilemap.isTileA1(t)&&e>=4&&e%2},isSpecialShape(t){const e=rt.configurationShapes;return t===e.FENCE||t===e.CROSS||t===e.XCROSS},constructTileId(t,e,i){const a=`TILE_ID_${t.toUpperCase()}`;let s=a in Tilemap?Tilemap[a]:0;const r=Tilemap.isAutotile(s)?48:1;return s+=Number(e)*r+Number(i)*r*8},normalizeAutotileId(t){if(!Tilemap.isAutotile(t))return t;const e=Tilemap.getAutotileKind(t);return Tilemap.TILE_ID_A1+48*e}});class MapCellBuilder_CellMeshBuilder{constructor(){this.submeshBuilders={}}build(){const t=Object.values(this.submeshBuilders);if(!t.length)return null;const e=t.map(t=>t.build());return G.MergeMeshes(e,!0,void 0,void 0,!1,!0)}getBuilder(t){return t.name in this.submeshBuilders||(this.submeshBuilders[t.name]=new MapCellBuilder_SubMeshBuilder(t)),this.submeshBuilders[t.name]}addWallFace(t,e,i,a,s,r,h,n,o,l,c,p={}){const g=this.getBuilder(t),u=MapCellBuilder_SubMeshBuilder.getUvRect(t.diffuseTexture,e,i,a,s);g.addWallFace(r,h,n,o,l,c,u,p),p.double&&(p.flip=!p.flip,g.addWallFace(r,h,n,o,l,c,u,p))}addFloorFace(t,e,i,a,s,r,h,n,o,l,c){const p=this.getBuilder(t),g=MapCellBuilder_SubMeshBuilder.getUvRect(t.diffuseTexture,e,i,a,s);p.addFloorFace(r,h,n,o,l,c,g)}}class MapCellBuilder_SubMeshBuilder{constructor(t){this.material=t,this.positions=[],this.indices=[],this.normals=[],this.uvs=[]}build(){const t=new G("cell mesh",rt.scene),e=new $;return e.positions=this.positions,e.indices=this.indices,e.normals=this.normals,e.uvs=this.uvs,e.applyToMesh(t),t.material=this.material,t}addWallFace(t,e,i,a,s,r,h,n){e=-e,i=i;const o=Math.round(1e3*Math.cos(r))/1e3,l=Math.round(1e3*Math.sin(r))/1e3,c=a/2,p=s/2,g=[t-c*o,i+p,e+c*l,t+c*o,i+p,e-c*l,t-c*o,i-p,e+c*l,t+c*o,i-p,e-c*l],u=[-l,0,-o,-l,0,-o,-l,0,-o,-l,0,-o],d=[h.x1,h.y1,h.x2,h.y1,h.x1,h.y2,h.x2,h.y2],m=[1,0,2,1,2,3];if(n.flip){m.reverse();for(let t=0;t<u.length;++t)u[t]*=-1}this.pushNewData(g,m,u,d)}addFloorFace(t,e,i,a,s,r,h){const n=-2*r+1,o=n*a/2,l=s/2,c=[t-o,i=i,(e=-e)+l,t+o,i,e+l,t-o,i,e-l,t+o,i,e-l],p=[0,n,0,0,n,0,0,n,0,0,n,0],g=[h.x1,h.y1,h.x2,h.y1,h.x1,h.y2,h.x2,h.y2];if(r)for(let t=0;t<p.length;++t)p[t]*=-1;this.pushNewData(c,[1,0,2,1,2,3],p,g)}pushNewData(t,e,i,a){this.indices.push(...e.map(t=>t+this.positions.length/3)),this.positions.push(...t),this.normals.push(...i),this.uvs.push(...a)}static getUvRect(t,e,i,a,s){const{width:r,height:h}=t.getBaseSize();return rt.EDGE_FIX&&(e+=rt.EDGE_FIX,i+=rt.EDGE_FIX,a-=2*rt.EDGE_FIX,s-=2*rt.EDGE_FIX),{x1:e/r,y1:(h-i)/h,x2:(e+a)/r,y2:(h-i-s)/h}}}new P(0,1,-Math.pow(.1,100),0),new P(0,0,-1,0);class mapCell_MapCell extends R{constructor(t,e){const i=[t,e].toString();super(`MapCell[${i}]`,rt.scene),this.parent=rt.map,this.cx=t,this.cy=e,this.ox=t*rt.CELL_SIZE,this.oy=e*rt.CELL_SIZE,this.x=this.ox,this.y=this.oy,this.key=i}update(){const t=rt.loopCoords((this.cx+.5)*rt.CELL_SIZE,(this.cy+.5)*rt.CELL_SIZE);this.x=t.x-rt.CELL_SIZE/2,this.y=t.y-rt.CELL_SIZE/2}async load(){const t=rt.configurationShapes;this.builder=new MapCellBuilder_CellMeshBuilder;const e=Math.min(rt.CELL_SIZE,$gameMap.width()-this.cx*rt.CELL_SIZE),i=Math.min(rt.CELL_SIZE,$gameMap.height()-this.cy*rt.CELL_SIZE),a=rt.getCeilingConfig();for(let s=0;s<i;++s)for(let i=0;i<e;++i){a.cull=!1;let e=0;const r=rt.getTileData(this.ox+i,this.oy+s);for(let h=0;h<4;++h){if(rt.isTileEmpty(r[h])){++e;continue}let n=rt.getStackHeight(this.ox+i,this.oy+s,h);const o=rt.getTileTextureOffsets(r[h],i,s,h),l=o.shape;o.realId=r[h];const c=rt.getTileHeight(this.ox+i,this.oy+s,h)||o.height||0;n+=o.fringe,rt.isFringeTile(r[h])&&(n+=o.fringeHeight),l&&l!==t.FLAT?e=0:(await this.loadTile(o,i,s,n,h),o.hasBottomConf||o.height>0&&(h>0||o.fringe),c||0===h?(await this.loadWalls(o,i,s,n,h,c+e*rt.LAYER_DIST),e=0):++e,n>=a.height&&(a.cull=!0)),l===t.FENCE?await this.loadFence(o,i,s,n,h,c):l!==t.CROSS&&l!==t.XCROSS||await this.loadCross(o,i,s,n,h,c)}rt.isTileEmpty(a.bottom_id)||a.cull||await this.loadTile(a,i,s,a.height,0,!0)}this.mesh=this.builder.build(),this.mesh&&(this.mesh.parent=this),delete this.builder}async loadTile(t,e,i,a,s,r=!1){const h=r?t.bottom_id:t.top_id,n=r?t.bottom_rect:t.top_rect,o=Tilemap.isAutotile(h)&&!n;let l;l=n?[n]:rt.getTileRects(h);const c=await rt.getCachedTilesetMaterialForTile(t,r?"bottom":"top");for(const t of l)this.builder.addFloorFace(c,t.x,t.y,t.width,t.height,e+(0|t.ox)/d()-.25*o,i+(0|t.oy)/d()-.25*o,a+s*rt.LAYER_DIST,1-o/2,1-o/2,r)}async loadWalls(t,e,i,a,s,r){const h=rt.isFringeTile(t.realId);for(let n=0;n<mapCell_MapCell.neighborPositions.length;++n){const o=mapCell_MapCell.neighborPositions[n];if(!rt.getMapConfig("edge",!0)&&((this.ox+e+o.x>=$dataMap.width||this.ox+e+o.x<0)&&!$gameMap.isLoopHorizontal()||(this.oy+i+o.y>=$dataMap.height||this.oy+i+o.y<0)&&!$gameMap.isLoopVertical()))continue;let l,c=r,p=t.side_id,g="side";if(h){if(rt.getFringeHeight(this.ox+e+o.x,this.oy+i+o.y,s)===a)continue}else{c=a-rt.getCullingHeight(this.ox+e+o.x,this.oy+i+o.y,s,!(t.height<0))}if(t.height<0&&c<0){if(rt.tileHasPit(this.ox+e+o.x,this.oy+i+o.y,s))continue;c=Math.max(c,t.height),t.hasInsideConf&&(g="inside")}else if(c<=0)continue;"inside"===g?(p=t.inside_id,t.inside_rect&&(l=t.inside_rect)):t.side_rect&&(l=t.side_rect);const u=await rt.getCachedTilesetMaterialForTile(t,g),m=new F(e+o.x/2,i+o.y/2,a),f=-Math.atan2(o.x,o.y);if(l||!Tilemap.isAutotile(p)){const t=l||rt.getTileRects(p)[0],e={};c<0&&(e.flip=!0),this.builder.addWallFace(u,t.x,t.y,t.width,t.height,m.x,m.y,a-c/2,1,Math.abs(c),f,e)}else{const h=mapCell_MapCell.neighborPositions[(+n-1).mod(4)],o=mapCell_MapCell.neighborPositions[(+n+1).mod(4)],l=rt.getStackHeight(this.ox+e+h.x,this.oy+i+h.y,s),g=rt.getStackHeight(this.ox+e+o.x,this.oy+i+o.y,s),{x:_,y:T}=this.getAutotileCorner(p,t.realId);let b=Math.abs(Math.round(2*c)),C=Math.abs(c/b),y=d()/2,S=d()/2;rt.isTableTile(t.realId)&&(S=d()/3,b=1,C=r);for(let e=-1;e<=1;e+=2)for(let i=0;i<b;++i){let r,h,n,o;rt.isTableTile(t.realId)?(r=l!=a,h=g!=a):(r=l<a-i*C,h=g<a-i*C),n=_*d(),o=T*d(),n=(_+(e>0?.5+h:1-r))*d(),o=rt.isWaterfallTile(p)?(T+i%2/2)*d():rt.isTableTile(p)?(T+5/3)*d():(T+(0===i?0:i===b-1?1.5:1-i%2*.5))*d();const E={};c<0&&(E.flip=!0),this.builder.addWallFace(u,n,o,y,S,m.x+.25*e*Math.cos(f),m.y+.25*e*Math.sin(f),a-c*(c<0)-C/2-C*i+s*rt.LAYER_DIST,.5,C,f,E)}}}}async loadFence(t,e,i,a,s,r){const h=t.side_id,n=t.side_rect,o=await rt.getCachedTilesetMaterialForTile(t,"side"),l=Tilemap.isAutotile(h),c=[];for(let t=0;t<mapCell_MapCell.neighborPositions.length;++t){const a=mapCell_MapCell.neighborPositions[t];rt.getTileHeight(this.ox+e+a.x,this.oy+i+a.y,s)!==r&&c.push(t)}for(let s=0;s<mapCell_MapCell.neighborPositions.length;++s){const p=mapCell_MapCell.neighborPositions[s],g=c.includes(s);if(g&&c.length<4&&!l)continue;const u=p.x>0||p.y>0;let d=Math.atan2(p.x,p.y)+Math.PI/2;if(u&&(d-=Math.PI),l&&!n){const{x:s,y:n}=this.getAutotileCorner(h,t.realId);for(let t=0;t<=1;++t)this.builder.addWallFace(o,(g?s+1.5*u:s+1-.5*u)*m(),(n+1.5*t)*f(),m()/2,f()/2,e+p.x/4,i+p.y/4,a-r/4-t*r/2,.5,r/2,-d,{double:!0})}else{const t=n||rt.getTileRects(h)[0];this.builder.addWallFace(o,t.x+t.width/2*u,t.y,t.width/2,t.height,e+p.x/4,i+p.y/4,a-r/2,.5,r,d,{double:!0})}}}async loadCross(t,e,i,a,s,r){const h=t.side_id,n=t.side_rect,o=await rt.getCachedTilesetMaterialForTile(t,"side"),l=Tilemap.isAutotile(h);let c;c=n?[n]:rt.getTileRects(h);const p=t.shape===rt.configurationShapes.XCROSS?Math.PI/4:0,g=l?r/2:r;for(let t=0;t<=1;++t)for(const s of c){const h=-Math.PI/2*t+p,n=-.25*l+(0|s.ox)/m();this.builder.addWallFace(o,s.x,s.y,s.width,s.height,e+n*Math.cos(h),i+n*Math.sin(h),a-(0|s.oy)/f()*r-g/2,1-l/2,g,h,{double:!0})}}getAutotileCorner(t,e=t){const i=Tilemap.getAutotileKind(t);let a=i%8,s=Math.floor(i/8);var r,h;return t===e&&1==rt.isWallTile(t)&&++s,r=2*a,h=s,Tilemap.isTileA1(t)?i<4?(h=i%2*3+1,r=6*Math.floor(i/2)):(r=8*Math.floor(a/4)+i%2*6,h=6*s+3*Math.floor(a%4/2)+1-a%2):Tilemap.isTileA2(t)?h=3*(s-2)+1:Tilemap.isTileA3(t)?h=2*(s-6):Tilemap.isTileA4(t)&&(h=2.5*(s-10)+(s%2?.5:0)),{x:r,y:h}}}mapCell_MapCell.neighborPositions=[new x(0,1),new x(1,0),new x(0,-1),new x(-1,0)],mapCell_MapCell.meshCache={};Object.assign(rt,{mapLoaded:!1,mapReady:!1,clearMap(){this.mapLoaded=!1;for(const t in this.textureCache)this.textureCache[t].dispose();for(const t in this.materialCache)this.materialCache[t].dispose();this.animatedTextures.length=0,this.textureCache={},this.materialCache={};for(const t in this.cells)this.cells[t].dispose(!1,!0);this.cells={};for(const t of this.characters)t.dispose(!1,!0);this.characters.length=0},loadMap(){this.loadMapSettings(),this.updateBlenders(),this.updateMap(),this.createCharacters()},async updateMap(){if(this.mapUpdating)return;this.mapLoaded=!0,this.mapUpdating=!0;const t={left:Math.floor((this.cameraStick.x-this.RENDER_DIST)/this.CELL_SIZE),right:Math.floor((this.cameraStick.x+this.RENDER_DIST)/this.CELL_SIZE),top:Math.floor((this.cameraStick.y-this.RENDER_DIST)/this.CELL_SIZE),bottom:Math.floor((this.cameraStick.y+this.RENDER_DIST)/this.CELL_SIZE)};$gameMap.isLoopHorizontal()||(t.left=Math.max(0,t.left),t.right=Math.min(t.right,Math.floor($gameMap.width()/rt.CELL_SIZE))),$gameMap.isLoopVertical()||(t.top=Math.max(0,t.top),t.bottom=Math.min(t.bottom,Math.floor($gameMap.height()/rt.CELL_SIZE)));const e=[];for(let i=t.left;i<=t.right;++i)for(let a=t.top;a<=t.bottom;++a){let t=i,s=a;$gameMap.isLoopHorizontal()&&(t=t.mod(Math.ceil($gameMap.width()/rt.CELL_SIZE))),$gameMap.isLoopVertical()&&(s=s.mod(Math.ceil($gameMap.height()/rt.CELL_SIZE))),[t,s].toString()in this.cells||e.push(new x(t,s))}const i=new x(Math.round(this.cameraStick.x/this.CELL_SIZE-.5),Math.round(this.cameraStick.y/this.CELL_SIZE-.5));e.sort((t,e)=>x.DistanceSquared(t,i)-x.DistanceSquared(e,i));for(const t of e){let{x:e,y:i}=t;if(await this.loadMapCell(e,i),this.mapReady&&await p(),!this.mapLoaded)return void(this.mapUpdating=!1)}this.mapUpdating=!1,this.mapReady=!0},async loadMapCell(t,e){const i=[t,e].toString();if(i in this.cells)return;const a=new mapCell_MapCell(t,e);this.cells[i]=a,await a.load()}}),Object.assign(rt,{animatedTextures:[],textureCache:{},materialCache:{},getCachedTilesetTexture(t,e=0,i=0){const a=`TS:${t}|${e},${i}`;if(a in this.textureCache)return this.textureCache[a];const s=$gameMap.tileset().tilesetNames[t];if(!s)return this.getErrorTexture();const r=new H(`img/tilesets/${s}.png`,this.scene);return r.hasAlpha=!0,r.onLoadObservable.addOnce(()=>{if(this.textureCache[a]===r&&(r.updateSamplingMode(1),e||i)){const{width:t,height:a}=r.getBaseSize();r.frameData={x:0,y:0,w:t,h:a},r.animX=e,r.animY=i,this.animatedTextures.push(r)}}),this.textureCache[a]=r,r},getCachedTilesetTextureAsync(t,e=0,i=0){return new Promise((a,s)=>{const r=this.getCachedTileTexture(t,e,i);r.isReady()?a(r):r.onLoadObservable.addOnce(()=>{a(r)})})},getCachedTileTexture(t,e,i,a,s){const r=`${t}|${e},${i}|${a},${s}`;if(r in this.textureCache)return this.textureCache[r];const h=$gameMap.tileset().tilesetNames[t];if(!h)return this.getErrorTexture();const n=new H(`img/tilesets/${h}.png`,this.scene);return n.hasAlpha=!0,n.onLoadObservable.addOnce(()=>{if(this.textureCache[r]===n&&(n.crop(e,i,a,s),n.updateSamplingMode(1),0===t)){const t=e/m(),r=i/f();if(t<6||t>=8||r>=6){const r=t>=6&&t<8||t>=14;n.animX=r?0:2,n.animY=r?1:0,n.frameData={x:e,y:i,w:a,h:s},this.animatedTextures.push(n)}}}),this.textureCache[r]=n,n},getErrorTexture(){return this.errorTexture?this.errorTexture:(this.errorTexture=new H(`${rt.MV3D_FOLDER}/errorTexture.png`,this.scene),this.errorTexture.isError=!0,this.errorTexture)},getBushAlphaTexture(){return this.bushAlphaTexture?this.bushAlphaTexture:(this.bushAlphaTexture=new H(`${rt.MV3D_FOLDER}/bushAlpha.png`,this.scene),this.bushAlphaTexture.getAlphaFromRGB=!0,this.bushAlphaTexture)},getCachedTilesetMaterial(t,e=0,i=0,a={}){this.processMaterialOptions(a);const s=`TS:${t}|${e},${i}|${this.getExtraBit(a)}`;if(s in this.materialCache)return this.materialCache[s];const r=this.getCachedTilesetTexture(t,e,i),h=new V(s,this.scene);return h.diffuseTexture=r,a.transparent&&(h.opacityTexture=r,h.alpha=a.alpha),h.alphaCutOff=rt.ALPHA_CUTOFF,h.ambientColor.set(1,1,1),h.emissiveColor.set(a.glow,a.glow,a.glow),h.specularColor.set(0,0,0),this.materialCache[s]=h,h},getCachedTilesetMaterialAsync(t,e=0,i=0,a={}){return new Promise((s,r)=>{const h=this.getCachedTilesetMaterial(t,e,i,a),n=h.diffuseTexture;n.isReady()?s(h):n.onLoadObservable.addOnce(()=>{s(h)})})},async getCachedTilesetMaterialForTile(t,e){const i=rt.getSetNumber(t[`${e}_id`]),a=rt.getMaterialOptions(t,e),s=rt.getTileAnimationData(t,e);return await rt.getCachedTilesetMaterialAsync(i,s.animX,s.animY,a)},getCachedTileMaterial(t,e,i,a,s,r={}){this.processMaterialOptions(r);const h=`${t}|${e},${i}|${a},${s}|${this.getExtraBit(r)}`;if(h in this.materialCache)return this.materialCache[h];const n=this.getCachedTileTexture(t,e,i,a,s),o=new V(h,this.scene);return o.diffuseTexture=n,r.transparent&&(o.opacityTexture=n,o.alpha=r.alpha),o.alphaCutOff=rt.ALPHA_CUTOFF,o.ambientColor.set(1,1,1),o.emissiveColor.set(r.glow,r.glow,r.glow),o.specularColor.set(0,0,0),this.materialCache[h]=o,o},processMaterialOptions(t){"alpha"in t?(t.alpha=Math.round(7*t.alpha)/7,t.alph<1&&(t.transparent=!0)):t.alpha=1,t.glow="glow"in t?Math.round(7*t.glow)/7:0},getExtraBit(t){let e=0;return e|=Boolean(t.transparent)<<0,e|=7-7*t.alpha<<1,(e|=7*t.glow<<1).toString(36)},lastAnimUpdate:0,animXFrame:0,animYFrame:0,animDirection:1,updateAnimations(){if(!(performance.now()-this.lastAnimUpdate<=this.ANIM_DELAY)){this.lastAnimUpdate=performance.now(),this.animXFrame<=0?this.animDirection=1:this.animXFrame>=2&&(this.animDirection=-1),this.animXFrame+=this.animDirection,this.animYFrame=(this.animYFrame+1)%3;for(const t of this.animatedTextures)t.crop(t.frameData.x+t.animX*this.animXFrame*m(),t.frameData.y+t.animY*this.animYFrame*f(),t.frameData.w,t.frameData.h)}}}),Object.assign(rt,{createCharacters(){const t=$gameMap.events();for(const e of t)this.createCharacterFor(e,0);const e=$gameMap.vehicles();for(const t of e)this.createCharacterFor(t,1);const i=$gamePlayer.followers()._data;for(let t=i.length-1;t>=0;--t)this.createCharacterFor(i[t],29-t);this.createCharacterFor($gamePlayer,30)},createCharacterFor(t,e){if(!t.mv3d_sprite){const i=new characters_Character(t,e);return Object.defineProperty(t,"mv3d_sprite",{value:i,configurable:!0}),this.characters.push(i),i}return t.mv3d_sprite},updateCharacters(){for(const t of this.characters)t.update()},setupSpriteMeshes(){characters_Sprite.Meshes={},characters_Sprite.Meshes.FLAT=G.MergeMeshes([B.CreatePlane("sprite mesh",{sideOrientation:W},rt.scene).rotate(_,Math.PI/2,Q)]),characters_Sprite.Meshes.SPRITE=G.MergeMeshes([B.CreatePlane("sprite mesh",{sideOrientation:W},rt.scene).translate(T,.5,Q)]),characters_Sprite.Meshes.CROSS=G.MergeMeshes([characters_Sprite.Meshes.SPRITE.clone(),characters_Sprite.Meshes.SPRITE.clone().rotate(T,Math.PI/2,Q)]),characters_Sprite.Meshes.SHADOW=characters_Sprite.Meshes.FLAT.clone("shadow mesh");const t=new H(`${rt.MV3D_FOLDER}/shadow.png`),e=new V("shadow material",rt.scene);e.diffuseTexture=t,e.opacityTexture=t,characters_Sprite.Meshes.SHADOW.material=e;for(const t in characters_Sprite.Meshes)rt.scene.removeMesh(characters_Sprite.Meshes[t])}});class characters_Sprite extends R{constructor(){super("sprite",rt.scene),this.spriteOrigin=new R("sprite origin",rt.scene),this.spriteOrigin.parent=this,this.mesh=characters_Sprite.Meshes.FLAT.clone(),this.mesh.parent=this.spriteOrigin}setMaterial(t){this.disposeMaterial(),this.texture=new H(t,rt.scene),this.bitmap=this.texture._texture,this.texture.hasAlpha=!0,this.texture.onLoadObservable.addOnce(()=>this.onTextureLoaded()),this.material=new V("sprite material",rt.scene),this.material.diffuseTexture=this.texture,this.material.alphaCutOff=rt.ALPHA_CUTOFF,this.material.ambientColor.set(1,1,1),this.material.specularColor.set(0,0,0),this.mesh.material=this.material}onTextureLoaded(){this.texture.updateSamplingMode(1)}disposeMaterial(){this.material&&(this.material.dispose(!0,!0),this.material=null,this.texture=null,this.bitmap=null)}dispose(...t){this.disposeMaterial(),super.dispose(...t)}}class characters_Character extends characters_Sprite{constructor(t,e){super(),this.order=e,this.mesh.order=this.order,this.mesh.character=this,this._character=this.char=t,this.charName="",this.charIndex=0,this.updateCharacter(),this.updateShape(),this.isVehicle=this.char instanceof Game_Vehicle,this.isBoat=this.isVehicle&&this.char.isBoat(),this.isShip=this.isVehicle&&this.char.isShip(),this.isAirship=this.isVehicle&&this.char.isAirship(),this.isEvent=this.char instanceof Game_Event,this.isPlayer=this.char instanceof Game_Player,this.isFollower=this.char instanceof Game_Follower,this.elevation=0,this.char.mv3d_blenders||(this.char.mv3d_blenders={}),rt.CHARACTER_SHADOWS&&(this.shadow=characters_Sprite.Meshes.SHADOW.clone(),this.shadow.parent=this.spriteOrigin),this.lightOrigin=new R("light origin",rt.scene),this.lightOrigin.parent=this,this.setupLights(),this.isEvent&&this.eventConfigure()}isTextureReady(){return Boolean(this.texture&&this.texture.isReady())}setTileMaterial(){const t=rt.getSetNumber(this._tileId),e=$gameMap.tileset().tilesetNames[t];if(e){const t=`img/tilesets/${e}.png`;this.setMaterial(t)}else this.setMaterial("MV3D/errorTexture.png")}onTextureLoaded(){super.onTextureLoaded(),this.updateFrame(),this.updateScale()}updateCharacter(){this._tilesetId=$gameMap.tilesetId(),this._tileId=this._character.tileId(),this._characterName=this._character.characterName(),this._characterIndex=this._character.characterIndex(),this._isBigCharacter=ImageManager.isBigCharacter(this._characterName),this._tileId>0?this.setTileMaterial(this._tileId):this._characterName&&this.setMaterial(`img/characters/${this._characterName}.png`)}updateCharacterFrame(){if(this.px=this.characterPatternX(),this.py=this.characterPatternY(),!this.isTextureReady())return;const t=this.patternWidth(),e=this.patternHeight(),i=(this.characterBlockX()+this.px)*t,a=(this.characterBlockY()+this.py)*e;this.setFrame(i,a,t,e)}patternChanged(){return this.px!==this.characterPatternX()||this.py!==this.characterPatternY()}characterPatternY(){if(this.isEvent&&this.char.isObjectCharacter())return this.char.direction()/2-1;return rt.transformDirectionYaw(this.char.direction())/2-1}setFrame(t,e,i,a){this.isTextureReady()&&this.texture.crop(t,e,i,a)}updateScale(){if(!this.isTextureReady())return;const t=this.getConfig("scale",new x(1,1));let e=1;if(this.isVehicle){const t=rt[`${this.char._type.toUpperCase()}_SETTINGS`];e=rt.loadData(`${this.char._type}_scale`,t.scale)}const i=this.patternWidth()/d()*t.x*e,a=this.patternHeight()/d()*t.y*e;this.mesh.scaling.set(i,a,a)}getConfig(t,e){return this.settings_event?t in this.settings_event_page?this.settings_event_page[t]:t in this.settings_event?this.settings_event[t]:e:e}hasConfig(t){return!!this.settings_event&&(t in this.settings_event_page||t in this.settings_event)}eventConfigure(){if(!this.settings_event){this.settings_event={};const t=this.char.event().note;rt.readConfigurationFunctions(rt.readConfigurationTags(t),rt.eventConfigurationFunctions,this.settings_event)}this.settings_event_page={};const t=this.char.page();if(!t)return;let e="";for(const i of t.list)108!==i.code&&408!==i.code||(e+=i.parameters[0]);if(rt.readConfigurationFunctions(rt.readConfigurationTags(e),rt.eventConfigurationFunctions,this.settings_event_page),this.updateScale(),this.updateShape(),this.char.mv3d_needsConfigure){if(this.char.mv3d_needsConfigure=!1,"pos"in this.settings_event_page){const t=this.char.event(),e=this.settings_event_page.pos;this.char.locate(o(t.x,e.x),o(t.y,e.y))}if(this.setupEventLights(),"lamp"in this.settings_event_page){const t=this.getConfig("lamp");this.blendLampColor.setValue(t.color,.5),this.blendLampIntensity.setValue(t.intensity,.5),this.blendLampDistance.setValue(t.distance,.5)}if("flashlight"in this.settings_event_page){const t=this.getConfig("flashlight");this.blendFlashlightColor.setValue(t.color,.5),this.blendFlashlightIntensity.setValue(t.intensity,.5),this.blendFlashlightDistance.setValue(t.distance,.5),this.blendFlashlightAngle.setValue(t.angle,.5),this.blendFlashlightPitch.setValue(this.getConfig("flashlightPitch",90),.25),this.flashlightTargetYaw=this.getConfig("flashlightYaw","+0")}}}setupMesh(){this.mesh.parent=this.spriteOrigin,this.mesh.character=this,this.mesh.order=this.order,this.material&&(this.mesh.material=this.material),this.flashlight&&(this.flashlight.excludedMeshes.splice(0,1/0),this.flashlight.excludedMeshes.push(this.mesh))}setupEventLights(){const t=this.getConfig("flashlight"),e=this.getConfig("lamp");t&&!this.flashlight&&this.setupFlashlight(),e&&!this.lamp&&this.setupLamp()}setupLights(){"flashlightColor"in this.char.mv3d_blenders&&this.setupFlashlight(),"lampColor"in this.char.mv3d_blenders&&this.setupLamp()}setupFlashlight(){if(this.flashlight)return;const t=this.getConfig("flashlight",{color:16777215,intensity:1,distance:rt.LIGHT_DIST,angle:rt.LIGHT_ANGLE});this.blendFlashlightColor=this.makeColorBlender("flashlightColor",t.color),this.blendFlashlightIntensity=this.makeBlender("flashlightIntensity",t.intensity),this.blendFlashlightDistance=this.makeBlender("flashlightDistance",t.distance),this.blendFlashlightAngle=this.makeBlender("flashlightAngle",t.angle),this.flashlight=new w("flashlight",F.Zero(),F.Zero(),g(this.blendFlashlightAngle.targetValue()+rt.FLASHLIGHT_EXTRA_ANGLE),0,rt.scene),this.updateFlashlightExp(),this.flashlight.range=this.blendFlashlightDistance.targetValue(),this.flashlight.intensity=this.blendFlashlightIntensity.targetValue(),this.flashlight.diffuse.set(...this.blendFlashlightColor.targetComponents()),this.flashlight.direction.y=-1,this.flashlightOrigin=new R("flashlight origin",rt.scene),this.flashlightOrigin.parent=this.lightOrigin,this.flashlight.parent=this.flashlightOrigin,this.blendFlashlightPitch=this.makeBlender("flashlightPitch",70),this.blendFlashlightYaw=this.makeBlender("flashlightYaw",0),this.blendFlashlightYaw.cycle=360,this.flashlightTargetYaw=this.getConfig("flashlightYaw","+0"),this.updateFlashlightDirection(),this.setupMesh()}updateFlashlightExp(){this.flashlight.exponent=64800*Math.pow(this.blendFlashlightAngle.targetValue(),-2)}setupLamp(){if(this.lamp)return;const t=this.getConfig("lamp",{color:16777215,intensity:1,distance:rt.LIGHT_DIST});this.blendLampColor=this.makeColorBlender("lampColor",t.color),this.blendLampIntensity=this.makeBlender("lampIntensity",t.intensity),this.blendLampDistance=this.makeBlender("lampDistance",t.distance),this.lamp=new v("lamp",F.Zero(),rt.scene),this.lamp.diffuse.set(...this.blendLampColor.targetComponents()),this.lamp.intensity=this.blendLampIntensity.targetValue(),this.lamp.range=this.blendLampDistance.targetValue(),this.lamp.parent=this.lightOrigin}updateFlashlightDirection(){this.flashlightOrigin.yaw=this.blendFlashlightYaw.currentValue(),this.flashlightOrigin.pitch=-this.blendFlashlightPitch.currentValue(),this.flashlightOrigin.position.set(0,0,0);let t=Math.tan(g(90-this.blendFlashlightAngle.currentValue()-Math.max(90,this.blendFlashlightPitch.currentValue())+90))*rt.LIGHT_HEIGHT;t=Math.max(0,Math.min(1,t)),this.flashlight.range+=t,this.flashlightOrigin.translate(T,t,tt)}updateLights(){if(this.flashlight){const t=180+o(rt.dirToYaw(this.char.direction()),this.flashlightTargetYaw);t!==this.blendFlashlightYaw.targetValue()&&this.blendFlashlightYaw.setValue(t,.25),this.blendFlashlightColor.update()|this.blendFlashlightIntensity.update()|this.blendFlashlightDistance.update()|this.blendFlashlightAngle.update()|this.blendFlashlightYaw.update()|this.blendFlashlightPitch.update()&&(this.flashlight.diffuse.set(...this.blendFlashlightColor.currentComponents()),this.flashlight.intensity=this.blendFlashlightIntensity.currentValue(),this.flashlight.range=this.blendFlashlightDistance.currentValue(),this.flashlight.angle=g(this.blendFlashlightAngle.currentValue()+rt.FLASHLIGHT_EXTRA_ANGLE),this.updateFlashlightExp(),this.updateFlashlightDirection())}this.lamp&&this.blendLampColor.update()|this.blendLampIntensity.update()|this.blendLampDistance.update()&&(this.lamp.diffuse.set(...this.blendLampColor.currentComponents()),this.lamp.intensity=this.blendLampIntensity.currentValue(),this.lamp.range=this.blendLampDistance.currentValue())}makeBlender(t,e,i=blenders_Blender){t in this.char.mv3d_blenders?e=this.char.mv3d_blenders[t]:this.char.mv3d_blenders[t]=e;const a=new i(t,e);return a.storageLocation=()=>this.char.mv3d_blenders,a}makeColorBlender(t,e){return this.makeBlender(t,e,ColorBlender)}hasBush(){return this.isEvent?this.getConfig("bush",!this._tileId):!this.isVehicle||rt.VEHICLE_BUSH}getShape(){return this.getConfig("shape",this.char.isTile()?rt.configurationShapes.FLAT:rt.EVENT_SHAPE)}updateShape(){const t=this.getShape();if(this.shape===t)return;this.shape=t;let e=characters_Sprite.Meshes.SPRITE;const i=rt.configurationShapes;switch(this.shape){case i.FLAT:e=characters_Sprite.Meshes.FLAT;break;case i.XCROSS:case i.CROSS:e=characters_Sprite.Meshes.CROSS;break;case i.FENCE:}this.mesh.dispose(),this.mesh=e.clone(),this.setupMesh()}update(){this.char._erased&&this.dispose(),this.visible=this.char.mv_sprite.visible,"function"==typeof this.char.isVisible&&(this.visible=this.visible&&this.char.isVisible()),this.material||(this.visible=!1),this._isEnabled?this.visible||this.setEnabled(!1):this.visible&&this.setEnabled(!0),this._isEnabled&&(this.material?this.updateNormal():this.updateEmpty())}updateNormal(){this.isImageChanged()&&this.updateCharacter(),this.patternChanged()&&this.updateFrame();const t=rt.configurationShapes;this.shape===t.SPRITE?(this.mesh.pitch=rt.blendCameraPitch.currentValue()-90,this.mesh.yaw=rt.blendCameraYaw.currentValue()):this.shape===t.TREE?(this.mesh.pitch=0,this.mesh.yaw=rt.blendCameraYaw.currentValue()):(this.mesh.pitch=0,this.mesh.yaw=this.getConfig("rot",0),this.shape===t.XCROSS&&(this.mesh.yaw+=45)),this.char===$gamePlayer&&(this.mesh.visibility=+!rt.is1stPerson(!0)),this.updateAlpha(),this.tileHeight=rt.getWalkHeight(this.char._realX,this.char._realY),this.updatePosition(),this.updateElevation(),this.shadow&&this.updateShadow(),this.updateLights()}updateEmpty(){this.tileHeight=rt.getWalkHeight(this.char._realX,this.char._realY),this.updatePosition(),this.updateElevation(),this.updateLights()}updateAlpha(){let t=this.hasConfig("alpha");this.bush=Boolean(this.char.bushDepth()),this.bush&&this.hasBush()?(t=!0,this.material.opacityTexture||(this.material.opacityTexture=rt.getBushAlphaTexture(),this.material.useAlphaFromDiffuseTexture=!0)):this.material.opacityTexture&&(this.material.opacityTexture=null,this.material.useAlphaFromDiffuseTexture=!1),t?(this.material.useAlphaFromDiffuseTexture=!0,this.material.alpha=this.getConfig("alpha",1)):(this.material.useAlphaFromDiffuseTexture=!1,this.material.alpha=1)}updatePosition(){const t=rt.loopCoords(this.char._realX,this.char._realY);this.x=t.x,this.y=t.y,this.spriteOrigin.position.set(0,0,0),this.lightOrigin.position.set(0,0,0),this.spriteOrigin.z=4*rt.LAYER_DIST,this.lightOrigin.z=this.getConfig("lightHeight",rt.LIGHT_HEIGHT);const e=new x(Math.sin(-rt.cameraNode.rotation.y),Math.cos(rt.cameraNode.rotation.y)).multiplyByFloats(.45,.45),i=this.getConfig("lightOffset",null);this.shape===rt.configurationShapes.SPRITE?(this.spriteOrigin.x=e.x,this.spriteOrigin.y=e.y,this.lightOrigin.x=e.x,this.lightOrigin.y=e.y):i||(this.lightOrigin.x=e.x/2,this.lightOrigin.y=e.y/2),i&&(this.lightOrigin.x+=i.x,this.lightOrigin.y+=i.y),this.spriteOrigin.x+=this.getConfig("x",0),this.spriteOrigin.y+=this.getConfig("y",0)}updateElevation(){let t=this.tileHeight;if((this.isVehicle||(this.isPlayer||this.isFollower)&&$gamePlayer.vehicle())&&(t+=rt.getFloatHeight(Math.round(this.char._realX),Math.round(this.char._realY)),this.char===$gameMap.vehicle("boat")?t+=rt.BOAT_SETTINGS.zoff:this.char===$gameMap.vehicle("ship")&&(t+=rt.SHIP_SETTINGS.zoff)),this.isAirship&&$gamePlayer.vehicle()===this.char){if(this.char._driving||(this.elevation+=(t-this.elevation)/10),t>=this.elevation){const e=100/Math.pow(1.5,rt.loadData("airship_ascentspeed",4));this.elevation+=(t-this.elevation)/e}else if(!rt.vehicleObstructed(this.char,this.char.x,this.char.y,!0)){const e=100/Math.pow(1.5,rt.loadData("airship_descentspeed",2));this.elevation+=(t-this.elevation)/e}this.z=this.elevation,this.z+=rt.loadData("airship_height",rt.AIRSHIP_SETTINGS.height)*this.char._altitude/this.char.maxAltitude()}else if(this.char.isJumping()){let t=1-this.char._jumpCount/(2*this.char._jumpPeak),e=-4*Math.pow(t-.5,2)+1,i=Math.abs(this.char.mv3d_jumpHeightEnd-this.char.mv3d_jumpHeightStart);this.z=this.char.mv3d_jumpHeightStart*(1-t)+this.char.mv3d_jumpHeightEnd*t+e*i/2+this.char.jumpHeight()/d()}else this.elevation=t,this.z=this.elevation;this.isEvent&&(this.z+=this.getConfig("height",2===this.char._priorityType?rt.EVENT_HEIGHT:0),this.hasConfig("z")&&(this.z=this.getConfig("z",0)))}updateShadow(){let t=Boolean(this.getConfig("shadow",this.shape!=rt.configurationShapes.FLAT));if(t&&(this.isPlayer||this.isFollower)){const e=rt.characters.indexOf(this);if(e>=0)for(let i=e+1;i<rt.characters.length;++i){const e=rt.characters[i];if(e.shadow&&e.visible&&(e.char._realX===this.char._realX&&e.char._realY===this.char._realY)){t=!1;break}}}if(this.shadow._isEnabled?t||this.shadow.setEnabled(!1):t&&this.shadow.setEnabled(!0),!t)return;const e=Math.min(0,this.getConfig("height",0)),i=Math.max(this.z-this.tileHeight,e),a=this.isAirship?rt.AIRSHIP_SETTINGS.shadowDist:rt.SHADOW_DIST,s=Math.max(0,1-Math.abs(i)/a);this.shadow.z=-i;const r=this.isAirship?rt.AIRSHIP_SETTINGS.shadowScale:this.getConfig("shadow",rt.SHADOW_SCALE);this.shadow.scaling.setAll(r*s),this.shadow.isAnInstance||(this.shadow.visibility=s-.5*this.bush)}dispose(...t){super.dispose(...t),delete this.char.mv3d_sprite}}for(const t of["characterBlockX","characterBlockY","characterPatternX","isImageChanged","patternWidth","patternHeight","updateTileFrame","updateFrame"])characters_Character.prototype[t]=Sprite_Character.prototype[t];Object.assign(rt,{vehicleObstructed:(t,...e)=>vt.apply(t,e)});const It=Game_CharacterBase.prototype.canPass;function wt(t,e,i=!0){if(!(this instanceof Game_Vehicle))throw"This isn't a vehicle.";if(!this.mv3d_sprite)return!0;if(!this._driving)return!0;if($gamePlayer.isDebugThrough())return!0;const a=this.isAirship(),s=rt[`${this._type.toUpperCase()}_SETTINGS`],r=rt.loadData(`${this._type}_big`,s.big);let h=.5;a?h=rt.loadData("airship_height",rt.AIRSHIP_SETTINGS.height):h+=rt.getFloatHeight(t,e);const n=rt.getWalkHeight(t,e);let o=this.mv3d_sprite.z;if("zoff"in s&&(o-=s.zoff),n>o)return!1;if(!r)return!0;for(let a=-1;a<=1;++a)for(let s=-1;s<=1;++s){if(0===a&&0===s||!i&&a&&s)continue;const r=rt.getWalkHeight(t+a,e+s);if(r>n+h*!i&&(i||r>o))return!1}return!0}function vt(){return!wt.apply(this,arguments)}Game_CharacterBase.prototype.canPass=function(t,e,i){if(!It.apply(this,arguments))return!1;const a=$gameMap.roundXWithDirection(t,i),s=$gameMap.roundYWithDirection(e,i);if(this===$gamePlayer){const t=this.vehicle();if(t){const e=vt.call(t,a,s,!1);if(t.isAirship())return!e;if(e)return!1}}if(this.isThrough()||this.isDebugThrough())return!0;const r=rt.getWalkHeight(t,e),h=rt.getWalkHeight(a,s);return r===h};const At=Game_Map.prototype.isAirshipLandOk;Game_Map.prototype.isAirshipLandOk=function(t,e){return!vt.call(this.airship(),t,e,!0)&&(rt.AIRSHIP_SETTINGS.bushLanding?this.checkPassage(t,e,15):At.apply(this,arguments))};const xt=Game_Player.prototype.updateVehicleGetOn;Game_Player.prototype.updateVehicleGetOn=function(){const t=this.vehicle(),e=rt.loadData(`${t._type}_speed`,t._moveSpeed);this.vehicle().setMoveSpeed(e),xt.apply(this,arguments)};const Ft=Game_CharacterBase.prototype.jump;Game_CharacterBase.prototype.jump=function(t,e){this.mv3d_jumpHeightStart=rt.getWalkHeight(this.x,this.y),this.mv3d_jumpHeightEnd=rt.getWalkHeight(this.x+t,this.y+e),Ft.apply(this,arguments)};const Lt=Game_Map.prototype.parallaxOx;Game_Map.prototype.parallaxOx=function(){let t=Lt.apply(this,arguments);return this._parallaxLoopX?t-816*rt.blendCameraYaw.currentValue()/90:t};const Nt=Game_Map.prototype.parallaxOy;Game_Map.prototype.parallaxOy=function(){let t=Nt.apply(this,arguments);return this._parallaxLoopY?t-816*rt.blendCameraPitch.currentValue()/90:t},Game_Map.prototype.setDisplayPos=function(){},Game_Map.prototype.scrollUp=function(){},Game_Map.prototype.scrollDown=function(){},Game_Map.prototype.scrollLeft=function(){},Game_Map.prototype.scrollRight=function(){},Game_Map.prototype.updateScroll=function(){this._displayX=816*-rt.blendCameraYaw.currentValue()/3600,this._displayY=816*-rt.blendCameraPitch.currentValue()/3600},Game_CharacterBase.prototype.isNearTheScreen=function(){return Math.abs(this.x-rt.cameraStick.position.x)<=rt.RENDER_DIST&&Math.abs(-this.y-rt.cameraStick.position.y)<=rt.RENDER_DIST};const Dt=Scene_Boot.prototype.start;Scene_Boot.prototype.start=function(){Dt.apply(this,arguments),rt.setupSerializer()};const Pt=Utils.isOptionValid("test");let Ot;DataManager._databaseFiles.push({name:"mv3d_data",src:`../${rt.MV3D_FOLDER}/mv3d_data.json`});const Rt={get:(t,e)=>t[e]&&"object"==typeof t[e]?new Proxy(t[e],Rt):t[e],set(t,e,i){Ot._dirty=!0,t[e]=i}};let Ht=!1;Object.assign(rt,{setupSerializer(){Ot=mv3d_data,Pt&&(mv3d_data=new Proxy(Ot,Rt))},async updateSerializer(){Pt&&Ot._dirty&&!Ht&&(Ht=!0,Ot._dirty=!1,await Vt(`${rt.MV3D_FOLDER}/mv3d_data.json`,JSON.stringify(Ot)),Ht=!1)},async loadFinalizedCells(t){const e=new Y(this.scene);for(const i of t){const t=[vector2.x,vector2.y].toString();e.addMeshTask(t,"","./",`${rt.MV3D_FOLDER}/finalizedMaps/${$gameMap.mapId().padZero(3)}/${t}.babylon`)}e.load()},async finalizeCell(t){const e=k.SerializeMesh(t.mesh),i=`${rt.MV3D_FOLDER}/finalizedMaps/${$gameMap.mapId().padZero(3)}/${[t.cx,t.cy]}.babylon`;await Vt(i,JSON.stringify(e))},openMenu(){$gameMessage.setChoices(["Finalize this cell","Definalize this cell","Finalize all loaded cells","Definalize all cells"],0),$gameMessage.setChoicePositionType(1),$gameMessage.setChoiceCallback(t=>{})}});const Vt=async(t,e)=>{const a=i(0),s=i(1),r=s.resolve(global.__dirname,t);await Gt(s.dirname(r)),await new Promise((t,i)=>{a.writeFile(r,e,e=>{e?i(e):t()})})},Gt=t=>new Promise((e,a)=>{const s=i(0),r=i(1);s.mkdir(r.resolve(global.__dirname,t),{recursive:!0},t=>{t&&"EEXIST"!==t.code?a(t):e()})})}]);
//# sourceMappingURL=mv3d-babylon.js.map