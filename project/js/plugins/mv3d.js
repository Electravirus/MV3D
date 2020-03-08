/*:
@plugindesc 3D rendering in RPG Maker MV with babylon.js
version 0.5.1.5
@author Dread/Nyanak
@help

Requires version 1.6 of RPG Maker MV.  

If you are making a game with this plugin, please consider supporting my
patreon.  
https://www.patreon.com/cutievirus  
You can also unlock some patron-only features by becoming a patron, such as
Dynamic Shadows.  

Discord: http://cutievirus.com/discord

## Getting started

To use the plugin on a new or existing project, download [plugin.zip] and
extract the files into your project directory.
Then, load `babylon.js` and `mv3d.js` as plugins in that order.

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
Region and terrain tag configurations (defined in plugin parameters)
don't need to wrapped at all.

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


The height and offset of the lights can be set with lampHeight(),
flashlightHeight(), lampOffset(), and flashlightOffset().  
The height and offset of both the lamp and flashlight can be moved
together with lightHeight() and lightOffset().  
Examples: lampHeight(0.5), flashlightHeight(0.25), lightOffset(0,1.01)



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



### Regions and tiles

You can define region and tileset configurations in the map note by using
<mv3d-regions> and <mv3d-tiles> blocks.  
Example:  

    <mv3d-regions>
        12:slope(1)
    </mv3d-regions>
    <mv3d-tiles>
        A2,4,0:top(1,1)
    </mv3d-tiles>

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
    mv3d camera roll <n> <t>
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

    mv3d ＠t configure <functions>

Configure the target with a list of configuration functions.
Example: mv3d ＠p configure scale(2)

---

### Vehicle Commands

    mv3d <vehicle> speed <n>
    mv3d airship height <n>

The vehicles are boat, ship, and airship.  
Speed of the vehicle should be 1-6. It works the same as event speed.   
A higher airship can fly over higher mountains. Perhaps you could let the
player upgrade their airship's height and speed.


---

## Patron Knights:

- Whitely
- Izybelle
- Pumpkin Boss
- L
- hsumi
- nemoma
- AmalgamAsh


## Patron Heroes:

- A Memory of Eternity
- Fyoha
- 冬空 橙
- 中华国哥
- nyrion
- Vaan Auroris


@param options
@text Option Settings

@param 3dMenu
@text 3D Options Menu
@desc Whether 3D options will be in a submenu, regular options menu, or disabled.
@type Select
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
@default 8

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

@param eventsUpdateNear
@text Update All Events in Render Distance
@parent map
@type Boolean
@default true

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

@param WASD
@text WASD
@parent input
@type Boolean
@default true

@param dir8Movement
@text Diagonal Movement
@desc In smart mode, when diagonal movement fails, try moving straight.
@parent input
@type Combo
@option Off
@option Diagonal Basic
@option Diagonal Basic 3D Only
@option Diagonal Smart
@option Diagonal Smart 3D Only
@default Diagonal Smart

@param keyboardPitch
@text Control Pitch
@parent input
@desc Allow player to change pitch with pageup & pagedown.
@type Boolean
@default true

@param keyboardTurn
@text Allow Turning
@parent input
@desc Allows rotating camera with keyboard in 3rd person. Rotating is always allowed in 1st person.
@type Select
@option Turn with Q+E (requires WASD) @value QE
@option Turn with A+D and left+right @value AD
@option disabled
@default QE

@param keyboardStrafe
@text Allow Strafing
@parent input
@desc Allows strafing in 1st person mode.
@type Select
@option Strafe with Q+E (requires WASD) @value QE
@option Strafe with A+D and left+right @value AD
@option disabled
@default QE

@param turnIncrement
@text Turn Increment
@parent input
@description How many degrees the camera will turn when you press the turn button. Other numbers may also be entered.
@type Combo
@option 90
@option 45
@option SMOOTH
@default 90

@param yawSpeed
@text Turn Speed
@parent input
@description Speed when turning with keyboard (in degrees per second).
@type Number
@default 180

@param pitchSpeed
@text Pitch Speed
@parent input
@description Speed when changing pitch with keyboard (in degrees per second).
@type Number
@default 90


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

@param heightTrigger
@text Event Trigger Height
@desc If true, events will need to be at the same elevation as the player to be triggered.
@parent characters
@type Boolean
@default true

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

@param assets
@text Assets

@param shadowTexture
@text Shadow Texture
@parent assets
@type file
@dir img/MV3D
@require 1
@default shadow

@param alphaMask
@text Bush Alpha Texture
@parent assets
@type file
@dir img/MV3D
@require 1
@default bushAlpha

@param errorTexture
@text Error Texture
@parent assets
@type file
@dir img/MV3D
@require 1
@default errorTexture

@param requiredImages
@text Other Required Images
@desc Specify additional images here to prevent them from being excluded during deployment.
@parent assets
@type file[]
@dir img/MV3D
@require 1
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

*/!function(t){var e={};function i(a){if(e[a])return e[a].exports;var s=e[a]={i:a,l:!1,exports:{}};return t[a].call(s.exports,s,s.exports,i),s.l=!0,s.exports}i.m=t,i.c=e,i.d=function(t,e,a){i.o(t,e)||Object.defineProperty(t,e,{enumerable:!0,get:a})},i.r=function(t){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})},i.t=function(t,e){if(1&e&&(t=i(t)),8&e)return t;if(4&e&&"object"==typeof t&&t&&t.__esModule)return t;var a=Object.create(null);if(i.r(a),Object.defineProperty(a,"default",{enumerable:!0,value:t}),2&e&&"string"!=typeof t)for(var s in t)i.d(a,s,function(e){return t[e]}.bind(null,s));return a},i.n=function(t){var e=t&&t.__esModule?function(){return t.default}:function(){return t};return i.d(e,"a",e),e},i.o=function(t,e){return Object.prototype.hasOwnProperty.call(t,e)},i.p="",i(i.s=13)}([function(t,e,i){"use strict";var a=i(2),s=i(1);const r={util:s.h,setup(){if(this.setupParameters(),Object(a.z)(),this.canvas=document.createElement("canvas"),this.texture=PIXI.Texture.fromCanvas(this.canvas),this.engine=new a.d(this.canvas,this.ANTIALIASING),this.scene=new a.p(this.engine),this.scene.clearColor.set(0,0,0,0),this.cameraStick=new a.u("cameraStick",this.scene),this.cameraNode=new a.u("cameraNode",this.scene),this.cameraNode.parent=this.cameraStick,this.camera=new a.g("camera",new a.w(0,0,0),this.scene),this.camera.parent=this.cameraNode,this.camera.fov=Object(s.i)(r.FOV),this.camera.minZ=.1,this.camera.maxZ=this.RENDER_DIST,this.scene.ambientColor=new a.b(1,1,1),this.scene.fogMode=a.e,this.map=new a.k("map",this.scene),this.cells={},this.characters=[],this.setupBlenders(),this.setupInput(),this.setupSpriteMeshes(),this.callFeatures("setup"),isNaN(this.LIGHT_LIMIT)){const t=BABYLON.Scene.prototype.sortLightsByPriority;BABYLON.Scene.prototype.sortLightsByPriority=function(){t.apply(this,arguments),r.updateAutoLightLimit()}}},updateCanvas(){this.canvas.width=Graphics._width,this.canvas.height=Graphics._height},render(){this.scene.render(),this.texture.update()},lastMapUpdate:0,update(){performance.now()-this.lastMapUpdate>1e3&&!this.mapUpdating&&(this.updateMap(),this.lastMapUpdate=performance.now()),this.updateAnimations(),this.updateCharacters(),this.intensiveUpdate(),this.updateBlenders(),this.updateInput();for(const t in this.cells)this.cells[t].update();this.callFeatures("update"),this.updateData()},loadData:(t,e)=>$gameVariables&&$gameVariables.mv3d&&t in $gameVariables.mv3d?$gameVariables.mv3d[t]:e,saveData(t,e){if(!$gameVariables)return console.warn(`MV3D: Couldn't save data ${t}:${e}`);$gameVariables.mv3d||($gameVariables.mv3d={}),$gameVariables.mv3d[t]=e},updateCameraMode(){let t=!1;this.cameraMode.startsWith("O")?this.camera.mode!==a.l&&(this.camera.mode=a.l,t=!0):this.camera.mode!==a.m&&(this.camera.mode=a.m,t=!0),t&&(this.updateBlenders(!0),this.callFeatures("updateCameraMode"),this.updateParameters())},get cameraMode(){return this.loadData("cameraMode",this.CAMERA_MODE).toUpperCase()},set cameraMode(t){t=String(t).toUpperCase().startsWith("O")?"ORTHOGRAPHIC":"PERSPECTIVE",this.saveData("cameraMode",t),this.updateBlenders(!0)},is1stPerson(t){const e=t?"currentValue":"targetValue";return this.getCameraTarget()===$gamePlayer&&this.blendCameraTransition[e]()<=0&&this.blendCameraDist[e]()<=0&&0===this.blendPanX[e]()&&0===this.blendPanY[e]()},isDisabled(){return this.loadData("disabled",this.getMapConfig("disabled",!r.ENABLED_DEFAULT))},disable(t=2){r.saveData("disabled",!0),$gamePlayer.reserveTransfer($gameMap.mapId(),$gamePlayer.x,$gamePlayer.y,$gamePlayer.direction(),t)},enable(t=2){r.saveData("disabled",!1),$gamePlayer.reserveTransfer($gameMap.mapId(),$gamePlayer.x,$gamePlayer.y,$gamePlayer.direction(),t),r.createCharacters()},loopCoords(t,e){if($gameMap.isLoopHorizontal()){const e=$gameMap.width(),i=this.cameraStick.x-e/2;t=(t-i).mod(e)+i}if($gameMap.isLoopVertical()){const t=$gameMap.height(),i=this.cameraStick.y-t/2;e=(e-i).mod(t)+i}return new a.v(t,e)},autoLightLimit(t){return isNaN(this.LIGHT_LIMIT)?Math.max(4,t):this.LIGHT_LIMIT},updateAutoLightLimit(){const t=this.autoLightLimit(r.scene.lights.length);for(const e of Object.values(r.materialCache))e.maxSimultaneousLights=t;for(const t of this.characters)t.material&&(t.material.maxSimultaneousLights=this.autoLightLimit(t.mesh.lightSources.length))},getFieldSize(t=r.blendCameraDist.currentValue()){const e=Math.tan(r.camera.fov/2)*t*2;return{width:e*r.engine.getAspectRatio(r.camera),height:e}},getScaleForDist(t=r.blendCameraDist.currentValue()){return Graphics.height/this.getFieldSize(t).height/48},getScreenPosition(t,e=a.w.Zero()){const i=t.parent?t.parent.getWorldMatrix():BABYLON.Matrix.Identity(),s=t instanceof a.w?t.add(e):t.position.add(e),n=a.w.Project(s,i,r.scene.getTransformMatrix(),r.camera.viewport);return{x:n.x*Graphics.width,y:n.y*Graphics.height,behindCamera:n.z>1}}};window.mv3d=r,e.a=r},function(t,e,i){"use strict";i.d(e,"k",(function(){return h})),i.d(e,"q",(function(){return l})),i.d(e,"e",(function(){return c})),i.d(e,"f",(function(){return p})),i.d(e,"j",(function(){return d})),i.d(e,"s",(function(){return u})),i.d(e,"i",(function(){return g})),i.d(e,"p",(function(){return m})),i.d(e,"o",(function(){return _})),i.d(e,"r",(function(){return b})),i.d(e,"g",(function(){return T})),i.d(e,"w",(function(){return y})),i.d(e,"l",(function(){return C})),i.d(e,"u",(function(){return v})),i.d(e,"v",(function(){return M})),i.d(e,"t",(function(){return S})),i.d(e,"b",(function(){return E})),i.d(e,"c",(function(){return O})),i.d(e,"d",(function(){return I})),i.d(e,"a",(function(){return P})),i.d(e,"m",(function(){return L})),i.d(e,"n",(function(){return R}));var a=i(0);const{Vector2:s,Vector3:r,Color3:n,Color4:o}=window.BABYLON,h=t=>{if("number"==typeof t)return{r:(t>>16)/255,g:(t>>8&255)/255,b:(255&t)/255,a:1};if(t instanceof n)return t.toColor4();if(t instanceof o)return t;{const e=document.createElement("canvas");e.width=1,e.height=1;const i=e.getContext("2d");i.fillStyle=t,i.fillRect(0,0,1,1);const a=i.getImageData(0,0,1,1).data;return new o(a[0]/255,a[1]/255,a[2]/255,a[3]/255)}},l=(t,e)=>{if(""===e)return+t;const i=/^[+]/.test(e);return i&&(e=e.substr(1)),e=Number(e),Number.isNaN(e)?+t:i?+t+e:+e},c=t=>isNaN(t)?p(t):Number(t),p=t=>Boolean(d(t)),d=t=>{if(!t)return!1;"string"!=typeof t&&(t=String(t));const e=t.toUpperCase();return!d.values.includes(e)&&t};d.values=["OFF","FALSE","UNDEFINED","NULL","DISABLE","DISABLED"];const u=(t=0)=>new Promise(e=>setTimeout(e,t)),g=t=>t*Math.PI/180,m=t=>180*t/Math.PI,f=(t,e)=>Math.atan2(-e,t)-Math.PI/2,_=(t,e)=>m(f(t,e)),b=t=>y(Math.sin(t),1e15),T=t=>y(Math.cos(t),1e15),y=(t,e=1e15)=>Math.round(t*e)/e,C=(t,e,i)=>Math.min(e,Math.max(t,i)),v=()=>M(),M=()=>Game_Map.prototype.tileWidth(),S=()=>Game_Map.prototype.tileHeight(),E=new r(1,0,0),O=new r(0,1,0),I=new r(0,0,1),w=new s(0,0),A=new r(0,0,0),P=Math.PI,D=2*Math.PI,L=t=>{const e=function(){const e=arguments.length;return"function"==typeof t[e]?t[e].apply(this,arguments):"function"==typeof t.default?t.default.apply(this,arguments):void console.warn("Unsupported number of arguments.")};for(const i in t)e[i]=t[i].bind;return e},x=()=>!a.a.isDisabled(),R=(t,e,i,a=x)=>{const s=t[e],r=i(s),n=function(){return("function"==typeof a?a():a)?r.apply(this,arguments):s.apply(this,arguments)};return Object.defineProperty(n,"name",{value:`${e}<mv3d_override>`}),Object.defineProperty(r,"name",{value:`${e}<mv3d>`}),n.oldMethod=s,n.newMethod=r,t[e]=n},F={makeColor:h,hexNumber:t=>((t=String(t)).startsWith("#")&&(t=t.substr(1)),Number.parseInt(t,16)),relativeNumber:l,booleanString:p,falseString:d,booleanNumber:c,sleep:u,degtorad:g,radtodeg:m,sin:b,cos:T,unround:y,tileSize:v,tileWidth:M,tileHeight:S,pointtorad:f,pointtodeg:_,minmax:C,XAxis:E,YAxis:O,ZAxis:I,v2origin:w,v3origin:A,PI:P,PI2:D,overload:L,override:R};e.h=F},function(t,e,i){"use strict";var a=i(0),s=i(1);function r(t){n(t,"if (texture2D(diffuseSampler,vUV).a<0.4)",`if (texture2D(diffuseSampler,vUV).a<${mv3d.ALPHA_CUTOFF})`)}function n(t,e,i){BABYLON.Effect.ShadersStore[t]=BABYLON.Effect.ShadersStore[t].replace(e,i)}i.d(e,"p",(function(){return h})),i.d(e,"d",(function(){return l})),i.d(e,"g",(function(){return c})),i.d(e,"q",(function(){return u})),i.d(e,"o",(function(){return g})),i.d(e,"v",(function(){return f})),i.d(e,"w",(function(){return _})),i.d(e,"b",(function(){return T})),i.d(e,"n",(function(){return C})),i.d(e,"k",(function(){return v})),i.d(e,"u",(function(){return M})),i.d(e,"t",(function(){return E})),i.d(e,"i",(function(){return w})),i.d(e,"x",(function(){return A})),i.d(e,"j",(function(){return P})),i.d(e,"r",(function(){return x})),i.d(e,"s",(function(){return R})),i.d(e,"f",(function(){return F})),i.d(e,"a",(function(){return N})),i.d(e,"c",(function(){return H})),i.d(e,"m",(function(){return B})),i.d(e,"l",(function(){return G})),i.d(e,"e",(function(){return z})),i.d(e,"y",(function(){return Y})),i.d(e,"h",(function(){return k})),i.d(e,"z",(function(){return K}));const o=window.BABYLON,{Scene:h,Engine:l,FreeCamera:c,HemisphericLight:p,DirectionalLight:d,SpotLight:u,PointLight:g,ShadowGenerator:m,Vector2:f,Vector3:_,Vector4:b,Color3:T,Color4:y,Plane:C,Node:v,TransformNode:M,Texture:S,StandardMaterial:E,ShaderMaterial:O,Effect:I,Mesh:w,VertexData:A,MeshBuilder:P,AssetsManager:D,SceneSerializer:L,Sprite:x,SpriteManager:R}=o,{FRONTSIDE:F,BACKSIDE:N,DOUBLESIDE:H}=w,{PERSPECTIVE_CAMERA:B,ORTHOGRAPHIC_CAMERA:G}=o.Camera,{FOGMODE_NONE:j,FOGMODE_EXP:V,FOGMODE_EXP2:$,FOGMODE_LINEAR:z}=h,Y=o.Space.WORLD,k=o.Space.LOCAL;o.Space.BONE;S.prototype.crop=function(t=0,e=0,i=0,s=0,r=!1){const{width:n,height:o}=r?this.getBaseSize():this.getSize();i||(i=n-t),s||(s=o-e),a.a.EDGE_FIX&&(t+=a.a.EDGE_FIX,e+=a.a.EDGE_FIX,i-=2*a.a.EDGE_FIX,s-=2*a.a.EDGE_FIX),this.uScale=i/n,this.vScale=s/o,this.uOffset=t/n,this.vOffset=1-e/o-this.vScale};const U={x:{get(){return this.position?this.position.x:void 0},set(t){this.position&&(this.position.x=t)}},y:{get(){return this.position?-this.position.z:void 0},set(t){this.position&&(this.position.z=-t)}},z:{get(){return this.position?this.position.y:void 0},set(t){this.position&&(this.position.y=t)}}},W={pitch:{get(){return this.rotation?-Object(s.p)(this.rotation.x):void 0},set(t){this.rotation&&(this.rotation.x=-Object(s.i)(t))}},yaw:{get(){return this.rotation?-Object(s.p)(this.rotation.y):void 0},set(t){this.rotation&&(this.rotation.y=-Object(s.i)(t))}},roll:{get(){return this.rotation?-Object(s.p)(this.rotation.z):void 0},set(t){this.rotation&&(this.rotation.z=-Object(s.i)(t))}}};Object.defineProperties(v.prototype,U),Object.defineProperties(v.prototype,W),Object.defineProperties(x.prototype,U),Object.defineProperty(w.prototype,"order",{get(){return this._order},set(t){this._order=t,this._scene.sortMeshes()}});const X=(t,e)=>(0|t._order)-(0|e._order);h.prototype.sortMeshes=function(){this.meshes.sort(X)};const Z=h.prototype.addMesh;h.prototype.addMesh=function(t){Z.apply(this,arguments),"number"==typeof t._order&&this.sortMeshes()};const Q=h.prototype.removeMesh;function K(){r("shadowMapPixelShader"),r("depthPixelShader")}h.prototype.removeMesh=function(t){Q.apply(this,arguments),this.sortMeshes()},T.prototype.toNumber=y.prototype.toNumber=function(){return 255*this.r<<16|255*this.g<<8|255*this.b}},function(t,e,i){"use strict";var a=i(0);a.a.features={},a.a.callFeature=function(t,e,...i){if(!this.featureEnabled(t))return;const a=this.features[t];e in a.methods&&a.methods[e](...i)},a.a.callFeatures=function(t,...e){for(const i in this.features)this.callFeature(i,t,...e)},a.a.featureEnabled=function(t){return t in this.features&&!!this.features[t].enabled()};a.a.Feature=class Feature{constructor(t,e,i=!0){Object.assign(this,{name:t,condition:i,methods:e}),a.a.features[t]=this}enabled(){return"function"==typeof this.condition?this.condition():Boolean(this.condition)}}},function(t,e){t.exports=require("fs")},function(t,e){t.exports=require("path")},function(t,e,i){if(i(7),i(9),window.Imported&&Imported.YEP_SaveCore){const t=Scene_File.prototype.onLoadSuccess;Scene_File.prototype.onLoadSuccess=function(){t.apply(this,arguments),mv3d.needClearMap=!0}}},function(t,e,i){"use strict";i.r(e);var a=i(0);a.a["option-store"]={},a.a.options={"mv3d-renderDist":{name:"Render Distance",min:10,max:100,increment:5,wrap:!1,apply(t){a.a.RENDER_DIST=t},default:a.a.RENDER_DIST}},a.a.MIPMAP_OPTION&&(a.a.options["mv3d-mipmap"]={name:"Mipmapping",type:"bool",apply(t){a.a.MIPMAP=t,a.a.needReloadMap=!0},default:a.a.MIPMAP}),a.a.ENABLE_3D_OPTIONS&&i(8)},function(t,e,i){"use strict";i.r(e);var a=i(0),s=i(1);const r=Window_Options.prototype.makeCommandList;Window_Options.prototype.makeCommandList=function(){if(r.apply(this,arguments),2===a.a.ENABLE_3D_OPTIONS)this.addCommand("3D Options","mv3d-options");else if(1===a.a.ENABLE_3D_OPTIONS)for(const t in a.a.options)this.addCommand(a.a.options[t].name,t)};const n=Window_Options.prototype.statusText;Window_Options.prototype.statusText=function(t){const e=this.commandSymbol(t);this.getConfigValue(e);return"mv3d-options"===e?"":n.apply(this,arguments)},Object.defineProperty(ConfigManager,"mv3d-options",{get(){},set(t){SceneManager.push(Scene_3D_Options)},configurable:!0});const o=ConfigManager.makeData;ConfigManager.makeData=function(){const t=o.apply(this,arguments);return Object.assign(t,a.a["option-store"]),t};const h=ConfigManager.applyData;ConfigManager.applyData=function(t){h.apply(this,arguments);for(const e in a.a.options)e in t&&(a.a["option-store"][e]=t[e],a.a.options[e].apply(t[e]));a.a.updateParameters()};class Scene_3D_Options extends Scene_Options{createOptionsWindow(){this._optionsWindow=new Window_3D_Options,this._optionsWindow.setHandler("cancel",this.popScene.bind(this)),this.addWindow(this._optionsWindow)}terminate(){super.terminate(),a.a.updateParameters()}}class Window_3D_Options extends Window_Options{makeCommandList(){for(const t in a.a.options)this.addCommand(a.a.options[t].name,t)}}1===a.a.ENABLE_3D_OPTIONS&&Object(s.n)(Scene_Options.prototype,"terminate",t=>(function(){t.apply(this,arguments),a.a.updateParameters()}),!0),Window_Options.prototype._is_mv3d_option=function(t){return t in a.a.options},Window_Options.prototype._mv3d_cursor=function(t,e){const i=this.index(),s=this.commandSymbol(i);let r=this.getConfigValue(s);const n=a.a.options[s];if(n)if("bool"===n.type)this.changeValue(s,e>0);else{const i=n.min||0,a=n.values?n.values.length-1:n.max||1;r+=(n.increment||1)*e,t&&n.wrap||"ok"===t?(r>a&&(r=i),r<i&&(r=a)):r=r.clamp(i,a),this.changeValue(s,r)}},Object(s.n)(Window_Options.prototype,"statusText",t=>(function(e){const i=this.commandSymbol(e);if(!this._is_mv3d_option(i))return t.apply(this,arguments);const s=this.getConfigValue(i),r=a.a.options[i];return"bool"===r.type?this.booleanStatusText(s):r.values?r.values[s]:String(s)}),!0),Object(s.n)(Window_Options.prototype,"setConfigValue",t=>(function(e,i){if(!this._is_mv3d_option(e))return t.apply(this,arguments);a.a["option-store"][e]=i;const s=a.a.options[e];s.apply&&s.apply(i)}),!0),Object(s.n)(Window_Options.prototype,"getConfigValue",t=>(function(e){if(!this._is_mv3d_option(e))return t.apply(this,arguments);const i=a.a.options[e];let s=a.a["option-store"][e];return null==s&&(s=i.default||i.min||0),s}),!0),Object(s.n)(Window_Options.prototype,"cursorLeft",t=>(function(e){const i=this.commandSymbol(this.index());return this._is_mv3d_option(i)?this._mv3d_cursor(e,-1):t.apply(this,arguments)}),!0),Object(s.n)(Window_Options.prototype,"cursorRight",t=>(function(e){const i=this.commandSymbol(this.index());return this._is_mv3d_option(i)?this._mv3d_cursor(e,1):t.apply(this,arguments)}),!0),Object(s.n)(Window_Options.prototype,"processOk",t=>(function(){const e=this.index(),i=this.commandSymbol(e);if(!this._is_mv3d_option(i))return t.apply(this,arguments);let s=this.getConfigValue(i);const r=a.a.options[i];"bool"===r.type?this.changeValue(i,!s):this._mv3d_cursor("ok",1)}),!0)},function(t,e,i){"use strict";i.r(e);var a=i(0),s=i(1);Object.assign(a.a,{vehicleObstructed:(t,...e)=>vehicleObstructed.apply(t,e),tileCollision(t,e,i,s=!1,r=!1){if(!(t instanceof a.a.Character)){if(!t.mv3d_sprite)return!1;t=t.mv3d_sprite}const n="number"==typeof r?r:r?t.targetElevation:t.z,o=t.getCollisionHeight(n),h=this.getCollisionHeights(e,i);2==s&&(o.z1+=a.a.STAIR_THRESH,o.z2+=a.a.STAIR_THRESH);for(const n of h)if(o.z1<n.z2&&o.z2>n.z1)return 1!=s||!a.a.STAIR_THRESH||this.tileCollision(t,e,i,2,r);return!1},charCollision(t,e,i=!1,s=!1,r=s,n=!1){if(!(t instanceof a.a.Character)){if(!t.mv3d_sprite)return!1;t=t.mv3d_sprite}if(!(e instanceof a.a.Character)){if(!e.mv3d_sprite)return!1;e=e.mv3d_sprite}if(!(n||t.char._mv3d_hasCollide()&&e.char._mv3d_hasCollide()))return!1;const o="number"==typeof s?s:s?t.targetElevation:t.z,h="number"==typeof r?r:r?e.targetElevation:e.z,l=t.getCollisionHeight(o),c=n?e.getTriggerHeight(h):e.getCollisionHeight(h);return 2==i&&(l.z1+=a.a.STAIR_THRESH,l.z2+=a.a.STAIR_THRESH),!!(!n&&l.z1<c.z2&&l.z2>c.z1||n&&l.z1<=c.z2&&l.z2>=c.z1)&&(1!=i||!a.a.STAIR_THRESH||this.charCollision(t,e,2,s,r))},getPlatformFloatForCharacter(t,e,i,s={}){if(!(t instanceof a.a.Character)){if(!t.mv3d_sprite)return 0;t=t.mv3d_sprite}let r=a.a.getPlatformForCharacter(t,e,i,s).z2;if(t.hasFloat){const s=t.getCHeight();r+=a.a.getFloatHeight(e,i,t.z+Math.max(s,a.a.STAIR_THRESH),a.a.STAIR_THRESH>=s)}return r},getPlatformForCharacter(t,e,i,s={}){if(!(t instanceof a.a.Character)){if(!t.mv3d_sprite)return!1;t=t.mv3d_sprite}const r=t.getCHeight(),n=a.a.STAIR_THRESH>=r;return Object.assign(s,{char:t,gte:n}),this.getPlatformAtLocation(e,i,t.z+Math.max(r,a.a.STAIR_THRESH),s)},getPlatformAtLocation(t,e,i,s={}){const r=s.char,n=this.getCollisionHeights(t,e,s);n.push(...a.a.getEventsAt(t,e).filter(t=>{if(!(t.mv3d_sprite&&t._mv3d_isPlatform()&&t._mv3d_hasCollide()&&t.mv3d_sprite.visible))return!1;if(r){if(r.char===t||t.isMoving())return!1;let e=t.mv3d_sprite;for(;e=e.platformChar;)if(e===r||e===t.mv3d_sprite)return!1}return!0}).map(t=>t.mv3d_sprite.getCollisionHeight()));let o=n[0];for(const t of n)t.z2>o.z2&&(s.gte?t.z2<=i:t.z2<i)&&(o=t);return o},getEventsAt:(t,e)=>$gameMap.eventsXyNt(Math.round(t),Math.round(e)),isRampAt(t,e,i){const a=this.getTileData(t,e);let s=0;for(let r=0;r<4;++r){s+=this.getTileFringe(t,e,r),s+=this.getTileHeight(t,e,r);const n=this.getTileConfig(a[r],t,e,r);if(n.shape!==this.enumShapes.SLOPE)continue;const o=n.slopeHeight||1;if(i>=s-o&&i<=s)return{id:a[r],x:t,y:e,l:r,conf:n,z1:s-o,z2:s}}return!1},getRampData(t,e,i,s=null){const r=a.a.getTileId(t,e,i);if(s||(s=this.getTileConfig(r,t,e,i)),s.shape!==this.enumShapes.SLOPE)return!1;const n=a.a.getStackHeight(t,e,i);return{id:r,x:t,y:e,l:i,conf:s,z1:n-(s.slopeHeight||1),z2:n}},canPassRamp(t,e){if(5===t||t<=0||t>=10)return!0;const{dir:i}=a.a.getSlopeDirection(e.x,e.y,e.l,!0),s=$gameMap.roundXWithDirection(e.x,t),r=$gameMap.roundYWithDirection(e.y,t),n=this.isRampAt(s,r,i===t?e.z1:i===10-t?e.z2:(e.z1+e.z2)/2);if(n){const{dir:o}=a.a.getSlopeDirection(s,r,n.l,!0);return i!==t&&i!==10-t?i===o&&e.z1===n.z1&&e.z2===n.z2:i===o&&(i===t?e.z1===n.z2:e.z2===n.z1)}if(i!==t&&i!==10-t)return!1;const o=this.getPlatformAtLocation(s,r,(i===t?e.z1:e.z2)+a.a.STAIR_THRESH).z2;return Math.abs(o-(i===t?e.z1:e.z2))<=a.a.STAIR_THRESH}}),Game_CharacterBase.prototype._mv3d_isFlying=function(){return this.mv3d_sprite&&this.mv3d_sprite.blendElevation.currentValue()>0},Game_Vehicle.prototype._mv3d_isFlying=function(){return this.isAirship()||Game_CharacterBase.prototype._mv3d_isFlying.apply(this,arguments)},Game_Player.prototype._mv3d_isFlying=function(){return!(!this.isInVehicle()||!this.vehicle().isAirship())||Game_CharacterBase.prototype._mv3d_isFlying.apply(this,arguments)},Game_CharacterBase.prototype._mv3d_isPlatform=function(){return this.mv3d_sprite&&this.mv3d_sprite.getConfig("platform",a.a.WALK_ON_EVENTS)},Game_CharacterBase.prototype._mv3d_hasCollide=function(){const t=this.mv3d_sprite;return!(!t||!1===t.getConfig("collide"))&&(this._mv3d_isPlatform()||Boolean(t.getCHeight()))},window.Imported&&Imported.QMovement?i(10):PluginManager._scripts.includes("AltimitMovement")&&Game_CharacterBase.prototype.moveVector?i(11):i(12);const r=Game_CharacterBase.prototype.jump;Game_CharacterBase.prototype.jump=function(t,e){if(a.a.isDisabled())return r.apply(this,arguments);this.mv3d_jumpHeightStart=a.a.getWalkHeight(this.x,this.y),this.mv3d_jumpHeightEnd=a.a.getWalkHeight(this.x+t,this.y+e),r.apply(this,arguments)},Object(s.n)(Game_Map.prototype,"allTiles",t=>(function(t,e){return this.layeredTiles(t,e)}))},function(t,e,i){"use strict";i.r(e);var a=i(1),s=i(0);i(3);Object(a.n)(ColliderManager,"update",t=>(function(){this.hide()})),Object(a.n)(ColliderManager.container,"update",t=>(function(){this.visible&&t.apply(this,arguments)}),!0);let r={};function n(t,e,i,a){const s=new Box_Collider($gameMap.tileWidth(),$gameMap.tileHeight());return s.x=t*$gameMap.tileWidth(),s.y=e*$gameMap.tileHeight(),s.mv3d_collider=i,s.mv3d_collider_type=a,s}s.a.getQTileColliders=()=>r;const o={z1:-1/0,z2:1/0};function h(t,e){return!t.mv3d_collider||!e.mv3d_collider||l(t=t.mv3d_collider,e=e.mv3d_collider)}function l(t,e){return t.z1<e.z2&&t.z2>e.z1&&t.z1+s.a.STAIR_THRESH<e.z2&&t.z2+s.a.STAIR_THRESH>e.z1}Object(a.n)(Game_Map.prototype,"setupMapColliders",t=>(function(){this._tileCounter=0,r={};for(let e=0;e<this.width();e++)for(let i=0;i<this.height();i++){const a=e*this.tileWidth(),h=i*this.tileHeight(),l=this.tilesetFlags(),c=s.a.getTileData(e,i),p=s.a.getCollisionHeights(e,i,{layers:!0,slopeMin:!0}),d=r[[e,i]]=[];for(let t=0;t<p.length;++t)d[t]=n(e,i,p[t],"mv3d");r[[e,i,"x"]]=n(e,i,o,"mv3d_x");for(let n=0;n<c.length;++n){const d=l[c[n]],u=s.a.getTilePassage(c[n],e,i,n);if(u===s.a.enumPassage.THROUGH)continue;const g=s.a.getTileConfig(e,i,n);if(g.shape===s.a.enumShapes.SLOPE){const t=s.a.getRampData(e,i,n,g);let l=0;s.a.canPassRamp(2,t)||(l|=1),s.a.canPassRamp(4,t)||(l|=2),s.a.canPassRamp(6,t)||(l|=4),s.a.canPassRamp(8,t)||(l|=8),l+=1536;const c=s.a.getStackHeight(e,i,n),p=c-(g.slopeHeight||1);let d=QMovement.tileBoxes[l];const u=[e,i,n,"slope"].toString();if(r[u]=[],d){d[0].constructor!==Array&&(d=[d]);for(const t of d){const e=new Box_Collider(t[0]||0,t[1]||0,t[2],t[3]);e.slopeZ1=p,e.slopeZ2=c,e.moveTo(a,h),e.mv3d_collider=o,r[u].push(e)}}}let m;p.layers[n]&&((m=p.layers[n]).passage=u,m.l=n);let f=this.getMapCollider(e,i,d);if(f)if((f=Array.from(f))[0].constructor===Array)for(var t=0;t<f.length;t++)f[t].mv3d_collider=m,f[t].isRegionCollider=!0,this.makeTileCollider(e,i,d,f[t],t);else f.mv3d_collider=m,f.isQCollider=!0,this.makeTileCollider(e,i,d,f,0)}}}),!0),Object(a.n)(Game_Map.prototype,"makeTileCollider",t=>(function(e,i,a,s,r){const n=t.apply(this,arguments);return s.mv3d_collider&&(s.isRegionCollider?n.mv3d_collider=o:s.isQCollider?(n.mv3d_collider={z1:-1/0,z2:1/0},s.mv3d_collider&&(n.mv3d_collider.l=s.mv3d_collider.l)):n.mv3d_collider=s.mv3d_collider),n}),!0),Object(a.n)(Game_CharacterBase.prototype,"collider",t=>(function(){const e=t.apply(this,arguments);return this.mv3d_sprite?(e.mv3d_collider||(Object.defineProperty(e,"mv3d_collider",{configurable:!0,value:this.mv3d_sprite.getCollider()}),Object.defineProperty(e,"mv3d_triggerCollider",{configurable:!0,value:this.mv3d_sprite.getTriggerCollider()})),e):e})),Object(a.n)(ColliderManager,"getCollidersNear",t=>(function(e,i,n){let o=!1;const l=t.call(this,e,t=>{if(!1===h(e,t))return!1;if(e.mv3d_collider){const i=Math.round(t.x/QMovement.tileSize),a=Math.round(t.y/QMovement.tileSize);if(e.mv3d_collider.char){if(e.mv3d_collider.char.getPlatform(i,a).char)return!1}if(t.mv3d_collider){if(!s.a.getTileLayers(i,a,e.mv3d_collider.z1+s.a.STAIR_THRESH).includes(t.mv3d_collider.l))return!1}}if(i){const e=i(t);return"break"===e&&(o=!0),e}return!0},n);if(o)return l;const c=(e.x+e._offset.x-1)/QMovement.tileSize,p=(e.y+e._offset.y-1)/QMovement.tileSize,d=(e.x+e._offset.x+e.width+1)/QMovement.tileSize,u=(e.y+e._offset.y+e.height+1)/QMovement.tileSize;if(e.mv3d_collider)for(let t=Math.floor(c);t<Math.ceil(d);++t)for(let n=Math.floor(p);n<Math.ceil(u);++n){const o=r[[t,n]],c=r[[t,n,"x"]];let p=null,d=!1;const u=s.a.getTileLayers(t,n,e.mv3d_collider.z1+s.a.STAIR_THRESH);for(const e of u){s.a.getTilePassage(t,n,e)===s.a.enumPassage.WALL&&(d=!0);const i=[t,n,e,"slope"].toString();i in r&&(p=r[i])}let g=!1;if(c&&e.mv3d_collider.char){const r=e.mv3d_collider.char,o={slopeMin:!0},h=r.getPlatform(t,n,o);if(o.platform=h,r.falling&&!r.char._mv3d_isFlying())g=!0;else if(d&&!h.char)g=!0;else if(!p||r.platform.char||h.char)s.a.WALK_OFF_EDGE||r.char._mv3d_isFlying()||r.platform&&r.platform.isSlope||!(Object(a.w)(Math.abs(r.getPlatformFloat(t,n,o)-r.targetElevation))>s.a.STAIR_THRESH)||(g=!0);else for(const t of p){if(s.a.WALK_OFF_EDGE&&r.z>t.slopeZ1)continue;let e=!0;if(i&&(e=i(t)),!1===e);else if(l.push(t),"break"===e)return l}if(g){let t=!0;if(i&&(t=i(c)),!1!==t){if(l.push(c),"break"===t)return l;continue}}}if(o)for(let t=0;t<o.length;++t)if(h(e,o[t]))if(i){const e=i(o[t]);if(!1!==e&&l.push(o[t]),"break"===e)return l}else l.push(o[t])}return l})),Object(a.n)(ColliderManager,"getCharactersNear",t=>(function(e,i){return t.call(this,e,t=>{const a=t.mv3d_sprite;if(!a)return!0;const s=e.mv3d_collider,r=$gameTemp._mv3d_Q_getCharactersTriggerHeight?a.getTriggerHeight():a.getCollisionHeight();return!s||!r||!1!==l(s,r)&&(!i||i(t))})})),Object(a.n)(Game_Player.prototype,"startMapEvent",t=>(function(e,i,a,s){$gameTemp._mv3d_Q_getCharactersTriggerHeight=!0,t.apply(this,arguments),$gameTemp._mv3d_Q_getCharactersTriggerHeight=!1})),s.a.Character.prototype.getPlatform=function(t=this.char._realX,e=this.char._realY,i={}){const a=(t-.5)*QMovement.tileSize,r=(e-.5)*QMovement.tileSize,n=this.char.collider(),o=(a+n._offset.x+1)/QMovement.tileSize,h=(r+n._offset.y+1)/QMovement.tileSize,l=(a+n._offset.x+n.width-1)/QMovement.tileSize,c=(r+n._offset.y+n.height-1)/QMovement.tileSize;return[s.a.getPlatformForCharacter(this,o,h,i),s.a.getPlatformForCharacter(this,l,h,i),s.a.getPlatformForCharacter(this,l,c,i),s.a.getPlatformForCharacter(this,o,c,i)].reduce((t,e)=>t.z2>=e.z2?t:e)},s.a.getEventsAt=function(t,e){let i;try{i=ColliderManager._characterGrid[Math.round(t)][Math.round(e)]}catch(t){return[]}return i?i.filter(t=>t instanceof Game_Event&&!t.isThrough()):[]},s.a.setDestination=function(t,e){$gameTemp.setPixelDestination(Math.round(t*$gameMap.tileWidth()),Math.round(e*$gameMap.tileHeight()))};const c=Game_Player.prototype.clearMouseMove;Game_Player.prototype.clearMouseMove=function(){c.apply(this,arguments),this._pathfind&&this.clearPathfind()};const p={1:[4,2],3:[6,2],7:[4,8],9:[6,8]},d=t=>(function(t){if($gameMap.offGrid())this.mv3d_QMoveRadian(t);else if((t=s.a.transformDirection(t))%2){const e=p[t];this.moveDiagonally(e[0],e[1])}else this.moveStraight(t)});Object(a.n)(Game_Player.prototype,"moveInputHorizontal",d),Object(a.n)(Game_Player.prototype,"moveInputVertical",d),Object(a.n)(Game_Player.prototype,"moveInputDiagonal",d),Game_Player.prototype.mv3d_QMoveRadian=function(t,e=this.moveTiles()){this.moveRadian(-Object(a.i)(s.a.blendCameraYaw.currentValue()+90+s.a.dirToYaw(t)),e)},Object(a.n)(Game_Character.prototype,"moveRadian",t=>(function(e,i){t.apply(this,arguments);const r=s.a.yawToDir(Object(a.p)(-e)-90,!0);this.mv3d_setDirection(r)})),Object(a.n)(Game_Character.prototype,"moveDiagonally",t=>(function(e,i){t.apply(this,arguments);const a=5+3*(Math.floor((i-1)/3)-1)+((e-1)%3-1);this.mv3d_setDirection(a)})),Game_Follower.prototype.updateMoveList&&Object(a.n)(Game_Follower.prototype,"updateMoveList",t=>(function(){const e=this._moveList[0];t.apply(this,arguments),e&&this.mv3d_setDirection(e[3])}))},function(t,e,i){"use strict";i.r(e);var a=i(1);function s(t,e){return t=t.getCollisionHeight(),e=e.getCollisionHeight(),t.z1===t.z2||e.z1===e.z2?t.z1<=e.z2&&t.z2>=e.z1:t.z1<e.z2&&t.z2>e.z1}Object(a.n)(Game_Player.prototype,"moveByInput",t=>(function(){$gameTemp._mv3d_altimit_moveByInput=!0,t.apply(this,arguments),$gameTemp._mv3d_altimit_moveByInput=!1})),mv3d.getInputDirection=function(){return mv3d.DIR8MOVE?Input.dir8:Input.dir4},Object(a.n)(Game_Player.prototype,"moveVector",t=>(function(e,i){if($gameTemp._mv3d_altimit_moveByInput&&!this._touchTarget){const t=e,s=i,r=Object(a.i)(mv3d.blendCameraYaw.currentValue());e=Object(a.g)(r)*t+Object(a.r)(r)*s,i=-Object(a.r)(r)*t+Object(a.g)(r)*s}this.mv3d_sprite&&this.mv3d_sprite.platform&&this.mv3d_sprite.platform.isSlope&&(Math.abs(e)>Math.abs(i)?(e=Math.round(this._x)-this._x+Math.sign(e),i=Math.round(this._y)-this._y):(e=Math.round(this._x)-this._x,i=Math.round(this._y)-this._y+Math.sign(i)),$gamePlayer._touchTarget&&($gamePlayer._touchTarget.x=Math.round($gamePlayer._touchTarget.x),$gamePlayer._touchTarget.y=Math.round($gamePlayer._touchTarget.y))),t.call(this,e,i)})),Object(a.n)(Game_CharacterBase.prototype,"setDirectionVector",t=>(function(t,e){this.mv3d_setDirection(mv3d.yawToDir(Object(a.o)(t,e),!0))})),Object(a.n)(Game_CharacterBase.prototype,"moveVectorMap",t=>(function(e,i,s,r,n,o){t.apply(this,arguments);const h=e.mv3d_sprite;if(!h)return;const l=Math.floor(e.x+i.x),c=Math.floor(e.y+i.y),p=Math.floor(e.x+r.x+i.aabbox.left),d=Math.ceil(e.x+r.x+i.aabbox.right),u=Math.floor(e.y+r.y+i.aabbox.top),g=Math.ceil(e.y+r.y+i.aabbox.bottom);for(let t=p;t<d;++t)for(let e=u;e<g;++e){const i=Input._makeNumpadDirection(Math.sign(t-l),Math.sign(e-c));let s;if((s=mv3d.isRampAt(t,e,h.z))&&mv3d.canPassRamp(10-i,s))continue;const n=$gameMap.roundXWithDirection(t,10-i),o=$gameMap.roundYWithDirection(e,10-i);if((s=mv3d.isRampAt(n,o,h.z))&&mv3d.canPassRamp(i,s))continue;let p=!1;if(this._mv3d_isFlying())(!mv3d.ALLOW_GLIDE&&mv3d.tileCollision(this,t,e,!0,!0)||mv3d.tileCollision(this,t,e,!0,!1))&&(p=!0);else if(h.falling)p=!0;else if(mv3d.tileCollision(this,t,e,!0,!0))p=!0;else if(!mv3d.WALK_OFF_EDGE){const i=mv3d.getPlatformFloatForCharacter(this,t,e);Object(a.w)(Math.abs(i-h.targetElevation))>mv3d.STAIR_THRESH&&(p=!0)}p&&(t!==l&&(r.x=0),e!==c&&(r.y=0))}})),Object(a.n)(Game_CharacterBase.prototype,"moveVectorCharacters",t=>(function(e,i,a,s,r){const n=this.mv3d_sprite;if(!n)return t.apply(this,arguments);const o=n.getCollisionHeight();return a=a.filter(t=>{const e=t.mv3d_sprite;if(!e)return!0;const i=e.getCollisionHeight();return o.z1<i.z2&&o.z2>i.z1}),t.call(this,e,i,a,s,r)})),mv3d.Character.prototype.getPlatform=function(t=this.char._realX,e=this.char._realY,i={}){const a=this.char.collider();if(0===a.type){t+=a.x-.5,e+=a.y-.5;const s=.95*a.radius,r=[mv3d.getPlatformForCharacter(this,t,e),mv3d.getPlatformForCharacter(this,t,e-s,i),mv3d.getPlatformForCharacter(this,t-s,e,i),mv3d.getPlatformForCharacter(this,t,e+s,i),mv3d.getPlatformForCharacter(this,t+s,e,i)],n=[-1/0,mv3d.getPlatformForCharacter(this,t-s*Math.SQRT1_2,e-s*Math.SQRT1_2,i),mv3d.getPlatformForCharacter(this,t-s*Math.SQRT1_2,e+s*Math.SQRT1_2,i),mv3d.getPlatformForCharacter(this,t+s*Math.SQRT1_2,e+s*Math.SQRT1_2,i),mv3d.getPlatformForCharacter(this,t+s*Math.SQRT1_2,e-s*Math.SQRT1_2,i)].filter(t=>t.z2<=this.z);return r.concat(n).reduce((t,e)=>t.z2>=e.z2?t:e)}{t-=.5,e-=.5;const s={l:.99*a.aabbox.left,r:.99*a.aabbox.right,t:.99*a.aabbox.top,b:.99*a.aabbox.bottom};return[mv3d.getPlatformForCharacter(this,t,e),mv3d.getPlatformForCharacter(this,t+s.l,e+s.t,i),mv3d.getPlatformForCharacter(this,t+s.l,e+s.b,i),mv3d.getPlatformForCharacter(this,t+s.r,e+s.t,i),mv3d.getPlatformForCharacter(this,t+s.r,e+s.b,i)].reduce((t,e)=>t.z2>=e.z2?t:e)}},mv3d.getEventsAt=function(t,e){return t=Math.round(t),e=Math.round(e),$gameMap.events().filter(i=>{if(i.isThrough())return!1;const{x:a,y:s}=i,{left:r,right:n,top:o,bottom:h}=i.collider().aabbox;return a+r<t+1&&a+n>t&&s+o<e+1&&s+h>e})},Object(a.n)(Game_Map.prototype,"events",t=>(function(){const e=t.apply(this,arguments);if(!$gameTemp._mv3d_altimit_eventsHeightFilter)return e;delete $gameTemp._mv3d_altimit_eventsHeightFilter;const i=$gamePlayer.mv3d_sprite;return i?e.filter(t=>{const e=t.mv3d_sprite;return!e||s(e,i)}):e})),Object(a.n)(Game_Event.prototype,"checkEventTriggerTouch",t=>(function(){const e=this.mv3d_sprite,i=$gamePlayer.mv3d_sprite;return!(e&&i&&!s(e,i))&&t.apply(this,arguments)}));const r=t=>(function(){return $gameTemp._mv3d_altimit_eventsHeightFilter=!0,t.apply(this,arguments)});Object(a.n)(Game_Player.prototype,"checkEventTriggerHere",r),Object(a.n)(Game_Player.prototype,"checkEventTriggerThere",r)},function(t,e,i){"use strict";i.r(e);var a=i(0),s=i(1);const r=Game_CharacterBase.prototype.canPass;function n(t,e,i,s){return e.some(e=>{const r=e._mv3d_isPlatform();if(a.a.WALK_OFF_EDGE&&!r){const r=a.a.getPlatformForCharacter(t,i,s).z2;if(a.a.charCollision(t,e,!1,r))return!0}return a.a.charCollision(t,e,r,!0)})}Game_CharacterBase.prototype.canPass=function(t,e,i){return!!r.apply(this,arguments)&&(a.a.isDisabled()||this.isDebugThrough()||this.isThrough(),!0)};const o=t=>(function(t,e){return n(this,$gameMap.eventsXyNt(t,e),t,e)});Object(s.n)(Game_CharacterBase.prototype,"isCollidedWithEvents",o),Object(s.n)(Game_Event.prototype,"isCollidedWithEvents",o),Object(s.n)(Game_Event.prototype,"isCollidedWithPlayerCharacters",t=>(function(t,e){if($gamePlayer.isThrough())return!1;return n(this,[$gamePlayer,...$gamePlayer.followers()._data.filter(t=>t.isVisible()&&t.mv3d_sprite&&t.mv3d_sprite.visible)].filter(i=>i.pos(t,e)),t,e)})),Object(s.n)(Game_CharacterBase.prototype,"isCollidedWithVehicles",t=>(function(t,e){const i=$gameMap.boat(),s=$gameMap.ship();return i.posNt(t,e)&&a.a.charCollision(this,i,i._mv3d_isPlatform(),!0)||s.posNt(t,e)&&a.a.charCollision(this,s,s._mv3d_isPlatform(),!0)}));const h=t=>(function(e,i,r){const n=this.mv3d_sprite;if(!n)return t.apply(this,arguments);$gameTemp._mv3d_collision_char=n;let o,h=!t.apply(this,arguments);if(delete $gameTemp._mv3d_collision_char,h)return!1;if((o=a.a.isRampAt(e,i,n.z))&&a.a.canPassRamp(r,o))return!0;var l=$gameMap.roundXWithDirection(e,r),c=$gameMap.roundYWithDirection(i,r);if((o=a.a.isRampAt(l,c,n.z))&&a.a.canPassRamp(10-r,o))return!0;if(this._mv3d_isFlying()){if(!a.a.ALLOW_GLIDE&&a.a.tileCollision(this,l,c,!0,!0)||a.a.tileCollision(this,l,c,!0,!1))return!1}else{if(a.a.tileCollision(this,l,c,!0,!0))return!1;if(n.falling)return!1;if(!a.a.WALK_OFF_EDGE){const t=a.a.getPlatformFloatForCharacter(this,l,c);if(Object(s.w)(Math.abs(t-n.targetElevation))>a.a.STAIR_THRESH)return!1}}return!0});Object(s.n)(Game_CharacterBase.prototype,"isMapPassable",h),Object(s.n)(Game_Vehicle.prototype,"isMapPassable",h),Object(s.n)(Game_Player.prototype,"startMapEvent",t=>(function(t,e,i,s){$gameMap.isEventRunning()||$gameMap.eventsXy(t,e).filter(t=>a.a.charCollision(this,t,!1,!1,!1,!0)).forEach(t=>{t.isTriggerIn(i)&&t.isNormalPriority()===s&&t.start()})}));const l=Game_Map.prototype.checkPassage;Game_Map.prototype.checkPassage=function(t,e,i){if(!("_mv3d_collision_char"in $gameTemp))return l.apply(this,arguments);const s=$gameTemp._mv3d_collision_char,r=s.getCHeight(),n=s.z+Math.max(r,a.a.STAIR_THRESH),o=a.a.getPlatformForCharacter(s,t,e);if(o.char)return!0;var h=this.tilesetFlags();const c=a.a.getTileLayers(t,e,n,a.a.STAIR_THRESH>=r),p=a.a.getTileData(t,e);for(var d=c.length-1;d>=0;--d){const s=c[d];if(15&i){const i=a.a.getTileConfig(t,e,s);if("pass"in i){if(i.pass===a.a.enumPassage.THROUGH)continue;if(i.pass===a.a.enumPassage.FLOOR)return!0;if(i.pass===a.a.enumPassage.WALL)return!1}}const r=h[p[s]];if(0==(16&r)){if(0==(r&i))return!0;if((r&i)===i)return!1}}return!1};const c=()=>!a.a.isDisabled()||a.a.DIR8MOVE&&a.a.DIR8_2D;Object(s.n)(Game_Player.prototype,"moveStraight",t=>(function(e){if(!a.a.DIR8MOVE)return t.apply(this,arguments);switch(e){case 1:this.moveDiagonally(4,2);break;case 3:this.moveDiagonally(6,2);break;case 7:this.moveDiagonally(4,8);break;case 9:this.moveDiagonally(6,8);break;default:t.apply(this,arguments)}}),c),Object(s.n)(Game_Character.prototype,"moveDiagonally",t=>(function(e,i){t.apply(this,arguments);let s=!1;if(this.isMovementSucceeded()?s=!0:a.a.DIR8SMART&&(this.moveStraight(e),this.isMovementSucceeded()||(this.moveStraight(i),this.isMovementSucceeded()||(s=!0))),s){const t=5+3*(Math.floor((i-1)/3)-1)+((e-1)%3-1);this.mv3d_setDirection(t)}}),c);const p=t=>(function(){const e=this._realX,i=this._realY;t.apply(this,arguments),Math.abs(e-this._realX)>2||Math.abs(i-this._realY)>2||(this._realX=e,this._realY=i)});Object(s.n)(Game_Follower.prototype,"moveDiagonally",p,c),Object(s.n)(Game_Follower.prototype,"moveStraight",p,c),Object(s.n)(Game_CharacterBase.prototype,"distancePerFrame",t=>(function(){const e=t.apply(this,arguments);return this._mv3d_direction%2?e*Math.SQRT1_2:e}),c);const d=Game_Map.prototype.isAirshipLandOk;Game_Map.prototype.isAirshipLandOk=function(t,e){return a.a.isDisabled()?d.apply(this,arguments):a.a.AIRSHIP_SETTINGS.bushLanding?this.checkPassage(t,e,15):d.apply(this,arguments)};const u=Game_Player.prototype.updateVehicleGetOn;Game_Player.prototype.updateVehicleGetOn=function(){if(a.a.isDisabled())return u.apply(this,arguments);const t=this.vehicle(),e=a.a.loadData(`${t._type}_speed`,t._moveSpeed);t.setMoveSpeed(e),u.apply(this,arguments),this.setThrough(!1)};const g=Game_Player.prototype.getOnVehicle;Game_Player.prototype.getOnVehicle=function(){if(a.a.isDisabled())return g.apply(this,arguments);var t=this.direction(),e=Math.round(this.x),i=Math.round(this.y),s=$gameMap.roundXWithDirection(e,t),r=$gameMap.roundYWithDirection(i,t);return $gameMap.airship().pos(e,i)&&a.a.charCollision(this,$gameMap.airship(),!1,!1,!1,!0)?this._vehicleType="airship":$gameMap.ship().pos(s,r)&&a.a.charCollision(this,$gameMap.ship())?this._vehicleType="ship":$gameMap.boat().pos(s,r)&&a.a.charCollision(this,$gameMap.boat())&&(this._vehicleType="boat"),this.isInVehicle()&&(this._vehicleGettingOn=!0,this.isInAirship()||this.forceMoveForward(),this.gatherFollowers()),this._vehicleGettingOn},Object(s.n)(Game_Vehicle.prototype,"isLandOk",t=>(function(e,i,s){$gameTemp._mv3d_collision_char=$gamePlayer.mv3d_sprite;let r=t.apply(this,arguments);if(delete $gameTemp._mv3d_collision_char,this.isAirship())return r;var n=$gameMap.roundXWithDirection(e,s),o=$gameMap.roundYWithDirection(i,s);const h=a.a.getPlatformForCharacter($gamePlayer,n,o);h.char&&(r=!0);const l=Math.abs(h.z2-this.z);return r&&l<Math.max($gamePlayer.mv3d_sprite.getCHeight(),this.mv3d_sprite.getCHeight())}))},function(t,e,i){"use strict";i.r(e);var a=i(0),s=i(2),r=i(1);const n=Graphics._createCanvas;Graphics._createCanvas=function(){a.a.setup(),a.a.updateCanvas(),n.apply(this,arguments)};const o=Graphics._updateAllElements;Graphics._updateAllElements=function(){o.apply(this,arguments),a.a.updateCanvas()};const h=Graphics.render;Graphics.render=function(){a.a.render(),h.apply(this,arguments)};const l=Scene_Map.prototype.update;Scene_Map.prototype.update=function(){l.apply(this,arguments),a.a.isDisabled()||a.a.update()};const c=ShaderTilemap.prototype.renderWebGL;ShaderTilemap.prototype.renderWebGL=function(t){a.a.mapDisabled&&c.apply(this,arguments)};const p=Spriteset_Map.prototype.createTilemap;Spriteset_Map.prototype.createTilemap=function(){p.apply(this,arguments),a.a.mapDisabled=a.a.isDisabled(),a.a.mapDisabled||(this._tilemap.visible=!1,a.a.pixiSprite=new PIXI.Sprite(a.a.texture),this._baseSprite.addChild(a.a.pixiSprite))};const d=Sprite_Character.prototype.setCharacter;Sprite_Character.prototype.setCharacter=function(t){d.apply(this,arguments),Object.defineProperty(t,"mv_sprite",{value:this,configurable:!0})};const u=Game_Player.prototype.performTransfer;Game_Player.prototype.performTransfer=function(){const t=this._newMapId!==$gameMap.mapId();t&&($gameVariables.mv3d&&delete $gameVariables.mv3d.disabled,a.a.clearMap(),delete $gamePlayer._mv3d_z),u.apply(this,arguments),a.a.is1stPerson()&&a.a.blendCameraYaw.setValue(a.a.dirToYaw($gamePlayer.direction(),0))};const g=Scene_Map.prototype.onMapLoaded;Scene_Map.prototype.onMapLoaded=function(){Input.clear(),a.a.needClearMap?(a.a.clearMap(),a.a.needClearMap=!1):a.a.needReloadMap&&(a.a.reloadMap(),a.a.needReloadMap=!1),a.a.loadMapSettings(),g.apply(this,arguments),a.a.mapLoaded||(a.a.applyMapSettings(),a.a.isDisabled()?a.a.mapReady=!0:(a.a.mapReady=!1,a.a.loadMap())),a.a.updateBlenders(!0)};const m=Game_Map.prototype.setupBattleback;Game_Map.prototype.setupBattleback=function(){m.apply(this,arguments),a.a.loadTilesetSettings()};const f=Scene_Load.prototype.onLoadSuccess;Scene_Load.prototype.onLoadSuccess=function(){f.apply(this,arguments),a.a.needClearMap=!0};const _=Scene_Map.prototype.isReady;Scene_Map.prototype.isReady=function(){let t=_.apply(this,arguments);return t&&a.a.mapReady};const b=Scene_Title.prototype.start;Scene_Title.prototype.start=function(){b.apply(this,arguments),a.a.clearMap(),a.a.clearCameraTarget()};const T=SceneManager.initGraphics;SceneManager.initGraphics=function(){if(T.apply(this,arguments),!Graphics.isWebGL())throw new Error("MV3D requires WebGL")};let y="mv3d";PluginManager._scripts.includes("mv3d")||PluginManager._scripts.includes("mv3d-babylon")&&(y="mv3d-babylon");const C=PluginManager.parameters(y);Object.assign(a.a,{CAMERA_MODE:"PERSPECTIVE",ORTHOGRAPHIC_DIST:100,MV3D_FOLDER:"img/MV3D",ANIM_DELAY:Number(C.animDelay),ALPHA_CUTOFF:Math.max(.01,C.alphatest),EDGE_FIX:Number(C.edgefix),ANTIALIASING:Object(r.f)(C.antialiasing),FOV:Number(C.fov),WALL_HEIGHT:Number(C.wallHeight),TABLE_HEIGHT:Number(C.tableHeight),FRINGE_HEIGHT:Number(C.fringeHeight),CEILING_HEIGHT:Number(C.ceilingHeight),LAYER_DIST:Number(C.layerDist),ENABLED_DEFAULT:Object(r.f)(C.enabledDefault),EVENTS_UPDATE_NEAR:Object(r.f)(C.eventsUpdateNear),UNLOAD_CELLS:Object(r.f)(C.unloadCells),CELL_SIZE:Number(C.cellSize),RENDER_DIST:Number(C.renderDist),MIPMAP:Object(r.f)(C.mipmap),MIPMAP_OPTION:Object(r.f)(C.mipmapOption),STAIR_THRESH:Number(C.stairThresh),WALK_OFF_EDGE:Object(r.f)(C.walkOffEdge),WALK_ON_EVENTS:Object(r.f)(C.walkOnEvents),GRAVITY:Number(C.gravity),FOG_COLOR:Object(r.k)(C.fogColor).toNumber(),FOG_NEAR:Number(C.fogNear),FOG_FAR:Number(C.fogFar),LIGHT_LIMIT:Number(C.lightLimit),LIGHT_HEIGHT:.5,LAMP_HEIGHT:.5,FLASHLIGHT_HEIGHT:.25,LIGHT_DECAY:1,LIGHT_DIST:3,LIGHT_ANGLE:60,FLASHLIGHT_EXTRA_ANGLE:10,FLASHLIGHT_INTENSITY_MULTIPLIER:2,REGION_DATA:{},_REGION_DATA:{},_REGION_DATA_MAP:{},TTAG_DATA:{},EVENT_HEIGHT:Number(C.eventHeight),BOAT_SETTINGS:JSON.parse(C.boatSettings),SHIP_SETTINGS:JSON.parse(C.shipSettings),AIRSHIP_SETTINGS:JSON.parse(C.airshipSettings),ALLOW_GLIDE:Object(r.f)(C.allowGlide),SPRITE_OFFSET:Number(C.spriteOffset)/2,ENABLE_3D_OPTIONS:{disable:0,enable:1,submenu:2}[C["3dMenu"].toLowerCase()],TEXTURE_SHADOW:C.shadowTexture||"shadow",TEXTURE_BUSHALPHA:C.alphaMask||"bushAlpha",TEXTURE_ERROR:C.errorTexture||"errorTexture",DIR8MOVE:Object(r.f)(C.dir8Movement),DIR8SMART:C.dir8Movement.includes("Smart"),DIR8_2D:!C.dir8Movement.includes("3D"),TURN_INCREMENT:Number(C.turnIncrement),WASD:Object(r.f)(C.WASD),KEYBOARD_PITCH:Object(r.f)(C.keyboardPitch),KEYBOARD_TURN:Object(r.j)(C.keyboardTurn),KEYBOARD_STRAFE:Object(r.j)(C.keyboardStrafe),YAW_SPEED:Number(C.yawSpeed)||90,PITCH_SPEED:Number(C.pitchSpeed)||90,TRIGGER_INFINITE:!Object(r.f)(C.heightTrigger),setupParameters(){this.REGION_DATA=new Proxy(this._REGION_DATA,{get:(t,e)=>e in this._REGION_DATA_MAP?this._REGION_DATA_MAP[e]:e in this._REGION_DATA?this._REGION_DATA[e]:void 0,set:(t,e,i)=>{t[e]=i},has:(t,e)=>e in this._REGION_DATA_MAP||e in this._REGION_DATA});for(let t of JSON.parse(C.regions)){t=JSON.parse(t);const e=this.readConfigurationFunctions(t.conf,this.tilesetConfigurationFunctions);this._REGION_DATA[t.regionId]=e}for(let t of JSON.parse(C.ttags))t=JSON.parse(t),this.TTAG_DATA[t.terrainTag]=this.readConfigurationFunctions(t.conf,this.tilesetConfigurationFunctions);this.EVENT_CHAR_SETTINGS=this.readConfigurationFunctions(C.eventCharDefaults,this.eventConfigurationFunctions),this.EVENT_OBJ_SETTINGS=this.readConfigurationFunctions(C.eventObjDefaults,this.eventConfigurationFunctions),this.EVENT_TILE_SETTINGS=this.readConfigurationFunctions(C.eventTileDefaults,this.eventConfigurationFunctions),this.BOAT_SETTINGS.big=Object(r.f)(this.BOAT_SETTINGS.big),this.SHIP_SETTINGS.big=Object(r.f)(this.SHIP_SETTINGS.big),this.AIRSHIP_SETTINGS.height=Number(this.AIRSHIP_SETTINGS.height),this.AIRSHIP_SETTINGS.big=Object(r.f)(this.AIRSHIP_SETTINGS.big),this.AIRSHIP_SETTINGS.bushLanding=Object(r.f)(this.AIRSHIP_SETTINGS.bushLanding),this.BOAT_SETTINGS.conf=this.readConfigurationFunctions(this.BOAT_SETTINGS.conf,this.eventConfigurationFunctions),this.SHIP_SETTINGS.conf=this.readConfigurationFunctions(this.SHIP_SETTINGS.conf,this.eventConfigurationFunctions),this.AIRSHIP_SETTINGS.conf=this.readConfigurationFunctions(this.AIRSHIP_SETTINGS.conf,this.eventConfigurationFunctions)},updateParameters(){this.camera.mode===s.l?(this.camera.maxZ=this.RENDER_DIST,this.camera.minZ=-this.RENDER_DIST):(this.camera.maxZ=this.RENDER_DIST,this.camera.minZ=.1),this.callFeatures("updateParameters")}}),Object.defineProperties(a.a,{AMBIENT_COLOR:{get:()=>a.a.featureEnabled("dynamicShadows")?8947848:16777215}}),Object.assign(a.a,{cameraTargets:[],getCameraTarget(){return this.cameraTargets[0]},setCameraTarget(t,e){t?(this.cameraTargets.unshift(t),this.cameraTargets.length>2&&(this.cameraTargets.length=2),this.saveData("cameraTarget",this.getTargetString(t)),this.blendCameraTransition.value=1,this.blendCameraTransition.setValue(0,e)):this.cameraTargets.length=0},clearCameraTarget(){this.cameraTargets.length=0},resetCameraTarget(){this.clearCameraTarget(),this.setCameraTarget($gamePlayer,0)},rememberCameraTarget(){const t=this.loadData("cameraTarget");t&&this.setCameraTarget(this.targetChar(t),0)},setupBlenders(){this.blendFogColor=new ColorBlender("fogColor",this.FOG_COLOR),this.blendFogNear=new blenders_Blender("fogNear",this.FOG_NEAR),this.blendFogFar=new blenders_Blender("fogFar",this.FOG_FAR),this.blendCameraRoll=new blenders_Blender("cameraRoll",0),this.blendCameraRoll.cycle=360,this.blendCameraYaw=new blenders_Blender("cameraYaw",0),this.blendCameraYaw.cycle=360,this.blendCameraPitch=new blenders_Blender("cameraPitch",60),this.blendCameraPitch.min=0,this.blendCameraPitch.max=180,this.blendCameraDist=new blenders_Blender("cameraDist",10),this.blendCameraDist.min=0,this.blendCameraHeight=new blenders_Blender("cameraHeight",.7),this.blendAmbientColor=new ColorBlender("ambientColor",this.AMBIENT_COLOR),this.blendPanX=new blenders_Blender("panX",0),this.blendPanY=new blenders_Blender("panY",0),this.blendCameraTransition=new blenders_Blender("cameraTransition",0)},updateBlenders(t){if(this.updateCameraMode(),this.cameraTargets.length||$gamePlayer&&(this.cameraTargets[0]=$gamePlayer),this.blendCameraTransition.update()&&this.cameraTargets.length>=2){const t=this.blendCameraTransition.currentValue();let e=this.cameraTargets[0],i=this.cameraTargets[1];this.cameraStick.x=e._realX*(1-t)+i._realX*t,this.cameraStick.y=e._realY*(1-t)+i._realY*t,e.mv3d_sprite&&i.mv3d_sprite?this.cameraStick.z=e.mv3d_sprite.z*(1-t)+i.mv3d_sprite.z*t:e.mv3d_sprite&&(this.cameraStick.z=e.mv3d_sprite.z)}else if(this.cameraTargets.length){let t=this.getCameraTarget();this.cameraStick.x=t._realX,this.cameraStick.y=t._realY,t.mv3d_sprite&&(this.cameraStick.z=t.mv3d_sprite.z)}if(this.blendPanX.update(),this.blendPanY.update(),this.cameraStick.x+=this.blendPanX.currentValue(),this.cameraStick.y+=this.blendPanY.currentValue(),t|this.blendCameraPitch.update()|this.blendCameraYaw.update()|this.blendCameraRoll.update()|this.blendCameraDist.update()|this.blendCameraHeight.update()|0!==$gameScreen._shake){if(this.cameraNode.pitch=this.blendCameraPitch.currentValue()-90,this.cameraNode.yaw=this.blendCameraYaw.currentValue(),this.camera.roll=this.blendCameraRoll.currentValue(),this.cameraNode.position.set(0,0,0),this.cameraNode.translate(r.d,-this.blendCameraDist.currentValue(),s.h),this.camera.mode===s.l){const t=this.getFieldSize();this.camera.orthoLeft=-t.width/2,this.camera.orthoRight=t.width/2,this.camera.orthoTop=t.height/2,this.camera.orthoBottom=-t.height/2}else this.cameraNode.z<0&&(this.cameraNode.z=0);this.cameraNode.z+=this.blendCameraHeight.currentValue(),this.cameraNode.translate(r.b,-$gameScreen._shake/48,s.h),this.updateDirection()}t|this.blendFogColor.update()|this.blendFogNear.update()|this.blendFogFar.update()&&(a.a.featureEnabled("alphaFog")?(this.scene.fogStart=this.blendFogNear.currentValue(),this.scene.fogEnd=this.blendFogFar.currentValue()):(this.scene.fogStart=Math.min(a.a.RENDER_DIST-1,this.blendFogNear.currentValue()),this.scene.fogEnd=Math.min(a.a.RENDER_DIST,this.blendFogFar.currentValue())),this.scene.fogColor.copyFromFloats(this.blendFogColor.r.currentValue()/255,this.blendFogColor.g.currentValue()/255,this.blendFogColor.b.currentValue()/255),$gameMap.parallaxName()||a.a.scene.clearColor.set(...a.a.blendFogColor.currentComponents(),1)),t|this.blendAmbientColor.update()&&this.scene.ambientColor.copyFromFloats(this.blendAmbientColor.r.currentValue()/255,this.blendAmbientColor.g.currentValue()/255,this.blendAmbientColor.b.currentValue()/255),this.callFeatures("blend",t)}});const v=Game_Map.prototype.changeParallax;Game_Map.prototype.changeParallax=function(){v.apply(this,arguments),$gameMap.parallaxName()?a.a.scene.clearColor.set(0,0,0,0):a.a.scene.clearColor.set(...a.a.blendFogColor.currentComponents(),1)};class blenders_Blender{constructor(t,e){this.key=t,this.dfault=a.a.loadData(t,e),this.value=e,this.speed=1,this.max=1/0,this.min=-1/0,this.cycle=!1,this.changed=!1}setValue(t,e=0){let i=(t=Math.min(this.max,Math.max(this.min,t)))-this.value;if(i){if(this.saveValue(this.key,t),e||(this.changed=!0,this.value=t),this.cycle)for(;Math.abs(i)>this.cycle/2;)this.value+=Math.sign(i)*this.cycle,i=t-this.value;this.speed=Math.abs(i)/(60*e)}}currentValue(){return this.value}targetValue(){return this.loadValue(this.key)}defaultValue(){return this.dfault}update(){const t=this.targetValue();if(this.value===t)return!!this.changed&&(this.changed=!1,!0);const e=t-this.value;return this.speed>Math.abs(e)?this.value=t:this.value+=this.speed*Math.sign(e),!0}storageLocation(){return $gameVariables?($gameVariables.mv3d||($gameVariables.mv3d={}),$gameVariables.mv3d):(console.warn("MV3D: Couldn't get Blend storage location."),{})}loadValue(t){const e=this.storageLocation();return t in e?e[t]:this.dfault}saveValue(t,e){this.storageLocation()[t]=e}}class ColorBlender{constructor(t,e){this.dfault=e,this.r=new blenders_Blender(`${t}_r`,e>>16),this.g=new blenders_Blender(`${t}_g`,e>>8&255),this.b=new blenders_Blender(`${t}_b`,255&e)}setValue(t,e){this.r.setValue(t>>16,e),this.g.setValue(t>>8&255,e),this.b.setValue(255&t,e)}currentValue(){return this.r.value<<16|this.g.value<<8|this.b.value}targetValue(){return this.r.targetValue()<<16|this.g.targetValue()<<8|this.b.targetValue()}defaultValue(){return this.dfault}update(){let t=0;return t|=this.r.update(),t|=this.g.update(),t|=this.b.update(),Boolean(t)}get storageLocation(){return this.r.storageLocation}set storageLocation(t){this.r.storageLocation=t,this.g.storageLocation=t,this.b.storageLocation=t}currentComponents(){return[this.r.currentValue()/255,this.g.currentValue()/255,this.b.currentValue()/255]}targetComponents(){return[this.r.targetValue()/255,this.g.targetValue()/255,this.b.targetValue()/255]}}a.a.Blender=blenders_Blender,a.a.ColorBlender=ColorBlender,a.a.blendModes={[PIXI.BLEND_MODES.NORMAL]:BABYLON.Engine.ALPHA_COMBINE,[PIXI.BLEND_MODES.ADD]:BABYLON.Engine.ALPHA_ADD,[PIXI.BLEND_MODES.MULTIPLY]:BABYLON.Engine.ALPHA_MULTIPLY,[PIXI.BLEND_MODES.SCREEN]:BABYLON.Engine.ALPHA_SCREENMODE};i(3);let M=!1;function S(t,e,i){let s=void 0;return{configurable:!0,get:()=>null!=s?s:SceneManager._scene instanceof Scene_Map?a.a.isDisabled()?e:a.a.is1stPerson()?i:e:t,set(t){s=t}}}Object.assign(a.a,{updateInput(){const t=a.a.is1stPerson();M!==t&&(Input.clear(),M=t),a.a.updateInputCamera()},updateInputCamera(){if(this.isDisabled()||this.loadData("cameraLocked"))return;const t=this.is1stPerson();if(this.loadData("allowRotation",a.a.KEYBOARD_TURN)||t){const t=a.a.getTurnKey("left"),e=a.a.getTurnKey("right");if(a.a.TURN_INCREMENT>1){const i=a.a.TURN_INCREMENT/a.a.YAW_SPEED;Input.isTriggered(t)?this.blendCameraYaw.setValue(this.blendCameraYaw.targetValue()+a.a.TURN_INCREMENT,i):Input.isTriggered(e)&&this.blendCameraYaw.setValue(this.blendCameraYaw.targetValue()-a.a.TURN_INCREMENT,i)}else{const i=a.a.YAW_SPEED/60;Input.isPressed(t)&&Input.isPressed(e)||(Input.isPressed(t)?this.blendCameraYaw.setValue(this.blendCameraYaw.targetValue()+i,.1):Input.isPressed(e)&&this.blendCameraYaw.setValue(this.blendCameraYaw.targetValue()-i,.1))}}if(this.loadData("allowPitch",a.a.KEYBOARD_PITCH)){const t=a.a.PITCH_SPEED/60;Input.isPressed("pageup")&&Input.isPressed("pagedown")||(Input.isPressed("pageup")?this.blendCameraPitch.setValue(Math.min(179,this.blendCameraPitch.targetValue()+t),.1):Input.isPressed("pagedown")&&this.blendCameraPitch.setValue(Math.max(1,this.blendCameraPitch.targetValue()-t),.1))}},getStrafeKey(t){if(a.a.is1stPerson())switch(a.a.KEYBOARD_STRAFE){case"QE":return"rot"+t;case"AD":return t;default:return!1}else switch(a.a.KEYBOARD_TURN){case"QE":return t;case"AD":return"rot"+t;default:return t}},getTurnKey(t){if(a.a.is1stPerson())switch(a.a.KEYBOARD_STRAFE){case"QE":return t;case"AD":return"rot"+t;default:return t}else switch(a.a.KEYBOARD_TURN){case"QE":return"rot"+t;case"AD":return t;default:return"rot"+t}}}),Object(r.n)(Input,"_signX",t=>(function(){if(!a.a.KEYBOARD_STRAFE&&a.a.is1stPerson())return 0;const t=a.a.getStrafeKey("left"),e=a.a.getStrafeKey("right");let i=0;return this.isPressed(t)&&--i,this.isPressed(e)&&++i,i})),a.a.setupInput=function(){if(!a.a.WASD)return;Object.assign(Input.keyMapper,{81:"rotleft",69:"rotright",87:"up",65:"left",83:"down",68:"right"});const t={rotleft:S("pageup","rotleft","rotleft"),rotright:S("pagedown","rotright","rotright")};Object.defineProperties(Input.keyMapper,{81:t.rotleft,69:t.rotright})};const E=Game_Player.prototype.getInputDirection;Game_Player.prototype.getInputDirection=function(){return a.a.isDisabled()?a.a.DIR8MOVE&&a.a.DIR8_2D?Input.dir8:E.apply(this,arguments):a.a.getInputDirection()},a.a.getInputDirection=function(){let t=a.a.DIR8MOVE?Input.dir8:Input.dir4;return a.a.transformDirection(t,a.a.blendCameraYaw.currentValue())};const O=t=>!!(t.isEnabled()&&t.isVisible&&t.isPickable)&&(!t.character||!t.character.isFollower&&!t.character.isPlayer),I=Scene_Map.prototype.processMapTouch;Scene_Map.prototype.processMapTouch=function(){if(a.a.isDisabled())return I.apply(this,arguments);if(TouchInput.isTriggered()||this._touchCount>0)if(TouchInput.isPressed()){if(0===this._touchCount||this._touchCount>=15){const t=a.a.scene.pick(TouchInput.x,TouchInput.y,O);t.hit&&a.a.processMapTouch(t)}this._touchCount++}else this._touchCount=0},a.a.processMapTouch=function(t){const e={x:t.pickedPoint.x,y:-t.pickedPoint.z},i=t.pickedMesh;i.character&&(e.x=i.character.x,e.y=i.character.y),a.a.setDestination(e.x,e.y)},a.a.setDestination=function(t,e){$gameTemp.setDestination(Math.round(t),Math.round(e))};const w=Game_Player.prototype.findDirectionTo;Game_Player.prototype.findDirectionTo=function(){const t=w.apply(this,arguments);if(a.a.isDisabled())return t;if(a.a.is1stPerson()&&t){let e=a.a.dirToYaw(t);a.a.blendCameraYaw.setValue(e,.25)}return t},Object.assign(a.a,{playerFaceYaw(){let t=this.yawToDir(a.a.blendCameraYaw.targetValue(),!0);$gamePlayer.mv3d_setDirection(t)},yawToDir(t=a.a.blendCameraYaw.targetValue(),e=a.a.DIR8){const i=e?45:90;for(t=Math.round(t/i)*i;t<0;)t+=360;for(;t>=360;)t-=360;switch(t){case 0:return 8;case 45:return 7;case 90:return 4;case 135:return 1;case 180:return 2;case 225:return 3;case 270:return 6;case 315:return 9;default:return 0}},dirToYaw(t){switch(t){case 3:return-135;case 6:return-90;case 9:return-45;case 8:return 0;case 7:return 45;case 4:return 90;case 1:return 135;case 2:return 180;default:return NaN}},transformDirection(t,e=this.blendCameraYaw.currentValue()){return a.a.yawToDir(a.a.dirToYaw(t)+e,a.a.DIR8MOVE)},transformFacing(t,e=this.blendCameraYaw.currentValue()){return a.a.yawToDir(a.a.dirToYaw(t)-e,!1)},updateDirection(){a.a.is1stPerson()&&a.a.playerFaceYaw()}});let A=0;Object(r.n)(Game_Player.prototype,"update",t=>(function(){t.apply(this,arguments),this._direction!==A&&(a.a.updateDirection(),A=this._direction)})),Object(r.n)(Game_Player.prototype,"moveStraight",t=>(function(){t.apply(this,arguments),a.a.updateDirection()})),Object(r.n)(Game_Player.prototype,"direction",t=>(function(){return a.a.is1stPerson()&&this.isMoving()&&!this.isDirectionFixed()?a.a.yawToDir(a.a.blendCameraYaw.targetValue(),!1):t.apply(this,arguments)}));const P=Game_CharacterBase.prototype.setDirection;Game_CharacterBase.prototype.setDirection=function(){P.apply(this,arguments),this._mv3d_direction=this._direction},Game_CharacterBase.prototype.mv3d_setDirection=function(t){this.isDirectionFixed()||(this._direction=a.a.yawToDir(a.a.dirToYaw(t),!1),a.a.DIR8MOVE?this._mv3d_direction=t:this._mv3d_direction=this._direction)},Game_CharacterBase.prototype.mv3d_direction=function(){return this._mv3d_direction||this.direction()},Object(r.n)(Game_CharacterBase.prototype,"copyPosition",t=>(function(e){t.apply(this,arguments),this._mv3d_direction=e._mv3d_direction})),Object(r.n)(Game_Player.prototype,"processMoveCommand",t=>(function(e){t.apply(this,arguments);const i=Game_Character;switch(e.code){case i.ROUTE_TURN_DOWN:case i.ROUTE_TURN_LEFT:case i.ROUTE_TURN_RIGHT:case i.ROUTE_TURN_UP:case i.ROUTE_TURN_90D_R:case i.ROUTE_TURN_90D_L:case i.ROUTE_TURN_180D:case i.ROUTE_TURN_90D_R_L:case i.ROUTE_TURN_RANDOM:case i.ROUTE_TURN_TOWARD:case i.ROUTE_TURN_AWAY:let t=a.a.dirToYaw(this._direction);a.a.blendCameraYaw.setValue(t,.25)}}),()=>!a.a.isDisabled()&&a.a.is1stPerson());class ConfigurationFunction{constructor(t,e){this.groups=t.match(/\[?[^[\]|]+\]?/g),this.labels={};for(let t=0;t<this.groups.length;++t){for(;this.groups[t]&&"["===this.groups[t][0];)this.labels[this.groups[t].slice(1,-1)]=t,this.groups.splice(t,1);if(t>this.groups.length)break;this.groups[t]=this.groups[t].split(",").map(t=>t.trim())}this.func=e}run(t,e){const i=/([,|]+)? *(?:(\w+) *: *)?([^,|\r\n]+)/g;let a,s=0,r=0;const n={};for(let t=0;t<this.groups.length;++t)n[`group${t+1}`]=[];for(;a=i.exec(e);){if(a[1])for(const t of a[1])","===t&&++s,("|"===t||s>=this.groups[r].length)&&(s=0,++r);if(a[2])if(a[2]in this.labels)r=this.labels[a[2]];else{let t=!1;t:for(let e=0;e<this.groups.length;++e)for(let i=0;i<this.groups[e].length;++i)if(this.groups[e][i]===a[2]){t=!0,r=e,s=i;break t}if(!t)break}if(r>this.groups.length)break;n[this.groups[r][s]]=n[`group${r+1}`][s]=a[3].trim()}this.func(t,n)}}function D(t,e=""){return new ConfigurationFunction(`img,x,y,w,h|${e}|alpha|glow[anim]animx,animy`,(function(e,i){if(5===i.group1.length){const[s,r,n,o,h]=i.group1;e[`${t}_id`]=a.a.constructTileId(s,1,0),e[`${t}_rect`]=new PIXI.Rectangle(r,n,o,h)}else if(3===i.group1.length){const[s,r,n]=i.group1;e[`${t}_id`]=a.a.constructTileId(s,r,n)}else if(2===i.group1.length){const[a,r]=i.group1;e[`${t}_offset`]=new s.v(Number(a),Number(r))}i.animx&&i.animy&&(e[`${t}_animData`]={animX:Number(i.animx),animY:Number(i.animy)}),i.height&&(e[`${t}_height`]=Number(i.height)),i.alpha&&(e[`${t}_alpha`]=Number(i.alpha)),i.glow&&(e[`${t}_glow`]=Number(i.glow))}))}a.a.ConfigurationFunction=ConfigurationFunction,Object.assign(a.a,{tilesetConfigurations:{},loadTilesetSettings(){this.tilesetConfigurations={};const t=this.readConfigurationBlocks($gameMap.tileset().note)+"\n"+this.readConfigurationBlocks($dataMap.note,"mv3d-tiles"),e=/^\s*([abcde]\d?)\s*,\s*(\d+(?:-\d+)?)\s*,\s*(\d+(?:-\d+)?)\s*:(.*)$/gim;let i;for(;i=e.exec(t);){const t=this.readConfigurationFunctions(i[4],this.tilesetConfigurationFunctions),e=i[2].split("-").map(t=>Number(t)),a=i[3].split("-").map(t=>Number(t));for(let s=e[0];s<=e[e.length-1];++s)for(let e=a[0];e<=a[a.length-1];++e){const a=`${i[1]},${s},${e}`,r=this.constructTileId(...a.split(","));r in this.tilesetConfigurations||(this.tilesetConfigurations[r]={}),Object.assign(this.tilesetConfigurations[r],t)}}},mapConfigurations:{},loadMapSettings(){const t=this.mapConfigurations={};this.readConfigurationFunctions(this.readConfigurationBlocks($dataMap.note),this.mapConfigurationFunctions,t),this._REGION_DATA_MAP={};const e=this.readConfigurationBlocks($dataMap.note,"mv3d-regions");if(e){const t=/^\s*(\d+)\s*:(.*)$/gm;let i;for(;i=t.exec(e);)i[1]in this._REGION_DATA_MAP||(i[1]in this._REGION_DATA?this._REGION_DATA_MAP[i[1]]=JSON.parse(JSON.stringify(this._REGION_DATA[i[1]])):this._REGION_DATA_MAP[i[1]]={}),this.readConfigurationFunctions(i[2],a.a.tilesetConfigurationFunctions,this._REGION_DATA_MAP[i[1]])}},applyMapSettings(){const t=this.mapConfigurations;if("fog"in t){const e=t.fog;"color"in e&&this.blendFogColor.setValue(e.color,0),"near"in e&&this.blendFogNear.setValue(e.near,0),"far"in e&&this.blendFogFar.setValue(e.far,0),this.blendFogColor.update()}"light"in t&&this.blendAmbientColor.setValue(t.light.color,0),"cameraDist"in t&&this.blendCameraDist.setValue(t.cameraDist,0),"cameraHeight"in t&&this.blendCameraHeight.setValue(t.cameraHeight,0),"cameraMode"in t&&(this.cameraMode=t.cameraMode),"cameraPitch"in t&&this.blendCameraPitch.setValue(t.cameraPitch,0),"cameraYaw"in t&&this.blendCameraYaw.setValue(t.cameraYaw,0),$gameMap.parallaxName()?a.a.scene.clearColor.set(0,0,0,0):a.a.scene.clearColor.set(...a.a.blendFogColor.currentComponents(),1),this.callFeatures("applyMapSettings",t)},getMapConfig(t,e){return t in this.mapConfigurations?this.mapConfigurations[t]:e},getCeilingConfig(){let t={};for(const e in this.mapConfigurations)e.startsWith("ceiling_")&&(t[e.replace("ceiling_","bottom_")]=this.mapConfigurations[e]);return t.bottom_id=this.getMapConfig("ceiling_id",0),t.height=this.getMapConfig("ceiling_height",this.CEILING_HEIGHT),t.skylight=this.getMapConfig("ceiling_skylight",!1),t},readConfigurationBlocksAndTags(t,e="mv3d"){return this.readConfigurationBlocks(t,e)+this.readConfigurationTags(t,e)},readConfigurationBlocks(t,e="mv3d"){const i=new RegExp(`<${e}>([\\s\\S]*?)</${e}>`,"gi");let a,s="";for(;a=i.exec(t);)s+=a[1]+"\n";return s},readConfigurationTags(t,e="mv3d"){const i=new RegExp(`<${e}:([\\s\\S]*?)>`,"gi");let a,s="";for(;a=i.exec(t);)s+=a[1]+"\n";return s},readConfigurationFunctions(t,e=a.a.tilesetConfigurationFunctions,i={}){const s=/(\w+)\((.*?)\)/g;let r;for(;r=s.exec(t);){const t=r[1].toLowerCase();if(t in e)if(e[t]instanceof ConfigurationFunction)e[t].run(i,r[2]);else{const a=r[2].split(",");1===a.length&&""===a[0]&&(a.length=0),e[t](i,...a)}}return i},get configurationSides(){return this.enumSides},get configurationShapes(){return this.enumShapes},get configurationPassage(){return this.enumPassage},enumSides:{front:s.f,back:s.a,double:s.c},enumShapes:{FLAT:1,TREE:2,SPRITE:3,FENCE:4,WALL:4,CROSS:5,XCROSS:6,SLOPE:7},enumPassage:{WALL:0,FLOOR:1,THROUGH:2},tilesetConfigurationFunctions:{height(t,e){t.height=Number(e)},depth(t,e){t.depth=Number(e)},fringe(t,e){t.fringe=Number(e)},float(t,e){t.float=Number(e)},slope(t,e=1,i=null){t.shape=a.a.enumShapes.SLOPE,t.slopeHeight=Number(e),i&&(t.slopeDirection={n:2,s:8,e:4,w:6}[i.toLowerCase()[0]])},top:D("top"),side:D("side"),inside:D("inside"),bottom:D("bottom"),texture:Object.assign(D("hybrid"),{func(t,e){a.a.tilesetConfigurationFunctions.top.func(t,e),a.a.tilesetConfigurationFunctions.side.func(t,e)}}),shape(t,e){t.shape=a.a.enumShapes[e.toUpperCase()]},alpha(t,e){t.transparent=!0,t.alpha=Number(e)},glow(t,e){t.glow=Number(e)},pass(t,e=""){(e=Object(r.j)(e.toLowerCase()))&&"x"!==e[0]?"o"===e[0]?t.pass=a.a.enumPassage.FLOOR:t.pass=a.a.enumPassage.THROUGH:t.pass=a.a.enumPassage.WALL}},eventConfigurationFunctions:{height(t,e){t.height=Number(e)},z(t,e){t.z=Number(e)},x(t,e){t.x=Number(e)},y(t,e){t.y=Number(e)},scale(t,e,i=e){t.scale=new s.v(Number(e),Number(i))},rot(t,e){t.rot=Number(e)},yaw(t,e){t.yaw=Number(e)},pitch(t,e){t.pitch=Number(e)},bush(t,e){t.bush=Object(r.f)(e)},shadow(t,e,i){t.shadow=Object(r.e)(e),null!=i&&(t.shadowDist=Number(i))},shape(t,e){t.shape=a.a.enumShapes[e.toUpperCase()]},pos(t,e,i){t.pos={x:e,y:i}},lamp:new ConfigurationFunction("color,intensity,range",(function(t,e){const{color:i="white",intensity:s=1,range:n=a.a.LIGHT_DIST}=e;t.lamp={color:Object(r.k)(i).toNumber(),intensity:Number(s),distance:Number(n)}})),flashlight:new ConfigurationFunction("color,intensity,range,angle[dir]yaw,pitch",(function(t,e){const{color:i="white",intensity:s=1,range:n=a.a.LIGHT_DIST,angle:o=a.a.LIGHT_ANGLE}=e;t.flashlight={color:Object(r.k)(i).toNumber(),intensity:Number(s),distance:Number(n),angle:Number(o)},e.yaw&&(t.flashlightYaw=e.yaw),e.pitch&&(t.flashlightPitch=Number(e.pitch))})),flashlightpitch(t,e="90"){t.flashlightPitch=Number(e)},flashlightyaw(t,e="+0"){t.flashlightYaw=e},lightheight(t,e=1){this.lampheight(t,e),this.flashlightheight(t,e)},lightoffset(t,e=0,i=0){this.lampoffset(t,e,i),this.flashlightoffset(t,e,i)},lampheight(t,e=1){t.lampHeight=Number(e)},lampoffset(t,e=0,i=0){t.lampOffset={x:+e,y:+i}},flashlightheight(t,e=1){t.flashlightHeight=Number(e)},flashlightoffset(t,e=0,i=0){t.flashlightOffset={x:+e,y:+i}},alpha(t,e){t.alpha=Number(e)},glow(t,e){t.glow=Number(e)},dirfix(t,e){t.dirfix=Object(r.f)(e)},gravity(t,e){t.gravity=Object(r.e)(e)},platform(t,e){t.platform=Object(r.f)(e)},collide(t,e){t.collide=Object(r.e)(e)},trigger(t,e,i=0){t.trigger={up:Number(e),down:Number(i)}},pass(t,e=""){(e=Object(r.j)(e.toLowerCase()))&&"x"!==e[0]?"o"===e[0]?t.platform=!0:(t.platform=!1,t.collide=!1):(t.platform=!1,t.collide=!0)}},mapConfigurationFunctions:{get ambient(){return this.light},light(t,e){e="default"===e.toLowerCase()?a.a.AMBIENT_COLOR:Object(r.k)(e).toNumber(),t.light={color:e}},fog:new ConfigurationFunction("color|near,far",(function(t,e){const{color:i,near:a,far:s}=e;t.fog||(t.fog={}),i&&(t.fog.color=Object(r.k)(i).toNumber()),a&&(t.fog.near=Number(a)),s&&(t.fog.far=Number(s))})),camera:new ConfigurationFunction("yaw,pitch|dist|height|mode",(function(t,e){const{yaw:i,pitch:a,dist:s,height:r,mode:n}=e;i&&(t.cameraYaw=Number(i)),a&&(t.cameraPitch=Number(a)),s&&(t.cameraDist=Number(s)),r&&(t.cameraHeight=Number(r)),n&&(t.cameraMode=n)})),ceiling:D("ceiling","height,skylight"),edge(t,e){t.edge=Object(r.f)(e)},disable(t,e=!0){t.disabled=Object(r.f)(e)},enable(t,e=!0){t.disabled=!Object(r.f)(e)}}});const L=Game_Event.prototype.setupPage;Game_Event.prototype.setupPage=function(){L.apply(this,arguments),this.mv3d_sprite&&(this.mv3d_needsConfigure=!0,this.mv3d_sprite.eventConfigure())};const x=Game_Event.prototype.initialize;Game_Event.prototype.initialize=async function(){x.apply(this,arguments);const t=this.event();let e={};a.a.readConfigurationFunctions(a.a.readConfigurationTags(t.note),a.a.eventConfigurationFunctions,e),"pos"in e&&this.locate(Object(r.q)(t.x,e.pos.x),Object(r.q)(t.y,e.pos.y)),this.mv3d_blenders||(this.mv3d_blenders={}),"lamp"in e&&(this.mv3d_blenders.lampColor_r=e.lamp.color>>16,this.mv3d_blenders.lampColor_g=e.lamp.color>>8&255,this.mv3d_blenders.lampColor_b=255&e.lamp.color,this.mv3d_blenders.lampIntensity=e.lamp.intensity,this.mv3d_blenders.lampDistance=e.lamp.distance),"flashlight"in e&&(this.mv3d_blenders.flashlightColor_r=e.flashlight.color>>16,this.mv3d_blenders.flashlightColor_g=e.flashlight.color>>8&255,this.mv3d_blenders.flashlightColor_b=255&e.flashlight.color,this.mv3d_blenders.flashlightIntensity=e.flashlight.intensity,this.mv3d_blenders.flashlightDistance=e.flashlight.distance,this.mv3d_blenders.flashlightAngle=e.flashlight.angle),"flashlightPitch"in e&&(this.mv3d_blenders.flashlightPitch=Number(e.flashlightPitch)),"flashlightYaw"in e&&(this.mv3d_blenders.flashlightYaw=e.flashlightYaw),this.mv3d_needsConfigure=!0,await Object(r.s)(),a.a.mapLoaded&&a.a.createCharacterFor(this)};const R=Game_Interpreter.prototype.pluginCommand;Game_Interpreter.prototype.pluginCommand=function(t,e){if("mv3d"!==t.toLowerCase())return R.apply(this,arguments);const i=new a.a.PluginCommand;if(i.INTERPRETER=this,i.FULL_COMMAND=[t,...e].join(" "),e=e.filter(t=>t),i.CHAR=$gameMap.event(this._eventId),e[0]){const t=e[0][0];"@"!==t&&"＠"!==t||(i.CHAR=i.TARGET_CHAR(e.shift()))}const s=e.shift().toLowerCase();s in i&&i[s](...e)},a.a.PluginCommand=class{async camera(...t){var e=this._TIME(t[2]);switch(t[0].toLowerCase()){case"pitch":return void this.pitch(t[1],e);case"yaw":return void this.yaw(t[1],e);case"roll":return void this.roll(t[1],e);case"dist":case"distance":return void this.dist(t[1],e);case"height":return void this.height(t[1],e);case"mode":return void this.cameramode(t[1]);case"target":return void this._cameraTarget(t[1],e);case"pan":return void this.pan(t[1],t[2],t[3])}}yaw(t,e=1){this._RELATIVE_BLEND(a.a.blendCameraYaw,t,e),a.a.is1stPerson()&&a.a.playerFaceYaw()}pitch(t,e=1){this._RELATIVE_BLEND(a.a.blendCameraPitch,t,e)}roll(t,e=1){this._RELATIVE_BLEND(a.a.blendCameraRoll,t,e)}dist(t,e=1){this._RELATIVE_BLEND(a.a.blendCameraDist,t,e)}height(t,e=1){this._RELATIVE_BLEND(a.a.blendCameraHeight,t,e)}_cameraTarget(t,e){a.a.setCameraTarget(this.TARGET_CHAR(t),e)}pan(t,e,i=1){console.log(t,e,i),i=this._TIME(i),this._RELATIVE_BLEND(a.a.blendPanX,t,i),this._RELATIVE_BLEND(a.a.blendPanY,e,i)}get rotationmode(){return this.allowrotation}get pitchmode(){return this.allowpitch}allowrotation(t){a.a.saveData("allowRotation",Object(r.f)(t))}allowpitch(t){a.a.saveData("allowPitch",Object(r.f)(t))}lockcamera(t){a.a.saveData("cameraLocked",Object(r.f)(t))}_VEHICLE(t,e,i){e=e.toLowerCase();const s=`${Vehicle}_${e}`;i="big"===e?Object(r.f)(i):Object(r.q)(a.a.loadData(s,0),i),a.a.saveData(s,i)}boat(t,e){this._VEHICLE("boat",t,e)}ship(t,e){this._VEHICLE("ship",t,e)}airship(t,e){this._VEHICLE("airship",t,e)}cameramode(t){a.a.cameraMode=t}fog(...t){var e=this._TIME(t[2]);switch(t[0].toLowerCase()){case"color":return void this._fogColor(t[1],e);case"near":return void this._fogNear(t[1],e);case"far":return void this._fogFar(t[1],e);case"dist":case"distance":return e=this._TIME(t[3]),this._fogNear(t[1],e),void this._fogFar(t[2],e)}e=this._TIME(t[3]),this._fogColor(t[0],e),this._fogNear(t[1],e),this._fogFar(t[2],e)}_fogColor(t,e){a.a.blendFogColor.setValue(Object(r.k)(t).toNumber(),e)}_fogNear(t,e){this._RELATIVE_BLEND(a.a.blendFogNear,t,e)}_fogFar(t,e){this._RELATIVE_BLEND(a.a.blendFogFar,t,e)}get ambient(){return this.light}light(...t){var e=this._TIME(t[2]);switch(t[0].toLowerCase()){case"color":return void this._lightColor(t[1],e)}e=this._TIME(t[1]),this._lightColor(t[0],e)}_lightColor(t,e=1){a.a.blendAmbientColor.setValue(Object(r.k)(t).toNumber(),e)}async lamp(...t){const e=await this.AWAIT_CHAR(this.CHAR);e.setupLamp();var i=this._TIME(t[2]);switch(t[0].toLowerCase()){case"color":return void this._lampColor(e,t[1],i);case"intensity":return void this._lampIntensity(e,t[1],i);case"dist":case"distance":return void this._lampDistance(e,t[1],i)}i=this._TIME(t[3]),this._lampColor(e,t[0],i),this._lampIntensity(e,t[1],i),this._lampDistance(e,t[2],i)}_lampColor(t,e,i=1){t.blendLampColor.setValue(Object(r.k)(e).toNumber(),i)}_lampIntensity(t,e,i=1){this._RELATIVE_BLEND(t.blendLampIntensity,e,i)}_lampDistance(t,e,i=1){this._RELATIVE_BLEND(t.blendLampDistance,e,i)}async flashlight(...t){const e=await this.AWAIT_CHAR(this.CHAR);e.setupFlashlight();var i=this._TIME(t[2]);switch(t[0].toLowerCase()){case"color":return void this._flashlightColor(e,t[1],i);case"intensity":return void this._flashlightIntensity(e,t[1],i);case"dist":case"distance":return void this._flashlightDistance(e,t[1],i);case"angle":return void this._flashlightAngle(e,t[1],i);case"yaw":return void this._flashlightYaw(e,t[1]);case"pitch":return void this._flashlightPitch(e,t[1],i)}i=this._TIME(t[4]),this._flashlightColor(e,t[0],i),this._flashlightIntensity(e,t[1],i),this._flashlightDistance(e,t[2],i),this._flashlightAngle(e,t[3],i)}_flashlightColor(t,e,i){t.blendFlashlightColor.setValue(Object(r.k)(e).toNumber(),i)}_flashlightIntensity(t,e,i){this._RELATIVE_BLEND(t.blendFlashlightIntensity,e,i)}_flashlightDistance(t,e,i){this._RELATIVE_BLEND(t.blendFlashlightDistance,e,i)}_flashlightAngle(t,e,i){this._RELATIVE_BLEND(t.blendFlashlightAngle,e,i)}_flashlightPitch(t,e,i){this._RELATIVE_BLEND(t.blendFlashlightPitch,e,i)}_flashlightYaw(t,e){this.configure(`flashlightYaw(${e})`)}async elevation(...t){const e=await this.AWAIT_CHAR(this.CHAR);let i=this._TIME(t[1]);this._RELATIVE_BLEND(e.blendElevation,t[0],i)}async configure(...t){const e=await this.AWAIT_CHAR(this.CHAR);a.a.readConfigurationFunctions(t.join(" "),a.a.eventConfigurationFunctions,e.settings),e.pageConfigure(e.settings)}disable(t){a.a.disable(t)}enable(t){a.a.enable(t)}_RELATIVE_BLEND(t,e,i){t.setValue(Object(r.q)(t.targetValue(),e),Number(i))}_TIME(t){return"number"==typeof t?t:(t=Number(t),Number.isNaN(t)?1:t)}ERROR_CHAR(){console.warn(`MV3D: Plugin command \`${this.FULL_COMMAND}\` failed because target character was invalid.`)}async AWAIT_CHAR(t){if(!t)return this.ERROR_CHAR();let e=0;for(;!t.mv3d_sprite;)if(await Object(r.s)(100),++e>10)return this.ERROR_CHAR();return t.mv3d_sprite}TARGET_CHAR(t){return a.a.targetChar(t,$gameMap.event(this.INTERPRETER._eventId),this.CHAR)}},a.a.targetChar=function(t,e=null,i=null){if(!t)return i;let a=t.toLowerCase().match(/[a-z]+/);const s=a?a[0]:"e",r=(a=t.match(/\d+/))?Number(a[0]):0;switch(s[0]){case"s":return e;case"p":return $gamePlayer;case"e":return r?$gameMap.event(r):e;case"v":return $gameMap.vehicle(r);case"f":return $gamePlayer.followers()._data[r]}return char},a.a.getTargetString=function(t){return t instanceof Game_Player?"@p":t instanceof Game_Event?`@e${t._eventId}`:t instanceof Game_Follower?`@f${$gamePlayer._followers._data.indexOf(t)}`:t instanceof Game_Vehicle?`@v${$gameMap._vehicles.indexOf(t)}`:void 0};class MapCellBuilder_CellMeshBuilder{constructor(){this.submeshBuilders={}}build(){const t=Object.values(this.submeshBuilders);if(!t.length)return null;const e=t.map(t=>t.build()),i=e.reduce((t,e)=>("number"!=typeof t&&(t=t.getTotalVertices()),t+e.getTotalVertices()));return s.i.MergeMeshes(e,!0,i>65536,void 0,!1,!0)}getBuilder(t){return t.name in this.submeshBuilders||(this.submeshBuilders[t.name]=new MapCellBuilder_SubMeshBuilder(t)),this.submeshBuilders[t.name]}addWallFace(t,e,i,a,s,r,n,o,h,l,c,p={}){const d=this.getBuilder(t),u=MapCellBuilder_SubMeshBuilder.getUvRect(t.diffuseTexture,e,i,a,s);d.addWallFace(r,n,o,h,l,c,u,p),p.double&&(p.flip=!p.flip,d.addWallFace(r,n,o,h,l,c,u,p))}addFloorFace(t,e,i,a,s,r,n,o,h,l,c={}){const p=this.getBuilder(t),d=MapCellBuilder_SubMeshBuilder.getUvRect(t.diffuseTexture,e,i,a,s);p.addFloorFace(r,n,o,h,l,d,c),c.double&&(c.flip=!c.flip,p.addFloorFace(r,n,o,h,l,d,c))}addSlopeFace(t,e,i,a,s,r,n,o,h,l,c,p={}){const d=this.getBuilder(t),u=MapCellBuilder_SubMeshBuilder.getUvRect(t.diffuseTexture,e,i,a,s);d.addSlopeFace(r,n,o,h,l,c,u,p),p.double&&(p.flip=!p.flip,d.addSlopeFace(r,n,o,h,l,c,u,p))}addSlopeSide(t,e,i,a,s,r,n,o,h,l,c,p={}){const d=this.getBuilder(t),u=MapCellBuilder_SubMeshBuilder.getUvRect(t.diffuseTexture,e,i,a,s);d.addSlopeSide(r,n,o,h,l,c,u,p),p.double&&(p.flip=!p.flip,d.addSlopeSide(r,n,o,h,l,c,u,p))}}class MapCellBuilder_SubMeshBuilder{constructor(t){this.material=t,this.positions=[],this.indices=[],this.normals=[],this.uvs=[]}build(){const t=new s.i("cell mesh",a.a.scene),e=new s.x;return e.positions=this.positions,e.indices=this.indices,e.normals=this.normals,e.uvs=this.uvs,e.applyToMesh(t),t.material=this.material,t}addWallFace(t,e,i,a,s,n,o,h){e=-e,i=i;const l=Object(r.g)(n),c=Object(r.r)(n),p=a/2,d=s/2,u=[t-p*l,i+d,e+p*c,t+p*l,i+d,e-p*c,t-p*l,i-d,e+p*c,t+p*l,i-d,e-p*c];let g=[-c,0,-l,-c,0,-l,-c,0,-l,-c,0,-l];const m=MapCellBuilder_SubMeshBuilder.getDefaultUvs(o),f=MapCellBuilder_SubMeshBuilder.getDefaultIndices();h.flip&&MapCellBuilder_SubMeshBuilder.flipFace(f,g),h.abnormal&&(g=[0,1,0,0,1,0,0,1,0,0,1,0]),this.pushNewData(u,f,g,m)}addFloorFace(t,e,i,a,s,r,n){const o=a/2,h=s/2,l=[t-o,i=i,(e=-e)+h,t+o,i,e+h,t-o,i,e-h,t+o,i,e-h],c=[0,1,0,0,1,0,0,1,0,0,1,0],p=MapCellBuilder_SubMeshBuilder.getDefaultUvs(r),d=MapCellBuilder_SubMeshBuilder.getDefaultIndices();n.flip&&MapCellBuilder_SubMeshBuilder.flipFace(d,c),this.pushNewData(l,d,c,p)}addSlopeFace(t,e,i,a,s,n,o,h){e=-e,i=i;const l=Object(r.g)(n),c=Object(r.r)(n),p=a/2,d=s/2,u=h.autotile?[t-p,i+d+d*Math.round(Object(r.r)(-n+1*r.a/4)),e+p,t+p,i+d+d*Math.round(Object(r.r)(-n+3*r.a/4)),e+p,t-p,i+d+d*Math.round(Object(r.r)(-n+7*r.a/4)),e-p,t+p,i+d+d*Math.round(Object(r.r)(-n+5*r.a/4)),e-p]:[t-p*l+p*c,i+s,e+p*c+p*l,t+p*l+p*c,i+s,e-p*c+p*l,t-p*l-p*c,i,e+p*c-p*l,t+p*l-p*c,i,e-p*c-p*l],g=Math.pow(2,-s),m=1-g,f=[-c*m,g,-l*m,-c*m,g,-l*m,-c*m,g,-l*m,-c*m,g,-l*m];let _=MapCellBuilder_SubMeshBuilder.getDefaultUvs(o);const b=MapCellBuilder_SubMeshBuilder.getDefaultIndices();h.flip&&MapCellBuilder_SubMeshBuilder.flipFace(b,f),this.pushNewData(u,b,f,_)}addSlopeSide(t,e,i,a,s,n,o,h){e=-e,i=i;const l=Object(r.g)(n),c=Object(r.r)(n),p=a/2,d=[t-p*l,i+s,e+p*c,t-p*l,i,e+p*c,t+p*l,i,e-p*c],u=[-c,0,-l,-c,0,-l,-c,0,-l],g=[o.x1,o.y1,o.x1,o.y2,o.x2,o.y2],m=[0,1,2];h.flip&&MapCellBuilder_SubMeshBuilder.flipFace(m,u),this.pushNewData(d,m,u,g)}pushNewData(t,e,i,a){this.indices.push(...e.map(t=>t+this.positions.length/3)),this.positions.push(...t),this.normals.push(...i),this.uvs.push(...a)}static getUvRect(t,e,i,s,r){const{width:n,height:o}=t.getBaseSize();return a.a.EDGE_FIX&&(e+=a.a.EDGE_FIX,i+=a.a.EDGE_FIX,s-=2*a.a.EDGE_FIX,r-=2*a.a.EDGE_FIX),{x1:e/n,y1:(o-i)/o,x2:(e+s)/n,y2:(o-i-r)/o}}static getDefaultUvs(t){return[t.x1,t.y1,t.x2,t.y1,t.x1,t.y2,t.x2,t.y2]}static getDefaultIndices(){return[1,0,2,1,2,3]}static flipFace(t,e){t.reverse();for(let t=0;t<e.length;++t)e[t]*=-1}}new s.n(0,1,-Math.pow(.1,100),0),new s.n(0,0,-1,0);class mapCell_MapCell extends s.u{constructor(t,e){const i=[t,e].toString();super(`MapCell[${i}]`,a.a.scene),this.parent=a.a.map,this.cx=t,this.cy=e,this.ox=t*a.a.CELL_SIZE,this.oy=e*a.a.CELL_SIZE,this.x=this.ox,this.y=this.oy,this.key=i,this.characters=[]}update(){const t=a.a.loopCoords((this.cx+.5)*a.a.CELL_SIZE,(this.cy+.5)*a.a.CELL_SIZE);this.x=t.x-a.a.CELL_SIZE/2,this.y=t.y-a.a.CELL_SIZE/2}async load(){const t=a.a.enumShapes;this.builder=new MapCellBuilder_CellMeshBuilder;const e=Math.min(a.a.CELL_SIZE,$gameMap.width()-this.cx*a.a.CELL_SIZE),i=Math.min(a.a.CELL_SIZE,$gameMap.height()-this.cy*a.a.CELL_SIZE),s=a.a.getCeilingConfig();for(let r=0;r<i;++r)for(let i=0;i<e;++i){s.cull=!1;const e=a.a.getTileData(this.ox+i,this.oy+r);let n=1/0;const o=a.a.getCullingHeight(this.ox+i,this.oy+r);for(let h=3;h>=0;--h){if(a.a.isTileEmpty(e[h]))continue;let l=a.a.getStackHeight(this.ox+i,this.oy+r,h);const c=a.a.getTileTextureOffsets(e[h],this.ox+i,this.oy+r,h),p=c.shape;c.realId=e[h];let d=a.a.getTileHeight(this.ox+i,this.oy+r,h)||c.height||0,u=!1;if(n<l&&(u=!0),a.a.getTileFringe(this.ox+i,this.oy+r,h)||(n=l),!p||p===t.FLAT||p===t.SLOPE){const e=d||0===h,n=d>0&&l-d>o||c.fringe>0;if(p&&p!==t.FLAT){if(p===t.SLOPE){const t=c.slopeHeight||1;d-=t,await this.loadSlope(c,i,r,l,h,t),e&&await this.loadWalls(c,i,r,l-t,h,d),n&&await this.loadTile(c,i,r,l-t-Math.max(0,d),h,!0)}}else u||await this.loadTile(c,i,r,l+h*a.a.LAYER_DIST*!e,h),e&&await this.loadWalls(c,i,r,l,h,d),n&&await this.loadTile(c,i,r,l-d,h,!0);l>=s.height&&(s.cull=!0)}p===t.FENCE?await this.loadFence(c,i,r,l,h,d):p!==t.CROSS&&p!==t.XCROSS||await this.loadCross(c,i,r,l,h,d)}a.a.isTileEmpty(s.bottom_id)||s.cull||await this.loadTile(s,i,r,s.height,0,!0,!s.skylight)}this.mesh=this.builder.build(),this.mesh&&(this.mesh.parent=this,this.mesh.alphaIndex=0,a.a.callFeatures("createCellMesh",this.mesh)),delete this.builder}dispose(){super.dispose(...arguments),this.mesh&&a.a.callFeatures("destroyCellMesh",this.mesh)}async loadTile(t,e,i,s,n,o=!1,h=!1){const l=o?t.bottom_id:t.top_id;if(a.a.isTileEmpty(l))return;const c=o?t.bottom_rect:t.top_rect,p=Tilemap.isAutotile(l)&&!c;let d;d=c?[c]:a.a.getTileRects(l);const u=await a.a.getCachedTilesetMaterialForTile(t,o?"bottom":"top");for(const t of d)this.builder.addFloorFace(u,t.x,t.y,t.width,t.height,e+(0|t.ox)/Object(r.u)()-.25*p,i+(0|t.oy)/Object(r.u)()-.25*p,s,1-p/2,1-p/2,{flip:o,double:h})}async loadWalls(t,e,i,a,s,r){for(const n of mapCell_MapCell.neighborPositions)await this.loadWall(t,e,i,a,s,r,n)}async loadWall(t,e,i,n,o,h,l){const c=a.a.isStarTile(t.realId)||t.fringe>0;if(!a.a.getMapConfig("edge",!0)&&((this.ox+e+l.x>=$dataMap.width||this.ox+e+l.x<0)&&!$gameMap.isLoopHorizontal()||(this.oy+i+l.y>=$dataMap.height||this.oy+i+l.y<0)&&!$gameMap.isLoopVertical()))return;let p,d=h,u=t.side_id,g="side";if(a.a.isTileEmpty(u))return;if((d=n-a.a.getCullingHeight(this.ox+e+l.x,this.oy+i+l.y,t.depth>0?3:o,{ignorePits:!(t.depth>0),dir:Input._makeNumpadDirection(l.x,l.y)}))>0&&(o>0||c)&&(d=Math.min(h,d)),t.depth>0&&d<0){if(a.a.tileHasPit(this.ox+e+l.x,this.oy+i+l.y,o))return;d=Math.max(d,-t.depth),t.hasInsideConf&&(g="inside")}else if(d<=0)return;"inside"===g?(u=t.inside_id,t.inside_rect&&(p=t.inside_rect)):t.side_rect&&(p=t.side_rect);const m=await a.a.getCachedTilesetMaterialForTile(t,g),f=new s.w(e+l.x/2,i+l.y/2,n),_=-Math.atan2(l.x,l.y);if(p||!Tilemap.isAutotile(u)){const t=p||a.a.getTileRects(u)[0],e={};d<0&&(e.flip=!0),this.builder.addWallFace(m,t.x,t.y,t.width,t.height,f.x,f.y,n-d/2,1,Math.abs(d),_,e)}else{const c=new s.v(-l.y,l.x),p=new s.v(l.y,-l.x),g=a.a.getCullingHeight(this.ox+e+c.x,this.oy+i+c.y,o,{dir:Input._makeNumpadDirection(c.x,c.y)}),b=a.a.getCullingHeight(this.ox+e+p.x,this.oy+i+p.y,o,{dir:Input._makeNumpadDirection(p.x,p.y)}),{x:T,y:y}=this.getAutotileCorner(u,t.realId,!0);let C=Math.max(1,Math.abs(Math.round(2*d))),v=Math.abs(d/C),M=Object(r.u)()/2,S=Object(r.u)()/2;a.a.isTableTile(t.realId)&&(S=Object(r.u)()/3,C=1,v=h);for(let e=-1;e<=1;e+=2)for(let i=0;i<C;++i){let s,o,h,l;a.a.isTableTile(t.realId)?(s=g!=n,o=b!=n):(s=g<n-i*v,o=b<n-i*v),h=T*Object(r.u)(),l=y*Object(r.u)(),h=(T+(e>0?.5+o:1-s))*Object(r.u)(),l=a.a.isWaterfallTile(u)?(y+i%2/2)*Object(r.u)():a.a.isTableTile(u)?(y+5/3)*Object(r.u)():(y+(0===i?0:i===C-1?1.5:1-i%2*.5))*Object(r.u)();const c={};d<0&&(c.flip=!0),this.builder.addWallFace(m,h,l,M,S,f.x+.25*e*Math.cos(_),f.y+.25*e*Math.sin(_),n-d*(d<0)-v/2-v*i,.5,v,_,c)}}}async loadFence(t,e,i,s,n,o){const h=t.side_id;if(a.a.isTileEmpty(h))return;const l=t.side_rect,c=await a.a.getCachedTilesetMaterialForTile(t,"side"),p=Tilemap.isAutotile(h),d=[];for(let t=0;t<mapCell_MapCell.neighborPositions.length;++t){const s=mapCell_MapCell.neighborPositions[t];a.a.getTileHeight(this.ox+e+s.x,this.oy+i+s.y,n)!==o&&d.push(t)}for(let n=0;n<mapCell_MapCell.neighborPositions.length;++n){const u=mapCell_MapCell.neighborPositions[n],g=d.includes(n);if(g&&d.length<4&&!p)continue;const m=u.x>0||u.y>0;let f=Math.atan2(u.x,u.y)+Math.PI/2;if(m&&(f-=Math.PI),p&&!l){const{x:n,y:l}=this.getAutotileCorner(h,t.realId,!0);for(let t=0;t<=1;++t)this.builder.addWallFace(c,(g?n+1.5*m:n+1-.5*m)*Object(r.v)(),(l+1.5*t)*Object(r.t)(),Object(r.v)()/2,Object(r.t)()/2,e+u.x/4,i+u.y/4,s-o/4-t*o/2,.5,o/2,-f,{double:!0,abnormal:a.a.ABNORMAL})}else{const t=l||a.a.getTileRects(h)[0];this.builder.addWallFace(c,t.x+t.width/2*m,t.y,t.width/2,t.height,e+u.x/4,i+u.y/4,s-o/2,.5,o,f,{double:!0})}}}async loadCross(t,e,i,s,n,o){const h=t.side_id;if(a.a.isTileEmpty(h))return;const l=t.side_rect,c=await a.a.getCachedTilesetMaterialForTile(t,"side"),p=Tilemap.isAutotile(h);let d;d=l?[l]:a.a.getTileRects(h);const u=t.shape===a.a.enumShapes.XCROSS?Math.PI/4:0,g=p?o/2:o;for(let t=0;t<=1;++t)for(const n of d){const h=-Math.PI/2*t+u,l=-.25*p+(0|n.ox)/Object(r.v)();this.builder.addWallFace(c,n.x,n.y,n.width,n.height,e+l*Math.cos(h),i+l*Math.sin(h),s-(0|n.oy)/Object(r.t)()*o-g/2,1-p/2,g,h,{double:!0,abnormal:a.a.ABNORMAL})}}async loadSlope(t,e,i,n,o,h){const{dir:l,rot:c}=a.a.getSlopeDirection(this.ox+e,this.oy+i,o,!0),p=new s.v(-Object(r.r)(c+Math.PI),Object(r.g)(c+Math.PI));a.a.getCullingHeight(this.ox+e+p.x,this.oy+i+p.y,o)<n&&await this.loadWall(t,e,i,n,o+1,h,p);const d=new s.v(p.y,-p.x),u=this.ox+e+d.x,g=this.oy+i+d.y;if(a.a.getCullingHeight(u,g,o)<n){let s=a.a.isRampAt(u,g,n);s&&s.z2===n&&s.z1===n-h&&l==a.a.getSlopeDirection(u,g,s.l,!0).dir||await this.loadSlopeSide(t,e+d.x/2,i+d.y/2,n,o,h,c+Math.PI/2)}const m=new s.v(-p.y,p.x),f=this.ox+e+m.x,_=this.oy+i+m.y;if(a.a.getCullingHeight(f,_,o)<n){let s=a.a.isRampAt(f,_,n);s&&s.z2===n&&s.z1===n-h&&l==a.a.getSlopeDirection(f,_,s.l,!0).dir||await this.loadSlopeSide(t,e+m.x/2,i+m.y/2,n,o,h,c+Math.PI/2,{flip:!0})}await this.loadSlopeTop(t,e,i,n,o,h,c)}async loadSlopeTop(t,e,i,s,n,o,h){const l=t.top_id,c=await a.a.getCachedTilesetMaterialForTile(t,"top");if(Tilemap.isAutotile(l)&&!t.top_rect){const t=a.a.getTileRects(l);for(let a=0;a<t.length;++a){const n=t[a],l=(a+1)%2*-2+1,p=(Math.floor(a/2)+1)%2*2-1,d=Math.max(0,Object(r.r)(h)*l)*o/2,u=Math.max(0,Object(r.g)(h)*p)*o/2;this.builder.addSlopeFace(c,n.x,n.y,n.width,n.height,e+n.ox/Object(r.u)()-.25,i+n.oy/Object(r.u)()-.25,s-o+d+u,.5,o/2,h,{autotile:!0})}}else{const r=t.top_rect?t.top_rect:a.a.getTileRects(l)[0];this.builder.addSlopeFace(c,r.x,r.y,r.width,r.height,e,i,s-o,1,o,h,{})}}async loadSlopeSide(t,e,i,s,n,o,h,l={}){const c=t.side_id,p=await a.a.getCachedTilesetMaterialForTile(t,"side");let d;if(Tilemap.isAutotile(c)&&!t.side_rect){const{x:e,y:i}=this.getAutotileCorner(c,t.realId,!0);d={x:(e+.5)*Object(r.v)(),y:(i+.5)*Object(r.t)(),width:Object(r.v)(),height:Object(r.t)()}}else d=t.side_rect?t.side_rect:a.a.getTileRects(c)[0];this.builder.addSlopeSide(p,d.x,d.y,d.width,d.height,e,i,s-o,1,o,h,l)}getAutotileCorner(t,e=t,i=!0){const s=Tilemap.getAutotileKind(t);let r=s%8,n=Math.floor(s/8);var o,h;return t===e&&1==a.a.isWallTile(t)&&++n,o=2*r,h=n,Tilemap.isTileA1(t)?(s<4?(o=6*Math.floor(s/2),h=s%2*3+i):(o=8*Math.floor(r/4)+s%2*6,h=6*n+3*Math.floor(r%4/2)+i*!(r%2)),i&&s>=4&&!(s%2)&&(h+=1)):Tilemap.isTileA2(t)?h=3*(n-2)+i:Tilemap.isTileA3(t)?h=2*(n-6):Tilemap.isTileA4(t)&&(h=i?Math.ceil(2.5*(n-10)+.5):2.5*(n-10)+(n%2?.5:0)),{x:o,y:h}}}mapCell_MapCell.neighborPositions=[new s.v(0,1),new s.v(1,0),new s.v(0,-1),new s.v(-1,0)],mapCell_MapCell.meshCache={};Object.assign(a.a,{_tilemap:null,getTilemap(){return SceneManager._scene&&SceneManager._scene._spriteset&&(this._tilemap=SceneManager._scene._spriteset._tilemap),this._tilemap},getDataMap(){return $dataMap&&(this._dataMap=$dataMap),this._dataMap},getRegion(t,e){return this.getTileId(t,e,5)},getSetNumber:t=>Tilemap.isAutotile(t)?Tilemap.isTileA1(t)?0:Tilemap.isTileA2(t)?1:Tilemap.isTileA3(t)?2:3:Tilemap.isTileA5(t)?4:5+Math.floor(t/256),getShadowBits(t,e){const i=this.getDataMap();return i.data[(4*i.height+e)*i.width+t]||0},getTerrainTag:t=>$gameMap.tilesetFlags()[t]>>12,getTilePassage:Object(r.m)({1(t){return this.getTilePassage(t,this.getTileConfig(t))},2(t,e){if("pass"in e)return e.pass;const i=$gameMap.tilesetFlags()[t];return 16&i?this.enumPassage.THROUGH:15==(15&i)?this.enumPassage.WALL:this.enumPassage.FLOOR},3(t,e,i){const a=this.getTileId(t,e,i);return this.getTilePassage(a,this.getTileConfig(a,t,e,i))},default(t,e,i,a){return this.getTilePassage(t,this.getTileConfig(t,e,i,a))}}),getMaterialOptions(t,e){const i={};return"alpha"in t&&(i.alpha=t.alpha),"glow"in t&&(i.glow=t.glow),e&&(`${e}_alpha`in t&&(i.alpha=t[`${e}_alpha`]),`${e}_glow`in t&&(i.glow=t[`${e}_glow`])),"alpha"in i&&(i.transparent=!0),i},getTileAnimationData(t,e){const i=t[`${e}_id`];if(`${e}_animData`in t)return t[`${e}_animData`];const a={animX:0,animY:0};if(Tilemap.isTileA1(i)){const t=Tilemap.getAutotileKind(i);a.animX=t<=1?2:t<=3?0:t%2?0:2,a.animY=t<=3?0:t%2?1:0}return a},getTileConfig:Object(r.m)({3(t,e,i){return this.getTileConfig(this.getTileData(t,e)[i],t,e,i)},default(t,e,i,s){const r={};if(!this.isTileEmpty(t)){const e=this.getTerrainTag(t);e&&e in this.TTAG_DATA&&Object.assign(r,this.TTAG_DATA[e]);const i=this.tilesetConfigurations[this.normalizeAutotileId(t)];i&&Object.assign(r,i)}if(0===s){const t=this.getRegion(e,i);t&&t in a.a.REGION_DATA&&Object.assign(r,this.REGION_DATA[t])}return r}}),getTileTextureOffsets(t,e,i,a){const s=this.getTileConfig(t,e,i,a),r=Tilemap.isAutotile(t)?48:1;this.getTilemap();return s.hasInsideConf=Boolean(s.inside_offset||s.rectInside||"inside_id"in s),s.hasBottomConf=Boolean(s.bottom_offset||s.rectBottom||"bottom_id"in s),null==s.top_id&&(s.top_id=t,s.top_offset&&(s.top_id=t+s.top_offset.x*r+s.top_offset.y*r*8)),null==s.side_id&&(s.side_id=t,s.side_offset&&(s.side_id=t+s.side_offset.x*r+s.side_offset.y*r*8)),null==s.inside_id&&(s.inside_id=s.side_id,s.inside_offset&&(s.inside_id=t+s.inside_offset.x*r+s.inside_offset.y*r*8)),null==s.bottom_id&&(s.bottom_id=s.top_id,s.bottom_offset&&(s.bottom_id=t+s.bottom_offset.x*r+s.bottom_offset.y*r*8)),s},getTileId(t,e,i=0){const a=this.getDataMap();return $gameMap.isLoopHorizontal()&&(t=t.mod(a.width)),$gameMap.isLoopVertical()&&(e=e.mod(a.height)),t<0||t>=a.width||e<0||e>=a.height?0:a.data[(i*a.height+e)*a.width+t]||0},getTileData(t,e){if(!$dataMap||!$dataMap.data)return[0,0,0,0];const i=$dataMap.data,a=$dataMap.width,s=$dataMap.height;if($gameMap.isLoopHorizontal()&&(t=t.mod(a)),$gameMap.isLoopVertical()&&(e=e.mod(s)),t<0||t>=a||e<0||e>=s)return[0,0,0,0];const r=[];for(let n=0;n<4;++n)r[n]=i[(n*s+e)*a+t]||0;return r},getTileHeight(t,e,i=0){if(!$dataMap)return 0;$gameMap.isLoopHorizontal()&&(t=t.mod($dataMap.width)),$gameMap.isLoopVertical()&&(e=e.mod($dataMap.height));const a=this.getTileData(t,e)[i];if(this.isTileEmpty(a)&&i>0)return 0;const s=this.enumShapes,r=this.getTileConfig(a,t,e,i);let n=0;if("height"in r)n=r.height;else if(this.isWallTile(a))n=this.WALL_HEIGHT;else if(this.isTableTile(a))n=this.TABLE_HEIGHT;else if(this.isSpecialShape(r.shape))switch(r.shape){case s.SLOPE:n=0;break;default:n=1}return"depth"in r&&(n-=r.depth),r.shape===s.SLOPE&&(n+=r.slopeHeight||1),n},getStackHeight(t,e,i=3){let a=0;for(let s=0;s<=i;++s)a+=this.getTileFringe(t,e,s),a+=this.getTileHeight(t,e,s);return a},getSlopeDirection(t,e,i,s=!1){const n=this.getStackHeight(t,e,i),o=this.getTileData(t,e)[i],h=this.getTileConfig(o,t,e,i),l=h.slopeHeight||1,c=mapCell_MapCell.neighborPositions,p=$gameMap.tilesetFlags()[o],d=this.getShadowBits(t,e),u=[0,3,10,5,12];let g;for(let i=0;i<c.length;++i){const s=c[i],r={neighbor:s,favor:0};r.dir=5-3*s.y+s.x;const o=this.getCollisionHeights(t+s.x,e+s.y,{slopeMax:!0}),m=this.getCollisionHeights(t-s.x,e-s.y,{slopeMin:!0});o.some(t=>Math.abs(n-l-t.z2)<=a.a.STAIR_THRESH)&&(r.favor+=1),m.some(t=>Math.abs(n-t.z2)<=a.a.STAIR_THRESH)&&(r.favor+=1),p&1<<r.dir/2-1&&(r.favor=-2),p&1<<(10-r.dir)/2-1&&(r.favor=-1),(d&u[r.dir/2])===u[r.dir/2]&&(r.favor=30),h.slopeDirection===r.dir&&(r.favor=100),(!g||r.favor>g.favor)&&(g=r)}return g.rot=Object(r.i)(180-this.dirToYaw(g.dir)),s?g:g.rot},getWalkHeight(t,e,i=!1){const a=Math.round(t),s=Math.round(e),r=this.getTileData(a,s);let n=0,o=0;for(let h=0;h<=3;++h){const l=r[h];if(this.isTileEmpty(l)&&h>0)continue;n+=o;const c=this.getTileConfig(l,a,s,h),p=c.shape;if(p===this.enumShapes.SLOPE)if(i)o=c.slopeHeight||1,n+=this.getTileHeight(a,s,h)-o;else{const i=this.getSlopeHeight(t,e,h,c);n+=this.getTileHeight(a,s,h)-(c.slopeHeight||1)+i,o=0}else o=this.getTileHeight(a,s,h);o+=this.getTileFringe(a,s,h),this.isSpecialShape(p)||(n+=o,o=0)}return n},getSlopeHeight(t,e,i,a=null){const s=Math.round(t),n=Math.round(e);null==a&&(a=this.getTileConfig(this.getTileData(s,n)[i],s,n,i));const o=this.getSlopeDirection(s,n,i),h=Object(r.r)(o),l=-Object(r.g)(o);let c=(t+.5)%1,p=(e+.5)%1;Math.sign(h<0)&&(c=1-c),Math.sign(l<0)&&(p=1-p);const d=Math.abs(h)*c+Math.abs(l)*p;return(a.slopeHeight||1)*d},getCollisionHeights(t,e,i={}){const a=Math.round(t),s=Math.round(e);let r=0;const n=[{z1:-1/0,z2:0}];i.layers&&(n.layers=[]);const o=this.getTileData(a,s);for(let h=0;h<=3;++h){let l=this.getTileHeight(a,s,h);const c=o[h],p=this.getTileConfig(c,a,s,h),d=p.shape;let u=!1;this.getTilePassage(c,p)===this.enumPassage.THROUGH?(l=0,u=!0):d===this.enumShapes.SLOPE&&(i.slopeMax?l=l:i.slopeMin?l-=p.slopeHeight||1:l=l-(p.slopeHeight||1)+this.getSlopeHeight(t,e,h,p));const g=this.getTileFringe(a,s,h);r+=g,u||(l<0?g+l<0&&(n[n.length-1].z2+=g+l):0===h?n[0].z2=r+l:n.push({z1:r,z2:r+l}),r+=l,i.layers&&(n.layers[h]=n[n.length-1]),d===this.enumShapes.SLOPE&&(n[n.length-1].isSlope=!0))}return n},getTileLayers(t,e,i,a=!0){let s=1/0,r=[0],n=0;for(let o=0;o<=3;++o){if(this.getTilePassage(t,e,o)===this.enumPassage.THROUGH)continue;const h=this.getTileFringe(t,e,o),l=this.getTileHeight(t,e,o),c=this.getTileConfig(t,e,o);n+=h+l;const p=c.shape===this.enumShapes.SLOPE;p&&(n-=c.slopeHeight||1);const d=i-n;(a?i>=n:i>n)&&(d<s||p&&d<=s?(r=[o],s=d):d===s&&r.push(o))}return r},getFloatHeight(t,e,i=null,a=!0){const s=this.getTileData(t,e),r=null==i?[0,1,2,3]:this.getTileLayers(t,e,i,a);let n=0;for(const i of r){const a=s[i];if(this.isTileEmpty(a))continue;const r=this.getTileConfig(a,t,e,i);r&&"float"in r&&(n+=r.float)}return n},getStackFringeHeight(t,e,i=3){return this.getStackHeight(t,e,i)},getTileFringe(t,e,i){const a=this.getTileData(t,e)[i];if(this.isTileEmpty(a))return 0;const s=this.getTileConfig(a,t,e,i);return s&&"fringe"in s?s.fringe:this.isStarTile(a)?this.FRINGE_HEIGHT:0},getCullingHeight(t,e,i=3,a={}){const s=this.getDataMap();if(!this.getMapConfig("edge",!0)&&(!$gameMap.isLoopHorizontal()&&(t<0||t>=s.width)||!$gameMap.isLoopVertical()&&(e<0||e>=s.height)))return 1/0;const r=this.getTileData(t,e);let n=0;for(let s=0;s<=i;++s){if(this.getTileFringe(t,e,s))return n;const i=r[s],o=this.getTileConfig(i,t,e,s),h=o.shape;if(this.isSpecialShape(h))return h===this.enumShapes.SLOPE&&(n+=this.getTileHeight(t,e,s),a.dir&&a.dir===this.getSlopeDirection(t,e,s,!0).dir||(n-=o.slopeHeight||1)),n;a.ignorePits&&o.depth>0&&(n+=o.depth),n+=this.getTileHeight(t,e,s)}return n},tileHasPit(t,e,i=3){const a=this.getTileData(t,e);for(let s=0;s<=i;++s){const i=a[s];if(this.getTileConfig(i,t,e,s).depth>0)return!0}return!1},isTilePit(t,e,i){const a=this.getTileData(t,e)[i];return this.getTileConfig(a,t,e,i).depth>0},getTileRects(t){const e=[],i=this.getTilemap(),a=i._isTableTile(t);if(i._drawTile({addRect:(t,i,a,s,r,n,o,h,l)=>{e.push({setN:t,x:i,y:a,width:n,height:o,ox:s,oy:r})}},t,0,0),a)for(let t=e.length-1;t>=0;--t)e[t].oy>Object(r.u)()/2&&(e[t-1].y+=2*Object(r.u)()/3,e.splice(t,1));return e},isTileEmpty:t=>!t||1544===t,isWallTile(t){const e=Tilemap.getAutotileKind(t),i=Math.floor(e/8),a=Tilemap.isTileA3(t)||Tilemap.isTileA4(t);return a&&i%2?2:a},isTableTile:t=>Boolean(Tilemap.isTileA2(t)&&128&$gameMap.tilesetFlags()[t]),isStarTile:t=>Boolean(16&$gameMap.tilesetFlags()[t]),isWaterfallTile(t){const e=Tilemap.getAutotileKind(t);return Tilemap.isTileA1(t)&&e>=4&&e%2},isSpecialShape(t){const e=a.a.enumShapes;return t===e.FENCE||t===e.CROSS||t===e.XCROSS||t===e.SLOPE},isPlatformShape(t){const e=a.a.enumShapes;return null==t||t===e.FLAT||t===e.SLOPE},constructTileId(t,e,i){const a=`TILE_ID_${t.toUpperCase()}`;let s=a in Tilemap?Tilemap[a]:0;const r=Tilemap.isAutotile(s)?48:1;return s+=Number(e)*r+Number(i)*r*8},normalizeAutotileId(t){if(!Tilemap.isAutotile(t))return t;const e=Tilemap.getAutotileKind(t);return Tilemap.TILE_ID_A1+48*e}}),Object.assign(a.a,{mapLoaded:!1,mapReady:!1,clearMap(){this.mapLoaded=!1,this.clearMapCells();for(let t=this.characters.length-1;t>=0;--t)this.characters[t].dispose(!1,!0);this.characters.length=0,this.resetCameraTarget(),this.callFeatures("clearMap")},clearMapCells(){for(const t in this.textureCache)this.textureCache[t].dispose();for(const t in this.materialCache)this.materialCache[t].dispose();this.animatedTextures.length=0,this.textureCache={},this.materialCache={};for(const t in this.cells)this.cells[t].dispose(!1,!0);this.cells={}},reloadMap(){this.clearMapCells(),a.a.mapReady&&this.updateMap(),this.callFeatures("reloadMap")},loadMap(){this.updateBlenders(),this.updateMap(),this.createCharacters(),this.rememberCameraTarget(),this.callFeatures("loadMap")},async updateMap(){if(this.mapUpdating)return;this.mapLoaded=!0,this.mapUpdating=!0;for(const t in this.cells)this.cells[t].unload=!0;const t={left:Math.floor((this.cameraStick.x-this.RENDER_DIST)/this.CELL_SIZE),right:Math.floor((this.cameraStick.x+this.RENDER_DIST)/this.CELL_SIZE),top:Math.floor((this.cameraStick.y-this.RENDER_DIST)/this.CELL_SIZE),bottom:Math.floor((this.cameraStick.y+this.RENDER_DIST)/this.CELL_SIZE)};$gameMap.isLoopHorizontal()||(t.left=Math.max(0,t.left),t.right=Math.min(t.right,Math.ceil($gameMap.width()/a.a.CELL_SIZE)-1)),$gameMap.isLoopVertical()||(t.top=Math.max(0,t.top),t.bottom=Math.min(t.bottom,Math.ceil($gameMap.height()/a.a.CELL_SIZE)-1));const e=[];for(let i=t.left;i<=t.right;++i)for(let r=t.top;r<=t.bottom;++r){let t=i,n=r;$gameMap.isLoopHorizontal()&&(t=t.mod(Math.ceil($gameMap.width()/a.a.CELL_SIZE))),$gameMap.isLoopVertical()&&(n=n.mod(Math.ceil($gameMap.height()/a.a.CELL_SIZE)));const o=[t,n].toString();o in this.cells?this.cells[o].unload=!1:e.push(new s.v(t,n))}for(const t in this.cells)a.a.UNLOAD_CELLS&&this.cells[t].unload&&(this.cells[t].dispose(),delete this.cells[t]);const i=new s.v(Math.round(this.cameraStick.x/this.CELL_SIZE-.5),Math.round(this.cameraStick.y/this.CELL_SIZE-.5));e.sort((t,e)=>s.v.DistanceSquared(t,i)-s.v.DistanceSquared(e,i)),this.mapReady&&(e.length=Math.min(25,e.length));for(const t of e){let{x:e,y:i}=t;if(await this.loadMapCell(e,i),this.mapReady&&await Object(r.s)(10),!this.mapLoaded)return void this.endMapUpdate()}this.endMapUpdate()},endMapUpdate(){this.mapUpdating=!1,this.mapReady=!0},async loadMapCell(t,e){const i=[t,e].toString();if(i in this.cells)return;const a=new mapCell_MapCell(t,e);this.cells[i]=a,await a.load()},_cellsNeedingIntensiveUpdate:[],intensiveUpdate(){if(0===this._cellsNeedingIntensiveUpdate.length)return;const t=performance.now();let e,i=null;for(e of this._cellsNeedingIntensiveUpdate)if(!(t-e._lastIntensiveUpdate<=300)){i=this._cellsNeedingIntensiveUpdate.indexOf(e);break}if(!(null==i||i<0)){this._cellsNeedingIntensiveUpdate.splice(i,1),e._lastIntensiveUpdate=t,e._needsIntensiveUpdate=!1;for(let t of e.characters)t.intensiveUpdate();a.a.scene.sortLightsByPriority()}}}),Object.assign(a.a,{animatedTextures:[],textureCache:{},materialCache:{},createTexture:t=>new Promise((e,i)=>{const s=ImageManager.loadNormalBitmap(encodeURI(t));if(Decrypter.hasEncryptedImages)s.addLoadListener(()=>{const t=new BABYLON.DynamicTexture("dt",{width:s.width,height:s.height},!a.a.MIPMAP,BABYLON.Texture.NEAREST_SAMPLINGMODE);t.updateSamplingMode(1),t.getContext().drawImage(s.canvas,0,0),t.update(),e(t)});else{const t=new BABYLON.Texture(s._image.src,a.a.scene,!a.a.MIPMAP,!0,BABYLON.Texture.NEAREST_SAMPLINGMODE);e(t)}}),waitTextureLoaded:t=>new Promise((e,i)=>{t.isReady()&&e(),t.onLoadObservable.addOnce(()=>{e()})}),async getCachedTilesetTexture(t,e=0,i=0){const a=`TS:${t}|${e},${i}`;if(a in this.textureCache)return this.textureCache[a];const s=$gameMap.tileset().tilesetNames[t];if(!s)return await this.getErrorTexture();const r=`img/tilesets/${s}.png`,n=await this.createTexture(r);if(n.hasAlpha=!0,this.textureCache[a]=n,await this.waitTextureLoaded(n),this.textureCache[a]!==n)return await this.getErrorTexture();if(n.updateSamplingMode(1),e||i){const{width:t,height:a}=n.getBaseSize();n.frameData={x:0,y:0,w:t,h:a},n.animX=e,n.animY=i,this.animatedTextures.push(n)}return n},async getErrorTexture(){return this.errorTexture?this.errorTexture:(this.errorTexture=await this.createTexture(`${a.a.MV3D_FOLDER}/errorTexture.png`),this.errorTexture.isError=!0,this.errorTexture.dispose=()=>{},this.errorTexture)},async getBushAlphaTexture(){return this.bushAlphaTexture?this.bushAlphaTexture:(this.getBushAlphaTexture.getting=!0,this.bushAlphaTexture=await this.createTexture(`${a.a.MV3D_FOLDER}/bushAlpha.png`),this.bushAlphaTexture.getAlphaFromRGB=!0,this.bushAlphaTexture.dispose=()=>{},this.getBushAlphaTexture.getting=!1,this.bushAlphaTexture)},getBushAlphaTextureSync(){return this.bushAlphaTexture?this.bushAlphaTexture:(this.getBushAlphaTexture.getting||this.getBushAlphaTexture(),null)},async getCachedTilesetMaterial(t,e=0,i=0,r={}){this.processMaterialOptions(r);const n=`TS:${t}|${e},${i}|${this.getExtraBit(r)}`;if(n in this.materialCache)return this.materialCache[n];const o=await this.getCachedTilesetTexture(t,e,i),h=new s.t(n,this.scene);return h.diffuseTexture=o,r.transparent&&(h.opacityTexture=o,h.alpha=r.alpha),h.alphaCutOff=a.a.ALPHA_CUTOFF,h.ambientColor.set(1,1,1),h.emissiveColor.set(r.glow,r.glow,r.glow),h.specularColor.set(0,0,0),isNaN(this.LIGHT_LIMIT)||(h.maxSimultaneousLights=this.LIGHT_LIMIT),this.materialCache[n]=h,h},async getCachedTilesetMaterialForTile(t,e){const i=a.a.getSetNumber(t[`${e}_id`]),s=a.a.getMaterialOptions(t,e),r=a.a.getTileAnimationData(t,e);return await a.a.getCachedTilesetMaterial(i,r.animX,r.animY,s)},processMaterialOptions(t){"alpha"in t?(t.alpha=Math.round(7*t.alpha)/7,t.alph<1&&(t.transparent=!0)):t.alpha=1,t.glow="glow"in t?Math.round(7*t.glow)/7:0},getExtraBit(t){let e=0;return e|=Boolean(t.transparent)<<0,e|=7-7*t.alpha<<1,(e|=7*t.glow<<1).toString(36)},lastAnimUpdate:0,animXFrame:0,animYFrame:0,animDirection:1,updateAnimations(){if(!(performance.now()-this.lastAnimUpdate<=this.ANIM_DELAY)){this.lastAnimUpdate=performance.now(),this.animXFrame<=0?this.animDirection=1:this.animXFrame>=2&&(this.animDirection=-1),this.animXFrame+=this.animDirection,this.animYFrame=(this.animYFrame+1)%3;for(const t of this.animatedTextures)t.crop(t.frameData.x+t.animX*this.animXFrame*Object(r.v)(),t.frameData.y+t.animY*this.animYFrame*Object(r.t)(),t.frameData.w,t.frameData.h,!0)}}}),Object.assign(a.a,{createCharacters(){const t=$gameMap.events();for(const e of t)this.createCharacterFor(e,0);const e=$gameMap.vehicles();for(const t of e)this.createCharacterFor(t,1);const i=$gamePlayer.followers()._data;for(let t=i.length-1;t>=0;--t)this.createCharacterFor(i[t],29-t);this.createCharacterFor($gamePlayer,30)},createCharacterFor(t,e){if(!t.mv3d_sprite){const i=new characters_Character(t,e);return Object.defineProperty(t,"mv3d_sprite",{value:i,configurable:!0}),this.characters.push(i),i}return t.mv3d_sprite},updateCharacters(){for(let t=this.characters.length-1;t>=0;--t)this.characters[t].update()},setupSpriteMeshes(){characters_Sprite.Meshes={},characters_Sprite.Meshes.FLAT=s.i.MergeMeshes([s.j.CreatePlane("sprite mesh",{sideOrientation:s.c},a.a.scene).rotate(r.b,Math.PI/2,s.y)]),characters_Sprite.Meshes.SPRITE=s.i.MergeMeshes([s.j.CreatePlane("sprite mesh",{sideOrientation:s.c},a.a.scene).translate(r.c,.5,s.y)]),characters_Sprite.Meshes.CROSS=s.i.MergeMeshes([characters_Sprite.Meshes.SPRITE.clone(),characters_Sprite.Meshes.SPRITE.clone().rotate(r.c,Math.PI/2,s.y)]);for(const t in characters_Sprite.Meshes)a.a.scene.removeMesh(characters_Sprite.Meshes[t])},async getShadowMaterial(){if(this._shadowMaterial)return this._shadowMaterial;const t=await a.a.createTexture(`${a.a.MV3D_FOLDER}/shadow.png`),e=new s.t("shadow material",a.a.scene);return this._shadowMaterial=e,e.diffuseTexture=t,e.opacityTexture=t,e.specularColor.set(0,0,0),e.dispose=()=>{},e},async getShadowMesh(){let t;for(;this.getShadowMesh.getting;)await Object(r.s)(100);return this._shadowMesh?t=this._shadowMesh:(this.getShadowMesh.getting=!0,(t=characters_Sprite.Meshes.FLAT.clone("shadow mesh")).material=await this.getShadowMaterial(),this._shadowMesh=t,a.a.scene.removeMesh(t),this.getShadowMesh.getting=!1),t.clone()},ACTOR_SETTINGS:[]});class characters_Sprite extends s.u{constructor(){super("sprite",a.a.scene),this.spriteOrigin=new s.u("sprite origin",a.a.scene),this.spriteOrigin.parent=this,this.mesh=characters_Sprite.Meshes.FLAT.clone(),this.mesh.parent=this.spriteOrigin,this.textureLoaded=!1}async setMaterial(t){const e=await a.a.createTexture(t);await this.waitTextureLoaded(e),this.disposeMaterial(),this.texture=e,this.texture.hasAlpha=!0,this.onTextureLoaded(),this.material=new s.t("sprite material",a.a.scene),this.material.diffuseTexture=this.texture,this.material.alphaCutOff=a.a.ALPHA_CUTOFF,this.material.ambientColor.set(1,1,1),this.material.specularColor.set(0,0,0),isNaN(this.LIGHT_LIMIT)||(this.material.maxSimultaneousLights=this.LIGHT_LIMIT),this.mesh.material=this.material}async waitTextureLoaded(t=this.texture){await a.a.waitTextureLoaded(t)}onTextureLoaded(){this.texture.updateSamplingMode(1),this.textureLoaded=!0}disposeMaterial(){this.material&&(this.material.dispose(),this.texture.dispose(),this.material=null,this.texture=null)}dispose(...t){this.disposeMaterial(),super.dispose(...t)}}const F={configurable:!0,get(){return this._mv3d_z},set(t){this._mv3d_z=t,this.mv3d_sprite&&(this.mv3d_sprite.position.y=t)}},N={configurable:!0,get(){return this.char._mv3d_z},set(t){this.char._mv3d_z=t,this.position.y=t}};class characters_Character extends characters_Sprite{constructor(t,e){super(),this.order=e,this.mesh.order=this.order,this.mesh.character=this,this._character=this.char=t,this.charName="",this.charIndex=0,this.char.mv_sprite&&this.char.mv_sprite.updateBitmap(),this.char.mv3d_settings||(this.char.mv3d_settings={}),this.char.mv3d_blenders||(this.char.mv3d_blenders={}),this.updateCharacter(),this.updateShape(),this.isVehicle=this.char instanceof Game_Vehicle,this.isBoat=this.isVehicle&&this.char.isBoat(),this.isShip=this.isVehicle&&this.char.isShip(),this.isAirship=this.isVehicle&&this.char.isAirship(),this.isEvent=this.char instanceof Game_Event,this.isPlayer=this.char instanceof Game_Player,this.isFollower=this.char instanceof Game_Follower,"_mv3d_z"in this.char||(this.char._mv3d_z=a.a.getWalkHeight(this.char.x,this.char.y)),Object.defineProperty(this.char,"z",F),Object.defineProperty(this,"z",N),this.z=this.z,this.platformHeight=this.z,this.targetElevation=this.z,this.prevZ=this.z,this.needsPositionUpdate=!0,a.a.getShadowMesh().then(t=>{this.shadow=t,this.shadow.parent=this}),this.blendElevation=this.makeBlender("elevation",0),this.lightOrigin=new s.u("light origin",a.a.scene),this.lightOrigin.parent=this,this.setupLights(),this.isEvent?this.eventConfigure():(this.initialConfigure(),this.updateEmissive()),this.intensiveUpdate()}get settings(){return this.char.mv3d_settings}isBitmapReady(){return Boolean(this.bitmap&&this.bitmap.isReady()&&!this._waitingForBitmap)}isTextureReady(){return Boolean(this.texture&&this.texture.isReady()&&this.isBitmapReady())}get mv_sprite(){return this.char.mv_sprite||{}}get bitmap(){return this.mv_sprite.bitmap}setTileMaterial(){const t=a.a.getSetNumber(this._tileId),e=$gameMap.tileset().tilesetNames[t];if(e){const t=`img/tilesets/${e}.png`;this.setMaterial(t)}else this.setMaterial("MV3D/errorTexture.png")}async waitBitmapLoaded(){this.char.mv_sprite||(await Object(r.s)(),this.char.mv_sprite)?(this._waitingForBitmap=!0,this.char.mv_sprite.updateBitmap(),await new Promise(t=>this.char.mv_sprite.bitmap.addLoadListener(t)),this._waitingForBitmap=!1):console.warn("mv_sprite is undefined")}async waitTextureLoaded(t=this.texture){await this.waitBitmapLoaded(),await super.waitTextureLoaded(t)}onTextureLoaded(){super.onTextureLoaded(),this.updateScale(),this.updateEmissive()}isImageChanged(){return this._tilesetId!==$gameMap.tilesetId()||this._tileId!==this._character.tileId()||this._characterName!==this._character.characterName()}updateCharacter(){this.needsPositionUpdate=!0,this._tilesetId=$gameMap.tilesetId(),this._tileId=this._character.tileId(),this._characterName=this._character.characterName(),this._characterIndex=this._character.characterIndex(),this._isBigCharacter=ImageManager.isBigCharacter(this._characterName),this.isEmpty=!1,this._tileId>0?this.setTileMaterial(this._tileId):this._characterName?this.setMaterial(`img/characters/${this._characterName}.png`):(this.isEmpty=!0,this.setEnabled(!1),this.spriteWidth=1,this.spriteHeight=1)}setFrame(t,e,i,a){if(this.isTextureReady()){if(!(this._tileId>0)){const s=this.texture.getSize(),r=this.texture.getBaseSize(),n=r.width/s.width,o=r.height/s.height;t/=n,i/=n,e/=o,a/=o}this.texture.crop(t,e,i,a,this._tileId>0)}}async updateScale(){this.isBitmapReady()||await this.waitBitmapLoaded(),this.mv_sprite.updateBitmap();const t=this.getConfig("scale",new s.v(1,1));this.spriteWidth=this.mv_sprite.patternWidth()/Object(r.u)()*t.x,this.spriteHeight=this.mv_sprite.patternHeight()/Object(r.u)()*t.y;const e=this.spriteWidth,i=this.spriteHeight;this.mesh.scaling.set(e,i,i)}getDefaultConfigObject(){return this.isVehicle?a.a[`${this.char._type.toUpperCase()}_SETTINGS`].conf:this.char.isTile()?a.a.EVENT_TILE_SETTINGS:this.isEvent&&this.char.isObjectCharacter()?a.a.EVENT_OBJ_SETTINGS:a.a.EVENT_CHAR_SETTINGS}getActorConfigObject(){const t=$gameParty._actors[this.isFollower?this.char._memberIndex:0];if(!t)return{};if(!(t in a.a.ACTOR_SETTINGS)){const e=$dataActors[t];a.a.ACTOR_SETTINGS[t]=a.a.readConfigurationFunctions(a.a.readConfigurationBlocksAndTags(e.note),a.a.eventConfigurationFunctions)}return a.a.ACTOR_SETTINGS[t]}getConfig(t,e){if(t in this.settings)return this.settings[t];if(this.isEvent){if(this.settings_event_page&&t in this.settings_event_page)return this.settings_event_page[t];if(this.settings_event&&t in this.settings_event)return this.settings_event[t]}else if(this.isPlayer||this.isFollower){const e=this.getActorConfigObject();if(t in e)return e[t]}const i=this.getDefaultConfigObject();return t in i?i[t]:e}hasConfig(t){return t in this.settings||this.isEvent&&(this.settings_event_page&&t in this.settings_event_page||this.settings_event&&t in this.settings_event)||(this.isPlayer||this.isFollower)&&t in this.getActorConfigObject()||t in this.getDefaultConfigObject()}eventConfigure(){if(!this.settings_event){this.settings_event={};const t=this.char.event().note;a.a.readConfigurationFunctions(a.a.readConfigurationTags(t),a.a.eventConfigurationFunctions,this.settings_event),this.initialConfigure()}this.settings_event_page={};const t=this.char.page();if(!t)return;let e="";for(const i of t.list)108!==i.code&&408!==i.code||(e+=i.parameters[0]);a.a.readConfigurationFunctions(a.a.readConfigurationTags(e),a.a.eventConfigurationFunctions,this.settings_event_page),this.updateScale(),this.updateShape(),this.char.mv3d_needsConfigure&&(this.char.mv3d_needsConfigure=!1,this.needsPositionUpdate=!0,this.pageConfigure())}initialConfigure(){this.configureHeight()}pageConfigure(t=this.settings_event_page){if("pos"in t){const e=this.char.event(),i=t;this.char.locate(Object(r.q)(e.x,i.x),Object(r.q)(e.y,i.y))}if(this.setupEventLights(),this.lamp&&"lamp"in t){const t=this.getConfig("lamp");this.blendLampColor.setValue(t.color,.5),this.blendLampIntensity.setValue(t.intensity,.5),this.blendLampDistance.setValue(t.distance,.5)}if(this.flashlight){if("flashlight"in t){const t=this.getConfig("flashlight");this.blendFlashlightColor.setValue(t.color,.5),this.blendFlashlightIntensity.setValue(t.intensity,.5),this.blendFlashlightDistance.setValue(t.distance,.5),this.blendFlashlightAngle.setValue(t.angle,.5)}"flashlightPitch"in t&&this.blendFlashlightPitch.setValue(this.getConfig("flashlightPitch",90),.25)}("height"in t||this.isAbove!==(2===this.char._priorityType))&&this.configureHeight(),this.updateScale(),this.updateShape(),this.updateEmissive(),this.updateLightOffsets()}updateEmissive(){if(this.material){const t=this.getConfig("glow",0);if(this.lamp){const e=this.lamp.diffuse,i=Object(r.l)(0,1,this.lamp.intensity);this.material.emissiveColor.set(Math.max(t,e.r*i),Math.max(t,e.g*i),Math.max(t,e.b*i))}else this.material.emissiveColor.set(t,t,t)}}configureHeight(){this.isAbove=2===this.char._priorityType;let t=Math.max(0,this.getConfig("height",this.isAbove&&!this.hasConfig("z")?a.a.EVENT_HEIGHT:0));this.blendElevation.setValue(t,0),this.z=this.platformHeight+t}setupMesh(){this.mesh.mv3d_isSetup||(a.a.callFeatures("createCharMesh",this.mesh),this.mesh.parent=this.spriteOrigin,this.mesh.character=this,this.mesh.order=this.order,this.material&&(this.mesh.material=this.material),this.mesh.mv3d_isSetup=!0),this.flashlight&&(this.flashlight.excludedMeshes.splice(0,1/0),this.flashlight.excludedMeshes.push(this.mesh))}dirtyNearbyCells(){this.cell&&characters_Character.dirtyNearbyCells(this.cell.cx,this.cell.cy)}static dirtyNearbyCells(t,e){for(let i=t-1;i<=t+1;++i)for(let t=e-1;t<=e+1;++t){let e=i,s=t;$gameMap.isLoopHorizontal()&&(e=e.mod(Math.ceil($gameMap.width()/a.a.CELL_SIZE))),$gameMap.isLoopVertical()&&(s=s.mod(Math.ceil($gameMap.height()/a.a.CELL_SIZE)));const r=a.a.cells[[e,s]];r&&(r._needsIntensiveUpdate||(r._needsIntensiveUpdate=!0,a.a._cellsNeedingIntensiveUpdate.push(r)))}}intensiveUpdate(){this.setupLightInclusionLists()}setupLightInclusionLists(){this.flashlight&&(this.flashlight.includedOnlyMeshes.splice(0,1/0),this.flashlight.includedOnlyMeshes.push(...this.getMeshesInRangeOfLight(this.flashlight))),this.lamp&&(this.lamp.includedOnlyMeshes.splice(0,1/0),this.lamp.includedOnlyMeshes.push(...this.getMeshesInRangeOfLight(this.lamp)))}getMeshesInRangeOfLight(t){if(!this.cell)return[];const e=s.w.TransformCoordinates(t.position,t.getWorldMatrix()),i=[];for(let r=this.cell.cx-1;r<=this.cell.cx+1;++r)for(let n=this.cell.cy-1;n<=this.cell.cy+1;++n){let o=r,h=n;$gameMap.isLoopHorizontal()&&(o=o.mod(Math.ceil($gameMap.width()/a.a.CELL_SIZE))),$gameMap.isLoopVertical()&&(h=h.mod(Math.ceil($gameMap.height()/a.a.CELL_SIZE)));const l=a.a.cells[[o,h]];if(!l||!l.mesh)continue;const c=l.mesh.getBoundingInfo().boundingSphere;if(!(s.w.Distance(e,c.centerWorld)>=c.radiusWorld+t.range)){i.push(l.mesh);for(let a of l.characters){const r=a.mesh.getBoundingInfo().boundingSphere;s.w.Distance(e,r.centerWorld)>=r.radiusWorld+t.range||i.push(a.mesh)}}}return i}setupEventLights(){const t=this.getConfig("flashlight"),e=this.getConfig("lamp");t&&!this.flashlight&&this.setupFlashlight(),e&&!this.lamp&&this.setupLamp()}setupLights(){"flashlightColor"in this.char.mv3d_blenders&&this.setupFlashlight(),"lampColor"in this.char.mv3d_blenders&&this.setupLamp()}setupFlashlight(){if(this.flashlight)return;const t=this.getConfig("flashlight",{color:16777215,intensity:1,distance:a.a.LIGHT_DIST,angle:a.a.LIGHT_ANGLE});this.blendFlashlightColor=this.makeColorBlender("flashlightColor",t.color),this.blendFlashlightIntensity=this.makeBlender("flashlightIntensity",t.intensity),this.blendFlashlightDistance=this.makeBlender("flashlightDistance",t.distance);const e=this.blendFlashlightDistance.targetValue();this.blendFlashlightDistance.setValue(0,0),this.blendFlashlightDistance.setValue(e,.25),this.blendFlashlightAngle=this.makeBlender("flashlightAngle",t.angle),this.flashlight=new s.q("flashlight",s.w.Zero(),s.w.Zero(),Object(r.i)(this.blendFlashlightAngle.targetValue()+a.a.FLASHLIGHT_EXTRA_ANGLE),0,a.a.scene),this.flashlight.renderPriority=2,this.updateFlashlightExp(),this.flashlight.range=this.blendFlashlightDistance.targetValue(),this.flashlight.intensity=this.blendFlashlightIntensity.targetValue()*a.a.FLASHLIGHT_INTENSITY_MULTIPLIER,this.flashlight.diffuse.set(...this.blendFlashlightColor.targetComponents()),this.flashlight.direction.y=-1,this.flashlightOrigin=new s.u("flashlight origin",a.a.scene),this.flashlightOrigin.parent=this.lightOrigin,this.flashlight.parent=this.flashlightOrigin,this.blendFlashlightPitch=this.makeBlender("flashlightPitch",90),this.blendFlashlightYaw=this.makeBlender("flashlightYaw",0),this.blendFlashlightYaw.cycle=360,this.updateFlashlightDirection(),this.setupMesh(),this.updateLightOffsets()}updateFlashlightExp(){this.flashlight.exponent=64800*Math.pow(this.blendFlashlightAngle.currentValue(),-2)}setupLamp(){if(this.lamp)return;const t=this.getConfig("lamp",{color:16777215,intensity:1,distance:a.a.LIGHT_DIST});this.blendLampColor=this.makeColorBlender("lampColor",t.color),this.blendLampIntensity=this.makeBlender("lampIntensity",t.intensity),this.blendLampDistance=this.makeBlender("lampDistance",t.distance);const e=this.blendLampDistance.targetValue();this.blendLampDistance.setValue(0,0),this.blendLampDistance.setValue(e,.25),this.lamp=new s.o("lamp",s.w.Zero(),a.a.scene),this.lamp.renderPriority=1,this.lamp.diffuse.set(...this.blendLampColor.targetComponents()),this.lamp.intensity=this.blendLampIntensity.targetValue(),this.lamp.range=this.blendLampDistance.targetValue(),this.lampOrigin=new s.u("lamp origin",a.a.scene),this.lampOrigin.parent=this.lightOrigin,this.lamp.parent=this.lampOrigin,this.updateLightOffsets()}updateFlashlightDirection(){this.flashlightOrigin.yaw=this.blendFlashlightYaw.currentValue(),this.flashlightOrigin.pitch=-this.blendFlashlightPitch.currentValue()}updateLights(){if(this.flashlight){const t=180+Object(r.q)(a.a.dirToYaw(this.char.mv3d_direction(),a.a.DIR8MOVE),this.getConfig("flashlightYaw","+0"));t!==this.blendFlashlightYaw.targetValue()&&this.blendFlashlightYaw.setValue(t,.25),this.blendFlashlightColor.update()|this.blendFlashlightIntensity.update()|this.blendFlashlightDistance.update()|this.blendFlashlightAngle.update()|this.blendFlashlightYaw.update()|this.blendFlashlightPitch.update()&&(this.flashlight.diffuse.set(...this.blendFlashlightColor.currentComponents()),this.flashlight.intensity=this.blendFlashlightIntensity.currentValue()*a.a.FLASHLIGHT_INTENSITY_MULTIPLIER,this.flashlight.range=this.blendFlashlightDistance.currentValue(),this.flashlight.angle=Object(r.i)(this.blendFlashlightAngle.currentValue()+a.a.FLASHLIGHT_EXTRA_ANGLE),this.updateFlashlightExp(),this.updateFlashlightDirection())}this.lamp&&this.blendLampColor.update()|this.blendLampIntensity.update()|this.blendLampDistance.update()&&(this.lamp.diffuse.set(...this.blendLampColor.currentComponents()),this.lamp.intensity=this.blendLampIntensity.currentValue(),this.lamp.range=this.blendLampDistance.currentValue(),this.updateEmissive())}makeBlender(t,e,i=blenders_Blender){t in this.char.mv3d_blenders?e=this.char.mv3d_blenders[t]:this.char.mv3d_blenders[t]=e;const a=new i(t,e);return a.storageLocation=()=>this.char.mv3d_blenders,a}makeColorBlender(t,e){return this.makeBlender(t,e,ColorBlender)}hasBush(){return!this.platformChar&&(this.getConfig("bush",!(this.char.isTile()||this.isVehicle||this.isEvent&&this.char.isObjectCharacter()))&&!(this.blendElevation.currentValue()||this.falling))}getShape(){return this.getConfig("shape",a.a.enumShapes.SPRITE)}updateShape(){const t=this.getShape();if(this.shape===t)return;this.shape=t;let e=characters_Sprite.Meshes.SPRITE;const i=a.a.enumShapes;switch(this.shape){case i.FLAT:e=characters_Sprite.Meshes.FLAT;break;case i.XCROSS:case i.CROSS:e=characters_Sprite.Meshes.CROSS;break;case i.WALL:case i.FENCE:}a.a.callFeatures("destroyCharMesh",this.mesh),this.mesh.dispose(),this.mesh=e.clone(),this.setupMesh(),this.spriteOrigin.rotation.set(0,0,0),this.dirtyNearbyCells()}update(){this.needsPositionUpdate=!1,this.char._erased&&this.dispose(),this.visible=this.mv_sprite.visible,"function"==typeof this.char.isVisible&&(this.visible=this.visible&&this.char.isVisible()),this.disabled=!this.visible,!this.char.isTransparent()&&(this.char._characterName||this.char._tileId)&&this.char.mv3d_inRenderDist()&&this.textureLoaded||(this.visible=!1),this._isEnabled?this.visible||this.setEnabled(!1):this.visible&&(this.setEnabled(!0),this.needsPositionUpdate=!0),this.isImageChanged()&&this.updateCharacter(),this._isEnabled&&(this.blendElevation.update()?this.needsPositionUpdate=!0:(this.x!==this.char._realX||this.y!==this.char._realY||this.falling||this.prevZ!==this.z||this.platformChar&&this.platformChar.needsPositionUpdate||this.isPlayer||this.char===$gamePlayer.vehicle())&&(this.needsPositionUpdate=!0,this.prevZ=this.z),this.material?this.updateNormal():this.updateEmpty(),this.updateAnimations())}updateNormal(){const t=a.a.enumShapes;this.shape===t.SPRITE?(this.mesh.pitch=a.a.blendCameraPitch.currentValue()-90,this.mesh.yaw=a.a.blendCameraYaw.currentValue()):this.shape===t.TREE?(this.spriteOrigin.pitch=this.getConfig("pitch",0),this.mesh.yaw=a.a.blendCameraYaw.currentValue()):(this.mesh.yaw=this.getConfig("rot",0),this.spriteOrigin.pitch=this.getConfig("pitch",0),this.spriteOrigin.yaw=this.getConfig("yaw",0),this.shape===t.XCROSS&&(this.mesh.yaw+=45)),this.char===$gamePlayer&&(this.mesh.visibility=+!a.a.is1stPerson(!0)),this.updateAlpha(),this.updatePosition(),this.updateElevation(),this.shadow&&this.updateShadow(),this.updateLights()}updateEmpty(){this.updatePosition(),this.updateElevation(),this.updateLights()}updateAlpha(){let t=this.hasConfig("alpha")||this.char.opacity()<255;if(this.bush=Boolean(this.char.bushDepth()),this.bush&&this.hasBush()){if(!this.material.opacityTexture){const t=a.a.getBushAlphaTextureSync();t&&t.isReady()&&(this.material.opacityTexture=t)}}else this.material.opacityTexture&&(this.material.opacityTexture=null);t||this.material.opacityTexture?(this.material.useAlphaFromDiffuseTexture=!0,this.material.alpha=this.getConfig("alpha",1)*this.char.opacity()/255):(this.material.useAlphaFromDiffuseTexture=!1,this.material.alpha=1)}updateLightOffsets(){if(this.lamp){const t=this.getConfig("lampHeight",a.a.LAMP_HEIGHT),e=this.getConfig("lampOffset",null);this.lampOrigin.position.set(0,0,0),this.lampOrigin.z=t,e&&(this.lampOrigin.x=e.x,this.lampOrigin.y=e.y)}if(this.flashlight){const t=this.getConfig("flashlightHeight",a.a.FLASHLIGHT_HEIGHT),e=this.getConfig("flashlightOffset",null);this.flashlightOrigin.position.set(0,0,0),this.flashlightOrigin.z=t,e&&(this.flashlightOrigin.x=e.x,this.flashlightOrigin.y=e.y)}}updatePositionOffsets(){this.spriteOrigin.position.set(0,0,0),this.shape===a.a.enumShapes.FLAT?this.spriteOrigin.z=4*a.a.LAYER_DIST:this.shape===a.a.enumShapes.SPRITE?this.spriteOrigin.z=4*a.a.LAYER_DIST*(1-Math.max(0,Math.min(90,a.a.blendCameraPitch.currentValue()))/90):this.spriteOrigin.z=0;const t=new s.v(Math.sin(-a.a.cameraNode.rotation.y),Math.cos(a.a.cameraNode.rotation.y)).multiplyByFloats(a.a.SPRITE_OFFSET,a.a.SPRITE_OFFSET);this.shape===a.a.enumShapes.SPRITE?(this.spriteOrigin.x=t.x,this.spriteOrigin.y=t.y,this.lightOrigin.x=t.x,this.lightOrigin.y=t.y):(this.lightOrigin.x=0,this.lightOrigin.y=0),this.spriteOrigin.x+=this.getConfig("x",0),this.spriteOrigin.y+=this.getConfig("y",0);const e=this.getConfig("height",0);e<0&&(this.spriteOrigin.z+=e)}updatePosition(){this.updatePositionOffsets();const t=a.a.loopCoords(this.char._realX,this.char._realY);if(this.x=t.x,this.y=t.y,!this.needsPositionUpdate)return;const e=Math.floor(Math.round(this.char._realX)/a.a.CELL_SIZE),i=Math.floor(Math.round(this.char._realY)/a.a.CELL_SIZE),s=a.a.cells[[e,i]];this.cell&&this.cell!==s&&this.removeFromCell(),s&&!this.cell&&(this.cell=s,s.characters.push(this)),this.dirtyNearbyCells()}updateElevation(){if(!this.needsPositionUpdate)return;if(this.char.isMoving()&&!((this.x-.5)%1)&&!((this.y-.5)%1))return;if(this.falling=!1,this.isPlayer){const t=this.char.vehicle();if(t&&(this.z=t.z,this.targetElevation=t.targetElevation,this.platformChar=t.platformChar,this.platformHeight=t.platformHeight,t._driving))return}if(this.hasConfig("z"))return this.z=this.getConfig("z",0),void(this.z+=this.blendElevation.currentValue());const t=this.getPlatform(this.char._realX,this.char._realY);this.platform=t,this.platformHeight=t.z2,this.platformChar=t.char,this.targetElevation=this.platformHeight+this.blendElevation.currentValue();let e=this.getConfig("gravity",a.a.GRAVITY)/60;if(this.hasFloat=this.isVehicle||(this.isPlayer||this.isFollower)&&$gamePlayer.vehicle(),this.hasFloat&&!this.platformChar&&(this.targetElevation+=a.a.getFloatHeight(Math.round(this.char._realX),Math.round(this.char._realY),this.z+this.spriteHeight)),this.isAirship&&$gamePlayer.vehicle()===this.char&&(this.targetElevation+=a.a.loadData("airship_height",a.a.AIRSHIP_SETTINGS.height)*this.char._altitude/this.char.maxAltitude()),this.char.isJumping()){let t=1-this.char._jumpCount/(2*this.char._jumpPeak),e=-4*Math.pow(t-.5,2)+1,i=Math.abs(this.char.mv3d_jumpHeightEnd-this.char.mv3d_jumpHeightStart);this.z=this.char.mv3d_jumpHeightStart*(1-t)+this.char.mv3d_jumpHeightEnd*t+e*i/2+this.char.jumpHeight()/Object(r.u)()}else if(e){const t=Math.abs(this.targetElevation-this.z);t<e&&(e=t),this.z<this.platformHeight&&(this.z=this.platformHeight),this.z>this.targetElevation?(this.z-=e,a.a.tileCollision(this,this.char._realX,this.char._realY,!1,!1)&&(this.z=this.platformHeight)):this.z<this.targetElevation&&(this.z+=e,a.a.tileCollision(this,this.char._realX,this.char._realY,!1,!1)&&(this.z-=e)),this.falling=this.z>this.targetElevation}}getPlatform(t=this.char._realX,e=this.char._realY,i={}){return a.a.getPlatformForCharacter(this,t,e,i)}getPlatformFloat(t=this.char._realX,e=this.char._realY,i={}){i.platform||(i.platform=this.getPlatform(t,e,i));const s=i.platform;let r=s.z2;if(this.hasFloat&&!s.char){const i=this.getCHeight();r+=a.a.getFloatHeight(Math.round(t),Math.round(e),this.z+Math.max(i,a.a.STAIR_THRESH),a.a.STAIR_THRESH>=i)}return r}updateShadow(){let t=Boolean(this.getConfig("shadow",this.shape!=a.a.enumShapes.FLAT));if(t&&(this.isPlayer||this.isFollower)){const e=a.a.characters.indexOf(this);if(e>=0)for(let i=e+1;i<a.a.characters.length;++i){const e=a.a.characters[i];if(e.shadow&&e.visible&&(e.char._realX===this.char._realX&&e.char._realY===this.char._realY)){t=!1;break}}}if(this.shadow._isEnabled?t||this.shadow.setEnabled(!1):t&&this.shadow.setEnabled(!0),!t)return;const e=Math.min(0,this.getConfig("height",0)),i=Math.max(this.z-this.platformHeight,e),s=this.getConfig("shadowDist",4),r=Math.max(0,1-Math.abs(i)/s);this.shadow.z=-i+3.5*a.a.LAYER_DIST,this.shadow.x=this.spriteOrigin.x,this.shadow.y=this.spriteOrigin.y;const n=this.getConfig("shadow",1);this.shadow.scaling.setAll(n*r),this.shadow.isAnInstance||(this.shadow.visibility=r-.5*this.bush)}updateAnimations(){this.char.isBalloonPlaying()?(this._balloon||(this._balloon=a.a.showBalloon(this)),this._balloon.update()):this.disposeBalloon()}disposeBalloon(){this._balloon&&(this._balloon.dispose(),this._balloon=null)}dispose(...t){super.dispose(...t),delete this.char.mv3d_sprite;const e=a.a.characters.indexOf(this);a.a.characters.splice(e,1),this.disposeBalloon(),this.removeFromCell()}removeFromCell(){if(this.cell){const t=this.cell.characters.indexOf(this);t>=0&&this.cell.characters.splice(t,1),this.cell=null}}getCHeight(){let t=this.getConfig("collide",this.shape===a.a.enumShapes.FLAT||0===this.char._priorityType?0:this.spriteHeight);return!0===t?this.spriteHeight:Number(t)}getCollider(){if(this._collider)return this._collider;const t={char:this};return this._collider=t,Object.defineProperties(t,{z1:{get:()=>this.z},z2:{get:()=>{let t=this.z;if(this.hasConfig("height")){const e=this.getConfig("height");e<0&&(t+=e)}return Math.max(this.z,this.z+this.getCHeight())}}}),t}getTriggerCollider(){if(this._triggerCollider)return this._triggerCollider;const t={};return this._triggerCollider=t,Object.defineProperties(t,{z1:{get:()=>{const t=this.getConfig("trigger");return t?this.z-t.down:a.a.TRIGGER_INFINITE||this.isEmpty?-1/0:this.getCollider().z1}},z2:{get:()=>{const t=this.getConfig("trigger");return t?this.z-t.up:a.a.TRIGGER_INFINITE||this.isEmpty?1/0:this.getCollider().z2}}}),t}getCollisionHeight(t=this.z){if(this.hasConfig("height")){const e=this.getConfig("height");e<0&&(t+=e)}return{z1:t,z2:t+this.getCHeight(),char:this}}getTriggerHeight(t=this.z){const e=this.getConfig("trigger");return e?{z1:t-e.down,z2:t+e.up}:a.a.TRIGGER_INFINITE||this.isEmpty?{z1:-1/0,z2:1/0}:this.getCollisionHeight()}}Object(r.n)(Sprite_Character.prototype,"characterPatternY",t=>(function(){const e=this._character.mv3d_sprite;if(!e)return t.apply(this,arguments);const i=e.getConfig("dirfix",e.isEvent&&e.char.isObjectCharacter());if(i)return e.char.direction()/2-1;let s=a.a.transformFacing(e.char.mv3d_direction());return s/2-1})),Object(r.n)(Sprite_Character.prototype,"setFrame",t=>(function(e,i,a,s){t.apply(this,arguments);const r=this._character.mv3d_sprite;r&&(r.isImageChanged()||r.setFrame(e,i,this.patternWidth(),this.patternHeight()))})),a.a.Sprite=characters_Sprite,a.a.Character=characters_Character;const H=Game_CharacterBase.prototype.isOnBush;Game_CharacterBase.prototype.isOnBush=function(){if(a.a.isDisabled()||!this.mv3d_sprite)return H.apply(this,arguments);const t=Math.round(this._realX),e=Math.round(this._realY),i=a.a.getTileData(t,e),s=a.a.getTileLayers(t,e,this.mv3d_sprite.z+this.mv3d_sprite.getCHeight(),!1),r=$gameMap.tilesetFlags();for(const t of s)if(0!=(64&r[i[t]]))return!0;return!1},Object.assign(a.a,{showAnimation(t){t||(t=$gamePlayer.mv3d_sprite)},showBalloon:t=>(t||(t=$gamePlayer.mv3d_sprite),new animations_Balloon(t))});class animations_Balloon extends s.r{constructor(t){super("balloon",animations_Balloon.Manager()),animations_Balloon.list.push(this),this.char=t}update(){if(!this.char)return;const t=s.w.TransformCoordinates(new s.w(0,1+.5/this.char.mesh.scaling.y,0),this.char.mesh.getWorldMatrix());this.position.copyFrom(t);const e=this.char.char.mv_sprite._balloonSprite;e&&(this.cellIndex=8*(e._balloonId-1)+Math.max(0,e.frameIndex()))}dispose(){super.dispose();const t=animations_Balloon.list.indexOf(this);t>=0&&animations_Balloon.list.splice(t,1),this._manager.markedForDisposal&&!this._manager.sprites.length&&this._manager.dispose()}}animations_Balloon.list=[],animations_Balloon.Manager=function(){return(!animations_Balloon.manager||animations_Balloon.manager.mapId!=$gameMap.mapId()||animations_Balloon.manager._capacity<$gameMap.events().length)&&(animations_Balloon.manager&&(animations_Balloon.manager.sprites.length?animations_Balloon.manager.markedForDisposal=!0:animations_Balloon.manager.dispose()),animations_Balloon.manager=new s.s("balloonManager","img/system/Balloon.png",$gameMap.events().length,48,a.a.scene),animations_Balloon.manager.texture.onLoadObservable.addOnce(()=>{animations_Balloon.manager.texture.updateSamplingMode(1)}),animations_Balloon.manager.mapId=$gameMap.mapId()),animations_Balloon.manager};const B=Sprite_Character.prototype.startAnimation;Sprite_Character.prototype.startAnimation=function(){if(B.apply(this,arguments),a.a.mapDisabled||!(SceneManager._scene instanceof Scene_Map))return;const t=this._animationSprites[this._animationSprites.length-1];a.a.pixiSprite.addChild(t)};const G=Sprite_Animation.prototype.updateScreenFlash;Sprite_Animation.prototype.updateScreenFlash=function(){G.apply(this,arguments),!a.a.mapDisabled&&SceneManager._scene instanceof Scene_Map&&(this._screenFlashSprite.x=0,this._screenFlashSprite.y=0)};const j=Sprite_Character.prototype.updateAnimationSprites;Sprite_Character.prototype.updateAnimationSprites=function(){if(j.apply(this,arguments),!a.a.mapDisabled&&this._animationSprites.length&&SceneManager._scene instanceof Scene_Map&&this._character.mv3d_sprite)for(const t of this._animationSprites){const e=t._animation.position,i=new s.w(0,3==e?0:1===e?.5:0===e?1:0,0),r=s.w.TransformCoordinates(i,this._character.mv3d_sprite.mesh.getWorldMatrix()),n=a.a.getScreenPosition(r),o=s.w.Distance(a.a.camera.globalPosition,r),h=a.a.camera.mode===s.l?a.a.getScaleForDist():a.a.getScaleForDist(o);t.behindCamera=n.behindCamera,t.update(),t.x=n.x,t.y=n.y,t.scale.set(h,h)}};const V=Sprite_Animation.prototype.updateCellSprite;Sprite_Animation.prototype.updateCellSprite=function(t,e){V.apply(this,arguments),this.behindCamera&&(t.visible=!1)},Object(r.n)(Game_Map.prototype,"setupParallax",t=>(function(){t.apply(this,arguments),this.mv3d_parallaxX=0,this.mv3d_parallaxY=0})),Object(r.n)(Game_Map.prototype,"changeParallax",t=>(function(e,i,a,s,r){(this._parallaxLoopX&&!i||this._parallaxSx&&!s)&&(this.mv3d_parallaxX=0),(this._parallaxLoopY&&!a||this._parallaxSy&&!r)&&(this.mv3d_parallaxY=0),t.apply(this,arguments)})),Object(r.n)(Game_Map.prototype,"updateParallax",t=>(function(){this._parallaxLoopX&&(this.mv3d_parallaxX+=this._parallaxSx/8),this._parallaxLoopY&&(this.mv3d_parallaxY+=this._parallaxSy/8)})),Object(r.n)(Game_Map.prototype,"parallaxOx",t=>(function(){let t=this.mv3d_parallaxX;return this._parallaxLoopX?t-816*a.a.blendCameraYaw.currentValue()/90:t})),Object(r.n)(Game_Map.prototype,"parallaxOy",t=>(function(){let t=this.mv3d_parallaxY;return this._parallaxLoopY?t-816*a.a.blendCameraPitch.currentValue()/90:0})),Game_CharacterBase.prototype.mv3d_inRenderDist=function(){const t=a.a.loopCoords(this.x,this.y);return Math.abs(t.x-a.a.cameraStick.x)<=a.a.RENDER_DIST&&Math.abs(t.y-a.a.cameraStick.y)<=a.a.RENDER_DIST},Object(r.n)(Game_CharacterBase.prototype,"isNearTheScreen",t=>(function(){return a.a.EVENTS_UPDATE_NEAR?this.mv3d_inRenderDist():t.apply(this,arguments)})),Object(r.n)(Game_Screen.prototype,"shake",t=>(function(){return 0}),()=>!a.a.isDisabled()&&SceneManager._scene instanceof Scene_Map),Object(r.n)(Game_CharacterBase.prototype,"screenX",t=>(function(){const e=this.mv3d_sprite;return e?SceneManager.isNextScene(Scene_Battle)&&this===$gamePlayer?Graphics.width/2:a.a.getScreenPosition(e).x:t.apply(this,arguments)})),Object(r.n)(Game_CharacterBase.prototype,"screenY",t=>(function(){const e=this.mv3d_sprite;return e?SceneManager.isNextScene(Scene_Battle)&&this===$gamePlayer?Graphics.height/2:a.a.getScreenPosition(e).y:t.apply(this,arguments)}));const $=Utils.isOptionValid("test"),z=async(t,e)=>{const a=i(4),s=i(5),r=s.resolve(global.__dirname,t);await Y(s.dirname(r)),await new Promise((t,i)=>{a.writeFile(r,e,e=>{e?i(e):t()})})},Y=t=>new Promise((e,a)=>{const s=i(4),r=i(5);s.mkdir(r.resolve(global.__dirname,t),{recursive:!0},t=>{t&&"EEXIST"!==t.code?a(t):e()})}),k=DataManager.loadDataFile;DataManager.loadDataFile=function(t,e){e.startsWith("Test_mv3d_")&&(e=e.replace("Test_mv3d_","mv3d_")),k.call(this,t,e)};class DataProxy{constructor(t,e,a={}){if(this.varName=t,this.fileName=e,$){const t=i(4),s=i(5).resolve(nw.__dirname,"data",e);t.existsSync(s)||t.writeFileSync(s,JSON.stringify("function"==typeof a?a():a))}DataManager._databaseFiles.push({name:t,src:e}),this._dirty=!1,this._data_handler={get:(t,e)=>t[e]&&"object"==typeof t[e]?new Proxy(t[e],data_handler):t[e],set:(t,e,i)=>{this._dirty=!0,t[e]=i},deleteProperty:(t,e)=>{this._dirty=!0,delete t[e]}},this.writing=!1,DataProxy.list.push(this)}setup(){this._data=window[this.varName],$&&(window[this.varName]=new Proxy(this._data,this._data_handler))}async update(){$&&this._dirty&&!this.writing&&(this.writing=!0,this._dirty=!1,await z(`data/${this.fileName}`,JSON.stringify(this._data)),this.writing=!1)}}DataProxy.list=[],a.a.DataProxy=DataProxy;const U=Scene_Boot.prototype.start;Scene_Boot.prototype.start=function(){U.apply(this,arguments),a.a.setupData()},Object.assign(a.a,{setupData(){for(const t of DataProxy.list)t.setup()},updateData(){for(const t of DataProxy.list)t.update()}}),new DataProxy("mv3d_data","mv3d_data.json",()=>({id:crypto.getRandomValues(new Uint32Array(1))[0]}));i(6)}]);
//# sourceMappingURL=mv3d.js.map