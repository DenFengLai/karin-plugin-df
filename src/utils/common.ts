import lodash from 'node-karin/lodash'
import moment from 'node-karin/moment'
import { config } from '@/utils'
import { karin, type Elements, config as Config } from 'node-karin'

type Message = string | Elements | Array<Elements>

/**
 * 生成随机数
 * @param min - 最小值
 * @param max - 最大值
 * @returns
 */
export const random = (min: number, max: number) => lodash.random(min, max)

/**
 * 睡眠函数
 * @param ms - 毫秒
 */
export const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

/**
 * 使用moment返回时间
 * @param format - 格式
 */
export const time = (format = 'YYYY-MM-DD HH:mm:ss') => moment().format(format)

/**
 * 消息处理
 * @description 过滤正则内容和除`image`与`text`外的元素
 * @param message 消息源数组
 * @param Reg 正则表达式
 * @returns 替换后的消息数组
 */
export function Replace (message: Array<Elements>, Reg: RegExp) {
  message = message.filter((item) => item.type === 'text' || item.type === 'image')

  // const alias = []
  // if (e.hasAlias && e.isGroup) {
  //   const groupCfg = Config.getGroup(e.group_id, e.self_id)
  //   alias = Array.isArray(groupCfg.botAlias) ? groupCfg.botAlias : [ groupCfg.botAlias ]
  // }

  message = message.filter((item) => {
    if (item.type === 'text') {
      if (Reg) item.text = item.text.replace(Reg, '').trim()

      if (!item.text) return false

      // for (const name of alias) {
      //   if (item.text.startsWith(name)) {
      //     item.text = item.text.slice(name.length).trim()
      //     break
      //   }
      // }
    }
    // else if (item.url) {
    //   item.file = item.url
    // }

    return true
  })

  return message
}

/**
 * 发送消息给主人
 * @param msg - 消息内容
 * @returns 是否发送成功
 */
export async function sendMasterMsg (msg: Message): Promise<boolean> {
  const { master } = config().sendMaster
  const masterList = Config.master()
  // const adminList = Config.admin()
  if (master === 'all') {
    let num = 0
    for (const id of masterList) {
      if (id === 'console') continue
      if (await sendMsg(id, msg)) {
        num++
        await sleep(1000)
      }
    }
    return num > 0
  } else {
    let masterId: string = masterList[0]
    if (masterList[0] === 'console') masterId = masterList[1]
    return Boolean(await sendMsg(masterId, msg))
  }
}

/**
 * 发送消息
 * @param id - 接收者ID
 * @param msg - 消息内容
 * @returns 发送消息返回或false
 */
export async function sendMsg (id: string, msg: Message) {
  const bots = karin.getAllBot()
  let bot

  for (const b of bots) {
    const friendList = await b.getFriendList()
    const friendIds = friendList.map(friend => friend.userId)

    if (friendIds.includes(id)) {
      bot = b
      break
    }
  }
  if (!bot) return false
  return await karin.sendMsg(bot.selfId, karin.contactFriend(id), msg)
}

/**
 * 将扁平化的对象（使用 `:` 作为层级分隔符）转换为嵌套对象
 *
 * @param flatObj - 扁平化对象，例如 { "a:b:c": 1 }
 * @returns 转换后的嵌套对象，例如 { a: { b: { c: 1 } } }
 *
 * @example
 * unflattenObject({ "user:profile:name": "Tom" })
 * // => { user: { profile: { name: "Tom" } } }
 */
export function unflattenObject (flatObj: Record<string, any>): Record<string, any> {
  const result = {}
  for (const key in flatObj) {
    lodash.set(result, key.split(':'), flatObj[key])
  }
  return result
}

/**
 * 深度合并两个对象
 *
 * @param  target - 目标对象（被合并到的新对象）
 * @param  source - 源对象（用来更新目标对象）
 * @param  [options] - 选项
 * @param  [options.arrayOverwrite=true] - 是否用新数组覆盖旧数组（true 覆盖，false 合并）
 * @returns 合并后的新对象（不会修改原对象）
 *
 * @example
 * deepMerge(
 *   { user: { tags: ["a"] } },
 *   { user: { tags: ["b"] } },
 *   { arrayOverwrite: true }
 * )
 * // => { user: { tags: ["b"] } }
 */
export function deepMerge (target: Record<string, any>, source: Record<string, any>, { arrayOverwrite = true } = {}): Record<string, any> {
  return lodash.mergeWith({}, target, source, (objValue, srcValue) => {
    if (Array.isArray(objValue) && Array.isArray(srcValue)) {
      return arrayOverwrite ? srcValue : [...objValue, ...srcValue]
    }
  })
}
