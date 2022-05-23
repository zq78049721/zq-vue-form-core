// import resolve from 'rollup-plugin-node-resolve';
import babel from 'rollup-plugin-babel';
import { terser } from "rollup-plugin-terser";

export default {
    input: 'src/index.js',
    output: {
        file: './dist/zq-vue-form-core.js',
        format: 'cjs',
        sourcemap: true
    },
    plugins: [
        // resolve(),
        babel({
            exclude: 'node_modules/**' // 只编译我们的源代码
        }),
        // terser()
    ]
};