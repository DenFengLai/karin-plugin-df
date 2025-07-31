import { config } from '@/utils'
import fetch from 'node-fetch'
import { hooks, logger } from 'node-karin'
import lodash from 'node-karin/lodash'

let SummaryText: string
let lock: boolean = false

/** 加载外显钩子 */
initSummary()

/** 初始化外显钩子 */
function initSummary () {
  updateSummary()
  hooks.sendMsg.message((_, elements, __, next) => {
    const { switch: isOpen } = config().Summary
    elements.forEach(i => {
      if (!isOpen || i.type !== 'image') return
      i.summary ??= getSummary()
    })
    next()
  })
}

/** 获取一个外显文本 */
function getSummary (): string {
  const { type, textList } = config().Summary
  if (type === 'text') {
    return lodash.sample(textList) || ''
  } else {
    const text = SummaryText
    updateSummary()
    return text
  }
}

/** 更新一言文本缓存 */
async function updateSummary () {
  if (lock) return
  lock = true
  try {
    const { yiyanApi } = config().Summary

    const data = await (await fetch(yiyanApi || 'https://v1.hitokoto.cn/?encode=text')).text()
    if (data) SummaryText = data
  } catch (error) {
    logger.warn('更新一言文本失败:', error)
  } finally {
    lock = false
  }
}
