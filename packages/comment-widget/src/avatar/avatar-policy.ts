import { CommentVo, ReplyVo } from '@halo-dev/api-client';
import { getAvatarProvider } from './providers';

abstract class AvatarPolicy {
  abstract applyCommentPolicy(comment: CommentVo | undefined): string | undefined;
  abstract applyReplyPolicy(reply: ReplyVo | undefined): string | undefined;
}

let policyInstance: AvatarPolicy | undefined;
const emailKind = 'Email';
const emailHash = 'email-hash';

class AnonymousUserPolicy extends AvatarPolicy {
  applyCommentPolicy(comment: CommentVo | undefined): string | undefined {
    const avatarProvider = getAvatarProvider();
    const isAnonymous = comment?.owner.kind === emailKind;
    if (isAnonymous) {
      return avatarProvider?.getAvatarSrc(comment?.spec.owner.annotations?.[emailHash]);
    }
    return comment?.owner.avatar;
  }
  applyReplyPolicy(reply: ReplyVo | undefined): string | undefined {
    const avatarProvider = getAvatarProvider();
    const isAnonymous = reply?.owner.kind === emailKind;
    if (isAnonymous) {
      return avatarProvider?.getAvatarSrc(reply?.spec.owner.annotations?.[emailHash]);
    }
    return reply?.owner.avatar;
  }
}

class AllUserPolicy extends AvatarPolicy {
  applyCommentPolicy(comment: CommentVo | undefined): string | undefined {
    const avatarProvider = getAvatarProvider();
    return avatarProvider?.getAvatarSrc(comment?.spec.owner.annotations?.[emailHash]);
  }
  applyReplyPolicy(reply: ReplyVo | undefined): string | undefined {
    const avatarProvider = getAvatarProvider();
    return avatarProvider?.getAvatarSrc(reply?.spec.owner.annotations?.[emailHash]);
  }
}

class NoAvatarUserPolicy extends AvatarPolicy {
  applyCommentPolicy(comment: CommentVo | undefined): string | undefined {
    const avatarProvider = getAvatarProvider();
    const isAnonymous = comment?.owner.kind === emailKind;
    const avatar = comment?.owner.avatar;
    if (isAnonymous || !avatar) {
      return avatarProvider?.getAvatarSrc(comment?.spec.owner.annotations?.[emailHash]);
    }
    return avatar;
  }
  applyReplyPolicy(reply: ReplyVo | undefined): string | undefined {
    const avatarProvider = getAvatarProvider();
    const isAnonymous = reply?.owner.kind === emailKind;
    const avatar = reply?.owner.avatar;
    if (isAnonymous || !avatar) {
      return avatarProvider?.getAvatarSrc(reply?.spec.owner.annotations?.[emailHash]);
    }
    return avatar;
  }
}

enum AvatarPolicyEnum {
  ANONYMOUS_USER_POLICY = 'anonymousUser',
  ALL_USER_POLICY = 'allUser',
  NO_AVATAR_USER_POLICY = 'noAvatarUser',
}

function setPolicyInstance(nPolicyInstance: AvatarPolicy | undefined) {
  policyInstance = nPolicyInstance;
}

function getPolicyInstance(): AvatarPolicy | undefined {
  return policyInstance;
}

export {
  AnonymousUserPolicy,
  AllUserPolicy,
  NoAvatarUserPolicy,
  AvatarPolicyEnum,
  setPolicyInstance,
  getPolicyInstance,
};
