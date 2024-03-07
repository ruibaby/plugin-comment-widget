package run.halo.comment.widget;

import lombok.RequiredArgsConstructor;
import org.pf4j.PluginWrapper;
import org.springframework.stereotype.Component;
import org.springframework.util.PropertyPlaceholderHelper;
import org.thymeleaf.context.ITemplateContext;
import org.thymeleaf.model.IModel;
import org.thymeleaf.model.IModelFactory;
import org.thymeleaf.processor.element.IElementModelStructureHandler;
import reactor.core.publisher.Mono;
import run.halo.app.theme.dialect.TemplateHeadProcessor;

import java.util.Properties;

@Component
@RequiredArgsConstructor
public class CommentWidgetHeadProcessor implements TemplateHeadProcessor {

    static final PropertyPlaceholderHelper PROPERTY_PLACEHOLDER_HELPER = new PropertyPlaceholderHelper("${", "}");

    private final PluginWrapper pluginWrapper;

    @Override
    public Mono<Void> process(ITemplateContext context, IModel model,
                              IElementModelStructureHandler structureHandler) {
        final IModelFactory modelFactory = context.getModelFactory();
        model.add(modelFactory.createText(commentWidgetScript()));
        return Mono.empty();
    }

    private String commentWidgetScript() {

        final Properties properties = new Properties();
        properties.setProperty("version", pluginWrapper.getDescriptor().getVersion());

        return PROPERTY_PLACEHOLDER_HELPER.replacePlaceholders("""
                <!-- plugin-comment-widget start -->
                <script src="/plugins/PluginCommentWidget/assets/static/comment-widget.iife.js?version=${version}"></script>
                <link rel="stylesheet" href="/plugins/PluginCommentWidget/assets/static/style.css?version=${version}" />
                <!-- plugin-comment-widget end -->
                """, properties);
    }
}
