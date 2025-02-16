const jws = require('jws');

/**
 * Transforms the proxy request by decoding the JWT from the cookie or authorization header
 * and setting the `x-rh-identity` header.
 *
 * @param {http.ClientRequest} proxyReq - The outgoing proxy request.
 * @param {object} req - The incoming Express request.
 * @param {object} _res - The Express response (unused).
 * @param {object} options - Options object.
 * @param {object} options.user - User object.
 * @param {object} options.internal - Internal object.
 * @param {object} options.identity - Custom identity properties.
 */
function cookieTransform(proxyReq, req, _res, { user, internal, identity: customIdentity }) {
  const { cookie, authorization } = req.headers;
  const match = (cookie && cookie.match(/id_jwt=([^;]+)/)) ||
                (authorization && authorization.match(/^Bearer (.*)$/));

  if (match) {
    const cs_jwt = match[1];
    const sig = jws.decode(cs_jwt);
    if (!sig) {
      return;
    }
    const payload = sig.payload;

    const identity = {
      identity: {
        type: 'User',
        auth_type: 'basic-auth',
        account_number: '',
        org_id: payload.preferred_username,
        ...customIdentity,
        user: {
          username: payload.preferred_username,
          email: payload.email,
          first_name: payload.name,
          is_active: true,
          is_org_admin: true,
          is_internal: false,
          locale: payload.locale ,
          user_id: payload.preferred_username,
          ...user,
        },
        internal: {
          org_id: payload.preferred_username,
          auth_time: undefined,
          ...internal,
        },
      },
    };

    const identityB64 = Buffer.from(JSON.stringify(identity), 'utf8').toString('base64');
    proxyReq.setHeader('x-rh-identity', identityB64);
  }
}

module.exports = cookieTransform;