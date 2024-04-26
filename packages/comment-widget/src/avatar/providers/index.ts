import Gravatar from './gravatar';
import AvatarProvider from './avatar-provider';

let avatarProvider: AvatarProvider | undefined;

enum AvatarProviderEnum {
  GRAVATAR = 'gravatar',
}

export function setAvatarProvider(provider: string, mirrorUrl?: string) {
  switch (provider) {
    case AvatarProviderEnum.GRAVATAR:
      if (mirrorUrl) {
        Gravatar.url = mirrorUrl;
      }
      avatarProvider = Gravatar;
      break;
    default:
  }
}

export function getAvatarProvider() {
  return avatarProvider;
}
