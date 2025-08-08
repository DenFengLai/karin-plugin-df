import { Face, apiHandlers } from '@/model/Picture'
import { FaceList, getFaceName } from '@/constant'
import { Plugin, segment, Message } from 'node-karin'
import _ from 'node-karin/lodash'
import { config } from '@/utils'

const PictureRegx = new RegExp(`^#?(?:来张|看看|随机)(${apiHandlers.map(handler => handler.reg).join('|')})$`, 'i')
const FaceRegx = new RegExp(`^#?(?:来张|看看|随机)(${FaceList.join('|')})$`, 'i')

export class RandomPictures extends Plugin {
  constructor () {
    super({
      name: 'DF:随机图片',
      desc: '随机返回一张图片',
      event: 'message',
      priority: 500,
      rule: [
        {
          reg: PictureRegx,
          fnc: 'handleRequest'
        },
        {
          reg: FaceRegx,
          fnc: 'FaceRequest'
        },
        {
          reg: /^#?DF(随机)?表情包?列表$/i,
          fnc: 'list'
        }
      ]
    })
  }

  get open () {
    return config().Picture.switch
  }

  async list () {
    return this.e.reply(`表情包列表：\n${FaceList.join('、')}\n\n使用 #随机+表情名称`, { reply: true })
  }

  async handleRequest (e: Message) {
    if (!this.open) return false

    const type = PictureRegx.exec(e.msg)?.[1]?.toLowerCase()
    if (!type) return false
    const message = await (apiHandlers.find(handler => new RegExp(handler.reg, 'i').test(type))
    )?.fnc?.()

    if (!_.isEmpty(message)) {
      return e.reply(message, { reply: true })
    }

    return false
  }

  async FaceRequest () {
    if (!this.open) return false

    const type = FaceRegx.exec(this.e.msg)
    if (!type || type.length < 2) return false
    const face = getFaceName(type[1].toLowerCase())

    if (face) {
      const url = Face(face)
      if (!url) return false
      return this.e.reply(segment.image(url), { reply: true })
    }

    return false
  }
}
