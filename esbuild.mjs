import * as esbuild from 'esbuild';

let buildConfigs = [
    //cjs
    {
        outdir: './lib/cjs',
        outExtension: { '.js': '.js' },
        format: 'cjs'
    },
    //esm
    {
        outdir: './lib/esm',
        outExtension: { '.js': '.mjs' },
        format: 'esm',
        //add '.mjs' file extensions to imports
        bundle: true,
        plugins: [{
            name: 'add-mjs',
            setup(build) {
                build.onResolve({ filter: /.*/ }, args => {
                    if (args.importer)
                        return { path: args.path + '.mjs', external: true }
                })
            },
        }],
    }
];

for (let config of buildConfigs) {
    await esbuild.build({
        entryPoints: ['src/*.ts'],
        platform: 'node',
        ...config,
    });
}