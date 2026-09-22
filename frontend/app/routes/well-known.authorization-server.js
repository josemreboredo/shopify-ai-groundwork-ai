import { authorizationServerMetadata } from '../../../ai/shared/oauth.js';
import { jsonResponse, originOf } from '../origin.server.js';

export const loader = ({ request }) => jsonResponse(authorizationServerMetadata(originOf(request)));
