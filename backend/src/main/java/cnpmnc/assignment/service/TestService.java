package cnpmnc.assignment.service;

import cnpmnc.assignment.dto.AddStudentRequest;
import cnpmnc.assignment.dto.TestDTO;
import cnpmnc.assignment.dto.requestDTO.AddTestDTO;
import cnpmnc.assignment.model.Class;
import cnpmnc.assignment.model.Role;
import cnpmnc.assignment.model.Test;
import cnpmnc.assignment.model.User;
import cnpmnc.assignment.repository.ClassRepository;
import cnpmnc.assignment.repository.TestRepository;
import cnpmnc.assignment.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TestService {
    private final ClassRepository classRepository;
    private final UserRepository userRepository;
    private final TestRepository testRepository;


    @Transactional
    public TestDTO createTest(String classId, AddTestDTO request, User currentUser) {
        Class classEntity = classRepository.findById(classId)
                .orElseThrow(() -> new IllegalArgumentException("Class not found"));

        // Check authorization
        if (!classEntity.getTeacher().getId().equals(currentUser.getId())) {
            throw new SecurityException("You are not authorized to manage this class");
        }
        //createTest
        Test newTest=new Test();
        newTest.setTestName(request.getTestName());
        newTest.setDescription(request.getDescription());
        newTest.setOpenTime(request.getTime().getOpenTime());
        newTest.setCloseTime(request.getTime().getCloseTime());
        newTest.setDuration(request.getTime().getDuration());
        newTest.setClazz(classEntity);
        //save
        testRepository.save(newTest);
        return TestDTO.fromTest(newTest);
    }

    public List<TestDTO> getTestClass(String classId, User currentUser) {
        Class classEntity = classRepository.findById(classId)
                .orElseThrow(() -> new IllegalArgumentException("Class not found"));

        // Check authorization
        //Student or Teacher in class
        Set<User> students=classEntity.getStudents();
        if (!classEntity.getTeacher().getId().equals(currentUser.getId())
        && !students.contains(currentUser)) {
            throw new SecurityException("You are not authorized to access this class");
        }
        return classEntity.getTests().stream()
                .map(TestDTO::fromTest)
                .collect(Collectors.toList());
    }
    public TestDTO getTestDetail(String testId, User currentUser) {
        Test testEntity=testRepository.findById(testId).orElseThrow(() -> new IllegalArgumentException("Test not found"));
        Class classEntity = classRepository.findById(testEntity.getClazz().getId()).get();
        //authentication
        //Student or Teacher in class
        Set<User> students=classEntity.getStudents();
        if (!classEntity.getTeacher().getId().equals(currentUser.getId())
        && !students.contains(currentUser)) {
            throw new SecurityException("You are not authorized to access this test");
        }
        return TestDTO.fromTest(testEntity);
    }
}
