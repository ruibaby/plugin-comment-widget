package run.halo.comment.widget.captcha;

import java.time.Duration;
import lombok.Getter;
import org.springframework.http.HttpCookie;
import org.springframework.http.ResponseCookie;
import org.springframework.lang.Nullable;
import org.springframework.stereotype.Component;
import org.springframework.util.Assert;
import org.springframework.web.server.ServerWebExchange;

@Getter
@Component
public class CaptchaCookieResolverImpl implements CaptchaCookieResolver {
    public static final String CAPTCHA_COOKIE_KEY = "comment-widget-captcha";

    private final String cookieName = CAPTCHA_COOKIE_KEY;

    private final Duration cookieMaxAge = Duration.ofHours(1);

    @Override
    @Nullable
    public HttpCookie resolveCookie(ServerWebExchange exchange) {
        return exchange.getRequest().getCookies().getFirst(getCookieName());
    }

    @Override
    public void setCookie(ServerWebExchange exchange, String value) {
        Assert.notNull(value, "'value' is required");
        exchange.getResponse().getCookies()
            .set(getCookieName(), initCookie(exchange, value).build());
    }

    @Override
    public void expireCookie(ServerWebExchange exchange) {
        ResponseCookie cookie = initCookie(exchange, "").maxAge(0).build();
        exchange.getResponse().getCookies().set(this.cookieName, cookie);
    }

    private ResponseCookie.ResponseCookieBuilder initCookie(ServerWebExchange exchange,
                                                            String value) {
        return ResponseCookie.from(this.cookieName, value)
            .path(exchange.getRequest().getPath().contextPath().value() + "/")
            .maxAge(getCookieMaxAge())
            .httpOnly(true)
            .secure("https".equalsIgnoreCase(exchange.getRequest().getURI().getScheme()))
            .sameSite("Lax");
    }
}
