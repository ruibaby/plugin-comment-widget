package run.halo.comment.widget.captcha;

import javax.imageio.ImageIO;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.Base64;
import java.util.Random;
import java.util.function.Function;
import lombok.experimental.UtilityClass;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@UtilityClass
public class CaptchaGenerator {
    private static final String CHAR_STRING = "ABCDEFGHJKMNPRSTUVWXYZabcdefghjkmnpqrstuvwxyz0123456789";
    private static final int WIDTH = 120;
    private static final int HEIGHT = 36;
    private static final int CHAR_LENGTH = 4;

    private static final Font customFont;

    static {
        customFont = loadArialFont();
    }

    public static Captcha generateMathCaptcha() {
        return generateCaptchaImage(CaptchaGenerator::drawMathCaptchaText);
    }

    public static Captcha generateSimpleCaptcha() {
        return generateCaptchaImage(CaptchaGenerator::drawSimpleText);
    }

    private static Captcha generateCaptchaImage(Function<Graphics2D, String> drawCaptchaTextFunc) {
        BufferedImage bufferedImage = new BufferedImage(WIDTH, HEIGHT, BufferedImage.TYPE_INT_RGB);
        Graphics2D g2d = bufferedImage.createGraphics();

        // paint white background
        g2d.setColor(Color.WHITE);
        g2d.fillRect(0, 0, WIDTH, HEIGHT);

        g2d.setFont(customFont);

        var captchaText = drawCaptchaTextFunc.apply(g2d);

        // add some noise
        Random random = new Random();
        for (int i = 0; i < 10; i++) {
            g2d.setColor(new Color(random.nextInt(256), random.nextInt(256), random.nextInt(256)));
            int x1 = random.nextInt(WIDTH);
            int y1 = random.nextInt(HEIGHT);
            int x2 = random.nextInt(WIDTH);
            int y2 = random.nextInt(HEIGHT);
            g2d.drawLine(x1, y1, x2, y2);
        }

        g2d.dispose();
        return new Captcha(captchaText, bufferedImage);
    }

    private static String drawMathCaptchaText(Graphics2D g2d) {
        Random random = new Random();
        int num1 = random.nextInt(90) + 1;
        int num2 = random.nextInt(90) + 1;
        char operator = getRandomOperator();

        int result;
        String mathText = switch (operator) {
            case '+' -> {
                result = num1 + num2;
                yield num1 + " + " + num2 + " = ?";
            }
            case '-' -> {
                result = num1 - num2;
                yield num1 + " - " + num2 + " = ?";
            }
            case '*' -> {
                result = num1 * num2;
                yield num1 + " * " + num2 + " = ?";
            }
            default -> throw new IllegalStateException("Unexpected value: " + operator);
        };

        g2d.setColor(Color.BLACK);
        g2d.drawString(mathText, 20, 30);
        return String.valueOf(result);
    }

    public record Captcha(String code, BufferedImage image) {
    }

    private static String drawSimpleText(Graphics2D g2d) {
        var captchaText = generateRandomText();
        Random random = new Random();
        for (int i = 0; i < captchaText.length(); i++) {
            g2d.setColor(new Color(random.nextInt(256), random.nextInt(256), random.nextInt(256)));
            g2d.drawString(String.valueOf(captchaText.charAt(i)), 20 + i * 24, 30);
        }
        return captchaText;
    }

    private static Font loadArialFont() {
        var fontPath = "/fonts/Arial_Bold.ttf";
        try (InputStream is = CaptchaGenerator.class.getResourceAsStream(fontPath)) {
            if (is == null) {
                throw new RuntimeException("Cannot load font file for " + fontPath + ", please check if it exists.");
            }
            return Font.createFont(Font.TRUETYPE_FONT, is).deriveFont(Font.BOLD, 24);
        } catch (FontFormatException | IOException e) {
            log.warn("Failed to load font file for {}, fallback to default font.", fontPath);
            return new Font("Serif", Font.BOLD, 24);
        }
    }

    private static char getRandomOperator() {
        char[] operators = {'+', '-', '*'};
        Random random = new Random();
        return operators[random.nextInt(operators.length)];
    }

    private static String generateRandomText() {
        StringBuilder sb = new StringBuilder(CHAR_LENGTH);
        Random random = new Random();
        for (int i = 0; i < CHAR_LENGTH; i++) {
            sb.append(CHAR_STRING.charAt(random.nextInt(CHAR_STRING.length())));
        }
        return sb.toString();
    }

    public static String encodeToBase64(BufferedImage image) {
        try (ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {
            ImageIO.write(image, "png", outputStream);
            byte[] imageBytes = outputStream.toByteArray();
            return Base64.getEncoder().encodeToString(imageBytes);
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }
}
