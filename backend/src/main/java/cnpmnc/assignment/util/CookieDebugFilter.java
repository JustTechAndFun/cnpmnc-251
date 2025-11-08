package cnpmnc.assignment.util;

import jakarta.servlet.*;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.Arrays;
import java.util.Collection;

@Component
public class CookieDebugFilter implements Filter {

    private static final Logger logger = LoggerFactory.getLogger(CookieDebugFilter.class);

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {

        HttpServletRequest httpRequest = (HttpServletRequest) request;
        HttpServletResponse httpResponse = (HttpServletResponse) response;

        // Log incoming cookies
        Cookie[] cookies = httpRequest.getCookies();
        if (cookies != null && cookies.length > 0) {
            logger.info("=== Incoming Request to: {} ===", httpRequest.getRequestURI());
            logger.info("Received Cookies:");
            Arrays.stream(cookies).forEach(cookie ->
                    logger.info("  - {}: {} (Domain: {}, Path: {}, Secure: {}, HttpOnly: {})",
                            cookie.getName(),
                            cookie.getValue().substring(0, Math.min(cookie.getValue().length(), 20)) + "...",
                            cookie.getDomain(),
                            cookie.getPath(),
                            cookie.getSecure(),
                            cookie.isHttpOnly())
            );
        }

        // Continue the filter chain
        chain.doFilter(request, response);

        // Log outgoing cookies (Set-Cookie headers)
        Collection<String> setCookieHeaders = httpResponse.getHeaders("Set-Cookie");
        if (!setCookieHeaders.isEmpty()) {
            logger.info("=== Outgoing Response from: {} ===", httpRequest.getRequestURI());
            logger.info("Set-Cookie Headers:");
            setCookieHeaders.forEach(header -> logger.info("  - {}", header));
        }
    }
}
