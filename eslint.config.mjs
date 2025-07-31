import neostandard from 'neostandard'

const ignores = ['node_modules', 'temp', 'logs', 'data', 'dist']
export default neostandard({ ignores, ts: true })
