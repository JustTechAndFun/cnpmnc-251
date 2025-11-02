package cnpmnc.assignment.service;

import cnpmnc.assignment.dto.*;
import cnpmnc.assignment.dto.requestDTO.AddTestDTO;
import cnpmnc.assignment.model.Class;
import cnpmnc.assignment.model.Role;
import cnpmnc.assignment.model.Test;
import cnpmnc.assignment.model.User;
import cnpmnc.assignment.repository.ClassRepository;
import cnpmnc.assignment.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ClassService {
    
    private final ClassRepository classRepository;
    private final UserRepository userRepository;
    
    @Transactional(readOnly = true)
    public ClassDto getClassInfo(String classId, User currentUser) {
        Class classEntity = classRepository.findById(classId)
            .orElseThrow(() -> new IllegalArgumentException("Class not found"));
        
        // Check authorization - teacher can only access their own classes
        if (!classEntity.getTeacher().getId().equals(currentUser.getId()) && 
            currentUser.getRole() != Role.ADMIN) {
            throw new SecurityException("You are not authorized to access this class");
        }
        
        return convertToClassDto(classEntity);
    }
    
    @Transactional(readOnly = true)
    public List<StudentDto> getClassStudents(String classId, User currentUser) {
        Class classEntity = classRepository.findById(classId)
            .orElseThrow(() -> new IllegalArgumentException("Class not found"));
        
        // Check authorization
        if (!classEntity.getTeacher().getId().equals(currentUser.getId()) && 
            currentUser.getRole() != Role.ADMIN) {
            throw new SecurityException("You are not authorized to access this class");
        }
        
        return classEntity.getStudents().stream()
            .map(this::convertToStudentDto)
            .collect(Collectors.toList());
    }
    
    @Transactional
    public StudentDto addStudentToClass(String classId, AddStudentRequest request, User currentUser) {
        // Validate request
        if (!request.isValid()) {
            throw new IllegalArgumentException("Either email or studentId must be provided");
        }
        
        Class classEntity = classRepository.findById(classId)
            .orElseThrow(() -> new IllegalArgumentException("Class not found"));
        
        // Check authorization
        if (!classEntity.getTeacher().getId().equals(currentUser.getId()) && 
            currentUser.getRole() != Role.ADMIN) {
            throw new SecurityException("You are not authorized to manage this class");
        }
        
        // Find student by email or studentId
        User student = null;
        if (request.getEmail() != null && !request.getEmail().isBlank()) {
            student = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("Student not found with email: " + request.getEmail()));
        } else if (request.getStudentId() != null && !request.getStudentId().isBlank()) {
            student = userRepository.findByStudentId(request.getStudentId())
                .orElseThrow(() -> new IllegalArgumentException("Student not found with studentId: " + request.getStudentId()));
        }
        
        // Verify the user is actually a student
        if (student.getRole() != Role.STUDENT) {
            throw new IllegalArgumentException("User is not a student");
        }
        
        // Check if student is already in the class
        if (classEntity.getStudents().contains(student)) {
            throw new IllegalArgumentException("Student is already in this class");
        }
        
        // Add student to class
        classEntity.getStudents().add(student);
        classRepository.save(classEntity);
        
        return convertToStudentDto(student);
    }
    
    @Transactional(readOnly = true)
    public List<ClassDto> getTeacherClasses(User teacher) {
        return classRepository.findByTeacher(teacher).stream()
            .map(this::convertToClassDto)
            .collect(Collectors.toList());
    }
    
    @Transactional
    public ClassDto createClass(CreateClassRequest request) {
        // Check if class code already exists
        if (classRepository.existsByClassCode(request.getClassCode())) {
            throw new IllegalArgumentException("Class code already exists");
        }
        
        // Find teacher
        User teacher = userRepository.findById(request.getTeacherId())
            .orElseThrow(() -> new IllegalArgumentException("Teacher not found"));
        
        // Verify the user is actually a teacher
        if (teacher.getRole() != Role.TEACHER) {
            throw new IllegalArgumentException("User is not a teacher");
        }
        
        // Create class
        Class classEntity = new Class();
        classEntity.setName(request.getName());
        classEntity.setDescription(request.getDescription());
        classEntity.setClassCode(request.getClassCode());
        classEntity.setTeacher(teacher);
        
        classEntity = classRepository.save(classEntity);
        
        return convertToClassDto(classEntity);
    }
    
    @Transactional(readOnly = true)
    public List<ClassDto> getAllClasses() {
        return classRepository.findAll().stream()
            .map(this::convertToClassDto)
            .collect(Collectors.toList());
    }
    
    @Transactional
    public void deleteClass(String classId) {
        if (!classRepository.existsById(classId)) {
            throw new IllegalArgumentException("Class not found");
        }
        classRepository.deleteById(classId);
    }





    private ClassDto convertToClassDto(Class classEntity) {
        return ClassDto.builder()
            .id(classEntity.getId())
            .name(classEntity.getName())
            .description(classEntity.getDescription())
            .classCode(classEntity.getClassCode())
            .teacher(ClassDto.TeacherDto.builder()
                .id(classEntity.getTeacher().getId())
                .email(classEntity.getTeacher().getEmail())
                .build())
            .studentCount(classEntity.getStudents().size())
            .createdAt(classEntity.getCreatedAt())
            .updatedAt(classEntity.getUpdatedAt())
            .build();
    }
    
    private StudentDto convertToStudentDto(User student) {
        return StudentDto.builder()
            .id(student.getId())
            .email(student.getEmail())
            .studentId(student.getStudentId())
            .activate(student.getActivate())
            .build();
    }
}
