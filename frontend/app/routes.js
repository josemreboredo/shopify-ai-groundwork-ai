import { index, route } from '@react-router/dev/routes';

export default [
  index('routes/home.jsx'),
  route('login', 'routes/login.jsx'),
  route('auth/github', 'routes/auth.github.js'),
  route('auth/github/callback', 'routes/auth.github.callback.js'),
  route('logout', 'routes/logout.js'),
  route('engagements/:client', 'routes/engagement.jsx'),
  route('engagements/:client/review', 'routes/engagement.review.jsx'),
  route('engagements/:client/summary', 'routes/engagement.summary.jsx'),
  route('engagements/:client/summary.md', 'routes/engagement.summary-md.js'),
  route('engagements/:client/closing-document', 'routes/engagement.closing.jsx'),
  route('engagements/:client/closing-document.md', 'routes/engagement.closing-md.js'),
  route('engagements/:client/questions/:questionId', 'routes/engagement.question.jsx'),
  route('claude', 'routes/claude.jsx'),
  route('manual', 'routes/manual.jsx'),
  // Claude connector (ADR 0015): MCP endpoint and OAuth
  route('mcp', 'routes/mcp.js'),
  route('.well-known/oauth-authorization-server', 'routes/well-known.authorization-server.js'),
  route('.well-known/oauth-protected-resource', 'routes/well-known.protected-resource.js', { id: 'protected-resource' }),
  route('.well-known/oauth-protected-resource/mcp', 'routes/well-known.protected-resource.js', { id: 'protected-resource-mcp' }),
  route('oauth/authorize', 'routes/oauth.authorize.jsx'),
  route('oauth/token', 'routes/oauth.token.js'),
];
