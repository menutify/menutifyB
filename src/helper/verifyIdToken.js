import { OAuth2Client } from 'google-auth-library'
const client = new OAuth2Client(
  '470881460994-mrovgi9mk8bmr56o4ptbansrlib03ve0.apps.googleusercontent.com'
)
async function verify(token) {
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience:
      '470881460994-mrovgi9mk8bmr56o4ptbansrlib03ve0.apps.googleusercontent.com' // Specify the CLIENT_ID of the app that accesses the backend
    // Or, if multiple clients access the backend:
    //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
  })
  const payload = ticket.getPayload()
  const userid = payload['sub']
  // If the request specified a Google Workspace domain:
  // const domain = payload['hd'];
  return { payload, userid }
}

export default verify
