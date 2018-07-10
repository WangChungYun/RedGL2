"use strict";
var RedRenderer;
//TODO: 캐싱전략을 좀더 고도화하는게 좋을듯
(function () {
	/**DOC:
	 {
		 constructorYn : true,
		 title :`RedRenderer`,
		 description : `
			 RedRenderer Instance 생성자.
		 `,
		 example : `
		 RedRenderer();
		 `,
		 return : 'RedRenderer Instance'
	 }
	 :DOC*/
	RedRenderer = function () {
		if ( !(this instanceof RedRenderer) ) return new RedRenderer();
		this.world = null;
		this['_tickKey'] = null;
		this['_callback'] = null;
		this['_UUID'] = RedGL['makeUUID']();
		this['renderInfo'] = {};
		this['cacheState'] = [];
		this['cacheInfo'] = {
			cacheUniformInfo: [],
			cacheAttrInfo: [],
			cacheSamplerIndex: [],
			cacheTexture: [],
			cacheSystemUniformInfo: []
		};
		this['renderDebuger'] = RedRenderDebuger();
		this['worldRect'] = []
		this['_glInitialized'] = false
		console.log(this);
	};
	RedRenderer.prototype = {
		/**DOC:
		 {
			 code:`METHOD`,
			 title :`start`,
			 description : `
				 렌더 시작
			 `,
			 params : {
				 redGL : [
					 {type : "RedGL"}
				 ],
				 callback : [
					 {type : "Function"},
					 '렌더시마다 실행될 콜백'
				 ]
			 },
			 return : 'void'
		 }
		 :DOC*/
		start: (function () {
			var tick;
			var self, tRedGL;
			tick = function (time) {
				self.worldRender(tRedGL, time);
				self['_callback'] ? self['_callback'](time) : 0
				self['_tickKey'] = requestAnimationFrame(tick);
			}
			return function (redGL, callback) {
				if ( !(redGL instanceof RedGL) ) RedGLUtil.throwFunc('RedGL Instance만 허용');
				if ( !(redGL.world instanceof RedWorld) ) RedGLUtil.throwFunc('RedWorld Instance만 허용');
				self = this;
				self.world = redGL.world;
				tRedGL = redGL;
				self['_tickKey'] = requestAnimationFrame(tick);
				self['_callback'] = callback;
			}
		})(),
		/**DOC:
		 {
			 code:`METHOD`,
			 title :`render`,
			 description : `
				 단일 프레임 렌더
			 `,
			 params : {
				 redGL : [
					 {type : "RedGL"}
				 ],
				 time : [
					 {type : "Number"},
					 'time'
				 ]
			 },
			 return : 'void'
		 }
		 :DOC*/
		render: function (redGL, time) {
			if ( !(redGL instanceof RedGL) ) RedGLUtil.throwFunc('RedGL Instance만 허용');
			this.worldRender(redGL, time);
			this.world = redGL.world;
		},
		/**DOC:
		 {
			 code:`METHOD`,
			 title :`stop`,
			 description : `
				 렌더 중지
			 `,
			 return : 'void'
		 }
		 :DOC*/
		stop: function () { cancelAnimationFrame(this['_tickKey']) }
	};
	// 캐시관련
	var prevProgram_UUID;
	RedRenderer.prototype.worldRender = (function () {
		var tWorldRect;
		var self;
		var valueParser;
		var updateSystemUniform;
		var glInitialize;
		var lightDebugRenderList;
		lightDebugRenderList = []
		// 숫자면 숫자로 %면 월드대비 수치로 변경해줌
		valueParser = (function () {
			var i;
			return function (rect) {
				i = rect.length;
				while ( i-- ) {
					if ( typeof rect[i] == 'number' ) rect[i] = rect[i];
					else {
						if ( i < 2 ) rect[i] = tWorldRect[i + 2] * parseFloat(rect[i]) / 100
						else rect[i] = tWorldRect[i] * parseFloat(rect[i]) / 100
					}
				}
				return rect;
			}
		})();
		updateSystemUniform = (function () {
			var tProgram;
			var tSystemUniformGroup;
			var gl;
			var tLocationInfo, tLocation, tUUID;
			var tValueStr;
			var tDirectionalPositionList, tColorList, tIntensityList;
			var tPointPositionList, tRadiusList;
			var tVector;
			var i, tList;
			var tLightData, tDebugObj;
			var tValue
			var updateSystemUniformInfo
			updateSystemUniformInfo = {
				uTime: 0,
				uResolution: [0, 0],
				uFogDensity: 0,
				uFogColor: [0, 0, 0, 0],
				uFogDistance: 0,
				uCameraMatrix: null,
				uPMatrix: null,
				uAmbientLightColor: [0, 0, 0, 0],
				uAmbientIntensity: 1,
				uDirectionalLightPosition: [],
				uDirectionalLightColor: [],
				uDirectionalLightIntensity: [],
				uDirectionalLightNum: [],
				uPointLightPosition: [],
				uPointLightColor: [],
				uPointLightIntensity: [],
				uPointLightRadius: [],
				uPointLightNum: [],
				uDirectionalShadowTexture: false
			}
			var lightMatrix, tSize, lightProjectionMatrix, tPosition;
			var tLight;
			tPosition = new Float32Array(3)
			lightMatrix = new Float32Array(16)
			lightProjectionMatrix = new Float32Array(16)
			var programNum = 0
			return function (redGL, time, scene, camera, viewRect) {
				gl = redGL.gl;
				lightDebugRenderList.length = 0
				// console.log('programNum', programNum)
				programNum = 0
				lightMatrix[1] = lightMatrix[2] = lightMatrix[3] =
					lightMatrix[4] = lightMatrix[6] = lightMatrix[7] =
						lightMatrix[8] = lightMatrix[9] = lightMatrix[11] =
							lightMatrix[12] = lightMatrix[13] = lightMatrix[14] = 0
				lightMatrix[0] = lightMatrix[5] = lightMatrix[10] = lightMatrix[15] = 1
				if ( scene['shadowManager']['_directionalShadow'] ) {
					tSize = scene['shadowManager']['_directionalShadow']['size'];
					tLight = scene['shadowManager']['_directionalShadow']['_light']
					mat4.ortho(lightProjectionMatrix, -tSize, tSize, -tSize, tSize, -tSize, tSize)
					tPosition[0] = 0
					tPosition[1] = 0
					tPosition[2] = 0
					if ( tLight ) {
						tPosition[0] = -tLight.x
						tPosition[1] = -tLight.y
						tPosition[2] = -tLight.z
						vec3.normalize(tPosition, tPosition)
						mat4.lookAt(
							lightMatrix,
							tPosition,
							[0, 0, 0],
							[0, 1, 0]
						)
						mat4.multiply(lightMatrix, lightProjectionMatrix, lightMatrix)
					}
				}
				for ( var k in redGL['_datas']['RedProgram'] ) {
					programNum++
					tProgram = redGL['_datas']['RedProgram'][k];
					gl.useProgram(tProgram['webglProgram']);
					prevProgram_UUID = tProgram['_UUID'];
					tSystemUniformGroup = tProgram['systemUniformLocation'];
					// 디렉셔널 쉐도우 라이트 매트릭스
					tLocationInfo = tSystemUniformGroup['uDirectionalShadowLightMatrix'];
					tLocation = tLocationInfo['location'];
					tUUID = tLocationInfo['_UUID'];
					if ( tLocation ) {
						if ( scene['shadowManager']['_directionalShadow'] ) {
							if ( tLight ) gl.uniformMatrix4fv(tLocation, false, lightMatrix);
						}
					}
					// 디렉셔널 쉐도우 텍스쳐
					tLocationInfo = tSystemUniformGroup['uDirectionalShadowTexture']
					if ( tLocationInfo ) {
						tLocation = tLocationInfo['location'];
						if ( tLocation ) {
							tUUID = tLocationInfo['_UUID']
							if ( scene['shadowManager']['_directionalShadow'] ) tValue = scene['shadowManager']['directionalShadow']['frameBuffer']['texture']
							else tValue = redGL['_datas']['emptyTexture']['2d']
							var tSamplerIndex = tLocationInfo['samplerIndex']
							gl.activeTexture(gl.TEXTURE0 + tSamplerIndex);
							gl.bindTexture(gl.TEXTURE_2D, tValue['webglTexture']);
							gl[tLocationInfo['renderMethod']](tLocation, tSamplerIndex)
						}
					}
					// 디렉셔널 쉐도우 사용여부
					updateSystemUniformInfo['uUseDirectionalShadow'] = scene['shadowManager']['_directionalShadow'] ? true : false;
					//
					updateSystemUniformInfo['uTime'] = time;
					updateSystemUniformInfo['uResolution'][0] = viewRect[2];
					updateSystemUniformInfo['uResolution'][1] = viewRect[3];
					updateSystemUniformInfo['uFogDensity'] = scene['fogDensity'];
					updateSystemUniformInfo['uFogColor'][0] = scene['_fogR'];
					updateSystemUniformInfo['uFogColor'][1] = scene['_fogG'];
					updateSystemUniformInfo['uFogColor'][2] = scene['_fogB'];
					updateSystemUniformInfo['uFogColor'][3] = 1;
					updateSystemUniformInfo['uFogDistance'] = scene['fogDistance'];
					updateSystemUniformInfo['uCameraMatrix'] = camera['matrix'];
					updateSystemUniformInfo['uPMatrix'] = camera['perspectiveMTX'];
					// 암비안트 라이트 업데이트
					if ( tLightData = scene['_lightInfo'][RedAmbientLight['type']] ) {
						updateSystemUniformInfo['uAmbientLightColor'] = tLightData['_color'];
						updateSystemUniformInfo['uAmbientIntensity'] = tLightData['_intensity'];
					}
					// 디렉셔널 라이트 업데이트
					tVector = vec3.create()
					tDirectionalPositionList = new Float32Array(3 * 3)
					tColorList = new Float32Array(4 * 3)
					tIntensityList = new Float32Array(3)
					tList = scene['_lightInfo'][RedDirectionalLight['type']];
					i = tList.length;
					while ( i-- ) {
						tLightData = tList[i];
						vec3.set(tVector, tLightData['x'], tLightData['y'], tLightData['z'])
						if ( tLightData['debug'] ) {
							tDebugObj = tLightData['debugObject'];
							tDebugObj['x'] = tVector[0];
							tDebugObj['y'] = tVector[1];
							tDebugObj['z'] = tVector[2];
							tDebugObj['_material']['_color'] = tLightData['_color']
							lightDebugRenderList.push(tDebugObj)
						}
						//
						tLocationInfo = tSystemUniformGroup['uDirectionalLightPosition'];
						if ( tLocationInfo ) {
							tLocation = tLocationInfo['location'];
							if ( tLocation ) {
								vec3.normalize(tVector, tVector)
								tDirectionalPositionList[0 + 3 * i] = tVector[0];
								tDirectionalPositionList[1 + 3 * i] = tVector[1];
								tDirectionalPositionList[2 + 3 * i] = tVector[2];
							}
						}
						//
						tLocationInfo = tSystemUniformGroup['uDirectionalLightColor'];
						if ( tLocationInfo ) {
							tLocation = tLocationInfo['location'];
							if ( tLocation ) {
								tColorList[0 + 4 * i] = tLightData['_color'][0];
								tColorList[1 + 4 * i] = tLightData['_color'][1];
								tColorList[2 + 4 * i] = tLightData['_color'][2];
								tColorList[3 + 4 * i] = tLightData['_color'][3];
							}
						}
						if ( tLocationInfo ) {
							tLocationInfo = tSystemUniformGroup['uDirectionalLightIntensity'];
							tLocation = tLocationInfo['location'];
							if ( tLocation ) tIntensityList[i] = tLightData['_intensity']
						}
					}
					updateSystemUniformInfo['uDirectionalLightPosition'] = tDirectionalPositionList;
					updateSystemUniformInfo['uDirectionalLightColor'] = tColorList;
					updateSystemUniformInfo['uDirectionalLightIntensity'] = tIntensityList;
					updateSystemUniformInfo['uDirectionalLightNum'] = tList.length;
					// 포인트 라이트 업데이트
					tVector = vec3.create()
					tPointPositionList = new Float32Array(3 * 5)
					tColorList = new Float32Array(4 * 5)
					tIntensityList = new Float32Array(5)
					tRadiusList = new Float32Array(5)
					tList = scene['_lightInfo'][RedPointLight['type']];
					i = tList.length;
					while ( i-- ) {
						tLightData = tList[i];
						vec3.set(tVector, tLightData['x'], tLightData['y'], tLightData['z'])
						if ( tLightData['debug'] ) {
							tDebugObj = tLightData['debugObject'];
							tDebugObj['x'] = tVector[0];
							tDebugObj['y'] = tVector[1];
							tDebugObj['z'] = tVector[2];
							tDebugObj['scaleX'] = tDebugObj['scaleY'] = tDebugObj['scaleZ'] = tLightData['_radius']
							tDebugObj['_material']['_color'] = tLightData['_color']
							lightDebugRenderList.push(tDebugObj)
						}
						//
						tLocationInfo = tSystemUniformGroup['uPointLightPosition'];
						tLocation = tLocationInfo['location'];
						if ( tLocation ) {
							tPointPositionList[0 + 3 * i] = tVector[0];
							tPointPositionList[1 + 3 * i] = tVector[1];
							tPointPositionList[2 + 3 * i] = tVector[2];
						}
						//
						tLocationInfo = tSystemUniformGroup['uPointLightColor'];
						tLocation = tLocationInfo['location'];
						if ( tLocation ) {
							tColorList[0 + 4 * i] = tLightData['_color'][0];
							tColorList[1 + 4 * i] = tLightData['_color'][1];
							tColorList[2 + 4 * i] = tLightData['_color'][2];
							tColorList[3 + 4 * i] = tLightData['_color'][3];
						}
						//
						tLocationInfo = tSystemUniformGroup['uPointLightIntensity'];
						tLocation = tLocationInfo['location'];
						if ( tLocation ) tIntensityList[i] = tLightData['_intensity']
						//
						tLocationInfo = tSystemUniformGroup['uPointLightRadius'];
						tLocation = tLocationInfo['location'];
						if ( tLocation ) tRadiusList[i] = tLightData['_radius']
					}
					updateSystemUniformInfo['uPointLightPosition'] = tPointPositionList;
					updateSystemUniformInfo['uPointLightColor'] = tColorList;
					updateSystemUniformInfo['uPointLightIntensity'] = tIntensityList;
					updateSystemUniformInfo['uPointLightRadius'] = tRadiusList;
					updateSystemUniformInfo['uPointLightNum'] = tList.length;
					// 업데이트
					for ( var k2 in updateSystemUniformInfo ) {
						tLocationInfo = tSystemUniformGroup[k2];
						if ( tLocationInfo ) {
							tLocation = tLocationInfo['location'];
							tUUID = tLocationInfo['_UUID']
							tValue = updateSystemUniformInfo[k2]
							tValueStr = JSON.stringify(tValue)
							if ( tLocation && this['cacheInfo']['cacheSystemUniformInfo'][tUUID] != tValueStr ) {
								tLocationInfo['renderType'] == 'mat' ? gl[tLocationInfo['renderMethod']](tLocation, false, tValue) : gl[tLocationInfo['renderMethod']](tLocation, tValue);
								this['cacheInfo']['cacheSystemUniformInfo'][tUUID] = tValueStr;
							}
						}
					}
				}
				return lightDebugRenderList
			}
		})();
		glInitialize = function (gl) {
			// 뎁스데스티 설정
			gl.enable(gl.DEPTH_TEST);
			gl.depthFunc(gl.LEQUAL)
			// 컬링 페이스 설정
			gl.frontFace(gl.CCW)
			gl.enable(gl.CULL_FACE);
			gl.cullFace(gl.BACK)
			gl.enable(gl.SCISSOR_TEST);
			// 블렌드모드설정
			gl.enable(gl.BLEND);
			gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
			gl.disable(gl.DITHER)
			// gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
			// // 픽셀 블렌딩 결정
			// gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
			// 픽셀 플립 기본설정
			gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
		};
		return function (redGL, time) {
			var gl;
			var tScene;
			var tRenderInfo
			var tPerspectiveMTX;
			var tCamera
			var i;
			var len;
			var tView;
			var tViewRect;
			gl = redGL.gl;
			self = this;
			// 캔버스 사이즈 적용
			tWorldRect = self['worldRect']
			tWorldRect[0] = 0;
			tWorldRect[1] = 0;
			tWorldRect[2] = gl.drawingBufferWidth;
			tWorldRect[3] = gl.drawingBufferHeight;
			gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
			gl.scissor(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
			gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
			if ( !self['_glInitialized'] ) glInitialize(gl), self['_glInitialized'] = true
			// console.log("worldRender", v['key'], t0)
			self['renderInfo'] = {}
			self['cacheInfo']['cacheAttrInfo'].length = 0
			// 일단 0번과 1번텍스트는 무조건 체운다.
			redGL.gl.activeTexture(redGL.gl.TEXTURE0);
			redGL.gl.bindTexture(redGL.gl.TEXTURE_2D, redGL['_datas']['emptyTexture']['2d']['webglTexture']);
			redGL.gl.activeTexture(redGL.gl.TEXTURE0 + 1);
			redGL.gl.bindTexture(redGL.gl.TEXTURE_CUBE_MAP, redGL['_datas']['emptyTexture']['3d']['webglTexture']);
			i = 0;
			len = self['world']['_viewList'].length
			for ( i; i < len; i++ ) {
				// self['world']['_viewList'].forEach(function (tView) {
				tView = self['world']['_viewList'][i]
				///////////////////////////////////
				// view의 위치/크기결정
				tViewRect = tView['_viewRect']
				tViewRect[0] = tView['_x'];
				tViewRect[1] = tView['_y'];
				tViewRect[2] = tView['_width'];
				tViewRect[3] = tView['_height'];
				tCamera = tView['camera'];
				tScene = tView['scene']
				// 위치/크기의 % 여부를 파싱
				valueParser(tViewRect);
				// 현재뷰에 대한 렌더 디버깅 정보
				if ( !self['renderInfo'][tView['key']] ) self['renderInfo'][tView['key']] = {}
				tRenderInfo = self['renderInfo'][tView['key']]
				tRenderInfo['orthographicYn'] = tCamera['orthographicYn']
				tRenderInfo['x'] = tView['_x']
				tRenderInfo['y'] = tView['_y']
				tRenderInfo['width'] = tView['_width']
				tRenderInfo['height'] = tView['_height']
				tRenderInfo['viewRectX'] = tViewRect[0]
				tRenderInfo['viewRectY'] = tViewRect[1]
				tRenderInfo['viewRectWidth'] = tViewRect[2]
				tRenderInfo['viewRectHeight'] = tViewRect[3]
				tRenderInfo['key'] = tView['key']
				tRenderInfo['call'] = 0
				// viewport 크기설정
				gl.viewport(tViewRect[0], tWorldRect[3] - tViewRect[3] - tViewRect[1], tViewRect[2], tViewRect[3]);
				gl.scissor(tViewRect[0], tWorldRect[3] - tViewRect[3] - tViewRect[1], tViewRect[2], tViewRect[3]);
				// 배경 설정
				if ( tScene['useBackgroundColor'] ) {
					gl.clearColor(tScene['_r'], tScene['_g'], tScene['_b'], 1);
					gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
				} else {
					gl.clearColor(0, 0, 0, 1);
					gl.clear(gl.DEPTH_BUFFER_BIT);
				}
				// 카메라 메트릭스 설정
				if ( !(tCamera instanceof RedCamera) ) {
					// 카메라 형식이 아닌경우 컨트롤러로 판단함
					tCamera['update']()
					tCamera = tCamera['camera']
				}
				if ( tCamera['autoUpdateMatrix'] ) tCamera['update']()
				// 퍼스펙티브 매트릭스 설정
				// view 에 적용할 카메라 퍼스펙티브를 계산
				tPerspectiveMTX = tCamera['perspectiveMTX'];
				mat4.identity(tPerspectiveMTX);
				if ( tCamera['orthographicYn'] ) {
					mat4.ortho(
						tPerspectiveMTX,
						-0.5, // left
						0.5, // right
						-0.5, // bottom
						0.5, // top,
						-tCamera['farClipping'],
						tCamera['farClipping']
					)
					mat4.translate(tPerspectiveMTX, tPerspectiveMTX, [-0.5, 0.5, 0])
					mat4.scale(tPerspectiveMTX, tPerspectiveMTX, [1 / tViewRect[2], -1 / tViewRect[3], 1]);
					mat4.identity(tCamera['matrix'])
					gl.disable(gl.CULL_FACE);
					self['cacheState']['useCullFace'] = false
				} else {
					mat4.perspective(
						tPerspectiveMTX,
						tCamera['fov'] * Math.PI / 180,
						tViewRect[2] / tViewRect[3],
						tCamera['nearClipping'],
						tCamera['farClipping']
					);
					gl.enable(gl.CULL_FACE);
					self['cacheState']['useCullFace'] = true
				}
				// 뎁스마스크 원상복구
				self['cacheState']['useDepthMask'] ? 0 : gl.depthMask(self['cacheState']['useDepthMask'] = true);
				// 디렉셔널 쉐도우 렌더
				if ( tScene['shadowManager']['_directionalShadow'] ) {
					updateSystemUniform.apply(self, [redGL, time, tScene, tCamera, tViewRect])
					gl.enable(gl.BLEND);
					gl.blendFunc(gl.ONE, gl.ONE);
					self['cacheState']['useBlendMode'] = true
					self['cacheState']['blendSrc'] = gl.ONE
					self['cacheState']['blendDst'] = gl.ONE
					tScene['shadowManager']['render'](redGL, self, tView, time, tRenderInfo)
					gl.enable(gl.BLEND);
					gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
					self['cacheState']['useBlendMode'] = true
					self['cacheState']['blendSrc'] = gl.SRC_ALPHA
					self['cacheState']['blendDst'] = gl.ONE_MINUS_SRC_ALPHA
				}
				// 포스트이펙트 확인
				if ( tView['postEffectManager']['postEffectList'].length ) {
					tView['postEffectManager'].bind(gl);
					// mat4.perspective(
					// 	tPerspectiveMTX,
					// 	tCamera['fov'] * Math.PI / 180,
					// 	tView['postEffectManager']['frameBuffer']['width'] / tView['postEffectManager']['frameBuffer']['height'],
					// 	tCamera['nearClipping'],
					// 	tCamera['farClipping']
					// );
					gl.viewport(0, 0, tView['postEffectManager']['frameBuffer']['width'], tView['postEffectManager']['frameBuffer']['height']);
					gl.scissor(0, 0, tView['postEffectManager']['frameBuffer']['width'], tView['postEffectManager']['frameBuffer']['height']);
				}
				///////////////////////////////
				// 실제렌더 계산
				updateSystemUniform.apply(self, [redGL, time, tScene, tCamera, tViewRect])
				if ( tScene['skyBox'] ) {
					tScene['skyBox']['scaleX'] = tScene['skyBox']['scaleY'] = tScene['skyBox']['scaleZ'] = tCamera['farClipping']
					self.sceneRender(redGL, tScene, tCamera, tCamera['orthographicYn'], [tScene['skyBox']], time, tRenderInfo);
					gl.clear(gl.DEPTH_BUFFER_BIT);
				}
				// 그리드가 있으면 그림
				if ( tScene['grid'] ) self.sceneRender(redGL, tScene, tCamera, tCamera['orthographicYn'], [tScene['grid']], time, tRenderInfo);
				// 씬렌더 호출
				self.sceneRender(redGL, tScene, tCamera, tCamera['orthographicYn'], tScene['children'], time, tRenderInfo);
				// asix가 있으면 그림
				if ( tScene['axis'] ) self.sceneRender(redGL, tScene, tCamera, tCamera['orthographicYn'], tScene['axis']['children'], time, tRenderInfo);
				// 디버깅 라이트 업데이트
				if ( lightDebugRenderList.length ) self.sceneRender(redGL, tScene, tCamera, tCamera['orthographicYn'], lightDebugRenderList, time, tRenderInfo);
				// 포스트이펙트 최종렌더
				if ( tView['postEffectManager']['postEffectList'].length ) tView['postEffectManager'].render(redGL, gl, self, tView, time, tRenderInfo)
				// })
			}
			if ( this['renderDebuger']['visible'] ) this['renderDebuger'].update(redGL, self['renderInfo'])
		}
	})();
	RedRenderer.prototype.sceneRender = (function () {
		var draw;
		var tPrevIndexBuffer_UUID;
		var tPrevInterleaveBuffer_UUID;
		var tPrevSamplerIndex;
		draw = function (redGL,
		                 scene,
		                 children,
		                 camera,
		                 orthographicYn,
		                 time,
		                 renderResultObj,
		                 tCacheInfo,
		                 tCacheState,
		                 parentMTX,
		                 subSceneMaterial) {
			var i, i2;
			// 캐쉬관련
			var tGL = redGL.gl
			var tCacheInterleaveBuffer = tCacheInfo['cacheAttrInfo'];
			var tCacheUniformInfo = tCacheInfo['cacheUniformInfo'];
			var tCacheSamplerIndex = tCacheInfo['cacheSamplerIndex'];
			var tCacheTexture = tCacheInfo['cacheTexture'];
			// 오쏘고날 스케일 비율
			var orthographicYnScale = orthographicYn ? -1 : 1;
			//
			var BYTES_PER_ELEMENT, CONVERT_RADIAN;
			//
			var tMesh, tGeometry, tMaterial;
			var tLODInfo;
			var tAttrGroup, tAttributeLocationInfo, tInterleaveDefineInfo, tInterleaveDefineUnit;
			var tUniformGroup, tSystemUniformGroup, tUniformLocationInfo, tWebGLUniformLocation, tWebGLAttributeLocation;
			var tInterleaveBuffer, tIndexBufferInfo;
			var tUniformValue
			var tRenderType, tRenderTypeIndex;
			var tMVMatrix, tNMatrix
			var tUUID;
			var tSamplerIndex;
			var tSprite3DYn, tLODData, tDirectionalShadowMaterialYn;
			var tProgram;
			// matix 관련
			var a,
				aSx, aSy, aSz, aCx, aCy, aCz, tRx, tRy, tRz,
				a00, a01, a02, a03, a10, a11, a12, a13, a20, a21, a22, a23, a30, a31, a32, a33,
				b0, b1, b2, b3,
				b00, b01, b02, b10, b11, b12, b20, b21, b22,
				aX, aY, aZ,
				inverse_c, inverse_d, inverse_e, inverse_g, inverse_f, inverse_h, inverse_i, inverse_j, inverse_k, inverse_l, inverse_n, inverse_o, inverse_A, inverse_m, inverse_p, inverse_r, inverse_s, inverse_B, inverse_t, inverse_u, inverse_v, inverse_w, inverse_x, inverse_y, inverse_z, inverse_C, inverse_D, inverse_E, inverse_q;
			// sin,cos 관련
			var tRadian, CPI, CPI2, C225, C127, C045, C157;
			// LOD 관련
			var lodX, lodY, lodZ, lodDistance;
			//////////////// 변수값 할당 ////////////////
			BYTES_PER_ELEMENT = Float32Array.BYTES_PER_ELEMENT;
			CONVERT_RADIAN = Math.PI / 180;
			CPI = 3.141592653589793, CPI2 = 6.283185307179586, C225 = 0.225, C127 = 1.27323954, C045 = 0.405284735, C157 = 1.5707963267948966;
			//////////////// 렌더시작 ////////////////
			i = children.length
			while ( i-- ) {
				renderResultObj['call']++;
				tMesh = children[i];
				tMVMatrix = tMesh['matrix'];
				tNMatrix = tMesh['normalMatrix'];
				tGeometry = tMesh['_geometry'];
				tSprite3DYn = tMesh['sprite3DYn'];
				// LOD체크
				if ( tMesh['useLOD'] ) {
					lodX = camera.x - tMesh.x;
					lodY = camera.y - tMesh.y;
					lodZ = camera.z - tMesh.z
					lodDistance = Math.abs(Math.sqrt(lodX * lodX + lodY * lodY + lodZ * lodZ));
					tLODInfo = tMesh['_lodLevels']
					for ( var k in tLODInfo ) {
						tLODData = tLODInfo[k]
						if ( tLODData['distance'] < lodDistance ) {
							tMesh['_geometry'] = tLODData['geometry'];
							tMesh['_material'] = tLODData['material'];
						}
					}
				}
				if ( tGeometry ) {
					tMaterial = subSceneMaterial ? subSceneMaterial : tMesh['_material'];
					tDirectionalShadowMaterialYn = tMaterial['__RedDirectionalShadowYn'];
					// SpriteSheet체크
					if ( tMaterial['__RedSheetMaterialYn'] ) {
						if ( !tMaterial['_nextFrameTime'] ) tMaterial['_nextFrameTime'] = tMaterial['_perFrameTime'] + time
						if ( tMaterial['_playYn'] && tMaterial['_nextFrameTime'] < time ) {
							var gapFrame = parseInt((time - tMaterial['_nextFrameTime']) / tMaterial['_perFrameTime']);
							gapFrame = gapFrame || 1
							tMaterial['_nextFrameTime'] = tMaterial['_perFrameTime'] + time;
							tMaterial['currentIndex'] += gapFrame;
							if ( tMaterial['currentIndex'] >= tMaterial['totalFrame'] ) {
								if ( tMaterial['_loop'] ) tMaterial['_playYn'] = true, tMaterial['currentIndex'] = 0;
								else tMaterial['_playYn'] = false, tMaterial['currentIndex'] = tMaterial['totalFrame'] - 1
							}
						}
						tMaterial['_sheetRect'][0] = 1 / tMaterial['_segmentW'];
						tMaterial['_sheetRect'][1] = 1 / tMaterial['_segmentH'];
						tMaterial['_sheetRect'][2] = (tMaterial['currentIndex'] % tMaterial['_segmentW']) / tMaterial['_segmentW'];
						tMaterial['_sheetRect'][3] = Math.floor(tMaterial['currentIndex'] / tMaterial['_segmentH']) / tMaterial['_segmentH'];
					}
					// 재질 캐싱
					// fog Program 판단
					tProgram = tMaterial['program']
					if ( scene['useFog'] ) tProgram = tMaterial['_programList']['fog'][tMaterial['program']['key']]
					if ( tSprite3DYn ) tProgram = tMaterial['_programList']['sprite3D'][tMaterial['program']['key']]
					// if ( scene['useFog'] && tSprite3DYn ) tProgram = tMaterial['program']['subProgram_fog_sprite3D']
					//
					prevProgram_UUID == tProgram['_UUID'] ? 0 : tGL.useProgram(tProgram['webglProgram'])
					prevProgram_UUID = tProgram['_UUID']
					// 업데이트할 어트리뷰트와 유니폼 정보를 가져옴
					tAttrGroup = tProgram['attributeLocation'];
					tUniformGroup = tProgram['uniformLocation'];
					tSystemUniformGroup = tProgram['systemUniformLocation'];
					// 버퍼를 찾는다.
					tInterleaveBuffer = tGeometry['interleaveBuffer']; // 인터리브 버퍼
					tIndexBufferInfo = tGeometry['indexBuffer']; // 엘리먼트 버퍼
					/////////////////////////////////////////////////////////////////////////
					/////////////////////////////////////////////////////////////////////////
					// 버퍼의 UUID
					tUUID = tInterleaveBuffer['_UUID'];
					// 실제 버퍼 바인딩하고
					// 프로그램의 어트리뷰트를 순환한다.
					i2 = tAttrGroup.length;
					// interleaveDefineInfoList 정보를 가져온다.
					tInterleaveDefineInfo = tInterleaveBuffer['interleaveDefineInfoList'];
					tPrevInterleaveBuffer_UUID == tUUID ? 0 : tGL.bindBuffer(tGL.ARRAY_BUFFER, tInterleaveBuffer['webglBuffer']);
					tPrevInterleaveBuffer_UUID = tUUID;
					while ( i2-- ) {
						// 대상 어트리뷰트의 로케이션 정보를 구함
						tAttributeLocationInfo = tAttrGroup[i2];
						// 대상 어트리뷰트의 이름으로 interleaveDefineInfoList에서 단위 인터리브 정보를 가져온다.
						tInterleaveDefineUnit = tInterleaveDefineInfo[tAttributeLocationInfo['name']];
						/*
						 어트리뷰트 정보매칭이 안되는 녀석은 무시한다
						 이경우는 버퍼상에는 존재하지만 프로그램에서 사용하지 않는경우이다.
						*/
						// webgl location도 알아낸다.
						tWebGLAttributeLocation = tAttributeLocationInfo['location']
						if ( tInterleaveDefineUnit && tCacheInterleaveBuffer[tWebGLAttributeLocation] != tInterleaveDefineUnit['_UUID'] ) {
							// 해당로케이션을 활성화된적이없으면 활성화 시킨다
							tAttributeLocationInfo['enabled'] ? 0 : tGL.enableVertexAttribArray(tWebGLAttributeLocation);
							tAttributeLocationInfo['enabled'] = 1;
							tGL.vertexAttribPointer(
								tWebGLAttributeLocation,
								tInterleaveDefineUnit['size'],
								tInterleaveBuffer['glArrayType'],
								tInterleaveDefineUnit['normalize'],
								tInterleaveBuffer['stride'] * BYTES_PER_ELEMENT, //stride
								tInterleaveDefineUnit['offset'] * BYTES_PER_ELEMENT //offset
							);
							// 상태 캐싱
							tCacheInterleaveBuffer[tWebGLAttributeLocation] = tInterleaveDefineUnit['_UUID']
						}
					}
					/////////////////////////////////////////////////////////////////////////
					/////////////////////////////////////////////////////////////////////////
					// 유니폼 업데이트
					i2 = tUniformGroup.length;
					while ( i2-- ) {
						tUniformLocationInfo = tUniformGroup[i2];
						tWebGLUniformLocation = tUniformLocationInfo['location'];
						tUUID = tUniformLocationInfo['_UUID'];
						tRenderTypeIndex = tUniformLocationInfo['renderTypeIndex'];
						tRenderType = tUniformLocationInfo['renderType'];
						tUniformValue = tMaterial[tUniformLocationInfo['materialPropertyName']];
						// console.log(tCacheInfo)
						if ( tRenderType == 'sampler2D' || tRenderType == 'samplerCube' ) {
							tSamplerIndex = tUniformLocationInfo['samplerIndex'];
							// samplerIndex : 0,1 번은 생성용으로 쓴다.
							if ( tUniformValue ) {
								if ( tCacheTexture[tSamplerIndex] != tUniformValue['_UUID'] ) {
									tPrevSamplerIndex == tSamplerIndex ? 0 : tGL.activeTexture(tGL.TEXTURE0 + (tPrevSamplerIndex = tSamplerIndex));
									if ( tUniformValue['_videoDom'] ) {
										//TODO: 일단 비디오를 우겨넣었으니 정리를 해야함
										tGL.bindTexture(tGL.TEXTURE_2D, tUniformValue['webglTexture']);
										if ( tUniformValue['_videoDom']['loaded'] ) tGL.texImage2D(tGL.TEXTURE_2D, 0, tGL.RGBA, tGL.RGBA, tGL.UNSIGNED_BYTE, tUniformValue['_videoDom'])
									} else tGL.bindTexture(tRenderType == 'sampler2D' ? tGL.TEXTURE_2D : tGL.TEXTURE_CUBE_MAP, tUniformValue['webglTexture']);
									tCacheSamplerIndex[tUUID] == tSamplerIndex ? 0 : tGL.uniform1i(tWebGLUniformLocation, tCacheSamplerIndex[tUUID] = tSamplerIndex);
									tCacheTexture[tSamplerIndex] = tUniformValue['_UUID'];
								}
								// 아틀라스 UV검색
								if ( tSystemUniformGroup['uAtlascoord']['location'] ) {
									tUUID = tSystemUniformGroup['uAtlascoord']['_UUID']
									if ( tCacheUniformInfo[tUUID] != tUniformValue['atlascoord']['data']['_UUID'] ) {
										tGL.uniform4fv(tSystemUniformGroup['uAtlascoord']['location'], tUniformValue['atlascoord']['data'])
										tCacheUniformInfo[tUUID] = tUniformValue['atlascoord']['data']['_UUID']
									}
								}
							}
							else {
								// TODO: 이제는 이놈들을 날릴수있을듯한데...
								// console.log('설마',tUniformLocationInfo['materialPropertyName'])
								if ( tRenderType == 'sampler2D' ) {
									if ( tCacheTexture[tSamplerIndex] != 0 ) {
										// tPrevSamplerIndex == 0 ? 0 : tGL.activeTexture(tGL.TEXTURE0);
										// tGL.bindTexture(tGL.TEXTURE_2D, redGL['_datas']['emptyTexture']['2d']['webglTexture']);
										tCacheSamplerIndex[tUUID] == 0 ? 0 : tGL.uniform1i(tWebGLUniformLocation, tCacheSamplerIndex[tUUID] = 0);
										tCacheTexture[tSamplerIndex] = 0;
										tPrevSamplerIndex = 0;
									}
								} else {
									if ( tCacheTexture[tSamplerIndex] != 1 ) {
										// tPrevSamplerIndex == 1 ? 0 : tGL.activeTexture(tGL.TEXTURE0 + 1);
										// tGL.bindTexture(tGL.TEXTURE_CUBE_MAP, redGL['_datas']['emptyTexture']['3d']['webglTexture']);
										tCacheSamplerIndex[tUUID] == 1 ? 0 : tGL.uniform1i(tWebGLUniformLocation, tCacheSamplerIndex[tUUID] = 1);
										tCacheTexture[tSamplerIndex] = 1;
										tPrevSamplerIndex = 1;
									}
								}
							}
						} else {
							tUniformValue == undefined ? RedGLUtil.throwFunc('RedRenderer : Material에 ', tUniformLocationInfo['materialPropertyName'], '이 정의 되지않았습니다.') : 0;
							//TODO: 비교계산을 줄일수는 없을까...
							tRenderTypeIndex < 13 ? tCacheUniformInfo[tUUID] == tUniformValue ? 0 : tGL[tUniformLocationInfo['renderMethod']](tWebGLUniformLocation, (tCacheUniformInfo[tUUID] = tRenderTypeIndex == 12 ? null : tUniformValue, tUniformValue)) :
								tRenderTypeIndex == 13 ? tGL[tUniformLocationInfo['renderMethod']](tWebGLUniformLocation, false, tUniformValue) :
									RedGLUtil.throwFunc('RedRenderer : 처리할수없는 타입입니다.', 'tRenderType -', tRenderType)
							// tRenderType == 'float' || tRenderType == 'int' || tRenderType == 'bool' ? tCacheUniformInfo[tUUID] == tUniformValue ? 0 : tGL[tUniformLocationInfo['renderMethod']](tWebGLUniformLocation, (tCacheUniformInfo[tUUID] = tUniformValue.length ? null : tUniformValue, tUniformValue)) :
							// 	// tRenderType == 'int' ? noChangeUniform ? 0 : tGL[tUniformLocationInfo['renderMethod']](tWebGLUniformLocation, (tCacheUniformInfo[tUUID] = tUniformValue.length ? null : tUniformValue, tUniformValue)) :
							// 	// 	tRenderType == 'bool' ? noChangeUniform ? 0 : tGL[tUniformLocationInfo['renderMethod']](tWebGLUniformLocation, (tCacheUniformInfo[tUUID] = tUniformValue.length ? null : tUniformValue, tUniformValue)) :
							// 	tRenderType == 'vec' ? tGL[tUniformLocationInfo['renderMethod']](tWebGLUniformLocation, tUniformValue) :
							// 		tRenderType == 'mat' ? tGL[tUniformLocationInfo['renderMethod']](tWebGLUniformLocation, false, tUniformValue) :
							// 			RedGLUtil.throwFunc('RedRenderer : 처리할수없는 타입입니다.', 'tRenderType -', tRenderType)
						}
					}
				}
				/////////////////////////////////////////////////////////////////////////
				/////////////////////////////////////////////////////////////////////////
				// tMVMatrix
				// tMVMatrix 초기화
				if ( tMesh['autoUpdateMatrix'] ) {
					tMVMatrix[0] = 1, tMVMatrix[1] = 0, tMVMatrix[2] = 0, tMVMatrix[3] = 0,
						tMVMatrix[4] = 0, tMVMatrix[5] = 1, tMVMatrix[6] = 0, tMVMatrix[7] = 0,
						tMVMatrix[8] = 0, tMVMatrix[9] = 0, tMVMatrix[10] = 1, tMVMatrix[11] = 0,
						tMVMatrix[12] = 0, tMVMatrix[13] = 0, tMVMatrix[14] = 0, tMVMatrix[15] = 1,
						a = tMVMatrix,
						// tMVMatrix translate
						aX = tMesh['x'], aY = tMesh['y'], aZ = tMesh['z'],
						a[12] = a[0] * aX + a[4] * aY + a[8] * aZ + a[12],
						a[13] = a[1] * aX + a[5] * aY + a[9] * aZ + a[13],
						a[14] = a[2] * aX + a[6] * aY + a[10] * aZ + a[14],
						a[15] = a[3] * aX + a[7] * aY + a[11] * aZ + a[15],
						// tMVMatrix rotate
						tSprite3DYn ?
							(tRx = tRy = tRz = 0 ) :
							(tRx = tMesh['rotationX'] * CONVERT_RADIAN, tRy = tMesh['rotationY'] * CONVERT_RADIAN, tRz = tMesh['rotationZ'] * CONVERT_RADIAN),
						/////////////////////////
						tRadian = tRx % CPI2,
						tRadian < -CPI ? tRadian = tRadian + CPI2 : tRadian > CPI ? tRadian = tRadian - CPI2 : 0,
						tRadian = tRadian < 0 ? C127 * tRadian + C045 * tRadian * tRadian : C127 * tRadian - C045 * tRadian * tRadian,
						aSx = tRadian < 0 ? C225 * (tRadian * -tRadian - tRadian) + tRadian : C225 * (tRadian * tRadian - tRadian) + tRadian,
						tRadian = (tRx + C157) % CPI2,
						tRadian < -CPI ? tRadian = tRadian + CPI2 : tRadian > CPI ? tRadian = tRadian - CPI2 : 0,
						tRadian = tRadian < 0 ? C127 * tRadian + C045 * tRadian * tRadian : C127 * tRadian - C045 * tRadian * tRadian,
						aCx = tRadian < 0 ? C225 * (tRadian * -tRadian - tRadian) + tRadian : C225 * (tRadian * tRadian - tRadian) + tRadian,
						tRadian = tRy % CPI2,
						tRadian < -CPI ? tRadian = tRadian + CPI2 : tRadian > CPI ? tRadian = tRadian - CPI2 : 0,
						tRadian = tRadian < 0 ? C127 * tRadian + C045 * tRadian * tRadian : C127 * tRadian - C045 * tRadian * tRadian,
						aSy = tRadian < 0 ? C225 * (tRadian * -tRadian - tRadian) + tRadian : C225 * (tRadian * tRadian - tRadian) + tRadian,
						tRadian = (tRy + C157) % CPI2,
						tRadian < -CPI ? tRadian = tRadian + CPI2 : tRadian > CPI ? tRadian = tRadian - CPI2 : 0,
						tRadian = tRadian < 0 ? C127 * tRadian + C045 * tRadian * tRadian : C127 * tRadian - C045 * tRadian * tRadian,
						aCy = tRadian < 0 ? C225 * (tRadian * -tRadian - tRadian) + tRadian : C225 * (tRadian * tRadian - tRadian) + tRadian,
						tRadian = tRz % CPI2,
						tRadian < -CPI ? tRadian = tRadian + CPI2 : tRadian > CPI ? tRadian = tRadian - CPI2 : 0,
						tRadian = tRadian < 0 ? C127 * tRadian + C045 * tRadian * tRadian : C127 * tRadian - C045 * tRadian * tRadian,
						aSz = tRadian < 0 ? C225 * (tRadian * -tRadian - tRadian) + tRadian : C225 * (tRadian * tRadian - tRadian) + tRadian,
						tRadian = (tRz + C157) % CPI2,
						tRadian < -CPI ? tRadian = tRadian + CPI2 : tRadian > CPI ? tRadian = tRadian - CPI2 : 0,
						tRadian = tRadian < 0 ? C127 * tRadian + C045 * tRadian * tRadian : C127 * tRadian - C045 * tRadian * tRadian,
						aCz = tRadian < 0 ? C225 * (tRadian * -tRadian - tRadian) + tRadian : C225 * (tRadian * tRadian - tRadian) + tRadian,
						/////////////////////////
						a00 = a[0], a01 = a[1], a02 = a[2],
						a10 = a[4], a11 = a[5], a12 = a[6],
						a20 = a[8], a21 = a[9], a22 = a[10],
						b00 = aCy * aCz, b01 = aSx * aSy * aCz - aCx * aSz, b02 = aCx * aSy * aCz + aSx * aSz,
						b10 = aCy * aSz, b11 = aSx * aSy * aSz + aCx * aCz, b12 = aCx * aSy * aSz - aSx * aCz,
						b20 = -aSy, b21 = aSx * aCy, b22 = aCx * aCy,
						a[0] = a00 * b00 + a10 * b01 + a20 * b02, a[1] = a01 * b00 + a11 * b01 + a21 * b02, a[2] = a02 * b00 + a12 * b01 + a22 * b02,
						a[4] = a00 * b10 + a10 * b11 + a20 * b12, a[5] = a01 * b10 + a11 * b11 + a21 * b12, a[6] = a02 * b10 + a12 * b11 + a22 * b12,
						a[8] = a00 * b20 + a10 * b21 + a20 * b22, a[9] = a01 * b20 + a11 * b21 + a21 * b22, a[10] = a02 * b20 + a12 * b21 + a22 * b22,
						// tMVMatrix scale
						aX = tMesh['scaleX'], aY = tMesh['scaleY'] * orthographicYnScale, aZ = tMesh['scaleZ'],
						a[0] = a[0] * aX, a[1] = a[1] * aX, a[2] = a[2] * aX, a[3] = a[3] * aX,
						a[4] = a[4] * aY, a[5] = a[5] * aY, a[6] = a[6] * aY, a[7] = a[7] * aY,
						a[8] = a[8] * aZ, a[9] = a[9] * aZ, a[10] = a[10] * aZ, a[11] = a[11] * aZ,
						a[12] = a[12], a[13] = a[13], a[14] = a[14], a[15] = a[15],
						// 부모가있으면 곱함
						parentMTX ? (
								// 부모매트릭스 복사
								// 매트립스 곱
								a00 = parentMTX[0], a01 = parentMTX[1], a02 = parentMTX[2], a03 = parentMTX[3],
									a10 = parentMTX[4], a11 = parentMTX[5], a12 = parentMTX[6], a13 = parentMTX[7],
									a20 = parentMTX[8], a21 = parentMTX[9], a22 = parentMTX[10], a23 = parentMTX[11],
									a30 = parentMTX[12], a31 = parentMTX[13], a32 = parentMTX[14], a33 = parentMTX[15],
									// Cache only the current line of the second matrix
									b0 = tMVMatrix[0], b1 = tMVMatrix[1], b2 = tMVMatrix[2], b3 = tMVMatrix[3],
									tMVMatrix[0] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30,
									tMVMatrix[1] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31,
									tMVMatrix[2] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32,
									tMVMatrix[3] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33,
									b0 = tMVMatrix[4], b1 = tMVMatrix[5], b2 = tMVMatrix[6], b3 = tMVMatrix[7],
									tMVMatrix[4] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30,
									tMVMatrix[5] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31,
									tMVMatrix[6] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32,
									tMVMatrix[7] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33,
									b0 = tMVMatrix[8], b1 = tMVMatrix[9], b2 = tMVMatrix[10], b3 = tMVMatrix[11],
									tMVMatrix[8] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30,
									tMVMatrix[9] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31,
									tMVMatrix[10] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32,
									tMVMatrix[11] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33,
									b0 = tMVMatrix[12], b1 = tMVMatrix[13], b2 = tMVMatrix[14], b3 = tMVMatrix[15],
									tMVMatrix[12] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30,
									tMVMatrix[13] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31,
									tMVMatrix[14] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32,
									tMVMatrix[15] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33
							) : 0;

				}
				/////////////////////////////////////////////////////////////////////////
				/////////////////////////////////////////////////////////////////////////
				if ( tGeometry ) tGL.uniformMatrix4fv(tSystemUniformGroup['uMMatrix']['location'], false, tMVMatrix)
				/////////////////////////////////////////////////////////////////////////
				/////////////////////////////////////////////////////////////////////////
				// 노말매트릭스를 사용할경우
				if ( tGeometry && tSystemUniformGroup && tSystemUniformGroup['uNMatrix']['location'] ) {
					//클론
					// mat4Inverse
					inverse_c = tMVMatrix[0], inverse_d = tMVMatrix[1], inverse_e = tMVMatrix[2], inverse_g = tMVMatrix[3],
						inverse_f = tMVMatrix[4], inverse_h = tMVMatrix[5], inverse_i = tMVMatrix[6], inverse_j = tMVMatrix[7],
						inverse_k = tMVMatrix[8], inverse_l = tMVMatrix[9], inverse_n = tMVMatrix[10], inverse_o = tMVMatrix[11],
						inverse_m = tMVMatrix[12], inverse_p = tMVMatrix[13], inverse_r = tMVMatrix[14], inverse_s = tMVMatrix[15],
						inverse_A = inverse_c * inverse_h - inverse_d * inverse_f,
						inverse_B = inverse_c * inverse_i - inverse_e * inverse_f,
						inverse_t = inverse_c * inverse_j - inverse_g * inverse_f,
						inverse_u = inverse_d * inverse_i - inverse_e * inverse_h,
						inverse_v = inverse_d * inverse_j - inverse_g * inverse_h,
						inverse_w = inverse_e * inverse_j - inverse_g * inverse_i,
						inverse_x = inverse_k * inverse_p - inverse_l * inverse_m,
						inverse_y = inverse_k * inverse_r - inverse_n * inverse_m,
						inverse_z = inverse_k * inverse_s - inverse_o * inverse_m,
						inverse_C = inverse_l * inverse_r - inverse_n * inverse_p,
						inverse_D = inverse_l * inverse_s - inverse_o * inverse_p,
						inverse_E = inverse_n * inverse_s - inverse_o * inverse_r,
						inverse_q = inverse_A * inverse_E - inverse_B * inverse_D + inverse_t * inverse_C + inverse_u * inverse_z - inverse_v * inverse_y + inverse_w * inverse_x,
						inverse_q = 1 / inverse_q,
						tNMatrix[0] = (inverse_h * inverse_E - inverse_i * inverse_D + inverse_j * inverse_C) * inverse_q,
						tNMatrix[1] = (-inverse_d * inverse_E + inverse_e * inverse_D - inverse_g * inverse_C) * inverse_q,
						tNMatrix[2] = (inverse_p * inverse_w - inverse_r * inverse_v + inverse_s * inverse_u) * inverse_q,
						tNMatrix[3] = (-inverse_l * inverse_w + inverse_n * inverse_v - inverse_o * inverse_u) * inverse_q,
						tNMatrix[4] = (-inverse_f * inverse_E + inverse_i * inverse_z - inverse_j * inverse_y) * inverse_q,
						tNMatrix[5] = (inverse_c * inverse_E - inverse_e * inverse_z + inverse_g * inverse_y) * inverse_q,
						tNMatrix[6] = (-inverse_m * inverse_w + inverse_r * inverse_t - inverse_s * inverse_B) * inverse_q,
						tNMatrix[7] = (inverse_k * inverse_w - inverse_n * inverse_t + inverse_o * inverse_B) * inverse_q,
						tNMatrix[8] = (inverse_f * inverse_D - inverse_h * inverse_z + inverse_j * inverse_x) * inverse_q,
						tNMatrix[9] = (-inverse_c * inverse_D + inverse_d * inverse_z - inverse_g * inverse_x) * inverse_q,
						tNMatrix[10] = (inverse_m * inverse_v - inverse_p * inverse_t + inverse_s * inverse_A) * inverse_q,
						tNMatrix[11] = (-inverse_k * inverse_v + inverse_l * inverse_t - inverse_o * inverse_A) * inverse_q,
						tNMatrix[12] = (-inverse_f * inverse_C + inverse_h * inverse_y - inverse_i * inverse_x) * inverse_q,
						tNMatrix[13] = (inverse_c * inverse_C - inverse_d * inverse_y + inverse_e * inverse_x) * inverse_q,
						tNMatrix[14] = (-inverse_m * inverse_u + inverse_p * inverse_B - inverse_r * inverse_A) * inverse_q,
						tNMatrix[15] = (inverse_k * inverse_u - inverse_l * inverse_B + inverse_n * inverse_A) * inverse_q,
						// transpose
						a01 = tNMatrix[1], a02 = tNMatrix[2], a03 = tNMatrix[3],
						a12 = tNMatrix[6], a13 = tNMatrix[7], a23 = tNMatrix[11],
						tNMatrix[1] = tNMatrix[4], tNMatrix[2] = tNMatrix[8], tNMatrix[3] = tNMatrix[12], tNMatrix[4] = a01, tNMatrix[6] = tNMatrix[9],
						tNMatrix[7] = tNMatrix[13], tNMatrix[8] = a02, tNMatrix[9] = a12, tNMatrix[11] = tNMatrix[14],
						tNMatrix[12] = a03, tNMatrix[13] = a13, tNMatrix[14] = a23,
						// uNMatrix 입력
						tGL.uniformMatrix4fv(tSystemUniformGroup['uNMatrix']['location'], false, tNMatrix)
				}
				if ( tGeometry ) {
					/////////////////////////////////////////////////////////////////////////
					/////////////////////////////////////////////////////////////////////////
					// 상태처리
					// 컬페이스 사용여부 캐싱처리
					tCacheState['useCullFace'] != tMesh['useCullFace'] ? (tCacheState['useCullFace'] = tMesh['useCullFace']) ? tGL.enable(tGL.CULL_FACE) : tGL.disable(tGL.CULL_FACE) : 0;
					// 컬페이스 캐싱처리
					tCacheState['useCullFace'] ? tCacheState['cullFace'] != tMesh['cullFace'] ? tGL.cullFace(tCacheState['cullFace'] = tMesh['cullFace']) : 0 : 0;
					// 뎁스마스크처리
					tCacheState['useDepthMask'] != tMesh['useDepthMask'] ? tGL.depthMask(tCacheState['useDepthMask'] = tMesh['useDepthMask']) : 0;
					// 뎁스테스트 사용여부 캐싱처리
					tCacheState['useDepthTest'] != tMesh['useDepthTest'] ? (tCacheState['useDepthTest'] = tMesh['useDepthTest']) ? tGL.enable(tGL.DEPTH_TEST) : tGL.disable(tGL.DEPTH_TEST) : 0;
					// 뎁스테스팅 캐싱처리
					tCacheState['useDepthTest'] ? tCacheState['depthTestFunc'] != tMesh['depthTestFunc'] ? tGL.depthFunc(tCacheState['depthTestFunc'] = tMesh['depthTestFunc']) : 0 : 0;
					if ( tSystemUniformGroup['uPointSize']['use'] ) {
						tCacheState['pointSize'] != tMesh['pointSize'] ? tGL.uniform1f(tSystemUniformGroup['uPointSize']['location'], tCacheState['pointSize'] = tMesh['pointSize']) : 0;
					}
					if ( tSprite3DYn ) {
						tUUID = tSystemUniformGroup['uSprite3DYn']['_UUID']
						tUniformValue = tSprite3DYn
						if ( tCacheUniformInfo[tUUID] != tUniformValue ) {
							tGL[tSystemUniformGroup['uSprite3DYn']['renderMethod']](tSystemUniformGroup['uSprite3DYn']['location'], tUniformValue)
							tCacheUniformInfo[tUUID] = tUniformValue
						}
						tUUID = tSystemUniformGroup['uPerspectiveScale']['_UUID']
						tUniformValue = tMesh['perspectiveScale']
						if ( tCacheUniformInfo[tUUID] != tUniformValue ) {
							tGL[tSystemUniformGroup['uPerspectiveScale']['renderMethod']](tSystemUniformGroup['uPerspectiveScale']['location'], tUniformValue)
							tCacheUniformInfo[tUUID] = tUniformValue
						}
					}
					// // 블렌딩 사용여부 캐싱처리
					if ( !tDirectionalShadowMaterialYn ) {
						tCacheState['useBlendMode'] != tMesh['useBlendMode'] ? (tCacheState['useBlendMode'] = tMesh['useBlendMode']) ? tGL.enable(tGL.BLEND) : tGL.disable(tGL.BLEND) : 0;
						// 블렌딩팩터 캐싱처리
						if ( tCacheState['blendSrc'] != tMesh['blendSrc'] || tCacheState['blendDst'] != tMesh['blendDst'] ) {
							tGL.blendFunc(tMesh['blendSrc'], tMesh['blendDst']);
							tCacheState['blendSrc'] = tMesh['blendSrc'];
							tCacheState['blendDst'] = tMesh['blendDst'];
						}
					}
					/////////////////////////////////////////////////////////////////////////
					/////////////////////////////////////////////////////////////////////////
					// 드로우
					if ( tIndexBufferInfo ) {
						tPrevIndexBuffer_UUID == tIndexBufferInfo['_UUID'] ? 0 : tGL.bindBuffer(tGL.ELEMENT_ARRAY_BUFFER, tIndexBufferInfo['webglBuffer'])
						//enum mode, long count, enum type, long offset
						tGL.drawElements(
							tMesh['drawMode'],
							tIndexBufferInfo['pointNum'],
							tIndexBufferInfo['glArrayType'],
							0
						);
						tPrevIndexBuffer_UUID = tIndexBufferInfo['_UUID'];
					} else tGL.drawArrays(tMesh['drawMode'], 0, tInterleaveBuffer['pointNum'])
				}
				/////////////////////////////////////////////////////////////////////////
				/////////////////////////////////////////////////////////////////////////
				tMesh['children'].length ? draw(redGL, scene, tMesh['children'], camera, orthographicYn, time, renderResultObj, tCacheInfo, tCacheState, tMVMatrix, subSceneMaterial) : 0;
			}
		}
		return function (redGL, scene, camera, orthographicYn, children, time, renderResultObj, subSceneMaterial) {
			// if ( this['cacheState']['pointSize'] == undefined ) this['cacheState']['pointSize'] = null
			// if ( !this['cacheState']['useCullFace'] ) this['cacheState']['useCullFace'] = null
			// if ( !this['cacheState']['cullFace'] ) this['cacheState']['cullFace'] = null
			// if ( !this['cacheState']['useDepthTest'] ) this['cacheState']['useDepthTest'] = null
			// if ( !this['cacheState']['useDepthMask'] ) this['cacheState']['useDepthMask'] = null
			// if ( !this['cacheState']['depthTestFunc'] ) this['cacheState']['depthTestFunc'] = null
			// if ( !this['cacheState']['useBlendMode'] ) this['cacheState']['useBlendMode'] = null
			// if ( !this['cacheState']['blendSrc'] ) this['cacheState']['blendSrc'] = null
			// if ( !this['cacheState']['blendDst'] ) this['cacheState']['blendDst'] = null
			// this['cacheSamplerIndex'].length = 0
			this['cacheInfo']['cacheTexture'].length = 0
			// this['cacheInfo']['cacheTexture'][39] = null
			// console.log(this['cacheInfo']['cacheSamplerIndex'])
			tPrevIndexBuffer_UUID = null;
			tPrevInterleaveBuffer_UUID = null;
			tPrevSamplerIndex = null;
			// TODO: 소팅을 도입할수도있겠는데?
			// if ( !scene['sorted'] ) {
			// 	scene['sorted'] = true
			// 	children.sort(function (a, b) {
			// 		if ( a['_geometry']['interleaveBuffer'] < b['_geometry']['interleaveBuffer'] ) return -1
			// 		if ( a['_geometry']['interleaveBuffer'] > b['_geometry']['interleaveBuffer'] ) return 1
			// 		if ( a['_material']['program']['_UUID'] < b['_material']['program']['_UUID'] ) return -1
			// 		if ( a['_material']['program']['_UUID'] > b['_material']['program']['_UUID'] ) return 1
			// 		return 0
			// 	})
			// }
			draw(
				redGL,
				scene,
				children,
				camera,
				orthographicYn,
				time,
				renderResultObj,
				this['cacheInfo'],
				this['cacheState'],
				undefined,
				subSceneMaterial
			)
		}
	})()
	Object.freeze(RedRenderer);
})
();
