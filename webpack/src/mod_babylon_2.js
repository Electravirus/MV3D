// Edited copies of Babylon functions

BABYLON.SpriteManager.prototype.render = function () {
    // Check
    if (!this._effectBase.isReady() || !this._effectFog.isReady() || !this._spriteTexture
        || !this._spriteTexture.isReady() || !this.sprites.length) {
        return;
    }
    var engine = this._scene.getEngine();
    var baseSize = this._spriteTexture.getBaseSize();
    // Sprites
    var deltaTime = engine.getDeltaTime();
    var max = Math.min(this._capacity, this.sprites.length);
    var rowSize = baseSize.width / this.cellWidth;
    var offset = 0;
    var noSprite = true;
    for (var index = 0; index < max; index++) {
        var sprite = this.sprites[index];
        if (!sprite || !sprite.isVisible) {
            continue;
        }
        noSprite = false;
        sprite._animate(deltaTime);
        this._appendSpriteVertex(offset++, sprite, 0, 0, rowSize);
        this._appendSpriteVertex(offset++, sprite, 1, 0, rowSize);
        this._appendSpriteVertex(offset++, sprite, 1, 1, rowSize);
        this._appendSpriteVertex(offset++, sprite, 0, 1, rowSize);
    }
    if (noSprite) {
        return;
    }
    this._buffer.update(this._vertexData);
    // Render
    var effect = this._effectBase;
    if (this._scene.fogEnabled && this._scene.fogMode !== BABYLON.Scene.FOGMODE_NONE && this.fogEnabled) {
        effect = this._effectFog;
    }
    engine.enableEffect(effect);
    var viewMatrix = this._scene.getViewMatrix();
    effect.setTexture("diffuseSampler", this._spriteTexture);
    effect.setMatrix("view", viewMatrix);
    effect.setMatrix("projection", this._scene.getProjectionMatrix());
    effect.setFloat2("textureInfos", this.cellWidth / baseSize.width, this.cellHeight / baseSize.height);
    // Fog
    if (this._scene.fogEnabled && this._scene.fogMode !== BABYLON.Scene.FOGMODE_NONE && this.fogEnabled) {
        effect.setFloat4("vFogInfos", this._scene.fogMode, this._scene.fogStart, this._scene.fogEnd, this._scene.fogDensity);
        effect.setColor3("vFogColor", this._scene.fogColor);
    }
    // VBOs
    engine.bindBuffers(this._vertexBuffers, this._indexBuffer, effect);
    // Draw order
    engine.setDepthFunctionToLessOrEqual();
    effect.setBool("alphaTest", true);
    engine.setColorWrite(false);
    engine.drawElementsType(BABYLON.Material.TriangleFillMode, 0, (offset / 4) * 6);
    engine.setColorWrite(true);
    effect.setBool("alphaTest", false);
    // edit allow custom alpha mode
    engine.setAlphaMode(this.alphaMode||BABYLON.Engine.ALPHA_COMBINE);
    engine.drawElementsType(BABYLON.Material.TriangleFillMode, 0, (offset / 4) * 6);
    engine.setAlphaMode(BABYLON.Engine.ALPHA_DISABLE);
};