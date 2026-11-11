import authenticate from './authenticate.js'

export default function optionalAuthenticate(req, res, next) {
  if (!req.get('authorization')) {
    next()
    return
  }
  return authenticate(req, res, next)
}
