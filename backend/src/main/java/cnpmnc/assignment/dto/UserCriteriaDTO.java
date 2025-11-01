package cnpmnc.assignment.dto;


import lombok.Getter;
import lombok.Setter;

import java.util.Optional;

@Getter
@Setter
public class UserCriteriaDTO {
    private Optional<String> email;
    private Optional<Boolean> active;
}
