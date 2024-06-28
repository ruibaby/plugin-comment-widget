package run.halo.comment.widget;

import static run.halo.app.extension.index.query.QueryFactory.equal;

import java.util.function.Function;
import com.google.common.cache.Cache;
import com.google.common.cache.CacheBuilder;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Mono;
import run.halo.app.extension.ConfigMap;
import run.halo.app.extension.DefaultExtensionMatcher;
import run.halo.app.extension.ExtensionClient;
import run.halo.app.extension.controller.Controller;
import run.halo.app.extension.controller.ControllerBuilder;
import run.halo.app.extension.controller.Reconciler;
import run.halo.app.extension.router.selector.FieldSelector;
import run.halo.app.plugin.ReactiveSettingFetcher;

@Component
@RequiredArgsConstructor
public class SettingConfigGetterImpl implements SettingConfigGetter {
    private final ReactiveSettingFetcher settingFetcher;
    private final SettingConfigCache settingConfigCache;

    @Override
    public Mono<SecurityConfig> getSecurityConfig() {
        return settingConfigCache.get("security",
            key -> settingFetcher.fetch("security", SecurityConfig.class)
                .defaultIfEmpty(SecurityConfig.empty())
        );
    }

    interface SettingConfigCache {
        <T> Mono<T> get(String key, Function<String, Mono<T>> loader);
    }

    @Component
    @RequiredArgsConstructor
    static class SettingConfigCacheImpl implements Reconciler<Reconciler.Request>, SettingConfigCache {
        private static final String CONFIG_NAME = "plugin-comment-widget-configmap";

        private final Cache<String, Object> cache = CacheBuilder.newBuilder()
            .maximumSize(10)
            .build();

        private final ExtensionClient client;

        @SuppressWarnings("unchecked")
        public <T> Mono<T> get(String key, Function<String, Mono<T>> loader) {
            return Mono.justOrEmpty(cache.getIfPresent(key))
                .switchIfEmpty(loader.apply(key).doOnNext(value -> cache.put(key, value)))
                .map(object -> (T) object);
        }

        @Override
        public Result reconcile(Request request) {
            cache.invalidateAll();
            return Result.doNotRetry();
        }

        @Override
        public Controller setupWith(ControllerBuilder builder) {
            var extension = new ConfigMap();
            var extensionMatcher = DefaultExtensionMatcher.builder(client, extension.groupVersionKind())
                .fieldSelector(FieldSelector.of(equal("metadata.name", CONFIG_NAME)))
                .build();
            return builder
                .extension(extension)
                .syncAllOnStart(false)
                .onAddMatcher(extensionMatcher)
                .onUpdateMatcher(extensionMatcher)
                .build();
        }
    }
}
