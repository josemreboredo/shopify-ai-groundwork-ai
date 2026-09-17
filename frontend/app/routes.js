import { index, route } from '@react-router/dev/routes';

export default [
  index('routes/home.jsx'),
  route('login', 'routes/login.jsx'),
  route('auth/github', 'routes/auth.github.js'),
  route('auth/github/callback', 'routes/auth.github.callback.js'),
  route('logout', 'routes/logout.js'),
  route('engagements/:client', 'routes/engagement.jsx'),
];
