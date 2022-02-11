// import typescript from 'rollup-plugin-typescript';
import typescript from 'rollup-plugin-typescript2';
import nodeResolve from 'rollup-plugin-node-resolve';
import { uglify } from 'rollup-plugin-uglify';

// import commonjs from 'rollup-plugin-commonjs';
// import es3 from 'rollup-plugin-es3'
import pkg from './package.json';

const name = 'qrcodeMatrix';
const banner = `/*!
 * ${pkg.name}  v${pkg.version}
 * Homepage ${pkg.homepage}
 * License ${pkg.license}
 */
`;
let minOpts = {
  output: {
    preamble: banner,
  },
};

let external = Object.keys(pkg.dependencies);
let plugins_typeES2015 = typescript({
  target: 'ES2015',
  module: 'ES2015',
  removeComments: true,
});

let out_config = [
  {
    input: './src/index.ts',
    plugins: [plugins_typeES2015],
    output: [
      {
        file: pkg.module,
        format: 'es',
        banner: banner,
      },
      {
        file: pkg.main,
        format: 'cjs',
        exports: 'named',
		    banner: banner,
      },
    ],
    external,
  },
  {
    input: pkg.module,
    plugins: [nodeResolve()],
    output: [
      {
        file: pkg.browser,
        format: 'umd',
        name: name,
        exports: 'named',
      },
      {
        file: pkg.browser.replace(/\.js$/, '.min.js'),
        name: name,
        format: 'umd',
        exports: 'named',
        plugins: [uglify(minOpts)],
      },
    ],
  },
];

export default [...out_config];
