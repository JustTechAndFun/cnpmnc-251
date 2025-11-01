package cnpmnc.assignment.controller;

import cnpmnc.assignment.dto.ApiResponse;
import cnpmnc.assignment.dto.ClassDto;
import cnpmnc.assignment.dto.CreateClassRequest;
import cnpmnc.assignment.dto.UserDto;
import cnpmnc.assignment.model.User;
import cnpmnc.assignment.repository.UserRepository;
import cnpmnc.assignment.service.ClassService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@Tag(name = "Admin", description = "Admin management endpoints")
public class AdminController {

    private final UserRepository userRepository;
    private final ClassService classService;

    @GetMapping("/users")
    @PreAuthorize("hasAuthority('ADMIN')")
    @Operation(summary = "Get all users with filters", 
               description = "Retrieve users with optional filters: mail (search by email) and activate (filter by activation status)")
    @SecurityRequirement(name = "cookieAuth")
    public ApiResponse<List<UserDto>> getAllUsers(
            @Parameter(description = "Search by email (partial match, case-insensitive)")
            @RequestParam(required = false) String mail,
            @Parameter(description = "Filter by activation status (true/false)")
            @RequestParam(required = false) Boolean activate) {
        
        List<User> users;
        
        // If no filters provided, get all users
        if (mail == null && activate == null) {
            users = userRepository.findAll();
        } else {
            // Apply filters
            users = userRepository.findByFilters(mail, activate);
        }
        
        List<UserDto> userDtos = users.stream()
                .map(UserDto::fromUser)
                .collect(Collectors.toList());
        return ApiResponse.success(userDtos, "Users retrieved successfully");
    }
    
    @PostMapping("/classes")
    @PreAuthorize("hasAuthority('ADMIN')")
    @Operation(summary = "Create a new class", description = "Admin creates a new class and assigns it to a teacher")
    @SecurityRequirement(name = "cookieAuth")
    public ResponseEntity<ApiResponse<ClassDto>> createClass(@Valid @RequestBody CreateClassRequest request) {
        try {
            ClassDto classDto = classService.createClass(request);
            return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(classDto, "Class created successfully"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error(e.getMessage()));
        }
    }
    
    @GetMapping("/classes")
    @PreAuthorize("hasAuthority('ADMIN')")
    @Operation(summary = "Get all classes", description = "Retrieve all classes in the system")
    @SecurityRequirement(name = "cookieAuth")
    public ResponseEntity<ApiResponse<List<ClassDto>>> getAllClasses() {
        List<ClassDto> classes = classService.getAllClasses();
        return ResponseEntity.ok(ApiResponse.success(classes, "Classes retrieved successfully"));
    }
    
    @DeleteMapping("/classes/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    @Operation(summary = "Delete a class", description = "Admin deletes a class from the system")
    @SecurityRequirement(name = "cookieAuth")
    public ResponseEntity<ApiResponse<Void>> deleteClass(
            @Parameter(description = "Class ID") @PathVariable String id) {
        try {
            classService.deleteClass(id);
            return ResponseEntity.ok(ApiResponse.success(null, "Class deleted successfully"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ApiResponse.error(e.getMessage()));
        }
    }
}
