import esbuild from 'esbuild';

await esbuild.build({
  entryPoints: ['server/index.ts'],
  bundle: true,
  platform: 'node',
  packages: 'external',
  format: 'esm',
  outdir: 'dist',
  sourcemap: true,
});