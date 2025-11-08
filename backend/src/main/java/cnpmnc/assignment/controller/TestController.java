package cnpmnc.assignment.controller;


import cnpmnc.assignment.dto.*;
import cnpmnc.assignment.dto.RequestDTO.AddTestRequestDTO;
import cnpmnc.assignment.dto.TestDTO;
import cnpmnc.assignment.dto.TestResultsResponseDTO;
import cnpmnc.assignment.model.Class;
import cnpmnc.assignment.model.Question;
import cnpmnc.assignment.model.Test;
import cnpmnc.assignment.model.User;
import cnpmnc.assignment.repository.ClassRepository;
import cnpmnc.assignment.repository.TestRepository;
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
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/")
@RequiredArgsConstructor
@Tag(name = "Test", description = "Test management endpoints")
public class TestController {
    private final TestService testService;
    private final TestRepository testRepository;
    private final ClassRepository classRepository;


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
        try {
            TestDTO dto = testService.createTest(id, test, currentUser);
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

    @GetMapping("classes/{classId}/tests/{id}/results")
    @PreAuthorize("hasAnyAuthority('TEACHER')")
    @Operation(summary = "Get test results", description = "Get all submissions and statistics for a test")
    @SecurityRequirement(name = "cookieAuth")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Test results retrieved successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Not authorized to view test results"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Test or class not found")
    })
    public ResponseEntity<ApiResponse<TestResultsResponseDTO>> getTestResults(
            @Parameter(description = "Class ID") @PathVariable String classId,
            @Parameter(description = "Test ID") @PathVariable String id,
            HttpSession session) {

        User currentUser = (User) session.getAttribute("user");
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("User not authenticated"));
        }
        try {
            TestResultsResponseDTO results = testService.getTestResults(classId, id, currentUser);
            return ResponseEntity.ok(ApiResponse.success(results, "Test results retrieved successfully"));
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
            List<QuestionDTO> dto = testService.getQuestionOfTest(classId, id, currentUser);
            return ResponseEntity.ok(ApiResponse.success(dto, "Test retrieved successfully"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/exams/{id}/questions")
    @PreAuthorize("hasAnyAuthority('STUDENT')")
    @Operation(summary = "Get question of test For Student", description = "Retrieve list of all question of test")
    @SecurityRequirement(name = "cookieAuth")
    public ResponseEntity<ApiResponse<List<QuestionDTOforStudent>>> takeATest(
            @Parameter(description = "Test ID") @PathVariable String id,
            @Parameter(description = "passcode") @RequestParam String passcode,
            HttpSession session) {
        User currentUser = (User) session.getAttribute("user");
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("User not authenticated"));
        }

        Test testEntity = testRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Test not found"));
        if (!testEntity.getPasscode().equals(passcode)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("Invalid passcode"));
        }
        if (testEntity.getClazz().getStudents().stream().noneMatch(student -> student.getId().equals(currentUser.getId()))) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("You are not authorized to access this test"));
        }
        List<QuestionDTOforStudent> dto = testService.getQuestionsForStudent(testEntity);
        return ResponseEntity.ok(ApiResponse.success(dto, "Test retrieved successfully"));
    }

    @GetMapping("/exams/join/{passcode}")
    @PreAuthorize("hasAnyAuthority('STUDENT')")
    @Operation(summary = "Join exam by passcode", description = "Student joins exam using passcode and gets questions")
    @SecurityRequirement(name = "cookieAuth")
    public ResponseEntity<ApiResponse<ExamJoinResponseDTO>> joinExamByPasscode(
            @Parameter(description = "Passcode") @PathVariable String passcode,
            HttpSession session) {
        User currentUser = (User) session.getAttribute("user");
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("User not authenticated"));
        }

        // Find test by passcode
        Test testEntity = testRepository.findByPasscode(passcode.toUpperCase())
                .orElseThrow(() -> new IllegalArgumentException("Test not found with this passcode"));

        // Check if student is enrolled in the class
        if (testEntity.getClazz().getStudents().stream()
                .noneMatch(student -> student.getId().equals(currentUser.getId()))) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("You are not enrolled in the class for this test"));
        }

        // Get questions for student
        List<QuestionDTOforStudent> questions = testService.getQuestionsForStudent(testEntity);
        
        // Create response with testId and questions
        ExamJoinResponseDTO response = new ExamJoinResponseDTO(
                testEntity.getId(),
                testEntity.getTitle(),
                testEntity.getDuration(),
                questions
        );
        
        return ResponseEntity.ok(ApiResponse.success(response, "Test joined successfully"));
    }

    @GetMapping("student/tests")
    @PreAuthorize("hasAnyAuthority('STUDENT')")
    @Operation(summary = "Get tests of student", description = "Retrieve list of all test of student")
    @SecurityRequirement(name = "cookieAuth")
    public ResponseEntity<ApiResponse<List<TestDTO>>> getTestofStudent(
            HttpSession session) {

        User currentUser = (User) session.getAttribute("user");
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("User not authenticated"));
        }
        //Get All class of student
        List<Class> classes = classRepository.findByStudentsContaining(currentUser);
        List<TestDTO> tests = classes.stream()
                .flatMap(c -> c.getTests().stream())
                .map(TestDTO::fromTest)
                .toList();
        return ResponseEntity.ok(ApiResponse.success(tests, "Test retrieved successfully"));
    }


}



