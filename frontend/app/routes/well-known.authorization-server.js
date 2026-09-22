import { authorizationServerMetadata } from '../../../discovery/service/oauth.js';
import { jsonResponse, originOf } from '../origin.server.js';

export const loader = ({ request }) => jsonResponse(authorizationServerMetadata(originOf(request)));
