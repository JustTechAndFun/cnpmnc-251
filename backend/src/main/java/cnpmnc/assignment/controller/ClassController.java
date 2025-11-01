package cnpmnc.assignment.controller;

import cnpmnc.assignment.dto.AddStudentRequest;
import cnpmnc.assignment.dto.ApiResponse;
import cnpmnc.assignment.dto.ClassDto;
import cnpmnc.assignment.dto.StudentDto;
import cnpmnc.assignment.model.User;
import cnpmnc.assignment.service.ClassService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/classes")
@RequiredArgsConstructor
@Tag(name = "Class Management", description = "APIs for managing classes")
public class ClassController {
    
    private final ClassService classService;
    
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'TEACHER')")
    @Operation(summary = "Get class information", description = "Retrieve detailed information about a class. Teacher can only access their own classes.")
    @SecurityRequirement(name = "cookieAuth")
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Class information retrieved successfully"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Not authorized to access this class"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Class not found")
    })
    public ResponseEntity<ApiResponse<ClassDto>> getClassInfo(
            @Parameter(description = "Class ID") @PathVariable String id,
            HttpSession session) {
        
        User currentUser = (User) session.getAttribute("user");
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(ApiResponse.error("User not authenticated"));
        }
        
        try {
            ClassDto classDto = classService.getClassInfo(id, currentUser);
            return ResponseEntity.ok(ApiResponse.success(classDto, "Class information retrieved successfully"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ApiResponse.error(e.getMessage()));
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(ApiResponse.error(e.getMessage()));
        }
    }
    
    @GetMapping("/{id}/students")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'TEACHER')")
    @Operation(summary = "Get students in a class", description = "Retrieve list of all students enrolled in a class. Teacher can only access their own classes.")
    @SecurityRequirement(name = "cookieAuth")
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Student list retrieved successfully"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Not authorized to access this class"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Class not found")
    })
    public ResponseEntity<ApiResponse<List<StudentDto>>> getClassStudents(
            @Parameter(description = "Class ID") @PathVariable String id,
            HttpSession session) {
        
        User currentUser = (User) session.getAttribute("user");
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(ApiResponse.error("User not authenticated"));
        }
        
        try {
            List<StudentDto> students = classService.getClassStudents(id, currentUser);
            return ResponseEntity.ok(ApiResponse.success(students, "Students retrieved successfully"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ApiResponse.error(e.getMessage()));
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(ApiResponse.error(e.getMessage()));
        }
    }
    
    @PostMapping("/{id}/students")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'TEACHER')")
    @Operation(summary = "Add student to class", description = "Add a student to a class by email or studentId. Teacher can only manage their own classes.")
    @SecurityRequirement(name = "cookieAuth")
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "201", description = "Student added successfully"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid request or student already in class"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Not authorized to manage this class"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Class or student not found")
    })
    public ResponseEntity<ApiResponse<StudentDto>> addStudentToClass(
            @Parameter(description = "Class ID") @PathVariable String id,
            @RequestBody AddStudentRequest request,
            HttpSession session) {
        
        User currentUser = (User) session.getAttribute("user");
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(ApiResponse.error("User not authenticated"));
        }
        
        try {
            StudentDto student = classService.addStudentToClass(id, request, currentUser);
            return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(student, "Student added to class successfully"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error(e.getMessage()));
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(ApiResponse.error(e.getMessage()));
        }
    }
    
    @GetMapping("/my-classes")
    @PreAuthorize("hasAnyAuthority('TEACHER')")
    @Operation(summary = "Get teacher's classes", description = "Retrieve all classes assigned to the current teacher")
    @SecurityRequirement(name = "cookieAuth")
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Classes retrieved successfully")
    })
    public ResponseEntity<ApiResponse<List<ClassDto>>> getMyClasses(HttpSession session) {
        User currentUser = (User) session.getAttribute("user");
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(ApiResponse.error("User not authenticated"));
        }
        
        List<ClassDto> classes = classService.getTeacherClasses(currentUser);
        return ResponseEntity.ok(ApiResponse.success(classes, "Classes retrieved successfully"));
    }
}
