package run.halo.comment.widget.captcha;

import java.awt.image.BufferedImage;
import java.util.UUID;
import java.util.concurrent.TimeUnit;
import com.google.common.cache.Cache;
import com.google.common.cache.CacheBuilder;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;

@Component
@RequiredArgsConstructor
public class CaptchaManagerImpl implements CaptchaManager {
    public static final long CODE_EXPIRATION_MINUTES = 1;

    private final Cache<String, Captcha> captchaCache =
        CacheBuilder.newBuilder()
            .expireAfterWrite(CODE_EXPIRATION_MINUTES, TimeUnit.MINUTES)
            .maximumSize(100)
            .build();

    private final CaptchaCookieResolver captchaCookieResolver;

    @Override
    public Mono<Boolean> verify(String key, String captchaCode) {
        return Mono.justOrEmpty(captchaCache.getIfPresent(key))
            .filter(captcha -> captcha.code().equalsIgnoreCase(captchaCode))
            .hasElement();
    }

    @Override
    public Mono<Void> invalidate(String id) {
        captchaCache.invalidate(id);
        return Mono.empty();
    }

    @Override
    public Mono<Captcha> generate(ServerWebExchange exchange, CaptchaType type) {
        return doGenerate(type)
            .doOnNext(captcha -> captchaCookieResolver.setCookie(exchange, captcha.id()));
    }

    private Mono<Captcha> doGenerate(CaptchaType type) {
        return Mono.fromSupplier(() -> {
                var captcha = switch (type) {
                    case ALPHANUMERIC -> CaptchaGenerator.generateSimpleCaptcha();
                    case ARITHMETIC -> CaptchaGenerator.generateMathCaptcha();
                };
                var imageBase64 = encodeBufferedImageToDataUri(captcha.image());
                var id = UUID.randomUUID().toString();
                return new Captcha(id, captcha.code(), imageBase64);
            })
            .subscribeOn(Schedulers.boundedElastic())
            .doOnNext(captcha -> captchaCache.put(captcha.id(), captcha));
    }

    private static String encodeBufferedImageToDataUri(BufferedImage image) {
        var imageBase64 = CaptchaGenerator.encodeToBase64(image);
        return "data:image/png;base64," + imageBase64;
    }
}
