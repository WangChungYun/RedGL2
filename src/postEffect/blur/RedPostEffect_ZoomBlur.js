/*
 * RedGL - MIT License
 * Copyright (c) 2018 - 2019 By RedCamel(webseon@gmail.com)
 * https://github.com/redcamel/RedGL2/blob/dev/LICENSE
 * Last modification time of this file - 2019.6.20 11:36
 */

"use strict";
var RedPostEffect_ZoomBlur;
(function () {
	var vSource, fSource;
	var PROGRAM_NAME = 'RedPostEffectZoomBlurProgram';
	var checked;
	vSource = RedBasePostEffect['baseVertexShaderSource1']
	fSource = function () {
		/* @preserve
		 precision mediump float;
		 uniform sampler2D u_diffuseTexture;
		 uniform float u_centerX;
		 uniform float u_centerY;
		 uniform float u_amount_value;
		 float random(vec3 scale, float seed) {
			return fract(sin(dot(gl_FragCoord.xyz + seed, scale)) * 43758.5453 + seed);
		 }
		 void main(void) {
			 vec4 finalColor = vec4(0.0);
			 vec2 center = vec2(u_centerX+0.5,-u_centerY+0.5);
			 vec2 toCenter = center - vTexcoord ;
			 float offset = random(vec3(12.9898, 78.233, 151.7182), 0.0);
			 float total = 0.0;

			 for (float t = 0.0; t <= 30.0; t++) {
				 float percent = (t + offset) / 30.0;
				 float weight = 3.0 * (percent - percent * percent);
				 vec4 sample = texture2D(u_diffuseTexture, vTexcoord + toCenter * percent * u_amount_value );
				 sample.rgb *= sample.a;
				 finalColor += sample * weight;
				 total += weight;
			 }
			 gl_FragColor = finalColor / total;
			 gl_FragColor.rgb /= gl_FragColor.a + 0.00001;
		 }
		 */
	};
	/*DOC:
	 {
		 constructorYn : true,
		 title :`RedPostEffect_ZoomBlur`,
		 description : `
			 줌 블러 이펙트
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
		 demo : '../example/postEffect/blur/RedPostEffect_ZoomBlur.html',
		 example : `
            var effect;
            effect = RedPostEffect_ZoomBlur(RedGL Instance); // 포스트이펙트 생성
            // postEffectManager는 RedView 생성시 자동생성됨.
            (RedView Instance)['postEffectManager'].addEffect(effect); // 뷰에 이펙트 추가
		 `,
		 return : 'RedPostEffect_ZoomBlur Instance'
	 }
	 :DOC*/
	RedPostEffect_ZoomBlur = function (redGL) {
		if (!(this instanceof RedPostEffect_ZoomBlur)) return new RedPostEffect_ZoomBlur(redGL);
		redGL instanceof RedGL || RedGLUtil.throwFunc('RedPostEffect_ZoomBlur : RedGL Instance만 허용.', redGL);
		this['frameBuffer'] = RedFrameBuffer(redGL);
		this['diffuseTexture'] = null;
		this['centerX'] = 0.0;
		this['centerY'] = 0.0;
		this['amount'] = 38;
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
	RedPostEffect_ZoomBlur.prototype = new RedBasePostEffect();
	RedPostEffect_ZoomBlur.prototype['updateTexture'] = function (lastFrameBufferTexture) {
		this['diffuseTexture'] = lastFrameBufferTexture;
	};
	RedDefinePropertyInfo.definePrototypes(
		'RedPostEffect_ZoomBlur',
		['diffuseTexture', 'sampler2D'],
		/*DOC:
		 {
		     code : 'PROPERTY',
			 title :`centerX`,
			 description : `
				 정중앙 중심의 가로 위치
				 기본값 : 0.0
			 `,
			 return : 'Number'
		 }
		 :DOC*/
		['centerX', 'number'],
		/*DOC:
		 {
		     code : 'PROPERTY',
			 title :`centerY`,
			 description : `
				 정중앙 중심의 세로 위치
				 기본값 : 0.0
			 `,
			 return : 'Number'
		 }
		 :DOC*/
		['centerY', 'number'],
		/*DOC:
		 {
		     code : 'PROPERTY',
			 title :`amount`,
			 description : `
				 강도
				 기본값 : 38
				 min: 1
				 max: 100
			 `,
			 return : 'Number'
		 }
		 :DOC*/
		['amount', 'number', {
			min: 1, max: 100, callback: function (v) {
				this['_amount_value'] = v / 100
			}
		}]
	);
	Object.freeze(RedPostEffect_ZoomBlur);
})();