package run.halo.comment.widget;

import lombok.Data;
import lombok.Getter;
import lombok.experimental.Accessors;
import org.springframework.lang.NonNull;
import reactor.core.publisher.Mono;
import run.halo.comment.widget.captcha.CaptchaType;

public interface SettingConfigGetter {

    Mono<SecurityConfig> getSecurityConfig();

    @Data
    @Accessors(chain = true)
    class SecurityConfig {
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
}
