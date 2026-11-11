import * as userService from '../services/user.service.js'

export function getCurrentUser(req, res) {
  res.status(200).json({
    success: true,
    data: { user: userService.getCurrentUser(req.user) },
  })
}

export async function updateCurrentUser(req, res) {
  const user = await userService.updateCurrentUser(req.user, req.validated.body)
  res.status(200).json({ success: true, data: { user } })
}
