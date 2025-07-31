import { logger, segment, karin, type GroupPokeNotice, type PrivatePokeNotice } from 'node-karin'
import { Face } from '@/model'
import { getFaceName, FaceCharacter } from '@/constant'
import { config } from '@/utils'

export const PokeFriendHandler = karin.accept('notice.groupPoke', async (cxt) => poke(cxt), { name: '群聊戳一戳' })

export const PokePrivateHandler = karin.accept('notice.privatePoke', async (cxt) => poke(cxt), { name: '私聊戳一戳' })
async function poke (e: GroupPokeNotice | PrivatePokeNotice) {
  const { switch: enabled, type } = config().Poke

  if (!enabled || e.content.targetId !== e.selfId) return false

  let name: FaceCharacter | undefined | 'all'
  if (type !== 'all') {
    name = getFaceName(type)
  } else {
    name = type
  }

  if (!name) {
    logger.warn(`${logger.blue('[DF-Plugin]')}${logger.red('[戳一戳]')}无效的图片配置: ${type}`)
    return false
  }
  logger.info(`${logger.blue('[DF-Plugin]')}${logger.green('[戳一戳]')}获取 ${name} 图片`)

  const file = Face(name)
  if (!file) return false
  await e.reply(segment.image(file))
  return true
}
