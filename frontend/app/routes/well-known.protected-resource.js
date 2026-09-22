import { protectedResourceMetadata } from '../../../ai/shared/oauth.js';
import { jsonResponse, originOf } from '../origin.server.js';

export const loader = ({ request }) => jsonResponse(protectedResourceMetadata(originOf(request)));
