/*:
@plugindesc 3D rendering in RPG Maker MV with babylon.js
@author Dread/Nyanak
@version 0.2.1
@help
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

	alphaTest(n)

Doesn't render any pixels below the alphaTest value.  
0 means all alpha will be rendered. 1 means no alpha.  
Can be useful for removing unwanted shadows in the textures.  

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
@default ["{\"regionId\":\"1\",\"height\":\"1.0\"}","{\"regionId\":\"2\",\"height\":\"2.0\"}","{\"regionId\":\"3\",\"height\":\"3.0\"}","{\"regionId\":\"4\",\"height\":\"4.0\"}","{\"regionId\":\"5\",\"height\":\"5.0\"}","{\"regionId\":\"6\",\"height\":\"6.0\"}","{\"regionId\":\"7\",\"height\":\"7.0\"}"]

@param ttags
@text Terrain Tags
@desc use terrain tags to determine tile height.
@parent tileconfig
@type struct<TTagHeight>[]
@default ["{\"terrainTag\":\"1\",\"height\":\"1.0\",\"topOffsetX\":\"0\",\"topOffsetY\":\"0\",\"sideOffsetX\":\"0\",\"sideOffsetY\":\"0\",\"shape\":\"XCROSS\"}","{\"terrainTag\":\"2\",\"height\":\"1.0\",\"topOffsetX\":\"0\",\"topOffsetY\":\"0\",\"sideOffsetX\":\"0\",\"sideOffsetY\":\"0\",\"shape\":\"FENCE\"}"]

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

@param height
@text Height
@type Number
@min -9999 @max 9999
@decimals 1
@default 2.0
*/
/*~struct~TTagHeight:
@param terrainTag
@text Terrain Tag
@type Number
@min 1 @max 7
@default 1

@param height
@text Height
@type Number
@min -9999 @max 9999
@decimals 1
@default 2.0

@param topOffsetX
@text Top Offset X
@desc use the tile left or right of this as top texture
@type Number
@min -9999 @max 9999
@default 0

@param topOffsetY
@text Top Offset Y
@desc use the tile above or below this as top texture
@type Number
@min -9999 @max 9999
@default 0

@param sideOffsetX
@text Side Offset X
@desc use the tile left or right of this as side texture
@type Number
@min -9999 @max 9999
@default 0

@param sideOffsetY
@text Side Offset Y
@desc use the tile above or below this as side texture
@type Number
@min -9999 @max 9999
@default 0

@param shape
@text Tile Shape
@type combo
@type combo
@option FLAT
@option FENCE
@option CROSS
@option XCROSS
@default FLAT
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

*/!function(t){var e={};function i(a){if(e[a])return e[a].exports;var s=e[a]={i:a,l:!1,exports:{}};return t[a].call(s.exports,s,s.exports,i),s.l=!0,s.exports}i.m=t,i.c=e,i.d=function(t,e,a){i.o(t,e)||Object.defineProperty(t,e,{enumerable:!0,get:a})},i.r=function(t){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})},i.t=function(t,e){if(1&e&&(t=i(t)),8&e)return t;if(4&e&&"object"==typeof t&&t&&t.__esModule)return t;var a=Object.create(null);if(i.r(a),Object.defineProperty(a,"default",{enumerable:!0,value:t}),2&e&&"string"!=typeof t)for(var s in t)i.d(a,s,function(e){return t[e]}.bind(null,s));return a},i.n=function(t){var e=t&&t.__esModule?function(){return t.default}:function(){return t};return i.d(e,"a",e),e},i.o=function(t,e){return Object.prototype.hasOwnProperty.call(t,e)},i.p="",i(i.s=0)}([function(t,e,i){"use strict";i.r(e);const{Vector2:a,Vector3:s,Color3:r,Color4:h}=window.BABYLON,n=t=>{if("number"==typeof t)return{r:(t>>16)/255,g:(t>>8&255)/255,b:(255&t)/255,a:1};if(t instanceof r)return t.toColor4();if(t instanceof h)return t;{const e=document.createElement("canvas");e.width=1,e.height=1;const i=e.getContext("2d");i.fillStyle=t,i.fillRect(0,0,1,1);const a=i.getImageData(0,0,1,1).data;return new h(a[0]/255,a[1]/255,a[2]/255,a[3]/255)}},o=(t,e)=>{if(""===e)return+t;const i=/^[+]/.test(e);return i&&(e=e.substr(1)),e=Number(e),Number.isNaN(e)?+t:i?+t+e:+e},l=t=>Boolean(c(t)),c=t=>{if(!t)return!1;"string"!=typeof t&&(t=String(t));const e=t.toUpperCase();return!c.values.includes(e)&&t};c.values=["OFF","FALSE","UNDEFINED","NULL","DISABLE","DISABLED"];const p=(t=0)=>new Promise(e=>setTimeout(e,t)),g=t=>t*Math.PI/180,d=t=>180*t/Math.PI,u=()=>m(),m=()=>Game_Map.prototype.tileWidth(),f=()=>Game_Map.prototype.tileHeight(),_=new s(1,0,0),T=new s(0,1,0),b=new s(0,0,1),C=new a(0,0),I=(new s(0,0,0),window.BABYLON),{Scene:S,Engine:y,FreeCamera:E,HemisphericLight:M,DirectionalLight:w,SpotLight:A,PointLight:v,ShadowGenerator:N,Vector2:L,Vector3:x,Vector4:P,Color3:D,Color4:F,Plane:O,Node:H,TransformNode:V,Texture:R,StandardMaterial:G,Mesh:B,MeshBuilder:$}=I,{FRONTSIDE:Y,BACKSIDE:k,DOUBLESIDE:z}=B,{PERSPECTIVE_CAMERA:X,ORTHOGRAPHIC_CAMERA:W}=I.Camera,{FOGMODE_NONE:j,FOGMODE_EXP:U,FOGMODE_EXP2:Z,FOGMODE_LINEAR:K}=S,J=I.Space.WORLD,q=I.Space.LOCAL;I.Space.BONE;R.prototype.crop=function(t=0,e=0,i=0,a=0){const{width:s,height:r}=this.getBaseSize();i||(i=s-t),a||(a=r-e),at.EDGE_FIX&&(t+=at.EDGE_FIX,e+=at.EDGE_FIX,i-=2*at.EDGE_FIX,a-=2*at.EDGE_FIX),this.uScale=i/s,this.vScale=a/r,this.uOffset=t/s,this.vOffset=1-e/r-this.vScale},Object.defineProperties(H.prototype,{x:{get(){return this.position?this.position.x:void 0},set(t){this.position&&(this.position.x=t)}},y:{get(){return this.position?-this.position.z:void 0},set(t){this.position&&(this.position.z=-t)}},z:{get(){return this.position?this.position.y:void 0},set(t){this.position&&(this.position.y=t)}},pitch:{get(){return this.rotation?-d(this.rotation.x):void 0},set(t){this.rotation&&(this.rotation.x=-g(t))}},yaw:{get(){return this.rotation?-d(this.rotation.y):void 0},set(t){this.rotation&&(this.rotation.y=-g(t))}},roll:{get(){return this.rotation?-d(this.rotation.z):void 0},set(t){this.rotation&&(this.rotation.z=-g(t))}}}),Object.defineProperty(B.prototype,"order",{get(){return this._order},set(t){this._order=t,this._scene.sortMeshes()}});const Q=(t,e)=>(0|t._order)-(0|e._order);S.prototype.sortMeshes=function(){this.meshes.sort(Q)};const tt=S.prototype.addMesh;S.prototype.addMesh=function(t){tt.apply(this,arguments),"number"==typeof t._order&&this.sortMeshes()};const et=S.prototype.removeMesh;S.prototype.removeMesh=function(t){et.apply(this,arguments),this.sortMeshes()},D.prototype.toNumber=F.prototype.toNumber=function(){return 255*this.r<<16|255*this.g<<8|255*this.b};const it={setup(){this.setupParameters(),this.canvas=document.createElement("canvas"),this.texture=PIXI.Texture.fromCanvas(this.canvas),this.engine=new y(this.canvas,this.ANTIALIASING),this.scene=new S(this.engine),this.scene.clearColor.set(0,0,0,0),this.cameraStick=new V("cameraStick",this.scene),this.cameraNode=new V("cameraNode",this.scene),this.cameraNode.parent=this.cameraStick,this.camera=new E("camera",new x(0,0,0),this.scene),this.camera.parent=this.cameraNode,this.camera.fov=g(it.FOV),this.camera.orthoLeft=-Graphics.width/2/u(),this.camera.orthoRight=Graphics.width/2/u(),this.camera.orthoTop=Graphics.height/2/u(),this.camera.orthoBottom=-Graphics.height/2/u(),this.camera.minZ=.1,this.camera.maxZ=this.RENDER_DIST,this.scene.ambientColor=new D(1,1,1),this.scene.fogMode=K,this.map=new H("map",this.scene),this.cells={},this.characters=[],this.setupBlenders(),this.setupInput(),this.setupSpriteMeshes()},updateCanvas(){this.canvas.width=Graphics._width,this.canvas.height=Graphics._height},render(){this.scene.render(),this.texture.update()},lastMapUpdate:0,update(){performance.now()-this.lastMapUpdate>1e3&&!this.mapUpdating&&(this.updateMap(),this.lastMapUpdate=performance.now()),this.updateAnimations(),this.updateBlenders(),this.updateCharacters(),(it.KEYBOARD_TURN||this.is1stPerson())&&(Input.isTriggered("rotleft")?this.blendCameraYaw.setValue(this.blendCameraYaw.targetValue()+90,.5):Input.isTriggered("rotright")&&this.blendCameraYaw.setValue(this.blendCameraYaw.targetValue()-90,.5),this.is1stPerson()&&(Input.isTriggered("rotleft")||Input.isTriggered("rotright"))&&this.playerFaceYaw()),it.KEYBOARD_PITCH&&(Input.isPressed("pageup")&&Input.isPressed("pagedown")||(Input.isPressed("pageup")?this.blendCameraPitch.setValue(Math.min(180,this.blendCameraPitch.targetValue()+1.5),.1):Input.isPressed("pagedown")&&this.blendCameraPitch.setValue(Math.max(0,this.blendCameraPitch.targetValue()-1.5),.1)));for(const t in this.cells)this.cells[t].update()},loadData:(t,e)=>$gameVariables&&$gameVariables.mv3d&&t in $gameVariables.mv3d?$gameVariables.mv3d[t]:e,saveData(t,e){if(!$gameVariables)return console.warn(`MV3D: Couldn't save data ${t}:${e}`);$gameVariables.mv3d||($gameVariables.mv3d={}),$gameVariables.mv3d[t]=e},updateCameraMode(){this.cameraMode.startsWith("O")?this.camera.mode!==W&&(this.camera.mode=W):this.camera.mode!==X&&(this.camera.mode=X)},get cameraMode(){return this.loadData("cameraMode",this.CAMERA_MODE).toUpperCase()},set cameraMode(t){t=String(t).toUpperCase().startsWith("O")?"ORTHOGRAPHIC":"PERSPECTIVE",this.saveData("cameraMode",t),this.updateBlenders(!0)},is1stPerson(t){const e=t?"currentValue":"targetValue";return this.getCameraTarget()===$gamePlayer&&this.blendCameraTransition[e]()<=0&&this.blendCameraDist[e]()<=0&&0===this.blendPanX[e]()&&0===this.blendPanY[e]()},loopCoords(t,e){if($gameMap.isLoopHorizontal()){const e=$gameMap.width(),i=this.cameraStick.x-e/2;t=(t-i).mod(e)+i}if($gameMap.isLoopVertical()){const t=$gameMap.height(),i=this.cameraStick.y-t/2;e=(e-i).mod(t)+i}return new L(t,e)},playerFaceYaw(){let t=Math.floor((45-it.blendCameraYaw.targetValue())/90).mod(4);t>1&&(t+=(t+1)%2*2-1),t=10-(2*t+2),$gamePlayer.setDirection(t)},dirToYaw(t){let e=t/2-1;return e>1&&(e+=(e+1)%2*2-1),e=-90*e+180},transformDirectionYaw(t,e=this.blendCameraYaw.currentValue(),i=!1){if(0==t)return 0;(t=t/2-1)>1&&(t+=(t+1)%2*2-1);const a=Math.floor((e+45)/90);return(t=i?(t-a).mod(4):(t+a).mod(4))>1&&(t+=(t+1)%2*2-1),2*t+2}};window.mv3d=it;var at=it;const st=Graphics._createCanvas;Graphics._createCanvas=function(){at.setup(),at.updateCanvas(),st.apply(this,arguments)};const rt=Graphics._updateAllElements;Graphics._updateAllElements=function(){rt.apply(this,arguments),at.updateCanvas()};const ht=Graphics.render;Graphics.render=function(){at.render(),ht.apply(this,arguments)};const nt=Scene_Map.prototype.update;Scene_Map.prototype.update=function(){nt.apply(this,arguments),at.update()},ShaderTilemap.prototype.renderWebGL=function(t){};const ot=Spriteset_Map.prototype.createTilemap;Spriteset_Map.prototype.createTilemap=function(){ot.apply(this,arguments),this._tilemap.visible=!1,this._baseSprite.addChild(new PIXI.Sprite(at.texture))};const lt=Sprite_Character.prototype.setCharacter;Sprite_Character.prototype.setCharacter=function(t){lt.apply(this,arguments),Object.defineProperty(t,"mv_sprite",{value:this,configurable:!0})};const ct=Game_Player.prototype.performTransfer;Game_Player.prototype.performTransfer=function(){const t=this._newMapId!==$gameMap.mapId();t&&at.clearMap(),ct.apply(this,arguments)};const pt=Scene_Map.prototype.onMapLoaded;Scene_Map.prototype.onMapLoaded=function(){pt.apply(this,arguments),at.mapLoaded||at.loadMap(),at.updateBlenders(!0)};const gt=PluginManager.parameters("mv3d-babylon");Object.assign(at,{CAMERA_MODE:"PERSPECTIVE",ORTHOGRAPHIC_DIST:100,ANIM_DELAY:Number(gt.animDelay),ALPHA_CUTOFF:Math.max(.01,gt.alphatest),EDGE_FIX:Number(gt.edgefix),ANTIALIASING:l(gt.antialiasing),FOV:Number(gt.fov),WALL_HEIGHT:Number(gt.wallHeight),TABLE_HEIGHT:Number(gt.tableHeight),FRINGE_HEIGHT:Number(gt.fringeHeight),CEILING_HEIGHT:Number(gt.ceilingHeight),LAYER_DIST:Number(gt.layerDist),CELL_SIZE:10,RENDER_DIST:Number(gt.renderDist),FOG_COLOR:n(gt.fogColor).toNumber(),FOG_NEAR:Number(gt.fogNear),FOG_FAR:Number(gt.fogFar),AMBIENT_COLOR:n(gt.ambientColor).toNumber(),LIGHT_HEIGHT:.5,LIGHT_DECAY:1,LIGHT_DIST:3,LIGHT_ANGLE:45,CHARACTER_SHADOWS:l(gt.characterShadows),SHADOW_SCALE:Number(gt.shadowScale),SHADOW_DIST:Number(gt.shadowDist),KEYBOARD_PITCH:l(gt.keyboardPitch),KEYBOARD_TURN:l(gt.keyboardTurn),KEYBOARD_STRAFE:l(gt.keyboardStrafe),REGION_DATA:{},TTAG_DATA:{},EVENT_HEIGHT:Number(gt.eventHeight),VEHICLE_BUSH:l(gt.vehicleBush),BOAT_SETTINGS:JSON.parse(gt.boatSettings),SHIP_SETTINGS:JSON.parse(gt.shipSettings),AIRSHIP_SETTINGS:JSON.parse(gt.airshipSettings),setupParameters(){for(let t of JSON.parse(gt.regions))t=JSON.parse(t),this.REGION_DATA[t.regionId]={height:Number(t.height)};for(let t of JSON.parse(gt.ttags))t=JSON.parse(t),this.TTAG_DATA[t.terrainTag]={height:Number(t.height),offsetTop:new L(Number(t.topOffsetX),Number(t.topOffsetY)),offsetSide:new L(Number(t.sideOffsetX),Number(t.sideOffsetY)),shape:this.configurationShapes[t.shape.toUpperCase()]};this.BOAT_SETTINGS.scale=Number(this.BOAT_SETTINGS.scale),this.BOAT_SETTINGS.zoff=Number(this.BOAT_SETTINGS.zoff),this.BOAT_SETTINGS.big=l(this.BOAT_SETTINGS.big),this.SHIP_SETTINGS.scale=Number(this.SHIP_SETTINGS.scale),this.SHIP_SETTINGS.zoff=Number(this.SHIP_SETTINGS.zoff),this.SHIP_SETTINGS.big=l(this.SHIP_SETTINGS.big),this.AIRSHIP_SETTINGS.scale=Number(this.AIRSHIP_SETTINGS.scale),this.AIRSHIP_SETTINGS.height=Number(this.AIRSHIP_SETTINGS.height),this.AIRSHIP_SETTINGS.shadowScale=Number(this.AIRSHIP_SETTINGS.shadowScale),this.AIRSHIP_SETTINGS.shadowDist=Number(this.AIRSHIP_SETTINGS.shadowDist),this.AIRSHIP_SETTINGS.big=l(this.AIRSHIP_SETTINGS.big),this.AIRSHIP_SETTINGS.bushLanding=l(this.AIRSHIP_SETTINGS.bushLanding),this.EVENT_SHAPE=this.configurationShapes[gt.eventShape.toUpperCase()]}}),Object.assign(at,{cameraTargets:[],getCameraTarget(){return this.cameraTargets[0]},setCameraTarget(t,e){t?(this.cameraTargets.unshift(t),this.cameraTargets.length>2&&(this.cameraTargets.length=2),this.saveData("cameraTarget",this.getTargetString(t)),this.blendCameraTransition.value=1,this.blendCameraTransition.setValue(0,e)):this.cameraTargets.length=0},clearCameraTarget(){this.cameraTargets.length=0},resetCameraTarget(){this.clearCameraTarget(),this.setCameraTarget($gamePlayer,0)},rememberCameraTarget(){const t=this.loadData("cameraTarget");t&&this.setCameraTarget(this.targetChar(t),0)},setupBlenders(){this.blendFogColor=new ColorBlender("fogColor",this.FOG_COLOR),this.blendFogNear=new blenders_Blender("fogNear",this.FOG_NEAR),this.blendFogFar=new blenders_Blender("fogFar",this.FOG_FAR),this.blendCameraYaw=new blenders_Blender("cameraYaw",0),this.blendCameraYaw.cycle=360,this.blendCameraPitch=new blenders_Blender("cameraPitch",60),this.blendCameraPitch.min=0,this.blendCameraPitch.max=180,this.blendCameraDist=new blenders_Blender("cameraDist",10),this.blendCameraHeight=new blenders_Blender("cameraHeight",.7),this.blendAmbientColor=new ColorBlender("ambientColor",this.AMBIENT_COLOR),this.blendSunlightColor=new ColorBlender("light_color",16777215),this.blendSunlightIntensity=new blenders_Blender("light_intensity",1),this.blendPanX=new blenders_Blender("panX",0),this.blendPanY=new blenders_Blender("panY",0),this.blendCameraTransition=new blenders_Blender("cameraTransition",0)},updateBlenders(t){if(this.updateCameraMode(),this.cameraTargets.length||$gamePlayer&&(this.cameraTargets[0]=$gamePlayer),this.blendCameraTransition.update()&&this.cameraTargets.length>=2){const t=this.blendCameraTransition.currentValue();let e=this.cameraTargets[0];e===$gamePlayer&&$gamePlayer.isInVehicle()&&(e=$gamePlayer.vehicle());let i=this.cameraTargets[1];i===$gamePlayer&&$gamePlayer.isInVehicle()&&(i=$gamePlayer.vehicle()),this.cameraStick.x=e._realX*(1-t)+i._realX*t,this.cameraStick.y=e._realY*(1-t)+i._realY*t,e.mv3d_sprite&&i.mv3d_sprite?this.cameraStick.z=e.mv3d_sprite.z*(1-t)+i.mv3d_sprite.z*t:e.mv3d_sprite&&(this.cameraStick.z=e.mv3d_sprite.z)}else if(this.cameraTargets.length){let t=this.getCameraTarget();t===$gamePlayer&&$gamePlayer.isInVehicle()&&(t=$gamePlayer.vehicle()),this.cameraStick.x=t._realX,this.cameraStick.y=t._realY,t.mv3d_sprite&&(this.cameraStick.z=t.mv3d_sprite.z)}this.blendPanX.update(),this.blendPanY.update(),this.cameraStick.x+=this.blendPanX.currentValue(),this.cameraStick.y+=this.blendPanY.currentValue(),t|this.blendCameraPitch.update()|this.blendCameraYaw.update()|this.blendCameraDist.update()|this.blendCameraHeight.update()&&(this.cameraNode.pitch=this.blendCameraPitch.currentValue()-90,this.cameraNode.yaw=this.blendCameraYaw.currentValue(),this.cameraNode.position.set(0,0,0),this.cameraNode.translate(b,-this.blendCameraDist.currentValue(),q),this.camera.mode===W?(this.camera.maxZ=this.RENDER_DIST,this.camera.minZ=-this.RENDER_DIST):(this.cameraNode.z<0&&(this.cameraNode.z=0),this.camera.maxZ=this.RENDER_DIST,this.camera.minZ=.1),this.cameraNode.z+=this.blendCameraHeight.currentValue()),t|this.blendFogColor.update()|this.blendFogNear.update()|this.blendFogFar.update()&&(this.scene.fogStart=this.blendFogNear.currentValue(),this.scene.fogEnd=this.blendFogFar.currentValue(),this.scene.fogColor.copyFromFloats(this.blendFogColor.r.currentValue()/255,this.blendFogColor.g.currentValue()/255,this.blendFogColor.b.currentValue()/255)),t|this.blendAmbientColor.update()&&this.scene.ambientColor.copyFromFloats(this.blendAmbientColor.r.currentValue()/255,this.blendAmbientColor.g.currentValue()/255,this.blendAmbientColor.b.currentValue()/255)}});class blenders_Blender{constructor(t,e){this.key=t,this.dfault=at.loadData(t,e),this.value=e,this.speed=1,this.max=1/0,this.min=-1/0,this.cycle=!1}setValue(t,e=0){let i=(t=Math.min(this.max,Math.max(this.min,t)))-this.value;if(i){if(this.saveValue(this.key,t),this.cycle)for(;Math.abs(i)>this.cycle/2;)this.value+=Math.sign(i)*this.cycle,i=t-this.value;this.speed=Math.abs(i)/(60*e)}}currentValue(){return this.value}targetValue(){return this.loadValue(this.key)}defaultValue(){return this.dfault}update(){const t=this.targetValue();if(this.value===t)return!1;const e=t-this.value;return this.speed>Math.abs(e)?this.value=t:this.value+=this.speed*Math.sign(e),!0}storageLocation(){return $gameVariables?($gameVariables.mv3d||($gameVariables.mv3d={}),$gameVariables.mv3d):(console.warn("MV3D: Couldn't get Blend storage location."),{})}loadValue(t){const e=this.storageLocation();return t in e?e[t]:this.dfault}saveValue(t,e){this.storageLocation()[t]=e}}class ColorBlender{constructor(t,e){this.dfault=e,this.r=new blenders_Blender(`${t}_r`,e>>16),this.g=new blenders_Blender(`${t}_g`,e>>8&255),this.b=new blenders_Blender(`${t}_b`,255&e)}setValue(t,e){this.r.setValue(t>>16,e),this.g.setValue(t>>8&255,e),this.b.setValue(255&t,e)}currentValue(){return this.r.value<<16|this.g.value<<8|this.b.value}targetValue(){return this.r.targetValue()<<16|this.g.targetValue()<<8|this.b.targetValue()}defaultValue(){return this.dfault}update(){let t=0;return t|=this.r.update(),t|=this.g.update(),t|=this.b.update(),Boolean(t)}get storageLocation(){return this.r.storageLocation}set storageLocation(t){this.r.storageLocation=t,this.g.storageLocation=t,this.b.storageLocation=t}currentComponents(){return[this.r.currentValue()/255,this.g.currentValue()/255,this.b.currentValue()/255]}targetComponents(){return[this.r.targetValue()/255,this.g.targetValue()/255,this.b.targetValue()/255]}}function dt(t,e,i){let a=void 0;return{configurable:!0,get:()=>null!=a?a:SceneManager._scene instanceof Scene_Map?at.is1stPerson()?i:e:t,set(t){a=t}}}Object.assign(Input.keyMapper,{81:"rotleft",69:"rotright",87:"up",65:"left",83:"down",68:"right"}),at.setupInput=function(){const t={left:dt("left","left","rotleft"),rotleft:dt("pageup","rotleft",at.KEYBOARD_STRAFE?"left":void 0),right:dt("right","right","rotright"),rotright:dt("pagedown","rotright",at.KEYBOARD_STRAFE?"right":void 0)};Object.defineProperties(Input.keyMapper,{37:t.left,39:t.right,81:t.rotleft,69:t.rotright,65:t.left,68:t.right})},Game_Player.prototype.getInputDirection=function(){let t=Input.dir4;return at.transformDirectionYaw(t,at.blendCameraYaw.currentValue(),!0)};const ut=Game_Player.prototype.updateMove;Game_Player.prototype.updateMove=function(){ut.apply(this,arguments),!this.isMoving()&&at.is1stPerson()&&at.playerFaceYaw()};const mt=Game_Player.prototype.moveStraight;Game_Player.prototype.moveStraight=function(t){mt.apply(this,arguments),!this.isMovementSucceeded()&&at.is1stPerson()&&at.playerFaceYaw()};const ft=t=>!!(t.isEnabled()&&t.isVisible&&t.isPickable)&&(!t.character||!t.character.isFollower&&!t.character.isPlayer);Scene_Map.prototype.processMapTouch=function(){if(TouchInput.isTriggered()||this._touchCount>0)if(TouchInput.isPressed()){if(0===this._touchCount||this._touchCount>=15){const t=at.scene.pick(TouchInput.x,TouchInput.y,ft);if(t.hit){const e={x:t.pickedPoint.x,y:-t.pickedPoint.z},i=t.pickedMesh;i.character&&(e.x=i.character.x,e.y=i.character.y),$gameTemp.setDestination(Math.round(e.x),Math.round(e.y))}}this._touchCount++}else this._touchCount=0};const _t=Game_Player.prototype.findDirectionTo;Game_Player.prototype.findDirectionTo=function(){const t=_t.apply(this,arguments);if(at.is1stPerson()&&t){let e=at.dirToYaw(t);at.blendCameraYaw.setValue(e,.25)}return t},Object.assign(at,{tilesetConfigurations:{},mapConfigurations:{},loadMapSettings(){this.tilesetConfigurations={};const t=this.readConfigurationBlocks($gameMap.tileset().note),e=/^\s*([abcde]\d?\s*,\s*\d+\s*,\s*\d+)\s*:(.*)$/gim;let i;for(;i=e.exec(t);){const t=i[1],e=this.readConfigurationFunctions(i[2],this.tilesetConfigurationFunctions),a=this.constructTileId(...t.split(","));a in this.tilesetConfigurations?Object.assign(this.tilesetConfigurations[a],e):this.tilesetConfigurations[a]=e}const a=this.mapConfigurations={};if(this.readConfigurationFunctions(this.readConfigurationBlocks($dataMap.note),this.mapConfigurationFunctions,a),"fog"in a){const t=a.fog;"color"in t&&this.blendFogColor.setValue(t.color,0),"near"in t&&this.blendFogNear.setValue(t.near,0),"far"in t&&this.blendFogFar.setValue(t.far,0)}"light"in a&&this.blendAmbientColor.setValue(a.light.color,0),"cameraDist"in a&&this.blendCameraDist.setValue(a.cameraDist,0),"cameraHeight"in a&&this.blendCameraHeight.setValue(a.cameraHeight,0),"cameraMode"in a&&(this.cameraMode=a.cameraMode),"cameraPitch"in a&&this.blendCameraPitch.setValue(a.cameraPitch,0),"cameraYaw"in a&&this.blendCameraYaw.setValue(a.cameraYaw,0)},getMapConfig(t,e){return t in this.mapConfigurations?this.mapConfigurations[t]:e},readConfigurationBlocks(t){const e=/<MV3D>([\s\S]*?)<\/MV3D>/gi;let i,a="";for(;i=e.exec(t);)a+=i[1]+"\n";return a},readConfigurationTags(t){const e=/<MV3D:([\s\S]*?)>/gi;let i,a="";for(;i=e.exec(t);)a+=i[1]+"\n";return a},readConfigurationFunctions(t,e=at.configurationFunctions,i={}){const a=/(\w+)\((.*?)\)/g;let s;for(;s=a.exec(t);){const t=s[1].toLowerCase();t in e&&e[t](i,...s[2].split(","))}return i},configurationSides:{front:Y,back:k,double:z},configurationShapes:{FLAT:1,TREE:2,SPRITE:3,FENCE:4,CROSS:5,XCROSS:6},tilesetConfigurationFunctions:{height(t,e){t.height=Number(e)},fringe(t,e){t.fringe=Number(e)},float(t,e){t.float=Number(e)},texture(t,e,i,a){const s=at.constructTileId(e,i,a);t.sideId=t.topId=s},top(t,e,i,a){t.topId=at.constructTileId(e,i,a)},side(t,e,i,a){t.sideId=at.constructTileId(e,i,a)},inside(t,e,i,a){t.insideId=at.constructTileId(e,i,a)},offset(t,e,i){t.offsetSide=t.offsetTop=new L(Number(e),Number(i))},offsettop(t,e,i){t.offsetTop=new L(Number(e),Number(i))},offsetside(t,e,i){t.offsetSide=new L(Number(e),Number(i))},offsetinside(t,e,i){t.offsetInside=new L(Number(e),Number(i))},rect(t,e,i,a,s,r){this.recttop(t,e,i,a,s,r),this.rectside(t,e,i,a,s,r)},recttop(t,e,i,a,s,r){t.topId=at.constructTileId(e,0,0),t.rectTop=new PIXI.Rectangle(i,a,s,r),t.rectTop.setN=at.getSetNumber(t.topId)},rectside(t,e,i,a,s,r){t.sideId=at.constructTileId(e,0,0),t.rectSide=new PIXI.Rectangle(i,a,s,r),t.rectSide.setN=at.getSetNumber(t.sideId)},rectinside(t,e,i,a,s,r){t.insideId=at.constructTileId(e,0,0),t.rectInside=new PIXI.Rectangle(i,a,s,r),t.rectInside.setN=at.getSetNumber(t.insideId)},shape(t,e){t.shape=at.configurationShapes[e.toUpperCase()]},alpha(t,e){t.transparent=!0,t.alpha=Number(e)},glow(t,e){t.glow=Number(e)}},eventConfigurationFunctions:{height(t,e){t.height=Number(e)},z(t,e){t.z=Number(e)},x(t,e){t.x=Number(e)},y(t,e){t.y=Number(e)},side(t,e){t.side=at.configurationSides[e.toLowerCase()]},scale(t,e,i){t.scale=new L(Number(e),Number(i))},rot(t,e){t.rot=Number(e)},bush(t,e){t.bush="true"==e.toLowerCase()},shadow(t,e){t.shadow="true"==e.toLowerCase()},shadowscale(t,e){t.shadowScale=Number(e)},shape(t,e){t.shape=at.configurationShapes[e.toUpperCase()]},pos(t,e,i){t.pos={x:e,y:i}},light(){this.lamp(...arguments)},lamp(t,e="ffffff",i=1,a=at.LIGHT_DIST){t.lamp={color:n(e).toNumber(),intensity:Number(i),distance:Number(a)}},flashlight(t,e="ffffff",i=1,a=at.LIGHT_DIST,s=at.LIGHT_ANGLE){t.flashlight={color:n(e).toNumber(),intensity:Number(i),distance:Number(a),angle:Number(s)}},flashlightpitch(t,e="90"){t.flashlightPitch=Number(e)},flashlightyaw(t,e="+0"){t.flashlightYaw=e},lightheight(t,e=1){t.lightHeight=Number(e)},lightoffset(t,e=0,i=0){t.lightOffset={x:+e,y:+i}},alphatest(t,e=1){t.alphaTest=Number(e)}},mapConfigurationFunctions:{light(t,e){t.light={color:n(e).toNumber()}},fog(t,e,i,a){t.fog||(t.fog={}),e=n(e).toNumber(),i=Number(i),a=Number(a),Number.isNaN(e)||(t.fog.color=e),Number.isNaN(i)||(t.fog.near=i),Number.isNaN(a)||(t.fog.far=a)},yaw(t,e){this.camerayaw(t,e)},pitch(t,e){this.camerapitch(t,e)},camerayaw(t,e){t.cameraYaw=Number(e)},camerapitch(t,e){t.cameraPitch=Number(e)},dist(t,e){this.cameradist(t,e)},cameradist(t,e){t.cameraDist=Number(e)},height(t,e){this.cameraheight(t,e)},cameraheight(t,e){t.cameraHeight=Number(e)},mode(t,e){this.cameramode(t,e)},cameramode(t,e){t.cameraMode=e},edge(t,e){t.edge=l(e)},ceiling(t,e,i,a,s=at.CEILING_HEIGHT){t.ceiling=at.constructTileId(e,i,a),t.ceilingHeight=s}}});const Tt=Game_Event.prototype.setupPage;Game_Event.prototype.setupPage=function(){Tt.apply(this,arguments),this.mv3d_sprite&&(this.mv3d_needsConfigure=!0,this.mv3d_sprite.eventConfigure())};const bt=Game_Event.prototype.initialize;Game_Event.prototype.initialize=function(){bt.apply(this,arguments),at.mapLoaded&&at.createCharacterFor(this);const t=this.event();let e={};at.readConfigurationFunctions(at.readConfigurationTags(t.note),at.eventConfigurationFunctions,e),"pos"in e&&this.locate(o(t.x,e.pos.x),o(t.y,e.pos.y)),this.mv3d_blenders||(this.mv3d_blenders={}),"lamp"in e&&(this.mv3d_blenders.lampColor_r=e.lamp.color>>16,this.mv3d_blenders.lampColor_g=e.lamp.color>>8&255,this.mv3d_blenders.lampColor_b=255&e.lamp.color,this.mv3d_blenders.lampIntensity=e.lamp.intensity,this.mv3d_blenders.lampDistance=e.lamp.distance),"flashlight"in e&&(this.mv3d_blenders.flashlightColor_r=e.flashlight.color>>16,this.mv3d_blenders.flashlightColor_g=e.flashlight.color>>8&255,this.mv3d_blenders.flashlightColor_b=255&e.flashlight.color,this.mv3d_blenders.flashlightIntensity=e.flashlight.intensity,this.mv3d_blenders.flashlightDistance=e.flashlight.distance,this.mv3d_blenders.flashlightAngle=e.flashlight.angle),"flashlightPitch"in e&&(this.mv3d_blenders.flashlightPitch=Number(e.flashlightPitch)),"flashlightYaw"in e&&(this.mv3d_blenders.flashlightYaw=e.flashlightYaw),this.mv3d_needsConfigure=!0};const Ct=Game_Interpreter.prototype.pluginCommand;Game_Interpreter.prototype.pluginCommand=function(t,e){if("mv3d"!==t.toLowerCase())return Ct.apply(this,arguments);const i=new at.PluginCommand;if(i.INTERPRETER=this,i.FULL_COMMAND=[t,...e].join(" "),e=e.filter(t=>t),i.CHAR=$gameMap.event(this._eventId),e[0]){const t=e[0][0];"@"!==t&&"＠"!==t||(i.CHAR=i.TARGET_CHAR(e.shift()))}const a=e.shift().toLowerCase();a in i&&i[a](...e)},at.PluginCommand=class{async camera(...t){var e=this._TIME(t[2]);switch(t[0].toLowerCase()){case"pitch":return void this.pitch(t[1],e);case"yaw":return void this.yaw(t[1],e);case"dist":case"distance":return void this.dist(t[1],e);case"height":return void this.height(t[1],e);case"mode":return void this.cameramode(t[1]);case"target":return void this._cameraTarget(t[1],e);case"pan":return void this.pan(t[1],t[2],t[3])}}yaw(t,e=1){this._RELATIVE_BLEND(at.blendCameraYaw,t,e),at.is1stPerson()&&at.playerFaceYaw()}pitch(t,e=1){this._RELATIVE_BLEND(at.blendCameraPitch,t,e)}dist(t,e=1){this._RELATIVE_BLEND(at.blendCameraDist,t,e)}height(t,e=1){this._RELATIVE_BLEND(at.blendCameraHeight,t,e)}_cameraTarget(t,e){at.setCameraTarget(this.TARGET_CHAR(t),e)}pan(t,e,i=1){console.log(t,e,i),i=this._TIME(i),this._RELATIVE_BLEND(at.blendPanX,t,i),this._RELATIVE_BLEND(at.blendPanY,e,i)}rotationmode(t){at.rotationMode=t}pitchmode(t){at.pitchMode=t}_VEHICLE(t,e,i){e=e.toLowerCase();const a=`${Vehicle}_${e}`;i="big"===e?booleanString(i):o(at.loadData(a,0),i),at.saveData(a,i)}boat(t,e){this._VEHICLE("boat",t,e)}ship(t,e){this._VEHICLE("ship",t,e)}airship(t,e){this._VEHICLE("airship",t,e)}cameramode(t){at.cameraMode=t}fog(...t){var e=this._TIME(t[2]);switch(t[0].toLowerCase()){case"color":return void this._fogColor(t[1],e);case"near":return void this._fogNear(t[1],e);case"far":return void this._fogFar(t[1],e);case"dist":case"distance":return e=this._TIME(t[3]),this._fogNear(t[1],e),void this._fogFar(t[2],e)}e=this._TIME(t[3]),this._fogColor(t[0],e),this._fogNear(t[1],e),this._fogFar(t[2],e)}_fogColor(t,e){at.blendFogColor.setValue(n(t).toNumber(),e)}_fogNear(t,e){this._RELATIVE_BLEND(at.blendFogNear,t,e)}_fogFar(t,e){this._RELATIVE_BLEND(at.blendFogFar,t,e)}light(...t){var e=this._TIME(t[2]);switch(t[0].toLowerCase()){case"color":return void this._lightColor(t[1],e)}e=this._TIME(t[1]),this._lightcolor(t[0],e)}_lightColor(t,e=1){at.blendAmbientColor.setValue(n(t).toNumber(),e)}async lamp(...t){const e=await this.AWAIT_CHAR(this.CHAR);e.setupLamp();var i=this._TIME(t[2]);switch(t[0].toLowerCase()){case"color":return void this._lampColor(e,t[1],i);case"intensity":return void this._lampIntensity(e,t[1],i);case"dist":case"distance":return void this._lampDistance(e,t[1],i)}i=this._TIME(t[3]),this._lampColor(e,t[0],i),this._lampIntensity(e,t[1],i),this._lampDistance(e,t[2],i)}_lampColor(t,e,i=1){t.blendLampColor.setValue(n(e).toNumber(),i)}_lampIntensity(t,e,i=1){this._RELATIVE_BLEND(t.blendLampIntensity,e,i)}_lampDistance(t,e,i=1){this._RELATIVE_BLEND(t.blendLampDistance,e,i)}async flashlight(...t){const e=await this.AWAIT_CHAR(this.CHAR);e.setupFlashlight();var i=this._TIME(t[2]);switch(t[0].toLowerCase()){case"color":return void this._flashlightColor(e,t[1],i);case"intensity":return void this._flashlightIntensity(e,t[1],i);case"dist":case"distance":return void this._flashlightDistance(e,t[1],i);case"angle":return void this._flashlightAngle(e,t[1],i);case"yaw":return void this._flashlightYaw(e,t[1],i);case"pitch":return void this._flashlightPitch(e,t[1],i)}i=this._TIME(t[4]),this._flashlightColor(e,t[0],i),this._flashlightIntensity(e,t[1],i),this._flashlightDistance(e,t[2],i),this._flashlightAngle(e,t[3],i)}_flashlightColor(t,e,i){t.blendFlashlightColor.setValue(n(e).toNumber(),i)}_flashlightIntensity(t,e,i){this._RELATIVE_BLEND(t.blendFlashlightIntensity,e,i)}_flashlightDistance(t,e,i){this._RELATIVE_BLEND(t.blendFlashlightDistance,e,i)}_flashlightAngle(t,e,i){this._RELATIVE_BLEND(t.blendFlashlightAngle,e,i)}_flashlightPitch(t,e,i){this._RELATIVE_BLEND(t.blendFlashlightPitch,e,i)}_flashlightYaw(t,e,i){t.flashlightTargetYaw=e}_RELATIVE_BLEND(t,e,i){t.setValue(o(t.targetValue(),e),Number(i))}_TIME(t){return"number"==typeof t?t:(t=Number(t),Number.isNaN(t)?1:t)}ERROR_CHAR(){console.warn(`MV3D: Plugin command \`${this.FULL_COMMAND}\` failed because target character was invalid.`)}async AWAIT_CHAR(t){if(!t)return this.ERROR_CHAR();let e=0;for(;!t.mv3d_sprite;)if(await sleep(100),++e>10)return this.ERROR_CHAR();return t.mv3d_sprite}TARGET_CHAR(t){return at.targetChar(t,$gameMap.event(this.INTERPRETER._eventId),this.CHAR)}},at.targetChar=function(t,e=null,i=null){if(!t)return i;let a=t.toLowerCase().match(/[a-z]+/);const s=a?a[0]:"e",r=(a=t.match(/\d+/))?Number(a[0]):0;switch(s[0]){case"s":return e;case"p":return $gamePlayer;case"e":return r?$gameMap.event(r):e;case"v":return $gameMap.vehicle(r);case"f":return $gamePlayer.followers()._data[r]}return char},at.getTargetString=function(t){return t instanceof Game_Player?"@p":t instanceof Game_Event?`@e${t._eventId}`:t instanceof Game_Follower?`@f${$gamePlayer._followers._data.indexOf(t)}`:t instanceof Game_Vehicle?`@v${$gameMap._vehicles.indexOf(t)}`:void 0},Object.assign(at,{_tilemap:null,getTilemap(){return SceneManager._scene&&SceneManager._scene._spriteset&&(this._tilemap=SceneManager._scene._spriteset._tilemap),this._tilemap},getSetNumber:t=>Tilemap.isAutotile(t)?Tilemap.isTileA1(t)?0:Tilemap.isTileA2(t)?1:Tilemap.isTileA3(t)?2:3:Tilemap.isTileA5(t)?4:5+Math.floor(t/256),getTerrainTag:t=>$gameMap.tilesetFlags()[t]>>12,getMaterialOptions(t){const e={},i=this.tilesetConfigurations[this.normalizeAutotileId(t)];return i&&("alpha"in i&&(e.alpha=i.alpha),"transparent"in i&&(e.transparent=i.transparent),"glow"in i&&(e.glow=i.glow)),e},getTileConfig(t){let e=C,i=C,a=null,s=null;const r=this.getTilemap(),h={topId:null,sideId:null,insideId:null,bottomId:null,fringe:r&&r._isHigherTile(t)?this.FRINGE_HEIGHT:0,fringeHeight:0},n=this.getTerrainTag(t);if(n&&n in this.TTAG_DATA){const t=this.TTAG_DATA[n];e=t.offsetTop,i=t.offsetSide,h.height=t.height,h.fringeHeight=t.height,h.shape=t.shape}const o=this.tilesetConfigurations[this.normalizeAutotileId(t)];o&&(o.offsetTop&&(e=o.offsetTop),o.offsetSide&&(i=o.offsetSide),o.offsetInside&&(a=o.offsetInside),o.offsetBottom&&(s=o.offsetBottom),"topId"in o&&(h.topId=o.topId),"sideId"in o&&(h.sideId=o.sideId),"insideId"in o&&(h.insideId=o.insideId),"bottomId"in o&&(h.bottomId=o.bottomId),o.rectTop&&(h.rectTop=o.rectTop),o.rectSide&&(h.rectSide=o.rectSide),o.rectInside&&(h.rectInside=o.rectInside),o.rectBottom&&(h.rectBottom=o.rectBottom),"shape"in o&&(h.shape=o.shape),"fringe"in o&&(h.fringe=o.fringe),"height"in o&&(h.height=o.height,h.fringeHeight=o.height),h.hasInsideConf=Boolean(o.offsetInside||o.rectInside||"insideId"in o),h.hasBottomConf=Boolean(o.offsetBottom||o.rectBottom||"bottomId"in o));const l=Tilemap.isAutotile(t)?48:1;return null==h.topId&&(h.topId=t+e.x*l+e.y*l*8),null==h.sideId&&(h.sideId=t+i.x*l+i.y*l*8),null==h.insideId&&(h.insideId=h.sideId,a&&(h.insideId=t+a.x*l+a.y*l*8)),null==h.bottomId&&(h.bottomId=h.topId,s&&(h.bottomId=t+s.x*l+s.y*l*8)),h},getTileData(t,e){if(!$dataMap||!$dataMap.data)return[0,0,0,0];const i=$dataMap.data,a=$dataMap.width,s=$dataMap.height;if($gameMap.isLoopHorizontal()&&(t=t.mod(a)),$gameMap.isLoopVertical()&&(e=e.mod(s)),t<0||t>=a||e<0||e>=s)return[0,0,0,0];const r=[];for(let h=0;h<4;++h)r[h]=i[(h*s+e)*a+t]||0;return r},getTileHeight(t,e,i=0){if(!$dataMap)return 0;$gameMap.isLoopHorizontal()&&(t=t.mod($dataMap.width)),$gameMap.isLoopVertical()&&(e=e.mod($dataMap.height));const a=this.getTileData(t,e)[i];if(this.isTileEmpty(a))return 0;const s=this.getTilemap();if(s&&s._isHigherTile(a))return 0;let r=0;const h=this.tilesetConfigurations[this.normalizeAutotileId(a)],n=$gameMap.regionId(t,e);if(0===i&&n&&n in at.REGION_DATA){let t=this.REGION_DATA[n].height;return h&&"height"in h&&h.height<0&&(t+=h.height),t}if(h){if("height"in h)return h.height;this.isSpecialShape(h.shape)&&(r=1)}const o=this.getTerrainTag(a);return o&&o in this.TTAG_DATA?this.TTAG_DATA[o].height:this.isWallTile(a)?this.WALL_HEIGHT:s&&s._isTableTile(a)?this.TABLE_HEIGHT:r},getStackHeight(t,e,i=3){let a=0;for(let s=0;s<=i;++s)a+=this.getTileHeight(t,e,s);return a},getWalkHeight(t,e){const i=this.getTileData(Math.round(t),Math.round(e));let a=0,s=0;for(let r=0;r<=3;++r){const h=i[r];if(this.isTileEmpty(h))continue;a+=s,s=this.getTileHeight(Math.round(t),Math.round(e),r);const n=this.getTileConfig(h).shape;this.isSpecialShape(n)||(a+=s,s=0)}return a},getFloatHeight(t,e){const i=this.getTileData(t,e);let a=0;for(let t=0;t<=3;++t){const e=i[t];if(this.isTileEmpty(e))continue;const s=this.tilesetConfigurations[this.normalizeAutotileId(e)];s&&"float"in s&&(a+=s.float)}return a},getFringeHeight(t,e,i=3){let a=this.getStackHeight(t,e,i-1);const s=this.getTileData(t,e)[i],r=this.tilesetConfigurations[this.normalizeAutotileId(s)];return r&&this.getTilemap()._isHigherTile(s)?a+(r.fringe||this.FRINGE_HEIGHT)+(r.height||0):0},getCullingHeight(t,e,i=3,a=!1){const s=this.getTileData(t,e);let r=0;for(let h=0;h<=i;++h){const i=s[h],n=this.getTileConfig(i),o=n.shape;if(this.isSpecialShape(o))return r;a&&n.height<0&&(r-=n.height),r+=this.getTileHeight(t,e,h)}return r},getTileRects(t){const e=[],i=this.getTilemap(),a=i._isTableTile(t);if(i._drawTile({addRect:(t,i,a,s,r,h,n,o,l)=>{e.push({setN:t,x:i,y:a,width:h,height:n,ox:s,oy:r})}},t,0,0),a)for(let t=e.length-1;t>=0;--t)e[t].oy>u()/2&&(e[t-1].y+=2*u()/3,e.splice(t,1));return e},isTileEmpty:t=>!t||1544===t,isWallTile(t){const e=Tilemap.getAutotileKind(t),i=Math.floor(e/8),a=Tilemap.isTileA3(t)||Tilemap.isTileA4(t);return a&&i%2?2:a},isTableTile(t){return Boolean(this.getTilemap()._isTableTile(t))},isFringeTile(t){return Boolean(this.getTilemap()._isHigherTile(t))},isWaterfallTile(t){const e=Tilemap.getAutotileKind(t);return Tilemap.isTileA1(t)&&e>=4&&e%2},isSpecialShape(t){const e=at.configurationShapes;return t===e.FENCE||t===e.CROSS||t===e.XCROSS},constructTileId(t,e,i){const a=`TILE_ID_${t.toUpperCase()}`;let s=a in Tilemap?Tilemap[a]:0;const r=Tilemap.isAutotile(s)?48:1;return s+=Number(e)*r+Number(i)*r*8},normalizeAutotileId(t){if(!Tilemap.isAutotile(t))return t;const e=Tilemap.getAutotileKind(t);return Tilemap.TILE_ID_A1+48*e}});const It=new O(0,1,-Math.pow(.1,100),0),St=new O(0,0,-1,0);class mapCell_MapCell extends V{constructor(t,e){const i=[t,e].toString();super(`MapCell[${i}]`,at.scene),this.parent=at.map,this.cx=t,this.cy=e,this.ox=t*at.CELL_SIZE,this.oy=e*at.CELL_SIZE,this.x=this.ox,this.y=this.oy,this.key=i,this.load()}update(){const t=at.loopCoords((this.cx+.5)*at.CELL_SIZE,(this.cy+.5)*at.CELL_SIZE);this.x=t.x-at.CELL_SIZE/2,this.y=t.y-at.CELL_SIZE/2}createMesh(t=1,e=1,i=Y,a){const s=$.CreatePlane("tile",{sideOrientation:i,width:t,height:e,sourcePlane:a?St:It},at.scene);return this.submeshes.push(s),s}load(){const t=at.configurationShapes;this.submeshes=[];const e=Math.min(at.CELL_SIZE,$gameMap.width()-this.cx*at.CELL_SIZE),i=Math.min(at.CELL_SIZE,$gameMap.height()-this.cy*at.CELL_SIZE);for(let a=0;a<i;++a)for(let i=0;i<e;++i){let e=0;const s=at.getTileData(this.ox+i,this.oy+a);for(let r=0;r<4;++r){let h=at.getStackHeight(this.ox+i,this.oy+a,r);const n=at.getTileConfig(s[r]),o=n.shape;n.realId=s[r];const l=at.getTileHeight(this.ox+i,this.oy+a,r)||n.height||0;h+=n.fringe,at.isFringeTile(s[r])&&(h+=n.fringeHeight),o&&o!==t.FLAT?e=0:(this.loadTile(n,i,a,h,r),n.hasBottomConf||n.height>0&&(r>0||n.fringe),l?(this.loadWalls(n,i,a,h,r,l+e*at.LAYER_DIST),e=0):++e),o===t.FENCE?this.loadFence(n,i,a,h,r,l):o!==t.CROSS&&o!==t.XCROSS||this.loadCross(n,i,a,h,r,l)}}this.submeshes.length?this.mesh=B.MergeMeshes(this.submeshes,!0,void 0,void 0,!1,!0):(console.warn("MV3D: Created empty map cell!"),this.mesh=new B("empty mesh",at.scene)),this.mesh.parent=this,delete this.submeshes}loadTile(t,e,i,a,s,r=!1){const h=r?t.bottomId:t.topId,n=r?t.rectTop:t.rectBottom,o=Tilemap.isAutotile(h),l=at.getSetNumber(h);let c;c=n?[n]:at.getTileRects(h);for(const t of c){const n=this.createMesh(1-o/2,1-o/2,r?k:Y);n.material=at.getCachedTileMaterial(l,t.x,t.y,t.width,t.height,at.getMaterialOptions(h)),n.x=e+(0|t.ox)/u()-.25*o,n.y=i+(0|t.oy)/u()-.25*o,n.z=a+s*at.LAYER_DIST}}loadWalls(t,e,i,a,s,r){const h=r,n=at.isFringeTile(t.realId);for(let o=0;o<mapCell_MapCell.neighborPositions.length;++o){const l=mapCell_MapCell.neighborPositions[o];if(!at.getMapConfig("edge",!0)&&((this.ox+e+l.x>=$dataMap.width||this.ox+e+l.x<0)&&!$gameMap.isLoopHorizontal()||(this.oy+i+l.y>=$dataMap.height||this.oy+i+l.y<0)&&!$gameMap.isLoopVertical()))continue;r=t.height<0&&a<at.getStackHeight(this.ox+e+l.x,this.oy+i+l.y,s)?t.height:h;let c,p=t.sideId;r<0&&t.hasInsideConf?(p=t.insideId,t.rectInside&&(c=t.rectInside)):t.rectSide&&(c=t.rectSide);const g=at.getSetNumber(p);let d=r;if(n){if(at.getFringeHeight(this.ox+e+l.x,this.oy+i+l.y,s)===a)continue}else{const h=at.getCullingHeight(this.ox+e+l.x,this.oy+i+l.y,s,!(t.height<0));if(r>0&&h>=a||r<0&&h<=a)continue;d=Math.min(Math.abs(r),Math.abs(a-h))*Math.sign(r)}const m=new x(e+l.x/2,i+l.y/2,a),f=Math.atan2(l.x,l.y);if(c||!Tilemap.isAutotile(p)){const t=c||at.getTileRects(p)[0],e=this.createMesh(1,d,Y,!0);d<0&&(e.scaling.y*=-1),e.material=at.getCachedTileMaterial(g,t.x,t.y,t.width,t.height,at.getMaterialOptions(p)),e.rotate(T,-f,J),e.x=m.x,e.y=m.y,e.z=a-d/2}else{const h=mapCell_MapCell.neighborPositions[(+o-1).mod(4)],n=mapCell_MapCell.neighborPositions[(+o+1).mod(4)],l=at.getStackHeight(this.ox+e+h.x,this.oy+i+h.y,s),c=at.getStackHeight(this.ox+e+n.x,this.oy+i+n.y,s),{x:b,y:C}=this.getAutotileCorner(p,t.realId);let I=Math.abs(Math.round(2*d)),S=Math.abs(d/I),y=u()/2,E=u()/2;at.isTableTile(t.realId)&&(E=u()/3,I=1,S=r);for(let e=-1;e<=1;e+=2)for(let i=0;i<I;++i){let r,h,n,o;at.isTableTile(t.realId)?(r=l!=a,h=c!=a):(r=l<a-i*S,h=c<a-i*S),n=b*u(),o=C*u(),n=(b+(e>0?.5+h:1-r))*u(),d<0&&(n=(b+(e>0?0+r:1.5-h))*u()),o=at.isWaterfallTile(p)?(C+i%2/2)*u():at.isTableTile(p)?(C+5/3)*u():(C+(0===i?0:i===I-1?1.5:1-i%2*.5))*u();const M=this.createMesh(.5,S,Y,!0);M.rotate(T,-f,J),M.x=m.x,M.y=m.y,M.z=a-S/2-S*i+s*at.LAYER_DIST,M.translate(_,.25*e,q),M.material=at.getCachedTileMaterial(g,n,o,y,E,at.getMaterialOptions(p))}}}}loadFence(t,e,i,a,s,r){const h=t.sideId,n=t.rectSide,o=at.getSetNumber(h),l=Tilemap.isAutotile(h),c=[];for(let t=0;t<mapCell_MapCell.neighborPositions.length;++t){const a=mapCell_MapCell.neighborPositions[t];at.getTileHeight(this.ox+e+a.x,this.oy+i+a.y,s)!==r&&c.push(t)}for(let s=0;s<mapCell_MapCell.neighborPositions.length;++s){const p=mapCell_MapCell.neighborPositions[s],g=c.includes(s);if(g&&c.length<4&&!l)continue;const d=p.x>0||p.y>0;let u=Math.atan2(p.x,p.y)+Math.PI/2;if(d&&(u-=Math.PI),l&&!n){const{x:s,y:n}=this.getAutotileCorner(h,t.realId);for(let t=0;t<=1;++t){const l=this.createMesh(.5,r/2,z,!0);l.rotate(T,-u,J),l.material=at.getCachedTileMaterial(o,(g?s+1.5*d:s+1-.5*d)*m(),(n+1.5*t)*f(),m()/2,f()/2,at.getMaterialOptions(h)),l.x=e+p.x/4,l.y=i+p.y/4,l.z=a-r/4-t*r/2}}else{const t=n||at.getTileRects(h)[0],s=this.createMesh(.5,r,z,!0);s.rotate(T,-u,J),s.material=at.getCachedTileMaterial(o,t.x+t.width/2*d,t.y,t.width/2,t.height,at.getMaterialOptions(h)),s.x=e+p.x/4,s.y=i+p.y/4,s.z=a-r/2}}}loadCross(t,e,i,a,s,r){const h=t.sideId,n=t.rectSide,o=at.getSetNumber(h),l=Tilemap.isAutotile(h);let c;c=n?[n]:at.getTileRects(h);const p=t.shape===at.configurationShapes.XCROSS?Math.PI/4:0,g=l?r/2:r;for(let t=0;t<=1;++t)for(const s of c){const n=this.createMesh(1-l/2,g,z,!0);n.x=e,n.y=i,n.z=a-(0|s.oy)/f()*r-g/2,n.rotate(T,-Math.PI/2*t+p,J),n.translate(_,-.25*l+(0|s.ox)/m(),q),n.material=at.getCachedTileMaterial(o,s.x,s.y,s.width,s.height,at.getMaterialOptions(h))}}getAutotileCorner(t,e=t){const i=Tilemap.getAutotileKind(t);let a=i%8,s=Math.floor(i/8);var r,h;return t===e&&1==at.isWallTile(t)&&++s,r=2*a,h=s,Tilemap.isTileA1(t)?i<4?(h=i%2*3+1,r=6*Math.floor(i/2)):(r=8*Math.floor(a/4)+i%2*6,h=6*s+3*Math.floor(a%4/2)+1-a%2):Tilemap.isTileA2(t)?h=3*(s-2)+1:Tilemap.isTileA3(t)?h=2*(s-6):Tilemap.isTileA4(t)&&(h=2.5*(s-10)+(s%2?.5:0)),{x:r,y:h}}}mapCell_MapCell.neighborPositions=[new L(0,1),new L(1,0),new L(0,-1),new L(-1,0)],Object.assign(at,{mapLoaded:!1,clearMap(){this.mapLoaded=!1;for(const t in this.textureCache)this.textureCache[t].dispose();for(const t in this.materialCache)this.materialCache[t].dispose();this.animatedTextures.length=0,this.textureCache={},this.materialCache={};for(const t in this.cells)this.cells[t].dispose(!1,!0);this.cells={};for(const t of this.characters)t.dispose(!1,!0);this.characters.length=0},loadMap(){this.loadMapSettings(),this.updateBlenders(),this.updateMap(),this.createCharacters()},async updateMap(){if(this.mapUpdating)return;this.mapLoaded=!0,this.mapUpdating=!0;const t={left:Math.floor((this.cameraStick.x-this.RENDER_DIST)/this.CELL_SIZE),right:Math.floor((this.cameraStick.x+this.RENDER_DIST)/this.CELL_SIZE),top:Math.floor((this.cameraStick.y-this.RENDER_DIST)/this.CELL_SIZE),bottom:Math.floor((this.cameraStick.y+this.RENDER_DIST)/this.CELL_SIZE)};$gameMap.isLoopHorizontal()||(t.left=Math.max(0,t.left),t.right=Math.min(t.right,Math.floor($gameMap.width()/at.CELL_SIZE))),$gameMap.isLoopVertical()||(t.top=Math.max(0,t.top),t.bottom=Math.min(t.bottom,Math.floor($gameMap.height()/at.CELL_SIZE)));const e=[];for(let i=t.left;i<=t.right;++i)for(let a=t.top;a<=t.bottom;++a){let t=i,s=a;$gameMap.isLoopHorizontal()&&(t=t.mod(Math.ceil($gameMap.width()/at.CELL_SIZE))),$gameMap.isLoopVertical()&&(s=s.mod(Math.ceil($gameMap.height()/at.CELL_SIZE))),e.push(new L(t,s))}const i=new L(Math.round(this.cameraStick.x/this.CELL_SIZE),Math.round(this.cameraStick.y/this.CELL_SIZE));e.sort((t,e)=>L.DistanceSquared(t,i)-L.DistanceSquared(e,i));for(const t of e){let{x:e,y:i}=t;if(this.loadMapCell(e,i),await p(1),!this.mapLoaded)return void(this.mapUpdating=!1)}this.mapUpdating=!1},loadMapCell(t,e){const i=[t,e].toString();if(i in this.cells)return;const a=new mapCell_MapCell(t,e);this.cells[i]=a}}),Object.assign(at,{animatedTextures:[],textureCache:{},materialCache:{},getCachedTileTexture(t,e,i,a,s){const r=`${t}|${e},${i}|${a},${s}`;if(r in this.textureCache)return this.textureCache[r];const h=$gameMap.tileset().tilesetNames[t];if(!h)return this.getErrorTexture();const n=new R(`img/tilesets/${h}.png`,this.scene);return n.hasAlpha=!0,n.onLoadObservable.addOnce(()=>{if(this.textureCache[r]===n&&(n.crop(e,i,a,s),n.updateSamplingMode(1),0===t)){const t=e/m(),r=i/f();if(t<6||t>=8||r>=6){const r=t>=6&&t<8||t>=14;n.animX=r?0:2,n.animY=r?1:0,n.frameData={x:e,y:i,w:a,h:s},this.animatedTextures.push(n)}}}),this.textureCache[r]=n,n},getErrorTexture(){return this.errorTexture?this.errorTexture:(this.errorTexture=new R("MV3D/errorTexture.png",this.scene),this.errorTexture)},getBushAlphaTexture(){return this.bushAlphaTexture?this.bushAlphaTexture:(this.bushAlphaTexture=new R("MV3D/bushAlpha.png",this.scene),this.bushAlphaTexture.getAlphaFromRGB=!0,this.bushAlphaTexture)},getCachedTileMaterial(t,e,i,a,s,r={}){this.processMaterialOptions(r);const h=`${t}|${e},${i}|${a},${s}|${this.getExtraBit(r)}`;if(h in this.materialCache)return this.materialCache[h];const n=this.getCachedTileTexture(t,e,i,a,s),o=new G(h,this.scene);return o.diffuseTexture=n,r.transparent&&(o.opacityTexture=n,o.alpha=r.alpha),o.alphaCutOff=at.ALPHA_CUTOFF,o.ambientColor.set(1,1,1),o.emissiveColor.set(r.glow,r.glow,r.glow),o.specularColor.set(0,0,0),this.materialCache[h]=o,o},processMaterialOptions(t){"alpha"in t?(t.alpha=Math.round(7*t.alpha)/7,t.alph<1&&(t.transparent=!0)):t.alpha=1,t.glow="glow"in t?Math.round(7*t.glow)/7:0},getExtraBit(t){let e=0;return e|=Boolean(t.transparent)<<0,e|=7-7*t.alpha<<1,(e|=7*t.glow<<1).toString(36)},lastAnimUpdate:0,animXFrame:0,animYFrame:0,animDirection:1,updateAnimations(){if(!(performance.now()-this.lastAnimUpdate<=this.ANIM_DELAY)){this.lastAnimUpdate=performance.now(),this.animXFrame<=0?this.animDirection=1:this.animXFrame>=2&&(this.animDirection=-1),this.animXFrame+=this.animDirection,this.animYFrame=(this.animYFrame+1)%3;for(const t of this.animatedTextures)t.crop(t.frameData.x+t.animX*this.animXFrame*m(),t.frameData.y+t.animY*this.animYFrame*f(),t.frameData.w,t.frameData.h)}}}),Object.assign(at,{createCharacters(){const t=$gameMap.events();for(const e of t)this.createCharacterFor(e,0);const e=$gameMap.vehicles();for(const t of e)this.createCharacterFor(t,1);const i=$gamePlayer.followers()._data;for(let t=i.length-1;t>=0;--t)this.createCharacterFor(i[t],29-t);this.createCharacterFor($gamePlayer,30)},createCharacterFor(t,e){if(!t.mv3d_sprite){const i=new characters_Character(t,e);return Object.defineProperty(t,"mv3d_sprite",{value:i,configurable:!0}),this.characters.push(i),i}return t.mv3d_sprite},updateCharacters(){for(const t of this.characters)t.update()},setupSpriteMeshes(){characters_Sprite.Meshes={},characters_Sprite.Meshes.FLAT=B.MergeMeshes([$.CreatePlane("sprite mesh",{sideOrientation:z},at.scene).rotate(_,Math.PI/2,J)]),characters_Sprite.Meshes.SPRITE=B.MergeMeshes([$.CreatePlane("sprite mesh",{sideOrientation:z},at.scene).translate(T,.5,J)]),characters_Sprite.Meshes.CROSS=B.MergeMeshes([characters_Sprite.Meshes.SPRITE.clone(),characters_Sprite.Meshes.SPRITE.clone().rotate(T,Math.PI/2,J)]),characters_Sprite.Meshes.SHADOW=characters_Sprite.Meshes.FLAT.clone("shadow mesh");const t=new R("MV3D/shadow.png"),e=new G("shadow material",at.scene);e.diffuseTexture=t,e.opacityTexture=t,characters_Sprite.Meshes.SHADOW.material=e;for(const t in characters_Sprite.Meshes)at.scene.removeMesh(characters_Sprite.Meshes[t])}});class characters_Sprite extends V{constructor(){super("sprite",at.scene),this.spriteOrigin=new V("sprite origin",at.scene),this.spriteOrigin.parent=this,this.mesh=characters_Sprite.Meshes.FLAT.clone(),this.mesh.parent=this.spriteOrigin}setMaterial(t){this.disposeMaterial(),this.texture=new R(t,at.scene),this.bitmap=this.texture._texture,this.texture.hasAlpha=!0,this.texture.onLoadObservable.addOnce(()=>this.onTextureLoaded()),this.material=new G("sprite material",at.scene),this.material.diffuseTexture=this.texture,this.material.alphaCutOff=at.ALPHA_CUTOFF,this.material.ambientColor.set(1,1,1),this.material.specularColor.set(0,0,0),this.mesh.material=this.material}onTextureLoaded(){this.texture.updateSamplingMode(1)}disposeMaterial(){this.material&&(this.material.dispose(!0,!0),this.material=null,this.texture=null,this.bitmap=null)}dispose(...t){this.disposeMaterial(),super.dispose(...t)}}class characters_Character extends characters_Sprite{constructor(t,e){super(),this.order=e,this.mesh.order=this.order,this.mesh.character=this,this._character=this.char=t,this.charName="",this.charIndex=0,this.updateCharacter(),this.updateShape(),this.isVehicle=this.char instanceof Game_Vehicle,this.isBoat=this.isVehicle&&this.char.isBoat(),this.isShip=this.isVehicle&&this.char.isShip(),this.isAirship=this.isVehicle&&this.char.isAirship(),this.isEvent=this.char instanceof Game_Event,this.isPlayer=this.char instanceof Game_Player,this.isFollower=this.char instanceof Game_Follower,this.isEvent&&this.eventConfigure(),this.elevation=0,this.char.mv3d_blenders||(this.char.mv3d_blenders={}),at.CHARACTER_SHADOWS&&(this.shadow=characters_Sprite.Meshes.SHADOW.clone(),this.shadow.parent=this.spriteOrigin),this.lightOrigin=new V("light origin",at.scene),this.lightOrigin.parent=this,this.setupLights()}isTextureReady(){return Boolean(this.texture&&this.texture.isReady())}setTileMaterial(){const t=at.getSetNumber(this._tileId),e=$gameMap.tileset().tilesetNames[t];if(e){const t=`img/tilesets/${e}.png`;this.setMaterial(t)}else this.setMaterial("MV3D/errorTexture.png")}onTextureLoaded(){super.onTextureLoaded(),this.updateFrame(),this.updateScale()}updateCharacter(){this._tilesetId=$gameMap.tilesetId(),this._tileId=this._character.tileId(),this._characterName=this._character.characterName(),this._characterIndex=this._character.characterIndex(),this._isBigCharacter=ImageManager.isBigCharacter(this._characterName),this._tileId>0?this.setTileMaterial(this._tileId):this._characterName&&this.setMaterial(`img/characters/${this._characterName}.png`)}updateCharacterFrame(){if(this.px=this.characterPatternX(),this.py=this.characterPatternY(),!this.isTextureReady())return;const t=this.patternWidth(),e=this.patternHeight(),i=(this.characterBlockX()+this.px)*t,a=(this.characterBlockY()+this.py)*e;this.setFrame(i,a,t,e)}patternChanged(){return this.px!==this.characterPatternX()||this.py!==this.characterPatternY()}characterPatternY(){if(this.isEvent&&this.char.isObjectCharacter())return this.char.direction()/2-1;return at.transformDirectionYaw(this.char.direction())/2-1}setFrame(t,e,i,a){this.isTextureReady()&&this.texture.crop(t,e,i,a)}updateScale(){if(!this.isTextureReady())return;const t=this.getConfig("scale",new L(1,1));let e=1;if(this.isVehicle){const t=at[`${this.char._type.toUpperCase()}_SETTINGS`];e=at.loadData(`${this.char._type}_scale`,t.scale)}const i=this.patternWidth()/u()*t.x*e,a=this.patternHeight()/u()*t.y*e;this.mesh.scaling.set(i,a,a)}getConfig(t,e){return this.settings_event?t in this.settings_event_page?this.settings_event_page[t]:t in this.settings_event?this.settings_event[t]:e:e}hasConfig(t){return!!this.settings_event&&(t in this.settings_event_page||t in this.settings_event)}eventConfigure(){if(!this.settings_event){this.settings_event={};const t=this.char.event().note;at.readConfigurationFunctions(at.readConfigurationTags(t),at.eventConfigurationFunctions,this.settings_event)}this.settings_event_page={};const t=this.char.page();if(!t)return;let e="";for(const i of t.list)108!==i.code&&408!==i.code||(e+=i.parameters[0]);if(at.readConfigurationFunctions(at.readConfigurationTags(e),at.eventConfigurationFunctions,this.settings_event_page),this.updateScale(),this.updateShape(),this.char.mv3d_needsConfigure&&(this.char.mv3d_needsConfigure=!1,"pos"in this.settings_event_page)){const t=this.char.event(),e=this.settings_event_page.pos;this.char.locate(o(t.x,e.x),o(t.y,e.y))}}setupMesh(){this.mesh.parent=this.spriteOrigin,this.mesh.character=this,this.mesh.order=this.order,this.material&&(this.mesh.material=this.material),this.flashlight&&(this.flashlight.excludedMeshes.splice(0,1/0),this.flashlight.excludedMeshes.push(this.mesh))}setupLights(){"flashlightColor"in this.char.mv3d_blenders&&this.setupFlashlight(),"lampColor"in this.char.mv3d_blenders&&this.setupLamp()}setupFlashlight(){if(this.flashlight)return;const t=this.getConfig("flashlight",{color:16777215,intensity:1,distance:at.LIGHT_DIST,angle:at.LIGHT_ANGLE});this.blendFlashlightColor=this.makeColorBlender("flashlightColor",t.color),this.blendFlashlightIntensity=this.makeBlender("flashlightIntensity",t.intensity),this.blendFlashlightDistance=this.makeBlender("flashlightDistance",t.distance),this.blendFlashlightAngle=this.makeBlender("flashlightAngle",t.angle),this.flashlight=new A("flashlight",x.Zero(),x.Zero(),g(this.blendFlashlightAngle.targetValue()),0,at.scene),this.flashlight.exponent=64800*Math.pow(this.blendFlashlightAngle.targetValue(),-2),this.flashlight.range=this.blendFlashlightDistance.targetValue(),this.flashlight.intensity=this.blendFlashlightIntensity.targetValue(),this.flashlight.diffuse.set(...this.blendFlashlightColor.targetComponents()),this.flashlight.direction.y=-1,this.flashlightOrigin=new V("flashlight origin",at.scene),this.flashlightOrigin.parent=this.lightOrigin,this.flashlight.parent=this.flashlightOrigin,this.blendFlashlightPitch=this.makeBlender("flashlightPitch",70),this.blendFlashlightYaw=this.makeBlender("flashlightYaw",0),this.blendFlashlightYaw.cycle=360,this.flashlightTargetYaw=this.getConfig("flashlightYaw","+0"),this.updateFlashlightDirection(),this.setupMesh()}setupLamp(){if(this.lamp)return;const t=this.getConfig("lamp",{color:16777215,intensity:1,distance:at.LIGHT_DIST});this.blendLampColor=this.makeColorBlender("lampColor",t.color),this.blendLampIntensity=this.makeBlender("lampIntensity",t.intensity),this.blendLampDistance=this.makeBlender("lampDistance",t.distance),this.lamp=new v("lamp",x.Zero(),at.scene),this.lamp.diffuse.set(...this.blendLampColor.targetComponents()),this.lamp.intensity=this.blendLampIntensity.targetValue(),this.lamp.range=this.blendLampDistance.targetValue(),this.lamp.parent=this.lightOrigin}updateFlashlightDirection(){this.flashlightOrigin.yaw=this.blendFlashlightYaw.currentValue(),this.flashlightOrigin.pitch=-this.blendFlashlightPitch.currentValue(),this.flashlightOrigin.position.set(0,0,0);let t=Math.tan(g(90-this.blendFlashlightAngle.currentValue()-Math.max(90,this.blendFlashlightPitch.currentValue())+90))*at.LIGHT_HEIGHT;t=Math.max(0,Math.min(1,t)),this.flashlight.range+=t,this.flashlightOrigin.translate(T,t,q)}updateLights(){if(this.flashlight){const t=180+o(at.dirToYaw(this.char.direction()),this.flashlightTargetYaw);t!==this.blendFlashlightYaw.targetValue()&&this.blendFlashlightYaw.setValue(t,.25),this.blendFlashlightColor.update()|this.blendFlashlightIntensity.update()|this.blendFlashlightDistance.update()|this.blendFlashlightAngle.update()|this.blendFlashlightYaw.update()|this.blendFlashlightPitch.update()&&(this.flashlight.diffuse.set(...this.blendFlashlightColor.currentComponents()),this.flashlight.intensity=this.blendFlashlightIntensity.currentValue(),this.flashlight.range=this.blendFlashlightDistance.currentValue(),this.flashlight.angle=g(this.blendFlashlightAngle.currentValue()),this.flashlight.exponent=64800*Math.pow(this.blendFlashlightAngle.targetValue(),-2),this.updateFlashlightDirection())}this.lamp&&this.blendLampColor.update()|this.blendLampIntensity.update()|this.blendLampDistance.update()&&(this.lamp.diffuse.set(...this.blendLampColor.currentComponents()),this.lamp.intensity=this.blendLampIntensity.currentValue(),this.lamp.range=this.blendLampDistance.currentValue())}makeBlender(t,e,i=blenders_Blender){t in this.char.mv3d_blenders?e=this.char.mv3d_blenders[t]:this.char.mv3d_blenders[t]=e;const a=new i(t,e);return a.storageLocation=()=>this.char.mv3d_blenders,a}makeColorBlender(t,e){return this.makeBlender(t,e,ColorBlender)}hasBush(){return this.isEvent?this.getConfig("bush",!this._tileId):!this.isVehicle||at.VEHICLE_BUSH}getShape(){return this.getConfig("shape",this.char.isTile()?at.configurationShapes.FLAT:at.EVENT_SHAPE)}updateShape(){const t=this.getShape();if(this.shape===t)return;this.shape=t;let e=characters_Sprite.Meshes.SPRITE;const i=at.configurationShapes;switch(this.shape){case i.FLAT:e=characters_Sprite.Meshes.FLAT;break;case i.CROSS:e=characters_Sprite.Meshes.CROSS;break;case i.FENCE:}this.mesh.dispose(),this.mesh=e.clone(),this.setupMesh()}update(){this.char._erased&&this.dispose(),this.visible=this.char.mv_sprite.visible,"function"==typeof this.char.isVisible&&(this.visible=this.visible&&this.char.isVisible()),this.material||(this.visible=!1),this._isEnabled?this.visible||this.setEnabled(!1):this.visible&&this.setEnabled(!0),this._isEnabled&&(this.isImageChanged()&&this.updateCharacter(),this.patternChanged()&&this.updateFrame(),this.shape===at.configurationShapes.SPRITE?(this.mesh.pitch=at.blendCameraPitch.currentValue()-90,this.mesh.yaw=at.blendCameraYaw.currentValue()):this.shape===at.configurationShapes.TREE?(this.mesh.pitch=0,this.mesh.yaw=at.blendCameraYaw.currentValue()):(this.mesh.pitch=0,this.mesh.yaw=this.getConfig("rot",0)),this.bush=Boolean(this.char.bushDepth()),this.bush&&this.hasBush()?this.material.opacityTexture||(this.material.opacityTexture=at.getBushAlphaTexture(),this.material.useAlphaFromDiffuseTexture=!0):this.material.opacityTexture&&(this.material.opacityTexture=null,this.material.useAlphaFromDiffuseTexture=!1),this.tileHeight=at.getWalkHeight(this.char._realX,this.char._realY),this.updatePosition(),this.updateElevation(),this.shadow&&this.updateShadow(),this.updateLights())}updatePosition(){const t=at.loopCoords(this.char._realX,this.char._realY);this.x=t.x,this.y=t.y,this.spriteOrigin.position.set(0,0,0),this.lightOrigin.position.set(0,0,0),this.spriteOrigin.z=4*at.LAYER_DIST,this.lightOrigin.z=this.getConfig("lightHeight",at.LIGHT_HEIGHT);const e=new L(Math.sin(-at.cameraNode.rotation.y),Math.cos(at.cameraNode.rotation.y)).multiplyByFloats(.45,.45),i=this.getConfig("lightOffset",null);this.shape===at.configurationShapes.SPRITE?(this.spriteOrigin.x=e.x,this.spriteOrigin.y=e.y,this.lightOrigin.x=e.x,this.lightOrigin.y=e.y):i||(this.lightOrigin.x=e.x/2,this.lightOrigin.y=e.y/2),i&&(this.lightOrigin.x+=i.x,this.lightOrigin.y+=i.y),this.spriteOrigin.x+=this.getConfig("x",0),this.spriteOrigin.y+=this.getConfig("y",0)}updateElevation(){let t=this.tileHeight;if((this.isVehicle||(this.isPlayer||this.isFollower)&&$gamePlayer.vehicle())&&(t+=at.getFloatHeight(Math.round(this.char._realX),Math.round(this.char._realY)),this.char===$gameMap.vehicle("boat")?t+=at.BOAT_SETTINGS.zoff:this.char===$gameMap.vehicle("ship")&&(t+=at.SHIP_SETTINGS.zoff)),this.isAirship&&$gamePlayer.vehicle()===this.char){if(this.char._driving||(this.elevation+=(t-this.elevation)/10),t>=this.elevation){const e=100/Math.pow(1.5,at.loadData("airship_ascentspeed",4));this.elevation+=(t-this.elevation)/e}else if(!at.vehicleObstructed(this.char,this.char.x,this.char.y,!0)){const e=100/Math.pow(1.5,at.loadData("airship_descentspeed",2));this.elevation+=(t-this.elevation)/e}this.z=this.elevation,this.z+=at.loadData("airship_height",at.AIRSHIP_SETTINGS.height)*this.char._altitude/this.char.maxAltitude()}else if(this.char.isJumping()){let t=1-this.char._jumpCount/(2*this.char._jumpPeak),e=-4*Math.pow(t-.5,2)+1,i=Math.abs(this.char.mv3d_jumpHeightEnd-this.char.mv3d_jumpHeightStart);this.z=this.char.mv3d_jumpHeightStart*(1-t)+this.char.mv3d_jumpHeightEnd*t+e*i/2+this.char.jumpHeight()/u()}else this.elevation=t,this.z=this.elevation;this.isEvent&&(this.z+=this.getConfig("height",2===this.char._priorityType?at.EVENT_HEIGHT:0),this.hasConfig("z")&&(this.z=this.getConfig("z",0)))}updateShadow(){let t=this.getConfig("shadow",this.shape!=at.configurationShapes.FLAT);if(t&&(this.isPlayer||this.isFollower)){const e=at.characters.indexOf(this);if(e>=0)for(let i=e+1;i<at.characters.length;++i){const e=at.characters[i];if(e.shadow&&e.visible&&(e.char._realX===this.char._realX&&e.char._realY===this.char._realY)){t=!1;break}}}if(this.shadow._isEnabled?t||this.shadow.setEnabled(!1):t&&this.shadow.setEnabled(!0),!t)return;const e=Math.min(0,this.getConfig("height",0)),i=Math.max(this.z-this.tileHeight,e),a=this.isAirship?at.AIRSHIP_SETTINGS.shadowDist:at.SHADOW_DIST,s=Math.max(0,1-Math.abs(i)/a);this.shadow.z=-i;const r=this.isAirship?at.AIRSHIP_SETTINGS.shadowScale:this.getConfig("shadowScale",at.SHADOW_SCALE);this.shadow.scaling.setAll(r*s),this.shadow.isAnInstance||(this.shadow.visibility=s-.5*this.bush)}dispose(...t){super.dispose(...t),delete this.char.mv3d_sprite}}for(const t of["characterBlockX","characterBlockY","characterPatternX","isImageChanged","patternWidth","patternHeight","updateTileFrame","updateFrame"])characters_Character.prototype[t]=Sprite_Character.prototype[t];Object.assign(at,{vehicleObstructed:(t,...e)=>Mt.apply(t,e)});const yt=Game_CharacterBase.prototype.canPass;function Et(t,e,i=!0){if(!(this instanceof Game_Vehicle))throw"This isn't a vehicle.";if(!this.mv3d_sprite)return!0;if(!this._driving)return!0;if($gamePlayer.isDebugThrough())return!0;const a=this.isAirship(),s=at[`${this._type.toUpperCase()}_SETTINGS`],r=at.loadData(`${this._type}_big`,s.big);let h=.5;a?h=at.loadData("airship_height",at.AIRSHIP_SETTINGS.height):h+=at.getFloatHeight(t,e);const n=at.getWalkHeight(t,e);let o=this.mv3d_sprite.z;if("zoff"in s&&(o-=s.zoff),n>o)return!1;if(!r)return!0;for(let a=-1;a<=1;++a)for(let s=-1;s<=1;++s){if(0===a&&0===s||!i&&a&&s)continue;const r=at.getWalkHeight(t+a,e+s);if(r>n+h*!i&&(i||r>o))return!1}return!0}function Mt(){return!Et.apply(this,arguments)}Game_CharacterBase.prototype.canPass=function(t,e,i){if(!yt.apply(this,arguments))return!1;const a=$gameMap.roundXWithDirection(t,i),s=$gameMap.roundYWithDirection(e,i);if(this===$gamePlayer){const t=this.vehicle();if(t){const e=Mt.call(t,a,s,!1);if(t.isAirship())return!e;if(e)return!1}}if(this.isThrough()||this.isDebugThrough())return!0;const r=at.getWalkHeight(t,e),h=at.getWalkHeight(a,s);return r===h};const wt=Game_Map.prototype.isAirshipLandOk;Game_Map.prototype.isAirshipLandOk=function(t,e){return!Mt.call(this.airship(),t,e,!0)&&(at.AIRSHIP_SETTINGS.bushLanding?this.checkPassage(t,e,15):wt.apply(this,arguments))};const At=Game_Player.prototype.updateVehicleGetOn;Game_Player.prototype.updateVehicleGetOn=function(){const t=this.vehicle(),e=at.loadData(`${t._type}_speed`,t._moveSpeed);this.vehicle().setMoveSpeed(e),At.apply(this,arguments)};const vt=Game_CharacterBase.prototype.jump;Game_CharacterBase.prototype.jump=function(t,e){this.mv3d_jumpHeightStart=at.getWalkHeight(this.x,this.y),this.mv3d_jumpHeightEnd=at.getWalkHeight(this.x+t,this.y+e),vt.apply(this,arguments)};const Nt=Game_Map.prototype.parallaxOx;Game_Map.prototype.parallaxOx=function(){let t=Nt.apply(this,arguments);return this._parallaxLoopX?t-816*at.blendCameraYaw.currentValue()/90:t};const Lt=Game_Map.prototype.parallaxOy;Game_Map.prototype.parallaxOy=function(){let t=Lt.apply(this,arguments);return this._parallaxLoopY?t-816*at.blendCameraPitch.currentValue()/90:t},Game_Map.prototype.setDisplayPos=function(){},Game_Map.prototype.scrollUp=function(){},Game_Map.prototype.scrollDown=function(){},Game_Map.prototype.scrollLeft=function(){},Game_Map.prototype.scrollRight=function(){},Game_Map.prototype.updateScroll=function(){this._displayX=816*-at.blendCameraYaw.currentValue()/3600,this._displayY=816*-at.blendCameraPitch.currentValue()/3600},Game_CharacterBase.prototype.isNearTheScreen=function(){return Math.abs(this.x-at.cameraStick.position.x)<=at.RENDER_DIST&&Math.abs(-this.y-at.cameraStick.position.y)<=at.RENDER_DIST}}]);
//# sourceMappingURL=mv3d-babylon.js.map