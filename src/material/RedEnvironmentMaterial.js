"use strict";
var RedEnvironmentMaterial;
(function () {
    var vSource, fSource;
    var PROGRAM_NAME = 'RedEnvironmentMaterialProgram';
    var PROGRAM_OPTION_LIST = ['diffuseTexture', 'normalTexture', 'specularTexture', 'displacementTexture', 'emissiveTexture', 'useFlatMode', 'usePreMultiply'];
    var checked;
    vSource = function () {
        /* @preserve
            // 스키닝
            //#REDGL_DEFINE#vertexShareFunc#getSkinMatrix#

            // Sprite3D
            //#REDGL_DEFINE#vertexShareFunc#getSprite3DMatrix#


            //#REDGL_DEFINE#displacementTexture# uniform sampler2D u_displacementTexture;
            //#REDGL_DEFINE#displacementTexture# uniform float u_displacementPower;
            //#REDGL_DEFINE#displacementTexture# uniform float u_displacementFlowSpeedX;
            //#REDGL_DEFINE#displacementTexture# uniform float u_displacementFlowSpeedY;


            void main(void) {
                gl_PointSize = uPointSize;
                vTexcoord = aTexcoord;

                // normal 계산
                //#REDGL_DEFINE#skin#true# vVertexNormal = (uNMatrix * getSkinMatrix() * vec4(aVertexNormal,0.0)).xyz;
               //#REDGL_DEFINE#skin#false# vVertexNormal = (uNMatrix *  vec4(aVertexNormal,1.0)).xyz;

                // position 계산
                //#REDGL_DEFINE#skin#true# mat4 targetMatrix = uMMatrix *  getSkinMatrix() ;
                //#REDGL_DEFINE#skin#false# mat4 targetMatrix = uMMatrix;
                vVertexPosition =  targetMatrix *  vec4(aVertexPosition, 1.0);

                //#REDGL_DEFINE#displacementTexture# vVertexPosition.xyz += normalize(vVertexNormal) * texture2D(u_displacementTexture, vTexcoord + vec2(
                //#REDGL_DEFINE#displacementTexture#    u_displacementFlowSpeedX * (uTime/1000.0),
                //#REDGL_DEFINE#displacementTexture#    u_displacementFlowSpeedY * (uTime/1000.0)
                //#REDGL_DEFINE#displacementTexture# )).x * u_displacementPower ;

                // 최종 포지션 계산
                //#REDGL_DEFINE#sprite3D#true# gl_Position = uPMatrix * getSprite3DMatrix(uCameraMatrix , targetMatrix) *  vec4(aVertexPosition, 1.0);
                //#REDGL_DEFINE#sprite3D#true# if(!u_PerspectiveScale){
                //#REDGL_DEFINE#sprite3D#true#   gl_Position /= gl_Position.w;
                //#REDGL_DEFINE#sprite3D#true#   gl_Position.xy += aVertexPosition.xy * vec2((uPMatrix * targetMatrix)[0][0],(uPMatrix * targetMatrix)[1][1]);
                //#REDGL_DEFINE#sprite3D#true# }
                //#REDGL_DEFINE#sprite3D#false# gl_Position = uPMatrix * uCameraMatrix * vVertexPosition;

                // 쉐도우 계산
                //#REDGL_DEFINE#directionalShadow#true# vResolution = uResolution;
                //#REDGL_DEFINE#directionalShadow#true# vShadowPos = cTexUnitConverter * uDirectionalShadowLightMatrix * vVertexPosition;
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

        // flat노말
        //#REDGL_DEFINE#fragmentShareFunc#getFlatNormal#
        //#REDGL_DEFINE#fragmentShareFunc#cotangent_frame#
        //#REDGL_DEFINE#fragmentShareFunc#perturb_normal#

        // 라이트
        //#REDGL_DEFINE#fragmentShareFunc#getDirectionalLightColor#
        //#REDGL_DEFINE#fragmentShareFunc#getPointLightColor#


         //#REDGL_DEFINE#diffuseTexture# uniform sampler2D u_diffuseTexture;
         //#REDGL_DEFINE#normalTexture# uniform sampler2D u_normalTexture;
         //#REDGL_DEFINE#specularTexture# uniform sampler2D u_specularTexture;
         uniform samplerCube u_environmentTexture;

         //#REDGL_DEFINE#emissiveTexture# uniform sampler2D u_emissiveTexture;
         //#REDGL_DEFINE#normalTexture# uniform float u_normalPower;
         uniform float u_shininess;
         uniform float u_specularPower;
         //#REDGL_DEFINE#emissiveTexture# uniform float u_emissiveFactor;
         uniform float u_reflectionPower;
         uniform float u_alpha;
         uniform bool u_useFlatMode;


         vec4 texelColor= vec4(0.0,0.0,0.0,0.0);
         vec4 emissiveColor;
         vec4 reflectionColor;

         vec4 specularLightColor= vec4(1.0, 1.0, 1.0, 1.0);
         vec3 N;
         float specularTextureValue;
         vec4 finalColor;

         void main(void) {

             texelColor = vec4(0.0,0.0,0.0,0.0);
             //#REDGL_DEFINE#diffuseTexture# texelColor = texture2D(u_diffuseTexture, vTexcoord);
             //#REDGL_DEFINE#diffuseTexture# //#REDGL_DEFINE#usePreMultiply# texelColor.rgb *= texelColor.a;
             //#REDGL_DEFINE#diffuseTexture# if(texelColor.a ==0.0) discard;

             //#REDGL_DEFINE#emissiveTexture# emissiveColor = texture2D(u_emissiveTexture, vTexcoord);
             //#REDGL_DEFINE#emissiveTexture# //#REDGL_DEFINE#usePreMultiply# emissiveColor.rgb *= texelColor.a;

             N = normalize(vVertexNormal);
             vec4 normalColor = vec4(0.0);
             //#REDGL_DEFINE#normalTexture# normalColor = texture2D(u_normalTexture, vTexcoord);
             //#REDGL_DEFINE#useFlatMode# N = getFlatNormal(vVertexPosition.xyz);
             //#REDGL_DEFINE#normalTexture# N = perturb_normal(N, vVertexPosition.xyz, vTexcoord, normalColor.rgb) ;

             vec3 R = reflect( vVertexPosition.xyz - uCameraPosition, N);
             reflectionColor = textureCube(u_environmentTexture, R);
             texelColor = mix(texelColor, reflectionColor ,u_reflectionPower);

             specularLightColor = vec4(1.0, 1.0, 1.0, 1.0);
             specularTextureValue = 1.0;
             //#REDGL_DEFINE#specularTexture#  specularTextureValue = texture2D(u_specularTexture, vTexcoord).r;

             vec4 finalColor = uAmbientLightColor * uAmbientIntensity
             + getDirectionalLightColor(
                texelColor,
                N,
                u_shininess,
                specularLightColor,
                specularTextureValue,
                u_specularPower
             )
             + getPointLightColor(
                texelColor,
                N,
                u_shininess,
                specularLightColor,
                specularTextureValue,
                u_specularPower
             );

             //#REDGL_DEFINE#emissiveTexture# finalColor.rgb += emissiveColor.rgb * u_emissiveFactor;
             finalColor.a = texelColor.a * u_alpha;

             //#REDGL_DEFINE#directionalShadow#true# finalColor.rgb = mix(finalColor.rgb, finalColor.rgb * getShadowColor( vShadowPos, vResolution, uDirectionalShadowTexture), 0.5);

             //#REDGL_DEFINE#fog#false# gl_FragColor = finalColor;
             //#REDGL_DEFINE#fog#true# gl_FragColor = fog( fogFactor(u_FogDistance, u_FogDensity), uFogColor, finalColor);
         }
         */
    };
    /**DOC:
     {
		 constructorYn : true,
		 title :`RedEnvironmentMaterial`,
		 description : `
			 RedEnvironmentMaterial Instance 생성
		 `,
		 params : {
			 redGL : [
				 {type:'RedGL'}
			 ],
			 diffuseTexture : [
				 {type:'RedBitmapTexture'}
			 ],
			 environmentTexture : [
				 {type:'RedBitmapCubeTexture'}
			 ],
			 normalTexture : [
				 {type:'RedBitmapTexture'}
			 ],
			 specularTexture : [
				 {type:'RedBitmapTexture'}
			 ],
			 displacementTexture : [
				 {type:'RedBitmapTexture'}
			 ],
			 emissiveTexture : [
				 {type:'RedBitmapTexture'}
			 ]
		 },
		 extends : ['RedBaseMaterial'],
		 demo : '../example/material/RedEnvironmentMaterial.html',
		 example : `
			 RedEnvironmentMaterial(
				 RedGL Instance,
				 RedBitmapTexture(RedGL Instance, src), // diffuseTexture
				 RedBitmapCubeTexture(RedGL Instance, srcList), // environmentTexture
				 RedBitmapTexture(RedGL Instance, src), // normalTexture
				 RedBitmapTexture(RedGL Instance, src), // specularTexture
				 RedBitmapTexture(RedGL Instance, src),  // displacementTexture
				 RedBitmapTexture(RedGL Instance, src)  // emissiveTexture
			 )
		 `,
		 return : 'RedEnvironmentMaterial Instance'
	 }
     :DOC*/
    RedEnvironmentMaterial = function (redGL,
                                       diffuseTexture,
                                       environmentTexture,
                                       normalTexture,
                                       specularTexture,
                                       displacementTexture,
                                       emissiveTexture
    ) {
        if (!(this instanceof RedEnvironmentMaterial)) return new RedEnvironmentMaterial(
            redGL,
            diffuseTexture,
            environmentTexture,
            normalTexture,
            specularTexture,
            displacementTexture,
            emissiveTexture
        );
        redGL instanceof RedGL || RedGLUtil.throwFunc('RedEnvironmentMaterial : RedGL Instance만 허용.', redGL);
        environmentTexture instanceof RedBitmapCubeTexture || RedGLUtil.throwFunc('RedEnvironmentMaterial : environmentTexture - RedBitmapCubeTexture Instance만 허용.');
        this.makeProgramList(this, redGL, PROGRAM_NAME, vSource, fSource, PROGRAM_OPTION_LIST);
        /////////////////////////////////////////
        // 유니폼 프로퍼티
        this['diffuseTexture'] = diffuseTexture;
        this['environmentTexture'] = environmentTexture;
        this['normalTexture'] = normalTexture;
        this['specularTexture'] = specularTexture;
        this['displacementTexture'] = displacementTexture;
        this['emissiveTexture'] = emissiveTexture;
        this['normalPower'] = 1;
        this['shininess'] = 8;
        this['specularPower'] = 1;
        this['emissiveFactor'] = 1;
        this['reflectionPower'] = 1;
        this['displacementPower'] = 0.1;
        this['displacementFlowSpeedX'] = 0;
        this['displacementFlowSpeedY'] = 0;
        this['alpha'] = 1;
        /////////////////////////////////////////
        this['useFlatMode'] = false;
        this['usePreMultiply'] = false;
        // 일반 프로퍼티
        this['_UUID'] = RedGL.makeUUID();
        if (!checked) {
            this.checkUniformAndProperty();
            checked = true;
        }
        console.log(this);
    };
    RedEnvironmentMaterial.prototype = new RedBaseMaterial();
    var samplerOption = {
        callback: function () {
            this._searchProgram(PROGRAM_NAME, PROGRAM_OPTION_LIST)
        }
    };
    /**DOC:
     {
	     code : 'PROPERTY',
		 title :`alpha`,
		 description : `기본값 : 1`,
		 return : 'Number'
	 }
     :DOC*/
    RedDefinePropertyInfo.definePrototype('RedEnvironmentMaterial', 'alpha', 'number', {min: 0, max: 1});
    /**DOC:
     {
	     code : 'PROPERTY',
		 title :`diffuseTexture`,
		 description :`diffuseTexture`,
		 return : 'RedBitmapTexture'
	 }
     :DOC*/
    RedDefinePropertyInfo.definePrototype('RedEnvironmentMaterial', 'diffuseTexture', 'sampler2D', samplerOption);
    /**DOC:
     {
	     code : 'PROPERTY',
		 title :`environmentTexture`,
		 description :`environmentTexture`,
		 return : 'RedBitmapCubeTexture'
	 }
     :DOC*/
    RedDefinePropertyInfo.definePrototype('RedEnvironmentMaterial', 'environmentTexture', 'samplerCube', {
        essential: true,
        callback: samplerOption.callback
    });
    /**DOC:
     {
	     code : 'PROPERTY',
		 title :`normalTexture`,
		 description :`normalTexture`,
		 return : 'RedBitmapTexture'
	 }
     :DOC*/
    RedDefinePropertyInfo.definePrototype('RedEnvironmentMaterial', 'normalTexture', 'sampler2D', samplerOption);
    /**DOC:
     {
	     code : 'PROPERTY',
		 title :`specularTexture`,
		 description :`specularTexture`,
		 return : 'RedBitmapTexture'
	 }
     :DOC*/
    RedDefinePropertyInfo.definePrototype('RedEnvironmentMaterial', 'specularTexture', 'sampler2D', samplerOption);
    /**DOC:
     {
	     code : 'PROPERTY',
		 title :`displacementTexture`,
		 description :`displacementTexture`,
		 return : 'RedBitmapTexture'
	 }
     :DOC*/
    RedDefinePropertyInfo.definePrototype('RedEnvironmentMaterial', 'displacementTexture', 'sampler2D', samplerOption);
    /**DOC:
     {
	     code : 'PROPERTY',
		 title :`emissiveTexture`,
		 description :`emissiveTexture`,
		 return : 'RedBitmapTexture'
	 }
     :DOC*/
    RedDefinePropertyInfo.definePrototype('RedEnvironmentMaterial', 'emissiveTexture', 'sampler2D', samplerOption);
    /**DOC:
     {
	     code : 'PROPERTY',
		 title :`normalPower`,
		 description : `기본값 : 1`,
		 return : 'number'
	 }
     :DOC*/
    RedDefinePropertyInfo.definePrototype('RedEnvironmentMaterial', 'normalPower', 'number', {'min': 0});
    /**DOC:
     {
	     code : 'PROPERTY',
		 title :`shininess`,
		 description : `기본값 : 16`,
		 return : 'Number'
	 }
     :DOC*/
    RedDefinePropertyInfo.definePrototype('RedEnvironmentMaterial', 'shininess', 'number', {'min': 0});
    /**DOC:
     {
	     code : 'PROPERTY',
		 title :`specularPower`,
		 description : `기본값 : 1`,
		 return : 'Number'
	 }
     :DOC*/
    RedDefinePropertyInfo.definePrototype('RedEnvironmentMaterial', 'specularPower', 'number', {'min': 0});
    /**DOC:
     {
	     code : 'PROPERTY',
		 title :`emissiveFactor`,
		 description : `기본값 : 1`,
		 return : 'number'
	 }
     :DOC*/
    RedDefinePropertyInfo.definePrototype('RedEnvironmentMaterial', 'emissiveFactor', 'number', {'min': 0});
    /**DOC:
     {
	     code : 'PROPERTY',
		 title :`reflectionPower`,
		 description : `기본값 : 1`,
		 return : 'Number'
	 }
     :DOC*/
    RedDefinePropertyInfo.definePrototype('RedEnvironmentMaterial', 'reflectionPower', 'number', {'min': 0});
    /**DOC:
     {
	     code : 'PROPERTY',
		 title :`displacementPower`,
		 description : `기본값 : 0`,
		 return : 'Number'
	 }
     :DOC*/
    RedDefinePropertyInfo.definePrototype('RedEnvironmentMaterial', 'displacementPower', 'number', {'min': 0});
    /**DOC:
     {
	     code : 'PROPERTY',
		 title :`displacementFlowSpeedX`,
		 description : `기본값 : 0`,
		 return : 'Number'
	 }
     :DOC*/
    RedDefinePropertyInfo.definePrototype('RedEnvironmentMaterial', 'displacementFlowSpeedX', 'number');
    /**DOC:
     {
	     code : 'PROPERTY',
		 title :`displacementFlowSpeedY`,
		 description : `기본값 : 0`,
		 return : 'Number'
	 }
     :DOC*/
    RedDefinePropertyInfo.definePrototype('RedEnvironmentMaterial', 'displacementFlowSpeedY', 'number');
    /**DOC:
     {
	     code : 'PROPERTY',
		 title :`useFlatMode`,
		 description : `
		    flatMode 사용여부
		    기본값 : true
		 `,
		 return : 'boolean'
	 }
     :DOC*/
    RedDefinePropertyInfo.definePrototype('RedEnvironmentMaterial', 'useFlatMode', 'boolean', samplerOption);
    /**DOC:
     {
	     code : 'PROPERTY',
		 title :`usePreMultiply`,
		 description : `
		    usePreMultiply 사용여부
		    기본값 : false
		 `,
		 return : 'boolean'
	 }
     :DOC*/
    RedDefinePropertyInfo.definePrototype('RedEnvironmentMaterial', 'usePreMultiply', 'boolean', samplerOption);
    Object.freeze(RedEnvironmentMaterial);
})();