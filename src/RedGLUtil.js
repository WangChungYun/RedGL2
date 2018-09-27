"use strict";
var RedGLUtil;
(function () {
    /**DOC:
     {
		 constructorYn : true,
		 title :`RedGLUtil`,
		 description : `
			 이것저것모음
		 `,
		 return : 'void'
	 }
     :DOC*/
    RedGLUtil = {
        /**DOC:
         {
			 code : 'STATIC METHOD',
			 title :`RedGLUtil.throwFunc`,
			 description : `
				 에러생성기
			 `,
			 return : 'void'
		 }
         :DOC*/
        throwFunc: function () {
            throw 'RedGL Error : ' + Array.prototype.slice.call(arguments).join(' ')
        },
        /**DOC:
         {
			 code : 'STATIC METHOD',
			 title :`RedGLUtil.hexToRGB_ZeroToOne`,
			 description : `
				 hex값을 RGB로 변환 (0 ~ 1로 변환함)
			 `,
			 params : {
				 hex : [
					 {type : 'hex'}
				 ]
			 },
			 example : `
				 RedGLUtil.hexToRGB_ZeroToOne('#fff') // [1,1,1]
			 `,
			 return : 'Array'
		 }
         :DOC*/
        hexToRGB_ZeroToOne: function (hex) {
            var t0, t1;
            if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
                t1 = [];
                t0 = hex.substring(1).split('');
                if (t0.length == 3) t0 = [t0[0], t0[0], t0[1], t0[1], t0[2], t0[2]];
                t0 = '0x' + t0.join('');
                t1[0] = ((t0 >> 16) & 255) / 255;
                t1[1] = ((t0 >> 8) & 255) / 255;
                t1[2] = (t0 & 255) / 255;
                return t1
            } else RedGLUtil.throwFunc('RedGLUtil.hexToRGB_ZeroToOne : 잘못된 hex값입니다.', hex)
        },
        /**DOC:
         {
			 code : 'STATIC METHOD',
			 title :`RedGLUtil.rgb2hex`,
			 description : `
				 255, 255, 255 형식의 RGB를 hex로 변환
			 `,
			 params : {
				 red : [ {type : 'Number'} ],
				 green : [ {type : 'Number'} ],
				 blue : [ {type : 'Number'} ]
			 },
			 example : `
				 RedGLUtil.rgb2hex(255,255,255) // #ffffff
			 `,
			 return : 'hex'
		 }
         :DOC*/
        rgb2hex: function (red, green, blue) {
            var rgb = blue | (green << 8) | (red << 16);
            return '#' + (0x1000000 + rgb).toString(16).slice(1)
        },
        regHex: (function () {
            var reg = /^#(?:[0-9a-fA-F]{3}){1,2}$/;
            return function (hex) {
                return reg.test(hex);
            }
        })(),
        /**DOC:
         {
			 code : 'STATIC METHOD',
			 title :`RedGLUtil.getStrFromComment`,
			 description : `
				 문자열중 멀티 라인 코멘트 사이값을 반환함.
				 프로그램 생성기에서 사용
			 `,
			 params : {
				 source : [
					 {type : 'String'}
				 ]
			 },
			 return : 'String'
		 }
         :DOC*/
        getStrFromComment: (function () {
            var t0;
            return function (source) {
                if (typeof source != 'string') RedGLUtil.throwFunc('getStrFromComment : 해석할 값은 문자열만 가능', source)
                t0 = source.replace('@preserve', '').toString().trim().match(/(\/\*)[\s\S]+(\*\/)/g);
                if (t0) return t0[0].replace(/\/\*|\*\//g, '').trim();
                else RedGLUtil.throwFunc('getStrFromComment : 해석할 불가능한 값', source)
            }
        })(),
        /**DOC:
         {
			 code : 'STATIC METHOD',
			 title :`RedGLUtil.isPowerOf2`,
			 description : `
				 2n 값인지 판단
			 `,
			 params : {
				 v : [
					 {type : 'Number'}
				 ]
			 },
			 return : 'Boolean'
		 }
         :DOC*/
        isPowerOf2: function (v) {
            return (v & (v - 1)) == 0;
        },
        /**DOC:
         {
			 code : 'STATIC METHOD',
			 title :`RedGLUtil.nextHighestPowerOfTwo`,
			 description : `
				 입력된 값을 기준으로 다음 2n 값을 구함
			 `,
			 params : {
				 v : [
					 {type : 'Number'}
				 ]
			 },
			 return : 'Number'
		 }
         :DOC*/
        nextHighestPowerOfTwo: (function () {
            var i;
            return function (v) {
                --v;
                for (i = 1; i < 32; i <<= 1) v = v | v >> i;
                return v + 1;
            }
        })(),
        /**DOC:
         {
			 code : 'STATIC METHOD',
			 title :`RedGLUtil.calculateNormals`,
			 description : `
				 버텍스 배열과 인덱스 배열을 기반으로 노말 배열을 계산함.
				 적용은 알아서 해야함 -_-;; 계산만해줌
			 `,
			 params : {
				 vertexArray : [
					 {type : 'Array'}
				 ],
				 indexArray : [
					 {type : 'Array'}
				 ]
			 },
			 return : 'Array'
		 }
         :DOC*/
        calculateNormals: function (vertexArray, indexArray) {
            //TODO: 이함수 정리
            var i, j;
            var x = 0;
            var y = 1;
            var z = 2;
            var result = [];
            for (i = 0; i < vertexArray.length; i = i + 3) {
                //for each vertex, initialize normal x, normal y, normal z
                result[i + x] = 0.0;
                result[i + y] = 0.0;
                result[i + z] = 0.0;
            }
            for (i = 0; i < indexArray.length; i = i + 3) { //we work on triads of vertices to calculate normals so i = i+3 (i = indices index)
                var v1 = [];
                var v2 = [];
                var normal = [];
                var index0, index1, index2, indexJ;
                index0 = 3 * indexArray[i];
                index1 = 3 * indexArray[i + 1];
                index2 = 3 * indexArray[i + 2];
                //p2 - p1
                v1[x] = vertexArray[index2 + x] - vertexArray[index1 + x];
                v1[y] = vertexArray[index2 + y] - vertexArray[index1 + y];
                v1[z] = vertexArray[index2 + z] - vertexArray[index1 + z];
                //p0 - p1
                v2[x] = vertexArray[index0 + x] - vertexArray[index1 + x];
                v2[y] = vertexArray[index0 + y] - vertexArray[index1 + y];
                v2[z] = vertexArray[index0 + z] - vertexArray[index1 + z];
                //cross product by Sarrus Rule
                normal[x] = v1[y] * v2[z] - v1[z] * v2[y];
                normal[y] = v1[z] * v2[x] - v1[x] * v2[z];
                normal[z] = v1[x] * v2[y] - v1[y] * v2[x];
                for (j = 0; j < 3; j++) { //update the normals of that triangle: sum of vectors
                    indexJ = 3 * indexArray[i + j];
                    result[indexJ + x] = result[indexJ + x] + normal[x];
                    result[indexJ + y] = result[indexJ + y] + normal[y];
                    result[indexJ + z] = result[indexJ + z] + normal[z];
                }
            }
            //normalize the result
            for (i = 0; i < vertexArray.length; i = i + 3) { //the increment here is because each vertex occurs with an offset of 3 in the array (due to x, y, z contiguous values)
                var nn = [];
                nn[x] = result[i + x];
                nn[y] = result[i + y];
                nn[z] = result[i + z];
                var len = Math.sqrt((nn[x] * nn[x]) + (nn[y] * nn[y]) + (nn[z] * nn[z]));
                if (len == 0) len = 1.0;
                nn[x] = nn[x] / len;
                nn[y] = nn[y] / len;
                nn[z] = nn[z] / len;
                result[i + x] = nn[x];
                result[i + y] = nn[y];
                result[i + z] = nn[z];
            }
            return result;
        },
        clamp: function (value, min, max) {
            return Math.max(min, Math.min(max, value));
        },
        quaternionToRotationMat4: function (q, m) {
            var x = q[0];
            var y = q[1];
            var z = q[2];
            var w = q[3];
            var x2 = x + x, y2 = y + y, z2 = z + z;
            var xx = x * x2, xy = x * y2, xz = x * z2;
            var yy = y * y2, yz = y * z2, zz = z * z2;
            var wx = w * x2, wy = w * y2, wz = w * z2;
            m[0] = 1 - (yy + zz);
            m[4] = xy - wz;
            m[8] = xz + wy;
            m[1] = xy + wz;
            m[5] = 1 - (xx + zz);
            m[9] = yz - wx;
            m[2] = xz - wy;
            m[6] = yz + wx;
            m[10] = 1 - (xx + yy);
            // last column
            m[3] = 0;
            m[7] = 0;
            m[11] = 0;
            // bottom row
            m[12] = 0;
            m[13] = 0;
            m[14] = 0;
            m[15] = 1;
            return m;
        },
        mat4ToEuler: function (mat, dest, order) {
            dest = dest || [0, 0, 0];
            order = order || 'XYZ'
            // Assumes the upper 3x3 of m is a pure rotation matrix (i.e, unscaled)
            var m11 = mat[0], m12 = mat[4], m13 = mat[8];
            var m21 = mat[1], m22 = mat[5], m23 = mat[9];
            var m31 = mat[2], m32 = mat[6], m33 = mat[10];
            if (order === 'XYZ') {
                dest[1] = Math.asin(RedGLUtil.clamp(m13, -1, 1));
                if (Math.abs(m13) < 0.99999) {
                    dest[0] = Math.atan2(-m23, m33);
                    dest[2] = Math.atan2(-m12, m11);
                } else {
                    dest[0] = Math.atan2(m32, m22);
                    dest[2] = 0;
                }
            } else if (order === 'YXZ') {
                dest[0] = Math.asin(-RedGLUtil.clamp(m23, -1, 1));
                if (Math.abs(m23) < 0.99999) {
                    dest[1] = Math.atan2(m13, m33);
                    dest[2] = Math.atan2(m21, m22);
                } else {
                    dest[1] = Math.atan2(-m31, m11);
                    dest[2] = 0;
                }
            } else if (order === 'ZXY') {
                dest[0] = Math.asin(RedGLUtil.clamp(m32, -1, 1));
                if (Math.abs(m32) < 0.99999) {
                    dest[1] = Math.atan2(-m31, m33);
                    dest[2] = Math.atan2(-m12, m22);
                } else {
                    dest[1] = 0;
                    dest[2] = Math.atan2(m21, m11);
                }
            } else if (order === 'ZYX') {
                dest[1] = Math.asin(-RedGLUtil.clamp(m31, -1, 1));
                if (Math.abs(m31) < 0.99999) {
                    dest[0] = Math.atan2(m32, m33);
                    dest[2] = Math.atan2(m21, m11);
                } else {
                    dest[0] = 0;
                    dest[2] = Math.atan2(-m12, m22);
                }
            } else if (order === 'YZX') {
                dest[2] = Math.asin(RedGLUtil.clamp(m21, -1, 1));
                if (Math.abs(m21) < 0.99999) {
                    dest[0] = Math.atan2(-m23, m22);
                    dest[1] = Math.atan2(-m31, m11);
                } else {
                    dest[0] = 0;
                    dest[1] = Math.atan2(m13, m33);
                }
            } else if (order === 'XZY') {
                dest[2] = Math.asin(-RedGLUtil.clamp(m12, -1, 1));
                if (Math.abs(m12) < 0.99999) {
                    dest[0] = Math.atan2(m32, m22);
                    dest[1] = Math.atan2(m13, m11);
                } else {
                    dest[0] = Math.atan2(-m23, m33);
                    dest[1] = 0;
                }
            }
            return dest;
        }
    };
    Object.freeze(RedGLUtil);
})();