import { protectedResourceMetadata } from '../../../discovery/service/oauth.js';
import { jsonResponse, originOf } from '../origin.server.js';

export const loader = ({ request }) => jsonResponse(protectedResourceMetadata(originOf(request)));
