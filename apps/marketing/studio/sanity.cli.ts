import {defineCliConfig} from 'sanity/cli'

export default defineCliConfig({
  api: {
    projectId: 'a09jbdjz',
    dataset: 'production',
  },
  /**
   * Enable auto-updates for studios.
   * Learn more at https://www.sanity.io/docs/cli#auto-updates
   */
  deployment: {
    autoUpdates: true,
    appId: 'h259ayt97hlr1e9hfr3b33so',
  },
  typegen: {
    path: ['./src/**/*.{ts,tsx}', '../web/src/**/*.{ts,tsx}'],
    schema: './schema.json',
    generates: '../web/src/lib/sanity/sanity.types.ts',
    formatGeneratedCode: true,
  },
  mediaLibrary: {
    aspectsPath: 'src/aspects',
  },
})
