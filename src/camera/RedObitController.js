/*
 * MIT License
 * Copyright (c) 2018 - 2019 By RedCamel(webseon@gmail.com)
 * https://github.com/redcamel/RedGL2/blob/dev/LICENSE
 */

"use strict";
var RedObitController;
(function () {
    /**DOC:
     {
		 constructorYn : true,
		 title :`RedObitController`,
		 description : `
			 RedObitController Instance 생성자.
		 `,
		 demo : '../example/camera/RedObitController.html',
		 example : `
			 RedObitController(RedGL Instance)
		 `,
		 params : {
			 redGL : [
				 {type:'RedGL'}
			 ]
		 },
		 extends : ['RedBaseController'],
		 return : 'RedObitController Instance'
	 }
     :DOC*/
    RedObitController = function (redGL) {
        var self;
        if (!(this instanceof RedObitController)) return new RedObitController(redGL);
        self = this;
        this['centerX'] = 0;
        this['centerY'] = 0;
        this['centerZ'] = 0;
        //
        this['distance'] = 15;
        this['speedDistance'] = 2;
        this['delayDistance'] = 0.1;
        //
        this['speedRotation'] = 3;
        this['delayRotation'] = 0.1;
        this['tilt'] = 0;
        this['minTilt'] = -90;
        this['maxTilt'] = 90;
        this['pan'] = 0;
        /**DOC:
         {
		     code : 'PROPERTY',
			 title :`camera`,
			 description : `
				 컨트롤러 생성시 자동생성됨
			 `,
			 return : 'RedCamera'
		 }
         :DOC*/
        this['camera'] = RedCamera();
        this['_currentPan'] = 0;
        this['_currentTilt'] = 0;
        this['_currentDistance'] = 0;
        this['needUpdate'] = true;
        this['targetView'] = null;
        (function (self) {
            var HD_down, HD_Move, HD_up, HD_wheel;
            var sX, sY;
            var mX, mY;
            var tMove, tUp, tDown;
            var checkArea;
            checkArea = function (e) {
                if (self['targetView']) {
                    var tX, tY;
                    if (RedGLDetect.BROWSER_INFO.isMobile) {
                        console.log(e);
                        tX = e['clientX'], tY = e['clientY'];
                    } else {
                        tX = e[tXkey], tY = e[tYkey];
                    }
                    if (!(self['targetView']['_viewRect'][0] < tX && tX < self['targetView']['_viewRect'][0] + self['targetView']['_viewRect'][2])) return;
                    if (!(self['targetView']['_viewRect'][1] < tY && tY < self['targetView']['_viewRect'][1] + self['targetView']['_viewRect'][3])) return;
                }
                return true
            };
            tMove = RedGLDetect.BROWSER_INFO.move;
            tUp = RedGLDetect.BROWSER_INFO.up;
            tDown = RedGLDetect.BROWSER_INFO.down;
            sX = 0, sY = 0;
            mX = 0, mY = 0;
            var tXkey, tYkey;
            if (RedGLDetect.BROWSER_INFO.browser == 'ie' && RedGLDetect.BROWSER_INFO.browserVer == 11) {
                tXkey = 'offsetX';
                tYkey = 'offsetY';
            } else {
                tXkey = 'layerX';
                tYkey = 'layerY';
            }
            HD_down = function (e) {
                if (self['needUpdate']) {
                    if (RedGLDetect.BROWSER_INFO.isMobile) {
                        console.log(e);
                        e = e.targetTouches[0]
                    }
                    if (!checkArea(e)) return;
                    if (RedGLDetect.BROWSER_INFO.isMobile) {
                        console.log(e);
                        sX = e['clientX'], sY = e['clientY'];
                    } else {
                        sX = e[tXkey], sY = e[tYkey];
                    }
                    redGL['_canvas'].addEventListener(tMove, HD_Move);
                    window.addEventListener(tUp, HD_up);
                }

            };
            HD_Move = function (e) {
                if (self['needUpdate']) {
                    if (RedGLDetect.BROWSER_INFO.isMobile) {
                        e = e.targetTouches[0];
                        mX = e['clientX'] - sX, mY = e['clientY'] - sY;
                        sX = e['clientX'], sY = e['clientY'];
                    } else {
                        mX = e[tXkey] - sX, mY = e[tYkey] - sY;
                        sX = e[tXkey], sY = e[tYkey];
                    }
                    self['_pan'] -= mX * self['_speedRotation'] * 0.1;
                    self['_tilt'] -= mY * self['_speedRotation'] * 0.1;
                }
            };
            HD_up = function () {
                redGL['_canvas'].removeEventListener(tMove, HD_Move);
                window.removeEventListener(tUp, HD_up);
            };
            HD_wheel = function (e) {
                if (self['needUpdate']) {
                    console.log(e);
                    if (!checkArea(e)) return;
                    self['distance'] += e['deltaY'] / 100 * self['_speedDistance']
                }
            };
            redGL['_canvas'].addEventListener(tDown, HD_down);
            redGL['_canvas'].addEventListener('wheel', HD_wheel);
        })(this);
    };
    RedObitController.prototype = new RedBaseController();

    /**DOC:
     {
	     code : 'PROPERTY',
		 title :`centerX`,
		 description : `회전축 X 포지션`,
		 return : 'Number'
	 }
     :DOC*/
    RedDefinePropertyInfo.definePrototype('RedObitController', 'centerX', 'number');
    /**DOC:
     {
	     code : 'PROPERTY',
		 title :`centerY`,
		 description : `회전축 Y 포지션`,
		 return : 'Number'
	 }
     :DOC*/
    RedDefinePropertyInfo.definePrototype('RedObitController', 'centerY', 'number');
    /**DOC:
     {
	     code : 'PROPERTY',
		 title :`centerZ`,
		 description : `회전축 Z 포지션`,
		 return : 'Number'
	 }
     :DOC*/
    RedDefinePropertyInfo.definePrototype('RedObitController', 'centerZ', 'number');
    /**DOC:
     {
	     code : 'PROPERTY',
		 title :`distance`,
		 description : `회전축과의 거리`,
		 return : 'Number'
	 }
     :DOC*/
    RedDefinePropertyInfo.definePrototype('RedObitController', 'distance', 'number', {min: 1});
    /**DOC:
     {
	     code : 'PROPERTY',
		 title :`speedDistance`,
		 description : `
			 거리 속도
			 기본값 : 2
		 `,
		 return : 'Number'
	 }
     :DOC*/
    RedDefinePropertyInfo.definePrototype('RedObitController', 'speedDistance', 'number', {min: 0});
    /**DOC:
     {
	     code : 'PROPERTY',
		 title :`delayDistance`,
		 description : `
			 거리 지연 속도
			 기본값 : 0.1
		 `,
		 return : 'Number'
	 }
     :DOC*/
    RedDefinePropertyInfo.definePrototype('RedObitController', 'delayDistance', 'number', {min: 0});
    /**DOC:
     {
	     code : 'PROPERTY',
		 title :`speedRotation`,
		 description : `
			 회전 속도
			 기본값 : 3
		 `,
		 return : 'Number'
	 }
     :DOC*/
    RedDefinePropertyInfo.definePrototype('RedObitController', 'speedRotation', 'number', {min: 0});
    /**DOC:
     {
	     code : 'PROPERTY',
		 title :`delayRotation`,
		 description : `
			 회전 지연 속도
			 기본값 : 0.1
		 `,
		 return : 'Number'
	 }
     :DOC*/
    RedDefinePropertyInfo.definePrototype('RedObitController', 'delayRotation', 'number', {min: 0});
    /**DOC:
     {
	     code : 'PROPERTY',
		 title :`pan`,
		 description : `pan`,
		 return : 'Number'
	 }
     :DOC*/
    RedDefinePropertyInfo.definePrototype('RedObitController', 'pan', 'number');
    /**DOC:
     {
	     code : 'PROPERTY',
		 title :`tilt`,
		 description : `tilt`,
		 return : 'Number'
	 }
     :DOC*/
    RedDefinePropertyInfo.definePrototype('RedObitController', 'tilt', 'number');
    /**DOC:
     {
	     code : 'PROPERTY',
		 title :`maxTilt`,
		  description : `
			 기본값 : 90
		 `,
		 return : 'Number'
	 }
     :DOC*/
    RedDefinePropertyInfo.definePrototype('RedObitController', 'maxTilt', 'number', {min: -90, max: 90});
    /**DOC:
     {
	     code : 'PROPERTY',
		 title :`minTilt`,
		  description : `
			 기본값 : -90
		 `,
		 return : 'Number'
	 }
     :DOC*/
    RedDefinePropertyInfo.definePrototype('RedObitController', 'minTilt', 'number', {min: -90, max: 90});
    /**DOC:
     {
	     code : 'METHOD',
		 title :`update`,
		 description : '업데이트',
		 return : 'void'
	 }
     :DOC*/
    RedObitController.prototype['update'] = (function () {
        var tDelayRotation;
        var tCamera;
        var tMTX0;
        var PER_PI;
        PER_PI = Math.PI / 180;
        return function () {
            if (!this['needUpdate']) return;
            if (this['_tilt'] < this['_minTilt']) this['_tilt'] = this['_minTilt'];
            if (this['_tilt'] > this['_maxTilt']) this['_tilt'] = this['_maxTilt'];
            tDelayRotation = this['_delayRotation'];
            tCamera = this['camera'];
            tMTX0 = tCamera['matrix'];
            this['_currentPan'] += (this['_pan'] - this['_currentPan']) * tDelayRotation;
            this['_currentTilt'] += (this['_tilt'] - this['_currentTilt']) * tDelayRotation;
            this['_currentDistance'] += (this['_distance'] - this['_currentDistance']) * this['_delayDistance'];
            mat4.identity(tMTX0);
            mat4.translate(tMTX0, tMTX0, [this['_centerX'], this['_centerY'], this['_centerZ']]);
            mat4.rotateY(tMTX0, tMTX0, this['_currentPan'] * PER_PI);
            mat4.rotateX(tMTX0, tMTX0, this['_currentTilt'] * PER_PI);
            mat4.translate(tMTX0, tMTX0, [0, 0, this['_currentDistance']]);
            tCamera['x'] = tMTX0[12];
            tCamera['y'] = tMTX0[13];
            tCamera['z'] = tMTX0[14];
            // 카메라는 대상 오브젝트를 바라봄
            tCamera.lookAt(this['_centerX'], this['_centerY'], this['_centerZ']);
            // console.log(this['_tilt'], this['_pan'])
            // console.log('RedObitController update')
        }
    })();
    Object.freeze(RedObitController);
})();
