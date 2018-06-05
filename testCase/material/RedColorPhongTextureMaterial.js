"use strict";
RedGL( document.createElement( 'canvas' ), function ( v ) {
	var tRedGL = this;
	console.log( tRedGL )
	redSuite(
		"RedColorPhongTextureMaterial 테스트",
		redGroup(
			"생성 확인",
			redTest( "기본 생성 테스트", function ( unit, title ) {
				try {
					RedColorPhongTextureMaterial( tRedGL );
					unit.run( true )
				} catch ( error ) {
					console.log( '///////////////////////////////////////////////////////////' )
					console.log( title, '\n', error )
					unit.run( false )
				}
			}, true )
		),
		redGroup(
			"인자테스트 - redGL",
			redTest( "인자테스트 ( redGL, hexColor, alpha ) : redGL - RedGL instance만 허용.", function ( unit, title ) {
				try {
					RedColorPhongTextureMaterial( 1 );
					unit.run( true )
				} catch ( error ) {
					console.log( '///////////////////////////////////////////////////////////' )
					console.log( title, '\n', error )
					unit.run( false )
				}
			}, false )
		),
		redGroup(
			"인자테스트 - hexColor",
			redTest( "인자테스트 ( redGL, hexColor, alpha ) : hexColor - #xxxxxx or #xxx 만 허용 - 1", function ( unit, title ) {
				try {
					RedColorPhongTextureMaterial( tRedGL, 1 );
					unit.run( true )
				} catch ( error ) {
					console.log( '///////////////////////////////////////////////////////////' )
					console.log( title, '\n', error )
					unit.run( false )
				}
			}, false ),
			redTest( "인자테스트 ( redGL, hexColor, alpha ) : hexColor - #xxxxxx or #xxx 만 허용 - '#2233'", function ( unit, title ) {
				try {
					RedColorPhongTextureMaterial( tRedGL, '#2233' );
					unit.run( true )
				} catch ( error ) {
					console.log( '///////////////////////////////////////////////////////////' )
					console.log( title, '\n', error )
					unit.run( false )
				}
			}, false ),
			redTest( "생성인자 반영되는지 체크 : hexColor - #556677", function ( unit, title ) {
				var t0 = RedColorPhongTextureMaterial( tRedGL, '#556677' );
				unit.run( t0['color'] )
			}, '#556677' ),
			redTest( "생성인자 반영되는지 체크 : hexColor - #fff", function ( unit, title ) {
				var t0 = RedColorPhongTextureMaterial( tRedGL, '#fff' );
				unit.run( t0['color'] )
			}, '#fff' ),
			redTest( "생성인자 반영되는지 체크 : hexColor - #fff", function ( unit, title ) {
				var t0 = RedColorPhongTextureMaterial( tRedGL, '#fff' );
				unit.run( t0['_color'][0] + '_' + t0['_color'][1] + '_' + t0['_color'][2] )
			}, '1_1_1' )
		),
		redGroup(
			"인자테스트 - alpha",
			redTest( "생성인자 반영되는지 체크 : alpha - 0.5", function ( unit, title ) {
				var t0 = RedColorPhongTextureMaterial( tRedGL, '#556677', 0.5 );
				unit.run( t0['alpha'] )
			}, 0.5 ),
			redTest( "생성인자 반영되는지 체크 : alpha - 0.5", function ( unit, title ) {
				var t0 = RedColorPhongTextureMaterial( tRedGL, '#556677', 0.5 );
				unit.run( t0['_color'][3] )
			}, 0.5 ),
			redTest( "생성인자 반영되는지 체크 : hexColor & alpha", function ( unit, title ) {
				var t0 = RedColorPhongTextureMaterial( tRedGL, '#fff', 0.5 );
				unit.run( t0['_color'][0] + '_' + t0['_color'][1] + '_' + t0['_color'][2] + '_' + t0['_color'][3] )
			}, '1_1_1_0.5' ),
			redTest( "생성인자 반영되는지 체크 : 숫자만 허용하는지", function ( unit, title ) {
				try {
					RedColorPhongTextureMaterial( tRedGL, '#fff', 'test' );
				} catch ( error ) {
					console.log( '///////////////////////////////////////////////////////////' )
					console.log( title, '\n', error )
					unit.run( false )
				}
			}, false ),
			redTest( "생성인자 반영되는지 체크 : 1이상을 입력하면 1로 치환되는지", function ( unit, title ) {
				var t0 = RedColorPhongTextureMaterial( tRedGL, '#fff', 1111 );
				unit.run( t0['alpha'] )
			}, 1 ),
			redTest( "생성인자 반영되는지 체크 : 0이하를 입력하면 0으로 치환되는지", function ( unit, title ) {
				var t0 = RedColorPhongTextureMaterial( tRedGL, '#fff', -12345 );
				unit.run( t0['alpha'] )
			}, 0 )
		),
		redGroup(
			"shininess",
			redTest( "숫자만 허용하는지 : 문자입력 ( 실패테스트 )", function ( unit, title ) {
				try {
					var t0 = RedColorPhongTextureMaterial( tRedGL );
					t0['shininess'] = 'test'
				} catch ( error ) {
					console.log( '///////////////////////////////////////////////////////////' )
					console.log( title, '\n', error )
					unit.run( false )
				}
			}, false ),
			redTest( "숫자만 허용하는지 :  Boolean입력 ( 실패테스트 )", function ( unit, title ) {
				try {
					var t0 = RedColorPhongTextureMaterial( tRedGL );
					t0['shininess'] = true
				} catch ( error ) {
					console.log( '///////////////////////////////////////////////////////////' )
					console.log( title, '\n', error )
					unit.run( false )
				}
			}, false ),
			redTest( "숫자만 허용하는지 : 숫자입력 ( 성공테스트 )", function ( unit, title ) {
				try {
					var t0 = RedColorPhongTextureMaterial( tRedGL );
					t0['shininess'] = 32
					unit.run( true )
				} catch ( error ) {
					console.log( '///////////////////////////////////////////////////////////' )
					console.log( title, '\n', error )
					unit.run( false )
				}
			}, true ),
			redTest( "숫자만 허용하는지 : 숫자입력 ( 성공테스트 )", function ( unit, title ) {
				var t0 = RedColorPhongTextureMaterial( tRedGL );
				t0['shininess'] = 32
				unit.run( t0['shininess'] )
			}, 32 )
		),
		redGroup(
			"specularPower",
			redTest( "숫자만 허용하는지 : 문자입력 ( 실패테스트 )", function ( unit, title ) {
				try {
					var t0 = RedColorPhongTextureMaterial( tRedGL );
					t0['specularPower'] = 'test'
				} catch ( error ) {
					console.log( '///////////////////////////////////////////////////////////' )
					console.log( title, '\n', error )
					unit.run( false )
				}
			}, false ),
			redTest( "숫자만 허용하는지 :  Boolean입력 ( 실패테스트 )", function ( unit, title ) {
				try {
					var t0 = RedColorPhongTextureMaterial( tRedGL );
					t0['specularPower'] = true
				} catch ( error ) {
					console.log( '///////////////////////////////////////////////////////////' )
					console.log( title, '\n', error )
					unit.run( false )
				}
			}, false ),
			redTest( "숫자만 허용하는지 : 숫자입력 ( 성공테스트 )", function ( unit, title ) {
				try {
					var t0 = RedColorPhongTextureMaterial( tRedGL );
					t0['specularPower'] = 32
					unit.run( true )
				} catch ( error ) {
					console.log( '///////////////////////////////////////////////////////////' )
					console.log( title, '\n', error )
					unit.run( false )
				}
			}, true ),
			redTest( "숫자만 허용하는지 : 숫자입력 ( 성공테스트 )", function ( unit, title ) {
				var t0 = RedColorPhongTextureMaterial( tRedGL );
				t0['specularPower'] = 32
				unit.run( t0['specularPower'] )
			}, 32 )
		),
		redGroup(
			"displacementPower",
			redTest( "숫자만 허용하는지 : 문자입력 ( 실패테스트 )", function ( unit, title ) {
				try {
					var t0 = RedColorPhongTextureMaterial( tRedGL );
					t0['displacementPower'] = 'test'
				} catch ( error ) {
					console.log( '///////////////////////////////////////////////////////////' )
					console.log( title, '\n', error )
					unit.run( false )
				}
			}, false ),
			redTest( "숫자만 허용하는지 :  Boolean입력 ( 실패테스트 )", function ( unit, title ) {
				try {
					var t0 = RedColorPhongTextureMaterial( tRedGL );
					t0['displacementPower'] = true
				} catch ( error ) {
					console.log( '///////////////////////////////////////////////////////////' )
					console.log( title, '\n', error )
					unit.run( false )
				}
			}, false ),
			redTest( "숫자만 허용하는지 : 숫자입력 ( 성공테스트 )", function ( unit, title ) {
				try {
					var t0 = RedColorPhongTextureMaterial( tRedGL );
					t0['displacementPower'] = 32
					unit.run( true )
				} catch ( error ) {
					console.log( '///////////////////////////////////////////////////////////' )
					console.log( title, '\n', error )
					unit.run( false )
				}
			}, true ),
			redTest( "숫자만 허용하는지 : 숫자입력 ( 성공테스트 )", function ( unit, title ) {
				var t0 = RedColorPhongTextureMaterial( tRedGL );
				t0['displacementPower'] = 32
				unit.run( t0['displacementPower'] )
			}, 32 )
		),
		redGroup(
			"normalTexture",
			redTest( "생성인자 테스트 : RedBitmapTexture Instance 입력( 성공테스트 )", function ( unit, title ) {
				var t0 = RedColorPhongTextureMaterial( tRedGL, '#fff', 1, tRedGL._datas.emptyTexture['2d'] );
				unit.run( t0['normalTexture'] )
			}, tRedGL._datas.emptyTexture['2d'] ),
			redTest( "생성인자 테스트 : 문자입력 ( 실패테스트 )", function ( unit, title ) {
				try {
					var t0 = RedColorPhongTextureMaterial( tRedGL, '#fff', 1, 'failTest' );
					unit.run( true )
				} catch ( error ) {
					console.log( '///////////////////////////////////////////////////////////' )
					console.log( title, '\n', error )
					unit.run( false )
				}
			}, false ),
			redTest( "생성인자 테스트 : RedBitmapCubeTexture Instance 입력 ( 실패테스트 )", function ( unit, title ) {
				try {
					var t0 = RedColorPhongTextureMaterial( tRedGL, '#fff', 1, tRedGL._datas.emptyTexture['3d'] );
					unit.run( true )
				} catch ( error ) {
					console.log( '///////////////////////////////////////////////////////////' )
					console.log( title, '\n', error )
					unit.run( false )
				}
			}, false ),
			redTest( "RedBitmapTexture Instance만 허용하는지 : ( 성공테스트 )", function ( unit, title ) {
				try {
					var t0 = RedColorPhongTextureMaterial( tRedGL );
					t0['normalTexture'] = tRedGL._datas.emptyTexture['2d']
					unit.run( true )
				} catch ( error ) {
					console.log( '///////////////////////////////////////////////////////////' )
					console.log( title, '\n', error )
					unit.run( false )
				}
			}, true ),
			redTest( "RedBitmapTexture Instance만 허용하는지 : 문자입력 ( 실패테스트 )", function ( unit, title ) {
				try {
					var t0 = RedColorPhongTextureMaterial( tRedGL );
					t0['normalTexture'] = 'failTest'
					console.log( t0 )
					unit.run( true )
				} catch ( error ) {
					console.log( '///////////////////////////////////////////////////////////' )
					console.log( title, '\n', error )
					unit.run( false )
				}
			}, false ),
			redTest( "RedBitmapTexture Instance만 허용하는지 : RedBitmapCubeTexture Instance 입력 ( 실패테스트 )", function ( unit, title ) {
				try {
					var t0 = RedColorPhongTextureMaterial( tRedGL );
					t0['normalTexture'] = tRedGL._datas.emptyTexture['3d']
					console.log( t0 )
					unit.run( true )
				} catch ( error ) {
					console.log( '///////////////////////////////////////////////////////////' )
					console.log( title, '\n', error )
					unit.run( false )
				}
			}, false )
		),
		redGroup(
			"specularTexture",
			redTest( "생성인자 테스트 : RedBitmapTexture Instance 입력( 성공테스트 )", function ( unit, title ) {
				var t0 = RedColorPhongTextureMaterial( tRedGL, '#fff', 1, null, tRedGL._datas.emptyTexture['2d'] );
				unit.run( t0['specularTexture'] )
			}, tRedGL._datas.emptyTexture['2d'] ),
			redTest( "생성인자 테스트 : 문자입력 ( 실패테스트 )", function ( unit, title ) {
				try {
					var t0 = RedColorPhongTextureMaterial( tRedGL, '#fff', 1, 'failTest' );
					unit.run( true )
				} catch ( error ) {
					console.log( '///////////////////////////////////////////////////////////' )
					console.log( title, '\n', error )
					unit.run( false )
				}
			}, false ),
			redTest( "생성인자 테스트 : RedBitmapCubeTexture Instance 입력 ( 실패테스트 )", function ( unit, title ) {
				try {
					var t0 = RedColorPhongTextureMaterial( tRedGL, '#fff', 1, null, tRedGL._datas.emptyTexture['3d'] );
					unit.run( true )
				} catch ( error ) {
					console.log( '///////////////////////////////////////////////////////////' )
					console.log( title, '\n', error )
					unit.run( false )
				}
			}, false ),
			redTest( "RedBitmapTexture Instance만 허용하는지 : ( 성공테스트 )", function ( unit, title ) {
				try {
					var t0 = RedColorPhongTextureMaterial( tRedGL );
					t0['specularTexture'] = tRedGL._datas.emptyTexture['2d']
					unit.run( true )
				} catch ( error ) {
					console.log( '///////////////////////////////////////////////////////////' )
					console.log( title, '\n', error )
					unit.run( false )
				}
			}, true ),
			redTest( "RedBitmapTexture Instance만 허용하는지 : 문자입력 ( 실패테스트 )", function ( unit, title ) {
				try {
					var t0 = RedColorPhongTextureMaterial( tRedGL );
					t0['specularTexture'] = 'failTest'
					console.log( t0 )
					unit.run( true )
				} catch ( error ) {
					console.log( '///////////////////////////////////////////////////////////' )
					console.log( title, '\n', error )
					unit.run( false )
				}
			}, false ),
			redTest( "RedBitmapTexture Instance만 허용하는지 : RedBitmapCubeTexture Instance 입력 ( 실패테스트 )", function ( unit, title ) {
				try {
					var t0 = RedColorPhongTextureMaterial( tRedGL );
					t0['specularTexture'] = tRedGL._datas.emptyTexture['3d']
					console.log( t0 )
					unit.run( true )
				} catch ( error ) {
					console.log( '///////////////////////////////////////////////////////////' )
					console.log( title, '\n', error )
					unit.run( false )
				}
			}, false )
		),
		redGroup(
			"displacementTexture",
			redTest( "생성인자 테스트 : RedBitmapTexture Instance 입력( 성공테스트 )", function ( unit, title ) {
				var t0 = RedColorPhongTextureMaterial( tRedGL, '#fff', 1, null, null, tRedGL._datas.emptyTexture['2d'] );
				unit.run( t0['displacementTexture'] )
			}, tRedGL._datas.emptyTexture['2d'] ),
			redTest( "생성인자 테스트 : 문자입력 ( 실패테스트 )", function ( unit, title ) {
				try {
					var t0 = RedColorPhongTextureMaterial( tRedGL, '#fff', 1, 'failTest' );
					unit.run( true )
				} catch ( error ) {
					console.log( '///////////////////////////////////////////////////////////' )
					console.log( title, '\n', error )
					unit.run( false )
				}
			}, false ),
			redTest( "생성인자 테스트 : RedBitmapCubeTexture Instance 입력 ( 실패테스트 )", function ( unit, title ) {
				try {
					var t0 = RedColorPhongTextureMaterial( tRedGL, '#fff', 1, null, null, tRedGL._datas.emptyTexture['3d'] );
					unit.run( true )
				} catch ( error ) {
					console.log( '///////////////////////////////////////////////////////////' )
					console.log( title, '\n', error )
					unit.run( false )
				}
			}, false ),
			redTest( "RedBitmapTexture Instance만 허용하는지 : ( 성공테스트 )", function ( unit, title ) {
				try {
					var t0 = RedColorPhongTextureMaterial( tRedGL );
					t0['displacementTexture'] = tRedGL._datas.emptyTexture['2d']
					unit.run( true )
				} catch ( error ) {
					console.log( '///////////////////////////////////////////////////////////' )
					console.log( title, '\n', error )
					unit.run( false )
				}
			}, true ),
			redTest( "RedBitmapTexture Instance만 허용하는지 : 문자입력 ( 실패테스트 )", function ( unit, title ) {
				try {
					var t0 = RedColorPhongTextureMaterial( tRedGL );
					t0['displacementTexture'] = 'failTest'
					console.log( t0 )
					unit.run( true )
				} catch ( error ) {
					console.log( '///////////////////////////////////////////////////////////' )
					console.log( title, '\n', error )
					unit.run( false )
				}
			}, false ),
			redTest( "RedBitmapTexture Instance만 허용하는지 : RedBitmapCubeTexture Instance 입력 ( 실패테스트 )", function ( unit, title ) {
				try {
					var t0 = RedColorPhongTextureMaterial( tRedGL );
					t0['displacementTexture'] = tRedGL._datas.emptyTexture['3d']
					console.log( t0 )
					unit.run( true )
				} catch ( error ) {
					console.log( '///////////////////////////////////////////////////////////' )
					console.log( title, '\n', error )
					unit.run( false )
				}
			}, false )
		)
	)
} )