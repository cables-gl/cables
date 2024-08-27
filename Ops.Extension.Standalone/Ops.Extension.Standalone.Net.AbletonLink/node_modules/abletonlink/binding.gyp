{
	'targets': [{
		'target_name': 'abletonlink',
		'sources': [
			'src/napi-abletonlink.cc',
		],
		'include_dirs': [
			"<!@(node -p \"require('node-addon-api').include\")",
			'<(module_root_dir)/libs/link/include',
			'<(module_root_dir)/libs/link/modules/asio-standalone/asio/include'
		],
		'cflags_cc!': ['-std=c++11'],
		'defines': ['NAPI_ENABLE_CPP_EXCEPTIONS'],

		'conditions': [
			['OS=="mac"', {
				'defines': ['LINK_PLATFORM_MACOSX=1'],
				'cflags_cc!': [ '-fno-rtti' ],
				'cflags_cc': ['-frtti'],
				'xcode_settings': {
					'GCC_ENABLE_CPP_EXCEPTIONS': 'YES',
					'CLANG_CXX_LIBRARY': 'libc++',
					'CLANG_CXX_LANGUAGE_STANDARD': 'c++11',
					'GCC_ENABLE_CPP_RTTI': 'YES'
				}
			}],
			['OS=="linux"', {
				'defines': ['LINK_PLATFORM_LINUX=1'],
				'cflags_cc': ['-fexceptions']
			}],
			['OS=="win"', {
				'defines': ['LINK_PLATFORM_WINDOWS=1', '_WIN32_WINNT=0x0501','NAPI_DISABLE_CPP_EXCEPTIONS'],
				'defines!': ['_HAS_EXCEPTIONS=0'],
			}],
		],
	}],
}
