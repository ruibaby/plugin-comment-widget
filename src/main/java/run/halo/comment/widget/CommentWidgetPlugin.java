package run.halo.comment.widget;

import org.springframework.stereotype.Component;
import run.halo.app.plugin.BasePlugin;
import run.halo.app.plugin.PluginContext;

/**
 * @author ryanwang
 * @since 2.0.0
 */
@Component
public class CommentWidgetPlugin extends BasePlugin {
    public CommentWidgetPlugin(PluginContext pluginContext) {
        super(pluginContext);
    }
}
