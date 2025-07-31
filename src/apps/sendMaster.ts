import moment from 'node-karin/moment'
import { ulid } from 'ulid'
import { Replace, config, sendMasterMsg } from '@/utils'
import { Face, FaceApi, } from '@/model'
import { FaceCharacter } from '@/constant'
import karin, { logger, segment, Plugin, type Message, redis, config as Config, createRawMessage } from 'node-karin'
import type { SendMasterRedisData } from '@/types'

const key = 'DF:contact'
let Sending = false
const ReplyReg = /^#?回复(\S+)\s?(.*)?$/

export class SendMasterMsgs extends Plugin {
  constructor () {
    super({
      name: 'DF:联系主人',
      desc: '给主人发送一条消息',
      event: 'message',
      priority: 400,
      rule: [
        {
          reg: '^#联系主人',
          fnc: 'contact'
        },
        {
          reg: ReplyReg,
          fnc: 'Replys',
          event: 'message.friend'
        }
      ]
    })
  }

  /**
   * 联系主人
   * @param {object} e - 消息事件
   */
  async contact (e: Message) {
    if (Sending) return e.reply('❎ 已有发送任务正在进行中，请稍候重试')

    const { switch: open, cd, banWords, banUser, banGroup, replyId } = config().sendMaster

    if (!e.isMaster) {
      if (!open) return e.reply('❎ 该功能暂未开启，请先让主人开启才能用哦', { reply: true })
      if (cd !== 0 && await redis.get(key)) return e.reply('❎ 操作频繁，请稍后再试', { reply: true })
      if (banWords.some(item => e.msg.includes(item))) return e.reply('❎ 消息包含违禁词，请检查后重试', { reply: true })
      if (banUser.includes(e.userId)) return e.reply('❎ 对不起，您不可用', { reply: true })
      if (e.isGroup && banGroup.includes(e.groupId)) return e.reply('❎ 该群暂不可用该功能', { reply: true })
    }

    Sending = true

    try {
      const message = Replace(e.elements, /#联系主人/)
      if (message.length === 0) return e.reply('❎ 消息不能为空')
      const platform = e.bot.adapter.platform || '未知平台'
      const avatar = segment.image(await e.bot.getAvatarUrl(e.userId) || Face(FaceCharacter.Murasame) || FaceApi(FaceCharacter.Murasame))
      const user = `${e.sender.name}(${e.userId})`
      const group = e.isGroup ? `${e.contact.name || '未知群名'}(${e.groupId})` : '私聊'
      const bot = `${e.bot.selfName}(${e.bot.selfId})`
      const time = moment().format('YYYY-MM-DD HH:mm:ss')
      const id = ulid().slice(-5)

      const msg = [
        `联系主人消息(${id})\n`,
        avatar,
        `平台: ${platform}\n`,
        `用户: ${user}\n`,
        `来自: ${group}\n`,
        `BOT: ${bot}\n`,
        `时间: ${time}\n`,
        '消息内容:\n',
        ...message,
        '\n-------------\n',
        '引用该消息：#回复 <内容>'
      ].map(item => typeof item === 'string' ? segment.text(item) : item)

      const info: SendMasterRedisData = {
        bot: e.bot.selfId,
        group: e.isGroup ? e.groupId : false,
        id: e.userId,
        messageId: e.messageId
      }

      const masterQQ = Config.master()

      try {
        await sendMasterMsg(msg)
        let _msg = '✅ 消息已送达'
        if (replyId) _msg += `\n主人的QQ：${masterQQ}`
        await e.reply(_msg, { reply: true })
        if (cd) redis.set(key, '1', { EX: cd })
        redis.set(`${key}:${id}`, JSON.stringify(info), { EX: 86400 })
      } catch (err) {
        await e.reply(`❎ 消息发送失败，请尝试自行联系：${masterQQ}\n错误信息: ${err}`)
        logger.error(err)
      }
    } catch (err) {
      await e.reply('❎ 出错误辣，稍后重试吧')
      logger.error(err)
    } finally {
      Sending = false
    }
  }

  /**
   * 回复消息
   * @param {object} e - 消息事件
   */
  async Replys (e: Message) {
    if (!e.isMaster) return false

    try {
      const source = e.replyId ? await e.bot.getMsg(e.replyId) : null
      let MsgID; let isInput = false
      let rawMsg = ''
      if (source) {
        rawMsg = createRawMessage(source.elements).msg
      }
      if (source && (/联系主人消息/.test(rawMsg))) {
        MsgID = rawMsg.match(/\(([^)]+)\)/)?.[1]
      } else {
        const regRet = ReplyReg.exec(e.msg)
        if (!regRet?.[1]) return logger.warn('[DF-Plugin] 未找到消息ID')
        else {
          MsgID = regRet[1].trim()
          isInput = true
        }
      }
      if (!MsgID) return false

      const data = await redis.get(`${key}:${MsgID}`)
      if (!data) return isInput ? false : e.reply('❎ 消息已失效或不存在')

      const { bot, group, id, messageId } = JSON.parse(data) as SendMasterRedisData
      const message = Replace(e.elements, isInput ? /#?回复(\S+)\s?/ : /#?回复/g)
      message.unshift(segment.text(`主人${config().sendMaster.replyId ? `(${e.userId})` : ''}回复：\n`), segment.reply(messageId))

      await karin.sendMsg(bot, group ? karin.contactGroup(group) : karin.contactFriend(id), message)
      return e.reply('✅ 消息已送达')
    } catch (err) {
      e.reply('❎ 发生错误，请查看控制台日志')
      logger.error('回复消息时发生错误：', err)
      return false
    }
  }
}
