/*:
@plugindesc 3D rendering for RPG Maker MV with three.js
@author Dread/Nyanak
@version 0.2.1

@help

Make sure you have both the `three.js` plugin and `MV3D.js` plugin loaded, in
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

	mv3d @target rest of the command

If the second word in the command starts with `@`, that will be interpreted
as the target.   
Valid targets:

- @p or @player: Targets $gamePlayer.
- @e0, @e1, @e2, @e25 etc: Targets event with specified id.
- @f0, @f1, @f2, etc: Targets first, second, third follower, etc.
- @v0, @v1, @v2: Boat, Ship, Airship.

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

	mv3d @t lamp color <color> <t>
	mv3d @t lamp intensity <n> <t>
	mv3d @t lamp dist <n> <t>
	mv3d @t lamp <color> <intensity> <dist> <t>

---

	mv3d @t flashlight color <color> <t>
	mv3d @t flashlight intensity <n> <t>
	mv3d @t flashlight dist <n> <t>
	mv3d @t flashlight angle <deg> <t>
	mv3d @t flashlight pitch <deg> <t>
	mv3d @t flashlight yaw <deg> <t>
	mv3d @t flashlight <color> <intensity> <dist> <angle> <t>

Angle is beam width of the flashlight.

---

	mv3d camera target @t <t>

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

--------------------------------------------------

@param wallheight
@text Wall Height 1
@desc The default height for wall tiles when using wall top textures
@type Number
@min -9999 @max 9999
@decimals 1
@default 2.0

@param wallheight2
@text Wall Height 2
@desc The default height for wall tiles when using wall side textures
@type Number
@min -9999 @max 9999
@decimals 1
@default 2.0

@param tableheight
@text Table Height
@desc The default height for table tiles
@type Number
@min -9999 @max 9999
@decimals 2
@default 0.33

@param fringeHeight
@text Fringe Height
@type Number
@min -9999 @max 9999
@decimals 1
@default 2.0

@param ceilingHeight
@text Ceiling Height
@desc Default height of ceiling for maps with ceiling enabled.
@type Number
@min -9999 @max 9999
@decimals 1
@default 2.0

@param anim_delay
@text Animation Speed
@desc The number of milliseconds between each frame in tile animations.
@type Number
@default 333

@param layering_dist
@text Layering Distance
@desc The distance between tile layers. If this is too small
there may be z-fighting issues. (default: 0.0100)
@type Number
@decimals 4
@default 0.0100

@param render_dist
@text Render Distance
@desc The distance in tiles that will be rendered in 3D.
@type Number
@default 20

@param cell_size
@text Cell Size
@desc The size of the chunks used to render the 3D map.
@type Number
@default 10

@param smoothing
@text Smoothing
@desc Enables texture smoothing. (not reccomended)
@type Boolean
@default false

@param alphaTest
@text Alpha Test
@desc Pixels with alpha below the alpha test value won't be drawn.
@type Number
@decimals 2
@default 1.0

@param fov
@text FOV
@desc Sets the field of view
@type Number
@default 60

@param ttag_heights
@text Terrain Tag Heights
@desc use terrain tags to determine tile height.
@type struct<TTagHeight>[]
@default ["{\"terrainTag\":\"1\",\"height\":\"1.0\",\"topOffsetX\":\"0\",\"topOffsetY\":\"0\",\"sideOffsetX\":\"0\",\"sideOffsetY\":\"0\",\"shape\":\"XCROSS\"}","{\"terrainTag\":\"2\",\"height\":\"1.0\",\"topOffsetX\":\"0\",\"topOffsetY\":\"0\",\"sideOffsetX\":\"0\",\"sideOffsetY\":\"0\",\"shape\":\"FENCE\"}"]

@param region_heights
@text Region Heights
@desc use regions to determine tile height.
@type struct<RegionHeight>[]
@default ["{\"regionId\":\"1\",\"height\":\"1.0\"}","{\"regionId\":\"2\",\"height\":\"2.0\"}","{\"regionId\":\"3\",\"height\":\"3.0\"}","{\"regionId\":\"4\",\"height\":\"4.0\"}","{\"regionId\":\"5\",\"height\":\"5.0\"}","{\"regionId\":\"6\",\"height\":\"6.0\"}","{\"regionId\":\"7\",\"height\":\"7.0\"}"]

@param renderEdgeWalls
@text Render Walls on Map Edge
@desc Whether to render walls on the edges of maps by default.
@type Boolean
@default true

@param eventShape
@text Default Event Shape
@type combo
@option FLAT
@option SPRITE
@option TREE
@default SPRITE

@param eventHeight
@text Event "Above Characters" Default Height
@type Number
@decimals 1
@default 2.0

@param boatSettings
@text Boat Settings
@type struct<BoatStruct>
@default {"scale":"1","zoff":"-0.16","big":"false"}

@param shipSettings
@text Ship Settings
@type struct<BoatStruct>
@default {"scale":"1","zoff":"0.0","big":"false"}

@param airshipSettings
@text Airship Settings
@type struct<AirshipStruct>
@default {"scale":"1","height":"2.0","shadowScale":"1.0","shadowDist":"6.0","big":"false","bushLanding":"false"}

@param vehicleBush
@text Vehicle Bush
@desc Whether vehicles should be affected by bush tiles.
@type Boolean
@default false

@param fog
@text Fog

@param fog_color
@parent fog
@text Fog Color
@desc The color of the fog. Use hexidecimal value without any prefix. (example: ffffff)
@type Color
@default ffffff

@param fog_near
@parent fog
@text Fog Start Distance
@desc The distance in tiles at which the fog will start.
@type Number
@decimals 1
@default 10.0

@param fog_far
@parent fog
@text Fog End Distance
@desc The distance in tiles at which the fog will finish. Maybe set this to the same as render distance.
@type Number
@decimals 1
@default 20.0

@param shadows
@text Light & Shadow

@param characterShadows
@text Character Shadows
@parent shadows
@desc Projects circular shadows beneath character sprites.
@type Boolean
@default true

@param shadowScale
@text Default Shadow Scale
@parent shadows
@desc The default size of character shadows.
@type Number
@decimals 1
@default 0.8

@param shadowDist
@text Shadow Distance
@parent shadows
@desc How far above the ground before a character's shadow fades completely. 
@type Number
@decimals 1
@default 4.0

@param penumbra
@text Flashlight Penumbra
@parent shadows
@type Number
@decimals 2
@min 0
@max 1
@default 1.0

@param lightHeight
@text Default Light Height
@desc the default height of character lights above the ground.
@parent shadows
@type Number
@decimals 2
@default 0.5

@param meshSubdivision
@text Mesh Subdivision
@parent shadows
@desc Increasing this will make lights look better, but will increase poly count dramatically.
@type Number
@min 1
@max 8
@default 1

@param camera
@text Camera

@param cameraDist
@text Default Camera Distance
@parent camera
@desc The default camera distance for the 3rd person camera mode.
@type Number
@decimals 1
@default 5.0

@param cameraPitch
@text Default Camera Pitch
@parent camera
@desc The default pitch of the camera for 3rd person and orthographic modes.
@type Number
@default 45

@param cameraYaw
@text Default Camera Yaw
@parent camera
@desc The default yaw of the camera for 3rd person and orthographic modes.
@type Number
@default 0

@param cameraHeight
@text Default Camera Height
@parent camera
@desc Offsets the camera up. Useful for 1st person mode.
@type Number
@decimals 2
@default 1.00

@param cameraMode
@text Camera mode
@parent camera
@type combo
@option PERSPECTIVE
@option ORTHOGRAPHIC
@default PERSPECTIVE

@param input
@text Input

@param keyboardYaw
@text Keyboard Yaw
@parent input
@desc Allow player to rotate camera with the keyboard.
@type combo
@option OFF
@option AUTO
@option Q&E
@option A&D
@default AUTO

@param keyboardPitch
@text Keyboard Pitch
@parent input
@desc Allow player to change pitch with pageup & pagedown.
@type Boolean
@default true


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

*/
(function(){
const parameters = PluginManager.parameters('MV3D');
const sleep=(ms=0)=>new Promise(resolve=>setTimeout(resolve,ms));

if(!window.THREE){
	sleep(1000).then(()=>{
		SceneManager.catchException(new Error(`three.js must be loaded before MV3D.js`));
	});
}

const SUBDIVISIONS = Number(parameters.meshSubdivision);
const XAxis = new THREE.Vector3(1,0,0);
const YAxis = new THREE.Vector3(0,1,0);
const ZAxis = new THREE.Vector3(0,0,1);
const v2origin = new THREE.Vector2();
const v3origin = new THREE.Vector3();
const planeGeometry = new THREE.PlaneGeometry(1,1,SUBDIVISIONS,SUBDIVISIONS);
const spriteGeometry = planeGeometry.clone().rotateX(Math.PI/2).translate(0,0,0.5);
const crossGeometry = spriteGeometry.clone().rotateZ(Math.PI/2); crossGeometry.merge(spriteGeometry);
const wireframeMaterial = new THREE.LineBasicMaterial({color:0xffffff,linewidth:2});

window.MV3D={
	ORTHOGRAPHIC_DIST:100,
	ANIM_DELAY:Number(parameters.anim_delay),
	SMOOTHING:parameters.smoothing=='true',
	FOV:Number(parameters.fov),
	NEARCLIP:0.1,
	FARCLIP:Number(parameters.render_dist||20),
	RENDER_DIST:Number(parameters.render_dist||20),
	CELL_SIZE:Number(parameters.cell_size||10),
	CELL_PAD:1,
	LAYER_DIST:Number(parameters.layering_dist),
	WALL_HEIGHT:Number(parameters.wallheight),
	WALL_HEIGHT2:Number(parameters.wallheight2),
	TABLE_HEIGHT:Number(parameters.tableheight),
	FRINGE_HEIGHT:Number(parameters.fringeHeight),
	CEILING_HEIGHT:Number(parameters.ceilingHeight),
	REGION_HEIGHTS:{},
	TTAG_HEIGHTS:{},
	EDGE_WALLS:parameters.renderEdgeWalls=='true',
	CHARACTER_SHADOWS:parameters.characterShadows=='true',
	SHADOW_SCALE:Number(parameters.shadowScale),
	SHADOW_DIST:Number(parameters.shadowDist),
	ALPHA_TEST:Number(parameters.alphaTest),
	WIREFRAME:false,

	KEYBOARD_YAW:parameters.keyboardYaw==='OFF'?false:parameters.keyboardYaw,
	KEYBOARD_PITCH:parameters.keyboardPitch=='true',

	EVENT_HEIGHT:Number(parameters.eventHeight),
	VEHICLE_BUSH:parameters.vehicleBush=='true',
	BOAT_SETTINGS:JSON.parse(parameters.boatSettings),
	SHIP_SETTINGS:JSON.parse(parameters.shipSettings),
	AIRSHIP_SETTINGS:JSON.parse(parameters.airshipSettings),

	LIGHT_DECAY: 1,
	LIGHT_DIST: 3,
	LIGHT_ANGLE: 45,
	LIGHT_HEIGHT: Number(parameters.lightHeight),
	PENUMBRA: Number(parameters.penumbra),

	get rotationMode(){
		let mode = this.loadData('keyboardYaw',this.KEYBOARD_YAW);
		if(mode==='AUTO'){
			if( MV3D.is1stPerson() ){
				mode='A&D';
			}else{
				mode='Q&E';
			}
		}
		return mode;
	},
	set rotationMode(v){
		v=falseString(v);
		this.saveData('keyboardYaw',v);
		//this.setupInput();
	},
	get pitchMode(){ return this.loadData('keyboardPitch',this.KEYBOARD_PITCH); },
	set pitchMode(v){
		v=falseString(v.toUpperCase());
		this.saveData('keyboardPitch',v);
	},

	is1stPerson(useCurrent){
		const k = useCurrent?'currentValue':'targetValue';
		return this.getCameraTarget()===$gamePlayer && this.blendCameraTransition[k]()<=0
		&& this.blendCameraDist[k]()<=0 && this.blendPanX[k]()===0 && this.blendPanY[k]()===0;
	},

	loadData(key,dfault){
		if(!$gameVariables || !$gameVariables.mv3d || !(key in $gameVariables.mv3d)){ return dfault; }
		return $gameVariables.mv3d[key];
	},
	saveData(key,value){
		if(!$gameVariables){ return; }
		if(!$gameVariables.mv3d){ $gameVariables.mv3d={}; }
		$gameVariables.mv3d[key]=value;
	},

	get tileSize(){return $gameMap.tileWidth(); },

	CAMERA_MODE: parameters.cameraMode,
	get activeCamera(){
		const mode = this.cameraMode;
		if(mode.startsWith('O')){
			return this.orthographicCamera;
		}
		return this.camera;
	},
	get cameraMode(){
		return this.loadData('cameraMode',this.CAMERA_MODE).toUpperCase();
	},
	set cameraMode(v){
		this.saveData('cameraMode',String(v).toUpperCase());
		this.updateCamera(true);
	},

	cameraTargets:[],
	getCameraTarget(){
		return this.cameraTargets[0];
	},
	setCameraTarget(char,time){
		if(!char){ this.cameraTargets.length=0; return; }
		this.cameraTargets.unshift(char);
		if(this.cameraTargets.length>2){ this.cameraTargets.length=2; }
		this.saveData('cameraTarget',getTargetString(char));
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
		const target = MV3D.loadData('cameraTarget');
		if(target){
			this.setCameraTarget(targetChar(target),0);
		}
	},

	setupBlenders(){
		this.blendFogColor = new ColorBlender('fog_color',hexNumber(parameters.fog_color));
		this.blendFogNear = new Blender('fog_near',Number(parameters.fog_near));
		this.blendFogFar = new Blender('fog_far',Number(parameters.fog_far));
		this.blendCameraYaw = new Blender('cameraYaw',Number(parameters.cameraYaw));
		this.blendCameraYaw.cycle=360;
		this.blendCameraPitch = new Blender('cameraPitch',Number(parameters.cameraPitch));
		this.blendCameraPitch.min=0;
		this.blendCameraPitch.max=180;
		this.blendCameraDist = new Blender('cameraDist',Number(parameters.cameraDist));
		this.blendCameraHeight = new Blender('cameraHeight',Number(parameters.cameraHeight));
		this.blendLightColor = new ColorBlender('light_color',0xffffff);
		this.blendLightIntensity = new Blender('light_intensity',1);
		this.blendPanX = new Blender('panX',0);
		this.blendPanY = new Blender('panY',0);
		this.blendCameraTransition = new Blender('cameraTransition',0);
	},

	setup(){
		for (let entry of JSON.parse(parameters.region_heights)){
			entry=JSON.parse(entry);
			this.REGION_HEIGHTS[entry.regionId]=Number(entry.height);
		}
		for (let entry of JSON.parse(parameters.ttag_heights)){
			entry=JSON.parse(entry);
			this.TTAG_HEIGHTS[entry.terrainTag]={
				height: Number(entry.height),
				offsetTop: new THREE.Vector2(Number(entry.topOffsetX),Number(entry.topOffsetY)),
				offsetSide: new THREE.Vector2(Number(entry.sideOffsetX),Number(entry.sideOffsetY)),
				shape: MV3D.configurationShapes[entry.shape.toUpperCase()],
			};
		}
		this.BOAT_SETTINGS.scale=Number(this.BOAT_SETTINGS.scale);
		this.BOAT_SETTINGS.zoff=Number(this.BOAT_SETTINGS.zoff);
		this.SHIP_SETTINGS.scale=Number(this.SHIP_SETTINGS.scale);
		this.SHIP_SETTINGS.zoff=Number(this.SHIP_SETTINGS.zoff);
		this.AIRSHIP_SETTINGS.scale=Number(this.AIRSHIP_SETTINGS.scale);
		this.AIRSHIP_SETTINGS.height=Number(this.AIRSHIP_SETTINGS.height);
		this.AIRSHIP_SETTINGS.shadowScale=Number(this.AIRSHIP_SETTINGS.shadowScale);
		this.AIRSHIP_SETTINGS.shadowDist=Number(this.AIRSHIP_SETTINGS.shadowDist);
		this.BOAT_SETTINGS.big=booleanString(this.BOAT_SETTINGS.big);
		this.SHIP_SETTINGS.big=booleanString(this.SHIP_SETTINGS.big);
		this.AIRSHIP_SETTINGS.big=booleanString(this.AIRSHIP_SETTINGS.big);
		this.AIRSHIP_SETTINGS.bushLanding=booleanString(this.AIRSHIP_SETTINGS.bushLanding);

		this.EVENT_SHAPE=MV3D.configurationShapes[parameters.eventShape.toUpperCase()];

		this.setupBlenders();

		const renderDist = this.RENDER_DIST*0.8;
		this.CELL_SIZE=Math.ceil(renderDist*0.2*this.CELL_SIZE/Math.floor(renderDist*0.2));
		this.CELL_PAD=Math.ceil(renderDist/this.CELL_SIZE);
		this.cells={};
		//this.WALL_PARTS=Math.round(this.WALL_HEIGHT*2);
		//this.WALL_PART_HEIGHT=this.WALL_HEIGHT/this.WALL_PARTS;

		this.scene = new THREE.Scene();
		this.map=new THREE.Group();
		this.mapcells=new THREE.Group();
		this.mapchars=new THREE.Group();
		this.scene.add(this.map);
		this.map.add(this.mapcells,this.mapchars);

		this.light=new THREE.AmbientLight(0xffffff,1);
		this.scene.add(this.light);
		//this.sun=new THREE.DirectionalLight(0xffffff,0.75);
		//this.sun.position.set(1,-1.5,2);
		//this.sun.castShadow=true;
		//this.scene.add(this.ambientLight,this.sun,this.sun.target);

		this.cameraStick = new THREE.Object3D();
		this.camera = new THREE.PerspectiveCamera( 
			this.FOV,
			Graphics.boxWidth/Graphics.boxHeight,
			this.NEARCLIP,
			this.FARCLIP
		);
		this.orthographicCamera = new THREE.OrthographicCamera(
			-Graphics.boxWidth/48/2, Graphics.boxWidth/48/2,
			Graphics.boxHeight/48/2, -Graphics.boxHeight/48/2,
			0, this.FARCLIP + this.ORTHOGRAPHIC_DIST
		);
		this.map.add(this.cameraStick);
		this.cameraStick.add(this.camera,this.orthographicCamera);
		this.camera.up.set(0,0,1);
		this.orthographicCamera.up.set(0,0,1);
		//this.camera.rotation.order="YZX";
		//this.camera.position.z = 3;
		//this.camera.position.y = -3;
		//this.camera.lookAt(v3origin);

		this.materialList = [null];
		this.materialCache = {};
		this.textureCache = {};
		this.animatedTextures = [];

		this.renderer = new THREE.WebGLRenderer({
			//antialias: true,
			alpha: true,
			//premultipliedAlpha: false,
		});
		this.renderer.sortObjects=false;
		this.renderer.setSize(Graphics.boxWidth,Graphics.boxHeight);
		this.canvas = this.renderer.domElement;
		this.canvas.id='MV3DCanvas';
		this.texture=PIXI.Texture.fromCanvas(this.canvas);

		this.raycaster = new THREE.Raycaster();

		//this.renderer.shadowMap.enabled=true;
		//this.sunHelper = new THREE.CameraHelper(this.sun.shadow.camera);
		//this.scene.add(this.sunHelper);

		this.scene.fog=new THREE.Fog(
			this.blendFogColor.defaultValue(),
			this.blendFogNear.defaultValue(),
			this.blendFogFar.defaultValue(),
		);

		//this.updateCamera( true );

		this.setupInput();
	},


	tilesetConfigurations:{},
	mapConfigurations:{},
	loadMapSettings( applySettings ){
		//tileset
		this.tilesetConfigurations={};
		const lines = this.readConfigurationBlocks($gameMap.tileset().note);
		const readLines = /^\s*([abcde]\d?\s*,\s*\d+\s*,\s*\d+)\s*:(.*)$/gmi;
		let match;
		while(match = readLines.exec(lines)){
			const key = match[1];
			const conf = this.readConfigurationFunctions(match[2],this.configurationFunctions);
			const tileId=constructTileId(...key.split(','));
			if(tileId in this.tilesetConfigurations){
				Object.assign(this.tilesetConfigurations[tileId],conf);
			}else{
				this.tilesetConfigurations[tileId]=conf;
			}
		}
		//map
		const mapconf=this.mapConfigurations={};
		this.readConfigurationFunctions(
			this.readConfigurationBlocks($dataMap.note),
			this.mapConfigurationFunctions,
			mapconf,
		);

		if(!applySettings){ return; }

		if('fog' in mapconf){
			const fog = mapconf.fog;
			if('color' in fog){ this.blendFogColor.setValue(fog.color,0); }
			if('near' in fog){ this.blendFogNear.setValue(fog.near,0); }
			if('far' in fog){ this.blendFogFar.setValue(fog.far,0); }
		}
		if('light' in mapconf){
			this.blendLightColor.setValue(mapconf.light.color,0);
			this.blendLightIntensity.setValue(mapconf.light.intensity,0);
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

	},

	getMapConfig(key,dfault){
		if(key in this.mapConfigurations){
			return this.mapConfigurations[key];
		}
		return dfault;
	},

	readConfigurationBlocks(note){
		const findBlocks = /<MV3D>([\s\S]*?)<\/MV3D>/gi;
		let contents = '';
		let match;
		while(match = findBlocks.exec(note)){
			contents += match[1]+'\n';
		}
		return contents;
	},

	readConfigurationTags(note){
		const findTags = /<MV3D:([\s\S]*?)>/gi;
		let contents='';
		let match;
		while(match = findTags.exec(note)){
			contents+=match[1]+'\n';
		}
		return contents;
	},

	readConfigurationFunctions(line,functionset=MV3D.configurationFunctions,conf={}){
		const readConfigurations = /(\w+)\((.*?)\)/g
		let match;
		while(match = readConfigurations.exec(line)){
			const key = match[1].toLowerCase();
			if(key in functionset){
				functionset[key](conf,...match[2].split(','));
			}
		}
		return conf;
	},

	configurationFunctions:{
		height(conf,n){ conf.height=Number(n); },
		fringe(conf,n){ conf.fringe=Number(n); },
		float(conf,n){ conf.float=Number(n); },
		texture(conf,img,x,y){
			const tileId = constructTileId(img,x,y)
			conf.sideId = conf.topId = tileId;
		},
		top(conf,img,x,y){ conf.topId=constructTileId(img,x,y); },
		side(conf,img,x,y){ conf.sideId=constructTileId(img,x,y); },
		inside(conf,img,x,y){ conf.insideId=constructTileId(img,x,y); },
		offset(conf,x,y){
			conf.offsetSide = conf.offsetTop = new THREE.Vector2(Number(x),Number(y));
		},
		offsettop(conf,x,y){
			conf.offsetTop = new THREE.Vector2(Number(x),Number(y));
		},
		offsetside(conf,x,y){
			conf.offsetSide = new THREE.Vector2(Number(x),Number(y));
		},
		offsetinside(conf,x,y){
			conf.offsetInside = new THREE.Vector2(Number(x),Number(y));
		},
		rect(conf,img,x,y,w,h){
			conf.sideId = conf.topId = constructTileId(img,0,0);
			conf.rectSide = conf.rectTop = new PIXI.Rectangle(x,y,w,h);
		},
		recttop(conf,img,x,y,w,h){
			conf.topId = constructTileId(img,0,0);
			conf.rectTop = new PIXI.Rectangle(x,y,w,h);
		},
		rectside(conf,img,x,y,w,h){
			conf.sideId = constructTileId(img,0,0);
			conf.rectSide = new PIXI.Rectangle(x,y,w,h);
		},
		rectinside(conf,img,x,y,w,h){
			conf.insideId = constructTileId(img,0,0);
			conf.rectInside = new PIXI.Rectangle(x,y,w,h);
		},
		shape(conf,name){
			conf.shape=MV3D.configurationShapes[name.toUpperCase()];
		},
	},
	eventConfigurationFunctions:{
		height(conf,n){
			conf.height=Number(n);
		},
		z(conf,n){ conf.z=Number(n); },
		x(conf,n){ conf.x=Number(n); },
		y(conf,n){ conf.y=Number(n); },
		side(conf,name){ conf.side=MV3D.configurationSides[name.toLowerCase()]; },
		scale(conf,x,y){ conf.scale = new THREE.Vector2(Number(x),Number(y)); },
		rot(conf,n){ conf.rot=Number(n); },
		bush(conf,bool){ conf.bush = bool.toLowerCase()=='true'; },
		shadow(conf,bool){ conf.shadow = bool.toLowerCase()=='true'; },
		shadowscale(conf,n){ conf.shadowScale = Number(n); },
		shape(conf,name){
			conf.shape=MV3D.configurationShapes[name.toUpperCase()];
		},
		pos(conf,x,y){
			conf.pos={x:x,y:y};
		},
		light(){ this.lamp(...arguments); },
		lamp(conf,color='ffffff',intensity=1,distance=MV3D.LIGHT_DIST){
			conf.lamp={color:hexNumber(color),intensity:Number(intensity),distance:Number(distance)};
		},
		flashlight(conf,color='ffffff',intensity=1,distance=MV3D.LIGHT_DIST,angle=MV3D.LIGHT_ANGLE){
			conf.flashlight={color:hexNumber(color),intensity:Number(intensity),distance:Number(distance),angle:Number(angle)};
		},
		flashlightpitch(conf,deg='90'){ conf.flashlightPitch=Number(deg); },
		flashlightyaw(conf,deg='+0'){ conf.flashlightYaw=deg; },
		lightheight(conf,n=1){ conf.lightHeight = Number(n); },
		lightoffset(conf,x=0,y=0){ conf.lightOffset = {x:+x,y:+y}; },
		alphatest(conf,n=1){ conf.alphaTest = Number(n); }
	},
	mapConfigurationFunctions:{
		light(conf,color,intensity=1){
			conf.light={color:hexNumber(color),intensity:Number(intensity)};
		},
		fog(conf,color,near,far){
			if(!conf.fog){ conf.fog={}; }
			color=hexNumber(color); near=Number(near); far=Number(far);
			if(!Number.isNaN(color)){ conf.fog.color=color; }
			if(!Number.isNaN(near)){ conf.fog.near=near; }
			if(!Number.isNaN(far)){ conf.fog.far=far; }
		},
		yaw(conf,n){this.camerayaw(conf,n);},
		pitch(conf,n){this.camerapitch(conf,n);},
		camerayaw(conf,n){ conf.cameraYaw=Number(n); },
		camerapitch(conf,n){ conf.cameraPitch=Number(n); },
		dist(conf,n){ this.cameradist(conf,n); },
		cameradist(conf,n){ conf.cameraDist=Number(n); },
		height(conf,n){ this.cameraheight(conf,n); },
		cameraheight(conf,n){ conf.cameraHeight=Number(n); },
		mode(conf,mode){ this.cameramode(conf,mode); },
		cameramode(conf,mode){ conf.cameraMode=mode; },
		edge(conf,bool){ conf.edge = booleanString(bool); },
		ceiling(conf,img,x,y,height=MV3D.CEILING_HEIGHT){
			conf.ceiling = constructTileId(img,x,y);
			conf.ceilingHeight = height;
		},
	},
	configurationSides:{
		front:THREE.FrontSide,
		back:THREE.BackSide,
		double:THREE.DoubleSide,
	},
	configurationShapes:{
		FLAT:1,
		TREE:2,
		SPRITE:3,
		FENCE:4,
		CROSS:5,
		XCROSS:6,
	},

	updateCanvas(){
		this.canvas.width = Graphics._width;
		this.canvas.height = Graphics._height;
	},

	clearCells(){
		for (const key in this.cells){
			const cell = this.cells[key];
			this.mapcells.remove(cell.mesh);
			cell.destroy();
		}
		this.cells={};
	},

	clearMaterials(){
		for (let i=1; i<this.materialList.length;++i){
			const mat = this.materialList[i];
			mat.dispose();
			mat.map.dispose();
		}
		this.materialCache={};
		this.materialList.length=1;
		this.animatedTextures.length=0;
	},

	reloadMap(){
		this.clearMap();
		this.updateMap();
		this.createCharacters();
	},

	clearMap(){
		this.clearCharacters();
		this.clearCells();
		this.clearMaterials();
		if(this.mapUpdating){
			this.mapCleared=true;
		}
	},

	async updateMap(){
		if(this.mapUpdating){ return; }
		this.mapCleared=false;
		this.mapUpdating=true;
		if(!SceneManager._scene._spriteset){ this.mapUpdating=false; return; }
		const px=Math.floor($gamePlayer._x/MV3D.CELL_SIZE);
		const py=Math.floor($gamePlayer._y/MV3D.CELL_SIZE);
		// unload far cells
		/*
		for (const key in this.cells){
			const [x,y] = key.split(',').map(n=>parseInt(n));
			if(x<px-MV3D.CELL_PAD||x>px+MV3D.CELL_PAD||y<py-MV3D.CELL_PAD||y>py+MV3D.CELL_PAD){
				this.mapcells.remove(this.cells[key].mesh);
				this.cells[key].destroy();
				delete this.cells[key];
			}
		}
		*/
		if(!SceneManager._scene._spriteset){ this.mapUpdating=false; return; }
		
		// create new cells
		const playerVector=new THREE.Vector2(px,py);
		const vectorArray=[];
		const cellsH = Math.ceil($gameMap.width()/MV3D.CELL_SIZE);
		const cellsV = Math.ceil($gameMap.height()/MV3D.CELL_SIZE);
		for(let ox=-MV3D.CELL_PAD;ox<=MV3D.CELL_PAD;++ox)
		for(let oy=-MV3D.CELL_PAD;oy<=MV3D.CELL_PAD;++oy){
			//const x=px+ox, y=py+oy;
			//if(x<0||x>=cellsH||y<0||y>=cellsV){ continue; }
			const x=(px+ox).mod(cellsH), y=(py+oy).mod(cellsV);
			vectorArray.push(new THREE.Vector2(x,y));
		}
		vectorArray.sort((a,b)=>a.distanceTo(playerVector)-b.distanceTo(playerVector));
		for (const vector of vectorArray){
			if(this.mapCleared){ this.mapUpdating=false; return; }
			const {x,y} = vector;
			const key = `${x},${y}`;
			if(key in this.cells){ continue; }
			this.cells[key]=new MapCell(x,y);
			this.mapcells.add(this.cells[key].mesh);
			await this.cells[key].load();
			await sleep(10); // wait between cell loads to improve performance
		}
		
		this.mapUpdating=false;
	},

	async createCharacters(){
		let r=1;
		const inc = 0.01;
		const events = $gameMap.events();
		for (const event of events){
			await this.createCharacterFor(event,r+=inc);
		}
		const vehicles = $gameMap.vehicles();
		for (const vehicle of vehicles){
			await this.createCharacterFor(vehicle,r+=inc);
		}
		const followers = $gamePlayer.followers()._data;
		for (let f=followers.length-1; f>=0; --f){
			await this.createCharacterFor(followers[f],r+=inc);
		}
		await this.createCharacterFor($gamePlayer,r+=inc);
	},
	async createCharacterFor(char,renderOrder){
		if(!char.mv3d_sprite){
			const sprite = new Character(char,renderOrder);
			Object.defineProperty(char,'mv3d_sprite',{
				value:sprite,
				configurable:true,
			});
			this.mapchars.add(sprite);
			await sprite.initialize();
			return sprite;
		}
		return char.mv3d_sprite;
	},
	clearCharacters(){
		for (let i=this.mapchars.children.length-1;i>=0;--i){
			const char = this.mapchars.children[i];
			char.destroy();
		}
	},
	updateCharacters(){
		for(const char of this.mapchars.children){
			char.update();
		}
	},

	render(){
		this.renderer.render( this.scene, this.activeCamera );
		this.texture.update();
	},

	lastAnimUpdate:0,
	lastMapUpdate:0,
	update(){
		// update the map once a second
		if( Date.now()-this.lastMapUpdate > 10 && !this.mapUpdating ){
			this.updateMap();
			this.lastMapUpdate=Date.now();
		}
		if( Date.now()-this.lastAnimUpdate > this.ANIM_DELAY){
			this.updateAnimations();
			this.lastAnimUpdate=Date.now();
		}

		this.updateCharacters();

		if(this.rotationMode){
			if(Input.isTriggered('rotleft')){
				this.blendCameraYaw.setValue(this.blendCameraYaw.targetValue()+90,0.5);
			}else if(Input.isTriggered('rotright')){
				this.blendCameraYaw.setValue(this.blendCameraYaw.targetValue()-90,0.5);
			}
			if(this.is1stPerson()&&(Input.isTriggered('rotleft')||Input.isTriggered('rotright'))){
				this.playerFaceYaw();
			}
		}
		if(this.pitchMode){
			if(Input.isPressed('pageup')&&Input.isPressed('pagedown')){
				// do nothing
			}else if(Input.isPressed('pageup')){
				this.blendCameraPitch.setValue(Math.min(180,this.blendCameraPitch.targetValue()+1.5),0.1);
			}else if(Input.isPressed('pagedown')){
				this.blendCameraPitch.setValue(Math.max(0,this.blendCameraPitch.targetValue()-1.5),0.1);
			}
		}

		this.updateCamera();
		for (const key in this.cells){
			const cell = this.cells[key];
			cell.update();
		}
	},

	updateCamera(reorient=false){

		if(!this.cameraTargets.length){
			if($gamePlayer){
				this.cameraTargets[0]=$gamePlayer;
			}
		}

		if(this.blendCameraTransition.update() && this.cameraTargets.length>=2){
			const t = this.blendCameraTransition.currentValue();
			let char1=this.cameraTargets[0];
			if(char1===$gamePlayer&&$gamePlayer.isInVehicle()){ char1=$gamePlayer.vehicle(); }
			let char2=this.cameraTargets[1];
			if(char2===$gamePlayer&&$gamePlayer.isInVehicle()){ char2=$gamePlayer.vehicle(); }
			this.cameraStick.position.x = char1._realX*(1-t) + char2._realX*t;
			this.cameraStick.position.y = -char1._realY*(1-t) - char2._realY*t;
			if(char1.mv3d_sprite&&char2.mv3d_sprite){
				this.cameraStick.position.z = char1.mv3d_sprite.position.z*(1-t) + char2.mv3d_sprite.position.z*t;
			}else if(char1.mv3d_sprite){
				this.cameraStick.position.z=char1.mv3d_sprite.position.z;
			}
		}else if(this.cameraTargets.length){
			let char = this.getCameraTarget();
			if(char===$gamePlayer&&$gamePlayer.isInVehicle()){ char=$gamePlayer.vehicle(); }
			this.cameraStick.position.x=char._realX;
			this.cameraStick.position.y=-char._realY;
			if(char.mv3d_sprite){
				this.cameraStick.position.z=char.mv3d_sprite.position.z;
			}
		}
		this.blendPanX.update();
		this.blendPanY.update();
		this.cameraStick.position.x+=this.blendPanX.currentValue();
		this.cameraStick.position.y-=this.blendPanY.currentValue();

		const camera = this.activeCamera;

		if(reorient|this.blendFogColor.update()|this.blendFogNear.update()|this.blendFogFar.update()){
			if(camera===this.orthographicCamera){
				this.scene.fog.near=this.blendFogNear.currentValue()+this.ORTHOGRAPHIC_DIST;
				this.scene.fog.far=this.blendFogFar.currentValue()+this.ORTHOGRAPHIC_DIST;
			}else{
				this.scene.fog.near=this.blendFogNear.currentValue();
				this.scene.fog.far=this.blendFogFar.currentValue();
			}
			this.scene.fog.color.setHex(this.blendFogColor.currentValue());
		}

		if(reorient|this.blendCameraPitch.update()|this.blendCameraYaw.update()
		|this.blendCameraDist.update()|this.blendCameraHeight.update()){
			camera.pitch = this.blendCameraPitch.currentValue();
			camera.yaw = this.blendCameraYaw.currentValue();
			camera.position.setScalar(0);
			if(camera===this.orthographicCamera){
				camera.translateZ(this.blendCameraDist.currentValue()+this.ORTHOGRAPHIC_DIST);
				if(camera.position.z<Math.abs(camera.bottom)){
					camera.position.z=Math.abs(camera.bottom);
				}
				camera.zoom=10/this.blendCameraDist.currentValue();
				camera.updateProjectionMatrix();
			}else{

				camera.translateZ(this.blendCameraDist.currentValue());
				if(camera.position.z<0){ camera.position.z=0; }
			}
			camera.position.z += this.blendCameraHeight.currentValue();
		}

		if(this.blendLightColor.update()|this.blendLightIntensity.update()){
			this.light.color.setHex(this.blendLightColor.currentValue());
			this.light.intensity=this.blendLightIntensity.currentValue();
		}

	},

	animXFrame:0,
	animYFrame:0,
	animDirection:1,
	updateAnimations(){
		if(this.animXFrame<=0){
			this.animDirection=1;
		}else if(this.animXFrame>=2){
			this.animDirection=-1;
		}
		this.animXFrame += this.animDirection;
		this.animYFrame=(this.animYFrame+1)%3;
		const edgefix=!this.SMOOTHING/2;
		for (const texture of this.animatedTextures){
			texture.crop(
				texture.frameData.x+edgefix+texture.animX*this.animXFrame*this.tileSize,
				texture.frameData.y+edgefix+texture.animY*this.animYFrame*this.tileSize,
				texture.frameData.w-edgefix*2,
				texture.frameData.h-edgefix*2
			);
			//texture.offset.x=(texture.animationOrigin.x+texture.animX*this.animXFrame*this.tileSize)/texture.image.width;
			//texture.offset.y=1-(texture.animationOrigin.y+texture.animY*this.animYFrame*this.tileSize)/texture.image.height;
		}
	}

};

function getTilemapSync(){
	if(SceneManager._scene&&SceneManager._scene._spriteset){
		return SceneManager._scene._spriteset._tilemap;
	}
	return null;
}
async function getTilemap(){
	let tilemap;
	do{ tilemap = getTilemapSync();
		if(!tilemap){ await sleep(100); }
	}while(!tilemap);
	return tilemap;
}

MV3D.loopCoords=function(x,y){
	if($gameMap.isLoopHorizontal()){
		const mapWidth=$gameMap.width();
		const ox = this.cameraStick.position.x - mapWidth/2;
		x=(x-ox).mod(mapWidth)+ox;
	}
	if($gameMap.isLoopVertical()){
		const mapHeight=$gameMap.height();
		const oy = -this.cameraStick.position.y - mapHeight/2;
		y=(y-oy).mod(mapHeight)+oy;
	}
	return new THREE.Vector2(x,y);
}

class MapCell{
	constructor(x,y){
		this.x=x; this.y=y;
		this.heightmap={};
		this.geometry=new THREE.Geometry();
		this.mesh=new THREE.Mesh(this.geometry,MV3D.materialList);
		this.mesh.name=`MapCell[${x},${y}]`
		//this.mesh.castShadow=true;
		//this.mesh.receiveShadow=true;
		this.mesh.position.x=x*MV3D.CELL_SIZE;
		this.mesh.position.y=-y*MV3D.CELL_SIZE;
		//this.mesh.frustumCulled=false;
		this.destroyed=false;
	}

	update(){
		const loopPos = MV3D.loopCoords((this.x+0.5)*MV3D.CELL_SIZE,(this.y+0.5)*MV3D.CELL_SIZE);
		this.mesh.position.x=loopPos.x-MV3D.CELL_SIZE/2;
		this.mesh.position.y=-loopPos.y+MV3D.CELL_SIZE/2;
	}

	async load(){
		//this.loadstarttime=Date.now();
		while(!SceneManager._scene._spriteset){ await sleep(100); }
		this.tilemap=SceneManager._scene._spriteset._tilemap;
		const cellWidth = Math.min(MV3D.CELL_SIZE,$gameMap.width()-this.x*MV3D.CELL_SIZE);
		const cellHeight = Math.min(MV3D.CELL_SIZE,$gameMap.height()-this.y*MV3D.CELL_SIZE);
		for (let l=0; l<4; ++l)
		for (let y=0; y<cellHeight; ++y)
		for (let x=0; x<cellWidth; ++x){
			const tileData = getTileData(this.x*MV3D.CELL_SIZE+x,this.y*MV3D.CELL_SIZE+y);
			if(!tileData){ continue; }
			const tileId=tileData[l];
			if(tileId===0){ continue; }
			await this.loadTile(tileId,x,y,l);
			if(this.destroyed){ return; }
			//await sleep(10);
		}

		if('ceiling' in MV3D.mapConfigurations)
		for (let y=0; y<cellHeight; ++y)
		for (let x=0; x<cellWidth; ++x){
			await this.loadCeiling(x,y);
		}

		this.cleanupGeometry();
		//console.log(Date.now()-this.loadstarttime);

		if(MV3D.WIREFRAME){
			this.wireframe = new THREE.LineSegments(new THREE.WireframeGeometry(this.geometry),wireframeMaterial);
			this.mesh.add(this.wireframe);
		}
	}

	async loadTile(tileId,x,y,layerId){
		const realTileId=tileId;
		const isWall = isWallTile(tileId);
		const isFringe = this.tilemap._isHigherTile(tileId);
		if(isWall==2 && Tilemap.isTileA3(tileId)){ tileId -= 384}
		let configuredRect;
		if(!isWall){
			const offsetData = getTileTextureOffsets(tileId,this.tilemap);
			tileId=offsetData.topId||offsetData.id||tileId;
			if(offsetData.rectTop){ configuredRect = offsetData.rectTop; }
			var {shape,fringe,fringeHeight} = offsetData;
		}
		const pos = new THREE.Vector2(this.x*MV3D.CELL_SIZE+x,this.y*MV3D.CELL_SIZE+y);
		const isTable=this.tilemap._isTableTile(tileId);
		let height = getTileHeight(this.tilemap,pos.x,pos.y,layerId);
		const key = `${x},${y}`;
		if(!(key in this.heightmap)){ this.heightmap[key]=0; }
		this.heightmap[key] += height;
		if(isFringe){ height = fringeHeight; }
		if(isTileEmpty(tileId) || isSpecialShape(shape)){
			if(height!==0){
				await this.loadWalls(realTileId,x,y,layerId,height);
				this.updateGeometry();
			}
			return
		}
		const rects = !configuredRect ? getTileRects(this.tilemap,tileId)
		:[{sx:configuredRect.x,sy:configuredRect.y,dx:0,dy:0,width:configuredRect.width,height:configuredRect.height}];
		//if(isTable){ console.log(rects); }
		const materialOptions={
			doubleSided: isFringe,
		};
		for (let i=0;i<rects.length;++i){
			const rect = rects[i];
			if(isTable){
				if(rect.dy>MV3D.tileSize/2){ continue; }
				if(i+1 in rects && rects[i+1].dy>MV3D.tileSize/2){
					rect.sy+=MV3D.tileSize*2/3;
				}
			}
			const transformation = new THREE.Object3D();
			transformation.position.z+=layerId*MV3D.LAYER_DIST + this.heightmap[key];
			if(isFringe){
				transformation.position.z += fringe+fringeHeight;
			}else if(fringe){
				transformation.position.z += fringe;
			}
			if(Tilemap.isAutotile(tileId) && !configuredRect){
				transformation.position.x-=0.25;
				transformation.position.y+=0.25;
				transformation.scale.set(0.5,0.5,0.5);
			}
			transformation.position.x+=rect.dx/MV3D.tileSize + x;
			transformation.position.y-=rect.dy/MV3D.tileSize + y;
			transformation.updateMatrix();
			const material = await getOptionMaterial(materialOptions,tileId,rect.sx,rect.sy,rect.width,rect.height);
			this.geometry.merge(planeGeometry,transformation.matrix,material.index);
		}
		//if(isWallTile(realTileId)||isTable){
		if(height!==0){
			await this.loadWalls(realTileId,x,y,layerId,height);
		}
		//this.cleanupGeometry();
		//this.updateGeometry();
	}

	async loadWalls(tileId,cx,cy,layerId=0,wallHeight=MV3D.WALL_HEIGHT){
		if(!wallHeight){ return; }
		const realWallHeight = wallHeight;
		const isWall=isWallTile(tileId);
		const isFringe = this.tilemap._isHigherTile(tileId);
		let configuredRect;
		if(!isWall){
			var offsetData = getTileTextureOffsets(tileId);
			var {shape,fringe,fringeHeight,height:confHeight} = offsetData;
		}
		if(isTileEmpty(tileId)){ return; }
		const shapes = MV3D.configurationShapes;
		const specialShape = isSpecialShape(shape);
		const isTable=this.tilemap._isTableTile(tileId);
		const tileHeight = this.heightmap[[cx,cy]];
		const pos = new THREE.Vector2(this.x*MV3D.CELL_SIZE+cx,this.y*MV3D.CELL_SIZE+cy);
		const neighborPositions = [
			new THREE.Vector2( 0, 1),
			new THREE.Vector2( 1, 0),
			new THREE.Vector2( 0,-1),
			new THREE.Vector2(-1, 0),
		];
		let sidesSkipped=0;
		if(shape===shapes.FENCE){
			for (const neighborpos of neighborPositions){
				neighborpos.skip = getTileHeight(this.tilemap,pos.x+neighborpos.x,pos.y+neighborpos.y,layerId)!==tileHeight;
				if(neighborpos.skip){ ++sidesSkipped; }
			}
		}

		for (const neighborIndex in neighborPositions){
			const neighborpos = neighborPositions[neighborIndex];

			// don't render walls on edge of map (unless it loops)
			if( !MV3D.getMapConfig('edge',MV3D.EDGE_WALLS) )
			if((pos.x+neighborpos.x>=$dataMap.width||pos.x+neighborpos.x<0)&&!$gameMap.isLoopHorizontal()
			||(pos.y+neighborpos.y>=$dataMap.height||pos.y+neighborpos.y<0)&&!$gameMap.isLoopVertical()){
				continue;
			}

			wallHeight = realWallHeight;
			if(confHeight<0 && tileHeight<getStackHeight(this.tilemap,pos.x+neighborpos.x,pos.y+neighborpos.y,layerId)){
				wallHeight=confHeight;
			}
			if(offsetData){
				tileId=offsetData.sideId||offsetData.id||tileId;
				if(wallHeight<0 && offsetData.hasInsideConf){
					tileId=offsetData.insideId||tileId;
					if(offsetData.rectInside){ configuredRect = offsetData.rectInside; }
				}else{
					if(offsetData.rectSide){ configuredRect = offsetData.rectSide; }
				}
			}
			if(!specialShape){
				wallHeight += layerId*MV3D.LAYER_DIST;
			}
			const isAutotile=Tilemap.isAutotile(tileId);

			let neededHeight=wallHeight;
			if(isFringe && !specialShape){
				const neighborHeight = getFringeHeight(this.tilemap,pos.x+neighborpos.x,pos.y+neighborpos.y,layerId);
				if(neighborHeight===tileHeight+fringe+fringeHeight){ continue; }
			}else if(!specialShape){
				const neighborHeight = getCullingHeight(this.tilemap,pos.x+neighborpos.x,pos.y+neighborpos.y,layerId,!(confHeight<0));
				if(wallHeight>0&&neighborHeight>=tileHeight
				||wallHeight<0&&neighborHeight<=tileHeight){ continue; }
				neededHeight = Math.min(wallHeight, tileHeight-neighborHeight);
				
			}

			if(isAutotile){
				const kind = Tilemap.getAutotileKind(tileId);
				let tx = kind%8;
				let ty = Math.floor(kind / 8);
				if(isWall==1){ ++ty; }
				var bx,by;
				bx=tx*2;
				by=ty;
				if(Tilemap.isTileA1(tileId)){
					if(kind<4){
						by=3*(kind%2)+1;
						bx=6*Math.floor(kind/2);
					}else{
						bx=8*Math.floor(tx/4) + (kind%2)*6;
						by=ty*6 + Math.floor(tx%4/2)*3 + 1-(tx%2);
					}
				}else if(Tilemap.isTileA2(tileId)){
					by=(ty-2)*3+1;
				}else if (Tilemap.isTileA3(tileId)){
					by=(ty-6)*2;
				}else if (Tilemap.isTileA4(tileId)){
					by=(ty-10)*2.5+(ty%2?0.5:0);
				}
			}
			
			const transformation = new THREE.Object3D();
			transformation.rotateOnWorldAxis(XAxis,Math.PI/2);
			transformation.rotateOnWorldAxis(ZAxis,neighborpos.angle()*-1+Math.PI/2);
			transformation.position.x=neighborpos.x*0.5+cx;
			transformation.position.y=-neighborpos.y*0.5-cy;
			transformation.position.z=tileHeight;
			if(!specialShape){
				transformation.position.z += layerId*MV3D.LAYER_DIST;
			}
			if(isFringe){
				transformation.position.z += fringe+fringeHeight;

			}else if(fringe){
				transformation.position.z += fringe;
			}
			transformation.scale.y=Math.abs(wallHeight);
			if(neededHeight<0){ transformation.rotateOnWorldAxis(ZAxis,Math.PI); }
			const materialOptions={
				doubleSided: isFringe,
			};
			if(shape===shapes.CROSS||shape===shapes.XCROSS){
				if(neighborIndex>=2){ continue; }
				transformation.position.x-=neighborpos.x*0.5;
				transformation.position.y-=-neighborpos.y*0.5;
				materialOptions.doubleSided=true;
				if(shape===shapes.XCROSS){
					transformation.rotateOnWorldAxis(ZAxis,Math.PI/4);
				}
			}
			if(shape===shapes.FENCE){
				const oppositeNeighbor = neighborPositions[(Number(neighborIndex)+2)%4];
				//const edge = isAutotile&&neighborpos.skip && !oppositeNeighbor.skip || sidesSkipped>=4;
				const edge = isAutotile&&neighborpos.skip || sidesSkipped>=4;
				if(neighborpos.skip&&!edge){
					continue;
				}
				const rightSide = neighborpos.x>0||neighborpos.y<0;
				if(rightSide){
					transformation.rotateOnWorldAxis(ZAxis,-Math.PI/2);
				}else{
					transformation.rotateOnWorldAxis(ZAxis,Math.PI/2);
				}
				transformation.position.x-=neighborpos.x*0.25;
				transformation.position.y-=-neighborpos.y*0.25;
				
				transformation.scale.x=0.5;
				let sx,sy;
				let sw = MV3D.tileSize/2;
				let sh = MV3D.tileSize;
				let partHeight = wallHeight;
				let useAutotile=false;
				if(configuredRect){
					sw=configuredRect.width/2;
					sh=configuredRect.height;
					sx=configuredRect.x+sw*rightSide;
					sy=configuredRect.y;
				}else if(isAutotile){
					useAutotile=true;
					transformation.scale.y=0.5;
					partHeight=wallHeight/2;
					sh=MV3D.tileSize/2;
					if(edge){
						sx = (bx+rightSide*1.5)*MV3D.tileSize;
					}else{
						sx=(bx+1-rightSide*0.5)*MV3D.tileSize;
					}
				}else{
					const rect = getTileRects(this.tilemap,tileId)[0];
					sx=rect.sx+sw*rightSide;
					sy=rect.sy;
				}
				transformation.position.z-=partHeight/2;
				if(useAutotile){
					const zPos = transformation.position.z;
					for (let az=0;az<=1;++az){
						sy=(by+az*1.5)*MV3D.tileSize;
						transformation.position.z=zPos-partHeight*az;
						const material = await getFenceMaterial(tileId,sx,sy,sw,sh);
						transformation.updateMatrix();
						this.geometry.merge(planeGeometry,transformation.matrix,material.index);
					}
				}else{
					const material = await getFenceMaterial(tileId,sx,sy,sw,sh);
					transformation.updateMatrix();
					this.geometry.merge(planeGeometry,transformation.matrix,material.index);
				}
			}else if(configuredRect){
				const material = await getOptionMaterial(materialOptions,tileId,configuredRect.x,configuredRect.y,configuredRect.width,configuredRect.height);
				transformation.position.z-=wallHeight/2;
				transformation.updateMatrix();
				this.geometry.merge(planeGeometry,transformation.matrix,material.index);
			}else if(isAutotile){
				const leftNeighbor = new THREE.Vector2().copy(neighborpos).rotateAround(v2origin,Math.PI/2).round();
				const rightNeighbor = new THREE.Vector2().copy(neighborpos).rotateAround(v2origin,-Math.PI/2).round();
				const leftNeighborHeight = getStackHeight(this.tilemap,pos.x+leftNeighbor.x,pos.y+leftNeighbor.y,layerId);
				const rightNeighborHeight = getStackHeight(this.tilemap,pos.x+rightNeighbor.x,pos.y+rightNeighbor.y,layerId);
				//const hasLeftEdge = getWallHeight(this.tilemap,pos.x+leftNeighbor.x,pos.y+leftNeighbor.y)!==tileHeight;
				//const hasRightEdge = getWallHeight(this.tilemap,pos.x+rightNeighbor.x,pos.y+rightNeighbor.y)!==tileHeight;
				transformation.scale.x=0.5;
				transformation.scale.y=0.5;
				let sw = MV3D.tileSize/2;
				let sh = MV3D.tileSize/2;
				let wallParts=Math.abs(Math.round(neededHeight*2));
				let partHeight=Math.abs(neededHeight/wallParts);
				if(isTable){
					sh=MV3D.tileSize/3;
					wallParts=1;
					partHeight=wallHeight;
					transformation.scale.y=partHeight;
				}else{
					transformation.scale.y=partHeight;
				}
				const wallPos = new THREE.Vector3().copy(transformation.position);
				for (let ax=-1; ax<=1; ax+=2){
					const neighbor = (ax>0?rightNeighbor:leftNeighbor);
					transformation.position.x=wallPos.x+neighbor.x*0.25;
					transformation.position.y=wallPos.y-neighbor.y*0.25;
					for(let az=0;az<wallParts;++az){
						let hasLeftEdge,hasRightEdge;
						if(isTable){
							hasLeftEdge = leftNeighborHeight!=tileHeight;
							hasRightEdge = rightNeighborHeight!=tileHeight;
						}else{
							hasLeftEdge = leftNeighborHeight<tileHeight-az*partHeight;
							hasRightEdge = rightNeighborHeight<tileHeight-az*partHeight;
						}
						let sx,sy;
						sx=(bx+(ax>0?0.5+hasRightEdge:1-hasLeftEdge))*MV3D.tileSize;
						if(neededHeight<0){
							sx=(bx+(ax>0?0+hasLeftEdge:1.5-hasRightEdge))*MV3D.tileSize;
						}
						if(isTileWaterfall(tileId)){
							//waterfalls
							sy=(by+az%2/2)*MV3D.tileSize;
						}else if(isTable){
							sy=(by+5/3)*MV3D.tileSize;
						}else{
							sy=(by+(az===0?0:az===wallParts-1?1.5:1-az%2*0.5))*MV3D.tileSize;
						}
						const material = await getOptionMaterial(materialOptions,tileId,sx,sy,sw,sh);
						transformation.position.z=wallPos.z-partHeight/2-az*partHeight;
						if(wallHeight<0){ transformation.position.z -= wallHeight; }
						transformation.updateMatrix();
						this.geometry.merge(planeGeometry,transformation.matrix,material.index);
					}
				}
			}else{ // not autotile
				const rect = getTileRects(this.tilemap,tileId)[0];
				const material = await getOptionMaterial(materialOptions,tileId,rect.sx,rect.sy,rect.width,rect.height);
				transformation.position.z-=wallHeight/2;
				transformation.scale.y=wallHeight;
				transformation.updateMatrix();
				this.geometry.merge(planeGeometry,transformation.matrix,material.index);
			}
		}
		//this.cleanupGeometry();
		//this.updateGeometry();
	}

	async loadCeiling(x,y){
		//if(!$gameMap.isValid(this.x*MV3D.CELL_SIZE+x,this.y*MV3D.CELL_SIZE+y)){ return; }
		const tileId = MV3D.getMapConfig('ceiling',0);
		if(isTileEmpty(tileId)){ return; }
		const ceilingHeight = MV3D.getMapConfig('ceilingHeight',MV3D.CEILING_HEIGHT);
		const tileHeight = getStackHeight(this.tilemap,this.x*MV3D.CELL_SIZE+x,this.y*MV3D.CELL_SIZE+y,0);
		if(tileHeight>=ceilingHeight){ return; }
		const rects = getTileRects(this.tilemap,tileId);
		for (let i=0;i<rects.length;++i){
			const rect = rects[i];
			const transformation = new THREE.Object3D();
			if(Tilemap.isAutotile(tileId)){
				transformation.position.x-=0.25;
				transformation.position.y+=0.25;
				transformation.scale.setScalar(0.5);
			}
			transformation.position.z=ceilingHeight;
			transformation.position.x+=rect.dx/MV3D.tileSize + x;
			transformation.position.y-=rect.dy/MV3D.tileSize + y;
			transformation.updateMatrix();
			const material = await getCeilingMaterial(tileId,rect.sx,rect.sy,rect.width,rect.height);
			//console.log(x,y);
			this.geometry.merge(planeGeometry,transformation.matrix,material.index);
		}
	}

	cleanupGeometry(precision=10000){
		for (let i = 0; i<this.geometry.vertices.length; ++i){
			const vertex = this.geometry.vertices[i];
			vertex.x=Math.round(vertex.x*precision)/precision;
			vertex.y=Math.round(vertex.y*precision)/precision;
			vertex.z=Math.round(vertex.z*precision)/precision;
		}
		this.geometry.mergeVertices();
		//this.geometry.computeVertexNormals();
		//this.geometry.normalsNeedUpdate=true;
		this.updateGeometry();
		this.geometry.computeBoundingSphere();
		this.geometry.computeBoundingBox();
	}

	updateGeometry(){
		this.geometry.verticesNeedUpdate=true;
		this.geometry.elementsNeedUpdate=true;
	}

	destroy(){
		this.destroyed=true;
		this.geometry.dispose();
	}
}

function isTileWaterfall(tileId){
	const kind = Tilemap.getAutotileKind(tileId);
	return Tilemap.isTileA1(tileId)&&kind>=4&&kind%2;
}
function isTileEmpty(tileId){
	return !tileId||tileId===1544;
}

function constructTileId(img,x,y){
	const key = `TILE_ID_${img.toUpperCase()}`
	let tileId = key in Tilemap ? Tilemap[key] : 0;
	const tileRange = Tilemap.isAutotile(tileId) ? 48 : 1;
	tileId += Number(x)*tileRange + Number(y)*tileRange*8;
	return tileId;
}

function normalizeAutotileId(tileId){
	if(!Tilemap.isAutotile(tileId)){ return tileId; }
	const kind = Tilemap.getAutotileKind(tileId);
	return Tilemap.TILE_ID_A1 + kind*48;
}

function getTileRects(tilemap,tileId){
	const rects = [];
	tilemap._drawTile({addRect:(sheetId,sx,sy,dx,dy,width,height,animX,animY)=>{
		rects.push({sheetId:sheetId,sx:sx,sy:sy,dx:dx,dy:dy,width:width,height:height});
	}}, tileId, 0,0);
	return rects;
}

function getTileData(x,y){
	if(!$dataMap || !$dataMap.data){ return null; }
	const data = $dataMap.data;
	const width = $dataMap.width;
	const height = $dataMap.height;
	if($gameMap.isLoopHorizontal()){
		x=x.mod(width);
	}
	if($gameMap.isLoopVertical()){
		y=y.mod(height);
	}
	if(x<0||x>=width||y<0||y>=height){ return null; }
	const tileData=[];
	for (let z=0;z<4;++z){//4 tile layers. Ignore shadow bits.
		tileData[z] = data[(z * height + y) * width + x] || 0;
	}
	return tileData;
};
MV3D.getTileData=getTileData;

function getTerrainTag(tileId){
	return $gameMap.tilesetFlags()[tileId]>>12;
}

function getTileTextureOffsets(tileId,tilemap=getTilemapSync()){
	//offsets can come either from terrain tag or tileset notes
	let offsetTop = v2origin;
	let offsetSide = v2origin;
	let offsetInside = null;
	const ret = {
		topId:null,
		sideId:null,
		insideId:null,
		fringe:tilemap&&tilemap._isHigherTile(tileId)?MV3D.FRINGE_HEIGHT:0,
		fringeHeight:0,
	}
	const ttag = getTerrainTag(tileId);
	if(ttag && ttag in MV3D.TTAG_HEIGHTS){
		const tagdata = MV3D.TTAG_HEIGHTS[ttag];
		offsetTop = tagdata.offsetTop;
		offsetSide = tagdata.offsetSide;
		if('height' in tagdata){
			 ret.height=tagdata.height; 
			 ret.fringeHeight=tagdata.height;
		}
		if('shape' in tagdata){ ret.shape=tagdata.shape; }
	}
	const conf = MV3D.tilesetConfigurations[normalizeAutotileId(tileId)];
	if(conf){
		if(conf.offsetTop){ offsetTop=conf.offsetTop; }
		if(conf.offsetSide){ offsetSide=conf.offsetSide; }
		if(conf.offsetInside){ offsetInside=conf.offsetInside; }
		if('topId' in conf){ ret.topId=conf.topId; }
		if('sideId' in conf){ ret.sideId=conf.sideId; }
		if('insideId' in conf){ ret.insideId=conf.insideId; }
		if(conf.rectTop){ ret.rectTop=conf.rectTop; }
		if(conf.rectSide){ ret.rectSide=conf.rectSide; }
		if(conf.rectInside){ ret.rectInside=conf.rectInside; }
		if('shape' in conf){ ret.shape=conf.shape; }
		if('fringe' in conf){ ret.fringe=conf.fringe; }
		if('height' in conf){
			ret.height=conf.height;
			ret.fringeHeight = conf.height;
		}

		ret.hasInsideConf=Boolean(conf.offsetInside||conf.rectInside||('insideId' in conf));
	}
	const tileRange = Tilemap.isAutotile(tileId)?48:1;
	if(ret.topId==null){ ret.topId = tileId+offsetTop.x*tileRange+offsetTop.y*tileRange*8; }
	if(ret.sideId==null){ ret.sideId = tileId+offsetSide.x*tileRange+offsetSide.y*tileRange*8; }
	if(ret.insideId==null){ 
		ret.insideId=ret.sideId;
		if(offsetInside){
			ret.insideId=tileId+offsetInside.x*tileRange+offsetInside.y*tileRange*8;
		}
	}
	return ret;
}
MV3D.getTileTextureOffsets=getTileTextureOffsets;

function isWallTile(tileId){
	const kind = Tilemap.getAutotileKind(tileId);
	const ty = Math.floor(kind / 8);
	const isWall = Tilemap.isTileA3(tileId) || Tilemap.isTileA4(tileId);
	if (isWall && ty%2){ return 2; }
	return isWall;
}

function getWallHeight(tilemap,x,y){
	return getTileHeight(tilemap,x,y,0);
}

function getTileHeight(tilemap,x,y,l=0){
	if(!$dataMap){ return 0; }

	if($gameMap.isLoopHorizontal()){
		x=x.mod($dataMap.width);
	}
	if($gameMap.isLoopVertical()){
		y=y.mod($dataMap.height);
	}

	const tileData=getTileData(x,y);
	if(!tileData){ return 0; }
	const tileId=tileData[l];
	if(isTileEmpty(tileId)){ return 0; }
	if(tilemap&&tilemap._isHigherTile(tileId)){ return 0; }

	let defaultHeight = 0;

	const conf = MV3D.tilesetConfigurations[normalizeAutotileId(tileId)];
	const region = $gameMap.regionId(x,y);
	if(l===0 && region && region in MV3D.REGION_HEIGHTS){
		let height = MV3D.REGION_HEIGHTS[region];
		if(conf&&'height' in conf&&conf.height<0){
			height+=conf.height;
		}
		return height;
	}
	if(conf){
		if('height' in conf){
			return conf.height;
		}
		if(isSpecialShape(conf.shape)){
			defaultHeight=1;
		}
	}
	const ttag=getTerrainTag(tileId);
	if(ttag && ttag in MV3D.TTAG_HEIGHTS){
		return MV3D.TTAG_HEIGHTS[ttag].height;
	}
	if(isWallTile(tileId)==2){
		defaultHeight=MV3D.WALL_HEIGHT2;
	}else if(isWallTile(tileId)){
		defaultHeight=MV3D.WALL_HEIGHT;
	}else if(tilemap&&tilemap._isTableTile(tileId)){
		defaultHeight=MV3D.TABLE_HEIGHT;
	}
	return defaultHeight;
};

MV3D.getTileHeight=function(x,y,l=0){ return getTileHeight(getTilemapSync(),x,y,l); }

function getStackHeight(tilemap,x,y,layerId=3){
	let height=0;
	for(let l=0; l<=layerId; ++l){
		height+=getTileHeight(tilemap,x,y,l);
	}
	return height;
};
MV3D.getStackHeight=function(x,y,l=3){ return getStackHeight(getTilemapSync(),x,y,l); }

function getCullingHeight(tilemap,x,y,layerId=3,ignorePits=false){
	const tileData=getTileData(x,y);
	const shapes = MV3D.configurationShapes;
	if(!tileData){ return 0; }
	let height=0;
	for(let l=0; l<=layerId; ++l){
		const tileId=tileData[l];
		const data = getTileTextureOffsets(tileId);
		const shape = data.shape;
		if(isSpecialShape(shape)){
			return height;
		}
		if(ignorePits&&data.height<0){
			height-=data.height;
		}
		height+=getTileHeight(tilemap,x,y,l);
	}
	return height;
};
MV3D.getCullingHeight=function(x,y,l=3,ignorePits){ return getCullingHeight(getTilemapSync(),x,y,l,ignorePits); }

function isSpecialShape(shape){
	const shapes = MV3D.configurationShapes;
	return shape===shapes.FENCE||shape===shapes.CROSS||shape===shapes.XCROSS;
}

function getFringeHeight(tilemap,x,y,layerId=3){
	const tileData=getTileData(x,y);
	if(!tileData){ return 0; }
	let height=0;
	for(let l=0; l<layerId; ++l){
		height+=getTileHeight(tilemap,x,y,l);
	}
	const tileId=tileData[layerId];
	const conf = MV3D.tilesetConfigurations[normalizeAutotileId(tileId)];
	if(conf && tilemap._isHigherTile(tileId)){
		return height + (conf.fringe||MV3D.FRINGE_HEIGHT) + (conf.height||0);
	}
	return 0;
}
MV3D.getFringeHeight=function(x,y,l=3){ return getFringeHeight(getTilemapSync(),x,y,l); }


function getFloatHeight(x,y){
	const tileData=getTileData(x,y);
	if(!tileData){ return 0; }
	let float=0;
	for(let l=0; l<=3; ++l){
		const tileId=tileData[l];
		if(isTileEmpty(tileId)){ continue; }
		const conf = MV3D.tilesetConfigurations[normalizeAutotileId(tileId)];
		if(conf && 'float' in conf){
			float += conf.float;
		}
	}
	return float;
}
MV3D.getFloatHeight=function(x,y){ return getFloatHeight(x,y); }

/*
function getRegionHeight(x,y){
	if(region && region in MV3D.REGION_HEIGHTS){
		return MV3D.REGION_HEIGHTS[region];
	}
	return 0;
}

function getTileHeightId(tilemap,tileId){
	//TODO: support per-tile configuration
	if(isWallTile(tileId)){
		return MV3D.WALL_HEIGHT;
	}else if(tilemap._isTableTile(tileId)){
		return MV3D.TABLE_HEIGHT;
	}
	return 0;
};
*/
function getSetNumber(id){
	if(Tilemap.isAutotile(id)){
		return Tilemap.isTileA1(id)?0
			: Tilemap.isTileA2(id)?1 : Tilemap.isTileA3(id)?2 : 3;
	}else{
		return Tilemap.isTileA5(id)?4:5+Math.floor(id/256);
	}
}

function isTextureOpaque(sheetId,x,y){
	x/=MV3D.tileSize;
	y/=MV3D.tileSize;
	switch(sheetId){
		case 0:
			if(x<6&&y<3){return true;}
			if(x>=8&&y>=6){return true;}
			return false;
		case 1:
			//return x<8;
			return x===0||x===1;
		case 2: case 3: case 4: return true;
		default: return false;
	}
}

async function getOptionMaterial(materialOptions,tileId,x,y,w=MV3D.tileSize,h=MV3D.tileSize){
	if(materialOptions.doubleSided){
		return await getFenceMaterial(tileId,x,y,w,h);
	}else if(materialOptions.backSide){
		return await getCeilingMaterial(tileId,x,y,w,h);
	}else{
		return await getTileMaterial(tileId,x,y,w,h);
	}
}

async function getCeilingMaterial(tileId,x,y,w=MV3D.tileSize,h=MV3D.tileSize){
	const mat = await getTileMaterial(tileId,x,y,w,h,'back');
	mat.side=THREE.BackSide;
	//console.log(mat.key);
	return mat;
}

async function getFenceMaterial(tileId,x,y,w=MV3D.tileSize,h=MV3D.tileSize){
	const mat = await getTileMaterial(tileId,x,y,w,h,'double');
	mat.side=THREE.DoubleSide;
	return mat;
}

async function getTileMaterial(tileId,x,y,w=MV3D.tileSize,h=MV3D.tileSize,slug=''){
	if(x==undefined||y==undefined){
		const rect = getTileRects(await getTilemap(),tileId)[0];
		if(x==undefined){ x = rect.sx; }
		if(y==undefined){ y = rect.sy; }
	}
	const sheetId = getSetNumber(tileId);
	const tsName = $gameMap.tileset().tilesetNames[sheetId];
	if(!tsName){return await getErrorMaterial()}
	const textureSrc=`img/tilesets/${tsName}.png`;
	const key = `${sheetId}|${x},${y}|${w},${h}${slug?'|'+slug:''}`;
	if( key in MV3D.materialCache ){
		return MV3D.materialCache[key];
	}
	const opaque = isTextureOpaque(sheetId,x,y);
	const material = await getMaterial(textureSrc,opaque,x,y,w,h);
	MV3D.materialCache[key] = material;
	material.key=key;

	const texture = material.map;
	if(Tilemap.isTileA1(tileId)){
		MV3D.animatedTextures.push(texture);
		const kind = Tilemap.getAutotileKind(tileId);
		texture.animX=kind<=1?2:kind<=3?0:kind%2?0:2;
		texture.animY=kind<=3?0:kind%2?1:0; 
	}
	MV3D.materialList.push(material);
	material.index = MV3D.materialList.indexOf(material);
	return material;
}
MV3D.getTileMaterial=getTileMaterial;

async function getCachedMaterial(key,src,opaque,x,y,w,h){
	if( key in MV3D.materialCache ){
		return MV3D.materialCache[key];
	}
	const material = await getMaterial(src,opaque,x,y,w,h);
	MV3D.materialCache[key] = material;
	return material;
}
MV3D.getCachedMaterial=getCachedMaterial;

async function getMaterial(src,opaque,x,y,w,h){
	const texture = await loadTexture(src,x,y,w,h);
	const material = new THREE.MeshLambertMaterial({
	//const material = new THREE.MeshBasicMaterial({
		map: texture,
		transparent: !opaque,
		//depthWrite: opaque,
		alphaTest:MV3D.ALPHA_TEST,
		side: THREE.FrontSide,
	});
	return material;
}
MV3D.getMaterial=getMaterial;

async function getErrorMaterial(){
	const mat = await getCachedMaterial('errorMaterial',"MV3D/errorTexture.png");
	if(!MV3D.errorMaterial){
		Object.defineProperty(mat,'side',{
			value:THREE.DoubleSide,
		});
	}
	MV3D.errorMaterial = mat;
	MV3D.materialList[0]=mat;
	return mat;
}
MV3D.getErrorMaterial=getErrorMaterial;

const loadTexture=(src,x=0,y=0,w=0,h=0)=>new Promise((resolve,reject)=>{
    new THREE.TextureLoader().load(src,texture=>{
        if(!MV3D.SMOOTHING){
            texture.generateMipmaps = false;
            texture.wrapS = texture.wrapT = THREE.ClampToEdgeWrapping;
            texture.magFilter=THREE.NearestFilter;
            texture.minFilter=THREE.LinearFilter;
        }
		texture.crop(x,y,w,h);
		texture.frameData={x:x,y:y,w:w,h:h};
		texture.animationOrigin=new THREE.Vector2(x,y+h);
        resolve(texture);
    },null,error=>{
    	SceneManager.catchException(new Error(`Error loading ${src}`));
        reject(error);
    });
});
MV3D.loadTexture=loadTexture;

async function getCachedTexture(key,src){
	if( key in MV3D.textureCache ){
		return MV3D.textureCache[key];
	}
	const texture = await loadTexture(src);
	MV3D.textureCache[key] = texture;
	return texture;
}
MV3D.getCachedTexture=getCachedTexture;

async function getShadowTexture(){
	return await getCachedTexture('shadow',"MV3D/shadow.png");
}
MV3D.getShadowTexture=getShadowTexture;
async function getBushAlphaTexture(){
	return await getCachedTexture('bushAlpha',"MV3D/bushAlpha.png");
}
MV3D.getBushAlphaTexture=getBushAlphaTexture;

class Sprite extends THREE.Group{
	constructor(){
		super();
	}
	async initialize(){
		this.sprite = new THREE.Mesh(spriteGeometry);
		this.add(this.sprite);
	}
	async setTileMaterial(tileId){
		this.dispose();
		const sheetId = getSetNumber(tileId);
		const tsName = $gameMap.tileset().tilesetNames[sheetId];
		const textureSrc=`img/tilesets/${tsName}.png`;
		if(tsName){
			this.material = await getMaterial(textureSrc);
			this.material.alphaTest=0.1;
		}else{
			this.material = await getErrorMaterial();
		}
		this.texture = this.material.map;
		this.bitmap = this.texture.image;
		this.sprite.material=this.material;
	}
	async setMaterial(src){
		this.dispose();
		this.material = await getMaterial(src);
		this.material.alphaTest=0.1;
		this.texture = this.material.map;
		this.bitmap = this.texture.image;
		this.sprite.material=this.material;
	}
	dispose(){
		if(this.sprite){
			this.sprite.material.dispose();
			if(this.sprite.material.map){
				this.sprite.material.map.dispose();
			}
		}
	}
	destroy(){
		this.destroyed=true;
		this.dispose();
	}
}

class Character extends Sprite{
	constructor(char,renderOrder){
		super();
		this._character=this.char=char;
		this.charName='';
		this.charIndex=0;
		this.renderOrder=renderOrder;

		this.isVehicle = this.char instanceof Game_Vehicle;
		this.isBoat = this.isVehicle && this.char.isBoat();
		this.isShip = this.isVehicle && this.char.isShip();
		this.isAirship = this.isVehicle && this.char.isAirship();
		this.isEvent = this.char instanceof Game_Event;
		this.isPlayer = this.char instanceof Game_Player;
		this.isFollower = this.char instanceof Game_Follower;

		this.elevation = 0;

		this.lampOrigin = new THREE.Group();
		this.flashlightOrigin = new THREE.Group();
		this.add(this.lampOrigin,this.flashlightOrigin);
		if(!this.char.mv3d_blenders){ this.char.mv3d_blenders={}; }
		this.blenders={};
		this.setupLights();
	}
	async initialize(){
		await super.initialize();
		this.bushAlpha = await getBushAlphaTexture();
		if (MV3D.CHARACTER_SHADOWS){
			this.shadow = new THREE.Mesh(planeGeometry,new THREE.MeshBasicMaterial({
				map: await getShadowTexture(),
				transparent: true, depthWrite: false,
				alphaTest:0.01, side: THREE.FrontSide,
				premultipliedAlpha:true,
			}));
			this.shadow.name='shadow';
			this.shadow.renderOrder=1;
			this.add(this.shadow);
		}
		this.sprite.renderOrder=1.1;
		await this.updateCharacter();

		if(this.isEvent){
			this.eventConfigure();
		}

		if(this.isPlayer){
			this.sprite.name='player';
		}else if(this.isFollower){
			this.sprite.name='follower';
		}else if(this.isVehicle){
			this.sprite.name=this.char._type;
		}else if(this.isEvent){
			this.sprite.name='event_'+this.char.event().name;
		}
	}
	async setTileMaterial(tileId){
		await super.setTileMaterial(tileId);
		this.updateFrame();
		this.updateScale();
		this.material.alphaTest = this.getConfig('alphaTest',0.1);
	}
	async setMaterial(src){
		await super.setMaterial(src);
		this.updateFrame();
		this.updateScale();
		this.material.alphaTest = this.getConfig('alphaTest',0.1);
	}
	async updateCharacter(){
        this._tilesetId = $gameMap.tilesetId();
        this._tileId = this._character.tileId();
        this._characterName = this._character.characterName();
        this._characterIndex = this._character.characterIndex();
		this._isBigCharacter = ImageManager.isBigCharacter(this._characterName);
		if(this._tileId>0){
			await this.setTileMaterial(this._tileId);
		}else if(this._characterName){
			await this.setMaterial(`img/characters/${this._characterName}.png`);
		}
		//this.material.depthTest=false;
	}
	updateCharacterFrame(){
		this.px=this.characterPatternX();
		this.py=this.characterPatternY();
		if(!this.texture){ return; }
		const pw = this.patternWidth();
		const ph = this.patternHeight();
		const sx = (this.characterBlockX() + this.px) * pw;
		const sy = (this.characterBlockY() + this.py) * ph;
		this.setFrame(sx,sy,pw,ph);
	}
	setFrame(x,y,w,h){
		this.texture.crop(x,y,w,h);
	}
	patternChanged(){
		return this.px!==this.characterPatternX() || this.py!==this.characterPatternY();
	}
	characterPatternY(){
		if(this.isEvent && this.char.isObjectCharacter()){
			return this.char.direction()/2-1;
		}
		let dir = transformDirectionYaw(this.char.direction());
		return dir/2-1;
	}

	eventConfigure(){
		if(!this.settings_event){
			this.settings_event={};
			const note = this.char.event().note;
			MV3D.readConfigurationFunctions(
				MV3D.readConfigurationTags(note),
				MV3D.eventConfigurationFunctions,
				this.settings_event,
			);
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
		MV3D.readConfigurationFunctions(
			MV3D.readConfigurationTags(comments),
			MV3D.eventConfigurationFunctions,
			this.settings_event_page,
		);
		this.updateScale();

		if(this.char.mv3d_needsConfigure){
			this.char.mv3d_needsConfigure=false;
		}else{ return; }

		if('pos' in this.settings_event_page){
			const event=this.char.event();
			const pos = this.settings_event_page.pos;
			this.char.locate(
				relativeNumber(event.x,pos.x),
				relativeNumber(event.y,pos.y),
			);
		}

		if(this.material){
			this.material.alphaTest = this.getConfig('alphaTest',0.1);
		}

		this.setupEventLights();

		if('lamp' in this.settings_event_page){
			const lampConfig = this.getConfig('lamp');
			this.blendLampColor.setValue(lampConfig.color,0.5);
			this.blendLampIntensity.setValue(lampConfig.intensity,0.5);
			this.blendLampDistance.setValue(lampConfig.distance,0.5);
		}
		if('flashlight' in this.settings_event_page){
			const flashlightConfig = this.getConfig('flashlight');
			this.blendFlashlightColor.setValue(flashlightConfig.color,0.5);
			this.blendFlashlightIntensity.setValue(flashlightConfig.intensity,0.5);
			this.blendFlashlightDistance.setValue(flashlightConfig.distance,0.5);
			this.blendFlashlightAngle.setValue(flashlightConfig.angle,0.5);
			this.blendFlashlightPitch.setValue(this.getConfig('flashlightPitch',90),0.25);
			this.flashlightTargetYaw=this.getConfig('flashlightYaw','+0');
		}
	}
	getConfig(key,dfault=undefined){
		if(!this.settings_event){ return dfault; }
		if(key in this.settings_event_page){
			return this.settings_event_page[key];
		}else if(key in this.settings_event){
			return this.settings_event[key];
		}
		return dfault;
	}
	hasConfig(key){
		if(!this.settings_event){ return false; }
		return key in this.settings_event_page || key in this.settings_event;
	}

	getShape(){
		return this.getConfig('shape',
			this.char.isTile() ? MV3D.configurationShapes.FLAT : MV3D.EVENT_SHAPE
		);
	}
	updateShape(){
		this.shape=this.getShape();
		this.sprite.geometry=spriteGeometry;
		let defaultSide=THREE.FrontSide;
		let geometry = spriteGeometry;
		switch(this.shape){
		case MV3D.configurationShapes.FLAT:
			geometry=planeGeometry;
			if(this.char._priorityType===2||this.hasConfig('height')||this.hasConfig('z')){
				defaultSide=THREE.DoubleSide;
			}
			break;
		case MV3D.configurationShapes.CROSS:
			geometry=crossGeometry;
			defaultSide=THREE.DoubleSide;
			break;
		case MV3D.configurationShapes.FENCE:
			defaultSide=THREE.DoubleSide;
			break;
		}
		this.sprite.geometry=geometry;
		this.sprite.material.side=this.getConfig('side',defaultSide);
	}
	updateScale(){
		if(!this.bitmap){ return; }
		const configScale = this.getConfig('scale',new THREE.Vector2(1,1));
		let scale = 1;
		if(this.isVehicle){
			const settings = MV3D[`${this.char._type.toUpperCase()}_SETTINGS`];
			scale = MV3D.loadData( `${this.char._type}_scale`, settings.scale );
		}
		const xscale = this.patternWidth()/MV3D.tileSize * configScale.x * scale;
		const yscale = this.patternHeight()/MV3D.tileSize * configScale.y * scale;
		this.sprite.scale.set(xscale,yscale,yscale);
	}

	hasBush(){
		if(this.isEvent){
			return this.getConfig('bush',!this._tileId);
		}
		if(this.isVehicle){
			return MV3D.VEHICLE_BUSH;
		}
		return true;
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
			distance:MV3D.LIGHT_DIST,
			angle:MV3D.LIGHT_ANGLE,
		});
		this.blendFlashlightColor = this.makeColorBlender('flashlightColor',config.color);
		this.blendFlashlightIntensity = this.makeBlender('flashlightIntensity',config.intensity);
		this.blendFlashlightDistance = this.makeBlender('flashlightDistance',config.distance);
		this.blendFlashlightAngle = this.makeBlender('flashlightAngle',config.angle);
		this.flashlight = new THREE.SpotLight(
			this.blendFlashlightColor.targetValue(),
			this.blendFlashlightIntensity.targetValue(),
			this.blendFlashlightDistance.targetValue(),
			degtorad(this.blendFlashlightAngle.targetValue()),
			MV3D.PENUMBRA,MV3D.LIGHT_DECAY
		);
		this.flashlightOrigin.add(this.flashlight);
		this.flashlight.add(this.flashlight.target);
		this.blendFlashlightPitch = this.makeBlender('flashlightPitch',90);
		this.blendFlashlightYaw = this.makeBlender('flashlightYaw', 0);
		this.blendFlashlightYaw.cycle=360;
		this.flashlightTargetYaw=this.getConfig('flashlightYaw','+0');
		this.updateFlashlightTarget();
	}

	setupLamp(){
		if(this.lamp){ return; }
		const config = this.getConfig('lamp',{
			color:0xffffff,
			intensity:1,
			distance:MV3D.LIGHT_DIST,
		});
		this.blendLampColor = this.makeColorBlender('lampColor',config.color);
		this.blendLampIntensity = this.makeBlender('lampIntensity',config.intensity);
		this.blendLampDistance = this.makeBlender('lampDistance',config.distance);
		this.lamp = new THREE.PointLight(
			this.blendLampColor.targetValue(),
			this.blendLampIntensity.targetValue(),
			this.blendLampDistance.targetValue(),
			MV3D.LIGHT_DECAY
		);
		this.lampOrigin.add(this.lamp);
	}

	updateFlashlightTarget(){
		this.flashlight.target.position.setScalar(0);
		this.flashlight.target.pitch=this.blendFlashlightPitch.currentValue();
		this.flashlight.target.yaw=this.blendFlashlightYaw.currentValue();
		this.flashlight.target.translateZ(1);

		this.flashlight.distance=this.blendFlashlightDistance.currentValue();
		//*/
		this.flashlight.position.setScalar(0);
		this.flashlight.rotation.copy(this.flashlight.target.rotation);
		let flashlightOffset = Math.tan(degtorad(90-this.blendFlashlightAngle.currentValue()-Math.max(90,this.blendFlashlightPitch.currentValue())+90))*MV3D.LIGHT_HEIGHT;
		flashlightOffset = Math.max(0,Math.min(1,flashlightOffset));
		this.flashlight.distance+=flashlightOffset;
		this.flashlight.translateZ(-flashlightOffset);
		this.flashlight.rotation.set(0,0,0);
		//*/
	}

	updateLights(){
		if(this.flashlight){
			const flashlightYaw = 180+relativeNumber( MV3D.dirToYaw( this.char.direction() ), this.flashlightTargetYaw);
			if(flashlightYaw !== this.blendFlashlightYaw.targetValue()){
				this.blendFlashlightYaw.setValue(flashlightYaw,0.25);
			}
			if(this.blendFlashlightColor.update()|this.blendFlashlightIntensity.update()
			|this.blendFlashlightDistance.update()|this.blendFlashlightAngle.update()
			|this.blendFlashlightYaw.update()|this.blendFlashlightPitch.update()){
				this.flashlight.color.setHex(this.blendFlashlightColor.currentValue());
				this.flashlight.intensity=this.blendFlashlightIntensity.currentValue();
				this.flashlight.angle=degtorad(this.blendFlashlightAngle.currentValue());
				this.updateFlashlightTarget();
			}
			this.flashlight.position.z = this.getConfig('lightHeight',MV3D.LIGHT_HEIGHT);
		}
		if(this.lamp){
			if(this.blendLampColor.update()|this.blendLampIntensity.update()|this.blendLampDistance.update()){
				this.lamp.color.setHex(this.blendLampColor.currentValue());
				this.lamp.intensity=this.blendLampIntensity.currentValue();
				this.lamp.distance=this.blendLampDistance.currentValue();
			}
			this.lamp.position.z = this.getConfig('lightHeight',MV3D.LIGHT_HEIGHT);
		}

	}

	makeBlender(key,dfault,clazz=Blender){
		if(key in this.char.mv3d_blenders){
			dfault = this.char.mv3d_blenders[key];
		}else{
			this.char.mv3d_blenders[key]=dfault;
		}
		const blender=new clazz(key,dfault);
		this.blenders[key]=blender;
		blender.storageLocation=()=>this.char.mv3d_blenders;
		return this.blenders[key];
	}
	makeColorBlender(key,dfault){
		return this.makeBlender(key,dfault,ColorBlender);
	}

	update(){
		if(this.char._erased){
			this.destroy();
		}
		if(this.isImageChanged()){
			this.updateCharacter();
		}
		this.visible=this.char.mv_sprite.visible;
		if(typeof this.char.isVisible === 'function'){
			this.visible=this.visible&&this.char.isVisible();
		}
		if(!this.sprite || !this.material || !this.visible){ return; }

		if(this.patternChanged()){
			this.updateFrame();
		}

		if(this.shape !== this.getShape()){
			this.updateShape();
		}
		this.updateLights();

		if(this.shape===MV3D.configurationShapes.SPRITE){
			this.sprite.pitch = MV3D.blendCameraPitch.currentValue()-90;
			this.sprite.yaw = MV3D.blendCameraYaw.currentValue();
		}else if(this.shape===MV3D.configurationShapes.TREE){
			this.sprite.pitch=0;
			this.sprite.yaw = MV3D.blendCameraYaw.currentValue();
			//const localCameraPos = this.worldToLocal(MV3D.camera.getWorldPosition(new THREE.Vector3()));
			//this.sprite.rotation.z = new THREE.Vector2(localCameraPos.x,localCameraPos.y).angle()+Math.PI/2;
		}else{
			this.sprite.pitch=0;
			this.sprite.yaw=this.getConfig('rot',0);
		}

		if(this.char===$gamePlayer){
			this.sprite.visible = !MV3D.is1stPerson(true);
		}

		const bush = Boolean(this.char.bushDepth());

		if(bush && this.hasBush()){
			if(!this.sprite.material.alphaMap){
				this.sprite.material.alphaMap=this.bushAlpha;
				this.sprite.material.needsUpdate=true;
			}
		}else{
			if(this.sprite.material.alphaMap){
				this.sprite.material.alphaMap=null;
				this.sprite.material.needsUpdate=true;
			}
		}
		const loopPos = MV3D.loopCoords(this.char._realX,this.char._realY);
		this.position.x= loopPos.x + this.getConfig('x',0);
		this.position.y= -loopPos.y - this.getConfig('y',0);
		this.sprite.position.x=0; this.sprite.position.y=0;

		const billboardOffset = new THREE.Vector2(0,-1).rotateAround(v2origin,degtorad(MV3D.blendCameraYaw.currentValue())).multiplyScalar(0.45);
		const facingOffset = new THREE.Vector2(0,1).rotateAround(v2origin,degtorad(MV3D.dirToYaw(this.char.direction()))).multiplyScalar(0.45);
		const lightOffset = this.getConfig('lightOffset',null);
		this.lampOrigin.position.setScalar(0);
		this.flashlightOrigin.position.setScalar(0);
		if(this.shape===MV3D.configurationShapes.SPRITE){
			this.sprite.position.x+=billboardOffset.x;
			this.sprite.position.y+=billboardOffset.y;
			this.lampOrigin.position.x=billboardOffset.x;
			this.lampOrigin.position.y=billboardOffset.y;
		}else if(!lightOffset){
			this.lampOrigin.position.x=billboardOffset.x/2;
			this.lampOrigin.position.y=billboardOffset.y/2;
		}
		//this.flashlightOrigin.position.x=facingOffset.x;
		this.flashlightOrigin.position.y=facingOffset.y;
		if(lightOffset){
			this.lampOrigin.position.x+=lightOffset.x;
			this.lampOrigin.position.y-=lightOffset.y;
		}

		//this.position.z=Math.abs(Math.sin(Date.now()/1000));
		const tilemap = getTilemapSync();
		const tileHeight = getStackHeight(tilemap,Math.round(this.char._realX),Math.round(this.char._realY));
		let newElevation = tileHeight;
		if(this.isVehicle || (this.isPlayer||this.isFollower)&&$gamePlayer.vehicle()){
			newElevation += getFloatHeight(Math.round(this.char._realX),Math.round(this.char._realY));
			if(this.char===$gameMap.vehicle('boat')){
				newElevation += MV3D.BOAT_SETTINGS.zoff;
			}else if(this.char===$gameMap.vehicle('ship')){
				newElevation += MV3D.SHIP_SETTINGS.zoff;
			}
		}

		if(this.isAirship && $gamePlayer.vehicle()===this.char){
			if(!this.char._driving){
				this.elevation += (newElevation-this.elevation)/10;
			}if(newElevation>=this.elevation){
				const ascentSpeed = 100/Math.pow(1.5,MV3D.loadData('airship_ascentspeed',4));
				this.elevation += (newElevation-this.elevation)/ascentSpeed;
			}else{
				if(vehicleNotObstructed.call(this.char,this.char.x,this.char.y,true)){
					const descentSpeed = 100/Math.pow(1.5,MV3D.loadData('airship_descentspeed',2));
					this.elevation += (newElevation-this.elevation)/descentSpeed;
				}
			}
			this.position.z=this.elevation + MV3D.LAYER_DIST*4;
			this.position.z += MV3D.loadData('airship_height',MV3D.AIRSHIP_SETTINGS.height)*this.char._altitude/this.char.maxAltitude();
		}else if(this.char.isJumping()){
			let jumpProgress = 1-(this.char._jumpCount/(this.char._jumpPeak*2));
			let jumpHeight = Math.pow(jumpProgress-0.5,2)*-4+1;
			let jumpDiff = Math.abs(this.char.mv3d_jumpHeightEnd - this.char.mv3d_jumpHeightStart);
			this.position.z = this.char.mv3d_jumpHeightStart*(1-jumpProgress)
			+ this.char.mv3d_jumpHeightEnd*jumpProgress + jumpHeight*jumpDiff/2
			+this.char.jumpHeight()/MV3D.tileSize;
		}else{
			this.elevation=newElevation;
			this.position.z=this.elevation + MV3D.LAYER_DIST*4;
		}

		if(this.isEvent){
			this.position.z += this.getConfig('height',this.char._priorityType===2?MV3D.EVENT_HEIGHT:0);
			if(this.hasConfig('z')){
				this.position.z=this.getConfig('z',0);
			}
		}

		if(this.shadow){
			this.shadow.visible = this.getConfig('shadow',
				this.shape!==MV3D.configurationShapes.FLAT
			);
		}
		if(this.shadow && this.shadow.visible){
			if(this.isPlayer||this.isFollower){
				const myIndex = MV3D.mapchars.children.indexOf(this);
				if(myIndex>=0)
				for (let i=myIndex+1; i<MV3D.mapchars.children.length; ++i){
					const other = MV3D.mapchars.children[i];
					if(!other.shadow||!other.visible){ continue; }
					if(other.char._realX===this.char._realX&&other.char._realY===this.char._realY){
						this.shadow.visible=false;
						break;
					}
				}
			}
			this.shadow.position.x=this.sprite.position.x;
			this.shadow.position.y=this.sprite.position.y;
			const shadowBase = Math.min(0,this.getConfig('height',0));
			const shadowDist = Math.max(this.position.z - tileHeight, shadowBase);
			const shadowFadeDist = this.isAirship? MV3D.AIRSHIP_SETTINGS.shadowDist : MV3D.SHADOW_DIST;
			const shadowStrength = Math.max(0,1-Math.abs(shadowDist)/shadowFadeDist);
			this.shadow.position.z = -shadowDist + MV3D.LAYER_DIST*4;
			const shadowScale = this.isAirship? MV3D.AIRSHIP_SETTINGS.shadowScale : this.getConfig('shadowScale',MV3D.SHADOW_SCALE);
			this.shadow.scale.setScalar(shadowStrength*shadowScale);
			this.shadow.material.opacity=shadowStrength-0.5*bush;
		}

	}
	destroy(){
		super.destroy();
		MV3D.mapchars.remove(this);
		if(this.char.mv3d_sprite===this){
			delete this.char.mv3d_sprite;
		}
		if(this.shadow){
			this.shadow.material.dispose();
		}
	}
}

inheritMethods(Character,Sprite_Character,[
	'characterBlockX','characterBlockY','characterPatternX',
	'isImageChanged','patternWidth','patternHeight',
	'updateTileFrame','updateFrame',
]);

function inheritMethods(target,source,methodList){
	for (const methodName of methodList){
		target.prototype[methodName]=source.prototype[methodName];
	}
}

// input
const _player_updateMove = Game_Player.prototype.updateMove;
Game_Player.prototype.updateMove = function() {
	_player_updateMove.apply(this,arguments);
    if ( !this.isMoving() && MV3D.is1stPerson() ) {
        MV3D.playerFaceYaw();
    }
};
const _player_move_straight=Game_Player.prototype.moveStraight;
Game_Player.prototype.moveStraight = function(d) {
	_player_move_straight.apply(this,arguments);
	if(!this.isMovementSucceeded()&&MV3D.is1stPerson()){
		MV3D.playerFaceYaw();
	}
};

MV3D.playerFaceYaw=function(){
	let dir = Math.floor((-MV3D.blendCameraYaw.targetValue()+45)/90).mod(4);
	if(dir>1){ dir+=(dir+1)%2*2-1; }
	dir=10-(dir*2+2);
	$gamePlayer.setDirection(dir);
}

MV3D.dirToYaw=function(dir){
	let yaw = dir/2-1;
	if(yaw>1){ yaw+=(yaw+1)%2*2-1; }
	yaw=yaw*-90+180;
	return yaw;
}


function transformDirectionYaw(dir,yaw=MV3D.blendCameraYaw.currentValue(),reverse=false){
	if(dir==0){ return 0; }
	dir = dir/2-1;
	if(dir>1){ dir+=(dir+1)%2*2-1; }
	const c = Math.floor((yaw+45)/90);
	if(reverse){
		dir=(dir-c).mod(4);
	}else{
		dir=(dir+c).mod(4);
	}
	if(dir>1){ dir+=(dir+1)%2*2-1; }
	return dir*2+2;
}

Game_Player.prototype.getInputDirection = function() {
	let dir = Input.dir4;
	return transformDirectionYaw(dir,MV3D.blendCameraYaw.currentValue(),true);
};

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
Game_Event.prototype.initialize = function() {
	_event_init.apply(this,arguments);
	const event = this.event();
	let config = {};
	MV3D.readConfigurationFunctions(
		MV3D.readConfigurationTags(event.note),
		MV3D.eventConfigurationFunctions,
		config,
	);
	if('pos' in config){
		this.locate(
			relativeNumber(event.x,config.pos.x),
			relativeNumber(event.y,config.pos.y),
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
};

// movement and passability

_characterBase_canPass = Game_CharacterBase.prototype.canPass
Game_CharacterBase.prototype.canPass = function(x, y, d) {
	if(!_characterBase_canPass.apply(this,arguments)){
		return false;
	}
    const x2 = $gameMap.roundXWithDirection(x, d);
    const y2 = $gameMap.roundYWithDirection(y, d);
	if(this===$gamePlayer){
		const vehicle = this.vehicle();
		if(vehicle){
			const obstructed = vehicleObstructed.call(vehicle,x2,y2,false);
			if(vehicle.isAirship()){
				return !obstructed;
			}else if(obstructed){
				return false;
			}
		}
	}
    if (this.isThrough() || this.isDebugThrough()) {
        return true;
    }
    const tilemap = getTilemapSync();
	const tileHeight1 = getStackHeight(tilemap,x,y);
	const tileHeight2 = getStackHeight(tilemap,x2,y2);
	if(tileHeight1!==tileHeight2){ return false; }
    return true;
};

function vehicleNotObstructed(x, y, strict=true){
	if(!(this instanceof Game_Vehicle)){ throw "This isn't a vehicle."; }
	if(!this.mv3d_sprite){ return true; }
	if(!this._driving){ return true; }
	if($gamePlayer.isDebugThrough()){ return true; }
	const isAirship=this.isAirship();
	const isShip=this.isShip();
	const settings = MV3D[`${this._type.toUpperCase()}_SETTINGS`];
	const big = MV3D.loadData( `${this._type}_big`, settings.big );
	let altitude = 0.5;
	if(isAirship){
		altitude = MV3D.loadData('airship_height',MV3D.AIRSHIP_SETTINGS.height);
	}else{
		altitude += getFloatHeight(x,y);
	}
	const tilemap = getTilemapSync();
	const tileHeight = getStackHeight(tilemap,x,y);
	let posZ = this.mv3d_sprite.position.z;
	if('zoff' in settings){
		posZ-=settings.zoff;
	}
	if(tileHeight>posZ){ return false; }
	if(!big){ return true; }
	for (let ox=-1;ox<=1;++ox)
	for (let oy=-1;oy<=1;++oy){
		if(ox===0&&oy===0 || !strict&&ox&&oy){ continue; }
		const tileHeight2 = getStackHeight(tilemap,x+ox,y+oy);
		if(tileHeight2>tileHeight+altitude*!strict&&(strict||tileHeight2>posZ)){
			return false;
		}
	}
	return true;
}
function vehicleObstructed(){
	return !vehicleNotObstructed.apply(this,arguments);
}

const _airship_land_ok = Game_Map.prototype.isAirshipLandOk;
Game_Map.prototype.isAirshipLandOk = function(x, y) {
	if(vehicleObstructed.call(this.airship(),x,y,true)){ return false; }
	if(MV3D.AIRSHIP_SETTINGS.bushLanding){
		return this.checkPassage(x, y, 0x0f);
	}else{
		return _airship_land_ok.apply(this,arguments);
	}
    
};

const _player_updateVehicleGetOn = Game_Player.prototype.updateVehicleGetOn;
Game_Player.prototype.updateVehicleGetOn = function() {
	const vehicle = this.vehicle();
	const speed = MV3D.loadData(`${vehicle._type}_speed`,vehicle._moveSpeed);
	this.vehicle().setMoveSpeed(speed);
	_player_updateVehicleGetOn.apply(this,arguments);
};

const _charBase_jump = Game_CharacterBase.prototype.jump;
Game_CharacterBase.prototype.jump = function(xPlus, yPlus) {
	const tilemap = getTilemapSync();
	this.mv3d_jumpHeightStart = getTileHeight(tilemap,this.x,this.y);
	this.mv3d_jumpHeightEnd = getTileHeight(tilemap,this.x+xPlus,this.y+yPlus);
	_charBase_jump.apply(this,arguments);
};

Object.assign(Input.keyMapper,{
	81:'rotleft',  // Q
	69:'rotright', // E
	87:'up',       // W
	65:'left',     // A
	83:'down',     // S
	68:'right',    // D
});

MV3D.setupInput=function(){
	const descriptors={
		left:getInputDescriptor('left','left','rotleft'),
		rotleft:getInputDescriptor('pageup','rotleft','left'),
		right:getInputDescriptor('right','right','rotright'),
		rotright:getInputDescriptor('pagedown','rotright','right'),
	}
	Object.defineProperties(Input.keyMapper,{
		37:descriptors.left, // left arrow
		39:descriptors.right,// right arrow
		81:descriptors.rotleft, //Q
		69:descriptors.rotright,//E
		65:descriptors.left, //A
		68:descriptors.right,//D
	});
}

function getInputDescriptor(...modes){
	let assignedValue=undefined;
	return {
		configurable:true,
		get(){
			if(assignedValue!=undefined){ return assignedValue; }
			if(!(SceneManager._scene instanceof Scene_Map)){ return modes[0]; }
			if(MV3D.rotationMode==='A&D'){ return modes[2]; }
			return modes[1];
		},
		set(v){ assignedValue=v; },
	};
}

let _last_raycast=0;
Scene_Map.prototype.processMapTouch = function() {
    if (TouchInput.isTriggered() || this._touchCount > 0) {
        if (TouchInput.isPressed()) {
            if (this._touchCount === 0 || this._touchCount >= 15) {
            	if(Date.now()-_last_raycast<=500){ return; }
            	_last_raycast=Date.now();
            	MV3D.raycaster.setFromCamera(new THREE.Vector2(
            		TouchInput.x/Graphics.boxWidth*2-1,
            		-TouchInput.y/Graphics.boxHeight*2+1
            	),MV3D.activeCamera);
            	const intersections=MV3D.raycaster.intersectObjects(MV3D.map.children,true);
            	for(const intersection of intersections){
            		console.log(intersection.face);
            		let point = intersection.point;
            		if(intersection.object.isEvent){
            			point = {x:intersection.object.char.x,y:-intersection.object.char.y};
            		}
            		$gameTemp.setDestination(Math.round(point.x), Math.round(-point.y));
            		break;
            		//console.log(intersection.object.name,intersection.object);
            	}
            }
            this._touchCount++;
        } else {
            this._touchCount = 0;
        }
    }
};

const _player_findDirectionTo=Game_Player.prototype.findDirectionTo;
Game_Player.prototype.findDirectionTo=function(){
	const dir = _player_findDirectionTo.apply(this,arguments);
	if(MV3D.is1stPerson() && dir){
		let yaw = MV3D.dirToYaw(dir);

		MV3D.blendCameraYaw.setValue(yaw,0.25);
	}
	return dir;
}


// plugin commands
const _pluginCommand = Game_Interpreter.prototype.pluginCommand;
Game_Interpreter.prototype.pluginCommand = function(command, args) {
	if(command.toLowerCase() !== 'mv3d'){
		return _pluginCommand.apply(this,arguments);
	}
	const pc = new MV3D.PluginCommand();
	pc.INTERPRETER=this;
	pc.FULL_COMMAND=[command,...args].join(' ');
	args=args.filter(v=>v);
	pc.CHAR=$gameMap.event(this._eventId);
	if(args[0]&&args[0][0]===('@')){
		pc.CHAR = pc.TARGET_CHAR(args.shift());
	}

	const com = args.shift().toLowerCase();
	if(com in pc){
		pc[com](...args);
	}
};

MV3D.PluginCommand=class{
	async camera(...a){
		var time=this._TIME(a[2]);
		switch(a[0].toLowerCase()){
			case 'pitch'    : this.pitch (a[1],time); return;
			case 'yaw'      : this.yaw   (a[1],time); return;
			case 'dist'     :
			case 'distance' : this.dist  (a[1],time); return;
			case 'height'   : this.height(a[1],time); return;
			case 'mode'     : this.cameramode(a[1]); return;
			case 'target': this._cameraTarget(a[1],time); return;
			case 'pan': this.pan(a[1],a[2],a[3]); return;
		}
	}
	yaw(deg,time=1){
		this._RELATIVE_BLEND(MV3D.blendCameraYaw,deg,time);
		if ( MV3D.is1stPerson() ) { MV3D.playerFaceYaw(); }
	}
	pitch(deg,time=1){ this._RELATIVE_BLEND(MV3D.blendCameraPitch,deg,time); }
	dist(n,time=1){ this._RELATIVE_BLEND(MV3D.blendCameraDist,n,time); }
	height(n,time=1){ this._RELATIVE_BLEND(MV3D.blendCameraHeight,n,time); }
	_cameraTarget(target,time){
		MV3D.setCameraTarget(this.TARGET_CHAR(target), time);
	}
	pan(x,y,time=1){
		console.log(x,y,time);
		time=this._TIME(time);
		this._RELATIVE_BLEND(MV3D.blendPanX,x,time);
		this._RELATIVE_BLEND(MV3D.blendPanY,y,time);
	}

	rotationmode(mode){ MV3D.rotationMode=mode; }
	pitchmode(mode){ MV3D.pitchMode=mode; }

	_VEHICLE(vehicle,data,value){
		data=data.toLowerCase();
		const key = `${Vehicle}_${data}`;
		if(data==='big'){ value=booleanString(value); }
		else{ value=relativeNumber(MV3D.loadData(key,0),value); }
		MV3D.saveData(key,value);
	}
	boat(d,v){ this._VEHICLE('boat',d,v); }
	ship(d,v){ this._VEHICLE('ship',d,v); }
	airship(d,v){ this._VEHICLE('airship',d,v); }
	cameramode(mode){ MV3D.cameraMode=mode; }
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
	_fogColor(color,time){ MV3D.blendFogColor.setValue(hexNumber(color),time); }
	_fogNear(n,time){ this._RELATIVE_BLEND(MV3D.blendFogNear,n,time); }
	_fogFar(n,time){ this._RELATIVE_BLEND(MV3D.blendFogFar,n,time); }
	light(...a){
		var time=this._TIME(a[2]);
		switch(a[0].toLowerCase()){
			case 'color'    : this._lightColor    (a[1],time); return;
			case 'intensity': this._lightIntensity(a[1],time); return;
		}
		time=this._TIME(a[1]);
		this._lightcolor(a[0],time);
		this._lightintensity(a[0],time);
	}
	_lightColor(color,time=1){ MV3D.blendLightColor.setValue(hexNumber(color),time); }
	_lightIntensity(n,time=1){ this._RELATIVE_BLEND(MV3D.blendLightIntensity,n,time); }
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
	_lampColor(char,color,time=1){ char.blendLampColor.setValue(hexNumber(color),time); }
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
			case 'yaw'      : this._flashlightYaw      (char,a[1],time); return;
			case 'pitch'    : this._flashlightPitch    (char,a[1],time); return;
		}
		time=this._TIME(a[4]);
		this._flashlightColor(char,a[0],time);
		this._flashlightIntensity(char,a[1],time);
		this._flashlightDistance(char,a[2],time);
		this._flashlightAngle(char,a[3],time);
	}
	_flashlightColor(char,color,time){ char.blendFlashlightColor.setValue(hexNumber(color),time); }
	_flashlightIntensity(char,n,time){ this._RELATIVE_BLEND(char.blendFlashlightIntensity,n,time); }
	_flashlightDistance(char,n,time){ this._RELATIVE_BLEND(char.blendFlashlightDistance,n,time); }
	_flashlightAngle(char,n,time){ this._RELATIVE_BLEND(char.blendFlashlightAngle,n,time); }
	_flashlightPitch(char,n,time){ this._RELATIVE_BLEND(char.blendFlashlightPitch,n,time); }
	_flashlightYaw(char,yaw,time){ char.flashlightTargetYaw=yaw; }
	_RELATIVE_BLEND(blender,n,time){ blender.setValue(relativeNumber(blender.targetValue(),n),Number(time)); }
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
			await sleep(100);
			if(++w>10){ return this.ERROR_CHAR(); }
		}
		return char.mv3d_sprite;
	}
	TARGET_CHAR(target){
		return targetChar(target,$gameMap.event(this.INTERPRETER._eventId),this.CHAR);
	}
};

function targetChar(target,self=null,dfault=null){
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
function getTargetString(char){
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

function hexNumber(n){
	n=String(n);
	if(n.startsWith('#')){
		n=n.substr(1);
	}
	return Number.parseInt(n,16);
}

function relativeNumber(current,n){
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
}

function booleanString(s){
	return Boolean(falseString(s));
}
function falseString(s){
	if(!s){ return false; }
	if(typeof s !=='string'){ s=String(s); }
	const S=s.toUpperCase();
	if(falseString.values.includes(S)){
		return false;
	}
	return s;
}
falseString.values=['OFF','FALSE','UNDEFINED','NULL','DISABLE','DISABLED'];

// value blender
class Blender{
	constructor(key,dfault){
		this.key=key;
		this.dfault=MV3D.loadData(key,dfault);
		this.value=dfault;
		this.speed=1;
		this.max=Infinity;
		this.min=-Infinity;
		this.cycle=false;
	}
	setValue(target,time=0){
		target = Math.min(this.max,Math.max(this.min,target));
		let diff = target - this.value;
		if(!diff){ return; }
		this.saveValue(this.key,target);
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
		if(this.value===target){ return false; }
		const diff = target - this.value;
		if(this.speed > Math.abs(diff)){
			this.value=target;
		}else{
			this.value+=this.speed*Math.sign(diff);
		}
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
}
class ColorBlender{
	constructor(key,dfault){
		this.dfault=dfault;
		this.r=new Blender(`${key}_r`,dfault>>16);
		this.g=new Blender(`${key}_g`,dfault>>8&0xff);
		this.b=new Blender(`${key}_b`,dfault&0xff);
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
}

// parallax

const gameMap_parallaxOx = Game_Map.prototype.parallaxOx;
Game_Map.prototype.parallaxOx = function() {
	let ox = gameMap_parallaxOx.apply(this,arguments);
	if(this._parallaxLoopX){
		return ox - MV3D.blendCameraYaw.currentValue()*816/90;
	}
	return ox;
};
const gameMap_parallaxOy = Game_Map.prototype.parallaxOy;
Game_Map.prototype.parallaxOy = function() {
	let oy = gameMap_parallaxOy.apply(this,arguments);
	if(this._parallaxLoopY){
		return oy - MV3D.blendCameraPitch.currentValue()*816/90;
	}
    return oy;
};

Game_Map.prototype.setDisplayPos = function() { };
Game_Map.prototype.scrollUp = function() { };
Game_Map.prototype.scrollDown = function() { };
Game_Map.prototype.scrollLeft = function() { };
Game_Map.prototype.scrollRight = function() { };
Game_Map.prototype.updateScroll = function() {
    this._displayX = -MV3D.blendCameraYaw.currentValue()*816/3600;
    this._displayY = -MV3D.blendCameraPitch.currentValue()*816/3600;
};

Game_CharacterBase.prototype.isNearTheScreen = function() {
	return Math.abs(this.x - MV3D.cameraStick.position.x)<=MV3D.RENDER_DIST
	&& Math.abs(-this.y - MV3D.cameraStick.position.y)<=MV3D.RENDER_DIST;
};

// overrides

const _graphics_createCanvas=Graphics._createCanvas;
Graphics._createCanvas = function() {
	MV3D.setup();
	MV3D.updateCanvas();
	_graphics_createCanvas.apply(this,arguments);
};

const _graphics_updateAllElements=Graphics._updateAllElements;
Graphics._updateAllElements = function() {
	_graphics_updateAllElements.apply(this,arguments);
	MV3D.updateCanvas();
};

const _graphics_render=Graphics.render;
Graphics.render=function(){
	MV3D.render();
	_graphics_render.apply(this,arguments);
};
/*
const _sceneManager_update=SceneManager.updateMain;
SceneManager.updateMain = function() {
	_sceneManager_update.apply(this,arguments);
	MV3D.update();
};
*/
const _sceneMap_update=Scene_Map.prototype.update;
Scene_Map.prototype.update = function(){
	_sceneMap_update.apply(this,arguments);
	MV3D.update();
}

// Don't render the boring flat map.
ShaderTilemap.prototype.renderWebGL = function(renderer) {
	return;
};

const _createTilemap=Spriteset_Map.prototype.createTilemap;
Spriteset_Map.prototype.createTilemap=function(){
	_createTilemap.apply(this,arguments);
	this._tilemap.visible=false;// Don't render the boring flat map.
	this._baseSprite.addChild( new PIXI.Sprite(MV3D.texture) );
};

// Scene Transfers
const _performTransfer=Game_Player.prototype.performTransfer;
Game_Player.prototype.performTransfer = function() {
	const newmap = this._newMapId !== $gameMap.mapId();
	//const needsReload = newmap || this._needsMapReload;
	_performTransfer.apply(this,arguments);
	MV3D.loadMapSettings( newmap );
	if(newmap){
		MV3D.resetCameraTarget();
		MV3D.clearMap();
	}
	if( MV3D.is1stPerson() ){
		MV3D.blendCameraYaw.setValue(MV3D.dirToYaw($gamePlayer.direction()),0);
	}
	//MV3D.updateCamera(true);
	MV3D.updateMap();
};

const _onMapLoaded=Scene_Map.prototype.onMapLoaded;
Scene_Map.prototype.onMapLoaded=function(){
	_onMapLoaded.apply(this,arguments);
	MV3D.loadMapSettings( false );
	MV3D.rememberCameraTarget();

	//MV3D.clearMap();
	MV3D.updateMap();
	MV3D.createCharacters();
	MV3D.updateCamera(true);
};

_title_start=Scene_Title.prototype.start;
Scene_Title.prototype.start = function() {
	_title_start.apply(this,arguments);
	MV3D.clearMap();
	MV3D.clearCameraTarget();
};

_sprite_char_setchar = Sprite_Character.prototype.setCharacter;
Sprite_Character.prototype.setCharacter = function(character) {
	_sprite_char_setchar.apply(this,arguments);
	Object.defineProperty(character,'mv_sprite',{
		value:this,
		configurable:true,
	});
};


// THREE prototype mods

THREE.Object3D.DefaultUp.set(0,0,1);
THREE.Euler.DefaultOrder='YZX';

const degtorad = deg=>deg*Math.PI/180;
const radtodeg = rad=>rad*180/Math.PI;

Object.defineProperties(THREE.Object3D.prototype,{
    //degree rotation
    pitch:{
        get(){ return radtodeg(this.rotation.x); },
        set(v){ this.rotation.x=degtorad(v); },
    },
    yaw:{
        get(){ return radtodeg(this.rotation.z); },
        set(v){ this.rotation.z=degtorad(v); },
    },
    //shorthand position
    x:{
        get(){ return this.position.x; },
        set(v){ this.position.x=v; },
    },
    y:{
        get(){ return this.position.y; },
        set(v){ this.position.y=v; },
    },
    z:{
        get(){ return this.position.z; },
        set(v){ this.position.z=v; },
    },
});

THREE.Texture.prototype.crop=function(x=0,y=0,w=0,h=0){
	if(!w)w=this.image.width-x;
	if(!h)h=this.image.height-y;
	if(MV3D.SMOOTHING){
		++x;++y;w-=2;h-=2;
	}
	this.repeat.x=w/this.image.width;
	this.repeat.y=h/this.image.height;
	this.offset.x=x/this.image.width;
	this.offset.y=1-y/this.image.height-this.repeat.y;
}

})();