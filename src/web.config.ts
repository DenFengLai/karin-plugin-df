import { defineConfig, components } from 'node-karin'
import { dir } from '@/dir'
import { config, saveConfig, unflattenObject } from './utils'
import { FaceCharacter } from './constant'

export default defineConfig({
  /** 插件信息配置 */
  info: {
    id: dir.name,
    name: 'DF-Plugin',
    author: {
      name: dir.pkg.author.name,
      home: dir.pkg.homepage,
      avatar: `https://github.com/${dir.pkg.author.name}.png`
    },
    icon: {
      /** @see https://fonts.google.com/icons */
      name: 'settings',
      size: 24,
      color: '#B2A8D3'
    },
    version: dir.version,
    description: '适用于Karin的拓展插件',
  },
  /** 动态渲染的组件 */
  components: () => {
    const cfg = config()
    return [
      components.divider.create('sendMasteer', {
        description: '联系主人配置',
      }),
      components.switch.create('sendMaster:switch', {
        label: '开启联系主人功能',
        description: '开启后，用户可以通过发送特定消息联系主人',
        defaultSelected: cfg.sendMaster.switch,
      }),
      components.input.number('sendMaster:cd', {
        label: '联系主人冷却时间',
        description: '单位：秒，填0关闭CD',
        isRequired: true,
        defaultValue: cfg.sendMaster.cd.toString()
      }),
      components.radio.group('sendMaster:master', {
        label: '主人通知模式',
        isRequired: true,
        defaultValue: cfg.sendMaster.master,
        radio: [
          components.radio.create('first', {
            value: 'first',
            label: '仅发送首位主人'
          }),
          components.radio.create('all', {
            value: 'all',
            label: '发送给全部主人'
          })
        ]
      }),
      components.switch.create('sendMaster:replyId', {
        label: '回复主人ID',
        description: '消息发送成功后是否回复发送者主人id',
        defaultSelected: cfg.sendMaster.replyId
      }),
      components.input.group('sendMaster:banWords', {
        label: '违禁词列表',
        description: '该列表中的词语将被过滤，用户发送包含这些词语的消息时，将无法联系主人',
        data: cfg.sendMaster.banWords,
        template:
          components.input.string('item', {
            label: '违禁词',
            placeholder: '请输入违禁词',
            isRequired: true,
          })
      }),
      components.input.group('sendMaster:banUser', {
        label: '黑名单用户',
        description: '该列表中的用户将无法联系主人',
        data: cfg.sendMaster.banUser,
        maxRows: 2,
        itemsPerRow: 4,
        template:
          components.input.string('item', {
            label: '用户ID',
            placeholder: '请输入用户ID',
            isRequired: true,
          })
      }),
      components.input.group('sendMaster:banGroup', {
        label: '黑名单群组',
        description: '该列表中的群组将无法联系主人',
        data: cfg.sendMaster.banGroup,
        template:
          components.input.string('item', {
            label: '群组ID',
            placeholder: '请输入群组ID',
            isRequired: true,
          })
      }),
      components.divider.create('poke', {
        description: '戳一戳配置',
      }),
      components.switch.create('Poke:switch', {
        label: '戳一戳开关',
        description: '开启后，用户可以通过发送特定消息进行戳一戳',
        defaultSelected: cfg.Poke.switch,
      }),
      components.radio.group('Poke:type', {
        label: '戳一戳图片类型',
        isRequired: true,
        defaultValue: cfg.Poke.type.toString(),
        radio: [
          components.radio.create('all', {
            value: 'all',
            label: '随机所有图片类型'
          }),
          ...Object.entries(FaceCharacter).map(([key, value]) => components.radio.create(key, {
            value: key,
            label: value
          }))
        ]
      }),
      components.checkbox.group('Poke:blackList', {
        label: '随机类型黑名单',
        description: '当表情类型设置为随机时此列表的表情将不会被随机到',
        isDisabled: cfg.Poke.type !== 'all',
        defaultValue: cfg.Poke.blackList,
        checkbox: [
          ...Object.entries(FaceCharacter).map(([key, value]) => components.checkbox.create(key, {
            value: key,
            label: value,
            color: 'danger'
          }))
        ]
      }),
      components.divider.create('Picture', {
        description: '随机图片配置',
      }),
      components.switch.create('Picture:switch', {
        label: '随机图片开关',
        description: '开启后，用户可以通过发送特定消息获取随机图片',
        defaultSelected: cfg.Picture.switch,
      }),
      components.switch.create('Picture:direct', {
        label: '去除 #来张/随机 前缀',
        description: '开启后，用户可以直接发送图片名称获取随机图片',
        defaultSelected: cfg.Picture.direct,
      }),
      components.divider.create('Summary', {
        description: '图片外显配置',
      }),
      components.switch.create('Summary:switch', {
        label: '图片外显开关',
        description: '开启后，图片将会在发送时附带外显文本',
        defaultSelected: cfg.Summary.switch,
      }),
      components.radio.group('Summary:type', {
        label: '外显文本类型',
        isRequired: true,
        defaultValue: cfg.Summary.type,
        radio: [
          components.radio.create('yiyan', {
            value: 'yiyan',
            label: '一言'
          }),
          components.radio.create('text', {
            value: 'text',
            label: '自定义文本'
          })
        ]
      }),
      components.input.group('Summary:text', {
        label: '自定义文本列表',
        description: '当外显文本类型为自定义文本时生效',
        data: cfg.Summary.textList,
        template:
          components.input.string('item', {
            label: '文本',
            placeholder: '请输入自定义文本',
            isRequired: true,
          })
      }),
      components.input.string('Summary:yiyanApi', {
        label: '一言API',
        defaultValue: cfg.Summary.yiyanApi,
        isRequired: false,
        size: 'lg',
        placeholder: '无特殊需要请勿填写',
        description: '非必要无需配置，为空时将使用默认一言API',
      }),
    ]
  },

  /** 前端点击保存之后调用的方法 */
  save: (config: any) => {
    const cfg = unflattenObject(config)
    saveConfig(cfg)
    return {
      success: true,
      message: '保存成功',
    }
  },
})
