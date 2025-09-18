import multi from '@rollup/plugin-multi-entry';

export default {
	input: 'build/unbundled/**/*.js',
	plugins: [multi({exports : false})],
	output: {
		file: 'build/bundle.js',
		format: 'es'
	},
	treeshake:false
};