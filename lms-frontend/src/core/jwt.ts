export type JwtPayload = { id?: string; role?: string; exp?: number; [k: string]: any }

export function decodeJwt(token: string): JwtPayload | null {
  try {
    const part = token.split('.')[1]
    const json = atob(part)
    return JSON.parse(json)
  } catch {
    return null
  }
}

export function isJwtExpired(payload: JwtPayload | null): boolean {
  if (!payload?.exp) return false
  return Date.now() >= payload.exp * 1000
}
