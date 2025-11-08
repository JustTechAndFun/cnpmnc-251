package cnpmnc.assignment.controller;


import cnpmnc.assignment.dto.*;
import cnpmnc.assignment.dto.RequestDTO.AddQuestions;
import cnpmnc.assignment.dto.RequestDTO.AddTestRequestDTO;
import cnpmnc.assignment.model.Question;
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

@RestController
@RequestMapping("/api/")
@RequiredArgsConstructor
@Tag(name = "Question", description = "Question management endpoints")
public class QuestionController {
    private final TestService testService;

    //PUT /api/classes/:id/test/:id: edit general information of the test.
    //GET /api/classes/:id/test/:id/questions: get list of questions of that test.
    //PUT /api/classes/:id/test/:id/questions/:id: edit a question.
    //POST /api/classes/:id/test/:id/questions/:id: create a question.
    //DELETE /api/classes/:id/test/:id/questions/:id: delete a question.



    @PostMapping("classes/{classId}/tests/{id}")
    @PreAuthorize("hasAnyAuthority('TEACHER')")
    @Operation(summary = "Create Question and add to Test", description = "")
    @SecurityRequirement(name = "cookieAuth")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Test Detail retrieved successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Not authorized to access this class"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Test not found")
    })
    public ResponseEntity<ApiResponse<QuestionDTO>> addQuestionToTest(
            @Parameter(description = "Class ID") @PathVariable String classId,
            @Parameter(description = "Test ID") @PathVariable String id,
            @Valid @RequestBody AddQuestions request,
            HttpSession session) {

        User currentUser = (User) session.getAttribute("user");
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("User not authenticated"));
        }
        try {
            QuestionDTO dto = testService.addQuestionToTest(classId,id, request,currentUser);
            return ResponseEntity.ok(ApiResponse.success(dto, "Question added to test successfully"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

}
