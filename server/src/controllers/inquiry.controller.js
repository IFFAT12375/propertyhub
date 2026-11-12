import * as inquiryService from '../services/inquiry.service.js'

export async function createInquiry(req, res) {
  const result = await inquiryService.createInquiry({
    user: req.user,
    fields: req.validated.body,
  })

  if (result.verificationRequired) {
    res.status(202).json({
      success: true,
      data: {
        inquiryId: result.inquiry.id,
        verificationStatus: result.inquiry.verificationStatus,
      },
      message: result.emailSent
        ? 'Check your email for a verification link before the inquiry is shared.'
        : 'Email was not sent. The development verification link is available in server logs.',
    })
    return
  }

  res.status(201).json({
    success: true,
    data: {
      inquiryId: result.inquiry.id,
      verificationStatus: result.inquiry.verificationStatus,
    },
  })
}

export async function verifyInquiry(req, res) {
  const inquiry = await inquiryService.verifyInquiry(req.validated.query.token)
  res.status(200).json({
    success: true,
    data: {
      inquiryId: inquiry.id,
      verificationStatus: inquiry.verificationStatus,
    },
    message: 'Your inquiry email has been verified.',
  })
}

export async function listSellerInquiries(req, res) {
  const result = await inquiryService.listSellerInquiries(
    req.user._id,
    req.validated.query,
  )
  res.status(200).json({ success: true, data: result })
}

export async function listMyInquiries(req, res) {
  const result = await inquiryService.listMyInquiries(
    req.user._id,
    req.validated.query,
  )
  res.status(200).json({ success: true, data: result })
}

export async function updateFollowUpStatus(req, res) {
  const inquiry = await inquiryService.updateFollowUpStatus(
    req.validated.params.id,
    req.user._id,
    req.validated.body.followUpStatus,
  )
  res.status(200).json({ success: true, data: { inquiry } })
}
