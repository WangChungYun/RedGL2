"use strict";
var RedColorMaterial;
(function () {
	var vSource, fSource;
	var PROGRAM_NAME = 'RedColorMaterialProgram';
	var checked;
	vSource = function () {
		/* @preserve
		//#REDGL_DEFINE#vertexShareFunc#getSprite3DMatrix#
		void main(void) {
			gl_PointSize = uPointSize;
			//#REDGL_DEFINE#sprite3D#true# gl_Position = uPMatrix * getSprite3DMatrix(uCameraMatrix , uMMatrix) *  vec4(aVertexPosition, 1.0);
			//#REDGL_DEFINE#sprite3D#true# if(!u_PerspectiveScale){
			//#REDGL_DEFINE#sprite3D#true#   gl_Position /= gl_Position.w;
			//#REDGL_DEFINE#sprite3D#true#   gl_Position.xy += aVertexPosition.xy * vec2(uMMatrix[0][0],uMMatrix[1][1] * uResolution.x/uResolution.y);
			//#REDGL_DEFINE#sprite3D#true# }
			//#REDGL_DEFINE#sprite3D#false# gl_Position = uPMatrix * uCameraMatrix * uMMatrix *  vec4(aVertexPosition, 1.0);

			//#REDGL_DEFINE#directionalShadow#true# vResolution = uResolution;
			//#REDGL_DEFINE#directionalShadow#true# vShadowPos = cTexUnitConverter  *  uDirectionalShadowLightMatrix * uMMatrix * vec4(aVertexPosition, 1.0);
		}
		 */
	};
	fSource = function () {
		/* @preserve
		 precision mediump float;
		// 안개
		//#REDGL_DEFINE#fragmentShareFunc#fogFactor#
		//#REDGL_DEFINE#fragmentShareFunc#fog#

		// 그림자
		//#REDGL_DEFINE#fragmentShareFunc#decodeFloatShadow#
		//#REDGL_DEFINE#fragmentShareFunc#getShadowColor#

		 uniform vec4 u_color;
		 void main(void) {
			vec4 finalColor = u_color * u_color.a;
			//#REDGL_DEFINE#directionalShadow#true# finalColor.rgb *= getShadowColor( vShadowPos, vResolution, uDirectionalShadowTexture);
			//#REDGL_DEFINE#fog#false# gl_FragColor = finalColor;
			//#REDGL_DEFINE#fog#true# gl_FragColor = fog( fogFactor(u_FogDistance, u_FogDensity), uFogColor, finalColor);
		 }
		 */
	};
	/**DOC:
	 {
		 constructorYn : true,
		 title :`RedColorMaterial`,
		 description : `
			 RedColorMaterial Instance 생성
		 `,
		 params : {
			 redGL : [
				 {type:'RedGL'}
			 ],
			 hexColor : [
				 {type:'hex'}
			 ],
			 alpha : [
				 {type:'number'},
				 '알파값'
			 ]
		 },
		 extends : [
		    'RedBaseMaterial'
		 ],
		 demo : '../example/material/RedColorMaterial.html',
		 example : `
			 RedColorMaterial(RedGL Instance, hex)
		 `,
		 return : 'RedColorMaterial Instance'
	 }
	 :DOC*/
	RedColorMaterial = function (redGL, hexColor, alpha) {
		if ( !(this instanceof RedColorMaterial) ) return new RedColorMaterial(redGL, hexColor, alpha);
		redGL instanceof RedGL || RedGLUtil.throwFunc('RedColorMaterial : RedGL Instance만 허용.', '입력값 : ' + redGL);
		this.makeProgramList(this, redGL, PROGRAM_NAME, vSource, fSource);
		/////////////////////////////////////////
		// 유니폼 프로퍼티
		this['_color'] = new Float32Array(4);
		this['alpha'] = alpha == undefined ? 1 : alpha;
		/////////////////////////////////////////
		// 일반 프로퍼티
		this['color'] = hexColor ? hexColor : '#ff0000';
		this['_UUID'] = RedGL.makeUUID();
		if ( !checked ) {
			this.checkUniformAndProperty();
			checked = true;
		}
		console.log(this);
	};
	RedColorMaterial.prototype = new RedBaseMaterial();
	RedColorMaterial['DEFINE_OBJECT_COLOR'] = {
		get: function () { return this['_colorHex'] },
		set: (function () {
			var t0;
			return function (hex) {
				this['_colorHex'] = hex ? hex : '#ff2211';
				t0 = RedGLUtil.hexToRGB_ZeroToOne.call(this, this['_colorHex']);
				this['_color'][0] = t0[0];
				this['_color'][1] = t0[1];
				this['_color'][2] = t0[2];
				this['_color'][3] = this['_alpha'];
			}
		})()
	};
	RedColorMaterial['DEFINE_OBJECT_ALPHA'] = {
		'min': 0, 'max': 1,
		callback: function (v) {
			this['_color'][3] = this['_alpha'] = v
		}
	};
	/**DOC:
	 {
	     code : 'PROPERTY',
		 title :`color`,
		 description : `기본값 : #ff2211`,
		 return : 'hex'
	 }
	 :DOC*/
	Object.defineProperty(RedColorMaterial.prototype, 'color', RedColorMaterial['DEFINE_OBJECT_COLOR']);
	/**DOC:
	 {
	     code : 'PROPERTY',
		 title :`alpha`,
		 description : `기본값 : 1`,
		 return : 'Number'
	 }
	 :DOC*/
	RedDefinePropertyInfo.definePrototype('RedColorMaterial', 'alpha', 'number', RedColorMaterial['DEFINE_OBJECT_ALPHA']);
	Object.freeze(RedColorMaterial);
})();