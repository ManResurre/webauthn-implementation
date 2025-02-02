import { v5 } from 'uuid';
import { Config } from './config';

export const makeUUID = (value: string) => {
  return v5(value, Config.UUID_NAMESPACE);
};
