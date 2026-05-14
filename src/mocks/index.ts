import { authHandlers } from './handlers/auth';
import { citizenHandlers } from './handlers/citizen';
import { shopHandlers } from './handlers/shop';
import { wpaHandlers } from './handlers/wpa';

export const handlers = [
  ...authHandlers,
  ...citizenHandlers,
  ...shopHandlers,
  ...wpaHandlers,
];
