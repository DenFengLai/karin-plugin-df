import fetch from 'node-fetch'
import { segment } from 'node-karin'

export const apiHandlers = [
  {
    reg: 'jk(?:制服)?',
    fnc: () => segment.image('https://api.suyanw.cn/api/jk.php')
  },
  {
    reg: '黑丝',
    fnc: () => [
      '唉嗨害，黑丝来咯',
      segment.image('https://api.suyanw.cn/api/hs.php')
    ]
  },
  {
    reg: '白丝',
    fnc: async () => {
      const data = (await (await fetch('https://v2.api-m.com/api/baisi')).json()) as { data: string }
      const link = data.data
        .replace(/\\/g, '/')
      return [
        '白丝来咯~',
        segment.image(link)
      ]
    }
  },
  {
    reg: 'cos',
    fnc: async () => {
      const data = await (await fetch('https://api.suyanw.cn/api/cos.php?type=json')).json() as { text: string }
      const link = data.text.replace(/\\/g, '/')
      return [
        'cos来咯~',
        segment.image(link)
      ]
    }
  },
  {
    reg: '腿子?',
    fnc: async () => {
      const link = (await (await fetch('https://api.suyanw.cn/api/meitui.php')).text())
        .match(/https?:\/\/[^ ]+/)?.[0]
      return [
        '看吧涩批！',
        segment.image(link as string)
      ]
    }
  }
]
