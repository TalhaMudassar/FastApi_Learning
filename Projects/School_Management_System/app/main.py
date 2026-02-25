from fastapi import FastAPI
from pydantic import BaseModel
from typing import Optional
from datetime import date

# Import Services
from app.parent import services as parent_sc
from app.student import services as student_sc
from app.teacher import services as teacher_sc
from app.grade import services as grade_sc
from app.classroom import services as classroom_sc
from app.course import services as course_sc
from app.attendance import services as attendance_sc
from app.classroom_student import services as cs_sc
from app.exam_type import services as exam_type_sc
from app.exam import services as exam_sc
from app.exam_result import services as exam_result_sc


app = FastAPI(title="School Management System")



# -------- Parent --------
class ParentCreate(BaseModel):
    email: str
    password: str
    fname: str
    lname: str
    dob: date
    mobile: str
    phone: str


# -------- Student --------
class StudentCreate(BaseModel):
    email: str
    password: str
    fname: str
    lname: str
    dob: date
    mobile: str
    phone: str
    parent_id: Optional[int]
    date_of_join: date


# -------- Teacher --------
class TeacherCreate(BaseModel):
    email: str
    password: str
    fname: str
    lname: str
    dob: date
    mobile: str
    phone: str


# -------- Grade --------
class GradeCreate(BaseModel):
    name: str
    desc: Optional[str]


# -------- Classroom --------
class ClassroomCreate(BaseModel):
    year: int
    grade_id: int
    section: str
    teacher_id: Optional[int]
    remarks: Optional[str]


# -------- Course --------
class CourseCreate(BaseModel):
    name: str
    description: Optional[str]
    grade_id: int


# -------- Attendance --------
class AttendanceCreate(BaseModel):
    date: date
    student_id: int
    status: bool
    remark: Optional[str]
    
# -------- Exams --------    
class ExamCreate(BaseModel):
    exam_type_id: int
    name: str
    start_date: date    
    
# -------- Exam Result --------  
class ExamResultCreate(BaseModel):
    exam_id: int
    student_id: int
    course_id: int
    marks: str
    
    
# -------- Exam Type -------- 
class ExamTypeCreate(BaseModel):
    name: str
    desc: str | None = None   
    

 
    
    
    
##PARENT
@app.post("/parents")
async def create_parent(parent: ParentCreate):
    return await parent_sc.create_parent(**parent.dict())


@app.get("/parents")
async def get_parents():
    return await parent_sc.get_parents()


@app.get("/parents/{parent_id}")
async def get_parent(parent_id: int):
    return await parent_sc.get_parent(parent_id)


@app.put("/parents/{parent_id}")
async def update_parent(parent_id: int, parent: ParentCreate):
    return await parent_sc.update_parent(parent_id, **parent.dict())


@app.delete("/parents/{parent_id}")
async def delete_parent(parent_id: int):
    return await parent_sc.delete_parent(parent_id)


##STUDENT:
@app.post("/students")
async def create_student(student: StudentCreate):
    return await student_sc.create_student(**student.dict())


@app.get("/students")
async def get_students():
    return await student_sc.get_students()


@app.get("/students/{student_id}")
async def get_student(student_id: int):
    return await student_sc.get_student(student_id)


@app.put("/students/{student_id}")
async def update_student(student_id: int, student: StudentCreate):
    return await student_sc.update_student(student_id, **student.dict())


@app.delete("/students/{student_id}")
async def delete_student(student_id: int):
    return await student_sc.delete_student(student_id)


##Teacher 
@app.post("/teachers")
async def create_teacher(teacher: TeacherCreate):
    return await teacher_sc.create_teacher(**teacher.dict())


@app.get("/teachers")
async def get_teachers():
    return await teacher_sc.get_teachers()


@app.get("/teachers/{teacher_id}")
async def get_teacher(teacher_id: int):
    return await teacher_sc.get_teacher(teacher_id)


@app.put("/teachers/{teacher_id}")
async def update_teacher(teacher_id: int, teacher: TeacherCreate):
    return await teacher_sc.update_teacher(teacher_id, **teacher.dict())


@app.delete("/teachers/{teacher_id}")
async def delete_teacher(teacher_id: int):
    return await teacher_sc.delete_teacher(teacher_id)





##Grade
@app.post("/grades")
async def create_grade(grade: GradeCreate):
    return await grade_sc.create_grade(**grade.dict())


@app.get("/grades")
async def get_grades():
    return await grade_sc.get_grades()


@app.get("/grades/{grade_id}")
async def get_grade(grade_id: int):
    return await grade_sc.get_grade(grade_id)


@app.put("/grades/{grade_id}")
async def update_grade(grade_id: int, grade: GradeCreate):
    return await grade_sc.update_grade(grade_id, **grade.dict())


@app.delete("/grades/{grade_id}")
async def delete_grade(grade_id: int):
    return await grade_sc.delete_grade(grade_id)


##Clss room:
@app.post("/classrooms")
async def create_classroom(classroom: ClassroomCreate):
    return await classroom_sc.create_classroom(**classroom.dict())


@app.get("/classrooms")
async def get_classrooms():
    return await classroom_sc.get_classrooms()


@app.get("/classrooms/{classroom_id}")
async def get_classroom(classroom_id: int):
    return await classroom_sc.get_classroom(classroom_id)


@app.put("/classrooms/{classroom_id}")
async def update_classroom(classroom_id: int, classroom: ClassroomCreate):
    return await classroom_sc.update_classroom(classroom_id, **classroom.dict())


@app.delete("/classrooms/{classroom_id}")
async def delete_classroom(classroom_id: int):
    return await classroom_sc.delete_classroom(classroom_id)


##Course End point
@app.post("/courses")
async def create_course(course: CourseCreate):
    return await course_sc.create_course(**course.dict())


@app.get("/courses")
async def get_courses():
    return await course_sc.get_courses()


@app.get("/courses/{course_id}")
async def get_course(course_id: int):
    return await course_sc.get_course(course_id)


@app.put("/courses/{course_id}")
async def update_course(course_id: int, course: CourseCreate):
    return await course_sc.update_course(course_id, **course.dict())


@app.delete("/courses/{course_id}")
async def delete_course(course_id: int):
    return await course_sc.delete_course(course_id)



##Attendance 
@app.post("/attendance")
async def create_attendance(attendance: AttendanceCreate):
    return await attendance_sc.create_attendance(**attendance.dict())


@app.get("/attendance")
async def get_attendance():
    return await attendance_sc.get_attendance()


@app.put("/attendance/{student_id}")
async def update_attendance(student_id: int, attendance: AttendanceCreate):
    return await attendance_sc.update_attendance(
        student_id,
        attendance.date,
        status=attendance.status,
        remark=attendance.remark
    )


@app.delete("/attendance/{student_id}")
async def delete_attendance(student_id: int, date: date):
    return await attendance_sc.delete_attendance(student_id, date)




##CLASS ROOM STUDENT:
@app.post("/classroom-students")
async def assign_student(classroom_id: int, student_id: int):
    return await cs_sc.create_classroom_student(classroom_id, student_id)


@app.get("/classroom-students")
async def get_classroom_students():
    return await cs_sc.get_classroom_students()


@app.delete("/classroom-students")
async def remove_student(classroom_id: int, student_id: int):
    return await cs_sc.delete_classroom_student(classroom_id, student_id)





##EXAM type 
@app.post("/exam-types")
async def create_exam_type(data: ExamTypeCreate):
    return await exam_type_sc.create_exam_type(**data.dict())


@app.get("/exam-types")
async def get_exam_types():
    return await exam_type_sc.get_exam_types()


@app.put("/exam-types/{exam_type_id}")
async def update_exam_type(exam_type_id: int, data: ExamTypeCreate):
    return await exam_type_sc.update_exam_type(exam_type_id, **data.dict())


@app.delete("/exam-types/{exam_type_id}")
async def delete_exam_type(exam_type_id: int):
    return await exam_type_sc.delete_exam_type(exam_type_id)


##Exam 

@app.post("/exams")
async def create_exam(data: ExamCreate):
    return await exam_sc.create_exam(**data.dict())


@app.get("/exams")
async def get_exams():
    return await exam_sc.get_exams()


@app.put("/exams/{exam_id}")
async def update_exam(exam_id: int, data: ExamCreate):
    return await exam_sc.update_exam(exam_id, **data.dict())


@app.delete("/exams/{exam_id}")
async def delete_exam(exam_id: int):
    return await exam_sc.delete_exam(exam_id)


##EXAM RESULT:
@app.post("/exam-results")
async def create_exam_result(data: ExamResultCreate):
    return await exam_result_sc.create_exam_result(
        data.exam_id,
        data.student_id,
        data.course_id,
        data.marks
    )


@app.get("/exam-results")
async def get_exam_results():
    return await exam_result_sc.get_exam_results()


@app.put("/exam-results")
async def update_exam_result(data: ExamResultCreate):
    return await exam_result_sc.update_exam_result(
        data.exam_id,
        data.student_id,
        data.course_id,
        data.marks
    )


@app.delete("/exam-results")
async def delete_exam_result(exam_id: int, student_id: int, course_id: int):
    return await exam_result_sc.delete_exam_result(
        exam_id,
        student_id,
        course_id
    )