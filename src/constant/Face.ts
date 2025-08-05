/** 表情类型 */
export enum FaceCharacter {
  Default = 'default',
  CheshireCat = '柴郡猫',
  Murasame = '丛雨',
  Tanhoiza = '诗歌剧',
  YuzuSoft = '柚子厨',
  XiaoNanLiang = '小南梁',
  Gura = '古拉',
  Nachoneko = '甘城猫猫',
  Long = '龙图',
  ManSui = '满穗',
  Capoo = '猫猫虫',
  Nahida = '纳西妲',
  Kokomi = '心海',
  FuFu = 'fufu',
  ATRI = 'ATRI',
  AyachiNene = '绫地宁宁',
  Taffy = '永雏塔菲',
  Miku = 'miku',
  Theresia = '特蕾西娅',
  Doro = 'doro',
  Mita = '米塔',
  FuyukawaKagari = '冬川花璃',
  Neuro = 'neuro',
  Kipfel = 'kipfel',
  Mygo = 'mygo',
  Cat = '猫猫收藏家'
}

/** 表情类型列表 */
export const FaceList = Object.values(FaceCharacter)

/**
 * 获取表情类型名称
 * @param input 表情类型的编号或名称
 * @returns 对应的表情类型名称或 undefined
 */
export function getFaceName (input: number | string): FaceCharacter | undefined {
  if (typeof input === 'number') {
    return FaceList[input] as FaceCharacter
  }

  if (input in FaceCharacter) {
    return (FaceCharacter as any)[input] as FaceCharacter
  }

  if (Object.values(FaceCharacter).includes(input as FaceCharacter)) {
    return input as FaceCharacter
  }

  return undefined
}

export function FaceArrayToName (arr: Array<FaceCharacter | string>): Array<string> {
  return arr.map(i => {
    const name = getFaceName(i)
    return name || ''
  })
}
