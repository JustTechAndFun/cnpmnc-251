package cnpmnc.assignment.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;
    
    @Column(nullable = false, unique = true, length = 255)
    private String email;
    
    @Column(unique = true, length = 50)
    private String studentId;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Role role;
    
    @JsonIgnore
    @Column(name = "access_token", length = 2048)
    private String accessToken;
    
    @Column(nullable = false)
    private Boolean activate = false;
}
