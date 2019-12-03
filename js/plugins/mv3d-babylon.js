/*:
@plugindesc 3D rendering in RPG Maker MV with babylon.js
@author Dread/Nyanak
@version 0.3.5
@help

If you are making a game with this plugin, please consider supporting my
patreon.  
https://www.patreon.com/cutievirus  
A list of patrons can be found at the bottom of this file.

## Getting started

To use the plugin on a new or existing project, download [plugin.zip] and
extract the files into your project directory.
Then, load `babylon.js` and `mv3d-babylon.js` as plugins in that order.

[plugin.zip]:
https://github.com/Dread-chan/MV3D/blob/master/plugin.zip


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

## Configuration

Tileset and map configurations are placed in the note area.
Event configurations are placed either in the event note or in comments.
Region and terrain tags are configured through the plugin parameters.

In order for the plugin to recognize configurations, they need to be wrapped
properly.  
Tileset and map configurations need to be wrapped in a <mv3d> </mv3d> block,
while event configurations need to be inside a <mv3d:  > tag.  
Region and terrain tag configurations don't need to wrapped at all.

### Using configuration functions

Configuration functions are used to configure tilesets, regions, terrain tags,
events, and maps.

The following is an example of a basic configuration function. Each function
is passed a list of parameters.

    top(A1,0,0)

Some functions can take a large number of parameters. In these cases the
parameter list is separated into groups. A vertical bar can be used instead of
a comma to jump to the next group. You can also jump to a parameter by name
using a colon.  
Here are some examples:

    ceiling(A4,0,0|2)
    camera(0,60,dist:5,height:0.75)

Parameter groups can also have names, and can be jumped to in the same way you
jump to a named parameter.

---

## Tileset Configuration

Each line in the tileset configuration should start by identifying the tile
you want to configure, followed by a colon, and then a list of configuration
functions.

Choosing a tile is done with the format `img,x,y`, where img is name of the
tileset image (A1, A2, B, C, etc.), and x and y are the position of that tile
on the tileset. For example, `A2,0,0` would be the top left A2 tile. On the
outdoor tileset, this would be the grass autotile.

Here are some exapmle tileset configurations.  

This first one will make our outdoor water sink into the ground a little.

    <mv3d>
    A1,0,0:top(A1,0,0),side(A1,31,54,31,14),depth(0.3),float(0.1)
    </mv3d>

But this example won't look very good if we place the water at the edge of a
cliff, so let's configure it to use a waterfall texture on the outside walls.

    <mv3d>
    A1,0,0:top(A1,0,0),side(A1,1,1),inside(A1,31,54,31,14),depth(0.3),float(0.1)
    </mv3d>


### Setting tile textures

A tile can have up to four different textures. These are the Top texture,
the Side texture, the Inside texture, and the Bottom texture.  
If unset, the inside texture will be the same as the side texture and the 
bottom texture will be the same as the top texture.  
Inside textures are only used if a tile has a depth() specified.

Each texture can be set with the respective top(), side(), inside(), and
bottom() function. Texture() can be used to set both the top and side texture.

Parameter list:
img,x,y,w,h|alpha|glow[anim]animx,animy

The number of parameters passed to the first group will alter the behavior of
these functions.  

With only 2 parameters, it will act as an offset. For example, top(0,1) will
use the texture of the tile below the configured tile.  

With 3 parameters, you specify the tileset image name and tile coordinates of
the tile to use the texture from. For example, top(A1,0,0) will use the top
left tile of the A1 tileset image.  

With 5 parameters, you specify a region with pixel coordinates on the
specified tileset image. For example, top(A1,24,72,48,48).  

The alpha parameter can be used to make the texture partially transparent. Or,
you can set alpha to 1 to turn on alpha blending.  
Examples: texture(|1), texture(alpha:0.5)

The glow parameter will make the texture glow in the dark. Good for lava.  
Example: texture(||1), texture(glow:1)

[Anim] is a named parameter group for defining custom animated tiles.  
The number supplied to animx and animy will be the offset used by the
animation. The final offset will be equal to the anim offset times the
current frame.  
Animx has frames 0,1,2,1, while animy has frames 0,1,2.  
Examples: texture(|||1,0), texture(anim:0,1)



### Setting tile height

Height and depth can be used to set the height of the tile. A tile's height
is equal to its height minus its depth. Tiles with depth will use their inside
texture on their sides. Depth is good for making pits.  
Examples: height(2), depth(1)  

The float function will make water vehicles float above the surface. If you've
given your water tiles some depth(), this will unsink your ships.  
Example: float(0.3)

The fringe function will change the height of your star tiles.  
Example: fringe(2)



### Changing tile shapes

There are a few special shapes which can be given to your tiles using the
shape() function. Valid shapes are FLAT, FENCE, CROSS, and XCROSS.  
Examples: shape(fence), shape(xcross)


---


## Event Configuration

Event configurations can be placed in either the event note or comments, and
mush be wrapped in a <mv3d:   > tag.
A few configuration functions, such as pos, will behave slightly differently
depending on whether they're placed in the note or comments.

Here's some examples.

First let's make an event that displays on the edge of a wall.

    <mv3d:shape(fence),scale(0.9,1.3),y(0.51),rot(0),z(0)>

Next let's attach a flashlight to an event.

    <mv3d:flashlight(white,2,6,30)>



### Adjust event position

The x() and y() functions will offset the x and y position of the event's
mesh.  
Example: y(0.51)

The height() function will adjust the event's height above the ground.  
Example: height(2)

The z() function will set the event's absolute z position, ignoring ground
level.  
Example: z(0)

The pos() function will change the position of the event. This can be used to
make two events occupy the same space. Prefix numbers with + to use relative
coordinates.  
Examples: pos(1,2), pos(+0,+-1)



### Change event shape

Use the shape function to set what shape the event should use. Valid event
shapes are FLAT, SPRITE, TREE, FENCE, CROSS, and XCROSS.  
Example: shape(tree)

The scale function can change the size of the event.  
Examples: scale(2,2), scale(1.5,3)

The rot function will rotate the event's mesh. Doesn't work with Sprite or
Tree shapes.  
0 is south, 90 is east, 180 is north, and 270 is west.  
Example: rot(45)



### Event Lights

The lamp function attaches a point light to the event.
Parameter list: color,intensity,range
Examples: lamp(white,0.5,1), lamp(#ff8888,1,3)


The flashlight function attaches a spotlight to the event.
Parameter list: color,intensity,range,angle|yaw,pitch
Examples: flashlight(#ffffff,2,6,30), flashlight(red,2,6,45|90)


The height and offset of the lights can be set with lightHeight() and
lightOffset().  
Examples: lightHeight(0.5), lightOffset(0,1.01)



### Other event settings

You can set whether the event is affected by bush tiles using the bush
function.  
Examples: bush(true), bush(false)

You can disable or change the size of the event's shadow using the shadow
function.  
Examples: shadow(0), shadow(3)

The alpha function is used to make the event partially transparent or to turn
on alpha blending.  
Examples: alpha(0.5), alpha(1)

The dirfix function will set whether the event rotates depending on the camera
angle.  
Examples: dirfix(true), dirfix(false)

---

## Map Configuration

Map configuration goes in the note area of the map settings. Configurations
should be placed in an <mv3d></mv3d> block, which should contain a list of
configuration functions.

Some of these configurations apply when the map is loaded, while others affect
how the map is rendered.

---

### Light and Fog

The light function will set the ambient light level for the map.  
Examples: light(white), light(gray), light(#222222), light(rebeccaPurple)

The fog function sets the color and distance of the fog.  
Parameter list: color|near,far  
Examples: fog(white|10,20), fog(#e1feff), fog(black|20,30)



### Camera Settings

The camera function can be used to set various properties of the camera,
including the rotation, distance, height, and projection mode.  
Parameter list: yaw,pitch|dist|height|mode  
Examples: camera(0,60,dist:5,height:0.75), camera(45,45),
    camera(mode:orthographic), camera(mode:perspective)



### Setting a ceiling for the map

The ceiling function sets a ceiling texture and height, and also supports 
all the other properties from the texture function like alpha and animation.  
Parameter List:  
img,x,y,w,h|height|alpha|glow[anim]animx,animy  
Example: ceiling(A4,0,0|2)



### Other map settings

The edge function sets whether to render walls at the map edge.  
Examples: edge(true), edge(false)


---


## Plugin Commands

In this documentation, the parts surrounded with angle bracks like <n> are
parameters.  
<n> means number.  
<t> means time.  

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

The vehicles are boat, ship, and airship.  
"Big" vehicles can't be piloted too close to walls. This can be useful to
avoid clipping with vehicles with large scales.   
Speed of the vehicle should be 1-6. It works the same as event speed.   
A higher airship can fly over higher mountains. Perhaps you could let the
player upgrade their airship's height and speed.



---



## Patrons:

- Whitely
- Yorae Rasante
- Izybelle
- A Memory of Eternity
- Pumpkin Boss

@param graphics
@text Graphics

@param renderDist
@text Render Distance
@desc The maximum distance that can be rendered by the camera.
@parent graphics
@type Number
@default 25

@param antialiasing
@text Antialiasing
@parent graphics
@type Boolean
@default true

@param mipmap
@text Mipmapping
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

@param map
@text Map Settings

@param cellDist
@text Cell Load Radius
@desc The radius around the player that tiles will be loaded.
@parent map
@type Number
@default 20

@param cellSize
@text Cell Size
@parent map
@type Number
@default 10

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
@default 20.0

@param fogFar
@text Fog End Distance
@desc The distance in tiles at which the fog will finish. Maybe set this to the same as render distance.
@parent fog
@type Number
@decimals 1
@default 25.0

@param shadow
@text Light & Shadow

@param ambientColor
@text Ambient Color
@desc The color of the ambient light.
@parent shadow
@type Color
@default white

@param characterShadows
@text Character Shadows
@parent shadow
@type Boolean
@default true

@param shadowScale
@text Default Shadow Scale
@parent shadow
@desc The default size of character shadows.
@type Number
@decimals 1
@default 0.8

@param shadowDist
@text Shadow Distance
@parent shadow
@desc How far above the ground before a character's shadow fades completely. 
@type Number
@decimals 1
@default 4.0

@param input
@text Input & Movement

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

@param stairThresh
@text Stair Threshold
@desc If the distance in height between two tiles is less than this, they will be passable.
@parent input
@type Number
@decimals 2
@default 0.1

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

*/!function(t){var e={};function i(a){if(e[a])return e[a].exports;var s=e[a]={i:a,l:!1,exports:{}};return t[a].call(s.exports,s,s.exports,i),s.l=!0,s.exports}i.m=t,i.c=e,i.d=function(t,e,a){i.o(t,e)||Object.defineProperty(t,e,{enumerable:!0,get:a})},i.r=function(t){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})},i.t=function(t,e){if(1&e&&(t=i(t)),8&e)return t;if(4&e&&"object"==typeof t&&t&&t.__esModule)return t;var a=Object.create(null);if(i.r(a),Object.defineProperty(a,"default",{enumerable:!0,value:t}),2&e&&"string"!=typeof t)for(var s in t)i.d(a,s,function(e){return t[e]}.bind(null,s));return a},i.n=function(t){var e=t&&t.__esModule?function(){return t.default}:function(){return t};return i.d(e,"a",e),e},i.o=function(t,e){return Object.prototype.hasOwnProperty.call(t,e)},i.p="",i(i.s=7)}([function(t,e,i){"use strict";var a=i(2),s=i(1);const r={setup(){this.setupParameters(),Object(a.y)(),this.canvas=document.createElement("canvas"),this.texture=PIXI.Texture.fromCanvas(this.canvas),this.engine=new a.d(this.canvas,this.ANTIALIASING),this.scene=new a.p(this.engine),this.scene.clearColor.set(0,0,0,0),this.cameraStick=new a.t("cameraStick",this.scene),this.cameraNode=new a.t("cameraNode",this.scene),this.cameraNode.parent=this.cameraStick,this.camera=new a.g("camera",new a.v(0,0,0),this.scene),this.camera.parent=this.cameraNode,this.camera.fov=Object(s.f)(r.FOV),this.camera.orthoLeft=-Graphics.width/2/Object(s.n)(),this.camera.orthoRight=Graphics.width/2/Object(s.n)(),this.camera.orthoTop=Graphics.height/2/Object(s.n)(),this.camera.orthoBottom=-Graphics.height/2/Object(s.n)(),this.camera.minZ=.1,this.camera.maxZ=this.RENDER_DIST,this.callFeatures("setup"),this.scene.ambientColor=new a.b(1,1,1),this.scene.fogMode=a.e,this.map=new a.k("map",this.scene),this.cells={},this.characters=[],this.setupBlenders(),this.setupInput(),this.setupSpriteMeshes()},updateCanvas(){this.canvas.width=Graphics._width,this.canvas.height=Graphics._height},render(){this.scene.render(),this.texture.update()},lastMapUpdate:0,update(){performance.now()-this.lastMapUpdate>1e3&&!this.mapUpdating&&(this.updateMap(),this.lastMapUpdate=performance.now()),this.updateAnimations(),this.updateCharacters(),this.updateBlenders(),this.sunlight&&this.sunNode.position.copyFrom(this.cameraStick.position),(r.KEYBOARD_TURN||this.is1stPerson())&&(Input.isTriggered("rotleft")?this.blendCameraYaw.setValue(this.blendCameraYaw.targetValue()+90,.5):Input.isTriggered("rotright")&&this.blendCameraYaw.setValue(this.blendCameraYaw.targetValue()-90,.5),this.is1stPerson()&&(Input.isTriggered("rotleft")||Input.isTriggered("rotright"))&&this.playerFaceYaw()),r.KEYBOARD_PITCH&&(Input.isPressed("pageup")&&Input.isPressed("pagedown")||(Input.isPressed("pageup")?this.blendCameraPitch.setValue(Math.min(180,this.blendCameraPitch.targetValue()+1.5),.1):Input.isPressed("pagedown")&&this.blendCameraPitch.setValue(Math.max(0,this.blendCameraPitch.targetValue()-1.5),.1)));for(const t in this.cells)this.cells[t].update();this.updateData()},loadData:(t,e)=>$gameVariables&&$gameVariables.mv3d&&t in $gameVariables.mv3d?$gameVariables.mv3d[t]:e,saveData(t,e){if(!$gameVariables)return console.warn(`MV3D: Couldn't save data ${t}:${e}`);$gameVariables.mv3d||($gameVariables.mv3d={}),$gameVariables.mv3d[t]=e},updateCameraMode(){this.cameraMode.startsWith("O")?this.camera.mode!==a.l&&(this.camera.mode=a.l):this.camera.mode!==a.m&&(this.camera.mode=a.m)},get cameraMode(){return this.loadData("cameraMode",this.CAMERA_MODE).toUpperCase()},set cameraMode(t){t=String(t).toUpperCase().startsWith("O")?"ORTHOGRAPHIC":"PERSPECTIVE",this.saveData("cameraMode",t),this.updateBlenders(!0)},is1stPerson(t){const e=t?"currentValue":"targetValue";return this.getCameraTarget()===$gamePlayer&&this.blendCameraTransition[e]()<=0&&this.blendCameraDist[e]()<=0&&0===this.blendPanX[e]()&&0===this.blendPanY[e]()},isDisabled(){return this.getMapConfig("disabled")||this.loadData("disabled")},disable(t=2){r.saveData("disabled",!0),$gamePlayer.reserveTransfer($gameMap.mapId(),$gamePlayer.x,$gamePlayer.y,$gamePlayer.direction(),t)},enable(t=2){r.saveData("disabled",!1),$gamePlayer.reserveTransfer($gameMap.mapId(),$gamePlayer.x,$gamePlayer.y,$gamePlayer.direction(),t)},loopCoords(t,e){if($gameMap.isLoopHorizontal()){const e=$gameMap.width(),i=this.cameraStick.x-e/2;t=(t-i).mod(e)+i}if($gameMap.isLoopVertical()){const t=$gameMap.height(),i=this.cameraStick.y-t/2;e=(e-i).mod(t)+i}return new a.u(t,e)},playerFaceYaw(){let t=Math.floor((45-r.blendCameraYaw.targetValue())/90).mod(4);t>1&&(t+=(t+1)%2*2-1),t=10-(2*t+2),$gamePlayer.setDirection(t)},dirToYaw(t){let e=t/2-1;return e>1&&(e+=(e+1)%2*2-1),e=-90*e+180},transformDirectionYaw(t,e=this.blendCameraYaw.currentValue(),i=!1){if(0==t)return 0;(t=t/2-1)>1&&(t+=(t+1)%2*2-1);const a=Math.floor((e+45)/90);return(t=i?(t-a).mod(4):(t+a).mod(4))>1&&(t+=(t+1)%2*2-1),2*t+2}};window.mv3d=r,e.a=r},function(t,e,i){"use strict";i.d(e,"h",(function(){return n})),i.d(e,"j",(function(){return o})),i.d(e,"d",(function(){return l})),i.d(e,"g",(function(){return c})),i.d(e,"l",(function(){return u})),i.d(e,"f",(function(){return d})),i.d(e,"i",(function(){return p})),i.d(e,"k",(function(){return g})),i.d(e,"e",(function(){return m})),i.d(e,"n",(function(){return f})),i.d(e,"o",(function(){return _})),i.d(e,"m",(function(){return b})),i.d(e,"a",(function(){return T})),i.d(e,"b",(function(){return C})),i.d(e,"c",(function(){return y}));const{Vector2:a,Vector3:s,Color3:r,Color4:h}=window.BABYLON,n=t=>{if("number"==typeof t)return{r:(t>>16)/255,g:(t>>8&255)/255,b:(255&t)/255,a:1};if(t instanceof r)return t.toColor4();if(t instanceof h)return t;{const e=document.createElement("canvas");e.width=1,e.height=1;const i=e.getContext("2d");i.fillStyle=t,i.fillRect(0,0,1,1);const a=i.getImageData(0,0,1,1).data;return new h(a[0]/255,a[1]/255,a[2]/255,a[3]/255)}},o=(t,e)=>{if(""===e)return+t;const i=/^[+]/.test(e);return i&&(e=e.substr(1)),e=Number(e),Number.isNaN(e)?+t:i?+t+e:+e},l=t=>Boolean(c(t)),c=t=>{if(!t)return!1;"string"!=typeof t&&(t=String(t));const e=t.toUpperCase();return!c.values.includes(e)&&t};c.values=["OFF","FALSE","UNDEFINED","NULL","DISABLE","DISABLED"];const u=(t=0)=>new Promise(e=>setTimeout(e,t)),d=t=>t*Math.PI/180,p=t=>180*t/Math.PI,g=t=>Math.round(1e3*Math.sin(t))/1e3,m=t=>Math.round(1e3*Math.cos(t))/1e3,f=()=>_(),_=()=>Game_Map.prototype.tileWidth(),b=()=>Game_Map.prototype.tileHeight(),T=new s(1,0,0),C=new s(0,1,0),y=new s(0,0,1);new a(0,0),new s(0,0,0)},function(t,e,i){"use strict";i.d(e,"p",(function(){return h})),i.d(e,"d",(function(){return n})),i.d(e,"g",(function(){return o})),i.d(e,"q",(function(){return u})),i.d(e,"o",(function(){return d})),i.d(e,"u",(function(){return g})),i.d(e,"v",(function(){return m})),i.d(e,"b",(function(){return _})),i.d(e,"n",(function(){return T})),i.d(e,"k",(function(){return C})),i.d(e,"t",(function(){return y})),i.d(e,"s",(function(){return S})),i.d(e,"r",(function(){return M})),i.d(e,"i",(function(){return E})),i.d(e,"w",(function(){return I})),i.d(e,"j",(function(){return w})),i.d(e,"f",(function(){return A})),i.d(e,"a",(function(){return x})),i.d(e,"c",(function(){return F})),i.d(e,"m",(function(){return D})),i.d(e,"l",(function(){return L})),i.d(e,"e",(function(){return R})),i.d(e,"x",(function(){return V})),i.d(e,"h",(function(){return B})),i.d(e,"y",(function(){return Y}));var a=i(0),s=i(1);const r=window.BABYLON,{Scene:h,Engine:n,FreeCamera:o,HemisphericLight:l,DirectionalLight:c,SpotLight:u,PointLight:d,ShadowGenerator:p,Vector2:g,Vector3:m,Vector4:f,Color3:_,Color4:b,Plane:T,Node:C,TransformNode:y,Texture:S,StandardMaterial:M,Mesh:E,VertexData:I,MeshBuilder:w,AssetsManager:v,SceneSerializer:O}=r,{FRONTSIDE:A,BACKSIDE:x,DOUBLESIDE:F}=E,{PERSPECTIVE_CAMERA:D,ORTHOGRAPHIC_CAMERA:L}=r.Camera,{FOGMODE_NONE:N,FOGMODE_EXP:P,FOGMODE_EXP2:H,FOGMODE_LINEAR:R}=h,V=r.Space.WORLD,B=r.Space.LOCAL;r.Space.BONE;S.prototype.crop=function(t=0,e=0,i=0,s=0){const{width:r,height:h}=this.getBaseSize();i||(i=r-t),s||(s=h-e),a.a.EDGE_FIX&&(t+=a.a.EDGE_FIX,e+=a.a.EDGE_FIX,i-=2*a.a.EDGE_FIX,s-=2*a.a.EDGE_FIX),this.uScale=i/r,this.vScale=s/h,this.uOffset=t/r,this.vOffset=1-e/h-this.vScale},Object.defineProperties(C.prototype,{x:{get(){return this.position?this.position.x:void 0},set(t){this.position&&(this.position.x=t)}},y:{get(){return this.position?-this.position.z:void 0},set(t){this.position&&(this.position.z=-t)}},z:{get(){return this.position?this.position.y:void 0},set(t){this.position&&(this.position.y=t)}},pitch:{get(){return this.rotation?-Object(s.i)(this.rotation.x):void 0},set(t){this.rotation&&(this.rotation.x=-Object(s.f)(t))}},yaw:{get(){return this.rotation?-Object(s.i)(this.rotation.y):void 0},set(t){this.rotation&&(this.rotation.y=-Object(s.f)(t))}},roll:{get(){return this.rotation?-Object(s.i)(this.rotation.z):void 0},set(t){this.rotation&&(this.rotation.z=-Object(s.f)(t))}}}),Object.defineProperty(E.prototype,"order",{get(){return this._order},set(t){this._order=t,this._scene.sortMeshes()}});const G=(t,e)=>(0|t._order)-(0|e._order);h.prototype.sortMeshes=function(){this.meshes.sort(G)};const $=h.prototype.addMesh;h.prototype.addMesh=function(t){$.apply(this,arguments),"number"==typeof t._order&&this.sortMeshes()};const j=h.prototype.removeMesh;function Y(){r.Effect.ShadersStore.shadowMapPixelShader=r.Effect.ShadersStore.shadowMapPixelShader.replace("if (texture2D(diffuseSampler,vUV).a<0.4)",`if (texture2D(diffuseSampler,vUV).a<${a.a.ALPHA_CUTOFF})`)}h.prototype.removeMesh=function(t){j.apply(this,arguments),this.sortMeshes()},_.prototype.toNumber=b.prototype.toNumber=function(){return 255*this.r<<16|255*this.g<<8|255*this.b}},function(t,e){t.exports=require("fs")},function(t,e){t.exports=require("path")},function(t,e,i){i(6)},function(t,e,i){"use strict";i.r(e);i(0);const a=Window_Options.prototype.makeCommandList;Window_Options.prototype.makeCommandList=function(){a.apply(this,arguments),this.addCommand("3D Options","mv3d-options")}},function(t,e,i){"use strict";i.r(e);var a=i(0),s=i(2);const r=Graphics._createCanvas;Graphics._createCanvas=function(){a.a.setup(),a.a.updateCanvas(),r.apply(this,arguments)};const h=Graphics._updateAllElements;Graphics._updateAllElements=function(){h.apply(this,arguments),a.a.updateCanvas()};const n=Graphics.render;Graphics.render=function(){a.a.render(),n.apply(this,arguments)};const o=Scene_Map.prototype.update;Scene_Map.prototype.update=function(){o.apply(this,arguments),a.a.update()};const l=ShaderTilemap.prototype.renderWebGL;ShaderTilemap.prototype.renderWebGL=function(t){a.a.mapDisabled&&l.apply(this,arguments)};const c=Spriteset_Map.prototype.createTilemap;Spriteset_Map.prototype.createTilemap=function(){c.apply(this,arguments),a.a.mapDisabled=a.a.isDisabled(),a.a.mapDisabled||(this._tilemap.visible=!1,this._baseSprite.addChild(new PIXI.Sprite(a.a.texture)))};const u=Sprite_Character.prototype.setCharacter;Sprite_Character.prototype.setCharacter=function(t){u.apply(this,arguments),Object.defineProperty(t,"mv_sprite",{value:this,configurable:!0})};const d=Game_Player.prototype.performTransfer;Game_Player.prototype.performTransfer=function(){const t=this._newMapId!==$gameMap.mapId();t&&a.a.clearMap(),d.apply(this,arguments)};let p=!1;const g=Scene_Map.prototype.onMapLoaded;Scene_Map.prototype.onMapLoaded=function(){p&&(a.a.clearMap(),p=!1),a.a.loadMapSettings(),g.apply(this,arguments),a.a.mapLoaded||(a.a.loadTilesetSettings(),a.a.mapReady=!1,a.a.loadMap()),a.a.updateBlenders(!0)};const m=Scene_Load.prototype.onLoadSuccess;Scene_Load.prototype.onLoadSuccess=function(){m.apply(this,arguments),p=!0};const f=Scene_Map.prototype.isReady;Scene_Map.prototype.isReady=function(){let t=f.apply(this,arguments);return t&&a.a.mapReady};const _=Scene_Title.prototype.start;Scene_Title.prototype.start=function(){_.apply(this,arguments),a.a.clearMap(),a.a.clearCameraTarget()};var b=i(1);const T=PluginManager.parameters("mv3d-babylon");Object.assign(a.a,{CAMERA_MODE:"PERSPECTIVE",ORTHOGRAPHIC_DIST:100,MV3D_FOLDER:"img/MV3D",ANIM_DELAY:Number(T.animDelay),ALPHA_CUTOFF:Math.max(.01,T.alphatest),EDGE_FIX:Number(T.edgefix),ANTIALIASING:Object(b.d)(T.antialiasing),FOV:Number(T.fov),WALL_HEIGHT:Number(T.wallHeight),TABLE_HEIGHT:Number(T.tableHeight),FRINGE_HEIGHT:Number(T.fringeHeight),CEILING_HEIGHT:Number(T.ceilingHeight),LAYER_DIST:Number(T.layerDist),CELL_SIZE:Number(T.cellSize),CELL_DIST:Number(T.cellDist),RENDER_DIST:Number(T.renderDist),MIPMAP:Object(b.d)(T.mipmap),STAIR_THRESH:Number(T.stairThresh),FOG_COLOR:Object(b.h)(T.fogColor).toNumber(),FOG_NEAR:Number(T.fogNear),FOG_FAR:Number(T.fogFar),AMBIENT_COLOR:Object(b.h)(T.ambientColor).toNumber(),LIGHT_HEIGHT:.5,LIGHT_DECAY:1,LIGHT_DIST:3,LIGHT_ANGLE:45,FLASHLIGHT_EXTRA_ANGLE:10,CHARACTER_SHADOWS:Object(b.d)(T.characterShadows),SHADOW_SCALE:Number(T.shadowScale),SHADOW_DIST:Number(T.shadowDist),KEYBOARD_PITCH:Object(b.d)(T.keyboardPitch),KEYBOARD_TURN:Object(b.d)(T.keyboardTurn),KEYBOARD_STRAFE:Object(b.d)(T.keyboardStrafe),REGION_DATA:{},TTAG_DATA:{},EVENT_HEIGHT:Number(T.eventHeight),VEHICLE_BUSH:Object(b.d)(T.vehicleBush),BOAT_SETTINGS:JSON.parse(T.boatSettings),SHIP_SETTINGS:JSON.parse(T.shipSettings),AIRSHIP_SETTINGS:JSON.parse(T.airshipSettings),setupParameters(){for(let t of JSON.parse(T.regions)){t=JSON.parse(t);const e=this.readConfigurationFunctions(t.conf,this.tilesetConfigurationFunctions);this.REGION_DATA[t.regionId]=e}for(let t of JSON.parse(T.ttags))t=JSON.parse(t),this.TTAG_DATA[t.terrainTag]=this.readConfigurationFunctions(t.conf,this.tilesetConfigurationFunctions);this.BOAT_SETTINGS.scale=Number(this.BOAT_SETTINGS.scale),this.BOAT_SETTINGS.zoff=Number(this.BOAT_SETTINGS.zoff),this.BOAT_SETTINGS.big=Object(b.d)(this.BOAT_SETTINGS.big),this.SHIP_SETTINGS.scale=Number(this.SHIP_SETTINGS.scale),this.SHIP_SETTINGS.zoff=Number(this.SHIP_SETTINGS.zoff),this.SHIP_SETTINGS.big=Object(b.d)(this.SHIP_SETTINGS.big),this.AIRSHIP_SETTINGS.scale=Number(this.AIRSHIP_SETTINGS.scale),this.AIRSHIP_SETTINGS.height=Number(this.AIRSHIP_SETTINGS.height),this.AIRSHIP_SETTINGS.shadowScale=Number(this.AIRSHIP_SETTINGS.shadowScale),this.AIRSHIP_SETTINGS.shadowDist=Number(this.AIRSHIP_SETTINGS.shadowDist),this.AIRSHIP_SETTINGS.big=Object(b.d)(this.AIRSHIP_SETTINGS.big),this.AIRSHIP_SETTINGS.bushLanding=Object(b.d)(this.AIRSHIP_SETTINGS.bushLanding),this.EVENT_SHAPE=this.configurationShapes[T.eventShape.toUpperCase()]}}),Object.assign(a.a,{cameraTargets:[],getCameraTarget(){return this.cameraTargets[0]},setCameraTarget(t,e){t?(this.cameraTargets.unshift(t),this.cameraTargets.length>2&&(this.cameraTargets.length=2),this.saveData("cameraTarget",this.getTargetString(t)),this.blendCameraTransition.value=1,this.blendCameraTransition.setValue(0,e)):this.cameraTargets.length=0},clearCameraTarget(){this.cameraTargets.length=0},resetCameraTarget(){this.clearCameraTarget(),this.setCameraTarget($gamePlayer,0)},rememberCameraTarget(){const t=this.loadData("cameraTarget");t&&this.setCameraTarget(this.targetChar(t),0)},setupBlenders(){this.blendFogColor=new ColorBlender("fogColor",this.FOG_COLOR),this.blendFogNear=new blenders_Blender("fogNear",this.FOG_NEAR),this.blendFogFar=new blenders_Blender("fogFar",this.FOG_FAR),this.blendCameraYaw=new blenders_Blender("cameraYaw",0),this.blendCameraYaw.cycle=360,this.blendCameraPitch=new blenders_Blender("cameraPitch",60),this.blendCameraPitch.min=0,this.blendCameraPitch.max=180,this.blendCameraDist=new blenders_Blender("cameraDist",10),this.blendCameraHeight=new blenders_Blender("cameraHeight",.7),this.blendAmbientColor=new ColorBlender("ambientColor",this.AMBIENT_COLOR),this.blendSunlightColor=new ColorBlender("light_color",16777215),this.blendSunlightIntensity=new blenders_Blender("light_intensity",1),this.blendPanX=new blenders_Blender("panX",0),this.blendPanY=new blenders_Blender("panY",0),this.blendCameraTransition=new blenders_Blender("cameraTransition",0)},updateBlenders(t){if(this.updateCameraMode(),this.cameraTargets.length||$gamePlayer&&(this.cameraTargets[0]=$gamePlayer),this.blendCameraTransition.update()&&this.cameraTargets.length>=2){const t=this.blendCameraTransition.currentValue();let e=this.cameraTargets[0];e===$gamePlayer&&$gamePlayer.isInVehicle()&&(e=$gamePlayer.vehicle());let i=this.cameraTargets[1];i===$gamePlayer&&$gamePlayer.isInVehicle()&&(i=$gamePlayer.vehicle()),this.cameraStick.x=e._realX*(1-t)+i._realX*t,this.cameraStick.y=e._realY*(1-t)+i._realY*t,e.mv3d_sprite&&i.mv3d_sprite?this.cameraStick.z=e.mv3d_sprite.z*(1-t)+i.mv3d_sprite.z*t:e.mv3d_sprite&&(this.cameraStick.z=e.mv3d_sprite.z)}else if(this.cameraTargets.length){let t=this.getCameraTarget();t===$gamePlayer&&$gamePlayer.isInVehicle()&&(t=$gamePlayer.vehicle()),this.cameraStick.x=t._realX,this.cameraStick.y=t._realY,t.mv3d_sprite&&(this.cameraStick.z=t.mv3d_sprite.z)}this.blendPanX.update(),this.blendPanY.update(),this.cameraStick.x+=this.blendPanX.currentValue(),this.cameraStick.y+=this.blendPanY.currentValue(),t|this.blendCameraPitch.update()|this.blendCameraYaw.update()|this.blendCameraDist.update()|this.blendCameraHeight.update()&&(this.cameraNode.pitch=this.blendCameraPitch.currentValue()-90,this.cameraNode.yaw=this.blendCameraYaw.currentValue(),this.cameraNode.position.set(0,0,0),this.cameraNode.translate(b.c,-this.blendCameraDist.currentValue(),s.h),this.camera.mode===s.l?(this.camera.maxZ=this.RENDER_DIST,this.camera.minZ=-this.RENDER_DIST):(this.cameraNode.z<0&&(this.cameraNode.z=0),this.camera.maxZ=this.RENDER_DIST,this.camera.minZ=.1),this.cameraNode.z+=this.blendCameraHeight.currentValue()),t|this.blendFogColor.update()|this.blendFogNear.update()|this.blendFogFar.update()&&(this.scene.fogStart=this.blendFogNear.currentValue(),this.scene.fogEnd=this.blendFogFar.currentValue(),this.scene.fogColor.copyFromFloats(this.blendFogColor.r.currentValue()/255,this.blendFogColor.g.currentValue()/255,this.blendFogColor.b.currentValue()/255)),t|this.blendAmbientColor.update()&&this.scene.ambientColor.copyFromFloats(this.blendAmbientColor.r.currentValue()/255,this.blendAmbientColor.g.currentValue()/255,this.blendAmbientColor.b.currentValue()/255)}});class blenders_Blender{constructor(t,e){this.key=t,this.dfault=a.a.loadData(t,e),this.value=e,this.speed=1,this.max=1/0,this.min=-1/0,this.cycle=!1}setValue(t,e=0){let i=(t=Math.min(this.max,Math.max(this.min,t)))-this.value;if(i){if(this.saveValue(this.key,t),this.cycle)for(;Math.abs(i)>this.cycle/2;)this.value+=Math.sign(i)*this.cycle,i=t-this.value;this.speed=Math.abs(i)/(60*e)}}currentValue(){return this.value}targetValue(){return this.loadValue(this.key)}defaultValue(){return this.dfault}update(){const t=this.targetValue();if(this.value===t)return!1;const e=t-this.value;return this.speed>Math.abs(e)?this.value=t:this.value+=this.speed*Math.sign(e),!0}storageLocation(){return $gameVariables?($gameVariables.mv3d||($gameVariables.mv3d={}),$gameVariables.mv3d):(console.warn("MV3D: Couldn't get Blend storage location."),{})}loadValue(t){const e=this.storageLocation();return t in e?e[t]:this.dfault}saveValue(t,e){this.storageLocation()[t]=e}}class ColorBlender{constructor(t,e){this.dfault=e,this.r=new blenders_Blender(`${t}_r`,e>>16),this.g=new blenders_Blender(`${t}_g`,e>>8&255),this.b=new blenders_Blender(`${t}_b`,255&e)}setValue(t,e){this.r.setValue(t>>16,e),this.g.setValue(t>>8&255,e),this.b.setValue(255&t,e)}currentValue(){return this.r.value<<16|this.g.value<<8|this.b.value}targetValue(){return this.r.targetValue()<<16|this.g.targetValue()<<8|this.b.targetValue()}defaultValue(){return this.dfault}update(){let t=0;return t|=this.r.update(),t|=this.g.update(),t|=this.b.update(),Boolean(t)}get storageLocation(){return this.r.storageLocation}set storageLocation(t){this.r.storageLocation=t,this.g.storageLocation=t,this.b.storageLocation=t}currentComponents(){return[this.r.currentValue()/255,this.g.currentValue()/255,this.b.currentValue()/255]}targetComponents(){return[this.r.targetValue()/255,this.g.targetValue()/255,this.b.targetValue()/255]}}function C(t,e,i){let s=void 0;return{configurable:!0,get:()=>null!=s?s:SceneManager._scene instanceof Scene_Map?a.a.is1stPerson()?i:e:t,set(t){s=t}}}Object.assign(Input.keyMapper,{81:"rotleft",69:"rotright",87:"up",65:"left",83:"down",68:"right"}),a.a.setupInput=function(){const t={left:C("left","left","rotleft"),rotleft:C("pageup","rotleft",a.a.KEYBOARD_STRAFE?"left":void 0),right:C("right","right","rotright"),rotright:C("pagedown","rotright",a.a.KEYBOARD_STRAFE?"right":void 0)};Object.defineProperties(Input.keyMapper,{37:t.left,39:t.right,81:t.rotleft,69:t.rotright,65:t.left,68:t.right})},Game_Player.prototype.getInputDirection=function(){let t=Input.dir4;return a.a.transformDirectionYaw(t,a.a.blendCameraYaw.currentValue(),!0)};const y=Game_Player.prototype.updateMove;Game_Player.prototype.updateMove=function(){y.apply(this,arguments),!this.isMoving()&&a.a.is1stPerson()&&a.a.playerFaceYaw()};const S=Game_Player.prototype.moveStraight;Game_Player.prototype.moveStraight=function(t){S.apply(this,arguments),!this.isMovementSucceeded()&&a.a.is1stPerson()&&a.a.playerFaceYaw()};const M=t=>!!(t.isEnabled()&&t.isVisible&&t.isPickable)&&(!t.character||!t.character.isFollower&&!t.character.isPlayer),E=Scene_Map.prototype.processMapTouch;Scene_Map.prototype.processMapTouch=function(){if(a.a.isDisabled())return E.apply(this,arguments);if(TouchInput.isTriggered()||this._touchCount>0)if(TouchInput.isPressed()){if(0===this._touchCount||this._touchCount>=15){const t=a.a.scene.pick(TouchInput.x,TouchInput.y,M);if(t.hit){const e={x:t.pickedPoint.x,y:-t.pickedPoint.z},i=t.pickedMesh;i.character&&(e.x=i.character.x,e.y=i.character.y),$gameTemp.setDestination(Math.round(e.x),Math.round(e.y))}}this._touchCount++}else this._touchCount=0};const I=Game_Player.prototype.findDirectionTo;Game_Player.prototype.findDirectionTo=function(){const t=I.apply(this,arguments);if(a.a.is1stPerson()&&t){let e=a.a.dirToYaw(t);a.a.blendCameraYaw.setValue(e,.25)}return t};class ConfigurationFunction{constructor(t,e){this.groups=t.match(/\[?[^[\]|]+\]?/g),this.labels={};for(let t=0;t<this.groups.length;++t){for(;this.groups[t]&&"["===this.groups[t][0];)this.labels[this.groups[t].slice(1,-1)]=t,this.groups.splice(t,1);if(t>this.groups.length)break;this.groups[t]=this.groups[t].split(",").map(t=>t.trim())}this.func=e}run(t,e){const i=/([,|])?(?:(\w+):)?([^,|\r\n]+)/g;let a,s=0,r=0;const h={};for(let t=0;t<this.groups.length;++t)h[`group${t+1}`]=[];for(;a=i.exec(e);){if(("|"===a[1]||s>=this.groups[r].length)&&(s=0,++r),a[2])if(a[2]in this.labels)r=this.labels[a[2]];else{let t=!1;t:for(let e=0;e<this.groups.length;++e)for(let i=0;i<this.groups[e].length;++i)if(this.groups[e][i]===a[2]){t=!0,r=e,s=i;break t}if(!t)break}if(r>this.groups.length)break;h[this.groups[r][s]]=h[`group${r+1}`][s]=a[3].trim(),++s}this.func(t,h)}}function w(t,e=""){return new ConfigurationFunction(`img,x,y,w,h|${e}|alpha|glow[anim]animx,animy`,(function(e,i){if(5===i.group1.length){const[s,r,h,n,o]=i.group1;e[`${t}_id`]=a.a.constructTileId(s,0,0),e[`${t}_rect`]=new PIXI.Rectangle(r,h,n,o)}else if(3===i.group1.length){const[s,r,h]=i.group1;e[`${t}_id`]=a.a.constructTileId(s,r,h)}else if(2===i.group1.length){const[a,r]=i.group1;e[`${t}_offset`]=new s.u(Number(a),Number(r))}i.animx&&i.animy&&(e[`${t}_animData`]={animX:Number(i.animx),animY:Number(i.animy)}),i.height&&(e[`${t}_height`]=Number(i.height)),i.alpha&&(e[`${t}_alpha`]=Number(i.alpha)),i.glow&&(e[`${t}_glow`]=Number(i.glow))}))}Object.assign(a.a,{tilesetConfigurations:{},loadTilesetSettings(){this.tilesetConfigurations={};const t=this.readConfigurationBlocks($gameMap.tileset().note),e=/^\s*([abcde]\d?)\s*,\s*(\d+(?:-\d+)?)\s*,\s*(\d+(?:-\d+)?)\s*:(.*)$/gim;let i;for(;i=e.exec(t);){const t=this.readConfigurationFunctions(i[4],this.tilesetConfigurationFunctions),e=i[2].split("-").map(t=>Number(t)),a=i[3].split("-").map(t=>Number(t));for(let s=e[0];s<=e[e.length-1];++s)for(let e=a[0];e<=a[a.length-1];++e){const a=`${i[1]},${s},${e}`,r=this.constructTileId(...a.split(","));r in this.tilesetConfigurations||(this.tilesetConfigurations[r]={}),Object.assign(this.tilesetConfigurations[r],t)}}},mapConfigurations:{},loadMapSettings(){const t=this.mapConfigurations={};if(this.readConfigurationFunctions(this.readConfigurationBlocks($dataMap.note),this.mapConfigurationFunctions,t),"fog"in t){const e=t.fog;"color"in e&&this.blendFogColor.setValue(e.color,0),"near"in e&&this.blendFogNear.setValue(e.near,0),"far"in e&&this.blendFogFar.setValue(e.far,0)}"light"in t&&this.blendAmbientColor.setValue(t.light.color,0),"cameraDist"in t&&this.blendCameraDist.setValue(t.cameraDist,0),"cameraHeight"in t&&this.blendCameraHeight.setValue(t.cameraHeight,0),"cameraMode"in t&&(this.cameraMode=t.cameraMode),"cameraPitch"in t&&this.blendCameraPitch.setValue(t.cameraPitch,0),"cameraYaw"in t&&this.blendCameraYaw.setValue(t.cameraYaw,0)},getMapConfig(t,e){return t in this.mapConfigurations?this.mapConfigurations[t]:e},getCeilingConfig(){let t={};for(const e in this.mapConfigurations)e.startsWith("ceiling_")&&(t[e.replace("ceiling_","bottom_")]=this.mapConfigurations[e]);return t.bottom_id=this.getMapConfig("ceiling_id",0),t.height=this.getMapConfig("ceiling_height",this.CEILING_HEIGHT),t},readConfigurationBlocks(t){const e=/<MV3D>([\s\S]*?)<\/MV3D>/gi;let i,a="";for(;i=e.exec(t);)a+=i[1]+"\n";return a},readConfigurationTags(t){const e=/<MV3D:([\s\S]*?)>/gi;let i,a="";for(;i=e.exec(t);)a+=i[1]+"\n";return a},readConfigurationFunctions(t,e=a.a.configurationFunctions,i={}){const s=/(\w+)\((.*?)\)/g;let r;for(;r=s.exec(t);){const t=r[1].toLowerCase();t in e&&(e[t]instanceof ConfigurationFunction?e[t].run(i,r[2]):e[t](i,...r[2].split(",")))}return i},configurationSides:{front:s.f,back:s.a,double:s.c},configurationShapes:{FLAT:1,TREE:2,SPRITE:3,FENCE:4,CROSS:5,XCROSS:6,SLOPE:7},tilesetConfigurationFunctions:{height(t,e){t.height=Number(e)},depth(t,e){t.depth=Number(e)},fringe(t,e){t.fringe=Number(e)},float(t,e){t.float=Number(e)},top:w("top"),side:w("side"),inside:w("inside"),bottom:w("bottom"),texture:Object.assign(w("hybrid"),{func(t,e){a.a.tilesetConfigurationFunctions.top.func(t,e),a.a.tilesetConfigurationFunctions.side.func(t,e)}}),shape(t,e){t.shape=a.a.configurationShapes[e.toUpperCase()]},alpha(t,e){t.transparent=!0,t.alpha=Number(e)},glow(t,e){t.glow=Number(e)}},eventConfigurationFunctions:{height(t,e){t.height=Number(e)},z(t,e){t.z=Number(e)},x(t,e){t.x=Number(e)},y(t,e){t.y=Number(e)},scale(t,e,i){t.scale=new s.u(Number(e),Number(i))},rot(t,e){t.rot=Number(e)},bush(t,e){t.bush=Object(b.d)(e)},shadow(t,e){t.shadow=Number(Object(b.g)(e))},shape(t,e){t.shape=a.a.configurationShapes[e.toUpperCase()]},pos(t,e,i){t.pos={x:e,y:i}},lamp:new ConfigurationFunction("color,intensity,range",(function(t,e){const{color:i="white",intensity:s=1,range:r=a.a.LIGHT_DIST}=e;t.lamp={color:Object(b.h)(i).toNumber(),intensity:Number(s),distance:Number(r)}})),flashlight:new ConfigurationFunction("color,intensity,range,angle|yaw,pitch",(function(t,e){const{color:i="white",intensity:s=1,range:r=a.a.LIGHT_DIST,angle:h=a.a.LIGHT_ANGLE}=e;t.flashlight={color:Object(b.h)(i).toNumber(),intensity:Number(s),distance:Number(r),angle:Number(h)},e.yaw&&(t.flashlightYaw=e.yaw),e.pitch&&(t.flashlightPitch=Number(e.pitch))})),flashlightpitch(t,e="90"){t.flashlightPitch=Number(e)},flashlightyaw(t,e="+0"){t.flashlightYaw=e},lightheight(t,e=1){t.lightHeight=Number(e)},lightoffset(t,e=0,i=0){t.lightOffset={x:+e,y:+i}},alpha(t,e){t.alpha=Number(e)},dirfix(t,e){t.dirfix=Object(b.d)(e)}},mapConfigurationFunctions:{light(t,e){t.light={color:Object(b.h)(e).toNumber()}},fog:new ConfigurationFunction("color|near,far",(function(t,e){const{color:i,near:a,far:s}=e;t.fog||(t.fog={}),i&&(t.fog.color=Object(b.h)(i).toNumber()),a&&(t.fog.near=Number(a)),s&&(t.fog.far=Number(s))})),camera:new ConfigurationFunction("yaw,pitch|dist|height|mode",(function(t,e){const{yaw:i,pitch:a,dist:s,height:r,mode:h}=e;i&&(t.cameraYaw=Number(i)),a&&(t.cameraPitch=Number(a)),s&&(t.cameraDist=Number(s)),r&&(t.cameraHeight=Number(r)),h&&(t.cameraMode=h)})),ceiling:w("ceiling","height"),edge(t,e){t.edge=Object(b.d)(e)},disable(t){t.disabled=!0}}});const v=Game_Event.prototype.setupPage;Game_Event.prototype.setupPage=function(){v.apply(this,arguments),this.mv3d_sprite&&(this.mv3d_needsConfigure=!0,this.mv3d_sprite.eventConfigure())};const O=Game_Event.prototype.initialize;Game_Event.prototype.initialize=function(){O.apply(this,arguments),a.a.mapLoaded&&a.a.createCharacterFor(this);const t=this.event();let e={};a.a.readConfigurationFunctions(a.a.readConfigurationTags(t.note),a.a.eventConfigurationFunctions,e),"pos"in e&&this.locate(Object(b.j)(t.x,e.pos.x),Object(b.j)(t.y,e.pos.y)),this.mv3d_blenders||(this.mv3d_blenders={}),"lamp"in e&&(this.mv3d_blenders.lampColor_r=e.lamp.color>>16,this.mv3d_blenders.lampColor_g=e.lamp.color>>8&255,this.mv3d_blenders.lampColor_b=255&e.lamp.color,this.mv3d_blenders.lampIntensity=e.lamp.intensity,this.mv3d_blenders.lampDistance=e.lamp.distance),"flashlight"in e&&(this.mv3d_blenders.flashlightColor_r=e.flashlight.color>>16,this.mv3d_blenders.flashlightColor_g=e.flashlight.color>>8&255,this.mv3d_blenders.flashlightColor_b=255&e.flashlight.color,this.mv3d_blenders.flashlightIntensity=e.flashlight.intensity,this.mv3d_blenders.flashlightDistance=e.flashlight.distance,this.mv3d_blenders.flashlightAngle=e.flashlight.angle),"flashlightPitch"in e&&(this.mv3d_blenders.flashlightPitch=Number(e.flashlightPitch)),"flashlightYaw"in e&&(this.mv3d_blenders.flashlightYaw=e.flashlightYaw),this.mv3d_needsConfigure=!0};const A=Game_Interpreter.prototype.pluginCommand;Game_Interpreter.prototype.pluginCommand=function(t,e){if("mv3d"!==t.toLowerCase())return A.apply(this,arguments);const i=new a.a.PluginCommand;if(i.INTERPRETER=this,i.FULL_COMMAND=[t,...e].join(" "),e=e.filter(t=>t),i.CHAR=$gameMap.event(this._eventId),e[0]){const t=e[0][0];"@"!==t&&"＠"!==t||(i.CHAR=i.TARGET_CHAR(e.shift()))}const s=e.shift().toLowerCase();s in i&&i[s](...e)},a.a.PluginCommand=class{async camera(...t){var e=this._TIME(t[2]);switch(t[0].toLowerCase()){case"pitch":return void this.pitch(t[1],e);case"yaw":return void this.yaw(t[1],e);case"dist":case"distance":return void this.dist(t[1],e);case"height":return void this.height(t[1],e);case"mode":return void this.cameramode(t[1]);case"target":return void this._cameraTarget(t[1],e);case"pan":return void this.pan(t[1],t[2],t[3])}}yaw(t,e=1){this._RELATIVE_BLEND(a.a.blendCameraYaw,t,e),a.a.is1stPerson()&&a.a.playerFaceYaw()}pitch(t,e=1){this._RELATIVE_BLEND(a.a.blendCameraPitch,t,e)}dist(t,e=1){this._RELATIVE_BLEND(a.a.blendCameraDist,t,e)}height(t,e=1){this._RELATIVE_BLEND(a.a.blendCameraHeight,t,e)}_cameraTarget(t,e){a.a.setCameraTarget(this.TARGET_CHAR(t),e)}pan(t,e,i=1){console.log(t,e,i),i=this._TIME(i),this._RELATIVE_BLEND(a.a.blendPanX,t,i),this._RELATIVE_BLEND(a.a.blendPanY,e,i)}rotationmode(t){a.a.rotationMode=t}pitchmode(t){a.a.pitchMode=t}_VEHICLE(t,e,i){e=e.toLowerCase();const s=`${Vehicle}_${e}`;i="big"===e?booleanString(i):Object(b.j)(a.a.loadData(s,0),i),a.a.saveData(s,i)}boat(t,e){this._VEHICLE("boat",t,e)}ship(t,e){this._VEHICLE("ship",t,e)}airship(t,e){this._VEHICLE("airship",t,e)}cameramode(t){a.a.cameraMode=t}fog(...t){var e=this._TIME(t[2]);switch(t[0].toLowerCase()){case"color":return void this._fogColor(t[1],e);case"near":return void this._fogNear(t[1],e);case"far":return void this._fogFar(t[1],e);case"dist":case"distance":return e=this._TIME(t[3]),this._fogNear(t[1],e),void this._fogFar(t[2],e)}e=this._TIME(t[3]),this._fogColor(t[0],e),this._fogNear(t[1],e),this._fogFar(t[2],e)}_fogColor(t,e){a.a.blendFogColor.setValue(Object(b.h)(t).toNumber(),e)}_fogNear(t,e){this._RELATIVE_BLEND(a.a.blendFogNear,t,e)}_fogFar(t,e){this._RELATIVE_BLEND(a.a.blendFogFar,t,e)}light(...t){var e=this._TIME(t[2]);switch(t[0].toLowerCase()){case"color":return void this._lightColor(t[1],e)}e=this._TIME(t[1]),this._lightColor(t[0],e)}_lightColor(t,e=1){a.a.blendAmbientColor.setValue(Object(b.h)(t).toNumber(),e)}async lamp(...t){const e=await this.AWAIT_CHAR(this.CHAR);e.setupLamp();var i=this._TIME(t[2]);switch(t[0].toLowerCase()){case"color":return void this._lampColor(e,t[1],i);case"intensity":return void this._lampIntensity(e,t[1],i);case"dist":case"distance":return void this._lampDistance(e,t[1],i)}i=this._TIME(t[3]),this._lampColor(e,t[0],i),this._lampIntensity(e,t[1],i),this._lampDistance(e,t[2],i)}_lampColor(t,e,i=1){t.blendLampColor.setValue(Object(b.h)(e).toNumber(),i)}_lampIntensity(t,e,i=1){this._RELATIVE_BLEND(t.blendLampIntensity,e,i)}_lampDistance(t,e,i=1){this._RELATIVE_BLEND(t.blendLampDistance,e,i)}async flashlight(...t){const e=await this.AWAIT_CHAR(this.CHAR);e.setupFlashlight();var i=this._TIME(t[2]);switch(t[0].toLowerCase()){case"color":return void this._flashlightColor(e,t[1],i);case"intensity":return void this._flashlightIntensity(e,t[1],i);case"dist":case"distance":return void this._flashlightDistance(e,t[1],i);case"angle":return void this._flashlightAngle(e,t[1],i);case"yaw":return void this._flashlightYaw(e,t[1],i);case"pitch":return void this._flashlightPitch(e,t[1],i)}i=this._TIME(t[4]),this._flashlightColor(e,t[0],i),this._flashlightIntensity(e,t[1],i),this._flashlightDistance(e,t[2],i),this._flashlightAngle(e,t[3],i)}_flashlightColor(t,e,i){t.blendFlashlightColor.setValue(Object(b.h)(e).toNumber(),i)}_flashlightIntensity(t,e,i){this._RELATIVE_BLEND(t.blendFlashlightIntensity,e,i)}_flashlightDistance(t,e,i){this._RELATIVE_BLEND(t.blendFlashlightDistance,e,i)}_flashlightAngle(t,e,i){this._RELATIVE_BLEND(t.blendFlashlightAngle,e,i)}_flashlightPitch(t,e,i){this._RELATIVE_BLEND(t.blendFlashlightPitch,e,i)}_flashlightYaw(t,e,i){t.flashlightTargetYaw=e}disable(t){a.a.disable(t)}enable(t){a.a.enable(t)}_RELATIVE_BLEND(t,e,i){t.setValue(Object(b.j)(t.targetValue(),e),Number(i))}_TIME(t){return"number"==typeof t?t:(t=Number(t),Number.isNaN(t)?1:t)}ERROR_CHAR(){console.warn(`MV3D: Plugin command \`${this.FULL_COMMAND}\` failed because target character was invalid.`)}async AWAIT_CHAR(t){if(!t)return this.ERROR_CHAR();let e=0;for(;!t.mv3d_sprite;)if(await sleep(100),++e>10)return this.ERROR_CHAR();return t.mv3d_sprite}TARGET_CHAR(t){return a.a.targetChar(t,$gameMap.event(this.INTERPRETER._eventId),this.CHAR)}},a.a.targetChar=function(t,e=null,i=null){if(!t)return i;let a=t.toLowerCase().match(/[a-z]+/);const s=a?a[0]:"e",r=(a=t.match(/\d+/))?Number(a[0]):0;switch(s[0]){case"s":return e;case"p":return $gamePlayer;case"e":return r?$gameMap.event(r):e;case"v":return $gameMap.vehicle(r);case"f":return $gamePlayer.followers()._data[r]}return char},a.a.getTargetString=function(t){return t instanceof Game_Player?"@p":t instanceof Game_Event?`@e${t._eventId}`:t instanceof Game_Follower?`@f${$gamePlayer._followers._data.indexOf(t)}`:t instanceof Game_Vehicle?`@v${$gameMap._vehicles.indexOf(t)}`:void 0},Object.assign(a.a,{_tilemap:null,getTilemap(){return SceneManager._scene&&SceneManager._scene._spriteset&&(this._tilemap=SceneManager._scene._spriteset._tilemap),this._tilemap},getSetNumber:t=>Tilemap.isAutotile(t)?Tilemap.isTileA1(t)?0:Tilemap.isTileA2(t)?1:Tilemap.isTileA3(t)?2:3:Tilemap.isTileA5(t)?4:5+Math.floor(t/256),getTerrainTag:t=>$gameMap.tilesetFlags()[t]>>12,getMaterialOptions(t,e){const i={};return"alpha"in t&&(i.alpha=t.alpha),"glow"in t&&(i.glow=t.glow),e&&(`${e}_alpha`in t&&(i.alpha=t[`${e}_alpha`]),`${e}_glow`in t&&(i.glow=t[`${e}_glow`])),"alpha"in i&&(i.transparent=!0),i},getTileAnimationData(t,e){const i=t[`${e}_id`];if(`${e}_animData`in t)return t[`${e}_animData`];const a={animX:0,animY:0};if(Tilemap.isTileA1(i)){const t=Tilemap.getAutotileKind(i);a.animX=t<=1?2:t<=3?0:t%2?0:2,a.animY=t<=3?0:t%2?1:0}return a},getTileConfig(t,e,i,s){const r={},h=this.getTerrainTag(t);h&&h in this.TTAG_DATA&&Object.assign(r,this.TTAG_DATA[h]);const n=this.tilesetConfigurations[this.normalizeAutotileId(t)];if(n&&Object.assign(r,n),0===s){const t=$gameMap.regionId(e,i);t&&t in a.a.REGION_DATA&&Object.assign(r,this.REGION_DATA[t])}return r},getTileTextureOffsets(t,e,i,a){const s=this.getTileConfig(t,e,i,a),r=Tilemap.isAutotile(t)?48:1,h=this.getTilemap();return s.hasInsideConf=Boolean(s.inside_offset||s.rectInside||"inside_id"in s),s.hasBottomConf=Boolean(s.bottom_offset||s.rectBottom||"bottom_id"in s),null==s.top_id&&(s.top_id=t,s.top_offset&&(s.top_id=t+s.top_offset.x*r+s.top_offset.y*r*8)),null==s.side_id&&(s.side_id=t,s.side_offset&&(s.side_id=t+s.side_offset.x*r+s.side_offset.y*r*8)),null==s.inside_id&&(s.inside_id=s.side_id,s.inside_offset&&(s.inside_id=t+s.inside_offset.x*r+s.inside_offset.y*r*8)),null==s.bottom_id&&(s.bottom_id=s.top_id,s.bottom_offset&&(s.bottom_id=t+s.bottom_offset.x*r+s.bottom_offset.y*r*8)),s.fringeHeight=s.height||0,null==s.fringe&&(s.fringe=!this.isTileEmpty(t)&&h&&h._isHigherTile(t)?this.FRINGE_HEIGHT:0),s},getTileData(t,e){if(!$dataMap||!$dataMap.data)return[0,0,0,0];const i=$dataMap.data,a=$dataMap.width,s=$dataMap.height;if($gameMap.isLoopHorizontal()&&(t=t.mod(a)),$gameMap.isLoopVertical()&&(e=e.mod(s)),t<0||t>=a||e<0||e>=s)return[0,0,0,0];const r=[];for(let h=0;h<4;++h)r[h]=i[(h*s+e)*a+t]||0;return r},getTileHeight(t,e,i=0){if(!$dataMap)return 0;$gameMap.isLoopHorizontal()&&(t=t.mod($dataMap.width)),$gameMap.isLoopVertical()&&(e=e.mod($dataMap.height));const a=this.getTileData(t,e)[i];if(this.isTileEmpty(a)&&i>0)return 0;const s=this.getTilemap();if(s&&s._isHigherTile(a))return 0;const r=this.getTileConfig(a,t,e,i);let h=0;return"height"in r?h=r.height:this.isWallTile(a)?h=this.WALL_HEIGHT:s&&s._isTableTile(a)?h=this.TABLE_HEIGHT:this.isSpecialShape(r.shape)&&(h=1),"depth"in r&&(h-=r.depth),h},getStackHeight(t,e,i=3){let a=0;for(let s=0;s<=i;++s)a+=this.getTileHeight(t,e,s);return a},getWalkHeight(t,e){const i=Math.round(t),a=Math.round(e),s=this.getTileData(i,a);let r=0,h=0;for(let t=0;t<=3;++t){const e=s[t];if(this.isTileEmpty(e)&&t>0)continue;r+=h,h=this.getTileHeight(i,a,t);const n=this.getTileConfig(e,i,a,t).shape;this.isSpecialShape(n)||(r+=h,h=0)}return r},getFloatHeight(t,e){const i=this.getTileData(t,e);let a=0;for(let s=0;s<=3;++s){const r=i[s];if(this.isTileEmpty(r))continue;const h=this.getTileConfig(r,t,e,s);h&&"float"in h&&(a+=h.float)}return a},getFringeHeight(t,e,i=3){let a=this.getStackHeight(t,e,i-1);const s=this.getTileData(t,e)[i],r=this.getTileConfig(s,t,e,i);return r&&this.getTilemap()._isHigherTile(s)?a+(r.fringe||this.FRINGE_HEIGHT)+(r.height||0):0},getCullingHeight(t,e,i=3,a=!1){const s=this.getTileData(t,e);let r=0;for(let h=0;h<=i;++h){const i=s[h],n=this.getTileConfig(i,t,e,h),o=n.shape;if(this.isSpecialShape(o))return r;a&&n.depth>0&&(r+=n.depth),r+=this.getTileHeight(t,e,h)}return r},tileHasPit(t,e,i=3){const a=this.getTileData(t,e);for(let s=0;s<=i;++s){const i=a[s];if(this.getTileConfig(i,t,e,s).depth>0)return!0}return!1},isTilePit(t,e,i){const a=this.getTileData(t,e)[i];return this.getTileConfig(a,t,e,i).depth>0},getTileRects(t){const e=[],i=this.getTilemap(),a=i._isTableTile(t);if(i._drawTile({addRect:(t,i,a,s,r,h,n,o,l)=>{e.push({setN:t,x:i,y:a,width:h,height:n,ox:s,oy:r})}},t,0,0),a)for(let t=e.length-1;t>=0;--t)e[t].oy>Object(b.n)()/2&&(e[t-1].y+=2*Object(b.n)()/3,e.splice(t,1));return e},isTileEmpty:t=>!t||1544===t,isWallTile(t){const e=Tilemap.getAutotileKind(t),i=Math.floor(e/8),a=Tilemap.isTileA3(t)||Tilemap.isTileA4(t);return a&&i%2?2:a},isTableTile(t){return Boolean(this.getTilemap()._isTableTile(t))},isFringeTile(t){return Boolean(this.getTilemap()._isHigherTile(t))},isWaterfallTile(t){const e=Tilemap.getAutotileKind(t);return Tilemap.isTileA1(t)&&e>=4&&e%2},isSpecialShape(t){const e=a.a.configurationShapes;return t===e.FENCE||t===e.CROSS||t===e.XCROSS||t===e.SLOPE},constructTileId(t,e,i){const a=`TILE_ID_${t.toUpperCase()}`;let s=a in Tilemap?Tilemap[a]:0;const r=Tilemap.isAutotile(s)?48:1;return s+=Number(e)*r+Number(i)*r*8},normalizeAutotileId(t){if(!Tilemap.isAutotile(t))return t;const e=Tilemap.getAutotileKind(t);return Tilemap.TILE_ID_A1+48*e}});class MapCellBuilder_CellMeshBuilder{constructor(){this.submeshBuilders={}}build(){const t=Object.values(this.submeshBuilders);if(!t.length)return null;const e=t.map(t=>t.build());return s.i.MergeMeshes(e,!0,void 0,void 0,!1,!0)}getBuilder(t){return t.name in this.submeshBuilders||(this.submeshBuilders[t.name]=new MapCellBuilder_SubMeshBuilder(t)),this.submeshBuilders[t.name]}addWallFace(t,e,i,a,s,r,h,n,o,l,c,u={}){const d=this.getBuilder(t),p=MapCellBuilder_SubMeshBuilder.getUvRect(t.diffuseTexture,e,i,a,s);d.addWallFace(r,h,n,o,l,c,p,u),u.double&&(u.flip=!u.flip,d.addWallFace(r,h,n,o,l,c,p,u))}addFloorFace(t,e,i,a,s,r,h,n,o,l,c={}){const u=this.getBuilder(t),d=MapCellBuilder_SubMeshBuilder.getUvRect(t.diffuseTexture,e,i,a,s);u.addFloorFace(r,h,n,o,l,d,c),c.double&&(c.flip=!c.flip,u.addFloorFace(r,h,n,o,l,d,c))}addSlopeFace(t,e,i,a,s,r,h,n,o,l,c,u={}){const d=this.getBuilder(t),p=MapCellBuilder_SubMeshBuilder.getUvRect(t.diffuseTexture,e,i,a,s);d.addSlopeFace(r,h,n,o,l,c,p,u),u.double&&(u.flip=!u.flip,d.addSlopeFace(r,h,n,o,l,c,p,u))}addSlopeSide(t,e,i,a,s,r,h,n,o,l,c,u={}){const d=this.getBuilder(t),p=MapCellBuilder_SubMeshBuilder.getUvRect(t.diffuseTexture,e,i,a,s);d.addSlopeSide(r,h,n,o,l,c,p,u),u.double&&(u.flip=!u.flip,d.addSlopeSide(r,h,n,o,l,c,p,u))}}class MapCellBuilder_SubMeshBuilder{constructor(t){this.material=t,this.positions=[],this.indices=[],this.normals=[],this.uvs=[]}build(){const t=new s.i("cell mesh",a.a.scene),e=new s.w;return e.positions=this.positions,e.indices=this.indices,e.normals=this.normals,e.uvs=this.uvs,e.applyToMesh(t),t.material=this.material,t}addWallFace(t,e,i,a,s,r,h,n){e=-e,i=i;const o=Math.round(1e3*Math.cos(r))/1e3,l=Math.round(1e3*Math.sin(r))/1e3,c=a/2,u=s/2,d=[t-c*o,i+u,e+c*l,t+c*o,i+u,e-c*l,t-c*o,i-u,e+c*l,t+c*o,i-u,e-c*l],p=[-l,0,-o,-l,0,-o,-l,0,-o,-l,0,-o],g=MapCellBuilder_SubMeshBuilder.getDefaultUvs(h),m=MapCellBuilder_SubMeshBuilder.getDefaultIndices();n.flip&&MapCellBuilder_SubMeshBuilder.flipFace(m,p),this.pushNewData(d,m,p,g)}addFloorFace(t,e,i,a,s,r,h){e=-e,i=i;const n=-2*Boolean(h.flip)+1,o=n*a/2,l=s/2,c=[t-o,i,e+l,t+o,i,e+l,t-o,i,e-l,t+o,i,e-l],u=[0,n,0,0,n,0,0,n,0,0,n,0],d=MapCellBuilder_SubMeshBuilder.getDefaultUvs(r),p=MapCellBuilder_SubMeshBuilder.getDefaultIndices();this.pushNewData(c,p,u,d)}addSlopeFace(t,e,i,a,s,r,h,n){e=-e,i=i;const o=Math.round(1e3*Math.cos(r))/1e3,l=Math.round(1e3*Math.sin(r))/1e3,c=a/2,u=[t-c*o+c*l,i+s,e+c*l+c*o,t+c*o+c*l,i+s,e-c*l+c*o,t-c*o-c*l,i,e+c*l-c*o,t+c*o-c*l,i,e-c*l-c*o],d=Math.pow(2,-s),p=1-d,g=[-l*p,d,-o*p,-l*p,d,-o*p,-l*p,d,-o*p,-l*p,d,-o*p],m=MapCellBuilder_SubMeshBuilder.getDefaultUvs(h),f=MapCellBuilder_SubMeshBuilder.getDefaultIndices();n.flip&&MapCellBuilder_SubMeshBuilder.flipFace(f,g),this.pushNewData(u,f,g,m)}addSlopeSide(t,e,i,a,s,r,h,n){e=-e,i=i;const o=Math.round(1e3*Math.cos(r))/1e3,l=Math.round(1e3*Math.sin(r))/1e3,c=a/2,u=[t-c*o,i+s,e+c*l,t-c*o,i,e+c*l,t+c*o,i,e-c*l],d=[-l,0,-o,-l,0,-o,-l,0,-o],p=[h.x1,h.y1,h.x1,h.y2,h.x2,h.y2],g=[0,1,2];n.flip&&MapCellBuilder_SubMeshBuilder.flipFace(g,d),this.pushNewData(u,g,d,p)}pushNewData(t,e,i,a){this.indices.push(...e.map(t=>t+this.positions.length/3)),this.positions.push(...t),this.normals.push(...i),this.uvs.push(...a)}static getUvRect(t,e,i,s,r){const{width:h,height:n}=t.getBaseSize();return a.a.EDGE_FIX&&(e+=a.a.EDGE_FIX,i+=a.a.EDGE_FIX,s-=2*a.a.EDGE_FIX,r-=2*a.a.EDGE_FIX),{x1:e/h,y1:(n-i)/n,x2:(e+s)/h,y2:(n-i-r)/n}}static getDefaultUvs(t){return[t.x1,t.y1,t.x2,t.y1,t.x1,t.y2,t.x2,t.y2]}static getDefaultIndices(){return[1,0,2,1,2,3]}static flipFace(t,e){t.reverse();for(let t=0;t<e.length;++t)e[t]*=-1}}new s.n(0,1,-Math.pow(.1,100),0),new s.n(0,0,-1,0);class mapCell_MapCell extends s.t{constructor(t,e){const i=[t,e].toString();super(`MapCell[${i}]`,a.a.scene),this.parent=a.a.map,this.cx=t,this.cy=e,this.ox=t*a.a.CELL_SIZE,this.oy=e*a.a.CELL_SIZE,this.x=this.ox,this.y=this.oy,this.key=i}update(){const t=a.a.loopCoords((this.cx+.5)*a.a.CELL_SIZE,(this.cy+.5)*a.a.CELL_SIZE);this.x=t.x-a.a.CELL_SIZE/2,this.y=t.y-a.a.CELL_SIZE/2}async load(){const t=a.a.configurationShapes;this.builder=new MapCellBuilder_CellMeshBuilder;const e=Math.min(a.a.CELL_SIZE,$gameMap.width()-this.cx*a.a.CELL_SIZE),i=Math.min(a.a.CELL_SIZE,$gameMap.height()-this.cy*a.a.CELL_SIZE),s=a.a.getCeilingConfig();for(let r=0;r<i;++r)for(let i=0;i<e;++i){s.cull=!1;let e=!1;const h=a.a.getTileData(this.ox+i,this.oy+r);for(let n=0;n<4;++n){if(a.a.isTileEmpty(h[n]))continue;let o=a.a.getStackHeight(this.ox+i,this.oy+r,n);const l=a.a.getTileTextureOffsets(h[n],this.ox+i,this.oy+r,n),c=l.shape;a.a.isSpecialShape(c)&&(e=!0),l.realId=h[n];const u=a.a.getTileHeight(this.ox+i,this.oy+r,n)||l.height||0;if(o+=l.fringe,a.a.isFringeTile(h[n])&&(o+=l.fringeHeight),!c||c===t.FLAT){const t=u||0===n;await this.loadTile(l,i,r,o+n*a.a.LAYER_DIST*!t,n),(u>0&&e||l.fringe>0)&&await this.loadTile(l,i,r,o-u,n,!0),(u||0===n)&&await this.loadWalls(l,i,r,o,n,u),o>=s.height&&(s.cull=!0)}c===t.FENCE?await this.loadFence(l,i,r,o,n,u):c===t.CROSS||c===t.XCROSS?await this.loadCross(l,i,r,o,n,u):c===t.SLOPE&&await this.loadSlope(l,i,r,o,n,u)}a.a.isTileEmpty(s.bottom_id)||s.cull||await this.loadTile(s,i,r,s.height,0,!0)}this.mesh=this.builder.build(),this.mesh&&(this.mesh.parent=this,this.mesh.alphaIndex=0,a.a.callFeatures("createCellMesh",this.mesh)),delete this.builder}dispose(){super.dispose(...arguments),this.mesh&&a.a.callFeatures("destroyCellMesh",this.mesh)}async loadTile(t,e,i,s,r,h=!1){const n=h?t.bottom_id:t.top_id;if(a.a.isTileEmpty(n))return;const o=h?t.bottom_rect:t.top_rect,l=Tilemap.isAutotile(n)&&!o;let c;c=o?[o]:a.a.getTileRects(n);const u=await a.a.getCachedTilesetMaterialForTile(t,h?"bottom":"top");for(const t of c)this.builder.addFloorFace(u,t.x,t.y,t.width,t.height,e+(0|t.ox)/Object(b.n)()-.25*l,i+(0|t.oy)/Object(b.n)()-.25*l,s,1-l/2,1-l/2,{flip:h})}async loadWalls(t,e,i,a,s,r){for(const h of mapCell_MapCell.neighborPositions)await this.loadWall(t,e,i,a,s,r,h)}async loadWall(t,e,i,r,h,n,o){const l=a.a.isFringeTile(t.realId);if(!a.a.getMapConfig("edge",!0)&&((this.ox+e+o.x>=$dataMap.width||this.ox+e+o.x<0)&&!$gameMap.isLoopHorizontal()||(this.oy+i+o.y>=$dataMap.height||this.oy+i+o.y<0)&&!$gameMap.isLoopVertical()))return;let c,u=n,d=t.side_id,p="side";if(a.a.isTileEmpty(d))return;if(l){if(a.a.getFringeHeight(this.ox+e+o.x,this.oy+i+o.y,h)===r)return}else{(u=r-a.a.getCullingHeight(this.ox+e+o.x,this.oy+i+o.y,t.depth>0?3:h,!(t.depth>0)))>0&&h>0&&(u=Math.min(n,u))}if(t.depth>0&&u<0){if(a.a.tileHasPit(this.ox+e+o.x,this.oy+i+o.y,h))return;u=Math.max(u,-t.depth),t.hasInsideConf&&(p="inside")}else if(u<=0)return;"inside"===p?(d=t.inside_id,t.inside_rect&&(c=t.inside_rect)):t.side_rect&&(c=t.side_rect);const g=await a.a.getCachedTilesetMaterialForTile(t,p),m=new s.v(e+o.x/2,i+o.y/2,r),f=-Math.atan2(o.x,o.y);if(c||!Tilemap.isAutotile(d)){const t=c||a.a.getTileRects(d)[0],e={};u<0&&(e.flip=!0),this.builder.addWallFace(g,t.x,t.y,t.width,t.height,m.x,m.y,r-u/2,1,Math.abs(u),f,e)}else{const l=new s.u(-o.y,o.x),c=new s.u(o.y,-o.x),p=a.a.getStackHeight(this.ox+e+l.x,this.oy+i+l.y,h),_=a.a.getStackHeight(this.ox+e+c.x,this.oy+i+c.y,h),{x:T,y:C}=this.getAutotileCorner(d,t.realId);let y=Math.max(1,Math.abs(Math.round(2*u))),S=Math.abs(u/y),M=Object(b.n)()/2,E=Object(b.n)()/2;a.a.isTableTile(t.realId)&&(E=Object(b.n)()/3,y=1,S=n);for(let e=-1;e<=1;e+=2)for(let i=0;i<y;++i){let s,h,n,o;a.a.isTableTile(t.realId)?(s=p!=r,h=_!=r):(s=p<r-i*S,h=_<r-i*S),n=T*Object(b.n)(),o=C*Object(b.n)(),n=(T+(e>0?.5+h:1-s))*Object(b.n)(),o=a.a.isWaterfallTile(d)?(C+i%2/2)*Object(b.n)():a.a.isTableTile(d)?(C+5/3)*Object(b.n)():(C+(0===i?0:i===y-1?1.5:1-i%2*.5))*Object(b.n)();const l={};u<0&&(l.flip=!0),this.builder.addWallFace(g,n,o,M,E,m.x+.25*e*Math.cos(f),m.y+.25*e*Math.sin(f),r-u*(u<0)-S/2-S*i,.5,S,f,l)}}}async loadFence(t,e,i,s,r,h){const n=t.side_id;if(a.a.isTileEmpty(n))return;const o=t.side_rect,l=await a.a.getCachedTilesetMaterialForTile(t,"side"),c=Tilemap.isAutotile(n),u=[];for(let t=0;t<mapCell_MapCell.neighborPositions.length;++t){const s=mapCell_MapCell.neighborPositions[t];a.a.getTileHeight(this.ox+e+s.x,this.oy+i+s.y,r)!==h&&u.push(t)}for(let r=0;r<mapCell_MapCell.neighborPositions.length;++r){const d=mapCell_MapCell.neighborPositions[r],p=u.includes(r);if(p&&u.length<4&&!c)continue;const g=d.x>0||d.y>0;let m=Math.atan2(d.x,d.y)+Math.PI/2;if(g&&(m-=Math.PI),c&&!o){const{x:a,y:r}=this.getAutotileCorner(n,t.realId);for(let t=0;t<=1;++t)this.builder.addWallFace(l,(p?a+1.5*g:a+1-.5*g)*Object(b.o)(),(r+1.5*t)*Object(b.m)(),Object(b.o)()/2,Object(b.m)()/2,e+d.x/4,i+d.y/4,s-h/4-t*h/2,.5,h/2,-m,{double:!0})}else{const t=o||a.a.getTileRects(n)[0];this.builder.addWallFace(l,t.x+t.width/2*g,t.y,t.width/2,t.height,e+d.x/4,i+d.y/4,s-h/2,.5,h,m,{double:!0})}}}async loadCross(t,e,i,s,r,h){const n=t.side_id;if(a.a.isTileEmpty(n))return;const o=t.side_rect,l=await a.a.getCachedTilesetMaterialForTile(t,"side"),c=Tilemap.isAutotile(n);let u;u=o?[o]:a.a.getTileRects(n);const d=t.shape===a.a.configurationShapes.XCROSS?Math.PI/4:0,p=c?h/2:h;for(let t=0;t<=1;++t)for(const a of u){const r=-Math.PI/2*t+d,n=-.25*c+(0|a.ox)/Object(b.o)();this.builder.addWallFace(l,a.x,a.y,a.width,a.height,e+n*Math.cos(r),i+n*Math.sin(r),s-(0|a.oy)/Object(b.m)()*h-p/2,1-c/2,p,r,{double:!0})}}async loadSlope(t,e,i,r,h,n){const o=Math.round(Math.random()*Math.PI*2/(Math.PI/2))*Math.PI/2,l=new s.u(-Object(b.k)(o+Math.PI),Object(b.e)(o+Math.PI));a.a.getCullingHeight(this.ox+e+l.x,this.oy+i+l.y,h)<=r&&await this.loadWall(t,e,i,r,h,n,l),await this.loadSlopeTop(t,e,i,r,h,n,o)}async loadSlopeTop(t,e,i,s,r,h,n){const o=t.top_id,l=await a.a.getCachedTilesetMaterialForTile(t,"top");if(Tilemap.isAutotile(o)&&!t.top_rect){const t=a.a.getTileRects(o);for(let a=0;a<t.length;++a){const r=t[a],o=(a+1)%2*-2+1,c=(Math.floor(a/2)+1)%2*2-1,u=Math.max(0,Object(b.k)(n)*o)*h/2,d=Math.max(0,Object(b.e)(n)*c)*h/2;this.builder.addSlopeFace(l,r.x,r.y,r.width,r.height,e+r.ox/Object(b.n)()-.25,i+r.oy/Object(b.n)()-.25,s-h+u+d,.5,.5,n,{uvrot:!0})}}else{const r=t.top_rect?t.top_rect:a.a.getTileRects(o)[0];this.builder.addSlopeFace(l,r.x,r.y,r.width,r.height,e,i,s-h,1,1,n,{})}}async loadSlopeSide(t,e,i,a,s,r){}getAutotileCorner(t,e=t){const i=Tilemap.getAutotileKind(t);let s=i%8,r=Math.floor(i/8);var h,n;return t===e&&1==a.a.isWallTile(t)&&++r,h=2*s,n=r,Tilemap.isTileA1(t)?i<4?(n=i%2*3+1,h=6*Math.floor(i/2)):(h=8*Math.floor(s/4)+i%2*6,n=6*r+3*Math.floor(s%4/2)+1-s%2):Tilemap.isTileA2(t)?n=3*(r-2)+1:Tilemap.isTileA3(t)?n=2*(r-6):Tilemap.isTileA4(t)&&(n=2.5*(r-10)+(r%2?.5:0)),{x:h,y:n}}}mapCell_MapCell.neighborPositions=[new s.u(0,1),new s.u(1,0),new s.u(0,-1),new s.u(-1,0)],mapCell_MapCell.meshCache={};Object.assign(a.a,{mapLoaded:!1,mapReady:!1,clearMap(){this.mapLoaded=!1;for(const t in this.textureCache)this.textureCache[t].dispose();for(const t in this.materialCache)this.materialCache[t].dispose();this.animatedTextures.length=0,this.textureCache={},this.materialCache={};for(const t in this.cells)this.cells[t].dispose(!1,!0);this.cells={};for(const t of this.characters)t.dispose(!1,!0);this.characters.length=0,this.resetCameraTarget(),this.callFeatures("clearMap")},loadMap(){this.updateBlenders(),this.updateMap(),this.createCharacters(),this.rememberCameraTarget(),this.callFeatures("loadMap")},async updateMap(){if(this.mapUpdating)return;this.mapLoaded=!0,this.mapUpdating=!0;const t={left:Math.floor((this.cameraStick.x-this.CELL_DIST)/this.CELL_SIZE),right:Math.floor((this.cameraStick.x+this.CELL_DIST)/this.CELL_SIZE),top:Math.floor((this.cameraStick.y-this.CELL_DIST)/this.CELL_SIZE),bottom:Math.floor((this.cameraStick.y+this.CELL_DIST)/this.CELL_SIZE)};$gameMap.isLoopHorizontal()||(t.left=Math.max(0,t.left),t.right=Math.min(t.right,Math.floor($gameMap.width()/a.a.CELL_SIZE))),$gameMap.isLoopVertical()||(t.top=Math.max(0,t.top),t.bottom=Math.min(t.bottom,Math.floor($gameMap.height()/a.a.CELL_SIZE)));const e=[];for(let i=t.left;i<=t.right;++i)for(let r=t.top;r<=t.bottom;++r){let t=i,h=r;$gameMap.isLoopHorizontal()&&(t=t.mod(Math.ceil($gameMap.width()/a.a.CELL_SIZE))),$gameMap.isLoopVertical()&&(h=h.mod(Math.ceil($gameMap.height()/a.a.CELL_SIZE))),[t,h].toString()in this.cells||e.push(new s.u(t,h))}const i=new s.u(Math.round(this.cameraStick.x/this.CELL_SIZE-.5),Math.round(this.cameraStick.y/this.CELL_SIZE-.5));e.sort((t,e)=>s.u.DistanceSquared(t,i)-s.u.DistanceSquared(e,i)),this.mapReady&&(e.length=Math.min(25,e.length));for(const t of e){let{x:e,y:i}=t;if(await this.loadMapCell(e,i),this.mapReady&&await Object(b.l)(),!this.mapLoaded)return void(this.mapUpdating=!1)}this.mapUpdating=!1,this.mapReady=!0},async loadMapCell(t,e){const i=[t,e].toString();if(i in this.cells)return;const a=new mapCell_MapCell(t,e);this.cells[i]=a,await a.load()}}),Object.assign(a.a,{animatedTextures:[],textureCache:{},materialCache:{},getCachedTilesetTexture(t,e=0,i=0){const r=`TS:${t}|${e},${i}`;if(r in this.textureCache)return this.textureCache[r];const h=$gameMap.tileset().tilesetNames[t];if(!h)return this.getErrorTexture();const n=`img/tilesets/${h}.png`,o=new s.s(n,this.scene,!a.a.MIPMAP);return o.hasAlpha=!0,o.onLoadObservable.addOnce(()=>{if(this.textureCache[r]===o&&(o.updateSamplingMode(1),e||i)){const{width:t,height:a}=o.getBaseSize();o.frameData={x:0,y:0,w:t,h:a},o.animX=e,o.animY=i,this.animatedTextures.push(o)}}),this.textureCache[r]=o,o},getCachedTilesetTextureAsync(t,e=0,i=0){return new Promise((a,s)=>{const r=this.getCachedTileTexture(t,e,i);r.isReady()?a(r):r.onLoadObservable.addOnce(()=>{a(r)})})},getErrorTexture(){return this.errorTexture?this.errorTexture:(this.errorTexture=new s.s(`${a.a.MV3D_FOLDER}/errorTexture.png`,this.scene),this.errorTexture.isError=!0,this.errorTexture)},getBushAlphaTexture(){return this.bushAlphaTexture?this.bushAlphaTexture:(this.bushAlphaTexture=new s.s(`${a.a.MV3D_FOLDER}/bushAlpha.png`,this.scene),this.bushAlphaTexture.getAlphaFromRGB=!0,this.bushAlphaTexture)},getCachedTilesetMaterial(t,e=0,i=0,r={}){this.processMaterialOptions(r);const h=`TS:${t}|${e},${i}|${this.getExtraBit(r)}`;if(h in this.materialCache)return this.materialCache[h];const n=this.getCachedTilesetTexture(t,e,i),o=new s.r(h,this.scene);return o.diffuseTexture=n,r.transparent&&(o.opacityTexture=n,o.alpha=r.alpha),o.alphaCutOff=a.a.ALPHA_CUTOFF,o.ambientColor.set(1,1,1),o.emissiveColor.set(r.glow,r.glow,r.glow),o.specularColor.set(0,0,0),this.materialCache[h]=o,o},getCachedTilesetMaterialAsync(t,e=0,i=0,a={}){return new Promise((s,r)=>{const h=this.getCachedTilesetMaterial(t,e,i,a),n=h.diffuseTexture;n.isReady()?s(h):n.onLoadObservable.addOnce(()=>{s(h)})})},async getCachedTilesetMaterialForTile(t,e){const i=a.a.getSetNumber(t[`${e}_id`]),s=a.a.getMaterialOptions(t,e),r=a.a.getTileAnimationData(t,e);return await a.a.getCachedTilesetMaterialAsync(i,r.animX,r.animY,s)},processMaterialOptions(t){"alpha"in t?(t.alpha=Math.round(7*t.alpha)/7,t.alph<1&&(t.transparent=!0)):t.alpha=1,t.glow="glow"in t?Math.round(7*t.glow)/7:0},getExtraBit(t){let e=0;return e|=Boolean(t.transparent)<<0,e|=7-7*t.alpha<<1,(e|=7*t.glow<<1).toString(36)},lastAnimUpdate:0,animXFrame:0,animYFrame:0,animDirection:1,updateAnimations(){if(!(performance.now()-this.lastAnimUpdate<=this.ANIM_DELAY)){this.lastAnimUpdate=performance.now(),this.animXFrame<=0?this.animDirection=1:this.animXFrame>=2&&(this.animDirection=-1),this.animXFrame+=this.animDirection,this.animYFrame=(this.animYFrame+1)%3;for(const t of this.animatedTextures)t.crop(t.frameData.x+t.animX*this.animXFrame*Object(b.o)(),t.frameData.y+t.animY*this.animYFrame*Object(b.m)(),t.frameData.w,t.frameData.h)}}}),Object.assign(a.a,{createCharacters(){const t=$gameMap.events();for(const e of t)this.createCharacterFor(e,0);const e=$gameMap.vehicles();for(const t of e)this.createCharacterFor(t,1);const i=$gamePlayer.followers()._data;for(let t=i.length-1;t>=0;--t)this.createCharacterFor(i[t],29-t);this.createCharacterFor($gamePlayer,30)},createCharacterFor(t,e){if(!t.mv3d_sprite){const i=new characters_Character(t,e);return Object.defineProperty(t,"mv3d_sprite",{value:i,configurable:!0}),this.characters.push(i),i}return t.mv3d_sprite},updateCharacters(){for(const t of this.characters)t.update()},setupSpriteMeshes(){characters_Sprite.Meshes={},characters_Sprite.Meshes.FLAT=s.i.MergeMeshes([s.j.CreatePlane("sprite mesh",{sideOrientation:s.c},a.a.scene).rotate(b.a,Math.PI/2,s.x)]),characters_Sprite.Meshes.SPRITE=s.i.MergeMeshes([s.j.CreatePlane("sprite mesh",{sideOrientation:s.c},a.a.scene).translate(b.b,.5,s.x)]),characters_Sprite.Meshes.CROSS=s.i.MergeMeshes([characters_Sprite.Meshes.SPRITE.clone(),characters_Sprite.Meshes.SPRITE.clone().rotate(b.b,Math.PI/2,s.x)]),characters_Sprite.Meshes.SHADOW=characters_Sprite.Meshes.FLAT.clone("shadow mesh");const t=new s.s(`${a.a.MV3D_FOLDER}/shadow.png`),e=new s.r("shadow material",a.a.scene);e.diffuseTexture=t,e.opacityTexture=t,e.specularColor.set(0,0,0),characters_Sprite.Meshes.SHADOW.material=e;for(const t in characters_Sprite.Meshes)a.a.scene.removeMesh(characters_Sprite.Meshes[t])}});class characters_Sprite extends s.t{constructor(){super("sprite",a.a.scene),this.spriteOrigin=new s.t("sprite origin",a.a.scene),this.spriteOrigin.parent=this,this.mesh=characters_Sprite.Meshes.FLAT.clone(),this.mesh.parent=this.spriteOrigin}setMaterial(t){this.disposeMaterial(),this.texture=new s.s(t,a.a.scene),this.bitmap=this.texture._texture,this.texture.hasAlpha=!0,this.texture.onLoadObservable.addOnce(()=>this.onTextureLoaded()),this.material=new s.r("sprite material",a.a.scene),this.material.diffuseTexture=this.texture,this.material.alphaCutOff=a.a.ALPHA_CUTOFF,this.material.ambientColor.set(1,1,1),this.material.specularColor.set(0,0,0),this.mesh.material=this.material}onTextureLoaded(){this.texture.updateSamplingMode(1)}disposeMaterial(){this.material&&(this.material.dispose(),this.texture.dispose(),this.material=null,this.texture=null,this.bitmap=null)}dispose(...t){this.disposeMaterial(),super.dispose(...t)}}class characters_Character extends characters_Sprite{constructor(t,e){super(),this.order=e,this.mesh.order=this.order,this.mesh.character=this,this._character=this.char=t,this.charName="",this.charIndex=0,this.updateCharacter(),this.updateShape(),this.isVehicle=this.char instanceof Game_Vehicle,this.isBoat=this.isVehicle&&this.char.isBoat(),this.isShip=this.isVehicle&&this.char.isShip(),this.isAirship=this.isVehicle&&this.char.isAirship(),this.isEvent=this.char instanceof Game_Event,this.isPlayer=this.char instanceof Game_Player,this.isFollower=this.char instanceof Game_Follower,this.elevation=0,this.char.mv3d_blenders||(this.char.mv3d_blenders={}),a.a.CHARACTER_SHADOWS&&(this.shadow=characters_Sprite.Meshes.SHADOW.clone(),this.shadow.parent=this.spriteOrigin),this.lightOrigin=new s.t("light origin",a.a.scene),this.lightOrigin.parent=this,this.setupLights(),this.isEvent&&this.eventConfigure()}isTextureReady(){return Boolean(this.texture&&this.texture.isReady())}setTileMaterial(){const t=a.a.getSetNumber(this._tileId),e=$gameMap.tileset().tilesetNames[t];if(e){const t=`img/tilesets/${e}.png`;this.setMaterial(t)}else this.setMaterial("MV3D/errorTexture.png")}onTextureLoaded(){super.onTextureLoaded(),this.updateFrame(),this.updateScale()}updateCharacter(){this._tilesetId=$gameMap.tilesetId(),this._tileId=this._character.tileId(),this._characterName=this._character.characterName(),this._characterIndex=this._character.characterIndex(),this._isBigCharacter=ImageManager.isBigCharacter(this._characterName),this._tileId>0?this.setTileMaterial(this._tileId):this._characterName?this.setMaterial(`img/characters/${this._characterName}.png`):this.setEnabled(!1)}updateCharacterFrame(){if(this.px=this.characterPatternX(),this.py=this.characterPatternY(),!this.isTextureReady())return;const t=this.patternWidth(),e=this.patternHeight(),i=(this.characterBlockX()+this.px)*t,a=(this.characterBlockY()+this.py)*e;this.setFrame(i,a,t,e)}patternChanged(){return this.px!==this.characterPatternX()||this.py!==this.characterPatternY()}characterPatternY(){if(this.getConfig("dirfix",this.isEvent&&this.char.isObjectCharacter()))return this.char.direction()/2-1;return a.a.transformDirectionYaw(this.char.direction())/2-1}setFrame(t,e,i,a){this.isTextureReady()&&this.texture.crop(t,e,i,a)}updateScale(){if(!this.isTextureReady())return;const t=this.getConfig("scale",new s.u(1,1));let e=1;if(this.isVehicle){const t=a.a[`${this.char._type.toUpperCase()}_SETTINGS`];e=a.a.loadData(`${this.char._type}_scale`,t.scale)}const i=this.patternWidth()/Object(b.n)()*t.x*e,r=this.patternHeight()/Object(b.n)()*t.y*e;this.mesh.scaling.set(i,r,r)}getConfig(t,e){return this.settings_event?t in this.settings_event_page?this.settings_event_page[t]:t in this.settings_event?this.settings_event[t]:e:e}hasConfig(t){return!!this.settings_event&&(t in this.settings_event_page||t in this.settings_event)}eventConfigure(){if(!this.settings_event){this.settings_event={};const t=this.char.event().note;a.a.readConfigurationFunctions(a.a.readConfigurationTags(t),a.a.eventConfigurationFunctions,this.settings_event)}this.settings_event_page={};const t=this.char.page();if(!t)return;let e="";for(const i of t.list)108!==i.code&&408!==i.code||(e+=i.parameters[0]);if(a.a.readConfigurationFunctions(a.a.readConfigurationTags(e),a.a.eventConfigurationFunctions,this.settings_event_page),this.updateScale(),this.updateShape(),this.char.mv3d_needsConfigure){if(this.char.mv3d_needsConfigure=!1,"pos"in this.settings_event_page){const t=this.char.event(),e=this.settings_event_page.pos;this.char.locate(Object(b.j)(t.x,e.x),Object(b.j)(t.y,e.y))}if(this.setupEventLights(),"lamp"in this.settings_event_page){const t=this.getConfig("lamp");this.blendLampColor.setValue(t.color,.5),this.blendLampIntensity.setValue(t.intensity,.5),this.blendLampDistance.setValue(t.distance,.5)}if("flashlight"in this.settings_event_page){const t=this.getConfig("flashlight");this.blendFlashlightColor.setValue(t.color,.5),this.blendFlashlightIntensity.setValue(t.intensity,.5),this.blendFlashlightDistance.setValue(t.distance,.5),this.blendFlashlightAngle.setValue(t.angle,.5),this.blendFlashlightPitch.setValue(this.getConfig("flashlightPitch",90),.25),this.flashlightTargetYaw=this.getConfig("flashlightYaw","+0")}}}setupMesh(){this.mesh.parent=this.spriteOrigin,this.mesh.character=this,this.mesh.order=this.order,this.material&&(this.mesh.material=this.material),this.flashlight&&(this.flashlight.excludedMeshes.splice(0,1/0),this.flashlight.excludedMeshes.push(this.mesh))}setupEventLights(){const t=this.getConfig("flashlight"),e=this.getConfig("lamp");t&&!this.flashlight&&this.setupFlashlight(),e&&!this.lamp&&this.setupLamp()}setupLights(){"flashlightColor"in this.char.mv3d_blenders&&this.setupFlashlight(),"lampColor"in this.char.mv3d_blenders&&this.setupLamp()}setupFlashlight(){if(this.flashlight)return;const t=this.getConfig("flashlight",{color:16777215,intensity:1,distance:a.a.LIGHT_DIST,angle:a.a.LIGHT_ANGLE});this.blendFlashlightColor=this.makeColorBlender("flashlightColor",t.color),this.blendFlashlightIntensity=this.makeBlender("flashlightIntensity",t.intensity),this.blendFlashlightDistance=this.makeBlender("flashlightDistance",t.distance),this.blendFlashlightAngle=this.makeBlender("flashlightAngle",t.angle),this.flashlight=new s.q("flashlight",s.v.Zero(),s.v.Zero(),Object(b.f)(this.blendFlashlightAngle.targetValue()+a.a.FLASHLIGHT_EXTRA_ANGLE),0,a.a.scene),this.updateFlashlightExp(),this.flashlight.range=this.blendFlashlightDistance.targetValue(),this.flashlight.intensity=this.blendFlashlightIntensity.targetValue(),this.flashlight.diffuse.set(...this.blendFlashlightColor.targetComponents()),this.flashlight.direction.y=-1,this.flashlightOrigin=new s.t("flashlight origin",a.a.scene),this.flashlightOrigin.parent=this.lightOrigin,this.flashlight.parent=this.flashlightOrigin,this.blendFlashlightPitch=this.makeBlender("flashlightPitch",70),this.blendFlashlightYaw=this.makeBlender("flashlightYaw",0),this.blendFlashlightYaw.cycle=360,this.flashlightTargetYaw=this.getConfig("flashlightYaw","+0"),this.updateFlashlightDirection(),this.setupMesh()}updateFlashlightExp(){this.flashlight.exponent=64800*Math.pow(this.blendFlashlightAngle.targetValue(),-2)}setupLamp(){if(this.lamp)return;const t=this.getConfig("lamp",{color:16777215,intensity:1,distance:a.a.LIGHT_DIST});this.blendLampColor=this.makeColorBlender("lampColor",t.color),this.blendLampIntensity=this.makeBlender("lampIntensity",t.intensity),this.blendLampDistance=this.makeBlender("lampDistance",t.distance),this.lamp=new s.o("lamp",s.v.Zero(),a.a.scene),this.lamp.diffuse.set(...this.blendLampColor.targetComponents()),this.lamp.intensity=this.blendLampIntensity.targetValue(),this.lamp.range=this.blendLampDistance.targetValue(),this.lamp.parent=this.lightOrigin}updateFlashlightDirection(){this.flashlightOrigin.yaw=this.blendFlashlightYaw.currentValue(),this.flashlightOrigin.pitch=-this.blendFlashlightPitch.currentValue(),this.flashlightOrigin.position.set(0,0,0);let t=Math.tan(Object(b.f)(90-this.blendFlashlightAngle.currentValue()-Math.max(90,this.blendFlashlightPitch.currentValue())+90))*a.a.LIGHT_HEIGHT;t=Math.max(0,Math.min(1,t)),this.flashlight.range+=t,this.flashlightOrigin.translate(b.b,t,s.h)}updateLights(){if(this.flashlight){const t=180+Object(b.j)(a.a.dirToYaw(this.char.direction()),this.flashlightTargetYaw);t!==this.blendFlashlightYaw.targetValue()&&this.blendFlashlightYaw.setValue(t,.25),this.blendFlashlightColor.update()|this.blendFlashlightIntensity.update()|this.blendFlashlightDistance.update()|this.blendFlashlightAngle.update()|this.blendFlashlightYaw.update()|this.blendFlashlightPitch.update()&&(this.flashlight.diffuse.set(...this.blendFlashlightColor.currentComponents()),this.flashlight.intensity=this.blendFlashlightIntensity.currentValue(),this.flashlight.range=this.blendFlashlightDistance.currentValue(),this.flashlight.angle=Object(b.f)(this.blendFlashlightAngle.currentValue()+a.a.FLASHLIGHT_EXTRA_ANGLE),this.updateFlashlightExp(),this.updateFlashlightDirection())}this.lamp&&this.blendLampColor.update()|this.blendLampIntensity.update()|this.blendLampDistance.update()&&(this.lamp.diffuse.set(...this.blendLampColor.currentComponents()),this.lamp.intensity=this.blendLampIntensity.currentValue(),this.lamp.range=this.blendLampDistance.currentValue())}makeBlender(t,e,i=blenders_Blender){t in this.char.mv3d_blenders?e=this.char.mv3d_blenders[t]:this.char.mv3d_blenders[t]=e;const a=new i(t,e);return a.storageLocation=()=>this.char.mv3d_blenders,a}makeColorBlender(t,e){return this.makeBlender(t,e,ColorBlender)}hasBush(){return this.isEvent?this.getConfig("bush",!this._tileId):!this.isVehicle||a.a.VEHICLE_BUSH}getShape(){return this.getConfig("shape",this.char.isTile()?a.a.configurationShapes.FLAT:a.a.EVENT_SHAPE)}updateShape(){const t=this.getShape();if(this.shape===t)return;this.shape=t;let e=characters_Sprite.Meshes.SPRITE;const i=a.a.configurationShapes;switch(this.shape){case i.FLAT:e=characters_Sprite.Meshes.FLAT;break;case i.XCROSS:case i.CROSS:e=characters_Sprite.Meshes.CROSS;break;case i.FENCE:}this.mesh.dispose(),this.mesh=e.clone(),this.setupMesh()}update(){this.char._erased&&this.dispose(),this.visible=this.char.mv_sprite.visible,"function"==typeof this.char.isVisible&&(this.visible=this.visible&&this.char.isVisible()),this.disabled=!this.visible,(this.char.isTransparent()||!this._characterName&&!this._tileId)&&(this.visible=!1),this._isEnabled?this.visible||this.setEnabled(!1):this.visible&&this.setEnabled(!0),this.isImageChanged()&&this.updateCharacter(),this.patternChanged()&&this.updateFrame(),this.material?this.updateNormal():this.updateEmpty()}updateNormal(){const t=a.a.configurationShapes;this.shape===t.SPRITE?(this.mesh.pitch=a.a.blendCameraPitch.currentValue()-90,this.mesh.yaw=a.a.blendCameraYaw.currentValue()):this.shape===t.TREE?(this.mesh.pitch=0,this.mesh.yaw=a.a.blendCameraYaw.currentValue()):(this.mesh.pitch=0,this.mesh.yaw=this.getConfig("rot",0),this.shape===t.XCROSS&&(this.mesh.yaw+=45)),this.char===$gamePlayer&&(this.mesh.visibility=+!a.a.is1stPerson(!0)),this.updateAlpha(),this.tileHeight=a.a.getWalkHeight(this.char._realX,this.char._realY),this.updatePosition(),this.updateElevation(),this.shadow&&this.updateShadow(),this.updateLights()}updateEmpty(){this.tileHeight=a.a.getWalkHeight(this.char._realX,this.char._realY),this.updatePosition(),this.updateElevation(),this.updateLights()}updateAlpha(){let t=this.hasConfig("alpha")||this.char.opacity()<255;this.bush=Boolean(this.char.bushDepth()),this.bush&&this.hasBush()?(t=!0,this.material.opacityTexture||(this.material.opacityTexture=a.a.getBushAlphaTexture(),this.material.useAlphaFromDiffuseTexture=!0)):this.material.opacityTexture&&(this.material.opacityTexture=null,this.material.useAlphaFromDiffuseTexture=!1),t?(this.material.useAlphaFromDiffuseTexture=!0,this.material.alpha=this.getConfig("alpha",1)*this.char.opacity()/255):(this.material.useAlphaFromDiffuseTexture=!1,this.material.alpha=1)}updatePosition(){const t=a.a.loopCoords(this.char._realX,this.char._realY);this.x=t.x,this.y=t.y,this.spriteOrigin.position.set(0,0,0),this.lightOrigin.position.set(0,0,0),this.spriteOrigin.z=4*a.a.LAYER_DIST,this.lightOrigin.z=this.getConfig("lightHeight",a.a.LIGHT_HEIGHT);const e=new s.u(Math.sin(-a.a.cameraNode.rotation.y),Math.cos(a.a.cameraNode.rotation.y)).multiplyByFloats(.45,.45),i=this.getConfig("lightOffset",null);this.shape===a.a.configurationShapes.SPRITE?(this.spriteOrigin.x=e.x,this.spriteOrigin.y=e.y,this.lightOrigin.x=e.x,this.lightOrigin.y=e.y):i||(this.lightOrigin.x=e.x/2,this.lightOrigin.y=e.y/2),i&&(this.lightOrigin.x+=i.x,this.lightOrigin.y+=i.y),this.spriteOrigin.x+=this.getConfig("x",0),this.spriteOrigin.y+=this.getConfig("y",0)}updateElevation(){let t=this.tileHeight;if((this.isVehicle||(this.isPlayer||this.isFollower)&&$gamePlayer.vehicle())&&(t+=a.a.getFloatHeight(Math.round(this.char._realX),Math.round(this.char._realY)),this.char===$gameMap.vehicle("boat")?t+=a.a.BOAT_SETTINGS.zoff:this.char===$gameMap.vehicle("ship")&&(t+=a.a.SHIP_SETTINGS.zoff)),this.isAirship&&$gamePlayer.vehicle()===this.char){if(this.char._driving||(this.elevation+=(t-this.elevation)/10),t>=this.elevation){const e=100/Math.pow(1.5,a.a.loadData("airship_ascentspeed",4));this.elevation+=(t-this.elevation)/e}else if(!a.a.vehicleObstructed(this.char,this.char.x,this.char.y,!0)){const e=100/Math.pow(1.5,a.a.loadData("airship_descentspeed",2));this.elevation+=(t-this.elevation)/e}this.z=this.elevation,this.z+=a.a.loadData("airship_height",a.a.AIRSHIP_SETTINGS.height)*this.char._altitude/this.char.maxAltitude()}else if(this.char.isJumping()){let t=1-this.char._jumpCount/(2*this.char._jumpPeak),e=-4*Math.pow(t-.5,2)+1,i=Math.abs(this.char.mv3d_jumpHeightEnd-this.char.mv3d_jumpHeightStart);this.z=this.char.mv3d_jumpHeightStart*(1-t)+this.char.mv3d_jumpHeightEnd*t+e*i/2+this.char.jumpHeight()/Object(b.n)()}else this.elevation=t,this.z=this.elevation;this.isEvent&&(this.z+=this.getConfig("height",2===this.char._priorityType?a.a.EVENT_HEIGHT:0),this.hasConfig("z")&&(this.z=this.getConfig("z",0)))}updateShadow(){let t=Boolean(this.getConfig("shadow",this.shape!=a.a.configurationShapes.FLAT));if(t&&(this.isPlayer||this.isFollower)){const e=a.a.characters.indexOf(this);if(e>=0)for(let i=e+1;i<a.a.characters.length;++i){const e=a.a.characters[i];if(e.shadow&&e.visible&&(e.char._realX===this.char._realX&&e.char._realY===this.char._realY)){t=!1;break}}}if(this.shadow._isEnabled?t||this.shadow.setEnabled(!1):t&&this.shadow.setEnabled(!0),!t)return;const e=Math.min(0,this.getConfig("height",0)),i=Math.max(this.z-this.tileHeight,e),s=this.isAirship?a.a.AIRSHIP_SETTINGS.shadowDist:a.a.SHADOW_DIST,r=Math.max(0,1-Math.abs(i)/s);this.shadow.z=-i;const h=this.isAirship?a.a.AIRSHIP_SETTINGS.shadowScale:this.getConfig("shadow",a.a.SHADOW_SCALE);this.shadow.scaling.setAll(h*r),this.shadow.isAnInstance||(this.shadow.visibility=r-.5*this.bush)}dispose(...t){super.dispose(...t),delete this.char.mv3d_sprite}}for(const t of["characterBlockX","characterBlockY","characterPatternX","isImageChanged","patternWidth","patternHeight","updateTileFrame","updateFrame"])characters_Character.prototype[t]=Sprite_Character.prototype[t];Object.assign(a.a,{vehicleObstructed:(t,...e)=>D.apply(t,e)});const x=Game_CharacterBase.prototype.canPass;function F(t,e,i=!0){if(!(this instanceof Game_Vehicle))throw"This isn't a vehicle.";if(!this.mv3d_sprite)return!0;if(!this._driving)return!0;if($gamePlayer.isDebugThrough())return!0;const s=this.isAirship(),r=a.a[`${this._type.toUpperCase()}_SETTINGS`],h=a.a.loadData(`${this._type}_big`,r.big);let n=.5;s?n=a.a.loadData("airship_height",a.a.AIRSHIP_SETTINGS.height):n+=a.a.getFloatHeight(t,e);const o=a.a.getWalkHeight(t,e);let l=this.mv3d_sprite.z;if("zoff"in r&&(l-=r.zoff),o>l)return!1;if(!h)return!0;for(let s=-1;s<=1;++s)for(let r=-1;r<=1;++r){if(0===s&&0===r||!i&&s&&r)continue;const h=a.a.getWalkHeight(t+s,e+r);if(h>o+n*!i&&(i||h>l))return!1}return!0}function D(){return!F.apply(this,arguments)}Game_CharacterBase.prototype.canPass=function(t,e,i){if(!x.apply(this,arguments))return!1;if(a.a.isDisabled())return!0;const s=$gameMap.roundXWithDirection(t,i),r=$gameMap.roundYWithDirection(e,i);if(this===$gamePlayer){const t=this.vehicle();if(t){const e=D.call(t,s,r,!1);if(t.isAirship())return!e;if(e)return!1}}if(this.isThrough()||this.isDebugThrough())return!0;const h=a.a.getWalkHeight(t,e),n=a.a.getWalkHeight(s,r);return!(Math.abs(h-n)>a.a.STAIR_THRESH)};const L=Game_Map.prototype.isAirshipLandOk;Game_Map.prototype.isAirshipLandOk=function(t,e){return a.a.isDisabled()?L.apply(this,arguments):!D.call(this.airship(),t,e,!0)&&(a.a.AIRSHIP_SETTINGS.bushLanding?this.checkPassage(t,e,15):L.apply(this,arguments))};const N=Game_Player.prototype.updateVehicleGetOn;Game_Player.prototype.updateVehicleGetOn=function(){if(a.a.isDisabled())return N.apply(this,arguments);const t=this.vehicle(),e=a.a.loadData(`${t._type}_speed`,t._moveSpeed);this.vehicle().setMoveSpeed(e),N.apply(this,arguments)};const P=Game_CharacterBase.prototype.jump;Game_CharacterBase.prototype.jump=function(t,e){if(a.a.isDisabled())return P.apply(this,arguments);this.mv3d_jumpHeightStart=a.a.getWalkHeight(this.x,this.y),this.mv3d_jumpHeightEnd=a.a.getWalkHeight(this.x+t,this.y+e),P.apply(this,arguments)};const H=Game_Map.prototype.parallaxOx;Game_Map.prototype.parallaxOx=function(){let t=H.apply(this,arguments);if(!a.a.mapDisabled)return this._parallaxLoopX?t-816*a.a.blendCameraYaw.currentValue()/90:t};const R=Game_Map.prototype.parallaxOy;Game_Map.prototype.parallaxOy=function(){let t=R.apply(this,arguments);if(!a.a.mapDisabled)return this._parallaxLoopY?t-816*a.a.blendCameraPitch.currentValue()/90:t},["setDisplayPos","scrollUp","scrollDown","scrollLeft","scrollRight"].forEach(t=>{const e=Game_Map.prototype[t];Game_Map.prototype[t]=function(){a.a.isDisabled()&&e.apply(this,arguments)}});const V=Game_Map.prototype.updateScroll;Game_Map.prototype.updateScroll=function(){if(a.a.mapDisabled)return V.apply(this,arguments);this._displayX=816*-a.a.blendCameraYaw.currentValue()/3600,this._displayY=816*-a.a.blendCameraPitch.currentValue()/3600},Game_CharacterBase.prototype.isNearTheScreen=function(){return Math.abs(this.x-a.a.cameraStick.x)<=a.a.RENDER_DIST&&Math.abs(this.y-a.a.cameraStick.y)<=a.a.RENDER_DIST};const B=Utils.isOptionValid("test"),G=async(t,e)=>{const a=i(3),s=i(4),r=s.resolve(global.__dirname,t);await $(s.dirname(r)),await new Promise((t,i)=>{a.writeFile(r,e,e=>{e?i(e):t()})})},$=t=>new Promise((e,a)=>{const s=i(3),r=i(4);s.mkdir(r.resolve(global.__dirname,t),{recursive:!0},t=>{t&&"EEXIST"!==t.code?a(t):e()})});class DataProxy{constructor(t,e,a={}){if(this.varName=t,this.fileName=e,B){const t=i(3),s=i(4).resolve(nw.__dirname,"data",e);t.existsSync(s)||t.writeFileSync(s,JSON.stringify("function"==typeof a?a():a))}DataManager._databaseFiles.push({name:t,src:e}),this._dirty=!1,this._data_handler={get:(t,e)=>t[e]&&"object"==typeof t[e]?new Proxy(t[e],data_handler):t[e],set:(t,e,i)=>{this._dirty=!0,t[e]=i},deleteProperty:(t,e)=>{this._dirty=!0,delete t[e]}},this.writing=!1,DataProxy.list.push(this)}setup(){this._data=window[this.varName],B&&(window[this.varName]=new Proxy(this._data,this._data_handler))}async update(){B&&this._dirty&&!this.writing&&(this.writing=!0,this._dirty=!1,await G(`data/${this.fileName}`,JSON.stringify(this._data)),this.writing=!1)}}DataProxy.list=[];const j=Scene_Boot.prototype.start;Scene_Boot.prototype.start=function(){j.apply(this,arguments),a.a.setupData()},Object.assign(a.a,{setupData(){for(const t of DataProxy.list)t.setup()},updateData(){for(const t of DataProxy.list)t.update()}}),new DataProxy("mv3d_data","mv3d_data.json",()=>({id:crypto.getRandomValues(new Uint32Array(1))[0]})),a.a.features={},a.a.callFeature=function(t,e,...i){if(!this.featureEnabled(t))return;const a=this.features[t];e in a.methods&&a.methods[e](...i)},a.a.callFeatures=function(t,...e){for(const i in this.features)this.callFeature(i,t,...e)},a.a.featureEnabled=function(t){return t in this.features&&!!this.features[t].enabled()};a.a.Feature=class features_Feature{constructor(t,e,i=!0){Object.assign(this,{name:t,condition:i,methods:e}),a.a.features[t]=this}enabled(){return"function"==typeof this.condition?this.condition():Boolean(this.condition)}};i(5)}]);
//# sourceMappingURL=mv3d-babylon.js.map