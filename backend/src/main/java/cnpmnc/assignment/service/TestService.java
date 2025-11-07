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
}
