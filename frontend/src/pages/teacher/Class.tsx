import { useEffect, useState } from 'react';
import { Navigate, useParams, useNavigate } from 'react-router';
import { useAuth } from '../../contexts/AuthContext';
import { Role } from '../../types';
import {
    Card,
    Table,
    Button,
    Typography,
    Tag,
    Spin,
    message,
    Modal,
    Input,
    Form,
    Statistic,
    Row,
    Col,
    Select
} from 'antd';
import type { Breakpoint } from 'antd';
import {
    PlusOutlined,
    FileAddOutlined,
    UserOutlined,
    BookOutlined,
    TeamOutlined,
    FileTextOutlined
} from '@ant-design/icons';
import { teacherApi } from '../../apis';

const { Title, Text } = Typography;

interface Student {
    id: string;
    name: string;
    email: string;
    studentId: string;
    status: 'Active' | 'Inactive';
}

interface Test {
    id: string;
    title: string;
    createdAt: string;
    duration: number;
    status: 'Upcoming' | 'In Progress' | 'Completed';
}

interface ClassInfo {
    id: string;
    name: string;
    description: string;
    totalStudents: number;
    totalTests: number;
}

export const ClassPage = () => {
    const auth = useAuth();
    const navigate = useNavigate();
    const { classId } = useParams<{ classId: string }>();
    const [loading, setLoading] = useState(true);
    const [addStudentModalVisible, setAddStudentModalVisible] = useState(false);
    const [addStudentForm] = Form.useForm();

    // Only TEACHER role can access
    if (!auth || !auth.user || auth.user.role !== Role.TEACHER) {
        return <Navigate to="/unauthorized" replace />;
    }

    const [classInfo, setClassInfo] = useState<ClassInfo>({
        id: classId || '1',
        name: '',
        description: '',
        totalStudents: 0,
        totalTests: 0
    });

    const [classes, setClasses] = useState<ClassInfo[]>([]);
    const [students, setStudents] = useState<Student[]>([]);
    const [tests, setTests] = useState<Test[]>([]);

    useEffect(() => {
        // Always fetch classes list first
        fetchClassesList();

        // If no classId, try to get first class or use default
        if (!classId) {
            fetchFirstClass();
        } else {
            fetchClassData();
        }
    }, [classId]);

    const fetchClassesList = async () => {
        try {
            try {
                const classesResponse = await teacherApi.getMyClasses();

                if (!classesResponse.error && classesResponse.data && classesResponse.data.length > 0) {
                    // Map the ClassDto to ClassInfo
                    const mappedClasses: ClassInfo[] = classesResponse.data.map(cls => ({
                        id: cls.id,
                        name: cls.className,
                        description: `${cls.classCode} - Học kỳ ${cls.semester} năm ${cls.year}`,
                        totalStudents: cls.studentCount || 0,
                        totalTests: 0 // Will be fetched separately
                    }));
                    setClasses(mappedClasses);
                    return;
                }
            } catch (error) {
                console.error('Failed to fetch classes list', error);
            }

            // If no classes found, use default/mock data
            const mockClasses: ClassInfo[] = [
                {
                    id: '1',
                    name: 'Công nghệ phần mềm nâng cao',
                    description: 'Lớp học về các kỹ thuật phát triển phần mềm hiện đại',
                    totalStudents: 35,
                    totalTests: 5
                },
                {
                    id: '2',
                    name: 'Thiết kế giao diện người dùng',
                    description: 'Lớp học về UI/UX design và phát triển giao diện web hiện đại',
                    totalStudents: 28,
                    totalTests: 3
                },
                {
                    id: '3',
                    name: 'Cơ sở dữ liệu nâng cao',
                    description: 'Lớp học về quản lý và tối ưu hóa cơ sở dữ liệu, SQL và NoSQL',
                    totalStudents: 42,
                    totalTests: 6
                }
            ];
            setClasses(mockClasses);
        } catch (error) {
            console.error('Error fetching classes list', error);
            // Use default data
            const mockClasses: ClassInfo[] = [
                {
                    id: '1',
                    name: 'Công nghệ phần mềm nâng cao',
                    description: 'Lớp học về các kỹ thuật phát triển phần mềm hiện đại',
                    totalStudents: 35,
                    totalTests: 5
                },
                {
                    id: '2',
                    name: 'Thiết kế giao diện người dùng',
                    description: 'Lớp học về UI/UX design và phát triển giao diện web hiện đại',
                    totalStudents: 28,
                    totalTests: 3
                },
                {
                    id: '3',
                    name: 'Cơ sở dữ liệu nâng cao',
                    description: 'Lớp học về quản lý và tối ưu hóa cơ sở dữ liệu, SQL và NoSQL',
                    totalStudents: 42,
                    totalTests: 6
                }
            ];
            setClasses(mockClasses);
        }
    };

    const fetchFirstClass = async () => {
        setLoading(true);
        try {
            // Try to get list of classes and use the first one
            try {
                const classesResponse = await teacherApi.getMyClasses();

                if (!classesResponse.error && classesResponse.data && classesResponse.data.length > 0) {
                    const mappedClasses: ClassInfo[] = classesResponse.data.map(cls => ({
                        id: cls.id,
                        name: cls.className,
                        description: `${cls.classCode} - Học kỳ ${cls.semester} năm ${cls.year}`,
                        totalStudents: cls.studentCount || 0,
                        totalTests: 0
                    }));
                    setClasses(mappedClasses);
                    const firstClass = mappedClasses[0];
                    setClassInfo(firstClass);
                    // Fetch data for first class
                    await fetchClassDataForClass(firstClass.id);
                    return;
                }
            } catch (error) {
                console.error('Failed to fetch classes list', error);
            }

            // If no classes found, use default/mock data
            const mockClasses: ClassInfo[] = [
                {
                    id: '1',
                    name: 'Công nghệ phần mềm nâng cao',
                    description: 'Lớp học về các kỹ thuật phát triển phần mềm hiện đại',
                    totalStudents: 35,
                    totalTests: 5
                },
                {
                    id: '2',
                    name: 'Thiết kế giao diện người dùng',
                    description: 'Lớp học về UI/UX design và phát triển giao diện web hiện đại',
                    totalStudents: 28,
                    totalTests: 3
                },
                {
                    id: '3',
                    name: 'Cơ sở dữ liệu nâng cao',
                    description: 'Lớp học về quản lý và tối ưu hóa cơ sở dữ liệu, SQL và NoSQL',
                    totalStudents: 42,
                    totalTests: 6
                }
            ];
            setClasses(mockClasses);
            setClassInfo(mockClasses[0]);
            await fetchClassDataForClass('1');
        } catch (error) {
            console.error('Error fetching first class', error);
            // Use default data
            const mockClasses: ClassInfo[] = [
                {
                    id: '1',
                    name: 'Công nghệ phần mềm nâng cao',
                    description: 'Lớp học về các kỹ thuật phát triển phần mềm hiện đại',
                    totalStudents: 35,
                    totalTests: 5
                },
                {
                    id: '2',
                    name: 'Thiết kế giao diện người dùng',
                    description: 'Lớp học về UI/UX design và phát triển giao diện web hiện đại',
                    totalStudents: 28,
                    totalTests: 3
                },
                {
                    id: '3',
                    name: 'Cơ sở dữ liệu nâng cao',
                    description: 'Lớp học về quản lý và tối ưu hóa cơ sở dữ liệu, SQL và NoSQL',
                    totalStudents: 42,
                    totalTests: 6
                }
            ];
            setClasses(mockClasses);
            setClassInfo(mockClasses[0]);
            await fetchClassDataForClass('1');
        } finally {
            setLoading(false);
        }
    };

    const fetchClassDataForClass = async (targetClassId: string) => {
        try {
            // Fetch class information first
            try {
                const classInfoResponse = await teacherApi.getClassInfo(targetClassId);

                if (!classInfoResponse.error && classInfoResponse.data) {
                    const cls = classInfoResponse.data;
                    setClassInfo({
                        id: cls.id,
                        name: cls.className,
                        description: `${cls.classCode} - Học kỳ ${cls.semester} năm ${cls.year}`,
                        totalStudents: cls.studentCount || 0,
                        totalTests: 0
                    });
                }
            } catch (error) {
                console.error('Failed to fetch class info', error);
            }

            // Fetch students
            try {
                const studentsResponse = await teacherApi.getClassStudents(targetClassId);

                if (!studentsResponse.error && studentsResponse.data) {
                    // Map StudentDto to Student
                    const mappedStudents: Student[] = studentsResponse.data.map(s => ({
                        id: s.id,
                        name: s.name,
                        email: s.email,
                        studentId: s.studentId || s.id,
                        status: 'Active' as const
                    }));
                    setStudents(mappedStudents);
                    setClassInfo(prev => ({ ...prev, totalStudents: mappedStudents.length }));
                }
            } catch (error) {
                console.error('Failed to fetch students, using mock data', error);
                // Mock data fallback - different data for different classes
                let mockStudents: Student[] = [];

                if (targetClassId === '1') {
                    // Công nghệ phần mềm nâng cao
                    mockStudents = [
                        { id: '1', name: 'Nguyễn Văn A', email: 'nguyenvana@example.com', studentId: 'ST001', status: 'Active' },
                        { id: '2', name: 'Trần Thị B', email: 'tranthib@example.com', studentId: 'ST002', status: 'Active' },
                        { id: '3', name: 'Lê Văn C', email: 'levanc@example.com', studentId: 'ST003', status: 'Active' },
                        { id: '4', name: 'Phạm Thị D', email: 'phamthid@example.com', studentId: 'ST004', status: 'Inactive' },
                    ];
                } else if (targetClassId === '2') {
                    // Thiết kế giao diện người dùng
                    mockStudents = [
                        { id: '5', name: 'Hoàng Văn E', email: 'hoangvane@example.com', studentId: 'ST005', status: 'Active' },
                        { id: '6', name: 'Ngô Thị F', email: 'ngothif@example.com', studentId: 'ST006', status: 'Active' },
                        { id: '7', name: 'Đỗ Văn G', email: 'dovang@example.com', studentId: 'ST007', status: 'Active' },
                    ];
                } else if (targetClassId === '3') {
                    // Cơ sở dữ liệu nâng cao
                    mockStudents = [
                        { id: '8', name: 'Vũ Văn H', email: 'vuvanh@example.com', studentId: 'ST008', status: 'Active' },
                        { id: '9', name: 'Bùi Thị I', email: 'buithii@example.com', studentId: 'ST009', status: 'Active' },
                        { id: '10', name: 'Lý Văn J', email: 'lyvanj@example.com', studentId: 'ST010', status: 'Inactive' },
                        { id: '11', name: 'Đinh Thị K', email: 'dinhthik@example.com', studentId: 'ST011', status: 'Active' },
                    ];
                }

                setStudents(mockStudents);
                setClassInfo(prev => ({ ...prev, totalStudents: mockStudents.length }));
            }

            // Fetch tests
            try {
                const testsResponse = await teacherApi.getTestsInClass(targetClassId);

                if (!testsResponse.error && testsResponse.data) {
                    // Map TestDTO to Test
                    const mappedTests: Test[] = testsResponse.data.map(t => ({
                        id: t.id,
                        title: t.name,
                        createdAt: t.createdAt,
                        duration: t.duration,
                        status: 'Completed' as const // Default status, can be improved
                    }));
                    setTests(mappedTests);
                    setClassInfo(prev => ({ ...prev, totalTests: mappedTests.length }));
                }
            } catch (error) {
                console.error('Failed to fetch tests, using mock data', error);
                // Mock data fallback - different tests for different classes
                let mockTests: Test[] = [];

                if (targetClassId === '1') {
                    // Công nghệ phần mềm nâng cao
                    mockTests = [
                        { id: '1', title: 'Kiểm tra giữa kỳ', createdAt: '2025-01-15', duration: 90, status: 'Completed' },
                        { id: '2', title: 'Kiểm tra cuối kỳ', createdAt: '2025-02-20', duration: 120, status: 'Upcoming' },
                        { id: '3', title: 'Bài kiểm tra thực hành', createdAt: '2025-01-10', duration: 60, status: 'In Progress' },
                    ];
                } else if (targetClassId === '2') {
                    // Thiết kế giao diện người dùng
                    mockTests = [
                        { id: '4', title: 'Project Design Review', createdAt: '2025-01-20', duration: 45, status: 'Completed' },
                        { id: '5', title: 'UI Prototype Test', createdAt: '2025-02-10', duration: 60, status: 'Upcoming' },
                        { id: '6', title: 'Final Design Presentation', createdAt: '2025-02-25', duration: 90, status: 'Upcoming' },
                    ];
                } else if (targetClassId === '3') {
                    // Cơ sở dữ liệu nâng cao
                    mockTests = [
                        { id: '7', title: 'SQL Quiz 1', createdAt: '2025-01-12', duration: 45, status: 'Completed' },
                        { id: '8', title: 'NoSQL Assignment', createdAt: '2025-01-25', duration: 75, status: 'Completed' },
                        { id: '9', title: 'Database Optimization Test', createdAt: '2025-02-15', duration: 90, status: 'In Progress' },
                        { id: '10', title: 'Final Database Project', createdAt: '2025-03-01', duration: 120, status: 'Upcoming' },
                    ];
                }

                setTests(mockTests);
                setClassInfo(prev => ({ ...prev, totalTests: mockTests.length }));
            }
        } catch (error) {
            console.error('Error fetching class data', error);
        }
    };

    const fetchClassData = async () => {
        setLoading(true);
        try {
            // Ensure classes list is loaded
            if (classes.length === 0) {
                await fetchClassesList();
            }

            // Fetch class information
            try {
                const classResponse = await teacherApi.getClassInfo(classId!);

                if (!classResponse.error && classResponse.data) {
                    const cls = classResponse.data;
                    setClassInfo({
                        id: cls.id,
                        name: cls.className,
                        description: `${cls.classCode} - Học kỳ ${cls.semester} năm ${cls.year}`,
                        totalStudents: cls.studentCount || 0,
                        totalTests: 0
                    });
                }
            } catch (error) {
                console.error('Failed to fetch class info, using mock data', error);
                // Mock data fallback - find class from classes list or use default
                const foundClass = classes.find(c => c.id === classId);
                if (foundClass) {
                    setClassInfo(foundClass);
                } else {
                    setClassInfo({
                        id: classId || '1',
                        name: 'Công nghệ phần mềm nâng cao',
                        description: 'Lớp học về các kỹ thuật phát triển phần mềm hiện đại',
                        totalStudents: 35,
                        totalTests: 5
                    });
                }
            }

            // Fetch students
            try {
                const studentsResponse = await teacherApi.getClassStudents(classId!);

                if (!studentsResponse.error && studentsResponse.data) {
                    const mappedStudents: Student[] = studentsResponse.data.map(s => ({
                        id: s.id,
                        name: s.name,
                        email: s.email,
                        studentId: s.studentId || s.id,
                        status: 'Active' as const
                    }));
                    setStudents(mappedStudents);
                    // Update total students count
                    setClassInfo(prev => ({ ...prev, totalStudents: mappedStudents.length }));
                }
            } catch (error) {
                console.error('Failed to fetch students, using mock data', error);
                // Mock data fallback
                setStudents([
                    {
                        id: '1',
                        name: 'Nguyễn Văn A',
                        email: 'nguyenvana@example.com',
                        studentId: 'ST001',
                        status: 'Active'
                    },
                    {
                        id: '2',
                        name: 'Trần Thị B',
                        email: 'tranthib@example.com',
                        studentId: 'ST002',
                        status: 'Active'
                    },
                    {
                        id: '3',
                        name: 'Lê Văn C',
                        email: 'levanc@example.com',
                        studentId: 'ST003',
                        status: 'Active'
                    },
                    {
                        id: '4',
                        name: 'Phạm Thị D',
                        email: 'phamthid@example.com',
                        studentId: 'ST004',
                        status: 'Inactive'
                    },
                ]);
                setClassInfo(prev => ({ ...prev, totalStudents: 4 }));
            }

            // Fetch tests
            try {
                const testsResponse = await teacherApi.getTestsInClass(classId!);

                if (!testsResponse.error && testsResponse.data) {
                    const mappedTests: Test[] = testsResponse.data.map(t => ({
                        id: t.id,
                        title: t.name,
                        createdAt: t.createdAt,
                        duration: t.duration,
                        status: 'Completed' as const
                    }));
                    setTests(mappedTests);
                    // Update total tests count
                    setClassInfo(prev => ({ ...prev, totalTests: mappedTests.length }));
                }
            } catch (error) {
                console.error('Failed to fetch tests, using mock data', error);
                // Mock data fallback - different tests for different classes
                let mockTests: Test[] = [];

                if (classId === '1') {
                    // Công nghệ phần mềm nâng cao
                    mockTests = [
                        { id: '1', title: 'Kiểm tra giữa kỳ', createdAt: '2025-01-15', duration: 90, status: 'Completed' },
                        { id: '2', title: 'Kiểm tra cuối kỳ', createdAt: '2025-02-20', duration: 120, status: 'Upcoming' },
                        { id: '3', title: 'Bài kiểm tra thực hành', createdAt: '2025-01-10', duration: 60, status: 'In Progress' },
                    ];
                } else if (classId === '2') {
                    // Thiết kế giao diện người dùng
                    mockTests = [
                        { id: '4', title: 'Project Design Review', createdAt: '2025-01-20', duration: 45, status: 'Completed' },
                        { id: '5', title: 'UI Prototype Test', createdAt: '2025-02-10', duration: 60, status: 'Upcoming' },
                        { id: '6', title: 'Final Design Presentation', createdAt: '2025-02-25', duration: 90, status: 'Upcoming' },
                    ];
                } else if (classId === '3') {
                    // Cơ sở dữ liệu nâng cao
                    mockTests = [
                        { id: '7', title: 'SQL Quiz 1', createdAt: '2025-01-12', duration: 45, status: 'Completed' },
                        { id: '8', title: 'NoSQL Assignment', createdAt: '2025-01-25', duration: 75, status: 'Completed' },
                        { id: '9', title: 'Database Optimization Test', createdAt: '2025-02-15', duration: 90, status: 'In Progress' },
                        { id: '10', title: 'Final Database Project', createdAt: '2025-03-01', duration: 120, status: 'Upcoming' },
                    ];
                }

                setTests(mockTests);
                setClassInfo(prev => ({ ...prev, totalTests: mockTests.length }));
            }
        } catch (error) {
            console.error('Error fetching class data', error);
            message.error('Không thể tải dữ liệu lớp học');
        } finally {
            setLoading(false);
        }
    };

    const handleAddStudent = async (values: { email: string; studentId: string; name: string }) => {
        const targetClassId = classId || classInfo.id;
        try {
            await teacherApi.addStudentToClass(targetClassId, {
                email: values.email,
                studentId: values.studentId
            });

            message.success('Thêm sinh viên thành công');
            setAddStudentModalVisible(false);
            addStudentForm.resetFields();
            // Refresh student list
            if (classId) {
                await fetchClassData();
            } else {
                await fetchClassDataForClass(targetClassId);
            }
        } catch (error) {
            console.error('Failed to add student', error);
            // For demo purposes, add to local state
            const newStudent: Student = {
                id: Date.now().toString(),
                name: values.name,
                email: values.email,
                studentId: values.studentId,
                status: 'Active'
            };
            setStudents(prev => [...prev, newStudent]);
            setClassInfo(prev => ({ ...prev, totalStudents: prev.totalStudents + 1 }));
            message.success('Thêm sinh viên thành công (demo)');
            setAddStudentModalVisible(false);
            addStudentForm.resetFields();
        }
    };

    const handleCreateTest = () => {
        // Navigate to create test page with classId pre-selected
        const targetClassId = classId || classInfo.id;
        navigate('/teacher/tests/create', {
            state: { preselectedClassId: targetClassId }
        });
    };

    const handleTestClick = (testId: string) => {
        // Navigate to test detail page
        navigate(`/teacher/tests/${testId}`);
    };

    const handleClassChange = async (selectedClassId: string) => {
        const selectedClass = classes.find(c => c.id === selectedClassId);
        if (selectedClass) {
            setClassInfo(selectedClass);
            setLoading(true);
            await fetchClassDataForClass(selectedClassId);
            setLoading(false);
            // Update URL if needed
            if (!classId) {
                navigate(`/teacher/classes/${selectedClassId}`, { replace: true });
            }
        }
    };

    const studentColumns = [
        {
            title: 'Họ và tên',
            dataIndex: 'name',
            key: 'name',
            width: 200,
            fixed: 'left' as const,
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
            width: 250,
            responsive: ['md' as Breakpoint],
        },
        {
            title: 'MSSV',
            dataIndex: 'studentId',
            key: 'studentId',
            width: 120,
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            width: 120,
            render: (status: string) => (
                <Tag color={status === 'Active' ? 'green' : 'red'}>
                    {status}
                </Tag>
            ),
        },
    ];

    const testColumns = [
        {
            title: 'Tên bài kiểm tra',
            dataIndex: 'title',
            key: 'title',
            width: 250,
            fixed: 'left' as const,
        },
        {
            title: 'Ngày tạo',
            dataIndex: 'createdAt',
            key: 'createdAt',
            width: 150,
            responsive: ['md' as Breakpoint],
        },
        {
            title: 'Thời gian (phút)',
            dataIndex: 'duration',
            key: 'duration',
            width: 140,
            responsive: ['sm' as Breakpoint],
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            width: 120,
            render: (status: string) => {
                const colorMap: Record<string, string> = {
                    'Completed': 'blue',
                    'In Progress': 'orange',
                    'Upcoming': 'purple',
                };
                return (
                    <Tag color={colorMap[status] || 'default'}>
                        {status}
                    </Tag>
                );
            },
        },
    ];

    return (
        <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
            {loading ? (
                <div className="flex flex-col items-center justify-center py-32">
                    <Spin size="large" />
                    <Text className="mt-4 text-gray-600">Đang tải dữ liệu...</Text>
                </div>
            ) : (
                <>
                    {/* Class Information Header */}
                    <div className="mb-6 md:mb-8">
                        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4 mb-6">
                            <div className="flex-1 w-full">
                                <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4">
                                    <Title level={2} className="mb-0 bg-linear-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent text-xl sm:text-2xl">
                                        {classInfo.name}
                                    </Title>
                                    {classes.length > 0 && (
                                        <Select
                                            value={classInfo.id}
                                            onChange={handleClassChange}
                                            className="w-full sm:w-auto sm:min-w-[200px] lg:min-w-[300px]"
                                            placeholder="Chọn lớp học"
                                            showSearch
                                            optionFilterProp="children"
                                            filterOption={(input, option) => {
                                                const children = option?.children;
                                                const label = typeof children === 'string' ? children : String(children);
                                                return label.toLowerCase().includes(input.toLowerCase());
                                            }}
                                        >
                                            {classes.map(cls => (
                                                <Select.Option key={cls.id} value={cls.id}>
                                                    {cls.name}
                                                </Select.Option>
                                            ))}
                                        </Select>
                                    )}
                                </div>
                                <Text className="text-gray-600 text-sm sm:text-base block mb-4">
                                    {classInfo.description}
                                </Text>
                                <Row gutter={[16, 16]} className="mt-4">
                                    <Col xs={24} sm={12}>
                                        <Card>
                                            <Statistic
                                                title="Tổng số sinh viên"
                                                value={classInfo.totalStudents}
                                                prefix={<TeamOutlined />}
                                                valueStyle={{ color: '#3f8600' }}
                                            />
                                        </Card>
                                    </Col>
                                    <Col xs={24} sm={12}>
                                        <Card>
                                            <Statistic
                                                title="Tổng số bài kiểm tra"
                                                value={classInfo.totalTests}
                                                prefix={<FileTextOutlined />}
                                                valueStyle={{ color: '#1890ff' }}
                                            />
                                        </Card>
                                    </Col>
                                </Row>
                            </div>
                            <div className="w-full lg:w-auto lg:ml-4">
                                <Button
                                    type="primary"
                                    icon={<FileAddOutlined />}
                                    size="large"
                                    onClick={handleCreateTest}
                                    className="bg-linear-to-r from-purple-600 to-purple-800 border-none w-full lg:w-auto"
                                >
                                    <span className="hidden sm:inline">Tạo bài kiểm tra mới</span>
                                    <span className="sm:hidden">Tạo bài kiểm tra</span>
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Students Table */}
                    <Card
                        title={
                            <div className="flex items-center gap-2">
                                <UserOutlined />
                                <span className="text-base sm:text-lg">Danh sách sinh viên</span>
                            </div>
                        }
                        extra={
                            <Button
                                type="primary"
                                icon={<PlusOutlined />}
                                onClick={() => setAddStudentModalVisible(true)}
                                size="small"
                                className="w-full sm:w-auto"
                            >
                                <span className="hidden sm:inline">Thêm sinh viên</span>
                                <span className="sm:hidden">Thêm</span>
                            </Button>
                        }
                        className="mb-6 shadow-sm"
                        styles={{ body: { padding: '12px' } }}
                    >
                        <div className="overflow-x-auto -mx-2 sm:mx-0">
                            <Table
                                columns={studentColumns}
                                dataSource={students}
                                rowKey="id"
                                pagination={{ 
                                    pageSize: 10,
                                    showSizeChanger: false,
                                    responsive: true,
                                    simple: true,
                                }}
                                locale={{ emptyText: 'Chưa có sinh viên nào' }}
                                scroll={{ x: 600 }}
                                size="small"
                            />
                        </div>
                    </Card>

                    {/* Tests Table */}
                    <Card
                        title={
                            <div className="flex items-center gap-2">
                                <BookOutlined />
                                <span className="text-base sm:text-lg">Danh sách bài kiểm tra</span>
                            </div>
                        }
                        className="shadow-sm"
                        styles={{ body: { padding: '12px' } }}
                    >
                        <div className="overflow-x-auto -mx-2 sm:mx-0">
                            <Table
                                columns={testColumns}
                                dataSource={tests}
                                rowKey="id"
                                pagination={{ 
                                    pageSize: 10,
                                    showSizeChanger: false,
                                    responsive: true,
                                    simple: true,
                                }}
                                onRow={(record) => ({
                                    onClick: () => handleTestClick(record.id),
                                    style: { cursor: 'pointer' },
                                })}
                                locale={{ emptyText: 'Chưa có bài kiểm tra nào' }}
                                scroll={{ x: 600 }}
                                size="small"
                            />
                        </div>
                    </Card>
                </>
            )}

            {/* Add Student Modal */}
            <Modal
                title="Thêm sinh viên vào lớp"
                open={addStudentModalVisible}
                onCancel={() => {
                    setAddStudentModalVisible(false);
                    addStudentForm.resetFields();
                }}
                onOk={() => addStudentForm.submit()}
                okText="Thêm"
                cancelText="Hủy"
            >
                <Form
                    form={addStudentForm}
                    layout="vertical"
                    onFinish={handleAddStudent}
                >
                    <Form.Item
                        name="email"
                        label="Email"
                        rules={[
                            { type: 'email', message: 'Email không hợp lệ' }
                        ]}
                    >
                        <Input placeholder="Nhập email sinh viên" />
                    </Form.Item>
                    <Form.Item
                        name="studentId"
                        label="MSSV"
                    >
                        <Input placeholder="Nhập mã số sinh viên" />
                    </Form.Item>
                    <p className="text-gray-500 text-sm mt-2">
                        * Cần cung cấp ít nhất một trong hai: Email hoặc MSSV
                    </p>
                </Form>
            </Modal>
        </div>
    );
};

export default ClassPage;
