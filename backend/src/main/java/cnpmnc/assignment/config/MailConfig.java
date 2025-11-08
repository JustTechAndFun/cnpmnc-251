package cnpmnc.assignment.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;
import org.springframework.mail.MailException;
import org.springframework.mail.MailSender;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSenderImpl;

import java.util.Properties;

@Configuration
public class MailConfig {

    private static final Logger logger = LoggerFactory.getLogger(MailConfig.class);

    @Bean
    public MailSender mailSender(Environment env) {
        String host = env.getProperty("spring.mail.host", "");
        if (host == null || host.isBlank()) {
            // Provide a no-op MailSender that logs messages so application can start in dev without mail config
            logger.info("No spring.mail.host configured - using NoOp MailSender");
            return new MailSender() {
                @Override
                public void send(SimpleMailMessage simpleMessage) throws MailException {
                    logger.info("[NoOp MailSender] send to={} subject={} text={}",
                            simpleMessage.getTo(), simpleMessage.getSubject(), simpleMessage.getText());
                }

                @Override
                public void send(SimpleMailMessage... simpleMessages) throws MailException {
                    for (SimpleMailMessage m : simpleMessages) {
                        send(m);
                    }
                }
            };
        }

        JavaMailSenderImpl impl = new JavaMailSenderImpl();
        impl.setHost(host);
        impl.setPort(Integer.parseInt(env.getProperty("spring.mail.port", "25")));
        impl.setUsername(env.getProperty("spring.mail.username"));
        impl.setPassword(env.getProperty("spring.mail.password"));

        Properties props = new Properties();
        props.put("mail.transport.protocol", env.getProperty("spring.mail.protocol", "smtp"));
        props.put("mail.smtp.auth", env.getProperty("spring.mail.properties.mail.smtp.auth", "false"));
        props.put("mail.smtp.starttls.enable", env.getProperty("spring.mail.properties.mail.smtp.starttls.enable", "false"));
        props.put("mail.debug", env.getProperty("spring.mail.properties.mail.debug", "false"));
        impl.setJavaMailProperties(props);

        logger.info("Configured JavaMailSender with host={}", host);
        return impl;
    }
}
