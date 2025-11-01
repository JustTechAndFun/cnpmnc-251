package cnpmnc.assignment.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Assignment Management API")
                        .version("1.0.0")
                        .description("API for managing assignments with role-based access control. " +
                                "Some endpoints require authentication via session cookie (JSESSIONID)."))
                .components(new Components()
                        .addSecuritySchemes("cookieAuth", new SecurityScheme()
                                .type(SecurityScheme.Type.APIKEY)
                                .in(SecurityScheme.In.COOKIE)
                                .name("JSESSIONID")
                                .description("Session-based authentication. Login via /api/auth/google/callback to get session cookie.")));
                // Security is optional - each endpoint specifies if authentication is required
    }
}
