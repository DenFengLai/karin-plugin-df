import type { FaceCharacter } from '@/constant'

export interface ConfigType {
  /** 戳一戳配置 */
  Poke: {
    /** 戳一戳开关 */
    switch: boolean
    /** 戳一戳图片类型 */
    type: 'all' | number | FaceCharacter
    /**
     * 戳一戳图片类型黑名单
     * @description 图片类型设置为 `all` 时生效
    */
    blackList: string[]
  }
  /** 随机图片配置 */
  Picture: {
    /** 随机图片开关 */
    switch: boolean
    /** 是否去除 #来张/随机 前缀 */
    direct: boolean
  }
  /** 联系主人配置 */
  sendMaster: {
    /** 联系主人功能开关 */
    switch: boolean
    /**
       * 联系主人冷却时间
       * @description 单位：秒，填0关闭CD
       * @example 60
      */
    cd: number
    /** 联系主人类型 */
    master: 'first' | 'all'
    /** 联系Bot ID */
    botid: number | string
    /** 回复消息时是否携带主人ID */
    replyId: boolean
    /**
       * 违禁词列表
       * @description 该列表中的词语将被过滤，用户发送包含这些词语的消息时，将无法联系主人
       * @example ['违禁词1', '违禁词2']
       */
    banWords: string[]
    /**
       * 黑名单用户
       * @description 该列表中的用户将无法联系主人
       * @example ['用户1', 123]
       */
    banUser: string[]
    /**
       * 黑名单群组
       * @description 该列表中的群组将无法联系主人
       * @example ['群号1', 123]
       */
    banGroup: string[]
  }
  /** 图片外显配置 */
  Summary: {
    /** 图片外显开关 */
    switch: boolean
    /** 外显文本类型 */
    type: 'yiyan' | 'text'
    /** 一言API地址 */
    yiyanApi: string
    /** 一言文本列表 */
    textList: string[]
  }
}
