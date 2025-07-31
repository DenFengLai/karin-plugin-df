import { dir } from '@/dir'
import {
  watch,
  logger,
  filesByExt,
  copyConfigSync,
  requireFileSync,
  writeJsonSync
} from 'node-karin'
import type { ConfigType } from '@/types'
import { deepMerge } from './common'
/**
 * @description 初始化配置文件
 */
copyConfigSync(dir.defConfigDir, dir.ConfigDir, ['.json'])

/**
 * @description 配置文件
 */
export const config: () => ConfigType = () => {
  const cfg = requireFileSync(`${dir.ConfigDir}/config.json`)
  const def = requireFileSync(`${dir.defConfigDir}/config.json`)
  return { ...def, ...cfg }
}

/**
 * @description 监听配置文件
 */
setTimeout(() => {
  const list = filesByExt(dir.ConfigDir, '.json', 'abs')
  list.forEach(file => watch(file, () => {
    logger.info('[DF-Plugin] 配置已更新')
  }))
}, 2000)

// export function setConfig
// Config.setYamlConfig()

export function saveConfig (data: Partial<ConfigType>) {
  const cfg = config()
  const newCfg = deepMerge(cfg, data)
  writeJsonSync(`${dir.ConfigDir}/config.json`, newCfg)
  logger.debug('配置文件已更新')
}
