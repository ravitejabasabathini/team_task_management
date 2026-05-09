const User = require('../models/User');
const { unauthorized } = require('../utils/errors');
const { verifyToken } = require('../utils/jwt');

async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const [type, token] = header.split(' ');
    if (type !== 'Bearer' || !token) throw unauthorized();

    const payload = verifyToken(token);
    const user = await User.findById(payload.sub).select('_id name email').lean();
    if (!user) throw unauthorized();

    req.user = user;
    next();
  } catch (err) {
    next(err.statusCode ? err : unauthorized());
  }
}

module.exports = { requireAuth };

