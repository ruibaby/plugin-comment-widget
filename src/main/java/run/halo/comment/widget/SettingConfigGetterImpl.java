package run.halo.comment.widget;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Mono;
import run.halo.app.plugin.ReactiveSettingFetcher;

@Component
@RequiredArgsConstructor
public class SettingConfigGetterImpl implements SettingConfigGetter {
    private final ReactiveSettingFetcher settingFetcher;

    @Override
    public Mono<BasicConfig> getBasicConfig() {
        return settingFetcher.fetch(BasicConfig.GROUP, BasicConfig.class)
            .defaultIfEmpty(new BasicConfig());
    }

    @Override
    public Mono<AvatarConfig> getAvatarConfig() {
        return settingFetcher.fetch(AvatarConfig.GROUP, AvatarConfig.class)
            .defaultIfEmpty(new AvatarConfig());
    }

    @Override
    public Mono<SecurityConfig> getSecurityConfig() {
        return settingFetcher.fetch(SecurityConfig.GROUP, SecurityConfig.class)
            .defaultIfEmpty(SecurityConfig.empty());
    }
}
