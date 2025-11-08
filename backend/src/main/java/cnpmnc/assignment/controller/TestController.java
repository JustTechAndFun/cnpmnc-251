package cnpmnc.assignment.controller;


import cnpmnc.assignment.dto.ApiResponse;
import cnpmnc.assignment.dto.QuestionDTO;
import cnpmnc.assignment.dto.RequestDTO.AddTestRequestDTO;
import cnpmnc.assignment.dto.TestDTO;
import cnpmnc.assignment.model.User;
import cnpmnc.assignment.service.TestService;
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
@RequestMapping("/api/")
@RequiredArgsConstructor
@Tag(name = "Test", description = "Test management endpoints")
public class TestController {
    private final TestService testService;

    @PostMapping("classes/{id}/tests")
    @PreAuthorize("hasAnyAuthority('TEACHER')")
    @Operation(summary = "Add test to class", description = "Add a test to a class")
    @SecurityRequirement(name = "cookieAuth")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "201", description = "Test added successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Not authorized to manage this class"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Class or student not found")
    })
    public ResponseEntity<ApiResponse<TestDTO>> addTestToClass(
            @Parameter(description = "Class ID") @PathVariable String id,
            @Valid @RequestBody AddTestRequestDTO test,
            HttpSession session
    ) {
        User currentUser = (User) session.getAttribute("user");
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("User not authenticated"));
        }
        try{
            TestDTO dto=testService.createTest(id, test, currentUser);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success(dto, "Test created to class successfully"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }
    @GetMapping("classes/{id}/tests")
    @PreAuthorize("hasAnyAuthority('TEACHER', 'STUDENT')")
    @Operation(summary = "Get tests in a class", description = "Retrieve list of all students enrolled in a class. Teacher can only access their own classes.")
    @SecurityRequirement(name = "cookieAuth")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Student list retrieved successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Not authorized to access this class"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Class not found")
    })
    public ResponseEntity<ApiResponse<List<TestDTO>>> getTestClass(
            @Parameter(description = "Class ID") @PathVariable String id,
            HttpSession session) {

        User currentUser = (User) session.getAttribute("user");
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("User not authenticated"));
        }
        try {
            List<TestDTO> students = testService.getTestClass(id, currentUser);
            return ResponseEntity.ok(ApiResponse.success(students, "Test retrieved successfully"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }
    @GetMapping("classes/{classId}/tests/{id}")
    @PreAuthorize("hasAnyAuthority('TEACHER', 'STUDENT')")
    @Operation(summary = "Get test detail", description = "Retrieve test detail by ID")
    @SecurityRequirement(name = "cookieAuth")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Test Detail retrieved successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Not authorized to access this class"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Test not found")
    })
    public ResponseEntity<ApiResponse<TestDTO>> getTestDetails(
            @Parameter(description = "Class ID") @PathVariable String classId,
            @Parameter(description = "Test ID") @PathVariable String id,
            HttpSession session) {

        User currentUser = (User) session.getAttribute("user");
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("User not authenticated"));
        }
        try {
            TestDTO dto = testService.getTestDetail(id, currentUser);
            return ResponseEntity.ok(ApiResponse.success(dto, "Test Detail retrieved successfully"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @PutMapping("classes/{classId}/tests/{id}")
    @PreAuthorize("hasAnyAuthority('TEACHER')")
    @Operation(summary = "Update test information", description = "Update general information of a test")
    @SecurityRequirement(name = "cookieAuth")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Test updated successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Not authorized to manage this test"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Test or class not found")
    })
    public ResponseEntity<ApiResponse<TestDTO>> updateTest(
            @Parameter(description = "Class ID") @PathVariable String classId,
            @Parameter(description = "Test ID") @PathVariable String id,
            @Valid @RequestBody AddTestRequestDTO updateDTO,
            HttpSession session) {

        User currentUser = (User) session.getAttribute("user");
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("User not authenticated"));
        }
        try {
            TestDTO dto = testService.updateTest(classId, id, updateDTO, currentUser);
            return ResponseEntity.ok(ApiResponse.success(dto, "Test updated successfully"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @DeleteMapping("classes/{classId}/tests/{id}")
    @PreAuthorize("hasAnyAuthority('TEACHER')")
    @Operation(summary = "Delete test", description = "Delete a test from a class")
    @SecurityRequirement(name = "cookieAuth")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Test deleted successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Not authorized to manage this test"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Test or class not found")
    })
    public ResponseEntity<ApiResponse<Void>> deleteTest(
            @Parameter(description = "Class ID") @PathVariable String classId,
            @Parameter(description = "Test ID") @PathVariable String id,
            HttpSession session) {

        User currentUser = (User) session.getAttribute("user");
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("User not authenticated"));
        }
        try {
            testService.deleteTest(classId, id, currentUser);
            return ResponseEntity.ok(ApiResponse.success(null, "Test deleted successfully"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/classes/{classId}/test/{id}/questions")
    @PreAuthorize("hasAnyAuthority('TEACHER')")
    @Operation(summary = "Get question of test", description = "Retrieve list of all question of test")
    @SecurityRequirement(name = "cookieAuth")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Question list retrieved successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Not authorized to access this class"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Class not found")
    })
    public ResponseEntity<ApiResponse<List<QuestionDTO>>> getQuestionsOfTest(
            @Parameter(description = "Class ID") @PathVariable String classId,
            @Parameter(description = "Test ID") @PathVariable String id,
            HttpSession session) {

        User currentUser = (User) session.getAttribute("user");
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("User not authenticated"));
        }
        try {
            List<QuestionDTO> dto = testService.getQuestionOfTest(classId,id, currentUser);
            return ResponseEntity.ok(ApiResponse.success(dto, "Test retrieved successfully"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }







}