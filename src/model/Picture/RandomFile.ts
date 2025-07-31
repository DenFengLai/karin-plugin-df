import lodash from 'node-karin/lodash'
import path from 'node:path'
import { logger, existsSync, getFiles } from 'node-karin'
import { dir } from '@/dir'
import { config } from '@/utils'
import { FaceList, FaceCharacter, getFaceName, FaceArrayToName } from '@/constant'
/**
 * 随机获取一个文件
 * @param  dirPath - 文件夹路径
 * @returns 文件路径或空
 */
export function randomFile (dirPath: string): string | null {
  try {
    const files = getFiles(dirPath)
    if (files.length === 0) {
      logger.error(`获取文件失败: ${dirPath}`)
      return null
    }
    const fileName = lodash.sample(files) as string
    return path.join(dirPath, fileName)
  } catch (err: any) {
    logger.error(`获取文件错误: ${dirPath}\n${err}`)
    return null
  }
}

/**
 * 抽取随机表情包
 * @param name - 表情包名称
 * @returns 文件路径或api地址
 */
export function Face (name: 'all' | FaceCharacter): string | null {
  let { blackList } = config().Poke
  if (name === 'all') {
    let List = FaceList
    if (Array.isArray(blackList) && blackList.length > 0) {
      blackList = FaceArrayToName(blackList || [])
      List = FaceList.filter(type => {
        const a = getFaceName(type) || ''
        console.log('🚀 ~ Face ~ a:', a)
        const b = !blackList.includes(a)
        console.log('🚀 ~ Face ~ b:', b)
        return b
      })
      console.log('🚀 ~ Face ~ List:', List)
    }
    name = lodash.sample(List) || FaceCharacter.Murasame
  }
  const Path = path.join(dir.faceResourcesDir, name)
  if (!existsSync(Path)) return FaceApi(name)
  return randomFile(Path)
}

export function FaceApi (name: FaceCharacter): string {
  return `https://ciallo.ciallo.pro/?name=${name}`
}
