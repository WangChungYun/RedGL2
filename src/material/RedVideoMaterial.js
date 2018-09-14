"use strict";
var RedVideoMaterial;
(function () {
	var vSource, fSource;
	var PROGRAM_NAME = 'RedVideoMaterialProgram';
	var checked;
	vSource = function () {
		/* @preserve
		//#REDGL_DEFINE#vertexShareFunc#getSprite3DMatrix#
		void main(void) {
			vTexcoord = aTexcoord;
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

		 uniform sampler2D u_videoTexture;
		 uniform float u_alpha;
		 void main(void) {
			 vec4 finalColor = texture2D(u_videoTexture, vTexcoord);
			 finalColor.rgb *= finalColor.a;
			 if(finalColor.a ==0.0) discard;
			 //#REDGL_DEFINE#directionalShadow#true# finalColor.rgb *= getShadowColor( vShadowPos, vResolution, uDirectionalShadowTexture);
			 finalColor.a = u_alpha;
			 //#REDGL_DEFINE#fog#false# gl_FragColor = finalColor;
			 //#REDGL_DEFINE#fog#true# gl_FragColor = fog( fogFactor(u_FogDistance, u_FogDensity), uFogColor, finalColor);
		 }
		 */
	};
	/**DOC:
	 {
		 constructorYn : true,
		 title :`RedVideoMaterial`,
		 description : `
			 RedVideoMaterial Instance 생성
		 `,
		 params : {
			 redGL : [
				 {type:'RedGL'}
			 ],
			 videoSrc : [
				 {type:'videoSrc'},
				 'String'
			 ]
		 },
		 extends : [
		    'RedBaseMaterial'
		 ],
		 demo : '../example/material/RedVideoMaterial.html',
		 example : `
			 RedVideoMaterial(RedGL Instance, RedBitmapTexture(RedGL Instance, src))
		 `,
		 return : 'RedVideoMaterial Instance'
	 }
	 :DOC*/
	RedVideoMaterial = function (redGL, videoTexture) {
		if ( !(this instanceof RedVideoMaterial) ) return new RedVideoMaterial(redGL, videoTexture);
		redGL instanceof RedGL || RedGLUtil.throwFunc('RedVideoMaterial : RedGL Instance만 허용.', redGL);
		this.makeProgramList(this, redGL, PROGRAM_NAME, vSource, fSource);
		/////////////////////////////////////////
		// 유니폼 프로퍼티
		this['videoTexture'] = videoTexture;
		this['alpha'] = 1;
		/////////////////////////////////////////
		// 일반 프로퍼티
		this['_UUID'] = RedGL.makeUUID();
		if ( !checked ) {
			this.checkUniformAndProperty();
			checked = true;
		}
		console.log(this);
	};
	RedVideoMaterial.prototype = new RedBaseMaterial();
	/**DOC:
	 {
	     code : 'PROPERTY',
		 title :`alpha`,
		 description : `기본값 : 1`,
		 return : 'Number'
	 }
	 :DOC*/
	RedDefinePropertyInfo.definePrototype('RedVideoMaterial', 'alpha', 'number', {min: 0, max: 1});
	/**DOC:
	 {
	     code : 'PROPERTY',
		 title :`videoTexture`,
		 return : 'RedVideoMaterial'
	 }
	 :DOC*/
	RedDefinePropertyInfo.definePrototype('RedVideoMaterial', 'videoTexture', 'samplerVideo', {essential: true});
	Object.freeze(RedVideoMaterial);
})();