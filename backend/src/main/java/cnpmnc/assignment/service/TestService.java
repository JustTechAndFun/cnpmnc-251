package cnpmnc.assignment.service;

import cnpmnc.assignment.dto.RequestDTO.AddTestRequestDTO;
import cnpmnc.assignment.dto.TestDTO;
import cnpmnc.assignment.model.Class;
import cnpmnc.assignment.model.Test;
import cnpmnc.assignment.model.User;
import cnpmnc.assignment.repository.ClassRepository;
import cnpmnc.assignment.repository.TestRepository;
import cnpmnc.assignment.util.constant.TestStatus;
import jakarta.validation.constraints.Min;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TestService {

    private final ClassRepository classRepository;
    private final TestRepository testRepository;
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
        String passcode;
        do {
            passcode = generatePasscode(6);
        } while (testRepository.existsByPasscode(passcode));
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
}
