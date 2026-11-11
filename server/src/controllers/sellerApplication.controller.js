import * as sellerApplicationService from '../services/sellerApplication.service.js'

export async function createApplication(req, res) {
  const application = await sellerApplicationService.createApplication(
    req.user,
    req.validated.body,
  )
  res.status(201).json({ success: true, data: { application } })
}

export async function listMyApplications(req, res) {
  const result = await sellerApplicationService.listMyApplications(
    req.user._id,
    req.validated.query,
  )
  res.status(200).json({ success: true, data: result })
}

export async function listApplications(req, res) {
  const result = await sellerApplicationService.listApplications(req.validated.query)
  res.status(200).json({ success: true, data: result })
}

export async function reviewApplication(req, res) {
  const application = await sellerApplicationService.reviewApplication(
    req.validated.params.id,
    req.user._id,
    req.validated.body,
  )
  res.status(200).json({ success: true, data: { application } })
}
