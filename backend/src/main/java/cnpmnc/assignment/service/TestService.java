package cnpmnc.assignment.service;

import cnpmnc.assignment.dto.QuestionDTO;
import cnpmnc.assignment.dto.QuestionDTOforStudent;
import cnpmnc.assignment.dto.RequestDTO.AddQuestions;
import cnpmnc.assignment.dto.RequestDTO.AddTestRequestDTO;
import cnpmnc.assignment.dto.StudentSubmissionDTO;
import cnpmnc.assignment.dto.TestDTO;
import cnpmnc.assignment.dto.TestResultsResponseDTO;
import cnpmnc.assignment.dto.TestResultsSummaryDTO;
import cnpmnc.assignment.model.Class;
import cnpmnc.assignment.model.Question;
import cnpmnc.assignment.model.Submission;
import cnpmnc.assignment.model.Test;
import cnpmnc.assignment.model.User;
import cnpmnc.assignment.repository.ClassRepository;
import cnpmnc.assignment.repository.QuestionRepository;
import cnpmnc.assignment.repository.SubmissionRepository;
import cnpmnc.assignment.repository.TestRepository;
import cnpmnc.assignment.util.constant.TestStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TestService {

    private final ClassRepository classRepository;
    private final TestRepository testRepository;
    private final QuestionRepository questionRepository;
    private final SubmissionRepository submissionRepository;
    private static final String ALPHANUM = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    private static final SecureRandom RAND = new SecureRandom();

    private static String generatePasscode(int len) {
        StringBuilder sb = new StringBuilder(len);
        for (int i = 0; i < len; i++) {
            sb.append(ALPHANUM.charAt(RAND.nextInt(ALPHANUM.length())));
        }
        return sb.toString();
    }
    public TestDTO createTest(String classId, AddTestRequestDTO addTestRequestDTO, User currentUser) {
        Class classEntity = classRepository.findById(classId)
                .orElseThrow(() -> new IllegalArgumentException("Class not found"));

        // Check authorization
        if (!classEntity.getTeacher().getId().equals(currentUser.getId())) {
            throw new SecurityException("You are not authorized to manage this class");
        }
        
        //createTest
        Test newTest = new Test();
        newTest.setTitle(addTestRequestDTO.getTitle());
        newTest.setDescription(addTestRequestDTO.getDescription());
        newTest.setOpenTime(addTestRequestDTO.getOpenTime());
        newTest.setCloseTime(addTestRequestDTO.getCloseTime());
        newTest.setDuration(addTestRequestDTO.getDuration());
        newTest.setStatus(TestStatus.DRAFT);
        
        // Use provided passcode or generate a new one
        String passcode;
        if (addTestRequestDTO.getPasscode() != null && !addTestRequestDTO.getPasscode().trim().isEmpty()) {
            // Check if provided passcode already exists
            if (testRepository.existsByPasscode(addTestRequestDTO.getPasscode())) {
                throw new IllegalArgumentException("Passcode already exists");
            }
            passcode = addTestRequestDTO.getPasscode().trim().toUpperCase();
        } else {
            // Generate unique passcode
            do {
                passcode = generatePasscode(6);
            } while (testRepository.existsByPasscode(passcode));
        }
        newTest.setPasscode(passcode);
        newTest.setClazz(classEntity);
        
        Test savedTest = testRepository.save(newTest);
        return TestDTO.fromTest(savedTest);
    }
    public List<TestDTO> getTestClass(String classId, User currentUser) {
        Class classEntity = classRepository.findById(classId)
                .orElseThrow(() -> new IllegalArgumentException("Class not found"));

        // Check authorization
        //Student or Teacher in class
        Set<User> students = classEntity.getStudents();
        if (!classEntity.getTeacher().getId().equals(currentUser.getId())
                && !students.contains(currentUser)) {
            throw new SecurityException("You are not authorized to access this class");
        }
        return classEntity.getTests().stream()
                .map(TestDTO::fromTest)
                .collect(Collectors.toList());
    }
    public TestDTO getTestDetail(String testId, User currentUser) {
        Test testEntity = testRepository.findById(testId).orElseThrow(() -> new IllegalArgumentException("Test not found"));
        Class classEntity = classRepository.findById(testEntity.getClazz().getId())
                .orElseThrow(() -> new IllegalArgumentException("Class not found for test"));        // Check authorization
        Set<User> students = classEntity.getStudents();
        if (!classEntity.getTeacher().getId().equals(currentUser.getId())
                && !students.contains(currentUser)) {
            throw new SecurityException("You are not authorized to access this test");
        }
        return TestDTO.fromTest(testEntity);
    }

    public TestDTO updateTest(String classId, String testId, AddTestRequestDTO updateDTO, User currentUser) {
        Test testEntity = testRepository.findById(testId)
                .orElseThrow(() -> new IllegalArgumentException("Test not found"));
        
        Class classEntity = classRepository.findById(classId)
                .orElseThrow(() -> new IllegalArgumentException("Class not found"));

        // Check authorization - only teacher can update
        if (!classEntity.getTeacher().getId().equals(currentUser.getId())) {
            throw new SecurityException("You are not authorized to update this test");
        }

        // Verify test belongs to this class
        if (!testEntity.getClazz().getId().equals(classId)) {
            throw new IllegalArgumentException("Test does not belong to this class");
        }

        // Update fields
        if (updateDTO.getTitle() != null) {
            testEntity.setTitle(updateDTO.getTitle());
        }
        if (updateDTO.getDescription() != null) {
            testEntity.setDescription(updateDTO.getDescription());
        }
        if (updateDTO.getOpenTime() != null) {
            testEntity.setOpenTime(updateDTO.getOpenTime());
        }
        if (updateDTO.getCloseTime() != null) {
            testEntity.setCloseTime(updateDTO.getCloseTime());
        }
        if (updateDTO.getDuration() != null) {
            testEntity.setDuration(updateDTO.getDuration());
        }
        if (updateDTO.getPasscode() != null && !updateDTO.getPasscode().trim().isEmpty()) {
            String newPasscode = updateDTO.getPasscode().trim().toUpperCase();
            // Check if passcode is different and not already taken
            if (!newPasscode.equals(testEntity.getPasscode()) && 
                testRepository.existsByPasscode(newPasscode)) {
                throw new IllegalArgumentException("Passcode already exists");
            }
            testEntity.setPasscode(newPasscode);
        }

        Test savedTest = testRepository.save(testEntity);
        return TestDTO.fromTest(savedTest);
    }

    public void deleteTest(String classId, String testId, User currentUser) {
        Test testEntity = testRepository.findById(testId)
                .orElseThrow(() -> new IllegalArgumentException("Test not found"));
        
        Class classEntity = classRepository.findById(classId)
                .orElseThrow(() -> new IllegalArgumentException("Class not found"));

        // Check authorization - only teacher can delete
        if (!classEntity.getTeacher().getId().equals(currentUser.getId())) {
            throw new SecurityException("You are not authorized to delete this test");
        }

        // Verify test belongs to this class
        if (!testEntity.getClazz().getId().equals(classId)) {
            throw new IllegalArgumentException("Test does not belong to this class");
        }

        testRepository.delete(testEntity);
    }

    public QuestionDTO addQuestionToTest(String classId, String testId, AddQuestions questionDTO, User currentUser) {
        Test testEntity = testRepository.findById(testId)
                .orElseThrow(() -> new IllegalArgumentException("Test not found"));
        
        Class classEntity = classRepository.findById(classId)
                .orElseThrow(() -> new IllegalArgumentException("Class not found"));

        // Check authorization - only teacher can add questions
        if (!classEntity.getTeacher().getId().equals(currentUser.getId())) {
            throw new SecurityException("You are not authorized to add questions to this test");
        }

        // Verify test belongs to this class
        if (!testEntity.getClazz().getId().equals(classId)) {
            throw new IllegalArgumentException("Test does not belong to this class");
        }

        Question newQuestion = new Question();
        newQuestion.setContent(questionDTO.getContent());
        newQuestion.setChoiceA(questionDTO.getChoiceA());
        newQuestion.setChoiceB(questionDTO.getChoiceB());
        newQuestion.setChoiceC(questionDTO.getChoiceC());
        newQuestion.setChoiceD(questionDTO.getChoiceD());
        newQuestion.setAnswer(questionDTO.getAnswer().name());
        newQuestion.setTest(testEntity);  // Set the Test entity instead of testId

        Question savedQuestion = questionRepository.save(newQuestion);
        return QuestionDTO.fromQuestion(savedQuestion);
    }

    public QuestionDTO updateQuestion(String classId, String testId, String questionId, AddQuestions updateDTO, User currentUser) {
        Question questionEntity = questionRepository.findById(questionId)
                .orElseThrow(() -> new IllegalArgumentException("Question not found"));
        
        Test testEntity = testRepository.findById(testId)
                .orElseThrow(() -> new IllegalArgumentException("Test not found"));
        
        Class classEntity = classRepository.findById(classId)
                .orElseThrow(() -> new IllegalArgumentException("Class not found"));

        // Check authorization - only teacher can update questions
        if (!classEntity.getTeacher().getId().equals(currentUser.getId())) {
            throw new SecurityException("You are not authorized to update this question");
        }

        // Verify question belongs to this test
        if (!questionEntity.getTestId().equals(testId)) {
            throw new IllegalArgumentException("Question does not belong to this test");
        }

        // Verify test belongs to this class
        if (!testEntity.getClazz().getId().equals(classId)) {
            throw new IllegalArgumentException("Test does not belong to this class");
        }

        // Update fields
        if (updateDTO.getContent() != null) {
            questionEntity.setContent(updateDTO.getContent());
        }
        if (updateDTO.getChoiceA() != null) {
            questionEntity.setChoiceA(updateDTO.getChoiceA());
        }
        if (updateDTO.getChoiceB() != null) {
            questionEntity.setChoiceB(updateDTO.getChoiceB());
        }
        if (updateDTO.getChoiceC() != null) {
            questionEntity.setChoiceC(updateDTO.getChoiceC());
        }
        if (updateDTO.getChoiceD() != null) {
            questionEntity.setChoiceD(updateDTO.getChoiceD());
        }
        if (updateDTO.getAnswer() != null) {
            questionEntity.setAnswer(updateDTO.getAnswer().name());
        }

        Question savedQuestion = questionRepository.save(questionEntity);
        return QuestionDTO.fromQuestion(savedQuestion);
    }

    public void deleteQuestion(String classId, String testId, String questionId, User currentUser) {
        Question questionEntity = questionRepository.findById(questionId)
                .orElseThrow(() -> new IllegalArgumentException("Question not found"));
        
        Test testEntity = testRepository.findById(testId)
                .orElseThrow(() -> new IllegalArgumentException("Test not found"));
        
        Class classEntity = classRepository.findById(classId)
                .orElseThrow(() -> new IllegalArgumentException("Class not found"));

        // Check authorization - only teacher can delete questions
        if (!classEntity.getTeacher().getId().equals(currentUser.getId())) {
            throw new SecurityException("You are not authorized to delete this question");
        }

        // Verify question belongs to this test
        if (!questionEntity.getTestId().equals(testId)) {
            throw new IllegalArgumentException("Question does not belong to this test");
        }

        // Verify test belongs to this class
        if (!testEntity.getClazz().getId().equals(classId)) {
            throw new IllegalArgumentException("Test does not belong to this class");
        }

        questionRepository.delete(questionEntity);
    }

    public List<QuestionDTO> getQuestionOfTest(String classId, String testId, User currentUser) {
        Test testEntity = testRepository.findById(testId)
                .orElseThrow(() -> new IllegalArgumentException("Test not found"));
        
        Class classEntity = classRepository.findById(classId)
                .orElseThrow(() -> new IllegalArgumentException("Class not found"));

        // Check authorization
        Set<User> students = classEntity.getStudents();
        if (!classEntity.getTeacher().getId().equals(currentUser.getId())
                && !students.contains(currentUser)) {
            throw new SecurityException("You are not authorized to access this test");
        }

        // Verify test belongs to this class
        if (!testEntity.getClazz().getId().equals(classId)) {
            throw new IllegalArgumentException("Test does not belong to this class");
        }

        return testEntity.getQuestions().stream()
                .map(QuestionDTO::fromQuestion)
                .collect(Collectors.toList());
    }

    public TestResultsResponseDTO getTestResults(String classId, String testId, User currentUser) {
        Test testEntity = testRepository.findById(testId)
                .orElseThrow(() -> new IllegalArgumentException("Test not found"));
        
        Class classEntity = classRepository.findById(classId)
                .orElseThrow(() -> new IllegalArgumentException("Class not found"));

        // Check authorization - only teacher can view results
        if (!classEntity.getTeacher().getId().equals(currentUser.getId())) {
            throw new SecurityException("You are not authorized to view results of this test");
        }

        // Verify test belongs to this class
        if (!testEntity.getClazz().getId().equals(classId)) {
            throw new IllegalArgumentException("Test does not belong to this class");
        }

        // Fetch all submissions for this test
        List<Submission> submissions = submissionRepository.findByTestId(testId);

        // Convert to DTOs
        List<StudentSubmissionDTO> submissionDTOs = submissions.stream()
                .map(StudentSubmissionDTO::fromSubmission)
                .collect(Collectors.toList());

        // Calculate summary statistics
        long totalSubmissions = submissions.size();
        double maxScore = testEntity.getQuestions().stream()
                .mapToDouble(q -> 10.0) // Assuming each question is 10 points
                .sum();
        
        double highestScore = submissions.stream()
                .mapToDouble(Submission::getScore)
                .max()
                .orElse(0.0);
        
        double lowestScore = submissions.stream()
                .mapToDouble(Submission::getScore)
                .min()
                .orElse(0.0);
        
        double averageScore = submissions.stream()
                .mapToDouble(Submission::getScore)
                .average()
                .orElse(0.0);

        // Calculate completion rate (students in class vs submissions)
        long totalStudents = classEntity.getStudents().size();
        double completionRate = totalStudents > 0 
                ? (double) totalSubmissions / totalStudents * 100.0 
                : 0.0;

        TestResultsSummaryDTO summary = new TestResultsSummaryDTO(
                totalSubmissions,
                highestScore,
                lowestScore,
                averageScore,
                maxScore,
                completionRate
        );

        return new TestResultsResponseDTO(
                testId,
                testEntity.getTitle(),
                submissionDTOs,
                summary
        );
    }
    public List<QuestionDTOforStudent> getQuestionsForStudent(Test testEntity) {
        // Get all questions for this test and convert to DTO without answers
        return testEntity.getQuestions().stream()
                .map(QuestionDTOforStudent::fromEntity)
                .collect(Collectors.toList());
    }
}
