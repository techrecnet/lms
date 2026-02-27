import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { AuthUser } from '../../shared/types/domain'
import { decodeJwt } from '../../core/jwt'
import { api } from '../../core/api'

type AuthState = {
  user: AuthUser | null
  token: string | null
}

const allowedRoles = ["admin", "user", "mentor"] as const;
type AllowedRole = typeof allowedRoles[number];
function isAllowedRole(role: any): role is AllowedRole {
  return allowedRoles.includes(role);
}

const token = localStorage.getItem('accessToken')
const payload = token ? decodeJwt(token) : null
const initialState: AuthState = {
  user:
    payload?.id && isAllowedRole(payload?.role)
      ? { id: payload.id, role: payload.role }
      : null,
  token: token ?? null
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setToken: (state, action: PayloadAction<string>) => {
      const t = action.payload
      const p = decodeJwt(t)
      state.token = t
      localStorage.setItem('accessToken', t)
      state.user = p?.id && isAllowedRole(p?.role) ? { id: p.id, role: p.role } : null
    },
    setUser: (state, action: PayloadAction<AuthUser>) => {
      state.user = action.payload
    },
    logout: (state) => {
      state.user = null
      state.token = null
      localStorage.removeItem('accessToken')
      localStorage.removeItem('activeInstituteId')
    }
  }
})

export const { setToken, setUser, logout } = authSlice.actions
export default authSlice.reducer

// Thunk to fetch and set user profile
export const fetchUserProfile = () => async (dispatch: any) => {
  try {
    const res = await api.get('/users/me')
    const user = res.data
    dispatch(setUser({
      id: user._id,
      role: user.role,
      name: user.name,
      email: user.email,
      studentImage: user.studentImage
    }))
  } catch (err) {
    console.error('Failed to fetch user profile', err)
  }
}
