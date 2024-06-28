package run.halo.comment.widget.captcha;

import static org.springframework.security.web.server.util.matcher.ServerWebExchangeMatchers.pathMatchers;

import java.net.URI;
import java.util.Locale;
import java.util.Optional;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.apache.commons.lang3.StringUtils;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.http.converter.json.Jackson2ObjectMapperBuilder;
import org.springframework.http.converter.json.ProblemDetailJacksonMixin;
import org.springframework.lang.NonNull;
import org.springframework.security.config.web.server.SecurityWebFiltersOrder;
import org.springframework.security.web.server.context.ServerSecurityContextRepository;
import org.springframework.security.web.server.util.matcher.OrServerWebExchangeMatcher;
import org.springframework.security.web.server.util.matcher.ServerWebExchangeMatcher;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.server.ServerWebExchange;
import org.springframework.web.server.WebFilterChain;
import reactor.core.publisher.Mono;
import run.halo.app.infra.AnonymousUserConst;
import run.halo.app.security.AdditionalWebFilter;
import run.halo.comment.widget.SettingConfigGetter;

@Component
@RequiredArgsConstructor
public class CommentCaptchaFilter implements AdditionalWebFilter {
    static final String CAPTCHA_INVALID_TYPE = "https://www.halo.run/probs/captcha-invalid";
    static final String CAPTCHA_REQUIRED_TYPE = "https://www.halo.run/probs/captcha-required";
    private final static String CAPTCHA_CODE_HEADER = "X-Captcha-Code";
    private final static String CAPTCHA_REQUIRED_HEADER = "X-Require-Captcha";
    private static final String CONTENT_TYPE = "application/problem+json";

    private final ServerWebExchangeMatcher pathMatcher = createPathMatcher();
    private final ObjectMapper objectMapper = createObjectMapper();

    private final SettingConfigGetter settingConfigGetter;
    private final CaptchaManager captchaManager;
    private final CaptchaCookieResolverImpl captchaCookieResolver;
    private final ServerSecurityContextRepository contextRepository;

    @Override
    @NonNull
    public Mono<Void> filter(@NonNull ServerWebExchange exchange, @NonNull WebFilterChain chain) {
        return pathMatcher.matches(exchange)
            .filter(ServerWebExchangeMatcher.MatchResult::isMatch)
            .flatMap(result -> settingConfigGetter.getSecurityConfig())
            .map(SettingConfigGetter.SecurityConfig::getCaptcha)
            .filterWhen(captchaConfig -> isAnonymousCommenter(exchange))
            .switchIfEmpty(chain.filter(exchange).then(Mono.empty()))
            .flatMap(captchaConfig -> {
                if (!captchaConfig.isAnonymousCommentCaptcha()) {
                    return chain.filter(exchange);
                }
                return validateCaptcha(exchange, chain, captchaConfig);
            });
    }

    private Mono<Void> sendCaptchaRequiredResponse(ServerWebExchange exchange,
                                                   SettingConfigGetter.CaptchaConfig captchaConfig,
                                                   ResponseStatusException e) {
        var type = captchaConfig.getType();
        exchange.getResponse().getHeaders().addIfAbsent(CAPTCHA_REQUIRED_HEADER, "true");
        exchange.getResponse().setStatusCode(HttpStatus.FORBIDDEN);
        return captchaManager.generate(exchange, type)
            .flatMap(captcha -> {
                var problemDetail = toProblemDetail(e);
                problemDetail.setProperty("captcha", captcha.imageBase64());
                var responseData = getResponseData(problemDetail);
                exchange.getResponse().getHeaders().addIfAbsent("Content-Type", CONTENT_TYPE);
                return exchange.getResponse()
                    .writeWith(Mono.just(exchange.getResponse().bufferFactory().wrap(responseData)));
            });
    }

    private byte[] getResponseData(ProblemDetail problemDetail) {
        try {
            return objectMapper.writeValueAsBytes(problemDetail);
        } catch (JsonProcessingException e) {
            throw new RuntimeException(e);
        }
    }

    private Mono<Void> validateCaptcha(ServerWebExchange exchange, WebFilterChain chain,
                                       SettingConfigGetter.CaptchaConfig captchaConfig) {
        var captchaCodeOpt = getCaptchaCode(exchange);
        var cookie = captchaCookieResolver.resolveCookie(exchange);
        if (captchaCodeOpt.isEmpty() || cookie == null) {
            return sendCaptchaRequiredResponse(exchange, captchaConfig, new CaptchaCodeMissingException());
        }
        return captchaManager.verify(cookie.getValue(), captchaCodeOpt.get())
            .flatMap(valid -> {
                if (valid) {
                    captchaCookieResolver.expireCookie(exchange);
                    return chain.filter(exchange);
                }
                return sendCaptchaRequiredResponse(exchange, captchaConfig, new InvalidCaptchaCodeException());
            });
    }

    private static Optional<String> getCaptchaCode(ServerWebExchange exchange) {
        var captchaCode = exchange.getRequest().getHeaders().getFirst(CAPTCHA_CODE_HEADER);
        return Optional.ofNullable(captchaCode)
            .filter(StringUtils::isNotBlank);
    }

    private OrServerWebExchangeMatcher createPathMatcher() {
        var commentMatcher = pathMatchers(HttpMethod.POST, "/apis/api.halo.run/v1alpha1/comments");
        var replyMatcher = pathMatchers(HttpMethod.POST, "/apis/api.halo.run/v1alpha1/comments/{name}/reply");
        return new OrServerWebExchangeMatcher(commentMatcher, replyMatcher);
    }

    static class InvalidCaptchaCodeException extends ResponseStatusException {
        public InvalidCaptchaCodeException() {
            super(HttpStatus.FORBIDDEN, "验证码错误，请重新输入");
            setType(URI.create(CAPTCHA_INVALID_TYPE));
        }
    }

    static class CaptchaCodeMissingException extends ResponseStatusException {
        public CaptchaCodeMissingException() {
            super(HttpStatus.FORBIDDEN, "请先输入验证码");
            setType(URI.create(CAPTCHA_REQUIRED_TYPE));
        }
    }

    ProblemDetail toProblemDetail(ResponseStatusException e) {
        var problemDetail = e.updateAndGetBody(null, Locale.getDefault());
        problemDetail.setTitle("Captcha Verification");
        return problemDetail;
    }

    static ObjectMapper createObjectMapper() {
        return Jackson2ObjectMapperBuilder.json()
            .mixIn(ProblemDetail.class, ProblemDetailJacksonMixin.class)
            .build();
    }

    Mono<Boolean> isAnonymousCommenter(ServerWebExchange exchange) {
        return contextRepository.load(exchange)
            .map(context -> AnonymousUserConst.isAnonymousUser(context.getAuthentication().getName()))
            .defaultIfEmpty(true);
    }

    @Override
    public int getOrder() {
        return SecurityWebFiltersOrder.AUTHORIZATION.getOrder();
    }
}
