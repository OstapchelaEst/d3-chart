export interface IAddTrade {
  id: string
  openTime: number
  closeTime: number
  price: number
  type: 'UP' | 'DOWN' //TradeType
  amount: number
}

export interface IShowResult {
  id: string
  type: 'UP' | 'DOWN' //TradeType
  reward: number
  price: number
}

export interface TradeOptions {
  buyColor: string
  sellColor: string
  flagColor: string
  width: number
}

export interface ResultOptions {
  buyColor: string
  sellColor: string
  width: number
}
