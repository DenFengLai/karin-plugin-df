export interface SendMasterRedisData {
  /** 机器人id */
  bot: string
  /** 群组id */
  group: string | false
  /** 用户id */
  id: string
  /** 消息id */
  messageId: string
}
