import * as adminUserService from '../services/adminUser.service.js'

export async function listUsers(req, res) {
  const result = await adminUserService.listUsers(req.validated.query)
  res.status(200).json({ success: true, data: result })
}

export async function updateSellerAccountStatus(req, res) {
  const user = await adminUserService.updateSellerAccountStatus(
    req.validated.params.id,
    req.validated.body.accountStatus,
  )
  res.status(200).json({ success: true, data: { user } })
}
