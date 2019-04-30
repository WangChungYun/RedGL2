/*
 * RedGL - MIT License
 * Copyright (c) 2018 - 2019 By RedCamel(webseon@gmail.com)
 * https://github.com/redcamel/RedGL2/blob/dev/LICENSE
 * Last modification time of this file - 2019.4.30 18:53
 */

"use strict";
var RedPostEffect_Blur;
(function () {
    var vSource, fSource;
    var PROGRAM_NAME = 'RedPostEffectBlurProgram';
    var checked;
    vSource = function () {
        /* @preserve
         void main(void) {
             vTexcoord = aTexcoord;
             vResolution = uResolution;
             gl_Position = uPMatrix * uMMatrix *  vec4(aVertexPosition, 1.0);
         }
         */
    };
    fSource = function () {
        /* @preserve
         precision mediump float;
         uniform sampler2D u_diffuseTexture;
         void main(void) {
             vec2 px = vec2(1.0/vResolution.x, 1.0/vResolution.y);
             vec4 finalColor = vec4(0.0);
             finalColor += texture2D(u_diffuseTexture, vTexcoord + vec2(-7.0*px.x, -7.0*px.y))*0.0044299121055113265;
             finalColor += texture2D(u_diffuseTexture, vTexcoord + vec2(-6.0*px.x, -6.0*px.y))*0.00895781211794;
             finalColor += texture2D(u_diffuseTexture, vTexcoord + vec2(-5.0*px.x, -5.0*px.y))*0.0215963866053;
             finalColor += texture2D(u_diffuseTexture, vTexcoord + vec2(-4.0*px.x, -4.0*px.y))*0.0443683338718;
             finalColor += texture2D(u_diffuseTexture, vTexcoord + vec2(-3.0*px.x, -3.0*px.y))*0.0776744219933;
             finalColor += texture2D(u_diffuseTexture, vTexcoord + vec2(-2.0*px.x, -2.0*px.y))*0.115876621105;
             finalColor += texture2D(u_diffuseTexture, vTexcoord + vec2(-1.0*px.x, -1.0*px.y))*0.147308056121;
             finalColor += texture2D(u_diffuseTexture, vTexcoord                             )*0.159576912161;
             finalColor += texture2D(u_diffuseTexture, vTexcoord + vec2( 1.0*px.x,  1.0*px.y))*0.147308056121;
             finalColor += texture2D(u_diffuseTexture, vTexcoord + vec2( 2.0*px.x,  2.0*px.y))*0.115876621105;
             finalColor += texture2D(u_diffuseTexture, vTexcoord + vec2( 3.0*px.x,  3.0*px.y))*0.0776744219933;
             finalColor += texture2D(u_diffuseTexture, vTexcoord + vec2( 4.0*px.x,  4.0*px.y))*0.0443683338718;
             finalColor += texture2D(u_diffuseTexture, vTexcoord + vec2( 5.0*px.x,  5.0*px.y))*0.0215963866053;
             finalColor += texture2D(u_diffuseTexture, vTexcoord + vec2( 6.0*px.x,  6.0*px.y))*0.00895781211794;
             finalColor += texture2D(u_diffuseTexture, vTexcoord + vec2( 7.0*px.x,  7.0*px.y))*0.0044299121055113265;
             gl_FragColor = finalColor;
         }
         */
    };
    /**DOC:
     {
		 constructorYn : true,
		 title :`RedPostEffect_Blur`,
		 description : `
			 기본 블러 이펙트
			 postEffectManager.addEffect( effect Instance ) 로 추가.
		 `,
		 params : {
			 redGL : [
				 {type:'RedGL'}
			 ]
		 },
		 extends : [
		    'RedBasePostEffect',
		    'RedBaseMaterial'
		 ],
		 demo : '../example/postEffect/blur/RedPostEffect_Blur.html',
		 example : `
            var effect;
            effect = RedPostEffect_Blur(RedGL Instance); // 포스트이펙트 생성
            // postEffectManager는 RedView 생성시 자동생성됨.
            (RedView Instance)['postEffectManager'].addEffect(effect); // 뷰에 이펙트 추가
		 `,
		 return : 'RedPostEffect_Blur Instance'
	 }
     :DOC*/
    RedPostEffect_Blur = function (redGL) {
        if (!(this instanceof RedPostEffect_Blur)) return new RedPostEffect_Blur(redGL);
        redGL instanceof RedGL || RedGLUtil.throwFunc('RedPostEffect_Blur : RedGL Instance만 허용.', redGL);
        this['frameBuffer'] = RedFrameBuffer(redGL);
        this['diffuseTexture'] = null;
        /////////////////////////////////////////
        // 일반 프로퍼티
        this['program'] = RedProgram['makeProgram'](redGL, PROGRAM_NAME, vSource, fSource);
        this['_UUID'] = RedGL.makeUUID();
        if (!checked) {
            this.checkUniformAndProperty();
            checked = true;
        }
        console.log(this);
    };
    RedPostEffect_Blur.prototype = new RedBasePostEffect();
    RedPostEffect_Blur.prototype['updateTexture'] = function (lastFrameBufferTexture) {
        this['diffuseTexture'] = lastFrameBufferTexture;
    };
    RedDefinePropertyInfo.definePrototype('RedPostEffect_Blur', 'diffuseTexture', 'sampler2D');
    Object.freeze(RedPostEffect_Blur);
})();