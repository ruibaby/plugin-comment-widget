import { User } from '@halo-dev/api-client';
import { createContext } from '@lit/context';
import { ToastManager } from '../lit-toast';

export const baseUrlContext = createContext<string>(Symbol('baseUrl'));
export const kindContext = createContext<string>(Symbol('kind'));
export const groupContext = createContext<string>(Symbol('group'));
export const nameContext = createContext<string>(Symbol('name'));
export const versionContext = createContext<string>(Symbol('version'));
export const withRepliesContext = createContext<boolean>(Symbol('withReplies'));
export const replySizeContext = createContext<number>(Symbol('replySize'));

export const allowAnonymousCommentsContext = createContext<boolean>(
  Symbol('allowAnonymousComments')
);

export const currentUserContext = createContext<User | undefined>(Symbol('currentUser'));

export const emojiDataUrlContext = createContext<string>(Symbol('emojiDataUrl'));

export const toastContext = createContext<ToastManager | undefined>(Symbol('toastContext'));
