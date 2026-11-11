import * as authService from '../services/auth.service.js'
import { env } from '../config/env.js'

const cookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: 'strict',
  path: '/api/v1/auth',
  maxAge: env.REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000,
}

function sendRefreshCookie(res, token) {
  res.cookie('refreshToken', token, cookieOptions)
}

function clearRefreshCookie(res) {
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: cookieOptions.secure,
    sameSite: cookieOptions.sameSite,
    path: cookieOptions.path,
  })
}

export async function register(req, res) {
  const user = await authService.register(req.validated.body)
  res.status(201).json({ success: true, data: { user } })
}

export async function login(req, res) {
  const result = await authService.login(req.validated.body)
  sendRefreshCookie(res, result.refreshToken)
  res.status(200).json({
    success: true,
    data: { user: result.user, accessToken: result.accessToken },
  })
}

export async function refresh(req, res) {
  const result = await authService.refresh(req.cookies.refreshToken)
  sendRefreshCookie(res, result.refreshToken)
  res.status(200).json({
    success: true,
    data: { user: result.user, accessToken: result.accessToken },
  })
}

export async function logout(req, res) {
  await authService.logout(req.cookies.refreshToken)
  clearRefreshCookie(res)
  res.status(200).json({ success: true, message: 'You have been signed out.' })
}
