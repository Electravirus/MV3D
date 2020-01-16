/*:
@plugindesc 3D rendering in RPG Maker MV with babylon.js
version 0.4.4.4
@author Dread/Nyanak
@help

If you are making a game with this plugin, please consider supporting my
patreon.  
https://www.patreon.com/cutievirus  
You can also unlock some patron-only features by becoming a patron, such as
Dynamic Shadows.  
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



### Slope Tiles

Slope tiles can be used to make hills or stairs to move between elevations.
The slope tiles will automatically try to choose their direction.  
Directional passage will prevent the slope tile from facing certain
directions.  
Second parameter forces slope to face certain direction.
Directions are n, s, e, and w.
Shadow pen can be used to force slope to face a certain direction.
Draw a shadow on the side you want the slope to face.
Example: slope(1), slope(0.45,n), slope(2,e)

### Tile Passage

The pass function will change the passage rules for the tile.  
This can be used to get star passage on A tiles, or to have different passage
rules depending on if 3D is enabled.
Examples: pass(o), pass(x), pass(*)

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
shapes are FLAT, SPRITE, TREE, WALL, FENCE, CROSS, and XCROSS.  
FLAT will make the event lie flat on the ground like a tile.  
SPRITE will make the event rotate to always face the camera.  
TREE will make the event stand up, but rotate horizontally toward camera.  
WALL and FENCE will make the tile stand up without rotating. FENCE is an
alias of WALL.  
CROSS and XCROSS will make the event use a cross mesh. XCROSS is rotated
45 degrees.  
Example: shape(tree)

The scale function can change the size of the event.  
Examples: scale(2,2), scale(1.5,3)

The yaw function will rotate the event's mesh horizontally. Rotation applies
before pitch. Doesn't work with Sprite or Tree shapes.  
0 is south, 90 is east, 180 is north, and 270 is west.  
Example: yaw(45)

The pitch function will tilt the event's mesh vertically. Doesn't worth with
Sprite shapes.  
Example: pitch(20)

The rot function will rotate the event's mesh horizontally. Rotation applies
after pitch. Doesn't work with Sprite or Tree shapes.  
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

The platform function will set whether the event can be walked on.  
Example: platform(true)

The gravity function will set the fall speed of the event.
Example: gravity(10)

The collide will set the event's collision height.  
collide(false) acts as a shorthand for collide(0),platform(false)  
Examples: collide(0), collide(1), collide(1.5)

The trigger event will set the height range the event can be triggered from.
The first parameter is the height above the event, and the second is the
height below the event.
Examples: trigger(Infinity,Infinity), trigger(0), trigger(2,1)

The pass function when used on events acts as a shorthand for platform and
collide.  
pass(o) turns on platform
pass(x) turns off platform and turns on collision.
pass(*) turns off platform and collision.

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
The ambient function is an alias for the light function.  
Examples: light(white), ambient(gray), ambient(#222222), light(rebeccaPurple)

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

The disable function will turn off the 3D rendering for the map.  
Example: disable()


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

    mv3d allowRotation <true/false>
    mv3d allowPitch <true/false>

Sets whether keyboard control for rotation / pitch is enabled.  
allowRotation is ignored in 1st person mode.

    mv3d lockCamera <true/false>

Locks the camera, preventing keyboard control of rotation & pitch.  

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

    mv3d light <color> <t>
    mv3d ambient <color> <t>

Sets the color for the ambient light.

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

    mv3d disable
    mv3d enable

Turns 3D rendering on or off.

---

    mv3d ＠t elevation <n> <t>

Sets the elevation of the target character.

---

### Vehicle Commands

    mv3d <vehicle> speed <n>
    mv3d airship height <n>

The vehicles are boat, ship, and airship.  
Speed of the vehicle should be 1-6. It works the same as event speed.   
A higher airship can fly over higher mountains. Perhaps you could let the
player upgrade their airship's height and speed.


---

## Patron Supporters:

- Yorae Rasante
- JosephSeraph
- HuskyTrooper
- rpgmakerunion.ru
- CrysHistory
- GamesOfShadows
- 中华国哥
- FREELANDLOL (LvUp) 
- J. Dewar
- Goomy
- omegamer
- Mercylessly
- 르붐바 차
- Anger & Rage Interactive
- CoopNinjask

## Patron Knights:

- Whitely
- Izybelle
- Pumpkin Boss
- 冬空 橙

## Patron Heroes:

- A Memory of Eternity
- zxc
- Fyoha

@param options
@text Option Settings

@param 3dMenu
@text 3D Options Menu
@desc Whether 3D options will be in a submenu, regular options menu, or disabled.
@type combo
@option SUBMENU
@option ENABLE
@option DISABLE
@default SUBMENU

@param renderDist
@text Default Render Distance
@desc The maximum distance that can be rendered by the camera.
@parent options
@type Number
@default 25

@param mipmap
@text Mipmap Default
@parent options
@type Boolean
@default true

@param mipmapOption
@text Mipmap Option
@desc Should Mipmapping appear on options menu?
@parent options
@type Boolean
@default true

@param graphics
@text Graphics

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

@param lightLimit
@text Lights Per Mesh
@parent graphics
@type Number
@min 4
@default auto

@param map
@text Map Settings

@param enabledDefault
@text Enabled by Default
@desc Whether 3D map rendering is enabled by default.
@parent map
@type Boolean
@default true

@param cellSize
@text Cell Size
@desc The size of the chunks the map is divided into.
@parent map
@type Number
@default 10

@param unloadCells
@text Unload Far Cells
@desc Unload cells outside the render distance.
@parent map
@type Boolean
@default false

@param fog
@text Fog

@param fogColor
@text Fog Color
@desc The color of the fog. Use css color code or name (example: #ffffff)
@parent fog
@type Color
@default black

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

@param input
@text Input & Gameplay

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

@param walkOffEdge
@text Walk off Edge
@parent input
@type Boolean
@default false

@param walkOnEvents
@text Walk on Events
@parent input
@type Boolean
@default true

@param gravity
@text Gravity
@desc The speed characters will fall, in tiles per second.
@parent input
@type Number
@decimals 2
@default 8

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
@default ["{\"terrainTag\":\"1\",\"conf\":\"shape(xcross),height(1),fringe(0)\"}","{\"terrainTag\":\"2\",\"conf\":\"shape(fence),height(1)\"}"]

@param characters
@text Characters

@param eventCharDefaults
@text Character Event Settings
@parent characters
@type Text
@default shadow(0.8,4),shape(sprite),scale(1)

@param eventObjDefaults
@text Object Event Settings
@parent characters
@type Text
@default shadow(0),shape(sprite),scale(1)

@param eventTileDefaults
@text Tile Event Settings
@parent characters
@type Text
@default shadow(0),shape(flat),scale(1)

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
@default {"conf":"shadow(0.8,4),shape(sprite),scale(1),bush(false)"}

@param shipSettings
@text Ship Settings
@parent characters
@type struct<BoatStruct>
@default {"conf":"shadow(0.8,4),shape(sprite),scale(1),bush(false)"}

@param airshipSettings
@text Airship Settings
@parent characters
@type struct<AirshipStruct>
@default {"conf":"shadow(1,6),shape(sprite),scale(1),bush(false)","height":"2.0","bushLanding":"false"}

@param allowGlide
@text Allow Glide
@desc If true, collision detection for flying characters will use only current elevation and not target elevation.
@parent characters
@type Boolean
@default true

@param spriteOffset
@text Sprite Offset
@parent characters
@type Number
@min 0 @max 1
@decimals 2
@default 0.9
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
@default shape(flat),height(0)
*/
/*~struct~BoatStruct:
@param conf
@text Settings
@type Text
@default shadow(0.8,4),shape(sprite),scale(1),bush(false)

*/
/*~struct~AirshipStruct:
@param conf
@text Settings
@type Text
@default shadow(1,6),shape(sprite),scale(1),bush(false)

@param height
@text Elevation
@type Number
@decimals 1
@default 2.0

@param bushLanding
@text Land on Bush Tiles
@desc Whether the airship can land on bush tiles.
@type Boolean
@default false

*/!function(t){var e={};function i(a){if(e[a])return e[a].exports;var s=e[a]={i:a,l:!1,exports:{}};return t[a].call(s.exports,s,s.exports,i),s.l=!0,s.exports}i.m=t,i.c=e,i.d=function(t,e,a){i.o(t,e)||Object.defineProperty(t,e,{enumerable:!0,get:a})},i.r=function(t){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})},i.t=function(t,e){if(1&e&&(t=i(t)),8&e)return t;if(4&e&&"object"==typeof t&&t&&t.__esModule)return t;var a=Object.create(null);if(i.r(a),Object.defineProperty(a,"default",{enumerable:!0,value:t}),2&e&&"string"!=typeof t)for(var s in t)i.d(a,s,function(e){return t[e]}.bind(null,s));return a},i.n=function(t){var e=t&&t.__esModule?function(){return t.default}:function(){return t};return i.d(e,"a",e),e},i.o=function(t,e){return Object.prototype.hasOwnProperty.call(t,e)},i.p="",i(i.s=10)}([function(t,e,i){"use strict";var a=i(2),s=i(1);const r={util:s.h,setup(){if(this.setupParameters(),Object(a.A)(),this.canvas=document.createElement("canvas"),this.texture=PIXI.Texture.fromCanvas(this.canvas),this.engine=new a.d(this.canvas,this.ANTIALIASING),this.scene=new a.p(this.engine),this.scene.clearColor.set(0,0,0,0),this.cameraStick=new a.v("cameraStick",this.scene),this.cameraNode=new a.v("cameraNode",this.scene),this.cameraNode.parent=this.cameraStick,this.camera=new a.g("camera",new a.x(0,0,0),this.scene),this.camera.parent=this.cameraNode,this.camera.fov=Object(s.i)(r.FOV),this.camera.minZ=.1,this.camera.maxZ=this.RENDER_DIST,this.scene.ambientColor=new a.b(1,1,1),this.scene.fogMode=a.e,this.map=new a.k("map",this.scene),this.cells={},this.characters=[],this.setupBlenders(),this.setupInput(),this.setupSpriteMeshes(),this.callFeatures("setup"),isNaN(this.LIGHT_LIMIT)){const t=BABYLON.Scene.prototype.sortLightsByPriority;BABYLON.Scene.prototype.sortLightsByPriority=function(){t.apply(this,arguments),r.updateAutoLightLimit()}}},updateCanvas(){this.canvas.width=Graphics._width,this.canvas.height=Graphics._height},render(){this.scene.render(),this.texture.update()},lastMapUpdate:0,update(){performance.now()-this.lastMapUpdate>1e3&&!this.mapUpdating&&(this.updateMap(),this.lastMapUpdate=performance.now()),this.updateAnimations(),this.updateCharacters(),this.updateBlenders(),this.isDisabled()||this.loadData("cameraLocked")||((this.loadData("allowRotation",r.KEYBOARD_TURN)||this.is1stPerson())&&(Input.isTriggered("rotleft")?this.blendCameraYaw.setValue(this.blendCameraYaw.targetValue()+90,.5):Input.isTriggered("rotright")&&this.blendCameraYaw.setValue(this.blendCameraYaw.targetValue()-90,.5),this.is1stPerson()&&(Input.isTriggered("rotleft")||Input.isTriggered("rotright"))&&this.playerFaceYaw()),this.loadData("allowPitch",r.KEYBOARD_PITCH)&&(Input.isPressed("pageup")&&Input.isPressed("pagedown")||(Input.isPressed("pageup")?this.blendCameraPitch.setValue(Math.min(180,this.blendCameraPitch.targetValue()+1.5),.1):Input.isPressed("pagedown")&&this.blendCameraPitch.setValue(Math.max(0,this.blendCameraPitch.targetValue()-1.5),.1))));for(const t in this.cells)this.cells[t].update();this.callFeatures("update"),this.updateData()},loadData:(t,e)=>$gameVariables&&$gameVariables.mv3d&&t in $gameVariables.mv3d?$gameVariables.mv3d[t]:e,saveData(t,e){if(!$gameVariables)return console.warn(`MV3D: Couldn't save data ${t}:${e}`);$gameVariables.mv3d||($gameVariables.mv3d={}),$gameVariables.mv3d[t]=e},updateCameraMode(){let t=!1;this.cameraMode.startsWith("O")?this.camera.mode!==a.l&&(this.camera.mode=a.l,t=!0):this.camera.mode!==a.m&&(this.camera.mode=a.m,t=!0),t&&(this.updateBlenders(!0),this.callFeatures("updateCameraMode"),this.updateParameters())},get cameraMode(){return this.loadData("cameraMode",this.CAMERA_MODE).toUpperCase()},set cameraMode(t){t=String(t).toUpperCase().startsWith("O")?"ORTHOGRAPHIC":"PERSPECTIVE",this.saveData("cameraMode",t),this.updateBlenders(!0)},is1stPerson(t){const e=t?"currentValue":"targetValue";return this.getCameraTarget()===$gamePlayer&&this.blendCameraTransition[e]()<=0&&this.blendCameraDist[e]()<=0&&0===this.blendPanX[e]()&&0===this.blendPanY[e]()},isDisabled(){return this.loadData("disabled",this.getMapConfig("disabled",!r.ENABLED_DEFAULT))},disable(t=2){r.saveData("disabled",!0),$gamePlayer.reserveTransfer($gameMap.mapId(),$gamePlayer.x,$gamePlayer.y,$gamePlayer.direction(),t)},enable(t=2){r.saveData("disabled",!1),$gamePlayer.reserveTransfer($gameMap.mapId(),$gamePlayer.x,$gamePlayer.y,$gamePlayer.direction(),t),r.createCharacters()},loopCoords(t,e){if($gameMap.isLoopHorizontal()){const e=$gameMap.width(),i=this.cameraStick.x-e/2;t=(t-i).mod(e)+i}if($gameMap.isLoopVertical()){const t=$gameMap.height(),i=this.cameraStick.y-t/2;e=(e-i).mod(t)+i}return new a.w(t,e)},playerFaceYaw(){let t=Math.floor((45-r.blendCameraYaw.targetValue())/90).mod(4);t>1&&(t+=(t+1)%2*2-1),t=10-(2*t+2),$gamePlayer.setDirection(t)},dirToYaw(t){let e=t/2-1;return e>1&&(e+=(e+1)%2*2-1),e=-90*e+180},transformDirectionYaw(t,e=this.blendCameraYaw.currentValue(),i=!1){if(0==t)return 0;(t=t/2-1)>1&&(t+=(t+1)%2*2-1);const a=Math.floor((e+45)/90);return(t=i?(t-a).mod(4):(t+a).mod(4))>1&&(t+=(t+1)%2*2-1),2*t+2},autoLightLimit(t){return isNaN(this.LIGHT_LIMIT)?Math.max(4,t):this.LIGHT_LIMIT},updateAutoLightLimit(){const t=this.autoLightLimit(r.scene.lights.length);for(const e of Object.values(r.materialCache))e.maxSimultaneousLights=t;for(const t of this.characters)t.material&&(t.material.maxSimultaneousLights=this.autoLightLimit(t.mesh.lightSources.length))},getFieldSize(t=r.blendCameraDist.currentValue()){const e=Math.tan(r.camera.fov/2)*t*2;return{width:e*r.engine.getAspectRatio(r.camera),height:e}},getScaleForDist(t=r.blendCameraDist.currentValue()){return Graphics.height/this.getFieldSize(t).height/48},getScreenPosition(t,e=a.x.Zero()){const i=t.parent?t.parent.getWorldMatrix():BABYLON.Matrix.Identity(),s=t instanceof a.x?t.add(e):t.position.add(e),n=a.x.Project(s,i,r.scene.getTransformMatrix(),r.camera.viewport);return{x:n.x*Graphics.width,y:n.y*Graphics.height,behindCamera:n.z>1}}};window.mv3d=r,e.a=r},function(t,e,i){"use strict";i.d(e,"k",(function(){return h})),i.d(e,"o",(function(){return l})),i.d(e,"e",(function(){return c})),i.d(e,"f",(function(){return p})),i.d(e,"j",(function(){return u})),i.d(e,"q",(function(){return d})),i.d(e,"i",(function(){return g})),i.d(e,"n",(function(){return m})),i.d(e,"p",(function(){return f})),i.d(e,"g",(function(){return _})),i.d(e,"u",(function(){return b})),i.d(e,"s",(function(){return T})),i.d(e,"t",(function(){return C})),i.d(e,"r",(function(){return y})),i.d(e,"b",(function(){return S})),i.d(e,"c",(function(){return M})),i.d(e,"d",(function(){return E})),i.d(e,"a",(function(){return I})),i.d(e,"l",(function(){return L})),i.d(e,"m",(function(){return D}));var a=i(0);const{Vector2:s,Vector3:r,Color3:n,Color4:o}=window.BABYLON,h=t=>{if("number"==typeof t)return{r:(t>>16)/255,g:(t>>8&255)/255,b:(255&t)/255,a:1};if(t instanceof n)return t.toColor4();if(t instanceof o)return t;{const e=document.createElement("canvas");e.width=1,e.height=1;const i=e.getContext("2d");i.fillStyle=t,i.fillRect(0,0,1,1);const a=i.getImageData(0,0,1,1).data;return new o(a[0]/255,a[1]/255,a[2]/255,a[3]/255)}},l=(t,e)=>{if(""===e)return+t;const i=/^[+]/.test(e);return i&&(e=e.substr(1)),e=Number(e),Number.isNaN(e)?+t:i?+t+e:+e},c=t=>isNaN(t)?p(t):Number(t),p=t=>Boolean(u(t)),u=t=>{if(!t)return!1;"string"!=typeof t&&(t=String(t));const e=t.toUpperCase();return!u.values.includes(e)&&t};u.values=["OFF","FALSE","UNDEFINED","NULL","DISABLE","DISABLED"];const d=(t=0)=>new Promise(e=>setTimeout(e,t)),g=t=>t*Math.PI/180,m=t=>180*t/Math.PI,f=t=>b(Math.sin(t)),_=t=>b(Math.cos(t)),b=t=>Math.round(1e3*t)/1e3,T=()=>C(),C=()=>Game_Map.prototype.tileWidth(),y=()=>Game_Map.prototype.tileHeight(),S=new r(1,0,0),M=new r(0,1,0),E=new r(0,0,1),v=new s(0,0),O=new r(0,0,0),I=Math.PI,w=2*Math.PI,L=t=>{const e=function(){const e=arguments.length;return"function"==typeof t[e]?t[e].apply(this,arguments):"function"==typeof t.default?t.default.apply(this,arguments):void console.warn("Unsupported number of arguments.")};for(const i in t)e[i]=t[i].bind;return e},A=()=>!a.a.isDisabled(),D=(t,e,i,a=A)=>{const s=t[e],r=i(s);return t[e]=function(){return("function"==typeof a?a():a)?r.apply(this,arguments):s.apply(this,arguments)}},x={makeColor:h,hexNumber:t=>((t=String(t)).startsWith("#")&&(t=t.substr(1)),Number.parseInt(t,16)),relativeNumber:l,booleanString:p,falseString:u,booleanNumber:c,sleep:d,degtorad:g,radtodeg:m,sin:f,cos:_,unround:b,tileSize:T,tileWidth:C,tileHeight:y,XAxis:S,YAxis:M,ZAxis:E,v2origin:v,v3origin:O,PI:I,PI2:w,overload:L,override:D};e.h=x},function(t,e,i){"use strict";var a=i(0),s=i(1);function r(t){n(t,"if (texture2D(diffuseSampler,vUV).a<0.4)",`if (texture2D(diffuseSampler,vUV).a<${mv3d.ALPHA_CUTOFF})`)}function n(t,e,i){BABYLON.Effect.ShadersStore[t]=BABYLON.Effect.ShadersStore[t].replace(e,i)}i.d(e,"p",(function(){return h})),i.d(e,"d",(function(){return l})),i.d(e,"g",(function(){return c})),i.d(e,"q",(function(){return d})),i.d(e,"o",(function(){return g})),i.d(e,"w",(function(){return f})),i.d(e,"x",(function(){return _})),i.d(e,"b",(function(){return T})),i.d(e,"n",(function(){return y})),i.d(e,"k",(function(){return S})),i.d(e,"v",(function(){return M})),i.d(e,"u",(function(){return E})),i.d(e,"t",(function(){return v})),i.d(e,"i",(function(){return w})),i.d(e,"y",(function(){return L})),i.d(e,"j",(function(){return A})),i.d(e,"r",(function(){return P})),i.d(e,"s",(function(){return F})),i.d(e,"f",(function(){return N})),i.d(e,"a",(function(){return H})),i.d(e,"c",(function(){return R})),i.d(e,"m",(function(){return B})),i.d(e,"l",(function(){return V})),i.d(e,"e",(function(){return z})),i.d(e,"z",(function(){return Y})),i.d(e,"h",(function(){return k})),i.d(e,"A",(function(){return J}));const o=window.BABYLON,{Scene:h,Engine:l,FreeCamera:c,HemisphericLight:p,DirectionalLight:u,SpotLight:d,PointLight:g,ShadowGenerator:m,Vector2:f,Vector3:_,Vector4:b,Color3:T,Color4:C,Plane:y,Node:S,TransformNode:M,Texture:E,StandardMaterial:v,ShaderMaterial:O,Effect:I,Mesh:w,VertexData:L,MeshBuilder:A,AssetsManager:D,SceneSerializer:x,Sprite:P,SpriteManager:F}=o,{FRONTSIDE:N,BACKSIDE:H,DOUBLESIDE:R}=w,{PERSPECTIVE_CAMERA:B,ORTHOGRAPHIC_CAMERA:V}=o.Camera,{FOGMODE_NONE:G,FOGMODE_EXP:j,FOGMODE_EXP2:$,FOGMODE_LINEAR:z}=h,Y=o.Space.WORLD,k=o.Space.LOCAL;o.Space.BONE;E.prototype.crop=function(t=0,e=0,i=0,s=0){const{width:r,height:n}=this.getBaseSize();i||(i=r-t),s||(s=n-e),a.a.EDGE_FIX&&(t+=a.a.EDGE_FIX,e+=a.a.EDGE_FIX,i-=2*a.a.EDGE_FIX,s-=2*a.a.EDGE_FIX),this.uScale=i/r,this.vScale=s/n,this.uOffset=t/r,this.vOffset=1-e/n-this.vScale};const W={x:{get(){return this.position?this.position.x:void 0},set(t){this.position&&(this.position.x=t)}},y:{get(){return this.position?-this.position.z:void 0},set(t){this.position&&(this.position.z=-t)}},z:{get(){return this.position?this.position.y:void 0},set(t){this.position&&(this.position.y=t)}}},X={pitch:{get(){return this.rotation?-Object(s.n)(this.rotation.x):void 0},set(t){this.rotation&&(this.rotation.x=-Object(s.i)(t))}},yaw:{get(){return this.rotation?-Object(s.n)(this.rotation.y):void 0},set(t){this.rotation&&(this.rotation.y=-Object(s.i)(t))}},roll:{get(){return this.rotation?-Object(s.n)(this.rotation.z):void 0},set(t){this.rotation&&(this.rotation.z=-Object(s.i)(t))}}};Object.defineProperties(S.prototype,W),Object.defineProperties(S.prototype,X),Object.defineProperties(P.prototype,W),Object.defineProperty(w.prototype,"order",{get(){return this._order},set(t){this._order=t,this._scene.sortMeshes()}});const U=(t,e)=>(0|t._order)-(0|e._order);h.prototype.sortMeshes=function(){this.meshes.sort(U)};const Z=h.prototype.addMesh;h.prototype.addMesh=function(t){Z.apply(this,arguments),"number"==typeof t._order&&this.sortMeshes()};const K=h.prototype.removeMesh;function J(){r("shadowMapPixelShader"),r("depthPixelShader")}h.prototype.removeMesh=function(t){K.apply(this,arguments),this.sortMeshes()},T.prototype.toNumber=C.prototype.toNumber=function(){return 255*this.r<<16|255*this.g<<8|255*this.b}},function(t,e){t.exports=require("fs")},function(t,e){t.exports=require("path")},function(t,e,i){i(6),i(8)},function(t,e,i){"use strict";i.r(e);var a=i(0);a.a["option-store"]={},a.a.options={"mv3d-renderDist":{name:"Render Distance",min:10,max:100,increment:5,wrap:!1,apply(t){a.a.RENDER_DIST=t},default:a.a.RENDER_DIST}},a.a.MIPMAP_OPTION&&(a.a.options["mv3d-mipmap"]={name:"Mipmapping",type:"bool",apply(t){a.a.MIPMAP=t,a.a.needReloadMap=!0},default:a.a.MIPMAP}),a.a.ENABLE_3D_OPTIONS&&i(7)},function(t,e,i){"use strict";i.r(e);var a=i(0),s=i(1);const r=Window_Options.prototype.makeCommandList;Window_Options.prototype.makeCommandList=function(){if(r.apply(this,arguments),2===a.a.ENABLE_3D_OPTIONS)this.addCommand("3D Options","mv3d-options");else if(1===a.a.ENABLE_3D_OPTIONS)for(const t in a.a.options)this.addCommand(a.a.options[t].name,t)};const n=Window_Options.prototype.statusText;Window_Options.prototype.statusText=function(t){const e=this.commandSymbol(t);this.getConfigValue(e);return"mv3d-options"===e?"":n.apply(this,arguments)},Object.defineProperty(ConfigManager,"mv3d-options",{get(){},set(t){SceneManager.push(Scene_3D_Options)},configurable:!0});const o=ConfigManager.makeData;ConfigManager.makeData=function(){const t=o.apply(this,arguments);return Object.assign(t,a.a["option-store"]),t};const h=ConfigManager.applyData;ConfigManager.applyData=function(t){h.apply(this,arguments);for(const e in a.a.options)e in t&&(a.a["option-store"][e]=t[e],a.a.options[e].apply(t[e]));a.a.updateParameters()};class Scene_3D_Options extends Scene_Options{createOptionsWindow(){this._optionsWindow=new Window_3D_Options,this._optionsWindow.setHandler("cancel",this.popScene.bind(this)),this.addWindow(this._optionsWindow)}terminate(){super.terminate(),a.a.updateParameters()}}class Window_3D_Options extends Window_Options{makeCommandList(){for(const t in a.a.options)this.addCommand(a.a.options[t].name,t)}}1===a.a.ENABLE_3D_OPTIONS&&Object(s.m)(Scene_Options.prototype,"terminate",t=>(function(){t.apply(this,arguments),a.a.updateParameters()}),!0),Window_Options.prototype._is_mv3d_option=function(t){return t in a.a.options},Window_Options.prototype._mv3d_cursor=function(t,e){const i=this.index(),s=this.commandSymbol(i);let r=this.getConfigValue(s);const n=a.a.options[s];if(n)if("bool"===n.type)this.changeValue(s,e>0);else{const i=n.min||0,a=n.values?n.values.length-1:n.max||1;r+=(n.increment||1)*e,t&&n.wrap||"ok"===t?(r>a&&(r=i),r<i&&(r=a)):r=r.clamp(i,a),this.changeValue(s,r)}},Object(s.m)(Window_Options.prototype,"statusText",t=>(function(e){const i=this.commandSymbol(e);if(!this._is_mv3d_option(i))return t.apply(this,arguments);const s=this.getConfigValue(i),r=a.a.options[i];return"bool"===r.type?this.booleanStatusText(s):r.values?r.values[s]:String(s)}),!0),Object(s.m)(Window_Options.prototype,"setConfigValue",t=>(function(e,i){if(!this._is_mv3d_option(e))return t.apply(this,arguments);a.a["option-store"][e]=i;const s=a.a.options[e];s.apply&&s.apply(i)}),!0),Object(s.m)(Window_Options.prototype,"getConfigValue",t=>(function(e){if(!this._is_mv3d_option(e))return t.apply(this,arguments);const i=a.a.options[e];let s=a.a["option-store"][e];return null==s&&(s=i.default||i.min||0),s}),!0),Object(s.m)(Window_Options.prototype,"cursorLeft",t=>(function(e){const i=this.commandSymbol(this.index());return this._is_mv3d_option(i)?this._mv3d_cursor(e,-1):t.apply(this,arguments)}),!0),Object(s.m)(Window_Options.prototype,"cursorRight",t=>(function(e){const i=this.commandSymbol(this.index());return this._is_mv3d_option(i)?this._mv3d_cursor(e,1):t.apply(this,arguments)}),!0),Object(s.m)(Window_Options.prototype,"processOk",t=>(function(){const e=this.index(),i=this.commandSymbol(e);if(!this._is_mv3d_option(i))return t.apply(this,arguments);let s=this.getConfigValue(i);const r=a.a.options[i];"bool"===r.type?this.changeValue(i,!s):this._mv3d_cursor("ok",1)}),!0)},function(t,e,i){"use strict";i.r(e);var a=i(0),s=i(1);Object.assign(a.a,{vehicleObstructed:(t,...e)=>vehicleObstructed.apply(t,e),tileCollision(t,e,i,s=!1,r=!1){if(!(t instanceof a.a.Character)){if(!t.mv3d_sprite)return!1;t=t.mv3d_sprite}const n="number"==typeof r?r:r?t.targetElevation:t.z,o=t.getCollisionHeight(n),h=this.getCollisionHeights(e,i);2==s&&(o.z1+=a.a.STAIR_THRESH,o.z2+=a.a.STAIR_THRESH);for(const n of h)if(o.z1<n.z2&&o.z2>n.z1)return 1!=s||!a.a.STAIR_THRESH||this.tileCollision(t,e,i,2,r);return!1},charCollision(t,e,i=!1,s=!1,r=s,n=!1){if(!(t instanceof a.a.Character)){if(!t.mv3d_sprite)return!1;t=t.mv3d_sprite}if(!(e instanceof a.a.Character)){if(!e.mv3d_sprite)return!1;e=e.mv3d_sprite}if(!(n||t.char._mv3d_hasCollide()&&e.char._mv3d_hasCollide()))return!1;const o="number"==typeof s?s:s?t.targetElevation:t.z,h="number"==typeof r?r:r?e.targetElevation:e.z,l=t.getCollisionHeight(o),c=n?e.getTriggerHeight(h):e.getCollisionHeight(h);return 2==i&&(l.z1+=a.a.STAIR_THRESH,l.z2+=a.a.STAIR_THRESH),!!(!n&&l.z1<c.z2&&l.z2>c.z1||n&&l.z1<=c.z2&&l.z2>=c.z1)&&(1!=i||!a.a.STAIR_THRESH||this.charCollision(t,e,2,s,r))},getPlatformForCharacter(t,e,i){if(!(t instanceof a.a.Character)){if(!t.mv3d_sprite)return!1;t=t.mv3d_sprite}const s=t.getCHeight(),r=a.a.STAIR_THRESH>=s;return this.getPlatformAtLocation(e,i,t.z+Math.max(s,a.a.STAIR_THRESH),{char:t,gte:r})},getPlatformAtLocation(t,e,i,a={}){const s=a.char,r=this.getCollisionHeights(t,e);r.push(...$gameMap.eventsXyNt(Math.round(t),Math.round(e)).filter(t=>{if(!(t.mv3d_sprite&&t._mv3d_isPlatform()&&t._mv3d_hasCollide()&&t.mv3d_sprite.visible))return!1;if(s){if(s.char===t)return!1;let e=t.mv3d_sprite;for(;e=e.platformChar;)if(e===s||e===t.mv3d_sprite)return!1}return!0}).map(t=>t.mv3d_sprite.getCollisionHeight()));let n=r[0];for(const t of r)t.z2>n.z2&&(a.gte?t.z2<=i:t.z2<i)&&(n=t);return n},isRampAt(t,e,i){const a=this.getTileData(t,e);let s=0;for(let r=0;r<4;++r){s+=this.getTileFringe(t,e,r),s+=this.getTileHeight(t,e,r);const n=this.getTileConfig(a[r],t,e,r);if(n.shape!==this.configurationShapes.SLOPE)continue;const o=n.slopeHeight||1;if(i>=s-o&&i<=s)return{id:a[r],x:t,y:e,l:r,conf:n,z1:s-o,z2:s}}return!1},canPassRamp(t,e){const{dir:i}=a.a.getSlopeDirection(e.x,e.y,e.l,!0),s=$gameMap.roundXWithDirection(e.x,t),r=$gameMap.roundYWithDirection(e.y,t),n=this.isRampAt(s,r,i===t?e.z1:i===10-t?e.z2:(e.z1+e.z2)/2);if(n){const{dir:o}=a.a.getSlopeDirection(s,r,n.l,!0);return i!==t&&i!==10-t?i===o&&e.z1===n.z1&&e.z2===n.z2:i===o&&(i===t?e.z1===n.z2:e.z2===n.z1)}if(i!==t&&i!==10-t)return!1;const o=this.getPlatformAtLocation(s,r,(i===t?e.z1:e.z2)+a.a.STAIR_THRESH).z2;return Math.abs(o-(i===t?e.z1:e.z2))<=a.a.STAIR_THRESH}}),Game_CharacterBase.prototype._mv3d_isFlying=function(){return this.mv3d_sprite&&this.mv3d_sprite.blendElevation.currentValue()>0},Game_Vehicle.prototype._mv3d_isFlying=function(){return this.isAirship()||Game_CharacterBase.prototype._mv3d_isFlying.apply(this,arguments)},Game_Player.prototype._mv3d_isFlying=function(){return!(!this.isInVehicle()||!this.vehicle().isAirship())||Game_CharacterBase.prototype._mv3d_isFlying.apply(this,arguments)},Game_CharacterBase.prototype._mv3d_isPlatform=function(){return this.mv3d_sprite&&this.mv3d_sprite.getConfig("platform",a.a.WALK_ON_EVENTS)},Game_CharacterBase.prototype._mv3d_hasCollide=function(){const t=this.mv3d_sprite;return!(!t||!1===t.getConfig("collide"))&&(this._mv3d_isPlatform()||Boolean(t.getCHeight()))},i(9);const r=Game_Map.prototype.isAirshipLandOk;Game_Map.prototype.isAirshipLandOk=function(t,e){return a.a.isDisabled()?r.apply(this,arguments):a.a.AIRSHIP_SETTINGS.bushLanding?this.checkPassage(t,e,15):r.apply(this,arguments)};const n=Game_Player.prototype.updateVehicleGetOn;Game_Player.prototype.updateVehicleGetOn=function(){if(a.a.isDisabled())return n.apply(this,arguments);const t=this.vehicle(),e=a.a.loadData(`${t._type}_speed`,t._moveSpeed);t.setMoveSpeed(e),n.apply(this,arguments),this.setThrough(!1)};const o=Game_CharacterBase.prototype.jump;Game_CharacterBase.prototype.jump=function(t,e){if(a.a.isDisabled())return o.apply(this,arguments);this.mv3d_jumpHeightStart=a.a.getWalkHeight(this.x,this.y),this.mv3d_jumpHeightEnd=a.a.getWalkHeight(this.x+t,this.y+e),o.apply(this,arguments)};const h=Game_Player.prototype.getOnVehicle;Game_Player.prototype.getOnVehicle=function(){if(a.a.isDisabled())return h.apply(this,arguments);var t=this.direction(),e=this.x,i=this.y,s=$gameMap.roundXWithDirection(e,t),r=$gameMap.roundYWithDirection(i,t);return $gameMap.airship().pos(e,i)&&a.a.charCollision(this,$gameMap.airship(),!1,!1,!1,!0)?this._vehicleType="airship":$gameMap.ship().pos(s,r)&&a.a.charCollision(this,$gameMap.ship())?this._vehicleType="ship":$gameMap.boat().pos(s,r)&&a.a.charCollision(this,$gameMap.boat())&&(this._vehicleType="boat"),this.isInVehicle()&&(this._vehicleGettingOn=!0,this.isInAirship()||this.forceMoveForward(),this.gatherFollowers()),this._vehicleGettingOn},Object(s.m)(Game_Vehicle.prototype,"isLandOk",t=>(function(e,i,s){$gameTemp._mv3d_collision_char=$gamePlayer.mv3d_sprite;let r=t.apply(this,arguments);if(delete $gameTemp._mv3d_collision_char,this.isAirship())return r;var n=$gameMap.roundXWithDirection(e,s),o=$gameMap.roundYWithDirection(i,s);const h=a.a.getPlatformForCharacter($gamePlayer,n,o);h.char&&(r=!0);const l=Math.abs(h.z2-this.z);return r&&l<Math.max($gamePlayer.mv3d_sprite.getCHeight(),this.mv3d_sprite.getCHeight())}))},function(t,e,i){"use strict";i.r(e);var a=i(0),s=i(1);const r=Game_CharacterBase.prototype.canPass;function n(t,e,i,s){return e.some(e=>{const r=e._mv3d_isPlatform();if(a.a.WALK_OFF_EDGE&&!r){const r=a.a.getPlatformForCharacter(t,i,s).z2;if(a.a.charCollision(t,e,!1,r))return!0}return a.a.charCollision(t,e,r,!0)})}Game_CharacterBase.prototype.canPass=function(t,e,i){return!!r.apply(this,arguments)&&(a.a.isDisabled()||this.isDebugThrough()||this.isThrough(),!0)};const o=t=>(function(t,e){return n(this,$gameMap.eventsXyNt(t,e),t,e)});Object(s.m)(Game_CharacterBase.prototype,"isCollidedWithEvents",o),Object(s.m)(Game_Event.prototype,"isCollidedWithEvents",o),Object(s.m)(Game_Event.prototype,"isCollidedWithPlayerCharacters",t=>(function(t,e){if($gamePlayer.isThrough())return!1;return n(this,[$gamePlayer,...$gamePlayer.followers()._data.filter(t=>t.isVisible()&&t.mv3d_sprite.visible)].filter(i=>i.pos(t,e)),t,e)})),Object(s.m)(Game_CharacterBase.prototype,"isCollidedWithVehicles",t=>(function(t,e){const i=$gameMap.boat(),s=$gameMap.ship();return i.posNt(t,e)&&a.a.charCollision(this,i,i._mv3d_isPlatform(),!0)||s.posNt(t,e)&&a.a.charCollision(this,s,s._mv3d_isPlatform(),!0)}));const h=t=>(function(e,i,r){const n=this.mv3d_sprite;if(!n)return t.apply(this,arguments);$gameTemp._mv3d_collision_char=n;let o,h=!t.apply(this,arguments);if(delete $gameTemp._mv3d_collision_char,h)return!1;if((o=a.a.isRampAt(e,i,n.z))&&a.a.canPassRamp(r,o))return!0;var l=$gameMap.roundXWithDirection(e,r),c=$gameMap.roundYWithDirection(i,r);if((o=a.a.isRampAt(l,c,n.z))&&a.a.canPassRamp(10-r,o))return!0;if(this._mv3d_isFlying()){if(!a.a.ALLOW_GLIDE&&a.a.tileCollision(this,l,c,!0,!0)||a.a.tileCollision(this,l,c,!0,!1))return!1}else{if(a.a.tileCollision(this,l,c,!0,!0))return!1;if(n.falling)return!1;if(!a.a.WALK_OFF_EDGE){let t=a.a.getPlatformForCharacter(this,l,c).z2;if(n.hasFloat&&(t+=a.a.getFloatHeight(l,c,n.z+n.getCHeight())),Object(s.u)(Math.abs(t-n.targetElevation))>a.a.STAIR_THRESH)return!1}}return!0});Object(s.m)(Game_CharacterBase.prototype,"isMapPassable",h),Object(s.m)(Game_Vehicle.prototype,"isMapPassable",h),Object(s.m)(Game_Player.prototype,"startMapEvent",t=>(function(t,e,i,s){$gameMap.isEventRunning()||$gameMap.eventsXy(t,e).filter(t=>a.a.charCollision(this,t,!1,!1,!1,!0)).forEach(t=>{t.isTriggerIn(i)&&t.isNormalPriority()===s&&t.start()})}));const l=Game_Map.prototype.checkPassage;Game_Map.prototype.checkPassage=function(t,e,i){if(!("_mv3d_collision_char"in $gameTemp))return l.apply(this,arguments);const s=$gameTemp._mv3d_collision_char,r=s.z+Math.max(s.getCHeight(),a.a.STAIR_THRESH),n=a.a.getPlatformForCharacter(s,t,e);if(n.char)return!0;var o=this.tilesetFlags();const h=a.a.getTileLayers(t,e,r),c=a.a.getTileData(t,e);for(var p=h.length-1;p>=0;--p){const s=h[p];if(15&i){const i=a.a.getTileConfig(t,e,s);if("pass"in i){if(i.pass===a.a.configurationPassage.THROUGH)continue;if(i.pass===a.a.configurationPassage.FLOOR)return!0;if(i.pass===a.a.configurationPassage.WALL)return!1}}const r=o[c[s]];if(0==(16&r)){if(0==(r&i))return!0;if((r&i)===i)return!1}}return!1}},function(t,e,i){"use strict";i.r(e);var a=i(0),s=i(2);const r=Graphics._createCanvas;Graphics._createCanvas=function(){a.a.setup(),a.a.updateCanvas(),r.apply(this,arguments)};const n=Graphics._updateAllElements;Graphics._updateAllElements=function(){n.apply(this,arguments),a.a.updateCanvas()};const o=Graphics.render;Graphics.render=function(){a.a.render(),o.apply(this,arguments)};const h=Scene_Map.prototype.update;Scene_Map.prototype.update=function(){h.apply(this,arguments),a.a.isDisabled()||a.a.update()};const l=ShaderTilemap.prototype.renderWebGL;ShaderTilemap.prototype.renderWebGL=function(t){a.a.mapDisabled&&l.apply(this,arguments)};const c=Spriteset_Map.prototype.createTilemap;Spriteset_Map.prototype.createTilemap=function(){c.apply(this,arguments),a.a.mapDisabled=a.a.isDisabled(),a.a.mapDisabled||(this._tilemap.visible=!1,a.a.pixiSprite=new PIXI.Sprite(a.a.texture),this._baseSprite.addChild(a.a.pixiSprite))};const p=Sprite_Character.prototype.setCharacter;Sprite_Character.prototype.setCharacter=function(t){p.apply(this,arguments),Object.defineProperty(t,"mv_sprite",{value:this,configurable:!0})};const u=Game_Player.prototype.performTransfer;Game_Player.prototype.performTransfer=function(){const t=this._newMapId!==$gameMap.mapId();t&&($gameVariables.mv3d&&delete $gameVariables.mv3d.disabled,a.a.clearMap()),u.apply(this,arguments),a.a.is1stPerson()&&a.a.blendCameraYaw.setValue(a.a.dirToYaw($gamePlayer.direction(),0))};const d=Scene_Map.prototype.onMapLoaded;Scene_Map.prototype.onMapLoaded=function(){a.a.needClearMap?(a.a.clearMap(),a.a.needClearMap=!1):a.a.needReloadMap&&(a.a.reloadMap(),a.a.needReloadMap=!1),a.a.loadMapSettings(),d.apply(this,arguments),a.a.mapLoaded||(a.a.applyMapSettings(),a.a.loadTilesetSettings(),a.a.isDisabled()?a.a.mapReady=!0:(a.a.mapReady=!1,a.a.loadMap())),a.a.updateBlenders(!0)};const g=Scene_Load.prototype.onLoadSuccess;Scene_Load.prototype.onLoadSuccess=function(){g.apply(this,arguments),a.a.needClearMap=!0};const m=Scene_Map.prototype.isReady;Scene_Map.prototype.isReady=function(){let t=m.apply(this,arguments);return t&&a.a.mapReady};const f=Scene_Title.prototype.start;Scene_Title.prototype.start=function(){f.apply(this,arguments),a.a.clearMap(),a.a.clearCameraTarget()};var _=i(1);const b=PluginManager.parameters("mv3d-babylon");Object.assign(a.a,{CAMERA_MODE:"PERSPECTIVE",ORTHOGRAPHIC_DIST:100,MV3D_FOLDER:"img/MV3D",ANIM_DELAY:Number(b.animDelay),ALPHA_CUTOFF:Math.max(.01,b.alphatest),EDGE_FIX:Number(b.edgefix),ANTIALIASING:Object(_.f)(b.antialiasing),FOV:Number(b.fov),WALL_HEIGHT:Number(b.wallHeight),TABLE_HEIGHT:Number(b.tableHeight),FRINGE_HEIGHT:Number(b.fringeHeight),CEILING_HEIGHT:Number(b.ceilingHeight),LAYER_DIST:Number(b.layerDist),ENABLED_DEFAULT:Object(_.f)(b.enabledDefault),UNLOAD_CELLS:Object(_.f)(b.unloadCells),CELL_SIZE:Number(b.cellSize),RENDER_DIST:Number(b.renderDist),MIPMAP:Object(_.f)(b.mipmap),MIPMAP_OPTION:Object(_.f)(b.mipmapOption),STAIR_THRESH:Number(b.stairThresh),WALK_OFF_EDGE:Object(_.f)(b.walkOffEdge),WALK_ON_EVENTS:Object(_.f)(b.walkOnEvents),GRAVITY:Number(b.gravity),FOG_COLOR:Object(_.k)(b.fogColor).toNumber(),FOG_NEAR:Number(b.fogNear),FOG_FAR:Number(b.fogFar),LIGHT_LIMIT:Number(b.lightLimit),LIGHT_HEIGHT:.5,LIGHT_DECAY:1,LIGHT_DIST:3,LIGHT_ANGLE:45,FLASHLIGHT_EXTRA_ANGLE:10,KEYBOARD_PITCH:Object(_.f)(b.keyboardPitch),KEYBOARD_TURN:Object(_.f)(b.keyboardTurn),KEYBOARD_STRAFE:Object(_.f)(b.keyboardStrafe),REGION_DATA:{},TTAG_DATA:{},EVENT_HEIGHT:Number(b.eventHeight),BOAT_SETTINGS:JSON.parse(b.boatSettings),SHIP_SETTINGS:JSON.parse(b.shipSettings),AIRSHIP_SETTINGS:JSON.parse(b.airshipSettings),ALLOW_GLIDE:Object(_.f)(b.allowGlide),SPRITE_OFFSET:Number(b.spriteOffset)/2,ENABLE_3D_OPTIONS:{disable:0,enable:1,submenu:2}[b["3dMenu"].toLowerCase()],setupParameters(){for(let t of JSON.parse(b.regions)){t=JSON.parse(t);const e=this.readConfigurationFunctions(t.conf,this.tilesetConfigurationFunctions);this.REGION_DATA[t.regionId]=e}for(let t of JSON.parse(b.ttags))t=JSON.parse(t),this.TTAG_DATA[t.terrainTag]=this.readConfigurationFunctions(t.conf,this.tilesetConfigurationFunctions);this.EVENT_CHAR_SETTINGS=this.readConfigurationFunctions(b.eventCharDefaults,this.eventConfigurationFunctions),this.EVENT_OBJ_SETTINGS=this.readConfigurationFunctions(b.eventObjDefaults,this.eventConfigurationFunctions),this.EVENT_TILE_SETTINGS=this.readConfigurationFunctions(b.eventTileDefaults,this.eventConfigurationFunctions),this.BOAT_SETTINGS.big=Object(_.f)(this.BOAT_SETTINGS.big),this.SHIP_SETTINGS.big=Object(_.f)(this.SHIP_SETTINGS.big),this.AIRSHIP_SETTINGS.height=Number(this.AIRSHIP_SETTINGS.height),this.AIRSHIP_SETTINGS.big=Object(_.f)(this.AIRSHIP_SETTINGS.big),this.AIRSHIP_SETTINGS.bushLanding=Object(_.f)(this.AIRSHIP_SETTINGS.bushLanding),this.BOAT_SETTINGS.conf=this.readConfigurationFunctions(this.BOAT_SETTINGS.conf,this.eventConfigurationFunctions),this.SHIP_SETTINGS.conf=this.readConfigurationFunctions(this.SHIP_SETTINGS.conf,this.eventConfigurationFunctions),this.AIRSHIP_SETTINGS.conf=this.readConfigurationFunctions(this.AIRSHIP_SETTINGS.conf,this.eventConfigurationFunctions)},updateParameters(){this.camera.mode===s.l?(this.camera.maxZ=this.RENDER_DIST,this.camera.minZ=-this.RENDER_DIST):(this.camera.maxZ=this.RENDER_DIST,this.camera.minZ=.1),this.callFeatures("updateParameters")}}),Object.defineProperties(a.a,{AMBIENT_COLOR:{get:()=>a.a.featureEnabled("dynamicShadows")?8947848:16777215}}),Object.assign(a.a,{cameraTargets:[],getCameraTarget(){return this.cameraTargets[0]},setCameraTarget(t,e){t?(this.cameraTargets.unshift(t),this.cameraTargets.length>2&&(this.cameraTargets.length=2),this.saveData("cameraTarget",this.getTargetString(t)),this.blendCameraTransition.value=1,this.blendCameraTransition.setValue(0,e)):this.cameraTargets.length=0},clearCameraTarget(){this.cameraTargets.length=0},resetCameraTarget(){this.clearCameraTarget(),this.setCameraTarget($gamePlayer,0)},rememberCameraTarget(){const t=this.loadData("cameraTarget");t&&this.setCameraTarget(this.targetChar(t),0)},setupBlenders(){this.blendFogColor=new ColorBlender("fogColor",this.FOG_COLOR),this.blendFogNear=new blenders_Blender("fogNear",this.FOG_NEAR),this.blendFogFar=new blenders_Blender("fogFar",this.FOG_FAR),this.blendCameraYaw=new blenders_Blender("cameraYaw",0),this.blendCameraYaw.cycle=360,this.blendCameraPitch=new blenders_Blender("cameraPitch",60),this.blendCameraPitch.min=0,this.blendCameraPitch.max=180,this.blendCameraDist=new blenders_Blender("cameraDist",10),this.blendCameraHeight=new blenders_Blender("cameraHeight",.7),this.blendAmbientColor=new ColorBlender("ambientColor",this.AMBIENT_COLOR),this.blendPanX=new blenders_Blender("panX",0),this.blendPanY=new blenders_Blender("panY",0),this.blendCameraTransition=new blenders_Blender("cameraTransition",0)},updateBlenders(t){if(this.updateCameraMode(),this.cameraTargets.length||$gamePlayer&&(this.cameraTargets[0]=$gamePlayer),this.blendCameraTransition.update()&&this.cameraTargets.length>=2){const t=this.blendCameraTransition.currentValue();let e=this.cameraTargets[0],i=this.cameraTargets[1];this.cameraStick.x=e._realX*(1-t)+i._realX*t,this.cameraStick.y=e._realY*(1-t)+i._realY*t,e.mv3d_sprite&&i.mv3d_sprite?this.cameraStick.z=e.mv3d_sprite.z*(1-t)+i.mv3d_sprite.z*t:e.mv3d_sprite&&(this.cameraStick.z=e.mv3d_sprite.z)}else if(this.cameraTargets.length){let t=this.getCameraTarget();this.cameraStick.x=t._realX,this.cameraStick.y=t._realY,t.mv3d_sprite&&(this.cameraStick.z=t.mv3d_sprite.z)}if(this.blendPanX.update(),this.blendPanY.update(),this.cameraStick.x+=this.blendPanX.currentValue(),this.cameraStick.y+=this.blendPanY.currentValue(),t|this.blendCameraPitch.update()|this.blendCameraYaw.update()|this.blendCameraDist.update()|this.blendCameraHeight.update()|0!==$gameScreen._shake){if(this.cameraNode.pitch=this.blendCameraPitch.currentValue()-90,this.cameraNode.yaw=this.blendCameraYaw.currentValue(),this.cameraNode.position.set(0,0,0),this.cameraNode.translate(_.d,-this.blendCameraDist.currentValue(),s.h),this.camera.mode===s.l){const t=this.getFieldSize();this.camera.orthoLeft=-t.width/2,this.camera.orthoRight=t.width/2,this.camera.orthoTop=t.height/2,this.camera.orthoBottom=-t.height/2}else this.cameraNode.z<0&&(this.cameraNode.z=0);this.cameraNode.z+=this.blendCameraHeight.currentValue(),this.cameraNode.translate(_.b,-$gameScreen._shake/48,s.h)}t|this.blendFogColor.update()|this.blendFogNear.update()|this.blendFogFar.update()&&(a.a.featureEnabled("alphaFog")?(this.scene.fogStart=this.blendFogNear.currentValue(),this.scene.fogEnd=this.blendFogFar.currentValue()):(this.scene.fogStart=Math.min(a.a.RENDER_DIST-1,this.blendFogNear.currentValue()),this.scene.fogEnd=Math.min(a.a.RENDER_DIST,this.blendFogFar.currentValue())),this.scene.fogColor.copyFromFloats(this.blendFogColor.r.currentValue()/255,this.blendFogColor.g.currentValue()/255,this.blendFogColor.b.currentValue()/255)),t|this.blendAmbientColor.update()&&this.scene.ambientColor.copyFromFloats(this.blendAmbientColor.r.currentValue()/255,this.blendAmbientColor.g.currentValue()/255,this.blendAmbientColor.b.currentValue()/255),this.callFeatures("blend",t)}});class blenders_Blender{constructor(t,e){this.key=t,this.dfault=a.a.loadData(t,e),this.value=e,this.speed=1,this.max=1/0,this.min=-1/0,this.cycle=!1}setValue(t,e=0){let i=(t=Math.min(this.max,Math.max(this.min,t)))-this.value;if(i){if(this.saveValue(this.key,t),this.cycle)for(;Math.abs(i)>this.cycle/2;)this.value+=Math.sign(i)*this.cycle,i=t-this.value;this.speed=Math.abs(i)/(60*e)}}currentValue(){return this.value}targetValue(){return this.loadValue(this.key)}defaultValue(){return this.dfault}update(){const t=this.targetValue();if(this.value===t)return!1;const e=t-this.value;return this.speed>Math.abs(e)?this.value=t:this.value+=this.speed*Math.sign(e),!0}storageLocation(){return $gameVariables?($gameVariables.mv3d||($gameVariables.mv3d={}),$gameVariables.mv3d):(console.warn("MV3D: Couldn't get Blend storage location."),{})}loadValue(t){const e=this.storageLocation();return t in e?e[t]:this.dfault}saveValue(t,e){this.storageLocation()[t]=e}}class ColorBlender{constructor(t,e){this.dfault=e,this.r=new blenders_Blender(`${t}_r`,e>>16),this.g=new blenders_Blender(`${t}_g`,e>>8&255),this.b=new blenders_Blender(`${t}_b`,255&e)}setValue(t,e){this.r.setValue(t>>16,e),this.g.setValue(t>>8&255,e),this.b.setValue(255&t,e)}currentValue(){return this.r.value<<16|this.g.value<<8|this.b.value}targetValue(){return this.r.targetValue()<<16|this.g.targetValue()<<8|this.b.targetValue()}defaultValue(){return this.dfault}update(){let t=0;return t|=this.r.update(),t|=this.g.update(),t|=this.b.update(),Boolean(t)}get storageLocation(){return this.r.storageLocation}set storageLocation(t){this.r.storageLocation=t,this.g.storageLocation=t,this.b.storageLocation=t}currentComponents(){return[this.r.currentValue()/255,this.g.currentValue()/255,this.b.currentValue()/255]}targetComponents(){return[this.r.targetValue()/255,this.g.targetValue()/255,this.b.targetValue()/255]}}function T(t,e,i){let s=void 0;return{configurable:!0,get:()=>null!=s?s:SceneManager._scene instanceof Scene_Map?a.a.isDisabled()?e:a.a.is1stPerson()?i:e:t,set(t){s=t}}}a.a.Blender=blenders_Blender,a.a.ColorBlender=ColorBlender,a.a.blendModes={[PIXI.BLEND_MODES.NORMAL]:BABYLON.Engine.ALPHA_COMBINE,[PIXI.BLEND_MODES.ADD]:BABYLON.Engine.ALPHA_ADD,[PIXI.BLEND_MODES.MULTIPLY]:BABYLON.Engine.ALPHA_MULTIPLY,[PIXI.BLEND_MODES.SCREEN]:BABYLON.Engine.ALPHA_SCREENMODE},Object.assign(Input.keyMapper,{81:"rotleft",69:"rotright",87:"up",65:"left",83:"down",68:"right"}),a.a.setupInput=function(){const t={left:T("left","left","rotleft"),rotleft:T("pageup","rotleft",a.a.KEYBOARD_STRAFE?"left":void 0),right:T("right","right","rotright"),rotright:T("pagedown","rotright",a.a.KEYBOARD_STRAFE?"right":void 0)};Object.defineProperties(Input.keyMapper,{37:t.left,39:t.right,81:t.rotleft,69:t.rotright,65:t.left,68:t.right})};const C=Game_Player.prototype.getInputDirection;Game_Player.prototype.getInputDirection=function(){if(a.a.isDisabled())return C.apply(this,arguments);let t=Input.dir4;return a.a.transformDirectionYaw(t,a.a.blendCameraYaw.currentValue(),!0)};const y=Game_Player.prototype.updateMove;Game_Player.prototype.updateMove=function(){y.apply(this,arguments),a.a.isDisabled()||!this.isMoving()&&a.a.is1stPerson()&&a.a.playerFaceYaw()};const S=Game_Player.prototype.moveStraight;Game_Player.prototype.moveStraight=function(t){S.apply(this,arguments),a.a.isDisabled()||!this.isMovementSucceeded()&&a.a.is1stPerson()&&a.a.playerFaceYaw()};const M=t=>!!(t.isEnabled()&&t.isVisible&&t.isPickable)&&(!t.character||!t.character.isFollower&&!t.character.isPlayer),E=Scene_Map.prototype.processMapTouch;Scene_Map.prototype.processMapTouch=function(){if(a.a.isDisabled())return E.apply(this,arguments);if(TouchInput.isTriggered()||this._touchCount>0)if(TouchInput.isPressed()){if(0===this._touchCount||this._touchCount>=15){const t=a.a.scene.pick(TouchInput.x,TouchInput.y,M);if(t.hit){const e={x:t.pickedPoint.x,y:-t.pickedPoint.z},i=t.pickedMesh;i.character&&(e.x=i.character.x,e.y=i.character.y),$gameTemp.setDestination(Math.round(e.x),Math.round(e.y))}}this._touchCount++}else this._touchCount=0};const v=Game_Player.prototype.findDirectionTo;Game_Player.prototype.findDirectionTo=function(){const t=v.apply(this,arguments);if(a.a.isDisabled())return t;if(a.a.is1stPerson()&&t){let e=a.a.dirToYaw(t);a.a.blendCameraYaw.setValue(e,.25)}return t};class ConfigurationFunction{constructor(t,e){this.groups=t.match(/\[?[^[\]|]+\]?/g),this.labels={};for(let t=0;t<this.groups.length;++t){for(;this.groups[t]&&"["===this.groups[t][0];)this.labels[this.groups[t].slice(1,-1)]=t,this.groups.splice(t,1);if(t>this.groups.length)break;this.groups[t]=this.groups[t].split(",").map(t=>t.trim())}this.func=e}run(t,e){const i=/([,|]+)? *(?:(\w+) *: *)?([^,|\r\n]+)/g;let a,s=0,r=0;const n={};for(let t=0;t<this.groups.length;++t)n[`group${t+1}`]=[];for(;a=i.exec(e);){if(a[1])for(const t of a[1])","===t&&++s,("|"===t||s>=this.groups[r].length)&&(s=0,++r);if(a[2])if(a[2]in this.labels)r=this.labels[a[2]];else{let t=!1;t:for(let e=0;e<this.groups.length;++e)for(let i=0;i<this.groups[e].length;++i)if(this.groups[e][i]===a[2]){t=!0,r=e,s=i;break t}if(!t)break}if(r>this.groups.length)break;n[this.groups[r][s]]=n[`group${r+1}`][s]=a[3].trim()}this.func(t,n)}}function O(t,e=""){return new ConfigurationFunction(`img,x,y,w,h|${e}|alpha|glow[anim]animx,animy`,(function(e,i){if(5===i.group1.length){const[s,r,n,o,h]=i.group1;e[`${t}_id`]=a.a.constructTileId(s,0,0),e[`${t}_rect`]=new PIXI.Rectangle(r,n,o,h)}else if(3===i.group1.length){const[s,r,n]=i.group1;e[`${t}_id`]=a.a.constructTileId(s,r,n)}else if(2===i.group1.length){const[a,r]=i.group1;e[`${t}_offset`]=new s.w(Number(a),Number(r))}i.animx&&i.animy&&(e[`${t}_animData`]={animX:Number(i.animx),animY:Number(i.animy)}),i.height&&(e[`${t}_height`]=Number(i.height)),i.alpha&&(e[`${t}_alpha`]=Number(i.alpha)),i.glow&&(e[`${t}_glow`]=Number(i.glow))}))}a.a.ConfigurationFunction=ConfigurationFunction,Object.assign(a.a,{tilesetConfigurations:{},loadTilesetSettings(){this.tilesetConfigurations={};const t=this.readConfigurationBlocks($gameMap.tileset().note),e=/^\s*([abcde]\d?)\s*,\s*(\d+(?:-\d+)?)\s*,\s*(\d+(?:-\d+)?)\s*:(.*)$/gim;let i;for(;i=e.exec(t);){const t=this.readConfigurationFunctions(i[4],this.tilesetConfigurationFunctions),e=i[2].split("-").map(t=>Number(t)),a=i[3].split("-").map(t=>Number(t));for(let s=e[0];s<=e[e.length-1];++s)for(let e=a[0];e<=a[a.length-1];++e){const a=`${i[1]},${s},${e}`,r=this.constructTileId(...a.split(","));r in this.tilesetConfigurations||(this.tilesetConfigurations[r]={}),Object.assign(this.tilesetConfigurations[r],t)}}},mapConfigurations:{},loadMapSettings(){const t=this.mapConfigurations={};this.readConfigurationFunctions(this.readConfigurationBlocks($dataMap.note),this.mapConfigurationFunctions,t)},applyMapSettings(){const t=this.mapConfigurations;if("fog"in t){const e=t.fog;"color"in e&&this.blendFogColor.setValue(e.color,0),"near"in e&&this.blendFogNear.setValue(e.near,0),"far"in e&&this.blendFogFar.setValue(e.far,0)}"light"in t&&this.blendAmbientColor.setValue(t.light.color,0),"cameraDist"in t&&this.blendCameraDist.setValue(t.cameraDist,0),"cameraHeight"in t&&this.blendCameraHeight.setValue(t.cameraHeight,0),"cameraMode"in t&&(this.cameraMode=t.cameraMode),"cameraPitch"in t&&this.blendCameraPitch.setValue(t.cameraPitch,0),"cameraYaw"in t&&this.blendCameraYaw.setValue(t.cameraYaw,0),$gameMap.parallaxName()?a.a.scene.clearColor.set(0,0,0,0):a.a.scene.clearColor.set(...a.a.blendFogColor.currentComponents(),1),this.callFeatures("applyMapSettings",t)},getMapConfig(t,e){return t in this.mapConfigurations?this.mapConfigurations[t]:e},getCeilingConfig(){let t={};for(const e in this.mapConfigurations)e.startsWith("ceiling_")&&(t[e.replace("ceiling_","bottom_")]=this.mapConfigurations[e]);return t.bottom_id=this.getMapConfig("ceiling_id",0),t.height=this.getMapConfig("ceiling_height",this.CEILING_HEIGHT),t.skylight=this.getMapConfig("ceiling_skylight",!1),t},readConfigurationBlocks(t){const e=/<MV3D>([\s\S]*?)<\/MV3D>/gi;let i,a="";for(;i=e.exec(t);)a+=i[1]+"\n";return a},readConfigurationTags(t){const e=/<MV3D:([\s\S]*?)>/gi;let i,a="";for(;i=e.exec(t);)a+=i[1]+"\n";return a},readConfigurationFunctions(t,e=a.a.configurationFunctions,i={}){const s=/(\w+)\((.*?)\)/g;let r;for(;r=s.exec(t);){const t=r[1].toLowerCase();if(t in e)if(e[t]instanceof ConfigurationFunction)e[t].run(i,r[2]);else{const a=r[2].split(",");1===a.length&&""===a[0]&&(a.length=0),e[t](i,...a)}}return i},configurationSides:{front:s.f,back:s.a,double:s.c},configurationShapes:{FLAT:1,TREE:2,SPRITE:3,FENCE:4,WALL:4,CROSS:5,XCROSS:6,SLOPE:7},configurationPassage:{WALL:0,FLOOR:1,THROUGH:2},tilesetConfigurationFunctions:{height(t,e){t.height=Number(e)},depth(t,e){t.depth=Number(e)},fringe(t,e){t.fringe=Number(e)},float(t,e){t.float=Number(e)},slope(t,e=1,i=null){t.shape=a.a.configurationShapes.SLOPE,t.slopeHeight=Number(e),i&&(t.slopeDirection={n:2,s:8,e:4,w:6}[i.toLowerCase()[0]])},top:O("top"),side:O("side"),inside:O("inside"),bottom:O("bottom"),texture:Object.assign(O("hybrid"),{func(t,e){a.a.tilesetConfigurationFunctions.top.func(t,e),a.a.tilesetConfigurationFunctions.side.func(t,e)}}),shape(t,e){t.shape=a.a.configurationShapes[e.toUpperCase()]},alpha(t,e){t.transparent=!0,t.alpha=Number(e)},glow(t,e){t.glow=Number(e)},pass(t,e=""){(e=Object(_.j)(e.toLowerCase()))&&"x"!==e[0]?"o"===e[0]?t.pass=a.a.configurationPassage.FLOOR:t.pass=a.a.configurationPassage.THROUGH:t.pass=a.a.configurationPassage.WALL}},eventConfigurationFunctions:{height(t,e){t.height=Number(e)},z(t,e){t.z=Number(e)},x(t,e){t.x=Number(e)},y(t,e){t.y=Number(e)},scale(t,e,i=e){t.scale=new s.w(Number(e),Number(i))},rot(t,e){t.rot=Number(e)},yaw(t,e){t.yaw=Number(e)},pitch(t,e){t.pitch=Number(e)},bush(t,e){t.bush=Object(_.f)(e)},shadow(t,e,i){t.shadow=Object(_.e)(e),null!=i&&(t.shadowDist=Number(i))},shape(t,e){t.shape=a.a.configurationShapes[e.toUpperCase()]},pos(t,e,i){t.pos={x:e,y:i}},lamp:new ConfigurationFunction("color,intensity,range",(function(t,e){const{color:i="white",intensity:s=1,range:r=a.a.LIGHT_DIST}=e;t.lamp={color:Object(_.k)(i).toNumber(),intensity:Number(s),distance:Number(r)}})),flashlight:new ConfigurationFunction("color,intensity,range,angle[dir]yaw,pitch",(function(t,e){const{color:i="white",intensity:s=1,range:r=a.a.LIGHT_DIST,angle:n=a.a.LIGHT_ANGLE}=e;t.flashlight={color:Object(_.k)(i).toNumber(),intensity:Number(s),distance:Number(r),angle:Number(n)},e.yaw&&(t.flashlightYaw=e.yaw),e.pitch&&(t.flashlightPitch=Number(e.pitch))})),flashlightpitch(t,e="90"){t.flashlightPitch=Number(e)},flashlightyaw(t,e="+0"){t.flashlightYaw=e},lightheight(t,e=1){t.lightHeight=Number(e)},lightoffset(t,e=0,i=0){t.lightOffset={x:+e,y:+i}},alpha(t,e){t.alpha=Number(e)},glow(t,e){t.glow=Number(e)},dirfix(t,e){t.dirfix=Object(_.f)(e)},gravity(t,e){t.gravity=Object(_.e)(e)},platform(t,e){t.platform=Object(_.f)(e)},collide(t,e){t.collide=Object(_.e)(e)},trigger(t,e,i=0){t.trigger={up:Number(e),down:Number(i)}},pass(t,e=""){(e=Object(_.j)(e.toLowerCase()))&&"x"!==e[0]?"o"===e[0]?t.platform=!0:(t.platform=!1,t.collide=!1):(t.platform=!1,t.collide=!0)}},mapConfigurationFunctions:{get ambient(){return this.light},light(t,e){e="default"===e.toLowerCase()?a.a.AMBIENT_COLOR:Object(_.k)(e).toNumber(),t.light={color:e}},fog:new ConfigurationFunction("color|near,far",(function(t,e){const{color:i,near:a,far:s}=e;t.fog||(t.fog={}),i&&(t.fog.color=Object(_.k)(i).toNumber()),a&&(t.fog.near=Number(a)),s&&(t.fog.far=Number(s))})),camera:new ConfigurationFunction("yaw,pitch|dist|height|mode",(function(t,e){const{yaw:i,pitch:a,dist:s,height:r,mode:n}=e;i&&(t.cameraYaw=Number(i)),a&&(t.cameraPitch=Number(a)),s&&(t.cameraDist=Number(s)),r&&(t.cameraHeight=Number(r)),n&&(t.cameraMode=n)})),ceiling:O("ceiling","height,skylight"),edge(t,e){t.edge=Object(_.f)(e)},disable(t,e=!0){t.disabled=Object(_.f)(e)},enable(t,e=!0){t.disabled=!Object(_.f)(e)}}});const I=Game_Event.prototype.setupPage;Game_Event.prototype.setupPage=function(){I.apply(this,arguments),this.mv3d_sprite&&(this.mv3d_needsConfigure=!0,this.mv3d_sprite.eventConfigure())};const w=Game_Event.prototype.initialize;Game_Event.prototype.initialize=function(){w.apply(this,arguments),a.a.mapLoaded&&a.a.createCharacterFor(this);const t=this.event();let e={};a.a.readConfigurationFunctions(a.a.readConfigurationTags(t.note),a.a.eventConfigurationFunctions,e),"pos"in e&&this.locate(Object(_.o)(t.x,e.pos.x),Object(_.o)(t.y,e.pos.y)),this.mv3d_blenders||(this.mv3d_blenders={}),"lamp"in e&&(this.mv3d_blenders.lampColor_r=e.lamp.color>>16,this.mv3d_blenders.lampColor_g=e.lamp.color>>8&255,this.mv3d_blenders.lampColor_b=255&e.lamp.color,this.mv3d_blenders.lampIntensity=e.lamp.intensity,this.mv3d_blenders.lampDistance=e.lamp.distance),"flashlight"in e&&(this.mv3d_blenders.flashlightColor_r=e.flashlight.color>>16,this.mv3d_blenders.flashlightColor_g=e.flashlight.color>>8&255,this.mv3d_blenders.flashlightColor_b=255&e.flashlight.color,this.mv3d_blenders.flashlightIntensity=e.flashlight.intensity,this.mv3d_blenders.flashlightDistance=e.flashlight.distance,this.mv3d_blenders.flashlightAngle=e.flashlight.angle),"flashlightPitch"in e&&(this.mv3d_blenders.flashlightPitch=Number(e.flashlightPitch)),"flashlightYaw"in e&&(this.mv3d_blenders.flashlightYaw=e.flashlightYaw),this.mv3d_needsConfigure=!0};const L=Game_Interpreter.prototype.pluginCommand;Game_Interpreter.prototype.pluginCommand=function(t,e){if("mv3d"!==t.toLowerCase())return L.apply(this,arguments);const i=new a.a.PluginCommand;if(i.INTERPRETER=this,i.FULL_COMMAND=[t,...e].join(" "),e=e.filter(t=>t),i.CHAR=$gameMap.event(this._eventId),e[0]){const t=e[0][0];"@"!==t&&"＠"!==t||(i.CHAR=i.TARGET_CHAR(e.shift()))}const s=e.shift().toLowerCase();s in i&&i[s](...e)},a.a.PluginCommand=class{async camera(...t){var e=this._TIME(t[2]);switch(t[0].toLowerCase()){case"pitch":return void this.pitch(t[1],e);case"yaw":return void this.yaw(t[1],e);case"dist":case"distance":return void this.dist(t[1],e);case"height":return void this.height(t[1],e);case"mode":return void this.cameramode(t[1]);case"target":return void this._cameraTarget(t[1],e);case"pan":return void this.pan(t[1],t[2],t[3])}}yaw(t,e=1){this._RELATIVE_BLEND(a.a.blendCameraYaw,t,e),a.a.is1stPerson()&&a.a.playerFaceYaw()}pitch(t,e=1){this._RELATIVE_BLEND(a.a.blendCameraPitch,t,e)}dist(t,e=1){this._RELATIVE_BLEND(a.a.blendCameraDist,t,e)}height(t,e=1){this._RELATIVE_BLEND(a.a.blendCameraHeight,t,e)}_cameraTarget(t,e){a.a.setCameraTarget(this.TARGET_CHAR(t),e)}pan(t,e,i=1){console.log(t,e,i),i=this._TIME(i),this._RELATIVE_BLEND(a.a.blendPanX,t,i),this._RELATIVE_BLEND(a.a.blendPanY,e,i)}get rotationmode(){return this.allowrotation}get pitchmode(){return this.allowpitch}allowrotation(t){a.a.saveData("allowRotation",Object(_.f)(t))}allowpitch(t){a.a.saveData("allowPitch",Object(_.f)(t))}lockcamera(t){a.a.saveData("cameraLocked",Object(_.f)(t))}_VEHICLE(t,e,i){e=e.toLowerCase();const s=`${Vehicle}_${e}`;i="big"===e?Object(_.f)(i):Object(_.o)(a.a.loadData(s,0),i),a.a.saveData(s,i)}boat(t,e){this._VEHICLE("boat",t,e)}ship(t,e){this._VEHICLE("ship",t,e)}airship(t,e){this._VEHICLE("airship",t,e)}cameramode(t){a.a.cameraMode=t}fog(...t){var e=this._TIME(t[2]);switch(t[0].toLowerCase()){case"color":return void this._fogColor(t[1],e);case"near":return void this._fogNear(t[1],e);case"far":return void this._fogFar(t[1],e);case"dist":case"distance":return e=this._TIME(t[3]),this._fogNear(t[1],e),void this._fogFar(t[2],e)}e=this._TIME(t[3]),this._fogColor(t[0],e),this._fogNear(t[1],e),this._fogFar(t[2],e)}_fogColor(t,e){a.a.blendFogColor.setValue(Object(_.k)(t).toNumber(),e)}_fogNear(t,e){this._RELATIVE_BLEND(a.a.blendFogNear,t,e)}_fogFar(t,e){this._RELATIVE_BLEND(a.a.blendFogFar,t,e)}get ambient(){return this.light}light(...t){var e=this._TIME(t[2]);switch(t[0].toLowerCase()){case"color":return void this._lightColor(t[1],e)}e=this._TIME(t[1]),this._lightColor(t[0],e)}_lightColor(t,e=1){a.a.blendAmbientColor.setValue(Object(_.k)(t).toNumber(),e)}async lamp(...t){const e=await this.AWAIT_CHAR(this.CHAR);e.setupLamp();var i=this._TIME(t[2]);switch(t[0].toLowerCase()){case"color":return void this._lampColor(e,t[1],i);case"intensity":return void this._lampIntensity(e,t[1],i);case"dist":case"distance":return void this._lampDistance(e,t[1],i)}i=this._TIME(t[3]),this._lampColor(e,t[0],i),this._lampIntensity(e,t[1],i),this._lampDistance(e,t[2],i)}_lampColor(t,e,i=1){t.blendLampColor.setValue(Object(_.k)(e).toNumber(),i)}_lampIntensity(t,e,i=1){this._RELATIVE_BLEND(t.blendLampIntensity,e,i)}_lampDistance(t,e,i=1){this._RELATIVE_BLEND(t.blendLampDistance,e,i)}async flashlight(...t){const e=await this.AWAIT_CHAR(this.CHAR);e.setupFlashlight();var i=this._TIME(t[2]);switch(t[0].toLowerCase()){case"color":return void this._flashlightColor(e,t[1],i);case"intensity":return void this._flashlightIntensity(e,t[1],i);case"dist":case"distance":return void this._flashlightDistance(e,t[1],i);case"angle":return void this._flashlightAngle(e,t[1],i);case"yaw":return void this._flashlightYaw(e,t[1],i);case"pitch":return void this._flashlightPitch(e,t[1],i)}i=this._TIME(t[4]),this._flashlightColor(e,t[0],i),this._flashlightIntensity(e,t[1],i),this._flashlightDistance(e,t[2],i),this._flashlightAngle(e,t[3],i)}_flashlightColor(t,e,i){t.blendFlashlightColor.setValue(Object(_.k)(e).toNumber(),i)}_flashlightIntensity(t,e,i){this._RELATIVE_BLEND(t.blendFlashlightIntensity,e,i)}_flashlightDistance(t,e,i){this._RELATIVE_BLEND(t.blendFlashlightDistance,e,i)}_flashlightAngle(t,e,i){this._RELATIVE_BLEND(t.blendFlashlightAngle,e,i)}_flashlightPitch(t,e,i){this._RELATIVE_BLEND(t.blendFlashlightPitch,e,i)}_flashlightYaw(t,e,i){t.flashlightTargetYaw=e}async elevation(...t){const e=await this.AWAIT_CHAR(this.CHAR);let i=this._TIME(t[1]);this._RELATIVE_BLEND(e.blendElevation,t[0],i)}disable(t){a.a.disable(t)}enable(t){a.a.enable(t)}_RELATIVE_BLEND(t,e,i){t.setValue(Object(_.o)(t.targetValue(),e),Number(i))}_TIME(t){return"number"==typeof t?t:(t=Number(t),Number.isNaN(t)?1:t)}ERROR_CHAR(){console.warn(`MV3D: Plugin command \`${this.FULL_COMMAND}\` failed because target character was invalid.`)}async AWAIT_CHAR(t){if(!t)return this.ERROR_CHAR();let e=0;for(;!t.mv3d_sprite;)if(await sleep(100),++e>10)return this.ERROR_CHAR();return t.mv3d_sprite}TARGET_CHAR(t){return a.a.targetChar(t,$gameMap.event(this.INTERPRETER._eventId),this.CHAR)}},a.a.targetChar=function(t,e=null,i=null){if(!t)return i;let a=t.toLowerCase().match(/[a-z]+/);const s=a?a[0]:"e",r=(a=t.match(/\d+/))?Number(a[0]):0;switch(s[0]){case"s":return e;case"p":return $gamePlayer;case"e":return r?$gameMap.event(r):e;case"v":return $gameMap.vehicle(r);case"f":return $gamePlayer.followers()._data[r]}return char},a.a.getTargetString=function(t){return t instanceof Game_Player?"@p":t instanceof Game_Event?`@e${t._eventId}`:t instanceof Game_Follower?`@f${$gamePlayer._followers._data.indexOf(t)}`:t instanceof Game_Vehicle?`@v${$gameMap._vehicles.indexOf(t)}`:void 0};class MapCellBuilder_CellMeshBuilder{constructor(){this.submeshBuilders={}}build(){const t=Object.values(this.submeshBuilders);if(!t.length)return null;const e=t.map(t=>t.build()),i=e.reduce((t,e)=>("number"!=typeof t&&(t=t.getTotalVertices()),t+e.getTotalVertices()));return s.i.MergeMeshes(e,!0,i>65536,void 0,!1,!0)}getBuilder(t){return t.name in this.submeshBuilders||(this.submeshBuilders[t.name]=new MapCellBuilder_SubMeshBuilder(t)),this.submeshBuilders[t.name]}addWallFace(t,e,i,a,s,r,n,o,h,l,c,p={}){const u=this.getBuilder(t),d=MapCellBuilder_SubMeshBuilder.getUvRect(t.diffuseTexture,e,i,a,s);u.addWallFace(r,n,o,h,l,c,d,p),p.double&&(p.flip=!p.flip,u.addWallFace(r,n,o,h,l,c,d,p))}addFloorFace(t,e,i,a,s,r,n,o,h,l,c={}){const p=this.getBuilder(t),u=MapCellBuilder_SubMeshBuilder.getUvRect(t.diffuseTexture,e,i,a,s);p.addFloorFace(r,n,o,h,l,u,c),c.double&&(c.flip=!c.flip,p.addFloorFace(r,n,o,h,l,u,c))}addSlopeFace(t,e,i,a,s,r,n,o,h,l,c,p={}){const u=this.getBuilder(t),d=MapCellBuilder_SubMeshBuilder.getUvRect(t.diffuseTexture,e,i,a,s);u.addSlopeFace(r,n,o,h,l,c,d,p),p.double&&(p.flip=!p.flip,u.addSlopeFace(r,n,o,h,l,c,d,p))}addSlopeSide(t,e,i,a,s,r,n,o,h,l,c,p={}){const u=this.getBuilder(t),d=MapCellBuilder_SubMeshBuilder.getUvRect(t.diffuseTexture,e,i,a,s);u.addSlopeSide(r,n,o,h,l,c,d,p),p.double&&(p.flip=!p.flip,u.addSlopeSide(r,n,o,h,l,c,d,p))}}class MapCellBuilder_SubMeshBuilder{constructor(t){this.material=t,this.positions=[],this.indices=[],this.normals=[],this.uvs=[]}build(){const t=new s.i("cell mesh",a.a.scene),e=new s.y;return e.positions=this.positions,e.indices=this.indices,e.normals=this.normals,e.uvs=this.uvs,e.applyToMesh(t),t.material=this.material,t}addWallFace(t,e,i,a,s,r,n,o){e=-e,i=i;const h=Object(_.g)(r),l=Object(_.p)(r),c=a/2,p=s/2,u=[t-c*h,i+p,e+c*l,t+c*h,i+p,e-c*l,t-c*h,i-p,e+c*l,t+c*h,i-p,e-c*l];let d=[-l,0,-h,-l,0,-h,-l,0,-h,-l,0,-h];const g=MapCellBuilder_SubMeshBuilder.getDefaultUvs(n),m=MapCellBuilder_SubMeshBuilder.getDefaultIndices();o.flip&&MapCellBuilder_SubMeshBuilder.flipFace(m,d),o.abnormal&&(d=[0,1,0,0,1,0,0,1,0,0,1,0]),this.pushNewData(u,m,d,g)}addFloorFace(t,e,i,a,s,r,n){const o=a/2,h=s/2,l=[t-o,i=i,(e=-e)+h,t+o,i,e+h,t-o,i,e-h,t+o,i,e-h],c=[0,1,0,0,1,0,0,1,0,0,1,0],p=MapCellBuilder_SubMeshBuilder.getDefaultUvs(r),u=MapCellBuilder_SubMeshBuilder.getDefaultIndices();n.flip&&MapCellBuilder_SubMeshBuilder.flipFace(u,c),this.pushNewData(l,u,c,p)}addSlopeFace(t,e,i,a,s,r,n,o){e=-e,i=i;const h=Object(_.g)(r),l=Object(_.p)(r),c=a/2,p=s/2,u=o.autotile?[t-c,i+p+p*Math.round(Object(_.p)(-r+1*_.a/4)),e+p,t+c,i+p+p*Math.round(Object(_.p)(-r+3*_.a/4)),e+p,t-c,i+p+p*Math.round(Object(_.p)(-r+7*_.a/4)),e-p,t+c,i+p+p*Math.round(Object(_.p)(-r+5*_.a/4)),e-p]:[t-c*h+c*l,i+s,e+c*l+c*h,t+c*h+c*l,i+s,e-c*l+c*h,t-c*h-c*l,i,e+c*l-c*h,t+c*h-c*l,i,e-c*l-c*h],d=Math.pow(2,-s),g=1-d,m=[-l*g,d,-h*g,-l*g,d,-h*g,-l*g,d,-h*g,-l*g,d,-h*g];let f=MapCellBuilder_SubMeshBuilder.getDefaultUvs(n);const b=MapCellBuilder_SubMeshBuilder.getDefaultIndices();o.flip&&MapCellBuilder_SubMeshBuilder.flipFace(b,m),this.pushNewData(u,b,m,f)}addSlopeSide(t,e,i,a,s,r,n,o){e=-e,i=i;const h=Object(_.g)(r),l=Object(_.p)(r),c=a/2,p=[t-c*h,i+s,e+c*l,t-c*h,i,e+c*l,t+c*h,i,e-c*l],u=[-l,0,-h,-l,0,-h,-l,0,-h],d=[n.x1,n.y1,n.x1,n.y2,n.x2,n.y2],g=[0,1,2];o.flip&&MapCellBuilder_SubMeshBuilder.flipFace(g,u),this.pushNewData(p,g,u,d)}pushNewData(t,e,i,a){this.indices.push(...e.map(t=>t+this.positions.length/3)),this.positions.push(...t),this.normals.push(...i),this.uvs.push(...a)}static getUvRect(t,e,i,s,r){const{width:n,height:o}=t.getBaseSize();return a.a.EDGE_FIX&&(e+=a.a.EDGE_FIX,i+=a.a.EDGE_FIX,s-=2*a.a.EDGE_FIX,r-=2*a.a.EDGE_FIX),{x1:e/n,y1:(o-i)/o,x2:(e+s)/n,y2:(o-i-r)/o}}static getDefaultUvs(t){return[t.x1,t.y1,t.x2,t.y1,t.x1,t.y2,t.x2,t.y2]}static getDefaultIndices(){return[1,0,2,1,2,3]}static flipFace(t,e){t.reverse();for(let t=0;t<e.length;++t)e[t]*=-1}}new s.n(0,1,-Math.pow(.1,100),0),new s.n(0,0,-1,0);class mapCell_MapCell extends s.v{constructor(t,e){const i=[t,e].toString();super(`MapCell[${i}]`,a.a.scene),this.parent=a.a.map,this.cx=t,this.cy=e,this.ox=t*a.a.CELL_SIZE,this.oy=e*a.a.CELL_SIZE,this.x=this.ox,this.y=this.oy,this.key=i}update(){const t=a.a.loopCoords((this.cx+.5)*a.a.CELL_SIZE,(this.cy+.5)*a.a.CELL_SIZE);this.x=t.x-a.a.CELL_SIZE/2,this.y=t.y-a.a.CELL_SIZE/2}async load(){const t=a.a.configurationShapes;this.builder=new MapCellBuilder_CellMeshBuilder;const e=Math.min(a.a.CELL_SIZE,$gameMap.width()-this.cx*a.a.CELL_SIZE),i=Math.min(a.a.CELL_SIZE,$gameMap.height()-this.cy*a.a.CELL_SIZE),s=a.a.getCeilingConfig();for(let r=0;r<i;++r)for(let i=0;i<e;++i){s.cull=!1;let e=!1;const n=a.a.getTileData(this.ox+i,this.oy+r);let o=1/0;for(let h=3;h>=0;--h){if(a.a.isTileEmpty(n[h]))continue;let l=a.a.getStackHeight(this.ox+i,this.oy+r,h);const c=a.a.getTileTextureOffsets(n[h],this.ox+i,this.oy+r,h),p=c.shape;a.a.isSpecialShape(p)&&(e=!0),c.realId=n[h];let u=a.a.getTileHeight(this.ox+i,this.oy+r,h)||c.height||0,d=!1;if(o<l&&(d=!0),a.a.getTileFringe(this.ox+i,this.oy+r,h)||(o=l),!p||p===t.FLAT||p===t.SLOPE){const n=u||0===h;if(p&&p!==t.FLAT){if(p===t.SLOPE){const t=c.slopeHeight||1;u-=t,await this.loadSlope(c,i,r,l,h,t),(u||0===h)&&await this.loadWalls(c,i,r,l-t,h,u)}}else d||await this.loadTile(c,i,r,l+h*a.a.LAYER_DIST*!n,h),(u||0===h)&&await this.loadWalls(c,i,r,l,h,u);(u>0&&e||c.fringe>0)&&await this.loadTile(c,i,r,l-u,h,!0),l>=s.height&&(s.cull=!0)}p===t.FENCE?await this.loadFence(c,i,r,l,h,u):p!==t.CROSS&&p!==t.XCROSS||await this.loadCross(c,i,r,l,h,u)}a.a.isTileEmpty(s.bottom_id)||s.cull||await this.loadTile(s,i,r,s.height,0,!0,!s.skylight)}this.mesh=this.builder.build(),this.mesh&&(this.mesh.parent=this,this.mesh.alphaIndex=0,a.a.callFeatures("createCellMesh",this.mesh)),delete this.builder}dispose(){super.dispose(...arguments),this.mesh&&a.a.callFeatures("destroyCellMesh",this.mesh)}async loadTile(t,e,i,s,r,n=!1,o=!1){const h=n?t.bottom_id:t.top_id;if(a.a.isTileEmpty(h))return;const l=n?t.bottom_rect:t.top_rect,c=Tilemap.isAutotile(h)&&!l;let p;p=l?[l]:a.a.getTileRects(h);const u=await a.a.getCachedTilesetMaterialForTile(t,n?"bottom":"top");for(const t of p)this.builder.addFloorFace(u,t.x,t.y,t.width,t.height,e+(0|t.ox)/Object(_.s)()-.25*c,i+(0|t.oy)/Object(_.s)()-.25*c,s,1-c/2,1-c/2,{flip:n,double:o})}async loadWalls(t,e,i,a,s,r){for(const n of mapCell_MapCell.neighborPositions)await this.loadWall(t,e,i,a,s,r,n)}async loadWall(t,e,i,r,n,o,h){const l=a.a.isFringeTile(t.realId)||t.fringe>0;if(!a.a.getMapConfig("edge",!0)&&((this.ox+e+h.x>=$dataMap.width||this.ox+e+h.x<0)&&!$gameMap.isLoopHorizontal()||(this.oy+i+h.y>=$dataMap.height||this.oy+i+h.y<0)&&!$gameMap.isLoopVertical()))return;let c,p=o,u=t.side_id,d="side";if(a.a.isTileEmpty(u))return;if((p=r-a.a.getCullingHeight(this.ox+e+h.x,this.oy+i+h.y,t.depth>0?3:n,!(t.depth>0)))>0&&(n>0||l)&&(p=Math.min(o,p)),t.depth>0&&p<0){if(a.a.tileHasPit(this.ox+e+h.x,this.oy+i+h.y,n))return;p=Math.max(p,-t.depth),t.hasInsideConf&&(d="inside")}else if(p<=0)return;"inside"===d?(u=t.inside_id,t.inside_rect&&(c=t.inside_rect)):t.side_rect&&(c=t.side_rect);const g=await a.a.getCachedTilesetMaterialForTile(t,d),m=new s.x(e+h.x/2,i+h.y/2,r),f=-Math.atan2(h.x,h.y);if(c||!Tilemap.isAutotile(u)){const t=c||a.a.getTileRects(u)[0],e={};p<0&&(e.flip=!0),this.builder.addWallFace(g,t.x,t.y,t.width,t.height,m.x,m.y,r-p/2,1,Math.abs(p),f,e)}else{const l=new s.w(-h.y,h.x),c=new s.w(h.y,-h.x),d=a.a.getStackHeight(this.ox+e+l.x,this.oy+i+l.y,n),b=a.a.getStackHeight(this.ox+e+c.x,this.oy+i+c.y,n),{x:T,y:C}=this.getAutotileCorner(u,t.realId,!0);let y=Math.max(1,Math.abs(Math.round(2*p))),S=Math.abs(p/y),M=Object(_.s)()/2,E=Object(_.s)()/2;a.a.isTableTile(t.realId)&&(E=Object(_.s)()/3,y=1,S=o);for(let e=-1;e<=1;e+=2)for(let i=0;i<y;++i){let s,n,o,h;a.a.isTableTile(t.realId)?(s=d!=r,n=b!=r):(s=d<r-i*S,n=b<r-i*S),o=T*Object(_.s)(),h=C*Object(_.s)(),o=(T+(e>0?.5+n:1-s))*Object(_.s)(),h=a.a.isWaterfallTile(u)?(C+i%2/2)*Object(_.s)():a.a.isTableTile(u)?(C+5/3)*Object(_.s)():(C+(0===i?0:i===y-1?1.5:1-i%2*.5))*Object(_.s)();const l={};p<0&&(l.flip=!0),this.builder.addWallFace(g,o,h,M,E,m.x+.25*e*Math.cos(f),m.y+.25*e*Math.sin(f),r-p*(p<0)-S/2-S*i,.5,S,f,l)}}}async loadFence(t,e,i,s,r,n){const o=t.side_id;if(a.a.isTileEmpty(o))return;const h=t.side_rect,l=await a.a.getCachedTilesetMaterialForTile(t,"side"),c=Tilemap.isAutotile(o),p=[];for(let t=0;t<mapCell_MapCell.neighborPositions.length;++t){const s=mapCell_MapCell.neighborPositions[t];a.a.getTileHeight(this.ox+e+s.x,this.oy+i+s.y,r)!==n&&p.push(t)}for(let r=0;r<mapCell_MapCell.neighborPositions.length;++r){const u=mapCell_MapCell.neighborPositions[r],d=p.includes(r);if(d&&p.length<4&&!c)continue;const g=u.x>0||u.y>0;let m=Math.atan2(u.x,u.y)+Math.PI/2;if(g&&(m-=Math.PI),c&&!h){const{x:r,y:h}=this.getAutotileCorner(o,t.realId,!0);for(let t=0;t<=1;++t)this.builder.addWallFace(l,(d?r+1.5*g:r+1-.5*g)*Object(_.t)(),(h+1.5*t)*Object(_.r)(),Object(_.t)()/2,Object(_.r)()/2,e+u.x/4,i+u.y/4,s-n/4-t*n/2,.5,n/2,-m,{double:!0,abnormal:a.a.ABNORMAL})}else{const t=h||a.a.getTileRects(o)[0];this.builder.addWallFace(l,t.x+t.width/2*g,t.y,t.width/2,t.height,e+u.x/4,i+u.y/4,s-n/2,.5,n,m,{double:!0})}}}async loadCross(t,e,i,s,r,n){const o=t.side_id;if(a.a.isTileEmpty(o))return;const h=t.side_rect,l=await a.a.getCachedTilesetMaterialForTile(t,"side"),c=Tilemap.isAutotile(o);let p;p=h?[h]:a.a.getTileRects(o);const u=t.shape===a.a.configurationShapes.XCROSS?Math.PI/4:0,d=c?n/2:n;for(let t=0;t<=1;++t)for(const r of p){const o=-Math.PI/2*t+u,h=-.25*c+(0|r.ox)/Object(_.t)();this.builder.addWallFace(l,r.x,r.y,r.width,r.height,e+h*Math.cos(o),i+h*Math.sin(o),s-(0|r.oy)/Object(_.r)()*n-d/2,1-c/2,d,o,{double:!0,abnormal:a.a.ABNORMAL})}}async loadSlope(t,e,i,r,n,o){const h=a.a.getSlopeDirection(this.ox+e,this.oy+i,n),l=new s.w(-Object(_.p)(h+Math.PI),Object(_.g)(h+Math.PI));a.a.getCullingHeight(this.ox+e+l.x,this.oy+i+l.y,n)<r&&await this.loadWall(t,e,i,r,n+1,o,l);const c=new s.w(l.y,-l.x);a.a.getCullingHeight(this.ox+e+c.x,this.oy+i+c.y,n)<r&&await this.loadSlopeSide(t,e+c.x/2,i+c.y/2,r,n,o,h+Math.PI/2);const p=new s.w(-l.y,l.x);a.a.getCullingHeight(this.ox+e+p.x,this.oy+i+p.y,n)<r&&await this.loadSlopeSide(t,e+p.x/2,i+p.y/2,r,n,o,h+Math.PI/2,{flip:!0}),await this.loadSlopeTop(t,e,i,r,n,o,h)}async loadSlopeTop(t,e,i,s,r,n,o){const h=t.top_id,l=await a.a.getCachedTilesetMaterialForTile(t,"top");if(Tilemap.isAutotile(h)&&!t.top_rect){const t=a.a.getTileRects(h);for(let a=0;a<t.length;++a){const r=t[a],h=(a+1)%2*-2+1,c=(Math.floor(a/2)+1)%2*2-1,p=Math.max(0,Object(_.p)(o)*h)*n/2,u=Math.max(0,Object(_.g)(o)*c)*n/2;this.builder.addSlopeFace(l,r.x,r.y,r.width,r.height,e+r.ox/Object(_.s)()-.25,i+r.oy/Object(_.s)()-.25,s-n+p+u,.5,n/2,o,{autotile:!0})}}else{const r=t.top_rect?t.top_rect:a.a.getTileRects(h)[0];this.builder.addSlopeFace(l,r.x,r.y,r.width,r.height,e,i,s-n,1,n,o,{})}}async loadSlopeSide(t,e,i,s,r,n,o,h={}){const l=t.side_id,c=await a.a.getCachedTilesetMaterialForTile(t,"side");let p;if(Tilemap.isAutotile(l)&&!t.side_rect){const{x:e,y:i}=this.getAutotileCorner(l,t.realId,!0);p={x:(e+.5)*Object(_.t)(),y:(i+.5)*Object(_.r)(),width:Object(_.t)(),height:Object(_.r)()}}else p=t.side_rect?t.side_rect:a.a.getTileRects(l)[0];this.builder.addSlopeSide(c,p.x,p.y,p.width,p.height,e,i,s-n,1,n,o,h)}getAutotileCorner(t,e=t,i=!0){const s=Tilemap.getAutotileKind(t);let r=s%8,n=Math.floor(s/8);var o,h;return t===e&&1==a.a.isWallTile(t)&&++n,o=2*r,h=n,Tilemap.isTileA1(t)?(s<4?(o=6*Math.floor(s/2),h=s%2*3+i):(o=8*Math.floor(r/4)+s%2*6,h=6*n+3*Math.floor(r%4/2)+i*!(r%2)),i&&s>=4&&!(s%2)&&(h+=1)):Tilemap.isTileA2(t)?h=3*(n-2)+i:Tilemap.isTileA3(t)?h=2*(n-6):Tilemap.isTileA4(t)&&(h=i?Math.ceil(2.5*(n-10)+.5):2.5*(n-10)+(n%2?.5:0)),{x:o,y:h}}}mapCell_MapCell.neighborPositions=[new s.w(0,1),new s.w(1,0),new s.w(0,-1),new s.w(-1,0)],mapCell_MapCell.meshCache={};Object.assign(a.a,{_tilemap:null,getTilemap(){return SceneManager._scene&&SceneManager._scene._spriteset&&(this._tilemap=SceneManager._scene._spriteset._tilemap),this._tilemap},getDataMap(){return $dataMap&&(this._dataMap=$dataMap),this._dataMap},getRegion(t,e){return this.getTileId(t,e,5)},getSetNumber:t=>Tilemap.isAutotile(t)?Tilemap.isTileA1(t)?0:Tilemap.isTileA2(t)?1:Tilemap.isTileA3(t)?2:3:Tilemap.isTileA5(t)?4:5+Math.floor(t/256),getShadowBits(t,e){return this.getTilemap()._readMapData(t,e,4)},getTerrainTag:t=>$gameMap.tilesetFlags()[t]>>12,getTilePassage:Object(_.l)({1(t){return this.getTilePassage(t,this.getTileConfig(t))},2(t,e){if("pass"in e)return e.pass;const i=$gameMap.tilesetFlags()[t];return 16&i?this.configurationPassage.THROUGH:15==(15&i)?this.configurationPassage.WALL:this.configurationPassage.FLOOR},3(t,e,i){const a=this.getTileData(t,e)[i];return this.getTilePassage(a,this.getTileConfig(a,t,e,i))}}),getMaterialOptions(t,e){const i={};return"alpha"in t&&(i.alpha=t.alpha),"glow"in t&&(i.glow=t.glow),e&&(`${e}_alpha`in t&&(i.alpha=t[`${e}_alpha`]),`${e}_glow`in t&&(i.glow=t[`${e}_glow`])),"alpha"in i&&(i.transparent=!0),i},getTileAnimationData(t,e){const i=t[`${e}_id`];if(`${e}_animData`in t)return t[`${e}_animData`];const a={animX:0,animY:0};if(Tilemap.isTileA1(i)){const t=Tilemap.getAutotileKind(i);a.animX=t<=1?2:t<=3?0:t%2?0:2,a.animY=t<=3?0:t%2?1:0}return a},getTileConfig:Object(_.l)({3(t,e,i){return this.getTileConfig(this.getTileData(t,e)[i],t,e,i)},default(t,e,i,s){const r={};if(!this.isTileEmpty(t)){const e=this.getTerrainTag(t);e&&e in this.TTAG_DATA&&Object.assign(r,this.TTAG_DATA[e]);const i=this.tilesetConfigurations[this.normalizeAutotileId(t)];i&&Object.assign(r,i)}if(0===s){const t=this.getRegion(e,i);t&&t in a.a.REGION_DATA&&Object.assign(r,this.REGION_DATA[t])}return r}}),getTileTextureOffsets(t,e,i,a){const s=this.getTileConfig(t,e,i,a),r=Tilemap.isAutotile(t)?48:1;this.getTilemap();return s.hasInsideConf=Boolean(s.inside_offset||s.rectInside||"inside_id"in s),s.hasBottomConf=Boolean(s.bottom_offset||s.rectBottom||"bottom_id"in s),null==s.top_id&&(s.top_id=t,s.top_offset&&(s.top_id=t+s.top_offset.x*r+s.top_offset.y*r*8)),null==s.side_id&&(s.side_id=t,s.side_offset&&(s.side_id=t+s.side_offset.x*r+s.side_offset.y*r*8)),null==s.inside_id&&(s.inside_id=s.side_id,s.inside_offset&&(s.inside_id=t+s.inside_offset.x*r+s.inside_offset.y*r*8)),null==s.bottom_id&&(s.bottom_id=s.top_id,s.bottom_offset&&(s.bottom_id=t+s.bottom_offset.x*r+s.bottom_offset.y*r*8)),s},getTileId(t,e,i=0){const a=this.getDataMap();return a.data[(i*a.height+e)*a.width+t]||0},getTileData(t,e){if(!$dataMap||!$dataMap.data)return[0,0,0,0];const i=$dataMap.data,a=$dataMap.width,s=$dataMap.height;if($gameMap.isLoopHorizontal()&&(t=t.mod(a)),$gameMap.isLoopVertical()&&(e=e.mod(s)),t<0||t>=a||e<0||e>=s)return[0,0,0,0];const r=[];for(let n=0;n<4;++n)r[n]=i[(n*s+e)*a+t]||0;return r},getTileHeight(t,e,i=0){if(!$dataMap)return 0;$gameMap.isLoopHorizontal()&&(t=t.mod($dataMap.width)),$gameMap.isLoopVertical()&&(e=e.mod($dataMap.height));const a=this.getTileData(t,e)[i];if(this.isTileEmpty(a)&&i>0)return 0;const s=this.getTilemap(),r=this.configurationShapes,n=this.getTileConfig(a,t,e,i);let o=0;if("height"in n)o=n.height;else if(this.isWallTile(a))o=this.WALL_HEIGHT;else if(s&&s._isTableTile(a))o=this.TABLE_HEIGHT;else if(this.isSpecialShape(n.shape))switch(n.shape){case r.SLOPE:o=0;break;default:o=1}return"depth"in n&&(o-=n.depth),n.shape===r.SLOPE&&(o+=n.slopeHeight||1),o},getStackHeight(t,e,i=3){let a=0;for(let s=0;s<=i;++s)a+=this.getTileFringe(t,e,s),a+=this.getTileHeight(t,e,s);return a},getSlopeDirection(t,e,i,s=!1){const r=this.getTileHeight(t,e,i),n=this.getStackHeight(t,e,i),o=this.getTileData(t,e)[i],h=this.getTileConfig(o,t,e,i),l=mapCell_MapCell.neighborPositions,c=$gameMap.tilesetFlags()[o],p=this.getShadowBits(t,e),u=[0,3,10,5,12];let d;for(let i=0;i<l.length;++i){const s=l[i],o={neighbor:s,favor:0};o.dir=5-3*s.y+s.x;const g=this.getWalkHeight(t+s.x,e+s.y,!0),m=this.getWalkHeight(t-s.x,e-s.y,!0);Math.abs(n-m)<=a.a.STAIR_THRESH&&(o.favor+=1),Math.abs(n-r-g)<=a.a.STAIR_THRESH&&(o.favor+=1),(p&u[o.dir/2])===u[o.dir/2]&&(o.favor+=3),c&1<<o.dir/2-1&&(o.favor=-2),c&1<<(10-o.dir)/2-1&&(o.favor=-1),h.slopeDirection===o.dir&&(o.favor=100),(!d||o.favor>d.favor)&&(d=o)}return d.rot=Object(_.i)(180-this.dirToYaw(d.dir)),s?d:d.rot},getWalkHeight(t,e,i=!1){const a=Math.round(t),s=Math.round(e),r=this.getTileData(a,s);let n=0,o=0;for(let h=0;h<=3;++h){const l=r[h];if(this.isTileEmpty(l)&&h>0)continue;n+=o;const c=this.getTileConfig(l,a,s,h),p=c.shape;if(p===this.configurationShapes.SLOPE)if(i)o=c.slopeHeight||1,n+=this.getTileHeight(a,s,h)-o;else{const i=this.getSlopeHeight(t,e,h,c);n+=this.getTileHeight(a,s,h)-(c.slopeHeight||1)+i,o=0}else o=this.getTileHeight(a,s,h);o+=this.getTileFringe(a,s,h),this.isSpecialShape(p)||(n+=o,o=0)}return n},getSlopeHeight(t,e,i,a=null){const s=Math.round(t),r=Math.round(e);null==a&&(a=this.getTileConfig(this.getTileData(s,r)[i],s,r,i));const n=this.getSlopeDirection(s,r,i),o=Object(_.p)(n),h=-Object(_.g)(n);let l=(t+.5)%1,c=(e+.5)%1;Math.sign(o<0)&&(l=1-l),Math.sign(h<0)&&(c=1-c);const p=Math.abs(o)*l+Math.abs(h)*c;return(a.slopeHeight||1)*p},getCollisionHeights(t,e){const i=Math.round(t),a=Math.round(e);let s=0;const r=[{z1:-1/0,z2:0}];for(let n=0;n<=3;++n){let o=this.getTileHeight(i,a,n);const h=this.getTileData(i,a)[n],l=this.getTileConfig(h,i,a,n),c=l.shape;let p=!1;this.getTilePassage(h,l)===this.configurationPassage.THROUGH?(o=0,p=!0):c===this.configurationShapes.SLOPE&&(o=o-(l.slopeHeight||1)+this.getSlopeHeight(t,e,n,l));const u=this.getTileFringe(i,a,n);if(s+=u,!p&&(o||u)){if(o<0){if(u+o>=0)continue;r[r.length-1].z2+=u+o}else 0===n?r[0].z2=s+o:r.push({z1:s,z2:s+o});s+=o}}return r},getTileLayers(t,e,i){let a=1/0,s=[0],r=0;for(let n=0;n<=3;++n){if(this.getTilePassage(t,e,n)===this.configurationPassage.THROUGH)continue;const o=i-(r+=this.getTileFringe(t,e,n)+this.getTileHeight(t,e,n));i>=r&&(o<a?(s=[n],a=o):o===a&&s.push(n))}return s},getFloatHeight(t,e,i=null){const a=this.getTileData(t,e),s=null==i?[0,1,2,3]:this.getTileLayers(t,e,i);let r=0;for(const i of s){const s=a[i];if(this.isTileEmpty(s))continue;const n=this.getTileConfig(s,t,e,i);n&&"float"in n&&(r+=n.float)}return r},getStackFringeHeight(t,e,i=3){return this.getStackHeight(t,e,i)},getTileFringe(t,e,i){const a=this.getTileData(t,e)[i];if(this.isTileEmpty(a))return 0;const s=this.getTileConfig(a,t,e,i);return s&&"fringe"in s?s.fringe:this.getTilemap()._isHigherTile(a)?this.FRINGE_HEIGHT:0},getCullingHeight(t,e,i=3,a=!1){const s=this.getTileData(t,e);let r=0;for(let n=0;n<=i;++n){if(this.getTileFringe(t,e,n))return r;const i=s[n],o=this.getTileConfig(i,t,e,n),h=o.shape;if(this.isSpecialShape(h))return h===this.configurationShapes.SLOPE&&(r+=this.getTileHeight(t,e,n),r-=o.slopeHeight||1),r;a&&o.depth>0&&(r+=o.depth),r+=this.getTileHeight(t,e,n)}return r},tileHasPit(t,e,i=3){const a=this.getTileData(t,e);for(let s=0;s<=i;++s){const i=a[s];if(this.getTileConfig(i,t,e,s).depth>0)return!0}return!1},isTilePit(t,e,i){const a=this.getTileData(t,e)[i];return this.getTileConfig(a,t,e,i).depth>0},getTileRects(t){const e=[],i=this.getTilemap(),a=i._isTableTile(t);if(i._drawTile({addRect:(t,i,a,s,r,n,o,h,l)=>{e.push({setN:t,x:i,y:a,width:n,height:o,ox:s,oy:r})}},t,0,0),a)for(let t=e.length-1;t>=0;--t)e[t].oy>Object(_.s)()/2&&(e[t-1].y+=2*Object(_.s)()/3,e.splice(t,1));return e},isTileEmpty:t=>!t||1544===t,isWallTile(t){const e=Tilemap.getAutotileKind(t),i=Math.floor(e/8),a=Tilemap.isTileA3(t)||Tilemap.isTileA4(t);return a&&i%2?2:a},isTableTile(t){return Boolean(this.getTilemap()._isTableTile(t))},isFringeTile(t){return Boolean(this.getTilemap()._isHigherTile(t))},isWaterfallTile(t){const e=Tilemap.getAutotileKind(t);return Tilemap.isTileA1(t)&&e>=4&&e%2},isSpecialShape(t){const e=a.a.configurationShapes;return t===e.FENCE||t===e.CROSS||t===e.XCROSS||t===e.SLOPE},isPlatformShape(t){const e=a.a.configurationShapes;return null==t||t===e.FLAT||t===e.SLOPE},constructTileId(t,e,i){const a=`TILE_ID_${t.toUpperCase()}`;let s=a in Tilemap?Tilemap[a]:0;const r=Tilemap.isAutotile(s)?48:1;return s+=Number(e)*r+Number(i)*r*8},normalizeAutotileId(t){if(!Tilemap.isAutotile(t))return t;const e=Tilemap.getAutotileKind(t);return Tilemap.TILE_ID_A1+48*e}}),Object.assign(a.a,{mapLoaded:!1,mapReady:!1,clearMap(){this.mapLoaded=!1,this.clearMapCells();for(let t=this.characters.length-1;t>=0;--t)this.characters[t].dispose(!1,!0);this.characters.length=0,this.resetCameraTarget(),this.callFeatures("clearMap")},clearMapCells(){for(const t in this.textureCache)this.textureCache[t].dispose();for(const t in this.materialCache)this.materialCache[t].dispose();this.animatedTextures.length=0,this.textureCache={},this.materialCache={};for(const t in this.cells)this.cells[t].dispose(!1,!0);this.cells={}},reloadMap(){this.clearMapCells(),this.callFeatures("reloadMap")},loadMap(){this.updateBlenders(),this.updateMap(),this.createCharacters(),this.rememberCameraTarget(),this.callFeatures("loadMap")},async updateMap(){if(this.mapUpdating)return;this.mapLoaded=!0,this.mapUpdating=!0;for(const t in this.cells)this.cells[t].unload=!0;const t={left:Math.floor((this.cameraStick.x-this.RENDER_DIST)/this.CELL_SIZE),right:Math.floor((this.cameraStick.x+this.RENDER_DIST)/this.CELL_SIZE),top:Math.floor((this.cameraStick.y-this.RENDER_DIST)/this.CELL_SIZE),bottom:Math.floor((this.cameraStick.y+this.RENDER_DIST)/this.CELL_SIZE)};$gameMap.isLoopHorizontal()||(t.left=Math.max(0,t.left),t.right=Math.min(t.right,Math.floor($gameMap.width()/a.a.CELL_SIZE))),$gameMap.isLoopVertical()||(t.top=Math.max(0,t.top),t.bottom=Math.min(t.bottom,Math.floor($gameMap.height()/a.a.CELL_SIZE)));const e=[];for(let i=t.left;i<=t.right;++i)for(let r=t.top;r<=t.bottom;++r){let t=i,n=r;$gameMap.isLoopHorizontal()&&(t=t.mod(Math.ceil($gameMap.width()/a.a.CELL_SIZE))),$gameMap.isLoopVertical()&&(n=n.mod(Math.ceil($gameMap.height()/a.a.CELL_SIZE)));const o=[t,n].toString();o in this.cells?this.cells[o].unload=!1:e.push(new s.w(t,n))}for(const t in this.cells)a.a.UNLOAD_CELLS&&this.cells[t].unload&&(this.cells[t].dispose(),delete this.cells[t]);const i=new s.w(Math.round(this.cameraStick.x/this.CELL_SIZE-.5),Math.round(this.cameraStick.y/this.CELL_SIZE-.5));e.sort((t,e)=>s.w.DistanceSquared(t,i)-s.w.DistanceSquared(e,i)),this.mapReady&&(e.length=Math.min(25,e.length));for(const t of e){let{x:e,y:i}=t;if(await this.loadMapCell(e,i),this.mapReady&&await Object(_.q)(),!this.mapLoaded)return void this.endMapUpdate()}this.endMapUpdate()},endMapUpdate(){this.mapUpdating=!1,this.mapReady=!0},async loadMapCell(t,e){const i=[t,e].toString();if(i in this.cells)return;const a=new mapCell_MapCell(t,e);this.cells[i]=a,await a.load()}}),Object.assign(a.a,{animatedTextures:[],textureCache:{},materialCache:{},getCachedTilesetTexture(t,e=0,i=0){const r=`TS:${t}|${e},${i}`;if(r in this.textureCache)return this.textureCache[r];const n=$gameMap.tileset().tilesetNames[t];if(!n)return this.getErrorTexture();const o=`img/tilesets/${n}.png`,h=new s.u(o,this.scene,!a.a.MIPMAP);return h.hasAlpha=!0,h.onLoadObservable.addOnce(()=>{if(this.textureCache[r]===h&&(h.updateSamplingMode(1),e||i)){const{width:t,height:a}=h.getBaseSize();h.frameData={x:0,y:0,w:t,h:a},h.animX=e,h.animY=i,this.animatedTextures.push(h)}}),this.textureCache[r]=h,h},getCachedTilesetTextureAsync(t,e=0,i=0){return new Promise((a,s)=>{const r=this.getCachedTileTexture(t,e,i);r.isReady()?a(r):r.onLoadObservable.addOnce(()=>{a(r)})})},getErrorTexture(){return this.errorTexture?this.errorTexture:(this.errorTexture=new s.u(`${a.a.MV3D_FOLDER}/errorTexture.png`,this.scene),this.errorTexture.isError=!0,this.errorTexture)},getBushAlphaTexture(){return this.bushAlphaTexture?this.bushAlphaTexture:(this.bushAlphaTexture=new s.u(`${a.a.MV3D_FOLDER}/bushAlpha.png`,this.scene),this.bushAlphaTexture.getAlphaFromRGB=!0,this.bushAlphaTexture)},getCachedTilesetMaterial(t,e=0,i=0,r={}){this.processMaterialOptions(r);const n=`TS:${t}|${e},${i}|${this.getExtraBit(r)}`;if(n in this.materialCache)return this.materialCache[n];const o=this.getCachedTilesetTexture(t,e,i),h=new s.t(n,this.scene);return h.diffuseTexture=o,r.transparent&&(h.opacityTexture=o,h.alpha=r.alpha),h.alphaCutOff=a.a.ALPHA_CUTOFF,h.ambientColor.set(1,1,1),h.emissiveColor.set(r.glow,r.glow,r.glow),h.specularColor.set(0,0,0),isNaN(this.LIGHT_LIMIT)||(h.maxSimultaneousLights=this.LIGHT_LIMIT),this.materialCache[n]=h,h},getCachedTilesetMaterialAsync(t,e=0,i=0,a={}){return new Promise((s,r)=>{const n=this.getCachedTilesetMaterial(t,e,i,a),o=n.diffuseTexture;o.isReady()?s(n):o.onLoadObservable.addOnce(()=>{s(n)})})},async getCachedTilesetMaterialForTile(t,e){const i=a.a.getSetNumber(t[`${e}_id`]),s=a.a.getMaterialOptions(t,e),r=a.a.getTileAnimationData(t,e);return await a.a.getCachedTilesetMaterialAsync(i,r.animX,r.animY,s)},processMaterialOptions(t){"alpha"in t?(t.alpha=Math.round(7*t.alpha)/7,t.alph<1&&(t.transparent=!0)):t.alpha=1,t.glow="glow"in t?Math.round(7*t.glow)/7:0},getExtraBit(t){let e=0;return e|=Boolean(t.transparent)<<0,e|=7-7*t.alpha<<1,(e|=7*t.glow<<1).toString(36)},lastAnimUpdate:0,animXFrame:0,animYFrame:0,animDirection:1,updateAnimations(){if(!(performance.now()-this.lastAnimUpdate<=this.ANIM_DELAY)){this.lastAnimUpdate=performance.now(),this.animXFrame<=0?this.animDirection=1:this.animXFrame>=2&&(this.animDirection=-1),this.animXFrame+=this.animDirection,this.animYFrame=(this.animYFrame+1)%3;for(const t of this.animatedTextures)t.crop(t.frameData.x+t.animX*this.animXFrame*Object(_.t)(),t.frameData.y+t.animY*this.animYFrame*Object(_.r)(),t.frameData.w,t.frameData.h)}}}),Object.assign(a.a,{createCharacters(){const t=$gameMap.events();for(const e of t)this.createCharacterFor(e,0);const e=$gameMap.vehicles();for(const t of e)this.createCharacterFor(t,1);const i=$gamePlayer.followers()._data;for(let t=i.length-1;t>=0;--t)this.createCharacterFor(i[t],29-t);this.createCharacterFor($gamePlayer,30)},createCharacterFor(t,e){if(!t.mv3d_sprite){const i=new characters_Character(t,e);return Object.defineProperty(t,"mv3d_sprite",{value:i,configurable:!0}),this.characters.push(i),i}return t.mv3d_sprite},updateCharacters(){for(let t=this.characters.length-1;t>=0;--t)this.characters[t].update()},setupSpriteMeshes(){characters_Sprite.Meshes={},characters_Sprite.Meshes.FLAT=s.i.MergeMeshes([s.j.CreatePlane("sprite mesh",{sideOrientation:s.c},a.a.scene).rotate(_.b,Math.PI/2,s.z)]),characters_Sprite.Meshes.SPRITE=s.i.MergeMeshes([s.j.CreatePlane("sprite mesh",{sideOrientation:s.c},a.a.scene).translate(_.c,.5,s.z)]),characters_Sprite.Meshes.CROSS=s.i.MergeMeshes([characters_Sprite.Meshes.SPRITE.clone(),characters_Sprite.Meshes.SPRITE.clone().rotate(_.c,Math.PI/2,s.z)]),characters_Sprite.Meshes.SHADOW=characters_Sprite.Meshes.FLAT.clone("shadow mesh");const t=new s.u(`${a.a.MV3D_FOLDER}/shadow.png`),e=new s.t("shadow material",a.a.scene);e.diffuseTexture=t,e.opacityTexture=t,e.specularColor.set(0,0,0),characters_Sprite.Meshes.SHADOW.material=e;for(const t in characters_Sprite.Meshes)a.a.scene.removeMesh(characters_Sprite.Meshes[t])}});class characters_Sprite extends s.v{constructor(){super("sprite",a.a.scene),this.spriteOrigin=new s.v("sprite origin",a.a.scene),this.spriteOrigin.parent=this,this.mesh=characters_Sprite.Meshes.FLAT.clone(),this.mesh.parent=this.spriteOrigin}setMaterial(t){this.disposeMaterial(),this.texture=new s.u(t,a.a.scene),this.bitmap=this.texture._texture,this.texture.hasAlpha=!0,this.texture.onLoadObservable.addOnce(()=>this.onTextureLoaded()),this.material=new s.t("sprite material",a.a.scene),this.material.diffuseTexture=this.texture,this.material.alphaCutOff=a.a.ALPHA_CUTOFF,this.material.ambientColor.set(1,1,1),this.material.specularColor.set(0,0,0),isNaN(this.LIGHT_LIMIT)||(this.material.maxSimultaneousLights=this.LIGHT_LIMIT),this.mesh.material=this.material}onTextureLoaded(){this.texture.updateSamplingMode(1)}disposeMaterial(){this.material&&(this.material.dispose(),this.texture.dispose(),this.material=null,this.texture=null,this.bitmap=null)}dispose(...t){this.disposeMaterial(),super.dispose(...t)}}const A={configurable:!0,get(){return this._mv3d_z},set(t){this._mv3d_z=t,this.mv3d_sprite&&(this.mv3d_sprite.position.y=t)}},D={configurable:!0,get(){return this.char._mv3d_z},set(t){this.char._mv3d_z=t,this.position.y=t}};class characters_Character extends characters_Sprite{constructor(t,e){super(),this.order=e,this.mesh.order=this.order,this.mesh.character=this,this._character=this.char=t,this.charName="",this.charIndex=0,this.updateCharacter(),this.updateShape(),this.isVehicle=this.char instanceof Game_Vehicle,this.isBoat=this.isVehicle&&this.char.isBoat(),this.isShip=this.isVehicle&&this.char.isShip(),this.isAirship=this.isVehicle&&this.char.isAirship(),this.isEvent=this.char instanceof Game_Event,this.isPlayer=this.char instanceof Game_Player,this.isFollower=this.char instanceof Game_Follower,"_mv3d_z"in this.char||(this.char._mv3d_z=a.a.getWalkHeight(this.char.x,this.char.y)),Object.defineProperty(this.char,"z",A),Object.defineProperty(this,"z",D),this.z=this.z,this.platformHeight=this.z,this.targetElevation=this.z,this.prevZ=this.z,this.needsPositionUpdate=!0,this.char.mv3d_blenders||(this.char.mv3d_blenders={}),this.shadow=characters_Sprite.Meshes.SHADOW.clone(),this.shadow.parent=this,this.blendElevation=this.makeBlender("elevation",0),this.lightOrigin=new s.v("light origin",a.a.scene),this.lightOrigin.parent=this,this.setupLights(),this.isEvent?this.eventConfigure():(this.initialConfigure(),this.configureTexture())}isTextureReady(){return Boolean(this.texture&&this.texture.isReady())}setTileMaterial(){const t=a.a.getSetNumber(this._tileId),e=$gameMap.tileset().tilesetNames[t];if(e){const t=`img/tilesets/${e}.png`;this.setMaterial(t)}else this.setMaterial("MV3D/errorTexture.png")}onTextureLoaded(){super.onTextureLoaded(),this.updateFrame(),this.updateScale(),this.configureTexture()}updateCharacter(){this._tilesetId=$gameMap.tilesetId(),this._tileId=this._character.tileId(),this._characterName=this._character.characterName(),this._characterIndex=this._character.characterIndex(),this._isBigCharacter=ImageManager.isBigCharacter(this._characterName),this._tileId>0?this.setTileMaterial(this._tileId):this._characterName?this.setMaterial(`img/characters/${this._characterName}.png`):(this.setEnabled(!1),this.spriteWidth=1,this.spriteHeight=0)}updateCharacterFrame(){if(this.px=this.characterPatternX(),this.py=this.characterPatternY(),!this.isTextureReady())return;const t=this.patternWidth(),e=this.patternHeight(),i=(this.characterBlockX()+this.px)*t,a=(this.characterBlockY()+this.py)*e;this.setFrame(i,a,t,e)}patternChanged(){return this.px!==this.characterPatternX()||this.py!==this.characterPatternY()}characterPatternY(){if(this.getConfig("dirfix",this.isEvent&&this.char.isObjectCharacter()))return this.char.direction()/2-1;return a.a.transformDirectionYaw(this.char.direction())/2-1}setFrame(t,e,i,a){this.isTextureReady()&&this.texture.crop(t,e,i,a)}updateScale(){if(!this.isTextureReady())return;const t=this.getConfig("scale",new s.w(1,1));this.spriteWidth=this.patternWidth()/Object(_.s)()*t.x,this.spriteHeight=this.patternHeight()/Object(_.s)()*t.y;const e=this.spriteWidth,i=this.spriteHeight;this.mesh.scaling.set(e,i,i)}getDefaultConfigObject(){return this.isVehicle?a.a[`${this.char._type.toUpperCase()}_SETTINGS`].conf:this.char.isTile()?a.a.EVENT_TILE_SETTINGS:this.isEvent&&this.char.isObjectCharacter()?a.a.EVENT_OBJ_SETTINGS:a.a.EVENT_CHAR_SETTINGS}getConfig(t,e){if(this.settings_event_page&&t in this.settings_event_page)return this.settings_event_page[t];if(this.settings_event&&t in this.settings_event)return this.settings_event[t];const i=this.getDefaultConfigObject();return t in i?i[t]:e}hasConfig(t){return this.settings_event_page&&t in this.settings_event_page||this.settings_event&&t in this.settings_event||t in this.getDefaultConfigObject()}eventConfigure(){if(!this.settings_event){this.settings_event={};const t=this.char.event().note;a.a.readConfigurationFunctions(a.a.readConfigurationTags(t),a.a.eventConfigurationFunctions,this.settings_event),this.initialConfigure()}this.settings_event_page={};const t=this.char.page();if(!t)return;let e="";for(const i of t.list)108!==i.code&&408!==i.code||(e+=i.parameters[0]);a.a.readConfigurationFunctions(a.a.readConfigurationTags(e),a.a.eventConfigurationFunctions,this.settings_event_page),this.updateScale(),this.updateShape(),this.char.mv3d_needsConfigure&&(this.char.mv3d_needsConfigure=!1,this.needsPositionUpdate=!0,this.pageConfigure(),this.configureTexture())}initialConfigure(){this.configureHeight()}pageConfigure(){if("pos"in this.settings_event_page){const t=this.char.event(),e=this.settings_event_page.pos;this.char.locate(Object(_.o)(t.x,e.x),Object(_.o)(t.y,e.y))}if(this.setupEventLights(),"lamp"in this.settings_event_page){const t=this.getConfig("lamp");this.blendLampColor.setValue(t.color,.5),this.blendLampIntensity.setValue(t.intensity,.5),this.blendLampDistance.setValue(t.distance,.5)}if("flashlight"in this.settings_event_page){const t=this.getConfig("flashlight");this.blendFlashlightColor.setValue(t.color,.5),this.blendFlashlightIntensity.setValue(t.intensity,.5),this.blendFlashlightDistance.setValue(t.distance,.5),this.blendFlashlightAngle.setValue(t.angle,.5),this.blendFlashlightPitch.setValue(this.getConfig("flashlightPitch",90),.25),this.flashlightTargetYaw=this.getConfig("flashlightYaw","+0")}("height"in this.settings_event_page||this.isAbove!==(2===this.char._priorityType))&&this.configureHeight()}configureTexture(){if(this.material){const t=this.getConfig("glow",0);this.material.emissiveColor.set(t,t,t)}}configureHeight(){this.isAbove=2===this.char._priorityType;let t=Math.max(0,this.getConfig("height",this.isAbove&&!this.hasConfig("z")?a.a.EVENT_HEIGHT:0));this.blendElevation.setValue(t,0),this.z=this.platformHeight+t}setupMesh(){this.mesh.mv3d_isSetup||(a.a.callFeatures("createCharMesh",this.mesh),this.mesh.parent=this.spriteOrigin,this.mesh.character=this,this.mesh.order=this.order,this.material&&(this.mesh.material=this.material),this.mesh.mv3d_isSetup=!0),this.flashlight&&(this.flashlight.excludedMeshes.splice(0,1/0),this.flashlight.excludedMeshes.push(this.mesh))}setupEventLights(){const t=this.getConfig("flashlight"),e=this.getConfig("lamp");t&&!this.flashlight&&this.setupFlashlight(),e&&!this.lamp&&this.setupLamp()}setupLights(){"flashlightColor"in this.char.mv3d_blenders&&this.setupFlashlight(),"lampColor"in this.char.mv3d_blenders&&this.setupLamp()}setupFlashlight(){if(this.flashlight)return;const t=this.getConfig("flashlight",{color:16777215,intensity:1,distance:a.a.LIGHT_DIST,angle:a.a.LIGHT_ANGLE});this.blendFlashlightColor=this.makeColorBlender("flashlightColor",t.color),this.blendFlashlightIntensity=this.makeBlender("flashlightIntensity",t.intensity),this.blendFlashlightDistance=this.makeBlender("flashlightDistance",t.distance),this.blendFlashlightAngle=this.makeBlender("flashlightAngle",t.angle),this.flashlight=new s.q("flashlight",s.x.Zero(),s.x.Zero(),Object(_.i)(this.blendFlashlightAngle.targetValue()+a.a.FLASHLIGHT_EXTRA_ANGLE),0,a.a.scene),this.flashlight.renderPriority=2,this.updateFlashlightExp(),this.flashlight.range=this.blendFlashlightDistance.targetValue(),this.flashlight.intensity=this.blendFlashlightIntensity.targetValue(),this.flashlight.diffuse.set(...this.blendFlashlightColor.targetComponents()),this.flashlight.direction.y=-1,this.flashlightOrigin=new s.v("flashlight origin",a.a.scene),this.flashlightOrigin.parent=this.lightOrigin,this.flashlight.parent=this.flashlightOrigin,this.blendFlashlightPitch=this.makeBlender("flashlightPitch",70),this.blendFlashlightYaw=this.makeBlender("flashlightYaw",0),this.blendFlashlightYaw.cycle=360,this.flashlightTargetYaw=this.getConfig("flashlightYaw","+0"),this.updateFlashlightDirection(),this.setupMesh()}updateFlashlightExp(){this.flashlight.exponent=64800*Math.pow(this.blendFlashlightAngle.targetValue(),-2)}setupLamp(){if(this.lamp)return;const t=this.getConfig("lamp",{color:16777215,intensity:1,distance:a.a.LIGHT_DIST});this.blendLampColor=this.makeColorBlender("lampColor",t.color),this.blendLampIntensity=this.makeBlender("lampIntensity",t.intensity),this.blendLampDistance=this.makeBlender("lampDistance",t.distance),this.lamp=new s.o("lamp",s.x.Zero(),a.a.scene),this.lamp.renderPriority=1,this.lamp.diffuse.set(...this.blendLampColor.targetComponents()),this.lamp.intensity=this.blendLampIntensity.targetValue(),this.lamp.range=this.blendLampDistance.targetValue(),this.lamp.parent=this.lightOrigin}updateFlashlightDirection(){this.flashlightOrigin.yaw=this.blendFlashlightYaw.currentValue(),this.flashlightOrigin.pitch=-this.blendFlashlightPitch.currentValue(),this.flashlightOrigin.position.set(0,0,0);let t=Math.tan(Object(_.i)(90-this.blendFlashlightAngle.currentValue()-Math.max(90,this.blendFlashlightPitch.currentValue())+90))*a.a.LIGHT_HEIGHT;t=Math.max(0,Math.min(1,t)),this.flashlight.range+=t,this.flashlightOrigin.translate(_.c,t,s.h)}updateLights(){if(this.flashlight){const t=180+Object(_.o)(a.a.dirToYaw(this.char.direction()),this.flashlightTargetYaw);t!==this.blendFlashlightYaw.targetValue()&&this.blendFlashlightYaw.setValue(t,.25),this.blendFlashlightColor.update()|this.blendFlashlightIntensity.update()|this.blendFlashlightDistance.update()|this.blendFlashlightAngle.update()|this.blendFlashlightYaw.update()|this.blendFlashlightPitch.update()&&(this.flashlight.diffuse.set(...this.blendFlashlightColor.currentComponents()),this.flashlight.intensity=this.blendFlashlightIntensity.currentValue(),this.flashlight.range=this.blendFlashlightDistance.currentValue(),this.flashlight.angle=Object(_.i)(this.blendFlashlightAngle.currentValue()+a.a.FLASHLIGHT_EXTRA_ANGLE),this.updateFlashlightExp(),this.updateFlashlightDirection())}this.lamp&&this.blendLampColor.update()|this.blendLampIntensity.update()|this.blendLampDistance.update()&&(this.lamp.diffuse.set(...this.blendLampColor.currentComponents()),this.lamp.intensity=this.blendLampIntensity.currentValue(),this.lamp.range=this.blendLampDistance.currentValue())}makeBlender(t,e,i=blenders_Blender){t in this.char.mv3d_blenders?e=this.char.mv3d_blenders[t]:this.char.mv3d_blenders[t]=e;const a=new i(t,e);return a.storageLocation=()=>this.char.mv3d_blenders,a}makeColorBlender(t,e){return this.makeBlender(t,e,ColorBlender)}hasBush(){return!this.platformChar&&(this.getConfig("bush",!(this.char.isTile()||this.isVehicle||this.isEvent&&this.char.isObjectCharacter()))&&!(this.blendElevation.currentValue()||this.falling))}getShape(){return this.getConfig("shape",a.a.configurationShapes.SPRITE)}updateShape(){const t=this.getShape();if(this.shape===t)return;this.shape=t;let e=characters_Sprite.Meshes.SPRITE;const i=a.a.configurationShapes;switch(this.shape){case i.FLAT:e=characters_Sprite.Meshes.FLAT;break;case i.XCROSS:case i.CROSS:e=characters_Sprite.Meshes.CROSS;break;case i.WALL:case i.FENCE:}a.a.callFeatures("destroyCharMesh",this.mesh),this.mesh.dispose(),this.mesh=e.clone(),this.setupMesh(),this.spriteOrigin.rotation.set(0,0,0)}update(){this.needsPositionUpdate=!1,this.char._erased&&this.dispose(),this.visible=this.char.mv_sprite.visible,"function"==typeof this.char.isVisible&&(this.visible=this.visible&&this.char.isVisible()),this.disabled=!this.visible,(this.char.isTransparent()||!this._characterName&&!this._tileId)&&(this.visible=!1),this._isEnabled?this.visible||this.setEnabled(!1):this.visible&&(this.setEnabled(!0),this.needsPositionUpdate=!0),this.isImageChanged()&&(this.updateCharacter(),this.needsPositionUpdate=!0),this.patternChanged()&&this.updateFrame(),this.blendElevation.update()?this.needsPositionUpdate=!0:(this.x!==this.char._realX||this.y!==this.char._realY||this.falling||this.prevZ!==this.z||this.platformChar&&this.platformChar.needsPositionUpdate||this.isPlayer||this.char===$gamePlayer.vehicle())&&(this.needsPositionUpdate=!0,this.prevZ=this.z),this.material?this.updateNormal():this.updateEmpty(),this.updateAnimations()}updateNormal(){const t=a.a.configurationShapes;this.shape===t.SPRITE?(this.mesh.pitch=a.a.blendCameraPitch.currentValue()-90,this.mesh.yaw=a.a.blendCameraYaw.currentValue()):this.shape===t.TREE?(this.spriteOrigin.pitch=this.getConfig("pitch",0),this.mesh.yaw=a.a.blendCameraYaw.currentValue()):(this.mesh.yaw=this.getConfig("rot",0),this.spriteOrigin.pitch=this.getConfig("pitch",0),this.spriteOrigin.yaw=this.getConfig("yaw",0),this.shape===t.XCROSS&&(this.mesh.yaw+=45)),this.char===$gamePlayer&&(this.mesh.visibility=+!a.a.is1stPerson(!0)),this.updateAlpha(),this.updatePosition(),this.updateElevation(),this.shadow&&this.updateShadow(),this.updateLights()}updateEmpty(){this.updatePosition(),this.updateElevation(),this.updateLights()}updateAlpha(){let t=this.hasConfig("alpha")||this.char.opacity()<255;this.bush=Boolean(this.char.bushDepth()),this.bush&&this.hasBush()?(t=!0,this.material.opacityTexture||(this.material.opacityTexture=a.a.getBushAlphaTexture(),this.material.useAlphaFromDiffuseTexture=!0)):this.material.opacityTexture&&(this.material.opacityTexture=null,this.material.useAlphaFromDiffuseTexture=!1),t?(this.material.useAlphaFromDiffuseTexture=!0,this.material.alpha=this.getConfig("alpha",1)*this.char.opacity()/255):(this.material.useAlphaFromDiffuseTexture=!1,this.material.alpha=1)}updatePositionOffsets(){this.spriteOrigin.position.set(0,0,0),this.lightOrigin.position.set(0,0,0),this.shape===a.a.configurationShapes.FLAT?this.spriteOrigin.z=4*a.a.LAYER_DIST:this.shape===a.a.configurationShapes.SPRITE?this.spriteOrigin.z=4*a.a.LAYER_DIST*(1-Math.max(0,Math.min(90,a.a.blendCameraPitch.currentValue()))/90):this.spriteOrigin.z=0,this.lightOrigin.z=this.getConfig("lightHeight",a.a.LIGHT_HEIGHT);const t=new s.w(Math.sin(-a.a.cameraNode.rotation.y),Math.cos(a.a.cameraNode.rotation.y)).multiplyByFloats(a.a.SPRITE_OFFSET,a.a.SPRITE_OFFSET),e=this.getConfig("lightOffset",null);this.shape===a.a.configurationShapes.SPRITE?(this.spriteOrigin.x=t.x,this.spriteOrigin.y=t.y,this.lightOrigin.x=t.x,this.lightOrigin.y=t.y):e||(this.lightOrigin.x=t.x/2,this.lightOrigin.y=t.y/2),e&&(this.lightOrigin.x+=e.x,this.lightOrigin.y+=e.y),this.spriteOrigin.x+=this.getConfig("x",0),this.spriteOrigin.y+=this.getConfig("y",0);const i=this.getConfig("height",0);i<0&&(this.spriteOrigin.z+=i)}updatePosition(){if(this.updatePositionOffsets(),!this.needsPositionUpdate)return;const t=a.a.loopCoords(this.char._realX,this.char._realY);this.x=t.x,this.y=t.y}updateElevation(){if(!this.needsPositionUpdate)return;if(this.falling=!1,this.isPlayer){const t=this.char.vehicle();if(t&&(this.z=t.z,this.targetElevation=t.targetElevation,this.platformChar=t.platformChar,this.platformHeight=t.platformHeight,t._driving))return}if(this.hasConfig("z"))return this.z=this.getConfig("z",0),void(this.z+=this.blendElevation.currentValue());const t=a.a.getPlatformForCharacter(this,this.char._realX,this.char._realY);this.platformHeight=t.z2,this.platformChar=t.char,this.targetElevation=this.platformHeight+this.blendElevation.currentValue();let e=this.getConfig("gravity",a.a.GRAVITY)/60;if(this.hasFloat=this.isVehicle||(this.isPlayer||this.isFollower)&&$gamePlayer.vehicle(),this.hasFloat&&!this.platformChar&&(this.targetElevation+=a.a.getFloatHeight(Math.round(this.char._realX),Math.round(this.char._realY),this.z+this.spriteHeight)),this.isAirship&&$gamePlayer.vehicle()===this.char&&(this.targetElevation+=a.a.loadData("airship_height",a.a.AIRSHIP_SETTINGS.height)*this.char._altitude/this.char.maxAltitude()),this.char.isJumping()){let t=1-this.char._jumpCount/(2*this.char._jumpPeak),e=-4*Math.pow(t-.5,2)+1,i=Math.abs(this.char.mv3d_jumpHeightEnd-this.char.mv3d_jumpHeightStart);this.z=this.char.mv3d_jumpHeightStart*(1-t)+this.char.mv3d_jumpHeightEnd*t+e*i/2+this.char.jumpHeight()/Object(_.s)()}else if(e){const t=Math.abs(this.targetElevation-this.z);t<e&&(e=t),this.z<this.platformHeight&&(this.z=this.platformHeight),this.z>this.targetElevation?(this.z-=e,a.a.tileCollision(this,this.char._realX,this.char._realY,!1,!1)&&(this.z=this.platformHeight)):this.z<this.targetElevation&&(this.z+=e,a.a.tileCollision(this,this.char._realX,this.char._realY,!1,!1)&&(this.z-=e)),this.falling=this.z>this.targetElevation}}updateShadow(){let t=Boolean(this.getConfig("shadow",this.shape!=a.a.configurationShapes.FLAT));if(t&&(this.isPlayer||this.isFollower)){const e=a.a.characters.indexOf(this);if(e>=0)for(let i=e+1;i<a.a.characters.length;++i){const e=a.a.characters[i];if(e.shadow&&e.visible&&(e.char._realX===this.char._realX&&e.char._realY===this.char._realY)){t=!1;break}}}if(this.shadow._isEnabled?t||this.shadow.setEnabled(!1):t&&this.shadow.setEnabled(!0),!t)return;const e=Math.min(0,this.getConfig("height",0)),i=Math.max(this.z-this.platformHeight,e),s=this.getConfig("shadowDist",4),r=Math.max(0,1-Math.abs(i)/s);this.shadow.z=-i+3.5*a.a.LAYER_DIST,this.shadow.x=this.spriteOrigin.x,this.shadow.y=this.spriteOrigin.y;const n=this.getConfig("shadow",1);this.shadow.scaling.setAll(n*r),this.shadow.isAnInstance||(this.shadow.visibility=r-.5*this.bush)}updateAnimations(){this.char.isBalloonPlaying()?(this._balloon||(this._balloon=a.a.showBalloon(this)),this._balloon.update()):this._balloon&&(this._balloon.dispose(),this._balloon=null)}dispose(...t){super.dispose(...t),delete this.char.mv3d_sprite;const e=a.a.characters.indexOf(this);a.a.characters.splice(e,1)}getCHeight(){let t=this.getConfig("collide",this.shape===a.a.configurationShapes.FLAT||0===this.char._priorityType?0:this.spriteHeight);return!0===t?this.spriteHeight:Number(t)}getCollisionHeight(t=this.z){if(this.hasConfig("height")){const e=this.getConfig("height");e<0&&(t+=e)}return{z1:t,z2:t+this.getCHeight(),char:this}}getTriggerHeight(t=this.z){const e=this.getConfig("trigger");return e?{z1:t-e.down,z2:t+e.up}:this.getCollisionHeight()}}for(const t of["characterBlockX","characterBlockY","characterPatternX","isImageChanged","patternWidth","patternHeight","updateTileFrame","updateFrame"])characters_Character.prototype[t]=Sprite_Character.prototype[t];a.a.Sprite=characters_Sprite,a.a.Character=characters_Character;const x=Game_CharacterBase.prototype.isOnBush;Game_CharacterBase.prototype.isOnBush=function(){if(a.a.isDisabled()||!this.mv3d_sprite)return x.apply(this,arguments);const t=Math.round(this._realX),e=Math.round(this._realY),i=a.a.getTileData(t,e),s=a.a.getTileLayers(t,e,this.mv3d_sprite.z+this.mv3d_sprite.getCHeight()),r=$gameMap.tilesetFlags();for(const t of s)if(0!=(64&r[i[t]]))return!0;return!1},Object.assign(a.a,{showAnimation(t){t||(t=$gamePlayer.mv3d_sprite)},showBalloon:t=>(t||(t=$gamePlayer.mv3d_sprite),new animations_Balloon(t))});class animations_Balloon extends s.r{constructor(t){super("balloon",animations_Balloon.Manager()),animations_Balloon.list.push(this),this.char=t}update(){if(!this.char)return;const t=s.x.TransformCoordinates(new s.x(0,1+.5/this.char.mesh.scaling.y,0),this.char.mesh.getWorldMatrix());this.position.copyFrom(t);const e=this.char.char.mv_sprite._balloonSprite;e&&(this.cellIndex=8*(e._balloonId-1)+Math.max(0,e.frameIndex()))}dispose(){super.dispose();const t=animations_Balloon.list.indexOf(this);t>=0&&animations_Balloon.list.splice(t,1),this._manager.markedForDisposal&&!this._manager.sprites.length&&this._manager.dispose()}}animations_Balloon.list=[],animations_Balloon.Manager=function(){return(!animations_Balloon.manager||animations_Balloon.manager.mapId!=$gameMap.mapId()||animations_Balloon.manager._capacity<$gameMap.events().length)&&(animations_Balloon.manager&&(animations_Balloon.manager.sprites.length?animations_Balloon.manager.markedForDisposal=!0:animations_Balloon.manager.dispose()),animations_Balloon.manager=new s.s("balloonManager","img/system/Balloon.png",$gameMap.events().length,48,a.a.scene),animations_Balloon.manager.texture.onLoadObservable.addOnce(()=>{animations_Balloon.manager.texture.updateSamplingMode(1)}),animations_Balloon.manager.mapId=$gameMap.mapId()),animations_Balloon.manager};const P=Sprite_Character.prototype.startAnimation;Sprite_Character.prototype.startAnimation=function(){if(P.apply(this,arguments),a.a.mapDisabled||!(SceneManager._scene instanceof Scene_Map))return;const t=this._animationSprites[this._animationSprites.length-1];a.a.pixiSprite.addChild(t)};const F=Sprite_Animation.prototype.updateScreenFlash;Sprite_Animation.prototype.updateScreenFlash=function(){F.apply(this,arguments),!a.a.mapDisabled&&SceneManager._scene instanceof Scene_Map&&(this._screenFlashSprite.x=0,this._screenFlashSprite.y=0)};const N=Sprite_Character.prototype.updateAnimationSprites;Sprite_Character.prototype.updateAnimationSprites=function(){if(N.apply(this,arguments),!a.a.mapDisabled&&this._animationSprites.length&&SceneManager._scene instanceof Scene_Map&&this._character.mv3d_sprite)for(const t of this._animationSprites){const e=t._animation.position,i=new s.x(0,3==e?0:1===e?.5:0===e?1:0,0),r=s.x.TransformCoordinates(i,this._character.mv3d_sprite.mesh.getWorldMatrix()),n=a.a.getScreenPosition(r),o=s.x.Distance(a.a.camera.globalPosition,r),h=a.a.camera.mode===s.l?a.a.getScaleForDist():a.a.getScaleForDist(o);t.behindCamera=n.behindCamera,t.update(),t.x=n.x,t.y=n.y,t.scale.set(h,h)}};const H=Sprite_Animation.prototype.updateCellSprite;Sprite_Animation.prototype.updateCellSprite=function(t,e){H.apply(this,arguments),this.behindCamera&&(t.visible=!1)};const R=Game_Map.prototype.parallaxOx;Game_Map.prototype.parallaxOx=function(){let t=R.apply(this,arguments);return a.a.mapDisabled?t:this._parallaxLoopX?t-816*a.a.blendCameraYaw.currentValue()/90:t};const B=Game_Map.prototype.parallaxOy;Game_Map.prototype.parallaxOy=function(){let t=B.apply(this,arguments);return a.a.mapDisabled?t:this._parallaxLoopY?t-816*a.a.blendCameraPitch.currentValue()/90:t},["setDisplayPos","scrollUp","scrollDown","scrollLeft","scrollRight"].forEach(t=>{const e=Game_Map.prototype[t];Game_Map.prototype[t]=function(){a.a.isDisabled()&&e.apply(this,arguments)}});const V=Game_Map.prototype.updateScroll;Game_Map.prototype.updateScroll=function(){if(a.a.mapDisabled)return V.apply(this,arguments);this._displayX=816*-a.a.blendCameraYaw.currentValue()/3600,this._displayY=816*-a.a.blendCameraPitch.currentValue()/3600},Game_CharacterBase.prototype.isNearTheScreen=function(){return Math.abs(this.x-a.a.cameraStick.x)<=a.a.RENDER_DIST&&Math.abs(this.y-a.a.cameraStick.y)<=a.a.RENDER_DIST},Object(_.m)(Game_Screen.prototype,"shake",t=>(function(){return 0}));const G=Utils.isOptionValid("test"),j=async(t,e)=>{const a=i(3),s=i(4),r=s.resolve(global.__dirname,t);await $(s.dirname(r)),await new Promise((t,i)=>{a.writeFile(r,e,e=>{e?i(e):t()})})},$=t=>new Promise((e,a)=>{const s=i(3),r=i(4);s.mkdir(r.resolve(global.__dirname,t),{recursive:!0},t=>{t&&"EEXIST"!==t.code?a(t):e()})}),z=DataManager.loadDataFile;DataManager.loadDataFile=function(t,e){e.startsWith("Test_mv3d_")&&(e=e.replace("Test_mv3d_","mv3d_")),z.call(this,t,e)};class DataProxy{constructor(t,e,a={}){if(this.varName=t,this.fileName=e,G){const t=i(3),s=i(4).resolve(nw.__dirname,"data",e);t.existsSync(s)||t.writeFileSync(s,JSON.stringify("function"==typeof a?a():a))}DataManager._databaseFiles.push({name:t,src:e}),this._dirty=!1,this._data_handler={get:(t,e)=>t[e]&&"object"==typeof t[e]?new Proxy(t[e],data_handler):t[e],set:(t,e,i)=>{this._dirty=!0,t[e]=i},deleteProperty:(t,e)=>{this._dirty=!0,delete t[e]}},this.writing=!1,DataProxy.list.push(this)}setup(){this._data=window[this.varName],G&&(window[this.varName]=new Proxy(this._data,this._data_handler))}async update(){G&&this._dirty&&!this.writing&&(this.writing=!0,this._dirty=!1,await j(`data/${this.fileName}`,JSON.stringify(this._data)),this.writing=!1)}}DataProxy.list=[],a.a.DataProxy=DataProxy;const Y=Scene_Boot.prototype.start;Scene_Boot.prototype.start=function(){Y.apply(this,arguments),a.a.setupData()},Object.assign(a.a,{setupData(){for(const t of DataProxy.list)t.setup()},updateData(){for(const t of DataProxy.list)t.update()}}),new DataProxy("mv3d_data","mv3d_data.json",()=>({id:crypto.getRandomValues(new Uint32Array(1))[0]})),a.a.features={},a.a.callFeature=function(t,e,...i){if(!this.featureEnabled(t))return;const a=this.features[t];e in a.methods&&a.methods[e](...i)},a.a.callFeatures=function(t,...e){for(const i in this.features)this.callFeature(i,t,...e)},a.a.featureEnabled=function(t){return t in this.features&&!!this.features[t].enabled()};a.a.Feature=class features_Feature{constructor(t,e,i=!0){Object.assign(this,{name:t,condition:i,methods:e}),a.a.features[t]=this}enabled(){return"function"==typeof this.condition?this.condition():Boolean(this.condition)}};i(5)}]);
//# sourceMappingURL=mv3d-babylon.js.map