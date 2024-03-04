package run.halo.comment.widget;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.pf4j.PluginWrapper;
import org.springframework.stereotype.Component;
import org.springframework.util.PropertyPlaceholderHelper;
import org.springframework.util.Assert;
import org.springframework.util.PropertyPlaceholderHelper;
import org.thymeleaf.context.ITemplateContext;
import org.thymeleaf.model.IAttribute;
import org.thymeleaf.model.IProcessableElementTag;
import org.thymeleaf.processor.element.IElementTagStructureHandler;
import run.halo.app.theme.dialect.CommentWidget;

import java.util.Properties;

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

        return PROPERTY_PLACEHOLDER_HELPER.replacePlaceholders("""
                <div id="${domId}"></div>
                <script src="/plugins/PluginCommentWidget/assets/static/comment-widget.iife.js?version=${version}"></script>
                <link rel="stylesheet" href="/plugins/PluginCommentWidget/assets/static/style.css?version=${version}" />
                <script>
                  CommentWidget.init(
                    "#${domId}",
                    {
                      group: "${group}",
                      kind: "${kind}",
                      name: "${name}"
                    }
                  );
                </script>
                """, properties);
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
