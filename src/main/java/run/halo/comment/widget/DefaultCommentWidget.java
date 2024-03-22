package run.halo.comment.widget;

import java.util.Properties;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.pf4j.PluginWrapper;
import org.springframework.stereotype.Component;
import org.springframework.util.Assert;
import org.springframework.util.PropertyPlaceholderHelper;
import org.thymeleaf.context.ITemplateContext;
import org.thymeleaf.model.IAttribute;
import org.thymeleaf.model.IProcessableElementTag;
import org.thymeleaf.processor.element.IElementTagStructureHandler;
import run.halo.app.plugin.SettingFetcher;
import run.halo.app.theme.dialect.CommentWidget;

/**
 * A default implementation of {@link CommentWidget}.
 *
 * @author guqing
 * @since 2.0.0
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class DefaultCommentWidget implements CommentWidget {
    static final PropertyPlaceholderHelper PROPERTY_PLACEHOLDER_HELPER = new PropertyPlaceholderHelper("${", "}");

    private final PluginWrapper pluginWrapper;
    private final SettingFetcher settingFetcher;

    @Override
    public void render(ITemplateContext context,
                       IProcessableElementTag tag,
                       IElementTagStructureHandler structureHandler) {
        IAttribute groupAttribute = tag.getAttribute("group");
        IAttribute kindAttribute = tag.getAttribute("kind");
        IAttribute nameAttribute = tag.getAttribute("name");

        structureHandler.replaceWith(commentHtml(groupAttribute, kindAttribute, nameAttribute),
                false);
    }

    private String commentHtml(IAttribute groupAttribute, IAttribute kindAttribute,
                               IAttribute nameAttribute) {
        if (kindAttribute == null || StringUtils.isBlank(kindAttribute.getValue())) {
            log.warn("Comment widget tag attributes 'kind' is missing.");
            return "<p style=\"color:red\">Comment widget attributes 'kind' is required but missing found.</p>";
        }
        if (nameAttribute == null || StringUtils.isBlank(nameAttribute.getValue())) {
            log.warn("Comment widget tag attributes 'name' is missing.");
            return "<p style=\"color:red\">Comment widget attributes 'name' is required but missing found.</p>";
        }

        String group = getGroup(groupAttribute);

        final Properties properties = new Properties();

        properties.setProperty("version", pluginWrapper.getDescriptor().getVersion());
        properties.setProperty("group", group);
        properties.setProperty("kind", kindAttribute.getValue());
        properties.setProperty("name", nameAttribute.getValue());
        properties.setProperty("domId", domIdFrom(group, kindAttribute.getValue(), nameAttribute.getValue()));

        var basicConfig = settingFetcher.fetch(BasicConfig.GROUP, BasicConfig.class)
                .orElse(new BasicConfig());
        // placeholderHelper only support string, so we need to convert boolean to string
        properties.setProperty("withReplies", String.valueOf(basicConfig.isWithReplies()));
        properties.setProperty("replySize", String.valueOf(basicConfig.getReplySize()));

        return PROPERTY_PLACEHOLDER_HELPER.replacePlaceholders("""
                <div id="${domId}"></div>
                <script>
                  CommentWidget.init(
                    "#${domId}",
                    {
                      group: "${group}",
                      kind: "${kind}",
                      name: "${name}",
                      withReplies: ${withReplies},
                      replySize: ${replySize}
                    }
                  );
                </script>
                """, properties);
    }

    @Data
    static class BasicConfig {
        public static final String GROUP = "basic";
        private boolean withReplies;
        private int replySize;
    }

    private String domIdFrom(String group, String kind, String name) {
        Assert.notNull(name, "The name must not be null.");
        Assert.notNull(kind, "The kind must not be null.");
        String groupKindNameAsDomId = String.join("-", group, kind, name);
        return "comment-" + groupKindNameAsDomId.replaceAll("[^\\-_a-zA-Z0-9\\s]", "-")
                .replaceAll("(-)+", "-");
    }

    private String getGroup(IAttribute groupAttribute) {
        return groupAttribute.getValue() == null ? ""
                : StringUtils.defaultString(groupAttribute.getValue());
    }
}
