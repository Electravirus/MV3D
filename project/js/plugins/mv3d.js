/*:
@plugindesc 3D rendering in RPG Maker MV with babylon.js
version 0.5.4
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
Can take a number (0-1) or a color.  
Example: texture(||1), texture(glow:1), texture(glow:red)

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
Some shapes can have additional data passed to them. For instance,  
shape(fence,false) will disable fenceposts.
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

The offset() function can be used to offset an event's mesh. This is 
purely visual. xoff(), yoff(), and zoff() can be used to change the 
x, y, and z offset independently.  
Examples: offset(0.5,0.5,0.5), offset(z:1),
xoff(0.49), yoff(0.51), zoff(1)

The elevation() function will adjust the event's height above the ground.
With elevation greater than zero, the event will be flying.  
Example: elevation(2)

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
A second parameter can be supplied to control how far the shadow may travel.
before fading out.  
Examples: shadow(0), shadow(3), shadow(1,6)

The alpha function is used to make the event partially transparent or to turn
on alpha blending.  
Examples: alpha(0.5), alpha(1)

The glow parameter will make the event glow in the dark.  
Can take a number (0-1) or a color.  
Examples: glow(1), glow(red)

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

The backface parameter will force backfaces to be rendered on the ceiling. 
This will also cause the ceiling to collide with the camera (if camera collision
is on), and to cast shadows (if dynamic shadows is on).

Parameter List:  
img,x,y,w,h|height,backface|alpha|glow[anim]animx,animy  

Example: ceiling(A4,0,0|2),ceiling(A4,0,0|2,true)



### Other map settings

The edge function sets whether to render walls at the map edge.  
Edge can be set to clamp to repeat tiles at the edge of the map.  
Examples: edge(true), edge(false), edge(clamp), edge(clamp,2)

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

    mv3d ＠t animation <id>
    mv3d ＠t animation <id> depth <true/false> scale <n>

Play an animation on the event, with additional features.  
Animations played with this command will have depth by default 
(they can be occluded by other 3D objects).  
They can also have a custom scale.  
Examples:  
mv3d ＠p animation 8 scale 0.25

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
- Gaikiken


## Patron Heroes:

- A Memory of Eternity
- Fyoha
- 冬空 橙
- nyrion
- Vaan Auroris
- Chainer Valentine


@param options
@text Option Settings

@param 3dMenu
@text 3D Options Menu
@desc Whether 3D options will be in a submenu, regular options menu, or disabled.
@parent options
@type Select
@option SUBMENU
@option ENABLE
@option DISABLE
@default SUBMENU


@param renderDistOptionName
@text Render Distance Option Name
@desc symbol name: mv3d-renderDist
@parent options
@type Text
@default Render Distance

@param renderDist
@text Render Distance Default
@desc The maximum distance that can be rendered by the camera.
@parent renderDistOptionName
@type Number
@default 25
@min 0

@param renderDistOption
@text Render Distance Option
@desc Should Render Distance appear on options menu?
@parent renderDistOptionName
@type Boolean
@default true

@param renderDistMin
@text Render Distance Min
@parent renderDistOptionName
@type Number
@default 10
@min 0

@param renderDistMax
@text Render Distance Max
@parent renderDistOptionName
@type Number
@default 100
@min 0


@param mipmapOptionName
@text Mipmapping Option Name
@desc symbol name: mv3d-mipmap
@parent options
@type Text
@default Mipmapping

@param mipmap
@text Mipmapping Default
@parent mipmapOptionName
@type Boolean
@default true

@param mipmapOption
@text Mipmapping Option
@desc Should Mipmapping appear on options menu?
@parent mipmapOptionName
@type Boolean
@default true


@param fovOptionName
@text FOV Option Name
@desc symbol name: mv3d-fov
@parent options
@type Text
@default FOV

@param fov
@text FOV Default
@parent fovOptionName
@type Number
@default 65
@min 0 @max 180

@param fovOption
@text FOV Option
@desc Should FOV appear on options menu?
@parent fovOptionName
@type Boolean
@default false

@param fovMin
@text FOV Min
@parent fovOptionName
@type Number
@default 50
@min 0 @max 180

@param fovMax
@text FOV Max
@parent fovOptionName
@type Number
@default 100
@min 0 @max 180

@param spacer|graphics @text‏‏‎ ‎@desc ===============================================

@param graphics
@text Graphics

@param antialiasing
@text Antialiasing
@parent graphics
@type Boolean
@default true

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

@param backfaceCulling
@text Backface Culling
@parent graphics
@type Boolean
@default true

@param cameraCollision
@text Camera Collision
@parent graphics
@type Combo
@option Off
@option Type1
@option Type2
@option Type1 Smoothed
@option Type2 Smoothed
@default Type2 Smoothed

@param resScale
@text Resolution Scale
@desc Scale the resolution
@parent graphics
@type Number
@decimals 2
@min 0 @max 1
@default 1

@param spacer|map @text‏‏‎ ‎@desc ===============================================

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

@param spacer|fog @text‏‏‎ ‎@desc ===============================================

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

@param spacer|input @text‏‏‎ ‎@desc ===============================================

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

@param spacer|tileconfig @text‏‏‎ ‎@desc ===============================================

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

@param spacer|characters @text‏‏‎ ‎@desc ===============================================

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

@param spacer|assets @text‏‏‎ ‎@desc ===============================================

@param assets
@text Assets

@param diagSymbol
@text Diagonal Sprite Symbol
@desc Character sheets with this symbol contain diagonal sprites. Leave blank to use diagonal sprites with all images.
@parent assets
@type Text
@default {d}

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

*/


/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 13);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var _mod_babylon_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(2);
/* harmony import */ var _util_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(1);




const mv3d = {
	util:_util_js__WEBPACK_IMPORTED_MODULE_1__[/* default */ "i"],

	setup(){
		this.setupParameters();
		Object(_mod_babylon_js__WEBPACK_IMPORTED_MODULE_0__[/* setupBabylonMods */ "C"])();

		this.canvas = document.createElement('canvas');
		this.texture = PIXI.Texture.fromCanvas(this.canvas);
		this.texture.baseTexture.scaleMode=PIXI.SCALE_MODES.NEAREST;
		this.engine = new _mod_babylon_js__WEBPACK_IMPORTED_MODULE_0__[/* Engine */ "e"](this.canvas,this.ANTIALIASING);
		this.scene = new _mod_babylon_js__WEBPACK_IMPORTED_MODULE_0__[/* Scene */ "t"](this.engine);
		//this.scene.clearColor.a=0;
		this.scene.clearColor.set(0,0,0,0);

		//this.engine.forcePOTTextures=true;

		this.cameraStick = new _mod_babylon_js__WEBPACK_IMPORTED_MODULE_0__[/* TransformNode */ "x"]("cameraStick",this.scene);
		this.cameraNode = new _mod_babylon_js__WEBPACK_IMPORTED_MODULE_0__[/* TransformNode */ "x"]("cameraNode",this.scene);
		this.cameraNode.parent=this.cameraStick;
		this.camera = new _mod_babylon_js__WEBPACK_IMPORTED_MODULE_0__[/* FreeCamera */ "h"]("camera",new _mod_babylon_js__WEBPACK_IMPORTED_MODULE_0__[/* Vector3 */ "z"](0,0,0),this.scene);
		this.camera.parent=this.cameraNode;
		this.camera.fov=Object(_util_js__WEBPACK_IMPORTED_MODULE_1__[/* degtorad */ "j"])(mv3d.FOV);
		/*
		this.camera.orthoLeft=-Graphics.width/2/tileSize();
		this.camera.orthoRight=Graphics.width/2/tileSize();
		this.camera.orthoTop=Graphics.height/2/tileSize();
		this.camera.orthoBottom=-Graphics.height/2/tileSize();
		*/
		this.camera.minZ=0.1;
		this.camera.maxZ=this.RENDER_DIST;

		//this.scene.activeCameras.push(this.camera);

		this.scene.ambientColor = new _mod_babylon_js__WEBPACK_IMPORTED_MODULE_0__[/* Color3 */ "b"](1,1,1);
		this.scene.fogMode=_mod_babylon_js__WEBPACK_IMPORTED_MODULE_0__[/* FOGMODE_LINEAR */ "f"];

		this.map = new _mod_babylon_js__WEBPACK_IMPORTED_MODULE_0__[/* Node */ "m"]("map",this.scene);
		this.cells={};
		this.characters=[];

		this.setupBlenders();
		//this.updateBlenders(true);
		this.setupInput();

		this.setupSpriteMeshes();

		this.callFeatures('setup');

		if(isNaN(this.LIGHT_LIMIT)){
			const _sortLightsByPriority=BABYLON.Scene.prototype.sortLightsByPriority;
			BABYLON.Scene.prototype.sortLightsByPriority=function(){
				_sortLightsByPriority.apply(this,arguments);
				mv3d.updateAutoLightLimit();
			};
		}
	},

	updateCanvas(){
		this.canvas.width = Graphics._width*mv3d.RES_SCALE;
		this.canvas.height = Graphics._height*mv3d.RES_SCALE;
	},

	render(){
		this.scene.render();
		this.texture.update();
		//this.callFeatures('render');
	},

	lastMapUpdate:0,
	update(){
		if( performance.now()-this.lastMapUpdate > 1000 && !this.mapUpdating ){
			this.updateMap();
			this.lastMapUpdate=performance.now();
		}

		this.updateAnimations();

		this.updateCharacters();

		this.intensiveUpdate();

		this.updateBlenders();

		// input
		this.updateInput();

		for (const key in this.cells){
			this.cells[key].update();
		}

		this.callFeatures('update');

		this.updateData();
	},

	loadData(key,dfault){
		if(!$gameVariables || !$gameVariables.mv3d || !(key in $gameVariables.mv3d)){ return dfault; }
		return $gameVariables.mv3d[key];
	},
	saveData(key,value){
		if(!$gameVariables){ return console.warn(`MV3D: Couldn't save data ${key}:${value}`); }
		if(!$gameVariables.mv3d){ $gameVariables.mv3d={}; }
		$gameVariables.mv3d[key]=value;
	},
	clearData(key){
		if(!$gameVariables){ return console.warn(`MV3D: Couldn't clear data ${key}`); }
		if(!$gameVariables.mv3d){ return; }
		delete $gameVariables.mv3d[key];
	},

	updateCameraMode(){
		const mode = this.cameraMode;
		let updated=false;
		if(mode.startsWith('O')){
			if(this.camera.mode!==_mod_babylon_js__WEBPACK_IMPORTED_MODULE_0__[/* ORTHOGRAPHIC_CAMERA */ "n"]){ this.camera.mode=_mod_babylon_js__WEBPACK_IMPORTED_MODULE_0__[/* ORTHOGRAPHIC_CAMERA */ "n"]; updated=true; }
		}else{
			if(this.camera.mode!==_mod_babylon_js__WEBPACK_IMPORTED_MODULE_0__[/* PERSPECTIVE_CAMERA */ "o"]){ this.camera.mode=_mod_babylon_js__WEBPACK_IMPORTED_MODULE_0__[/* PERSPECTIVE_CAMERA */ "o"]; updated=true; }
		}
		if(updated){
			this.updateBlenders(true);
			this.callFeatures('updateCameraMode');
			this.updateParameters();
		}
	},
	get cameraMode(){
		return this.loadData('cameraMode',this.CAMERA_MODE).toUpperCase();
	},
	set cameraMode(v){
		v = String(v).toUpperCase().startsWith('O') ? 'ORTHOGRAPHIC' : 'PERSPECTIVE' ;
		this.saveData('cameraMode',v);
		this.updateBlenders(true);
	},

	is1stPerson(useCurrent){
		const k = useCurrent?'currentValue':'targetValue';
		return this.getCameraTarget()===$gamePlayer && this.blendCameraTransition[k]()<=0
		&& this.blendCameraDist[k]()<=0 && this.blendPanX[k]()===0 && this.blendPanY[k]()===0;
	},

	isDisabled(){
		return this.loadData('disabled', this.getMapConfig('disabled', !mv3d.ENABLED_DEFAULT ));
	},
	disable(fadeType=2){
		mv3d.saveData('disabled',true);
		//SceneManager.goto(Scene_Map);
		$gamePlayer.reserveTransfer($gameMap.mapId(),$gamePlayer.x,$gamePlayer.y,$gamePlayer.direction(),fadeType);
	},
	enable(fadeType=2){
		mv3d.saveData('disabled',false);
		//SceneManager.goto(Scene_Map);
		$gamePlayer.reserveTransfer($gameMap.mapId(),$gamePlayer.x,$gamePlayer.y,$gamePlayer.direction(),fadeType);
		mv3d.createCharacters();
	},

	loopCoords(x,y){
		if(this.loopHorizontal()){
			const mapWidth=mv3d.mapWidth();
			const ox = this.cameraStick.x - mapWidth/2;
			x=(x-ox).mod(mapWidth)+ox;
		}
		if(this.loopVertical()){
			const mapHeight=mv3d.mapHeight();
			const oy = this.cameraStick.y - mapHeight/2;
			y=(y-oy).mod(mapHeight)+oy;
		}
		return new _mod_babylon_js__WEBPACK_IMPORTED_MODULE_0__[/* Vector2 */ "y"](x,y);
	},

	autoLightLimit(lightLimit){
		if(isNaN(this.LIGHT_LIMIT)){
			return Math.max(4,lightLimit);
		}else{
			return this.LIGHT_LIMIT;
		}
	},

	updateAutoLightLimit(){
		const lightLimit=this.autoLightLimit(mv3d.scene.lights.length);
		for(const m of Object.values(mv3d.materialCache)){
			m.maxSimultaneousLights=lightLimit;
		}
		for(const char of this.characters){
			if(!char.material){ continue; }
			char.material.maxSimultaneousLights=this.autoLightLimit(char.mesh.lightSources.length);
		}
	},

	getFieldSize(dist=mv3d.blendCameraDist.currentValue()){
		const size = Math.tan(mv3d.camera.fov/2)*dist*2;
		return {
			width:size*mv3d.engine.getAspectRatio(mv3d.camera),
			height:size,
		};
	},
	getScaleForDist(dist=mv3d.blendCameraDist.currentValue()){
		return Graphics.height/this.getFieldSize(dist).height/48;
	},
	getFovForDist(dist=mv3d.blendCameraDist.currentValue(),height=Object(_util_js__WEBPACK_IMPORTED_MODULE_1__[/* optimalFrustrumHeight */ "p"])()){
		return 2*Math.atan(height/2/dist);
	},
	getFrustrumHeight(dist=mv3d.blendCameraDist.currentValue(),fov=mv3d.camera.fov){
		return 2*dist*Math.tan(fov/2);
	},


	getScreenPosition(node,offset=_mod_babylon_js__WEBPACK_IMPORTED_MODULE_0__[/* Vector3 */ "z"].Zero()){
		const matrix = node.parent ? node.parent.getWorldMatrix() : _mod_babylon_js__WEBPACK_IMPORTED_MODULE_0__[/* Matrix */ "j"].Identity();
		const pos = node instanceof _mod_babylon_js__WEBPACK_IMPORTED_MODULE_0__[/* Vector3 */ "z"] ? node.add(offset) : node.position.add(offset);
		const projected = _mod_babylon_js__WEBPACK_IMPORTED_MODULE_0__[/* Vector3 */ "z"].Project(pos,matrix,mv3d.scene.getTransformMatrix(),mv3d.camera.viewport);
		return {x:projected.x*Graphics.width, y:projected.y*Graphics.height, behindCamera:projected.z>1};
	},
	
	getUnscaledMatrix(mesh){
		const matrix = mesh.getWorldMatrix();
		const qrot=new _mod_babylon_js__WEBPACK_IMPORTED_MODULE_0__[/* Quaternion */ "r"](), vtrans=new _mod_babylon_js__WEBPACK_IMPORTED_MODULE_0__[/* Vector3 */ "z"]();
		matrix.decompose(null,qrot,vtrans);
		return _mod_babylon_js__WEBPACK_IMPORTED_MODULE_0__[/* Matrix */ "j"].Compose(_mod_babylon_js__WEBPACK_IMPORTED_MODULE_0__[/* Vector3 */ "z"].One(),qrot,vtrans);
	},
	getTranslationMatrix(mesh){
		const matrix = mesh.getWorldMatrix();
		const vrot=_mod_babylon_js__WEBPACK_IMPORTED_MODULE_0__[/* Vector3 */ "z"].Zero(), vtrans=new _mod_babylon_js__WEBPACK_IMPORTED_MODULE_0__[/* Vector3 */ "z"]();
		vrot.y=-Object(_util_js__WEBPACK_IMPORTED_MODULE_1__[/* degtorad */ "j"])(mv3d.blendCameraYaw.currentValue());
		vrot.x=-Object(_util_js__WEBPACK_IMPORTED_MODULE_1__[/* degtorad */ "j"])(mv3d.blendCameraPitch.currentValue()-90);
		matrix.decompose(null,null,vtrans);
		return _mod_babylon_js__WEBPACK_IMPORTED_MODULE_0__[/* Matrix */ "j"].Compose(_mod_babylon_js__WEBPACK_IMPORTED_MODULE_0__[/* Vector3 */ "z"].One(),vrot.toQuaternion(),vtrans);
	},
	getRotationMatrix(mesh){
		const matrix = mesh.getWorldMatrix();
		const qrot=new _mod_babylon_js__WEBPACK_IMPORTED_MODULE_0__[/* Quaternion */ "r"]();
		matrix.decompose(null,qrot,null);
		return _mod_babylon_js__WEBPACK_IMPORTED_MODULE_0__[/* Matrix */ "j"].Compose(_mod_babylon_js__WEBPACK_IMPORTED_MODULE_0__[/* Vector3 */ "z"].One(),qrot,_mod_babylon_js__WEBPACK_IMPORTED_MODULE_0__[/* Vector3 */ "z"].Zero());
	},

	globalPosition(node){
		const matrix = node.parent ? node.parent.getWorldMatrix() : _mod_babylon_js__WEBPACK_IMPORTED_MODULE_0__[/* Matrix */ "j"].Identity();
		return _mod_babylon_js__WEBPACK_IMPORTED_MODULE_0__[/* Vector3 */ "z"].TransformCoordinates(node.position,matrix);
	},

}
window.mv3d=mv3d;
/* harmony default export */ __webpack_exports__["a"] = (mv3d);

/***/ }),
/* 1 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "o", function() { return makeColor; });
/* unused harmony export hexNumber */
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "u", function() { return relativeNumber; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "f", function() { return booleanNumber; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "g", function() { return booleanString; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "m", function() { return falseString; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "w", function() { return sleep; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "j", function() { return degtorad; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "t", function() { return radtodeg; });
/* unused harmony export pointtorad */
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "s", function() { return pointtodeg; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "v", function() { return sin; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "h", function() { return cos; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "A", function() { return unround; });
/* unused harmony export minmax */
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "y", function() { return tileSize; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "z", function() { return tileWidth; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "x", function() { return tileHeight; });
/* unused harmony export optimalFrustrumWidth */
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "p", function() { return optimalFrustrumHeight; });
/* unused harmony export file */
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "k", function() { return dirtoh; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "l", function() { return dirtov; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "n", function() { return hvtodir; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "b", function() { return XAxis; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "c", function() { return YAxis; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "d", function() { return ZAxis; });
/* unused harmony export v2origin */
/* unused harmony export v3origin */
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return PI; });
/* unused harmony export PI2 */
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "q", function() { return overload; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "r", function() { return override; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "e", function() { return assign; });
/* harmony import */ var _mv3d__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(0);


const {Vector2,Vector3,Color3,Color4} = window.BABYLON;

const makeColor = color=>{
	if (typeof color === 'number'){
		return {
			r: (color>>16)/255,
			g: (color>>8&255)/255,
			b: (color&255)/255,
			a: 1,
		};
	}else if(color instanceof Color3){
		return color.toColor4();
	}else if(color instanceof Color4){
		return color;
	}else{
		const canvas = document.createElement('canvas');
		canvas.width=1; canvas.height=1;
		const context = canvas.getContext('2d');
		context.fillStyle = color; context.fillRect(0,0,1,1);
		const bytes = context.getImageData(0,0,1,1).data;
		return new Color4(bytes[0]/255,bytes[1]/255,bytes[2]/255,bytes[3]/255);
	}
}


const hexNumber=n=>{
	n=String(n);
	if(n.startsWith('#')){
		n=n.substr(1);
	}
	return Number.parseInt(n,16);
};

const relativeNumber=(current,n)=>{
	if(n===''){ return +current; }
	const relative = /^[+]/.test(n);
	if(relative){n=n.substr(1);}
	n=Number(n);
	if(Number.isNaN(n)){ return +current; }
	if(relative){
		return +current+n;
	}else{
		return +n;
	}
};

const booleanNumber=s=>{
	if(!isNaN(s)){return Number(s);}
	return booleanString(s);
};
const booleanString=s=>{
	return Boolean(falseString(s));
};
const falseString=s=>{
	if(!s){ return false; }
	if(typeof s !=='string'){ s=String(s); }
	const S=s.toUpperCase();
	if(falseString.values.includes(S)){
		return false;
	}
	return s;
};
falseString.values=['OFF','FALSE','UNDEFINED','NULL','DISABLE','DISABLED'];

const sleep=(ms=0)=>new Promise(resolve=>setTimeout(resolve,ms));
const degtorad=deg=>deg*Math.PI/180;
const radtodeg=rad=>rad*180/Math.PI;

const pointtorad=(x,y)=>Math.atan2(-y,x)-Math.PI/2;
const pointtodeg=(x,y)=>radtodeg(pointtorad(x,y));

const sin=r=>unround(Math.sin(r),1e15);
const cos=r=>unround(Math.cos(r),1e15);

const unround=(n,m=1e15)=>Math.round(n*m)/m;

const minmax=(min,max,v)=>Math.min(max,Math.max(min,v));

const tileSize=()=>tileWidth();
const tileWidth=()=>Game_Map.prototype.tileWidth();
const tileHeight=()=>Game_Map.prototype.tileHeight();
const optimalFrustrumWidth=()=>Graphics.width/48;
const optimalFrustrumHeight=()=>Graphics.height/48;

const file=(folder=_mv3d__WEBPACK_IMPORTED_MODULE_0__[/* default */ "a"].MV3D_FOLDER,name)=>{
	if(name.startsWith('/')){ return '.'+name; }
	else if(name.startsWith('./')){ return name; }
	if(folder.startsWith('/')){ folder='.'+folder; }
	else if(!folder.startsWith('./')){ folder='./'+folder; }
	return `${folder}/${name}`;
};

// directions

const dirtoh=d=>5 + ((d-1)%3-1);
const dirtov=d=>5 + (Math.floor((d-1)/3)-1)*3;
const hvtodir=(h,v)=>5 + (Math.floor((v-1)/3)-1)*3 + ((h-1)%3-1);

// useful consts
const XAxis = new Vector3(1,0,0);
const YAxis = new Vector3(0,1,0);
const ZAxis = new Vector3(0,0,1);
const v2origin = new Vector2(0,0);
const v3origin = new Vector3(0,0,0);

const PI = Math.PI;
const PI2 = Math.PI*2;

// overloading

const overload=funcs=>{
	const overloaded = function(){
		const l=arguments.length;
		if(typeof funcs[l] === 'function'){
			return funcs[l].apply(this,arguments);
		}else if(typeof funcs.default === 'function'){
			return funcs.default.apply(this,arguments);
		}else{ console.warn("Unsupported number of arguments."); }
	}
	for(const key in funcs){
		overloaded[key]=funcs[key].bind
	}
	return overloaded;
};

// override
const _override_default_condition=()=>!_mv3d__WEBPACK_IMPORTED_MODULE_0__[/* default */ "a"].isDisabled();
const override=(obj,methodName,getNewMethod,condition=_override_default_condition)=>{
	const oldMethod = obj[methodName];
	const newMethod = getNewMethod(oldMethod);
	const overrider = function(){
		if(!(typeof condition==='function'?condition():condition)){ return oldMethod.apply(this,arguments); }
		return newMethod.apply(this,arguments);
	};
	Object.defineProperty(overrider,'name',{value:`${methodName}<mv3d_override>`});
	Object.defineProperty(newMethod,'name',{value:`${methodName}<mv3d>`});
	overrider.oldMethod=oldMethod; overrider.newMethod=newMethod;
	return obj[methodName] = overrider;
};

// assign
const assign=(obj,methods)=>{
	for (const key in methods){
		const descriptor = Object.getOwnPropertyDescriptor(methods,key);
		if (descriptor.get||descriptor.set){
			Object.defineProperty(obj,key,descriptor);
		}else if(methods[key] instanceof _mv3d__WEBPACK_IMPORTED_MODULE_0__[/* default */ "a"].Attribute){
			const attribute = methods[key];
			Object.defineProperty(obj,key,attribute.descriptor);
		}else{
			obj[key]=methods[key];
		}
	}
};


//
const util = {
	makeColor,hexNumber,relativeNumber,booleanString,falseString,booleanNumber,
	sleep,degtorad,radtodeg,sin,cos,unround,
	tileSize,tileWidth,tileHeight,optimalFrustrumWidth,optimalFrustrumHeight,
	pointtorad,pointtodeg,minmax,
	dirtov,dirtoh,hvtodir,
	XAxis,YAxis,ZAxis,v2origin,v3origin,PI,PI2,
	overload, override, file, assign,
};
/* harmony default export */ __webpack_exports__["i"] = (util);

/***/ }),
/* 2 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";

// EXTERNAL MODULE: ./src/mv3d.js
var src_mv3d = __webpack_require__(0);

// EXTERNAL MODULE: ./src/util.js
var util = __webpack_require__(1);

// CONCATENATED MODULE: ./src/shaders.js

function hackShaders(){
	hackShaderAlphaCutoff('shadowMapPixelShader');
	hackShaderAlphaCutoff('depthPixelShader');
	hackDefaultShader();
}

function hackShaderAlphaCutoff(shader){
	hackShaderReplace(shader,
		'if (texture2D(diffuseSampler,vUV).a<0.4)',
		`if (texture2D(diffuseSampler,vUV).a<${mv3d.ALPHA_CUTOFF})`,
	);
}
function hackShaderReplace(shader,find,replace){
	BABYLON.Effect.ShadersStore[shader]=BABYLON.Effect.ShadersStore[shader].replace(find,replace);
}
function hackShaderInsert(shader,find,insert){
	hackShaderReplace(shader,find,`${find}\n${insert}\n`);
}

function hackDefaultShader(){
	hackShaderReplace('defaultPixelShader',
		'vec4 color=vec4(finalDiffuse*baseAmbientColor+finalSpecular+reflectionColor+refractionColor,alpha);',
		`vec3 mv3d_extra_emissiveColor = max(emissiveColor-1.,0.);
		vec4 color=vec4(clamp(finalDiffuse*baseAmbientColor+finalSpecular+reflectionColor+mv3d_extra_emissiveColor+refractionColor,0.0,1.0),alpha);`,
	);
}

// CONCATENATED MODULE: ./src/mod_babylon.js
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "t", function() { return Scene; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "e", function() { return Engine; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "h", function() { return FreeCamera; });
/* unused harmony export HemisphericLight */
/* unused harmony export DirectionalLight */
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "u", function() { return SpotLight; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "q", function() { return PointLight; });
/* unused harmony export ShadowGenerator */
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "y", function() { return Vector2; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "z", function() { return Vector3; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "r", function() { return Quaternion; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "j", function() { return Matrix; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "b", function() { return Color3; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "c", function() { return Color4; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "p", function() { return Plane; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "m", function() { return Node; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "x", function() { return TransformNode; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "w", function() { return Texture; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "v", function() { return StandardMaterial; });
/* unused harmony export ShaderMaterial */
/* unused harmony export Effect */
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "k", function() { return Mesh; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "A", function() { return VertexData; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "l", function() { return MeshBuilder; });
/* unused harmony export AssetsManager */
/* unused harmony export SceneSerializer */
/* unused harmony export Sprite */
/* unused harmony export SpriteManager */
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "s", function() { return Ray; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "g", function() { return FRONTSIDE; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return BACKSIDE; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "d", function() { return DOUBLESIDE; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "o", function() { return PERSPECTIVE_CAMERA; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "n", function() { return ORTHOGRAPHIC_CAMERA; });
/* unused harmony export FOGMODE_NONE */
/* unused harmony export FOGMODE_EXP */
/* unused harmony export FOGMODE_EXP2 */
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "f", function() { return FOGMODE_LINEAR; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "B", function() { return WORLDSPACE; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "i", function() { return LOCALSPACE; });
/* unused harmony export BONESPACE */
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "C", function() { return setupBabylonMods; });

const mod_babylon_BABYLON = window.BABYLON;
const {
	Scene,
	Engine,
	FreeCamera,
	HemisphericLight,
	DirectionalLight,
	SpotLight,
	PointLight,
	ShadowGenerator,
	Vector2,
	Vector3,
	Quaternion,
	Matrix,
	Color3,
	Color4,
	Plane,
	Node,
	TransformNode,
	Texture,
	StandardMaterial,
	ShaderMaterial,
	Effect,
	Mesh,
	VertexData,
	MeshBuilder,
	AssetsManager,
	SceneSerializer,
	Sprite,
	SpriteManager,
	Ray,
} = mod_babylon_BABYLON;

const {
	FRONTSIDE,BACKSIDE,DOUBLESIDE,
} = Mesh;

const {
	PERSPECTIVE_CAMERA,
	ORTHOGRAPHIC_CAMERA,
} = mod_babylon_BABYLON.Camera;

const{
	FOGMODE_NONE,
	FOGMODE_EXP,
	FOGMODE_EXP2,
	FOGMODE_LINEAR,
} = Scene;

const WORLDSPACE = mod_babylon_BABYLON.Space.WORLD,
             LOCALSPACE = mod_babylon_BABYLON.Space.LOCAL,
              BONESPACE = mod_babylon_BABYLON.Space.BONE;





Texture.prototype.crop=function(x=0,y=0,w=0,h=0,useBaseSize=false){
	const { width, height } = useBaseSize?this.getBaseSize():this.getSize();
	if(!w)w=width-x;
	if(!h)h=height-y;
	if(src_mv3d["a" /* default */].EDGE_FIX){ x+=src_mv3d["a" /* default */].EDGE_FIX;y+=src_mv3d["a" /* default */].EDGE_FIX;w-=src_mv3d["a" /* default */].EDGE_FIX*2;h-=src_mv3d["a" /* default */].EDGE_FIX*2; }
	if(!useBaseSize){
		const size = this.getSize(), baseSize = this.getBaseSize();
		const scaleX=baseSize.width/size.width;
		const scaleY=baseSize.height/size.height;
		x/=scaleX; w/=scaleX; y/=scaleY; h/=scaleY;
	}
	this.uScale=w/width;
	this.vScale=h/height;
	this.uOffset=x/width;
	this.vOffset=1-y/height-this.vScale;
}

const _mixin_xyz = {
	x:{
		get(){ return this.position?this.position.x:undefined; },
		set(v){ if(this.position){ this.position.x=v; } },
	},
	y:{
		get(){ return this.position?-this.position.z:undefined; },
		set(v){ if(this.position){ this.position.z=-v; } },
	},
	z:{
		get(){ return this.position?this.position.y:undefined; },
		set(v){ if(this.position){ this.position.y=v; } },
	},
};
const _mixin_angles = {
	pitch:{
		get(){ return this.rotation?-Object(util["t" /* radtodeg */])(this.rotation.x):undefined; },
		set(v){ if(this.rotation){ this.rotation.x=-Object(util["j" /* degtorad */])(v); } },
	},
	yaw:{
		get(){ return this.rotation?-Object(util["t" /* radtodeg */])(this.rotation.y):undefined; },
		set(v){  if(this.rotation){ this.rotation.y=-Object(util["j" /* degtorad */])(v); } },
	},
	roll:{
		get(){ return this.rotation?-Object(util["t" /* radtodeg */])(this.rotation.z):undefined; },
		set(v){  if(this.rotation){ this.rotation.z=-Object(util["j" /* degtorad */])(v); } },
	},
}
Object.defineProperties(Node.prototype,_mixin_xyz);
Object.defineProperties(Node.prototype,_mixin_angles);
Object.defineProperties(Sprite.prototype,_mixin_xyz);

// mesh sorting

Object.defineProperty(Mesh.prototype,'order',{
	get(){ return this._order; },
	set(v){ this._order=v; this._scene.sortMeshes(); }
});
const meshSorter=(m1,m2)=>(m1._order|0)-(m2._order|0);
Scene.prototype.sortMeshes=function(){
	this.meshes.sort(meshSorter);
}
const _addMesh = Scene.prototype.addMesh;
Scene.prototype.addMesh=function(mesh){
	_addMesh.apply(this,arguments);
	if(typeof mesh._order==='number'){
		this.sortMeshes();
	}
}
const _removeMesh = Scene.prototype.removeMesh;
Scene.prototype.removeMesh=function(mesh){
	_removeMesh.apply(this,arguments);
	this.sortMeshes();
}

// color
Color3.prototype.toNumber=Color4.prototype.toNumber=function(){return this.r*255<<16|this.g*255<<8|this.b*255;}

// hack babylon
function setupBabylonMods(){
	hackShaders();
};

StandardMaterial.prototype._shouldTurnAlphaTestOn=function(mesh){
	return this.needAlphaTesting();
};



/***/ }),
/* 3 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* unused harmony export Feature */
/* harmony import */ var _mv3d_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(0);


_mv3d_js__WEBPACK_IMPORTED_MODULE_0__[/* default */ "a"].features={};

_mv3d_js__WEBPACK_IMPORTED_MODULE_0__[/* default */ "a"].callFeature=function(name,method,...args){
	if(!this.featureEnabled(name)){ return; }
	const feature = this.features[name];
	if(method in feature.methods){
		feature.methods[method](...args);
	}
}

_mv3d_js__WEBPACK_IMPORTED_MODULE_0__[/* default */ "a"].callFeatures=function(method,...args){
	for(const name in this.features){
		this.callFeature(name,method,...args);
	}
}

_mv3d_js__WEBPACK_IMPORTED_MODULE_0__[/* default */ "a"].featureEnabled=function(name){
	if( !(name in this.features) ){ return false; }
	if(!this.features[name].enabled()){ return false; }
	return true;
}

class Feature{
	constructor(name,methods,condition=true){
		Object.assign(this,{name,condition,methods});
		_mv3d_js__WEBPACK_IMPORTED_MODULE_0__[/* default */ "a"].features[name]=this;
	}
	enabled(){
		if(typeof this.condition==='function'){
			return this.condition();
		}
		return Boolean(this.condition);
	}
}
_mv3d_js__WEBPACK_IMPORTED_MODULE_0__[/* default */ "a"].Feature = Feature;


/***/ }),
/* 4 */
/***/ (function(module, exports) {

module.exports = require("fs");

/***/ }),
/* 5 */
/***/ (function(module, exports) {

module.exports = require("path");

/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {


__webpack_require__(7);
__webpack_require__(9);

if(window.Imported&&Imported.YEP_SaveCore){
	const _onLoadSuccess = Scene_File.prototype.onLoadSuccess;
	Scene_File.prototype.onLoadSuccess=function(){
		_onLoadSuccess.apply(this,arguments);
		mv3d.needClearMap=true;
	}
}

/***/ }),
/* 7 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _mv3d_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(0);


_mv3d_js__WEBPACK_IMPORTED_MODULE_0__[/* default */ "a"]['option-store']={}

_mv3d_js__WEBPACK_IMPORTED_MODULE_0__[/* default */ "a"].options={};

if(_mv3d_js__WEBPACK_IMPORTED_MODULE_0__[/* default */ "a"].OPTION_RENDER_DIST) _mv3d_js__WEBPACK_IMPORTED_MODULE_0__[/* default */ "a"].options['mv3d-renderDist']={
	name:_mv3d_js__WEBPACK_IMPORTED_MODULE_0__[/* default */ "a"].OPTION_NAME_RENDER_DIST,
	min:_mv3d_js__WEBPACK_IMPORTED_MODULE_0__[/* default */ "a"].OPTION_RENDER_DIST_MIN, max:_mv3d_js__WEBPACK_IMPORTED_MODULE_0__[/* default */ "a"].OPTION_RENDER_DIST_MAX,
	increment:5,
	wrap:false,
	apply(v){ _mv3d_js__WEBPACK_IMPORTED_MODULE_0__[/* default */ "a"].RENDER_DIST=v; },
	default:_mv3d_js__WEBPACK_IMPORTED_MODULE_0__[/* default */ "a"].RENDER_DIST,
};

if(_mv3d_js__WEBPACK_IMPORTED_MODULE_0__[/* default */ "a"].OPTION_FOV) _mv3d_js__WEBPACK_IMPORTED_MODULE_0__[/* default */ "a"].options['mv3d-fov']={
	name:_mv3d_js__WEBPACK_IMPORTED_MODULE_0__[/* default */ "a"].OPTION_NAME_FOV,
	min:_mv3d_js__WEBPACK_IMPORTED_MODULE_0__[/* default */ "a"].OPTION_FOV_MIN, max:_mv3d_js__WEBPACK_IMPORTED_MODULE_0__[/* default */ "a"].OPTION_FOV_MAX,
	increment:5,
	apply(v){ _mv3d_js__WEBPACK_IMPORTED_MODULE_0__[/* default */ "a"].FOV=v; },
	default:_mv3d_js__WEBPACK_IMPORTED_MODULE_0__[/* default */ "a"].FOV,
};

if(_mv3d_js__WEBPACK_IMPORTED_MODULE_0__[/* default */ "a"].OPTION_MIPMAP) _mv3d_js__WEBPACK_IMPORTED_MODULE_0__[/* default */ "a"].options['mv3d-mipmap']={
	name:_mv3d_js__WEBPACK_IMPORTED_MODULE_0__[/* default */ "a"].OPTION_NAME_MIPMAP,
	type:'bool',
	apply(v){ _mv3d_js__WEBPACK_IMPORTED_MODULE_0__[/* default */ "a"].MIPMAP=v; _mv3d_js__WEBPACK_IMPORTED_MODULE_0__[/* default */ "a"].needReloadMap=true; },
	default:_mv3d_js__WEBPACK_IMPORTED_MODULE_0__[/* default */ "a"].MIPMAP,
};

if(_mv3d_js__WEBPACK_IMPORTED_MODULE_0__[/* default */ "a"].ENABLE_3D_OPTIONS){
	__webpack_require__(8);
}

/***/ }),
/* 8 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _mv3d_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(0);
/* harmony import */ var _util_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(1);




const _option_command_list = Window_Options.prototype.makeCommandList;
Window_Options.prototype.makeCommandList = function() {
	_option_command_list.apply(this,arguments);
	if(_mv3d_js__WEBPACK_IMPORTED_MODULE_0__[/* default */ "a"].ENABLE_3D_OPTIONS===_mv3d_js__WEBPACK_IMPORTED_MODULE_0__[/* default */ "a"].enumOptionModes.SUBMENU && Object.keys(_mv3d_js__WEBPACK_IMPORTED_MODULE_0__[/* default */ "a"].options).length){
		this.addCommand("3D Options", 'mv3d-options');
	}else if(_mv3d_js__WEBPACK_IMPORTED_MODULE_0__[/* default */ "a"].ENABLE_3D_OPTIONS===_mv3d_js__WEBPACK_IMPORTED_MODULE_0__[/* default */ "a"].enumOptionModes.ENABLE){
		for (const key in _mv3d_js__WEBPACK_IMPORTED_MODULE_0__[/* default */ "a"].options){
			this.addCommand(_mv3d_js__WEBPACK_IMPORTED_MODULE_0__[/* default */ "a"].options[key].name,key);
		}
	}
};

const _option_status_text = Window_Options.prototype.statusText;
Window_Options.prototype.statusText = function(index) {
	const symbol = this.commandSymbol(index);
	const value = this.getConfigValue(symbol);
	if(symbol==='mv3d-options'){ return ''; }
	return _option_status_text.apply(this,arguments);
};

Object.defineProperty(ConfigManager, 'mv3d-options', {
	get(){ return undefined; },
	set(v){ SceneManager.push(Scene_3D_Options); },
	configurable: true,
	enumerable:false,
});

const _config_makeData=ConfigManager.makeData;
ConfigManager.makeData = function() {
	const config = _config_makeData.apply(this,arguments);
	Object.assign(config,_mv3d_js__WEBPACK_IMPORTED_MODULE_0__[/* default */ "a"]['option-store']);
	return config;
};
const _config_applyData=ConfigManager.applyData;
ConfigManager.applyData = function(config) {
	_config_applyData.apply(this,arguments);
	for(const key in _mv3d_js__WEBPACK_IMPORTED_MODULE_0__[/* default */ "a"].options){
		if(key in config){
			_mv3d_js__WEBPACK_IMPORTED_MODULE_0__[/* default */ "a"]['option-store'][key]=config[key];
			_mv3d_js__WEBPACK_IMPORTED_MODULE_0__[/* default */ "a"].options[key].apply(config[key]);
		}
	}
	_mv3d_js__WEBPACK_IMPORTED_MODULE_0__[/* default */ "a"].updateParameters();
};



class Scene_3D_Options extends Scene_Options{
	createOptionsWindow(){
		this._optionsWindow = new Window_3D_Options();
		this._optionsWindow.setHandler('cancel', this.popScene.bind(this));
		this.addWindow(this._optionsWindow);
	}
	terminate(){
		super.terminate();
		_mv3d_js__WEBPACK_IMPORTED_MODULE_0__[/* default */ "a"].updateParameters();
	}
}

class Window_3D_Options extends Window_Options{
	makeCommandList(){
		for (const key in _mv3d_js__WEBPACK_IMPORTED_MODULE_0__[/* default */ "a"].options){
			this.addCommand(_mv3d_js__WEBPACK_IMPORTED_MODULE_0__[/* default */ "a"].options[key].name,key);
		}
	}
}

if(_mv3d_js__WEBPACK_IMPORTED_MODULE_0__[/* default */ "a"].ENABLE_3D_OPTIONS===1) Object(_util_js__WEBPACK_IMPORTED_MODULE_1__[/* override */ "r"])(Scene_Options.prototype,'terminate',o=>function(){
	o.apply(this,arguments);
	_mv3d_js__WEBPACK_IMPORTED_MODULE_0__[/* default */ "a"].updateParameters();
},true);

Window_Options.prototype._is_mv3d_option=function(symbol){
	return symbol in _mv3d_js__WEBPACK_IMPORTED_MODULE_0__[/* default */ "a"].options;
}

Window_Options.prototype._mv3d_cursor=function(wrap,direction){
	const index = this.index();
	const symbol = this.commandSymbol(index);
	let value = this.getConfigValue(symbol);
	const option = _mv3d_js__WEBPACK_IMPORTED_MODULE_0__[/* default */ "a"].options[symbol];
	if(!option) { return; }
	if(option.type==='bool'){
		this.changeValue(symbol, direction>0);
	}else{
		const min = option.min||0;
		const max = option.values?option.values.length-1:option.max||1;
		value += (option.increment||1)*direction;
		if(wrap&&option.wrap||wrap==='ok'){
			if(value>max){ value = min; }
			if(value<min){ value = max; }
		}else{
			value = value.clamp(min,max);
		}
		this.changeValue(symbol, value);
	}
}


Object(_util_js__WEBPACK_IMPORTED_MODULE_1__[/* override */ "r"])(Window_Options.prototype,'statusText',o=>function(index){
    const symbol = this.commandSymbol(index);
    if(!this._is_mv3d_option(symbol)){ return o.apply(this,arguments); }
    const value = this.getConfigValue(symbol);
    const option = _mv3d_js__WEBPACK_IMPORTED_MODULE_0__[/* default */ "a"].options[symbol];
    if(option.type==='bool'){
        return this.booleanStatusText(value);
    }else if(option.values){
        return option.values[value];
    }
    return String(value);
},true);

Object(_util_js__WEBPACK_IMPORTED_MODULE_1__[/* override */ "r"])(Window_Options.prototype,'setConfigValue',o=>function(symbol, value){
    if(!this._is_mv3d_option(symbol)){ return o.apply(this,arguments); }
    _mv3d_js__WEBPACK_IMPORTED_MODULE_0__[/* default */ "a"]['option-store'][symbol]=value;
    const option = _mv3d_js__WEBPACK_IMPORTED_MODULE_0__[/* default */ "a"].options[symbol];
    if(option.apply){ option.apply(value); }
},true);

Object(_util_js__WEBPACK_IMPORTED_MODULE_1__[/* override */ "r"])(Window_Options.prototype,'getConfigValue',o=>function(symbol){
    if(!this._is_mv3d_option(symbol)){ return o.apply(this,arguments); }
    const option = _mv3d_js__WEBPACK_IMPORTED_MODULE_0__[/* default */ "a"].options[symbol];
    let value = _mv3d_js__WEBPACK_IMPORTED_MODULE_0__[/* default */ "a"]['option-store'][symbol];
    if(value==null){ value=option.default||option.min||0; }
    return value;
},true);

Object(_util_js__WEBPACK_IMPORTED_MODULE_1__[/* override */ "r"])(Window_Options.prototype,'cursorLeft',o=>function(wrap){
    const symbol = this.commandSymbol(this.index());
    if(this._is_mv3d_option(symbol)){
        return this._mv3d_cursor(wrap,-1);
    }else{
        return o.apply(this,arguments);
    }
},true);

Object(_util_js__WEBPACK_IMPORTED_MODULE_1__[/* override */ "r"])(Window_Options.prototype,'cursorRight',o=>function(wrap){
    const symbol = this.commandSymbol(this.index());
    if(this._is_mv3d_option(symbol)){
        return this._mv3d_cursor(wrap,1);
    }else{
        return o.apply(this,arguments);
    }
},true);

Object(_util_js__WEBPACK_IMPORTED_MODULE_1__[/* override */ "r"])(Window_Options.prototype,'processOk',o=>function(){
    const index = this.index();
    const symbol = this.commandSymbol(index);
    if(!this._is_mv3d_option(symbol)){
        return o.apply(this,arguments);
    }
    let value = this.getConfigValue(symbol);
    const option = _mv3d_js__WEBPACK_IMPORTED_MODULE_0__[/* default */ "a"].options[symbol];
    if(option.type==='bool'){
        this.changeValue(symbol, !value);
    }else{
        this._mv3d_cursor('ok',1);
    }
},true);


/***/ }),
/* 9 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _mv3d_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(0);
/* harmony import */ var _util_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(1);



Object.assign(_mv3d_js__WEBPACK_IMPORTED_MODULE_0__[/* default */ "a"],{
	vehicleObstructed(vehicle,...args){
		return vehicleObstructed.apply(vehicle,args);
	},
	tileCollision(char,x,y,useStairThresh=false,useTargetZ=false){
		if(!(char instanceof _mv3d_js__WEBPACK_IMPORTED_MODULE_0__[/* default */ "a"].Character)){if(!char.mv3d_sprite){return false;}char=char.mv3d_sprite;}
		const z = typeof useTargetZ==='number'? useTargetZ
		:useTargetZ?char.targetElevation:char.z;
		const cc = char.getCollisionHeight(z);
		const tcs = this.getCollisionHeights(x,y);
		if(useStairThresh==2){ cc.z1+=_mv3d_js__WEBPACK_IMPORTED_MODULE_0__[/* default */ "a"].STAIR_THRESH; cc.z2+=_mv3d_js__WEBPACK_IMPORTED_MODULE_0__[/* default */ "a"].STAIR_THRESH; }
		for (const tc of tcs){
			if(cc.z1<tc.z2&&cc.z2>tc.z1){
				if(useStairThresh==1&&_mv3d_js__WEBPACK_IMPORTED_MODULE_0__[/* default */ "a"].STAIR_THRESH){ return this.tileCollision(char,x,y,2,useTargetZ); }
				return true;
			}
		}
		return false;
	},
	charCollision(char1,char2,useStairThresh=false,useTargetZ1=false,useTargetZ2=useTargetZ1,triggerMode=false){
		if(!(char1 instanceof _mv3d_js__WEBPACK_IMPORTED_MODULE_0__[/* default */ "a"].Character)){if(!char1.mv3d_sprite){return false;}char1=char1.mv3d_sprite;}
		if(!(char2 instanceof _mv3d_js__WEBPACK_IMPORTED_MODULE_0__[/* default */ "a"].Character)){if(!char2.mv3d_sprite){return false;}char2=char2.mv3d_sprite;}
		if(!triggerMode&&(!char1.char._mv3d_hasCollide()||!char2.char._mv3d_hasCollide())){ return false; } 
		const c1z = typeof useTargetZ1==='number'? useTargetZ1 : useTargetZ1?char1.targetElevation:char1.z;
		const c2z = typeof useTargetZ2==='number'? useTargetZ2 : useTargetZ2?char2.targetElevation:char2.z;
		const cc1 = char1.getCollisionHeight(c1z);
		const cc2 = triggerMode ? char2.getTriggerHeight(c2z) : char2.getCollisionHeight(c2z);
		if(useStairThresh==2){ cc1.z1+=_mv3d_js__WEBPACK_IMPORTED_MODULE_0__[/* default */ "a"].STAIR_THRESH; cc1.z2+=_mv3d_js__WEBPACK_IMPORTED_MODULE_0__[/* default */ "a"].STAIR_THRESH; }
		if(!triggerMode&&cc1.z1<cc2.z2&&cc1.z2>cc2.z1 || triggerMode&&cc1.z1<=cc2.z2&&cc1.z2>=cc2.z1){
			if(useStairThresh==1&&_mv3d_js__WEBPACK_IMPORTED_MODULE_0__[/* default */ "a"].STAIR_THRESH){ return this.charCollision(char1,char2,2,useTargetZ1,useTargetZ2); }
			return true;
		}
		return false;
	},
	getPlatformFloatForCharacter(char,x,y,opts={}){
		if(!(char instanceof _mv3d_js__WEBPACK_IMPORTED_MODULE_0__[/* default */ "a"].Character)){if(!char.mv3d_sprite){return 0;}char=char.mv3d_sprite;}
		let z = _mv3d_js__WEBPACK_IMPORTED_MODULE_0__[/* default */ "a"].getPlatformForCharacter(char,x,y,opts).z2;
		if(char.hasFloat){
			const cHeight = char.getCHeight();
			z += _mv3d_js__WEBPACK_IMPORTED_MODULE_0__[/* default */ "a"].getFloatHeight(x,y,char.z+Math.max(cHeight,_mv3d_js__WEBPACK_IMPORTED_MODULE_0__[/* default */ "a"].STAIR_THRESH),_mv3d_js__WEBPACK_IMPORTED_MODULE_0__[/* default */ "a"].STAIR_THRESH>=cHeight);
		}
		return z;
	},
	getPlatformForCharacter(char,x,y,opts={}){
		if(!(char instanceof _mv3d_js__WEBPACK_IMPORTED_MODULE_0__[/* default */ "a"].Character)){if(!char.mv3d_sprite){return false;}char=char.mv3d_sprite;}
		const cHeight = char.getCHeight();
		const useStairThresh = _mv3d_js__WEBPACK_IMPORTED_MODULE_0__[/* default */ "a"].STAIR_THRESH>=cHeight;
		Object.assign(opts,{char:char,gte:useStairThresh});
		return this.getPlatformAtLocation(x,y,char.z+Math.max(cHeight,_mv3d_js__WEBPACK_IMPORTED_MODULE_0__[/* default */ "a"].STAIR_THRESH),opts);
	},
	getPlatformAtLocation(x,y,z,opts={}){
		const char = opts.char;
		const cs = this.getCollisionHeights(x,y,opts);
		cs.push(..._mv3d_js__WEBPACK_IMPORTED_MODULE_0__[/* default */ "a"].getEventsAt(x,y)
			.filter(event=>{
				if(!(event.mv3d_sprite&&event._mv3d_isPlatform()&&event._mv3d_hasCollide()&&event.mv3d_sprite.visible)){ return false; }
				if(char){
					if(char.char===event || event.isMoving()){ return false; }
					let pc=event.mv3d_sprite;
					while(pc=pc.platformChar){
						if(pc===char||pc===event.mv3d_sprite){ return false; }
					}
				}
				return true;
			})
			.map(event=>event.mv3d_sprite.getCollisionHeight())
		);
		let closest = cs[0];
		for (const c of cs){
			if(c.z2>closest.z2 && (opts.gte?c.z2<=z:c.z2<z) ){
				closest=c;
			}
		}
		return closest;
	},

	getEventsAt(x,y){
		return $gameMap.eventsXyNt(Math.round(x),Math.round(y));
	},

	isRampAt(x,y,z){
		const tileData = this.getTileData(x,y);
		let height = 0;
		for (let l=0;l<4;++l){
			height += this.getTileFringe(x,y,l);
			height += this.getTileHeight(x,y,l);
			const conf = this.getTileConfig(tileData[l],x,y,l);
			if(conf.shape!==this.enumShapes.SLOPE){ continue; }
			const slopeHeight = conf.slopeHeight||1;
			if(z>=height-slopeHeight && z<=height){
				return { id:tileData[l], x,y,l,conf, z1:height-slopeHeight, z2:height };
			}
		}
		return false;
	},

	getRampData(x,y,l,conf=null){
		const tileId = _mv3d_js__WEBPACK_IMPORTED_MODULE_0__[/* default */ "a"].getTileId(x,y,l);
		if(!conf){ conf = this.getTileConfig(tileId,x,y,l); }
		if(conf.shape!==this.enumShapes.SLOPE){ return false; }
		const height = _mv3d_js__WEBPACK_IMPORTED_MODULE_0__[/* default */ "a"].getStackHeight(x,y,l);
		const slopeHeight = conf.slopeHeight||1;
		return { id:tileId, x,y,l,conf, z1:height-slopeHeight, z2:height };
	},

	canPassRamp(d,slope){
		if(d===5||d<=0||d>=10){ return true; }
		const {dir:sd} = _mv3d_js__WEBPACK_IMPORTED_MODULE_0__[/* default */ "a"].getSlopeDirection(slope.x,slope.y,slope.l,true);
		const x2 = $gameMap.roundXWithDirection(slope.x,d);
		const y2 = $gameMap.roundYWithDirection(slope.y,d);
		const slope2 = this.isRampAt(x2,y2,sd===d?slope.z1:sd===10-d?slope.z2:(slope.z1+slope.z2)/2);
		if(slope2){
			const  {dir:sd2} = _mv3d_js__WEBPACK_IMPORTED_MODULE_0__[/* default */ "a"].getSlopeDirection(x2,y2,slope2.l,true);
			if(sd!==d&&sd!==10-d){
				if(sd===sd2&&slope.z1===slope2.z1&&slope.z2===slope2.z2){ return true; }
				return false;
			}
			return sd===sd2 && (sd===d?(slope.z1===slope2.z2):(slope.z2===slope2.z1));
		}
		if(sd!==d&&sd!==10-d){ return false; }
		const dh = this.getPlatformAtLocation(x2,y2, (sd===d?slope.z1:slope.z2)+_mv3d_js__WEBPACK_IMPORTED_MODULE_0__[/* default */ "a"].STAIR_THRESH ).z2;
		return Math.abs(dh-(sd===d?slope.z1:slope.z2))<=_mv3d_js__WEBPACK_IMPORTED_MODULE_0__[/* default */ "a"].STAIR_THRESH;
	}
});

Game_CharacterBase.prototype._mv3d_isFlying=function(){
	if(!this.mv3d_sprite){ return false;}
	return this.mv3d_sprite.blendElevation.currentValue()>0||this.mv3d_sprite.hasConfig('zlock');
};
Game_Vehicle.prototype._mv3d_isFlying=function(){
	return this.isAirship()||Game_CharacterBase.prototype._mv3d_isFlying.apply(this,arguments);
};
Game_Player.prototype._mv3d_isFlying=function(){
	if(this.isInVehicle()&&this.vehicle().isAirship()){ return true; }
	return Game_CharacterBase.prototype._mv3d_isFlying.apply(this,arguments);
};

Game_CharacterBase.prototype._mv3d_isPlatform=function(){
	return this.mv3d_sprite&&this.mv3d_sprite.getConfig('platform',_mv3d_js__WEBPACK_IMPORTED_MODULE_0__[/* default */ "a"].WALK_ON_EVENTS);
};

Game_CharacterBase.prototype._mv3d_hasCollide=function(){
	const sprite = this.mv3d_sprite;
	if(!sprite || sprite.getConfig('collide')===false){ return false; }
	return this._mv3d_isPlatform() || Boolean(sprite.getCHeight());
};

if(window.Imported&&Imported.QMovement){
	__webpack_require__(10);
}else if(PluginManager._scripts.includes("AltimitMovement")&&Game_CharacterBase.prototype.moveVector){
	__webpack_require__(11);
}else{
	__webpack_require__(12);
}

// jump
const _charBase_jump = Game_CharacterBase.prototype.jump;
Game_CharacterBase.prototype.jump = function(xPlus, yPlus) {
	if (_mv3d_js__WEBPACK_IMPORTED_MODULE_0__[/* default */ "a"].isDisabled()){ return _charBase_jump.apply(this,arguments); }
	this.mv3d_jumpHeightStart = this.z||_mv3d_js__WEBPACK_IMPORTED_MODULE_0__[/* default */ "a"].getWalkHeight(this.x,this.y);
	this.mv3d_jumpHeightEnd = _mv3d_js__WEBPACK_IMPORTED_MODULE_0__[/* default */ "a"].getWalkHeight(this.x+xPlus,this.y+yPlus);
	_charBase_jump.apply(this,arguments);
};

Object(_util_js__WEBPACK_IMPORTED_MODULE_1__[/* override */ "r"])(Game_Map.prototype,'allTiles',o=>function(x,y){
	return this.layeredTiles(x, y);
});

/***/ }),
/* 10 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _util__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(1);
/* harmony import */ var _mv3d__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(0);
/* harmony import */ var _features__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(3);




Object(_util__WEBPACK_IMPORTED_MODULE_0__[/* override */ "r"])(ColliderManager,'update',o=>function(){
	this.hide();
});

Object(_util__WEBPACK_IMPORTED_MODULE_0__[/* override */ "r"])(ColliderManager.container,'update',o=>function(){
	if(this.visible){ o.apply(this,arguments); }
},true);

let _tileColliders={};
_mv3d__WEBPACK_IMPORTED_MODULE_1__[/* default */ "a"].getQTileColliders=()=>_tileColliders;

function mv3d_makeTileCollider(x,y,zcollider,extra){
	const tc=new Box_Collider($gameMap.tileWidth(),$gameMap.tileHeight());
	tc.x=x*$gameMap.tileWidth();
	tc.y=y*$gameMap.tileHeight();
	tc.mv3d_collider=zcollider;
	tc.mv3d_collider_type=extra;
	return tc;
}

const infiniteHeightCollider={z1:-Infinity,z2:Infinity};

Object(_util__WEBPACK_IMPORTED_MODULE_0__[/* override */ "r"])(Game_Map.prototype,'setupMapColliders',o=>function(){
	this._tileCounter = 0;
	_tileColliders={};
	for (let x = 0; x < this.width(); x++)
	for (let y = 0; y < this.height(); y++) {
		const px = x * this.tileWidth(), py = y * this.tileHeight();
		const flags = this.tilesetFlags();
		const tiles = _mv3d__WEBPACK_IMPORTED_MODULE_1__[/* default */ "a"].getTileData(x, y);
		const zColliders = _mv3d__WEBPACK_IMPORTED_MODULE_1__[/* default */ "a"].getCollisionHeights(x,y,{layers:true,slopeMin:true});
		const tileCollider_list = _tileColliders[[x,y]]=[];
		for (let i=0; i<zColliders.length; ++i) {
			tileCollider_list[i]=mv3d_makeTileCollider(x,y,zColliders[i],'mv3d');
		}
		_tileColliders[[x,y,'x']]=mv3d_makeTileCollider(x,y,infiniteHeightCollider,'mv3d_x');
		for (let l = 0; l < tiles.length; ++l) {
			const flag = flags[tiles[l]];
			const passage = _mv3d__WEBPACK_IMPORTED_MODULE_1__[/* default */ "a"].getTilePassage(tiles[l],x,y,l);
			if(passage===_mv3d__WEBPACK_IMPORTED_MODULE_1__[/* default */ "a"].enumPassage.THROUGH){ continue; }
			const conf = _mv3d__WEBPACK_IMPORTED_MODULE_1__[/* default */ "a"].getTileConfig(x,y,l);
			if(conf.shape===_mv3d__WEBPACK_IMPORTED_MODULE_1__[/* default */ "a"].enumShapes.SLOPE){
				const rampData = _mv3d__WEBPACK_IMPORTED_MODULE_1__[/* default */ "a"].getRampData(x,y,l,conf);
				let dcol=0;
				if(!_mv3d__WEBPACK_IMPORTED_MODULE_1__[/* default */ "a"].canPassRamp(2,rampData)){ dcol|=0b0001; }
				if(!_mv3d__WEBPACK_IMPORTED_MODULE_1__[/* default */ "a"].canPassRamp(4,rampData)){ dcol|=0b0010; }
				if(!_mv3d__WEBPACK_IMPORTED_MODULE_1__[/* default */ "a"].canPassRamp(6,rampData)){ dcol|=0b0100; }
				if(!_mv3d__WEBPACK_IMPORTED_MODULE_1__[/* default */ "a"].canPassRamp(8,rampData)){ dcol|=0b1000; }
				dcol+=1536;
				const slopeZ2 = _mv3d__WEBPACK_IMPORTED_MODULE_1__[/* default */ "a"].getStackHeight(x,y,l);
				const slopeZ1 = slopeZ2-(conf.slopeHeight||1);
				//const data = Array.from(QMovement.tileBoxes[flag]);
				let data = QMovement.tileBoxes[dcol];
				const key = [x,y,l,'slope'].toString();
				_tileColliders[key]=[];
				if(data){
					if(data[0].constructor!==Array){ data=[data]; }
					for(const box of data){
						const c = new Box_Collider(box[0]||0,box[1]||0,box[2],box[3]);
						c.slopeZ1=slopeZ1; c.slopeZ2=slopeZ2;
						c.moveTo(px,py);
						c.mv3d_collider=infiniteHeightCollider;
						_tileColliders[key].push(c);
					}
				}
			}
			let mv3d_collider;
			if(zColliders.layers[l]){
				mv3d_collider=zColliders.layers[l];
				mv3d_collider.passage=passage;
				mv3d_collider.l=l;
			}
			let data = this.getMapCollider(x, y, flag);
			if (!data){ continue; }
			data=Array.from(data);
			if (data[0].constructor === Array) {
				for (var j = 0; j < data.length; j++) {
					data[j].mv3d_collider=mv3d_collider;
					data[j].isRegionCollider=true;
					this.makeTileCollider(x, y, flag, data[j], j);
				}
			} else {
				data.mv3d_collider=mv3d_collider;
				data.isQCollider=true;
				this.makeTileCollider(x, y, flag, data, 0);
			}
		}
	}
},true);

Object(_util__WEBPACK_IMPORTED_MODULE_0__[/* override */ "r"])(Game_Map.prototype,'makeTileCollider',o=>function(x,y,flag,boxData,index){
	const collider = o.apply(this,arguments);
	if(boxData.mv3d_collider){
		if(boxData.isRegionCollider){
			collider.mv3d_collider = infiniteHeightCollider;
		}else if(boxData.isQCollider){
			collider.mv3d_collider = {z1:-Infinity,z2:Infinity};
			if(boxData.mv3d_collider){
				collider.mv3d_collider.l = boxData.mv3d_collider.l;
			}
			/*
			collider.mv3d_collider = {
				z1: boxData.mv3d_collider.z2,
				z2: boxData.mv3d_collider.z2 + mv3d.STAIR_THRESH + 0.01,
			};
			*/
		}else{
			collider.mv3d_collider = boxData.mv3d_collider;
		}
	}
	return collider;
},true);

Object(_util__WEBPACK_IMPORTED_MODULE_0__[/* override */ "r"])(Game_CharacterBase.prototype,'collider',o=>function collider(){
	const collider = o.apply(this,arguments);
	if(!this.mv3d_sprite){ return collider; }
	if(!collider.mv3d_collider){
		Object.defineProperty(collider,'mv3d_collider',{
			configurable:true,enumerable:false, value: this.mv3d_sprite.getCollider(),
		});
		Object.defineProperty(collider,'mv3d_triggerCollider',{
			configurable:true,enumerable:false, value: this.mv3d_sprite.getTriggerCollider(),
		});
	}
	return collider;
});

function QzCollidersOverlap(c1,c2){
	if(!c1.mv3d_collider||!c2.mv3d_collider){ return true; }
	c1=c1.mv3d_collider; c2=c2.mv3d_collider;
	return zCollidersOverlap(c1,c2);
}
function zCollidersOverlap(c1,c2){
	if(c1.z1<c2.z2&&c1.z2>c2.z1 && c1.z1+_mv3d__WEBPACK_IMPORTED_MODULE_1__[/* default */ "a"].STAIR_THRESH<c2.z2&&c1.z2+_mv3d__WEBPACK_IMPORTED_MODULE_1__[/* default */ "a"].STAIR_THRESH>c2.z1){
		return true;
	}
	return false;
}

Object(_util__WEBPACK_IMPORTED_MODULE_0__[/* override */ "r"])(ColliderManager,'getCollidersNear',o=>function getCollidersNear(collider, only, debug){
	// Q colliders
	let isBreak=false;
	const near = o.call(this,collider,c=>{
		if(QzCollidersOverlap(collider,c)===false){ return false; }
		if(collider.mv3d_collider){
			const cx = Math.round(c.x/QMovement.tileSize);
			const cy = Math.round(c.y/QMovement.tileSize);
			if(collider.mv3d_collider.char){
				// if we're standing on a character, ignore Q colliders.
				//const platform = collider.mv3d_collider.char.getPlatform();
				const platform = collider.mv3d_collider.char.getPlatform(cx,cy);
				if(platform.char){ return false; }
			}
			if(c.mv3d_collider){
				// ignore Q colliders not on current layer
				const tileLayers = _mv3d__WEBPACK_IMPORTED_MODULE_1__[/* default */ "a"].getTileLayers(cx,cy,collider.mv3d_collider.z1+_mv3d__WEBPACK_IMPORTED_MODULE_1__[/* default */ "a"].STAIR_THRESH);
				if(!tileLayers.includes(c.mv3d_collider.l)){ return false; }
			}
		}
		if(only){
			const value = only(c);
			if(value==='break'){isBreak=true;}
			return value;
		}
		return true;
	},debug);
	if(isBreak){ return near; }
	const x1 = (collider.x+collider._offset.x-1)/QMovement.tileSize;
	const y1 = (collider.y+collider._offset.y-1)/QMovement.tileSize;
	const x2 = (collider.x+collider._offset.x+collider.width+1)/QMovement.tileSize;
	const y2 = (collider.y+collider._offset.y+collider.height+1)/QMovement.tileSize;
	if (collider.mv3d_collider)
	for (let tx = Math.floor(x1); tx < Math.ceil(x2); ++tx)
	for (let ty = Math.floor(y1); ty < Math.ceil(y2); ++ty){
		const colliderList=_tileColliders[[tx,ty]];
		const xCollider = _tileColliders[[tx,ty,'x']];
		let slopeColliders = null;
		let isWall=false;
		const tileLayers = _mv3d__WEBPACK_IMPORTED_MODULE_1__[/* default */ "a"].getTileLayers(tx,ty,collider.mv3d_collider.z1+_mv3d__WEBPACK_IMPORTED_MODULE_1__[/* default */ "a"].STAIR_THRESH);
		for(const l of tileLayers){
			if( _mv3d__WEBPACK_IMPORTED_MODULE_1__[/* default */ "a"].getTilePassage(tx,ty,l)===_mv3d__WEBPACK_IMPORTED_MODULE_1__[/* default */ "a"].enumPassage.WALL ){ isWall=true; }
			const slopeKey = [tx,ty,l,'slope'].toString();
			if(slopeKey in _tileColliders){ slopeColliders = _tileColliders[slopeKey]; }
		}
		let shouldCollide=false;
		if(xCollider&&collider.mv3d_collider.char){
			const char = collider.mv3d_collider.char;
			const opts = {slopeMin:true};
			const platform = char.getPlatform(tx,ty,opts);
			opts.platform=platform;
			// collide if falling
			if(char.falling&&!char.char._mv3d_isFlying()){ shouldCollide=true; }
			// x passage
			else if(isWall && !platform.char){
				shouldCollide=true;
			}
			// collide slopes
			else if (slopeColliders && !char.platform.char && !platform.char){
				for (const c of slopeColliders){
					if(_mv3d__WEBPACK_IMPORTED_MODULE_1__[/* default */ "a"].WALK_OFF_EDGE && char.z>c.slopeZ1){ continue; }
					let value=true;
					if(only){ value = only(c); }
					if(value!==false){
						near.push(c);
						if(value==='break'){ return near; }
						continue;
					}
				}
			}
			// collide ledges
			else if(!_mv3d__WEBPACK_IMPORTED_MODULE_1__[/* default */ "a"].WALK_OFF_EDGE && !char.char._mv3d_isFlying() && (!char.platform||!char.platform.isSlope)
			&& Object(_util__WEBPACK_IMPORTED_MODULE_0__[/* unround */ "A"])(Math.abs(char.getPlatformFloat(tx,ty,opts)-char.targetElevation))>_mv3d__WEBPACK_IMPORTED_MODULE_1__[/* default */ "a"].STAIR_THRESH){
				shouldCollide=true;
			}
			
			if(shouldCollide){
				let value=true;
				if(only){ value = only(xCollider); }
				if(value!==false){
					near.push(xCollider);
					if(value==='break'){ return near; }
					continue;
				}
			}
		}
		// collide with wall
		if(colliderList) for(let i = 0; i<colliderList.length; ++i){
			if(QzCollidersOverlap(collider,colliderList[i])){
				if(only){
					const value = only(colliderList[i]);
					if(value!==false){ near.push(colliderList[i]); }
					if(value==='break'){ return near; }
				}else{
					near.push(colliderList[i]);
				}
			}
		}
	}
	return near;
});

Object(_util__WEBPACK_IMPORTED_MODULE_0__[/* override */ "r"])(ColliderManager,'getCharactersNear',o=>function(collider, only){
	return o.call(this,collider,char=>{
		const sprite = char.mv3d_sprite; if(!sprite){ return true; }
		const c1 = collider.mv3d_collider;
		const c2 = $gameTemp._mv3d_Q_getCharactersTriggerHeight?sprite.getTriggerHeight():sprite.getCollisionHeight();
		if(!c1||!c2){ return true; }
		if(zCollidersOverlap(c1,c2)===false){ return false; }
		if(only){ return only(char); }
		return true;
	});
});

Object(_util__WEBPACK_IMPORTED_MODULE_0__[/* override */ "r"])(Game_Player.prototype,'startMapEvent',o=>function(x,y,triggers,normal){
	$gameTemp._mv3d_Q_getCharactersTriggerHeight=true;
	o.apply(this,arguments);
	$gameTemp._mv3d_Q_getCharactersTriggerHeight=false;
});

_mv3d__WEBPACK_IMPORTED_MODULE_1__[/* default */ "a"].Character.prototype.getPlatform=function(x=this.char._realX,y=this.char._realY,opts={}){
	const px = (x-0.5)*QMovement.tileSize;
	const py = (y-0.5)*QMovement.tileSize;
	const collider = this.char.collider();

	const x1 = (px+collider._offset.x+1)/QMovement.tileSize;
	const y1 = (py+collider._offset.y+1)/QMovement.tileSize;
	const x2 = (px+collider._offset.x+collider.width-1)/QMovement.tileSize;
	const y2 = (py+collider._offset.y+collider.height-1)/QMovement.tileSize;
	
	const platform = [
		//mv3d.getPlatformForCharacter(this,x,y),
		_mv3d__WEBPACK_IMPORTED_MODULE_1__[/* default */ "a"].getPlatformForCharacter(this,x1,y1,opts),
		_mv3d__WEBPACK_IMPORTED_MODULE_1__[/* default */ "a"].getPlatformForCharacter(this,x2,y1,opts),
		_mv3d__WEBPACK_IMPORTED_MODULE_1__[/* default */ "a"].getPlatformForCharacter(this,x2,y2,opts),
		_mv3d__WEBPACK_IMPORTED_MODULE_1__[/* default */ "a"].getPlatformForCharacter(this,x1,y2,opts),
	].reduce((a,b)=>a.z2>=b.z2?a:b);
	return platform;
};

_mv3d__WEBPACK_IMPORTED_MODULE_1__[/* default */ "a"].getEventsAt=function(x,y){
	let events;
	try{
		events = ColliderManager._characterGrid[Math.round(x)][Math.round(y)];
	}catch(err){
		return [];
	}
	if(!events){ return []; }
	return events.filter(event=>{
		if(!(event instanceof Game_Event) || event.isThrough()){ return false; }
		return true;
	});
};

_mv3d__WEBPACK_IMPORTED_MODULE_1__[/* default */ "a"].setDestination=function(x,y){
	$gameTemp.setPixelDestination(Math.round(x*$gameMap.tileWidth()), Math.round(y*$gameMap.tileHeight()));
};

const _clearMouseMove = Game_Player.prototype.clearMouseMove;
Game_Player.prototype.clearMouseMove=function(){
	_clearMouseMove.apply(this,arguments);
	if(this._pathfind){
		this.clearPathfind();
	}
}


const _QdiagMap={
	1: [4, 2], 3: [6, 2],
	7: [4, 8], 9: [6, 8]
};
const _QMoveVH=o=>function(dir) {
	if($gameMap.offGrid()){
		this.mv3d_QMoveRadian(dir);
		return;
	}
	dir=_mv3d__WEBPACK_IMPORTED_MODULE_1__[/* default */ "a"].transformDirection(dir);
	if(dir%2){
		const diag = _QdiagMap[dir];
		this.moveDiagonally(diag[0], diag[1]);
	}else{
		this.moveStraight(dir);
	}
	
};
Object(_util__WEBPACK_IMPORTED_MODULE_0__[/* override */ "r"])(Game_Player.prototype,'moveInputHorizontal',_QMoveVH);
Object(_util__WEBPACK_IMPORTED_MODULE_0__[/* override */ "r"])(Game_Player.prototype,'moveInputVertical',_QMoveVH);
Object(_util__WEBPACK_IMPORTED_MODULE_0__[/* override */ "r"])(Game_Player.prototype,'moveInputDiagonal',_QMoveVH);

Game_Player.prototype.mv3d_QMoveRadian=function(dir,dist=this.moveTiles()){
	this.moveRadian(-Object(_util__WEBPACK_IMPORTED_MODULE_0__[/* degtorad */ "j"])(_mv3d__WEBPACK_IMPORTED_MODULE_1__[/* default */ "a"].blendCameraYaw.currentValue()+90+_mv3d__WEBPACK_IMPORTED_MODULE_1__[/* default */ "a"].dirToYaw(dir)),dist);
	//this.mv3d_setDirection(mv3d.transformDirection(dir));
};

Object(_util__WEBPACK_IMPORTED_MODULE_0__[/* override */ "r"])(Game_Character.prototype,'moveRadian',o=>function(radian, dist){
	o.apply(this,arguments);
	const d = _mv3d__WEBPACK_IMPORTED_MODULE_1__[/* default */ "a"].yawToDir(Object(_util__WEBPACK_IMPORTED_MODULE_0__[/* radtodeg */ "t"])(-radian)-90,true);
	this.mv3d_setDirection(d);
});

Object(_util__WEBPACK_IMPORTED_MODULE_0__[/* override */ "r"])(Game_Character.prototype,'moveDiagonally',o=>function(h,v){
	o.apply(this,arguments);
	const d = Object(_util__WEBPACK_IMPORTED_MODULE_0__[/* hvtodir */ "n"])(h,v);
	this.mv3d_setDirection(d);
});

if(Game_Follower.prototype.updateMoveList)
Object(_util__WEBPACK_IMPORTED_MODULE_0__[/* override */ "r"])(Game_Follower.prototype,'updateMoveList',o=>function(){
	const move = this._moveList[0];
	o.apply(this,arguments);
	if(!move){ return; }
	this.mv3d_setDirection(move[3]);
});

/***/ }),
/* 11 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _util__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(1);


Object(_util__WEBPACK_IMPORTED_MODULE_0__[/* override */ "r"])(Game_Player.prototype,'moveByInput',o=>function(){
	$gameTemp._mv3d_altimit_moveByInput=true;
	o.apply(this,arguments);
	$gameTemp._mv3d_altimit_moveByInput=false;
});

mv3d.getInputDirection=function(){
	let dir = mv3d.DIR8MOVE ? Input.dir8 : Input.dir4;
	return dir;
};

Object(_util__WEBPACK_IMPORTED_MODULE_0__[/* override */ "r"])(Game_Player.prototype,'moveVector',o=>function(vx,vy){
	if($gameTemp._mv3d_altimit_moveByInput && !this._touchTarget){
		const _vx=vx,_vy=vy;
		const yaw = Object(_util__WEBPACK_IMPORTED_MODULE_0__[/* degtorad */ "j"])(mv3d.blendCameraYaw.currentValue());
		vx=Object(_util__WEBPACK_IMPORTED_MODULE_0__[/* cos */ "h"])(yaw)*_vx + Object(_util__WEBPACK_IMPORTED_MODULE_0__[/* sin */ "v"])(yaw)*_vy;
		vy=-Object(_util__WEBPACK_IMPORTED_MODULE_0__[/* sin */ "v"])(yaw)*_vx + Object(_util__WEBPACK_IMPORTED_MODULE_0__[/* cos */ "h"])(yaw)*_vy;
		//console.log(_vx,_vy,vx,vy);
	}
	if(this.mv3d_sprite && this.mv3d_sprite.platform && this.mv3d_sprite.platform.isSlope){
		if(Math.abs(vx)>Math.abs(vy)){ 
			vx=Math.round(this._x)-this._x+Math.sign(vx);
			vy=Math.round(this._y)-this._y;
		}else{
			vx=Math.round(this._x)-this._x;
			vy=Math.round(this._y)-this._y+Math.sign(vy);
		}
		if($gamePlayer._touchTarget){
			$gamePlayer._touchTarget.x=Math.round($gamePlayer._touchTarget.x);
			$gamePlayer._touchTarget.y=Math.round($gamePlayer._touchTarget.y);
		}
	}
	
	o.call(this,vx,vy);
});

Object(_util__WEBPACK_IMPORTED_MODULE_0__[/* override */ "r"])(Game_CharacterBase.prototype,'setDirectionVector',o=>function(vx,vy){
	this.mv3d_setDirection(mv3d.yawToDir(Object(_util__WEBPACK_IMPORTED_MODULE_0__[/* pointtodeg */ "s"])(vx,vy),true));
});

Object(_util__WEBPACK_IMPORTED_MODULE_0__[/* override */ "r"])(Game_CharacterBase.prototype,'moveVectorMap',o=>function(owner, collider, bboxTests, move, vx, vy){
	o.apply(this,arguments);
	const sprite = owner.mv3d_sprite;
	if(!sprite){ return; }

	const x = Math.floor(owner.x+collider.x);
	const y = Math.floor(owner.y+collider.y);
	const x1=Math.floor(owner.x+move.x+collider.aabbox.left), x2=Math.ceil(owner.x+move.x+collider.aabbox.right);
	const y1=Math.floor(owner.y+move.y+collider.aabbox.top), y2=Math.ceil(owner.y+move.y+collider.aabbox.bottom);
	
	//const d = Input._makeNumpadDirection(Math.sign(move.x),Math.sign(move.y));
	//const d = this.direction();

	for (let tx = x1; tx < x2; ++tx)
	for (let ty = y1; ty < y2; ++ty){
		const d = Input._makeNumpadDirection(Math.sign(tx-x),Math.sign(ty-y));
		//if(tx===x&&ty===y){continue;}
		let slope;
		let realign = false;
		if(slope=mv3d.isRampAt(tx,ty,sprite.z)){
			if(mv3d.canPassRamp(10-d,slope)){ continue; }
		}
		const tx2 = $gameMap.roundXWithDirection(tx, 10-d);
		const ty2 = $gameMap.roundYWithDirection(ty, 10-d);
		if(slope=mv3d.isRampAt(tx2,ty2,sprite.z)){
			if(mv3d.canPassRamp(d,slope)){ continue; }
		}

		let collided = false;
		if(this._mv3d_isFlying()){
			if(!mv3d.ALLOW_GLIDE&&mv3d.tileCollision(this,tx,ty,true,true)||mv3d.tileCollision(this,tx,ty,true,false)){ collided=true; }
		}else{
			if(sprite.falling){ collided=true; }
			else if(mv3d.tileCollision(this,tx,ty,true,true)){ collided=true; }
			else if(!mv3d.WALK_OFF_EDGE){
				const platformz = mv3d.getPlatformFloatForCharacter(this,tx,ty);
				if(Object(_util__WEBPACK_IMPORTED_MODULE_0__[/* unround */ "A"])(Math.abs(platformz-sprite.targetElevation))>mv3d.STAIR_THRESH){
					collided=true;
				}
			}
		}
		if(collided){
			if(tx!==x){ move.x=0; }
			if(ty!==y){ move.y=0; }
		}
	}
});

Object(_util__WEBPACK_IMPORTED_MODULE_0__[/* override */ "r"])(Game_CharacterBase.prototype,'moveVectorCharacters',o=>function(owner, collider, characters, loopMap, move){
	const spr1=this.mv3d_sprite; if(!spr1){ return o.apply(this,arguments); }
	const zcol1=spr1.getCollisionHeight();
	characters=characters.filter(character=>{
		const spr2 = character.mv3d_sprite; if(!spr2){ return true; }
		const zcol2=spr2.getCollisionHeight();
		return zcol1.z1<zcol2.z2&&zcol1.z2>zcol2.z1;
	});
	return o.call(this,owner,collider,characters,loopMap,move);
});

mv3d.Character.prototype.getPlatform=function(x=this.char._realX,y=this.char._realY,opts={}){
	const collider = this.char.collider();
	if(collider.type===0){
		x+=collider.x-0.5; y+=collider.y-0.5;
		const r = collider.radius*0.95;
		
		const platform = [
			mv3d.getPlatformForCharacter(this,x,y),
			mv3d.getPlatformForCharacter(this,x,y-r,opts),
			mv3d.getPlatformForCharacter(this,x-r,y,opts),
			mv3d.getPlatformForCharacter(this,x,y+r,opts),
			mv3d.getPlatformForCharacter(this,x+r,y,opts),
		]
		const diagPlatforms = [
			-Infinity,
			mv3d.getPlatformForCharacter(this,x-r*Math.SQRT1_2,y-r*Math.SQRT1_2,opts),
			mv3d.getPlatformForCharacter(this,x-r*Math.SQRT1_2,y+r*Math.SQRT1_2,opts),
			mv3d.getPlatformForCharacter(this,x+r*Math.SQRT1_2,y+r*Math.SQRT1_2,opts),
			mv3d.getPlatformForCharacter(this,x+r*Math.SQRT1_2,y-r*Math.SQRT1_2,opts),
		].filter(c=>c.z2<=this.z);
		return platform.concat(diagPlatforms).reduce((a,b)=>a.z2>=b.z2?a:b);
	}else{
		x-=0.5; y-=0.5;
		const b = {
			l:collider.aabbox.left*0.99,
			r:collider.aabbox.right*0.99,
			t:collider.aabbox.top*0.99,
			b:collider.aabbox.bottom*0.99,
		};
		const platform = [
			mv3d.getPlatformForCharacter(this,x,y),
			mv3d.getPlatformForCharacter(this,x+b.l,y+b.t,opts),
			mv3d.getPlatformForCharacter(this,x+b.l,y+b.b,opts),
			mv3d.getPlatformForCharacter(this,x+b.r,y+b.t,opts),
			mv3d.getPlatformForCharacter(this,x+b.r,y+b.b,opts),
		].reduce((a,b)=>a.z2>=b.z2?a:b);
		return platform;
	}
};

mv3d.getEventsAt=function(x,y){
	x=Math.round(x); y=Math.round(y);
	return $gameMap.events().filter( character=>{
		if(character.isThrough()){ return false; }
		const {x:cx,y:cy}=character;
		const {left,right,top,bottom}=character.collider().aabbox;
		return cx+left<x+1 && cx+right>x && cy+top<y+1 && cy+bottom>y;
	  } );
};

// give followers through if they fall behind
/*
const _FOLLOWER_THROUGH_THRESH=3;
override(Game_Follower.prototype,'isThrough',o=>function(){
	const precedingCharacter = (this._memberIndex > 1 ? $gamePlayer._followers._data[this._memberIndex - 2] : $gamePlayer);
	if(Math.abs(precedingCharacter.x-this.x)+Math.abs(precedingCharacter.y-this.y)>_FOLLOWER_THROUGH_THRESH){ return true; }
	return o.apply(this,arguments);
});
*/

function zCollidersOverlap(s1,s2){
	s1=s1.getCollisionHeight(); s2=s2.getCollisionHeight();
	if(s1.z1===s1.z2||s2.z1===s2.z2){ return s1.z1<=s2.z2&&s1.z2>=s2.z1 }
	return s1.z1<s2.z2&&s1.z2>s2.z1;
}

Object(_util__WEBPACK_IMPORTED_MODULE_0__[/* override */ "r"])(Game_Map.prototype,'events',o=>function(){
	const events = o.apply(this,arguments);
	if(!$gameTemp._mv3d_altimit_eventsHeightFilter){ return events; }
	delete $gameTemp._mv3d_altimit_eventsHeightFilter;
	const player=$gamePlayer.mv3d_sprite;
	if(!player){ return events; }
	return events.filter(e=>{
		const sprite = e.mv3d_sprite;
		if(!sprite){ return true; }
		return zCollidersOverlap(sprite,player);
	});
});

Object(_util__WEBPACK_IMPORTED_MODULE_0__[/* override */ "r"])(Game_Event.prototype,'checkEventTriggerTouch',o=>function(){
	const sprite = this.mv3d_sprite, player=$gamePlayer.mv3d_sprite;
	if(sprite&&player){
		if(!zCollidersOverlap(sprite,player)){ return false; }
	}
	return o.apply(this,arguments);
});

const _eventsHeightFilter=o=>function(){
	$gameTemp._mv3d_altimit_eventsHeightFilter=true;
	return o.apply(this,arguments);
};
Object(_util__WEBPACK_IMPORTED_MODULE_0__[/* override */ "r"])(Game_Player.prototype,'checkEventTriggerHere',_eventsHeightFilter);
Object(_util__WEBPACK_IMPORTED_MODULE_0__[/* override */ "r"])(Game_Player.prototype,'checkEventTriggerThere',_eventsHeightFilter);

/***/ }),
/* 12 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _mv3d_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(0);
/* harmony import */ var _util_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(1);



const _characterBase_canPass = Game_CharacterBase.prototype.canPass
Game_CharacterBase.prototype.canPass = function(x, y, d) {

	if(!_characterBase_canPass.apply(this,arguments)){
		return false;
	}
	if (_mv3d_js__WEBPACK_IMPORTED_MODULE_0__[/* default */ "a"].isDisabled()||this.isDebugThrough()||this.isThrough()){return true; }

	return true;
};

function charCollidesWithChars(char1,charlist,x,y){
	return charlist.some(char2=>{
		const isPlatform = char2._mv3d_isPlatform();
		if(_mv3d_js__WEBPACK_IMPORTED_MODULE_0__[/* default */ "a"].WALK_OFF_EDGE&&!isPlatform){
			const platformHeight = _mv3d_js__WEBPACK_IMPORTED_MODULE_0__[/* default */ "a"].getPlatformForCharacter(char1,x,y).z2;
			if(_mv3d_js__WEBPACK_IMPORTED_MODULE_0__[/* default */ "a"].charCollision(char1,char2,false,platformHeight)){ return true; }
		}
		return _mv3d_js__WEBPACK_IMPORTED_MODULE_0__[/* default */ "a"].charCollision(char1,char2,isPlatform,true);
	});
}

const _isCollidedWithEvents=o=>function(x,y){
	return charCollidesWithChars(this,$gameMap.eventsXyNt(x,y),x,y);
};

Object(_util_js__WEBPACK_IMPORTED_MODULE_1__[/* override */ "r"])(Game_CharacterBase.prototype,'isCollidedWithEvents',_isCollidedWithEvents);

Object(_util_js__WEBPACK_IMPORTED_MODULE_1__[/* override */ "r"])(Game_Event.prototype,'isCollidedWithEvents',_isCollidedWithEvents);

Object(_util_js__WEBPACK_IMPORTED_MODULE_1__[/* override */ "r"])(Game_Event.prototype,'isCollidedWithPlayerCharacters',o=>function(x,y){
	if($gamePlayer.isThrough()){ return false; }
	const chars = [$gamePlayer,...$gamePlayer.followers()._data.filter(f=>f.isVisible()&&f.mv3d_sprite&&f.mv3d_sprite.visible)]
	.filter(char=>char.pos(x,y));
	return charCollidesWithChars(this,chars,x,y);
});

Object(_util_js__WEBPACK_IMPORTED_MODULE_1__[/* override */ "r"])(Game_CharacterBase.prototype,'isCollidedWithVehicles',o=>function(x,y){
	const boat=$gameMap.boat(), ship=$gameMap.ship();
	return boat.posNt(x,y)&&_mv3d_js__WEBPACK_IMPORTED_MODULE_0__[/* default */ "a"].charCollision(this,boat,boat._mv3d_isPlatform(),true) || ship.posNt(x,y)&&_mv3d_js__WEBPACK_IMPORTED_MODULE_0__[/* default */ "a"].charCollision(this,ship,ship._mv3d_isPlatform(),true);
});

const _isMapPassable=o=>function(x,y,d){
	const sprite = this.mv3d_sprite;
	if(!sprite){ return o.apply(this,arguments); }

	$gameTemp._mv3d_collision_char = sprite;
	let collided = !o.apply(this,arguments);
	delete $gameTemp._mv3d_collision_char;
	if(collided){ return false; }


	let slope;
	if(slope=_mv3d_js__WEBPACK_IMPORTED_MODULE_0__[/* default */ "a"].isRampAt(x,y,sprite.z)){
		if(_mv3d_js__WEBPACK_IMPORTED_MODULE_0__[/* default */ "a"].canPassRamp(d,slope)){ return true; }
	}

	var x2 = $gameMap.roundXWithDirection(x, d);
	var y2 = $gameMap.roundYWithDirection(y, d);
	
	if(slope=_mv3d_js__WEBPACK_IMPORTED_MODULE_0__[/* default */ "a"].isRampAt(x2,y2,sprite.z)){
		if(_mv3d_js__WEBPACK_IMPORTED_MODULE_0__[/* default */ "a"].canPassRamp(10-d,slope)){ return true; }
	}
	
	if(this._mv3d_isFlying()){
		if(!_mv3d_js__WEBPACK_IMPORTED_MODULE_0__[/* default */ "a"].ALLOW_GLIDE&&_mv3d_js__WEBPACK_IMPORTED_MODULE_0__[/* default */ "a"].tileCollision(this,x2,y2,true,true)||_mv3d_js__WEBPACK_IMPORTED_MODULE_0__[/* default */ "a"].tileCollision(this,x2,y2,true,false)){ return false; }
	}else{
		if(_mv3d_js__WEBPACK_IMPORTED_MODULE_0__[/* default */ "a"].tileCollision(this,x2,y2,true,true)){ return false; }
		
		if(sprite.falling){ return false; }
		if(!_mv3d_js__WEBPACK_IMPORTED_MODULE_0__[/* default */ "a"].WALK_OFF_EDGE){
			const platformz = _mv3d_js__WEBPACK_IMPORTED_MODULE_0__[/* default */ "a"].getPlatformFloatForCharacter(this,x2,y2);
			if(Object(_util_js__WEBPACK_IMPORTED_MODULE_1__[/* unround */ "A"])(Math.abs(platformz-sprite.targetElevation))>_mv3d_js__WEBPACK_IMPORTED_MODULE_0__[/* default */ "a"].STAIR_THRESH){
				return false; 
			}
		}
	}
	return true;
};

Object(_util_js__WEBPACK_IMPORTED_MODULE_1__[/* override */ "r"])(Game_CharacterBase.prototype,'isMapPassable',_isMapPassable);

Object(_util_js__WEBPACK_IMPORTED_MODULE_1__[/* override */ "r"])(Game_Vehicle.prototype,'isMapPassable',_isMapPassable);

Object(_util_js__WEBPACK_IMPORTED_MODULE_1__[/* override */ "r"])(Game_Player.prototype,'startMapEvent',o=>function(x,y,triggers,normal){
	if ($gameMap.isEventRunning()) { return; }
	$gameMap.eventsXy(x,y)
	.filter(event=>_mv3d_js__WEBPACK_IMPORTED_MODULE_0__[/* default */ "a"].charCollision(this,event,false,false,false,true))
	.forEach(event=>{
		if (event.isTriggerIn(triggers) && event.isNormalPriority() === normal) {
			event.start();
		}
	});
});

const _checkPassage = Game_Map.prototype.checkPassage;
Game_Map.prototype.checkPassage = function(x, y, bit) {
	if(!('_mv3d_collision_char' in $gameTemp)){
		return _checkPassage.apply(this,arguments);
	}
	const char = $gameTemp._mv3d_collision_char;
	const cHeight = char.getCHeight();
	const z = char.z+Math.max(cHeight,_mv3d_js__WEBPACK_IMPORTED_MODULE_0__[/* default */ "a"].STAIR_THRESH);
	const platform = _mv3d_js__WEBPACK_IMPORTED_MODULE_0__[/* default */ "a"].getPlatformForCharacter(char,x,y);
	if(platform.char){ return true; }
	var flags = this.tilesetFlags();
	//var tiles = this.allTiles(x, y);
	const layers = _mv3d_js__WEBPACK_IMPORTED_MODULE_0__[/* default */ "a"].getTileLayers(x,y,z,_mv3d_js__WEBPACK_IMPORTED_MODULE_0__[/* default */ "a"].STAIR_THRESH>=cHeight);
	const tiles = _mv3d_js__WEBPACK_IMPORTED_MODULE_0__[/* default */ "a"].getTileData(x,y);
	for (var i = layers.length-1; i>=0; --i) {
		const l=layers[i];
		if(bit&0x0f){
			const conf = _mv3d_js__WEBPACK_IMPORTED_MODULE_0__[/* default */ "a"].getTileConfig(x,y,l);
			if('pass' in conf){
				//const passage = mv3d.getTilePassage(x,y,l);
				if(conf.pass===_mv3d_js__WEBPACK_IMPORTED_MODULE_0__[/* default */ "a"].enumPassage.THROUGH){ continue; }
				if(conf.pass===_mv3d_js__WEBPACK_IMPORTED_MODULE_0__[/* default */ "a"].enumPassage.FLOOR){ return true; }
				if(conf.pass===_mv3d_js__WEBPACK_IMPORTED_MODULE_0__[/* default */ "a"].enumPassage.WALL){ return false; }
			}
		}
		const flag = flags[tiles[l]];
		if ((flag & 0x10) !== 0)  // [*] No effect on passage
			continue;
		if ((flag & bit) === 0)   // [o] Passable
			return true;
		if ((flag & bit) === bit) // [x] Impassable
			return false;
	}
    return false;
};

const _dir8Condition=()=> !_mv3d_js__WEBPACK_IMPORTED_MODULE_0__[/* default */ "a"].isDisabled() || _mv3d_js__WEBPACK_IMPORTED_MODULE_0__[/* default */ "a"].DIR8MOVE&&_mv3d_js__WEBPACK_IMPORTED_MODULE_0__[/* default */ "a"].DIR8_2D;

Object(_util_js__WEBPACK_IMPORTED_MODULE_1__[/* override */ "r"])(Game_Player.prototype,'moveStraight',o=>function(d){
	if(!_mv3d_js__WEBPACK_IMPORTED_MODULE_0__[/* default */ "a"].DIR8MOVE){ return o.apply(this,arguments); }
	switch(d){
		case 1: this.moveDiagonally(4, 2); break;
		case 3: this.moveDiagonally(6, 2); break;
		case 7: this.moveDiagonally(4, 8); break;
		case 9: this.moveDiagonally(6, 8); break;
		default: o.apply(this,arguments);
	}
	
},_dir8Condition);

Object(_util_js__WEBPACK_IMPORTED_MODULE_1__[/* override */ "r"])(Game_Character.prototype,'moveDiagonally',o=>function(h,v){
	o.apply(this,arguments);

	let adjustDirection=false;

	if(this.isMovementSucceeded()){
		adjustDirection=true;
	}else if(_mv3d_js__WEBPACK_IMPORTED_MODULE_0__[/* default */ "a"].DIR8SMART){
		this.moveStraight(h);
		if(!this.isMovementSucceeded()){
			this.moveStraight(v);
			if(!this.isMovementSucceeded()){
				adjustDirection=true;
			}
		}
	}

	if(adjustDirection){
		const d = Object(_util_js__WEBPACK_IMPORTED_MODULE_1__[/* hvtodir */ "n"])(h,v);
		this.mv3d_setDirection(d);
	}

},_dir8Condition);

Object(_util_js__WEBPACK_IMPORTED_MODULE_1__[/* override */ "r"])(Game_CharacterBase.prototype,'canPassDiagonally',o=>function(x,y,horz,vert){
    const x2 = $gameMap.roundXWithDirection(x, horz);
	const y2 = $gameMap.roundYWithDirection(y, vert);
	if(_mv3d_js__WEBPACK_IMPORTED_MODULE_0__[/* default */ "a"].tileCollision(this,x,y2,true,true)||_mv3d_js__WEBPACK_IMPORTED_MODULE_0__[/* default */ "a"].tileCollision(this,x2,y,true,true)){
		return false;
	}
	return o.apply(this,arguments);
});

const _dontSnapRealXY=o=>function(){
	const realX=this._realX, realY=this._realY;
	o.apply(this,arguments);
	if(Math.abs(realX-this._realX)>2||Math.abs(realY-this._realY)>2){ return;}
	this._realX=realX; this._realY=realY;
};
Object(_util_js__WEBPACK_IMPORTED_MODULE_1__[/* override */ "r"])(Game_Follower.prototype,'moveDiagonally',_dontSnapRealXY,_dir8Condition);
Object(_util_js__WEBPACK_IMPORTED_MODULE_1__[/* override */ "r"])(Game_Follower.prototype,'moveStraight',_dontSnapRealXY,_dir8Condition);

Object(_util_js__WEBPACK_IMPORTED_MODULE_1__[/* override */ "r"])(Game_CharacterBase.prototype,'distancePerFrame',o=>function(){
	const dist = o.apply(this,arguments);
	if(this._mv3d_direction%2){
		return dist * Math.SQRT1_2;
	}
	return dist;
},_dir8Condition);

// triggering

Object(_util_js__WEBPACK_IMPORTED_MODULE_1__[/* override */ "r"])(Game_Player.prototype,'checkEventTriggerThere',o=>function(triggers){
	if (!this.canStartLocalEvents()) { return; }
	const dir = this.mv3d_direction();
	if(dir%2===0){ return o.apply(this,arguments); }
	const horz = Object(_util_js__WEBPACK_IMPORTED_MODULE_1__[/* dirtoh */ "k"])(dir),vert = Object(_util_js__WEBPACK_IMPORTED_MODULE_1__[/* dirtov */ "l"])(dir);
	const x2 = $gameMap.roundXWithDirection(this.x, horz);
	const y2 = $gameMap.roundYWithDirection(this.y, vert);
	this.startMapEvent(x2, y2, triggers, true);
	if(!$gameMap.isAnyEventStarting()){
		return o.apply(this,arguments);
	}
},_dir8Condition);


// VEHICLES

const _airship_land_ok = Game_Map.prototype.isAirshipLandOk;
Game_Map.prototype.isAirshipLandOk = function(x, y) {
	if (_mv3d_js__WEBPACK_IMPORTED_MODULE_0__[/* default */ "a"].isDisabled()){ return _airship_land_ok.apply(this,arguments); }
	if(_mv3d_js__WEBPACK_IMPORTED_MODULE_0__[/* default */ "a"].AIRSHIP_SETTINGS.bushLanding){
		return this.checkPassage(x, y, 0x0f);
	}else{
		return _airship_land_ok.apply(this,arguments);
	}

};

const _player_updateVehicleGetOn = Game_Player.prototype.updateVehicleGetOn;
Game_Player.prototype.updateVehicleGetOn = function() {
	if (_mv3d_js__WEBPACK_IMPORTED_MODULE_0__[/* default */ "a"].isDisabled()){ return _player_updateVehicleGetOn.apply(this,arguments); }
	const vehicle = this.vehicle();
	const speed = _mv3d_js__WEBPACK_IMPORTED_MODULE_0__[/* default */ "a"].loadData(`${vehicle._type}_speed`,vehicle._moveSpeed);
	vehicle.setMoveSpeed(speed);
	_player_updateVehicleGetOn.apply(this,arguments);
	this.setThrough(false);
};

// get on off vehicle

const _getOnVehicle = Game_Player.prototype.getOnVehicle;
Game_Player.prototype.getOnVehicle = function(){
	if(_mv3d_js__WEBPACK_IMPORTED_MODULE_0__[/* default */ "a"].isDisabled()){ return _getOnVehicle.apply(this,arguments); }
	var d = this.direction();
	var x1 = Math.round(this.x);
    var y1 = Math.round(this.y);
    var x2 = $gameMap.roundXWithDirection(x1,d);
	var y2 = $gameMap.roundYWithDirection(y1,d);
	
	if($gameMap.airship().pos(x1,y1) && _mv3d_js__WEBPACK_IMPORTED_MODULE_0__[/* default */ "a"].charCollision(this,$gameMap.airship(),false,false,false,true)){
		this._vehicleType = 'airship';
	}else if($gameMap.ship().pos(x2,y2) && _mv3d_js__WEBPACK_IMPORTED_MODULE_0__[/* default */ "a"].charCollision(this,$gameMap.ship())) {
		this._vehicleType = 'ship';
	}else if($gameMap.boat().pos(x2,y2) && _mv3d_js__WEBPACK_IMPORTED_MODULE_0__[/* default */ "a"].charCollision(this,$gameMap.boat())) {
		this._vehicleType = 'boat';
	}
	if (this.isInVehicle()) {
		this._vehicleGettingOn = true;
		if (!this.isInAirship()) {
			this.forceMoveForward();
		}
		this.gatherFollowers();
	}
	return this._vehicleGettingOn;
};


Object(_util_js__WEBPACK_IMPORTED_MODULE_1__[/* override */ "r"])(Game_Vehicle.prototype,'isLandOk',o=>function(x,y,d){
	$gameTemp._mv3d_collision_char = $gamePlayer.mv3d_sprite;
	let landOk = o.apply(this,arguments);
	delete $gameTemp._mv3d_collision_char;
	if (this.isAirship()) { return landOk; }
	var x2 = $gameMap.roundXWithDirection(x, d);
	var y2 = $gameMap.roundYWithDirection(y, d);
	const platform = _mv3d_js__WEBPACK_IMPORTED_MODULE_0__[/* default */ "a"].getPlatformForCharacter($gamePlayer,x2,y2);
	if(platform.char){ landOk=true; }
	const diff = Math.abs(platform.z2-this.z);
	return landOk && diff<Math.max($gamePlayer.mv3d_sprite.getCHeight(),this.mv3d_sprite.getCHeight());
});

/***/ }),
/* 13 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);

// EXTERNAL MODULE: ./src/mv3d.js
var mv3d = __webpack_require__(0);

// EXTERNAL MODULE: ./src/mod_babylon.js + 1 modules
var mod_babylon = __webpack_require__(2);

// EXTERNAL MODULE: ./src/util.js
var util = __webpack_require__(1);

// CONCATENATED MODULE: ./src/mod_mv.js



const _graphics_createCanvas=Graphics._createCanvas;
Graphics._createCanvas = function() {
	mv3d["a" /* default */].setup();
	mv3d["a" /* default */].updateCanvas();
	_graphics_createCanvas.apply(this,arguments);
};

const _graphics_updateAllElements=Graphics._updateAllElements;
Graphics._updateAllElements = function() {
	_graphics_updateAllElements.apply(this,arguments);
	mv3d["a" /* default */].updateCanvas();
};

const _graphics_render=Graphics.render;
Graphics.render=function(){
	mv3d["a" /* default */].render();
	_graphics_render.apply(this,arguments);
};

const _sceneMap_update=Scene_Map.prototype.update;
Scene_Map.prototype.update = function(){
	_sceneMap_update.apply(this,arguments);
	if(!mv3d["a" /* default */].isDisabled()){
		mv3d["a" /* default */].update();
	}
}

const _renderWebGL = ShaderTilemap.prototype.renderWebGL;
ShaderTilemap.prototype.renderWebGL = function(renderer) {
	if(mv3d["a" /* default */].mapDisabled){ _renderWebGL.apply(this,arguments); }
};

const _createTilemap=Spriteset_Map.prototype.createTilemap;
Spriteset_Map.prototype.createTilemap=function(){
	_createTilemap.apply(this,arguments);
	mv3d["a" /* default */].mapDisabled = mv3d["a" /* default */].isDisabled();
	if(mv3d["a" /* default */].mapDisabled){ return; }
	this._tilemap.visible=false;
	mv3d["a" /* default */].pixiSprite=new PIXI.Sprite(mv3d["a" /* default */].texture);
	mv3d["a" /* default */].pixiSprite.scale.set(1/mv3d["a" /* default */].RES_SCALE,1/mv3d["a" /* default */].RES_SCALE);
	mv3d["a" /* default */].pixiContainer=new PIXI.Container();
	mv3d["a" /* default */].viewContainer=new PIXI.Container();
	this._baseSprite.addChild( mv3d["a" /* default */].pixiContainer );
	mv3d["a" /* default */].pixiContainer.addChild( mv3d["a" /* default */].viewContainer );
	mv3d["a" /* default */].viewContainer.addChild( mv3d["a" /* default */].pixiSprite );
};

const _sprite_char_setchar = Sprite_Character.prototype.setCharacter;
Sprite_Character.prototype.setCharacter = function(character) {
	_sprite_char_setchar.apply(this,arguments);
	Object.defineProperty(character,'mv_sprite',{
		value:this,
		configurable:true,
		enumerable:false,
	});
};

// Player Transfer

const _performTransfer=Game_Player.prototype.performTransfer;
Game_Player.prototype.performTransfer = function() {
	_performTransfer.apply(this,arguments);
	if(mv3d["a" /* default */].is1stPerson()){
		mv3d["a" /* default */].blendCameraYaw.setValue(mv3d["a" /* default */].dirToYaw($gamePlayer.direction(),0));
	}
};

// On Map Load

let tilesetLoaded = false;

const _onMapLoaded=Scene_Map.prototype.onMapLoaded;
Scene_Map.prototype.onMapLoaded=function(){
	const newmap = this._transfer && ( $gamePlayer._newMapId !== $gameMap.mapId() );
	Input.clear();
	if(newmap || mv3d["a" /* default */].needClearMap){
		mv3d["a" /* default */].clearMap();
		mv3d["a" /* default */].needClearMap=false;
	}else if(mv3d["a" /* default */].needReloadMap&&mv3d["a" /* default */].mapLoaded){
		mv3d["a" /* default */].reloadMap();
	}
	mv3d["a" /* default */].needReloadMap=false;
	tilesetLoaded = false;
	if(!mv3d["a" /* default */].mapLoaded){
		mv3d["a" /* default */].beforeMapLoad(newmap);
		mv3d["a" /* default */].loadMapSettings();
	}
	_onMapLoaded.apply(this,arguments);
	if(!tilesetLoaded){ mv3d["a" /* default */].loadTilesetSettings(); }
	if(!mv3d["a" /* default */].mapLoaded){
		if(newmap){ mv3d["a" /* default */].applyMapSettings(); }
		mv3d["a" /* default */].afterMapLoad(newmap);
		if(mv3d["a" /* default */].isDisabled()){
			mv3d["a" /* default */].mapReady=true;
		}else{
			mv3d["a" /* default */].mapReady=false;
			//mv3d.mapReady=true;
			mv3d["a" /* default */].loadMap();
		}
	}
	mv3d["a" /* default */].updateBlenders(true);
};

// onMapLoaded > performTransfer > map setup
// hook into map setup before Qmovement's setup.
const _map_battleback_Setup = Game_Map.prototype.setupBattleback;
Game_Map.prototype.setupBattleback=function(){
	_map_battleback_Setup.apply(this,arguments);
	mv3d["a" /* default */].loadTilesetSettings();
	tilesetLoaded = true;
};

const _onLoadSuccess = Scene_Load.prototype.onLoadSuccess;
Scene_Load.prototype.onLoadSuccess = function() {
	_onLoadSuccess.apply(this,arguments);
	mv3d["a" /* default */].needClearMap=true;
};

const _map_isReady = Scene_Map.prototype.isReady;
Scene_Map.prototype.isReady = function() {
	let ready = _map_isReady.apply(this,arguments);
	return ready && mv3d["a" /* default */].mapReady;
};

// Title

const _title_start=Scene_Title.prototype.start;
Scene_Title.prototype.start = function() {
	_title_start.apply(this,arguments);
	mv3d["a" /* default */].clearMap();
	mv3d["a" /* default */].clearCameraTarget();
};

const _initGraphics = SceneManager.initGraphics;
SceneManager.initGraphics = function() {
	_initGraphics.apply(this,arguments);
	if(!Graphics.isWebGL()){
		throw new Error("MV3D requires WebGL");
	}
};

// force webgl
SceneManager.preferableRendererType = function() {
    if (Utils.isOptionValid('canvas')) {
        return 'canvas';
    } else if (Utils.isOptionValid('webgl')) {
        return 'webgl';
    } else {
		if(Graphics.hasWebGL()){ return 'webgl'; }
        return 'auto';
    }
};
// CONCATENATED MODULE: ./src/attributes.js


mv3d["a" /* default */].attributes={};

class attributes_Attribute{
	constructor(name,dfault,reader){
		this.name=name.toLowerCase();
		this.reader = reader?reader:v=>v;
		this.default=this.reader(dfault);
		this.descriptor={
			get:()=>this.get(),
			set:v=>this.set(this.reader(v)),
		};
		Object.defineProperty(mv3d["a" /* default */].attributes,this.name,this.descriptor);
	}
	get(){
		const storage = attributes_Attribute.getStorageLocation();
		if(!storage || !(this.name in storage)){ return this.default; }
		return storage[this.name];
	}
	set(v){
		const storage = attributes_Attribute.getStorageLocation();
		if (!storage){console.warn(`MV3D: Couldn't get Attribute storage location.`); return;}
		storage[this.name]=v;
	}
	static getStorageLocation(){
		if(!$gameVariables){ return null; }
		if(!$gameVariables.mv3d_attributes){ $gameVariables.mv3d_attributes = {}; }
		return $gameVariables.mv3d_attributes;
	}
}
mv3d["a" /* default */].Attribute = attributes_Attribute;
// CONCATENATED MODULE: ./src/parameters.js





let pluginName = 'mv3d';
if(!PluginManager._scripts.includes("mv3d")){
	if(PluginManager._scripts.includes("mv3d-babylon")){ pluginName='mv3d-babylon'; }
}

const parameters = PluginManager.parameters(pluginName);
/* harmony default export */ var src_parameters = (parameters);

function parameter(name,dfault,type){
	return name in parameters ? (type?type(parameters[name]):parameters[name]) : dfault;
}

Object.assign(mv3d["a" /* default */],{
	enumOptionModes:{
		DISABLE: 0,
		ENABLE: 1,
		SUBMENU: 2,
	}
});

Object(util["e" /* assign */])(mv3d["a" /* default */],{
	CAMERA_MODE:"PERSPECTIVE",
	ORTHOGRAPHIC_DIST:100,
	MV3D_FOLDER:"img/MV3D",

	ANIM_DELAY:Number(parameters.animDelay),
	ALPHA_CUTOFF:Math.max(0.01,parameters.alphatest),

	EDGE_FIX: Number(parameters.edgefix)*Object(util["y" /* tileSize */])()/48,
	ANTIALIASING: Object(util["g" /* booleanString */])(parameters.antialiasing),
	FOV:Number(parameters.fov),
	RES_SCALE: parameter('resScale',1,Number)||1,

	WALL_HEIGHT:Number(parameters.wallHeight),
	TABLE_HEIGHT:Number(parameters.tableHeight),
	FRINGE_HEIGHT:Number(parameters.fringeHeight),
	CEILING_HEIGHT:Number(parameters.ceilingHeight),
	LAYER_DIST:Number(parameters.layerDist),

	ENABLED_DEFAULT: Object(util["g" /* booleanString */])(parameters.enabledDefault),
	EVENTS_UPDATE_NEAR: Object(util["g" /* booleanString */])(parameters.eventsUpdateNear),

	UNLOAD_CELLS: Object(util["g" /* booleanString */])(parameters.unloadCells),
	CELL_SIZE: Number(parameters.cellSize),
	RENDER_DIST: Number(parameters.renderDist),
	MIPMAP:Object(util["g" /* booleanString */])(parameters.mipmap),

	get renderDist(){ return Math.min(this.RENDER_DIST, mv3d["a" /* default */].blendFogFar.currentValue()+7.5); },

	OPTION_MIPMAP:Object(util["g" /* booleanString */])(parameters.mipmapOption),
	OPTION_NAME_MIPMAP: parameter('mipmapOptionName',"Mipmapping",String),
	OPTION_RENDER_DIST: parameter('renderDistOption',true,util["g" /* booleanString */]),
	OPTION_NAME_RENDER_DIST: parameter('renderDistOptionName',"Render Distance",String),
	OPTION_RENDER_DIST_MIN: parameter('renderDistMin',10,Number),
	OPTION_RENDER_DIST_MAX: parameter('renderDistMax',100,Number),
	OPTION_FOV: parameter('fovOption',false,util["g" /* booleanString */]),
	OPTION_NAME_FOV: parameter('fovOptionName',"FOV",String),
	OPTION_FOV_MIN: parameter('fovMin',50,Number),
	OPTION_FOV_MAX: parameter('fovMax',100,Number),

	STAIR_THRESH: Number(parameters.stairThresh),
	WALK_OFF_EDGE:Object(util["g" /* booleanString */])(parameters.walkOffEdge),
	WALK_ON_EVENTS:Object(util["g" /* booleanString */])(parameters.walkOnEvents),
	GRAVITY:Number(parameters.gravity),

	FOG_COLOR: Object(util["o" /* makeColor */])(parameters.fogColor).toNumber(),
	FOG_NEAR: Number(parameters.fogNear),
	FOG_FAR: Number(parameters.fogFar), 
	//AMBIENT_COLOR: makeColor(parameters.ambientColor).toNumber(),
	get AMBIENT_COLOR(){ return mv3d["a" /* default */].featureEnabled('dynamicShadows')?0x888888:0xffffff; },

	LIGHT_LIMIT: Number(parameters.lightLimit),
	LIGHT_HEIGHT: 0.5,
	LAMP_HEIGHT: 0.5,
	FLASHLIGHT_HEIGHT: 0.25,
	LIGHT_DECAY: 1,
	LIGHT_DIST: 3,
	LIGHT_ANGLE: 60,
	FLASHLIGHT_EXTRA_ANGLE: 10,
	FLASHLIGHT_INTENSITY_MULTIPLIER: 2,

	REGION_DATA:{},
	_REGION_DATA:{},
	_REGION_DATA_MAP:{},
	TTAG_DATA:{},

	EVENT_HEIGHT:Number(parameters.eventHeight),
	//VEHICLE_BUSH:booleanString(parameters.vehicleBush),
	BOAT_SETTINGS:JSON.parse(parameters.boatSettings),
	SHIP_SETTINGS:JSON.parse(parameters.shipSettings),
	AIRSHIP_SETTINGS:JSON.parse(parameters.airshipSettings),

	ALLOW_GLIDE: Object(util["g" /* booleanString */])(parameters.allowGlide),

	SPRITE_OFFSET:Number(parameters.spriteOffset)/2,

	ENABLE_3D_OPTIONS:mv3d["a" /* default */].enumOptionModes[parameters['3dMenu'].toUpperCase()],

	TEXTURE_SHADOW: parameters.shadowTexture||'shadow',
	TEXTURE_BUSHALPHA: parameters.alphaMask||'bushAlpha',
	TEXTURE_ERROR: parameters.errorTexture||'errorTexture',

	DIR8MOVE: Object(util["g" /* booleanString */])(parameters.dir8Movement),
	DIR8SMART: parameters.dir8Movement.includes("Smart"),
	DIR8_2D: !parameters.dir8Movement.includes("3D"),
	TURN_INCREMENT: Number(parameters.turnIncrement),
	WASD: Object(util["g" /* booleanString */])(parameters.WASD),

	KEYBOARD_PITCH: Object(util["g" /* booleanString */])(parameters.keyboardPitch),
	KEYBOARD_TURN: Object(util["m" /* falseString */])(parameters.keyboardTurn),
	KEYBOARD_STRAFE: Object(util["m" /* falseString */])(parameters.keyboardStrafe),

	YAW_SPEED: Number(parameters.yawSpeed)||90,
	PITCH_SPEED: Number(parameters.pitchSpeed)||90,

	TRIGGER_INFINITE: !Object(util["g" /* booleanString */])(parameters.heightTrigger),

	BACKFACE_CULLING: parameter('backfaceCulling',true,util["g" /* booleanString */]),
	cameraCollision: new attributes_Attribute('cameraCollision',String(parameters.cameraCollision),function(v){
		if(typeof v === 'string'){
			const values=v.split(' '); v=values[0];
			const ret = {type:!Object(util["g" /* booleanString */])(v)?0:Number((v.match(/\d+/)||'1')[0])};
			for (let v of values)if(v.toUpperCase().includes("SMOOTH")){ ret.smooth=true; }
			return ret;
		}else if(typeof v == 'object'){
			return Object.assign(this.get(),v);
		}
		const ret = this.get(); ret.type=Number(v); return ret;
	}),

	DIAG_SYMBOL: parameter('diagSymbol','{d}',String),

	setupParameters(){
		this.REGION_DATA=new Proxy(this._REGION_DATA,{
			get:(target,key)=>{
				if(key in this._REGION_DATA_MAP){ return this._REGION_DATA_MAP[key]; }
				if(key in this._REGION_DATA){ return this._REGION_DATA[key]; }
			},
			set:(target,key,value)=>{
				target[key]=value;
			},
			has:(target,key)=>{
				return key in this._REGION_DATA_MAP || key in this._REGION_DATA;
			},
		});
		for (let entry of JSON.parse(parameters.regions)){
			entry=JSON.parse(entry);
			const regionData = this.readConfigurationFunctions(entry.conf,this.tilesetConfigurationFunctions)
			this._REGION_DATA[entry.regionId]=regionData;
			
		}
		for (let entry of JSON.parse(parameters.ttags)){
			entry=JSON.parse(entry);
			this.TTAG_DATA[entry.terrainTag]=this.readConfigurationFunctions(entry.conf,this.tilesetConfigurationFunctions);
		}

		this.EVENT_CHAR_SETTINGS = this.readConfigurationFunctions(
			parameters.eventCharDefaults,
			this.eventConfigurationFunctions,
		);
		this.EVENT_OBJ_SETTINGS = this.readConfigurationFunctions(
			parameters.eventObjDefaults,
			this.eventConfigurationFunctions,
		);
		this.EVENT_TILE_SETTINGS = this.readConfigurationFunctions(
			parameters.eventTileDefaults,
			this.eventConfigurationFunctions,
		);

		this.BOAT_SETTINGS.big=Object(util["g" /* booleanString */])(this.BOAT_SETTINGS.big);
		this.SHIP_SETTINGS.big=Object(util["g" /* booleanString */])(this.SHIP_SETTINGS.big);
		this.AIRSHIP_SETTINGS.height=Number(this.AIRSHIP_SETTINGS.height);
		this.AIRSHIP_SETTINGS.big=Object(util["g" /* booleanString */])(this.AIRSHIP_SETTINGS.big);
		this.AIRSHIP_SETTINGS.bushLanding=Object(util["g" /* booleanString */])(this.AIRSHIP_SETTINGS.bushLanding);

		this.BOAT_SETTINGS.conf = this.readConfigurationFunctions(
			this.BOAT_SETTINGS.conf,
			this.eventConfigurationFunctions,
		);
		this.SHIP_SETTINGS.conf = this.readConfigurationFunctions(
			this.SHIP_SETTINGS.conf,
			this.eventConfigurationFunctions,
		);
		this.AIRSHIP_SETTINGS.conf = this.readConfigurationFunctions(
			this.AIRSHIP_SETTINGS.conf,
			this.eventConfigurationFunctions,
		);

		//Texture.DEFAULT_ANISOTROPIC_FILTERING_LEVEL=0;
	},

	updateParameters(){
		this.updateRenderDist();
		this.updateFov();
		this.callFeatures('updateParameters');
	},
	updateRenderDist(){
		if(this.camera.mode===mod_babylon["n" /* ORTHOGRAPHIC_CAMERA */]){
			this.camera.maxZ=this.renderDist;
			this.camera.minZ=-this.renderDist;
		}else{
			this.camera.maxZ=this.renderDist;
			this.camera.minZ=0.1;
		}
	},
	updateFov(){
		const dist = this.blendCameraDist.currentValue()||0.1;
		const frustrumHeight = this.getFrustrumHeight(dist,Object(util["j" /* degtorad */])(this.FOV));
		const fov = this.getFovForDist(dist,frustrumHeight/this.blendCameraZoom.currentValue());
		this.camera.fov=fov;
	},
});

// CONCATENATED MODULE: ./src/blenders.js




const raycastPredicate=mesh=>{
	if(!mesh.isEnabled() || !mesh.isVisible || !mesh.isPickable || mesh.character){ return false; }
	return true;
}

Object.assign(mv3d["a" /* default */],{

	cameraTargets:[],
	getCameraTarget(){
		return this.cameraTargets[0];
	},
	setCameraTarget(char,time){
		if(!char){ this.cameraTargets.length=0; return; }
		this.cameraTargets.unshift(char);
		if(this.cameraTargets.length>2){ this.cameraTargets.length=2; }
		this.saveData('cameraTarget',this.getTargetString(char));
		this.blendCameraTransition.value=1;
		this.blendCameraTransition.setValue(0,time);
	},
	clearCameraTarget(){
		this.cameraTargets.length=0;
	},
	resetCameraTarget(){
		this.clearCameraTarget();
		this.setCameraTarget($gamePlayer,0);
	},
	rememberCameraTarget(){
		const target = this.loadData('cameraTarget');
		if(target){
			this.setCameraTarget(this.targetChar(target),0);
		}
	},

	setupBlenders(){
		this.blendFogColor = new ColorBlender('fogColor',this.FOG_COLOR);
		this.blendFogNear = new blenders_Blender('fogNear',this.FOG_NEAR);
		this.blendFogFar = new blenders_Blender('fogFar',this.FOG_FAR);
		this.blendCameraRoll = new blenders_Blender('cameraRoll',0);
		this.blendCameraRoll.cycle=360;
		this.blendCameraYaw = new blenders_Blender('cameraYaw',0);
		this.blendCameraYaw.cycle=360;
		this.blendCameraPitch = new blenders_Blender('cameraPitch',60);
		this.blendCameraPitch.min=0;
		this.blendCameraPitch.max=180;
		this.blendCameraDist = new blenders_Blender('cameraDist',10);
		this.blendCameraZoom = new blenders_Blender('cameraZoom',1);
		this.blendCameraDist.min=0;
		this.blendCameraHeight = new blenders_Blender('cameraHeight',0.7);
		this.blendAmbientColor = new ColorBlender('ambientColor',this.AMBIENT_COLOR);
		this.blendPanX = new blenders_Blender('panX',0);
		this.blendPanY = new blenders_Blender('panY',0);
		this.blendCameraTransition = new blenders_Blender('cameraTransition',0);
		this.blendResolutionScale = new blenders_Blender('resolutionScale',mv3d["a" /* default */].RES_SCALE);
	},

    updateBlenders(reorient){
		this.updateCameraMode();
		// camera target & pan
		if(!this.cameraTargets.length){
			if($gamePlayer){
				this.cameraTargets[0]=$gamePlayer;
			}
		}
		if(this.blendCameraTransition.update() && this.cameraTargets.length>=2){
			const t = this.blendCameraTransition.currentValue();
			let char1=this.cameraTargets[0];
			//if(char1===$gamePlayer&&$gamePlayer.isInVehicle()){ char1=$gamePlayer.vehicle(); }
			let char2=this.cameraTargets[1];
			//if(char2===$gamePlayer&&$gamePlayer.isInVehicle()){ char2=$gamePlayer.vehicle(); }
			this.cameraStick.x = char1._realX*(1-t) + char2._realX*t;
			this.cameraStick.y = char1._realY*(1-t) + char2._realY*t;
			if(char1.mv3d_sprite&&char2.mv3d_sprite){
				this.cameraStick.z = char1.mv3d_sprite.z*(1-t) + char2.mv3d_sprite.z*t;
			}else if(char1.mv3d_sprite){
				this.cameraStick.z=char1.mv3d_sprite.z;
			}
		}else if(this.cameraTargets.length){
			let char = this.getCameraTarget();
			//if(char===$gamePlayer&&$gamePlayer.isInVehicle()){ char=$gamePlayer.vehicle(); }
			this.cameraStick.x=char._realX;
			this.cameraStick.y=char._realY;
			if(char.mv3d_sprite){
				this.cameraStick.z=char.mv3d_sprite.z;
			}
		}
		this.blendPanX.update();
		this.blendPanY.update();
		this.cameraStick.x+=this.blendPanX.currentValue();
		this.cameraStick.y+=this.blendPanY.currentValue();

		// camera yaw, pitch, dist & height
		if(reorient|this.blendCameraPitch.update()|this.blendCameraYaw.update()|this.blendCameraRoll.update()
		|this.blendCameraDist.update()|this.blendCameraHeight.update()|this.blendCameraZoom.update()
		|$gameScreen._shake!==0
		|(mv3d["a" /* default */].cameraCollision.type&&$gamePlayer.mv3d_positionUpdated)){
			this.cameraNode.pitch = this.blendCameraPitch.currentValue()-90;
			this.cameraNode.yaw = this.blendCameraYaw.currentValue();
			this.cameraNode.roll = this.blendCameraRoll.currentValue();
			this.cameraNode.position.set(0,0,0);
			let dist = this.blendCameraDist.currentValue();
			if(mv3d["a" /* default */].cameraCollision.type){
				let doCollide = true;
				if(mv3d["a" /* default */].cameraCollision.type>1){
					this.cameraNode.translate(util["d" /* ZAxis */],-dist,mod_babylon["i" /* LOCALSPACE */]);
					const gpos = mv3d["a" /* default */].globalPosition(this.cameraNode);
					this.cameraNode.position.set(0,0,0);
					const z = mv3d["a" /* default */].getWalkHeight(gpos.x,-gpos.z);
					if(gpos.y>z){doCollide=false;}
					//if(Date.now()%10===0)console.log(gpos,z);
				}
				if(doCollide){
					const raycastOrigin = new mod_babylon["z" /* Vector3 */]().copyFrom(this.cameraStick.position);
					raycastOrigin.y+=this.blendCameraHeight.currentValue()+0.1;
					const ray = new mod_babylon["s" /* Ray */](raycastOrigin, mod_babylon["z" /* Vector3 */].TransformCoordinates(mv3d["a" /* default */].camera.getTarget().negate(),mv3d["a" /* default */].getRotationMatrix(mv3d["a" /* default */].camera)),dist);
					const intersections = mv3d["a" /* default */].scene.multiPickWithRay(ray,raycastPredicate);
					for (const intersection of intersections){
						if(!intersection.hit){ continue; }
						let material = intersection.pickedMesh.material; if(!material){ continue; }
						if(material.subMaterials){
							material = material.subMaterials[intersection.pickedMesh.subMeshes[intersection.subMeshId].materialIndex];
						}
						if(material.mv3d_through){ continue; }
						dist=intersection.distance;
						break;
					}
				}
			}
			if(this.cameraCollision.smooth){
				if(this.camera.dist==null){this.camera.dist=dist;}
				this.camera.dist=this.camera.dist+(dist-this.camera.dist)/2;
				dist=this.camera.dist;
			}
			this.cameraNode.translate(util["d" /* ZAxis */],-dist,mod_babylon["i" /* LOCALSPACE */]);
			if(this.camera.mode===mod_babylon["n" /* ORTHOGRAPHIC_CAMERA */]){
				const fieldSize = this.getFieldSize();
				this.camera.orthoLeft=-fieldSize.width/2;
				this.camera.orthoRight=fieldSize.width/2;
				this.camera.orthoTop=fieldSize.height/2;
				this.camera.orthoBottom=-fieldSize.height/2;
			}else{
				if(this.cameraNode.z<0){ this.cameraNode.z=0; }
			}
			this.cameraNode.z += this.blendCameraHeight.currentValue();
			this.cameraNode.translate(util["b" /* XAxis */],-$gameScreen._shake/48,mod_babylon["i" /* LOCALSPACE */]);
			this.updateDirection();
			this.updateFov();
		}

		//fog
		if(reorient|this.blendFogColor.update()|this.blendFogNear.update()|this.blendFogFar.update()){
			if(mv3d["a" /* default */].hasAlphaFog){
				this.scene.fogStart=this.blendFogNear.currentValue();
				this.scene.fogEnd=this.blendFogFar.currentValue();
			}else{
				this.scene.fogStart=Math.min(mv3d["a" /* default */].RENDER_DIST-1,this.blendFogNear.currentValue());
				this.scene.fogEnd=Math.min(mv3d["a" /* default */].RENDER_DIST,this.blendFogFar.currentValue());
			}
			this.scene.fogColor.copyFromFloats(
				this.blendFogColor.r.currentValue()/255,
				this.blendFogColor.g.currentValue()/255,
				this.blendFogColor.b.currentValue()/255,
			);
			mv3d["a" /* default */].updateClearColor();
			mv3d["a" /* default */].updateRenderDist();
		}

		//light
		if(reorient|this.blendAmbientColor.update()){
			this.scene.ambientColor.copyFromFloats(
				this.blendAmbientColor.r.currentValue()/255,
				this.blendAmbientColor.g.currentValue()/255,
				this.blendAmbientColor.b.currentValue()/255,
			);
		}

		// res scale
		if(reorient|this.blendResolutionScale.update()){
			const resScale=this.blendResolutionScale.currentValue();
			mv3d["a" /* default */].RES_SCALE=resScale;
			mv3d["a" /* default */].pixiSprite.scale.set(1/resScale,1/resScale);
			mv3d["a" /* default */].updateCanvas();
		}

		this.callFeatures('blend',reorient);
	},

	updateClearColor(){
		if($gameMap.parallaxName()||mv3d["a" /* default */].hasSkybox){
			if(mv3d["a" /* default */].hasAlphaFog){
				mv3d["a" /* default */].scene.clearColor.set(...mv3d["a" /* default */].blendFogColor.currentComponents(),0);
			}else{
				mv3d["a" /* default */].scene.clearColor.set(0,0,0,0);
			}
		}else{
			mv3d["a" /* default */].scene.clearColor.set(...mv3d["a" /* default */].blendFogColor.currentComponents(),1);
		}
	},

});

const _changeParallax = Game_Map.prototype.changeParallax;
Game_Map.prototype.changeParallax = function() {
	_changeParallax.apply(this,arguments);
	mv3d["a" /* default */].updateClearColor();
};


class blenders_Blender{
	constructor(key,dfault,track=true){
		this.key=key;
		this.dfault=mv3d["a" /* default */].loadData(key,dfault);
		this.value=dfault;
		this.speed=1;
		this.max=Infinity;
		this.min=-Infinity;
		this.cycle=false;
		this.changed=false;
		if(track){
			blenders_Blender.list.push(this);
		}
	}
	setValue(target,time=0){
		target = Math.min(this.max,Math.max(this.min,target));
		let diff = target - this.value;
		this.saveValue(this.key,target);
		if(!time){ this.changed=true; this.value=target; }
		if(this.cycle){
			while ( Math.abs(diff)>this.cycle/2 ){
				this.value += Math.sign(diff)*this.cycle;
				diff = target - this.value;
			}
		}
		this.speed = Math.abs(diff)/(60*time);
	}
	currentValue(){ return this.value; }
	targetValue(){ return this.loadValue(this.key); }
	defaultValue(){ return this.dfault; }
	update(){
		const target = this.targetValue();
		if(this.value===target){ 
			if(this.changed){
				this.updated=true;
				this.changed=false;
				return true;
			}else{
				this.updated=false;
				return false;
			}
		}
		const diff = target - this.value;
		if(isNaN(this.speed)){ this.speed=Infinity; }
		if(this.speed > Math.abs(diff)){
			this.value=target;
		}else{
			this.value+=this.speed*Math.sign(diff);
		}
		this.updated=true;
		return true;
	}
	storageLocation(){
		if(!$gameVariables){
			console.warn(`MV3D: Couldn't get Blend storage location.`);
			return {};
		}
		if(!$gameVariables.mv3d){ $gameVariables.mv3d = {}; }
		return $gameVariables.mv3d;
	}
	loadValue(key){
		const storage = this.storageLocation();
		if(!(key in storage)){ return this.dfault; }
		return storage[key];
	}
	saveValue(key,value){
		const storage = this.storageLocation();
		storage[key]=value;
	}
	static reset(){
		for (const blender of blenders_Blender.list){
			blender.speed=Infinity;
		}
	}
}
blenders_Blender.list = [];

class ColorBlender{
	constructor(key,dfault,track=true){
		this.dfault=dfault;
		this.r=new blenders_Blender(`${key}_r`,dfault>>16,track);
		this.g=new blenders_Blender(`${key}_g`,dfault>>8&0xff,track);
		this.b=new blenders_Blender(`${key}_b`,dfault&0xff,track);
	}
	setValue(color,time){
		this.r.setValue(color>>16,time);
		this.g.setValue(color>>8&0xff,time);
		this.b.setValue(color&0xff,time);
	}
	currentValue(){
		return this.r.value<<16|this.g.value<<8|this.b.value;
	}
	targetValue(){
		return this.r.targetValue()<<16|this.g.targetValue()<<8|this.b.targetValue();
	}
	defaultValue(){ return this.dfault; }
	update(){
		let ret=0;
		ret|=this.r.update();
		ret|=this.g.update();
		ret|=this.b.update();
		return Boolean(ret);
	}
	get storageLocation(){ return this.r.storageLocation; }
	set storageLocation(v){
		this.r.storageLocation=v;
		this.g.storageLocation=v;
		this.b.storageLocation=v;
	}
	currentComponents(){
		return [this.r.currentValue()/255,this.g.currentValue()/255,this.b.currentValue()/255];
	}
	targetComponents(){
		return [this.r.targetValue()/255,this.g.targetValue()/255,this.b.targetValue()/255];
	}
}

mv3d["a" /* default */].Blender=blenders_Blender;
mv3d["a" /* default */].ColorBlender=ColorBlender;
// CONCATENATED MODULE: ./src/blendModes.js


mv3d["a" /* default */].blendModes={
	[PIXI.BLEND_MODES.NORMAL]: BABYLON.Engine.ALPHA_COMBINE,
	[PIXI.BLEND_MODES.ADD]: BABYLON.Engine.ALPHA_ADD,
	[PIXI.BLEND_MODES.MULTIPLY]: BABYLON.Engine.ALPHA_MULTIPLY,
	[PIXI.BLEND_MODES.SCREEN]: BABYLON.Engine.ALPHA_SCREENMODE,
	
	NORMAL:BABYLON.Engine.ALPHA_COMBINE,
	ADD:BABYLON.Engine.ALPHA_ADD,
	MULTIPLY:BABYLON.Engine.ALPHA_MULTIPLY,
	SCREEN:BABYLON.Engine.ALPHA_SCREENMODE,
};
// EXTERNAL MODULE: ./src/features.js
var features = __webpack_require__(3);

// CONCATENATED MODULE: ./src/input.js




let _is1stPerson = false;

Object.assign(mv3d["a" /* default */],{
	updateInput(){
		const is1stPerson = mv3d["a" /* default */].is1stPerson();
		if(_is1stPerson !== is1stPerson){
			Input.clear();
			_is1stPerson = is1stPerson;
		}
		mv3d["a" /* default */].updateInputCamera();
	},

	updateInputCamera(){
		if(this.isDisabled()||this.loadData('cameraLocked')){ return; }
		const is1stPerson = this.is1stPerson();
		if( this.loadData('allowRotation',mv3d["a" /* default */].KEYBOARD_TURN) || is1stPerson ){
			const leftKey=mv3d["a" /* default */].getTurnKey('left'), rightKey=mv3d["a" /* default */].getTurnKey('right');
			if(mv3d["a" /* default */].TURN_INCREMENT>1){
				const turning = this.blendCameraYaw.currentValue()!==this.blendCameraYaw.targetValue();
				const yawSpeed = mv3d["a" /* default */].TURN_INCREMENT / mv3d["a" /* default */].YAW_SPEED;
				if(Input.isTriggered(leftKey)||Input.isPressed(leftKey)&&!turning){
					this.blendCameraYaw.setValue(this.blendCameraYaw.targetValue()+mv3d["a" /* default */].TURN_INCREMENT,yawSpeed);
				}else if(Input.isTriggered(rightKey)||Input.isPressed(rightKey)&&!turning){
					this.blendCameraYaw.setValue(this.blendCameraYaw.targetValue()-mv3d["a" /* default */].TURN_INCREMENT,yawSpeed);
				}
			}else{
				const increment = mv3d["a" /* default */].YAW_SPEED / 60;
				if(Input.isPressed(leftKey)&&Input.isPressed(rightKey)){
					// do nothing
				}else if(Input.isPressed(leftKey)){
					this.blendCameraYaw.setValue(this.blendCameraYaw.targetValue()+increment,0.1);
				}else if(Input.isPressed(rightKey)){
					this.blendCameraYaw.setValue(this.blendCameraYaw.targetValue()-increment,0.1);
				}
			}
		}
		if( this.loadData('allowPitch',mv3d["a" /* default */].KEYBOARD_PITCH) ){
			const increment = mv3d["a" /* default */].PITCH_SPEED / 60;
			if(Input.isPressed('pageup')&&Input.isPressed('pagedown')){
				// do nothing
			}else if(Input.isPressed('pageup')){
				this.blendCameraPitch.setValue(Math.min(179,this.blendCameraPitch.targetValue()+increment),0.1);
			}else if(Input.isPressed('pagedown')){
				this.blendCameraPitch.setValue(Math.max(1,this.blendCameraPitch.targetValue()-increment),0.1);
			}
		}
	},

	getStrafeKey(keyname){
		if(mv3d["a" /* default */].is1stPerson()){
			switch(mv3d["a" /* default */].KEYBOARD_STRAFE){
				case 'QE': return 'rot'+keyname;
				case 'AD': return keyname;
				default: return false;
			}
		}else{
			switch(mv3d["a" /* default */].KEYBOARD_TURN){
				case 'QE': return keyname;
				case 'AD': return 'rot'+keyname;
				default: return keyname;
			}
		}
	},

	getTurnKey(keyname){
		if(mv3d["a" /* default */].is1stPerson()){
			switch(mv3d["a" /* default */].KEYBOARD_STRAFE){
				case 'QE': return keyname;
				case 'AD': return 'rot'+keyname;
				default: return keyname;
			}
		}else{
			switch(mv3d["a" /* default */].KEYBOARD_TURN){
				case 'QE': return 'rot'+keyname;
				case 'AD': return keyname;
				default: return 'rot'+keyname;
			}
		}
	},
});

Object(util["r" /* override */])(Input,'_signX',o=>function _signX(){
	if(!mv3d["a" /* default */].KEYBOARD_STRAFE && mv3d["a" /* default */].is1stPerson()){ return 0; }
	const leftKey=mv3d["a" /* default */].getStrafeKey('left'), rightKey=mv3d["a" /* default */].getStrafeKey('right');

	let x = 0;
	if (this.isPressed(leftKey)) { --x; }
	if (this.isPressed(rightKey)) { ++x; }
	return x;
});

mv3d["a" /* default */].setupInput=function(){
	if(!mv3d["a" /* default */].WASD){ return; }
	Object.assign(Input.keyMapper,{
		81:'rotleft',  // Q
		69:'rotright', // E
		87:'up',       // W
		65:'left',     // A
		83:'down',     // S
		68:'right',    // D
	});
	const descriptors={
		rotleft:getInputDescriptor('pageup','rotleft', 'rotleft'),
		rotright:getInputDescriptor('pagedown','rotright', 'rotright'),
	}
	Object.defineProperties(Input.keyMapper,{
		81:descriptors.rotleft, //Q
		69:descriptors.rotright,//E
	});
}

function getInputDescriptor(menumode,p3mode,p1mode){
	let assignedValue=undefined;
	return {
		configurable:true,
		get(){
			if(assignedValue!=undefined){ return assignedValue; }
			if(!(SceneManager._scene instanceof Scene_Map)){ return menumode; }
			if(mv3d["a" /* default */].isDisabled()){ return p3mode; }
			if(mv3d["a" /* default */].is1stPerson()){ return p1mode; }
			return p3mode;
		},
		set(v){ assignedValue=v; },
	};
}

const _getInputDirection = Game_Player.prototype.getInputDirection;
Game_Player.prototype.getInputDirection = function() {
	if (mv3d["a" /* default */].isDisabled()){ 
		if(mv3d["a" /* default */].DIR8MOVE && mv3d["a" /* default */].DIR8_2D) { return Input.dir8; }
		return _getInputDirection.apply(this,arguments);
	 }
	return mv3d["a" /* default */].getInputDirection();
};

mv3d["a" /* default */].getInputDirection=function(){
	let dir = mv3d["a" /* default */].DIR8MOVE ? Input.dir8 : Input.dir4;
	return mv3d["a" /* default */].transformDirection(dir,mv3d["a" /* default */].blendCameraYaw.currentValue());
}

const input_raycastPredicate=mesh=>{
	if(!mesh.isEnabled() || !mesh.isVisible || !mesh.isPickable){ return false; }
	if(mesh.character){
		if(mesh.character.isFollower||mesh.character.isPlayer){ return false; }
	}
	return true;
}

const _process_map_touch = Scene_Map.prototype.processMapTouch;
Scene_Map.prototype.processMapTouch = function() {
	if (mv3d["a" /* default */].isDisabled()){ return _process_map_touch.apply(this,arguments); }
	if (TouchInput.isTriggered() || this._touchCount > 0) {
		if (TouchInput.isPressed()) {
			if (this._touchCount === 0 || this._touchCount >= 15) {
				
				const intersection = mv3d["a" /* default */].scene.pick(TouchInput.x*mv3d["a" /* default */].RES_SCALE,TouchInput.y*mv3d["a" /* default */].RES_SCALE,input_raycastPredicate);
				if(intersection.hit){
					mv3d["a" /* default */].processMapTouch(intersection);
				}

			}
			this._touchCount++;
		} else {
			this._touchCount = 0;
		}
	}
};

mv3d["a" /* default */].processMapTouch=function(intersection){
	const point = {x:intersection.pickedPoint.x, y:-intersection.pickedPoint.z};
	const mesh = intersection.pickedMesh;
	if(mesh.character){
		point.x=mesh.character.x;
		point.y=mesh.character.y;
	}
	mv3d["a" /* default */].setDestination(point.x,point.y);
};

mv3d["a" /* default */].setDestination=function(x,y){
	$gameTemp.setDestination(Math.round(x), Math.round(y));
};

const _player_findDirectionTo=Game_Player.prototype.findDirectionTo;
Game_Player.prototype.findDirectionTo=function(){
	const dir = _player_findDirectionTo.apply(this,arguments);
	if(mv3d["a" /* default */].isDisabled()){ return dir; }
	if(mv3d["a" /* default */].is1stPerson() && dir){
		let yaw = mv3d["a" /* default */].dirToYaw(dir);

		mv3d["a" /* default */].blendCameraYaw.setValue(yaw,0.25);
	}
	return dir;
}






// CONCATENATED MODULE: ./src/input_directions.js




Object.assign(mv3d["a" /* default */],{
	
	playerFaceYaw(){
		let dir = this.yawToDir(mv3d["a" /* default */].blendCameraYaw.targetValue(),true);
		$gamePlayer.mv3d_setDirection(dir);
	},

	yawToDir(yaw=mv3d["a" /* default */].blendCameraYaw.targetValue(),dir8=mv3d["a" /* default */].DIR8){
		const divisor = dir8?45:90;
		yaw=Math.round(yaw/divisor)*divisor;
		while(yaw<0){yaw+=360;} while(yaw>=360){yaw-=360;}
		switch(yaw){
			case 0: return 8;
			case 45: return 7;
			case 90: return 4;
			case 135: return 1;
			case 180: return 2;
			case 225: return 3;
			case 270: return 6;
			case 315: return 9;
			default: return 0;
		}
	},

	dirToYaw(dir){
		switch(dir){
			case 3: return -135;
			case 6: return -90;
			case 9: return -45;
			case 8: return 0;
			case 7: return 45;
			case 4: return 90;
			case 1: return 135;
			case 2: return 180;
			default: return NaN;
		}
	},
	
	transformDirection(dir,yaw=this.blendCameraYaw.currentValue(),dir8=mv3d["a" /* default */].DIR8MOVE){
		return mv3d["a" /* default */].yawToDir(mv3d["a" /* default */].dirToYaw(dir)+yaw,dir8);
	},

	transformFacing(dir,yaw=this.blendCameraYaw.currentValue(),dir8=false){
		return mv3d["a" /* default */].yawToDir(mv3d["a" /* default */].dirToYaw(dir)-yaw,dir8);
	},

	updateDirection(){
		if ( mv3d["a" /* default */].is1stPerson() ) {
			mv3d["a" /* default */].playerFaceYaw();
		}
	},
});

let _oldDir=0;
Object(util["r" /* override */])(Game_Player.prototype,'update',o=>function update(){
	o.apply(this,arguments);
	if(this._direction!==_oldDir){
		mv3d["a" /* default */].updateDirection();
		_oldDir=this._direction;
	}
});

Object(util["r" /* override */])(Game_Player.prototype,'moveStraight',o=>function moveStraight(){
	o.apply(this,arguments);
	mv3d["a" /* default */].updateDirection();
});

Object(util["r" /* override */])(Game_Player.prototype,'direction',o=>function direction(){
	if(mv3d["a" /* default */].is1stPerson() && this.isMoving() && !this.isDirectionFixed()){
		return mv3d["a" /* default */].yawToDir(mv3d["a" /* default */].blendCameraYaw.targetValue(),false);
	}else{
		return o.apply(this,arguments);
	}
});


const _setDirection=Game_CharacterBase.prototype.setDirection;
Game_CharacterBase.prototype.setDirection=function(){
	_setDirection.apply(this,arguments);
	this._mv3d_direction=this._direction;
};
Game_CharacterBase.prototype.mv3d_setDirection=function(d){
	if( this.isDirectionFixed() ){ return; }
	this._direction=mv3d["a" /* default */].yawToDir(mv3d["a" /* default */].dirToYaw(d),false);
	if(mv3d["a" /* default */].DIR8MOVE){
		this._mv3d_direction=d;
	}else{
		this._mv3d_direction=this._direction;
	}
};
Game_CharacterBase.prototype.mv3d_direction=function(){
	return this._mv3d_direction||this.direction();
};

Object(util["r" /* override */])(Game_CharacterBase.prototype,'copyPosition',o=>function(character) {
	o.apply(this,arguments);
	this._mv3d_direction = character._mv3d_direction;
});

Object(util["r" /* override */])(Game_Player.prototype,'processMoveCommand',o=>function processMoveCommand(command){
	o.apply(this,arguments);
	const  gc = Game_Character;
	switch(command.code){
		case gc.ROUTE_TURN_DOWN:
		case gc.ROUTE_TURN_LEFT:
		case gc.ROUTE_TURN_RIGHT:
		case gc.ROUTE_TURN_UP:
		case gc.ROUTE_TURN_90D_R:
		case gc.ROUTE_TURN_90D_L:
		case gc.ROUTE_TURN_180D:
		case gc.ROUTE_TURN_90D_R_L:
		case gc.ROUTE_TURN_RANDOM:
		case gc.ROUTE_TURN_TOWARD:
		case gc.ROUTE_TURN_AWAY:
			let yaw = mv3d["a" /* default */].dirToYaw(this._direction);
			mv3d["a" /* default */].blendCameraYaw.setValue(yaw,0.25);
	}
},()=>!mv3d["a" /* default */].isDisabled()&&mv3d["a" /* default */].is1stPerson());


// CONCATENATED MODULE: ./src/configuration.js





class ConfigurationFunction{
	constructor(parameters,func){
		this.groups = parameters.match(/\[?[^[\]|]+\]?/g);
		this.labels={};
		for(let i=0;i<this.groups.length;++i){
			while(this.groups[i]&&this.groups[i][0]==='['){
				this.labels[this.groups[i].slice(1,-1)]=i;
				this.groups.splice(i,1);
			}
			if( i > this.groups.length ){ break; }
			this.groups[i]=this.groups[i].split(',').map(s=>s.trim());
		}
		this.func=func;
	}
	run(conf,rawparams){
		const r=/([,|]+)? *(?:(\w+) *: *)?([^,|\r\n]+)/g
		let match;
		let i=0;
		let gi=0;
		const params={};
		for(let _gi=0;_gi<this.groups.length;++_gi){
			params[`group${_gi+1}`]=[];
		}
		while(match=r.exec(rawparams)){
			if(match[1])for(const delimiter of match[1]){
				if(delimiter===','){ ++i; }
				if(delimiter==='|'||i>=this.groups[gi].length){
					i=0; ++gi;
				}
			}
			if(match[2]){
				if(match[2] in this.labels){
					gi=this.labels[match[2]];
				}else{
					let foundMatch=false;
					grouploop:for(let _gi=0;_gi<this.groups.length;++_gi) for(let _i=0;_i<this.groups[_gi].length;++_i){
						if(this.groups[_gi][_i]===match[2]){
							foundMatch=true;
							gi=_gi; i=_i;
							break grouploop;
						}
					}
					if(!foundMatch){ break; }
				}
			}
			if(gi>this.groups.length){ break; }
			params[this.groups[gi][i]]=params[`group${gi+1}`][i]=match[3].trim();
		}
		this.func(conf,params);
	}
}
mv3d["a" /* default */].ConfigurationFunction=ConfigurationFunction;

function TextureConfigurator(name,extraParams='',apply){
	const paramlist = `img,x,y,w,h|${extraParams}|alpha|glow[anim]animx,animy`;
	return new ConfigurationFunction(paramlist,function(conf,params){
		if(params.group1.length===5){
			const [img,x,y,w,h] = params.group1;
			conf[`${name}_id`] = mv3d["a" /* default */].constructTileId(img,1,0);
			conf[`${name}_rect`] = new PIXI.Rectangle(x,y,w,h);
		}else if(params.group1.length===3){
			const [img,x,y] = params.group1;
			conf[`${name}_id`] = mv3d["a" /* default */].constructTileId(img,x,y);
		}else if(params.group1.length===2){
			const [x,y] = params.group1;
			conf[`${name}_offset`] = new mod_babylon["y" /* Vector2 */](Number(x),Number(y));
		}
		if(params.animx&&params.animy){
			conf[`${name}_animData`]={ animX:Number(params.animx), animY:Number(params.animy) };
		}
		if(params.alpha){
			conf[`${name}_alpha`]=Number(params.alpha);
		}
		if(params.glow){
			if(isNaN(params.glow)){
				conf[`${name}_glow`] = Object(util["o" /* makeColor */])(params.glow);
			}else{
				conf[`${name}_glow`] = new mod_babylon["c" /* Color4 */](Number(params.glow),Number(params.glow),Number(params.glow),1);
			}
		}
		if(apply){
			apply.call(this,conf,params);
		}
	});
}

Object.assign(mv3d["a" /* default */],{
	tilesetConfigurations:{},
	loadTilesetSettings(){
		//tileset
		this.tilesetConfigurations={};
		const lines = this.readConfigurationBlocks($gameMap.tileset().note)
		+'\n'+this.readConfigurationBlocks(this.getDataMap().note,'mv3d-tiles');
		//const readLines = /^\s*([abcde]\d?\s*,\s*\d+\s*,\s*\d+)\s*:(.*)$/gmi;
		const readLines = /^\s*([abcde]\d?)\s*,\s*(\d+(?:-\d+)?)\s*,\s*(\d+(?:-\d+)?)\s*:(.*)$/gmi;
		let match;
		while(match = readLines.exec(lines)){
			const conf = this.readConfigurationFunctions(match[4],this.tilesetConfigurationFunctions);
			const range1 = match[2].split('-').map(s=>Number(s));
			const range2 = match[3].split('-').map(s=>Number(s));
			for(let kx=range1[0];kx<=range1[range1.length-1];++kx)
			for(let ky=range2[0];ky<=range2[range2.length-1];++ky){
				const key = `${match[1]},${kx},${ky}`;
				const tileId=this.constructTileId(...key.split(','));
				if(!(tileId in this.tilesetConfigurations)){
					this.tilesetConfigurations[tileId]={};
				}
				Object.assign(this.tilesetConfigurations[tileId],conf);
			}

		}
	},
	mapConfigurations:{},
	loadMapSettings(){
		const dataMap = this.getDataMap();
		//map
		const mapconf=this.mapConfigurations={};
		this.readConfigurationFunctions(
			this.readConfigurationBlocks(dataMap.note),
			this.mapConfigurationFunctions,
			mapconf,
		);
		this._REGION_DATA_MAP={};
		const regionBlocks=this.readConfigurationBlocks(dataMap.note,'mv3d-regions');
		if(regionBlocks){
			const readLines = /^\s*(\d+)\s*:(.*)$/gm;
			let match;
			while(match = readLines.exec(regionBlocks)){
				if(!(match[1] in this._REGION_DATA_MAP)){
					if(match[1] in this._REGION_DATA){
						this._REGION_DATA_MAP[match[1]]=JSON.parse(JSON.stringify(this._REGION_DATA[match[1]]));
					}else{
						this._REGION_DATA_MAP[match[1]]={};
					}
				}
				this.readConfigurationFunctions(
					match[2],
					mv3d["a" /* default */].tilesetConfigurationFunctions,
					this._REGION_DATA_MAP[match[1]],
				);
			}
		}
	},
	applyMapSettings(){
		const mapconf = this.mapConfigurations;
		if('fog' in mapconf){
			const fog = mapconf.fog;
			if('color' in fog){ this.blendFogColor.setValue(fog.color,0); }
			if('near' in fog){ this.blendFogNear.setValue(fog.near,0); }
			if('far' in fog){ this.blendFogFar.setValue(fog.far,0); }
			this.blendFogColor.update();
		}
		if('light' in mapconf){
			this.blendAmbientColor.setValue(mapconf.light.color,0);
			//this.blendLightIntensity.setValue(mapconf.light.intensity,0);
		}
		if('cameraDist' in mapconf){
			this.blendCameraDist.setValue(mapconf.cameraDist,0);
		}
		if ('cameraHeight' in mapconf){
			this.blendCameraHeight.setValue(mapconf.cameraHeight,0);
		}
		if('cameraMode' in mapconf){
			this.cameraMode=mapconf.cameraMode;
		}
		if('cameraPitch' in mapconf){
			this.blendCameraPitch.setValue(mapconf.cameraPitch,0);
		}
		if('cameraYaw' in mapconf){
			this.blendCameraYaw.setValue(mapconf.cameraYaw,0);
		}

		this.callFeatures('applyMapSettings',mapconf);
	},

	beforeMapLoad(newmap){
		if(newmap){
			if($gameVariables.mv3d){ delete $gameVariables.mv3d.disabled; }
			delete $gamePlayer._mv3d_z;
		}
		this.callFeatures('beforeMapLoad',newmap);
	},

	afterMapLoad(newmap){
		blenders_Blender.reset();

		mv3d["a" /* default */].updateClearColor();

		this.callFeatures('afterMapLoad',newmap);
	},
    

	getMapConfig(key,dfault){
		if(key in this.mapConfigurations){
			return this.mapConfigurations[key];
		}
		return dfault;
	},

	getCeilingConfig(){
		let conf={};
		for (const key in this.mapConfigurations){
			if(key.startsWith('ceiling_')){
				conf[key.replace('ceiling_','bottom_')]=this.mapConfigurations[key];
			}
		}
		conf.bottom_id = this.getMapConfig('ceiling_id',0);
		conf.height = this.getMapConfig('ceiling_height',this.CEILING_HEIGHT);
		conf.skylight = this.getMapConfig('ceiling_skylight',true);
		conf.backfaceCulling = true;
		conf.isCeiling = true;
		return conf;
	},

	readConfigurationBlocksAndTags(note,tag='mv3d'){
		return this.readConfigurationBlocks(note,tag)+this.readConfigurationTags(note,tag);
	},

	readConfigurationBlocks(note,tag='mv3d'){
		const findBlocks = new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`,'gi');
		let contents = '';
		let match;
		while(match = findBlocks.exec(note)){
			contents += match[1]+'\n';
		}
		return contents;
	},

	readConfigurationTags(note,tag='mv3d'){
		const findTags = new RegExp(`<${tag}:([\\s\\S]*?)>`,'gi');
		let contents='';
		let match;
		while(match = findTags.exec(note)){
			contents+=match[1]+'\n';
		}
		return contents;
	},

	readConfigurationFunctions(line,functionset=mv3d["a" /* default */].tilesetConfigurationFunctions,conf={}){
		const readConfigurations = /(\w+)\((.*?)\)/g
		let match;
		while(match = readConfigurations.exec(line)){
			const key = match[1].toLowerCase();
			if(key in functionset){
				//functionset[key](conf, ...match[2].split('|').map(s=>s?s.split(','):[]) );
				if(functionset[key] instanceof ConfigurationFunction){
					functionset[key].run(conf,match[2]);
				}else{
					const args = match[2].split(',');
					if(args.length===1 && args[0]===''){ args.length=0; }
					functionset[key](conf, ...args);
				}
			}
		}
		return conf;
	},
	get configurationSides(){ return this.enumSides; },
	get configurationShapes(){ return this.enumShapes; },
	get configurationPassage(){ return this.enumPassage; },
	enumSides:{
		front:mod_babylon["g" /* FRONTSIDE */],
		back:mod_babylon["a" /* BACKSIDE */],
		double:mod_babylon["d" /* DOUBLESIDE */],
	},
	enumShapes:{
		FLAT:1,
		TREE:2,
		SPRITE:3,
		FENCE:4,
		WALL:4,
		CROSS:5,
		XCROSS:6,
		SLOPE:7,
	},
	enumPassage:{
		WALL:0,
		FLOOR:1,
		THROUGH:2,
	},
	enumRenderGroups:{
		BACK:0,
		MAIN:1,
		FRONT:2,
	},
    

	tilesetConfigurationFunctions:{
		height(conf,n){ conf.height=Number(n); },
		depth(conf,n){ conf.depth=Number(n); },
		fringe(conf,n){ conf.fringe=Number(n); },
		float(conf,n){ conf.float=Number(n); },
		slope(conf,n=1,d=null){
			conf.shape=mv3d["a" /* default */].enumShapes.SLOPE;
			conf.slopeHeight=Number(n);
			if(d){ conf.slopeDirection=({n:2, s:8, e:4, w:6})[d.toLowerCase()[0]]; }
		},
		top:TextureConfigurator('top'),
		side:TextureConfigurator('side'),
		inside:TextureConfigurator('inside'),
		bottom:TextureConfigurator('bottom'),
		texture:Object.assign(TextureConfigurator('hybrid'),{
			func(conf,params){
				mv3d["a" /* default */].tilesetConfigurationFunctions.top.func(conf,params);
				mv3d["a" /* default */].tilesetConfigurationFunctions.side.func(conf,params);
			}
		}),
		shape(conf,name,data){
			conf.shape=mv3d["a" /* default */].enumShapes[name.toUpperCase()];
			if(conf.shape===mv3d["a" /* default */].enumShapes.SLOPE && data||!('slopeHeight' in conf)){ conf.slopeHeight=Number(data)||1; }
			if(data){
				if(conf.shape===mv3d["a" /* default */].enumShapes.FENCE){ conf.fencePosts=Object(util["g" /* booleanString */])(data); }
			}
		},
		alpha(conf,n){
			conf.transparent=true;
			conf.alpha=Number(n);
		},
		glow(conf,n,a=1){
			if(isNaN(n)){
				conf.glow = Object(util["o" /* makeColor */])(n);
			}else{
				conf.glow = new mod_babylon["c" /* Color4 */](Number(n),Number(n),Number(n),1);
			}
			conf.glow.a=Object(util["f" /* booleanNumber */])(a);
		},
		pass(conf,s=''){
			s=Object(util["m" /* falseString */])(s.toLowerCase());
			if(!s || s[0]==='x'){
				conf.pass=mv3d["a" /* default */].enumPassage.WALL;
			}else if(s[0]==='o'){
				conf.pass=mv3d["a" /* default */].enumPassage.FLOOR;
			}else{
				conf.pass=mv3d["a" /* default */].enumPassage.THROUGH;
			}
		},
		shadow(conf,b=true){
			conf.shadow=Object(util["g" /* booleanString */])(b);
		},
	},
	eventConfigurationFunctions:{
		height(conf,n){
			const height = Number(n);
			if(height<0){
				conf.zoff=height;
			}else{
				conf.height=height;
			}
			console.warn('event config height() is deprecated. Use elevation(), offset(), or zoff() instead.');
		},
		elevation(conf,n){ conf.height=Number(n); },
		z(conf,n){ conf.zlock=Number(n); },
		x(conf,n){ conf.xoff=Number(n); console.warn('event config x() is deprecated. Use offset() or xoff() instead.'); },
		y(conf,n){ conf.yoff=Number(n); console.warn('event config y() is deprecated. Use offset() or yoff() instead.'); },
		xoff(conf,n){ conf.xoff=Number(n); },
		yoff(conf,n){ conf.yoff=Number(n); },
		zoff(conf,n){ conf.zoff=Number(n); },
		offset:new ConfigurationFunction('x,y,z',function(conf,params){
			if(params.x)conf.xoff=Number(params.x);
			if(params.y)conf.yoff=Number(params.y);
			if(params.z)conf.zoff=Number(params.z);
		}),
		pos:new ConfigurationFunction('x,y',function(conf,params){
			if(!conf.pos){conf.pos={};}
			if(params.x){ conf.pos.x=params.x; }
			if(params.y){ conf.pos.y=params.y; }
		}),
		scale(conf,x,y=x){ conf.scale = new mod_babylon["y" /* Vector2 */](Number(x),Number(y)); },
		rot(conf,n){ conf.rot=Number(n); },
		yaw(conf,n){ conf.yaw=Number(n); },
		pitch(conf,n){ conf.pitch=Number(n); },
		bush(conf,bool){ conf.bush = Object(util["g" /* booleanString */])(bool); },
		shadow:new ConfigurationFunction('size,dist|3d',function(conf,params){
			let {size,dist,'3d':dyn} = params;
			if(dyn==null){ dyn=size!=null?size:true; }
			conf.dynShadow = dyn = Object(util["g" /* booleanString */])(dyn);
			if(size!=null){ conf.shadow = Object(util["f" /* booleanNumber */])(size); }
			if(dist!=null){ conf.shadowDist=Number(dist); }
		}),
		shape(conf,name){
			conf.shape=mv3d["a" /* default */].enumShapes[name.toUpperCase()];
		},
		lamp:new ConfigurationFunction('color,intensity,range',function(conf,params){
			const {color='white',intensity=1,range=mv3d["a" /* default */].LIGHT_DIST} = params;
			conf.lamp={color:Object(util["o" /* makeColor */])(color).toNumber(),intensity:Number(intensity),distance:Number(range)};
		}),
		flashlight:new ConfigurationFunction('color,intensity,range,angle[dir]yaw,pitch',function(conf,params){
			const {color='white',intensity=1,range=mv3d["a" /* default */].LIGHT_DIST,angle=mv3d["a" /* default */].LIGHT_ANGLE} = params;
			conf.flashlight={color:Object(util["o" /* makeColor */])(color).toNumber(),intensity:Number(intensity),distance:Number(range),angle:Number(angle)};
			if(params.yaw){ conf.flashlightYaw=params.yaw; }
			if(params.pitch){ conf.flashlightPitch=Number(params.pitch); }
		}),
		flashlightpitch(conf,deg='90'){ conf.flashlightPitch=Number(deg); },
		flashlightyaw(conf,deg='+0'){ conf.flashlightYaw=deg; },
		lightheight(conf,n=1){ this.lampheight(conf,n); this.flashlightheight(conf,n); },
		lightoffset(conf,x=0,y=0){ this.lampoffset(conf,x,y); this.flashlightoffset(conf,x,y); },
		lampheight(conf,n=1){ conf.lampHeight = Number(n); },
		lampoffset(conf,x=0,y=0){ conf.lampOffset = {x:+x,y:+y}; },
		flashlightheight(conf,n=1){ conf.flashlightHeight = Number(n); },
		flashlightoffset(conf,x=0,y=0){ conf.flashlightOffset = {x:+x,y:+y}; },
		alpha(conf,n){
			conf.alpha=Number(n);
		},
		glow(conf,n,a=1){
			if(isNaN(n)){
				conf.glow = Object(util["o" /* makeColor */])(n);
			}else{
				conf.glow = new mod_babylon["c" /* Color4 */](Number(n),Number(n),Number(n),1);
			}
			conf.glow.a=Object(util["f" /* booleanNumber */])(a);
		},
		dirfix(conf,b){
			conf.dirfix=Object(util["g" /* booleanString */])(b);
		},
		gravity(conf,b){
			conf.gravity=Object(util["f" /* booleanNumber */])(b);
		},
		platform(conf,b){
			conf.platform=Object(util["g" /* booleanString */])(b);
		},
		collide(conf,n){ conf.collide=Object(util["f" /* booleanNumber */])(n); },
		trigger(conf,up,down=0){
			conf.trigger={
				up:Number(up),
				down:Number(down),
			}
		},
		pass(conf,s=''){
			s=Object(util["m" /* falseString */])(s.toLowerCase());
			if(!s || s[0]==='x'){
				conf.platform=false;
				conf.collide=true;
			}else if(s[0]==='o'){
				conf.platform=true;
			}else{
				conf.platform=false;
				conf.collide=false;
			}
		},
	},
	mapConfigurationFunctions:{
		get ambient(){ return this.light; },
		light(conf,color){
			if(color.toLowerCase()==='default'){ color=mv3d["a" /* default */].AMBIENT_COLOR; }
			else{ color=Object(util["o" /* makeColor */])(color).toNumber(); }
			conf.light={color:color};
		},
		fog:new ConfigurationFunction('color|near,far',function(conf,params){
			const {color,near,far} = params;
			if(!conf.fog){ conf.fog={}; }
			if(color){ conf.fog.color=Object(util["o" /* makeColor */])(color).toNumber(); }
			if(near){ conf.fog.near=Number(near); }
			if(far){ conf.fog.far=Number(far); }
		}),
		camera:new ConfigurationFunction('yaw,pitch|dist|height|mode',function(conf,params){
			const {yaw,pitch,dist,height,mode}=params;
			if(yaw){ conf.cameraYaw=Number(yaw); }
			if(pitch){ conf.cameraPitch=Number(pitch) }
			if(dist){ conf.cameraDist=Number(dist); }
			if(height){ conf.cameraHeight=Number(height); }
			if(mode){ conf.cameraMode=mode; }
		}),
		ceiling:TextureConfigurator('ceiling','height,backface',function(conf,params){
			if(params.height){
				conf[`ceiling_height`]=Number(params.height);
			}
			if(params.backface){
				conf[`ceiling_skylight`]=!Object(util["g" /* booleanString */])(params.backface);
			}
		}),
		edge(conf,b,data){
			b=b.toLowerCase();
			switch(b){
				case 'clamp':
					conf.edgeData=data==null?1:Number(data);
					conf.edge=b;
					break;
				default:
					conf.edge=Object(util["g" /* booleanString */])(b);
			}
		},
		disable(conf,b=true){
			conf.disabled=Object(util["g" /* booleanString */])(b);
		},
		enable(conf,b=true){
			conf.disabled=!Object(util["g" /* booleanString */])(b);
		},
	},

});

// event config
const _event_setupPage = Game_Event.prototype.setupPage;
Game_Event.prototype.setupPage = function() {
	_event_setupPage.apply(this,arguments);
	if(this.mv3d_sprite){
		this.mv3d_needsConfigure=true;
		this.mv3d_sprite.eventConfigure();
	}
};

const _event_init = Game_Event.prototype.initialize;
Game_Event.prototype.initialize = async function() {
	_event_init.apply(this,arguments);
	const event = this.event();
	let config = {};
	mv3d["a" /* default */].readConfigurationFunctions(
		mv3d["a" /* default */].readConfigurationTags(event.note),
		mv3d["a" /* default */].eventConfigurationFunctions,
		config,
	);
	if('pos' in config){
		this.locate(
			Object(util["u" /* relativeNumber */])(event.x,config.pos.x),
			Object(util["u" /* relativeNumber */])(event.y,config.pos.y),
		);
	}
	if(!this.mv3d_blenders){
		this.mv3d_blenders={};
	}
	if('lamp' in config){
		this.mv3d_blenders.lampColor_r=config.lamp.color>>16;
		this.mv3d_blenders.lampColor_g=config.lamp.color>>8&0xff;
		this.mv3d_blenders.lampColor_b=config.lamp.color&0xff;
		this.mv3d_blenders.lampIntensity=config.lamp.intensity;
		this.mv3d_blenders.lampDistance=config.lamp.distance
	}
	if('flashlight' in config){
		this.mv3d_blenders.flashlightColor_r=config.flashlight.color>>16;
		this.mv3d_blenders.flashlightColor_g=config.flashlight.color>>8&0xff;
		this.mv3d_blenders.flashlightColor_b=config.flashlight.color&0xff;
		this.mv3d_blenders.flashlightIntensity=config.flashlight.intensity;
		this.mv3d_blenders.flashlightDistance=config.flashlight.distance;
		this.mv3d_blenders.flashlightAngle=config.flashlight.angle;
	}
	if('flashlightPitch' in config){
		this.mv3d_blenders.flashlightPitch=Number(config.flashlightPitch);
	}
	if('flashlightYaw' in config){
		this.mv3d_blenders.flashlightYaw=config.flashlightYaw;
	}
	this.mv3d_needsConfigure=true;

	await Object(util["w" /* sleep */])();
	if(mv3d["a" /* default */].mapLoaded){
		mv3d["a" /* default */].createCharacterFor(this);
	}
};
// CONCATENATED MODULE: ./src/plugin_commands.js



const _pluginCommand = Game_Interpreter.prototype.pluginCommand;
Game_Interpreter.prototype.pluginCommand = function(command, args) {
	if(command.toLowerCase() !== 'mv3d'){
		return _pluginCommand.apply(this,arguments);
	}
	const pc = new mv3d["a" /* default */].PluginCommand();
	pc.INTERPRETER=this;
	pc.FULL_COMMAND=[command,...args].join(' ');
	args=args.filter(v=>v);
	pc.CHAR=$gameMap.event(this._eventId);
	if(args[0]){
		const firstChar = args[0][0];
		if(firstChar==='@'||firstChar==='＠'){
			pc.CHAR = pc.TARGET_CHAR(args.shift());
		}
	}

	const com = args.shift().toLowerCase();
	if(com in pc){
		pc[com](...args);
	}
};

mv3d["a" /* default */].PluginCommand=class{
	async animation(id,...a){
		const char = (await this.AWAIT_CHAR(this.CHAR)).char;
		char.requestAnimation(id);
		if(mv3d["a" /* default */].isDisabled()){ return; }
		let depth=true, scale=1;
		for(let i=0;i<a.length;++i){
			switch(a[i].toLowerCase()){
				case 'depth': if(a[i+1]!=null)depth=Object(util["g" /* booleanString */])(a[i+1]); break;
				case 'scale': if(a[i+1]!=null)scale=Number(a[i+1]); break;
			}
		}
		char._mv3d_animationSettings={depth,scale};
	}
	resolution(...a){
		let i=0;
		if(a[i].toLowerCase()==='scale'){ ++i; }
		let time=this._TIME(a[2]);
		this._RELATIVE_BLEND(mv3d["a" /* default */].blendResolutionScale,a[1],time);
	}
	camera(...a){
		let time=this._TIME(a[2]);
		switch(a[0].toLowerCase()){
			case 'pitch'    : this.pitch (a[1],time); return;
			case 'yaw'      : this.yaw   (a[1],time); return;
			case 'roll'     : this.roll  (a[1],time); return;
			case 'dist'     :
			case 'distance' : this.dist  (a[1],time); return;
			case 'zoom'     : this.zoom  (a[1],time); return;
			case 'height'   : this.height(a[1],time); return;
			case 'mode'     : this.cameramode(a[1]); return;
			case 'target'   : this._cameraTarget(a[1],time); return;
			case 'pan'      : this.pan(a[1],a[2],a[3]); return;
		}
	}
	yaw(deg,time=1){
		this._RELATIVE_BLEND(mv3d["a" /* default */].blendCameraYaw,deg,time);
		if ( mv3d["a" /* default */].is1stPerson() ) { mv3d["a" /* default */].playerFaceYaw(); }
	}
	pitch(deg,time=1){ this._RELATIVE_BLEND(mv3d["a" /* default */].blendCameraPitch,deg,time); }
	roll(deg,time=1){ this._RELATIVE_BLEND(mv3d["a" /* default */].blendCameraRoll,deg,time); }
	dist(n,time=1){ this._RELATIVE_BLEND(mv3d["a" /* default */].blendCameraDist,n,time); }
	zoom(n,time=1){ this._RELATIVE_BLEND(mv3d["a" /* default */].blendCameraZoom,n,time); }
	height(n,time=1){ this._RELATIVE_BLEND(mv3d["a" /* default */].blendCameraHeight,n,time); }
	_cameraTarget(target,time){
		mv3d["a" /* default */].setCameraTarget(this.TARGET_CHAR(target), time);
	}
	pan(x,y,time=1){
		console.log(x,y,time);
		time=this._TIME(time);
		this._RELATIVE_BLEND(mv3d["a" /* default */].blendPanX,x,time);
		this._RELATIVE_BLEND(mv3d["a" /* default */].blendPanY,y,time);
	}

	get rotationmode(){ return this.allowrotation; }
	get pitchmode(){ return this.allowpitch; }

	allowrotation(b){ mv3d["a" /* default */].saveData('allowRotation',Object(util["g" /* booleanString */])(b)); }
	allowpitch(b){ mv3d["a" /* default */].saveData('allowPitch',Object(util["g" /* booleanString */])(b)); }
	lockcamera(b){ mv3d["a" /* default */].saveData('cameraLocked',Object(util["g" /* booleanString */])(b)); }

	_VEHICLE(vehicle,data,value){
		data=data.toLowerCase();
		const key = `${Vehicle}_${data}`;
		if(data==='big'){ value=Object(util["g" /* booleanString */])(value); }
		else{ value=Object(util["u" /* relativeNumber */])(mv3d["a" /* default */].loadData(key,0),value); }
		mv3d["a" /* default */].saveData(key,value);
	}
	boat(d,v){ this._VEHICLE('boat',d,v); }
	ship(d,v){ this._VEHICLE('ship',d,v); }
	airship(d,v){ this._VEHICLE('airship',d,v); }
	cameramode(mode){ mv3d["a" /* default */].cameraMode=mode; }
	fog(...a){
		var time=this._TIME(a[2]);
		switch(a[0].toLowerCase()){
			case 'color': this._fogColor(a[1],time); return;
			case 'near': this._fogNear(a[1],time); return;
			case 'far': this._fogFar(a[1],time); return;
			case 'dist': case 'distance':
				time=this._TIME(a[3]);
				this._fogNear(a[1],time);
				this._fogFar(a[2],time);
				return;
		}
		time=this._TIME(a[3]);
		this._fogColor(a[0],time);
		this._fogNear(a[1],time);
		this._fogFar(a[2],time);
	}
	_fogColor(color,time){ mv3d["a" /* default */].blendFogColor.setValue(Object(util["o" /* makeColor */])(color).toNumber(),time); }
	_fogNear(n,time){ this._RELATIVE_BLEND(mv3d["a" /* default */].blendFogNear,n,time); }
	_fogFar(n,time){ this._RELATIVE_BLEND(mv3d["a" /* default */].blendFogFar,n,time); }
	get ambient(){ return this.light; }
	light(...a){
		var time=this._TIME(a[2]);
		switch(a[0].toLowerCase()){
			case 'color'    : this._lightColor    (a[1],time); return;
			//case 'intensity': this._lightIntensity(a[1],time); return;
		}
		time=this._TIME(a[1]);
		this._lightColor(a[0],time);
		//this._lightintensity(a[0],time);
	}
	_lightColor(color,time=1){ mv3d["a" /* default */].blendAmbientColor.setValue(Object(util["o" /* makeColor */])(color).toNumber(),time); }
	//_lightIntensity(n,time=1){ this._RELATIVE_BLEND(mv3d.blendLightIntensity,n,time); }
	async lamp(...a){
		const char = await this.AWAIT_CHAR(this.CHAR);
		char.setupLamp();
		var time=this._TIME(a[2]);
		switch(a[0].toLowerCase()){
			case 'color'    : this._lampColor    (char,a[1],time); return;
			case 'intensity': this._lampIntensity(char,a[1],time); return;
			case 'dist'     :
			case 'distance' : this._lampDistance (char,a[1],time); return;
		}
		time=this._TIME(a[3]);
		this._lampColor(char,a[0],time);
		this._lampIntensity(char,a[1],time);
		this._lampDistance(char,a[2],time);
	}
	_lampColor(char,color,time=1){ char.blendLampColor.setValue(Object(util["o" /* makeColor */])(color).toNumber(),time); }
	_lampIntensity(char,n,time=1){ this._RELATIVE_BLEND(char.blendLampIntensity,n,time); }
	_lampDistance(char,n,time=1){ this._RELATIVE_BLEND(char.blendLampDistance,n,time); }
	async flashlight(...a){
		const char = await this.AWAIT_CHAR(this.CHAR);
		char.setupFlashlight();
		var time=this._TIME(a[2]);
		switch(a[0].toLowerCase()){
			case 'color'    : this._flashlightColor    (char,a[1],time); return;
			case 'intensity': this._flashlightIntensity(char,a[1],time); return;
			case 'dist'     :
			case 'distance' : this._flashlightDistance (char,a[1],time); return;
			case 'angle'    : this._flashlightAngle    (char,a[1],time); return;
			case 'yaw'      : this._flashlightYaw      (char,a[1]); return;
			case 'pitch'    : this._flashlightPitch    (char,a[1],time); return;
		}
		time=this._TIME(a[4]);
		this._flashlightColor(char,a[0],time);
		this._flashlightIntensity(char,a[1],time);
		this._flashlightDistance(char,a[2],time);
		this._flashlightAngle(char,a[3],time);
	}
	_flashlightColor(char,color,time){ char.blendFlashlightColor.setValue(Object(util["o" /* makeColor */])(color).toNumber(),time); }
	_flashlightIntensity(char,n,time){ this._RELATIVE_BLEND(char.blendFlashlightIntensity,n,time); }
	_flashlightDistance(char,n,time){ this._RELATIVE_BLEND(char.blendFlashlightDistance,n,time); }
	_flashlightAngle(char,n,time){ this._RELATIVE_BLEND(char.blendFlashlightAngle,n,time); }
	_flashlightPitch(char,n,time){ this._RELATIVE_BLEND(char.blendFlashlightPitch,n,time); }
	_flashlightYaw(char,yaw){ this.configure(`flashlightYaw(${yaw})`); }
	async elevation(...a){
		const char = await this.AWAIT_CHAR(this.CHAR);
		let time=this._TIME(a[1]);
		this._RELATIVE_BLEND(char.blendElevation,a[0],time);
	}
	async configure(...a){
		const char = await this.AWAIT_CHAR(this.CHAR);
		mv3d["a" /* default */].readConfigurationFunctions(
			a.join(' '),
			mv3d["a" /* default */].eventConfigurationFunctions,
			char.settings,
		);
		char.pageConfigure(char.settings);
	}
	set(key,...a){
		key=key.toLowerCase();
		const value=a.join(' ');
		if(key in mv3d["a" /* default */].attributes){
			mv3d["a" /* default */].attributes[key]=value;
		}
	}
	disable(fadeType){ mv3d["a" /* default */].disable(fadeType); }
	enable(fadeType){ mv3d["a" /* default */].enable(fadeType); }
	_RELATIVE_BLEND(blender,n,time){ blender.setValue(Object(util["u" /* relativeNumber */])(blender.targetValue(),n),Number(time)); }
	_TIME(time){
		if(typeof time==='number'){ return time; }
		time=Number(time);
		if(Number.isNaN(time)){ return 1; }
		return time;
	}
	ERROR_CHAR(){
		console.warn(`MV3D: Plugin command \`${this.FULL_COMMAND}\` failed because target character was invalid.`);
		//console.log(this.CHAR);
	}
	async AWAIT_CHAR(char){
		if(!char){ return this.ERROR_CHAR(); }
		let w=0;
		while(!char.mv3d_sprite){
			await Object(util["w" /* sleep */])(100);
			if(++w>10){ return this.ERROR_CHAR(); }
		}
		return char.mv3d_sprite;
	}
	TARGET_CHAR(target){
		return mv3d["a" /* default */].targetChar(target,$gameMap.event(this.INTERPRETER._eventId),this.CHAR);
	}
};

mv3d["a" /* default */].targetChar=function(target,self=null,dfault=null){
	if(!target){ return dfault; }
	let m=target.toLowerCase().match(/[a-z]+/);
	const mode=m?m[0]:'e';
	m=target.match(/\d+/);
	const id=m?Number(m[0]):0;
	switch(mode[0]){
		case 's': return self;
		case 'p': return $gamePlayer;
		case 'e':
			if(!id){ return self; }
			return $gameMap.event(id);
		case 'v':
			return $gameMap.vehicle(id);
		case 'f':
			return $gamePlayer.followers()._data[id];
	}
	return char;
}
mv3d["a" /* default */].getTargetString=function(char){
	if( char instanceof Game_Player){
		return `@p`;
	}
	if( char instanceof Game_Event ){
		return `@e${char._eventId}`;
	}
	if( char instanceof Game_Follower){
		return `@f${$gamePlayer._followers._data.indexOf(char)}`;
	}
	if( char instanceof Game_Vehicle){
		return `@v${$gameMap._vehicles.indexOf(char)}`;
	}
}

Game_CharacterBase.prototype.mv3d_requestAnimation = function(id,opts={}) {
	this.requestAnimation(id);
	this._mv3d_animationSettings=opts;
};

Game_Character.prototype.mv3d_configure = function(data){
	mv3d["a" /* default */].readConfigurationFunctions(
		data,
		mv3d["a" /* default */].eventConfigurationFunctions,
		this.mv3d_settings,
	);
	if(this.mv3d_sprite){
		this.mv3d_sprite.pageConfigure(this.mv3d_settings);
	}
};
// CONCATENATED MODULE: ./src/MapCellBuilder.js




class MapCellBuilder_CellMeshBuilder{
	constructor(){
		this.submeshBuilders={};
	}
	build(){
		const submeshBuildersArray=Object.values(this.submeshBuilders);
		if(!submeshBuildersArray.length){ return null; }
		const submeshes = submeshBuildersArray.map(builder=>builder.build());
		const totalVertices = submeshes.reduce((total,mesh)=>{
			if(typeof total!=='number'){ total=total.getTotalVertices(); }
			return total+mesh.getTotalVertices();
		});
		const mesh = mod_babylon["k" /* Mesh */].MergeMeshes(submeshes,true,totalVertices>65536,undefined,false,true);
		return mesh;
	}
	getBuilder(material){
		if(!(material.name in this.submeshBuilders)){
			this.submeshBuilders[material.name] = new MapCellBuilder_SubMeshBuilder(material);
		}
		return this.submeshBuilders[material.name];
	}
	addWallFace(material,tx,ty,tw,th,x,y,z,w,h,rot,options={}){
		const builder = this.getBuilder(material);
		const uvRect = MapCellBuilder_SubMeshBuilder.getUvRect(material.diffuseTexture,tx,ty,tw,th);
		builder.addWallFace(x,y,z,w,h,rot,uvRect,options);
		if(options.double){
			options.flip=!options.flip;
			builder.addWallFace(x,y,z,w,h,rot,uvRect,options);
		}
	}
	addFloorFace(material,tx,ty,tw,th,x,y,z,w,h,options={}){
		const builder = this.getBuilder(material);
		const uvRect = MapCellBuilder_SubMeshBuilder.getUvRect(material.diffuseTexture,tx,ty,tw,th);
		builder.addFloorFace(x,y,z,w,h,uvRect,options);
		if(options.double){
			options.flip=!options.flip;
			builder.addFloorFace(x,y,z,w,h,uvRect,options);
		}
	}
	addSlopeFace(material,tx,ty,tw,th,x,y,z,w,h,rot,options={}){
		const builder = this.getBuilder(material);
		const uvRect = MapCellBuilder_SubMeshBuilder.getUvRect(material.diffuseTexture,tx,ty,tw,th);
		builder.addSlopeFace(x,y,z,w,h,rot,uvRect,options);
		if(options.double){
			options.flip=!options.flip;
			builder.addSlopeFace(x,y,z,w,h,rot,uvRect,options);
		}
	}
	addSlopeSide(material,tx,ty,tw,th,x,y,z,w,h,rot,options={}){
		const builder = this.getBuilder(material);
		const uvRect = MapCellBuilder_SubMeshBuilder.getUvRect(material.diffuseTexture,tx,ty,tw,th);
		builder.addSlopeSide(x,y,z,w,h,rot,uvRect,options);
		if(options.double){
			options.flip=!options.flip;
			builder.addSlopeSide(x,y,z,w,h,rot,uvRect,options);
		}
	}
}

class MapCellBuilder_SubMeshBuilder{
	constructor(material){
		this.material=material;
		this.positions=[];
		this.indices=[];
		this.normals=[];
		this.uvs=[];
	}
	build(){
		const mesh = new mod_babylon["k" /* Mesh */]('cell mesh', mv3d["a" /* default */].scene);
		//VertexData.ComputeNormals(this.positions,this.indices,this.normals);
		const vdata = new mod_babylon["A" /* VertexData */]();
		vdata.positions=this.positions;
		vdata.indices=this.indices;
		vdata.normals=this.normals;
		vdata.uvs=this.uvs;
		vdata.applyToMesh(mesh);
		mesh.material=this.material;
		return mesh;
	}
	addWallFace(x,z,y,w,h,rot,uvr,options){
		z=-z;y=y;
		const xf=Object(util["h" /* cos */])(rot);
		const zf=Object(util["v" /* sin */])(rot);
		const ww=w/2, hh=h/2;
		const positions = [
			x-ww*xf, y+hh, z+ww*zf,
			x+ww*xf, y+hh, z-ww*zf,
			x-ww*xf, y-hh, z+ww*zf,
			x+ww*xf, y-hh, z-ww*zf,
		];
		let normals = [ -zf,0,-xf, -zf,0,-xf, -zf,0,-xf, -zf,0,-xf ];
		const uvs = MapCellBuilder_SubMeshBuilder.getDefaultUvs(uvr);
		const indices=MapCellBuilder_SubMeshBuilder.getDefaultIndices();
		if(options.flip){ MapCellBuilder_SubMeshBuilder.flipFace(indices,normals); }
		if(options.abnormal){ normals=[ 0,1,0, 0,1,0, 0,1,0, 0,1,0]; }
		this.pushNewData(positions,indices,normals,uvs);
	}
	addFloorFace(x,z,y,w,h,uvr,options){
		z=-z;y=y;
		//const f=Boolean(options.flip)*-2+1;
		//const ww=f*w/2, hh=h/2;
		const ww=w/2, hh=h/2;
		const positions = [
			x-ww, y, z+hh,
			x+ww, y, z+hh,
			x-ww, y, z-hh,
			x+ww, y, z-hh,
		];
		//const normals=[ 0,f,0, 0,f,0, 0,f,0, 0,f,0 ];
		const normals=[ 0,1,0, 0,1,0, 0,1,0, 0,1,0 ];
		const uvs = MapCellBuilder_SubMeshBuilder.getDefaultUvs(uvr);
		const indices=MapCellBuilder_SubMeshBuilder.getDefaultIndices();
		if(options.flip){ MapCellBuilder_SubMeshBuilder.flipFace(indices,normals); }
		this.pushNewData(positions,indices,normals,uvs);
	}
	addSlopeFace(x,z,y,w,h,rot,uvr,options){
		z=-z;y=y;
		const xf=Object(util["h" /* cos */])(rot);
		const zf=Object(util["v" /* sin */])(rot);
		const ww=w/2, hh=h/2;
		const positions = options.autotile ? [
			x-ww, y+hh+hh*Math.round(Object(util["v" /* sin */])(-rot+util["a" /* PI */]*1/4)), z+ww,
			x+ww, y+hh+hh*Math.round(Object(util["v" /* sin */])(-rot+util["a" /* PI */]*3/4)), z+ww,
			x-ww, y+hh+hh*Math.round(Object(util["v" /* sin */])(-rot+util["a" /* PI */]*7/4)), z-ww,
			x+ww, y+hh+hh*Math.round(Object(util["v" /* sin */])(-rot+util["a" /* PI */]*5/4)), z-ww,
		] : [
			x-ww*xf+ww*zf, y+h, z+ww*zf+ww*xf,
			x+ww*xf+ww*zf, y+h, z-ww*zf+ww*xf,
			x-ww*xf-ww*zf, y, z+ww*zf-ww*xf,
			x+ww*xf-ww*zf, y, z-ww*zf-ww*xf,
		];
		const hn=Math.pow(2,-h);
		const ihn=1-hn;
		const normals=[ -zf*ihn,hn,-xf*ihn, -zf*ihn,hn,-xf*ihn, -zf*ihn,hn,-xf*ihn, -zf*ihn,hn,-xf*ihn ];
		let uvs = MapCellBuilder_SubMeshBuilder.getDefaultUvs(uvr);
		const indices=MapCellBuilder_SubMeshBuilder.getDefaultIndices();
		if(options.flip){ MapCellBuilder_SubMeshBuilder.flipFace(indices,normals); }
		this.pushNewData(positions,indices,normals,uvs);
	}
	addSlopeSide(x,z,y,w,h,rot,uvr,options){
		z=-z;y=y;
		const xf=Object(util["h" /* cos */])(rot);
		const zf=Object(util["v" /* sin */])(rot);
		const ww=w/2, hh=h/2;
		const positions = [
			x-ww*xf, y+h, z+ww*zf,
			x-ww*xf, y, z+ww*zf,
			x+ww*xf, y, z-ww*zf,
		];
		const normals=[ -zf,0,-xf, -zf,0,-xf, -zf,0,-xf ];
		const uvs = [
			uvr.x1,uvr.y1,
			uvr.x1,uvr.y2,
			uvr.x2,uvr.y2,
		];
		const indices=[0,1,2];
		if(options.flip){ MapCellBuilder_SubMeshBuilder.flipFace(indices,normals); }
		this.pushNewData(positions,indices,normals,uvs);
	}
	pushNewData(positions,indices,normals,uvs){
		this.indices.push(...indices.map(i=>i+this.positions.length/3));
		this.positions.push(...positions);
		this.normals.push(...normals);
		this.uvs.push(...uvs);
	}
	static getUvRect(tsTexture,x,y,w,h){
		const { width, height } = tsTexture.getBaseSize();
		if(mv3d["a" /* default */].EDGE_FIX){ x+=mv3d["a" /* default */].EDGE_FIX;y+=mv3d["a" /* default */].EDGE_FIX;w-=mv3d["a" /* default */].EDGE_FIX*2;h-=mv3d["a" /* default */].EDGE_FIX*2; }
		return {
			x1:x/width,
			y1:(height-y)/height,
			x2:(x+w)/width,
			y2:(height-y-h)/height,
		};
	}
	static getDefaultUvs(uvr){
		return [
			uvr.x1,uvr.y1,
			uvr.x2,uvr.y1,
			uvr.x1,uvr.y2,
			uvr.x2,uvr.y2,
		];
	}
	static getDefaultIndices(){ return [1,0,2,1,2,3]; }
	static flipFace(indices,normals){
		indices.reverse();
		for(let i=0;i<normals.length;++i){ normals[i]*=-1; }
	}
}
// CONCATENATED MODULE: ./src/mapCell.js





const SOURCEPLANE_GROUND = new mod_babylon["p" /* Plane */](0, 1, -Math.pow(0.1,100), 0);
const SOURCEPLANE_WALL = new mod_babylon["p" /* Plane */](0,0,-1,0);

class mapCell_MapCell extends mod_babylon["x" /* TransformNode */]{
	constructor(cx,cy){
		const key = [cx,cy].toString();
		super(`MapCell[${key}]`,mv3d["a" /* default */].scene);
		this.parent=mv3d["a" /* default */].map;
		//mv3d.cells[key]=this;
		this.cx=cx; this.cy=cy;
		this.ox=cx*mv3d["a" /* default */].CELL_SIZE; this.oy=cy*mv3d["a" /* default */].CELL_SIZE;
		this.x=this.ox; this.y=this.oy;
		this.key=key;
		this.characters=[];

		//this.load();
	}
	update(){
		const loopPos = mv3d["a" /* default */].loopCoords((this.cx+0.5)*mv3d["a" /* default */].CELL_SIZE,(this.cy+0.5)*mv3d["a" /* default */].CELL_SIZE);
		this.x=loopPos.x-mv3d["a" /* default */].CELL_SIZE/2;
		this.y=loopPos.y-mv3d["a" /* default */].CELL_SIZE/2;
	}
	async load(){
		const shapes = mv3d["a" /* default */].enumShapes;
		this.builder = new MapCellBuilder_CellMeshBuilder();
		// load all tiles in mesh
		let cellWidth=mv3d["a" /* default */].CELL_SIZE,cellHeight=mv3d["a" /* default */].CELL_SIZE;
		if(mv3d["a" /* default */].getMapConfig('edge')!=='clamp'){
			cellWidth = Math.min(mv3d["a" /* default */].CELL_SIZE,mv3d["a" /* default */].mapWidth()-this.cx*mv3d["a" /* default */].CELL_SIZE);
			cellHeight = Math.min(mv3d["a" /* default */].CELL_SIZE,mv3d["a" /* default */].mapHeight()-this.cy*mv3d["a" /* default */].CELL_SIZE);
		}
		const ceiling = mv3d["a" /* default */].getCeilingConfig();
		for (let y=0; y<cellHeight; ++y)
		for (let x=0; x<cellWidth; ++x){
			ceiling.cull=false;
			const tileData = mv3d["a" /* default */].getTileData(this.ox+x,this.oy+y);
			let lastZ=Infinity;
			const cullHeight = mv3d["a" /* default */].getCullingHeight(this.ox+x,this.oy+y);
			for (let l=3; l>=0; --l){
				if(mv3d["a" /* default */].isTileEmpty(tileData[l])){ continue; }
				let z = mv3d["a" /* default */].getStackHeight(this.ox+x,this.oy+y,l);
				const tileConf = mv3d["a" /* default */].getTileTextureOffsets(tileData[l],this.ox+x,this.oy+y,l);
				const shape = tileConf.shape;
				tileConf.realId = tileData[l];
				//tileConf.isAutotile = Tilemap.isAutotile(tileData[l]);
				//tileConf.isFringe = mv3d.isStarTile(tileData[l]);
				//tileConf.isTable = mv3d.isTableTile(tileData[l]);
				let wallHeight = mv3d["a" /* default */].getTileHeight(this.ox+x,this.oy+y,l)||tileConf.height||0;
				let pitCull = false;
				if(lastZ<z){ pitCull=true; }
				if(!mv3d["a" /* default */].getTileFringe(this.ox+x,this.oy+y,l)){
					lastZ=z;
				}
				//z+=tileConf.fringe;
				//if(mv3d.isStarTile(tileData[l])){ z+=tileConf.fringeHeight; }
				if(!shape||shape===shapes.FLAT||shape===shapes.SLOPE){
					const hasWall=wallHeight||l===0;
					const hasBottom=wallHeight>0&&z-wallHeight>cullHeight||tileConf.fringe>0;
					if(!shape||shape===shapes.FLAT){
						if(!pitCull){
							await this.loadTile(tileConf,x,y,z+l*mv3d["a" /* default */].LAYER_DIST*!hasWall,l);
						}
						if(hasWall){
							await this.loadWalls(tileConf,x,y,z,l,wallHeight);
						}
						if(hasBottom){
							await this.loadTile(tileConf,x,y,z-wallHeight,l,true);
						}
					}else if(shape===shapes.SLOPE){
						const slopeHeight = tileConf.slopeHeight||1;
						wallHeight -= slopeHeight;
						await this.loadSlope(tileConf,x,y,z,l,slopeHeight);
						if(hasWall){
							await this.loadWalls(tileConf,x,y,z-slopeHeight,l,wallHeight);
						}
						if(hasBottom){
							await this.loadTile(tileConf,x,y,z-slopeHeight-Math.max(0,wallHeight),l,true);
						}
					}
					if(z>=ceiling.height){ ceiling.cull=true; }
				}
				if(shape===shapes.FENCE){
					await this.loadFence(tileConf,x,y,z,l,wallHeight);
				}else if(shape===shapes.CROSS||shape===shapes.XCROSS){
					await this.loadCross(tileConf,x,y,z,l,wallHeight);
				}
			}
			if(!mv3d["a" /* default */].isTileEmpty(ceiling.bottom_id) && !ceiling.cull){
				await this.loadTile(ceiling,x,y,ceiling.height,0,true,!ceiling.skylight);
			}

			//if(mv3d.mapReady){ await sleep(); }
			//if(!mv3d.mapLoaded){ this.earlyExit(); return; }
		}
		
		this.mesh=this.builder.build();
		if(this.mesh){
			this.mesh.isPickable=false;
			Object(util["w" /* sleep */])(10).then(()=>this.mesh.isPickable=true);
			this.mesh.parent=this;
			this.mesh.alphaIndex=0;
			this.mesh.renderingGroupId=mv3d["a" /* default */].enumRenderGroups.MAIN;
			mv3d["a" /* default */].callFeatures('createCellMesh',this.mesh);
		}
		delete this.builder
	}
	dispose(){
		super.dispose(...arguments);
		if(this.mesh){
			mv3d["a" /* default */].callFeatures('destroyCellMesh',this.mesh);
		}
	}
	async loadTile(tileConf,x,y,z,l,ceiling=false,double=false){
		const tileId = ceiling?tileConf.bottom_id:tileConf.top_id;
		if(mv3d["a" /* default */].isTileEmpty(tileId)){ return; }
		const configRect = ceiling?tileConf.bottom_rect:tileConf.top_rect;
		const isAutotile = Tilemap.isAutotile(tileId)&&!configRect;
		let rects;
		if(configRect){
			rects=[configRect];
		}else{
			rects = mv3d["a" /* default */].getTileRects(tileId);
		}
		const tsMaterial = await mv3d["a" /* default */].getCachedTilesetMaterialForTile(tileConf,ceiling?'bottom':'top');
		for (const rect of rects){
			this.builder.addFloorFace(tsMaterial,rect.x,rect.y,rect.width,rect.height,
				x + (rect.ox|0)/Object(util["y" /* tileSize */])() - 0.25*isAutotile,
				y + (rect.oy|0)/Object(util["y" /* tileSize */])() - 0.25*isAutotile,
				z,
				1-isAutotile/2, 1-isAutotile/2, {flip:ceiling,double:double}
			);
		}
	}
	async loadWalls(tileConf,x,y,z,l,wallHeight){
		for (const np of mapCell_MapCell.neighborPositions){
			await this.loadWall(tileConf,x,y,z,l,wallHeight,np);
		}
	}
	async loadWall(tileConf,x,y,z,l,wallHeight,np){
		const isFringe = mv3d["a" /* default */].isStarTile(tileConf.realId)||tileConf.fringe>0;
		// don't render walls on edge of map (unless it loops)
		if( !mv3d["a" /* default */].getMapConfig('edge',true) )
		if((this.ox+x+np.x>=mv3d["a" /* default */].mapWidth()||this.ox+x+np.x<0)&&!mv3d["a" /* default */].loopHorizontal()
		||(this.oy+y+np.y>=mv3d["a" /* default */].mapHeight()||this.oy+y+np.y<0)&&!mv3d["a" /* default */].loopVertical()){
			return;
		}

		let neededHeight=wallHeight;
		let tileId=tileConf.side_id,configRect,texture_side='side';
		if(mv3d["a" /* default */].isTileEmpty(tileId)){ return; }
		
		const neighborHeight = mv3d["a" /* default */].getCullingHeight(this.ox+x+np.x,this.oy+y+np.y,tileConf.depth>0?3:l,{
			ignorePits:!(tileConf.depth>0),
			dir:Input._makeNumpadDirection(np.x,np.y),
		});
		neededHeight = z-neighborHeight;
		if(neededHeight>0&&(l>0||isFringe)){ neededHeight=Math.min(wallHeight,neededHeight); }

		if(tileConf.depth>0&&neededHeight<0){
			if(mv3d["a" /* default */].tileHasPit(this.ox+x+np.x,this.oy+y+np.y,l)){ return; }
			//if(mv3d.isTilePit(this.ox+x+np.x,this.oy+y+np.y,l)){ return; }
			neededHeight = Math.max(neededHeight,-tileConf.depth);
			if(tileConf.hasInsideConf){
				texture_side='inside';
			}
		}
		else if(neededHeight<=0){ return; }

		if(texture_side==='inside'){
			tileId=tileConf.inside_id;
			if(tileConf.inside_rect){ configRect = tileConf.inside_rect; }
		}else{
			if(tileConf.side_rect){ configRect = tileConf.side_rect; }
		}

		const tsMaterial = await mv3d["a" /* default */].getCachedTilesetMaterialForTile(tileConf,texture_side);

		const wallPos = new mod_babylon["z" /* Vector3 */]( x+np.x/2, y+np.y/2, z );
		const rot = -Math.atan2(np.x, np.y);
		if(configRect || !Tilemap.isAutotile(tileId)){
			const rect = configRect ? configRect : mv3d["a" /* default */].getTileRects(tileId)[0];
			const builderOptions={};
			if(neededHeight<0){ builderOptions.flip=true; }
			this.builder.addWallFace(tsMaterial,rect.x,rect.y,rect.width,rect.height,
				wallPos.x,
				wallPos.y,
				z - neededHeight/2,
				1,Math.abs(neededHeight), rot, builderOptions
			);
		}else{ // Autotile
			//const npl=MapCell.neighborPositions[(+ni-1).mod(4)];
			//const npr=MapCell.neighborPositions[(+ni+1).mod(4)];
			const npl=new mod_babylon["y" /* Vector2 */](-np.y,np.x);
			const npr=new mod_babylon["y" /* Vector2 */](np.y,-np.x);
			const leftHeight = mv3d["a" /* default */].getCullingHeight(this.ox+x+npl.x,this.oy+y+npl.y,l,{dir:Input._makeNumpadDirection(npl.x,npl.y)});
			const rightHeight = mv3d["a" /* default */].getCullingHeight(this.ox+x+npr.x,this.oy+y+npr.y,l,{dir:Input._makeNumpadDirection(npr.x,npr.y)});
			const {x:bx,y:by} = this.getAutotileCorner(tileId,tileConf.realId,true);
			let wallParts=Math.max(1,Math.abs(Math.round(neededHeight*2)));
			let partHeight=Math.abs(neededHeight/wallParts);
			let sw = Object(util["y" /* tileSize */])()/2;
			let sh = Object(util["y" /* tileSize */])()/2;
			if(mv3d["a" /* default */].isTableTile(tileConf.realId)){
				sh=Object(util["y" /* tileSize */])()/3;
				wallParts=1;
				partHeight=wallHeight;
				//partHeight=neededHeight;
			}
			for (let ax=-1; ax<=1; ax+=2){
				for(let az=0;az<wallParts;++az){
					let hasLeftEdge,hasRightEdge;
					if(mv3d["a" /* default */].isTableTile(tileConf.realId)){
						hasLeftEdge = leftHeight!=z;
						hasRightEdge = rightHeight!=z;
					}else{
						hasLeftEdge = leftHeight<z-az*partHeight;
						hasRightEdge = rightHeight<z-az*partHeight;
					}
					let sx,sy;
					sx=bx*Object(util["y" /* tileSize */])();
					sy=by*Object(util["y" /* tileSize */])();
					sx=(bx+(ax>0?0.5+hasRightEdge:1-hasLeftEdge))*Object(util["y" /* tileSize */])();
					if(mv3d["a" /* default */].isWaterfallTile(tileId)){
						sy=(by+az%2/2)*Object(util["y" /* tileSize */])();
					}else if(mv3d["a" /* default */].isTableTile(tileId)){
						sy=(by+5/3)*Object(util["y" /* tileSize */])();
					}else{
						sy=(by+(az===0?0:az===wallParts-1?1.5:1-az%2*0.5))*Object(util["y" /* tileSize */])();
					}
					const builderOptions={};
					if(neededHeight<0){ builderOptions.flip=true; }
					this.builder.addWallFace(tsMaterial,sx,sy,sw,sh,
						wallPos.x+0.25*ax*Math.cos(rot),
						wallPos.y+0.25*ax*Math.sin(rot),
						z - neededHeight*(neededHeight<0) - partHeight/2 - partHeight*az,
						0.5,partHeight, rot, builderOptions
					);
				}
			}
		}
	}
	async loadFence(tileConf,x,y,z,l,wallHeight){
		const tileId = tileConf.side_id;
		if(mv3d["a" /* default */].isTileEmpty(tileId)){ return; }
		const configRect = tileConf.side_rect;
		const tsMaterial = await mv3d["a" /* default */].getCachedTilesetMaterialForTile(tileConf,'side');
		const isAutotile = Tilemap.isAutotile(tileId);
		const edges = [];
		const fenceposts = tileConf.fencePosts==null?true:tileConf.fencePosts;
		for (let ni=0; ni<mapCell_MapCell.neighborPositions.length; ++ni){
			const np = mapCell_MapCell.neighborPositions[ni];
			const neighborHeight = mv3d["a" /* default */].getTileHeight(this.ox+x+np.x,this.oy+y+np.y,l);
			if(neighborHeight!==wallHeight){ edges.push(ni); }
		}
		for (let ni=0; ni<mapCell_MapCell.neighborPositions.length; ++ni){
			const np = mapCell_MapCell.neighborPositions[ni];

			let edge = edges.includes(ni);
			if(!isAutotile||!fenceposts){
				let connect = !(edge&&edges.length<4);
				if(edges.length===3 && !edges.includes((ni+2)%4)){ connect=true; }
				if(!connect){ continue; }
			}

			const rightSide = np.x>0||np.y<0;
			let rot = Math.atan2(np.x, np.y)+Math.PI/2;
			if(rightSide){
				rot-=Math.PI;
			}

			if(isAutotile&&!configRect){
				const {x:bx,y:by} = this.getAutotileCorner(tileId,tileConf.realId,true);
				for (let az=0;az<=1;++az){
					this.builder.addWallFace(tsMaterial,
						(edge ? (bx+rightSide*1.5) : (bx+1-rightSide*0.5) )*Object(util["z" /* tileWidth */])(),
						(by+az*1.5)*Object(util["x" /* tileHeight */])(),
						Object(util["z" /* tileWidth */])()/2, Object(util["x" /* tileHeight */])()/2,
						x+np.x/4,
						y+np.y/4,
						z-wallHeight/4-az*wallHeight/2,
						0.5,wallHeight/2, -rot, {double:true, abnormal:mv3d["a" /* default */].ABNORMAL}
					);
				}
			}else{
				const rect = configRect ? configRect : mv3d["a" /* default */].getTileRects(tileId)[0];
				this.builder.addWallFace(tsMaterial,
					rect.x+rect.width/2*(np.x>0||np.y>0),
					rect.y,
					rect.width/2, rect.height,
					x+np.x/4,
					y+np.y/4,
					z-wallHeight/2,
					0.5,wallHeight, rot, {double:true}
				);
			}
		}
	}
	async loadCross(tileConf,x,y,z,l,wallHeight){
		const tileId = tileConf.side_id;
		if(mv3d["a" /* default */].isTileEmpty(tileId)){ return; }
		const configRect = tileConf.side_rect;
		const tsMaterial = await mv3d["a" /* default */].getCachedTilesetMaterialForTile(tileConf,'side');
		const isAutotile = Tilemap.isAutotile(tileId);
		let rects;
		if(configRect){
			rects=[configRect];
		}else{
			rects = mv3d["a" /* default */].getTileRects(tileId);
		}
		const rot = tileConf.shape===mv3d["a" /* default */].enumShapes.XCROSS ? Math.PI/4 : 0;
		const partHeight = isAutotile ? wallHeight/2 : wallHeight;
		for (let i=0; i<=1; ++i){
			for (const rect of rects){
				const irot = -Math.PI/2*i+rot;
				const trans= -0.25*isAutotile+(rect.ox|0)/Object(util["z" /* tileWidth */])();
				this.builder.addWallFace(tsMaterial,
					rect.x,rect.y,rect.width,rect.height,
					x+trans*Math.cos(irot),
					y+trans*Math.sin(irot),
					z - (rect.oy|0)/Object(util["x" /* tileHeight */])()*wallHeight - partHeight/2,
					1-isAutotile/2,partHeight, irot, {double:true, abnormal:mv3d["a" /* default */].ABNORMAL}
				);
			}
		}
	}
	async loadSlope(tileConf,x,y,z,l,slopeHeight){
		//const rot = Math.random()*Math.PI*2;
		//const rot = Math.round((Math.random()*Math.PI*2)/(Math.PI/2))*Math.PI/2;
		const {dir,rot} = mv3d["a" /* default */].getSlopeDirection(this.ox+x,this.oy+y,l,true);
		const n1=new mod_babylon["y" /* Vector2 */](-Object(util["v" /* sin */])(rot+Math.PI),Object(util["h" /* cos */])(rot+Math.PI));
		if(mv3d["a" /* default */].getCullingHeight(this.ox+x+n1.x,this.oy+y+n1.y,l)<z){
			await this.loadWall(tileConf,x,y,z,l+1,slopeHeight,n1);
		}
		const n2=new mod_babylon["y" /* Vector2 */](n1.y,-n1.x);
		const n2x=this.ox+x+n2.x, n2y=this.oy+y+n2.y;
		if(mv3d["a" /* default */].getCullingHeight(n2x,n2y,l)<z){
			let otherslope = mv3d["a" /* default */].isRampAt(n2x,n2y,z);
			if(!otherslope||otherslope.z2!==z||otherslope.z1!==z-slopeHeight
			||dir!=mv3d["a" /* default */].getSlopeDirection(n2x,n2y,otherslope.l,true).dir){
				await this.loadSlopeSide(tileConf,x+n2.x/2,y+n2.y/2,z,l,slopeHeight,rot+Math.PI/2);
			}
		}
		const n3=new mod_babylon["y" /* Vector2 */](-n1.y,n1.x);
		const n3x=this.ox+x+n3.x, n3y=this.oy+y+n3.y;
		if(mv3d["a" /* default */].getCullingHeight(n3x,n3y,l)<z){
			let otherslope = mv3d["a" /* default */].isRampAt(n3x,n3y,z);
			if(!otherslope||otherslope.z2!==z||otherslope.z1!==z-slopeHeight
			||dir!=mv3d["a" /* default */].getSlopeDirection(n3x,n3y,otherslope.l,true).dir){
				await this.loadSlopeSide(tileConf,x+n3.x/2,y+n3.y/2,z,l,slopeHeight,rot+Math.PI/2,{flip:true});
			}
		}
		await this.loadSlopeTop(tileConf,x,y,z,l,slopeHeight,rot);
	}
	async loadSlopeTop(tileConf,x,y,z,l,slopeHeight,rot){
		const tileId=tileConf.top_id;
		const tsMaterial = await mv3d["a" /* default */].getCachedTilesetMaterialForTile(tileConf,'top');
		const isAutotile = Tilemap.isAutotile(tileId)&&!tileConf.top_rect;
		if(isAutotile){
			const rects = mv3d["a" /* default */].getTileRects(tileId);
			for (let i=0;i<rects.length;++i){
				const rect = rects[i];
				const ix=(i+1)%2*-2+1, iy=(Math.floor(i/2)+1)%2*2-1;
				const hx=Math.max(0,Object(util["v" /* sin */])(rot)*ix)*slopeHeight/2;
				const hy=Math.max(0,Object(util["h" /* cos */])(rot)*iy)*slopeHeight/2;
				this.builder.addSlopeFace(tsMaterial,rect.x,rect.y,rect.width,rect.height,
					x + rect.ox/Object(util["y" /* tileSize */])() - 0.25,
					y + rect.oy/Object(util["y" /* tileSize */])() - 0.25,
					z - slopeHeight + hx + hy,
					0.5, slopeHeight/2, rot, {autotile:true}
				);
			}
		}else{
			const rect = tileConf.top_rect?tileConf.top_rect:mv3d["a" /* default */].getTileRects(tileId)[0];
			this.builder.addSlopeFace(tsMaterial,rect.x,rect.y,rect.width,rect.height,
				x, y, z - slopeHeight,
				1, slopeHeight, rot, {}
			);
		}
	}
	async loadSlopeSide(tileConf,x,y,z,l,slopeHeight,rot,options={}){
		const tileId=tileConf.side_id;
		const tsMaterial = await mv3d["a" /* default */].getCachedTilesetMaterialForTile(tileConf,'side');
		const isAutotile = Tilemap.isAutotile(tileId)&&!tileConf.side_rect;
		let rect;
		if(isAutotile){
			const {x:bx,y:by} = this.getAutotileCorner(tileId,tileConf.realId,true);
			rect={x:(bx+0.5)*Object(util["z" /* tileWidth */])(),y:(by+0.5)*Object(util["x" /* tileHeight */])(),width:Object(util["z" /* tileWidth */])(),height:Object(util["x" /* tileHeight */])()};
		}else{
			rect = tileConf.side_rect?tileConf.side_rect:mv3d["a" /* default */].getTileRects(tileId)[0];
		}
		this.builder.addSlopeSide(tsMaterial,rect.x,rect.y,rect.width,rect.height,
			x, y, z - slopeHeight,
			1, slopeHeight, rot, options
		);
	}
	getAutotileCorner(tileId,realId=tileId,excludeTop=true){
		const kind = Tilemap.getAutotileKind(tileId);
		let tx = kind%8;
		let ty = Math.floor(kind / 8);
		if(tileId===realId && mv3d["a" /* default */].isWallTile(tileId)==1){ ++ty; }
		var bx,by;
		bx=tx*2;
		by=ty;
		if(Tilemap.isTileA1(tileId)){
			if(kind<4){
				bx=6*Math.floor(kind/2);
				by=3*(kind%2) + excludeTop;
			}else{
				bx=8*Math.floor(tx/4) + (kind%2)*6;
				by=ty*6 + Math.floor(tx%4/2)*3 + excludeTop*!(tx%2);
				//if(excludeTop&&!(kind%2)){ by+=1; }
			}
			if(excludeTop&&kind>=4&&!(kind%2)){ by+=1; }
		}else if(Tilemap.isTileA2(tileId)){
			by=(ty-2)*3 + excludeTop;
		}else if (Tilemap.isTileA3(tileId)){
			by=(ty-6)*2;
		}else if (Tilemap.isTileA4(tileId)){
			if(excludeTop){
				by=Math.ceil((ty-10)*2.5+0.5);
			}else{
				by=(ty-10)*2.5+(ty%2?0.5:0);
			}
		}
		return {x:bx,y:by};
	}
}
mapCell_MapCell.neighborPositions = [
	new mod_babylon["y" /* Vector2 */]( 0, 1),
	new mod_babylon["y" /* Vector2 */]( 1, 0),
	new mod_babylon["y" /* Vector2 */]( 0,-1),
	new mod_babylon["y" /* Vector2 */](-1, 0),
];
mapCell_MapCell.meshCache={};

class MapCellFinalized {
	
}

class MapCellBuilder {

}



// CONCATENATED MODULE: ./src/tileData.js




Object.assign(mv3d["a" /* default */],{

	_tilemap:null,
	getTilemap(){
		if(SceneManager._scene&&SceneManager._scene._spriteset){
			this._tilemap = SceneManager._scene._spriteset._tilemap;
		}
		return this._tilemap;
	},
	getDataMap(){
		if($dataMap){ this._dataMap=$dataMap }
		return this._dataMap;
	},
	mapWidth(){ return this.getDataMap().width; },
	mapHeight(){ return this.getDataMap().height; },
	loopHorizontal(){ return this.getDataMap().scrollType&2; },
	loopVertical(){ return this.getDataMap().scrollType&1; },

	getRegion(x,y){
		return this.getTileId(x,y,5);
	},

	getSetNumber(id){
		if(Tilemap.isAutotile(id)){
			return Tilemap.isTileA1(id)?0
				: Tilemap.isTileA2(id)?1 : Tilemap.isTileA3(id)?2 : 3;
		}else{
			return Tilemap.isTileA5(id)?4:5+Math.floor(id/256);
		}
	},

	getShadowBits(x,y){
		return this.getTileId(x,y,4);
	},

	getTerrainTag(tileId){
		return $gameMap.tilesetFlags()[tileId]>>12;
	},

	getTilePassage:Object(util["q" /* overload */])({
		1(tileId){ return this.getTilePassage(tileId,this.getTileConfig(tileId)); },
		2(tileId,conf){
			if('pass' in conf){
				return conf.pass;
			}
			const flag = $gameMap.tilesetFlags()[tileId];
			if( (flag&0x10) ){ return this.enumPassage.THROUGH; }
			if( (flag&0x0f)===0x0f ){ return this.enumPassage.WALL; }
			else{ return this.enumPassage.FLOOR; }
		},
		3(x,y,l){
			const tileId=this.getTileId(x,y,l);
			return this.getTilePassage(tileId,this.getTileConfig(tileId,x,y,l));
		},
		default(tileId,x,y,l){
			return this.getTilePassage(tileId,this.getTileConfig(tileId,x,y,l));
		}
	}),

	getMaterialOptions(conf,side){
		const options={};
		if ('pass' in conf){ options.through=conf.pass===this.enumPassage.THROUGH; }
		if ('alpha' in conf){ options.alpha=conf.alpha; }
		if ('glow' in conf){ options.glow=conf.glow; }
		if ('shadow' in conf){ options.shadow=conf.shadow; }
		if(side){
			if(`${side}_alpha` in conf){ options.alpha=conf[`${side}_alpha`]; }
			if(`${side}_glow` in conf){ options.glow=conf[`${side}_glow`]; }
			if(`${side}_shadow` in conf){ options.shadow=conf[`${side}_shadow`]; }
		}
		if(conf.isCeiling){
			options.backfaceCulling=conf.backfaceCulling;
			options.through = conf.skylight;
		}
		if('alpha' in options){ options.transparent=true; }
		return options;
	},

	getTileAnimationData(tileConf,side){
		const tileId=tileConf[`${side}_id`];
		if(`${side}_animData` in tileConf){
			return tileConf[`${side}_animData`];
		}
		const animData={animX:0,animY:0};
		if(Tilemap.isTileA1(tileId)){
			const kind = Tilemap.getAutotileKind(tileId);
			animData.animX=kind<=1?2:kind<=3?0:kind%2?0:2;
			animData.animY=kind<=3?0:kind%2?1:0; 
		}
		return animData;
	},

	getTileConfig:Object(util["q" /* overload */])({
		3(x,y,l){ return this.getTileConfig(this.getTileData(x,y)[l],x,y,l); },
		default(tileId,x,y,l){
			const conf = {};
			if(!this.isTileEmpty(tileId)){
				const ttag = this.getTerrainTag(tileId);
				if(ttag && ttag in this.TTAG_DATA){
					Object.assign(conf,this.TTAG_DATA[ttag]);
				}
				const ts_conf = this.tilesetConfigurations[this.normalizeAutotileId(tileId)];
				if(ts_conf){
					Object.assign(conf,ts_conf);
				}
			}
			if(l===0){
				const region = this.getRegion(x,y);
				if(region && region in mv3d["a" /* default */].REGION_DATA){
					Object.assign(conf,this.REGION_DATA[region]);
				}
			}
			return conf;
		},
	}),

	getTileTextureOffsets(tileId,x,y,l){
		const conf = this.getTileConfig(tileId,x,y,l);
		const tileRange = Tilemap.isAutotile(tileId)?48:1;
		conf.hasInsideConf=Boolean(conf.inside_offset||conf.rectInside||('inside_id' in conf));
		conf.hasBottomConf=Boolean(conf.bottom_offset||conf.rectBottom||('bottom_id' in conf));
		if(conf.top_id==null){ 
			conf.top_id=tileId;
			if(conf.top_offset){
				conf.top_id = tileId+conf.top_offset.x*tileRange+conf.top_offset.y*tileRange*8;
			}
		 }
		if(conf.side_id==null){
			conf.side_id=tileId;
			if(conf.side_offset){
				conf.side_id = tileId+conf.side_offset.x*tileRange+conf.side_offset.y*tileRange*8;
			}
		}
		if(conf.inside_id==null){ 
			conf.inside_id=conf.side_id;
			if(conf.inside_offset){
				conf.inside_id=tileId+conf.inside_offset.x*tileRange+conf.inside_offset.y*tileRange*8;
			}
		}
		if(conf.bottom_id==null){
			conf.bottom_id=conf.top_id;
			if(conf.bottom_offset){
				conf.bottom_id=tileId+conf.bottom_offset.x*tileRange+conf.bottom_offset.y*tileRange*8;
			}
		}
		if(!('pass' in conf)){
			conf.pass = this.getTilePassage(tileId,conf);
		}
		return conf;
	},

	getTileId(x,y,l=0){
		const dataMap = this.getDataMap(); if(!dataMap){ return 0; }
		const {data,width,height} = dataMap;
		if(this.loopHorizontal()){ x=x.mod(width); }
		if(this.loopVertical()){ y=y.mod(height); }
		if(x<0||x>=width||y<0||y>=height){
			if(this.getMapConfig('edge')==='clamp'){
				const clamp = this.getMapConfig('edgeData',1);
				if(x>=width){ x=width+(x-width).mod(clamp)-clamp; }
				else if(x<0){x=x.mod(clamp);}
				if(y>=height){ y=height+(y-height).mod(clamp)-clamp; }
				else if(y<0){y=y.mod(clamp);}
			}else{
				return 0; 
			}
		}
		return data[(l * height + y) * width + x] || 0
	},

	getTileData(x,y){
		const dataMap = this.getDataMap(); if(!dataMap){ return [0,0,0,0]; }
		const {data,width,height} = dataMap;
		if(this.loopHorizontal()){
			x=x.mod(width);
		}
		if(this.loopVertical()){
			y=y.mod(height);
		}
		if(x<0||x>=width||y<0||y>=height){
			if(this.getMapConfig('edge')==='clamp'){
				const clamp = this.getMapConfig('edgeData',1);
				if(x>=width){ x=width+(x-width).mod(clamp)-clamp; }
				else if(x<0){x=x.mod(clamp);}
				if(y>=height){ y=height+(y-height).mod(clamp)-clamp; }
				else if(y<0){y=y.mod(clamp);}
			}else{
				return [0,0,0,0]; 
			}
		}
		if(x<0||x>=width||y<0||y>=height){ return [0,0,0,0]; }
		const tileData=[];
		for (let z=0;z<4;++z){//4 tile layers. Ignore shadow bits.
			tileData[z] = data[(z * height + y) * width + x] || 0;
		}
		return tileData;
	},


	getTileHeight(x,y,l=0){

		if(this.loopHorizontal()){ x=x.mod(this.mapWidth()); }
		if(this.loopVertical()){ y=y.mod(this.mapHeight()); }

		const tileId=this.getTileData(x,y)[l];
		if(this.isTileEmpty(tileId)&&l>0){ return 0; }
		// finge tiles don't stack normally. fringeHeight property should be used when drawing them.
		//if(this.isStarTile(tileId)){ return 0; }

		const shapes=this.enumShapes;
		const conf =this.getTileConfig(tileId,x,y,l);
		let height = 0;
		if('height' in conf){
			height = conf.height;
		}else if(this.isWallTile(tileId)){
			height = this.WALL_HEIGHT;
		}else if(this.isTableTile(tileId)){
			height = this.TABLE_HEIGHT;
		}else if(this.isSpecialShape(conf.shape)){
			switch(conf.shape){
				case shapes.SLOPE: height=0; break;
				default: height=1; break;
			}
		}
		if('depth' in conf){
			height -= conf.depth;
		}
		if(conf.shape===shapes.SLOPE){
			height += conf.slopeHeight||1;
		}
		return height;
	},

	getStackHeight(x,y,layerId=3){
		let height=0;
		for(let l=0; l<=layerId; ++l){
			height += this.getTileFringe(x,y,l);
			height += this.getTileHeight(x,y,l);
		}
		return height;
	},

	getSlopeDirection(x,y,l,fullData=false){
		const stackHeight = this.getStackHeight(x,y,l);
		const tileId = this.getTileData(x,y)[l];
		const conf = this.getTileConfig(tileId,x,y,l);
		const slopeHeight = conf.slopeHeight||1;
		const neighborPositions = mapCell_MapCell.neighborPositions;
		const flag = $gameMap.tilesetFlags()[tileId];
		const shadowBits = this.getShadowBits(x,y);
		const shadowBitDirections=[0,0b0011,0b1010,0b0101,0b1100];
		//const shadowBitDirections=[0,0b1100,0b0101,0b1010,0b0011];
		let direction;
		for(let i=0;i<neighborPositions.length;++i){
			const n=neighborPositions[i];
			const d={neighbor: n,favor:0};
			d.dir = 5-3*n.y+n.x;
			const nHeights = this.getCollisionHeights(x+n.x,y+n.y,{slopeMax:true});
			const oHeights = this.getCollisionHeights(x-n.x,y-n.y,{slopeMin:true});
			if(nHeights.some(c=>Math.abs(stackHeight-slopeHeight-c.z2)<=mv3d["a" /* default */].STAIR_THRESH)){ d.favor+=1; }
			if(oHeights.some(c=>Math.abs(stackHeight-c.z2)<=mv3d["a" /* default */].STAIR_THRESH)){ d.favor+=1; }
			if(flag&(1<<(d.dir/2-1))){ d.favor=-2; }
			if(flag&(1<<((10-d.dir)/2-1))){ d.favor=-1; }
			if((shadowBits&shadowBitDirections[d.dir/2])===shadowBitDirections[d.dir/2]){ d.favor=30; }
			if(conf.slopeDirection===d.dir){ d.favor=100; }
			if(!direction||d.favor>direction.favor){ direction=d; }
		}
		direction.rot=Object(util["j" /* degtorad */])(180-this.dirToYaw(direction.dir));
		if(fullData){ return direction; }
		return direction.rot;
	},

	getWalkHeight(x,y){
		// get top height at x,y. Used for jumping and initializing z.
		const heights = this.getCollisionHeights(x,y);
		return heights[heights.length-1].z2;
	},

	getSlopeHeight(x,y,l,data=null){
		const rx=Math.round(x), ry=Math.round(y);
		if(data==null){ data = this.getTileConfig(this.getTileData(rx,ry)[l],rx,ry,l); }
		const rot=this.getSlopeDirection(rx,ry,l);
		const xf=Object(util["v" /* sin */])(rot), yf=-Object(util["h" /* cos */])(rot);
		let px=(x+0.5)%1, py=(y+0.5)%1;
		if(Math.sign(xf<0)){ px=1-px; }
		if(Math.sign(yf<0)){ py=1-py; }
		const sf=Math.abs(xf)*px + Math.abs(yf)*py;
		return (data.slopeHeight||1)*sf;
	},

	getCollisionHeights(x,y,opts={}){
		const rx=Math.round(x),ry=Math.round(y);
		let z = 0;
		const collisions=[{z1:-Infinity,z2:0}];
		if(opts.layers){ collisions.layers=[]; }
		const tileData=this.getTileData(rx,ry);
		for(let l=0; l<=3; ++l){
			let h = this.getTileHeight(rx,ry,l);
			const tileId=tileData[l];
			const conf = this.getTileConfig(tileId,rx,ry,l);
			const shape = conf.shape;
			const passage = this.getTilePassage(tileId,conf);
			let skip = false;
			if(passage===this.enumPassage.THROUGH){
				h=0; skip=true;
			}else if(shape===this.enumShapes.SLOPE){
				if(opts.slopeMax){
					h = h;
				}else if(opts.slopeMin){
					h = h-(conf.slopeHeight||1);
				}else{
					h = h-(conf.slopeHeight||1)+this.getSlopeHeight(x,y,l,conf);
				}
			}
			const fringe = this.getTileFringe(rx,ry,l);
			z+=fringe;
			if(skip){ continue; }
			if(h<0){
				if(fringe+h<0){
					collisions[collisions.length-1].z2+=fringe+h;
				}
			}else if(l===0){
				collisions[0].z2=z+h;
			}else{
				collisions.push({z1:z,z2:z+h});
			}
			z+=h;
			if(opts.layers){ collisions.layers[l]=collisions[collisions.length-1]; }
			if(shape===this.enumShapes.SLOPE){ collisions[collisions.length-1].isSlope=true; }
		}
		return collisions;
	},

	getTileLayers(x,y,z,gte=true){
		let closest_diff = Infinity;
		let layers = [0];
		let h=0;
		//const tileData = this.getTileData(x,y);
		for (let l=0; l<=3; ++l){
			//if($gameMap.tilesetFlags()[tileData[l]]&0x10){ continue; }
			if(this.getTilePassage(x,y,l)===this.enumPassage.THROUGH){ continue; }
			const fringe=this.getTileFringe(x,y,l);
			const height=this.getTileHeight(x,y,l);
			const conf = this.getTileConfig(x,y,l);
			h+=fringe+height;
			const isSlope=conf.shape===this.enumShapes.SLOPE;
			if(isSlope){
				h-=conf.slopeHeight||1;
			}
			const diff = z-h;
			if( gte ? z>=h : z>h ){
				if(diff<closest_diff||isSlope&&diff<=closest_diff){
					layers=[l];
					closest_diff=diff;
				}else if(diff===closest_diff){
					layers.push(l);
				}
			}
		}
		return layers;
	},

	getFloatHeight(x,y,z=null,gte=true){
		const tileData=this.getTileData(x,y);
		const layers = z==null?[0,1,2,3]:this.getTileLayers(x,y,z,gte);
		let float=0;
		for(const l of layers){
			const tileId=tileData[l];
			if(this.isTileEmpty(tileId)){ continue; }
			const conf = this.getTileConfig(tileId,x,y,l);
			if(conf && 'float' in conf){
				float += conf.float;
			}
		}
		return float;
	},

	getStackFringeHeight(x,y,l=3){
		return this.getStackHeight(x,y,l);
	},

	getTileFringe(x,y,l){
		const tileId=this.getTileData(x,y)[l];
		if(this.isTileEmpty(tileId)){ return 0; }
		const conf = this.getTileConfig(tileId,x,y,l);
		if(conf && 'fringe' in conf){ return conf.fringe; }
		if(this.isStarTile(tileId)){
			return this.FRINGE_HEIGHT;
		}
		return 0;
	},

	getCullingHeight(x,y,layerId=3,opts={}){
		const dataMap=this.getDataMap();
		if( !this.getMapConfig('edge',true) &&
			(!this.loopHorizontal()&&(x<0||x>=dataMap.width)
			||!this.loopVertical()&&(y<0||y>=dataMap.height))
			){ return Infinity; }
		const tileData=this.getTileData(x,y);
		let height=0;
		for(let l=0; l<=layerId; ++l){
			if(this.getTileFringe(x,y,l)){ return height; }
			const tileId=tileData[l];
			const data = this.getTileConfig(tileId,x,y,l);
			const shape = data.shape;
			if(this.isSpecialShape(shape)){
				if(shape===this.enumShapes.SLOPE){
					height+=this.getTileHeight(x,y,l);
					if(!opts.dir||opts.dir!==this.getSlopeDirection(x,y,l,true).dir){
						height-=data.slopeHeight||1;
					}
				}
				return height;
			}
			if(opts.ignorePits&&data.depth>0){
				height+=data.depth;
			}
			height+=this.getTileHeight(x,y,l);
		}
		return height;
	},

	tileHasPit(x,y,layerId=3){
		const tileData=this.getTileData(x,y);
		for(let l=0; l<=layerId; ++l){
			const tileId=tileData[l];
			const conf = this.getTileConfig(tileId,x,y,l);
			if(conf.depth>0){ return true; }
		}
		return false;
	},

	isTilePit(x,y,l){
		const tileId=this.getTileData(x,y)[l];
		const conf = this.getTileConfig(tileId,x,y,l);
		return conf.depth>0;
	},

	getTileRects(tileId){
		const rects = [];
		const tilemap=this.getTilemap();
		const isTable=tilemap._isTableTile(tileId);
		tilemap._drawTile({addRect:(sheetId,sx,sy,dx,dy,width,height,animX,animY)=>{
			rects.push({setN:sheetId,x:sx,y:sy,width:width,height:height,ox:dx,oy:dy});
		}}, tileId, 0,0);
		if (isTable) for (let i=rects.length-1;i>=0;--i){
			if(rects[i].oy>Object(util["y" /* tileSize */])()/2){
				rects[i-1].y+=Object(util["y" /* tileSize */])()*2/3;
				rects.splice(i,1);
			}
		}
		return rects;
	},

	isTileEmpty(tileId){
		return !tileId||tileId===1544;
	},

	isWallTile(tileId){
		const kind = Tilemap.getAutotileKind(tileId);
		const ty = Math.floor(kind / 8);
		const isWall = Tilemap.isTileA3(tileId) || Tilemap.isTileA4(tileId);
		if (isWall && ty%2){ return 2; }
		return isWall;
	},

	isTableTile(tileId){
		return Boolean(Tilemap.isTileA2(tileId) && ($gameMap.tilesetFlags()[tileId] & 0x80));
	},

	isStarTile(tileId){
		return Boolean($gameMap.tilesetFlags()[tileId] & 0x10);
	},

	isWaterfallTile(tileId){
		const kind = Tilemap.getAutotileKind(tileId);
		return Tilemap.isTileA1(tileId)&&kind>=4&&kind%2;
	},

	isSpecialShape(shape){
		const shapes = mv3d["a" /* default */].enumShapes;
		return shape===shapes.FENCE||shape===shapes.CROSS||shape===shapes.XCROSS||shape===shapes.SLOPE;
	},
	isPlatformShape(shape){
		const shapes = mv3d["a" /* default */].enumShapes;
		return shape==null||shape===shapes.FLAT||shape===shapes.SLOPE;
	},

	constructTileId(img,x,y){
		const key = `TILE_ID_${img.toUpperCase()}`
		let tileId = key in Tilemap ? Tilemap[key] : 0;
		const tileRange = Tilemap.isAutotile(tileId) ? 48 : 1;
		tileId += Number(x)*tileRange + Number(y)*tileRange*8;
		return tileId;
	},
	normalizeAutotileId(tileId){
		if(!Tilemap.isAutotile(tileId)){ return tileId; }
		const kind = Tilemap.getAutotileKind(tileId);
		return Tilemap.TILE_ID_A1 + kind*48;
	},

});
// CONCATENATED MODULE: ./src/loadMap.js





Object.assign(mv3d["a" /* default */],{

	mapLoaded: false,
	mapReady: false,
	clearMap(){
		this.mapLoaded=false;
		this.clearMapCells();
		for (let i=this.characters.length-1; i>=0; --i){
			this.characters[i].dispose(false,true);
		}
		this.characters.length=0;
		this.resetCameraTarget();

		this.callFeatures('clearMap');
	},
	clearMapCells(){
		// clear materials and textures
		for (const key in this.textureCache){
			this.textureCache[key].dispose();
		}
		for (const key in this.materialCache){
			this.materialCache[key].dispose();
		}
		this.animatedTextures.length=0;
		this.textureCache={};
		this.materialCache={};
		// clear map cells
		for (const key in this.cells){
			this.cells[key].dispose(false,true);
		}
		this.cells={};
	},
	reloadMap(){
		this.clearMapCells();
		if(mv3d["a" /* default */].mapReady) { this.updateMap(); }
		this.callFeatures('reloadMap');
	},

	loadMap(){
		//this.cameraStick.x=$gamePlayer._realX;
		//this.cameraStick.y=$gamePlayer._realY;
		this.updateBlenders();
		this.updateMap();
		this.createCharacters();
		this.rememberCameraTarget();

		this.callFeatures('loadMap');
	},

	async updateMap(){
		if(this.mapUpdating){ return; }
		this.mapLoaded=true;
		this.mapUpdating=true;
		// unload Far cells
		for (const key in this.cells){
			this.cells[key].unload=true;
		}
		// get range of cells based on render distance
		const bounds = {
			left:Math.floor((this.cameraStick.x-this.renderDist)/this.CELL_SIZE),
			right:Math.floor((this.cameraStick.x+this.renderDist)/this.CELL_SIZE),
			top:Math.floor((this.cameraStick.y-this.renderDist)/this.CELL_SIZE),
			bottom:Math.floor((this.cameraStick.y+this.renderDist)/this.CELL_SIZE),
		}
		//clamp cell range to map
		if(this.getMapConfig('edge')!=='clamp'){
			if(!this.loopHorizontal()){
				bounds.left=Math.max(0,bounds.left);
				bounds.right=Math.min(bounds.right,Math.ceil(this.mapWidth()/this.CELL_SIZE)-1);
			}
			if(!this.loopVertical()){
				bounds.top=Math.max(0,bounds.top);
				bounds.bottom=Math.min(bounds.bottom,Math.ceil(this.mapHeight()/this.CELL_SIZE)-1);
			}
		}
		const cellsToLoad=[];
		for (let ix=bounds.left;ix<=bounds.right;++ix)
		for (let iy=bounds.top;iy<=bounds.bottom;++iy){
			let cx=ix, cy=iy;
			if(this.loopHorizontal()){ cx = cx.mod(Math.ceil(this.mapWidth()/this.CELL_SIZE)); }
			if(this.loopVertical()){ cy = cy.mod(Math.ceil(this.mapHeight()/this.CELL_SIZE)); }
			const key = [cx,cy].toString();
			if(key in this.cells){
				this.cells[key].unload=false;
			}else{
				cellsToLoad.push(new mod_babylon["y" /* Vector2 */](cx,cy));
			}
		}
		for (const key in this.cells){
			if(mv3d["a" /* default */].UNLOAD_CELLS && this.cells[key].unload){
				this.cells[key].dispose();
				delete this.cells[key];
			}
		}
		const cameraCellPos = new mod_babylon["y" /* Vector2 */](Math.round(this.cameraStick.x/this.CELL_SIZE-0.5),Math.round(this.cameraStick.y/this.CELL_SIZE-0.5));
		cellsToLoad.sort((a,b)=>mod_babylon["y" /* Vector2 */].DistanceSquared(a,cameraCellPos)-mod_babylon["y" /* Vector2 */].DistanceSquared(b,cameraCellPos));
		if(this.mapReady){
			cellsToLoad.length=Math.min(25,cellsToLoad.length);
		}
		for (const cellpos of cellsToLoad){
			let {x:cx,y:cy} = cellpos;
			await this.loadMapCell(cx,cy);
			if(this.mapReady){ await Object(util["w" /* sleep */])(10); }
			if(!this.mapLoaded){ this.endMapUpdate(); return; }
		}
		this.endMapUpdate();
	},

	endMapUpdate(){
		this.mapUpdating=false;
		this.mapReady=true;
	},

	async loadMapCell(cx,cy){
		const key = [cx,cy].toString();
		if(key in this.cells){ return; }
		const cell = new mapCell_MapCell(cx,cy);
		this.cells[key]=cell;
		await cell.load();
	},

	_cellsNeedingIntensiveUpdate:[],
	intensiveUpdate(){
		if(this._cellsNeedingIntensiveUpdate.length===0){ return; }
		const now = performance.now();
		let cell,index=null;
		for (cell of this._cellsNeedingIntensiveUpdate){
			if(now-cell._lastIntensiveUpdate<=300){ continue; }
			index=this._cellsNeedingIntensiveUpdate.indexOf(cell);
			break;
		}
		if(index==null||index<0){ return; }
		this._cellsNeedingIntensiveUpdate.splice(index,1);
		cell._lastIntensiveUpdate=now;
		cell._needsIntensiveUpdate=false;
		for(let character of cell.characters){
			character.intensiveUpdate();
		}
		mv3d["a" /* default */].scene.sortLightsByPriority();
	}

});
// CONCATENATED MODULE: ./src/assets.js




Object.assign(mv3d["a" /* default */],{

	animatedTextures:[],
	textureCache:{},
	materialCache:{},

	async createTexture(url){
		const textureUrl = await this.getTextureUrl(url);
		const texture = new BABYLON.Texture(textureUrl,mv3d["a" /* default */].scene,!mv3d["a" /* default */].MIPMAP,true,BABYLON.Texture.NEAREST_SAMPLINGMODE);
		return texture;
	},

	async getTextureUrl(url){
		const bitmap = ImageManager.loadNormalBitmap(encodeURI(url));
		if(Decrypter.hasEncryptedImages){
			await mv3d["a" /* default */].waitBitmapLoaded(bitmap);
			return bitmap.canvas.toDataURL();
		}else{
			return bitmap._image.src;
		}
	},

	waitTextureLoaded(texture){return new Promise((resolve,reject)=>{
		if(texture.isReady()){ resolve(); }
		texture.onLoadObservable.addOnce(()=>{
			resolve();
		});
	})},

	waitBitmapLoaded(bitmap){
		return new Promise(resolve=>bitmap.addLoadListener(resolve));
	},

	async getCachedTilesetTexture(setN,animX=0,animY=0){
		const key = `TS:${setN}|${animX},${animY}`;
		if(key in this.textureCache){
			return this.textureCache[key];
		}
		const tsName = $gameMap.tileset().tilesetNames[setN];
		if(!tsName){
			return await this.getErrorTexture();
		}
		//const textureSrc=`img/tilesets/${tsName}.png`;
		const textureSrc=ImageManager.loadTileset(tsName)._url;
		const texture = await this.createTexture(textureSrc);
		texture.hasAlpha=true;
		this.textureCache[key]=texture;

		await this.waitTextureLoaded(texture);

		if(this.textureCache[key]!==texture){ return await this.getErrorTexture(); }
		texture.updateSamplingMode(1);
		if(animX||animY){
			const { width, height } = texture.getBaseSize();
			texture.frameData={x:0,y:0,w:width,h:height};
			texture.animX = animX;
			texture.animY = animY;
			this.animatedTextures.push(texture);
		}
		return texture;
		
	},

	async getErrorTexture(){
		if(this.errorTexture){ return this.errorTexture; }
		this.errorTexture = await this.createTexture(`${mv3d["a" /* default */].MV3D_FOLDER}/errorTexture.png`);
		this.errorTexture.isError=true;
		this.errorTexture.dispose=()=>{};
		return this.errorTexture;
	},

	async getBushAlphaTexture(){
		if(this.bushAlphaTexture){ return this.bushAlphaTexture; }
		this.getBushAlphaTexture.getting=true;
		this.bushAlphaTexture = await this.createTexture(`${mv3d["a" /* default */].MV3D_FOLDER}/bushAlpha.png`);
		this.bushAlphaTexture.getAlphaFromRGB=true;
		this.bushAlphaTexture.dispose=()=>{};
		this.getBushAlphaTexture.getting=false;
		return this.bushAlphaTexture;
	},
	getBushAlphaTextureSync(){
		if(this.bushAlphaTexture){ return this.bushAlphaTexture; }
		if(!this.getBushAlphaTexture.getting){
			this.getBushAlphaTexture();
		}
		return null;
	},

	async getCachedTilesetMaterial(setN,animX=0,animY=0,options={}){
		this.processMaterialOptions(options);
		const key = `TS:${setN}|${animX},${animY}|${this.getExtraBit(options)}`;
		if(key in this.materialCache){
			return this.materialCache[key];
		}
		const texture = await this.getCachedTilesetTexture(setN,animX,animY);
		const material = new mod_babylon["v" /* StandardMaterial */](key, this.scene);
		material.diffuseTexture=texture;
		if(options.transparent){
			material.opacityTexture=texture;
			material.alpha=options.alpha;
		}
		if(options.through){
			material.mv3d_through=true;
		}
		material.mv3d_noShadow=!options.shadow;
		material.alphaCutOff = mv3d["a" /* default */].ALPHA_CUTOFF;
		material.ambientColor.set(1,1,1);
		material.mv3d_glowColor=options.glow;
		material.emissiveColor.copyFrom(options.glow);
		material.specularColor.set(0,0,0);
		material.backFaceCulling=options.backfaceCulling;
		if(!isNaN(this.LIGHT_LIMIT)){ material.maxSimultaneousLights=this.LIGHT_LIMIT; }
		this.materialCache[key]=material;
		return material;
	},

	async getCachedTilesetMaterialForTile(tileConf,side){
		const setN = mv3d["a" /* default */].getSetNumber(tileConf[`${side}_id`]);
		const options = mv3d["a" /* default */].getMaterialOptions(tileConf,side);
		const animData = mv3d["a" /* default */].getTileAnimationData(tileConf,side);
		//console.log(options);
		return await mv3d["a" /* default */].getCachedTilesetMaterial(setN,animData.animX,animData.animY,options);
	},

	processMaterialOptions(options){
		if('alpha' in options){
			options.alpha = Math.round(options.alpha*7)/7;
			if(options.alph<1){
				options.transparent=true;
			}
		}else{ options.alpha=1; }
		if('glow' in options){
			options.glow.r = Object(util["A" /* unround */])(options.glow.r,255);
			options.glow.g = Object(util["A" /* unround */])(options.glow.g,255);
			options.glow.b = Object(util["A" /* unround */])(options.glow.b,255);
			options.glow.a = Object(util["A" /* unround */])(options.glow.a,7);
		}else{ options.glow=new mod_babylon["c" /* Color4 */](0,0,0,0); }
		if(!('shadow' in options)){options.shadow=true;}
		if(!('backfaceCulling' in options)){ options.backfaceCulling = mv3d["a" /* default */].BACKFACE_CULLING; }
	},

	getExtraBit(options){
		let extra = 0;
		extra|=Boolean(options.transparent)<<0;
		extra|=7-options.alpha*7<<1;
		extra|=(!options.shadow)<<4;
		extra|=options.glow.a*7<<5;
		extra|=options.glow.toNumber()<<8;
		//out of bits.
		let string = extra.toString(36);
		extra = 0;
		extra|=Boolean(options.through)<<0;
		extra|=(!options.backfaceCulling)<<1;
		string += ','+extra.toString(36);
		return string;
	},

	// animations

	lastAnimUpdate:0,
	animXFrame:0,
	animYFrame:0,
	animDirection:1,
	updateAnimations(){
		if( performance.now()-this.lastAnimUpdate <= this.ANIM_DELAY){ return; }
		this.lastAnimUpdate=performance.now();

		if(this.animXFrame<=0){
			this.animDirection=1;
		}else if(this.animXFrame>=2){
			this.animDirection=-1;
		}
		this.animXFrame += this.animDirection;
		this.animYFrame=(this.animYFrame+1)%3;
		for (const texture of this.animatedTextures){
			texture.crop(
				texture.frameData.x+texture.animX*this.animXFrame*Object(util["z" /* tileWidth */])(),
				texture.frameData.y+texture.animY*this.animYFrame*Object(util["x" /* tileHeight */])(),
				texture.frameData.w,
				texture.frameData.h,
				true
			);
		}
	},

});
// CONCATENATED MODULE: ./src/characters.js





Object.assign(mv3d["a" /* default */],{
	createCharacters(){
		const events = $gameMap.events();
		for (const event of events){
			this.createCharacterFor(event,0);
		}
		const vehicles = $gameMap.vehicles();
		for (const vehicle of vehicles){
			this.createCharacterFor(vehicle,1);
		}
		const followers = $gamePlayer.followers()._data;
		for (let f=followers.length-1; f>=0; --f){
			this.createCharacterFor(followers[f],29-f);
		}
		this.createCharacterFor($gamePlayer,30);
	},

	createCharacterFor(char,order){
		if(!char.mv3d_sprite){
			const sprite = new characters_Character(char,order);
			Object.defineProperty(char,'mv3d_sprite',{
				value:sprite,
				enumerable:false,
				configurable:true,
			});
			this.characters.push(sprite);
			return sprite;
		}
		return char.mv3d_sprite;
	},

	updateCharacters(){
		for (let i=this.characters.length-1; i>=0; --i){
			this.characters[i].update();
		}
	},

	setupSpriteMeshes(){
		this.Meshes = characters_Sprite.Meshes = {};
		characters_Sprite.Meshes.BASIC=mod_babylon["l" /* MeshBuilder */].CreatePlane('sprite mesh',{ sideOrientation: mod_babylon["d" /* DOUBLESIDE */]},mv3d["a" /* default */].scene);
		characters_Sprite.Meshes.FLAT=mod_babylon["k" /* Mesh */].MergeMeshes([characters_Sprite.Meshes.BASIC.clone().rotate(util["b" /* XAxis */],Math.PI/2,mod_babylon["B" /* WORLDSPACE */])]);
		characters_Sprite.Meshes.SPRITE=mod_babylon["k" /* Mesh */].MergeMeshes([characters_Sprite.Meshes.BASIC.clone().translate(util["c" /* YAxis */],0.5,mod_babylon["B" /* WORLDSPACE */])]);
		characters_Sprite.Meshes.CROSS=mod_babylon["k" /* Mesh */].MergeMeshes([
			characters_Sprite.Meshes.SPRITE.clone(),
			characters_Sprite.Meshes.SPRITE.clone().rotate(util["c" /* YAxis */],Math.PI/2,mod_babylon["B" /* WORLDSPACE */]),
		]);
		for (const key in characters_Sprite.Meshes){
			characters_Sprite.Meshes[key].renderingGroupId=mv3d["a" /* default */].enumRenderGroups.MAIN;
			mv3d["a" /* default */].scene.removeMesh(characters_Sprite.Meshes[key]);
		}
	},

	async getShadowMaterial(){
		if(this._shadowMaterial){ return this._shadowMaterial; }
		const shadowTexture = await mv3d["a" /* default */].createTexture(`${mv3d["a" /* default */].MV3D_FOLDER}/shadow.png`);
		const shadowMaterial = new mod_babylon["v" /* StandardMaterial */]('shadow material', mv3d["a" /* default */].scene);
		this._shadowMaterial=shadowMaterial;
		shadowMaterial.diffuseTexture=shadowTexture;
		shadowMaterial.opacityTexture=shadowTexture;
		shadowMaterial.specularColor.set(0,0,0);
		shadowMaterial.dispose=()=>{};
		return shadowMaterial;
	},
	async getShadowMesh(){
		let shadowMesh;
		while(this.getShadowMesh.getting){ await Object(util["w" /* sleep */])(100); }
		if(this._shadowMesh){ shadowMesh=this._shadowMesh}
		else{
			this.getShadowMesh.getting=true;
			shadowMesh=characters_Sprite.Meshes.FLAT.clone('shadow mesh');
			shadowMesh.material=await this.getShadowMaterial();
			this._shadowMesh=shadowMesh;
			mv3d["a" /* default */].scene.removeMesh(shadowMesh);
			this.getShadowMesh.getting=false;
		}
		return shadowMesh.clone();
	},

	ACTOR_SETTINGS: [],
});

class characters_Sprite extends mod_babylon["x" /* TransformNode */]{
	constructor(){
		super('sprite',mv3d["a" /* default */].scene);
		this.spriteOrigin = new mod_babylon["x" /* TransformNode */]('sprite origin',mv3d["a" /* default */].scene);
		this.spriteOrigin.parent=this;
		this.mesh = characters_Sprite.Meshes.FLAT.clone();
		this.mesh.parent = this.spriteOrigin;
		this.textureLoaded=false;
	}
	async setMaterial(src){
		let newTexture;
		if(src==='error'){
			newTexture = await mv3d["a" /* default */].getErrorTexture();
		}else{
			newTexture = await mv3d["a" /* default */].createTexture(src);
		}
		await this.waitTextureLoaded(newTexture);
		this.disposeMaterial();
		this.texture = newTexture;
		this.texture.hasAlpha=true;
		this.onTextureLoaded();
		this.material = new mod_babylon["v" /* StandardMaterial */]('sprite material',mv3d["a" /* default */].scene);
		this.material.diffuseTexture=this.texture;
		this.material.alphaCutOff = mv3d["a" /* default */].ALPHA_CUTOFF;
		this.material.ambientColor.set(1,1,1);
		this.material.specularColor.set(0,0,0);
		if(!isNaN(this.LIGHT_LIMIT)){ this.material.maxSimultaneousLights=this.LIGHT_LIMIT; }
		this.mesh.material=this.material;
	}
	async waitTextureLoaded(texture=this.texture){
		await mv3d["a" /* default */].waitTextureLoaded(texture);
	}
	onTextureLoaded(){
		this.texture.updateSamplingMode(1);
		this.textureLoaded=true;
	}
	disposeMaterial(){
		if(this.material){
			this.material.dispose();
			this.texture.dispose();
			this.material=null;
			this.texture=null;
		}
	}
	dispose(...args){
		this.disposeMaterial();
		super.dispose(...args);
	}
}

const z_descriptor = {
	configurable: true,
	enumerable:false,
	get(){ return this._mv3d_z; },
	set(v){
		this._mv3d_z=v;
		if(this.mv3d_sprite){ this.mv3d_sprite.position.y=v; }
	}
}
const z_descriptor2 = {
	configurable: true,
	enumerable:false,
	get(){ return this.char._mv3d_z; },
	set(v){
		this.char._mv3d_z=v;
		this.position.y=v;
	}
}

class characters_Character extends characters_Sprite{
	constructor(char,order){
		super();
		this.order=order;
		this.mesh.order=this.order;
		this.mesh.character=this;
		this._character=this.char=char;
		this.charName='';
		this.charIndex=0;
		
		if(this.char.mv_sprite){
			this.char.mv_sprite.updateBitmap();
		}

		if(!this.char.mv3d_settings){ this.char.mv3d_settings={}; }
		if(!this.char.mv3d_blenders){ this.char.mv3d_blenders={}; }

		this.isVehicle = this.char instanceof Game_Vehicle;
		this.isBoat = this.isVehicle && this.char.isBoat();
		this.isShip = this.isVehicle && this.char.isShip();
		this.isAirship = this.isVehicle && this.char.isAirship();
		this.isEvent = this.char instanceof Game_Event;
		this.isPlayer = this.char instanceof Game_Player;
		this.isFollower = this.char instanceof Game_Follower;

		this.updateCharacter();
		this.updateShape();

		if(!('_mv3d_z' in this.char)){
			this.char._mv3d_z = mv3d["a" /* default */].getWalkHeight(this.char.x,this.char.y);
		}
		Object.defineProperty(this.char,'z',z_descriptor);
		Object.defineProperty(this,'z',z_descriptor2);
		this.z=this.z;
		this.platformHeight = this.z;
		this.targetElevation = this.z;
		this.prevZ = this.z;
		this.needsPositionUpdate=true;
		this.needsMaterialUpdate=true;
		//this.elevation = 0;

		mv3d["a" /* default */].getShadowMesh().then(shadow=>{
			this.shadow = shadow;
			this.shadow.parent = this;
		});

		this.blendElevation = this.makeBlender('elevation',0);

		this.lightOrigin = new mod_babylon["x" /* TransformNode */]('light origin',mv3d["a" /* default */].scene);
		this.lightOrigin.parent=this;
		this.setupLights();
		
		if(this.isEvent){
			this.eventConfigure();
		}else{
			this.initialConfigure();
			this.needsMaterialUpdate=true;
		}

		this.intensiveUpdate();
	}

	get settings(){ return this.char.mv3d_settings; }

	isBitmapReady(){
		return Boolean(this.bitmap && this.bitmap.isReady() && !this._waitingForBitmap);
	}

	isTextureReady(){
		return Boolean(
			this.texture && this.texture.isReady() && this.isBitmapReady()
		);
	}

	get mv_sprite(){
		return this.char.mv_sprite||{};
	}
	get bitmap(){
		return this.mv_sprite.bitmap;
	}

	setTileMaterial(){
		const setN = mv3d["a" /* default */].getSetNumber(this._tileId);
		const tsName = $gameMap.tileset().tilesetNames[setN];
		if(tsName){
			//const textureSrc=`img/tilesets/${tsName}.png`;
			const textureSrc=ImageManager.loadTileset(tsName)._url;
			this.setMaterial(textureSrc);
		}else{
			this.setMaterial("error");
		}
	}

	async waitBitmapLoaded(){
		if(!this.char.mv_sprite){
			await Object(util["w" /* sleep */])();
			if(!this.char.mv_sprite){
				console.warn('mv_sprite is undefined');
				return;
			}
		}
		this._waitingForBitmap=true;
		this.char.mv_sprite.updateBitmap();
		await mv3d["a" /* default */].waitBitmapLoaded(this.char.mv_sprite.bitmap);
		this._waitingForBitmap=false;
	}

	async waitTextureLoaded(texture=this.texture){
		await this.waitBitmapLoaded();
		await super.waitTextureLoaded(texture);
	}

	onTextureLoaded(){
		super.onTextureLoaded();
		//this.updateFrame();
		this.updateScale();
		this.needsMaterialUpdate=true;
	}

	isImageChanged(){
		return (this._tilesetId !== $gameMap.tilesetId()
		||this._tileId !== this._character.tileId()
		||this._characterName !== this._character.characterName()
		//||this._characterIndex !== this._character.characterIndex()
		);
	}
	updateCharacter(){
		this.needsPositionUpdate=true;
		this._tilesetId = $gameMap.tilesetId();
		this._tileId = this._character.tileId();
		this._characterName = this._character.characterName();
		this._characterIndex = this._character.characterIndex();
		this._isBigCharacter = ImageManager.isBigCharacter(this._characterName);
		this.isEmpty=false;
		this.mesh.setEnabled(true);
		if(this._tileId>0){
			this.setTileMaterial(this._tileId);
		}else if(this._characterName){
			this.setMaterial(`img/characters/${this._characterName}.png`);
		}else{
			this.isEmpty=true;
			this.textureLoaded=false;
			this.disposeMaterial();
			this.mesh.setEnabled(false);
			this.spriteWidth=1;
			this.spriteHeight=1;
			this.updateScale();
		}
	}
	setFrame(x,y,w,h){
		if(!this.isTextureReady()){ return; }
		this.texture.crop(x,y,w,h,this._tileId>0);
	}

	async updateScale(){
		if(this.isEmpty){
			this.spriteWidth=1;
			this.spriteHeight=1;
			this.mesh.scaling.set(1,1,1);
			return;
		}
		if(!this.isBitmapReady()){ await this.waitBitmapLoaded(); }
		this.mv_sprite.updateBitmap();
		const configScale = this.getConfig('scale',new mod_babylon["y" /* Vector2 */](1,1));
		this.spriteWidth=this.mv_sprite.patternWidth()/Object(util["y" /* tileSize */])() * configScale.x;
		this.spriteHeight=this.mv_sprite.patternHeight()/Object(util["y" /* tileSize */])() * configScale.y;
		const xscale = this.spriteWidth;
		const yscale = this.spriteHeight;

		this.mesh.scaling.set(xscale,yscale,yscale);
	}

	getDefaultConfigObject(){
		if(this.isVehicle){
			return mv3d["a" /* default */][`${this.char._type.toUpperCase()}_SETTINGS`].conf;
		}
		if(this.char.isTile()){
			return mv3d["a" /* default */].EVENT_TILE_SETTINGS;
		}else if(this.isEvent && this.char.isObjectCharacter()){
			return mv3d["a" /* default */].EVENT_OBJ_SETTINGS;
		}else{
			return mv3d["a" /* default */].EVENT_CHAR_SETTINGS;
		}
	}

	getActorConfigObject(){
		const id = $gameParty._actors[ this.isFollower ? this.char._memberIndex : 0 ];
		if(!id){ return {}; }
		if(!(id in mv3d["a" /* default */].ACTOR_SETTINGS)){
			const data = $dataActors[id];
			mv3d["a" /* default */].ACTOR_SETTINGS[id]=mv3d["a" /* default */].readConfigurationFunctions(
				mv3d["a" /* default */].readConfigurationBlocksAndTags(data.note),
				mv3d["a" /* default */].eventConfigurationFunctions
			);
		}
		return mv3d["a" /* default */].ACTOR_SETTINGS[id];
	}

	getConfig(key,dfault=undefined){
		if(key in this.settings){ return this.settings[key]; }
		if(this.isEvent){
			if(this.settings_event_page && key in this.settings_event_page){
				return this.settings_event_page[key];
			}else if(this.settings_event && key in this.settings_event){
				return this.settings_event[key];
			}
		}else if(this.isPlayer||this.isFollower){
			const ACTOR_SETTINGS = this.getActorConfigObject();
			if(key in ACTOR_SETTINGS){
				return ACTOR_SETTINGS[key];
			}
		}
		const EVENT_SETTINGS = this.getDefaultConfigObject();
		if(key in EVENT_SETTINGS){
			return EVENT_SETTINGS[key];
		}
		return dfault;
	}
	hasConfig(key){
		return key in this.settings
		||this.isEvent &&
			(this.settings_event_page && key in this.settings_event_page
			|| this.settings_event && key in this.settings_event)
		|| (this.isPlayer||this.isFollower) && key in this.getActorConfigObject()
		|| key in this.getDefaultConfigObject();
	}

	eventConfigure(){
		if(!this.settings_event){
			this.settings_event={};
			const note = this.char.event().note;
			mv3d["a" /* default */].readConfigurationFunctions(
				mv3d["a" /* default */].readConfigurationTags(note),
				mv3d["a" /* default */].eventConfigurationFunctions,
				this.settings_event,
			);

			this.initialConfigure();
		}
		this.settings_event_page={};
		const page = this.char.page();
		if(!page){ return; }
		let comments = '';
		for (const command of page.list){
			if(command.code===108||command.code===408){
				comments+=command.parameters[0];
			}
		}
		mv3d["a" /* default */].readConfigurationFunctions(
			mv3d["a" /* default */].readConfigurationTags(comments),
			mv3d["a" /* default */].eventConfigurationFunctions,
			this.settings_event_page,
		);
		this.updateScale();
		this.updateShape();

		if(this.char.mv3d_needsConfigure){
			this.char.mv3d_needsConfigure=false;
			this.needsPositionUpdate=true;
		}else{ return; }

		this.pageConfigure();

	}

	initialConfigure(){
		this.configureHeight();
	}

	pageConfigure(settings=this.settings_event_page){
		const transient = settings===this.settings;
		if('pos' in settings){
			const event=this.char.event();
			const pos = settings;
			this.char.locate(
				Object(util["u" /* relativeNumber */])(event.x,pos.x),
				Object(util["u" /* relativeNumber */])(event.y,pos.y),
			);
			if(transient)delete settings.pos;
		}
		this.setupEventLights();

		if(this.lamp){
			if('lamp' in settings){
				const lampConfig = this.getConfig('lamp');
				this.blendLampColor.setValue(lampConfig.color,0.5);
				this.blendLampIntensity.setValue(lampConfig.intensity,0.5);
				this.blendLampDistance.setValue(lampConfig.distance,0.5);
			}
			if(transient)delete settings.lamp;
		}
		if(this.flashlight){
			if('flashlight' in settings){
				const flashlightConfig = this.getConfig('flashlight');
				this.blendFlashlightColor.setValue(flashlightConfig.color,0.5);
				this.blendFlashlightIntensity.setValue(flashlightConfig.intensity,0.5);
				this.blendFlashlightDistance.setValue(flashlightConfig.distance,0.5);
				this.blendFlashlightAngle.setValue(flashlightConfig.angle,0.5);
				if(transient)delete settings.flashlight;
			}
			if('flashlightPitch' in settings){
				this.blendFlashlightPitch.setValue(this.getConfig('flashlightPitch',90),0.25);
				if(transient)delete settings.flashlightPitch;
			}
		}
		if('height' in settings || this.isAbove!==(this.char._priorityType===2)){
			this.configureHeight();
			if(transient)delete settings.height;
		}

		this.updateScale();
		this.updateShape();
		this.needsMaterialUpdate=true;
		this.updateLightOffsets();
	}

	updateEmissive(){
		if(!this.material){ return; }
		const emissiveColor = this.material.emissiveColor;
		const glow = this.getConfig('glow', new mod_babylon["c" /* Color4 */](0,0,0,0));
		this.material.mv3d_glowColor=glow;
		if(this.lamp){
			const lampColor=this.lamp.diffuse;
			const intensity = Math.max(0,Math.min(1,this.lamp.intensity,this.lamp.range,this.lamp.intensity/4+this.lamp.range/4));
			emissiveColor.set(
				Math.max(glow.r,lampColor.r*intensity),
				Math.max(glow.g,lampColor.g*intensity),
				Math.max(glow.b,lampColor.b*intensity)
			);
		}else{
			emissiveColor.set(glow.r,glow.g,glow.b);
		}
		const blendColor = this.mv_sprite._blendColor;
		const blendAlpha=blendColor[3]/255;
		emissiveColor.r+=(2-emissiveColor.r)*Math.pow(blendColor[0]/255*blendAlpha,0.5);
		emissiveColor.g+=(2-emissiveColor.g)*Math.pow(blendColor[1]/255*blendAlpha,0.5);
		emissiveColor.b+=(2-emissiveColor.b)*Math.pow(blendColor[2]/255*blendAlpha,0.5);

		this.material.mv3d_noShadow=!this.getConfig('dynShadow',true);
	}

	configureHeight(){
		this.isAbove = this.char._priorityType===2;
		let height = Math.max(0, this.getConfig('height',this.isAbove&&!this.hasConfig('zlock')?mv3d["a" /* default */].EVENT_HEIGHT:0) );
		this.blendElevation.setValue(height,0);
		this.z = this.platformHeight + height;
	}

	setupMesh(){
		if(!this.mesh.mv3d_isSetup){
			mv3d["a" /* default */].callFeatures('createCharMesh',this.mesh);
			this.mesh.parent = this.spriteOrigin;
			this.mesh.character=this;
			this.mesh.order=this.order;
			if(this.material){
				this.mesh.material=this.material;
			}
			if(this.isEmpty){
				this.mesh.setEnabled(false);
			}else{
				this.mesh.setEnabled(true);
			}
			this.mesh.mv3d_isSetup=true;
		}
		if(this.flashlight){
			this.flashlight.excludedMeshes.splice(0,Infinity);
			this.flashlight.excludedMeshes.push(this.mesh);
		}
	}

	dirtyNearbyCells(){
		if(!this.cell){ return; }
		characters_Character.dirtyNearbyCells(this.cell.cx,this.cell.cy);
	}
	static dirtyNearbyCells(cx,cy){
		for(let ix=cx-1; ix<=cx+1; ++ix)
		for(let iy=cy-1; iy<=cy+1; ++iy){
			let x=ix, y=iy;
			if(mv3d["a" /* default */].loopHorizontal()){ x=x.mod(Math.ceil(mv3d["a" /* default */].mapWidth()/mv3d["a" /* default */].CELL_SIZE)); }
			if(mv3d["a" /* default */].loopVertical()){ y=y.mod(Math.ceil(mv3d["a" /* default */].mapHeight()/mv3d["a" /* default */].CELL_SIZE)); }
			const cell = mv3d["a" /* default */].cells[[x,y]];
			if(!cell){ continue; }
			if(!cell._needsIntensiveUpdate){
				cell._needsIntensiveUpdate=true;
				mv3d["a" /* default */]._cellsNeedingIntensiveUpdate.push(cell);
			}
		}
	}

	intensiveUpdate(){
		this.setupLightInclusionLists();
	}

	setupLightInclusionLists(){
		if(this.flashlight){
			this.flashlight.includedOnlyMeshes.splice(0,Infinity);
			this.flashlight.includedOnlyMeshes.push(...this.getMeshesInRangeOfLight(this.flashlight));
		}
		if(this.lamp){
			this.lamp.includedOnlyMeshes.splice(0,Infinity);
			this.lamp.includedOnlyMeshes.push(...this.getMeshesInRangeOfLight(this.lamp));
		}
	}

	getMeshesInRangeOfLight(light){
		if(!this.cell){ return []; }
		const pos = mod_babylon["z" /* Vector3 */].TransformCoordinates(light.position,light.getWorldMatrix());
		const meshes=[];
		for(let _cx=this.cell.cx-1; _cx<=this.cell.cx+1; ++_cx)
		for(let _cy=this.cell.cy-1; _cy<=this.cell.cy+1; ++_cy){
			let cx=_cx, cy=_cy;
			if(mv3d["a" /* default */].loopHorizontal()){ cx=cx.mod(Math.ceil(mv3d["a" /* default */].mapWidth()/mv3d["a" /* default */].CELL_SIZE)); }
			if(mv3d["a" /* default */].loopVertical()){ cy=cy.mod(Math.ceil(mv3d["a" /* default */].mapHeight()/mv3d["a" /* default */].CELL_SIZE)); }
			const cell = mv3d["a" /* default */].cells[[cx,cy]];
			if(!cell||!cell.mesh){ continue; }
			const sphere = cell.mesh.getBoundingInfo().boundingSphere;
			const dist = mod_babylon["z" /* Vector3 */].Distance(pos,sphere.centerWorld);
			if(dist>=sphere.radiusWorld+light.range){ continue; }
			meshes.push(cell.mesh);
			for(let character of cell.characters){
				const sphere = character.mesh.getBoundingInfo().boundingSphere;
				const dist = mod_babylon["z" /* Vector3 */].Distance(pos,sphere.centerWorld);
				if(dist>=sphere.radiusWorld+light.range){ continue; }
				meshes.push(character.mesh);
			}
		}
		return meshes;
	}

	setupEventLights(){
		const flashlightConfig = this.getConfig('flashlight');
		const lampConfig = this.getConfig('lamp');
		if(flashlightConfig && !this.flashlight){
			this.setupFlashlight();
		}
		if(lampConfig && !this.lamp){
			this.setupLamp();
		}
	}
	setupLights(){
		if('flashlightColor' in this.char.mv3d_blenders){
			this.setupFlashlight();
		}
		if('lampColor' in this.char.mv3d_blenders){
			this.setupLamp();
		}
	}

	setupFlashlight(){
		if(this.flashlight){ return; }
		const config = this.getConfig('flashlight',{
			color:0xffffff,
			intensity:1,
			distance:mv3d["a" /* default */].LIGHT_DIST,
			angle:mv3d["a" /* default */].LIGHT_ANGLE,
		});
		this.blendFlashlightColor = this.makeColorBlender('flashlightColor',config.color);
		this.blendFlashlightIntensity = this.makeBlender('flashlightIntensity',config.intensity);
		this.blendFlashlightDistance = this.makeBlender('flashlightDistance',config.distance);
		const lightDist = this.blendFlashlightDistance.targetValue();
		this.blendFlashlightDistance.setValue(0,0); this.blendFlashlightDistance.setValue(lightDist,0.25);
		this.blendFlashlightAngle = this.makeBlender('flashlightAngle',config.angle);
		this.flashlight = new mod_babylon["u" /* SpotLight */]('flashlight',mod_babylon["z" /* Vector3 */].Zero(),mod_babylon["z" /* Vector3 */].Zero(),
			Object(util["j" /* degtorad */])(this.blendFlashlightAngle.targetValue()+mv3d["a" /* default */].FLASHLIGHT_EXTRA_ANGLE),0,mv3d["a" /* default */].scene);
		this.flashlight.renderPriority=2;
		this.updateFlashlightExp();
		this.flashlight.range = this.blendFlashlightDistance.targetValue();
		this.flashlight.intensity=this.blendFlashlightIntensity.targetValue()*mv3d["a" /* default */].FLASHLIGHT_INTENSITY_MULTIPLIER;
		this.flashlight.diffuse.set(...this.blendFlashlightColor.targetComponents());
		//this.flashlight.projectionTexture = mv3d.getFlashlightTexture();
		this.flashlight.direction.y=-1;
		this.flashlightOrigin=new mod_babylon["x" /* TransformNode */]('flashlight origin',mv3d["a" /* default */].scene);
		this.flashlightOrigin.parent=this.lightOrigin;
		this.flashlight.parent=this.flashlightOrigin;
		this.blendFlashlightPitch = this.makeBlender('flashlightPitch',90);
		this.blendFlashlightYaw = this.makeBlender('flashlightYaw', 0);
		this.blendFlashlightYaw.cycle=360;
		this.updateFlashlightDirection();
		this.setupMesh();
		this.updateLightOffsets();
	}

	updateFlashlightExp(){
		this.flashlight.exponent = 64800*Math.pow(this.blendFlashlightAngle.currentValue(),-2);
	}

	setupLamp(){
		if(this.lamp){ return; }
		const config = this.getConfig('lamp',{
			color:0xffffff,
			intensity:1,
			distance:mv3d["a" /* default */].LIGHT_DIST,
		});
		this.blendLampColor = this.makeColorBlender('lampColor',config.color);
		this.blendLampIntensity = this.makeBlender('lampIntensity',config.intensity);
		this.blendLampDistance = this.makeBlender('lampDistance',config.distance);
		const lightDist = this.blendLampDistance.targetValue();
		this.blendLampDistance.setValue(0,0); this.blendLampDistance.setValue(lightDist,0.25);
		this.lamp = new mod_babylon["q" /* PointLight */]('lamp',mod_babylon["z" /* Vector3 */].Zero(),mv3d["a" /* default */].scene);
		this.lamp.renderPriority=1;
		this.lamp.diffuse.set(...this.blendLampColor.targetComponents());
		this.lamp.intensity=this.blendLampIntensity.targetValue();
		this.lamp.range=this.blendLampDistance.targetValue();
		this.lampOrigin=new mod_babylon["x" /* TransformNode */]('lamp origin',mv3d["a" /* default */].scene);
		this.lampOrigin.parent = this.lightOrigin;
		this.lamp.parent=this.lampOrigin;
		this.updateLightOffsets();
	}

	updateFlashlightDirection(){
		this.flashlightOrigin.yaw=this.blendFlashlightYaw.currentValue();
		this.flashlightOrigin.pitch=-this.blendFlashlightPitch.currentValue();
		//this.flashlightOrigin.position.set(0,0,0);
		//let flashlightOffset = Math.tan(degtorad(90-this.blendFlashlightAngle.currentValue()-Math.max(90,this.blendFlashlightPitch.currentValue())+90))*mv3d.LIGHT_HEIGHT;
		//flashlightOffset = Math.max(0,Math.min(1,flashlightOffset));
		//this.flashlight.range+=flashlightOffset;
		//this.flashlightOrigin.translate(YAxis,flashlightOffset,LOCALSPACE);
	}

	updateLights(){
		if(this.flashlight){
			const flashlightYaw = 180+Object(util["u" /* relativeNumber */])( mv3d["a" /* default */].dirToYaw( this.char.mv3d_direction(),mv3d["a" /* default */].DIR8MOVE ), this.getConfig('flashlightYaw','+0'));
			if(flashlightYaw !== this.blendFlashlightYaw.targetValue()){
				this.blendFlashlightYaw.setValue(flashlightYaw,0.25);
			}
			if(this.blendFlashlightColor.update()|this.blendFlashlightIntensity.update()
			|this.blendFlashlightDistance.update()|this.blendFlashlightAngle.update()
			|this.blendFlashlightYaw.update()|this.blendFlashlightPitch.update()){
				this.flashlight.diffuse.set(...this.blendFlashlightColor.currentComponents());
				this.flashlight.intensity=this.blendFlashlightIntensity.currentValue()*mv3d["a" /* default */].FLASHLIGHT_INTENSITY_MULTIPLIER;
				this.flashlight.range=this.blendFlashlightDistance.currentValue();
				this.flashlight.angle=Object(util["j" /* degtorad */])(this.blendFlashlightAngle.currentValue()+mv3d["a" /* default */].FLASHLIGHT_EXTRA_ANGLE);
				this.updateFlashlightExp();
				this.updateFlashlightDirection();
			}
		}
		if(this.lamp){
			if(this.blendLampColor.update()|this.blendLampIntensity.update()|this.blendLampDistance.update()){
				this.lamp.diffuse.set(...this.blendLampColor.currentComponents());
				this.lamp.intensity=this.blendLampIntensity.currentValue();
				this.lamp.range=this.blendLampDistance.currentValue();
				this.needsMaterialUpdate=true;
			}
		}
	}

	makeBlender(key,dfault,clazz=blenders_Blender){
		if(key in this.char.mv3d_blenders){
			dfault = this.char.mv3d_blenders[key];
		}else{
			this.char.mv3d_blenders[key]=dfault;
		}
		const blender=new clazz(key,dfault,false);
		blender.storageLocation=()=>this.char.mv3d_blenders;
		return blender;
	}
	makeColorBlender(key,dfault){
		return this.makeBlender(key,dfault,ColorBlender);
	}

	hasBush(){
		if(this.platformChar){ return false; }
		return this.getConfig('bush',!(
			this.char.isTile() || this.isVehicle
			|| this.isEvent && this.char.isObjectCharacter()
		))&&!(this.blendElevation.currentValue()||this.falling);
	}

	getShape(){
		return this.getConfig('shape', mv3d["a" /* default */].enumShapes.SPRITE );
	}
	updateShape(){
		const newshape = this.getShape();
		if(this.shape === newshape){ return; }
		this.shape=newshape;
		//let backfaceCulling=true;
		let geometry = characters_Sprite.Meshes.SPRITE;
		const shapes = mv3d["a" /* default */].enumShapes;
		switch(this.shape){
		case shapes.FLAT:
			geometry = characters_Sprite.Meshes.FLAT;
			//if(this.char._priorityType===2||this.hasConfig('height')||this.hasConfig('z')){
			//	backfaceCulling=false;
			//}
			break;
		case shapes.XCROSS:
		case shapes.CROSS:
			geometry = characters_Sprite.Meshes.CROSS;
			//backfaceCulling=false;
			break;
		case shapes.WALL:
		case shapes.FENCE:
			//backfaceCulling=false;
			break;
		}
		mv3d["a" /* default */].callFeatures('destroyCharMesh',this.mesh);
		this.mesh.dispose();
		this.mesh=geometry.clone();
		//this.material.backfaceCulling=backfaceCulling;
		this.setupMesh();
		this.spriteOrigin.rotation.set(0,0,0);
		this.dirtyNearbyCells();
	}

	update(){
		if(this.char._erased){
			this.dispose();
		}


		this.visible=this.mv_sprite.visible;
		if(typeof this.char.isVisible === 'function'){
			this.visible=this.visible&&this.char.isVisible();
		}
		const inRenderDist = this.char.mv3d_inRenderDist();
		this.disabled=!this.visible;
		if(this.char.isTransparent() || !inRenderDist
		|| (this.char._characterName||this.char._tileId)&&!this.textureLoaded){
			this.visible=false;
		}
		if(!this._isEnabled){
			if(this.visible){ this.setEnabled(true); this.needsPositionUpdate=true; }
		}else{
			if(!this.visible){ this.setEnabled(false); }
		}

		if(this.isImageChanged()){
			this.updateCharacter();
		}
		//if(this.patternChanged()){
		//	this.updateFrame();
		//}

		if(!inRenderDist){
			//this.updateAnimations();
			return;
		}

		if(this.blendElevation.update()){
			this.needsPositionUpdate=true;
		}else if(this.x!==this.char._realX || this.y!==this.char._realY
		|| this.falling || this.prevZ !== this.z
		|| this.platformChar&&this.platformChar.needsPositionUpdate
		|| this.isPlayer || this.char===$gamePlayer.vehicle()
		){
			this.needsPositionUpdate=true;
			this.prevZ = this.z;
		}

		if(this.material && this._isEnabled){
			this.updateNormal();
		}else{
			this.updateEmpty();
		}
		this.updateAnimations();
		if(this.needsMaterialUpdate){
			this.updateEmissive();
			this.needsMaterialUpdate=false;
		}
		this.char.mv3d_positionUpdated=this.needsPositionUpdate;
		this.needsPositionUpdate=false;
		//this.mesh.renderOutline=true;
		//this.mesh.outlineWidth=1;
	}
	//get needsPositionUpdate(){return this._needsPositionUpdate; }
	//set needsPositionUpdate(v){ this._needsPositionUpdate=v; }

	updateNormal(){
		const shapes = mv3d["a" /* default */].enumShapes;
		if(this.shape===shapes.SPRITE){
			this.mesh.pitch = mv3d["a" /* default */].blendCameraPitch.currentValue()-90;
			this.mesh.yaw = mv3d["a" /* default */].blendCameraYaw.currentValue();
		}else if(this.shape===shapes.TREE){
			this.spriteOrigin.pitch=this.getConfig('pitch',0);
			this.mesh.yaw = mv3d["a" /* default */].blendCameraYaw.currentValue();
		}else{
			this.mesh.yaw=this.getConfig('rot',0);
			this.spriteOrigin.pitch=this.getConfig('pitch',0);
			this.spriteOrigin.yaw=this.getConfig('yaw',0);
			if(this.shape===shapes.XCROSS){this.mesh.yaw+=45;}
		}

		if(this.isPlayer){
			this.mesh.visibility = +!mv3d["a" /* default */].is1stPerson(true);
		}

		this.updateAlpha();

		this.updatePosition();
		this.updateElevation();
		if(this.shadow){ this.updateShadow(); }
		this.updateLights();
	}

	updateEmpty(){
		this.updatePosition();
		this.updateElevation();
		this.updateLights();
		if(this.shadow&&this.shadow._isEnabled){ this.shadow.setEnabled(false); }
	}

	updateAlpha(){
		let hasAlpha=this.hasConfig('alpha')||this.char.opacity()<255;
		this.bush = Boolean(this.char.bushDepth());
		const blendMode = mv3d["a" /* default */].blendModes[this.char.blendMode()];
		if(this.material.alphaMode!==blendMode){
			this.material.alphaMode=blendMode;
		}
		if(blendMode!==mv3d["a" /* default */].blendModes.NORMAL){
			hasAlpha=true;
		}else if(this.bush && this.hasBush()){
			if(!this.material.opacityTexture){
				const bushAlpha = mv3d["a" /* default */].getBushAlphaTextureSync();
				if(bushAlpha&&bushAlpha.isReady()){
					this.material.opacityTexture=bushAlpha;
				}
			}
		}else{
			if(this.material.opacityTexture){
				this.material.opacityTexture=null;
			}
		}
		if(hasAlpha||this.material.opacityTexture){
			this.material.useAlphaFromDiffuseTexture=true;
			this.material.alpha=this.getConfig('alpha',1)*this.char.opacity()/255;
		}else{
			this.material.useAlphaFromDiffuseTexture=false;
			this.material.alpha=1;
		}
	}

	updateLightOffsets(){
		if(this.lamp){
			const height = this.getConfig('lampHeight',mv3d["a" /* default */].LAMP_HEIGHT);
			const offset = this.getConfig('lampOffset',null);
			this.lampOrigin.position.set(0,0,0);
			this.lampOrigin.z=height;
			if(offset){
				this.lampOrigin.x=offset.x;
				this.lampOrigin.y=offset.y;
			}
		}
		if(this.flashlight){
			const height = this.getConfig('flashlightHeight',mv3d["a" /* default */].FLASHLIGHT_HEIGHT);
			const offset = this.getConfig('flashlightOffset',null);
			this.flashlightOrigin.position.set(0,0,0);
			this.flashlightOrigin.z=height;
			if(offset){
				this.flashlightOrigin.x=offset.x;
				this.flashlightOrigin.y=offset.y;
			}
		}
	}

	updatePositionOffsets(){
		this.spriteOrigin.position.set(0,0,0);
		if(this.shape===mv3d["a" /* default */].enumShapes.FLAT){
			this.spriteOrigin.z = mv3d["a" /* default */].LAYER_DIST*4;
		}else if(this.shape===mv3d["a" /* default */].enumShapes.SPRITE){
			this.spriteOrigin.z = mv3d["a" /* default */].LAYER_DIST*4 * (1-Math.max(0,Math.min(90,mv3d["a" /* default */].blendCameraPitch.currentValue()))/90);
		}else{
			this.spriteOrigin.z = 0;
		}

		const billboardOffset = new mod_babylon["y" /* Vector2 */](Math.sin(-mv3d["a" /* default */].cameraNode.rotation.y),Math.cos(mv3d["a" /* default */].cameraNode.rotation.y));
		this.billboardOffset=billboardOffset;
		if(this.shape===mv3d["a" /* default */].enumShapes.SPRITE){
			this.spriteOrigin.x=billboardOffset.x*mv3d["a" /* default */].SPRITE_OFFSET;
			this.spriteOrigin.y=billboardOffset.y*mv3d["a" /* default */].SPRITE_OFFSET;
			this.lightOrigin.x=this.spriteOrigin.x;
			this.lightOrigin.y=this.spriteOrigin.y;
		}else{
			this.lightOrigin.x=0;
			this.lightOrigin.y=0;
		}

		this.spriteOrigin.x += this.getConfig('xoff',0);
		this.spriteOrigin.y += this.getConfig('yoff',0);
		this.spriteOrigin.z += this.getConfig('zoff',0);
	}

	updatePosition(){
		this.updatePositionOffsets();

		const loopPos = mv3d["a" /* default */].loopCoords(this.char._realX,this.char._realY);
		this.x = loopPos.x;
		this.y = loopPos.y;

		if(!this.needsPositionUpdate) { return; }

		const cellX=Math.floor(Math.round(this.char._realX)/mv3d["a" /* default */].CELL_SIZE);
		const cellY=Math.floor(Math.round(this.char._realY)/mv3d["a" /* default */].CELL_SIZE);
		const cell = mv3d["a" /* default */].cells[[cellX,cellY]];
		if(this.cell&&this.cell!==cell){
			this.removeFromCell();
		}
		if(cell&&!this.cell){
			this.cell=cell;
			cell.characters.push(this);
		}
		this.dirtyNearbyCells();
	}

	updateElevation(){
		if(!this.needsPositionUpdate) { return; }

		//don't update when moving on tile corners
		if(this.char.isMoving() && !((this.x-0.5)%1)&&!((this.y-0.5)%1)){ return; }

		this.falling=false;

		if(this.isPlayer){
			const vehicle = this.char.vehicle();
			if(vehicle){
			//if(vehicle&&vehicle._driving){
				this.z = vehicle.z;
				this.targetElevation = vehicle.targetElevation;
				this.platformChar = vehicle.platformChar;
				this.platformHeight = vehicle.platformHeight;
				if(vehicle._driving){ return; }
			}
		}

		if(this.hasConfig('zlock')){
			this.z=this.getConfig('zlock',0);
			this.z += this.blendElevation.currentValue();
			return;
		}
		
		const platform = this.getPlatform(this.char._realX,this.char._realY);
		this.platform = platform;
		this.platformHeight = platform.z2;
		this.platformChar = platform.char;
		this.targetElevation = this.platformHeight+this.blendElevation.currentValue();
		let gravity = this.getConfig('gravity',mv3d["a" /* default */].GRAVITY)/60;

		this.hasFloat = this.isVehicle || (this.isPlayer||this.isFollower)&&$gamePlayer.vehicle();
		if(this.hasFloat && !this.platformChar){
			this.targetElevation += mv3d["a" /* default */].getFloatHeight(Math.round(this.char._realX),Math.round(this.char._realY),this.z+this.spriteHeight);
		}

		if(this.isAirship && $gamePlayer.vehicle()===this.char){
			this.targetElevation += mv3d["a" /* default */].loadData('airship_height',mv3d["a" /* default */].AIRSHIP_SETTINGS.height)*this.char._altitude/this.char.maxAltitude();
		}

		if(this.char.isJumping()){
			let jumpProgress = 1-(this.char._jumpCount/(this.char._jumpPeak*2));
			let jumpHeight = Math.pow(jumpProgress-0.5,2)*-4+1;
			let jumpDiff = Math.abs(this.char.mv3d_jumpHeightEnd - this.char.mv3d_jumpHeightStart);
			this.z = this.char.mv3d_jumpHeightStart*(1-jumpProgress)
			+ this.char.mv3d_jumpHeightEnd*jumpProgress + jumpHeight*jumpDiff/2
			+this.char.jumpHeight()/Object(util["y" /* tileSize */])();
		}else if(gravity){
			const gap = Math.abs(this.targetElevation-this.z);
			if(gap<gravity){ gravity=gap; }
			//if(this.z>this.targetElevation||this.z<this.platformHeight){
			if(this.z<this.platformHeight){
				this.z=this.platformHeight;
			}
			if(this.z>this.targetElevation){
				this.z-=gravity;
				if(mv3d["a" /* default */].tileCollision(this,this.char._realX,this.char._realY,false,false)){
					this.z=this.platformHeight;
				}
			}else if(this.z<this.targetElevation){
				this.z+=gravity
				if(mv3d["a" /* default */].tileCollision(this,this.char._realX,this.char._realY,false,false)){
					this.z-=gravity;
				}
			}
			this.falling=this.z>this.targetElevation;
		}
		return;
	}

	getPlatform(x=this.char._realX,y=this.char._realY,opts={}){
		return mv3d["a" /* default */].getPlatformForCharacter(this,x,y,opts);
	}

	getPlatformFloat(x=this.char._realX,y=this.char._realY,opts={}){
		if(!opts.platform){ opts.platform = this.getPlatform(x,y,opts); }
		const platform = opts.platform;
		let z = platform.z2;
		if(this.hasFloat&&!platform.char){
			const cHeight = this.getCHeight();
			z += mv3d["a" /* default */].getFloatHeight(Math.round(x),Math.round(y),this.z+Math.max(cHeight,mv3d["a" /* default */].STAIR_THRESH),mv3d["a" /* default */].STAIR_THRESH>=cHeight);
		}
		return z;
	}

	updateShadow(){
		let shadowVisible = Boolean(this.getConfig('shadow', this.shape!=mv3d["a" /* default */].enumShapes.FLAT ));

		if(shadowVisible&&(this.isPlayer||this.isFollower)){
			const myIndex = mv3d["a" /* default */].characters.indexOf(this);
			if(myIndex>=0)
			for (let i=myIndex+1; i<mv3d["a" /* default */].characters.length; ++i){
				const other = mv3d["a" /* default */].characters[i];
				if(!other.shadow||!other.visible){ continue; }
				if(other.char._realX===this.char._realX&&other.char._realY===this.char._realY){
					shadowVisible=false;
					break;
				}
			}
		}
		if(!this.shadow._isEnabled){
			if(shadowVisible){ this.shadow.setEnabled(true); }
		}else{
			if(!shadowVisible){ this.shadow.setEnabled(false); }
		}
		if(!shadowVisible){ return; }

		const shadowDist = Math.max(this.z - this.platformHeight, 0);
		const shadowFadeDist = this.getConfig('shadowDist',4);
		const shadowStrength = Math.max(0,1-Math.abs(shadowDist)/shadowFadeDist);
		this.shadow.z = -shadowDist + mv3d["a" /* default */].LAYER_DIST*3.5;
		this.shadow.x=this.spriteOrigin.x;this.shadow.y=this.spriteOrigin.y;
		const shadowScale = this.getConfig('shadow',1);
		this.shadow.scaling.setAll(shadowScale*shadowStrength);
		if(!this.shadow.isAnInstance){
			this.shadow.visibility=shadowStrength-0.5*this.bush;//visibility doesn't work with instancing
		}
	}

	updateAnimations(){
		if(this.char.isBalloonPlaying()){
			if(!this._balloon){
				this._balloon=mv3d["a" /* default */].showBalloon(this);
			}
			this._balloon.update();
		}else{
			this.disposeBalloon();
		}
		for(const animation of this.char.mv_sprite._animationSprites){
			if(animation.mv3d_animation){
				animation.mv3d_animation.update();
			}
		}
		if(this.char.mv_sprite._animationSprites.length){
			this.needsMaterialUpdate=true;
		}
	}

	disposeBalloon(){
		if(this._balloon){
			this._balloon.dispose();
			this._balloon=null;
		}
	}

	dispose(...args){
		super.dispose(...args);
		delete this.char.mv3d_sprite;
		const index = mv3d["a" /* default */].characters.indexOf(this);
		mv3d["a" /* default */].characters.splice(index,1);
		this.disposeBalloon();
		this.removeFromCell();
	}

	removeFromCell(){
		if(this.cell){
			const index = this.cell.characters.indexOf(this);
			if(index>=0){ this.cell.characters.splice(index,1); }
			this.cell=null;
		}
	}

	getCHeight(){
		let collide = this.getConfig('collide',this.shape===mv3d["a" /* default */].enumShapes.FLAT||this.char._priorityType===0?0:this.spriteHeight);
		return collide===true ? this.spriteHeight : Number(collide);
	}

	getCollider(){
		if(this._collider){ return this._collider; }
		const collider = {char:this};
		this._collider=collider;
		Object.defineProperties(collider,{
			z1:{get:()=>this.z },
			z2:{get:()=>{
				return Math.max(this.z,this.z+this.getCHeight());
			}}
		});
		return collider;
	}
	getTriggerCollider(){
		if(this._triggerCollider){ return this._triggerCollider; }
		const collider = {};
		this._triggerCollider=collider;
		Object.defineProperties(collider,{
			z1:{get:()=>{
				const trigger = this.getConfig('trigger');
				if(trigger){
					return this.z-trigger.down;
				}else if(mv3d["a" /* default */].TRIGGER_INFINITE || this.isEmpty){
					return -Infinity;
				}else{
					return this.getCollider().z1;
				}
			}},
			z2:{get:()=>{
				const trigger = this.getConfig('trigger');
				if(trigger){
					return this.z-trigger.up;
				}else if(mv3d["a" /* default */].TRIGGER_INFINITE || this.isEmpty){
					return Infinity;
				}else{
					return this.getCollider().z2;
				}
			}}
		});
		return collider;
	}

	getCollisionHeight(z=this.z){
		const cHeight=this.getCHeight();
		return {z1:z, z2:z+cHeight, char:this};
	}

	getTriggerHeight(z=this.z){
		const trigger = this.getConfig('trigger');
		if(trigger){
			return {z1:z-trigger.down, z2:z+trigger.up};
		}else if(mv3d["a" /* default */].TRIGGER_INFINITE || this.isEmpty){
			return {z1:-Infinity, z2: Infinity};
		}else{
			return this.getCollisionHeight();
		}
	}
}

Object(util["r" /* override */])(Sprite_Character.prototype,'characterPatternY',o=>function(){
	const sprite = this._character.mv3d_sprite;
	if(!sprite){ return o.apply(this,arguments); }
	const dirfix = sprite.getConfig('dirfix', sprite.isEvent && sprite.char.isObjectCharacter());
	const ddir=this._character.mv3d_direction();
	const useDiagonal = !this._isBigCharacter&&this._characterIndex<4&&this._characterName.includes(mv3d["a" /* default */].DIAG_SYMBOL);
	let dir;
	if(dirfix||mv3d["a" /* default */].isDisabled()){
		if(useDiagonal){ dir=ddir; }
		else{ dir=this._character.direction(); }
	}else if(useDiagonal){
		dir = mv3d["a" /* default */].transformFacing(ddir,mv3d["a" /* default */].blendCameraYaw.currentValue(),true);
	}else{
		dir = mv3d["a" /* default */].transformFacing(ddir,mv3d["a" /* default */].blendCameraYaw.currentValue(),false);
	}
	if(dir%2){
		return diagRow[dir];
	}else{
		return dir/2-1;
	}
},()=> !mv3d["a" /* default */].isDisabled() || mv3d["a" /* default */].DIR8MOVE&&mv3d["a" /* default */].DIR8_2D);
const diagRow={
	3:4,
	1:5,
	9:6,
	7:7,
};

Object(util["r" /* override */])(Sprite_Character.prototype,'setFrame',o=>function(x, y, width, height){
	o.apply(this,arguments);
	const sprite = this._character.mv3d_sprite; if(!sprite){ return; }
	if(sprite.isImageChanged()){ return; }
	sprite.setFrame(x,y,this.patternWidth(),this.patternHeight());
});

Object(util["r" /* override */])(Sprite_Character.prototype,'setBlendColor',o=>function(){
	o.apply(this,arguments);
	const sprite = this._character.mv3d_sprite; if(!sprite){ return; }
	sprite.needsMaterialUpdate=true;
});

mv3d["a" /* default */].Sprite = characters_Sprite;
mv3d["a" /* default */].Character = characters_Character;


const _isOnBush = Game_CharacterBase.prototype.isOnBush;
Game_CharacterBase.prototype.isOnBush = function() {
	if(mv3d["a" /* default */].isDisabled()||!this.mv3d_sprite){ return _isOnBush.apply(this,arguments); }
	const rx=Math.round(this._realX), ry=Math.round(this._realY);
	const tileData=mv3d["a" /* default */].getTileData(rx,ry);
	const layers = mv3d["a" /* default */].getTileLayers(rx,ry,this.mv3d_sprite.z+this.mv3d_sprite.getCHeight(),false);
	const flags = $gameMap.tilesetFlags();
	for( const l of layers ){
		if( (flags[tileData[l]] & 0x40) !== 0 ){ return true; }
	}
	return false;
};
// CONCATENATED MODULE: ./src/animations.js




Object.assign(mv3d["a" /* default */],{
	showAnimation(char){
		if(!char){ char=$gamePlayer.mv3d_sprite; }
	},
	showBalloon(char){
		if(!char){ char=$gamePlayer.mv3d_sprite; }
		return new animations_Balloon(char);
	}
});

class animations_AnimSprite extends mod_babylon["x" /* TransformNode */]{
	constructor(src,w,h,smooth){
		super('animSprite',mv3d["a" /* default */].scene);
		this.cellWidth=w; this.cellHeight=h;
		this.cellIndex=0;
		this.isSmooth=smooth;
		this.mesh = mv3d["a" /* default */].Meshes.BASIC.clone();
		this.mesh.isPickable=false;
		this.mesh.parent=this;
		this.mesh.setEnabled(false);
		this.material = new mod_babylon["v" /* StandardMaterial */]('anim material',mv3d["a" /* default */].scene);
		this.mesh.material=this.material;
		this.material.useAlphaFromDiffuseTexture=true;
		//this.material.alphaCutOff = mv3d.ALPHA_CUTOFF;
		this.material.alphaCutOff = 0;
		this.material.disableLighting=true;
		this.material.emissiveColor.set(1,1,1);
		this.material.ambientColor.set(1,1,1);
		this.material.specularColor.set(0,0,0);
		this.loadTexture(src)
	}
	async loadTexture(src){
		this.texture = await mv3d["a" /* default */].createTexture(src);
		this.texture.hasAlpha=true;
		this.material.diffuseTexture=this.texture;
		await mv3d["a" /* default */].waitTextureLoaded(this.texture);
		this.texture.updateSamplingMode( this.isSmooth
			? mod_babylon["w" /* Texture */].BILINEAR_SAMPLINGMODE
			: mod_babylon["w" /* Texture */].NEAREST_SAMPLINGMODE
		);
		this.textureLoaded=true;
		const size = this.texture.getBaseSize();
		this.cellCols = Math.floor(size.width/this.cellWidth);
	}
	update(){
		if(!this.textureLoaded){ return; }
		if(!this.mesh.isEnabled()){ this.mesh.setEnabled(true); }
		this.pitch = mv3d["a" /* default */].blendCameraPitch.currentValue()-90;
		this.yaw = mv3d["a" /* default */].blendCameraYaw.currentValue();
		this.texture.crop(
			this.cellIndex%this.cellCols*this.cellWidth,
			Math.floor(this.cellIndex/this.cellCols)*this.cellHeight,
			this.cellWidth, this.cellHeight, true
		);
	}
	dispose(){
		super.dispose(false,true);
	}
}

// Balloons
class animations_Balloon extends animations_AnimSprite{
	constructor(char){
		super('img/system/Balloon.png',48,48,false);
		this.char=char;
	}
	update(){
		if(!this.char){ return; }
		const pos = transformVectorForCharacter(new mod_babylon["z" /* Vector3 */](0,0.5+this.char.spriteHeight,0),this.char);
		this.position.copyFrom(pos);
		const bs = this.char.char.mv_sprite._balloonSprite;
		if(!bs){ return; }
		this.cellIndex = (bs._balloonId-1)*8 + Math.max(0,bs.frameIndex());
		super.update();
	}
}

// depth animations

class animations_DepthAnimation{
	constructor(animation){
		this.animation=animation;
		this.spriteList=[];
		this.char = this.animation._target._character.mv3d_sprite;
	}
	resetSpriteList(){
		for(const animationSprite of this.spriteList ){
			animationSprite.unused=true;
		}
	}
	clearUnusedSprites(){
		for(let i=this.spriteList.length-1;i>=0;--i){
			const animationSprite = this.spriteList[i];
			if(animationSprite.unused){
				animationSprite.setEnabled(false);
			}
		}
	}
	update(){
		const char = this.char;
		if(!char){ return; }
		const cameraDirection = mv3d["a" /* default */].camera.getDirection(mv3d["a" /* default */].camera.getTarget());
		this.resetSpriteList();
		const frameData = this.animation._animation.frames[this.animation.currentFrameIndex()];
		if(frameData)
		for(let i=0; i<Math.min(this.animation._cellSprites.length); ++i){
			const cell = this.animation._cellSprites[i];
			if(!cell.visible || !cell.bitmap){ continue; }
			const anim = this.getAnimationSprite(cell.bitmap._url);
			anim.material.alphaMode = mv3d["a" /* default */].blendModes[cell.blendMode];

			anim.mesh.roll=Object(util["t" /* radtodeg */])(cell.rotation);
			const scale = this.animation._mv3d_animationSettings.scale||1;
			anim.mesh.scaling.x=4*cell.scale.x*scale;
			anim.mesh.scaling.y=4*cell.scale.y*scale;
			anim.material.alpha=cell.opacity/255;

			const offsetVector = new mod_babylon["z" /* Vector3 */](
				cell.position.x/48*scale,
				getAnimationOffset(this.animation)-cell.position.y/48*scale,
				0);
			const animationOrigin = transformVectorForCharacter(offsetVector,char);
			anim.position.copyFrom(animationOrigin);
			const scale2=Math.pow(scale,2);
			anim.mesh.position.set(
				-cameraDirection.x*0.1*(i+1)*scale2,
				-cameraDirection.y*0.1*(i+1)*scale2,
				-cameraDirection.z*0.1*(i+1)*scale2
			);

			const pattern = frameData[i][0];
			anim.cellIndex=pattern;
			anim.update();
			//console.log(anim.isVisible);
		}
		//console.log(this.spriteList.length);
		this.clearUnusedSprites();
	}
	getAnimationSprite(url){
		let sprite;
		for(const animationSprite of this.spriteList ){
			if(animationSprite._mv3d_sprite_url===url
			&&animationSprite.unused){
				//console.log("Found reusable sprite!", animationSprite);
				animationSprite.unused=false;
				animationSprite.setEnabled(true);
				sprite=animationSprite;
				break;
			}
		}
		if(!sprite){
			sprite = new animations_AnimSprite(url,192,192,true);
			this.spriteList.push(sprite);
			sprite._mv3d_sprite_url=url;
			//sprite.parent=this.char.spriteOrigin;
			const settings = this.animation._mv3d_animationSettings
			if(settings.depth==false&&settings.depth!=null){
				sprite.mesh.renderingGroupId=mv3d["a" /* default */].enumRenderGroups.FRONT;
			}
		}
		return sprite;
	}
	remove(){
		for(const animationSprite of this.spriteList ){
			animationSprite.dispose();
		}
		this.spriteList.length=0;
	}
}

function transformVectorForCharacter(vector,char){
	if(!char.isEmpty&&char.shape===mv3d["a" /* default */].enumShapes.SPRITE){
		return mod_babylon["z" /* Vector3 */].TransformCoordinates(vector,mv3d["a" /* default */].getUnscaledMatrix(char.mesh));
	}else{
		return mod_babylon["z" /* Vector3 */].TransformCoordinates(vector,mv3d["a" /* default */].getTranslationMatrix(char.mesh));
	}
}


// mod animations

const _start_animation = Sprite_Character.prototype.startAnimation;
Sprite_Character.prototype.startAnimation = function(){
	_start_animation.apply(this,arguments);
	if(mv3d["a" /* default */].mapDisabled||!(SceneManager._scene instanceof Scene_Map)){ return; }
	const animationSprite = this._animationSprites[this._animationSprites.length-1];
	animationSprite._mv3d_animationSettings=this._character._mv3d_animationSettings;
	delete this._character._mv3d_animationSettings;
	if(animationSprite._mv3d_animationSettings){
		animationSprite.mv3d_animation=new animations_DepthAnimation(animationSprite);
		mv3d["a" /* default */].pixiContainer.addChild(animationSprite._screenFlashSprite);
		return;
	}
	mv3d["a" /* default */].pixiContainer.addChild(animationSprite);
};

const _animation_remove = Sprite_Animation.prototype.remove;
Sprite_Animation.prototype.remove=function(){
	if(!mv3d["a" /* default */].mapDisabled && this.mv3d_animation){
		if(this._screenFlashSprite){
			this.addChild(this._screenFlashSprite);
		}
		this.mv3d_animation.remove();
	}
	_animation_remove.apply(this,arguments);
};


const _animation_updateScreenFlash=Sprite_Animation.prototype.updateScreenFlash;
Sprite_Animation.prototype.updateScreenFlash = function() {
	_animation_updateScreenFlash.apply(this,arguments);
	if(!mv3d["a" /* default */].mapDisabled&&(SceneManager._scene instanceof Scene_Map)){
		this._screenFlashSprite.x = 0;
		this._screenFlashSprite.y = 0;
	}
};

function getAnimationOffset(animation){
	const p = animation._animation.position;
	const offset = p===3?0:1-p/2;
	const char = animation._target._character;
	if(!char.mv3d_sprite){ return offset; }
	return offset * char.mv3d_sprite.spriteHeight;
}

const _update_animation_sprites = Sprite_Character.prototype.updateAnimationSprites;
Sprite_Character.prototype.updateAnimationSprites = function() {
	_update_animation_sprites.apply(this,arguments);
	if(mv3d["a" /* default */].mapDisabled||!this._animationSprites.length||!(SceneManager._scene instanceof Scene_Map)){ return; }
	if(!this._character.mv3d_sprite){ return; }
	for (const animationSprite of this._animationSprites){
		if(animationSprite.mv3d_animation){ continue; }
		if(animationSprite._animation.position===3){
			animationSprite.update();
			continue;
		}

		const offsetVector = new mod_babylon["z" /* Vector3 */](0, getAnimationOffset(animationSprite), 0);
		const animationOrigin = transformVectorForCharacter(offsetVector,this._character.mv3d_sprite);
		const pos = mv3d["a" /* default */].getScreenPosition(animationOrigin);
		const dist = mod_babylon["z" /* Vector3 */].Distance(
			BABYLON.Vector3.TransformCoordinates(mv3d["a" /* default */].camera.position,mv3d["a" /* default */].getTranslationMatrix(mv3d["a" /* default */].camera)),
			animationOrigin);
		const scale = mv3d["a" /* default */].camera.mode===mod_babylon["n" /* ORTHOGRAPHIC_CAMERA */] ? mv3d["a" /* default */].getScaleForDist() : mv3d["a" /* default */].getScaleForDist(dist);

		animationSprite.behindCamera = pos.behindCamera;
		animationSprite.update();
		animationSprite.x=pos.x;
		animationSprite.y=pos.y;
		animationSprite.scale.set(scale,scale);
	}
};

const _update_cell = Sprite_Animation.prototype.updateCellSprite;
Sprite_Animation.prototype.updateCellSprite = function(sprite,cell) {
	_update_cell.apply(this,arguments);
	if(this.behindCamera){ sprite.visible=false; }
};
// CONCATENATED MODULE: ./src/parallax.js



Object(util["r" /* override */])(Game_Map.prototype,'setupParallax',o=>function(){
	o.apply(this,arguments);
	this.mv3d_parallaxX=0;
	this.mv3d_parallaxY=0;
});

Object(util["r" /* override */])(Game_Map.prototype,'changeParallax',o=>function(name, loopX, loopY, sx, sy){
	if (this._parallaxLoopX && !loopX || this._parallaxSx && !sx) {
		this.mv3d_parallaxX=0;
	}
	if (this._parallaxLoopY && !loopY || this._parallaxSy && !sy) {
		this.mv3d_parallaxY=0;
	}
	o.apply(this,arguments);
});

Object(util["r" /* override */])(Game_Map.prototype,'updateParallax',o=>function(){
	if (this._parallaxLoopX) {
		this.mv3d_parallaxX += this._parallaxSx / 8;
	}
	if (this._parallaxLoopY) {
		this.mv3d_parallaxY += this._parallaxSy / 8;
	}
});

Object(util["r" /* override */])(Game_Map.prototype,'parallaxOx',o=>function(){
	let ox = this.mv3d_parallaxX;
	if(this._parallaxLoopX){
		return ox - mv3d["a" /* default */].blendCameraYaw.currentValue()*816/90;
	}
	return ox;
});

Object(util["r" /* override */])(Game_Map.prototype,'parallaxOy',o=>function(){
	let oy = this.mv3d_parallaxY;
	if(this._parallaxLoopY){
		return oy - mv3d["a" /* default */].blendCameraPitch.currentValue()*816/90;
	}
	return 0;
});

/*
['setDisplayPos','scrollUp','scrollDown','scrollLeft','scrollRight'].forEach(method=>{
	const _oldMethod=Game_Map.prototype[method];
	Game_Map.prototype[method]=function(){
		if (mv3d.isDisabled()){ _oldMethod.apply(this,arguments); }
	}
});
const _updateScroll = Game_Map.prototype.updateScroll;
Game_Map.prototype.updateScroll = function() {
	if (mv3d.mapDisabled){ return _updateScroll.apply(this,arguments); }
	this._displayX = -mv3d.blendCameraYaw.currentValue()*816/3600;
	this._displayY = -mv3d.blendCameraPitch.currentValue()*816/3600;
};
*/

Game_CharacterBase.prototype.mv3d_inRenderDist=function(){
	const loopPos = mv3d["a" /* default */].loopCoords(this.x,this.y);
	return Math.abs(loopPos.x - mv3d["a" /* default */].cameraStick.x)<=mv3d["a" /* default */].renderDist
	&& Math.abs(loopPos.y - mv3d["a" /* default */].cameraStick.y)<=mv3d["a" /* default */].renderDist;
};

Object(util["r" /* override */])(Game_CharacterBase.prototype,'isNearTheScreen',o=>function(){
	if(!mv3d["a" /* default */].EVENTS_UPDATE_NEAR){ return o.apply(this,arguments); }
	return this.mv3d_inRenderDist() || o.apply(this,arguments);
});


Object(util["r" /* override */])(Game_Screen.prototype,'shake',o=>function(){
	return 0;
},()=> !mv3d["a" /* default */].isDisabled() && SceneManager._scene instanceof Scene_Map );

Object(util["r" /* override */])(Game_CharacterBase.prototype,'screenX',o=>function screenX(){
	const sprite = this.mv3d_sprite;
	if(!sprite){ return o.apply(this,arguments); }
	if(SceneManager.isNextScene(Scene_Battle) && this===$gamePlayer){
		return Graphics.width/2;
	}
	return mv3d["a" /* default */].getScreenPosition(sprite).x;
});

Object(util["r" /* override */])(Game_CharacterBase.prototype,'screenY',o=>function screenY(){
	const sprite = this.mv3d_sprite;
	if(!sprite){ return o.apply(this,arguments); }
	if(SceneManager.isNextScene(Scene_Battle) && this===$gamePlayer){
		return Graphics.height/2;
	}
	return mv3d["a" /* default */].getScreenPosition(sprite).y;
});
// CONCATENATED MODULE: ./src/data.js


const isPlaytest = Utils.isOptionValid('test');

const saveFile=async(fileName,fileData)=>{
	const fs=__webpack_require__(4);
	const path=__webpack_require__(5);
	const filePath = path.resolve(global.__dirname,fileName);
	await ensureDirectory(path.dirname(filePath));
	await new Promise((resolve,reject)=>{
		fs.writeFile(filePath,fileData,err=>{
			if(err){ reject(err); return; }
			resolve();
		});
	});
}

const ensureDirectory=(dirName)=>new Promise((resolve,reject)=>{
	const fs=__webpack_require__(4);
	const path=__webpack_require__(5);
	fs.mkdir(path.resolve(global.__dirname,dirName),{recursive:true},err=>{
		if(err&&err.code!=='EEXIST'){ reject(err); return; }
		resolve();
	});
});

const _loadDataFile = DataManager.loadDataFile;
DataManager.loadDataFile = function(name, src) {
	if(src.startsWith('Test_mv3d_')){
		src=src.replace('Test_mv3d_','mv3d_')
	}
	_loadDataFile.call(this,name,src);
};

class DataProxy{
	constructor(varName,fileName,defaultData={}){
		this.varName=varName;
		this.fileName=fileName;
		if(isPlaytest){
			const fs = __webpack_require__(4);
			const path = __webpack_require__(5);
			const filePath = path.resolve(nw.__dirname,'data',fileName);
			if(!fs.existsSync(filePath)) {
				fs.writeFileSync(filePath,JSON.stringify(typeof defaultData==='function'?defaultData():defaultData));
			}
		}
		DataManager._databaseFiles.push({name:varName,src:fileName});

		this._dirty=false;
		this._data_handler={
			get:(target,key)=>{
				if(target[key]&&typeof target[key]==='object'){
					return new Proxy(target[key],data_handler);
				}else{
					return target[key];
				}
			},
			set:(target,key,value)=>{
				this._dirty=true;
				target[key]=value;
			},
			deleteProperty:(target,key)=>{
				this._dirty=true;
				delete target[key];
			},
		}
		this.writing=false;
		DataProxy.list.push(this);
	}
	setup(){
		this._data=window[this.varName];
		if(isPlaytest){
			window[this.varName]=new Proxy(this._data,this._data_handler);
		}
	}
	async update(){
		if(!isPlaytest){ return; }
		if(this._dirty&&!this.writing){
			this.writing=true;
			this._dirty=false;
			await saveFile(`data/${this.fileName}`,JSON.stringify(this._data));
			this.writing=false;
		}
	}
}
DataProxy.list=[];
mv3d["a" /* default */].DataProxy=DataProxy;

const _onBoot = Scene_Boot.prototype.start;
Scene_Boot.prototype.start=function(){
	_onBoot.apply(this,arguments);
	mv3d["a" /* default */].setupData();
}

Object.assign(mv3d["a" /* default */],{
	setupData(){
		for (const dataProxy of DataProxy.list){
			dataProxy.setup();
		}
	},
	updateData(){
		for (const dataProxy of DataProxy.list){
			dataProxy.update();
		}
	}
});

new DataProxy('mv3d_data','mv3d_data.json',()=>({
	id:crypto.getRandomValues(new Uint32Array(1))[0],
}));
// EXTERNAL MODULE: ./src/plugin_support/plugin_support.js
var plugin_support = __webpack_require__(6);

// CONCATENATED MODULE: ./src/index.js




















//features
//import './feature-dynamicShadows.js';

/***/ })
/******/ ]);
//# sourceMappingURL=mv3d.js.map