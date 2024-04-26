package run.halo.comment.widget;

import org.pf4j.PluginWrapper;
import org.springframework.stereotype.Component;
import run.halo.app.plugin.BasePlugin;

/**
 * @author ryanwang
 * @since 2.0.0
 */
@Component
public class CommentWidgetPlugin extends BasePlugin {
    public CommentWidgetPlugin(PluginWrapper wrapper) {
        super(wrapper);
    }

    @Override
    public void start() {
    }

    @Override
    public void stop() {
    }
}
