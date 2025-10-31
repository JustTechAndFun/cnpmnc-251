package cnpmnc.assignment.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ApiResponse<T> {
    
    private boolean error;
    private T data;
    private String message;
    
    // Static factory methods for convenience
    public static <T> ApiResponse<T> success(T data, String message) {
        return new ApiResponse<>(false, data, message);
    }
    
    public static <T> ApiResponse<T> success(T data) {
        return new ApiResponse<>(false, data, "Success");
    }
    
    public static <T> ApiResponse<T> error(String message) {
        return new ApiResponse<>(true, null, message);
    }
    
    public static <T> ApiResponse<T> error(T data, String message) {
        return new ApiResponse<>(true, data, message);
    }
}
