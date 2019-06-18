/*
 * RedGL - MIT License
 * Copyright (c) 2018 - 2019 By RedCamel(webseon@gmail.com)
 * https://github.com/redcamel/RedGL2/blob/dev/LICENSE
 * Last modification time of this file - 2019.6.13 11:7
 */

"use strict";
var RedPostEffect_Gray;
(function () {
	var vSource, fSource;
	var PROGRAM_NAME = 'RedPostEffectGrayProgram';
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
			 vec4 finalColor = texture2D(u_diffuseTexture, vTexcoord);
			 highp float gray = (finalColor.r  + finalColor.g + finalColor.b)/3.0;
			 gl_FragColor = vec4( gray, gray, gray, 1.0);
		 }
		 */
	};
	/*DOC:
	 {
		 constructorYn : true,
		 title :`RedPostEffect_Gray`,
		 description : `
			 Gray 이펙트
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
		 demo : '../example/postEffect/adjustments/RedPostEffect_Gray.html',
		 example : `
			var effect;
			effect = RedPostEffect_Gray(RedGL Instance); // 포스트이펙트 생성
			// postEffectManager는 RedView 생성시 자동생성됨.
			(RedView Instance)['postEffectManager'].addEffect(effect); // 뷰에 이펙트 추가
		 `,
		 return : 'RedPostEffect_Gray Instance'
	 }
	 :DOC*/
	RedPostEffect_Gray = function (redGL) {
		if (!(this instanceof RedPostEffect_Gray)) return new RedPostEffect_Gray(redGL);
		redGL instanceof RedGL || RedGLUtil.throwFunc('RedPostEffect_Gray : RedGL Instance만 허용.', redGL);
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
	RedPostEffect_Gray.prototype = new RedBasePostEffect();
	RedPostEffect_Gray.prototype['updateTexture'] = function (lastFrameBufferTexture) {
		this['diffuseTexture'] = lastFrameBufferTexture;
	};
	RedDefinePropertyInfo.definePrototype('RedPostEffect_Gray', 'diffuseTexture', 'sampler2D');
	Object.freeze(RedPostEffect_Gray);
})();