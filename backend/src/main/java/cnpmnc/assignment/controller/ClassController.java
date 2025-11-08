package cnpmnc.assignment.controller;

import cnpmnc.assignment.dto.AddStudentRequest;
import cnpmnc.assignment.dto.ApiResponse;
import cnpmnc.assignment.dto.ClassDto;
import cnpmnc.assignment.dto.StudentDto;
import cnpmnc.assignment.dto.CreateClassRequestDTO;
import cnpmnc.assignment.dto.JoinClassRequest;
import cnpmnc.assignment.model.User;
import cnpmnc.assignment.service.ClassService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
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
            @jakarta.validation.Valid @RequestBody AddStudentRequest request,
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
    @PreAuthorize("hasAnyAuthority('TEACHER', 'STUDENT')")
    @Operation(summary = "Get my classes", description = "Retrieve all classes - for teachers: classes they teach, for students: classes they enrolled in")
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
        
        List<ClassDto> classes = classService.getMyClasses(currentUser);
        return ResponseEntity.ok(ApiResponse.success(classes, "Classes retrieved successfully"));
    }
    
    @PostMapping
    @PreAuthorize("hasAnyAuthority('TEACHER')")
    @Operation(summary = "Create a new class", description = "Teacher creates a new class for themselves")
    @SecurityRequirement(name = "cookieAuth")
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "201", description = "Class created successfully"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid request or class code already exists")
    })
    public ResponseEntity<ApiResponse<ClassDto>> createClass(
            @Valid @RequestBody CreateClassRequestDTO request,
            HttpSession session) {
        
        User currentUser = (User) session.getAttribute("user");
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(ApiResponse.error("User not authenticated"));
        }
        
        try {
            ClassDto classDto = classService.createClassForTeacher(request, currentUser);
            return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(classDto, "Class created successfully"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error(e.getMessage()));
        }
    }
    
    @PostMapping("/join")
    @PreAuthorize("hasAnyAuthority('STUDENT')")
    @Operation(summary = "Join a class by class code", description = "Student joins a class using class code")
    @SecurityRequirement(name = "cookieAuth")
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Joined class successfully"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid class code or already enrolled"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Class not found")
    })
    public ResponseEntity<ApiResponse<ClassDto>> joinClass(
            @Valid @RequestBody JoinClassRequest request,
            HttpSession session) {
        
        User currentUser = (User) session.getAttribute("user");
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(ApiResponse.error("User not authenticated"));
        }
        
        try {
            ClassDto classDto = classService.joinClassByCode(request.getClassCode(), currentUser);
            return ResponseEntity.ok(ApiResponse.success(classDto, "Joined class successfully"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error(e.getMessage()));
        }
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('TEACHER')")
    @Operation(summary = "Update class information", description = "Teacher updates their own class information")
    @SecurityRequirement(name = "cookieAuth")
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Class updated successfully"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Not authorized to update this class"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Class not found")
    })
    public ResponseEntity<ApiResponse<ClassDto>> updateClass(
            @Parameter(description = "Class ID") @PathVariable String id,
            @Valid @RequestBody CreateClassRequestDTO request,
            HttpSession session) {
        
        User currentUser = (User) session.getAttribute("user");
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(ApiResponse.error("User not authenticated"));
        }
        
        try {
            ClassDto classDto = classService.updateClass(id, request, currentUser);
            return ResponseEntity.ok(ApiResponse.success(classDto, "Class updated successfully"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ApiResponse.error(e.getMessage()));
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(ApiResponse.error(e.getMessage()));
        }
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('TEACHER')")
    @Operation(summary = "Delete a class", description = "Teacher deletes their own class")
    @SecurityRequirement(name = "cookieAuth")
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Class deleted successfully"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Not authorized to delete this class"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Class not found")
    })
    public ResponseEntity<ApiResponse<Void>> deleteClass(
            @Parameter(description = "Class ID") @PathVariable String id,
            HttpSession session) {
        
        User currentUser = (User) session.getAttribute("user");
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(ApiResponse.error("User not authenticated"));
        }
        
        try {
            classService.deleteClass(id, currentUser);
            return ResponseEntity.ok(ApiResponse.success(null, "Class deleted successfully"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ApiResponse.error(e.getMessage()));
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(ApiResponse.error(e.getMessage()));
        }
    }
}
