package run.halo.comment.widget.captcha;

import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

public interface CaptchaManager {
    Mono<Boolean> verify(String id, String captchaCode);

    Mono<Void> invalidate(String id);

    Mono<Captcha> generate(ServerWebExchange exchange, CaptchaType type);

    record Captcha(String id, String code, String imageBase64) {
    }
}
