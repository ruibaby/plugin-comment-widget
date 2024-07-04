package run.halo.comment.widget;

import lombok.Data;
import lombok.Getter;
import lombok.experimental.Accessors;
import org.springframework.lang.NonNull;
import reactor.core.publisher.Mono;
import run.halo.comment.widget.captcha.CaptchaType;

public interface SettingConfigGetter {

    /**
     * Never {@link Mono#empty()}.
     */
    Mono<BasicConfig> getBasicConfig();

    /**
     * Never {@link Mono#empty()}.
     */
    Mono<AvatarConfig> getAvatarConfig();

    /**
     * Never {@link Mono#empty()}.
     */
    Mono<SecurityConfig> getSecurityConfig();

    @Data
    @Accessors(chain = true)
    class SecurityConfig {
        public static final String GROUP = "security";

        @Getter(onMethod_ = @NonNull)
        private CaptchaConfig captcha = CaptchaConfig.empty();

        public SecurityConfig setCaptcha(CaptchaConfig captcha) {
            this.captcha = (captcha == null ? CaptchaConfig.empty() : captcha);
            return this;
        }

        public static SecurityConfig empty() {
            return new SecurityConfig()
                .setCaptcha(CaptchaConfig.empty());
        }
    }

    @Data
    @Accessors(chain = true)
    class CaptchaConfig {

        private boolean anonymousCommentCaptcha;

        @Getter(onMethod_ = @NonNull)
        private CaptchaType type = CaptchaType.ALPHANUMERIC;

        public CaptchaConfig setType(CaptchaType type) {
            this.type = (type == null ? CaptchaType.ALPHANUMERIC : type);
            return this;
        }

        public static CaptchaConfig empty() {
            return new CaptchaConfig();
        }
    }

    @Data
    class BasicConfig {
        public static final String GROUP = "basic";
        private int size;
        private int replySize;
        private boolean withReplies;
        private int withReplySize;
    }

    @Data
    class AvatarConfig {
        public static final String GROUP = "avatar";
        private boolean enable;
        private String provider;
        private String providerMirror;
        private String policy;
    }
}
