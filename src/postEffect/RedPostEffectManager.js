/*
 * RedGL - MIT License
 * Copyright (c) 2018 - 2019 By RedCamel(webseon@gmail.com)
 * https://github.com/redcamel/RedGL2/blob/dev/LICENSE
 * Last modification time of this file - 2019.5.2 12:37
 */

"use strict";
var RedPostEffectManager;
(function () {
    /**DOC:
     {
		 constructorYn : true,
		 title :`RedPostEffectManager`,
		 description : `
			 RedPostEffectManager Instance 생성.
			 RedScene 생성시 내부속성으로 자동생성됨.
		 `,
		 params : {
			 redGL : [
				 {type:'RedGL'}
			 ]
		 },
		 demo : '../example/RedPostEffect.html',
		 return : 'RedPostEffectManager Instance'
	 }
     :DOC*/
    RedPostEffectManager = function (redGL) {
        if (!(this instanceof RedPostEffectManager)) return new RedPostEffectManager(redGL);
        redGL instanceof RedGL || RedGLUtil.throwFunc('RedPostEffectManager : RedGL Instance만 허용.', redGL);
        /**DOC:
         {
			title :`frameBuffer`,
			code : 'PROPERTY',
			description : `
				이펙트 렌더링시 사용될 프레임버퍼
			`,
			return : 'RedFrameBuffer Instance'
		}
         :DOC*/
        Object.defineProperty(this, 'frameBuffer', {value: RedFrameBuffer(redGL)});
        Object.defineProperty(this, 'finalMaterial', {value: RedPostEffectMaterial(redGL, this['frameBuffer']['texture'])});
        /**DOC:
         {
			title :`postEffectList`,
			code : 'PROPERTY',
			description : `
				이펙트 리스트
			`,
			return : 'Array'
		}
         :DOC*/
        Object.defineProperty(this, 'postEffectList', {value: []});
        Object.defineProperty(this, 'children', {value: [RedMesh(redGL, RedPlane(redGL, 1, 1, 1, 1, true), this['finalMaterial'])]});
        this['_UUID'] = RedGL.makeUUID();
        console.log(this);
    };
    RedPostEffectManager.prototype = {
        /**DOC:
         {
			title :`addEffect`,
			code : 'METHOD',
			description : `
				postEffect 추가
			`,
			params : {
				postEffect : [
					{type:'PostEffect Instance'}
				]
			},
			return : 'void'
		}
         :DOC*/
        addEffect: function (postEffect) {
            postEffect instanceof RedBasePostEffect || RedGLUtil.throwFunc('RedPostEffectManager : addEffect - RedBasePostEffect Instance만 허용.', '입력값 : ' + postEffect);
            this['postEffectList'].push(postEffect);
        },
        /**DOC:
         {
			title :`removeEffect`,
			code : 'METHOD',
			description : `
				postEffect 제거
			`,
			params : {
				postEffect : [
					{type:'PostEffect Instance'}
				]
			},
			return : 'void'
		}
         :DOC*/
        removeEffect: (function () {
            var t0;
            return function (postEffect) {
                t0 = this['postEffectList'].indexOf(postEffect);
                if (t0 != -1) this['postEffectList'].splice(t0, 1);
            }
        })(),
        /**DOC:
         {
			title :`removeAllEffect`,
			code : 'METHOD',
			description : `
				모든 postEffect 제거
			`,
			return : 'void'
		}
         :DOC*/
        removeAllEffect: function () {
            this['postEffectList'].length = 0;
        },
        /**DOC:
         {
			title :`bind`,
			code : 'METHOD',
			description : `
				프레임 버퍼 바인딩.
				렌더러에서 자동호출됨.
			`,
			params : {
				gl : [
					{type:'WebGL Context'}
				]
			},
			return : 'void'
		}
         :DOC*/
        bind: function (gl) {
            this['frameBuffer'].bind(gl);
        },
        /**DOC:
         {
			title :`unbind`,
			code : 'METHOD',
			description : `
				프레임 버퍼 언바인딩.
				렌더러에서 자동호출됨.
			`,
			params : {
				gl : [
					{type:'WebGL Context'}
				]
			},
			return : 'void'
		}
         :DOC*/
        unbind: function (gl) {
            this['frameBuffer'].unbind(gl);
        },
        render: (function () {
            var tQuadMesh;
            var originFrameBufferTexture, lastFrameBufferTexture;
            var setViewportScissorAndBaseUniform;
            var prevWidth, prevHeight;
            var tCamera;
            var drawEffect;
            var setSystemUniform;
            var tCacheSystemUniformInfo;
            setSystemUniform = (function () {
                var tProgram;
                var tLocationInfo;
                var tSystemUniformLocation;
                var tLocation;
                var tUUID;
                var tResolution;
                var tPerspectiveMTX;
                var tValueStr;
                tPerspectiveMTX = mat4.create();
                tResolution = new Float32Array(2);
                return function (gl, camera, effect, width, height) {
                    // 최종메쉬의 재질을 현재 이펙트로 변경
                    tQuadMesh['_material'] = effect;
                    // 프로그램을 변경
                    tProgram = tQuadMesh['_material']['program'];
                    gl.useProgram(tProgram['webglProgram']);
                    // 시스템 유니폼중 업데이트 해야할 목록 처리
                    tSystemUniformLocation = tProgram['systemUniformLocation'];
                    // 퍼스펙티브 매트릭스 처리
                    tLocationInfo = tSystemUniformLocation['uPMatrix'];
                    if (tLocationInfo) {
                        tLocation = tLocationInfo['location'];
                        tUUID = tLocationInfo['_UUID'];
                        if (tLocation) {
                            mat4.ortho(
                                tPerspectiveMTX,
                                -0.5, // left
                                0.5, // right
                                -0.5, // bottom
                                0.5, // top,
                                -camera['farClipping'],
                                camera['farClipping']
                            );
                            mat4.scale(tPerspectiveMTX, tPerspectiveMTX, [1, -1, 1]);
                            tValueStr = JSON.stringify(tPerspectiveMTX);
                            if (tCacheSystemUniformInfo[tUUID] != tValueStr) {
                                gl.uniformMatrix4fv(tLocation, false, tPerspectiveMTX);
                                tCacheSystemUniformInfo[tUUID] = tValueStr;
                            }
                        }
                    }
                    // 레졸루션 정보 처리
                    tLocationInfo = tSystemUniformLocation['uResolution'];
                    if (tLocationInfo) {
                        tLocation = tLocationInfo['location'];
                        tUUID = tLocationInfo['_UUID'];
                        if (tLocation) {
                            tResolution[0] = width;
                            tResolution[1] = height;
                            tValueStr = JSON.stringify(tResolution);
                            if (tCacheSystemUniformInfo[tUUID] != tValueStr) {
                                gl.uniform2fv(tLocation, tResolution);
                                tCacheSystemUniformInfo[tUUID] = tValueStr;
                            }
                        }
                    }
                }
            })();
            setViewportScissorAndBaseUniform = (function () {
                var tWidth, tHeight;
                return function (gl, camera, effect, viewRect) {
                    tWidth = effect['frameBuffer']['width'] = viewRect[2];
                    tHeight = effect['frameBuffer']['height'] = viewRect[3];
                    if (prevWidth != tWidth || prevHeight != tHeight) {
                        gl.viewport(0, 0, tWidth, tHeight);
                        gl.scissor(0, 0, tWidth, tHeight);
                    }
                    // 해당 이펙트의 프레임버퍼 유니폼 정보 업데이트
                    setSystemUniform(gl, camera, effect, tWidth, tHeight);
                    prevWidth = tWidth;
                    prevHeight = tHeight;
                }
            })();
            drawEffect = function (redGL, effect, quadChildren, redView, redRenderer, time, renderInfo) {
                // console.log('Render Effect', v)
                var tParentFrameBufferTexture;
                var tSubFrameBufferList; // 서브에서 씬자체를 그려야할때 사용;
                var tGL;
                var i, len;
                var i2, len2, tSubScene;
                var tScene, tViewRect;
                tGL = redGL.gl;
                tScene = redView['scene'];
                tViewRect = redView['_viewRect'];
                ////////////////////////////////////////////////////////////////////////////
                // 이펙트 최종결과를 생성하기전 전처리 진행
                if (effect['_process'] && effect['_process'].length) {
                    tParentFrameBufferTexture = lastFrameBufferTexture;
                    i = 0;
                    len = effect['_process'].length;
                    for (i; i < len; i++) drawEffect(redGL, effect['_process'][i], quadChildren, redView, redRenderer, time, renderInfo);
                }
                ////////////////////////////////////////////////////////////////////////////
                // 이펙트 서브신버퍼를 사용한다면 그림
                tSubFrameBufferList = effect['_subFrameBufferList'];
                if (tSubFrameBufferList && tSubFrameBufferList.length) {
                    i2 = 0;
                    len2 = tSubFrameBufferList.length;
                    for (i2; i2 < len2; i2++) {
                        tSubScene = tSubFrameBufferList[i2];
                        tSubScene['frameBuffer']['width'] = tViewRect[2];
                        tSubScene['frameBuffer']['height'] = tViewRect[3];
                        tSubScene['frameBuffer'].bind(tGL);
                        tGL.clear(tGL.COLOR_BUFFER_BIT | tGL.DEPTH_BUFFER_BIT);
                        redRenderer.sceneRender(redGL, tScene, tCamera, tCamera['mode2DYn'], tScene['children'], time, renderInfo, tSubScene['renderMaterial'], true, true);
                        tSubScene['frameBuffer'].unbind(tGL);
                        prevWidth = tSubScene['frameBuffer']['width'];
                        prevHeight = tSubScene['frameBuffer']['height'];
                        // 서브 신버퍼에 프로세스 처리
                        if (tSubScene['_process'] && tSubScene['_process'].length) {
                            i = 0;
                            len = tSubScene['_process'].length;
                            for (i; i < len; i++) drawEffect(redGL, tSubScene['_process'][i], quadChildren, tScene, redRenderer, time, renderInfo);
                        }
                    }
                }
                ////////////////////////////////////////////////////////////////////////////
                // 이펙트 처리
                if (effect['frameBuffer']) {
                    setViewportScissorAndBaseUniform(tGL, tCamera, effect, tViewRect);
                    // 해당 이펙트의 프레임 버퍼를 바인딩
                    effect.bind(tGL);
                    // 해당 이펙트의 기본 텍스쳐를 지난 이펙트의 최종 텍스쳐로 업로드
                    effect.updateTexture(
                        lastFrameBufferTexture,
                        tParentFrameBufferTexture
                    );
                    // 해당 이펙트를 렌더링하고
                    redRenderer.sceneRender(redGL, tScene, tCamera, true, quadChildren, time, renderInfo, null, true, true);
                    // 해당 이펙트의 프레임 버퍼를 언바인딩한다.
                    effect.unbind(tGL);
                    // 현재 이펙트를 최종 텍스쳐로 기록하고 다음 이펙트가 있을경우 활용한다.
                    lastFrameBufferTexture = effect['frameBuffer']['texture'];
                    // console.log(effect)
                }
            };
            return (function () {
                var self;
                var tEffectList;
                var i, len;
                var tScene;
                var tViewRect, tWorldRect;
                tEffectList = [];
                return function (redGL, gl, redRenderer, redView, time, renderInfo) {
                    self = this;
                    prevWidth = null;
                    prevHeight = null;
                    tScene = redView['scene'];
                    tCamera = redView['camera'] instanceof RedBaseController ? redView['camera']['camera'] : redView['camera'];
                    tViewRect = redView['_viewRect'];
                    tWorldRect = redRenderer['worldRect'];
                    tCacheSystemUniformInfo = redRenderer['cacheInfo']['cacheSystemUniformInfo'];
                    ////////////////////////////////////////////////////////////////////////////
                    // 포스트 이펙터 언바인딩
                    self.unbind(gl);
                    tQuadMesh = self['children'][0];
                    ////////////////////////////////////////////////////////////////////////////
                    // 프레임 버퍼 정보를 캐싱
                    lastFrameBufferTexture = originFrameBufferTexture = self['frameBuffer']['texture'];
                    ////////////////////////////////////////////////////////////////////////////
                    // 최종결과는 RedView의 사이즈와 동일하게 한다.
                    self['frameBuffer']['width'] = tViewRect[2];
                    self['frameBuffer']['height'] = tViewRect[3];
                    ////////////////////////////////////////////////////////////////////////////
                    // 렌더링할 이펙트 리스트를 정리한다.
                    tEffectList.length = 0;
                    i = 0;
                    len = self['postEffectList'].length;
                    for (i; i < len; i++) tEffectList[i] = self['postEffectList'][i];
                    // 안티알리어싱 모드가 적용되어있으면 추가한다.
                    if (self['antialiasing']) tEffectList.push(self['antialiasing']);
                    //TODO: 감마를 여기서 추가해야할듯
                    ////////////////////////////////////////////////////////////////////////////
                    // 이펙트 렌더
                    i = 0;
                    len = tEffectList.length;
                    for (i; i < len; i++) drawEffect(redGL, tEffectList[i], self['children'], redView, redRenderer, time, renderInfo);
                    ////////////////////////////////////////////////////////////////////////////
                    // 이펙트가 존재한다면 최종 이펙트의 프레임버퍼 결과물을 최종으로 렌더링한다.
                    if (lastFrameBufferTexture != originFrameBufferTexture) {
                        self['finalMaterial']['diffuseTexture'] = lastFrameBufferTexture;
                        gl.viewport(tViewRect[0], tWorldRect[3] - tViewRect[3] - tViewRect[1], tViewRect[2], tViewRect[3]);
                        gl.scissor(tViewRect[0], tWorldRect[3] - tViewRect[3] - tViewRect[1], tViewRect[2], tViewRect[3]);
                        // 최종 재질을 기준으로 필요한 기본 유니폼을 세팅한다.
                        setSystemUniform(gl, tCamera, self['finalMaterial'], tViewRect[2], tViewRect[3], true);
                        redRenderer.sceneRender(redGL, tScene, tCamera, true, self['children'], time, renderInfo, null, true);
                    }
                    self['finalMaterial']['diffuseTexture'] = self['frameBuffer']['texture'];
                }
            })();
        })()
    };
    /**DOC:
     {
		title :`antialiasing`,
		code : 'PROPERTY',
		description : `
			안티알리어싱 설정
			현재는 RedPostEffect_FXAA만 등록가능
		`,
		return : 'Array'
	}
     :DOC*/
    Object.defineProperty(RedPostEffectManager.prototype, 'antialiasing', {
        get: function () {
            return this['_antialiasing']
        },
        set: function (v) {
            if (v) v instanceof RedPostEffect_FXAA || RedGLUtil.throwFunc('RedPostEffectManager : antialiasing - RedPostEffect_FXAA Instance만 허용.', '입력값 : ' + v);
            this['_antialiasing'] = v;
        }
    });
    Object.freeze(RedPostEffectManager);
})();